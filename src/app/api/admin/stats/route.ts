// Admin Stats API Route
// GET /api/admin/stats — Return system statistics (admin only)

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import prisma from '@/lib/db';

function isAdmin(role: unknown): boolean {
  return role === 'ADMIN';
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin((session.user as Record<string, unknown>).role)) {
      return NextResponse.json({error: 'Forbidden'}, {status: 403});
    }

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
