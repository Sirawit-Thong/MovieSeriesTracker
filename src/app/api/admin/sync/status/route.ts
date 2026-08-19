// Admin Sync Status API Route
// GET /api/admin/sync/status — Check whether a TMDB sync is currently running (admin only)

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { markStaleSyncsStopped } from '@/lib/ingestion/sync-lock';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    // Lazy cleanup: finalize any orphaned running syncs (process died) first,
    // so a stale row can't keep the UI locked to a sync that is no longer alive.
    await markStaleSyncsStopped();

    const running = await prisma.syncLog.findFirst({
      where: { status: 'running' },
      select: { id: true, entity: true, startedAt: true },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json({
      running: running !== null,
      syncLogId: running?.id ?? null,
      entity: running?.entity ?? null,
      startedAt: running?.startedAt ?? null,
    });
  } catch (error) {
    console.error('[admin:sync:status]', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
