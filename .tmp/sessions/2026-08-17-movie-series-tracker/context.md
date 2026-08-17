# Task Context: MovieSeriesTracker

Session ID: 2026-08-17-movie-series-tracker
Created: 2026-08-17T00:00:00Z
Status: in_progress

## Current Request
สร้างเว็บแอพสำหรับบันทึกซีรีย์และหนังที่เคยดู เก็บข้อมูลทุกอย่างจาก TMDB API ลงฐานข้อมูลท้องถิ่น (local-first) เพื่อแสดงผลได้ครบถ้วนโดยไม่ต้องพึ่ง API ภายนอก

## Context Files (Standards to Follow)
- C:/Users/thong/.config/opencode/context/core/standards/code-quality.md
- C:/Users/thong/.config/opencode/context/core/standards/typescript.md
- C:/Users/thong/.config/opencode/context/core/standards/test-coverage.md
- C:/Users/thong/.config/opencode/context/core/essential-patterns.md
- C:/Users/thong/.config/opencode/context/core/workflows/feature-breakdown.md
- C:/Users/thong/.config/opencode/context/development/principles/api-design.md
- C:/Users/thong/.config/opencode/context/development/principles/clean-code.md
- C:/Users/thong/.config/opencode/context/core/standards/security-patterns.md

## Reference Files (Source Material)
- D:/dev/MovieSeriesTracker/api/tmdb/README.md — Full TMDB API v3 endpoint listing (21 categories, 140+ endpoints)
- D:/dev/MovieSeriesTracker/api/tmdb/05-movie/README.md — Movie endpoints with full response schemas (14,120 lines)
- D:/dev/MovieSeriesTracker/api/tmdb/06-tv/README.md — TV series endpoints with schemas (24,601 lines)
- D:/dev/MovieSeriesTracker/api/tmdb/07-person/README.md — Person/actor endpoints with biographies (16,725 lines)
- D:/dev/MovieSeriesTracker/api/tmdb/08-search/README.md — Search endpoints
- D:/dev/MovieSeriesTracker/api/tmdb/09-discover/README.md — Discover endpoints
- D:/dev/MovieSeriesTracker/api/tmdb/14-genre/README.md — Genre data
- D:/dev/MovieSeriesTracker/api/tmdb/15-keyword/README.md — Keyword data
- D:/dev/MovieSeriesTracker/api/tmdb/20-watch-providers/README.md — Watch provider data

## External Docs Fetched
None needed — TMDB API docs are comprehensive locally in api/tmdb/

## Stack Decision
- **Framework**: Next.js 14+ (App Router)
- **Database**: Prisma ORM + SQLite (local dev) / PostgreSQL (production)
- **PWA**: next-pwa for offline support
- **Deployment**: Vercel (production) + Docker (local dev)
- **i18n**: Bilingual Thai/English UI

## Components
1. **TMDB Data Schema** — Prisma schema covering every field from TMDB API
   - Movies (22 endpoints worth of data)
   - TV Series (44 endpoints worth of data)
   - TV Seasons & Episodes
   - People/Actors (12 endpoints worth of data)
   - Genres, Keywords, Watch Providers
   - Collections, Companies, Networks
   - External IDs, Images, Videos
   - Reviews, Credits

2. **Data Ingestion Service** — Sync all data from TMDB to local DB
   - Full sync (bulk import)
   - Incremental sync (daily updates)
   - Rate limiting (TMDB: 40 req/10s)

3. **Local Database** — Complete data storage
   - Every column from every TMDB response schema
   - Proper relations and indexes
   - Full-text search support

4. **Next.js UI** — Bilingual web interface
   - Movie detail pages (all fields displayed)
   - TV series detail pages (seasons, episodes, cast)
   - Person/actor pages (biography, filmography, images)
   - Search & filter (full-text across all entities)
   - Trending, popular, top-rated views
   - Genre/keyword browsing
   - Watch provider info

5. **User Annotations** — Personal tracking
   - Watch status (watched, watching, want to watch, dropped)
   - Personal ratings (1-10)
   - Personal notes/reviews
   - Watchlists
   - Watch date tracking

6. **PWA** — Offline support
   - Service worker for cached pages
   - Offline browsing of stored data
   - Install prompt

7. **Docker** — Local development
   - Docker Compose for API + DB
   - Development environment setup

## TMDB Data Fields to Store (from API docs)

### Movie Fields
adult, backdrop_path, belongs_to_collection (id, name, poster_path, backdrop_path), budget, genres (id, name), homepage, id, imdb_id, origin_country, original_language, original_title, overview, popularity, poster_path, production_companies (id, logo_path, name, origin_country), production_countries (iso_3166_1, name), release_date, revenue, runtime, spoken_languages (english_name, iso_639_1, name), status, tagline, title, video, vote_average, vote_count

### TV Series Fields
adult, backdrop_path, created_by (id, credit_id, name, profile_path), episode_run_time, first_air_date, genres, homepage, id, in_production, languages, last_air_to_date, last_episode_to_air (air_date, episode_number, id, name, overview, production_code, season_number, still_path, vote_average, vote_count), name, next_episode_to_air, networks, number_of_episodes, number_of_seasons, origin_country, original_language, original_name, overview, popularity, poster_path, production_companies, production_countries, seasons (air_date, episode_count, id, name, overview, poster_path, season_number), spoken_languages, status, tagline, type, vote_average, vote_count

### Person Fields
also_known_as, biography, birthday, deathday, gender, homepage, id, imdb_id, name, place_of_birth, popularity, profile_path

## Constraints
- Must store EVERY field from TMDB API responses — no omissions
- Local-first: app must work fully offline after initial sync
- Bilingual Thai/English UI
- TMDB rate limit: 40 requests per 10 seconds
- SQLite for local dev, PostgreSQL for production
- Must be deployable to Vercel
- Docker Compose for local development

## Exit Criteria
- [ ] Prisma schema covers all TMDB fields (movies, TV, person, genres, keywords, etc.)
- [ ] Data ingestion service syncs all data from TMDB
- [ ] Next.js UI displays complete data for movies, series, and persons
- [ ] Full-text search works across all entities
- [ ] User can annotate watched status, ratings, notes, and watchlists
- [ ] Bilingual Thai/English UI works
- [ ] PWA offline support works
- [ ] Docker Compose setup works for local development
- [ ] App can be deployed to Vercel
