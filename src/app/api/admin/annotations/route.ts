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
    const status = searchParams.get('status');
    const entityType = searchParams.get('entityType');
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const VALID_STATUSES = ['WATCHED', 'WATCHING', 'WANT_TO_WATCH', 'DROPPED'];
    const VALID_ENTITY_TYPES = ['MOVIE', 'TV', 'PERSON'];

    const where: Record<string, unknown> = {};
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({error: 'Invalid status filter'}, {status: 400});
      }
      where.watchStatus = status;
    }
    if (entityType) {
      if (!VALID_ENTITY_TYPES.includes(entityType)) {
        return NextResponse.json({error: 'Invalid entityType filter'}, {status: 400});
      }
      where.entityType = entityType;
    }

    const [annotations, total] = await Promise.all([
      prisma.userAnnotation.findMany({
        where,
        select: {
          id: true,
          entityType: true,
          entityId: true,
          watchStatus: true,
          personalRating: true,
          currentEpisode: true,
          totalEpisodes: true,
          notes: true,
          watchDate: true,
          createdAt: true,
          user: {select: {id: true, name: true, email: true}},
        },
        orderBy: {createdAt: 'desc'},
        skip,
        take: pageSize,
      }),
      prisma.userAnnotation.count({where}),
    ]);

    return NextResponse.json({
      annotations,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('[admin:annotations]', error);
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

    const existing = await prisma.userAnnotation.findUnique({where: {id}, select: {id: true}});
    if (!existing) {
      return NextResponse.json({error: 'Annotation not found'}, {status: 404});
    }

    await prisma.userAnnotation.delete({where: {id}});

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('[admin:annotations:delete]', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
