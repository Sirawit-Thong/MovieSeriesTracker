// TMDB API Client
// Comprehensive client with rate limiting and retry logic

import { TmdbRateLimiter, globalTmdbRateLimiter } from './rate-limiter';
import type {
  TmdbClientConfig,
  TmdbRetryConfig,
  TmdbMovie,
  TmdbTvSeries,
  TmdbPerson,
  TmdbPersonListItem,
  TmdbPersonCreditsResponse,
  TmdbMultiSearchResult,
  TmdbPaginatedResponse,
  TmdbTrendingResponse,
  TmdbSearchResponse,
  TmdbDiscoverParams,
  TmdbSearchParams,
  TmdbGenre,
  TmdbWatchProviders,
  TmdbWatchProvidersListResponse,
  TmdbAlternativeTitlesResponse,
  TmdbContentRatingsResponse,
  TmdbMovieImagesResponse,
  TmdbTvImagesResponse,
  TmdbPersonImagesResponse,
  TmdbTranslationsResponse,
  TmdbVideosResponse,
  TmdbReleaseDatesResponse,
  TmdbExternalIds,
  TmdbRecommendationsResponse,
  TmdbCreditsResponse,
  TmdbPersonExternalIds,
  TmdbConfigurationResponse,
} from './types';

export class TmdbClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly language: string;
  private readonly region: string;
  private readonly timeout: number;
  private readonly rateLimiter: TmdbRateLimiter;
  private readonly retryConfig: TmdbRetryConfig;

  constructor(
    config: TmdbClientConfig = {},
    retryConfig: Partial<TmdbRetryConfig> = {}
  ) {
    this.apiKey = config.apiKey || process.env.TMDB_API_KEY || '';
    this.baseUrl = config.baseUrl || 'https://api.themoviedb.org/3';
    this.language = config.language || 'en-US';
    this.region = config.region || 'US';
    this.timeout = config.timeout || 30000;

    this.rateLimiter = config.rateLimiter ?? globalTmdbRateLimiter;

    this.retryConfig = {
      maxRetries: retryConfig.maxRetries || 3,
      baseDelay: retryConfig.baseDelay || 1000,
      maxDelay: retryConfig.maxDelay || 10000,
    };
  }

  /**
   * Make an authenticated request to the TMDB API
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined> = {}
  ): Promise<T> {
    // Acquire rate limit permission
    await this.rateLimiter.acquire();

    // Build URL with query parameters
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
    const endpointPath = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(endpointPath, baseUrl);
    
    // Add API key as query param (TMDB v3 style)
    if (this.apiKey) {
      url.searchParams.append('api_key', this.apiKey);
    }
    
    // Add default params (params.language overrides this.language if provided)
    url.searchParams.append('language', (params.language as string) || this.language);
    
    // Add optional params (skip language since we already handled it above)
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'language' && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle rate limiting (HTTP 429)
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : Math.min(
                this.retryConfig.baseDelay * Math.pow(2, attempt),
                this.retryConfig.maxDelay
              );
          
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // Handle other errors
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`TMDB API error ${response.status}: ${errorText}`);
        }

        // Parse and return response
        const data = await response.json();
        return data as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry if it's not a retryable error
        if (
          lastError.name === 'AbortError' ||
          !lastError.message.includes('429')
        ) {
          break;
        }

        // Wait before retrying
        const waitTime = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  // ============================================================
  // Movie Methods
  // ============================================================

  /**
   * Get popular movies
   */
  async getPopularMovies(page: number = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.request<TmdbPaginatedResponse<TmdbMovie>>('/movie/popular', {
      page,
    });
  }

  /**
   * Get top rated movies
   */
  async getTopRatedMovies(page: number = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.request<TmdbPaginatedResponse<TmdbMovie>>('/movie/top_rated', {
      page,
    });
  }

  /**
   * Get movie details by ID
   */
  async getMovieDetails(
    movieId: number,
    appendToResponse?: string
  ): Promise<TmdbMovie> {
    const params: Record<string, string | number> = {};
    if (appendToResponse) {
      params.append_to_response = appendToResponse;
    }
    return this.request<TmdbMovie>(`/movie/${movieId}`, params);
  }

  /**
   * Get movie genres
   */
  async getMovieGenres(): Promise<{ genres: TmdbGenre[] }> {
    return this.request<{ genres: TmdbGenre[] }>('/genre/movie/list');
  }

  // ============================================================
  // TV Series Methods
  // ============================================================

  /**
   * Get popular TV series
   */
  async getPopularTv(page: number = 1): Promise<TmdbPaginatedResponse<TmdbTvSeries>> {
    return this.request<TmdbPaginatedResponse<TmdbTvSeries>>('/tv/popular', {
      page,
    });
  }

  /**
   * Get top rated TV series
   */
  async getTopRatedTv(page: number = 1): Promise<TmdbPaginatedResponse<TmdbTvSeries>> {
    return this.request<TmdbPaginatedResponse<TmdbTvSeries>>('/tv/top_rated', {
      page,
    });
  }

  /**
   * Get TV series details by ID
   */
  async getTvDetails(
    tvId: number,
    appendToResponse?: string
  ): Promise<TmdbTvSeries> {
    const params: Record<string, string | number> = {};
    if (appendToResponse) {
      params.append_to_response = appendToResponse;
    }
    return this.request<TmdbTvSeries>(`/tv/${tvId}`, params);
  }

  /**
   * Get TV genres
   */
  async getTvGenres(): Promise<{ genres: TmdbGenre[] }> {
    return this.request<{ genres: TmdbGenre[] }>('/genre/tv/list');
  }

  /**
   * Get TV season details with episodes
   */
  async getTvSeasonDetails(
    tvId: number,
    seasonNumber: number
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      `/tv/${tvId}/season/${seasonNumber}`
    );
  }

  // ============================================================
  // Person Methods
  // ============================================================

  /**
   * Get person details by ID
   */
  async getPersonDetails(
    personId: number,
    appendToResponse?: string
  ): Promise<TmdbPerson> {
    const params: Record<string, string | number> = {};
    if (appendToResponse) {
      params.append_to_response = appendToResponse;
    }
    return this.request<TmdbPerson>(`/person/${personId}`, params);
  }

  /**
   * Get popular persons (paginated list)
   */
  async getPopularPersons(
    page: number = 1
  ): Promise<TmdbPaginatedResponse<TmdbPersonListItem>> {
    return this.request<TmdbPaginatedResponse<TmdbPersonListItem>>(
      '/person/popular',
      { page }
    );
  }

  /**
   * Get a person's movie credits
   */
  async getPersonMovieCredits(
    personId: number
  ): Promise<TmdbPersonCreditsResponse> {
    return this.request<TmdbPersonCreditsResponse>(
      `/person/${personId}/movie_credits`
    );
  }

  /**
   * Get a person's TV credits
   */
  async getPersonTvCredits(
    personId: number
  ): Promise<TmdbPersonCreditsResponse> {
    return this.request<TmdbPersonCreditsResponse>(
      `/person/${personId}/tv_credits`
    );
  }

  // ============================================================
  // Search Methods
  // ============================================================

  /**
   * Search for movies
   */
  async searchMovies(
    params: TmdbSearchParams
  ): Promise<TmdbSearchResponse<TmdbMovie>> {
    return this.request<TmdbSearchResponse<TmdbMovie>>('/search/movie', {
      query: params.query,
      page: params.page,
      include_adult: params.include_adult,
      region: params.region,
      year: params.year,
    });
  }

  /**
   * Search for TV series
   */
  async searchTv(
    params: TmdbSearchParams
  ): Promise<TmdbSearchResponse<TmdbTvSeries>> {
    return this.request<TmdbSearchResponse<TmdbTvSeries>>('/search/tv', {
      query: params.query,
      page: params.page,
      include_adult: params.include_adult,
      first_air_date_year: params.first_air_date_year,
    });
  }

  /**
   * Search for people
   */
  async searchPerson(
    params: TmdbSearchParams
  ): Promise<TmdbSearchResponse<TmdbPerson>> {
    return this.request<TmdbSearchResponse<TmdbPerson>>('/search/person', {
      query: params.query,
      page: params.page,
      include_adult: params.include_adult,
    });
  }

  /**
   * Multi-search for movies, TV series, and people
   */
  async searchMulti(
    params: TmdbSearchParams
  ): Promise<TmdbSearchResponse<TmdbMultiSearchResult>> {
    return this.request<TmdbSearchResponse<TmdbMultiSearchResult>>('/search/multi', {
      query: params.query,
      page: params.page,
      include_adult: params.include_adult,
    });
  }

  // ============================================================
  // Discover Methods
  // ============================================================

  /**
   * Discover movies with filters
   */
  async discoverMovies(
    params: TmdbDiscoverParams = {}
  ): Promise<TmdbPaginatedResponse<TmdbMovie>> {
    return this.request<TmdbPaginatedResponse<TmdbMovie>>('/discover/movie', {
      page: params.page,
      sort_by: params.sort_by,
      include_adult: params.include_adult,
      include_video: params.include_video,
      primary_release_year: params.primary_release_year,
      with_genres: params.with_genres,
      with_keywords: params.with_keywords,
      with_watch_providers: params.with_watch_providers,
      watch_region: params.watch_region,
      with_watch_monetery_types: params.with_watch_monetery_types,
      primary_release_date_gte: params.primary_release_date_gte,
      primary_release_date_lte: params.primary_release_date_lte,
      vote_average_gte: params.vote_average_gte,
      vote_average_lte: params.vote_average_lte,
      with_runtime_gte: params.with_runtime_gte,
      with_runtime_lte: params.with_runtime_lte,
    });
  }

  /**
   * Discover TV series with filters
   */
  async discoverTv(
    params: TmdbDiscoverParams = {}
  ): Promise<TmdbPaginatedResponse<TmdbTvSeries>> {
    return this.request<TmdbPaginatedResponse<TmdbTvSeries>>('/discover/tv', {
      page: params.page,
      sort_by: params.sort_by,
      include_adult: params.include_adult,
      with_genres: params.with_genres,
      with_keywords: params.with_keywords,
      with_watch_providers: params.with_watch_providers,
      watch_region: params.watch_region,
      with_watch_monetery_types: params.with_watch_monetery_types,
      first_air_date_gte: params.first_air_date_gte,
      first_air_date_lte: params.first_air_date_lte,
    });
  }

  // ============================================================
  // Trending Methods
  // ============================================================

  /**
   * Get trending movies, TV series, or people
   */
  async getTrending(
    mediaType: 'all' | 'movie' | 'tv' | 'person',
    timeWindow: 'day' | 'week' = 'day',
    page: number = 1
  ): Promise<TmdbTrendingResponse<TmdbMovie | TmdbTvSeries | TmdbPerson>> {
    return this.request<
      TmdbTrendingResponse<TmdbMovie | TmdbTvSeries | TmdbPerson>
    >(`/trending/${mediaType}/${timeWindow}`, {
      page,
    });
  }

  // ============================================================
  // Watch Providers Methods
  // ============================================================

  /**
   * Get watch providers for a movie
   */
  async getMovieWatchProviders(movieId: number): Promise<TmdbWatchProviders> {
    return this.request<TmdbWatchProviders>(`/movie/${movieId}/watch/providers`);
  }

  /**
   * Get watch providers for a TV series
   */
  async getTvWatchProviders(tvId: number): Promise<TmdbWatchProviders> {
    return this.request<TmdbWatchProviders>(`/tv/${tvId}/watch/providers`);
  }

  /**
   * Get available watch provider regions
   */
  async getWatchProviderRegions(): Promise<{
    results: Array<{ iso_3166_1: string; english_name: string }>;
  }> {
    return this.request<{
      results: Array<{ iso_3166_1: string; english_name: string }>;
    }>('/watch/providers/regions');
  }

  /**
   * Get all available watch providers for movies
   */
  async getAllWatchProviders(): Promise<TmdbWatchProvidersListResponse> {
    return this.request<TmdbWatchProvidersListResponse>('/watch/providers/movie');
  }

  // ============================================================
  // Movie Sub-Resource Methods
  // ============================================================

  /**
   * Get alternative titles for a movie
   */
  async getMovieAlternativeTitles(movieId: number): Promise<TmdbAlternativeTitlesResponse> {
    return this.request<TmdbAlternativeTitlesResponse>(`/movie/${movieId}/alternative_titles`);
  }

  /**
   * Get content ratings (release_dates) for a movie
   */
  async getMovieContentRatings(movieId: number): Promise<TmdbContentRatingsResponse> {
    return this.request<TmdbContentRatingsResponse>(`/movie/${movieId}/release_dates`);
  }

  /**
   * Get images (backdrops + posters) for a movie
   */
  async getMovieImages(movieId: number): Promise<TmdbMovieImagesResponse> {
    return this.request<TmdbMovieImagesResponse>(`/movie/${movieId}/images`);
  }

  /**
   * Get translations for a movie
   */
  async getMovieTranslations(movieId: number): Promise<TmdbTranslationsResponse> {
    return this.request<TmdbTranslationsResponse>(`/movie/${movieId}/translations`);
  }

  /**
   * Get videos (trailers, teasers) for a movie
   */
  async getMovieVideos(movieId: number): Promise<TmdbVideosResponse> {
    return this.request<TmdbVideosResponse>(`/movie/${movieId}/videos`);
  }

  /**
   * Get release dates for a movie
   */
  async getMovieReleaseDates(movieId: number): Promise<TmdbReleaseDatesResponse> {
    return this.request<TmdbReleaseDatesResponse>(`/movie/${movieId}/release_dates`);
  }

  /**
   * Get external IDs (IMDB, etc.) for a movie
   */
  async getMovieExternalIds(movieId: number): Promise<TmdbExternalIds> {
    return this.request<TmdbExternalIds>(`/movie/${movieId}/external_ids`);
  }

  /**
   * Get movie recommendations
   */
  async getMovieRecommendations(movieId: number, page: number = 1): Promise<TmdbRecommendationsResponse> {
    return this.request<TmdbRecommendationsResponse>(`/movie/${movieId}/recommendations`, { page });
  }

  /**
   * Get similar movies
   */
  async getMovieSimilar(movieId: number, page: number = 1): Promise<TmdbRecommendationsResponse> {
    return this.request<TmdbRecommendationsResponse>(`/movie/${movieId}/similar`, { page });
  }

  /**
   * Get cast and crew credits for a movie
   */
  async getMovieCredits(movieId: number): Promise<TmdbCreditsResponse> {
    return this.request<TmdbCreditsResponse>(`/movie/${movieId}/credits`);
  }

  // ============================================================
  // TV Sub-Resource Methods
  // ============================================================

  /**
   * Get content ratings for a TV series
   */
  async getTvContentRatings(tvId: number): Promise<TmdbContentRatingsResponse> {
    return this.request<TmdbContentRatingsResponse>(`/tv/${tvId}/content_ratings`);
  }

  /**
   * Get alternative titles for a TV series
   */
  async getTvAlternativeTitles(tvId: number): Promise<TmdbAlternativeTitlesResponse> {
    return this.request<TmdbAlternativeTitlesResponse>(`/tv/${tvId}/alternative_titles`);
  }

  /**
   * Get images (backdrops, logos, posters) for a TV series
   */
  async getTvImages(tvId: number): Promise<TmdbTvImagesResponse> {
    return this.request<TmdbTvImagesResponse>(`/tv/${tvId}/images`);
  }

  /**
   * Get translations for a TV series
   */
  async getTvTranslations(tvId: number): Promise<TmdbTranslationsResponse> {
    return this.request<TmdbTranslationsResponse>(`/tv/${tvId}/translations`);
  }

  /**
   * Get videos for a TV series
   */
  async getTvVideos(tvId: number): Promise<TmdbVideosResponse> {
    return this.request<TmdbVideosResponse>(`/tv/${tvId}/videos`);
  }

  /**
   * Get external IDs for a TV series
   */
  async getTvExternalIds(tvId: number): Promise<TmdbExternalIds> {
    return this.request<TmdbExternalIds>(`/tv/${tvId}/external_ids`);
  }

  /**
   * Get recommendations for a TV series
   */
  async getTvRecommendations(tvId: number, page: number = 1): Promise<TmdbRecommendationsResponse> {
    return this.request<TmdbRecommendationsResponse>(`/tv/${tvId}/recommendations`, { page });
  }

  /**
   * Get cast and crew credits for a TV series
   */
  async getTvCredits(tvId: number): Promise<TmdbCreditsResponse> {
    return this.request<TmdbCreditsResponse>(`/tv/${tvId}/credits`);
  }

  // ============================================================
  // Person Sub-Resource Methods
  // ============================================================

  /**
   * Get external IDs for a person
   */
  async getPersonExternalIds(personId: number): Promise<TmdbPersonExternalIds> {
    return this.request<TmdbPersonExternalIds>(`/person/${personId}/external_ids`);
  }

  /**
   * Get profile images for a person
   */
  async getPersonImages(personId: number): Promise<TmdbPersonImagesResponse> {
    return this.request<TmdbPersonImagesResponse>(`/person/${personId}/images`);
  }

  /**
   * Get translations for a person
   */
  async getPersonTranslations(personId: number): Promise<TmdbTranslationsResponse> {
    return this.request<TmdbTranslationsResponse>(`/person/${personId}/translations`);
  }

  // ============================================================
  // Configuration Methods
  // ============================================================

  /**
   * Get TMDB API configuration (image base URLs, etc.)
   */
  async getConfiguration(): Promise<TmdbConfigurationResponse> {
    return this.request<TmdbConfigurationResponse>('/configuration');
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Get rate limit status
   */
  getRateLimitStatus(): { used: number; remaining: number; resetIn: number } {
    return this.rateLimiter.getStatus();
  }

  /**
   * Reset rate limiter
   */
  resetRateLimiter(): void {
    this.rateLimiter.reset();
  }
}

export default TmdbClient;
