# Group C: Perf batch + vercel.json + Full Lint Cleanup

**Date:** 2026-08-19
**Session:** continuation of 2026-08-19-admin-debt-cleanup (Groups A+B done, verified, committed, reviewed)
**Base commit:** `b8bfad6` (T4) + fix commits `d0cf15f`, `3d471dc` — head of `main`
**Mode:** 4 parallel CoderAgents, file-disjoint tasks, controller verifies/commits on `main` (repo norm)

## Spec

User-approved scope deferred from 2026-08-19-admin-debt-cleanup plan (Group C): old-plan Tasks 6 + 7 (perf batch, vercel.json) + full repo lint cleanup. Full lint inventory: `npx eslint src` = **46 problems (7 errors, 39 warnings)** in 21 files — inventory saved at `.superpowers/sdd/2026-08-19-admin-debt-cleanup/lint-inventory.txt` (re-run on completion must show 0).

## Impact warnings (user-requested flags — already verified, safe)

1. **Admin stats cache 60s** — dashboard stat cards (users/movies/tvSeries/persons) may lag up to 60s after adds. Accepted (was in user-approved Task 6).
2. **Translation selects drop `data` blob** — VERIFIED: only `src/lib/ingestion/translation-sync.ts:185` reads `translation.data` (write path, unaffected). No display consumer reads `.data`. Safe.
3. **vercel.json rewrite removal** — production-deploy-only effect (next deploy uses App Router routing exclusively); local dev unchanged. Middleware handles locale routing.
4. **Page caps (500)** — `?page=99999` shows page 500 instead of empty. No data impact.
5. **3 NEW set-state-in-effect errors** (SearchBar, SearchContent, AddToLibraryButton) — same bug class as Group A+B. Fix with the PROVEN corrected pattern (pure fetch useCallback + effect `.then/.catch/.finally` + cancelled flag); SearchBar is prop-sync → use render-time adjustment (React-sanctioned: `if (prev !== value) { setPrev(value); setLocalValue(value); }`).
6. **`<img>` → `<Image/>` (16 spots)** — visual/layout risk; mirror existing next/image usage in repo (movie detail pages); preserve aspect ratio + object-cover. Browser-verified after.
7. **Dead code removal** — verified unused by eslint; no feature reads them (STATUS_LABELS, canScrollLeft/Right, contentRatingsByCountry, tAnnotation, unused `t`/`session`/`locale`/imports). Safe.
8. **offline page `<a>` → `<Link>`** — client-side nav, same behavior.

## Tasks (file-disjoint)

### Task 1: Perf batch (controller-adapted from old plan Task 6)

Files: `src/lib/db/resolve-localized-titles.ts`, `src/app/[locale]/movie/[id]/page.tsx`, `src/app/[locale]/tv/[id]/page.tsx`, `src/app/[locale]/person/[id]/page.tsx`, `src/middleware.ts`, `src/app/[locale]/movies/page.tsx`, `src/app/[locale]/tv-series/page.tsx`, `src/app/api/admin/media/route.ts`, `src/app/api/admin/stats/route.ts`

1. Translation selects: both findMany in `resolve-localized-titles.ts` + movie page + tv page gain `select: {entityId, iso6391, iso31661, name, englishName}`. Person page: BOTH findMany (stub check ~line 35 with `take: 1`, polymorphic ~line 91) gain `select: {entityId, iso6391, iso31661, name, englishName, biography}`.
2. Rate map eviction in `middleware.ts` `applyRateLimit`: in the new-entry branch, when `rateLimitMap.size > 10000` sweep-expire entries with `now > v.resetAt` before setting.
3. Page caps: `Math.min(Math.max(1, Number(page) || 1), 500)` in movies page (~26-27), tv-series page (equivalent line), `api/admin/media/route.ts` page var.
4. Stats cache in `api/admin/stats/route.ts`: module-level `{data, at}` with 60s TTL around the four `count()` calls (keep admin guard + exact response shape `{users, movies, tvSeries, persons}`).
5. ALSO: remove unused `const t = useTranslations(...)` at `movies/page.tsx:22` (lint cleanup of this file — do not touch `t` usage elsewhere in that file beyond the removal; verify nothing else uses it).
6. Read-back: each file changed only at stated spots.

### Task 2: Lint-Core — 7 errors + vercel.json

Files: `src/app/[locale]/search/SearchContent.tsx`, `src/components/library/AddToLibraryButton.tsx`, `src/components/search/SearchBar.tsx`, `src/components/library/LibraryContent.tsx`, `vercel.json`

1. **SearchBar.tsx:30** (`setLocalValue(value)` in effect): convert to render-time adjustment:
   ```tsx
   const [prevValue, setPrevValue] = useState(value);
   if (prevValue !== value) { setPrevValue(value); setLocalValue(value); }
   ```
   Remove the sync effect entirely. Keep debounce + external callback logic intact.
2. **SearchContent.tsx:41** (`if (!query) { setResults(null); return; }`): restructure to pure-fetch pattern — extract pure fetch useCallback (no setState), effect uses `.then/.catch/.finally` + `cancelled` flag; for empty query clear results via render-time adjustment (`if (!query && results !== null) setResults(null);`) or lazy derive — read the file, preserve all behavior (debounce, race handling).
3. **AddToLibraryButton.tsx:42** (`if (!session?.user) { setIsLoading(false); return; }`): read file; apply pure-fetch + `.then/.finally` pattern; loading for logged-out must end up false without effect setState (e.g., initialize `useState(false)` + derive, or render-time adjust on session). Preserve button behavior exactly.
4. **LibraryContent.tsx**: fix 4 unescaped `"` errors (lines 738:90, 738:103, 814:92, 814:105) with `&quot;` or `{"\""}` matching surrounding text language; ALSO remove unused `useMemo` import (3:51), `useLocale` import (4:26), `STATUS_LABELS` (67:7); ALSO convert its 4 `<img>` (392:27, 429:27, 635:23, 766:23) to `<Image/>` per repo patterns.
5. **vercel.json**: delete the `rewrites` block → 4 keys only (`framework`, `buildCommand`, `installCommand`, `regions`), valid JSON, no trailing comma.

### Task 3: Lint-Warnings A — pages/api/lib

Files: `src/app/[locale]/people/page.tsx`, `src/app/[locale]/profile/page.tsx`, `src/app/[locale]/watchlists/[id]/page.tsx`, `src/app/offline/page.tsx`, `src/i18n/request.ts`, `src/lib/ingestion/media-credit-sync.ts`, `src/app/api/media/[type]/[id]/title/route.ts`

1. `<img>` → `<Image/>`: `people/page.tsx:53`, `profile/page.tsx:188` (mirror repo patterns).
2. Unused vars: `profile/page.tsx:18` (`session` — remove only if truly unused; check the whole file), `watchlists/[id]/page.tsx:94` (`tAnnotation` — remove declaration + its useTranslations import), `media-credit-sync.ts:8` (`TmdbCastMember`, `TmdbCrewMember` — remove from type import list).
3. `offline/page.tsx:26` (8× no-html-link-for-pages): replace `<a href="/">` with `<Link href="/">` (8 instances — read the file; they may be inside a nav/map). Keep offline page semantics.
4. `title/route.ts:41` (2× any): type properly — read the file, derive types from TMDB response shape used there.
5. `i18n/request.ts:8` (any): type the message access properly (e.g., `Record<string, unknown>` cast or explicit type) without changing request config behavior.

### Task 4: Lint-Warnings B — components

Files: `src/components/layout/Header.tsx`, `src/components/media/MediaFilterBar.tsx`, `src/components/media/MediaGallery.tsx`, `src/components/media/VideoList.tsx`, `src/components/media/WatchProviders.tsx`, `src/components/movie/MovieDetail.tsx`, `src/components/person/PersonDetail.tsx`, `src/components/watchlist/WatchlistContent.tsx`, `src/components/watchlist/WatchlistDetailContent.tsx`

1. `<img>` → `<Image/>`: Header:151, MediaGallery:111+163, VideoList:113, WatchProviders:73, WatchlistDetailContent:120 (mirror repo patterns — check how detail pages' Image components handle TMDB urls/sizes; preserve object-cover/aspect behavior).
2. Unused vars: MediaFilterBar (`basePath` 23:52, `currentGenre` 30:9 — remove declarations only if genuinely unused; verify the filter logic still works), MovieDetail (`contentRatingsByCountry` 240:9 — dead, remove), PersonDetail (`locale` 139:47 — remove param if caller allows, `canScrollLeft/Right` 161-162 — dead, remove), WatchlistContent (`WatchlistItem` 15:6, `locale` 45:43 — remove + prune imports).
3. Do NOT touch files outside this list.

## Rules for all agents

- NO bash/git/terminal. Edit files + read back. Report what you changed and any surprises (e.g., a var that LOOKED unused but was actually referenced in dead code or needed for a feature — then leave it and flag).
- Do not rename exports/params used by other files unless you update all callers in your file list.
- Do not change locale message files.
- Preserve behavior — these are cleanup changes; if a change would alter visible behavior, STOP and flag it in the report instead.

## Controller verification + commits

1. `npx tsc --noEmit` → PASS
2. `npx eslint src` → **0 problems** (was 46)
3. JSON: `node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8'))"`
4. Browser smoke: `/en` 200, `/en/search?q=test` renders, `/en/movies?page=99999` → page 500 rendered, offline page renders with links, detail page images render (movie 101)
5. Commits (one per task):
   - `perf: trim translation selects, bound rate map and pagination, cache admin stats`
   - `fix(lint): set-state-in-effect in search/library components; escape entities; drop stale vercel rewrite`
   - `chore(lint): pages/api/lib warning cleanup`
   - `chore(lint): component warning cleanup`
6. Review: dispatch CodeReviewer over `e67f88d..HEAD` (final whole-branch review for Groups A+B+C) + per-task review diffs.
7. Ledger closeout in `.superpowers/sdd/2026-08-19-admin-debt-cleanup/progress.md`; Thai summary to user.