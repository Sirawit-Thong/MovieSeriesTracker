# Plan: Merge Library + Watchlist, Add TMDB Search & Add-to-Library Buttons

## Goal
Combine "My Library" (คลังของฉัน) and "Watchlists" (รายการที่ดู) into a single unified "My Library" page with a TMDB search bar on top. When searching TMDB and clicking a result, save it to the DB and navigate to the detail page. Movie/TV detail pages get an "Add to My Library" button.

## What Exists Today
- **UserAnnotation** model: the actual "library" — tracks `watchStatus`, `personalRating`, `currentEpisode`, `notes`, `watchDate` per user+entity
- **Watchlist/WatchlistItem** models: separate named lists of media
- **Library page** (`/library`): Shows UserAnnotation items, filters by type/status, local search
- **Watchlist pages** (`/watchlists`): CRUD for named watchlists, detail view with items
- **Search system** (`/api/search`): Already searches both local DB + TMDB multi-search
- **On-demand fetch** (`on-demand.ts`): `fetchOnMiss()` — fetches from TMDB and upserts to DB
- **Annotation API** (`/api/annotations`): POST to upsert annotations
- **Movie/TvDetail components**: Pure display, no user interaction buttons
- **Navigation**: Header has separate "My Library" and "Watchlists" links for logged-in users

## Changes

### 1. Navigation: Remove "Watchlists" Link
**File: `src/components/layout/Header.tsx`**
- Remove `{key: 'watchlists', href: '/watchlists'}` from `AUTH_NAV_LINKS`
- Keep only `{key: 'library', href: '/library'}`
- Delete `watchlists` from Navigation i18n namespace in both `en.json` and `th.json`

### 2. Library API: Merge Watchlist Items
**File: `src/app/api/library/route.ts`**
- Also query `WatchlistItem` records for the user
- Merge them into the result set (treating watchlist items as `WANT_TO_WATCH` status items)
- Return unified list of annotated + watchlist media

### 3. Library Page: Add TMDB Search Bar
**File: `src/components/library/LibraryContent.tsx`**
- Add a TMDB search section at the top (above the existing library grid)
- Reuse existing `SearchBar` component (from `@/components/search/SearchBar`)
- When user types, call existing `/api/search?q=...` endpoint
- Show search results as a dropdown/grid below the search bar
- Each result is a clickable card linking to the detail page
- Clicking a TMDB result triggers on-demand save via existing `/api/test/on-demand` or a new dedicated API route, then redirects to the detail page
- Clear search after navigating

### 4. New API Route: Save to Library from TMDB Search
**File: `src/app/api/library/save/route.ts`** (NEW)
- POST endpoint: `{ entityType: 'MOVIE' | 'TV', tmdbId: number, watchStatus?: WatchStatus }`
- Calls `fetchOnMiss()` to ensure the entity exists in DB
- Creates/upserts a `UserAnnotation` with the given status (default: `WANT_TO_WATCH`)
- Returns the annotation record

### 5. Movie Detail Page: Add "Add to Library" Button
**File: `src/components/movie/MovieDetail.tsx`**
- Add an `AddToLibraryButton` component near the top of the detail page (hero section, next to the title)
- Button checks if the current user already has this movie in their library (via session + annotation API)
- If not in library: shows "Add to My Library" button → calls `POST /api/library/save`
- If already in library: shows current watchStatus badge with ability to change status inline
- Uses `useSession()` to show button only for logged-in users

### 6. TV Detail Page: Add "Add to Library" Button
**File: `src/components/tv/TvDetail.tsx`**
- Same as Movie — Add `AddToLibraryButton` component

### 7. Reusable Component: `AddToLibraryButton`
**File: `src/components/library/AddToLibraryButton.tsx`** (NEW)
- Props: `{ entityType: 'MOVIE' | 'TV', tmdbId: number, entityId?: number }`
- Uses `useSession()` for auth check
- Fetches current annotation status via `GET /api/annotations?entityType=...&entityId=...`
- States:
  - **Not logged in**: hide or show sign-in prompt
  - **Not in library**: green "Add to My Library" button (建档, + icon)
  - **In library**: shows colored status badge ( Watching/Want to Watch/etc) with dropdown to change
- Calls `POST /api/annotations` for upsert
- Show success toast/feedback

### 8. i18n Updates
**Files: `src/messages/en.json`, `src/messages/th.json`**
- Add keys for the new UI:
  - `Library.searchTmdb`: "Search TMDB..." / "ค้นหา TMDB..."
  - `Library.addToLibrary`: "Add to My Library" / "เพิ่มในคลังของฉัน"
  - `Library.inLibrary`: "In Library" / "อยู่ในคลังแล้ว"
  - `Library.added`: "Added!" / "เพิ่มแล้ว!"
  - `Library.changeStatus`: "Change Status" / "เปลี่ยนสถานะ"
  - `Movie.addToLibrary` / `Tv.addToLibrary`: for the detail page button
- Remove `watchlists` from Navigation namespace
- Keep Watchlist namespace for backward compatibility (or remove if not needed)

### 9. Remove Watchlist Pages (Optional - keep for now)
- Keep existing watchlist pages/API routes for backward compatibility
- They are just hidden from navigation
- Existing watchlist data remains accessible via API

## File Change Summary

| File | Action |
|------|--------|
| `src/components/layout/Header.tsx` | Remove watchlists nav link |
| `src/app/api/library/route.ts` | Include watchlist items in response |
| `src/app/api/library/save/route.ts` | NEW — save to library from TMDB |
| `src/components/library/LibraryContent.tsx` | Add TMDB search bar + results |
| `src/components/library/AddToLibraryButton.tsx` | NEW — reusable add-to-library button |
| `src/components/movie/MovieDetail.tsx` | Add AddToLibraryButton |
| `src/components/tv/TvDetail.tsx` | Add AddToLibraryButton |
| `src/messages/en.json` | Add new i18n keys, remove watchlists from Nav |
| `src/messages/th.json` | Add new i18n keys, remove watchlists from Nav |

## Data Flow

### Search → Save → View
```
User types in library search bar
  → /api/search?q=... (existing, searches local + TMDB)
  → Results shown (movies/TV from TMDB)
  → User clicks a movie/TV result
  → POST /api/library/save { entityType, tmdbId }
    → fetchOnMiss() ensures entity in DB
    → upsert UserAnnotation (status: WANT_TO_WATCH)
  → Redirect to /movie/tmdb/{tmdbId} or /tv/tmdb/{tmdbId}
```

### Add to Library from Detail Page
```
User on /movie/123 or /tv/456
  → AddToLibraryButton renders
  → Checks if user has annotation for this entity
  → If no: shows "Add to My Library" button
  → User clicks button
  → POST /api/annotations { entityType: 'MOVIE', entityId, watchStatus: 'WANT_TO_WATCH' }
  → Button changes to show status badge
```

## Verification
1. `npx next build` — no compile errors
2. Manual: Visit /library → see TMDB search bar at top
3. Manual: Type a movie name → see TMDB results → click → saves to DB → redirects to detail
4. Manual: Visit /movie/{id} → see "Add to My Library" button → click → annotation created
5. Manual: Visit /library again → see the newly added movie in the grid
6. Manual: Header shows only "My Library", no "Watchlists" link
