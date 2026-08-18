import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const [watchlists, total] = await Promise.all([
      prisma.watchlist.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          user: {select: {id: true, name: true, email: true}},
          _count: {select: {items: true}},
        },
        orderBy: {createdAt: 'desc'},
        skip,
        take: pageSize,
      }),
      prisma.watchlist.count(),
    ]);

    return NextResponse.json({
      watchlists: watchlists.map(({_count, ...w}) => ({...w, itemCount: _count.items})),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('[admin:watchlists]', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
