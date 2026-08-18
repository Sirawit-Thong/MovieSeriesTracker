-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WatchStatus" AS ENUM ('WATCHED', 'WATCHING', 'WANT_TO_WATCH', 'DROPPED');

-- CreateTable
CREATE TABLE "genres" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_providers" (
    "provider_id" INTEGER NOT NULL,
    "provider_name" TEXT NOT NULL,
    "logo_path" TEXT NOT NULL,
    "display_priority" INTEGER NOT NULL,

    CONSTRAINT "watch_providers_pkey" PRIMARY KEY ("provider_id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "overview" TEXT,
    "original_language" TEXT,
    "original_name" TEXT,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_companies" (
    "id" INTEGER NOT NULL,
    "logo_path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin_country" TEXT NOT NULL,
    "description" TEXT,
    "headquarters" TEXT,
    "homepage" TEXT,
    "parent_company_id" INTEGER,

    CONSTRAINT "production_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_countries" (
    "iso_3166_1" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "production_countries_pkey" PRIMARY KEY ("iso_3166_1")
);

-- CreateTable
CREATE TABLE "spoken_languages" (
    "english_name" TEXT NOT NULL,
    "iso_639_1" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "spoken_languages_pkey" PRIMARY KEY ("english_name")
);

-- CreateTable
CREATE TABLE "configuration" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "image_base_url" TEXT NOT NULL,
    "secure_image_base_url" TEXT NOT NULL,
    "backdrop_sizes" TEXT NOT NULL,
    "logo_sizes" TEXT NOT NULL,
    "poster_sizes" TEXT NOT NULL,
    "profile_sizes" TEXT NOT NULL,
    "still_sizes" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "iso_3166_1" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("iso_3166_1")
);

-- CreateTable
CREATE TABLE "languages" (
    "iso_639_1" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("iso_639_1")
);

-- CreateTable
CREATE TABLE "timezones" (
    "id" SERIAL NOT NULL,
    "iso_3166_1" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,

    CONSTRAINT "timezones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" SERIAL NOT NULL,
    "country_code" TEXT NOT NULL,
    "certification" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "backdrop_path" TEXT,
    "budget" INTEGER DEFAULT 0,
    "homepage" TEXT,
    "imdb_id" TEXT,
    "origin_country" TEXT,
    "original_language" TEXT NOT NULL,
    "original_title" TEXT NOT NULL,
    "overview" TEXT,
    "popularity" DOUBLE PRECISION,
    "poster_path" TEXT,
    "release_date" TIMESTAMP(3),
    "revenue" INTEGER DEFAULT 0,
    "runtime" INTEGER,
    "status" TEXT,
    "tagline" TEXT,
    "title" TEXT NOT NULL,
    "video" BOOLEAN NOT NULL DEFAULT false,
    "vote_average" DOUBLE PRECISION,
    "vote_count" INTEGER,
    "last_fetched_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "collectionId" INTEGER,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_genres" (
    "movieId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "movie_genres_pkey" PRIMARY KEY ("movieId","genreId")
);

-- CreateTable
CREATE TABLE "movie_keywords" (
    "movieId" INTEGER NOT NULL,
    "keywordId" INTEGER NOT NULL,

    CONSTRAINT "movie_keywords_pkey" PRIMARY KEY ("movieId","keywordId")
);

-- CreateTable
CREATE TABLE "movie_watch_providers" (
    "movieId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "provider_type" TEXT DEFAULT 'flatrate',

    CONSTRAINT "movie_watch_providers_pkey" PRIMARY KEY ("movieId","providerId")
);

-- CreateTable
CREATE TABLE "movie_production_companies" (
    "movieId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "movie_production_companies_pkey" PRIMARY KEY ("movieId","companyId")
);

-- CreateTable
CREATE TABLE "movie_production_countries" (
    "movieId" INTEGER NOT NULL,
    "iso_3166_1" TEXT NOT NULL,

    CONSTRAINT "movie_production_countries_pkey" PRIMARY KEY ("movieId","iso_3166_1")
);

-- CreateTable
CREATE TABLE "movie_spoken_languages" (
    "movieId" INTEGER NOT NULL,
    "english_name" TEXT NOT NULL,

    CONSTRAINT "movie_spoken_languages_pkey" PRIMARY KEY ("movieId","english_name")
);

-- CreateTable
CREATE TABLE "collection_movies" (
    "collectionId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "position" INTEGER,

    CONSTRAINT "collection_movies_pkey" PRIMARY KEY ("collectionId","movieId")
);

-- CreateTable
CREATE TABLE "movie_release_dates" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "country_code" TEXT NOT NULL,
    "certification" TEXT,
    "release_date" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "descriptors" TEXT,

    CONSTRAINT "movie_release_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_content_ratings" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "country_code" TEXT NOT NULL,
    "rating" TEXT NOT NULL,

    CONSTRAINT "movie_content_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_alternative_titles" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "country_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,

    CONSTRAINT "movie_alternative_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_created_by" (
    "id" SERIAL NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "credit_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" INTEGER NOT NULL,
    "profile_path" TEXT,
    "tv_series_id" INTEGER NOT NULL,

    CONSTRAINT "tv_created_by_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_networks" (
    "id" INTEGER NOT NULL,
    "logo_path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin_country" TEXT NOT NULL,
    "headquarters" TEXT,
    "homepage" TEXT,

    CONSTRAINT "tv_networks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_series" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "backdrop_path" TEXT,
    "first_air_date" TEXT,
    "homepage" TEXT,
    "in_production" BOOLEAN,
    "languages" TEXT,
    "episode_run_time" TEXT,
    "last_air_date" TEXT,
    "name" TEXT NOT NULL,
    "number_of_episodes" INTEGER,
    "number_of_seasons" INTEGER,
    "originCountry" TEXT,
    "original_language" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "overview" TEXT,
    "popularity" DOUBLE PRECISION,
    "poster_path" TEXT,
    "status" TEXT,
    "tagline" TEXT,
    "type" TEXT,
    "vote_average" DOUBLE PRECISION,
    "vote_count" INTEGER,
    "last_fetched_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "last_episode_to_air_id" INTEGER,
    "next_episode_to_air_id" INTEGER,

    CONSTRAINT "tv_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_seasons" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "air_date" TEXT,
    "episode_count" INTEGER,
    "name" TEXT NOT NULL,
    "overview" TEXT,
    "poster_path" TEXT,
    "season_number" INTEGER NOT NULL,
    "vote_average" DOUBLE PRECISION,
    "tv_series_id" INTEGER NOT NULL,

    CONSTRAINT "tv_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_episodes" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "air_date" TEXT,
    "episode_number" INTEGER NOT NULL,
    "episode_type" TEXT,
    "name" TEXT NOT NULL,
    "overview" TEXT,
    "production_code" TEXT,
    "runtime" INTEGER,
    "season_number" INTEGER NOT NULL,
    "show_id" INTEGER NOT NULL,
    "still_path" TEXT,
    "vote_average" DOUBLE PRECISION,
    "vote_count" INTEGER,
    "tv_season_id" INTEGER NOT NULL,

    CONSTRAINT "tv_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_series_genres" (
    "tvSeriesId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "tv_series_genres_pkey" PRIMARY KEY ("tvSeriesId","genreId")
);

-- CreateTable
CREATE TABLE "tv_series_networks" (
    "tvSeriesId" INTEGER NOT NULL,
    "networkId" INTEGER NOT NULL,

    CONSTRAINT "tv_series_networks_pkey" PRIMARY KEY ("tvSeriesId","networkId")
);

-- CreateTable
CREATE TABLE "tv_series_production_companies" (
    "tvSeriesId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "tv_series_production_companies_pkey" PRIMARY KEY ("tvSeriesId","companyId")
);

-- CreateTable
CREATE TABLE "tv_series_production_countries" (
    "tvSeriesId" INTEGER NOT NULL,
    "iso_3166_1" TEXT NOT NULL,

    CONSTRAINT "tv_series_production_countries_pkey" PRIMARY KEY ("tvSeriesId","iso_3166_1")
);

-- CreateTable
CREATE TABLE "tv_series_spoken_languages" (
    "tvSeriesId" INTEGER NOT NULL,
    "english_name" TEXT NOT NULL,

    CONSTRAINT "tv_series_spoken_languages_pkey" PRIMARY KEY ("tvSeriesId","english_name")
);

-- CreateTable
CREATE TABLE "tv_content_ratings" (
    "id" SERIAL NOT NULL,
    "tvSeriesId" INTEGER NOT NULL,
    "country_code" TEXT NOT NULL,
    "rating" TEXT NOT NULL,

    CONSTRAINT "tv_content_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_alternative_titles" (
    "id" SERIAL NOT NULL,
    "tvSeriesId" INTEGER NOT NULL,
    "country_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "tv_alternative_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episode_groups" (
    "id" TEXT NOT NULL,
    "tvSeriesId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" INTEGER NOT NULL,
    "episode_count" INTEGER NOT NULL,
    "group_count" INTEGER NOT NULL,
    "network_id" INTEGER,

    CONSTRAINT "episode_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episode_group_episodes" (
    "id" SERIAL NOT NULL,
    "groupId" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "group_order" INTEGER,

    CONSTRAINT "episode_group_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "biography" TEXT,
    "birthday" TEXT,
    "deathday" TEXT,
    "gender" INTEGER NOT NULL,
    "homepage" TEXT,
    "imdb_id" TEXT,
    "known_for_department" TEXT,
    "name" TEXT NOT NULL,
    "also_known_as" TEXT,
    "place_of_birth" TEXT,
    "popularity" DOUBLE PRECISION,
    "profile_path" TEXT,
    "last_fetched_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cast_credits" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "movieId" INTEGER,
    "tvSeriesId" INTEGER,
    "character" TEXT,
    "credit_id" TEXT,
    "order" INTEGER,
    "gender" INTEGER,
    "popularity" DOUBLE PRECISION,
    "profile_path" TEXT,
    "original_name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cast_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crew_credits" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "movieId" INTEGER,
    "tvSeriesId" INTEGER,
    "department" TEXT,
    "job" TEXT,
    "credit_id" TEXT,
    "gender" INTEGER,
    "popularity" DOUBLE PRECISION,
    "profile_path" TEXT,
    "original_name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crew_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_combined_credits" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "character" TEXT,
    "department" TEXT,
    "job" TEXT,
    "credit_id" TEXT,
    "title" TEXT,
    "overview" TEXT,
    "popularity" DOUBLE PRECISION,
    "release_date" TEXT,
    "vote_average" DOUBLE PRECISION,
    "vote_count" INTEGER,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "genre_ids" TEXT,
    "adult" BOOLEAN DEFAULT false,
    "video" BOOLEAN DEFAULT false,

    CONSTRAINT "person_combined_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_ids" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "imdb_id" TEXT,
    "tvdb_id" INTEGER,
    "freebase_id" TEXT,
    "freebase_mid" TEXT,
    "wikidata_id" TEXT,
    "facebook_id" TEXT,
    "instagram_id" TEXT,
    "twitter_id" TEXT,
    "tvrage_id" INTEGER,
    "tiktok_id" TEXT,
    "youtube_id" TEXT,

    CONSTRAINT "external_ids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_images" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "aspect_ratio" DOUBLE PRECISION,
    "height" INTEGER,
    "width" INTEGER,
    "iso_639_1" TEXT,
    "vote_average" DOUBLE PRECISION,
    "vote_count" INTEGER,
    "imageType" TEXT,
    "file_type" TEXT,

    CONSTRAINT "media_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_videos" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "type" TEXT,
    "iso_639_1" TEXT,
    "published_at" TIMESTAMP(3),
    "official" BOOLEAN DEFAULT false,

    CONSTRAINT "media_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translations" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "iso_639_1" TEXT NOT NULL,
    "iso_3166_1" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "english_name" TEXT,
    "data" TEXT,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" SERIAL NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "position" INTEGER,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "author_name" TEXT,
    "author_username" TEXT,
    "author_avatar_path" TEXT,
    "author_rating" INTEGER,
    "content" TEXT NOT NULL,
    "iso_639_1" TEXT,
    "media_type" TEXT NOT NULL,
    "media_id" INTEGER NOT NULL,
    "media_title" TEXT,
    "url" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_annotations" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "watchStatus" "WatchStatus",
    "personalRating" INTEGER,
    "current_episode" INTEGER,
    "total_episodes" INTEGER,
    "notes" TEXT,
    "watchDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist_items" (
    "id" SERIAL NOT NULL,
    "watchlistId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmdb_accounts" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "avatar_hash" TEXT,
    "avatar_path" TEXT,
    "iso_639_1" TEXT,
    "iso_3166_1" TEXT,
    "include_adult" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tmdb_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmdb_favorites" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "mediaId" INTEGER NOT NULL,

    CONSTRAINT "tmdb_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmdb_ratings" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "tmdb_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmdb_watchlists" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "mediaId" INTEGER NOT NULL,

    CONSTRAINT "tmdb_watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tmdb_lists" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT,
    "item_count" INTEGER,
    "favorite_count" INTEGER,
    "iso_639_1" TEXT,
    "list_type" TEXT NOT NULL,
    "poster_path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tmdb_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trending_items" (
    "id" SERIAL NOT NULL,
    "mediaType" TEXT NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "timeWindow" TEXT NOT NULL,
    "position" INTEGER,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trending_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tv_series_watch_providers" (
    "tvSeriesId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "provider_type" TEXT DEFAULT 'flatrate',

    CONSTRAINT "tv_series_watch_providers_pkey" PRIMARY KEY ("tvSeriesId","providerId")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" SERIAL NOT NULL,
    "entity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "details" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "method" TEXT NOT NULL,
    "ip" VARCHAR(45),
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "password_hash" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "certifications_country_code_certification_mediaType_key" ON "certifications"("country_code", "certification", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "movies_tmdbId_key" ON "movies"("tmdbId");

-- CreateIndex
CREATE INDEX "movies_tmdbId_idx" ON "movies"("tmdbId");

-- CreateIndex
CREATE INDEX "movies_title_idx" ON "movies"("title");

-- CreateIndex
CREATE INDEX "movies_release_date_idx" ON "movies"("release_date");

-- CreateIndex
CREATE INDEX "movies_popularity_idx" ON "movies"("popularity" DESC);

-- CreateIndex
CREATE INDEX "movies_vote_average_idx" ON "movies"("vote_average" DESC);

-- CreateIndex
CREATE INDEX "movies_title_release_date_idx" ON "movies"("title", "release_date");

-- CreateIndex
CREATE INDEX "movie_release_dates_movieId_idx" ON "movie_release_dates"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "movie_content_ratings_movieId_country_code_key" ON "movie_content_ratings"("movieId", "country_code");

-- CreateIndex
CREATE UNIQUE INDEX "movie_alternative_titles_movieId_country_code_key" ON "movie_alternative_titles"("movieId", "country_code");

-- CreateIndex
CREATE INDEX "tv_created_by_tmdb_id_idx" ON "tv_created_by"("tmdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "tv_series_tmdbId_key" ON "tv_series"("tmdbId");

-- CreateIndex
CREATE INDEX "tv_series_tmdbId_idx" ON "tv_series"("tmdbId");

-- CreateIndex
CREATE INDEX "tv_series_name_idx" ON "tv_series"("name");

-- CreateIndex
CREATE INDEX "tv_series_first_air_date_idx" ON "tv_series"("first_air_date");

-- CreateIndex
CREATE INDEX "tv_series_popularity_idx" ON "tv_series"("popularity" DESC);

-- CreateIndex
CREATE INDEX "tv_series_vote_average_idx" ON "tv_series"("vote_average" DESC);

-- CreateIndex
CREATE INDEX "tv_series_name_first_air_date_idx" ON "tv_series"("name", "first_air_date");

-- CreateIndex
CREATE UNIQUE INDEX "tv_seasons_tmdbId_key" ON "tv_seasons"("tmdbId");

-- CreateIndex
CREATE INDEX "tv_seasons_tmdbId_idx" ON "tv_seasons"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "tv_episodes_tmdbId_key" ON "tv_episodes"("tmdbId");

-- CreateIndex
CREATE INDEX "tv_episodes_tmdbId_idx" ON "tv_episodes"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "tv_content_ratings_tvSeriesId_country_code_key" ON "tv_content_ratings"("tvSeriesId", "country_code");

-- CreateIndex
CREATE UNIQUE INDEX "tv_alternative_titles_tvSeriesId_country_code_key" ON "tv_alternative_titles"("tvSeriesId", "country_code");

-- CreateIndex
CREATE UNIQUE INDEX "episode_group_episodes_groupId_episodeId_key" ON "episode_group_episodes"("groupId", "episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "persons_tmdbId_key" ON "persons"("tmdbId");

-- CreateIndex
CREATE INDEX "persons_tmdbId_idx" ON "persons"("tmdbId");

-- CreateIndex
CREATE INDEX "persons_name_idx" ON "persons"("name");

-- CreateIndex
CREATE INDEX "persons_popularity_idx" ON "persons"("popularity" DESC);

-- CreateIndex
CREATE INDEX "cast_credits_personId_idx" ON "cast_credits"("personId");

-- CreateIndex
CREATE INDEX "cast_credits_movieId_idx" ON "cast_credits"("movieId");

-- CreateIndex
CREATE INDEX "cast_credits_tvSeriesId_idx" ON "cast_credits"("tvSeriesId");

-- CreateIndex
CREATE INDEX "cast_credits_personId_movieId_idx" ON "cast_credits"("personId", "movieId");

-- CreateIndex
CREATE INDEX "cast_credits_personId_tvSeriesId_idx" ON "cast_credits"("personId", "tvSeriesId");

-- CreateIndex
CREATE INDEX "crew_credits_personId_idx" ON "crew_credits"("personId");

-- CreateIndex
CREATE INDEX "crew_credits_movieId_idx" ON "crew_credits"("movieId");

-- CreateIndex
CREATE INDEX "crew_credits_tvSeriesId_idx" ON "crew_credits"("tvSeriesId");

-- CreateIndex
CREATE INDEX "crew_credits_personId_movieId_idx" ON "crew_credits"("personId", "movieId");

-- CreateIndex
CREATE INDEX "crew_credits_personId_tvSeriesId_idx" ON "crew_credits"("personId", "tvSeriesId");

-- CreateIndex
CREATE UNIQUE INDEX "person_combined_credits_personId_mediaType_mediaId_key" ON "person_combined_credits"("personId", "mediaType", "mediaId");

-- CreateIndex
CREATE INDEX "external_ids_entityType_entityId_idx" ON "external_ids"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "external_ids_entityType_entityId_key" ON "external_ids"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "media_images_entityType_entityId_idx" ON "media_images"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "media_videos_entityType_entityId_idx" ON "media_videos"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "translations_entityType_entityId_idx" ON "translations"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "translations_entityType_entityId_iso_639_1_iso_3166_1_key" ON "translations"("entityType", "entityId", "iso_639_1", "iso_3166_1");

-- CreateIndex
CREATE INDEX "recommendations_sourceType_sourceId_idx" ON "recommendations"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_sourceType_sourceId_targetId_key" ON "recommendations"("sourceType", "sourceId", "targetId");

-- CreateIndex
CREATE INDEX "reviews_media_type_media_id_idx" ON "reviews"("media_type", "media_id");

-- CreateIndex
CREATE INDEX "user_annotations_userId_idx" ON "user_annotations"("userId");

-- CreateIndex
CREATE INDEX "user_annotations_userId_entityType_idx" ON "user_annotations"("userId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "user_annotations_userId_entityType_entityId_key" ON "user_annotations"("userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "watchlists_userId_idx" ON "watchlists"("userId");

-- CreateIndex
CREATE INDEX "watchlist_items_watchlistId_idx" ON "watchlist_items"("watchlistId");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_items_watchlistId_entityType_entityId_key" ON "watchlist_items"("watchlistId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "tmdb_accounts_tmdbId_key" ON "tmdb_accounts"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "tmdb_favorites_accountId_entityType_mediaId_key" ON "tmdb_favorites"("accountId", "entityType", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "tmdb_ratings_accountId_entityType_mediaId_key" ON "tmdb_ratings"("accountId", "entityType", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "tmdb_watchlists_accountId_entityType_mediaId_key" ON "tmdb_watchlists"("accountId", "entityType", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "tmdb_lists_tmdbId_key" ON "tmdb_lists"("tmdbId");

-- CreateIndex
CREATE INDEX "trending_items_timeWindow_position_idx" ON "trending_items"("timeWindow", "position");

-- CreateIndex
CREATE UNIQUE INDEX "trending_items_mediaType_mediaId_timeWindow_key" ON "trending_items"("mediaType", "mediaId", "timeWindow");

-- CreateIndex
CREATE INDEX "sync_logs_started_at_idx" ON "sync_logs"("started_at");

-- CreateIndex
CREATE INDEX "login_logs_user_id_idx" ON "login_logs"("user_id");

-- CreateIndex
CREATE INDEX "login_logs_created_at_idx" ON "login_logs"("created_at");

-- CreateIndex
CREATE INDEX "login_logs_email_idx" ON "login_logs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "production_companies" ADD CONSTRAINT "production_companies_parent_company_id_fkey" FOREIGN KEY ("parent_company_id") REFERENCES "production_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_keywords" ADD CONSTRAINT "movie_keywords_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_keywords" ADD CONSTRAINT "movie_keywords_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_watch_providers" ADD CONSTRAINT "movie_watch_providers_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_watch_providers" ADD CONSTRAINT "movie_watch_providers_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "watch_providers"("provider_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_production_companies" ADD CONSTRAINT "movie_production_companies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_production_companies" ADD CONSTRAINT "movie_production_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "production_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_production_countries" ADD CONSTRAINT "movie_production_countries_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_production_countries" ADD CONSTRAINT "movie_production_countries_iso_3166_1_fkey" FOREIGN KEY ("iso_3166_1") REFERENCES "production_countries"("iso_3166_1") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_spoken_languages" ADD CONSTRAINT "movie_spoken_languages_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_spoken_languages" ADD CONSTRAINT "movie_spoken_languages_english_name_fkey" FOREIGN KEY ("english_name") REFERENCES "spoken_languages"("english_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_movies" ADD CONSTRAINT "collection_movies_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_movies" ADD CONSTRAINT "collection_movies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_release_dates" ADD CONSTRAINT "movie_release_dates_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_content_ratings" ADD CONSTRAINT "movie_content_ratings_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_alternative_titles" ADD CONSTRAINT "movie_alternative_titles_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_created_by" ADD CONSTRAINT "tv_created_by_tv_series_id_fkey" FOREIGN KEY ("tv_series_id") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series" ADD CONSTRAINT "tv_series_last_episode_to_air_id_fkey" FOREIGN KEY ("last_episode_to_air_id") REFERENCES "tv_episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series" ADD CONSTRAINT "tv_series_next_episode_to_air_id_fkey" FOREIGN KEY ("next_episode_to_air_id") REFERENCES "tv_episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_seasons" ADD CONSTRAINT "tv_seasons_tv_series_id_fkey" FOREIGN KEY ("tv_series_id") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_episodes" ADD CONSTRAINT "tv_episodes_tv_season_id_fkey" FOREIGN KEY ("tv_season_id") REFERENCES "tv_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_genres" ADD CONSTRAINT "tv_series_genres_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_genres" ADD CONSTRAINT "tv_series_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_networks" ADD CONSTRAINT "tv_series_networks_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_networks" ADD CONSTRAINT "tv_series_networks_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "tv_networks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_production_companies" ADD CONSTRAINT "tv_series_production_companies_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_production_companies" ADD CONSTRAINT "tv_series_production_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "production_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_production_countries" ADD CONSTRAINT "tv_series_production_countries_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_production_countries" ADD CONSTRAINT "tv_series_production_countries_iso_3166_1_fkey" FOREIGN KEY ("iso_3166_1") REFERENCES "production_countries"("iso_3166_1") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_spoken_languages" ADD CONSTRAINT "tv_series_spoken_languages_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_spoken_languages" ADD CONSTRAINT "tv_series_spoken_languages_english_name_fkey" FOREIGN KEY ("english_name") REFERENCES "spoken_languages"("english_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_content_ratings" ADD CONSTRAINT "tv_content_ratings_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_alternative_titles" ADD CONSTRAINT "tv_alternative_titles_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_groups" ADD CONSTRAINT "episode_groups_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_group_episodes" ADD CONSTRAINT "episode_group_episodes_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "episode_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_group_episodes" ADD CONSTRAINT "episode_group_episodes_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "tv_episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cast_credits" ADD CONSTRAINT "cast_credits_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cast_credits" ADD CONSTRAINT "cast_credits_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cast_credits" ADD CONSTRAINT "cast_credits_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crew_credits" ADD CONSTRAINT "crew_credits_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crew_credits" ADD CONSTRAINT "crew_credits_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crew_credits" ADD CONSTRAINT "crew_credits_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_combined_credits" ADD CONSTRAINT "person_combined_credits_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_annotations" ADD CONSTRAINT "user_annotations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "watchlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tmdb_favorites" ADD CONSTRAINT "tmdb_favorites_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "tmdb_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tmdb_ratings" ADD CONSTRAINT "tmdb_ratings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "tmdb_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tmdb_watchlists" ADD CONSTRAINT "tmdb_watchlists_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "tmdb_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tmdb_lists" ADD CONSTRAINT "tmdb_lists_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "tmdb_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_watch_providers" ADD CONSTRAINT "tv_series_watch_providers_tvSeriesId_fkey" FOREIGN KEY ("tvSeriesId") REFERENCES "tv_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tv_series_watch_providers" ADD CONSTRAINT "tv_series_watch_providers_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "watch_providers"("provider_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
