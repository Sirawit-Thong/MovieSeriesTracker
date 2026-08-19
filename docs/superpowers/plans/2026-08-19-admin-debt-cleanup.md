# Admin Debt Cleanup (Group A+B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the known admin-area debt — 6 `react-hooks/set-state-in-effect` lint errors (5 known + sync-history discovered), watchlists stale-clamp, loose client types, dead i18n key, running-badge color, plus Group B: public detail-page 404 validation and the logged-out 401 annotations fetch.

**Architecture:** Four parallel agents, one batch — file ownership is disjoint (Task 1: users+watchlists+sync-history; Task 2: annotations+login-history; Task 3: media+dashboard+i18n; Task 4: public pages+AnnotationPanel). Each task ends with controller-run tsc + eslint verification; controller commits per task; 4 parallel CodeReviewers after.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, next-intl (en/th — i18n edits MUST touch BOTH files), Prisma 7, next-auth v5.

**Spec:** User-approved design from 2026-08-19 conversation: badge unified to YELLOW; public pages 404 on non-integer id; AnnotationPanel skips fetch when no session; set-state-in-effect fixed per the CORRECTED pattern (see Ruling note in Task 1 — the original "remove setLoading(true)" design was empirically disproven); Group C (perf batch, vercel.json, full lint cleanup) explicitly deferred.

**Context:** Admin overhaul plan `2026-08-19-admin-dashboard-overhaul.md` completed — this plan's ledger (`progress.md` rulings 8, 10, 12) documents: Ruling 8 = the 5 set-state-in-effect errors are PRE-EXISTING debt; Ruling 10 = fresh-data clamp pattern. Implementation discovery during this plan: sync-history/page.tsx is a 6th flagged page; the rule flags ANY setState-bearing function called from an effect (await ignored) — the corrected pattern is PURE fetch callbacks + effect-side `.then/.catch/.finally` (empirically verified lint-clean in `scratch-test.tsx`, pattern C).

## Global Constraints

- Every change must NOT add new eslint warnings; goal is ZERO errors on all touched files (tsc + eslint run by controller).
- No comments added to code unless replacing existing ones.
- i18n edits touch BOTH `src/messages/en.json` and `src/messages/th.json` (same keys, locale values).
- CoderAgent implementers have NO bash — they edit + read-back only; controller verifies and commits.
- Baseline git: `main` at `e67f88d` (clean tree except ignored `.playwright-mcp` log).

---

### Task 1: users + watchlists + sync-history pages — set-state-in-effect fix + fresh-data clamp

**Files:**
- Modify: `src/app/[locale]/admin/users/page.tsx`
- Modify: `src/app/[locale]/admin/watchlists/page.tsx`
- Modify: `src/app/[locale]/admin/sync-history/page.tsx`

**Interfaces:**
- Consumes: existing `fetchUsers(p, searchQuery, roleFilter)` useCallback, `fetchWatchlists(p)` useCallback, `fetchLogs(p)` useCallback (sync-history), `loading` state (initial `true`), `data` state, `t` from `useTranslations('Admin')`.
- Produces: all three fetch callbacks are PURE (no setState, return `Response | null`); effects apply state via `.then/.catch/.finally` with a cancelled flag; watchlists `onConfirm` clamps with fresh data.

> **Ruling 2026-08-19 (pattern correction):** `react-hooks/set-state-in-effect` (React Compiler HIR) flags ANY function called from an effect whose body contains a setState call — await boundaries are ignored for called functions. The plan's original fix (removing `setLoading(true)`) is insufficient. The verified-clean pattern (ledger + scratch-test.tsx): PURE fetch callback + effect-side `.then/.catch/.finally` with cancelled flag. sync-history/page.tsx is a 6th flagged page (discovered during implementation) — folded in here.

- [ ] **Step 1: users page — pure `fetchUsers` + effect pattern**

In `src/app/[locale]/admin/users/page.tsx`:
- Rewrite `fetchUsers` useCallback to be PURE: keep the existing URL/params; `if (res.ok) { const nextData: UsersResponse = await res.json(); return nextData; } return null;` wrapped in the existing `try/catch` returning `null`. REMOVE all `setLoading/setData/setError` calls and the `t` usage; deps `[]`.
- Rewrite the effect (line 68) as:

```ts
  useEffect(() => {
    let cancelled = false;
    fetchUsers(page, debouncedSearch, role)
      .then((nextData) => {
        if (!cancelled) {
          if (nextData) {
            setData(nextData);
            setError(null);
          } else {
            setError(t('loadError'));
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError(t('loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, fetchUsers, debouncedSearch, role]);
```

- Update the handler call sites (lines ~100, ~122, ~143) that relied on `await fetchUsers(...)` applying state: capture the return and apply state from it. For a plain refresh: `const nextData = await fetchUsers(page, debouncedSearch, role); if (nextData) { setData(nextData); setError(null); } else { setError(t('loadError')); }`. The clamp at line ~143 keeps its semantics: `if (nextData) { setData(nextData); setError(null); if (page > nextData.totalPages) setPage(Math.max(1, nextData.totalPages)); } else { setError(t('loadError')); }`. Read each call site and preserve its existing post-fetch logic.

- [ ] **Step 2: watchlists page — pure `fetchWatchlists` + effect pattern**

Same two-step conversion as Step 1, applied to `fetchWatchlists` (URL `/api/admin/watchlists?page=${p}` — keep whatever URL form is currently in the file) and its effect (line 62, deps `[page, fetchWatchlists]`).

- [ ] **Step 3: watchlists page — fresh-data clamp in onConfirm**

In the delete ConfirmButton `onConfirm` (currently: `if (res.ok) { const nextData = await fetchWatchlists(page); if (nextData && page > nextData.totalPages) setPage(Math.max(1, nextData.totalPages)); } else { setError(t('watchlistsPage.deleteError')); }`), make it apply state from the return too:

```ts
      if (res.ok) {
        const nextData = await fetchWatchlists(page);
        if (nextData) {
          setData(nextData);
          setError(null);
          if (page > nextData.totalPages) setPage(Math.max(1, nextData.totalPages));
        } else {
          setError(t('watchlistsPage.deleteError'));
        }
      } else {
        setError(t('watchlistsPage.deleteError'));
      }
```

(The `try { ... } catch` wrapper stays as-is.)

- [ ] **Step 4: sync-history page — pure `fetchLogs` + effect pattern**

Same conversion for `fetchLogs` (URL `/api/admin/sync-logs?page=${p}`). This page has NO error state — the effect applies `setData` only (`if (!cancelled) setData(nextData)` when truthy) plus `finally { if (!cancelled) setLoading(false); }`; no `.catch` needed (fetchLogs catches internally). Effect deps `[page, fetchLogs]`.

- [ ] **Step 5: Verify (controller runs)**

Run: `npx tsc --noEmit` and `npx eslint "src/app/[locale]/admin/users/page.tsx" "src/app/[locale]/admin/watchlists/page.tsx" "src/app/[locale]/admin/sync-history/page.tsx"`
Expected: tsc clean; eslint clean — ZERO `react-hooks/set-state-in-effect` errors on these pages.

- [ ] **Step 6: Commit (controller)**

```bash
git add "src/app/[locale]/admin/users/page.tsx" "src/app/[locale]/admin/watchlists/page.tsx" "src/app/[locale]/admin/sync-history/page.tsx"
git commit -m "fix(admin): clear set-state-in-effect on users/watchlists/sync-history; fresh-data clamp on watchlists delete"
```

---

### Task 2: annotations + login-history pages — set-state-in-effect fix + type cleanup

**Files:**
- Modify: `src/app/[locale]/admin/annotations/page.tsx`
- Modify: `src/app/[locale]/admin/login-history/page.tsx`

**Interfaces:**
- Consumes: existing `fetchAnnotations(...)` useCallback, `fetchLogs(...)` useCallback (login-history), `loading` states (initial `true`), `Annotation` type (has `id: number` after first pass), `LoginLog` type (userAgent removed in first pass).
- Produces: both fetch callbacks PURE + effects use the `.then/.catch/.finally` pattern; `Annotation.id: number`; `LoginLog` without `userAgent` (already applied in first pass — verify, don't redo).

> **Ruling 2026-08-19 (pattern correction):** same as Task 1 — PURE fetch callback + effect-side `.then/.catch/.finally` with cancelled flag (await boundaries ignored by the rule). The first pass removed `setLoading(true)` only — insufficient; rework to the full pattern.

- [ ] **Step 1: annotations page — pure `fetchAnnotations` + effect pattern**

In `src/app/[locale]/admin/annotations/page.tsx`:
- Rewrite `fetchAnnotations(page, status, entityType)` useCallback PURE (same URL/params; return parsed response or `null`; try/catch retained; remove setState + `t`; deps `[]`).
- Rewrite the effect (line 85) with the Task 1 Step 1 pattern (deps `[page, fetchAnnotations, status, entityType]`).
- Update the handler call site (line ~270, `const next = await fetchAnnotations(page, status, entityType);`): apply state from the return — `if (next) { setData(next); setError(null); } else { setError(t('loadError')); }` preserving any existing clamp logic.
- Confirm `Annotation.id` is `number` (first pass) — if it regressed, fix it.

- [ ] **Step 2: login-history page — pure `fetchLogs` + effect pattern**

Same conversion for `fetchLogs(page, debouncedSearch, method, success)` (URL unchanged; effect deps `[page, fetchLogs, debouncedSearch, method, success]`). No handler call sites on this page (only the effect). Confirm `userAgent` is gone from `LoginLog` (first pass) — if it regressed, fix it.

- [ ] **Step 3: Verify (controller runs)**

Run: `npx tsc --noEmit` and `npx eslint "src/app/[locale]/admin/annotations/page.tsx" "src/app/[locale]/admin/login-history/page.tsx"`
Expected: tsc clean; eslint clean on both files.

- [ ] **Step 4: Commit (controller)**

```bash
git add "src/app/[locale]/admin/annotations/page.tsx" "src/app/[locale]/admin/login-history/page.tsx"
git commit -m "fix(admin): clear set-state-in-effect on annotations/login-history; tighten Annotation.id and LoginLog types"
```

---

### Task 3: media page + dashboard badge + dead i18n key

**Files:**
- Modify: `src/app/[locale]/admin/media/page.tsx`
- Modify: `src/app/[locale]/admin/page.tsx`
- Modify: `src/messages/en.json` (line ~425)
- Modify: `src/messages/th.json` (line ~425)

**Interfaces:**
- Consumes: `MediaItem` type in media/page.tsx (has `id: number` after first pass), `t('runningNow')` render in admin/page.tsx (yellow classes after first pass), `Admin.viewHistory` root key (removed in first pass), `Admin.syncPanel.viewHistory` (live).
- Produces: `MediaItem.id: number`; running badge + pulsing dot in YELLOW; `Admin.viewHistory` removed from both locales (first pass applied badge + i18n + type — verify, don't redo).

> **Ruling 2026-08-19 (pattern correction):** same as Task 1 — PURE fetch callback + effect-side `.then/.catch/.finally` with cancelled flag.

- [ ] **Step 1: media page — pure `fetchMedia` + effect pattern**

In `src/app/[locale]/admin/media/page.tsx`:
- Rewrite `fetchMedia(page, mediaType, debouncedQuery)` useCallback PURE (same URL/params; return parsed response or `null`; try/catch retained; remove setState + `t`; deps `[]`).
- Rewrite the effect (line 285) with the Task 1 Step 1 pattern (deps `[page, fetchMedia, mediaType, debouncedQuery]`).
- Update the handler call site (line ~303, `const next = await fetchMedia(page, mediaType, debouncedQuery);`): apply state from the return — `if (next) { setData(next); setError(null); } else { setError(t('loadError')); }` preserving any existing clamp logic.
- Confirm `MediaItem.id` is `number` (first pass) — if it regressed, fix it.

- [ ] **Step 2: Verify first-pass badge + i18n changes still present**

Read `src/app/[locale]/admin/page.tsx`: running badge must be `bg-yellow-500/15 text-yellow-400`, pulsing dot `bg-yellow-400`, static dot `bg-yellow-500` (no blue left at those spots). Read both JSON files: `viewHistory` must appear ONLY under `syncPanel`. If any regressed, fix. Do NOT re-edit otherwise.

- [ ] **Step 3: Verify (controller runs)**

Run: `npx tsc --noEmit`, `npx eslint "src/app/[locale]/admin/media/page.tsx" "src/app/[locale]/admin/page.tsx"`, and `node -e "JSON.parse(require('fs').readFileSync('src/messages/en.json','utf8'));JSON.parse(require('fs').readFileSync('src/messages/th.json','utf8'));console.log('OK')"`
Expected: tsc clean; eslint clean (media page error gone; admin page has no errors); JSON OK.

- [ ] **Step 4: Commit (controller)**

```bash
git add "src/app/[locale]/admin/media/page.tsx" "src/app/[locale]/admin/page.tsx" src/messages/en.json src/messages/th.json
git commit -m "fix(admin): clear set-state-in-effect on media page, tighten MediaItem.id, unify running badge to yellow, drop dead Admin.viewHistory key"
```

---

### Task 4: public detail pages — 404 on invalid id + AnnotationPanel session guard

**Files:**
- Modify: `src/app/[locale]/movie/[id]/page.tsx`
- Modify: `src/app/[locale]/tv/[id]/page.tsx`
- Modify: `src/app/[locale]/person/[id]/page.tsx`
- Modify: `src/components/user/AnnotationPanel.tsx`

**Interfaces:**
- Consumes: `getMovieById(tmdbId: number, locale)` / `getTvSeriesById` / `getPersonById` (each page's existing loader), `notFound()` from `next/navigation` (already imported), `useSession` from `next-auth/react` (AnnotationPanel), `AnnotationData` type.
- Produces: `/movie/abc` (and tv/person) → 404 before any Prisma query; AnnotationPanel renders NOTHING for logged-out users (no fetch, no error box, no skeleton). **First pass applied and verified lint-clean (not in the eslint error list) — verify only, no redo.**

- [ ] **Step 1: Verify first-pass edits present**

Read the 3 public pages: each must have the `Number.isInteger` guard + validated variable used at BOTH call sites (both `generateMetadata` and the page export). Read AnnotationPanel: `useSession` import, `status` guard in effect (`if (status !== 'authenticated') return;`), deps `[status, entityType, entityId]`, render order (loading→null→error→panel), no `isLoading`/`setIsLoading` anywhere. If any regressed, fix. Do NOT re-edit otherwise.

- [ ] **Step 2: Verify (controller runs)**

Run: `npx tsc --noEmit` and `npx eslint "src/app/[locale]/movie/[id]/page.tsx" "src/app/[locale]/tv/[id]/page.tsx" "src/app/[locale]/person/[id]/page.tsx" src/components/user/AnnotationPanel.tsx`
Expected: tsc clean; eslint clean.

Browser (controller): `http://localhost:3000/en/movie/abc` → 404 page (not 500); `/en/movie/101` loads, console has NO `/api/annotations` 401 errors.

- [ ] **Step 3: Commit (controller)**

```bash
git add "src/app/[locale]/movie/[id]/page.tsx" "src/app/[locale]/tv/[id]/page.tsx" "src/app/[locale]/person/[id]/page.tsx" src/components/user/AnnotationPanel.tsx
git commit -m "fix(public): 404 on non-integer detail ids; skip annotations fetch when logged out"
```

---

## Final Verification (controller, after all tasks)

1. `npx tsc --noEmit` — clean
2. `npx eslint` on all 11 touched files — ZERO errors (the 6 `react-hooks/set-state-in-effect` errors must be gone: 5 known + sync-history)
3. `node -e` JSON parse on both message files; grep `viewHistory` → only under `syncPanel`
4. Browser (logged out): `/en/movie/101` console has no 401 from `/api/annotations`; `/en/movie/abc` → 404; `/en`, `/en/movies` still 200
5. `git log --oneline -6` — 4 task commits present
6. Group C (perf batch, vercel.json, full lint cleanup) NOT started — explicitly deferred