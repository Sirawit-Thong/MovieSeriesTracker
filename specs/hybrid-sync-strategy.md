# Hybrid Sync Strategy Spec

## Problem Statement

The app currently only shows data that was pre-synced via the admin panel (popular + top-rated, ~180 items/entity). When a user searches for or navigates to a movie/TV series/person that wasn't in the initial sync batch, they see nothing — the search returns empty and the detail page 404s. Users expect to find any title on TMDB, not just the most popular ones.

## Solution

A hybrid sync strategy with three layers:

1. **Batch sync (admin cron)** — Pre-populate popular/top-rated content for fast homepage and listing pages. Already working.
2. **On-demand fetch (user-triggered)** — When a user searches for or clicks on content not yet in the DB, fetch it from TMDB in real-time, store it, and return it. This is the "long tail" coverage.
3. **Stale-while-revalidate** — Fetched content gets a `lastFetchedAt` timestamp. When stale (>7 days), silently re-fetch in the background on next access.

## User Stories

1. As a user, I want to search for any movie on TMDB and see results, even if the admin hasn't synced it yet.
2. As a user, I want to click on a search result for a movie not in the DB and see its full detail page (poster, overview, cast, ratings, etc.).
3. As a user, I want search results to appear instantly — I don't want to wait for a TMDB fetch on every search.
4. As a user, I want the detail page to load fast even for on-demand fetched content.
5. As an admin, I want the batch sync to continue working for popular content so the homepage and listing pages are always populated.
6. As an admin, I want to control how often batch syncs run and how many items they fetch.
7. As a developer, I want the on-demand fetch to be transparent — the same detail page component should work whether the data was batch-synced or on-demand fetched.
8. As a user, I want stale content to be silently refreshed so I always see up-to-date ratings and metadata.
9. As a user, I want the app to work even if TMDB is temporarily down — previously fetched data should still be served from the DB.
10. As a user, I want the search bar to search both local DB AND TMDB simultaneously, showing merged results instantly.

## Implementation Decisions

### 1. Search: Dual-source with instant local + async TMDB

**Current flow**: `GET /api/search?q=query` → `searchAll(query)` → searches local DB only.

**New flow**:
- Search API queries local DB **and** TMDB multi-search in parallel
- Local results return immediately (fast)
- TMDB results are de-duplicated against local results by TMDB ID
- TMDB results that aren't in DB yet get stored asynchronously (fire-and-forget) so next access is instant
- The search response merges both sources, deduplicated by TMDB ID

**Key design**: The search API returns results from both sources. Local results have `source: "db"`, TMDB results have `source: "tmdb"`. The frontend renders them identically.

**TMDB search response mapping**:
- `media_type: "movie"` → map to movie card shape
- `media_type: "tv"` → map to TV card shape  
- `media_type: "person"` → map to person card shape
- `media_type: undefined` → skip (TMDB sometimes returns this)

### 2. Detail pages: Fetch-on-miss with DB fallback

**Current flow**: `GET /movie/[id]` → `prisma.movie.findUnique(where: {id})` → 404 if not found.

**New flow**:
- The detail page component should support lookup by **either** internal DB ID or TMDB ID
- When a user clicks a search result that came from TMDB (not yet in DB), the URL will be `/movie/tmdb/{tmdbId}` (or similar)
- A new `fetchOnMiss(entity, tmdbId)` function checks the DB first. If not found, fetches from TMDB, upserts, and returns the full data.
- The detail page then renders normally — no special casing needed.

**URL design**: Two URL patterns:
- `/movie/{dbId}` — direct DB lookup (existing, unchanged)
- `/movie/tmdb/{tmdbId}` — TMDB ID lookup, triggers on-demand fetch if needed

**Implementation**: A new middleware or route-level helper intercepts the `tmdb/` variant, calls `fetchOnMiss`, and redirects to the canonical `/movie/{dbId}` URL. This keeps the component code unchanged.

### 3. On-demand fetch service: `fetchOnMiss`

A new service function in `src/lib/ingestion/on-demand.ts`:

```
fetchOnMiss(entity: 'movie' | 'tv' | 'person', tmdbId: number): Promise<Movie | TvSeries | Person>
```

- Checks DB for existing record by `tmdbId`
- If found and `lastFetchedAt` > 7 days ago → triggers background re-fetch (returns stale data immediately)
- If found and fresh → returns directly
- If not found → fetches full details from TMDB (calls the same detail + sub-resource endpoints as batch sync), upserts, returns

**Rate limiting**: Uses the existing `TmdbRateLimiter` (40 req/10s). The on-demand fetch makes ~9 API calls per entity (detail + sub-resources). This is within limits for user-triggered fetches.

### 4. Stale-while-revalidate for detail pages

Add a `lastFetchedAt` (or use `updatedAt`) column concept. When the detail page is loaded:
- If `lastFetchedAt` > 7 days → return stale data immediately, trigger background re-fetch
- The background re-fetch updates the DB record silently
- Next page load gets fresh data

**This is NOT a blocking operation**. The user always sees data fast.

### 5. Schema changes

No new tables needed. Consider adding an index on `tmdbId` for all entity tables (already exists as unique constraint). Add a `lastSyncedAt` timestamp column to `Movie`, `TvSeries`, and `Person` for staleness tracking.

### 6. API route changes

| Route | Change |
|-------|--------|
| `GET /api/search` | Add TMDB multi-search in parallel with local search |
| `GET /api/movie/[id]` | Support `?source=tmdb&tmdbId=X` param for on-demand fetch |
| `GET /api/tv/[id]` | Same as above |
| `GET /api/person/[id]` | Same as above |
| `POST /api/admin/sync` | No change (batch sync stays as-is) |

### 7. Frontend changes

| Component | Change |
|-----------|--------|
| Search results | Render TMDB-only results with "New" badge, link to detail with tmdbId param |
| Movie detail page | Handle both DB ID and TMDB ID lookup |
| TV detail page | Same |
| Person detail page | Same |
| Listing pages | No change (still from local DB only) |

### 8. Caching strategy

- **Local DB** is the primary cache. Once fetched, data lives in PostgreSQL.
- **No Redis/in-memory cache needed** for v1. PostgreSQL is fast enough for reads.
- **Staleness**: 7-day window for re-validation. Configurable per entity type.
- **Background fetch**: Uses `setTimeout(0)` or `next/after` to not block the response. For server components, fetch-on-miss is synchronous (acceptable for single entity loads).

## Testing Decisions

- Test search with a query that has results in DB and results only on TMDB → verify merged, deduplicated results
- Test detail page for a movie in DB → verify it loads normally (no regression)
- Test detail page for a movie NOT in DB → verify it fetches from TMDB and renders
- Test search for a very obscure title → verify TMDB fallback works
- Test TMDB outage scenario → verify search still returns local results, detail page shows stale data
- Test batch sync still works after on-demand fetch changes
- Test rate limiting → verify no TMDB rate limit violations during normal usage

## Out of Scope

- Background cron jobs (Vercel cron or similar) — can be added later
- Redis caching layer
- Batch pre-fetch of search results (e.g., "pre-warm" popular searches)
- Incremental sync of metadata updates (e.g., vote average changes) — handled by staleness window
- Watch provider availability changes tracking
- User-initiated "add to DB" actions (admin-only sync for now)

## Further Notes

The key architectural principle is: **the DB is always the source of truth for rendering**. On-demand fetch is just a way to populate the DB transparently. This means:
- No special rendering logic for "fetched" vs "synced" content
- No dual data paths in components
- Simple, predictable behavior

The hybrid approach trades off some latency on first access (~2-3s for TMDB fetch) for complete coverage. Subsequent accesses are instant from DB.
