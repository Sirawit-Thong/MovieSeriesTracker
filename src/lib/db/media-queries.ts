// Media Query Service Layer
// Provides query functions for trending, popular, and top-rated media from the local database.

import {prisma} from '../db';

/**
 * Common select fields for media card display.
 * Keeps queries lean by only fetching what the UI needs.
 */
const MEDIA_SELECT = {
  id: true,
  tmdbId: true,
  title: true,
  posterPath: true,
  backdropPath: true,
  voteAverage: true,
  overview: true,
  releaseDate: true,
} as const;

// ============================================================
// Movie Queries
// ============================================================

/**
 * Get trending movies sorted by popularity descending.
 * @param limit - Maximum number of results (default: 20)
 */
export async function getTrendingMovies(limit = 20) {
  return prisma.movie.findMany({
    select: MEDIA_SELECT,
    orderBy: {popularity: 'desc'},
    take: limit,
  });
}

/**
 * Get popular movies sorted by popularity descending.
 * Alias for trending — both represent the same ranking in our schema.
 * @param limit - Maximum number of results (default: 20)
 */
export async function getPopularMovies(limit = 20) {
  return prisma.movie.findMany({
    select: MEDIA_SELECT,
    orderBy: {popularity: 'desc'},
    take: limit,
  });
}

/**
 * Get top-rated movies sorted by vote average descending.
 * @param limit - Maximum number of results (default: 20)
 */
export async function getTopRatedMovies(limit = 20) {
  return prisma.movie.findMany({
    select: MEDIA_SELECT,
    orderBy: {voteAverage: 'desc'},
    take: limit,
  });
}

// ============================================================
// TV Series Queries
// ============================================================

/**
 * Get trending TV series sorted by popularity descending.
 * @param limit - Maximum number of results (default: 20)
 */
export async function getTrendingTvSeries(limit = 20) {
  return prisma.tvSeries.findMany({
    select: {
      id: true,
      tmdbId: true,
      name: true,
      posterPath: true,
      backdropPath: true,
      voteAverage: true,
      overview: true,
      firstAirDate: true,
    },
    orderBy: {popularity: 'desc'},
    take: limit,
  });
}

/**
 * Get popular TV series sorted by popularity descending.
 * @param limit - Maximum number of results (default: 20)
 */
export async function getPopularTvSeries(limit = 20) {
  return prisma.tvSeries.findMany({
    select: {
      id: true,
      tmdbId: true,
      name: true,
      posterPath: true,
      backdropPath: true,
      voteAverage: true,
      overview: true,
      firstAirDate: true,
    },
    orderBy: {popularity: 'desc'},
    take: limit,
  });
}

/**
 * Get top-rated TV series sorted by vote average descending.
 * @param limit - Maximum number of results (default: 20)
 */
export async function getTopRatedTvSeries(limit = 20) {
  return prisma.tvSeries.findMany({
    select: {
      id: true,
      tmdbId: true,
      name: true,
      posterPath: true,
      backdropPath: true,
      voteAverage: true,
      overview: true,
      firstAirDate: true,
    },
    orderBy: {voteAverage: 'desc'},
    take: limit,
  });
}

// ============================================================
// People Queries
// ============================================================

/**
 * Get popular people sorted by popularity descending.
 */
export async function getPopularPeople(limit = 20) {
  return prisma.person.findMany({
    select: {
      id: true,
      name: true,
      profilePath: true,
      popularity: true,
      knownForDepartment: true,
    },
    orderBy: {popularity: 'desc'},
    take: limit,
  });
}

// ============================================================
// Listing Queries (paginated)
// ============================================================

/**
 * Get movies for the listing page with pagination.
 */
export async function getMoviesList(
  limit = 20,
  offset = 0,
  genreId?: number,
  countryCodes?: string[],
) {
  const conditions: Record<string, unknown>[] = [];
  if (genreId) conditions.push({genres: {some: {genreId}}});
  if (countryCodes?.length) {
    conditions.push({productionCountries: {some: {iso31661: {in: countryCodes}}}});
  }
  const where = conditions.length > 0 ? {AND: conditions} : {};
  const [items, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      select: {...MEDIA_SELECT, releaseDate: true},
      orderBy: {popularity: 'desc'},
      take: limit,
      skip: offset,
    }),
    prisma.movie.count({where}),
  ]);
  return {items, total};
}

/**
 * Get TV series for the listing page with pagination.
 */
export async function getTvSeriesList(
  limit = 20,
  offset = 0,
  genreId?: number,
  countryCodes?: string[],
) {
  const conditions: Record<string, unknown>[] = [];
  if (genreId) conditions.push({genres: {some: {genreId}}});
  if (countryCodes?.length) {
    conditions.push({productionCountries: {some: {iso31661: {in: countryCodes}}}});
  }
  const where = conditions.length > 0 ? {AND: conditions} : {};
  const [items, total] = await Promise.all([
    prisma.tvSeries.findMany({
      where,
      select: {
        id: true, tmdbId: true, name: true, posterPath: true, backdropPath: true,
        voteAverage: true, overview: true, firstAirDate: true,
      },
      orderBy: {popularity: 'desc'},
      take: limit,
      skip: offset,
    }),
    prisma.tvSeries.count({where}),
  ]);
  return {items, total};
}

/**
 * Get people for the listing page with pagination.
 */
export async function getPeopleList(limit = 20, offset = 0) {
  const [items, total] = await Promise.all([
    prisma.person.findMany({
      select: {
        id: true, tmdbId: true, name: true, profilePath: true, popularity: true,
        knownForDepartment: true,
      },
      orderBy: {popularity: 'desc'},
      take: limit,
      skip: offset,
    }),
    prisma.person.count(),
  ]);
  return {items, total};
}

// ============================================================
// Unified Types
// ============================================================

/**
 * Normalized media item used by card components.
 * Both Movie and TvSeries map to this shape after processing.
 */
export type MediaItem = {
  id: number;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  overview: string | null;
  releaseDate?: string | Date | null;
};

/**
 * Normalize a database record into a MediaItem.
 * Movies use `title` + `releaseDate`, TV series use `name` + `firstAirDate`.
 */
export function toMediaItem(
  record: Record<string, unknown>,
  _type: 'movie' | 'tv'
): MediaItem {
  return {
    id: record.id as number,
    tmdbId: record.tmdbId as number,
    title: (record.title ?? record.name) as string,
    posterPath: record.posterPath as string | null,
    backdropPath: record.backdropPath as string | null,
    voteAverage: record.voteAverage as number | null,
    overview: record.overview as string | null,
    releaseDate: (record.releaseDate ?? record.firstAirDate) as string | Date | null,
  };
}

/**
 * Get all genres for filter pills.
 */
export async function getAllGenres() {
  return prisma.genre.findMany({
    orderBy: {name: 'asc'},
    select: {id: true, name: true},
  });
}

/**
 * Get all production countries that have at least one movie or TV series.
 * Ordered alphabetically by name.
 */
export async function getAllCountries() {
  return prisma.productionCountry.findMany({
    where: {
      OR: [
        {movies: {some: {}}},
        {tvSeries: {some: {}}},
      ],
    },
    orderBy: {name: 'asc'},
    select: {iso31661: true, name: true},
  });
}
