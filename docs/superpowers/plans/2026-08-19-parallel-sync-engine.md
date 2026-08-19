# Unified Parallel Sync Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sequential admin sync with a unified engine that builds a deduplicated work queue (TMDB lists + all DB rows + user-recorded entities + referenced persons) and processes it with a shared multi-worker pool.

**Architecture:** Three new files — `sync-queue.ts` (ID collection + dedupe + priority), `worker-pool.ts` (bounded-concurrency executor), `full-sync.ts` (orchestrator with lock/heartbeat/cancel) — plus small exports in the three existing sync services. The admin route calls `runFullSync()` instead of three sequential syncs.

**Tech Stack:** TypeScript, Next.js App Router route handlers, Prisma (PostgreSQL), vitest.

**Spec:** `docs/superpowers/specs/2026-08-19-parallel-sync-engine-design.md`

## Global Constraints

- Rate limit: TMDB `globalTmdbRateLimiter` = 40 req / 10s; all workers must share one `TmdbClient` so the limiter is global (default already shared).
- Persons scope: only user-recorded persons + popular persons + persons in credits of queued media. NEVER queue all `persons` table rows.
- `entity` filter values preserved: `all | movies | tv | persons`.
- Keep `syncMovies` / `syncTvSeries` / `syncPersons` / `fetchAndUpsert*` signatures backward-compatible — existing callers (`on-demand.ts`, `/api/sync`) must not break.
- TDD: write the failing test first, verify it fails, implement, verify it passes, commit.
- Verify with `npm run lint`, `npm run typecheck`, `npm run test`.

---

### Task 1: Export per-entity upsert functions (shared client support)

**Files:**
- Modify: `src/lib/ingestion/movie-sync.ts`
- Modify: `src/lib/ingestion/tv-sync.ts`
- Modify: `src/lib/ingestion/person-sync.ts`
- Test: `src/lib/ingestion/upsert-exports.test.ts`

**Interfaces:**
- Produces: `fetchAndUpsertMovie(tmdbId: number, client?: TmdbClient): Promise<number | null>`; `fetchAndUpsertTvSeries(tmdbId: number, client?: TmdbClient): Promise<number | null>`; `fetchAndUpsertPerson(tmdbId: number, client?: TmdbClient): Promise<number | null>` — optional client param, default `new TmdbClient({ language: 'en-US' })`. Also exports `upsertMovie`, `upsertTvSeries`, `upsertPerson` (see step 1). Later tasks call these with a shared client.

- [ ] **Step 1: Add exports + optional client param to the three sync services**

`src/lib/ingestion/movie-sync.ts`:
```ts
// change line 443: async function upsertMovie( -> export async function upsertMovie(
// change line 703:
export async function fetchAndUpsertMovie(tmdbId: number, client?: TmdbClient): Promise<number | null> {
  const tmdbClient = client ?? new TmdbClient({ language: 'en-US' });
  // replace both `client.` uses inside with `tmdbClient.`
}
```
- Line 443: `async function upsertMovie(tmdbMovie: TmdbMovie, client: TmdbClient)` → add `export`.
- Line 703: `fetchAndUpsertMovie(tmdbId: number)` → add `client?: TmdbClient` param, create `const tmdbClient = client ?? new TmdbClient({ language: 'en-US' });`, and replace the two `client.` references inside (line 708 `client.getMovieDetails`, line 712 `upsertMovie(tmdbMovie, client)`) with `tmdbClient`.

`src/lib/ingestion/person-sync.ts`:
- Line 58: `async function upsertPerson(person: TmdbPerson, client: TmdbClient)` → add `export`.
- Line 317: `fetchAndUpsertPerson(tmdbId: number)` → add `client?: TmdbClient` param; `const tmdbClient = client ?? new TmdbClient({ language: 'en-US' });`; replace `client.getPersonDetails(tmdbId)` (line 321) and `upsertPerson(tmdbPerson, client)` (line 324) with `tmdbClient`.

`src/lib/ingestion/tv-sync.ts`:
- Add after line 818 (before the `// Public API` section), a client-accepting upsert wrapper:
```ts
export async function upsertTvSeries(tmdbSeries: TmdbTvSeries, client: TmdbClient): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      await upsertTvSeriesWithNestedData(tmdbSeries, tx);
    },
    { timeout: 30000 },
  );
  await syncTvSubResources(tmdbSeries, client);
}
```
- Line 1037: `fetchAndUpsertTvSeries(tmdbId: number)` → add `client?: TmdbClient` param; `const tmdbClient = client ?? new TmdbClient({ language: 'en-US' });`; replace the `client.` references inside (lines 1041, 1051) with `tmdbClient`. Optionally inline the wrapper body there via `upsertTvSeries(tmdbSeries, tmdbClient)`.

- [ ] **Step 2: Write the failing test**

`src/lib/ingestion/upsert-exports.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { fetchAndUpsertMovie } from './movie-sync';
import { fetchAndUpsertTvSeries } from './tv-sync';
import { fetchAndUpsertPerson } from './person-sync';

const mocks = vi.hoisted(() => ({
  getMovieDetails: vi.fn(),
  getTvDetails: vi.fn(),
  getPersonDetails: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock('../tmdb/client', () => ({
  TmdbClient: vi.fn().mockImplementation(() => ({
    getMovieDetails: mocks.getMovieDetails,
    getTvDetails: mocks.getTvDetails,
    getPersonDetails: mocks.getPersonDetails,
    getMovieAlternativeTitles: vi.fn().mockResolvedValue({ titles: [] }),
    getMovieContentRatings: vi.fn().mockResolvedValue({ results: [] }),
    getMovieImages: vi.fn().mockResolvedValue({ backdrops: [], posters: [] }),
    getMovieVideos: vi.fn().mockResolvedValue({ results: [] }),
    getMovieExternalIds: vi.fn().mockResolvedValue({}),
    getMovieReleaseDates: vi.fn().mockResolvedValue({ results: [] }),
    getMovieRecommendations: vi.fn().mockResolvedValue({ results: [] }),
    getMovieWatchProviders: vi.fn().mockResolvedValue({ results: {} }),
    getMovieTranslations: vi.fn().mockResolvedValue({ translations: [] }),
    getMovieSimilar: vi.fn().mockResolvedValue({ results: [] }),
  })),
}));

vi.mock('../db', () => ({
  default: {
    movie: {
      findUnique: mocks.findUnique,
      upsert: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({})),
    mediaImage: { deleteMany: vi.fn() },
    mediaVideo: { deleteMany: vi.fn() },
    externalId: { upsert: vi.fn() },
    // add minimal mocks for any other model the movie upsert path touches
  },
}));

describe('fetchAndUpsert* optional client', () => {
  it('accepts an injected client', async () => {
    mocks.getMovieDetails.mockResolvedValue({ id: 123, title: 'Test', genres: [], production_companies: [], production_countries: [], spoken_languages: [], belongs_to_collection: null });
    mocks.findUnique.mockResolvedValue({ id: 1 });
    const injected = { getMovieDetails: vi.fn().mockResolvedValue({ id: 123, title: 'Test', genres: [], production_companies: [], production_countries: [], spoken_languages: [], belongs_to_collection: null }) };
    const id = await fetchAndUpsertMovie(123, injected as never);
    expect(id).toBe(1);
  });
});
```
Note: if `upsertMovie`'s transaction path makes additional DB calls, extend the mock object to cover every model referenced in `movie-sync.ts` (they can all be `vi.fn()` resolving `[]` / `{}`). Same principle applies for tv/person tests — add `it` cases asserting `fetchAndUpsertTvSeries(456, client)` and `fetchAndUpsertPerson(789, client)` call the injected client's methods, not a fresh one.

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/ingestion/upsert-exports.test.ts`
Expected: FAIL — `TypeError: tmdbClient.getMovieDetails is not a function` or compile error about the new param.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/ingestion/upsert-exports.test.ts`
Expected: PASS (3 cases).

- [ ] **Step 5: Verify no regression**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/ingestion/movie-sync.ts src/lib/ingestion/tv-sync.ts src/lib/ingestion/person-sync.ts src/lib/ingestion/upsert-exports.test.ts
git commit -m "feat(sync): export per-entity upsert fns with optional shared client"
```

---

### Task 2: Work queue construction (`sync-queue.ts`)

**Files:**
- Create: `src/lib/ingestion/sync-queue.ts`
- Test: `src/lib/ingestion/sync-queue.test.ts`

**Interfaces:**
- Consumes: `TmdbClient` from `@/lib/tmdb/client` with methods `getPopularMovies(page)`, `getTopRatedMovies(page)`, `getPopularTv(page)`, `getTopRatedTv(page)`, `getPopularPersons(page)` — each returns `{ results: Array<{ id: number }> }`.
- Produces:
```ts
export type SyncEntity = 'movie' | 'tv' | 'person';
export interface WorkItem { entity: SyncEntity; tmdbId: number; }
export interface BuildQueueOptions {
  entity: 'all' | 'movies' | 'tv' | 'persons';
  client: TmdbClient;
  shouldStop?: () => Promise<boolean>;
}
export async function buildSyncQueue(opts: BuildQueueOptions): Promise<WorkItem[]>
```
Queue order: user-recorded items first → remaining DB rows (oldest `lastFetchedAt` first) → list-only IDs (new). Fully deduplicated.

- [ ] **Step 1: Write the failing test**

`src/lib/ingestion/sync-queue.test.ts` — mock `../db` with hoisted mocks (pattern from `sync-lock.test.ts`):
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildSyncQueue } from './sync-queue';

const mocks = vi.hoisted(() => ({
  movieFindMany: vi.fn(),
  tvFindMany: vi.fn(),
  personFindMany: vi.fn(),
  annotationFindMany: vi.fn(),
  watchlistItemFindMany: vi.fn(),
  castCreditFindMany: vi.fn(),
  crewCreditFindMany: vi.fn(),
}));

vi.mock('../db', () => ({
  default: {
    movie: { findMany: mocks.movieFindMany },
    tvSeries: { findMany: mocks.tvFindMany },
    person: { findMany: mocks.personFindMany },
    userAnnotation: { findMany: mocks.annotationFindMany },
    watchlistItem: { findMany: mocks.watchlistItemFindMany },
    castCredit: { findMany: mocks.castCreditFindMany },
    crewCredit: { findMany: mocks.crewCreditFindMany },
  },
}));

function makeClient() {
  return {
    getPopularMovies: vi.fn().mockResolvedValue({ results: [{ id: 100 }, { id: 101 }] }),
    getTopRatedMovies: vi.fn().mockResolvedValue({ results: [{ id: 101 }, { id: 102 }] }),
    getPopularTv: vi.fn().mockResolvedValue({ results: [{ id: 200 }, { id: 201 }] }),
    getTopRatedTv: vi.fn().mockResolvedValue({ results: [{ id: 201 }, { id: 202 }] }),
    getPopularPersons: vi.fn().mockResolvedValue({ results: [{ id: 300 }, { id: 301 }] }),
  } as never;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.movieFindMany.mockResolvedValue([]);
  mocks.tvFindMany.mockResolvedValue([]);
  mocks.personFindMany.mockResolvedValue([]);
  mocks.annotationFindMany.mockResolvedValue([]);
  mocks.watchlistItemFindMany.mockResolvedValue([]);
  mocks.castCreditFindMany.mockResolvedValue([]);
  mocks.crewCreditFindMany.mockResolvedValue([]);
});

describe('buildSyncQueue', () => {
  it('merges list IDs + DB rows and dedupes', async () => {
    mocks.movieFindMany.mockResolvedValue([{ tmdbId: 101, lastFetchedAt: new Date() }]);
    mocks.tvFindMany.mockResolvedValue([{ tmdbId: 203, lastFetchedAt: new Date() }]);
    const queue = await buildSyncQueue({ entity: 'all', client: makeClient() });
    const keys = queue.map((w) => `${w.entity}:${w.tmdbId}`);
    expect(keys).toContain('movie:100');
    expect(keys).toContain('movie:101');
    expect(keys).toContain('movie:102');
    expect(keys).toContain('tv:200');
    expect(keys).toContain('tv:202');
    expect(keys).toContain('tv:203');
    expect(keys.filter((k) => k === 'movie:101').length).toBe(1);
  });

  it('maps user annotations to tmdbId and puts them first', async () => {
    mocks.movieFindMany.mockResolvedValue([
      { tmdbId: 101, lastFetchedAt: new Date() },
      { tmdbId: 42, lastFetchedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000) },
    ]);
    mocks.annotationFindMany.mockResolvedValue([{ entityType: 'MOVIE', entityId: 7 }]);
    mocks.movieFindMany.mockImplementation(async ({ where }) => {
      if (where?.id?.in) return [{ tmdbId: 42, lastFetchedAt: new Date() }];
      return [{ tmdbId: 101, lastFetchedAt: new Date() }, { tmdbId: 42, lastFetchedAt: new Date() }];
    });
    const queue = await buildSyncQueue({ entity: 'all', client: makeClient() });
    expect(queue[0]).toEqual({ entity: 'movie', tmdbId: 42 });
  });

  it('includes persons from credits of queued media', async () => {
    mocks.movieFindMany.mockResolvedValueOnce([{ tmdbId: 101, lastFetchedAt: new Date() }]);
    mocks.movieFindMany.mockResolvedValueOnce([{ id: 1, tmdbId: 101, lastFetchedAt: new Date() }]);
    mocks.personFindMany.mockResolvedValue([{ tmdbId: 301, lastFetchedAt: new Date() }]);
    mocks.castCreditFindMany.mockResolvedValue([{ personId: 5 }]);
    const queue = await buildSyncQueue({ entity: 'all', client: makeClient() });
    const personKeys = queue.filter((w) => w.entity === 'person').map((w) => w.tmdbId);
    expect(personKeys).toContain(301);
  });

  it('respects entity filter movies', async () => {
    mocks.movieFindMany.mockResolvedValue([{ tmdbId: 101, lastFetchedAt: new Date() }]);
    const queue = await buildSyncQueue({ entity: 'movies', client: makeClient() });
    expect(queue.every((w) => w.entity === 'movie')).toBe(true);
    expect(mocks.tvFindMany).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ingestion/sync-queue.test.ts`
Expected: FAIL — module not found / `buildSyncQueue is not a function`.

- [ ] **Step 3: Implement `src/lib/ingestion/sync-queue.ts`**

```ts
import prisma from '../db';
import type { TmdbClient } from '../tmdb/client';
import type { WorkItem, SyncEntity, BuildQueueOptions } from './types';

const LIST_PAGES = 5;

async function collectListIds(opts: BuildQueueOptions): Promise<WorkItem[]> {
  const items: WorkItem[] = [];
  if (opts.entity === 'all' || opts.entity === 'movies') {
    for (let p = 1; p <= LIST_PAGES; p++) {
      const [pop, top] = await Promise.all([
        opts.client.getPopularMovies(p),
        opts.client.getTopRatedMovies(p),
      ]);
      items.push(...pop.results.map((m) => ({ entity: 'movie' as const, tmdbId: m.id })));
      items.push(...top.results.map((m) => ({ entity: 'movie' as const, tmdbId: m.id })));
    }
  }
  if (opts.entity === 'all' || opts.entity === 'tv') {
    for (let p = 1; p <= LIST_PAGES; p++) {
      const [pop, top] = await Promise.all([
        opts.client.getPopularTv(p),
        opts.client.getTopRatedTv(p),
      ]);
      items.push(...pop.results.map((s) => ({ entity: 'tv' as const, tmdbId: s.id })));
      items.push(...top.results.map((s) => ({ entity: 'tv' as const, tmdbId: s.id })));
    }
  }
  if (opts.entity === 'all' || opts.entity === 'persons') {
    for (let p = 1; p <= LIST_PAGES; p++) {
      const pop = await opts.client.getPopularPersons(p);
      items.push(...pop.results.map((pe) => ({ entity: 'person' as const, tmdbId: pe.id })));
    }
  }
  return items;
}

async function collectDbRows(opts: BuildQueueOptions): Promise<WorkItem[]> {
  const items: WorkItem[] = [];
  const staleFirst = { orderBy: { lastFetchedAt: 'asc' as const } };
  if (opts.entity === 'all' || opts.entity === 'movies') {
    const rows = await prisma.movie.findMany({
      select: { tmdbId: true, lastFetchedAt: true },
      ...staleFirst,
    });
    items.push(...rows.map((r) => ({ entity: 'movie' as const, tmdbId: r.tmdbId })));
  }
  if (opts.entity === 'all' || opts.entity === 'tv') {
    const rows = await prisma.tvSeries.findMany({
      select: { tmdbId: true, lastFetchedAt: true },
      ...staleFirst,
    });
    items.push(...rows.map((r) => ({ entity: 'tv' as const, tmdbId: r.tmdbId })));
  }
  return items;
}

async function collectUserRecorded(opts: BuildQueueOptions): Promise<WorkItem[]> {
  const items: WorkItem[] = [];
  const [annotations, watchlistItems] = await Promise.all([
    prisma.userAnnotation.findMany({ select: { entityType: true, entityId: true } }),
    prisma.watchlistItem.findMany({ select: { entityType: true, entityId: true } }),
  ]);
  const refs = [...annotations, ...watchlistItems];
  const movieIds = refs.filter((r) => r.entityType === 'MOVIE').map((r) => r.entityId);
  const tvIds = refs.filter((r) => r.entityType === 'TV').map((r) => r.entityId);
  const personIds = refs.filter((r) => r.entityType === 'PERSON').map((r) => r.entityId);

  const [movies, tvSeries, persons] = await Promise.all([
    movieIds.length ? prisma.movie.findMany({ where: { id: { in: movieIds } }, select: { tmdbId: true } }) : Promise.resolve([]),
    tvIds.length ? prisma.tvSeries.findMany({ where: { id: { in: tvIds } }, select: { tmdbId: true } }) : Promise.resolve([]),
    personIds.length ? prisma.person.findMany({ where: { id: { in: personIds } }, select: { tmdbId: true } }) : Promise.resolve([]),
  ]);

  items.push(...movies.map((m) => ({ entity: 'movie' as const, tmdbId: m.tmdbId })));
  items.push(...tvSeries.map((s) => ({ entity: 'tv' as const, tmdbId: s.tmdbId })));
  if (opts.entity === 'all' || opts.entity === 'persons') {
    items.push(...persons.map((p) => ({ entity: 'person' as const, tmdbId: p.tmdbId })));
  }
  return items;
}

async function collectPersonsFromCredits(opts: BuildQueueOptions): Promise<WorkItem[]> {
  if (opts.entity !== 'all' && opts.entity !== 'persons') return [];
  const movieRows = await prisma.movie.findMany({ select: { id: true } });
  const tvRows = await prisma.tvSeries.findMany({ select: { id: true } });
  const movieIds = movieRows.map((m) => m.id);
  const tvIds = tvRows.map((s) => s.id);

  const creditRows = await prisma.castCredit.findMany({
    where: { OR: [{ movieId: { in: movieIds } }, { tvSeriesId: { in: tvIds } }] },
    select: { personId: true },
  });
  const crewRows = await prisma.crewCredit.findMany({
    where: { OR: [{ movieId: { in: movieIds } }, { tvSeriesId: { in: tvIds } }] },
    select: { personId: true },
  });

  const personIds = [...new Set([...creditRows, ...crewRows].map((c) => c.personId))];
  if (personIds.length === 0) return [];

  const persons = await prisma.person.findMany({
    where: { id: { in: personIds } },
    select: { tmdbId: true },
  });
  return persons.map((p) => ({ entity: 'person' as const, tmdbId: p.tmdbId }));
}

export async function buildSyncQueue(opts: BuildQueueOptions): Promise<WorkItem[]> {
  const [userItems, dbItems, listItems, personItems] = await Promise.all([
    collectUserRecorded(opts),
    collectDbRows(opts),
    collectListIds(opts),
    collectPersonsFromCredits(opts),
  ]);

  const seen = new Set<string>();
  const ordered: WorkItem[] = [];
  const push = (items: WorkItem[]) => {
    for (const item of items) {
      const key = `${item.entity}:${item.tmdbId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      ordered.push(item);
    }
  };

  push(userItems);      // priority 1: user-recorded
  push(dbItems);        // priority 2: all DB rows, stale first
  push(listItems);      // priority 3: new IDs from TMDB lists
  push(personItems);    // priority 4: persons from credits (only if entity allows)
  return ordered;
}
```
Note: put `WorkItem`, `SyncEntity`, `BuildQueueOptions` type definitions in `src/lib/ingestion/types.ts` (see step 4), OR keep them in `sync-queue.ts` and export. Keep them in `types.ts` so `worker-pool.ts` and `full-sync.ts` can import them.

- [ ] **Step 4: Add shared types to `src/lib/ingestion/types.ts`**

Append:
```ts
export type SyncEntity = 'movie' | 'tv' | 'person';

export interface WorkItem {
  entity: SyncEntity;
  tmdbId: number;
}

export interface BuildQueueOptions {
  entity: 'all' | 'movies' | 'tv' | 'persons';
  client: TmdbClient;
  shouldStop?: () => Promise<boolean>;
}
```
with `import type { TmdbClient } from '../tmdb/client';` at the top.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/ingestion/sync-queue.test.ts`
Expected: PASS (4 cases).

- [ ] **Step 6: Run full suite**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ingestion/types.ts src/lib/ingestion/sync-queue.ts src/lib/ingestion/sync-queue.test.ts
git commit -m "feat(sync): build deduped work queue from lists, DB rows, and user records"
```

---

### Task 3: Worker pool (`worker-pool.ts`)

**Files:**
- Create: `src/lib/ingestion/worker-pool.ts`
- Test: `src/lib/ingestion/worker-pool.test.ts`

**Interfaces:**
- Consumes: `WorkItem` from `./types`.
- Produces:
```ts
export interface WorkerPoolOptions {
  concurrency: number;
  shouldStop?: () => Promise<boolean>;
  onItemDone?: (item: WorkItem, error?: unknown) => void;
}
export interface WorkerPoolResult {
  processed: number;
  stopped: boolean;
}
export async function runWorkerPool(
  items: WorkItem[],
  handler: (item: WorkItem) => Promise<void>,
  options: WorkerPoolOptions,
): Promise<WorkerPoolResult>
```
Bounded concurrency: never more than `options.concurrency` handlers in flight. If `shouldStop()` returns true between items, remaining items are skipped and `stopped: true` is returned.

- [ ] **Step 1: Write the failing test**

`src/lib/ingestion/worker-pool.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { runWorkerPool } from './worker-pool';
import type { WorkItem } from './types';

const items: WorkItem[] = [
  { entity: 'movie', tmdbId: 1 },
  { entity: 'movie', tmdbId: 2 },
  { entity: 'tv', tmdbId: 3 },
  { entity: 'person', tmdbId: 4 },
];

describe('runWorkerPool', () => {
  it('processes all items with bounded concurrency', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const handler = vi.fn(async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 10));
      inFlight--;
    });
    const result = await runWorkerPool(items, handler, { concurrency: 2 });
    expect(handler).toHaveBeenCalledTimes(4);
    expect(maxInFlight).toBeLessThanOrEqual(2);
    expect(result).toEqual({ processed: 4, stopped: false });
  });

  it('stops early when shouldStop returns true', async () => {
    let calls = 0;
    const handler = vi.fn(async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 5));
    });
    const result = await runWorkerPool(items, handler, {
      concurrency: 2,
      shouldStop: async () => calls >= 2,
    });
    expect(calls).toBeLessThan(4);
    expect(result.stopped).toBe(true);
  });

  it('reports per-item errors via onItemDone without aborting', async () => {
    const errors: unknown[] = [];
    const handler = vi.fn(async (item: WorkItem) => {
      if (item.tmdbId === 2) throw new Error('boom');
    });
    const result = await runWorkerPool(items, handler, {
      concurrency: 2,
      onItemDone: (_item, error) => { if (error) errors.push(error); },
    });
    expect(errors).toHaveLength(1);
    expect(result.processed).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ingestion/worker-pool.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/ingestion/worker-pool.ts`**

```ts
import type { WorkItem, WorkerPoolOptions, WorkerPoolResult } from './types';

export async function runWorkerPool(
  items: WorkItem[],
  handler: (item: WorkItem) => Promise<void>,
  options: WorkerPoolOptions,
): Promise<WorkerPoolResult> {
  const { concurrency, shouldStop, onItemDone } = options;
  let nextIndex = 0;
  let processed = 0;
  let stopped = false;

  async function worker(): Promise<void> {
    while (!stopped) {
      if (shouldStop && (await shouldStop())) {
        stopped = true;
        return;
      }
      const index = nextIndex++;
      if (index >= items.length) return;
      const item = items[index];
      try {
        await handler(item);
      } catch (error) {
        onItemDone?.(item, error);
      } finally {
        processed++;
      }
      onItemDone?.(item);
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker());
  await Promise.all(workers);
  return { processed, stopped };
}
```

- [ ] **Step 4: Add `WorkerPoolOptions`/`WorkerPoolResult` to `src/lib/ingestion/types.ts`**

Append:
```ts
export interface WorkerPoolOptions {
  concurrency: number;
  shouldStop?: () => Promise<boolean>;
  onItemDone?: (item: WorkItem, error?: unknown) => void;
}

export interface WorkerPoolResult {
  processed: number;
  stopped: boolean;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/ingestion/worker-pool.test.ts`
Expected: PASS (3 cases).

- [ ] **Step 6: Commit**

```bash
git add src/lib/ingestion/types.ts src/lib/ingestion/worker-pool.ts src/lib/ingestion/worker-pool.test.ts
git commit -m "feat(sync): add bounded-concurrency worker pool"
```

---

### Task 4: Orchestrator (`full-sync.ts`)

**Files:**
- Create: `src/lib/ingestion/full-sync.ts`
- Test: `src/lib/ingestion/full-sync.test.ts`

**Interfaces:**
- Consumes: `buildSyncQueue` from `./sync-queue`, `runWorkerPool` from `./worker-pool`, `fetchAndUpsertMovie`/`fetchAndUpsertTvSeries`/`fetchAndUpsertPerson` from the three sync services, `acquireSyncLock`/`finishSyncLog`/`touchSyncHeartbeat`/`isSyncCancellationRequested` from `./sync-lock`, `TmdbClient` from `../tmdb/client`.
- Produces:
```ts
export interface FullSyncOptions {
  entity?: 'all' | 'movies' | 'tv' | 'persons';
  limit?: number;
  concurrency?: number;
}
export interface FullSyncResult {
  success: boolean;
  cancelled: boolean;
  processed: number;
  errors: number;
  duration: number;
  results: Record<string, { success: boolean; processed: number; errors: number; duration: number }>;
  lock: { id: number } | null;
}
export async function runFullSync(options: FullSyncOptions): Promise<FullSyncResult>
```

- [ ] **Step 1: Write the failing test**

`src/lib/ingestion/full-sync.test.ts` — mock `../db`, `./sync-queue`, `./worker-pool`, `./sync-lock`, and the three sync services. Keep `sync-lock` real (it's already DB-mocked) or mock it; simplest is to mock `sync-lock` functions with hoisted fns:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runFullSync } from './full-sync';

const mocks = vi.hoisted(() => ({
  acquireSyncLock: vi.fn(),
  finishSyncLog: vi.fn(),
  touchSyncHeartbeat: vi.fn(),
  isSyncCancellationRequested: vi.fn(),
  buildSyncQueue: vi.fn(),
  runWorkerPool: vi.fn(),
  fetchAndUpsertMovie: vi.fn(),
  fetchAndUpsertTvSeries: vi.fn(),
  fetchAndUpsertPerson: vi.fn(),
}));

vi.mock('./sync-lock', () => ({
  acquireSyncLock: mocks.acquireSyncLock,
  finishSyncLog: mocks.finishSyncLog,
  touchSyncHeartbeat: mocks.touchSyncHeartbeat,
  isSyncCancellationRequested: mocks.isSyncCancellationRequested,
}));

vi.mock('./sync-queue', () => ({ buildSyncQueue: mocks.buildSyncQueue }));
vi.mock('./worker-pool', () => ({ runWorkerPool: mocks.runWorkerPool }));
vi.mock('./movie-sync', () => ({ fetchAndUpsertMovie: mocks.fetchAndUpsertMovie }));
vi.mock('./tv-sync', () => ({ fetchAndUpsertTvSeries: mocks.fetchAndUpsertTvSeries }));
vi.mock('./person-sync', () => ({ fetchAndUpsertPerson: mocks.fetchAndUpsertPerson }));
vi.mock('../tmdb/client', () => ({ TmdbClient: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.acquireSyncLock.mockResolvedValue({ id: 1 });
  mocks.finishSyncLog.mockResolvedValue(undefined);
  mocks.isSyncCancellationRequested.mockResolvedValue(false);
  mocks.buildSyncQueue.mockResolvedValue([
    { entity: 'movie', tmdbId: 1 },
    { entity: 'tv', tmdbId: 2 },
  ]);
  mocks.runWorkerPool.mockImplementation(async (items: unknown[], handler: (item: { entity: string; tmdbId: number }) => Promise<void>) => {
    for (const item of items as Array<{ entity: string; tmdbId: number }>) {
      await handler(item);
    }
    return { processed: items.length, stopped: false };
  });
});

describe('runFullSync', () => {
  it('builds queue and runs pool with all entities', async () => {
    const result = await runFullSync({});
    expect(mocks.buildSyncQueue).toHaveBeenCalled();
    expect(mocks.runWorkerPool).toHaveBeenCalled();
    expect(mocks.fetchAndUpsertMovie).toHaveBeenCalledWith(1, expect.anything());
    expect(mocks.fetchAndUpsertTvSeries).toHaveBeenCalledWith(2, expect.anything());
    expect(result.success).toBe(true);
    expect(result.processed).toBe(2);
  });

  it('finishes the sync log with per-entity results', async () => {
    await runFullSync({});
    expect(mocks.finishSyncLog).toHaveBeenCalledWith(
      1,
      'completed',
      2,
      0,
      expect.any(Number),
      expect.stringContaining('"movies"'),
    );
  });

  it('returns no lock and does nothing when lock is held', async () => {
    mocks.acquireSyncLock.mockResolvedValueOnce(null);
    const result = await runFullSync({});
    expect(result.lock).toBeNull();
    expect(mocks.buildSyncQueue).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ingestion/full-sync.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/ingestion/full-sync.ts`**

```ts
import { TmdbClient } from '../tmdb/client';
import { buildSyncQueue } from './sync-queue';
import { runWorkerPool } from './worker-pool';
import { fetchAndUpsertMovie } from './movie-sync';
import { fetchAndUpsertTvSeries } from './tv-sync';
import { fetchAndUpsertPerson } from './person-sync';
import {
  acquireSyncLock,
  finishSyncLog,
  isSyncCancellationRequested,
  touchSyncHeartbeat,
} from './sync-lock';
import type { FullSyncOptions, FullSyncResult } from './types';

const DEFAULT_CONCURRENCY = 4;
const HEARTBEAT_INTERVAL_MS = 15_000;

export async function runFullSync(options: FullSyncOptions = {}): Promise<FullSyncResult> {
  const entity = options.entity ?? 'all';
  const limit = options.limit ?? 0;
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

  const lock = await acquireSyncLock(entity);
  if (!lock) {
    return {
      success: false,
      cancelled: false,
      processed: 0,
      errors: 0,
      duration: 0,
      results: {},
      lock: null,
    };
  }

  const startTime = Date.now();
  let lastHeartbeat = Date.now();
  const shouldStop = async () => {
    const now = Date.now();
    if (now - lastHeartbeat > HEARTBEAT_INTERVAL_MS) {
      lastHeartbeat = now;
      await touchSyncHeartbeat(lock.id).catch(() => {});
    }
    return isSyncCancellationRequested(lock.id);
  };

  const client = new TmdbClient({ language: 'en-US' });
  const results: Record<string, FullSyncResult['results'][string]> = {};
  const errors: Array<{ tmdbId: number; entity: string; message: string }> = [];
  let processed = 0;
  let stopped = false;

  try {
    await touchSyncHeartbeat(lock.id).catch(() => {});

    const queue = await buildSyncQueue({ entity, client, shouldStop });
    const workItems = limit > 0 ? queue.slice(0, limit) : queue;
    const byEntity = new Map<string, number>();

    const poolResult = await runWorkerPool(
      workItems,
      async (item) => {
        try {
          if (item.entity === 'movie') {
            await fetchAndUpsertMovie(item.tmdbId, client);
          } else if (item.entity === 'tv') {
            await fetchAndUpsertTvSeries(item.tmdbId, client);
          } else {
            await fetchAndUpsertPerson(item.tmdbId, client);
          }
          byEntity.set(item.entity, (byEntity.get(item.entity) ?? 0) + 1);
        } catch (error) {
          errors.push({
            tmdbId: item.tmdbId,
            entity: item.entity,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      },
      {
        concurrency,
        shouldStop,
        onItemDone: () => {
          processed++;
        },
      },
    );
    stopped = poolResult.stopped;
  } catch (error) {
    const duration = Date.now() - startTime;
    await finishSyncLog(
      lock.id,
      'failed',
      processed,
      errors.length + 1,
      duration,
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
    );
    return {
      success: false,
      cancelled: false,
      processed,
      errors: errors.length + 1,
      duration,
      results,
      lock,
    };
  }

  const duration = Date.now() - startTime;
  results.movies = { success: true, processed: byEntity.get('movie') ?? 0, errors: errors.filter((e) => e.entity === 'movie').length, duration };
  results.tv = { success: true, processed: byEntity.get('tv') ?? 0, errors: errors.filter((e) => e.entity === 'tv').length, duration };
  results.persons = { success: true, processed: byEntity.get('person') ?? 0, errors: errors.filter((e) => e.entity === 'person').length, duration };

  await finishSyncLog(
    lock.id,
    stopped ? 'cancelled' : 'completed',
    processed,
    errors.length,
    duration,
    JSON.stringify(results),
  );

  return {
    success: errors.length === 0 && !stopped,
    cancelled: stopped,
    processed,
    errors: errors.length,
    duration,
    results,
    lock,
  };
}
```

- [ ] **Step 4: Add `FullSyncOptions`/`FullSyncResult` to `src/lib/ingestion/types.ts`**

Append:
```ts
export interface FullSyncOptions {
  entity?: 'all' | 'movies' | 'tv' | 'persons';
  limit?: number;
  concurrency?: number;
}

export interface FullSyncResult {
  success: boolean;
  cancelled: boolean;
  processed: number;
  errors: number;
  duration: number;
  results: Record<string, { success: boolean; processed: number; errors: number; duration: number }>;
  lock: { id: number } | null;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/ingestion/full-sync.test.ts`
Expected: PASS (3 cases).

- [ ] **Step 6: Run full suite**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ingestion/types.ts src/lib/ingestion/full-sync.ts src/lib/ingestion/full-sync.test.ts
git commit -m "feat(sync): add full-sync orchestrator with worker pool"
```

---

### Task 5: Wire admin sync route to `runFullSync`

**Files:**
- Modify: `src/app/api/admin/sync/route.ts`

**Interfaces:**
- Consumes: `runFullSync` from `@/lib/ingestion/full-sync`.
- Produces: unchanged response shape — `{ success, message, cancelled, completedAt, results }` (plus `processed`, `errors`, `duration`, `lock`).

- [ ] **Step 1: Replace the sequential sync body**

Rewrite `src/app/api/admin/sync/route.ts` so that after `requireAdmin`:
```ts
import { runFullSync } from '@/lib/ingestion/full-sync';

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // No body is fine — default to syncing all
    }

    const entity = (body.entity as string) ?? 'all';
    const limit = (body.limit as number) ?? 0;

    const result = await runFullSync({ entity: entity as 'all' | 'movies' | 'tv' | 'persons', limit });

    if (!result.lock) {
      return NextResponse.json(
        {
          error: 'A sync is already running',
          message: 'Wait for the current sync to finish before starting another.',
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: result.success,
      message: result.cancelled ? 'Sync cancelled' : 'Sync completed',
      cancelled: result.cancelled,
      completedAt: new Date().toISOString(),
      processed: result.processed,
      errors: result.errors,
      duration: result.duration,
      results: result.results,
    });
  } catch (error) {
    console.error('Sync failed', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
```
Delete the now-unused imports: `syncMovies`, `syncTvSeries`, `syncPersons`, `acquireSyncLock`, `finishSyncLog`, `isSyncCancellationRequested`, `touchSyncHeartbeat`, `TmdbClient`.

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/sync/route.ts
git commit -m "feat(sync): route admin sync through unified parallel engine"
```

---

## Self-Review Notes

- Spec coverage: all four spec goals map to tasks — (1) lists+DB rows → Task 2, (2) multi-worker → Task 3, (3) lock/heartbeat/cancel/log → Task 4, (4) admin route → Task 5. Persons scope rule (referenced-only) enforced in `collectPersonsFromCredits` + queue priority.
- Type consistency: `WorkItem`/`BuildQueueOptions` (Task 2) reused by `WorkerPoolOptions` (Task 3) and `FullSyncOptions` (Task 4); `runFullSync` result shape matches the route's response.
- Rate limit constraint honored: single shared `TmdbClient` created in `runFullSync` and passed to every worker via `fetchAndUpsert*(tmdbId, client)` (Task 1 exports).