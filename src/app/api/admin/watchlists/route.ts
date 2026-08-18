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

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const rawId = searchParams.get('id');
    if (!rawId || !Number.isInteger(Number(rawId))) {
      return NextResponse.json({error: 'id is required and must be an integer'}, {status: 400});
    }
    const id = Number(rawId);

    const existing = await prisma.watchlist.findUnique({where: {id}, select: {id: true}});
    if (!existing) {
      return NextResponse.json({error: 'Watchlist not found'}, {status: 404});
    }

    await prisma.watchlist.delete({where: {id}});

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('[admin:watchlists:delete]', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
