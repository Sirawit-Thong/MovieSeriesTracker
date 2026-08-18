# Performance & Accessibility Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 findings from the 2026-08-18 performance/a11y audit of the MovieSeriesTracker web app: LCP image priority (Next.js 16 `priority` deprecation), TMDB preconnect, oversized crew DOM, viewport zoom blocking, card contrast/heading semantics, and language-switcher accessible names.

**Architecture:** Pure presentational changes in existing components — no data-model, API, or routing changes. All fixes are prop/attribute/JSX edits plus two small i18n message keys. Verification is browser-based (attribute checks, Lighthouse snapshot, DOM counts) plus typecheck/lint/build, matching how the previous audit round was verified.

**Tech Stack:** Next.js 16.3.1 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, next-intl (en/th), next/image via `TmdbImage` wrapper, Vitest (unaffected). Git repo root `D:\dev\MovieSeriesTracker`, work directly on `main`.

**Spec:** Findings from the performance traces (`/en`, `/en/movies`, `/en/movie/634649`) and Lighthouse snapshot (a11y 88/100) on 2026-08-18:

| # | Finding | Evidence | Severity |
|---|---------|----------|----------|
| 1 | LCP images never get `fetchpriority=high` — Next 16 deprecated `priority` (docs: *"Starting with Next.js 16, the `priority` property has been deprecated in favor of the `preload` property"*; recommended: *"use `loading="eager"` or `fetchPriority="high"` instead of `preload`"*). DOM shows `fetchpriority="auto"` on img + preload, network request priority **Low**. | Movies LCP 609ms (load delay 457ms = 75%), detail LCP 858ms (load delay 431ms = 50%) | High |
| 2 | No `<link rel="preconnect">` to `image.tmdb.org` (all posters/backdrops are cross-origin BunnyCDN) | Trace: "no origins were preconnected"; DOM `preconnects: []` | Medium |
| 3 | Crew list renders ~187 rows (Spider-Man: No Way Home) → DOM 3169 elements, layout update 177ms, render delay 291ms (34% of LCP) | DOMSize insight, selector `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3` = `MovieDetail.tsx:669` | Medium |
| 4 | `meta viewport` has `maximum-scale=1, user-scalable=no` — blocks pinch zoom | Lighthouse `meta-viewport` failed | Medium |
| 5 | Year text contrast 3.44:1 (needs ≥4.5:1) | Lighthouse `color-contrast`, `MediaCard.tsx:92` `text-foreground/40` | Low |
| 6 | Cards use `<h3>` with no `h2` ancestor (heading order invalid) | Lighthouse `heading-order`, `MediaCard.tsx:88` | Low |
| 7 | Language buttons `aria-label="Language"` don't include visible text "EN"/"TH" | Lighthouse `label-content-name-mismatch`, `LanguageSwitcher.tsx:32` | Low |

Deferred (NOT in this plan): `/api/auth/session` per-page fetch (dev trace showed 4× = React StrictMode double-invoke artifact; production = 1 fetch; server-side session pass-through would make the layout dynamic — revisit after hosting).

## Global Constraints

- Next.js 16 rule (per `node_modules/next/AGENTS.md`): `priority` prop is DEPRECATED — never use it. LCP images use `fetchPriority="high"` + `loading="eager"`. `preload` must not be combined with `fetchPriority`.
- All images use the `TmdbImage` wrapper (`src/components/ui/TmdbImage.tsx`) — it forwards all `ImageProps`, no wrapper change needed.
- i18n: every new message key must be added to BOTH `src/messages/en.json` and `src/messages/th.json` (match existing tone/format; th values are UTF-8, read with a UTF-8-capable editor).
- No new dependencies. No new lint errors on changed files (repo-wide lint is pre-existing red — run `npx eslint <changed files>` only).
- Conventional commit messages on `main` (repo norm, user-approved: `perf:`, `fix:`, `feat:`, `chore:`).
- Translation namespaces: `Movie` (MovieDetail), `Tv` (TvDetail), `LocaleSwitcher` (LanguageSwitcher). Existing `Tv.showMore` = "Show more", `Tv.showLess` = "Show less".

---

### Task 1: MediaCard a11y — contrast + heading semantics

**Files:**
- Modify: `src/components/media/MediaCard.tsx:88-94`

**Interfaces:**
- Consumes: nothing (self-contained)
- Produces: `MediaCard` renders card title as `<p>` instead of `<h3>`; year line uses `text-foreground/60`

- [ ] **Step 1: Edit the card title and year elements**

In `src/components/media/MediaCard.tsx`, change the title from `<h3>` to `<p>` (keeping all classes — a card title is not a heading; the page grid has no `h2` ancestor, so `<h3>` breaks heading order):

```tsx
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {year && year > 0 && (
          <p className="text-xs text-foreground/40 mt-1">{year}</p>
        )}
```

becomes:

```tsx
        <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </p>
        {year && year > 0 && (
          <p className="text-xs text-foreground/60 mt-1">{year}</p>
        )}
```

(`/40` → `/60` raises contrast from 3.44:1 to ≥4.5:1 on the `#141428` surface background.)

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit`
Expected: PASS (no output).

Run: `npx eslint src/components/media/MediaCard.tsx`
Expected: no NEW errors (existing repo-wide errors/warnings may appear; unchanged count vs baseline).

- [ ] **Step 3: Commit**

```bash
git add src/components/media/MediaCard.tsx
git commit -m "fix(a11y): media card heading semantics and year contrast"
```

---

### Task 2: LCP image priority — MediaCard `priority` prop + grid wiring + hero images

**Files:**
- Modify: `src/components/media/MediaCard.tsx:8-16, 47-54`
- Modify: `src/components/media/MediaSection.tsx:111-118, 154-162, 181-189`
- Modify: `src/app/[locale]/movies/page.tsx:116-127`
- Modify: `src/app/[locale]/tv-series/page.tsx:115-126`
- Modify: `src/components/movie/MovieDetail.tsx:249-256, 270-277`
- Modify: `src/components/tv/TvDetail.tsx:248-255, 269-276`
- Modify: `src/components/person/PersonDetail.tsx:167-174`

**Interfaces:**
- Consumes: `TmdbImage` forwards all `ImageProps` (no change needed)
- Produces: `MediaCard` gains optional prop `priority?: boolean`; when `true` renders `fetchPriority="high"` + `loading="eager"`, else `loading="lazy"`; callers pass `priority` for first-row cards. Hero images (backdrop/poster/profile) switch from deprecated `priority` to `fetchPriority="high"` + `loading="eager"`.

- [ ] **Step 1: Add `priority` prop to MediaCard and wire fetchPriority/loading**

In `src/components/media/MediaCard.tsx`:

```tsx
type MediaCardProps = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  voteAverage: number | null;
  type: 'movie' | 'tv';
  releaseDate?: string | Date | null;
  countryCodes?: string[];
};
```

becomes (append the new optional prop):

```tsx
type MediaCardProps = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  voteAverage: number | null;
  type: 'movie' | 'tv';
  releaseDate?: string | Date | null;
  countryCodes?: string[];
  priority?: boolean;
};
```

Update the destructuring (`export default function MediaCard({...}: MediaCardProps)`) to include `priority = false,`, and replace the hardcoded `priority={false}` image props:

```tsx
<TmdbImage
  src={posterSrc}
  alt={title}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
  className="object-cover"
  priority={false}
/>
```

becomes:

```tsx
<TmdbImage
  src={posterSrc}
  alt={title}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
  className="object-cover"
  fetchPriority={priority ? 'high' : 'auto'}
  loading={priority ? 'eager' : 'lazy'}
/>
```

- [ ] **Step 2: Wire `priority` by index in all MediaCard grids**

`src/components/media/MediaSection.tsx` — three render sites, add the index parameter and prop:

Mobile grid (line ~153):
```tsx
{items.map((item) => (
  <MediaCard
    key={item.id}
    ...
```
→
```tsx
{items.map((item, index) => (
  <MediaCard
    key={item.id}
    ...
    priority={index < 2}
```

Desktop grid (line ~180): same change with `priority={index < 6}`.

`HorizontalScroll` (line ~106): add `(item, index)` and `priority={index < 4}` on its `MediaCard`.

`src/app/[locale]/movies/page.tsx` (line ~116):
```tsx
{items.map((movie) => (
  <MediaCard
    key={movie.id}
```
→
```tsx
{items.map((movie, index) => (
  <MediaCard
    key={movie.id}
```
and add `priority={index < 6}` to the `MediaCard` props.

`src/app/[locale]/tv-series/page.tsx` (line ~115): identical change, `priority={index < 6}`.

(The same poster URLs are rendered in both the mobile and desktop grids, so eager images in the `display:none` grid dedupe to the same fetch — no extra requests.)

- [ ] **Step 3: Replace deprecated `priority` with `fetchPriority="high"` + `loading="eager"` on hero images**

`src/components/movie/MovieDetail.tsx` — backdrop (line ~249-256):

```tsx
<TmdbImage
  src={backdropSrc}
  alt={displayTitle}
  fill
  priority
  sizes="100vw"
  className="object-cover object-top"
/>
```
→
```tsx
<TmdbImage
  src={backdropSrc}
  alt={displayTitle}
  fill
  fetchPriority="high"
  loading="eager"
  sizes="100vw"
  className="object-cover object-top"
/>
```

Poster (line ~270-277): same swap (`priority` → `fetchPriority="high"` + `loading="eager"`, keep its `sizes`).

`src/components/tv/TvDetail.tsx` — backdrop (line ~248-255) and poster (line ~269-276): identical swaps.

`src/components/person/PersonDetail.tsx` — profile image (line ~167-174): same swap.

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit`
Expected: PASS.

Run: `npx eslint src/components/media/MediaCard.tsx src/components/media/MediaSection.tsx "src/app/[locale]/movies/page.tsx" "src/app/[locale]/tv-series/page.tsx" src/components/movie/MovieDetail.tsx src/components/tv/TvDetail.tsx src/components/person/PersonDetail.tsx`
Expected: no NEW errors.

- [ ] **Step 5: Browser verification — fetchpriority attributes**

Dev server is running on :3000. In the browser:

1. Navigate to `http://localhost:3000/en/movies`, wait for load.
2. Run in console: `[...document.querySelectorAll('img')].map(i => ({p: i.fetchPriority, l: i.loading})).filter(x => x.p === 'high')`
   Expected: 6 images with `fetchPriority: "high"` + `loading: "eager"` (the page has a single grid; cards at index ≥ 6 are `loading: "lazy"`).
3. Navigate to `http://localhost:3000/en/movie/634649`, run same snippet.
   Expected: hero backdrop + poster `fetchPriority: "high"`, `loading: "eager"`; cast/crew/other images `loading: "lazy"`.

- [ ] **Step 6: Commit**

```bash
git add src/components/media/MediaCard.tsx src/components/media/MediaSection.tsx "src/app/[locale]/movies/page.tsx" "src/app/[locale]/tv-series/page.tsx" src/components/movie/MovieDetail.tsx src/components/tv/TvDetail.tsx src/components/person/PersonDetail.tsx
git commit -m "perf: prioritize LCP images (fetchPriority high) replacing deprecated priority prop"
```

---

### Task 3: Layout head — TMDB preconnect + viewport zoom fix

**Files:**
- Modify: `src/app/[locale]/layout.tsx:17-24, 88-99`

**Interfaces:**
- Consumes: nothing
- Produces: root layout emits `<link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />` (React 19 hoists it into `<head>`) and a zoomable viewport meta

- [ ] **Step 1: Remove zoom-blocking viewport options**

`src/app/[locale]/layout.tsx:17-24`:

```tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
};
```

becomes:

```tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
};
```

- [ ] **Step 2: Add preconnect link to image.tmdb.org**

In the layout's JSX (line ~90), directly inside `<body ...>` before `<SessionProvider>`:

```tsx
<body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
  <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
  <SessionProvider>
```

- [ ] **Step 3: Typecheck + browser verification**

Run: `npx tsc --noEmit` → PASS.

Browser: reload `http://localhost:3000/en/movies`, run:

```js
({
  preconnects: [...document.querySelectorAll('link[rel="preconnect"]')].map(l => l.href),
  viewport: document.querySelector('meta[name="viewport"]')?.content,
})
```

Expected: preconnects contains `https://image.tmdb.org`; viewport content does NOT contain `user-scalable` or `maximum-scale`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/layout.tsx"
git commit -m "perf: preconnect image.tmdb.org; fix(a11y): allow viewport zoom"
```

---

### Task 4: Collapse crew list on detail pages

**Files:**
- Modify: `src/components/movie/MovieDetail.tsx:1-5, 221-222, 669-704`
- Modify: `src/components/tv/TvDetail.tsx:1-5, ~222-223, 703-737`
- Modify: `src/messages/en.json` (Movie namespace)
- Modify: `src/messages/th.json` (Movie namespace)

**Interfaces:**
- Consumes: `Movie` namespace keys `showMore`/`showLess` (new); `Tv` namespace already has `showMore`/`showLess`
- Produces: crew section renders first 20 credits + "Show more" button; clicking expands to all credits ("Show less" collapses)

- [ ] **Step 1: Add translation keys**

`src/messages/en.json`, Movie namespace — add after `crew` (check exact sibling key formatting; the file uses 2-space indent, keys in quotes):

```json
    "showMore": "Show more",
    "showLess": "Show less",
```

`src/messages/th.json`, Movie namespace — same keys with Thai values matching the tone of existing `Tv.showMore`/`Tv.showLess` th values (read `th.json` Tv namespace with the Read tool for the exact existing Thai strings and mirror them; e.g. `showMore` uses the "แสดงเพิ่มเติม"-style phrasing used there).

- [ ] **Step 2: MovieDetail — add collapse state**

`src/components/movie/MovieDetail.tsx` — add to imports:

```tsx
import {useState} from 'react';
```

After the crew dedupe (line ~222, `const crew = deduplicateByPersonId(movie.crewCredits);`), add:

```tsx
const [showAllCrew, setShowAllCrew] = useState(false);
const CREW_COLLAPSE_LIMIT = 20;
const visibleCrew = showAllCrew ? crew : crew.slice(0, CREW_COLLAPSE_LIMIT);
```

- [ ] **Step 3: MovieDetail — render collapsed crew + toggle button**

At line ~670, change:

```tsx
{crew.map((credit) => (
```
→
```tsx
{visibleCrew.map((credit) => (
```

After the closing `</div>` of the crew grid (line ~702, before the crew section's closing `</div>`), add:

```tsx
{crew.length > CREW_COLLAPSE_LIMIT && (
  <button
    type="button"
    onClick={() => setShowAllCrew((v) => !v)}
    className="mt-4 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
  >
    {showAllCrew ? t('showLess') : t('showMore')}
  </button>
)}
```

- [ ] **Step 4: TvDetail — mirror the same collapse**

`src/components/tv/TvDetail.tsx`:
- Add `import {useState} from 'react';` to imports (check current import block first).
- After the crew dedupe line (mirrors MovieDetail, around line ~222), add the same state + limit + `visibleCrew` block (TvDetail already has `t = useTranslations('Tv')`, whose namespace already contains `showMore`/`showLess`).
- Change `{crew.map((credit) => (` (line ~704) → `{visibleCrew.map((credit) => (`.
- After the crew grid's closing `</div>`, add the same toggle button (uses `t('showMore')` / `t('showLess')`).

- [ ] **Step 5: Typecheck + browser verification**

Run: `npx tsc --noEmit` → PASS.

Browser: navigate to `http://localhost:3000/en/movie/634649`, run:

```js
({
  crewLinks: [...document.querySelectorAll('a[href*="/person/"]')].length,
  button: [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Show more'))?.textContent ?? null,
})
```

Expected: `crewLinks <= 20` (plus cast links in the count — verify by checking the crew grid specifically: `document.querySelectorAll('div.grid.grid-cols-1 > a[href*="/person/"]').length`), button text "Show more" present. Click the button, re-run → button text becomes "Show less", crew count increases to the full ~187.

Then navigate to a TV show detail page (e.g. `http://localhost:3000/en/tv/1399`) and confirm the same behavior.

- [ ] **Step 6: Commit**

```bash
git add src/components/movie/MovieDetail.tsx src/components/tv/TvDetail.tsx src/messages/en.json src/messages/th.json
git commit -m "perf: collapse crew list behind show-more to cut detail-page DOM"
```

---

### Task 5: LanguageSwitcher accessible names

**Files:**
- Modify: `src/components/layout/LanguageSwitcher.tsx:32`

**Interfaces:**
- Consumes: existing `LocaleSwitcher.locale` keys (`en: "English"`, `th: "Thai"`)
- Produces: each locale button's accessible name contains its visible label ("EN"/"TH"), e.g. "EN: English"

- [ ] **Step 1: Replace the shared aria-label**

`src/components/layout/LanguageSwitcher.tsx:32`:

```tsx
aria-label={t('label')}
```
→
```tsx
aria-label={`${label}: ${t('locale', {locale: code})}`}
```

This yields "EN: English" / "TH: Thai" — the accessible name now includes the visible text, satisfying the `label-content-name-mismatch` rule. (`LocaleSwitcher.label` becomes unused; remove its usage but KEEP the key in messages if other components use it — check with grep before deleting; if unused anywhere, removing the key is optional, do not bother.)

- [ ] **Step 2: Typecheck + Lighthouse verification**

Run: `npx tsc --noEmit` → PASS.

Browser: navigate to `http://localhost:3000/en/movies`, then run Lighthouse snapshot (`chrome-devtools_lighthouse_audit`, mode snapshot):
Expected: `label-content-name-mismatch` no longer in the failed list; Accessibility score ≥ 95.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/LanguageSwitcher.tsx
git commit -m "fix(a11y): language switcher accessible names include visible labels"
```

---

## Final Verification (after all tasks)

1. `npx tsc --noEmit` — PASS.
2. `npm run build` — PASS (58 static pages, no new warnings beyond the pre-existing middleware→proxy deprecation warning).
3. `npm test` — vitest suite still 27/27 (no lib code touched; confirm no regression).
4. Lighthouse snapshot on `/en/movies` — Accessibility ≥ 95 (up from 88).
5. Browser trace `/en/movie/634649` — LCP load delay reduced (hero now High priority), DOM node count reduced (crew collapsed).