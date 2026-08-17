// Credit Sync Service
// Syncs movie and TV cast/crew credits for persons from TMDB.
// Only links to movies/TV series that already exist in the database.
// Credits are deduplicated by creditId and can be run independently of person sync.

import { TmdbClient } from '../tmdb/client';
import prisma from '../db';
import type { SyncResult, SyncError, SyncOptions } from './types';
import { DEFAULT_SYNC_OPTIONS } from './types';

// ============================================================
// Constants
// ============================================================

const LOG_PREFIX = '[credit-sync]';
const PERSON_BATCH_SIZE = 10;

// ============================================================
// Helpers
// ============================================================

/** Split an array into fixed-size chunks */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ============================================================
// Single-Person Credit Sync (Movie Credits)
// ============================================================

export async function syncPersonMovieCredits(
  tmdbPersonId: number,
  client: TmdbClient,
): Promise<SyncResult> {
  const startTime = Date.now();
  const errors: SyncError[] = [];

  try {
    // Ensure the person exists in the database
    const person = await prisma.person.findUnique({
      where: { tmdbId: tmdbPersonId },
    });
    if (!person) {
      throw new Error(
        `Person with TMDB ID ${tmdbPersonId} not found in database. Run person sync first.`,
      );
    }

    // Fetch movie credits from TMDB
    const credits = await client.getPersonMovieCredits(tmdbPersonId);

    // Deduplicate by creditId
    const seenCastCreditIds = new Set<string>();
    const seenCrewCreditIds = new Set<string>();

    // Collect unique TMDB movie IDs from both cast and crew
    const movieTmdbIds = new Set<number>();
    for (const cast of credits.cast) {
      movieTmdbIds.add(cast.id);
    }
    for (const crew of credits.crew) {
      movieTmdbIds.add(crew.id);
    }

    // Batch lookup existing movies in the database
    const existingMovies =
      movieTmdbIds.size > 0
        ? await prisma.movie.findMany({
            where: { tmdbId: { in: Array.from(movieTmdbIds) } },
            select: { id: true, tmdbId: true },
          })
        : [];

    const movieIdMap = new Map(existingMovies.map((m) => [m.tmdbId, m.id]));

    // Build deduplicated cast credit data (only for existing movies)
    const castData: Array<{
      personId: number;
      movieId: number;
      character: string | null;
      creditId: string | null;
      order: number | null;
    }> = [];

    for (const cast of credits.cast) {
      if (seenCastCreditIds.has(cast.credit_id)) continue;
      seenCastCreditIds.add(cast.credit_id);

      const movieId = movieIdMap.get(cast.id);
      if (!movieId) continue; // Skip credits for movies not in the database

      castData.push({
        personId: person.id,
        movieId,
        character: cast.character || null,
        creditId: cast.credit_id || null,
        order: cast.order ?? null,
      });
    }

    // Build deduplicated crew credit data (only for existing movies)
    const crewData: Array<{
      personId: number;
      movieId: number;
      department: string | null;
      job: string | null;
      creditId: string | null;
    }> = [];

    for (const crew of credits.crew) {
      if (seenCrewCreditIds.has(crew.credit_id)) continue;
      seenCrewCreditIds.add(crew.credit_id);

      const movieId = movieIdMap.get(crew.id);
      if (!movieId) continue;

      crewData.push({
        personId: person.id,
        movieId,
        department: crew.department || null,
        job: crew.job || null,
        creditId: crew.credit_id || null,
      });
    }

    // Delete existing movie credits for this person, then insert new ones
    await prisma.$transaction(async (tx) => {
      await tx.castCredit.deleteMany({
        where: { personId: person.id, movieId: { not: null } },
      });
      await tx.crewCredit.deleteMany({
        where: { personId: person.id, movieId: { not: null } },
      });

      if (castData.length > 0) {
        await tx.castCredit.createMany({ data: castData });
      }
      if (crewData.length > 0) {
        await tx.crewCredit.createMany({ data: crewData });
      }
    });

    console.log(
      `${LOG_PREFIX} Movie credits for person ${tmdbPersonId}: ${castData.length} cast, ${crewData.length} crew`,
    );

    const duration = Date.now() - startTime;
    return { success: true, errors, duration };
  } catch (err) {
    const duration = Date.now() - startTime;
    errors.push({
      tmdbId: tmdbPersonId,
      entity: 'credit',
      message: err instanceof Error ? err.message : String(err),
      timestamp: new Date(),
    });
    return { success: false, errors, duration };
  }
}

// ============================================================
// Single-Person Credit Sync (TV Credits)
// ============================================================

export async function syncPersonTvCredits(
  tmdbPersonId: number,
  client: TmdbClient,
): Promise<SyncResult> {
  const startTime = Date.now();
  const errors: SyncError[] = [];

  try {
    const person = await prisma.person.findUnique({
      where: { tmdbId: tmdbPersonId },
    });
    if (!person) {
      throw new Error(
        `Person with TMDB ID ${tmdbPersonId} not found in database. Run person sync first.`,
      );
    }

    const credits = await client.getPersonTvCredits(tmdbPersonId);

    // Deduplicate by creditId
    const seenCastCreditIds = new Set<string>();
    const seenCrewCreditIds = new Set<string>();

    // Collect unique TMDB TV series IDs
    const tvTmdbIds = new Set<number>();
    for (const cast of credits.cast) {
      tvTmdbIds.add(cast.id);
    }
    for (const crew of credits.crew) {
      tvTmdbIds.add(crew.id);
    }

    // Batch lookup existing TV series in the database
    const existingTvSeries =
      tvTmdbIds.size > 0
        ? await prisma.tvSeries.findMany({
            where: { tmdbId: { in: Array.from(tvTmdbIds) } },
            select: { id: true, tmdbId: true },
          })
        : [];

    const tvSeriesIdMap = new Map(
      existingTvSeries.map((s) => [s.tmdbId, s.id]),
    );

    // Build deduplicated cast credit data (only for existing series)
    const castData: Array<{
      personId: number;
      tvSeriesId: number;
      character: string | null;
      creditId: string | null;
      order: number | null;
    }> = [];

    for (const cast of credits.cast) {
      if (seenCastCreditIds.has(cast.credit_id)) continue;
      seenCastCreditIds.add(cast.credit_id);

      const tvSeriesId = tvSeriesIdMap.get(cast.id);
      if (!tvSeriesId) continue;

      castData.push({
        personId: person.id,
        tvSeriesId,
        character: cast.character || null,
        creditId: cast.credit_id || null,
        // TV credits don't have an order field; CastCredit.order is null for TV
        order: null,
      });
    }

    // Build deduplicated crew credit data (only for existing series)
    const crewData: Array<{
      personId: number;
      tvSeriesId: number;
      department: string | null;
      job: string | null;
      creditId: string | null;
    }> = [];

    for (const crew of credits.crew) {
      if (seenCrewCreditIds.has(crew.credit_id)) continue;
      seenCrewCreditIds.add(crew.credit_id);

      const tvSeriesId = tvSeriesIdMap.get(crew.id);
      if (!tvSeriesId) continue;

      crewData.push({
        personId: person.id,
        tvSeriesId,
        department: crew.department || null,
        job: crew.job || null,
        creditId: crew.credit_id || null,
      });
    }

    // Delete existing TV credits for this person, then insert new ones
    await prisma.$transaction(async (tx) => {
      await tx.castCredit.deleteMany({
        where: { personId: person.id, tvSeriesId: { not: null } },
      });
      await tx.crewCredit.deleteMany({
        where: { personId: person.id, tvSeriesId: { not: null } },
      });

      if (castData.length > 0) {
        await tx.castCredit.createMany({ data: castData });
      }
      if (crewData.length > 0) {
        await tx.crewCredit.createMany({ data: crewData });
      }
    });

    console.log(
      `${LOG_PREFIX} TV credits for person ${tmdbPersonId}: ${castData.length} cast, ${crewData.length} crew`,
    );

    const duration = Date.now() - startTime;
    return { success: true, errors, duration };
  } catch (err) {
    const duration = Date.now() - startTime;
    errors.push({
      tmdbId: tmdbPersonId,
      entity: 'credit',
      message: err instanceof Error ? err.message : String(err),
      timestamp: new Date(),
    });
    return { success: false, errors, duration };
  }
}

// ============================================================
// Combined Credit Sync (Movie + TV for a single person)
// ============================================================

export async function syncPersonCredits(
  tmdbPersonId: number,
  client: TmdbClient,
): Promise<SyncResult> {
  const startTime = Date.now();
  const errors: SyncError[] = [];

  try {
    const person = await prisma.person.findUnique({
      where: { tmdbId: tmdbPersonId },
    });
    if (!person) {
      throw new Error(
        `Person with TMDB ID ${tmdbPersonId} not found in database. Run person sync first.`,
      );
    }

    // Fetch movie and TV credits in parallel
    const [movieCredits, tvCredits] = await Promise.all([
      client.getPersonMovieCredits(tmdbPersonId),
      client.getPersonTvCredits(tmdbPersonId),
    ]);

    // ---- Collect all unique TMDB IDs across both credit sets ----
    const movieTmdbIds = new Set<number>();
    const tvTmdbIds = new Set<number>();

    for (const cast of movieCredits.cast) movieTmdbIds.add(cast.id);
    for (const crew of movieCredits.crew) movieTmdbIds.add(crew.id);
    for (const cast of tvCredits.cast) tvTmdbIds.add(cast.id);
    for (const crew of tvCredits.crew) tvTmdbIds.add(crew.id);

    // Batch lookup existing movies and TV series
    const [existingMovies, existingTvSeries] = await Promise.all([
      movieTmdbIds.size > 0
        ? prisma.movie.findMany({
            where: { tmdbId: { in: Array.from(movieTmdbIds) } },
            select: { id: true, tmdbId: true },
          })
        : [],
      tvTmdbIds.size > 0
        ? prisma.tvSeries.findMany({
            where: { tmdbId: { in: Array.from(tvTmdbIds) } },
            select: { id: true, tmdbId: true },
          })
        : [],
    ]);

    const movieIdMap = new Map(existingMovies.map((m) => [m.tmdbId, m.id]));
    const tvSeriesIdMap = new Map(
      existingTvSeries.map((s) => [s.tmdbId, s.id]),
    );

    // ---- Build deduplicated credit data ----
    const seenCastCreditIds = new Set<string>();
    const seenCrewCreditIds = new Set<string>();

    const castData: Array<{
      personId: number;
      movieId?: number;
      tvSeriesId?: number;
      character: string | null;
      creditId: string | null;
      order: number | null;
    }> = [];

    const crewData: Array<{
      personId: number;
      movieId?: number;
      tvSeriesId?: number;
      department: string | null;
      job: string | null;
      creditId: string | null;
    }> = [];

    // Movie cast credits
    for (const cast of movieCredits.cast) {
      if (seenCastCreditIds.has(cast.credit_id)) continue;
      seenCastCreditIds.add(cast.credit_id);

      const movieId = movieIdMap.get(cast.id);
      if (!movieId) continue;

      castData.push({
        personId: person.id,
        movieId,
        character: cast.character || null,
        creditId: cast.credit_id || null,
        order: cast.order ?? null,
      });
    }

    // Movie crew credits
    for (const crew of movieCredits.crew) {
      if (seenCrewCreditIds.has(crew.credit_id)) continue;
      seenCrewCreditIds.add(crew.credit_id);

      const movieId = movieIdMap.get(crew.id);
      if (!movieId) continue;

      crewData.push({
        personId: person.id,
        movieId,
        department: crew.department || null,
        job: crew.job || null,
        creditId: crew.credit_id || null,
      });
    }

    // TV cast credits
    for (const cast of tvCredits.cast) {
      if (seenCastCreditIds.has(cast.credit_id)) continue;
      seenCastCreditIds.add(cast.credit_id);

      const tvSeriesId = tvSeriesIdMap.get(cast.id);
      if (!tvSeriesId) continue;

      castData.push({
        personId: person.id,
        tvSeriesId,
        character: cast.character || null,
        creditId: cast.credit_id || null,
        order: null,
      });
    }

    // TV crew credits
    for (const crew of tvCredits.crew) {
      if (seenCrewCreditIds.has(crew.credit_id)) continue;
      seenCrewCreditIds.add(crew.credit_id);

      const tvSeriesId = tvSeriesIdMap.get(crew.id);
      if (!tvSeriesId) continue;

      crewData.push({
        personId: person.id,
        tvSeriesId,
        department: crew.department || null,
        job: crew.job || null,
        creditId: crew.credit_id || null,
      });
    }

    // ---- Delete old credits + insert new ones in a transaction ----
    await prisma.$transaction(async (tx) => {
      // Delete ALL existing credits for this person
      await Promise.all([
        tx.castCredit.deleteMany({ where: { personId: person.id } }),
        tx.crewCredit.deleteMany({ where: { personId: person.id } }),
      ]);

      // Insert fresh deduplicated credits
      if (castData.length > 0) {
        await tx.castCredit.createMany({ data: castData });
      }
      if (crewData.length > 0) {
        await tx.crewCredit.createMany({ data: crewData });
      }
    });

    console.log(
      `${LOG_PREFIX} Combined credits for person ${tmdbPersonId}: ${castData.length} cast, ${crewData.length} crew`,
    );

    const duration = Date.now() - startTime;
    return { success: true, errors, duration };
  } catch (err) {
    const duration = Date.now() - startTime;
    errors.push({
      tmdbId: tmdbPersonId,
      entity: 'credit',
      message: err instanceof Error ? err.message : String(err),
      timestamp: new Date(),
    });
    return { success: false, errors, duration };
  }
}

// ============================================================
// Bulk Credit Sync: Credits for all persons in the database
// ============================================================

export async function syncCreditsForAllPersons(
  options: Partial<SyncOptions> = {},
): Promise<SyncResult> {
  const opts: SyncOptions = { ...DEFAULT_SYNC_OPTIONS, ...options };
  const client = new TmdbClient({ language: opts.language });
  const errors: SyncError[] = [];
  const startTime = Date.now();

  console.log(`${LOG_PREFIX} Starting bulk credit sync for all persons`);

  // Fetch all persons from the database
  const persons = await prisma.person.findMany({
    select: { tmdbId: true, name: true },
    orderBy: { popularity: 'desc' },
  });

  const personIds = opts.limit > 0
    ? persons.slice(0, opts.limit).map((p) => p.tmdbId)
    : persons.map((p) => p.tmdbId);

  const total = personIds.length;
  console.log(`${LOG_PREFIX} Syncing credits for ${total} persons`);

  if (total === 0) {
    return { success: true, errors: [], duration: Date.now() - startTime };
  }

  // Process in batches to control API usage
  const batches = chunk(personIds, PERSON_BATCH_SIZE);
  let processed = 0;

  for (const batch of batches) {
    for (const tmdbPersonId of batch) {
      try {
        const result = await syncPersonCredits(tmdbPersonId, client);
        if (!result.success) {
          errors.push(...result.errors);
        }
      } catch (err) {
        errors.push({
          tmdbId: tmdbPersonId,
          entity: 'credit',
          message: err instanceof Error ? err.message : String(err),
          timestamp: new Date(),
        });
      }
      processed++;
    }

    console.log(
      `${LOG_PREFIX} Progress: ${processed}/${total} persons (${Math.round((processed / total) * 100)}%)`,
    );
  }

  const duration = Date.now() - startTime;
  const success = errors.length === 0;

  console.log(
    `${LOG_PREFIX} Bulk credit sync complete: ${processed} persons in ${duration}ms (${errors.length} errors)`,
  );

  return { success, errors, duration };
}
