// Admin Sync API Route
// POST /api/admin/sync — Trigger manual TMDB sync (placeholder, admin only)

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';

function isAdmin(role: unknown): boolean {
  return role === 'ADMIN';
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin((session.user as Record<string, unknown>).role)) {
      return NextResponse.json({error: 'Forbidden'}, {status: 403});
    }

    // Placeholder — in a real implementation this would queue a background job
    return NextResponse.json({
      success: true,
      message: 'Sync job queued successfully',
      queuedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[admin:sync]', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}
