// Admin Stats API Route
// GET /api/admin/stats — Return system statistics (admin only)

import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const [userCount, movieCount, tvSeriesCount, personCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.movie.count(),
        prisma.tvSeries.count(),
        prisma.person.count(),
      ]);

    return NextResponse.json({
      users: userCount,
      movies: movieCount,
      tvSeries: tvSeriesCount,
      persons: personCount,
    });
  } catch (error) {
    console.error('[admin:stats]', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}
