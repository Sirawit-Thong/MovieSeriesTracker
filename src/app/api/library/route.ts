// Library API Route
// GET /api/library — list user's annotated media + watchlist items with details

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

  // Fetch annotations
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

  // Fetch watchlist items (treated as WANT_TO_WATCH if not already annotated)
  const watchlistItems = await prisma.watchlistItem.findMany({
    where: {
      watchlist: {userId: session.user.id},
      ...(entityType ? {entityType: entityType === 'MOVIE' ? 'MOVIE' : 'TV'} : {}),
    },
    include: {watchlist: {select: {name: true}}},
  });

  // Build set of already-annotated entity keys to avoid duplicates
  const annotatedKeys = new Set(
    annotations.map((a) => `${a.entityType}:${a.entityId}`)
  );

  // Filter out watchlist items that are already annotated
  const unannotatedWatchlistItems = watchlistItems.filter(
    (wi) => !annotatedKeys.has(`${wi.entityType}:${wi.entityId}`)
  );

  // Batch fetch movie/TV data for annotations
  const annMovieIds = annotations
    .filter((a) => a.entityType === 'MOVIE')
    .map((a) => a.entityId);
  const annTvIds = annotations
    .filter((a) => a.entityType === 'TV')
    .map((a) => a.entityId);

  // Batch fetch movie/TV data for unannotated watchlist items
  const wlMovieIds = unannotatedWatchlistItems
    .filter((a) => a.entityType === 'MOVIE')
    .map((a) => a.entityId);
  const wlTvIds = unannotatedWatchlistItems
    .filter((a) => a.entityType === 'TV')
    .map((a) => a.entityId);

  const allMovieIds = [...new Set([...annMovieIds, ...wlMovieIds])];
  const allTvIds = [...new Set([...annTvIds, ...wlTvIds])];

  const [movies, tvSeries] = await Promise.all([
    allMovieIds.length > 0
      ? prisma.movie.findMany({
          where: {id: {in: allMovieIds}},
          select: {
            id: true, title: true, posterPath: true, backdropPath: true,
            voteAverage: true, overview: true, releaseDate: true, runtime: true,
            tmdbId: true,
          },
        })
      : [],
    allTvIds.length > 0
      ? prisma.tvSeries.findMany({
          where: {id: {in: allTvIds}},
          select: {
            id: true, name: true, posterPath: true, backdropPath: true,
            voteAverage: true, overview: true, firstAirDate: true,
            numberOfSeasons: true, numberOfEpisodes: true,
            tmdbId: true,
          },
        })
      : [],
  ]);

  const movieMap = new Map(movies.map((m) => [m.id, m]));
  const tvMap = new Map(tvSeries.map((tv) => [tv.id, tv]));

  // Merge annotation + media data
  const annotatedResults = annotations.map((a) => ({
    ...a,
    source: 'annotation' as const,
    movie: a.entityType === 'MOVIE' ? movieMap.get(a.entityId) ?? null : null,
    tvSeries: a.entityType === 'TV' ? tvMap.get(a.entityId) ?? null : null,
  }));

  // Merge watchlist items + media data (with WANT_TO_WATCH status)
  const watchlistResults = unannotatedWatchlistItems.map((wi) => ({
    id: -wi.id, // Negative ID to distinguish from annotations
    userId: session.user!.id,
    entityType: wi.entityType,
    entityId: wi.entityId,
    watchStatus: 'WANT_TO_WATCH' as const,
    personalRating: null,
    currentEpisode: null,
    totalEpisodes: null,
    notes: null,
    watchDate: null,
    createdAt: wi.createdAt,
    updatedAt: wi.createdAt,
    source: 'watchlist' as const,
    watchlistName: wi.watchlist.name,
    movie: wi.entityType === 'MOVIE' ? movieMap.get(wi.entityId) ?? null : null,
    tvSeries: wi.entityType === 'TV' ? tvMap.get(wi.entityId) ?? null : null,
  }));

  const allResults = [...annotatedResults, ...watchlistResults];

  // Filter by search term
  let filtered = allResults;
  if (search) {
    const q = search.toLowerCase();
    filtered = allResults.filter((a) => {
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
