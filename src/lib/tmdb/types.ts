// TMDB API TypeScript Types
// Based on TMDB API v3 documentation

// ============================================================
// Base Types
// ============================================================

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbKeyword {
  id: number;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TmdbProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TmdbCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TmdbWatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TmdbWatchProviders {
  id: number;
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: TmdbWatchProvider[];
      rent?: TmdbWatchProvider[];
      buy?: TmdbWatchProvider[];
      ads?: TmdbWatchProvider[];
      free?: TmdbWatchProvider[];
    };
  };
}

export interface TmdbWatchProviderListItem {
  display_priorities: Record<string, number>;
  display_priority: number;
  logo_path: string;
  provider_name: string;
  provider_id: number;
}

export interface TmdbWatchProvidersListResponse {
  results: TmdbWatchProviderListItem[];
}

// ============================================================
// Movie Types
// ============================================================

export interface TmdbMovie {
  id: number;
  adult: boolean;
  backdrop_path: string | null;
  budget: number;
  genres: TmdbGenre[];
  homepage: string | null;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: TmdbSpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  belongs_to_collection: TmdbCollection | null;
  keywords: {
    keywords: TmdbKeyword[];
  };
  watch_providers: TmdbWatchProviders;
}

// ============================================================
// TV Series Types
// ============================================================

export interface TmdbTvCreatedBy {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string | null;
}

export interface TmdbTvNetwork {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

export interface TmdbTvSeason {
  id: number;
  air_date: string | null;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TmdbTvEpisode {
  id: number;
  air_date: string | null;
  episode_number: number;
  episode_type: string | null;
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

export interface TmdbTvSeries {
  id: number;
  adult: boolean;
  backdrop_path: string | null;
  created_by: TmdbTvCreatedBy[];
  episode_run_time: number[];
  first_air_date: string;
  genres: TmdbGenre[];
  homepage: string | null;
  in_production: boolean | null;
  languages: string[];
  last_air_date: string | null;
  last_episode_to_air: TmdbTvEpisode | null;
  name: string;
  networks: TmdbTvNetwork[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountry[];
  seasons: TmdbTvSeason[];
  spoken_languages: TmdbSpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
  next_episode_to_air: TmdbTvEpisode | null;
  keywords: {
    results: TmdbKeyword[];
  };
  watch_providers: TmdbWatchProviders;
}

// ============================================================
// Person Types
// ============================================================

export interface TmdbPerson {
  id: number;
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  imdb_id: string | null;
  known_for_department: string;
  name: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
  combined_credits: {
    cast: TmdbCastCredit[];
    crew: TmdbCrewCredit[];
  };
}

// ============================================================
// Credit Types
// ============================================================

export interface TmdbCastCredit {
  id: number;
  character: string;
  credit_id: string;
  order: number;
  media_type: string;
  original_language: string;
  original_title: string | null;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string | null;
  title: string | null;
  vote_average: number;
  vote_count: number;
  // For TV series credits
  name?: string;
  first_air_date?: string;
  origin_country?: string[];
}

export interface TmdbCrewCredit {
  id: number;
  department: string;
  credit_id: string;
  job: string;
  media_type: string;
  original_language: string;
  original_title: string | null;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string | null;
  title: string | null;
  vote_average: number;
  vote_count: number;
  // For TV series credits
  name?: string;
  first_air_date?: string;
  origin_country?: string[];
}

// ============================================================
// Response Types
// ============================================================

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbTrendingResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMultiSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  popularity: number;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  // Movie fields
  title?: string;
  original_title?: string;
  release_date?: string;
  adult?: boolean;
  backdrop_path?: string | null;
  original_language?: string;
  // TV fields
  name?: string;
  original_name?: string;
  first_air_date?: string;
  origin_country?: string[];
  // Person fields
  gender?: number;
  known_for_department?: string;
  profile_path?: string | null;
}

// ============================================================
// Person List Types (from /person/popular endpoint)
// ============================================================

export interface TmdbPersonListItem {
  adult: boolean;
  gender: number;
  id: number;
  known_for: unknown[];
  known_for_department: string;
  name: string;
  popularity: number;
  profile_path: string | null;
}

// ============================================================
// Person Credits Response Types
// ============================================================

export interface TmdbPersonCreditsResponse {
  id: number;
  cast: TmdbCastCredit[];
  crew: TmdbCrewCredit[];
}

// ============================================================
// Query Parameter Types
// ============================================================

export interface TmdbDiscoverParams {
  page?: number;
  language?: string;
  sort_by?: string;
  include_adult?: boolean;
  include_video?: boolean;
  primary_release_year?: number;
  with_genres?: string;
  with_keywords?: string;
  with_watch_providers?: string;
  watch_region?: string;
  with_watch_monetery_types?: string;
  // Additional movie-specific params
  primary_release_date_gte?: string;
  primary_release_date_lte?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  // TV-specific params
  first_air_date_gte?: string;
  first_air_date_lte?: string;
}

export interface TmdbSearchParams {
  page?: number;
  language?: string;
  query: string;
  include_adult?: boolean;
  region?: string;
  year?: number;
  first_air_date_year?: number;
}

export interface TmdbTrendingParams {
  page?: number;
  language?: string;
  time_window: 'day' | 'week';
}

// ============================================================
// Sub-Resource Types
// ============================================================

// --- Images ---

export interface TmdbImageItem {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TmdbMovieImagesResponse {
  id: number;
  backdrops: TmdbImageItem[];
  posters: TmdbImageItem[];
}

export interface TmdbTvImagesResponse {
  id: number;
  backdrops: TmdbImageItem[];
  logos: TmdbImageItem[];
  posters: TmdbImageItem[];
}

export interface TmdbPersonImagesResponse {
  id: number;
  profiles: TmdbImageItem[];
}

// --- Alternative Titles ---

export interface TmdbAlternativeTitle {
  iso_3166_1: string;
  title: string;
  type: string;
}

export interface TmdbAlternativeTitlesResponse {
  id: number;
  titles: TmdbAlternativeTitle[];
}

// --- Content Ratings ---

export interface TmdbContentRating {
  iso_3166_1: string;
  rating: string;
}

export interface TmdbContentRatingsResponse {
  id: number;
  results: TmdbContentRating[];
}

// --- Release Dates ---

export interface TmdbReleaseDateItem {
  certification: string;
  iso_639_1: string;
  release_date: string;
  type: number;
  note: string;
}

export interface TmdbReleaseDatesByCountry {
  iso_3166_1: string;
  release_dates: TmdbReleaseDateItem[];
}

export interface TmdbReleaseDatesResponse {
  id: number;
  results: TmdbReleaseDatesByCountry[];
}

// --- External IDs ---

export interface TmdbExternalIds {
  id: number;
  imdb_id: string | null;
  freebase_mid: string | null;
  freebase_id: string | null;
  tvdb_id: number | null;
  tvrage_id: number | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  tiktok_id: string | null;
  youtube_id: string | null;
}

// --- Translations ---

export interface TmdbTranslationData {
  title?: string;
  name?: string;
  overview?: string;
  tagline?: string;
  biography?: string;
}

export interface TmdbTranslation {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  english_name: string;
  data: TmdbTranslationData;
}

export interface TmdbTranslationsResponse {
  id: number;
  translations: TmdbTranslation[];
}

// --- Videos ---

export interface TmdbVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id_as_string: string;
}

export interface TmdbVideosResponse {
  id: number;
  results: TmdbVideo[];
}

// --- Recommendations / Similar ---

export interface TmdbRecommendationItem {
  id: number;
  original_language: string;
  original_title?: string;
  original_name?: string;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
}

export interface TmdbRecommendationsResponse {
  page: number;
  results: TmdbRecommendationItem[];
  total_pages: number;
  total_results: number;
}

// --- Credits (cast/crew for movies and TV) ---

export interface TmdbCastMember {
  id: number;
  character: string;
  credit_id: string;
  order: number;
  adult: boolean;
  gender: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

export interface TmdbCrewMember {
  id: number;
  department: string;
  job: string;
  credit_id: string;
  adult: boolean;
  gender: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

export interface TmdbCreditsResponse {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

// --- Configuration ---

export interface TmdbPersonExternalIds {
  id: number;
  freebase_mid: string | null;
  freebase_id: string | null;
  imdb_id: string | null;
  tvrage_id: number | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  tiktok_id: string | null;
  youtube_id: string | null;
}

export interface TmdbImageConfiguration {
  base_url: string;
  secure_base_url: string;
  backdrop_sizes: string[];
  logo_sizes: string[];
  poster_sizes: string[];
  profile_sizes: string[];
  still_sizes: string[];
}

export interface TmdbConfigurationResponse {
  images: TmdbImageConfiguration;
  change_keys: string[];
}

// ============================================================
// Client Types
// ============================================================

export interface TmdbClientConfig {
  apiKey?: string;
  baseUrl?: string;
  language?: string;
  region?: string;
  timeout?: number;
  rateLimiter?: import('./rate-limiter').TmdbRateLimiter;
}

export interface TmdbRateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface TmdbRetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}
