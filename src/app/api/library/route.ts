// Library API Route
// GET /api/library — list user's annotated media with details

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import {prisma} from '@/lib/db';
import type {WatchStatus} from '../../../../generated/prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const entityType = searchParams.get('entityType') as 'MOVIE' | 'TV' | null;
  const status = searchParams.get('status') as WatchStatus | null;
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') ?? 'updatedAt';

  const annotations = await prisma.userAnnotation.findMany({
    where: {
      userId: session.user.id,
      ...(entityType ? {entityType} : {}),
      ...(status ? {watchStatus: status} : {}),
    },
    orderBy: sortBy === 'rating'
      ? {personalRating: 'desc'}
      : sortBy === 'title'
        ? {entityId: 'asc'}
        : {updatedAt: 'desc'},
  });

  // Batch fetch movie/TV data
  const movieIds = annotations
    .filter((a) => a.entityType === 'MOVIE')
    .map((a) => a.entityId);
  const tvIds = annotations
    .filter((a) => a.entityType === 'TV')
    .map((a) => a.entityId);

  const [movies, tvSeries] = await Promise.all([
    movieIds.length > 0
      ? prisma.movie.findMany({
          where: {id: {in: movieIds}},
          select: {
            id: true, title: true, posterPath: true, backdropPath: true,
            voteAverage: true, overview: true, releaseDate: true, runtime: true,
          },
        })
      : [],
    tvIds.length > 0
      ? prisma.tvSeries.findMany({
          where: {id: {in: tvIds}},
          select: {
            id: true, name: true, posterPath: true, backdropPath: true,
            voteAverage: true, overview: true, firstAirDate: true,
            numberOfSeasons: true, numberOfEpisodes: true,
          },
        })
      : [],
  ]);

  const movieMap = new Map(movies.map((m) => [m.id, m]));
  const tvMap = new Map(tvSeries.map((tv) => [tv.id, tv]));

  // Merge annotation + media data
  const result = annotations.map((a) => ({
    ...a,
    movie: a.entityType === 'MOVIE' ? movieMap.get(a.entityId) ?? null : null,
    tvSeries: a.entityType === 'TV' ? tvMap.get(a.entityId) ?? null : null,
  }));

  // Filter by search term
  let filtered = result;
  if (search) {
    const q = search.toLowerCase();
    filtered = result.filter((a) => {
      if (a.entityType === 'MOVIE' && a.movie) {
        return a.movie.title.toLowerCase().includes(q);
      }
      if (a.entityType === 'TV' && a.tvSeries) {
        return a.tvSeries.name.toLowerCase().includes(q);
      }
      return false;
    });
  }

  return NextResponse.json(filtered);
}
