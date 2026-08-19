// Admin Stats API Route
// GET /api/admin/stats — Return system statistics (admin only)

import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import prisma from '@/lib/db';

let statsCache: {data: unknown; at: number} | null = null;
const STATS_TTL_MS = 60 * 1000;

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const now = Date.now();
    if (!statsCache || now - statsCache.at > STATS_TTL_MS) {
      const [users, movies, tvSeries, persons] = await Promise.all([
        prisma.user.count(),
        prisma.movie.count(),
        prisma.tvSeries.count(),
        prisma.person.count(),
      ]);
      statsCache = {data: {users, movies, tvSeries, persons}, at: now};
    }

    return NextResponse.json(statsCache.data);
  } catch (error) {
    console.error('[admin:stats]', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}
