import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import {parsePageParam} from '@/lib/admin-params';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const page = parsePageParam(searchParams.get('page'));
    if (page === null) {
      return NextResponse.json({error: 'Invalid page parameter'}, {status: 400});
    }
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      prisma.syncLog.findMany({
        orderBy: {startedAt: 'desc'},
        skip,
        take: pageSize,
      }),
      prisma.syncLog.count(),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('[admin:sync-logs]', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
