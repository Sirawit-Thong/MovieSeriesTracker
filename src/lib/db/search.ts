// Search Query Service Layer
// Provides full-text search functions across movies, TV series, and persons.

import {prisma} from '../db';

/** Default number of results per entity type. */
const DEFAULT_LIMIT = 10;

/** Select fields for movie search results. */
const MOVIE_SELECT = {
  id: true,
  tmdbId: true,
  title: true,
  originalTitle: true,
  posterPath: true,
  voteAverage: true,
  releaseDate: true,
  overview: true,
} as const;

/** Select fields for TV series search results. */
const TV_SERIES_SELECT = {
  id: true,
  tmdbId: true,
  name: true,
  originalName: true,
  posterPath: true,
  voteAverage: true,
  firstAirDate: true,
  overview: true,
} as const;

/** Select fields for person search results. */
const PERSON_SELECT = {
  id: true,
  tmdbId: true,
  name: true,
  profilePath: true,
  popularity: true,
  knownForDepartment: true,
} as const;

// ============================================================
// Individual Search Functions
// ============================================================

/**
 * Search movies by title or originalTitle (case-insensitive).
 * @param query - Search string to match against title fields
 * @param limit - Maximum number of results (default: 10)
 */
export async function searchMovies(query: string, limit = DEFAULT_LIMIT) {
  return prisma.movie.findMany({
    where: {
      OR: [
        {title: {contains: query, mode: 'insensitive'}},
        {originalTitle: {contains: query, mode: 'insensitive'}},
      ],
    },
    select: MOVIE_SELECT,
    orderBy: {popularity: 'desc'},
    take: limit,
  });
}

/**
 * Search TV series by name or originalName (case-insensitive).
 * @param query - Search string to match against name fields
 * @param limit - Maximum number of results (default: 10)
 */
export async function searchTvSeries(query: string, limit = DEFAULT_LIMIT) {
  return prisma.tvSeries.findMany({
    where: {
      OR: [
        {name: {contains: query, mode: 'insensitive'}},
        {originalName: {contains: query, mode: 'insensitive'}},
      ],
    },
    select: TV_SERIES_SELECT,
    orderBy: {popularity: 'desc'},
    take: limit,
  });
}

/**
 * Search persons by name (case-insensitive).
 * @param query - Search string to match against name
 * @param limit - Maximum number of results (default: 10)
 */
export async function searchPersons(query: string, limit = DEFAULT_LIMIT) {
  return prisma.person.findMany({
    where: {
      name: {contains: query, mode: 'insensitive'},
    },
    select: PERSON_SELECT,
    orderBy: {popularity: 'desc'},
    take: limit,
  });
}

// ============================================================
// Combined Search
// ============================================================

/** Search result types returned by searchAll. */
export type SearchResult = {
  movies: Awaited<ReturnType<typeof searchMovies>>;
  tvSeries: Awaited<ReturnType<typeof searchTvSeries>>;
  persons: Awaited<ReturnType<typeof searchPersons>>;
};

/**
 * Combined search across all entity types.
 * Runs movie, TV series, and person searches in parallel.
 * @param query - Search string to match across all entities
 */
export async function searchAll(query: string): Promise<SearchResult> {
  const [movies, tvSeries, persons] = await Promise.all([
    searchMovies(query),
    searchTvSeries(query),
    searchPersons(query),
  ]);

  return {movies, tvSeries, persons};
}
