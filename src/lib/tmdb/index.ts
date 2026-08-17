// TMDB API Client - Public Exports
// Re-exports all types and the client class

// Types
export type {
  TmdbGenre,
  TmdbKeyword,
  TmdbProductionCompany,
  TmdbProductionCountry,
  TmdbSpokenLanguage,
  TmdbCollection,
  TmdbWatchProvider,
  TmdbWatchProviders,
  TmdbMovie,
  TmdbTvCreatedBy,
  TmdbTvNetwork,
  TmdbTvSeason,
  TmdbTvEpisode,
  TmdbTvSeries,
  TmdbPerson,
  TmdbPersonListItem,
  TmdbPersonCreditsResponse,
  TmdbCastCredit,
  TmdbCrewCredit,
  TmdbPaginatedResponse,
  TmdbTrendingResponse,
  TmdbSearchResponse,
  TmdbMultiSearchResult,
  TmdbDiscoverParams,
  TmdbSearchParams,
  TmdbTrendingParams,
  TmdbClientConfig,
  TmdbRateLimitConfig,
  TmdbRetryConfig,
} from './types';

// Client
export { TmdbClient } from './client';
export type { default as TmdbClientDefault } from './client';

// Rate Limiter
export { TmdbRateLimiter } from './rate-limiter';
export type { default as TmdbRateLimiterDefault } from './rate-limiter';

// Explicit imports for use within this module (re-exports don't bring names into scope)
import type { TmdbClientConfig } from './types';
import { TmdbClient } from './client';

// Convenience re-exports
export const tmdb = {
  /**
   * Create a new TMDB client instance
   */
  createClient: (config?: TmdbClientConfig) => {
    return new TmdbClient(config);
  },

  /**
   * Default TMDB client instance
   */
  client: new TmdbClient(),

  /**
   * TMDB API base URL
   */
  baseUrl: 'https://api.themoviedb.org/3',

  /**
   * Image base URL
   */
  imageUrl: 'https://image.tmdb.org/t/p',

  /**
   * Generate image URL
   */
  getImageUrl: (path: string | null, size: string = 'w500'): string | null => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },

  /**
   * Generate poster URL
   */
  getPosterUrl: (path: string | null, size: string = 'w500'): string | null => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },

  /**
   * Generate backdrop URL
   */
  getBackdropUrl: (path: string | null, size: string = 'w1280'): string | null => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },

  /**
   * Generate profile URL
   */
  getProfileUrl: (path: string | null, size: string = 'w185'): string | null => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },

  /**
   * Generate logo URL
   */
  getLogoUrl: (path: string | null, size: string = 'w45'): string | null => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },
};

// Default export
export default tmdb;
