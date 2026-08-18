import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import {parsePageParam} from '@/lib/admin-params';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const rawType = searchParams.get('type') ?? 'movies';
    const typeMap: Record<string, string> = {movie: 'movies', tv: 'tv', person: 'persons'};
    const type = typeMap[rawType] ?? rawType;
    const search = searchParams.get('q');
    const page = parsePageParam(searchParams.get('page'));
    if (page === null) {
      return NextResponse.json({error: 'Invalid page parameter'}, {status: 400});
    }
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    if (!['movies', 'tv', 'persons'].includes(type)) {
      return NextResponse.json({error: 'Invalid type'}, {status: 400});
    }

    const where: Record<string, unknown> = {};
    if (search) {
      if (type === 'movies') {
        where.OR = [
          {title: {contains: search, mode: 'insensitive'}},
          {originalTitle: {contains: search, mode: 'insensitive'}},
        ];
      } else if (type === 'tv') {
        where.OR = [
          {name: {contains: search, mode: 'insensitive'}},
          {originalName: {contains: search, mode: 'insensitive'}},
        ];
      } else {
        where.OR = [
          {name: {contains: search, mode: 'insensitive'}},
        ];
      }
    }

    let items: unknown[];
    let total: number;

    if (type === 'movies') {
      const [movies, count] = await Promise.all([
        prisma.movie.findMany({
          where,
          select: {
            id: true, tmdbId: true, title: true, originalTitle: true,
            releaseDate: true, voteAverage: true, posterPath: true,
            lastFetchedAt: true,
          },
          orderBy: {tmdbId: 'desc'},
          skip, take: pageSize,
        }),
        prisma.movie.count({where}),
      ]);
      items = movies;
      total = count;
    } else if (type === 'tv') {
      const [series, count] = await Promise.all([
        prisma.tvSeries.findMany({
          where,
          select: {
            id: true, tmdbId: true, name: true, originalName: true,
            firstAirDate: true, voteAverage: true, posterPath: true,
            lastFetchedAt: true,
          },
          orderBy: {tmdbId: 'desc'},
          skip, take: pageSize,
        }),
        prisma.tvSeries.count({where}),
      ]);
      items = series;
      total = count;
    } else {
      const [persons, count] = await Promise.all([
        prisma.person.findMany({
          where,
          select: {
            id: true, tmdbId: true, name: true, profilePath: true,
            knownForDepartment: true, lastFetchedAt: true,
          },
          orderBy: {tmdbId: 'desc'},
          skip, take: pageSize,
        }),
        prisma.person.count({where}),
      ]);
      items = persons;
      total = count;
    }

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('[admin:media]', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const type = searchParams.get('type');
    const rawId = searchParams.get('id');
    if (!['movies', 'tv', 'persons'].includes(type ?? '')) {
      return NextResponse.json({error: 'Invalid type'}, {status: 400});
    }
    if (!rawId || !Number.isInteger(Number(rawId))) {
      return NextResponse.json({error: 'id is required and must be an integer'}, {status: 400});
    }
    const id = Number(rawId);

    if (type === 'movies') {
      const existing = await prisma.movie.findUnique({where: {id}, select: {id: true}});
      if (!existing) {
        return NextResponse.json({error: 'Media not found'}, {status: 404});
      }
      await prisma.movie.delete({where: {id}});
    } else if (type === 'tv') {
      const existing = await prisma.tvSeries.findUnique({where: {id}, select: {id: true}});
      if (!existing) {
        return NextResponse.json({error: 'Media not found'}, {status: 404});
      }
      await prisma.tvSeries.delete({where: {id}});
    } else {
      const existing = await prisma.person.findUnique({where: {id}, select: {id: true}});
      if (!existing) {
        return NextResponse.json({error: 'Media not found'}, {status: 404});
      }
      await prisma.person.delete({where: {id}});
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('[admin:media:delete]', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
