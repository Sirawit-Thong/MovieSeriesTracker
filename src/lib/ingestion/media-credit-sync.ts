// Media Credit Sync Service
// Fetches and stores cast/crew credits for movies and TV series from TMDB.
// Creates Person records on-the-fly for unknown cast/crew members.
// Used by movie/TV sync and on-demand credit loading.

import { prisma } from '../db';
import { TmdbClient } from '../tmdb/client';

const LOG_PREFIX = '[media-credit-sync]';

// ============================================================
// Core: Sync cast/crew credits for a movie or TV series
// ============================================================

/**
 * Fetch cast/crew credits from TMDB and store them in the database.
 * Creates Person records for unknown cast/crew members.
 *
 * @param mediaType - 'movie' or 'tv'
 * @param mediaId - Internal DB ID of the movie/TV series
 * @param tmdbId - TMDB ID
 * @param client - TmdbClient instance
 */
export async function syncMediaCredits(
  mediaType: 'movie' | 'tv',
  mediaId: number,
  tmdbId: number,
  client: TmdbClient,
): Promise<void> {
  try {
    // Fetch credits from TMDB
    const credits = mediaType === 'movie'
      ? await client.getMovieCredits(tmdbId)
      : await client.getTvCredits(tmdbId);

    if (!credits) return;

    // Collect unique person TMDB IDs
    const personTmdbIds = new Set<number>();
    for (const c of credits.cast) personTmdbIds.add(c.id);
    for (const c of credits.crew) personTmdbIds.add(c.id);

    if (personTmdbIds.size === 0) return;

    // Batch lookup existing persons
    const existingPersons = await prisma.person.findMany({
      where: { tmdbId: { in: Array.from(personTmdbIds) } },
      select: { id: true, tmdbId: true },
    });

    const personIdMap = new Map(existingPersons.map((p) => [p.tmdbId, p.id]));

    // Create stub persons for unknown cast/crew members
    const unknownIds = Array.from(personTmdbIds).filter((id) => !personIdMap.has(id));

    // Build a map of all cast/crew by person TMDB ID to get their info
    const personInfoMap = new Map<number, { name: string; profilePath: string | null; popularity: number | null; gender: number | null }>();
    for (const c of credits.cast) {
      if (!personInfoMap.has(c.id)) {
        personInfoMap.set(c.id, {
          name: c.name,
          profilePath: c.profile_path,
          popularity: c.popularity ?? null,
          gender: c.gender ?? null,
        });
      }
    }
    for (const c of credits.crew) {
      if (!personInfoMap.has(c.id)) {
        personInfoMap.set(c.id, {
          name: c.name,
          profilePath: c.profile_path,
          popularity: c.popularity ?? null,
          gender: c.gender ?? null,
        });
      }
    }

    // Upsert unknown persons — fetch full details for each
    const personClient = new TmdbClient();
    for (const tmdbId of unknownIds) {
      const info = personInfoMap.get(tmdbId);
      if (!info) continue;

      try {
        const fullDetails = await personClient.getPersonDetails(tmdbId);
        if (fullDetails) {
          await prisma.person.upsert({
            where: { tmdbId },
            create: {
              tmdbId,
              name: fullDetails.name,
              profilePath: fullDetails.profile_path,
              popularity: fullDetails.popularity ?? 0,
              gender: fullDetails.gender ?? 0,
              knownForDepartment: fullDetails.known_for_department || 'Acting',
              adult: fullDetails.adult ?? false,
              alsoKnownAs: fullDetails.also_known_as?.join(',') || null,
              biography: fullDetails.biography || null,
              birthday: fullDetails.birthday || null,
              deathday: fullDetails.deathday || null,
              homepage: fullDetails.homepage || null,
              imdbId: fullDetails.imdb_id || null,
              placeOfBirth: fullDetails.place_of_birth || null,
              lastFetchedAt: new Date(),
            },
            update: {},
          });
          // Get the internal ID for the credit mapping
          const person = await prisma.person.findUnique({ where: { tmdbId } });
          if (person) personIdMap.set(tmdbId, person.id);

          // Fetch and store translations for this person
          try {
            const translations = await personClient.getPersonTranslations(tmdbId);
            if (translations?.translations && person) {
              await prisma.translation.deleteMany({
                where: { entityType: 'person', entityId: person.id },
              });
              const trData = translations.translations.map((t) => ({
                entityType: 'person' as const,
                entityId: person.id,
                iso6391: t.iso_639_1,
                iso31661: t.iso_3166_1,
                name: t.name,
                englishName: t.english_name || null,
                data: t.data ? JSON.stringify(t.data) : null,
              }));
              if (trData.length > 0) {
                await prisma.translation.createMany({ data: trData });
              }
            }
          } catch {
            // Non-fatal: translations are nice-to-have
          }

          continue;
        }
      } catch {
        // Fall through to stub creation if full details fetch fails
      }

      // Fallback: create minimal stub
      const person = await prisma.person.upsert({
        where: { tmdbId },
        create: {
          tmdbId,
          name: info.name,
          profilePath: info.profilePath,
          popularity: info.popularity ?? 0,
          gender: info.gender ?? 0,
          knownForDepartment: 'Acting',
          adult: false,
          alsoKnownAs: null,
          biography: null,
          birthday: null,
          deathday: null,
          homepage: null,
          imdbId: null,
          placeOfBirth: null,
        },
        update: {},
      });
      personIdMap.set(tmdbId, person.id);
    }

    // Deduplicate credits
    const seenCastCreditIds = new Set<string>();
    const seenCrewCreditIds = new Set<string>();

    const castData: Array<{
      personId: number;
      movieId?: number;
      tvSeriesId?: number;
      character: string | null;
      creditId: string | null;
      order: number | null;
      gender: number | null;
      popularity: number | null;
      profilePath: string | null;
      originalName: string | null;
    }> = [];

    const crewData: Array<{
      personId: number;
      movieId?: number;
      tvSeriesId?: number;
      department: string | null;
      job: string | null;
      creditId: string | null;
      gender: number | null;
      popularity: number | null;
      profilePath: string | null;
      originalName: string | null;
    }> = [];

    // Build cast data
    for (const cast of credits.cast) {
      if (seenCastCreditIds.has(cast.credit_id)) continue;
      seenCastCreditIds.add(cast.credit_id);

      const personId = personIdMap.get(cast.id);
      if (!personId) continue;

      const base = {
        personId,
        character: cast.character || null,
        creditId: cast.credit_id || null,
        order: cast.order ?? null,
        gender: cast.gender ?? null,
        popularity: cast.popularity ?? null,
        profilePath: cast.profile_path || null,
        originalName: cast.original_name || null,
      };

      if (mediaType === 'movie') {
        castData.push({ ...base, movieId: mediaId });
      } else {
        castData.push({ ...base, tvSeriesId: mediaId });
      }
    }

    // Build crew data
    for (const crew of credits.crew) {
      if (seenCrewCreditIds.has(crew.credit_id)) continue;
      seenCrewCreditIds.add(crew.credit_id);

      const personId = personIdMap.get(crew.id);
      if (!personId) continue;

      const base = {
        personId,
        department: crew.department || null,
        job: crew.job || null,
        creditId: crew.credit_id || null,
        gender: crew.gender ?? null,
        popularity: crew.popularity ?? null,
        profilePath: crew.profile_path || null,
        originalName: crew.original_name || null,
      };

      if (mediaType === 'movie') {
        crewData.push({ ...base, movieId: mediaId });
      } else {
        crewData.push({ ...base, tvSeriesId: mediaId });
      }
    }

    // Delete old credits and insert new ones
    const whereClause = mediaType === 'movie'
      ? { movieId: mediaId }
      : { tvSeriesId: mediaId };

    await prisma.$transaction(async (tx) => {
      await tx.castCredit.deleteMany({ where: whereClause });
      await tx.crewCredit.deleteMany({ where: whereClause });

      if (castData.length > 0) {
        await tx.castCredit.createMany({ data: castData });
      }
      if (crewData.length > 0) {
        await tx.crewCredit.createMany({ data: crewData });
      }
    });

    console.log(
      `${LOG_PREFIX} ${mediaType} ${tmdbId}: ${castData.length} cast, ${crewData.length} crew`
    );
  } catch (error) {
    // Non-fatal: log but don't throw
    console.error(
      `${LOG_PREFIX} Failed to sync credits for ${mediaType} ${tmdbId}:`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

// ============================================================
// On-Demand: Ensure a movie/TV has credits in the DB
// ============================================================

/**
 * Check if a movie/TV has cast/crew credits in the database.
 * If not, fetch from TMDB and sync them.
 * This is used by the detail pages to ensure credits are available.
 */
export async function ensureMediaCredits(
  mediaType: 'movie' | 'tv',
  mediaId: number,
  tmdbId: number,
): Promise<void> {
  const whereClause = mediaType === 'movie'
    ? { movieId: mediaId }
    : { tvSeriesId: mediaId };

  const castCount = await prisma.castCredit.count({ where: whereClause });
  const crewCount = await prisma.crewCredit.count({ where: whereClause });

  if (castCount > 0 || crewCount > 0) return;

  console.log(
    `${LOG_PREFIX} No credits found for ${mediaType} ${tmdbId}, syncing from TMDB...`
  );

  const client = new TmdbClient();
  await syncMediaCredits(mediaType, mediaId, tmdbId, client);
}
