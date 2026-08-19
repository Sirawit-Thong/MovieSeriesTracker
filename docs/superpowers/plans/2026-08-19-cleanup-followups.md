# Plan: Cleanup follow-ups (A/B/C remaining items)

**Date:** 2026-08-19
**Base commit:** `b4ea162` (head of main, Groups A+B+C complete)
**Mode:** 3 parallel CoderAgents (file-disjoint) + controller-owned config/verification tasks
**Scope:** items A1-A3, B4-B8 from the Group A+B+C close-out report, plus user decisions C9/C10

## Spec

### A — ยังไม่ได้ทำ (จากรายงานปิดงาน)
- A1: `npm run lint` (eslint .) broken — root cause FOUND: `.superpowers/` dir (agent workspace: scratch-test.tsx ฯลฯ) is not in eslint ignores; the custom rules block applies `@typescript-eslint/*` rules to it without the plugin registered → config error. Fix: add `.superpowers/` (and `.playwright-mcp/`) to the ignores block in `eslint.config.mjs`. Controller-owned (verification loop: npm run lint → triage any NEW findings outside src, e.g. prisma/seed.ts — fix or scope).
- A2: `text-blue-400` → `text-yellow-400` at `src/app/[locale]/admin/page.tsx:193` (running-indicator label — deferred minor from T3 review, user intent = yellow everywhere).
- A3: `npm run build` (production build — never run for this branch; requires dev server stopped). Controller-owned.

### B — จาก Final Review (pre-existing, งานเล็ก)
- B4/B5: Unify the 3 `tmdb/[tmdbId]` routes:
  - `movie/tmdb/[tmdbId]/page.tsx` — already `isNaN` guard → notFound; change guard to `Number.isInteger(tmdbIdNum)` (matches `[id]` pages). Keep notFound on fetch-miss.
  - `tv/tmdb/[tmdbId]/page.tsx` + `person/tmdb/[tmdbId]/page.tsx` — currently `isNaN` guard + `redirect('/${locale}')` on BOTH guard-miss and fetch-miss (silent bounce home). Change: `Number.isInteger` guard → `notFound()`, and fetch-miss → `notFound()`. Success-path redirects to canonical `/${locale}/tv/${result.tmdbId}` / `person/...` UNCHANGED.
- B6: `src/messages/th.json:324` — `"entity": " Entity"` leading space → `"Entity"` (check en.json counterpart is clean).
- B7: `AddToLibraryButton.tsx:102` — `setTimeout(() => setJustAdded(false), 2000)` not cleared on unmount. Fix: `useRef<ReturnType<typeof setTimeout> | null>` + cleanup `useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, [])` (no setState in the cleanup effect — rule-safe) + clear/replace timer in addToLibrary.
- B8: `WatchlistDetailContent.tsx` — (a) `const [isLoading] = useState(false)` (line 49) is dead (never set → skeleton branch unreachable): remove the state AND the `isLoading ? skeleton :` ternary (keep empty-state + grid branches — behavior identical); (b) hardcoded strings → i18n: "← Back to Watchlists" (line 78), "No Image" (line 130), "Movie"/"TV"/"Person" (line 138). The component receives a `translations: Translations` prop built by `src/app/[locale]/watchlists/[id]/page.tsx` — EXTEND the Translations type + the page's prop object + ADD keys to BOTH `en.json` and `th.json` (dual-file rule). Check the page for the existing namespace (`WatchlistDetail`?) and use it; the `movies`/`tvSeries` keys may already exist in the type — reuse; add `person` if missing. Type-label rendering becomes `t.movies`/`t.tvSeries`/`t.person`.

### C — การตัดสินใจ (user-answered)
- C9: **Add middleware exception for /offline** — `src/middleware.ts` matcher line ~87: `'/((?!api|_next|_vercel|.*\\..*).*)'` → `'/((?!api|_next|_vercel|offline|.*\\..*).*)'`. `/offline` becomes directly reachable (no locale redirect). Keep the offline page as-is.
- C10: **People crop 2:3 kept** — NO action (matches app-wide card pattern).
- C11: **admin media page cap — NO action** — already bounded by `parsePageParam` (1–100000, shared by 6 admin routes); the public 500 cap exists because public pages are unauthenticated. Documented, not changed.

## Impact warnings (user-requested disclosure)

1. **tv/person TMDB-numbered links change behavior**: `/en/tv/tmdb/<bad-id>` and `/en/person/tmdb/<bad-id>` currently bounce to home; after this they show the 404 page (consistent with movie + `[id]` pages). Legit links (search results, library pushes, watchlist links) redirect to canonical pages exactly as before. Low risk — verified paths all resolve via `findUnique({where: {tmdbId}})`.
2. **/offline becomes reachable** — previously a 404 on direct URL; after the middleware change it renders the offline page at `/offline`. No other route affected (negative lookahead addition is exact-match for the path segment).
3. **WatchlistDetail strings become translatable** — new i18n keys added to both locale files; English labels appear under TH locale as whatever th.json gets (agent writes Thai). No behavior change for EN; TH watchlist-detail page shows new Thai labels.
4. **eslint config change** — `npm run lint` starts working repo-wide; if it surfaces NEW pre-existing findings outside `src` (e.g. `prisma/seed.ts`), controller triages (fix trivial / scope-ignore) before commit — no src behavior change.
5. **No other behavior changes** — label color (visual only), th.json space (cosmetic), timer cleanup (no visible change), dead-state removal (skeleton was unreachable — identical render).

## Tasks (file-disjoint)

### Task 1 (Agent A) — tmdb routes unify (B4/B5)
Files: `src/app/[locale]/movie/tmdb/[tmdbId]/page.tsx`, `src/app/[locale]/tv/tmdb/[tmdbId]/page.tsx`, `src/app/[locale]/person/tmdb/[tmdbId]/page.tsx`
Rules: keep success-path canonical redirects; `Number.isInteger` guard → `notFound()`; fetch-miss → `notFound()`; prune now-unused imports if any.

### Task 2 (Agent B) — component polish (B7/B8)
Files: `src/components/library/AddToLibraryButton.tsx`, `src/components/watchlist/WatchlistDetailContent.tsx`, `src/app/[locale]/watchlists/[id]/page.tsx`, `src/messages/en.json`, `src/messages/th.json`
Rules: timer cleanup must not introduce setState-in-effect; i18n keys added to BOTH locale files; keep the `translations` prop pattern (don't switch to useTranslations hook inside the component unless the page already passes `t` — check first).

### Task 3 (Agent C) — routing + admin + i18n polish (A2, B6, C9)
Files: `src/middleware.ts` (matcher), `src/app/[locale]/admin/page.tsx:193`, `src/messages/th.json:324` (+ verify en.json sibling)
Rules: matcher change is the ONLY middleware edit; th.json edit is the `entity` key only.

### Task 4 (Controller) — config, build, verification, commits
- A1: edit `eslint.config.mjs` ignores → `['node_modules/', '.next/', 'generated/', 'public/', '*.config.*', '.superpowers/', '.playwright-mcp/']`; run `npm run lint`; triage new findings.
- Verify: `npx tsc --noEmit`; `npm run lint` (0 problems); `npm run build` (dev server stopped); browser: `/en/tv/tmdb/999999999` → 404, `/offline` renders, `/en/watchlists/1` (if reachable logged-out) or detail page renders, `/th` strings OK.
- Commits (one per task): `fix(routes): unify tmdb-id guards and 404 on miss`, `fix(watchlist): clear just-added timer, localize detail strings`, `chore: make /offline reachable, yellow running label, th entity key`, `chore(lint): ignore agent workspace dirs in eslint`.
- Dispatch CodeReviewer over the follow-up diff; ledger + Thai summary.

## Final Verification
tsc PASS · eslint 0 problems (npm run lint) · npm run build PASS · browser smoke above.