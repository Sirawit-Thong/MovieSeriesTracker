// Admin Sync API Route
// POST /api/admin/sync — Trigger TMDB data sync (admin only)

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { syncMovies } from '@/lib/ingestion/movie-sync';
import { syncTvSeries } from '@/lib/ingestion/tv-sync';
import { syncPersons } from '@/lib/ingestion/person-sync';
import {
  acquireSyncLock,
  finishSyncLog,
  isSyncCancellationRequested,
} from '@/lib/ingestion/sync-lock';
import { TmdbClient } from '@/lib/tmdb/client';

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

    const lock = await acquireSyncLock(entity);
    if (!lock) {
      return NextResponse.json(
        {
          error: 'A sync is already running',
          message: 'Wait for the current sync to finish before starting another.',
        },
        { status: 409 },
      );
    }

    const syncLog = lock;

    const results: Record<string, unknown> = {};
    let totalProcessed = 0;
    let totalErrors = 0;
    let cancelled = false;
    const startTime = Date.now();

    const shouldStop = () => isSyncCancellationRequested(syncLog.id);

    try {
      if (entity === 'all' || entity === 'movies') {
        const movieResult = await syncMovies({ limit, fullSync: true, shouldStop });
        results.movies = {
          success: movieResult.success,
          processed: movieResult.moviesProcessed ?? 0,
          errors: movieResult.errors.length,
          duration: movieResult.duration,
        };
        totalProcessed += movieResult.moviesProcessed ?? 0;
        totalErrors += movieResult.errors.length;
        if (movieResult.cancelled) cancelled = true;
      }

      if (!cancelled && (entity === 'all' || entity === 'tv')) {
        const client = new TmdbClient({ language: 'en-US' });
        const tvResult = await syncTvSeries(client, { limit, fullSync: true, shouldStop });
        results.tv = {
          success: tvResult.success,
          processed: tvResult.moviesProcessed ?? 0,
          errors: tvResult.errors.length,
          duration: tvResult.duration,
        };
        totalProcessed += tvResult.moviesProcessed ?? 0;
        totalErrors += tvResult.errors.length;
        if (tvResult.cancelled) cancelled = true;
      }

      if (!cancelled && (entity === 'all' || entity === 'persons')) {
        const personResult = await syncPersons({ limit, fullSync: true, shouldStop });
        results.persons = {
          success: personResult.success,
          processed: personResult.moviesProcessed ?? 0,
          errors: personResult.errors.length,
          duration: personResult.duration,
        };
        totalProcessed += personResult.moviesProcessed ?? 0;
        totalErrors += personResult.errors.length;
        if (personResult.cancelled) cancelled = true;
      }

      const totalDuration = Date.now() - startTime;

      await finishSyncLog(
        syncLog.id,
        cancelled ? 'cancelled' : 'completed',
        totalProcessed,
        totalErrors,
        totalDuration,
        JSON.stringify(results),
      );

      return NextResponse.json({
        success: true,
        message: cancelled ? 'Sync cancelled' : 'Sync completed',
        cancelled,
        completedAt: new Date().toISOString(),
        results,
      });
    } catch (syncError) {
      const totalDuration = Date.now() - startTime;

      await finishSyncLog(
        syncLog.id,
        'failed',
        totalProcessed,
        totalErrors + 1,
        totalDuration,
        JSON.stringify({
          ...results,
          error: syncError instanceof Error ? syncError.message : 'Unknown error',
        }),
      );

      throw syncError;
    }
  } catch (error) {
    console.error('Sync failed', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
