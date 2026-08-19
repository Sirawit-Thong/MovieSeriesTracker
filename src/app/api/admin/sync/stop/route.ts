// Admin Sync Stop API Route
// POST /api/admin/sync/stop — Request cancellation of a running TMDB sync (admin only)

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { requestSyncCancellation } from '@/lib/ingestion/sync-lock';
import prisma from '@/lib/db';

export async function POST() {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const running = await prisma.syncLog.findFirst({
      where: { status: 'running' },
      select: { id: true },
      orderBy: { startedAt: 'desc' },
    });

    if (!running) {
      return NextResponse.json({ error: 'No sync is currently running' }, { status: 409 });
    }

    const cancelled = await requestSyncCancellation(running.id);
    if (!cancelled) {
      return NextResponse.json(
        { error: 'Sync finished before the stop request could be applied' },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stop requested — the sync will halt at the next batch boundary.',
      syncLogId: running.id,
    });
  } catch (error) {
    console.error('Sync stop failed', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
