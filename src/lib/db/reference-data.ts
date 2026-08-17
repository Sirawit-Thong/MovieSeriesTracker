// Reference Data Service Layer
// Provides query functions for genres and watch providers stored in the database.

import { prisma } from '../db';
import type { Genre, WatchProvider } from '../../../generated/prisma/client';

/**
 * Get all genres from the database.
 */
export async function getAllGenres(): Promise<Genre[]> {
  return prisma.genre.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Get a single genre by its TMDB id.
 * Returns null if no genre matches.
 */
export async function getGenreById(id: number): Promise<Genre | null> {
  return prisma.genre.findUnique({
    where: { id },
  });
}

/**
 * Get all watch providers from the database.
 */
export async function getAllWatchProviders(): Promise<WatchProvider[]> {
  return prisma.watchProvider.findMany({
    orderBy: { displayPriority: 'asc' },
  });
}

/**
 * Get a single watch provider by its TMDB provider id.
 * Returns null if no provider matches.
 */
export async function getWatchProviderById(
  id: number
): Promise<WatchProvider | null> {
  return prisma.watchProvider.findUnique({
    where: { providerId: id },
  });
}

/**
 * Search genres by name using a case-insensitive substring match.
 * Returns matching genres sorted alphabetically.
 */
export async function searchGenres(query: string): Promise<Genre[]> {
  return prisma.genre.findMany({
    where: {
      name: {
        contains: query,
      },
    },
    orderBy: { name: 'asc' },
  });
}
