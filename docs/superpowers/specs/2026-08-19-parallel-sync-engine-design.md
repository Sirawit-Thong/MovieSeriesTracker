# Design: Unified Parallel Sync Engine

Date: 2026-08-19
Status: Approved

## Problem

Current full sync (`/api/admin/sync`) runs three sequential syncs
(`syncMovies`, `syncTvSeries`, `syncPersons`). Each only pulls TMDB IDs
from list endpoints (popular/top-rated, 5 pages each):

- Entities in the DB that are not on those lists are never re-fetched
  (e.g. an obscure movie a user saved to their library).
- No parallelism across entities — each sync waits for the previous one.
- All three functions duplicate the same batch loop pattern.

## Goals

1. Sync **all data recorded in the DB**: every row in `movies`,
   `tv_series`, `persons` gets re-fetched, plus everything users recorded
   in `user_annotations` / `watchlist_items`, plus new IDs from TMDB lists.
2. Run the sync with **multiple workers** (a central worker pool shared
   across all entity types).
3. Keep existing guarantees: single sync lock, heartbeat, cancellation,
   per-entity error tracking, SyncLog record.

## Scope of persons

Persons explode in size (every cast/crew member becomes a `Person` row).
Persons scope is limited to:

- Persons referenced by user records (annotations / watchlist items).
- Popular persons from TMDB list (5 pages).
- Persons appearing in credits of the movies/tv series in the work queue.

## Architecture

### Phase 1 — Work queue construction (new: `sync-queue.ts`)

Build a deduplicated list of `{entity: 'movie'|'tv'|'person', tmdbId: number}`:

1. **TMDB lists**: popular + top_rated movies (5 pages each), popular +
   top_rated TV (5 pages each), popular persons (5 pages) — same list
   sources as today.
2. **All DB rows**: `movie.tmdbId`, `tvSeries.tmdbId` — every existing
   record is queued for re-fetch.
3. **User entities**: `UserAnnotation` + `WatchlistItem`
   (`entityType` in `MOVIE`/`TV`/`PERSON`, `entityId` = internal DB id).
   Map internal id → `tmdbId` via the `Movie`/`TvSeries`/`Person` tables.
4. **Persons from credits**: distinct `personId` on `CastCredit` /
   `CrewCredit` rows whose `movieId`/`tvSeriesId` is in the queued media
   set (resolved after media queue is known).

Priority order (queue order): user-recorded entities first, then stale
DB rows (oldest `lastFetchedAt` first), then new IDs not in the DB.

### Phase 2 — Worker pool (new: `worker-pool.ts`)

- N workers (default 4, configurable) pull `{entity, tmdbId}` items from
  the shared queue via a simple in-process work queue.
- All workers share one `TmdbClient` (already defaults to
  `globalTmdbRateLimiter`, 40 req/10s), so the rate limit is enforced
  across the whole pool.
- Per item, dispatch to the existing upsert logic:
  `upsertMovie` / `upsertTvSeries` / `upsertPerson` (each fetches details
  + all sub-resources + credits).
- `shouldStop` (cancellation) is checked between items; heartbeat is
  touched periodically (reuse existing pattern from the admin route).

### Orchestrator (new: `full-sync.ts`)

`runFullSync(options)`:
1. Acquire sync lock (existing `acquireSyncLock`).
2. Build work queue (Phase 1).
3. Run worker pool (Phase 2) with progress + error collection.
4. Finish SyncLog with per-entity results (`details` JSON).

`/api/admin/sync` switches from calling `syncMovies`/`syncTvSeries`/
`syncPersons` sequentially to calling `runFullSync`. `entity` filter
(`all`/`movies`/`tv`/`persons`) is preserved by filtering the queue.

## Refactors to existing files

- `movie-sync.ts`: export `upsertMovie(tmdbMovie, client)` (currently
  module-private). `fetchAndUpsertMovie` keeps its signature (creates its
  own client).
- `tv-sync.ts`: export `upsertTvSeries(tmdbSeries, client)`.
- `person-sync.ts`: export `upsertPerson(tmdbPerson, client)`.
- Existing `syncMovies`/`syncTvSeries`/`syncPersons` stay untouched
  (still used elsewhere / backward compat).

## Files

New:
- `src/lib/ingestion/sync-queue.ts` — queue construction, dedupe, priority.
- `src/lib/ingestion/worker-pool.ts` — parallel executor.
- `src/lib/ingestion/full-sync.ts` — orchestrator (`runFullSync`).
- `src/lib/ingestion/sync-queue.test.ts`, `worker-pool.test.ts` — vitest.

Modified:
- `src/lib/ingestion/movie-sync.ts` — export `upsertMovie`.
- `src/lib/ingestion/tv-sync.ts` — export `upsertTvSeries`.
- `src/lib/ingestion/person-sync.ts` — export `upsertPerson`.
- `src/app/api/admin/sync/route.ts` — call `runFullSync`.

## Testing / Verification

- Vitest unit tests:
  - `sync-queue`: dedupe across sources, priority ordering, internal-id →
    tmdbId mapping for user entities, persons-from-credits resolution.
  - `worker-pool`: bounded concurrency (fake worker with delay), all items
    processed, cancellation stops the pool, errors collected per item.
- `npm run lint`, `npm run typecheck`, `npm run test`.

## Rate limit reality check

Each movie ≈ 12 TMDB requests (detail + ~10 sub-resources + credits).
At 40 req/10s ≈ 3 movies/10s ≈ 18 movies/min. A DB of ~1,000 movies
takes ≈ 55 min per full run. Cancellation remains available.