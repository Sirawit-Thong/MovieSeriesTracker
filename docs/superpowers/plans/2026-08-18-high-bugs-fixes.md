# High-Bug Fixes & Easy Perf Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 high-severity functional bugs (broken recommendations, broken watchlist detail, double person-page sync, ineffective ban enforcement, 500s on bad route params) plus 4 small safe performance wins found in the third audit round.

**Architecture:** All fixes are localized edits to existing server pages, one client component, auth config, middleware, and small config/DB-layer spots. No schema changes, no new API routes (watchlist detail gets server-fetched data passed into the existing client component instead of its broken per-item fetches).

**Tech Stack:** Next.js 16.3.1 App Router (Turbopack), TypeScript, Prisma 7 + PostgreSQL, next-intl 4, next-auth v5, React 19.

**Spec:** Third audit round findings (verified by the controller):
- F-1 (HIGH): Recommendations always empty — sync writes `targetId: rec.id` (TMDB id, movie-sync.ts:365, tv-sync.ts:619) but detail pages query `where: {id: {in: recMovieIds}}` (DB autoincrement PK, movie/[id]/page.tsx:98, tv/[id]/page.tsx ~108). Verified in code.
- F-2 (HIGH): Watchlist detail page always empty — `WatchlistDetailContent.tsx:60-62` fetches `/api/movies/${entityId}` / `/api/tv-series/${entityId}` which DO NOT EXIST (API tree has only `media/[type]/[id]/title`); every fetch 404s and the grid renders `null` per item. Card links also point to `/${locale}/movies/${id}` (plural) but the route is `/[locale]/movie/[id]` (singular) — dead links. Verified in code.
- F-3 (HIGH): Person detail page runs the full TMDB credit sync TWICE per request — `getPersonById` (person/[id]/page.tsx:21) is not `React.cache`d, called from both `generateMetadata` (line 177) and the page (line 203); it unconditionally calls `client.getPersonDetails` + `syncPersonCredits` + `syncCombinedCredits` (lines 50-57). Verified in code. `Person.lastFetchedAt` exists (set by person-sync.ts:63-64 and stub creation media-credit-sync.ts:106) and on-demand.ts has the `isStale` 7-day pattern to mirror.
- F-4 (HIGH): Ban enforcement is a paper tiger — `authorize` (auth/config.ts:26-46) never checks `user.banned`; the jwt callback stamps `banned` on the token (line 148) and session (line 160) but nothing enforces it. Verified in code.
- F-5 (HIGH): Non-numeric route params 500 — movie/[id]/page.tsx:167,193; tv/[id]/page.tsx:177,203; person/[id]/page.tsx:177,203 do `Number(id)` → NaN → Prisma throws. Admin list routes (users/watchlists/annotations/login-logs) do `Math.max(1, parseInt('abc'))` → NaN → 500. Verified in code.
- P-1 (MEDIUM): Translation queries fetch full rows including the `data` `@db.Text` JSON blob but only use `name`/`biography` (resolve-localized-titles.ts:45-53; movie/tv/person detail page translation fetches).
- P-2 (LOW): Middleware `rateLimitMap` grows unbounded (middleware.ts:8,36-41) — no eviction of expired entries.
- P-3 (LOW): Unbounded offset pagination — `Number(page) || 1` with no cap (movies/page.tsx:26-27, tv-series page, api/admin/media/route.ts:15).
- P-4 (LOW): Admin stats route runs 4 × `COUNT(*)` over the largest tables on every load (api/admin/stats/route.ts:13-19).
- AS-1 (HIGH, infra): `vercel.json:6-8` has a stale catch-all rewrite `{"source": "/(.*)", "destination": "/[locale]"}` — a pre-i18n leftover that can 404 prefixed pages in production. Delete the block.

## Global Constraints

- Next.js 16: never use the deprecated `priority` image prop; read bundled docs in `node_modules/next/dist/docs/` if uncertain.
- Repo-wide `npm run lint` is pre-existing red (14 errors + 37 warnings) — tasks only require no NEW errors/warnings on changed files.
- Conventional commit messages (`fix:`, `perf:`, `chore:`); work on `main` directly (repo norm).
- `entityId` on watchlist items = TMDB id (detail pages route by tmdbId).
- JSON message files: 2-space indent, standard JSON.
- Do NOT add comments unless the plan's code block includes them.
- Controller runs all verification (tsc/eslint/build/tests/browser) and commits; implementers apply + read-back-verify only (their environment denies bash).

---

### Task 1: Fix recommendations lookup (TMDB id vs DB PK)

**Files:**
- Modify: `src/app/[locale]/movie/[id]/page.tsx:97-98`
- Modify: `src/app/[locale]/tv/[id]/page.tsx` (identical block, locate by content)

**Interfaces:**
- Consumes: nothing
- Produces: `RecommendationList` receives the actual recommended movies/TV (section renders instead of being empty)

- [ ] **Step 1: Fix the movie page lookup**

In `src/app/[locale]/movie/[id]/page.tsx`, the block:

```tsx
  const [recMovies, recTv] = await Promise.all([
    recMovieIds.length > 0
      ? prisma.movie.findMany({
          where: {id: {in: recMovieIds}},
```

Change `where: {id: {in: recMovieIds}}` → `where: {tmdbId: {in: recMovieIds}}`. Do NOT touch the `select` block or anything else.

- [ ] **Step 2: Fix the TV page lookup**

In `src/app/[locale]/tv/[id]/page.tsx`, find the identical recommendation lookup pattern (the `recMovieIds`/`recTvIds` Promise.all block — `where: {id: {in: recTvIds}}` for the tvSeries query). Change `where: {id: {in: recTvIds}}` → `where: {tmdbId: {in: recTvIds}}` (and if the movie sub-query in that file also uses `id`, fix it the same way — the file may not have a movie sub-query; fix whatever `id:` appears in the recommendation lookups).

- [ ] **Step 3: Read back + self-review**

Read both files back. Confirm: only the `where` clause(s) of the recommendation lookups changed; the `recMovieIds`/`recTvIds` construction (filtering `recommendations` by `targetType` and mapping `targetId`) is untouched; nothing else in the file changed.

- [ ] **Step 4: Report**

Report file: `.superpowers/sdd/2026-08-18-high-bugs-fixes/task-1-report.md` — what changed per file, read-back quotes, self-review.

- [ ] **Step 5: Controller verification + commit**

Controller runs:
- `npx tsc --noEmit` → PASS
- `npx eslint src/app/[locale]/movie/[id]/page.tsx src/app/[locale]/tv/[id]/page.tsx` → no NEW errors/warnings (baseline applies)
- Browser: navigate to `http://localhost:3000/en/movie/634649` → the recommendations/similar section renders cards (previously empty). If the section is still empty, check whether the dev DB has `recommendation` rows: run `node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.recommendation.count({where:{sourceType:'movie'}}).then(c=>{console.log('rec rows:',c);return p.\$disconnect()})"` — if 0 rows, the fix is verified by typecheck + code review and browser check is N/A.

Commit:
```bash
git add "src/app/[locale]/movie/[id]/page.tsx" "src/app/[locale]/tv/[id]/page.tsx"
git commit -m "fix: match recommendations by tmdbId instead of db primary key"
```

---

### Task 2: Watchlist detail — server-fetched media data + correct links

**Files:**
- Modify: `src/app/[locale]/watchlists/[id]/page.tsx`
- Modify: `src/components/watchlist/WatchlistDetailContent.tsx`

**Interfaces:**
- Consumes: existing `WatchlistItem` rows (polymorphic `entityType`/`entityId` where entityId = TMDB id); existing MediaData shape in the client
- Produces: client receives `initialMedia: Record<string, MediaData>` (keyed `\`${entityType}-${entityId}\``) and renders items immediately; no network fetches on mount

- [ ] **Step 1: Server page — batch-query media for all items**

In `src/app/[locale]/watchlists/[id]/page.tsx`, after the `watchlist` query (line ~32-35) and before the return, build the media map. Replace the items mapping (lines ~51-55) to also gather entity ids:

```tsx
  const movieItems = watchlist.items.filter((i) => i.entityType === 'MOVIE');
  const tvItems = watchlist.items.filter((i) => i.entityType === 'TV');
  const personItems = watchlist.items.filter((i) => i.entityType === 'PERSON');

  const [movies, tvSeries, persons] = await Promise.all([
    movieItems.length > 0
      ? prisma.movie.findMany({
          where: {tmdbId: {in: movieItems.map((i) => i.entityId)}},
          select: {tmdbId: true, title: true, posterPath: true, voteAverage: true, releaseDate: true},
        })
      : [],
    tvItems.length > 0
      ? prisma.tvSeries.findMany({
          where: {tmdbId: {in: tvItems.map((i) => i.entityId)}},
          select: {tmdbId: true, name: true, posterPath: true, voteAverage: true, firstAirDate: true},
        })
      : [],
    personItems.length > 0
      ? prisma.person.findMany({
          where: {tmdbId: {in: personItems.map((i) => i.entityId)}},
          select: {tmdbId: true, name: true, profilePath: true},
        })
      : [],
  ]);

  const initialMedia: Record<string, {
    id: number;
    title: string;
    posterPath: string | null;
    voteAverage: number | null;
    firstAirDate?: string | null;
    releaseDate?: string | null;
  }> = {};
  for (const m of movies) {
    initialMedia[`MOVIE-${m.tmdbId}`] = {
      id: m.tmdbId, title: m.title, posterPath: m.posterPath,
      voteAverage: m.voteAverage, releaseDate: m.releaseDate,
    };
  }
  for (const t of tvSeries) {
    initialMedia[`TV-${t.tmdbId}`] = {
      id: t.tmdbId, title: t.name, posterPath: t.posterPath,
      voteAverage: t.voteAverage, firstAirDate: t.firstAirDate,
    };
  }
  for (const p of persons) {
    initialMedia[`PERSON-${p.tmdbId}`] = {
      id: p.tmdbId, title: p.name, posterPath: p.profilePath,
      voteAverage: null,
    };
  }
```

Note the existing `items` mapping (lines ~51-55) stays as-is. Pass the map to the client:

```tsx
    <WatchlistDetailContent
      locale={locale}
      watchlist={{
        id: watchlist.id,
        name: watchlist.name,
        description: watchlist.description,
        items: watchlist.items.map((item) => ({
          id: item.id,
          entityType: item.entityType,
          entityId: item.entityId,
        })),
      }}
      initialMedia={initialMedia}
```

- [ ] **Step 2: Client — use initialMedia, drop the broken fetch**

In `src/components/watchlist/WatchlistDetailContent.tsx`:
- Add `initialMedia: Record<string, MediaData>;` to `Props` and destructure it.
- Replace the `useState` initializers:

```tsx
  const [items, setItems] = useState<WatchlistItemData[]>(watchlist.items);
  const [mediaCache, setMediaCache] = useState<Record<string, MediaData>>({});
  const [isLoading, setIsLoading] = useState(true);
```

→

```tsx
  const [items, setItems] = useState<WatchlistItemData[]>(watchlist.items);
  const [mediaCache, setMediaCache] = useState<Record<string, MediaData>>(initialMedia);
  const [isLoading, setIsLoading] = useState(items.length === 0);
```

- DELETE the entire `useEffect` fetch block (lines ~49-98, from `// Fetch media data for all items` through the effect close) — it fetches the non-existent `/api/movies/${id}` / `/api/tv-series/${id}` routes. `useEffect` may become unused — remove it from the react import if so (`import {useState} from 'react'`).

- [ ] **Step 3: Client — fix item links and handle PERSON**

In the render, replace the link construction (lines ~159-161):

```tsx
            const link = item.entityType === 'MOVIE'
              ? `/${locale}/movies/${item.entityId}`
              : `/${locale}/tv-series/${item.entityId}`;
```

→

```tsx
            const link = item.entityType === 'MOVIE'
              ? `/${locale}/movie/${item.entityId}`
              : item.entityType === 'TV'
                ? `/${locale}/tv/${item.entityId}`
                : `/${locale}/person/${item.entityId}`;
```

And the type label (line ~183):

```tsx
                    {item.entityType === 'MOVIE' ? 'Movie' : 'TV'}
```

→

```tsx
                    {item.entityType === 'MOVIE' ? 'Movie' : item.entityType === 'TV' ? 'TV' : 'Person'}
```

- [ ] **Step 4: Read back + self-review**

Read both files back. Confirm: server page passes `initialMedia`; client has no `fetch(` calls left for media; `getMedia`/`mediaCache` unchanged in behavior; links point to the singular routes (`/movie/`, `/tv/`, `/person/`); no other changes.

- [ ] **Step 5: Report**

Report file: `.superpowers/sdd/2026-08-18-high-bugs-fixes/task-2-report.md`.

- [ ] **Step 6: Controller verification + commit**

Controller runs:
- `npx tsc --noEmit` → PASS
- `npx eslint src/app/[locale]/watchlists/[id]/page.tsx src/components/watchlist/WatchlistDetailContent.tsx` → no NEW errors/warnings
- Browser: if a logged-in session exists in the dev profile, navigate to `http://localhost:3000/en/watchlists` and open a populated watchlist — cards render with correct links, no console errors. If redirected to login, verify via code review only and note for the user.

Commit:
```bash
git add "src/app/[locale]/watchlists/[id]/page.tsx" src/components/watchlist/WatchlistDetailContent.tsx
git commit -m "fix: watchlist detail fetches media server-side and links to real routes"
```

---

### Task 3: Person page — React.cache + staleness-gated credit sync

**Files:**
- Modify: `src/app/[locale]/person/[id]/page.tsx`

**Interfaces:**
- Consumes: `Person.lastFetchedAt` (existing column), `fetchAndUpsertPerson(tmdbId)` (existing), `syncPersonCredits(tmdbId, client)` + `syncCombinedCredits(personId, credits)` (existing)
- Produces: `getPersonById` runs once per request; TMDB credit sync runs only when the person is a stub or `lastFetchedAt` is null/older than 7 days

- [ ] **Step 1: Add React.cache and merge the duplicate person queries**

In `src/app/[locale]/person/[id]/page.tsx`:
- Add `import {cache} from 'react';` to the imports.
- Change `async function getPersonById(id: number, locale: string) {` → `const getPersonById = cache(async function getPersonById(id: number, locale: string) {` and close the function with `});` instead of `}`.
- Merge the two initial `findUnique` calls (lines ~23-34) into one with the stub fields + `lastFetchedAt`:

```tsx
  const person = await prisma.person.findUnique({
    where: {tmdbId: id},
    select: {
      id: true,
      tmdbId: true,
      biography: true,
      birthday: true,
      placeOfBirth: true,
      lastFetchedAt: true,
    },
  });

  if (!person) return null;
```

(Delete the old second `findUnique` that selected biography/birthday/placeOfBirth.)

- [ ] **Step 2: Stub upgrade + staleness gate around the credit sync**

Wrap the unconditional sync block. Current code (lines ~41-57):

```tsx
  if (isStub) {
    console.log(`[person-page] Upgrading stub person ${id} to full record`);
    await fetchAndUpsertPerson(person.tmdbId);
  }

  // Always re-sync credits from TMDB to ensure completeness.
  // Pass user locale to TMDB so titles come back in the correct language.
  const tmdbLanguage = locale === 'th' ? 'th-TH' : 'en-US';
  const client = new TmdbClient({language: tmdbLanguage});
  const [personDetails2] = await Promise.all([
    client.getPersonDetails(person.tmdbId, 'combined_credits'),
    syncPersonCredits(person.tmdbId, client),
  ]);
  // Also sync combined credits (used by Filmography — doesn't require FK to movie/TV)
  if (personDetails2.combined_credits) {
    await syncCombinedCredits(person.id, personDetails2.combined_credits);
  }
```

→

```tsx
  const CREDITS_STALE_MS = 7 * 24 * 60 * 60 * 1000;
  const creditsStale =
    !person.lastFetchedAt ||
    Date.now() - person.lastFetchedAt.getTime() > CREDITS_STALE_MS;

  if (isStub) {
    console.log(`[person-page] Upgrading stub person ${id} to full record`);
    await fetchAndUpsertPerson(person.tmdbId);
  }

  // Re-sync credits from TMDB only when the person is a stub (partial credits
  // from media-credit-sync) or the last full sync is older than 7 days.
  // Pass user locale to TMDB so titles come back in the correct language.
  if (isStub || creditsStale) {
    const tmdbLanguage = locale === 'th' ? 'th-TH' : 'en-US';
    const client = new TmdbClient({language: tmdbLanguage});
    const [personDetails2] = await Promise.all([
      client.getPersonDetails(person.tmdbId, 'combined_credits'),
      syncPersonCredits(person.tmdbId, client),
    ]);
    if (personDetails2.combined_credits) {
      await syncCombinedCredits(person.id, personDetails2.combined_credits);
    }
  }
```

(`isStub` computed from the merged query stays the same. Note: after a stub upgrade, `person.lastFetchedAt` still reflects the pre-upgrade read (null/stale), so `isStub || creditsStale` correctly forces one credit sync post-upgrade; the next visit sees a full record with fresh `lastFetchedAt` and skips.)

- [ ] **Step 3: Read back + self-review**

Read the file back. Confirm: `cache` wrapper closes with `});`; single initial query; gate present; the final `fullPerson` fetch and all downstream code untouched; `getPersonById` still returns the same shape.

- [ ] **Step 4: Report**

Report file: `.superpowers/sdd/2026-08-18-high-bugs-fixes/task-3-report.md`.

- [ ] **Step 5: Controller verification + commit**

Controller runs:
- `npx tsc --noEmit` → PASS
- `npx eslint src/app/[locale]/person/[id]/page.tsx` → no NEW errors/warnings
- Browser: navigate to `http://localhost:3000/en/person/1136406` (Tom Holland) — page renders; repeat navigation — no error. (Sync-count verification is code-review-level.)

Commit:
```bash
git add "src/app/[locale]/person/[id]/page.tsx"
git commit -m "fix: cache person page fetch and gate credit re-sync on staleness"
```

---

### Task 4: Enforce user bans (login rejection + active-session block)

**Files:**
- Modify: `src/lib/auth/config.ts`
- Modify: `src/middleware.ts`

**Interfaces:**
- Consumes: `session.user.banned` already stamped (auth/config.ts:160); `auth` export from config; existing intl middleware + rate limiter
- Produces: banned users cannot sign in via credentials; banned users with existing sessions are redirected to `/en/login?error=banned` on any page request

- [ ] **Step 1: Reject banned credentials in authorize**

In `src/lib/auth/config.ts`, in the Credentials `authorize` (after the `!user || !user.passwordHash` check, before `verifyPassword`), add:

```tsx
      if (user.banned) {
        await recordLogin({
          userId: user.id,
          email: user.email,
          name: user.name,
          method: 'credentials',
          request,
          success: false,
          reason: 'Banned',
        });
        return null;
      }
```

- [ ] **Step 2: Block banned sessions in middleware**

`auth()` in middleware runs the jwt callback, which hits Prisma (auth/config.ts:142) — the default Edge runtime cannot run Prisma. Node.js middleware runtime is stable since Next 15.5 (per bundled docs, proxy.md:774-776), so this task pins `runtime: 'nodejs'` in the middleware config. (Middleware→Proxy migration stays deferred debt; do not migrate here.)

In `src/middleware.ts`, wrap the middleware with next-auth's `auth` and add the banned check. Replace the export:

```tsx
export function middleware(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  if (request.nextUrl.pathname.startsWith('/api')) return NextResponse.next();

  return intlMiddleware(request);
}
```

→

```tsx
export const middleware = auth((request) => {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  if (request.nextUrl.pathname.startsWith('/api')) return NextResponse.next();

  const user = request.auth?.user as
    | (Record<string, unknown> & {banned?: boolean})
    | undefined;
  if (user?.banned) {
    const locale = request.nextUrl.pathname.startsWith('/th') ? 'th' : 'en';
    return NextResponse.redirect(new URL(`/${locale}/login?error=banned`, request.nextUrl));
  }

  return intlMiddleware(request);
});
```

Add the import at the top of the file:

```tsx
import {auth} from './lib/auth/config';
```

And add the nodejs runtime to the existing config export:

```tsx
export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/api/:path*',
  ],
  runtime: 'nodejs',
};
```

Keep `applyRateLimit` and `intlMiddleware` as-is.

- [ ] **Step 3: Read back + self-review**

Read both files back. Confirm: authorize rejects banned with a login-log entry; middleware uses `auth(...)` wrapper (req.auth populated), banned users redirected, anonymous/API requests unaffected; matcher unchanged; no circular import (`middleware.ts` imports `config.ts` — config does NOT import middleware).

- [ ] **Step 4: Report**

Report file: `.superpowers/sdd/2026-08-18-high-bugs-fixes/task-4-report.md`.

- [ ] **Step 5: Controller verification + commit**

Controller runs:
- `npx tsc --noEmit` → PASS
- `npx eslint src/lib/auth/config.ts src/middleware.ts` → no NEW errors/warnings
- Browser: `http://localhost:3000/en` loads normally (anonymous path works; session cookie absent in dev profile → banned path untestable in browser, code-review-level).

Commit:
```bash
git add src/lib/auth/config.ts src/middleware.ts
git commit -m "fix: enforce user bans on login and active sessions"
```

---

### Task 5: Validate numeric route params (404 instead of 500)

**Files:**
- Modify: `src/app/[locale]/movie/[id]/page.tsx` (getMovieById)
- Modify: `src/app/[locale]/tv/[id]/page.tsx` (getTvSeriesById — locate by content)
- Modify: `src/app/[locale]/person/[id]/page.tsx` (getPersonById)
- Modify: `src/app/api/admin/users/route.ts:24`
- Modify: `src/app/api/admin/watchlists/route.ts:11-13`
- Modify: `src/app/api/admin/annotations/route.ts:11-15`
- Modify: `src/app/api/admin/login-logs/route.ts:11-13`

**Interfaces:**
- Consumes: nothing
- Produces: invalid numeric ids return 404 (pages) / page 1 (admin APIs) instead of 500

- [ ] **Step 1: Pages — early null return on invalid id**

In `src/app/[locale]/movie/[id]/page.tsx` `getMovieById`, immediately after the function opens, add:

```tsx
  if (!Number.isInteger(id) || id <= 0) return null;
```

Do the same in `src/app/[locale]/tv/[id]/page.tsx` inside its get-by-id cached function (locate by content — the function that queries `findUnique({where: {tmdbId: id}})`).

In `src/app/[locale]/person/[id]/page.tsx` `getPersonById` (already cache-wrapped by Task 3), add the same early return as the first statement:

```tsx
  if (!Number.isInteger(id) || id <= 0) return null;
```

- [ ] **Step 2: Admin routes — safe page parsing**

In each of the 4 admin routes, replace:

```tsx
const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
```

(wherever the exact spelling differs slightly, e.g. `searchParams.get('page')`, keep the surrounding code) with:

```tsx
const pageParam = Number(searchParams.get('page') ?? '1');
const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
```

- [ ] **Step 3: Read back + self-review**

Confirm each file changed only at the stated spots.

- [ ] **Step 4: Report**

Report file: `.superpowers/sdd/2026-08-18-high-bugs-fixes/task-5-report.md`.

- [ ] **Step 5: Controller verification + commit**

Controller runs:
- `npx tsc --noEmit` → PASS
- `npx eslint <all 7 changed files>` → no NEW errors/warnings
- Browser: `http://localhost:3000/en/movie/abc` → 404 page (not error page); `http://localhost:3000/en/person/abc` → 404.

Commit:
```bash
git add "src/app/[locale]/movie/[id]/page.tsx" "src/app/[locale]/tv/[id]/page.tsx" "src/app/[locale]/person/[id]/page.tsx" src/app/api/admin/users/route.ts src/app/api/admin/watchlists/route.ts src/app/api/admin/annotations/route.ts src/app/api/admin/login-logs/route.ts
git commit -m "fix: validate numeric route params, 404 instead of 500"
```

---

### Task 6: Small perf batch — translation selects, rate-map eviction, page caps, stats cache

**Files:**
- Modify: `src/lib/db/resolve-localized-titles.ts:45-53`
- Modify: `src/app/[locale]/movie/[id]/page.tsx` (translation findMany)
- Modify: `src/app/[locale]/tv/[id]/page.tsx` (translation findMany)
- Modify: `src/app/[locale]/person/[id]/page.tsx` (translation findMany — needs biography)
- Modify: `src/middleware.ts` (rate map eviction)
- Modify: `src/app/[locale]/movies/page.tsx:26-27`
- Modify: `src/app/[locale]/tv-series/page.tsx` (page cap, same pattern)
- Modify: `src/app/api/admin/media/route.ts:15`
- Modify: `src/app/api/admin/stats/route.ts`

**Interfaces:**
- Consumes: nothing
- Produces: translation reads no longer transfer the `data` blob; rate map bounded; page params capped; admin stats cached 60s

- [ ] **Step 1: Translation selects**

`src/lib/db/resolve-localized-titles.ts` — both `prisma.translation.findMany` calls (movie + tv) gain:

```tsx
          select: {entityId: true, iso6391: true, iso31661: true, name: true, englishName: true},
```

(insert as a property of the where-clause object's sibling, same indentation as `where`).

`src/app/[locale]/movie/[id]/page.tsx` — its own `prisma.translation.findMany` (where entityType: 'movie', entityId: movie.id) gains the same select.

`src/app/[locale]/tv/[id]/page.tsx` — same change on its translation findMany.

`src/app/[locale]/person/[id]/page.tsx` — translation findMany gains a select that includes biography:

```tsx
          select: {entityId: true, iso6391: true, iso31661: true, name: true, englishName: true, biography: true},
```

(There are two translation findMany calls in this file — one in the stub check with `take: 1` (line ~35) and the polymorphic one (line ~91). Add the select to BOTH.)

- [ ] **Step 2: Rate map eviction**

In `src/middleware.ts` `applyRateLimit`, in the branch where a new entry is created (line ~38-40), extend:

```tsx
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, {count: 1, resetAt: now + config.windowMs});
    return null;
  }
```

→

```tsx
  if (!entry || now > entry.resetAt) {
    if (rateLimitMap.size > 10000) {
      for (const [k, v] of rateLimitMap) {
        if (now > v.resetAt) rateLimitMap.delete(k);
      }
    }
    rateLimitMap.set(key, {count: 1, resetAt: now + config.windowMs});
    return null;
  }
```

- [ ] **Step 3: Page caps**

`src/app/[locale]/movies/page.tsx` line ~26-27:

```tsx
  const currentPage = Math.max(1, Number(page) || 1);
```

→

```tsx
  const currentPage = Math.min(Math.max(1, Number(page) || 1), 500);
```

`src/app/[locale]/tv-series/page.tsx`: same change on its equivalent line (locate by content).

`src/app/api/admin/media/route.ts` line ~15: same cap on its page variable (locate by content, `Math.max(1, ...)` pattern).

- [ ] **Step 4: Admin stats cache**

`src/app/api/admin/stats/route.ts` — add a module-level cache with 60s TTL:

```tsx
let statsCache: {data: unknown; at: number} | null = null;
const STATS_TTL_MS = 60 * 1000;
```

In the GET handler, replace the four `count()` calls with a cached computation:

```tsx
  const now = Date.now();
  if (!statsCache || now - statsCache.at > STATS_TTL_MS) {
    const [users, movies, tvSeries, persons] = await Promise.all([
      prisma.user.count(),
      prisma.movie.count(),
      prisma.tvSeries.count(),
      prisma.person.count(),
    ]);
    statsCache = {
      data: {users, movies, tvSeries, persons},
      at: now,
    };
  }
  return NextResponse.json(statsCache.data);
```

(Read the existing route first — keep its exact response shape and admin guard; replace only the counting logic.)

- [ ] **Step 5: Read back + self-review**

Confirm each file changed only at the stated spots; the stats route keeps its auth guard.

- [ ] **Step 6: Report**

Report file: `.superpowers/sdd/2026-08-18-high-bugs-fixes/task-6-report.md`.

- [ ] **Step 7: Controller verification + commit**

Controller runs:
- `npx tsc --noEmit` → PASS
- `npx eslint <all 9 changed files>` → no NEW errors/warnings
- Browser: `http://localhost:3000/en/movies` loads; `http://localhost:3000/en/movies?page=99999` → shows page 500 (not empty/error).

Commit:
```bash
git add src/lib/db/resolve-localized-titles.ts "src/app/[locale]/movie/[id]/page.tsx" "src/app/[locale]/tv/[id]/page.tsx" "src/app/[locale]/person/[id]/page.tsx" src/middleware.ts "src/app/[locale]/movies/page.tsx" "src/app/[locale]/tv-series/page.tsx" src/app/api/admin/media/route.ts src/app/api/admin/stats/route.ts
git commit -m "perf: trim translation selects, bound rate map and pagination, cache admin stats"
```

---

### Task 7: Remove stale vercel.json catch-all rewrite

**Files:**
- Modify: `vercel.json`

**Interfaces:**
- Consumes: nothing
- Produces: Vercel deploys use framework (App Router) routing only

- [ ] **Step 1: Delete the rewrites block**

`vercel.json` currently:

```json
{
  "framework": "nextjs",
  "buildCommand": "npx prisma generate && next build",
  "installCommand": "npm install",
  "regions": ["sin1"],
  "rewrites": [
    { "source": "/(.*)", "destination": "/[locale]" }
  ]
}
```

→

```json
{
  "framework": "nextjs",
  "buildCommand": "npx prisma generate && next build",
  "installCommand": "npm install",
  "regions": ["sin1"]
}
```

- [ ] **Step 2: Read back + self-review**

Confirm the JSON is valid (4 keys, no trailing comma) and nothing else changed.

- [ ] **Step 3: Report**

Report file: `.superpowers/sdd/2026-08-18-high-bugs-fixes/task-7-report.md`.

- [ ] **Step 4: Controller verification + commit**

Controller: JSON validity via `node -e "console.log(JSON.parse(require('fs').readFileSync('vercel.json','utf8')))"`.

Commit:
```bash
git add vercel.json
git commit -m "chore: remove stale catch-all rewrite that breaks locale routing on vercel"
```

---

## Final Verification (after all tasks)

Controller runs:
1. `npx tsc --noEmit` → PASS
2. `npm run build` → PASS (all routes compile)
3. `npm test` → 27/27 PASS
4. Browser:
   - `/en/movie/634649` — recommendations section renders cards
   - `/en/movie/abc`, `/en/person/abc` → 404 pages
   - `/en/movies?page=99999` → capped page, no error
   - `/en/person/1136406` — renders, no console errors
5. Review: dispatch whole-branch review over `9fda984..HEAD` (CodeReviewer, whole-branch-review-package.md pattern).