// Reference Data Seeding Script
// Fetches genres and watch providers from TMDB and stores in the database.
// Idempotent — re-running will upsert existing records, not duplicate them.

import { TmdbClient } from '../tmdb/client';
import prisma from '../db';
import type { TmdbGenre, TmdbWatchProviderListItem } from '../tmdb/types';

const tmdb = new TmdbClient();

// ============================================================
// Genre Seeding
// ============================================================

/**
 * Fetch and store all movie genres from TMDB.
 * Uses the TMDB /genre/movie/list endpoint.
 * Upserts by genre id so the operation is idempotent.
 */
async function seedMovieGenres(): Promise<number> {
  console.log('[seed] Fetching movie genres from TMDB...');

  const response = await tmdb.getMovieGenres();
  const genres: TmdbGenre[] = response.genres;

  console.log(`[seed] Received ${genres.length} movie genres`);

  let upserted = 0;
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { id: genre.id },
      create: { id: genre.id, name: genre.name },
      update: { name: genre.name },
    });
    upserted++;
  }

  console.log(`[seed] Upserted ${upserted} movie genres`);
  return upserted;
}

/**
 * Fetch and store all TV genres from TMDB.
 * Uses the TMDB /genre/tv/list endpoint.
 * Upserts by genre id so the operation is idempotent.
 */
async function seedTvGenres(): Promise<number> {
  console.log('[seed] Fetching TV genres from TMDB...');

  const response = await tmdb.getTvGenres();
  const genres: TmdbGenre[] = response.genres;

  console.log(`[seed] Received ${genres.length} TV genres`);

  let upserted = 0;
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { id: genre.id },
      create: { id: genre.id, name: genre.name },
      update: { name: genre.name },
    });
    upserted++;
  }

  console.log(`[seed] Upserted ${upserted} TV genres`);
  return upserted;
}

// ============================================================
// Watch Provider Seeding
// ============================================================

/**
 * Fetch and store all watch providers from TMDB.
 * Uses the TMDB /watch/providers/movie endpoint.
 * Upserts by providerId so the operation is idempotent.
 */
async function seedWatchProviders(): Promise<number> {
  console.log('[seed] Fetching watch providers from TMDB...');

  const response = await tmdb.getAllWatchProviders();
  const providers: TmdbWatchProviderListItem[] = response.results;

  console.log(`[seed] Received ${providers.length} watch providers`);

  let upserted = 0;
  for (const provider of providers) {
    await prisma.watchProvider.upsert({
      where: { providerId: provider.provider_id },
      create: {
        providerId: provider.provider_id,
        providerName: provider.provider_name,
        logoPath: provider.logo_path,
        displayPriority: provider.display_priority,
      },
      update: {
        providerName: provider.provider_name,
        logoPath: provider.logo_path,
        displayPriority: provider.display_priority,
      },
    });
    upserted++;
  }

  console.log(`[seed] Upserted ${upserted} watch providers`);
  return upserted;
}

// ============================================================
// Main Seed Function
// ============================================================

/**
 * Seed all reference data: genres (movie + TV) and watch providers.
 * This function is idempotent — safe to run multiple times.
 * Returns a summary of seeded counts.
 */
export async function seedReferenceData(): Promise<{
  movieGenres: number;
  tvGenres: number;
  watchProviders: number;
}> {
  console.log('[seed] Starting reference data seeding...');

  try {
    const [movieGenres, tvGenres, watchProviders] = await Promise.all([
      seedMovieGenres(),
      seedTvGenres(),
      seedWatchProviders(),
    ]);

    console.log('[seed] Reference data seeding complete:');
    console.log(`  - Movie genres: ${movieGenres}`);
    console.log(`  - TV genres:    ${tvGenres}`);
    console.log(`  - Providers:    ${watchProviders}`);

    return { movieGenres, tvGenres, watchProviders };
  } catch (error) {
    console.error('[seed] Reference data seeding failed:', error);
    throw error;
  }
}

export default seedReferenceData;
