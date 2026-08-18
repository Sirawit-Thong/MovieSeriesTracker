# Admin Dashboard Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all audited admin-area bugs (field mismatches, 500-risks, banned-admin API access, rate-limit bypass, broken nav links, double-fetch search), add missing CRUD (watchlist/annotation/media delete, dashboard system status), and extract shared admin UI components.

**Architecture:** Three parallel batches. Batch 1 = backend security/validation + shared UI foundations (no file overlap). Batch 2 = frontend page fixes (annotations, media, users/login-history, watchlists — no file overlap). Batch 3 = CRUD additions + dashboard (depends on Batch 2 files). Each task ends with tsc + eslint verification; controller runs browser/API regression after each batch.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, next-intl (en/th — every new translation key MUST be added to BOTH `src/messages/en.json` and `src/messages/th.json`), Prisma 7 + PostgreSQL, next-auth v5.

**Spec:** Findings from 3-agent admin audit (2026-08-19, in conversation): annotations field mismatch, media `?type=` ignored, banned admins retain API access, NaN page → 500 in 6 routes, XFF rate-limit bypass, search double-fetch, read-only watchlists/annotations/media pages, no shared admin components, dead `/api/admin/stats`, hardcoded en-US dates, SyncPanel `slice(0,0)` hack, no dashboard system status, no watchlists card.

**Supersedes:** Task 5 (admin-route portion) of `docs/superpowers/plans/2026-08-18-high-bugs-fixes.md`. The public-pages portion of that task (movie/tv/person `[id]` pages early null return) stays with the old plan.

**Deferred (out of scope, noted for backlog):** admin sidebar/nav in layout, sync-history page auto-refresh/filters, dead `/api/admin/stats` route removal (no caller), duplicate `src/lib/rate-limit/middleware.ts` removal.

## Global Constraints

- Do NOT touch public feature files: `src/app/[locale]/movie/**`, `tv/**`, `person/**`, `movies/**`, `tv-series/**`, `watchlists/**`, `library/**`, `search/**`, `profile/**`, `login/**`, `register/**` (except none needed here).
- Do NOT add new eslint warnings on changed files (baseline has 14 errors + 37 warnings repo-wide; changed files must stay clean).
- Every new translation key added to BOTH `en.json` and `th.json` under the `Admin` namespace, same position, no key drift.
- Admin pages are client components using `useTranslations('Admin')` — shared components created in this plan may use it too.
- Prisma cascade: `Movie`, `TvSeries`, `Person` children all `onDelete: Cascade` (verified in `prisma/schema.prisma`) — deleting a media row cascades its credits/genres/etc. `UserAnnotation.entityId`/`WatchlistItem.entityId` are plain Ints (no FK) — media delete does NOT touch user data.
- Public detail routes use TMDB id: `/movie/{tmdbId}`, `/tv/{tmdbId}`, `/person/{tmdbId}` — for entity links use `member.tmdbId`-style values.
- Verification per task: `npx tsc --noEmit` (clean) + `npx eslint <changed files>` (no NEW warnings) + curl checks for API changes (`Invoke-WebRequest` on Windows PowerShell: expect 401 anonymous / 400 bad params).
- Commit per task (user works on `main` directly, repo norm).

---

## Batch 1 — Backend security + shared foundations (4 parallel agents, no file overlap)

### Task 1: requireAdmin rejects banned users

**Files:**
- Modify: `src/lib/admin.ts:4-17`

**Interfaces:**
- Consumes: `auth()` from `@/lib/auth/config` (JWT already carries `role` and `banned` — refreshed per-request in `config.ts:154-163`)
- Produces: `requireAdmin()` now rejects `banned: true` users with 403. All 9 admin routes + `/api/sync` consume this — no route changes needed.

- [ ] **Step 1: Extend SessionUser type and add banned check**

```ts
type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  banned?: boolean;
};

export async function requireAdmin(): Promise<{user: SessionUser; response?: never} | {user?: never; response: NextResponse}> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user || user.role !== 'ADMIN' || user.banned === true) {
    return {response: NextResponse.json({error: 'Forbidden'}, {status: 403})};
  }

  return {user};
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` and `npx eslint src/lib/admin.ts`
Expected: both clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin.ts
git commit -m "fix(admin): reject banned users in requireAdmin"
```

---

### Task 2: Rate limit trusts framework-resolved IP, not raw XFF

**Files:**
- Modify: `src/middleware.ts:27-61` (only the `applyRateLimit` function)

**Interfaces:**
- Consumes: `NextRequest` from `next/server`
- Produces: `applyRateLimit` uses `request.ip` (framework-resolved, header-spoof-safe) instead of raw `x-forwarded-for`. No other middleware behavior changes.

**Context:** Raw `request.headers.get('x-forwarded-for')` is client-spoofable — an attacker rotates the header per request to bypass the limit entirely. `NextRequest.ip` is resolved by the framework (trusts XFF only when behind a configured proxy; falls back to socket IP).

- [ ] **Step 1: Replace IP resolution**

In `src/middleware.ts` `applyRateLimit`, replace:

```ts
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const key = `${ip}:${pathname}`;
```

with:

```ts
  const ip = request.ip || 'anonymous';
  const key = `${ip}:${pathname}`;
```

Leave everything else (limits, headers, responses) unchanged.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` and `npx eslint src/middleware.ts`
Expected: both clean. Manual check: dev server still serves `/en` and `/api/search` (no 429).

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "fix(rate-limit): use framework-resolved request.ip instead of spoofable XFF header"
```

---

### Task 3: Admin query-param validation — no more 500s

**Files:**
- Create: `src/lib/admin-params.ts`
- Modify: `src/app/api/admin/users/route.ts:24`
- Modify: `src/app/api/admin/watchlists/route.ts:11`
- Modify: `src/app/api/admin/annotations/route.ts:11-19`
- Modify: `src/app/api/admin/login-logs/route.ts:11`
- Modify: `src/app/api/admin/media/route.ts:15`
- Modify: `src/app/api/admin/sync-logs/route.ts:11`

**Interfaces:**
- Produces: `parsePageParam(value: string | null): number | null` — returns `1` for null/empty, page number for valid integer ≥1, `null` for anything else (NaN, float, 0, negative, >100000).

- [ ] **Step 1: Create the helper**

`src/lib/admin-params.ts`:

```ts
export function parsePageParam(value: string | null): number | null {
  if (value === null || value === '') return 1;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 100000) return null;
  return n;
}
```

- [ ] **Step 2: Apply to the 6 list routes**

In each route, replace:

```ts
const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
const pageSize = 20;
const skip = (page - 1) * pageSize;
```

with:

```ts
const page = parsePageParam(searchParams.get('page'));
if (page === null) {
  return NextResponse.json({error: 'Invalid page parameter'}, {status: 400});
}
const pageSize = 20;
const skip = (page - 1) * pageSize;
```

Add `import {parsePageParam} from '@/lib/admin-params';` to each file.

- [ ] **Step 3: Validate enum filters in annotations route**

In `src/app/api/admin/annotations/route.ts`, before building `where`, add:

```ts
const VALID_STATUSES = ['WATCHED', 'WATCHING', 'WANT_TO_WATCH', 'DROPPED'];
const VALID_ENTITY_TYPES = ['MOVIE', 'TV', 'PERSON'];
```

and replace lines 17-19:

```ts
    const where: Record<string, unknown> = {};
    if (status) where.watchStatus = status;
    if (entityType) where.entityType = entityType;
```

with:

```ts
    const where: Record<string, unknown> = {};
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({error: 'Invalid status filter'}, {status: 400});
      }
      where.watchStatus = status;
    }
    if (entityType) {
      if (!VALID_ENTITY_TYPES.includes(entityType)) {
        return NextResponse.json({error: 'Invalid entityType filter'}, {status: 400});
      }
      where.entityType = entityType;
    }
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` and `npx eslint src/lib/admin-params.ts src/app/api/admin/users/route.ts src/app/api/admin/watchlists/route.ts src/app/api/admin/annotations/route.ts src/app/api/admin/login-logs/route.ts src/app/api/admin/media/route.ts src/app/api/admin/sync-logs/route.ts`
Expected: both clean.

API checks (anonymous → expect 401, proves no crash):
```
Invoke-WebRequest "http://localhost:3000/api/admin/users?page=abc" → 401
Invoke-WebRequest "http://localhost:3000/api/admin/annotations?status=BOGUS" → 401
```
(401 because unauthenticated hits requireAdmin first — the validation is reachable only with an admin session; controller may verify with a session cookie if available.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin-params.ts src/app/api/admin
git commit -m "fix(admin): validate page param and enum filters — 400 instead of 500"
```

---

### Task 4: Shared admin UI components

**Files:**
- Create: `src/components/admin/AdminPagination.tsx`
- Create: `src/components/admin/AdminSpinner.tsx`
- Create: `src/components/admin/AdminEmptyState.tsx`
- Create: `src/components/admin/ConfirmButton.tsx`
- Create: `src/lib/format-date.ts`

**Interfaces:**
- Produces (all later frontend tasks consume these exact signatures):
  - `AdminPagination({page, totalPages, total, onPageChange}: {page: number; totalPages: number; total: number; onPageChange: (p: number) => void})` — 'use client', uses `useTranslations('Admin')` keys `pagination`, `previous`, `next`. Renders the exact footer markup already duplicated across admin pages: left `pagination` text, right Prev/Next buttons. Hide entirely when `totalPages <= 1`.
  - `AdminSpinner({label}: {label: string})` — 'use client', renders centered spinner SVG (same markup as existing pages) + label text.
  - `AdminEmptyState({message}: {message: string})` — 'use client', renders centered muted message.
  - `ConfirmButton({onConfirm, disabled, children, confirmLabel, cancelLabel, className}: {onConfirm: () => void | Promise<void>; disabled?: boolean; children: React.ReactNode; confirmLabel?: string; cancelLabel?: string; className?: string})` — 'use client', 2-step inline confirm (first click → "Confirm?" state showing two buttons: confirm (red) + cancel; second click on confirm fires `onConfirm`; auto-resets after 3s or on cancel). Uses `useTranslations('Admin')` keys `confirm` and `cancel` as defaults.
  - `formatDate(date: string | Date | null | undefined, locale: string): string` — plain util, no hooks. Returns `'—'` for null/undefined, else `new Date(date).toLocaleDateString(locale, {year: 'numeric', month: 'short', day: 'numeric'})`.

- [ ] **Step 1: Create `src/lib/format-date.ts`**

```ts
export function formatDate(
  date: string | Date | null | undefined,
  locale: string,
): string {
  if (date === null || date === undefined) return '—';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
```

- [ ] **Step 2: Create `src/components/admin/AdminPagination.tsx`**

```tsx
'use client';

import {useTranslations} from 'next-intl';

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function AdminPagination({page, totalPages, total, onPageChange}: AdminPaginationProps) {
  const t = useTranslations('Admin');

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
      <p className="text-sm text-foreground/50">
        {t('pagination', {page, totalPages, count: total})}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t('previous')}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/admin/AdminSpinner.tsx`**

```tsx
'use client';

type AdminSpinnerProps = {
  label: string;
};

export default function AdminSpinner({label}: AdminSpinnerProps) {
  return (
    <div className="px-6 py-8 text-center text-foreground/40">
      <div className="flex items-center justify-center gap-2">
        <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {label}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/admin/AdminEmptyState.tsx`**

```tsx
'use client';

type AdminEmptyStateProps = {
  message: string;
};

export default function AdminEmptyState({message}: AdminEmptyStateProps) {
  return (
    <div className="px-6 py-8 text-center text-foreground/40">{message}</div>
  );
}
```

- [ ] **Step 5: Create `src/components/admin/ConfirmButton.tsx`**

```tsx
'use client';

import {useRef, useState} from 'react';
import {useTranslations} from 'next-intl';

type ConfirmButtonProps = {
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
};

export default function ConfirmButton({
  onConfirm,
  disabled,
  children,
  confirmLabel,
  cancelLabel,
  className = '',
}: ConfirmButtonProps) {
  const t = useTranslations('Admin');
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reset() {
    setConfirming(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleFirstClick() {
    setConfirming(true);
    timerRef.current = setTimeout(reset, 3000);
  }

  async function handleConfirm() {
    reset();
    await onConfirm();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
        >
          {confirmLabel ?? t('confirm')}
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors"
        >
          {cancelLabel ?? t('cancel')}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleFirstClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg bg-background border border-border text-foreground/70 hover:text-red-400 hover:border-red-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` and `npx eslint src/components/admin/AdminPagination.tsx src/components/admin/AdminSpinner.tsx src/components/admin/AdminEmptyState.tsx src/components/admin/ConfirmButton.tsx src/lib/format-date.ts`
Expected: both clean (ConfirmButton uses `React.ReactNode` — import `type React from 'react'` if `React` namespace isn't globally available; check tsconfig `jsx` setting, add `import type {ReactNode} from 'react'` and use `ReactNode` if needed).

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/AdminPagination.tsx src/components/admin/AdminSpinner.tsx src/components/admin/AdminEmptyState.tsx src/components/admin/ConfirmButton.tsx src/lib/format-date.ts
git commit -m "feat(admin): shared UI components — pagination, spinner, empty state, confirm button, date util"
```

---

## Batch 2 — Frontend page fixes (4 parallel agents, no file overlap)

### Task 5: Annotations page — field mismatch, translated options, entity links, locale dates

**Files:**
- Modify: `src/app/[locale]/admin/annotations/page.tsx`
- Modify: `src/messages/en.json` (Admin.annotationsPage)
- Modify: `src/messages/th.json` (Admin.annotationsPage)

**Interfaces:**
- Consumes: `AdminPagination`, `AdminSpinner`, `AdminEmptyState` (Task 4), `formatDate` (Task 4), `useLocale()` from `next-intl`
- Produces: corrected page; adds translation keys consumed by Task 9 (delete button labels)

**Context:** API returns `watchStatus` and `personalRating` (verified `src/app/api/admin/annotations/route.ts:28-29`) but the page type declares `status`/`rating` → both columns always blank.

- [ ] **Step 1: Fix the type**

Replace the `Annotation` type fields:

```ts
type Annotation = {
  id: string;
  entityType: string;
  entityId: number;
  watchStatus: string | null;
  personalRating: number | null;
  notes: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
};
```

(`entityId` is an Int in the schema — `prisma.userAnnotation.entityId: Int`, so type it `number`.)

- [ ] **Step 2: Add translation keys** (both en.json and th.json under `Admin.annotationsPage`)

en.json additions:

```json
"watched": "Watched",
"watching": "Watching",
"wantToWatch": "Want to Watch",
"dropped": "Dropped",
"movie": "Movie",
"tv": "TV",
"person": "Person",
"delete": "Delete",
"confirmDelete": "Delete this annotation?",
"deleteError": "Failed to delete annotation"
```

th.json equivalents (translate to Thai: ดูแล้ว / กำลังดู / อยากดู / เลิกดู / ภาพยนตร์ / ซีรีส์ / บุคคล / ลบ / ยืนยันการลบรายการนี้? / ลบไม่สำเร็จ).

- [ ] **Step 3: Replace hardcoded options with translation keys**

Replace `STATUS_OPTIONS`:

```ts
const STATUS_OPTIONS: {value: string; labelKey: string}[] = [
  {value: '', labelKey: 'allStatuses'},
  {value: 'WATCHED', labelKey: 'watched'},
  {value: 'WATCHING', labelKey: 'watching'},
  {value: 'WANT_TO_WATCH', labelKey: 'wantToWatch'},
  {value: 'DROPPED', labelKey: 'dropped'},
];
```

and `ENTITY_TYPE_OPTIONS`:

```ts
const ENTITY_TYPE_OPTIONS: {value: string; labelKey: string}[] = [
  {value: '', labelKey: 'allTypes'},
  {value: 'MOVIE', labelKey: 'movie'},
  {value: 'TV', labelKey: 'tv'},
  {value: 'PERSON', labelKey: 'person'},
];
```

Update the render to use `t(\`annotationsPage.${opt.labelKey}\`)` for both (drop the `opt.label` fallback).

- [ ] **Step 4: Fix status badge + rating render**

Status badge block (currently `annotation.status === 'WATCHED'` etc.) → use `annotation.watchStatus`. Rating cell `{annotation.rating ?? '—'}` → `{annotation.personalRating ?? '—'}`.

- [ ] **Step 5: Link entityId to the public detail page**

Replace the plain entityId cell with a conditional link — note the annotation's entity id IS a TMDB id (public routes use TMDB id directly):

```tsx
<td className="px-6 py-3">
  {annotation.entityType === 'MOVIE' && (
    <Link href={`/movie/${annotation.entityId}`} className="text-primary hover:underline font-mono text-xs">
      {annotation.entityId}
    </Link>
  )}
  {annotation.entityType === 'TV' && (
    <Link href={`/tv/${annotation.entityId}`} className="text-primary hover:underline font-mono text-xs">
      {annotation.entityId}
    </Link>
  )}
  {annotation.entityType === 'PERSON' && (
    <Link href={`/person/${annotation.entityId}`} className="text-primary hover:underline font-mono text-xs">
      {annotation.entityId}
    </Link>
  )}
  {!['MOVIE', 'TV', 'PERSON'].includes(annotation.entityType) && (
    <span className="font-mono text-xs text-foreground/70">{annotation.entityId}</span>
  )}
</td>
```

- [ ] **Step 6: Locale-aware dates + shared components**

Add `const locale = useLocale();` and replace the created-date cell with `formatDate(annotation.createdAt, locale)`. Replace the inline spinner block with `<AdminSpinner label={t('loadingAnnotations')} />`, the empty state with `<AdminEmptyState message={t('annotationsPage.noAnnotations')} />`, and the pagination footer with `<AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />`.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit` and `npx eslint "src/app/[locale]/admin/annotations/page.tsx"`
Expected: both clean. Check `th.json` parses (`node -e "JSON.parse(require('fs').readFileSync('src/messages/th.json','utf8'))"`).

- [ ] **Step 8: Commit**

```bash
git add "src/app/[locale]/admin/annotations/page.tsx" src/messages/en.json src/messages/th.json
git commit -m "fix(admin): annotations page — watchStatus/personalRating fields, translated options, entity links, locale dates"
```

---

### Task 6: Media browser — read ?type= param, debounce search, row links, locale dates

**Files:**
- Modify: `src/app/[locale]/admin/media/page.tsx`

**Interfaces:**
- Consumes: `AdminPagination`, `AdminSpinner`, `AdminEmptyState` (Task 4), `formatDate` (Task 4), `useLocale()` from `next-intl`
- Produces: media page reads `?type=movie|tv|person` (singular values — matches API's `typeMap` at `route.ts:12`); dashboard stat-card links (`?type=movies|tv|persons`) work via the API's plural→singular map.

**Context:** Dashboard links `/admin/media?type=movies` etc. — page ignores them (always Movies tab). Search fires per keystroke AND double-fetches on submit.

- [ ] **Step 1: Initialize mediaType from URL**

Add `import {useSearchParams} from 'next/navigation';` and:

```ts
const searchParams = useSearchParams();
const urlType = searchParams.get('type');
const initialType: MediaType =
  urlType === 'tv' ? 'tv' : urlType === 'person' ? 'person' : 'movie';
```

Replace `useState<MediaType>('movie')` with `useState<MediaType>(initialType)`. (Note: on `next/navigation`, `useSearchParams` works in client components; the page is already `'use client'`.)

- [ ] **Step 2: Debounce search**

Remove the `query` from the main `useEffect` deps. Add a debounced effect:

```ts
const [debouncedQuery, setDebouncedQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(query.trim());
    setPage(1);
  }, 400);
  return () => clearTimeout(timer);
}, [query]);

useEffect(() => {
  fetchMedia(page, mediaType, debouncedQuery);
}, [page, fetchMedia, mediaType, debouncedQuery]);
```

Change `handleSearch` to just `e.preventDefault()` (the effect handles fetching — no direct `fetchMedia` call, no `setPage` needed since debounce effect resets page).

- [ ] **Step 3: Link titles to public pages**

In all three tables (MovieTable, TvTable, PersonTable), wrap the title/name cell in a link using `item.tmdbId`:

```tsx
<td className="px-6 py-3">
  <Link href={`/movie/${item.tmdbId}`} className="text-foreground font-medium hover:text-primary transition-colors">
    {item.title ?? '—'}
  </Link>
</td>
```

(`/tv/${item.tmdbId}` and `/person/${item.tmdbId}` for the other tables. `Link` is already imported from `@/i18n/navigation`.)

- [ ] **Step 4: Locale dates + shared components**

`const locale = useLocale();` — pass `locale` into each table (add a `locale: string` prop to MovieTable/TvTable/PersonTable) and replace all `toLocaleDateString('en-US', ...)` with `formatDate(item.releaseDate ?? item.firstAirDate ?? item.lastFetchedAt, locale)` (keep the existing `?? '—'` semantics: releaseDate/firstAirDate null → '—'; lastFetchedAt always shown). Replace spinner → `<AdminSpinner label={t('loadingMedia')} />`, empty → `<AdminEmptyState message={t('mediaPage.noResults')} />`, pagination → `<AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />`.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` and `npx eslint "src/app/[locale]/admin/media/page.tsx"`
Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/admin/media/page.tsx"
git commit -m "fix(admin): media browser reads ?type= param, debounced search, row links, locale dates"
```

---

### Task 7: Users + login-history — debounce search, error UI, page reset

**Files:**
- Modify: `src/app/[locale]/admin/users/page.tsx`
- Modify: `src/app/[locale]/admin/login-history/page.tsx`
- Modify: `src/messages/en.json`, `src/messages/th.json` (Admin namespace)

**Interfaces:**
- Consumes: Task 4 shared components (users page already has its own pagination/spinner — swap in shared ones)
- Produces: both pages fetch once per search (debounced 400ms), reset page on search change, and surface API errors instead of failing silently.

- [ ] **Step 1: Add translation keys** (both en.json + th.json under `Admin`):

```json
"loadError": "Failed to load data. Please try again.",
"actionError": "Action failed. Please try again.",
"loadFailed": "Failed to load"
```

- [ ] **Step 2: Users page — debounce search**

Read `src/app/[locale]/admin/users/page.tsx` first (structure: `search` state, `fetchUsers` useCallback, `useEffect([page, fetchUsers, search, role])`, `handleSearch` calling `fetchUsers` explicitly). Apply the same debounce pattern as Task 6 Step 2: extract `debouncedSearch`, remove `search` from the fetch effect deps, add the debounce effect (400ms → `setDebouncedSearch`, `setPage(1)`), and make `handleSearch` a no-op `e.preventDefault()`.

- [ ] **Step 3: Users page — error UI**

Add `const [error, setError] = useState<string | null>(null);`. In `fetchUsers`, replace the silent `if (res.ok)` with:

```ts
if (res.ok) {
  setData(await res.json());
  setError(null);
} else {
  setError(t('loadError'));
}
```

wrap in try/catch that sets `setError(t('loadError'))` (keep `finally`). Render the error above the table when set:

```tsx
{error && (
  <div className="mb-4 px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
    {error}
  </div>
)}
```

For mutations (`handleRoleChange`, `handleBanToggle`, `handleDelete`): set `actionError` state on `!res.ok` or throw, and show it in the same banner. Keep existing behavior otherwise.

- [ ] **Step 4: Users page — swap to shared components + locale dates**

Replace the pagination footer with `<AdminPagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />`, spinner with `<AdminSpinner label={t('loadingUsers')} />`, empty row with `<AdminEmptyState message={t('noUsers')} />`. Also clamp out-of-range pages: after delete, if `data.page > data.totalPages` then `setPage(data.totalPages)`. Add `const locale = useLocale();` (from `next-intl`) and replace the hardcoded `toLocaleDateString('en-US', ...)` joined-date cell with `formatDate(user.createdAt, locale)`.

- [ ] **Step 5: Login-logs route — select only needed fields (PII trim)**

In `src/app/api/admin/login-logs/route.ts`, replace the unselecting `findMany` (lines 33-38) with:

```ts
prisma.loginLog.findMany({
  where,
  select: {
    id: true,
    userId: true,
    email: true,
    name: true,
    method: true,
    ip: true,
    success: true,
    reason: true,
    createdAt: true,
  },
  orderBy: {createdAt: 'desc'},
  skip,
  take: pageSize,
}),
```

(drops `userAgent` — not displayed by the page; keeps every field the login-history page reads. Verify against the page's `LoginLog` type after the change: fields `id, userId, email, name, method, ip, success, reason, createdAt` are all still present.)

- [ ] **Step 6: Login-history page — same debounce + error pattern**

Same steps 2-3 applied to `src/app/[locale]/admin/login-history/page.tsx` (state: `search`, effect on `[page, search, method, success]` — extract `debouncedSearch`; add error banner; swap spinner → `AdminSpinner`, empty → `AdminEmptyState`, pagination → `AdminPagination`). Also add `const locale = useLocale();` and replace the hardcoded `toLocaleString('en-US', ...)` time cells with a locale-aware format (extend `src/lib/format-date.ts` with `formatDateTime(date, locale)` returning `toLocaleString(locale, {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})`).

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit` and `npx eslint "src/app/[locale]/admin/users/page.tsx" "src/app/[locale]/admin/login-history/page.tsx" "src/app/api/admin/login-logs/route.ts" src/lib/format-date.ts`
Expected: both clean; th.json parses.

- [ ] **Step 8: Commit**

```bash
git add "src/app/[locale]/admin/users/page.tsx" "src/app/[locale]/admin/login-history/page.tsx" "src/app/api/admin/login-logs/route.ts" src/lib/format-date.ts src/messages/en.json src/messages/th.json
git commit -m "fix(admin): debounced search, error feedback, locale dates, PII trim on login-logs"
```

---

### Task 8: Watchlists — DELETE endpoint + UI

**Files:**
- Modify: `src/app/api/admin/watchlists/route.ts`
- Modify: `src/app/[locale]/admin/watchlists/page.tsx`
- Modify: `src/messages/en.json`, `src/messages/th.json` (Admin.watchlistsPage)

**Interfaces:**
- Consumes: `ConfirmButton` (Task 4), Task 4 pagination/spinner/empty
- Produces: `DELETE /api/admin/watchlists?id=<int>` → 400 invalid id, 404 not found, 200 `{success: true}`. Consumed by Task 9/10 as the pattern reference for annotation/media deletes.

**Context:** `Watchlist.id` is `Int` (schema). Children (`WatchlistItem`) cascade on delete (verified).

- [ ] **Step 1: Add DELETE handler** to `src/app/api/admin/watchlists/route.ts`

```ts
export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const rawId = searchParams.get('id');
    if (!rawId || !Number.isInteger(Number(rawId))) {
      return NextResponse.json({error: 'id is required and must be an integer'}, {status: 400});
    }
    const id = Number(rawId);

    const existing = await prisma.watchlist.findUnique({where: {id}, select: {id: true}});
    if (!existing) {
      return NextResponse.json({error: 'Watchlist not found'}, {status: 404});
    }

    await prisma.watchlist.delete({where: {id}});

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('[admin:watchlists:delete]', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
```

- [ ] **Step 2: Add translation keys** (both files, under `Admin.watchlistsPage`):

```json
"delete": "Delete",
"confirmDelete": "Delete this watchlist?",
"deleteError": "Failed to delete watchlist"
```

(th: ลบ / ยืนยันการลบรายการนี้? / ลบไม่สำเร็จ)

- [ ] **Step 3: UI — delete button + refresh + page clamp**

Read `src/app/[locale]/admin/watchlists/page.tsx` first. Add an "Actions" column header (use existing `t('actions')` key — it exists at `en.json:366`) with a cell containing:

```tsx
<ConfirmButton
  onConfirm={async () => {
    const res = await fetch(`/api/admin/watchlists?id=${watchlist.id}`, {method: 'DELETE'});
    if (res.ok) {
      await fetchWatchlists(page);
      if (data && page > data.totalPages) setPage(data.totalPages);
    } else {
      setError(t('watchlistsPage.deleteError'));
    }
  }}
  confirmLabel={t('watchlistsPage.confirmDelete')}
>
  {t('watchlistsPage.delete')}
</ConfirmButton>
```

Add `error` state + banner (same as Task 7 Step 3). Swap spinner/empty/pagination to shared components. Ensure `fetchWatchlists` is a useCallback taking the page (check current signature and adapt).

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` and `npx eslint "src/app/api/admin/watchlists/route.ts" "src/app/[locale]/admin/watchlists/page.tsx"`
Expected: both clean; th.json parses.

API check (anonymous → 401, route exists):
```
Invoke-WebRequest "http://localhost:3000/api/admin/watchlists?id=1" -Method DELETE → 401
```

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/admin/watchlists/route.ts" "src/app/[locale]/admin/watchlists/page.tsx" src/messages/en.json src/messages/th.json
git commit -m "feat(admin): watchlist deletion — API + UI with inline confirm"
```

---

## Batch 3 — CRUD additions + dashboard (3 parallel agents; Task 9 depends on Task 5, Task 10 on Task 6)

### Task 9: Annotations — DELETE endpoint + UI button

**Files:**
- Modify: `src/app/api/admin/annotations/route.ts`
- Modify: `src/app/[locale]/admin/annotations/page.tsx` (delete column — Task 5 already added the translation keys `delete`, `confirmDelete`, `deleteError` under `annotationsPage`)

**Interfaces:**
- Consumes: Task 5 page state (page still has `data`, `page`, `setPage`, `fetchAnnotations`), `ConfirmButton` (Task 4), Task 5's `annotationsPage.delete*` keys
- Produces: `DELETE /api/admin/annotations?id=<int>` → 400/404/200. `UserAnnotation.id` is Int; annotation rows have no children — plain delete.

- [ ] **Step 1: Add DELETE handler** to `src/app/api/admin/annotations/route.ts` (same pattern as Task 8 Step 1, model `userAnnotation`, error message `'Annotation not found'`).

- [ ] **Step 2: UI — add Actions column**

In `src/app/[locale]/admin/annotations/page.tsx`: add an Actions `<th>` (use existing `t('actions')` key) + a cell per row:

```tsx
<td className="px-6 py-3">
  <ConfirmButton
    onConfirm={async () => {
      const res = await fetch(`/api/admin/annotations?id=${annotation.id}`, {method: 'DELETE'});
      if (res.ok) {
        await fetchAnnotations(page, status, entityType);
        if (data && page > data.totalPages) setPage(data.totalPages);
      } else {
        setError(t('annotationsPage.deleteError'));
      }
    }}
    confirmLabel={t('annotationsPage.confirmDelete')}
  >
    {t('annotationsPage.delete')}
  </ConfirmButton>
</td>
```

Update the spinner colSpan from 7 to 8 and the empty-state colSpan accordingly. Add `error` state + banner (Task 7 Step 3 pattern).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` and `npx eslint "src/app/api/admin/annotations/route.ts" "src/app/[locale]/admin/annotations/page.tsx"`
Expected: both clean.

API check:
```
Invoke-WebRequest "http://localhost:3000/api/admin/annotations?id=1" -Method DELETE → 401
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/admin/annotations/route.ts" "src/app/[locale]/admin/annotations/page.tsx"
git commit -m "feat(admin): annotation moderation — delete API + UI with inline confirm"
```

---

### Task 10: Media browser — DELETE endpoint + UI button

**Files:**
- Modify: `src/app/api/admin/media/route.ts`
- Modify: `src/app/[locale]/admin/media/page.tsx`
- Modify: `src/messages/en.json`, `src/messages/th.json` (Admin.mediaPage)

**Interfaces:**
- Consumes: Task 6 page structure, `ConfirmButton` (Task 4)
- Produces: `DELETE /api/admin/media?type=<movies|tv|persons>&id=<int>` → 400/404/200. Deletes by INTERNAL id (`Movie.id`, `TvSeries.id`, `Person.id` — Int). Cascades wipe child rows automatically (verified schema).

- [ ] **Step 1: Add DELETE handler** to `src/app/api/admin/media/route.ts`

```ts
export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const type = searchParams.get('type');
    const rawId = searchParams.get('id');
    if (!['movies', 'tv', 'persons'].includes(type ?? '')) {
      return NextResponse.json({error: 'Invalid type'}, {status: 400});
    }
    if (!rawId || !Number.isInteger(Number(rawId))) {
      return NextResponse.json({error: 'id is required and must be an integer'}, {status: 400});
    }
    const id = Number(rawId);

    const model = type === 'movies' ? prisma.movie : type === 'tv' ? prisma.tvSeries : prisma.person;

    const existing = await model.findUnique({where: {id}, select: {id: true}});
    if (!existing) {
      return NextResponse.json({error: 'Media not found'}, {status: 404});
    }

    await model.delete({where: {id}});

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('[admin:media:delete]', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
```

- [ ] **Step 2: Add translation keys** (both files, under `Admin.mediaPage`):

```json
"delete": "Delete",
"confirmDelete": "Delete this item?",
"deleteError": "Failed to delete item"
```

(th: ลบ / ยืนยันการลบรายการนี้? / ลบไม่สำเร็จ)

- [ ] **Step 3: UI — Actions column in all three tables**

In `src/app/[locale]/admin/media/page.tsx`, add an Actions `<th>` to MovieTable, TvTable, PersonTable (each already takes `t` prop) and an actions cell using the same internal `item.id`:

```tsx
<td className="px-6 py-3">
  <ConfirmButton
    onConfirm={async () => {
      const typeParam = mediaType === 'movie' ? 'movies' : mediaType === 'tv' ? 'tv' : 'persons';
      const res = await fetch(`/api/admin/media?type=${typeParam}&id=${item.id}`, {method: 'DELETE'});
      if (res.ok) {
        await fetchMedia(page, mediaType, debouncedQuery);
        if (data && page > data.totalPages) setPage(data.totalPages);
      } else {
        setError(t('mediaPage.deleteError'));
      }
    }}
    confirmLabel={t('mediaPage.confirmDelete')}
  >
    {t('mediaPage.delete')}
  </ConfirmButton>
</td>
```

Import `ConfirmButton` and `useState` (already imported) — pass a `mediaType` prop or use a closure (tables are defined in the same file; simplest: pass `onDelete` callback prop `(item: MediaItem) => void` from the parent). Add `error` state + banner.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` and `npx eslint "src/app/api/admin/media/route.ts" "src/app/[locale]/admin/media/page.tsx"`
Expected: both clean; th.json parses.

API check:
```
Invoke-WebRequest "http://localhost:3000/api/admin/media?type=movies&id=1" -Method DELETE → 401
```

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/admin/media/route.ts" "src/app/[locale]/admin/media/page.tsx" src/messages/en.json src/messages/th.json
git commit -m "feat(admin): media deletion — API + UI with inline confirm"
```

---

### Task 11: Dashboard — system status strip, watchlists card, SyncPanel polish

**Files:**
- Modify: `src/app/[locale]/admin/page.tsx`
- Modify: `src/components/admin/SyncPanel.tsx`
- Modify: `src/messages/en.json`, `src/messages/th.json` (Admin namespace)

**Interfaces:**
- Consumes: existing stat-card section (page.tsx:114-129), `adminSections` array (page.tsx:50-101), SyncPanel (page.tsx:236)
- Produces: dashboard shows last-sync status, running indicator, banned count, stale content, failed logins; watchlists card appears in Management grid; SyncPanel "All" label localized + link to sync history after success.

**Context:** `SyncLog.status` values: `running|completed|failed`. `lastFetchedAt` is `DateTime?` on Movie/TvSeries/Person. `LoginLog` has `success: Boolean`, `createdAt`.

- [ ] **Step 1: Add translation keys** (both files, under `Admin`):

```json
"systemStatus": "System Status",
"lastSync": "Last Sync",
"neverSynced": "Never synced",
"runningNow": "Sync running now",
"bannedUsers": "Banned Users",
"staleContent": "Stale Content (7d+)",
"staleMovie": "movies",
"staleTv": "TV",
"stalePerson": "persons",
"failedLogins": "Failed Logins (7d)",
"viewHistory": "View history"
```

and under `Admin.syncPanel`:

```json
"all": "All",
"viewHistory": "View sync history"
```

(th equivalents: สถานะระบบ / ซิงค์ล่าสุด / ยังไม่เคยซิงค์ / กำลังซิงค์ / ผู้ใช้ที่ถูกแบน / ข้อมูลเก่า (7 วันขึ้นไป) / ภาพยนตร์ / ซีรีส์ / บุคคล / เข้าสู่ระบบล้มเหลว (7 วัน) / ดูประวัติ / ทั้งหมด / ดูประวัติการซิงค์)

- [ ] **Step 2: Server queries in `admin/page.tsx`**

In the page's existing `Promise.all` block (currently 4 counts, lines ~18-29), add:

```ts
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const lastSync = prisma.syncLog.findFirst({orderBy: {startedAt: 'desc'}});
const runningSyncs = prisma.syncLog.count({where: {status: 'running'}});
const bannedUserCount = prisma.user.count({where: {banned: true}});
const staleMovies = prisma.movie.count({where: {OR: [{lastFetchedAt: null}, {lastFetchedAt: {lt: sevenDaysAgo}}]}});
const staleTv = prisma.tvSeries.count({where: {OR: [{lastFetchedAt: null}, {lastFetchedAt: {lt: sevenDaysAgo}}]}});
const stalePersons = prisma.person.count({where: {OR: [{lastFetchedAt: null}, {lastFetchedAt: {lt: sevenDaysAgo}}]}});
const failedLogins = prisma.loginLog.count({where: {success: false, createdAt: {gte: sevenDaysAgo}}});
```

and destructure them alongside the existing counts. (Prisma lets you pass un-awaited promises into `Promise.all`.)

- [ ] **Step 3: Render the System Status strip**

Below the 4 stat cards (after page.tsx:129), render a new section with heading `t('systemStatus')` containing a responsive grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`) of status cards. Each card: `bg-surface border border-border rounded-xl p-4`. Contents:

1. **Last Sync** — if `lastSync`: entity badge (`lastSync.entity`), status badge (`completed` green / `failed` red / `running` blue), processed/errors counts, `formatDate(lastSync.startedAt, locale)` + `useLocale()` (server component — `locale` comes from `params.locale` on the page, see existing page signature). If no `lastSync`: `t('neverSynced')`.
2. **Running** — `runningSyncs > 0` ? `t('runningNow')` (blue, pulsing dot) : "—".
3. **Banned Users** — number + link to `/admin/users`.
4. **Stale Content** — `staleMovies + staleTv + stalePersons` with breakdown line: `{staleMovies} {t('staleMovie')} · {staleTv} {t('staleTv')} · {stalePersons} {t('stalePerson')}`.
5. **Failed Logins (7d)** — number, red when > 0, link to `/admin/login-history`.

- [ ] **Step 4: Add watchlists card**

In the `adminSections` array (page.tsx:50-101), add the watchlists card (mirror an existing entry; uses existing keys `sections.watchlists` / `sections.watchlistsDesc`, href `/admin/watchlists`, reuse an existing SVG or add a simple list icon).

- [ ] **Step 5: SyncPanel — fix "All" label + add history link**

In `src/components/admin/SyncPanel.tsx`:
- Line 24: replace `t('stats.movies').slice(0, 0) + 'All'` with `t('syncPanel.all')`.
- Add `import {Link} from '@/i18n/navigation';`
- After the success result block (after the results grid, line ~144), add:

```tsx
{result && (
  <Link href="/admin/sync-history" className="mt-3 inline-block text-sm text-primary hover:underline">
    {t('syncPanel.viewHistory')}
  </Link>
)}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` and `npx eslint "src/app/[locale]/admin/page.tsx" src/components/admin/SyncPanel.tsx`
Expected: both clean; th.json parses. Browser: `/en/admin` loads without crashing (server page renders — check for console errors even when logged out; the page will redirect for non-admins, so controller verifies with an admin session or defers visual check to the user).

- [ ] **Step 7: Commit**

```bash
git add "src/app/[locale]/admin/page.tsx" src/components/admin/SyncPanel.tsx src/messages/en.json src/messages/th.json
git commit -m "feat(admin): dashboard system status strip, watchlists card, SyncPanel label + history link"
```

---

## Final Verification (controller, after all batches)

1. `npx tsc --noEmit` — clean
2. `npx eslint` on ALL changed files (this plan's file list) — no new warnings
3. `node -e` JSON parse check on both message files
4. Browser regression: public pages `/en`, `/en/movies`, `/en/search?q=test` load with no console errors (middleware change regression); `/en/movie/101`, `/en/tv/1399`, `/en/person/1136406` render (middleware/rate-limit regression)
5. If an admin session is available: `/en/admin`, `/en/admin/users`, `/en/admin/media?type=tv` (landing on TV tab proves Task 6), annotations page status badges render text, watchlists page delete button present
6. `git log --oneline -15` — 11 task commits present