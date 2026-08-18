// Library API Route
// GET /api/library — list user's annotated media + watchlist items with details

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import {prisma} from '@/lib/db';
import {getLocalizedField} from '@/lib/ingestion/translation-sync';
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
  const locale = searchParams.get('locale') ?? 'en';
  const countryRaw = searchParams.getAll('country');
  const countryCodes = countryRaw.length > 0 ? countryRaw : null;

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

  // Country filtering — fetch production country relationships and filter
  let allowedMovieIds: Set<number> | null = null;
  let allowedTvIds: Set<number> | null = null;
  if (countryCodes && countryCodes.length > 0) {
    const [movieCountries, tvCountries] = await Promise.all([
      allMovieIds.length > 0
        ? prisma.movieProductionCountry.findMany({
            where: {movieId: {in: allMovieIds}, iso31661: {in: countryCodes}},
            select: {movieId: true},
          })
        : [],
      allTvIds.length > 0
        ? prisma.tvSeriesProductionCountry.findMany({
            where: {tvSeriesId: {in: allTvIds}, iso31661: {in: countryCodes}},
            select: {tvSeriesId: true},
          })
        : [],
    ]);
    allowedMovieIds = new Set(movieCountries.map((mc) => mc.movieId));
    allowedTvIds = new Set(tvCountries.map((tc) => tc.tvSeriesId));
  }

  // Resolve localized titles for all movies/TV
  const [movieTranslations, tvTranslations] = await Promise.all([
    movies.length > 0
      ? prisma.translation.findMany({
          where: {entityType: 'movie', entityId: {in: movies.map((m) => m.id)}},
        })
      : [],
    tvSeries.length > 0
      ? prisma.translation.findMany({
          where: {entityType: 'tv', entityId: {in: tvSeries.map((t) => t.id)}},
        })
      : [],
  ]);

  // Group translations by entityId
  const movieTransByEntity = new Map<number, typeof movieTranslations>();
  for (const t of movieTranslations) {
    const existing = movieTransByEntity.get(t.entityId) || [];
    existing.push(t);
    movieTransByEntity.set(t.entityId, existing);
  }
  const tvTransByEntity = new Map<number, typeof tvTranslations>();
  for (const t of tvTranslations) {
    const existing = tvTransByEntity.get(t.entityId) || [];
    existing.push(t);
    tvTransByEntity.set(t.entityId, existing);
  }

  // Merge annotation + media data
  const annotatedResults = annotations.map((a) => {
    let localizedTitle = '';
    if (a.entityType === 'MOVIE') {
      const movie = movieMap.get(a.entityId);
      if (movie) {
        const trans = movieTransByEntity.get(movie.id) || [];
        localizedTitle = getLocalizedField(trans, locale, 'name', movie.title) ?? movie.title;
      }
    } else if (a.entityType === 'TV') {
      const tv = tvMap.get(a.entityId);
      if (tv) {
        const trans = tvTransByEntity.get(tv.id) || [];
        localizedTitle = getLocalizedField(trans, locale, 'name', tv.name) ?? tv.name;
      }
    }
    return {
      ...a,
      source: 'annotation' as const,
      localizedTitle,
      movie: a.entityType === 'MOVIE' ? movieMap.get(a.entityId) ?? null : null,
      tvSeries: a.entityType === 'TV' ? tvMap.get(a.entityId) ?? null : null,
    };
  });

  // Merge watchlist items + media data (with WANT_TO_WATCH status)
  const watchlistResults = unannotatedWatchlistItems.map((wi) => {
    let localizedTitle = '';
    if (wi.entityType === 'MOVIE') {
      const movie = movieMap.get(wi.entityId);
      if (movie) {
        const trans = movieTransByEntity.get(movie.id) || [];
        localizedTitle = getLocalizedField(trans, locale, 'name', movie.title) ?? movie.title;
      }
    } else if (wi.entityType === 'TV') {
      const tv = tvMap.get(wi.entityId);
      if (tv) {
        const trans = tvTransByEntity.get(tv.id) || [];
        localizedTitle = getLocalizedField(trans, locale, 'name', tv.name) ?? tv.name;
      }
    }
    return {
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
      localizedTitle,
      watchlistName: wi.watchlist.name,
      movie: wi.entityType === 'MOVIE' ? movieMap.get(wi.entityId) ?? null : null,
      tvSeries: wi.entityType === 'TV' ? tvMap.get(wi.entityId) ?? null : null,
    };
  });

  const allResults = [...annotatedResults, ...watchlistResults];

  // Filter by country
  let filtered = allResults;
  if (allowedMovieIds && allowedTvIds) {
    filtered = allResults.filter((a) => {
      if (a.entityType === 'MOVIE' && a.movie) {
        return allowedMovieIds!.has(a.movie.id);
      }
      if (a.entityType === 'TV' && a.tvSeries) {
        return allowedTvIds!.has(a.tvSeries.id);
      }
      return false;
    });
  }

  // Filter by search term
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
