// Admin Sync API Route
// POST /api/admin/sync — Trigger TMDB data sync (admin only)

import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import {syncMovies} from '@/lib/ingestion/movie-sync';
import {syncTvSeries} from '@/lib/ingestion/tv-sync';
import {syncPersons} from '@/lib/ingestion/person-sync';
import {TmdbClient} from '@/lib/tmdb/client';

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // No body is fine — default to syncing all
    }

    const entity = (body.entity as string) ?? 'all';
    const limit = (body.limit as number) ?? 0;

    const results: Record<string, unknown> = {};

    if (entity === 'all' || entity === 'movies') {
      const movieResult = await syncMovies({limit, fullSync: true});
      results.movies = {
        success: movieResult.success,
        processed: movieResult.moviesProcessed ?? 0,
        errors: movieResult.errors.length,
        duration: movieResult.duration,
      };
    }

    if (entity === 'all' || entity === 'tv') {
      const client = new TmdbClient({language: 'en-US'});
      const tvResult = await syncTvSeries(client, {limit, fullSync: true});
      results.tv = {
        success: tvResult.success,
        processed: tvResult.moviesProcessed ?? 0,
        errors: tvResult.errors.length,
        duration: tvResult.duration,
      };
    }

    if (entity === 'all' || entity === 'persons') {
      const personResult = await syncPersons({limit, fullSync: true});
      results.persons = {
        success: personResult.success,
        processed: personResult.moviesProcessed ?? 0,
        errors: personResult.errors.length,
        duration: personResult.duration,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      completedAt: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Sync failed', error);
    return NextResponse.json(
      {error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error'},
      {status: 500},
    );
  }
}
