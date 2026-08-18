// On-Demand Fetch Service
// Fetches a single movie/TV/person from TMDB on cache miss,
// stores it in PostgreSQL, and returns the internal DB ID.
//
// Flow:
//   1. Look up by TMDB ID in DB
//   2. If found and fresh (lastFetchedAt < 7 days) → return immediately
//   2b. If found but stale → return stale + trigger background re-fetch
//   3. If not found → fetch from TMDB, upsert, return

import prisma from '../db';
import { fetchAndUpsertMovie } from './movie-sync';
import { fetchAndUpsertTvSeries } from './tv-sync';
import { fetchAndUpsertPerson } from './person-sync';

const LOG_PREFIX = '[on-demand]';
const STALENESS_DAYS = 7;

// ============================================================
// Types
// ============================================================

export type EntityType = 'movie' | 'tv' | 'person';

export interface OnDemandResult {
  /** Internal DB ID (always returned if the entity exists, even if stale) */
  dbId: number;
  /** TMDB ID */
  tmdbId: number;
  /** Whether the data was freshly fetched (true) or served stale (false) */
  fresh: boolean;
  /** Whether a background re-fetch was triggered */
  revalidating: boolean;
}

// ============================================================
// Helpers
// ============================================================

function isStale(lastFetchedAt: Date | null): boolean {
  if (!lastFetchedAt) return true;
  const msSinceFetch = Date.now() - lastFetchedAt.getTime();
  const msStale = STALENESS_DAYS * 24 * 60 * 60 * 1000;
  return msSinceFetch > msStale;
}

/**
 * Fire-and-forget re-fetch. Does not block the caller.
 */
function triggerBackgroundRefetch(entity: EntityType, tmdbId: number): void {
  // Use setTimeout(0) to defer to next tick — avoids blocking the response
  setTimeout(async () => {
    try {
      console.log(`${LOG_PREFIX} Background re-fetching ${entity} ${tmdbId}`);
      switch (entity) {
        case 'movie':
          await fetchAndUpsertMovie(tmdbId);
          break;
        case 'tv':
          await fetchAndUpsertTvSeries(tmdbId);
          break;
        case 'person':
          await fetchAndUpsertPerson(tmdbId);
          break;
      }
      console.log(`${LOG_PREFIX} Background re-fetch complete for ${entity} ${tmdbId}`);
    } catch (error) {
      console.error(`${LOG_PREFIX} Background re-fetch failed for ${entity} ${tmdbId}:`, error);
    }
  }, 0);
}

// ============================================================
// Core: Fetch on miss
// ============================================================

/**
 * Look up an entity by TMDB ID. If not found, fetch from TMDB and upsert.
 * Returns the internal DB ID and freshness info.
 */
export async function fetchOnMiss(
  entity: EntityType,
  tmdbId: number
): Promise<OnDemandResult | null> {
  // Step 1: Check DB
  let record: { id: number; lastFetchedAt: Date | null } | null = null;

  switch (entity) {
    case 'movie':
      record = await prisma.movie.findUnique({
        where: { tmdbId },
        select: { id: true, lastFetchedAt: true },
      });
      break;
    case 'tv':
      record = await prisma.tvSeries.findUnique({
        where: { tmdbId },
        select: { id: true, lastFetchedAt: true },
      });
      break;
    case 'person':
      record = await prisma.person.findUnique({
        where: { tmdbId },
        select: { id: true, lastFetchedAt: true },
      });
      break;
  }

  // Step 2a: Found and fresh
  if (record && !isStale(record.lastFetchedAt)) {
    return {
      dbId: record.id,
      tmdbId,
      fresh: true,
      revalidating: false,
    };
  }

  // Step 2b: Found but stale — serve stale data + background re-fetch
  if (record && isStale(record.lastFetchedAt)) {
    triggerBackgroundRefetch(entity, tmdbId);
    return {
      dbId: record.id,
      tmdbId,
      fresh: false,
      revalidating: true,
    };
  }

  // Step 3: Not found — fetch from TMDB (blocking)
  console.log(`${LOG_PREFIX} ${entity} ${tmdbId} not in DB, fetching from TMDB...`);
  const startTime = Date.now();

  let dbId: number | null = null;

  switch (entity) {
    case 'movie':
      dbId = await fetchAndUpsertMovie(tmdbId);
      break;
    case 'tv':
      dbId = await fetchAndUpsertTvSeries(tmdbId);
      break;
    case 'person':
      dbId = await fetchAndUpsertPerson(tmdbId);
      break;
  }

  const duration = Date.now() - startTime;

  if (dbId) {
    console.log(`${LOG_PREFIX} Fetched and stored ${entity} ${tmdbId} in ${duration}ms (DB ID: ${dbId})`);
    return {
      dbId,
      tmdbId,
      fresh: true,
      revalidating: false,
    };
  }

  console.error(`${LOG_PREFIX} Failed to fetch ${entity} ${tmdbId} from TMDB after ${duration}ms`);
  return null;
}

/**
 * Convenience wrapper for movie detail pages.
 * Returns the internal DB ID for a movie, fetching from TMDB if needed.
 */
export async function getMovieDbId(tmdbId: number): Promise<number | null> {
  const result = await fetchOnMiss('movie', tmdbId);
  return result?.dbId ?? null;
}

/**
 * Convenience wrapper for TV detail pages.
 */
export async function getTvSeriesDbId(tmdbId: number): Promise<number | null> {
  const result = await fetchOnMiss('tv', tmdbId);
  return result?.dbId ?? null;
}

/**
 * Convenience wrapper for person detail pages.
 */
export async function getPersonDbId(tmdbId: number): Promise<number | null> {
  const result = await fetchOnMiss('person', tmdbId);
  return result?.dbId ?? null;
}
