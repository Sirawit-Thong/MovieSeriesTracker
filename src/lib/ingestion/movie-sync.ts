// Movie Sync Service
// Fetches popular + top-rated movies from TMDB and stores them in the database.
// Uses transaction batching for performance and per-item error handling.

import { TmdbClient } from '../tmdb/client';
import prisma from '../db';
import type { TmdbMovie } from '../tmdb/types';
import type { SyncProgress, SyncResult, SyncError, SyncOptions } from './types';
import { DEFAULT_SYNC_OPTIONS } from './types';

const LOG_PREFIX = '[movie-sync]';
const BATCH_SIZE = 15;

// ============================================================
// Helper: Build the nested upsert data for a single movie
// ============================================================

function buildMovieCreateData(tmdbMovie: TmdbMovie) {
  return {
    // Scalar fields
    adult: tmdbMovie.adult,
    backdropPath: tmdbMovie.backdrop_path,
    budget: tmdbMovie.budget,
    homepage: tmdbMovie.homepage,
    imdbId: tmdbMovie.imdb_id,
    originalLanguage: tmdbMovie.original_language,
    originalTitle: tmdbMovie.original_title,
    overview: tmdbMovie.overview,
    popularity: tmdbMovie.popularity,
    posterPath: tmdbMovie.poster_path,
    releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
    revenue: tmdbMovie.revenue,
    runtime: tmdbMovie.runtime,
    status: tmdbMovie.status,
    tagline: tmdbMovie.tagline,
    title: tmdbMovie.title,
    video: tmdbMovie.video,
    voteAverage: tmdbMovie.vote_average,
    voteCount: tmdbMovie.vote_count,
  };
}

// ============================================================
// Helper: Upsert reference entities (genres, companies, etc.)
// Ensures the parent rows exist before creating junction rows.
// ============================================================

async function ensureGenresExist(genres: TmdbMovie['genres']) {
  await Promise.all(
    genres.map((genre) =>
      prisma.genre.upsert({
        where: { id: genre.id },
        create: { id: genre.id, name: genre.name },
        update: { name: genre.name },
      }),
    ),
  );
}

async function ensureProductionCompaniesExist(companies: TmdbMovie['production_companies']) {
  await Promise.all(
    companies.map((company) =>
      prisma.productionCompany.upsert({
        where: { id: company.id },
        create: {
          id: company.id,
          logoPath: company.logo_path ?? '',
          name: company.name,
          originCountry: company.origin_country,
        },
        update: {
          logoPath: company.logo_path ?? '',
          name: company.name,
          originCountry: company.origin_country,
        },
      }),
    ),
  );
}

async function ensureProductionCountriesExist(countries: TmdbMovie['production_countries']) {
  await Promise.all(
    countries.map((country) =>
      prisma.productionCountry.upsert({
        where: { iso31661: country.iso_3166_1 },
        create: { iso31661: country.iso_3166_1, name: country.name },
        update: { name: country.name },
      }),
    ),
  );
}

async function ensureSpokenLanguagesExist(languages: TmdbMovie['spoken_languages']) {
  await Promise.all(
    languages.map((lang) =>
      prisma.spokenLanguage.upsert({
        where: { englishName: lang.english_name },
        create: {
          englishName: lang.english_name,
          iso6391: lang.iso_639_1,
          name: lang.name,
        },
        update: { iso6391: lang.iso_639_1, name: lang.name },
      }),
    ),
  );
}

async function ensureCollectionExists(collection: TmdbMovie['belongs_to_collection']) {
  if (!collection) return null;

  await prisma.collection.upsert({
    where: { id: collection.id },
    create: {
      id: collection.id,
      name: collection.name,
      posterPath: collection.poster_path,
      backdropPath: collection.backdrop_path,
    },
    update: {
      name: collection.name,
      posterPath: collection.poster_path,
      backdropPath: collection.backdrop_path,
    },
  });

  return collection.id;
}

// ============================================================
// Core: Sub-Resource Storage for a single movie
// ============================================================

/**
 * Helper: Extract fulfilled value from a settled promise, or null.
 */
function getValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null;
}

/**
 * Fetch all movie sub-resources in parallel and store them.
 * Each sub-resource is stored independently — one failure doesn't block others.
 */
async function syncMovieSubResources(tmdbMovie: TmdbMovie, client: TmdbClient): Promise<void> {
  // Fetch all sub-resources in parallel
  const [
    altTitlesResult,
    contentRatingsResult,
    imagesResult,
    videosResult,
    externalIdsResult,
    releaseDatesResult,
    recommendationsResult,
    watchProvidersResult,
    translationsResult,
    similarResult,
  ] = await Promise.allSettled([
    client.getMovieAlternativeTitles(tmdbMovie.id),
    client.getMovieContentRatings(tmdbMovie.id),
    client.getMovieImages(tmdbMovie.id),
    client.getMovieVideos(tmdbMovie.id),
    client.getMovieExternalIds(tmdbMovie.id),
    client.getMovieReleaseDates(tmdbMovie.id),
    client.getMovieRecommendations(tmdbMovie.id),
    client.getMovieWatchProviders(tmdbMovie.id),
    client.getMovieTranslations(tmdbMovie.id),
    client.getMovieSimilar(tmdbMovie.id),
  ]);

  // Find the movie's internal DB id
  const movie = await prisma.movie.findUnique({ where: { tmdbId: tmdbMovie.id } });
  if (!movie) return;

  // Sync credits (cast/crew) — separate from the main transaction
  const { syncMediaCredits } = await import('./media-credit-sync');
  await syncMediaCredits('movie', movie.id, tmdbMovie.id, client);

  // Store all sub-resources in a single transaction
  await prisma.$transaction(async (tx) => {
    // --- Alternative Titles ---
    const altTitles = getValue(altTitlesResult);
    if (altTitles?.titles) {
      await tx.movieAlternativeTitle.deleteMany({ where: { movieId: movie.id } });
      if (altTitles.titles.length > 0) {
        // Deduplicate by countryCode — keep first occurrence
        const seen = new Set<string>();
        const unique = altTitles.titles.filter((t) => {
          if (!t.iso_3166_1 || seen.has(t.iso_3166_1)) return false;
          seen.add(t.iso_3166_1);
          return true;
        });
        await tx.movieAlternativeTitle.createMany({
          data: unique.map((t) => ({
            movieId: movie.id,
            countryCode: t.iso_3166_1,
            title: t.title,
            type: t.type || null,
          })),
        });
      }
    }

    // --- Content Ratings (from content_ratings endpoint) ---
    const contentRatings = getValue(contentRatingsResult);
    if (contentRatings?.results) {
      await tx.movieContentRating.deleteMany({ where: { movieId: movie.id } });
      const ratingData = contentRatings.results
        .filter((r) => r.rating?.trim())
        .map((r) => ({
          movieId: movie.id,
          countryCode: r.iso_3166_1,
          rating: r.rating,
        }));
      // Deduplicate by countryCode
      const seenRatings = new Set<string>();
      const uniqueRatings = ratingData.filter((r) => {
        if (seenRatings.has(r.countryCode)) return false;
        seenRatings.add(r.countryCode);
        return true;
      });
      if (uniqueRatings.length > 0) {
        await tx.movieContentRating.createMany({ data: uniqueRatings });
      }
    }

    // --- Images (backdrops + posters, up to 20 each) ---
    const images = getValue(imagesResult);
    if (images) {
      await tx.mediaImage.deleteMany({ where: { entityType: 'movie', entityId: movie.id } });
      const imageData = [
        ...(images.backdrops || []).slice(0, 20).map((img) => ({
          entityType: 'movie' as const,
          entityId: movie.id,
          filePath: img.file_path,
          aspectRatio: img.aspect_ratio,
          height: img.height,
          width: img.width,
          language: img.iso_639_1,
          voteAverage: img.vote_average,
          voteCount: img.vote_count,
          imageType: 'backdrop' as const,
          fileType: null as string | null,
        })),
        ...(images.posters || []).slice(0, 20).map((img) => ({
          entityType: 'movie' as const,
          entityId: movie.id,
          filePath: img.file_path,
          aspectRatio: img.aspect_ratio,
          height: img.height,
          width: img.width,
          language: img.iso_639_1,
          voteAverage: img.vote_average,
          voteCount: img.vote_count,
          imageType: 'poster' as const,
          fileType: null as string | null,
        })),
      ];
      if (imageData.length > 0) {
        await tx.mediaImage.createMany({ data: imageData });
      }
    }

    // --- Videos (up to 20) ---
    const videos = getValue(videosResult);
    if (videos?.results) {
      await tx.mediaVideo.deleteMany({ where: { entityType: 'movie', entityId: movie.id } });
      const videoData = videos.results.slice(0, 20).map((v) => ({
        entityType: 'movie' as const,
        entityId: movie.id,
        key: v.key,
        name: v.name,
        site: v.site,
        type: v.type || null,
        language: v.iso_639_1,
        publishedAt: v.published_at ? new Date(v.published_at) : null,
        official: v.official ?? false,
      }));
      if (videoData.length > 0) {
        await tx.mediaVideo.createMany({ data: videoData });
      }
    }

    // --- External IDs ---
    const externalIds = getValue(externalIdsResult);
    if (externalIds) {
      await tx.externalId.upsert({
        where: { entityType_entityId: { entityType: 'movie', entityId: movie.id } },
        create: {
          entityType: 'movie',
          entityId: movie.id,
          imdbId: externalIds.imdb_id,
          tvdbId: externalIds.tvdb_id,
          freebaseId: externalIds.freebase_id,
          freebaseMid: externalIds.freebase_mid,
          wikidataId: externalIds.wikidata_id,
          facebookId: externalIds.facebook_id,
          instagramId: externalIds.instagram_id,
          twitterId: externalIds.twitter_id,
          tvrageId: externalIds.tvrage_id,
          tiktokId: externalIds.tiktok_id,
          youtubeId: externalIds.youtube_id,
        },
        update: {
          imdbId: externalIds.imdb_id,
          tvdbId: externalIds.tvdb_id,
          freebaseId: externalIds.freebase_id,
          freebaseMid: externalIds.freebase_mid,
          wikidataId: externalIds.wikidata_id,
          facebookId: externalIds.facebook_id,
          instagramId: externalIds.instagram_id,
          twitterId: externalIds.twitter_id,
          tvrageId: externalIds.tvrage_id,
          tiktokId: externalIds.tiktok_id,
          youtubeId: externalIds.youtube_id,
        },
      });
    }

    // --- Release Dates ---
    const releaseDates = getValue(releaseDatesResult);
    if (releaseDates?.results) {
      await tx.movieReleaseDate.deleteMany({ where: { movieId: movie.id } });
      const rdData = releaseDates.results.flatMap((country) =>
        country.release_dates.map((rd) => ({
          movieId: movie.id,
          countryCode: country.iso_3166_1,
          certification: rd.certification || null,
          releaseDate: rd.release_date,
          type: rd.type,
          descriptors: rd.note || null,
        })),
      );
      if (rdData.length > 0) {
        await tx.movieReleaseDate.createMany({ data: rdData });
      }
    }

    // --- Recommendations ---
    const recommendations = getValue(recommendationsResult);
    if (recommendations?.results) {
      await tx.recommendation.deleteMany({ where: { sourceType: 'movie', sourceId: movie.id } });
      const recData = recommendations.results.slice(0, 20).map((rec, idx) => ({
        sourceType: 'movie' as const,
        sourceId: movie.id,
        targetType: (rec.original_title ? 'movie' : 'tv') as string,
        targetId: rec.id,
        position: idx,
      }));
      if (recData.length > 0) {
        await tx.recommendation.createMany({ data: recData });
      }
    }

    // --- Watch Providers ---
    const watchProviders = getValue(watchProvidersResult);
    if (watchProviders?.results) {
      const region = watchProviders.results['US'] || Object.values(watchProviders.results)[0];
      if (region) {
        await tx.movieWatchProvider.deleteMany({ where: { movieId: movie.id } });
        const providerTypes = ['flatrate', 'rent', 'buy', 'ads', 'free'] as const;
        const wpData: Array<{ movieId: number; providerId: number; providerType: string }> = [];

        for (const providerType of providerTypes) {
          const providers = region[providerType] || [];
          for (const p of providers) {
            await tx.watchProvider.upsert({
              where: { providerId: p.provider_id },
              create: {
                providerId: p.provider_id,
                providerName: p.provider_name,
                logoPath: p.logo_path,
                displayPriority: p.display_priority,
              },
              update: {
                providerName: p.provider_name,
                logoPath: p.logo_path,
                displayPriority: p.display_priority,
              },
            });
            wpData.push({
              movieId: movie.id,
              providerId: p.provider_id,
              providerType,
            });
          }
        }
        // Deduplicate by providerId — keep first occurrence
        const seenProviders = new Set<number>();
        const uniqueWp = wpData.filter((d) => {
          if (seenProviders.has(d.providerId)) return false;
          seenProviders.add(d.providerId);
          return true;
        });
        if (uniqueWp.length > 0) {
          await tx.movieWatchProvider.createMany({ data: uniqueWp });
        }
      }
    }

    // --- Translations ---
    const translations = getValue(translationsResult);
    if (translations?.translations) {
      await tx.translation.deleteMany({ where: { entityType: 'movie', entityId: movie.id } });
      const trData = translations.translations.map((t) => ({
        entityType: 'movie' as const,
        entityId: movie.id,
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

    // --- Similar Movies (stored as recommendations with source 'movie_similar') ---
    const similar = getValue(similarResult);
    if (similar?.results) {
      await tx.recommendation.deleteMany({
        where: { sourceType: 'movie_similar', sourceId: movie.id },
      });
      const simData = similar.results.slice(0, 20).map((rec, idx) => ({
        sourceType: 'movie_similar' as const,
        sourceId: movie.id,
        targetType: 'movie' as string,
        targetId: rec.id,
        position: idx,
      }));
      if (simData.length > 0) {
        await tx.recommendation.createMany({ data: simData });
      }
    }
  });
}

// ============================================================
// Core: Upsert a single movie (with all nested data)
// ============================================================

async function upsertMovie(tmdbMovie: TmdbMovie, client: TmdbClient): Promise<void> {
  // Ensure all parent reference rows exist first
  await Promise.all([
    ensureGenresExist(tmdbMovie.genres),
    ensureProductionCompaniesExist(tmdbMovie.production_companies),
    ensureProductionCountriesExist(tmdbMovie.production_countries),
    ensureSpokenLanguagesExist(tmdbMovie.spoken_languages),
  ]);

  const collectionId = await ensureCollectionExists(tmdbMovie.belongs_to_collection);

  // Use a transaction to upsert the movie + rebuild all junction tables
  await prisma.$transaction(async (tx) => {
    // Upsert the movie record itself
    const movie = await tx.movie.upsert({
      where: { tmdbId: tmdbMovie.id },
      create: {
        tmdbId: tmdbMovie.id,
        ...buildMovieCreateData(tmdbMovie),
        collectionId,
        lastFetchedAt: new Date(),
      },
      update: {
        ...buildMovieCreateData(tmdbMovie),
        collectionId,
        lastFetchedAt: new Date(),
      },
    });

    // Delete existing junction rows so we can rebuild cleanly
    await Promise.all([
      tx.movieGenre.deleteMany({ where: { movieId: movie.id } }),
      tx.movieProductionCompany.deleteMany({ where: { movieId: movie.id } }),
      tx.movieProductionCountry.deleteMany({ where: { movieId: movie.id } }),
      tx.movieSpokenLanguage.deleteMany({ where: { movieId: movie.id } }),
    ]);

    // Re-create junction rows
    if (tmdbMovie.genres.length > 0) {
      await tx.movieGenre.createMany({
        data: tmdbMovie.genres.map((g) => ({
          movieId: movie.id,
          genreId: g.id,
        })),
      });
    }

    if (tmdbMovie.production_companies.length > 0) {
      await tx.movieProductionCompany.createMany({
        data: tmdbMovie.production_companies.map((c) => ({
          movieId: movie.id,
          companyId: c.id,
        })),
      });
    }

    if (tmdbMovie.production_countries.length > 0) {
      await tx.movieProductionCountry.createMany({
        data: tmdbMovie.production_countries.map((c) => ({
          movieId: movie.id,
          iso31661: c.iso_3166_1,
        })),
      });
    }

    if (tmdbMovie.spoken_languages.length > 0) {
      await tx.movieSpokenLanguage.createMany({
        data: tmdbMovie.spoken_languages.map((l) => ({
          movieId: movie.id,
          englishName: l.english_name,
        })),
      });
    }
  });

  // --- Sub-Resource Fetching (parallel, per-sub-resource error handling) ---
  await syncMovieSubResources(tmdbMovie, client);
}

// ============================================================
// Fetch: Collect unique movie IDs from paginated lists
// ============================================================

async function fetchMovieIds(
  client: TmdbClient,
  listType: 'popular' | 'top_rated',
  pages: number,
  shouldStop?: () => Promise<boolean>,
): Promise<number[]> {
  const ids: number[] = [];
  const fetcher =
    listType === 'popular'
      ? (p: number) => client.getPopularMovies(p)
      : (p: number) => client.getTopRatedMovies(p);

  for (let page = 1; page <= pages; page++) {
    if (shouldStop && (await shouldStop())) break;
    const response = await fetcher(page);
    for (const movie of response.results) {
      ids.push(movie.id);
    }
  }

  return ids;
}

// ============================================================
// Sync: Process a batch of movie IDs with detail fetch + upsert
// ============================================================

async function syncBatch(
  movieIds: number[],
  client: TmdbClient,
  onProgress: (processed: number) => void,
  errors: SyncError[],
  shouldStop?: () => Promise<boolean>,
): Promise<{ processed: number; stopped: boolean }> {
  // Process in sub-batches to avoid overwhelming the API
  const subBatches = chunk(movieIds, BATCH_SIZE);
  let processed = 0;

  for (const subBatch of subBatches) {
    if (shouldStop && (await shouldStop())) {
      return { processed, stopped: true };
    }

    // Fetch full details in parallel within a sub-batch
    const details = await Promise.allSettled(subBatch.map((id) => client.getMovieDetails(id)));

    // Collect successfully fetched movies
    const validMovies: TmdbMovie[] = [];
    for (let i = 0; i < details.length; i++) {
      const result = details[i];
      if (result.status === 'fulfilled') {
        validMovies.push(result.value);
      } else {
        errors.push({
          tmdbId: subBatch[i],
          entity: 'movie',
          message: result.reason instanceof Error ? result.reason.message : String(result.reason),
          timestamp: new Date(),
        });
      }
    }

    // Upsert each successfully fetched movie
    for (const movie of validMovies) {
      try {
        await upsertMovie(movie, client);
      } catch (err) {
        errors.push({
          tmdbId: movie.id,
          entity: 'movie',
          message: err instanceof Error ? err.message : String(err),
          timestamp: new Date(),
        });
      }
    }

    processed += subBatch.length;
    onProgress(processed);
  }

  return { processed, stopped: false };
}

// ============================================================
// Utility: Split array into chunks
// ============================================================

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ============================================================
// Public API: Full Movie Sync
// ============================================================

export async function syncMovies(options: Partial<SyncOptions> = {}): Promise<SyncResult> {
  const opts: SyncOptions = { ...DEFAULT_SYNC_OPTIONS, ...options };
  const client = new TmdbClient({ language: opts.language });
  const errors: SyncError[] = [];
  const startTime = Date.now();

  console.log(`${LOG_PREFIX} Starting movie sync (fullSync=${opts.fullSync})`);

  // ---- Phase 1: Collect unique movie IDs from popular + top-rated ----
  console.log(`${LOG_PREFIX} Fetching popular movies (pages 1-5)...`);
  const popularIds = await fetchMovieIds(client, 'popular', 5, opts.shouldStop);

  console.log(`${LOG_PREFIX} Fetching top-rated movies (pages 1-5)...`);
  const topRatedIds = await fetchMovieIds(client, 'top_rated', 5, opts.shouldStop);

  // Deduplicate
  const allIds = [...new Set([...popularIds, ...topRatedIds])];
  console.log(
    `${LOG_PREFIX} Collected ${allIds.length} unique movie IDs (popular=${popularIds.length}, topRated=${topRatedIds.length})`,
  );

  // Apply limit if set
  const movieIds = opts.limit > 0 ? allIds.slice(0, opts.limit) : allIds;
  const total = movieIds.length;

  console.log(`${LOG_PREFIX} Will process ${total} movies`);

  // ---- Phase 2: Fetch details + upsert in batches ----
  const progress: SyncProgress = {
    current: 0,
    total,
    entity: 'movie',
    status: 'running',
  };

  const onProgress = (processed: number) => {
    progress.current = processed;
    console.log(
      `${LOG_PREFIX} Progress: ${progress.current}/${progress.total} movies (${Math.round((progress.current / progress.total) * 100)}%)`,
    );
  };

  try {
    const result = await syncBatch(movieIds, client, onProgress, errors, opts.shouldStop);
    progress.status = result.stopped ? 'cancelled' : 'completed';
  } catch (err) {
    progress.status = 'failed';
    console.error(`${LOG_PREFIX} Sync failed:`, err);
  }

  const duration = Date.now() - startTime;
  const cancelled = progress.status === 'cancelled';
  const success = !cancelled && errors.length === 0 && progress.status === 'completed';

  console.log(
    `${LOG_PREFIX} Sync ${cancelled ? 'cancelled' : 'complete'}: ${progress.current}/${movieIds.length} movies in ${duration}ms (${errors.length} errors)`,
  );

  return { success, cancelled, errors, duration, moviesProcessed: progress.current };
}

// ============================================================
// Public API: Incremental Sync
// ============================================================

export async function syncMoviesIncremental(): Promise<SyncResult> {
  return syncMovies({ fullSync: false });
}

// ============================================================
// Public API: On-Demand Fetch (single movie by TMDB ID)
// ============================================================

/**
 * Fetch a single movie from TMDB and upsert it with all nested data.
 * Used for on-demand fetch when a user clicks on a movie not yet in the DB.
 * Returns the upserted movie's internal DB ID, or null on failure.
 */
export async function fetchAndUpsertMovie(tmdbId: number): Promise<number | null> {
  const client = new TmdbClient({ language: 'en-US' });

  try {
    // Fetch full details from TMDB (same as batch sync)
    const tmdbMovie = await client.getMovieDetails(tmdbId, 'keywords,external_ids');
    if (!tmdbMovie) return null;

    // Upsert movie + sub-resources (reuse existing functions)
    await upsertMovie(tmdbMovie, client);

    // Return the internal DB ID
    const movie = await prisma.movie.findUnique({ where: { tmdbId } });
    return movie?.id ?? null;
  } catch (error) {
    console.error(`${LOG_PREFIX} On-demand fetch failed for movie ${tmdbId}:`, error);
    return null;
  }
}
