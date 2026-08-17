// TV Series Sync Service
// Fetches popular + top-rated TV series from TMDB and stores with full nested data

import { TmdbClient } from '../tmdb/client';
import prisma from '../db';
import type {
  TmdbTvSeries,
  TmdbTvCreatedBy,
  TmdbTvNetwork,
  TmdbGenre,
  TmdbProductionCompany,
  TmdbProductionCountry,
  TmdbSpokenLanguage,
} from '../tmdb/types';
import type { SyncProgress, SyncResult, SyncError, SyncOptions } from './types';
import { DEFAULT_SYNC_OPTIONS } from './types';

// ============================================================
// Constants
// ============================================================

const LOG_PREFIX = '[tv-sync]';
const BATCH_SIZE = 10;
const DETAIL_BATCH_SIZE = 5;

// ============================================================
// Local Types
// ============================================================

/** Season detail response with episodes (extends base season type) */
interface TmdbTvSeasonDetail {
  _id: string;
  air_date: string | null;
  episodes: TmdbTvEpisodeDetail[];
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
  id: number;
}

/** Episode detail from season endpoint */
interface TmdbTvEpisodeDetail {
  air_date: string | null;
  episode_number: number;
  episode_type: string | null;
  id: number;
  name: string;
  overview: string;
  production_code: string | null;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

// ============================================================
// Helper: Chunk Array
// ============================================================

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ============================================================
// Reference Entity Upserters
// ============================================================

/** Ensure all genres exist in the database */
async function ensureGenresExist(
  genres: TmdbGenre[],
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<void> {
  if (genres.length === 0) return;

  await Promise.all(
    genres.map((genre) =>
      tx.genre.upsert({
        where: { id: genre.id },
        update: { name: genre.name },
        create: { id: genre.id, name: genre.name },
      })
    )
  );
}

/** Ensure all networks exist in the database */
async function ensureNetworksExist(
  networks: TmdbTvNetwork[],
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<void> {
  if (networks.length === 0) return;

  await Promise.all(
    networks.map((network) =>
      tx.tvNetwork.upsert({
        where: { id: network.id },
        update: {
          name: network.name,
          logoPath: network.logo_path,
          originCountry: network.origin_country,
        },
        create: {
          id: network.id,
          name: network.name,
          logoPath: network.logo_path,
          originCountry: network.origin_country,
        },
      })
    )
  );
}

/** Ensure all production companies exist in the database */
async function ensureProductionCompaniesExist(
  companies: TmdbProductionCompany[],
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<void> {
  if (companies.length === 0) return;

  await Promise.all(
    companies.map((company) =>
      tx.productionCompany.upsert({
        where: { id: company.id },
        update: {
          name: company.name,
          logoPath: company.logo_path ?? '',
          originCountry: company.origin_country,
        },
        create: {
          id: company.id,
          name: company.name,
          logoPath: company.logo_path ?? '',
          originCountry: company.origin_country,
        },
      })
    )
  );
}

/** Ensure all production countries exist in the database */
async function ensureProductionCountriesExist(
  countries: TmdbProductionCountry[],
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<void> {
  if (countries.length === 0) return;

  await Promise.all(
    countries.map((country) =>
      tx.productionCountry.upsert({
        where: { iso31661: country.iso_3166_1 },
        update: { name: country.name },
        create: {
          iso31661: country.iso_3166_1,
          name: country.name,
        },
      })
    )
  );
}

/** Ensure all spoken languages exist in the database */
async function ensureSpokenLanguagesExist(
  languages: TmdbSpokenLanguage[],
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<void> {
  if (languages.length === 0) return;

  await Promise.all(
    languages.map((lang) =>
      tx.spokenLanguage.upsert({
        where: { englishName: lang.english_name },
        update: { iso6391: lang.iso_639_1, name: lang.name },
        create: {
          englishName: lang.english_name,
          iso6391: lang.iso_639_1,
          name: lang.name,
        },
      })
    )
  );
}

// ============================================================
// Series Data Builder
// ============================================================

/** Extract scalar fields for TvSeries upsert */
function buildSeriesScalarData(tmdbSeries: TmdbTvSeries) {
  return {
    adult: tmdbSeries.adult,
    backdropPath: tmdbSeries.backdrop_path,
    firstAirDate: tmdbSeries.first_air_date,
    homepage: tmdbSeries.homepage,
    inProduction: tmdbSeries.in_production,
    languages: tmdbSeries.languages?.join(',') || null,
    lastAirDate: tmdbSeries.last_air_date,
    name: tmdbSeries.name,
    numberOfEpisodes: tmdbSeries.number_of_episodes,
    numberOfSeasons: tmdbSeries.number_of_seasons,
    originCountry: tmdbSeries.origin_country?.join(',') || null,
    originalLanguage: tmdbSeries.original_language,
    originalName: tmdbSeries.original_name,
    overview: tmdbSeries.overview,
    popularity: tmdbSeries.popularity,
    posterPath: tmdbSeries.poster_path,
    status: tmdbSeries.status,
    tagline: tmdbSeries.tagline,
    type: tmdbSeries.type,
    voteAverage: tmdbSeries.vote_average,
    voteCount: tmdbSeries.vote_count,
  };
}

/** Extract scalar fields for TvEpisode upsert */
function buildEpisodeScalarData(episode: TmdbTvEpisodeDetail) {
  return {
    airDate: episode.air_date,
    episodeNumber: episode.episode_number,
    episodeType: episode.episode_type,
    name: episode.name,
    overview: episode.overview,
    productionCode: episode.production_code,
    runtime: episode.runtime,
    seasonNumber: episode.season_number,
    showId: episode.show_id,
    stillPath: episode.still_path,
    voteAverage: episode.vote_average,
    voteCount: episode.vote_count,
  };
}

// ============================================================
// Core Upsert Function
// ============================================================

/** Upsert a TV series with all nested data in a transaction */
async function upsertTvSeriesWithNestedData(
  tmdbSeries: TmdbTvSeries,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<void> {
  // 1. Ensure all reference entities exist
  await Promise.all([
    ensureGenresExist(tmdbSeries.genres || [], tx),
    ensureNetworksExist(tmdbSeries.networks || [], tx),
    ensureProductionCompaniesExist(tmdbSeries.production_companies || [], tx),
    ensureProductionCountriesExist(tmdbSeries.production_countries || [], tx),
    ensureSpokenLanguagesExist(tmdbSeries.spoken_languages || [], tx),
  ]);

  // 2. Upsert the series record (without episode FKs for now)
  const seriesData = buildSeriesScalarData(tmdbSeries);
  const series = await tx.tvSeries.upsert({
    where: { tmdbId: tmdbSeries.id },
    create: { tmdbId: tmdbSeries.id, ...seriesData, lastFetchedAt: new Date() },
    update: { ...seriesData, lastFetchedAt: new Date() },
  });

  // 3. Rebuild junction tables (delete all, then create)
  await Promise.all([
    tx.tvSeriesGenre.deleteMany({ where: { tvSeriesId: series.id } }),
    tx.tvSeriesNetwork.deleteMany({ where: { tvSeriesId: series.id } }),
    tx.tvSeriesProductionCompany.deleteMany({ where: { tvSeriesId: series.id } }),
    tx.tvSeriesProductionCountry.deleteMany({ where: { tvSeriesId: series.id } }),
    tx.tvSeriesSpokenLanguage.deleteMany({ where: { tvSeriesId: series.id } }),
  ]);

  // 4. Create junction table rows
  const genreIds = (tmdbSeries.genres || []).map((g) => g.id);
  const networkIds = (tmdbSeries.networks || []).map((n) => n.id);
  const companyIds = (tmdbSeries.production_companies || []).map((c) => c.id);
  const countryCodes = (tmdbSeries.production_countries || []).map((c) => c.iso_3166_1);
  const languageEnglishNames = (tmdbSeries.spoken_languages || []).map((l) => l.english_name);

  await Promise.all([
    genreIds.length > 0
      ? tx.tvSeriesGenre.createMany({
          data: genreIds.map((genreId) => ({
            tvSeriesId: series.id,
            genreId,
          })),
        })
      : Promise.resolve(),
    networkIds.length > 0
      ? tx.tvSeriesNetwork.createMany({
          data: networkIds.map((networkId) => ({
            tvSeriesId: series.id,
            networkId,
          })),
        })
      : Promise.resolve(),
    companyIds.length > 0
      ? tx.tvSeriesProductionCompany.createMany({
          data: companyIds.map((companyId) => ({
            tvSeriesId: series.id,
            companyId,
          })),
        })
      : Promise.resolve(),
    countryCodes.length > 0
      ? tx.tvSeriesProductionCountry.createMany({
          data: countryCodes.map((countryCode) => ({
            tvSeriesId: series.id,
            iso31661: countryCode,
          })),
        })
      : Promise.resolve(),
    languageEnglishNames.length > 0
      ? tx.tvSeriesSpokenLanguage.createMany({
          data: languageEnglishNames.map((englishName) => ({
            tvSeriesId: series.id,
            englishName,
          })),
        })
      : Promise.resolve(),
  ]);

  // 5. Upsert createdBy records (delete old, create new)
  await tx.tvCreatedBy.deleteMany({ where: { tvSeriesId: series.id } });
  if ((tmdbSeries.created_by || []).length > 0) {
    await tx.tvCreatedBy.createMany({
      data: (tmdbSeries.created_by || []).map((cb: TmdbTvCreatedBy) => ({
        tmdbId: cb.id,
        creditId: cb.credit_id,
        name: cb.name,
        gender: cb.gender,
        profilePath: cb.profile_path,
        tvSeriesId: series.id,
      })),
    });
  }

  // 6. Upsert seasons (metadata from series detail)
  for (const season of tmdbSeries.seasons || []) {
    await tx.tvSeason.upsert({
      where: { tmdbId: season.id },
      create: {
        tmdbId: season.id,
        airDate: season.air_date,
        episodeCount: season.episode_count,
        name: season.name,
        overview: season.overview,
        posterPath: season.poster_path,
        seasonNumber: season.season_number,
        voteAverage: season.vote_average,
        tvSeriesId: series.id,
      },
      update: {
        airDate: season.air_date,
        episodeCount: season.episode_count,
        name: season.name,
        overview: season.overview,
        posterPath: season.poster_path,
        seasonNumber: season.season_number,
        voteAverage: season.vote_average,
        tvSeriesId: series.id,
      },
    });
  }

  // 7. Handle last_episode_to_air
  if (tmdbSeries.last_episode_to_air) {
    const ep = tmdbSeries.last_episode_to_air;
    const season = await tx.tvSeason.findFirst({
      where: { tvSeriesId: series.id, seasonNumber: ep.season_number },
    });

    if (season) {
      const episode = await tx.tvEpisode.upsert({
        where: { tmdbId: ep.id },
        create: {
          tmdbId: ep.id,
          ...buildEpisodeScalarData(ep as TmdbTvEpisodeDetail),
          tvSeasonId: season.id,
        },
        update: {
          ...buildEpisodeScalarData(ep as TmdbTvEpisodeDetail),
          tvSeasonId: season.id,
        },
      });

      await tx.tvSeries.update({
        where: { id: series.id },
        data: { lastEpisodeToAirId: episode.id },
      });
    }
  }

  // 8. Handle next_episode_to_air
  if (tmdbSeries.next_episode_to_air) {
    const ep = tmdbSeries.next_episode_to_air;
    const season = await tx.tvSeason.findFirst({
      where: { tvSeriesId: series.id, seasonNumber: ep.season_number },
    });

    if (season) {
      const episode = await tx.tvEpisode.upsert({
        where: { tmdbId: ep.id },
        create: {
          tmdbId: ep.id,
          ...buildEpisodeScalarData(ep as TmdbTvEpisodeDetail),
          tvSeasonId: season.id,
        },
        update: {
          ...buildEpisodeScalarData(ep as TmdbTvEpisodeDetail),
          tvSeasonId: season.id,
        },
      });

      await tx.tvSeries.update({
        where: { id: series.id },
        data: { nextEpisodeToAirId: episode.id },
      });
    }
  }
}

// ============================================================
// Sub-Resource Storage for a single TV series
// ============================================================

/**
 * Helper: Extract fulfilled value from a settled promise, or null.
 */
function getValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null;
}

/**
 * Fetch all TV sub-resources in parallel and store them.
 * Each sub-resource is stored independently — one failure doesn't block others.
 */
async function syncTvSubResources(
  tmdbSeries: TmdbTvSeries,
  client: TmdbClient,
): Promise<void> {
  // Fetch all sub-resources in parallel
  const [
    contentRatingsResult,
    altTitlesResult,
    externalIdsResult,
    imagesResult,
    videosResult,
    recommendationsResult,
    watchProvidersResult,
    translationsResult,
  ] = await Promise.allSettled([
    client.getTvContentRatings(tmdbSeries.id),
    client.getTvAlternativeTitles(tmdbSeries.id),
    client.getTvExternalIds(tmdbSeries.id),
    client.getTvImages(tmdbSeries.id),
    client.getTvVideos(tmdbSeries.id),
    client.getTvRecommendations(tmdbSeries.id),
    client.getTvWatchProviders(tmdbSeries.id),
    client.getTvTranslations(tmdbSeries.id),
  ]);

  // Find the series' internal DB id
  const series = await prisma.tvSeries.findUnique({ where: { tmdbId: tmdbSeries.id } });
  if (!series) return;

  // Store all sub-resources in a single transaction
  await prisma.$transaction(async (tx) => {
    // --- Content Ratings ---
    const contentRatings = getValue(contentRatingsResult);
    if (contentRatings?.results) {
      await tx.tvContentRating.deleteMany({ where: { tvSeriesId: series.id } });
      const ratingData = contentRatings.results
        .filter((r) => r.rating?.trim())
        .map((r) => ({
          tvSeriesId: series.id,
          countryCode: r.iso_3166_1,
          rating: r.rating,
        }));
      const seenTvRatings = new Set<string>();
      const uniqueTvRatings = ratingData.filter((r) => {
        if (seenTvRatings.has(r.countryCode)) return false;
        seenTvRatings.add(r.countryCode);
        return true;
      });
      if (uniqueTvRatings.length > 0) {
        await tx.tvContentRating.createMany({ data: uniqueTvRatings });
      }
    }

    // --- Alternative Titles ---
    const altTitles = getValue(altTitlesResult);
    if (altTitles?.titles) {
      await tx.tvAlternativeTitle.deleteMany({ where: { tvSeriesId: series.id } });
      if (altTitles.titles.length > 0) {
        const seenTvAlt = new Set<string>();
        const uniqueTvAlt = altTitles.titles.filter((t: {iso_3166_1: string}) => {
          if (!t.iso_3166_1 || seenTvAlt.has(t.iso_3166_1)) return false;
          seenTvAlt.add(t.iso_3166_1);
          return true;
        });
        await tx.tvAlternativeTitle.createMany({
          data: uniqueTvAlt.map((t: {iso_3166_1: string; title: string}) => ({
            tvSeriesId: series.id,
            countryCode: t.iso_3166_1,
            title: t.title,
          })),
        });
      }
    }

    // --- External IDs ---
    const externalIds = getValue(externalIdsResult);
    if (externalIds) {
      await tx.externalId.upsert({
        where: { entityType_entityId: { entityType: 'tv', entityId: series.id } },
        create: {
          entityType: 'tv',
          entityId: series.id,
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

    // --- Images (backdrops + posters, up to 20 each) ---
    const images = getValue(imagesResult);
    if (images) {
      await tx.mediaImage.deleteMany({ where: { entityType: 'tv', entityId: series.id } });
      const imageData = [
        ...(images.backdrops || []).slice(0, 20).map((img) => ({
          entityType: 'tv' as const,
          entityId: series.id,
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
          entityType: 'tv' as const,
          entityId: series.id,
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
      await tx.mediaVideo.deleteMany({ where: { entityType: 'tv', entityId: series.id } });
      const videoData = videos.results.slice(0, 20).map((v) => ({
        entityType: 'tv' as const,
        entityId: series.id,
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

    // --- Recommendations ---
    const recommendations = getValue(recommendationsResult);
    if (recommendations?.results) {
      await tx.recommendation.deleteMany({ where: { sourceType: 'tv', sourceId: series.id } });
      const recData = recommendations.results.slice(0, 20).map((rec, idx) => ({
        sourceType: 'tv' as const,
        sourceId: series.id,
        targetType: (rec.original_name ? 'tv' : 'movie') as string,
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
        await tx.tvSeriesWatchProvider.deleteMany({ where: { tvSeriesId: series.id } });
        const providerTypes = ['flatrate', 'rent', 'buy', 'ads', 'free'] as const;
        const wpData: Array<{ tvSeriesId: number; providerId: number; providerType: string }> = [];

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
              tvSeriesId: series.id,
              providerId: p.provider_id,
              providerType,
            });
          }
        }
        // Deduplicate by providerId
        const seenTvProviders = new Set<number>();
        const uniqueTvWp = wpData.filter((d) => {
          if (seenTvProviders.has(d.providerId)) return false;
          seenTvProviders.add(d.providerId);
          return true;
        });
        if (uniqueTvWp.length > 0) {
          await tx.tvSeriesWatchProvider.createMany({ data: uniqueTvWp });
        }
      }
    }

    // --- Translations ---
    const translations = getValue(translationsResult);
    if (translations?.translations) {
      await tx.translation.deleteMany({ where: { entityType: 'tv', entityId: series.id } });
      const trData = translations.translations.map((t) => ({
        entityType: 'tv' as const,
        entityId: series.id,
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
// Collection Functions
// ============================================================

/** Fetch all TV series IDs from popular + top-rated lists */
async function collectTvSeriesIds(
  client: TmdbClient,
  options: SyncOptions,
  onProgress?: (progress: SyncProgress) => void
): Promise<number[]> {
  const pages = options.maxPages || 5;
  const seriesIds = new Set<number>();

  // Fetch popular TV series
  for (let page = 1; page <= pages; page++) {
    try {
      const response = await client.getPopularTv(page);
      for (const series of response.results) {
        seriesIds.add(series.id);
      }
      onProgress?.({
        entity: 'tv',
        status: 'running',
        phase: 'collecting',
        current: page,
        total: pages * 2,
        message: `Fetching popular TV page ${page}/${pages}`,
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching popular TV page ${page}:`, error);
    }
  }

  // Fetch top-rated TV series
  for (let page = 1; page <= pages; page++) {
    try {
      const response = await client.getTopRatedTv(page);
      for (const series of response.results) {
        seriesIds.add(series.id);
      }
      onProgress?.({
        entity: 'tv',
        status: 'running',
        phase: 'collecting',
        current: pages + page,
        total: pages * 2,
        message: `Fetching top-rated TV page ${page}/${pages}`,
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} Error fetching top-rated TV page ${page}:`, error);
    }
  }

  return Array.from(seriesIds);
}

// ============================================================
// Batch Processing
// ============================================================

/** Process a batch of TV series IDs */
async function processBatch(
  seriesIds: number[],
  client: TmdbClient,
  onProgress?: (progress: SyncProgress) => void,
  errors: SyncError[] = []
): Promise<number> {
  let successCount = 0;

  // Fetch details in parallel batches
  const batches = chunk(seriesIds, DETAIL_BATCH_SIZE);

  for (const batch of batches) {
    // Fetch all details in parallel
    const detailPromises = batch.map((id) =>
      client.getTvDetails(id, 'keywords,external_ids').catch((error) => {
        errors.push({
          tmdbId: id,
          entity: 'series',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
        return null;
      })
    );

    const details = await Promise.all(detailPromises);

    // Process each series in a transaction
    for (const tmdbSeries of details) {
      if (!tmdbSeries) continue;

      try {
        await prisma.$transaction(
          async (tx) => {
            await upsertTvSeriesWithNestedData(tmdbSeries as TmdbTvSeries, tx);
          },
          { timeout: 30000 }
        );
        // Fetch and store sub-resources after the main upsert succeeds
        await syncTvSubResources(tmdbSeries as TmdbTvSeries, client);
        successCount++;
      } catch (error) {
        errors.push({
          tmdbId: (tmdbSeries as TmdbTvSeries).id,
          entity: 'series',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }

    onProgress?.({
      entity: 'tv',
      status: 'running',
      phase: 'syncing',
      current: successCount + errors.length,
      total: seriesIds.length,
      message: `Synced ${successCount}/${seriesIds.length} series`,
    });
  }

  return successCount;
}

// ============================================================
// Public API
// ============================================================

/**
 * Full TV series sync - fetches popular + top-rated series and stores all data
 */
export async function syncTvSeries(
  client: TmdbClient,
  options: Partial<SyncOptions> = {},
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  const syncOptions = { ...DEFAULT_SYNC_OPTIONS, ...options };
  const startTime = Date.now();
  const errors: SyncError[] = [];

  console.log(`${LOG_PREFIX} Starting TV series sync`);

  try {
    // Phase 1: Collect all TV series IDs
    const allSeriesIds = await collectTvSeriesIds(client, syncOptions, onProgress);
    console.log(`${LOG_PREFIX} Collected ${allSeriesIds.length} unique TV series`);

    // Apply limit if set
    const seriesIds = syncOptions.limit > 0 ? allSeriesIds.slice(0, syncOptions.limit) : allSeriesIds;
    console.log(`${LOG_PREFIX} Will process ${seriesIds.length} series`);

    // Phase 2: Sync in batches
    let totalSynced = 0;
    const batches = chunk(seriesIds, BATCH_SIZE);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const synced = await processBatch(batch, client, onProgress, errors);
      totalSynced += synced;

      onProgress?.({
        entity: 'tv',
        status: 'running',
        phase: 'syncing',
        current: i + 1,
        total: batches.length,
        message: `Processed batch ${i + 1}/${batches.length}`,
      });
    }

    const duration = Date.now() - startTime;
    console.log(
      `${LOG_PREFIX} Sync complete: ${totalSynced} series in ${duration}ms (${errors.length} errors)`
    );

    return {
      success: errors.length === 0,
      moviesProcessed: totalSynced,
      errors,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} Sync failed:`, error);

    return {
      success: false,
      moviesProcessed: 0,
      errors: [
        {
          tmdbId: 0,
          entity: 'series',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        },
      ],
      duration,
    };
  }
}

/**
 * Sync a single TV season with all episodes
 */
export async function syncTvSeasonDetails(
  client: TmdbClient,
  tvId: number,
  seasonNumber: number,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  const startTime = Date.now();
  const errors: SyncError[] = [];

  console.log(`${LOG_PREFIX} Syncing season ${seasonNumber} for TV series ${tvId}`);

  try {
    // Look up the series by TMDB ID to get the internal database ID
    const series = await prisma.tvSeries.findUnique({ where: { tmdbId: tvId } });
    if (!series) {
      throw new Error(`TV series with TMDB ID ${tvId} not found in database`);
    }

    // Fetch season details
    const seasonDetail = (await client.getTvSeasonDetails(
      tvId,
      seasonNumber
    )) as unknown as TmdbTvSeasonDetail;

    onProgress?.({
      entity: 'tv',
      status: 'running',
      phase: 'syncing',
      current: 1,
      total: 1,
      message: `Fetched season ${seasonNumber} details`,
    });

    // Upsert in transaction
    await prisma.$transaction(
      async (tx) => {
        // Find or create the season record
        const season = await tx.tvSeason.upsert({
          where: { tmdbId: seasonDetail.id },
          create: {
            tmdbId: seasonDetail.id,
            airDate: seasonDetail.air_date,
            episodeCount: seasonDetail.episodes?.length || 0,
            name: seasonDetail.name,
            overview: seasonDetail.overview,
            posterPath: seasonDetail.poster_path,
            seasonNumber: seasonDetail.season_number,
            voteAverage: seasonDetail.vote_average,
            tvSeriesId: series.id,
          },
          update: {
            airDate: seasonDetail.air_date,
            episodeCount: seasonDetail.episodes?.length || 0,
            name: seasonDetail.name,
            overview: seasonDetail.overview,
            posterPath: seasonDetail.poster_path,
            seasonNumber: seasonDetail.season_number,
            voteAverage: seasonDetail.vote_average,
          },
        });

        // Upsert all episodes
        for (const episode of seasonDetail.episodes || []) {
          await tx.tvEpisode.upsert({
            where: { tmdbId: episode.id },
            create: {
              tmdbId: episode.id,
              ...buildEpisodeScalarData(episode),
              tvSeasonId: season.id,
            },
            update: {
              ...buildEpisodeScalarData(episode),
              tvSeasonId: season.id,
            },
          });
        }
      },
      { timeout: 60000 }
    );

    const duration = Date.now() - startTime;
    console.log(
      `${LOG_PREFIX} Season ${seasonNumber} sync complete in ${duration}ms`
    );

    return {
      success: true,
      moviesProcessed: 1,
      errors,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} Season sync failed:`, error);

    return {
      success: false,
      moviesProcessed: 0,
      errors: [
        {
          tmdbId: tvId,
          entity: 'season',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        },
      ],
      duration,
    };
  }
}

// ============================================================
// Public API: On-Demand Fetch (single TV series by TMDB ID)
// ============================================================

/**
 * Fetch a single TV series from TMDB and upsert it with all nested data.
 * Used for on-demand fetch when a user clicks on a series not yet in the DB.
 * Returns the upserted series' internal DB ID, or null on failure.
 */
export async function fetchAndUpsertTvSeries(tmdbId: number): Promise<number | null> {
  const client = new TmdbClient({ language: 'en-US' });

  try {
    const tmdbSeries = await client.getTvDetails(tmdbId, 'keywords,external_ids');
    if (!tmdbSeries) return null;

    await prisma.$transaction(
      async (tx) => {
        await upsertTvSeriesWithNestedData(tmdbSeries, tx);
      },
      { timeout: 30000 }
    );

    await syncTvSubResources(tmdbSeries, client);

    const series = await prisma.tvSeries.findUnique({ where: { tmdbId } });
    return series?.id ?? null;
  } catch (error) {
    console.error(`${LOG_PREFIX} On-demand fetch failed for TV series ${tmdbId}:`, error);
    return null;
  }
}
