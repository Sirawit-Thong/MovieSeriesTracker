// On-Demand Sync API Route
// POST /api/sync — Re-fetch a single entity from TMDB with ALL sub-resources.

import {NextResponse} from 'next/server';
import {fetchAndUpsertMovie} from '@/lib/ingestion/movie-sync';
import {fetchAndUpsertTvSeries} from '@/lib/ingestion/tv-sync';
import {fetchAndUpsertPerson} from '@/lib/ingestion/person-sync';
import {syncPersonCredits} from '@/lib/ingestion/credit-sync';
import {TmdbClient} from '@/lib/tmdb/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {type, tmdbId} = body as {type?: string; tmdbId?: number};

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

    const start = Date.now();
    let dbId: number | null = null;

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
      // syncPersonCredits fully re-fetches: movie cast/crew, TV cast/crew, combined credits
      if (dbId) {
        const client = new TmdbClient({language: 'en-US'});
        await syncPersonCredits(tmdbId, client);
      }
    }

    if (!dbId) {
      return NextResponse.json(
        {error: `Failed to sync ${type} with TMDB ID ${tmdbId}`},
        {status: 500},
      );
    }

    return NextResponse.json({
      success: true,
      type,
      tmdbId,
      dbId,
      duration: Date.now() - start,
    });
  } catch (error) {
    console.error('[api/sync] Error:', error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : 'Internal server error'},
      {status: 500},
    );
  }
}
