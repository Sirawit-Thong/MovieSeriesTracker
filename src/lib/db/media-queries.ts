// Media Query Service Layer
// Provides query functions for trending, popular, and top-rated media from the local database.

import {prisma} from '../db';

/**
 * Common select fields for media card display.
 * Keeps queries lean by only fetching what the UI needs.
 */
const MEDIA_SELECT = {
  id: true,
  title: true,
  posterPath: true,
  backdropPath: true,
  voteAverage: true,
  overview: true,
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
      name: true,
      posterPath: true,
      backdropPath: true,
      voteAverage: true,
      overview: true,
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
      name: true,
      posterPath: true,
      backdropPath: true,
      voteAverage: true,
      overview: true,
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
      name: true,
      posterPath: true,
      backdropPath: true,
      voteAverage: true,
      overview: true,
    },
    orderBy: {voteAverage: 'desc'},
    take: limit,
  });
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
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  overview: string | null;
};

/**
 * Normalize a database record into a MediaItem.
 * Movies use `title`, TV series use `name`.
 */
export function toMediaItem(
  record: Record<string, unknown>,
  type: 'movie' | 'tv'
): MediaItem {
  return {
    id: record.id as number,
    title: (record.title ?? record.name) as string,
    posterPath: record.posterPath as string | null,
    backdropPath: record.backdropPath as string | null,
    voteAverage: record.voteAverage as number | null,
    overview: record.overview as string | null,
  };
}
