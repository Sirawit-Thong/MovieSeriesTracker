# Production Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 13 highest-impact production issues (security, sync reliability, page-load performance, data integrity) identified in the production audit, one task at a time.

**Architecture:** Each task is independent and self-contained: security hardening on API routes, a DB-backed sync lock, a global TMDB rate limiter, query deduplication with `React.cache`, middleware consolidation, schema migration, and ops/config fixes. Tasks are ordered by priority — security first, then sync reliability, then performance, then ops.

**Tech Stack:** Next.js 16.3.1 (App Router, Turbopack), Prisma 7 (`@prisma/adapter-pg`, generated client at `generated/prisma`), next-auth v5 (JWT strategy), next-intl (en/th), next-pwa, Vitest 4, PostgreSQL.

**Spec:** No formal spec — this plan implements the fixes from the production audit findings (see conversation: "ผลการตรวจสอบ: ปัญหา Production ด้าน Data Loading & Sync"). Verified claims only; two audit findings were disproven during planning and are deliberately excluded (library country filter `&&` on `Set`s is correct because empty `Set` is truthy; Dockerfile already copies the whole `node_modules/@prisma` directory so `@prisma/adapter-pg` is included).

## Global Constraints

- Next.js 16.3.1, App Router, TypeScript. Path alias `@/*` → `src/*`.
- Prisma client is imported from `@/lib/db` (default export `prisma`). The generated client lives at `generated/prisma`, NOT `node_modules/.prisma` — never import `@prisma/client` directly; use `@/lib/db` or `@/lib/db/index`'s types.
- `requireAdmin()` lives in `src/lib/admin.ts` and returns `{user} | {response}` — check `auth.response` and return it when present.
- Test runner: `npm run test` (Vitest). Existing tests are pure-function unit tests (see `src/lib/rate-limit.test.ts` pattern) — no DB mocks.
- Verification commands: `npm run typecheck`, `npm run lint`, `npm run test`, and (after all tasks) `npm run build`.
- Do not modify `prisma/schema.prisma` without generating and committing a migration via `npx prisma migrate dev`.
- `git commit` after each task; follow existing commit style (e.g. `fix(api): ...`, `refactor(sync): ...` — see `git log --oneline`).
- The `.env` file is gitignored and untracked. Never commit secrets.

---

### Task 1: Require Admin Auth on `POST /api/sync`

**Files:**
- Modify: `src/app/api/sync/route.ts`

**Interfaces:**
- Consumes: `requireAdmin` from `@/lib/admin` (returns `{user} | {response}`).
- Produces: `POST /api/sync` returns `403` with `{error: 'Forbidden'}` when the caller is not an admin; otherwise behaves as before.

**Rationale:** The on-demand sync endpoint lets anyone trigger TMDB fetches + DB writes. The admin sync endpoint (`/api/admin/sync`) already uses `requireAdmin()`; this one must too. The frontend `SyncButton` (re-sync media) is an admin feature.

- [ ] **Step 1: Add the admin gate**

```ts
// src/app/api/sync/route.ts — top of POST handler
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const body = await request.json();
    ...
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck` — expected PASS.

- [ ] **Step 3: Manual check (dev server running)**

- `POST /api/sync` with `{"type":"movie","tmdbId":550}` and NO session → expect `403 {"error":"Forbidden"}`.
- With an admin session → existing behavior (sync runs).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/sync/route.ts
git commit -m "fix(api): require admin role on POST /api/sync"
```

---

### Task 2: Remove the Unauthenticated Test Endpoint

**Files:**
- Delete: `src/app/api/test/on-demand/route.ts`
- Delete: `src/app/api/test/` (if empty after deletion)

**Interfaces:**
- Consumes: nothing new. `fetchOnMiss` from `@/lib/ingestion/on-demand` is still used by the `/movie/tmdb/[tmdbId]`, `/tv/tmdb/[tmdbId]`, `/person/tmdb/[tmdbId]` redirect pages — do NOT delete the lib function, only the route.
- Produces: `/api/test/on-demand` no longer exists (404).

- [ ] **Step 1: Confirm no references**

Run: `npx tsx -e "import('fs').then(fs => console.log('check'))"` (noop) — instead grep:

```bash
git grep -n "api/test" -- src public
```

Expected: no matches (or only the file being deleted). If matches exist in source, remove them in this task too.

- [ ] **Step 2: Delete the route**

```bash
git rm src/app/api/test/on-demand/route.ts
# if the test directory is now empty:
git rm -r src/app/api/test
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck` and `npm run lint` — expected PASS. Manual: `GET /api/test/on-demand?tmdbId=550` → 404.

- [ ] **Step 4: Commit**

```bash
git add -A src/app/api/test
git commit -m "fix(api): remove unauthenticated test endpoint"
```

---

### Task 3: Harden Environment Variables for Production

**Files:**
- Modify: `src/lib/db/index.ts`
- Modify: `src/lib/auth/config.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `assertProductionEnv()` in `src/lib/env.ts` — throws in `NODE_ENV=production` when `AUTH_SECRET` is missing or the known dev placeholder. Imported from `src/lib/db/index.ts`.

**Rationale:** `AUTH_SECRET="dev-secret-change-in-production"` allows JWT forgery; a missing/placeholder TMDB key makes sync fail silently. Fail fast at startup instead of at request time.

- [ ] **Step 1: Create `src/lib/env.ts`**

```ts
const DEV_AUTH_SECRET = 'dev-secret-change-in-production';

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const problems: string[] = [];
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET === DEV_AUTH_SECRET) {
    problems.push('AUTH_SECRET must be set to a random value (openssl rand -base64 32) in production');
  }
  if (!process.env.TMDB_API_KEY) {
    problems.push('TMDB_API_KEY must be set in production');
  }
  if (problems.length > 0) {
    throw new Error(`Invalid production environment:\n- ${problems.join('\n- ')}`);
  }
}
```

- [ ] **Step 2: Call it from the Prisma singleton module**

```ts
// src/lib/db/index.ts — first line after imports
import {assertProductionEnv} from '../env';

assertProductionEnv();
```

- [ ] **Step 3: Rotate the leaked TMDB API key (manual, ops)**

The key `47aecb818b8d01d964f0fd0075a530ee` exists in git history (commits `d27b9be`, `c9078c2`). It is currently untracked (`.env` is gitignored), but history exposure means the key must be regenerated:

1. Go to https://www.themoviedb.org/settings/api → regenerate the API key.
2. Update the new key in `.env` (local) and in the deployment platform's env vars.
3. Optional cleanup: `git filter-repo --invert-paths --path .env` (only if no collaborators rely on current history; coordinate before force-pushing).

- [ ] **Step 4: Verify**

Run: `npm run typecheck` — PASS.
Run (dev, must NOT throw): `npm run dev` then load any page — PASS (assert is a no-op in dev).

- [ ] **Step 5: Commit**

```bash
git add src/lib/env.ts src/lib/db/index.ts
git commit -m "feat(env): fail fast on missing production secrets"
```

---

### Task 4: Prevent Concurrent Syncs (Sync Lock)

**Files:**
- Create: `src/lib/ingestion/sync-lock.ts`
- Modify: `src/app/api/admin/sync/route.ts`
- Modify: `src/app/api/sync/route.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/db`; `SyncLog` model (`entity`, `status`, `createdAt`, `endedAt`, `processed`, `errors`, `duration`, `details` — see `prisma/schema.prisma`).
- Produces:
  - `acquireSyncLock(entity: string): Promise<{id: number} | null>` — `null` when an active lock exists; otherwise creates a `SyncLog` row with `status: 'running'` and returns its id.
  - `finishSyncLog(id: number, status: 'completed' | 'failed', processed: number, errors: number, duration: number, details: string): Promise<void>`.
  - `isSyncLockExpired(createdAt: Date, now: number = Date.now()): boolean` — pure helper, exported for unit tests.

**Lock semantics:** lock scope is the `entity` value. `'all'` blocks `'all'` only; `'movie'`/`'tv'`/`'person'` block their own kind. Stale locks (older than 30 minutes) are ignored. Responses: `409 {error: 'A sync is already running'}`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/ingestion/sync-lock.test.ts
import {describe, it, expect} from 'vitest';
import {isSyncLockExpired} from './sync-lock';

describe('sync lock staleness', () => {
  it('expires locks older than 30 minutes', () => {
    const createdAt = new Date(Date.now() - 31 * 60 * 1000);
    expect(isSyncLockExpired(createdAt)).toBe(true);
  });

  it('keeps fresh locks active', () => {
    const createdAt = new Date(Date.now() - 60 * 1000);
    expect(isSyncLockExpired(createdAt)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/ingestion/sync-lock.test.ts`
Expected: FAIL (module `./sync-lock` not found).

- [ ] **Step 3: Implement `src/lib/ingestion/sync-lock.ts`**

```ts
import prisma from '../db';

const LOCK_TIMEOUT_MS = 30 * 60 * 1000;

export function isSyncLockExpired(createdAt: Date, now: number = Date.now()): boolean {
  return now - createdAt.getTime() > LOCK_TIMEOUT_MS;
}

export async function acquireSyncLock(
  entity: string
): Promise<{id: number} | null> {
  const now = new Date();

  const active = await prisma.syncLog.findFirst({
    where: {
      entity,
      status: 'running',
    },
  });

  if (active && !isSyncLockExpired(active.createdAt, now.getTime())) {
    return null;
  }

  if (active) {
    await prisma.syncLog.update({
      where: {id: active.id},
      data: {status: 'failed', endedAt: now},
    });
  }

  return prisma.syncLog.create({
    data: {entity, status: 'running'},
    select: {id: true},
  });
}

export async function finishSyncLog(
  id: number,
  status: 'completed' | 'failed',
  processed: number,
  errors: number,
  duration: number,
  details: string
): Promise<void> {
  await prisma.syncLog.update({
    where: {id},
    data: {status, processed, errors, duration, details, endedAt: new Date()},
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/ingestion/sync-lock.test.ts`
Expected: PASS.

- [ ] **Step 5: Refactor `src/app/api/admin/sync/route.ts` to use the lock**

Replace the inline `prisma.syncLog.create(...)` / `update(...)` calls:

```ts
// after computing `entity` and before starting work:
const lock = await acquireSyncLock(entity);
if (!lock) {
  return NextResponse.json(
    {error: 'A sync is already running', message: 'Wait for the current sync to finish before starting another.'},
    {status: 409}
  );
}

const syncLog = lock;
// ... (existing try/catch body, but the success and failure branches call
// finishSyncLog(syncLog.id, 'completed'|'failed', totalProcessed, totalErrors, duration, JSON.stringify(results)) instead of prisma.syncLog.update)
```

- [ ] **Step 6: Add the lock to `src/app/api/sync/route.ts`**

```ts
// after the requireAdmin gate and input validation, before the sync dispatch:
const lock = await acquireSyncLock(type);
if (!lock) {
  return NextResponse.json(
    {error: 'A sync is already running'},
    {status: 409}
  );
}
```

Then wrap the sync dispatch in try/catch and call `finishSyncLog(lock.id, 'completed', 1, 0, duration, JSON.stringify({type, tmdbId}))` on success, `finishSyncLog(lock.id, 'failed', 0, 1, duration, JSON.stringify({error}))` on failure (keep returning the same response shapes as today).

- [ ] **Step 7: Verify**

Run: `npm run test` — all tests PASS. `npm run typecheck` — PASS. `npm run lint` — PASS.
Manual: trigger two admin syncs back-to-back; the second must get `409`.

- [ ] **Step 8: Commit**

```bash
git add src/lib/ingestion/sync-lock.ts src/lib/ingestion/sync-lock.test.ts src/app/api/admin/sync/route.ts src/app/api/sync/route.ts
git commit -m "fix(sync): prevent concurrent syncs with DB-backed lock"
```

---

### Task 5: Global TMDB Rate Limiter Singleton

**Files:**
- Modify: `src/lib/tmdb/rate-limiter.ts`
- Modify: `src/lib/tmdb/types.ts`
- Modify: `src/lib/tmdb/client.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `TmdbClientConfig.rateLimiter?: TmdbRateLimiter` — optional override (for tests).
  - `globalTmdbRateLimiter` — module-level singleton exported from `rate-limiter.ts`.
  - `TmdbClient` uses `config.rateLimiter ?? globalTmdbRateLimiter`.

**Rationale:** Every `new TmdbClient()` currently gets a fresh in-memory limiter, so concurrent sync clients can exceed TMDB's 40 req/10s limit. A module singleton shares the window across all clients in one process.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/tmdb/rate-limiter.test.ts
import {describe, it, expect} from 'vitest';
import {TmdbRateLimiter, globalTmdbRateLimiter} from './rate-limiter';
import {TmdbClient} from './client';

describe('global TMDB rate limiter', () => {
  it('exports a shared singleton', () => {
    expect(globalTmdbRateLimiter).toBeInstanceOf(TmdbRateLimiter);
  });

  it('TmdbClient instances share the global limiter by default', () => {
    const a = new TmdbClient();
    const b = new TmdbClient();
    expect((a as unknown as {rateLimiter: TmdbRateLimiter}).rateLimiter)
      .toBe((b as unknown as {rateLimiter: TmdbRateLimiter}).rateLimiter);
  });

  it('accepts a per-instance override', () => {
    const custom = new TmdbRateLimiter({maxRequests: 5, windowMs: 1000});
    const c = new TmdbClient({rateLimiter: custom});
    expect((c as unknown as {rateLimiter: TmdbRateLimiter}).rateLimiter).toBe(custom);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/tmdb/rate-limiter.test.ts`
Expected: FAIL (`globalTmdbRateLimiter` not exported; instances differ).

- [ ] **Step 3: Add the singleton to `rate-limiter.ts`**

```ts
// at the bottom of src/lib/tmdb/rate-limiter.ts
export const globalTmdbRateLimiter = new TmdbRateLimiter();
```

- [ ] **Step 4: Add the config field to `types.ts`**

```ts
export interface TmdbClientConfig {
  apiKey?: string;
  baseUrl?: string;
  language?: string;
  region?: string;
  timeout?: number;
  rateLimiter?: import('./rate-limiter').TmdbRateLimiter;
}
```

- [ ] **Step 5: Use it in `client.ts`**

```ts
// constructor:
this.rateLimiter = config.rateLimiter ?? globalTmdbRateLimiter;
```

with the import changed to `import {TmdbRateLimiter, globalTmdbRateLimiter} from './rate-limiter';` (keep the existing `TmdbRateLimiter` type import if the constructor still references the type).

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test -- src/lib/tmdb/rate-limiter.test.ts` — PASS.
Run: `npm run typecheck` — PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/tmdb/rate-limiter.ts src/lib/tmdb/rate-limiter.test.ts src/lib/tmdb/types.ts src/lib/tmdb/client.ts
git commit -m "fix(tmdb): share a global rate limiter across clients"
```

---

### Task 6: Parallelize Reference Upserts in Movie Sync

**Files:**
- Modify: `src/lib/ingestion/movie-sync.ts:55-112`

**Interfaces:**
- Consumes: `prisma` from `@/lib/db`; TMDB types (`TmdbMovie`).
- Produces: `ensureGenresExist`, `ensureProductionCompaniesExist`, `ensureProductionCountriesExist`, `ensureSpokenLanguagesExist` — same signatures, but execute upserts concurrently.

**Rationale:** A movie with ~25 reference entities does 25 sequential DB round-trips before the main transaction. TV sync already parallelizes these; movie sync should match.

- [ ] **Step 1: Convert each loop to `Promise.all`**

```ts
async function ensureGenresExist(genres: TmdbMovie['genres']) {
  await Promise.all(
    genres.map((genre) =>
      prisma.genre.upsert({
        where: {id: genre.id},
        create: {id: genre.id, name: genre.name},
        update: {name: genre.name},
      })
    )
  );
}
```

Apply the same pattern to `ensureProductionCompaniesExist`, `ensureProductionCountriesExist`, and `ensureSpokenLanguagesExist`.

- [ ] **Step 2: Verify**

Run: `npm run typecheck` — PASS. `npm run lint` — PASS.
Manual (dev + admin): trigger a single-movie sync via `POST /api/sync {"type":"movie","tmdbId":550}` → completes, genres/companies/countries/languages present in DB.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ingestion/movie-sync.ts
git commit -m "perf(sync): parallelize reference upserts in movie sync"
```

---

### Task 7: Dedupe Movie/TV Detail Page Queries

**Files:**
- Modify: `src/app/[locale]/movie/[id]/page.tsx`
- Modify: `src/app/[locale]/tv/[id]/page.tsx`

**Interfaces:**
- Consumes: `cache` from `react`; existing prisma queries.
- Produces:
  - `getMovieById(id, locale)` / `getTvSeriesById(id, locale)` — now wrapped in `cache()`, so `generateMetadata` + page render share one query per request.
  - When credits are missing, only `castCredits`/`crewCredits` are re-queried after `ensureMediaCredits` (no full re-query).

**Rationale:** Today each detail page runs the full heavy query at least twice (metadata + render; TV pages also call `getTvSeriesById` twice), plus a full re-query whenever credits were missing. `React.cache` memoizes per request (confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md` — "Memoization": same-args calls within a render pass execute once; `cache()` is the equivalent for non-`fetch` data access).

- [ ] **Step 1: Wrap the query in `cache()` — movie page**

```ts
import {cache} from 'react';

const getMovieById = cache(async function getMovieById(id: number, locale: string) {
  const movie = await prisma.movie.findUnique({ ... });
  ...
});
```

(Change `async function getMovieById` to `const getMovieById = cache(async function getMovieById`; call sites stay identical.)

- [ ] **Step 2: Replace the full re-query with a targeted credits re-fetch — movie page**

Replace the `if (!hasCredits) { await ensureMediaCredits(...); const refreshed = await prisma.movie.findUnique({...full include...}); Object.assign(movie, refreshed); }` block with:

```ts
if (!hasCredits) {
  await ensureMediaCredits('movie', movie.id, id);
  const [castCredits, crewCredits] = await Promise.all([
    prisma.castCredit.findMany({
      where: {movieId: movie.id},
      include: {person: true},
      orderBy: {order: 'asc'},
    }),
    prisma.crewCredit.findMany({
      where: {movieId: movie.id},
      include: {person: true},
    }),
  ]);
  movie.castCredits = castCredits;
  movie.crewCredits = crewCredits;
}
```

- [ ] **Step 3: Apply the same two changes to the TV page**

Same pattern with `'tv'`, `tvSeriesId`, and `prisma.tvSeries.findUnique` (wrap with `cache`, replace the full re-query with targeted `castCredit`/`crewCredit` finds using `where: {tvSeriesId: series.id}`).

- [ ] **Step 4: Verify**

Run: `npm run typecheck` — PASS.
Manual (dev): open `/en/movie/550` and `/en/tv/1399` — page renders, cast/crew visible; server logs show the heavy query once per request instead of 2-4x. (Verify via DB query log / Prisma `log: ['query']` temporarily, or observe request latency.)

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/movie/[id]/page.tsx" "src/app/[locale]/tv/[id]/page.tsx"
git commit -m "perf(pages): dedupe detail page queries and avoid full re-query on credit sync"
```

**Known limitation (documented, not fixed here):** the first visit to a movie/TV with no credits still blocks on the TMDB credit fetch (`ensureMediaCredits`). A proper fix needs a background job queue, which is a separate architectural change.

---

### Task 8: Consolidate Duplicate Middleware Files

**Files:**
- Modify: `src/middleware.ts`
- Delete: `middleware.ts` (root)

**Interfaces:**
- Consumes: `createMiddleware` from `next-intl/middleware`, `routing` from `@/i18n/routing`.
- Produces: a single middleware at `src/middleware.ts` that applies rate limiting to `/api/*` paths AND next-intl routing. Matcher covers pages, locales, and API routes.

**Rationale:** Two middleware files exist (root with rate limiting, `src/` with intl only). Only one is honored; the rate limiter may silently be dead code.

- [ ] **Step 1: Merge the root middleware into `src/middleware.ts`**

```ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

const intlMiddleware = createMiddleware(routing);

const rateLimitMap = new Map<string, {count: number; resetAt: number}>();

const RATE_LIMITS: Record<string, {max: number; windowMs: number}> = {
  '/api/auth/register': {max: 5, windowMs: 60 * 1000},
  '/api/auth/password': {max: 5, windowMs: 60 * 1000},
  '/api/search': {max: 30, windowMs: 60 * 1000},
  '/api/admin': {max: 60, windowMs: 60 * 1000},
};

const DEFAULT_RATE_LIMIT = {max: 60, windowMs: 60 * 1000};

function getRateLimitConfig(pathname: string) {
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) return config;
  }
  return DEFAULT_RATE_LIMIT;
}

function applyRateLimit(request: NextRequest): NextResponse | null {
  const {pathname} = request.nextUrl;

  if (!pathname.startsWith('/api/')) return null;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const key = `${ip}:${pathname}`;
  const config = getRateLimitConfig(pathname);
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, {count: 1, resetAt: now + config.windowMs});
    return null;
  }

  if (entry.count >= config.max) {
    return NextResponse.json(
      {error: 'Too many requests. Please try again later.'},
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
          'X-RateLimit-Limit': String(config.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  entry.count++;
  return null;
}

export function middleware(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/api/:path*',
  ],
};
```

- [ ] **Step 2: Delete the root middleware**

```bash
git rm middleware.ts
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck` and `npm run lint` — PASS.
Manual (dev): load `/` (renders), `GET /api/search?q=test` (works), hit `/api/search` 31+ times in a minute → `429`.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "fix(middleware): consolidate rate limiting and intl into one middleware"
```

---

### Task 9: Bound `/api/library` Response Size

**Files:**
- Modify: `src/app/api/library/route.ts`

**Interfaces:**
- Consumes: existing `searchParams` parsing.
- Produces: optional `limit` query param (default 100, max 500), `take` applied to both the annotations and watchlistItems queries. Response shape unchanged (still a JSON array) — non-breaking for `LibraryContent.tsx`.

**Rationale:** A power user with hundreds of annotations returns everything in one response, risking serverless timeouts and huge payloads.

- [ ] **Step 1: Add limit parsing and `take`**

```ts
// after the existing searchParams parsing:
const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 100, 1), 500);

// annotations query — add take:
const annotations = await prisma.userAnnotation.findMany({
  take: limit,
  where: { ... },
  orderBy: ...,
});

// watchlistItems query — add take:
const watchlistItems = await prisma.watchlistItem.findMany({
  take: limit,
  where: { ... },
  include: {watchlist: {select: {name: true}}},
});
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck` — PASS.
Manual (dev, logged in): `GET /api/library?limit=10` returns ≤ 10 items; `GET /api/library?limit=9999` returns ≤ 500.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/library/route.ts
git commit -m "perf(api): bound library response size with limit param"
```

---

### Task 10: DB Indexes + `Translation.data` Column Type

**Files:**
- Modify: `prisma/schema.prisma`
- New migration via `npx prisma migrate dev`

**Interfaces:**
- Produces: new indexes `Account.userId`, `Session.userId`, `TmdbList.accountId`; `Translation.data` becomes `@db.Text` (Postgres `text`, no truncation of large translation payloads).

**Rationale:** Account/Session lookups by `userId` and TmdbList by `accountId` currently scan tables; `Translation.data` is `varchar(191)` and truncates large JSON.

- [ ] **Step 1: Update the schema**

```prisma
model Translation {
  ...
  data        String? @db.Text
  ...
}

model Account {
  ...
  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("accounts")
}

model Session {
  ...
  @@index([userId])
  @@map("sessions")
}

model TmdbList {
  ...
  @@index([accountId])
  @@map("tmdb_lists")
}
```

- [ ] **Step 2: Generate and apply the migration**

Run: `npx prisma migrate dev --name add_production_indexes_and_text` (requires a running dev DB — `docker compose up -d db` if needed). Commit the generated migration folder.

- [ ] **Step 3: Verify**

Run: `npx prisma migrate status` — "Database schema is up to date". `npm run typecheck` — PASS.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "perf(db): add userId/accountId indexes and widen Translation.data"
```

---

### Task 11: Stop `seed-reference.ts` from Disconnecting Shared Prisma

**Files:**
- Modify: `src/lib/ingestion/seed-reference.ts:141-143`

**Interfaces:**
- Consumes: `prisma` from `@/lib/db`.
- Produces: `seedReferenceData()` no longer calls `prisma.$disconnect()`. Callers who run it as a standalone script (e.g. `npx tsx`) get process-exit cleanup automatically; app-context callers no longer kill the shared singleton.

- [ ] **Step 1: Remove the disconnect from the `finally` block**

```ts
} catch (error) {
  console.error('[seed] Reference data seeding failed:', error);
  throw error;
}
```

(Delete the `finally { await prisma.$disconnect(); }` block entirely.)

- [ ] **Step 2: Verify**

Run: `npm run typecheck` — PASS. Manual: `npx tsx src/lib/ingestion/seed-reference.ts` completes and the process exits.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ingestion/seed-reference.ts
git commit -m "fix(ingestion): don't disconnect shared prisma client in seed"
```

---

### Task 12: Stop PWA Service Worker from Caching API Responses

**Files:**
- Modify: `next.config.mjs`

**Interfaces:**
- Consumes: nothing new.
- Produces: the `/^\/api\/.*/i` runtimeCaching entry is removed; `next-pwa` no longer caches any API response. Static assets/images/pages caching stays.

**Rationale:** `NetworkFirst` caching of `/api/*` with 24h expiry can serve one user's `/api/library` or `/api/annotations` data to another on a shared device, and serves stale data. The app's public data comes from server components; the API layer is auth-dependent.

- [ ] **Step 1: Remove the API cache rule**

Delete this block from `runtimeCaching` in `next.config.mjs`:

```js
// API responses — NetworkFirst (try network, fall back to cache)
{
  urlPattern: /^\/api\/.*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60, // 1 day
    },
  },
},
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck` — PASS. Manual: `npm run build` completes; in the generated `public/sw.js` (or `public/sw.js.map`), no `api-cache` cache name remains.

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "fix(pwa): stop caching API responses in service worker"
```

---

### Task 13: Use Migrations Instead of `db push` in Docker Compose

**Files:**
- Modify: `docker-compose.yml:48`

**Interfaces:**
- Consumes: `prisma/migrations` (exists; created in Task 10).
- Produces: the app container command runs `npx prisma migrate deploy` (idempotent, applies committed migrations) instead of `npx prisma db push` (schema-drift prone).

- [ ] **Step 1: Update the command**

```yaml
command: ["/bin/sh", "-c", "npx prisma generate && npx prisma migrate deploy && exec npm run dev"]
```

- [ ] **Step 2: Verify**

Run: `docker compose config` — parses successfully. Manual: `docker compose up -d --build` starts the app; `docker compose logs app` shows migrations applied, no `db push` warnings.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "fix(docker): apply migrations instead of db push"
```

---

## Known Limitations (deferred, not in this plan)

1. **Blocking credit sync on first detail-page visit** — first view of a movie/TV without credits still blocks on a TMDB fetch (mitigated in Task 7 by not re-querying the full entity). Proper fix = background job queue (e.g. pg-boss / Vercel Cron), a separate architectural change.
2. **In-memory rate limiter is per-instance** in serverless (Vercel) — middleware rate limiting works per function instance only. A shared store (Upstash Redis) is required for global enforcement; deferred.
3. **Full admin sync may exceed serverless timeouts** — the lock (Task 4) prevents overlap but doesn't shorten the run. Deferred: split sync into per-page jobs.
4. **`/api/library` has no pagination UI** — the server now bounds the payload (Task 9) but the client has no "load more". Deferred to a UX task.
