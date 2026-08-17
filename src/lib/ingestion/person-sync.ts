// Person Sync Service
// Fetches popular persons from TMDB and stores them with all detail fields.
// Uses upsert on tmdbId to prevent duplicates, rate-limit compliant via TmdbClient.

import { TmdbClient } from '../tmdb/client';
import prisma from '../db';
import type { TmdbPerson } from '../tmdb/types';
import type { SyncResult, SyncError, SyncOptions } from './types';
import { DEFAULT_SYNC_OPTIONS } from './types';

// ============================================================
// Constants
// ============================================================

const LOG_PREFIX = '[person-sync]';
const BATCH_SIZE = 10;
const PAGES_TO_FETCH = 5;

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
// Core: Upsert a single person (all TMDB fields)
// ============================================================

function buildPersonData(person: TmdbPerson) {
  return {
    adult: person.adult,
    biography: person.biography || null,
    birthday: person.birthday || null,
    deathday: person.deathday || null,
    gender: person.gender,
    homepage: person.homepage || null,
    imdbId: person.imdb_id || null,
    knownForDepartment: person.known_for_department || null,
    name: person.name,
    // Store array as comma-separated string (SQLite has no array type)
    alsoKnownAs:
      person.also_known_as && person.also_known_as.length > 0
        ? person.also_known_as.join(',')
        : null,
    placeOfBirth: person.place_of_birth || null,
    popularity: person.popularity,
    profilePath: person.profile_path || null,
  };
}

async function upsertPerson(person: TmdbPerson, client: TmdbClient): Promise<void> {
  const data = buildPersonData(person);

  await prisma.person.upsert({
    where: { tmdbId: person.id },
    create: { tmdbId: person.id, ...data, lastFetchedAt: new Date() },
    update: { ...data, lastFetchedAt: new Date() },
  });

  // --- Sub-Resource Fetching (external IDs + images + translations) ---
  const [externalIdsResult, imagesResult, translationsResult] = await Promise.allSettled([
    client.getPersonExternalIds(person.id),
    client.getPersonImages(person.id),
    client.getPersonTranslations(person.id),
  ]);

  // Find person's internal DB id
  const personRecord = await prisma.person.findUnique({ where: { tmdbId: person.id } });
  if (!personRecord) return;

  await prisma.$transaction(async (tx) => {
    // --- External IDs ---
    const extIds = externalIdsResult.status === 'fulfilled' ? externalIdsResult.value : null;
    if (extIds) {
      await tx.externalId.upsert({
        where: { entityType_entityId: { entityType: 'person', entityId: personRecord.id } },
        create: {
          entityType: 'person',
          entityId: personRecord.id,
          imdbId: extIds.imdb_id,
          freebaseId: extIds.freebase_id,
          freebaseMid: extIds.freebase_mid,
          wikidataId: extIds.wikidata_id,
          facebookId: extIds.facebook_id,
          instagramId: extIds.instagram_id,
          twitterId: extIds.twitter_id,
          tvrageId: extIds.tvrage_id,
          tiktokId: extIds.tiktok_id,
          youtubeId: extIds.youtube_id,
        },
        update: {
          imdbId: extIds.imdb_id,
          freebaseId: extIds.freebase_id,
          freebaseMid: extIds.freebase_mid,
          wikidataId: extIds.wikidata_id,
          facebookId: extIds.facebook_id,
          instagramId: extIds.instagram_id,
          twitterId: extIds.twitter_id,
          tvrageId: extIds.tvrage_id,
          tiktokId: extIds.tiktok_id,
          youtubeId: extIds.youtube_id,
        },
      });
    }

    // --- Images (profiles, up to 20) ---
    const images = imagesResult.status === 'fulfilled' ? imagesResult.value : null;
    if (images?.profiles) {
      await tx.mediaImage.deleteMany({ where: { entityType: 'person', entityId: personRecord.id } });
      const imgData = images.profiles.slice(0, 20).map((img) => ({
        entityType: 'person' as const,
        entityId: personRecord.id,
        filePath: img.file_path,
        aspectRatio: img.aspect_ratio,
        height: img.height,
        width: img.width,
        language: img.iso_639_1,
        voteAverage: img.vote_average,
        voteCount: img.vote_count,
        imageType: 'profile' as const,
        fileType: null as string | null,
      }));
      if (imgData.length > 0) {
        await tx.mediaImage.createMany({ data: imgData });
      }
    }

    // --- Translations ---
    const translations = translationsResult.status === 'fulfilled' ? translationsResult.value : null;
    if (translations?.translations) {
      await tx.translation.deleteMany({ where: { entityType: 'person', entityId: personRecord.id } });
      const trData = translations.translations.map((t) => ({
        entityType: 'person' as const,
        entityId: personRecord.id,
        iso6391: t.iso_639_1,
        iso31661: t.iso_3166_1,
        name: t.name,
        englishName: t.english_name || null,
        data: t.data ? JSON.stringify(t.data) : null,
      }));
      if (trData.length > 0) {
        await tx.translation.createMany({ data: trData });
      }
    }
  });
}

// ============================================================
// Phase 1: Collect unique person IDs from popular persons
// ============================================================

async function collectPopularPersonIds(
  client: TmdbClient,
  pages: number,
): Promise<number[]> {
  const ids = new Set<number>();

  for (let page = 1; page <= pages; page++) {
    try {
      const response = await client.getPopularPersons(page);
      for (const person of response.results) {
        ids.add(person.id);
      }
      console.log(
        `${LOG_PREFIX} Fetched popular persons page ${page}/${pages} (${response.results.length} results)`,
      );
    } catch (err) {
      console.error(
        `${LOG_PREFIX} Error fetching popular persons page ${page}:`,
        err,
      );
    }
  }

  return Array.from(ids);
}

// ============================================================
// Phase 2: Fetch full details + upsert in batches
// ============================================================

async function syncBatch(
  personIds: number[],
  client: TmdbClient,
  onProgress: (processed: number) => void,
  errors: SyncError[],
): Promise<number> {
  const batches = chunk(personIds, BATCH_SIZE);
  let processed = 0;

  for (const batch of batches) {
    // Fetch full details in parallel within sub-batch
    const details = await Promise.allSettled(
      batch.map((id) => client.getPersonDetails(id)),
    );

    // Process each result
    for (let i = 0; i < details.length; i++) {
      const result = details[i];
      if (result.status === 'fulfilled') {
        try {
          await upsertPerson(result.value, client);
        } catch (err) {
          errors.push({
            tmdbId: batch[i],
            entity: 'person',
            message:
              err instanceof Error ? err.message : String(err),
            timestamp: new Date(),
          });
        }
      } else {
        errors.push({
          tmdbId: batch[i],
          entity: 'person',
          message:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
          timestamp: new Date(),
        });
      }
      processed++;
    }

    onProgress(processed);
  }

  return processed;
}

// ============================================================
// Public API: Full Person Sync
// ============================================================

export async function syncPersons(
  options: Partial<SyncOptions> = {},
): Promise<SyncResult> {
  const opts: SyncOptions = { ...DEFAULT_SYNC_OPTIONS, ...options };
  const client = new TmdbClient({ language: opts.language });
  const errors: SyncError[] = [];
  const startTime = Date.now();

  console.log(`${LOG_PREFIX} Starting person sync (fullSync=${opts.fullSync})`);

  // ---- Phase 1: Collect unique person IDs from popular persons (pages 1-5) ----
  console.log(`${LOG_PREFIX} Fetching popular persons (pages 1-${PAGES_TO_FETCH})...`);
  const allIds = await collectPopularPersonIds(client, PAGES_TO_FETCH);

  // Apply limit if set
  const personIds = opts.limit > 0 ? allIds.slice(0, opts.limit) : allIds;
  const total = personIds.length;

  console.log(`${LOG_PREFIX} Collected ${total} unique person IDs`);

  if (total === 0) {
    return { success: true, errors: [], duration: Date.now() - startTime };
  }

  // ---- Phase 2: Fetch details + upsert in batches ----
  let processed = 0;

  try {
    processed = await syncBatch(
      personIds,
      client,
      (count) => {
        console.log(
          `${LOG_PREFIX} Progress: ${count}/${total} persons (${Math.round((count / total) * 100)}%)`,
        );
      },
      errors,
    );
  } catch (err) {
    console.error(`${LOG_PREFIX} Sync failed:`, err);
  }

  const duration = Date.now() - startTime;
  const success = errors.length === 0 && processed === total;

  console.log(
    `${LOG_PREFIX} Sync complete: ${processed}/${total} persons in ${duration}ms (${errors.length} errors)`,
  );

  return { success, errors, duration };
}

// ============================================================
// Public API: Incremental Sync
// ============================================================

export async function syncPersonsIncremental(): Promise<SyncResult> {
  return syncPersons({ fullSync: false });
}

// ============================================================
// Public API: On-Demand Fetch (single person by TMDB ID)
// ============================================================

/**
 * Fetch a single person from TMDB and upsert them with all nested data.
 * Used for on-demand fetch when a user clicks on a person not yet in the DB.
 * Returns the upserted person's internal DB ID, or null on failure.
 */
export async function fetchAndUpsertPerson(tmdbId: number): Promise<number | null> {
  const client = new TmdbClient({ language: 'en-US' });

  try {
    const tmdbPerson = await client.getPersonDetails(tmdbId);
    if (!tmdbPerson) return null;

    await upsertPerson(tmdbPerson, client);

    const person = await prisma.person.findUnique({ where: { tmdbId } });
    return person?.id ?? null;
  } catch (error) {
    console.error(`${LOG_PREFIX} On-demand fetch failed for person ${tmdbId}:`, error);
    return null;
  }
}
