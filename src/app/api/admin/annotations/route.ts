import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const status = searchParams.get('status');
    const entityType = searchParams.get('entityType');
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (status) where.watchStatus = status;
    if (entityType) where.entityType = entityType;

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
