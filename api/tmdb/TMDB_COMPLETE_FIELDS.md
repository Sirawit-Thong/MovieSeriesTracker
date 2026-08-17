# TMDB API — Complete Response Fields Reference

Extracted from all API documentation files.

---

## 05-MOVIE

### `GET /3/movie/changes`
- `results[].id` — integer
- `results[].adult` — boolean, nullable
- `page` — integer
- `total_pages` — integer
- `total_results` — integer

### `GET /3/movie/now_playing`
- `dates.maximum` — string
- `dates.minimum` — string
- `page` — integer
- `results[].adult` — boolean
- `results[].backdrop_path` — string
- `results[].genre_ids[]` — array of integer
- `results[].id` — integer
- `results[].original_language` — string
- `results[].original_title` — string
- `results[].overview` — string
- `results[].popularity` — number
- `results[].poster_path` — string
- `results[].release_date` — string
- `results[].title` — string
- `results[].video` — boolean
- `results[].vote_average` — number
- `results[].vote_count` — integer
- `total_pages` — integer
- `total_results` — integer

### `GET /3/movie/popular`
- `page` — integer
- `results[].adult` — boolean
- `results[].backdrop_path` — string
- `results[].genre_ids[]` — array of integer
- `results[].id` — integer
- `results[].original_language` — string
- `results[].original_title` — string
- `results[].overview` — string
- `results[].popularity` — number
- `results[].poster_path` — string
- `results[].release_date` — string
- `results[].title` — string
- `results[].video` — boolean
- `results[].vote_average` — number
- `results[].vote_count` — integer
- `total_pages` — integer
- `total_results` — integer

### `GET /3/movie/top_rated`
(Same schema as popular)

### `GET /3/movie/upcoming`
- `dates.maximum` — string
- `dates.minimum` — string
- `page` — integer
- `results[]` — (same movie item schema as now_playing)
- `total_pages` — integer
- `total_results` — integer

### `GET /3/movie/{movie_id}`
- `adult` — boolean
- `backdrop_path` — string
- `belongs_to_collection.id` — integer
- `belongs_to_collection.name` — string
- `belongs_to_collection.poster_path` — string
- `belongs_to_collection.backdrop_path` — string
- `budget` — integer
- `genres[].id` — integer
- `genres[].name` — string
- `homepage` — string
- `id` — integer
- `imdb_id` — string
- `origin_country[]` — array of string
- `original_language` — string
- `original_title` — string
- `overview` — string
- `popularity` — number
- `poster_path` — string
- `production_companies[].id` — integer
- `production_companies[].logo_path` — string
- `production_companies[].name` — string
- `production_companies[].origin_country` — string
- `production_countries[].iso_3166_1` — string
- `production_countries[].name` — string
- `release_date` — string
- `revenue` — integer
- `runtime` — integer
- `spoken_languages[].english_name` — string
- `spoken_languages[].iso_639_1` — string
- `spoken_languages[].name` — string
- `status` — string
- `tagline` — string
- `title` — string
- `video` — boolean
- `vote_average` — number
- `vote_count` — integer

### `GET /3/movie/{movie_id}/account_states`
- `id` — integer
- `favorite` — boolean
- `rated.value` — integer
- `watchlist` — boolean

### `GET /3/movie/{movie_id}/alternative_titles`
- `id` — integer
- `titles[].iso_3166_1` — string
- `titles[].title` — string
- `titles[].type` — string

### `GET /3/movie/{movie_id}/changes`
- `changes[].key` — string
- `changes[].items[].id` — string
- `changes[].items[].action` — string
- `changes[].items[].time` — string
- `changes[].items[].iso_639_1` — string
- `changes[].items[].iso_3166_1` — string
- `changes[].items[].value` — object

### `GET /3/movie/{movie_id}/credits`
- `id` — integer
- `cast[].adult` — boolean
- `cast[].gender` — integer
- `cast[].id` — integer
- `cast[].known_for_department` — string
- `cast[].name` — string
- `cast[].original_name` — string
- `cast[].popularity` — number
- `cast[].profile_path` — string
- `cast[].cast_id` — integer
- `cast[].character` — string
- `cast[].credit_id` — string
- `cast[].order` — integer
- `crew[].department` — string
- `crew[].job` — string
- `crew[].credit_id` — string
- `crew[].adult` — boolean
- `crew[].gender` — integer
- `crew[].id` — integer
- `crew[].known_for_department` — string
- `crew[].name` — string
- `crew[].original_name` — string
- `crew[].popularity` — number
- `crew[].profile_path` — string

### `GET /3/movie/{movie_id}/external_ids`
(Truncated in source but standard TMDB fields):
- `id` — integer
- `imdb_id` — string
- `facebook_id` — string, nullable
- `instagram_id` — string, nullable
- `twitter_id` — string, nullable

### `GET /3/movie/{movie_id}/images`
(Truncated in source but standard TMDB fields):
- `id` — integer
- `backdrops[].aspect_ratio` — number
- `backdrops[].height` — integer
- `backdrops[].iso_639_1` — string/object, nullable
- `backdrops[].file_path` — string
- `backdrops[].vote_average` — number
- `backdrops[].vote_count` — integer
- `backdrops[].width` — integer
- `posters[].aspect_ratio` — number
- `posters[].height` — integer
- `posters[].iso_639_1` — string, nullable
- `posters[].file_path` — string
- `posters[].vote_average` — number
- `posters[].vote_count` — integer
- `posters[].width` — integer
- `logos[].aspect_ratio` — number
- `logos[].height` — integer
- `logos[].iso_639_1` — string, nullable
- `logos[].file_path` — string
- `logos[].vote_average` — number
- `logos[].vote_count` — integer
- `logos[].width` — integer

### `GET /3/movie/{movie_id}/keywords`
- `id` — integer
- `keywords[].id` — integer
- `keywords[].name` — string

### `GET /3/movie/{movie_id}/release_dates`
- `id` — integer
- `results[].iso_3166_1` — string
- `results[].release_dates[].certification` — string
- `results[].release_dates[].descriptors[]` — array of string
- `results[].release_dates[].iso_639_1` — string
- `results[].release_dates[].release_date` — string
- `results[].release_dates[].type` — integer

### `GET /3/movie/{movie_id}/reviews`
- `id` — integer
- `page` — integer
- `results[].author` — string
- `results[].author_details.avatar_path` — string, nullable
- `results[].author_details.name` — string
- `results[].author_details.rating` — integer, nullable
- `results[].author_details.username` — string
- `results[].content` — string
- `results[].created_at` — string
- `results[].id` — string
- `results[].iso_639_1` — string
- `results[].media_id` — integer
- `results[].media_title` — string
- `results[].media_type` — string
- `results[].updated_at` — string
- `results[].url` — string
- `total_pages` — integer
- `total_results` — integer

### `GET /3/movie/{movie_id}/similar`
(Same schema as movie list results)

### `GET /3/movie/{movie_id}/recommendations`
(Same schema as movie list results)

### `GET /3/movie/{movie_id}/videos`
- `id` — integer
- `results[].iso_639_1` — string
- `results[].iso_3166_1` — string
- `results[].name` — string
- `results[].key` — string
- `results[].site` — string
- `results[].size` — integer
- `results[].type` — string
- `results[].official` — boolean
- `results[].published_at` — string
- `results[].id` — string

### `GET /3/movie/{movie_id}/watch/providers`
- `id` — integer
- `results.{country_code}.link` — string
- `results.{country_code}.flatrate[].provider_id` — integer
- `results.{country_code}.flatrate[].provider_name` — string
- `results.{country_code}.flatrate[].logo_path` — string
- `results.{country_code}.flatrate[].display_priority` — integer
- `results.{country_code}.rent[].provider_id` — integer
- `results.{country_code}.rent[].provider_name` — string
- `results.{country_code}.rent[].logo_path` — string
- `results.{country_code}.rent[].display_priority` — integer
- `results.{country_code}.buy[].provider_id` — integer
- `results.{country_code}.buy[].provider_name` — string
- `results.{country_code}.buy[].logo_path` — string
- `results.{country_code}.buy[].display_priority` — integer

### `GET /3/movie/{movie_id}/translations`
- `id` — integer
- `translations[].iso_3166_1` — string
- `translations[].iso_639_1` — string
- `translations[].name` — string
- `translations[].english_name` — string
- `translations[].data.title` — string
- `translations[].data.overview` — string
- `translations[].data.homepage` — string

### `GET /3/movie/{movie_id}/content_ratings`
- `id` — integer
- `results[].iso_3166_1` — string
- `results[].certification` — string
- `results[].descriptors[]` — array of string

---

## 06-TV

### `GET /3/tv/changes`
- `results[].id` — integer
- `results[].adult` — boolean, nullable
- `page` — integer
- `total_pages` — integer
- `total_results` — integer

### `GET /3/tv/airing_today`
- `page` — integer
- `results[].backdrop_path` — string
- `results[].first_air_date` — string
- `results[].genre_ids[]` — array of integer
- `results[].id` — integer
- `results[].name` — string
- `results[].origin_country[]` — array of string
- `results[].original_language` — string
- `results[].original_name` — string
- `results[].overview` — string
- `results[].popularity` — number
- `results[].poster_path` — string
- `results[].vote_average` — number
- `results[].vote_count` — integer
- `total_pages` — integer
- `total_results` — integer

### `GET /3/tv/on_the_air`
(Same schema as airing_today)

### `GET /3/tv/popular`
(Same schema as airing_today)

### `GET /3/tv/top_rated`
(Same schema as airing_today)

### `GET /3/tv/{series_id}`
- `adult` — boolean
- `backdrop_path` — string
- `created_by[].id` — integer
- `created_by[].credit_id` — string
- `created_by[].name` — string
- `created_by[].gender` — integer
- `created_by[].profile_path` — string
- `episode_run_time[]` — array of integer
- `first_air_date` — string
- `genres[].id` — integer
- `genres[].name` — string
- `homepage` — string
- `id` — integer
- `in_production` — boolean
- `languages[]` — array of string
- `last_air_date` — string
- `last_episode_to_air.id` — integer
- `last_episode_to_air.name` — string
- `last_episode_to_air.overview` — string
- `last_episode_to_air.vote_average` — number
- `last_episode_to_air.vote_count` — integer
- `last_episode_to_air.air_date` — string
- `last_episode_to_air.episode_number` — integer
- `last_episode_to_air.production_code` — string
- `last_episode_to_air.runtime` — integer
- `last_episode_to_air.season_number` — integer
- `last_episode_to_air.show_id` — integer
- `last_episode_to_air.still_path` — string
- `name` — string
- `next_episode_to_air` — object, nullable (same shape as last_episode_to_air)
- `networks[].id` — integer
- `networks[].logo_path` — string
- `networks[].name` — string
- `networks[].origin_country` — string
- `number_of_episodes` — integer
- `number_of_seasons` — integer
- `origin_country[]` — array of string
- `original_language` — string
- `original_name` — string
- `overview` — string
- `popularity` — number
- `poster_path` — string
- `production_companies[].id` — integer
- `production_companies[].logo_path` — string
- `production_companies[].name` — string
- `production_companies[].origin_country` — string
- `production_countries[].iso_3166_1` — string
- `production_countries[].name` — string
- `seasons[].air_date` — string
- `seasons[].episode_count` — integer
- `seasons[].id` — integer
- `seasons[].name` — string
- `seasons[].overview` — string
- `seasons[].poster_path` — string
- `seasons[].season_number` — integer
- `seasons[].vote_average` — number
- `spoken_languages[].english_name` — string
- `spoken_languages[].iso_639_1` — string
- `spoken_languages[].name` — string
- `status` — string
- `tagline` — string
- `type` — string
- `vote_average` — number
- `vote_count` — integer

### `GET /3/tv/{series_id}/account_states`
- `id` — integer
- `favorite` — boolean
- `rated.value` — integer
- `watchlist` — boolean

### `GET /3/tv/{series_id}/aggregate_credits`
- `cast[].adult` — boolean
- `cast[].gender` — integer
- `cast[].id` — integer
- `cast[].known_for_department` — string
- `cast[].name` — string
- `cast[].original_name` — string
- `cast[].popularity` — number
- `cast[].profile_path` — string
- `cast[].roles[].credit_id` — string
- `cast[].roles[].character` — string
- `cast[].roles[].episode_count` — integer
- `cast[].total_episode_count` — integer
- `cast[].order` — integer
- `crew[].department` — string
- `crew[].job` — string
- `crew[].credit_id` — string
- `crew[].adult` — boolean
- `crew[].gender` — integer
- `crew[].id` — integer
- `crew[].known_for_department` — string
- `crew[].name` — string
- `crew[].original_name` — string
- `crew[].popularity` — number
- `crew[].profile_path` — string
- `crew[].jobs[].credit_id` — string
- `crew[].jobs[].job` — string
- `crew[].jobs[].episode_count` — integer
- `crew[].total_episode_count` — integer
- `id` — integer

### `GET /3/tv/{series_id}/season/{season_number}`
- `_id` — string
- `air_date` — string
- `episodes[].air_date` — string
- `episodes[].episode_number` — integer
- `episodes[].episode_type` — string
- `episodes[].id` — integer
- `episodes[].name` — string
- `episodes[].overview` — string
- `episodes[].production_code` — string
- `episodes[].runtime` — integer
- `episodes[].season_number` — integer
- `episodes[].show_id` — integer
- `episodes[].still_path` — string
- `episodes[].vote_average` — number
- `episodes[].vote_count` — integer
- `episodes[].crew[].department` — string
- `episodes[].crew[].job` — string
- `episodes[].crew[].credit_id` — string
- `episodes[].crew[].adult` — boolean
- `episodes[].crew[].gender` — integer
- `episodes[].crew[].id` — integer
- `episodes[].crew[].known_for_department` — string
- `episodes[].crew[].name` — string
- `episodes[].crew[].original_name` — string
- `episodes[].crew[].popularity` — number
- `episodes[].crew[].profile_path` — string
- `episodes[].guest_stars[].character` — string
- `episodes[].guest_stars[].credit_id` — string
- `episodes[].guest_stars[].order` — integer
- `episodes[].guest_stars[].adult` — boolean
- `episodes[].guest_stars[].gender` — integer
- `episodes[].guest_stars[].id` — integer
- `episodes[].guest_stars[].known_for_department` — string
- `episodes[].guest_stars[].name` — string
- `episodes[].guest_stars[].original_name` — string
- `episodes[].guest_stars[].popularity` — number
- `episodes[].guest_stars[].profile_path` — string
- `name` — string
- `overview` — string
- `id` — integer
- `poster_path` — string
- `season_number` — integer

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}`
- `air_date` — string
- `crew[].department` — string
- `crew[].job` — string
- `crew[].credit_id` — string
- `crew[].adult` — boolean
- `crew[].gender` — integer
- `crew[].id` — integer
- `crew[].known_for_department` — string
- `crew[].name` — string
- `crew[].original_name` — string
- `crew[].popularity` — number
- `crew[].profile_path` — string
- `episode_number` — integer
- `guest_stars[].character` — string
- `guest_stars[].credit_id` — string
- `guest_stars[].order` — integer
- `guest_stars[].adult` — boolean
- `guest_stars[].gender` — integer
- `guest_stars[].id` — integer
- `guest_stars[].known_for_department` — string
- `guest_stars[].name` — string
- `guest_stars[].original_name` — string
- `guest_stars[].popularity` — number
- `guest_stars[].profile_path` — string
- `name` — string
- `overview` — string
- `id` — integer
- `production_code` — string
- `runtime` — integer
- `season_number` — integer
- `still_path` — string
- `vote_average` — number
- `vote_count` — integer

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/account_states`
- `id` — integer
- `favorite` — boolean
- `rated.value` — integer
- `watchlist` — boolean

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/credits`
- `cast[].adult` — boolean
- `cast[].gender` — integer
- `cast[].id` — integer
- `cast[].known_for_department` — string
- `cast[].name` — string
- `cast[].original_name` — string
- `cast[].popularity` — number
- `cast[].profile_path` — string
- `cast[].character` — string
- `cast[].credit_id` — string
- `cast[].order` — integer
- `crew[].department` — string
- `crew[].job` — string
- `crew[].credit_id` — string
- `crew[].adult` — boolean
- `crew[].gender` — integer
- `crew[].id` — integer
- `crew[].known_for_department` — string
- `crew[].name` — string
- `crew[].original_name` — string
- `crew[].popularity` — number
- `crew[].profile_path` — string
- `guest_stars[].character` — string
- `guest_stars[].credit_id` — string
- `guest_stars[].order` — integer
- `guest_stars[].adult` — boolean
- `guest_stars[].gender` — integer
- `guest_stars[].id` — integer
- `guest_stars[].known_for_department` — string
- `guest_stars[].name` — string
- `guest_stars[].original_name` — string
- `guest_stars[].popularity` — number
- `guest_stars[].profile_path` — string
- `id` — integer

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/external_ids`
- `id` — integer
- `imdb_id` — string
- `freebase_mid` — string
- `freebase_id` — string
- `tvdb_id` — integer
- `tvrage_id` — integer
- `wikidata_id` — string

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/images`
- `id` — integer
- `stills[].aspect_ratio` — number
- `stills[].height` — integer
- `stills[].iso_639_1` — object, nullable
- `stills[].file_path` — string
- `stills[].vote_average` — number
- `stills[].vote_count` — integer
- `stills[].width` — integer

### `GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/translations`
- `id` — integer
- `translations[].iso_3166_1` — string
- `translations[].iso_639_1` — string
- `translations[].name` — string
- `translations[].english_name` — string
- `translations[].data.name` — string
- `translations[].data.overview` — string

---

## 07-PERSON

### `GET /3/person/changes`
- `results[].id` — integer
- `results[].adult` — boolean, nullable
- `page` — integer
- `total_pages` — integer
- `total_results` — integer

### `GET /3/person/popular`
- `page` — integer
- `results[].adult` — boolean
- `results[].gender` — integer
- `results[].id` — integer
- `results[].known_for[].adult` — boolean
- `results[].known_for[].backdrop_path` — string
- `results[].known_for[].genre_ids[]` — array of integer
- `results[].known_for[].id` — integer
- `results[].known_for[].media_type` — string
- `results[].known_for[].original_language` — string
- `results[].known_for[].original_title` — string (movie)
- `results[].known_for[].original_name` — string (tv)
- `results[].known_for[].overview` — string
- `results[].known_for[].poster_path` — string
- `results[].known_for[].release_date` — string (movie)
- `results[].known_for[].first_air_date` — string (tv)
- `results[].known_for[].title` — string (movie)
- `results[].known_for[].name` — string (tv)
- `results[].known_for[].video` — boolean (movie)
- `results[].known_for[].vote_average` — number
- `results[].known_for[].vote_count` — integer
- `results[].known_for_department` — string
- `results[].name` — string
- `results[].popularity` — number
- `results[].profile_path` — string
- `total_pages` — integer
- `total_results` — integer

---

## 11-COLLECTION

### `GET /3/collection/{collection_id}`
- `id` — integer
- `name` — string
- `original_language` — string
- `original_name` — string
- `overview` — string
- `poster_path` — string
- `backdrop_path` — string
- `parts[].adult` — boolean
- `parts[].backdrop_path` — string
- `parts[].id` — integer
- `parts[].name` — string
- `parts[].original_name` — string
- `parts[].overview` — string
- `parts[].poster_path` — string
- `parts[].media_type` — string
- `parts[].original_language` — string
- `parts[].genre_ids[]` — array of integer
- `parts[].popularity` — number
- `parts[].release_date` — string
- `parts[].video` — boolean
- `parts[].vote_average` — number
- `parts[].vote_count` — integer

### `GET /3/collection/{collection_id}/images`
- `id` — integer
- `backdrops[].aspect_ratio` — number
- `backdrops[].height` — integer
- `backdrops[].iso_639_1` — object, nullable
- `backdrops[].file_path` — string
- `backdrops[].vote_average` — number
- `backdrops[].vote_count` — integer
- `backdrops[].width` — integer
- `posters[].aspect_ratio` — number
- `posters[].height` — integer
- `posters[].iso_639_1` — string, nullable
- `posters[].file_path` — string
- `posters[].vote_average` — number
- `posters[].vote_count` — integer
- `posters[].width` — integer

### `GET /3/collection/{collection_id}/translations`
- `id` — integer
- `translations[].iso_3166_1` — string
- `translations[].iso_639_1` — string
- `translations[].name` — string
- `translations[].english_name` — string
- `translations[].data.title` — string
- `translations[].data.overview` — string
- `translations[].data.homepage` — string

---

## 12-COMPANY

### `GET /3/company/{company_id}`
- `description` — string
- `headquarters` — string
- `homepage` — string
- `id` — integer
- `logo_path` — string
- `name` — string
- `origin_country` — string
- `parent_company` — object, nullable

### `GET /3/company/{company_id}/alternative_names`
- `id` — integer
- `results[].name` — string
- `results[].type` — string

### `GET /3/company/{company_id}/images`
- `id` — integer
- `logos[].aspect_ratio` — number
- `logos[].file_path` — string
- `logos[].height` — integer
- `logos[].id` — string
- `logos[].file_type` — string
- `logos[].vote_average` — number
- `logos[].vote_count` — integer
- `logos[].width` — integer

---

## 13-NETWORK

### `GET /3/network/{network_id}`
- `headquarters` — string
- `homepage` — string
- `id` — integer
- `logo_path` — string
- `name` — string
- `origin_country` — string

### `GET /3/network/{network_id}/alternative_names`
- `id` — integer
- `results[].name` — string
- `results[].type` — string

### `GET /3/network/{network_id}/images`
- `id` — integer
- `logos[].aspect_ratio` — number
- `logos[].file_path` — string
- `logos[].height` — integer
- `logos[].id` — string
- `logos[].file_type` — string
- `logos[].vote_average` — number
- `logos[].vote_count` — integer
- `logos[].width` — integer

---

## 16-REVIEW

### `GET /3/review/{review_id}`
- `id` — string
- `author` — string
- `author_details.name` — string
- `author_details.username` — string
- `author_details.avatar_path` — string
- `author_details.rating` — integer, nullable
- `content` — string
- `created_at` — string
- `iso_639_1` — string
- `media_id` — integer
- `media_title` — string
- `media_type` — string
- `updated_at` — string
- `url` — string

---

## 17-LIST

### `GET /3/list/{list_id}/item_status`
- `id` — integer
- `item_present` — boolean

### `GET /3/list/{list_id}`
- `created_by` — string
- `description` — string
- `favorite_count` — integer
- `id` — string
- `items[].adult` — boolean
- `items[].backdrop_path` — string
- `items[].genre_ids[]` — array of integer
- `items[].id` — integer
- `items[].media_type` — string
- `items[].original_language` — string
- `items[].original_title` — string
- `items[].overview` — string
- `items[].popularity` — number
- `items[].poster_path` — string
- `items[].release_date` — string
- `items[].title` — string
- `items[].video` — boolean
- `items[].vote_average` — number
- `items[].vote_count` — integer
- `item_count` — integer
- `name` — string
- `public` — boolean

---

## 20-WATCH PROVIDERS

### `GET /3/watch/providers/regions`
- `results[].iso_3166_1` — string
- `results[].english_name` — string
- `results[].native_name` — string

### `GET /3/watch/providers/movie`
- `results[].display_priorities` — object (keyed by country code, value = integer)
- `results[].display_priority` — integer
- `results[].logo_path` — string
- `results[].provider_name` — string
- `results[].provider_id` — integer

### `GET /3/watch/providers/tv`
(Same schema as movie providers)

---

## 21-CONFIGURATION

### `GET /3/configuration`
- `images.base_url` — string
- `images.secure_base_url` — string
- `images.backdrop_sizes[]` — array of string
- `images.logo_sizes[]` — array of string
- `images.poster_sizes[]` — array of string
- `images.profile_sizes[]` — array of string
- `images.still_sizes[]` — array of string
- `change_keys[]` — array of string

### `GET /3/configuration/countries`
- `iso_3166_1` — string
- `english_name` — string
- `native_name` — string

### `GET /3/configuration/jobs`
- `department` — string
- `jobs[]` — array of string

### `GET /3/configuration/languages`
- `iso_639_1` — string
- `english_name` — string
- `name` — string

### `GET /3/configuration/primary_translations`
(Array of string values)

### `GET /3/configuration/timezones`
- `iso_3166_1` — string
- `zones[]` — array of string
