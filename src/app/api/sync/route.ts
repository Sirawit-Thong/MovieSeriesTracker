// On-Demand Sync API Route
// POST /api/sync — Re-fetch a single entity from TMDB with ALL sub-resources.

import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import {fetchAndUpsertMovie} from '@/lib/ingestion/movie-sync';
import {fetchAndUpsertTvSeries} from '@/lib/ingestion/tv-sync';
import {fetchAndUpsertPerson} from '@/lib/ingestion/person-sync';
import {syncPersonCredits, syncCombinedCredits} from '@/lib/ingestion/credit-sync';
import {acquireSyncLock, finishSyncLog} from '@/lib/ingestion/sync-lock';
import {TmdbClient} from '@/lib/tmdb/client';

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const body = await request.json();
    const {type, tmdbId, locale} = body as {type?: string; tmdbId?: number; locale?: string};

    if (!type || !tmdbId) {
      return NextResponse.json(
        {error: 'Missing required fields: type and tmdbId'},
        {status: 400},
      );
    }

    if (!['movie', 'tv', 'person'].includes(type)) {
      return NextResponse.json(
        {error: 'Invalid type. Must be movie, tv, or person'},
        {status: 400},
      );
    }

    const lock = await acquireSyncLock(type);
    if (!lock) {
      return NextResponse.json(
        {error: 'A sync is already running'},
        {status: 409}
      );
    }

    const start = Date.now();
    let dbId: number | null = null;

    try {
      if (type === 'movie') {
        // fetchAndUpsertMovie already syncs: details, genres, companies, countries,
        // languages, collection, alt titles, content ratings, images, videos,
        // external IDs, release dates, recommendations, watch providers, translations,
        // and credits (cast/crew) via syncMovieSubResources
        dbId = await fetchAndUpsertMovie(tmdbId);
      } else if (type === 'tv') {
        // fetchAndUpsertTvSeries already syncs: details, genres, networks, companies,
        // countries, languages, seasons/episodes, creators, next/last episode,
        // alt titles, content ratings, images, videos, external IDs, recommendations,
        // watch providers, translations, and credits (cast/crew) via syncTvSubResources
        dbId = await fetchAndUpsertTvSeries(tmdbId);
      } else if (type === 'person') {
        // fetchAndUpsertPerson syncs: details, external IDs, images, translations
        dbId = await fetchAndUpsertPerson(tmdbId);
        // syncPersonCredits fully re-fetches: movie cast/crew, TV cast/crew
        // syncCombinedCredits fetches combined credits (used by Filmography component)
        if (dbId) {
          const tmdbLanguage = locale === 'th' ? 'th-TH' : 'en-US';
          const client = new TmdbClient({language: tmdbLanguage});
          const [personDetails] = await Promise.all([
            client.getPersonDetails(tmdbId, 'combined_credits'),
            syncPersonCredits(tmdbId, client),
          ]);
          if (personDetails.combined_credits) {
            await syncCombinedCredits(dbId, personDetails.combined_credits);
          }
        }
      }
    } catch (error) {
      const duration = Date.now() - start;
      await finishSyncLog(lock.id, 'failed', 0, 1, duration, JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }));
      throw error;
    }

    if (!dbId) {
      const duration = Date.now() - start;
      await finishSyncLog(lock.id, 'failed', 0, 1, duration, JSON.stringify({
        error: `Failed to sync ${type} with TMDB ID ${tmdbId}`,
      }));
      return NextResponse.json(
        {error: `Failed to sync ${type} with TMDB ID ${tmdbId}`},
        {status: 500},
      );
    }

    const duration = Date.now() - start;
    await finishSyncLog(lock.id, 'completed', 1, 0, duration, JSON.stringify({type, tmdbId}));

    return NextResponse.json({
      success: true,
      type,
      tmdbId,
      dbId,
      duration,
    });
  } catch (error) {
    console.error('[api/sync] Error:', error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : 'Internal server error'},
      {status: 500},
    );
  }
}
