# Deployment Guide

## Prerequisites

- **Node.js** >= 18.x
- **Vercel Account** ([vercel.com](https://vercel.com))
- **TMDB API Key** — register at [TMDB Settings](https://www.themoviedb.org/settings/api)
- **PostgreSQL Database** — for production (Vercel Postgres, Supabase, Neon, or any PostgreSQL provider)

---

## Quick Deploy (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/movie-series-tracker.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects **Next.js** — framework preset will be set automatically
4. Click **Deploy** (it will use default settings first)

### 3. Configure Environment Variables

In the Vercel Dashboard → **Settings → Environment Variables**, add:

| Variable | Value | Environments |
|---|---|---|
| `TMDB_API_KEY` | Your TMDB API key | Production, Preview, Development |
| `DATABASE_URL` | PostgreSQL connection string | Production, Preview |

> **Never commit `.env.local` or real credentials to Git.**

---

## Environment Variable Setup

### Local Development

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
TMDB_API_KEY=your_actual_tmdb_api_key
DATABASE_URL="file:./dev.db"
```

For local development, SQLite is used by default (`file:./dev.db`).

### Production (Vercel)

The production `DATABASE_URL` must use a **PostgreSQL** connection string. Examples:

- **Vercel Postgres**: `postgresql://user:password@host:5432/dbname?sslmode=require`
- **Supabase**: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`
- **Neon**: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

---

## Database Migration (SQLite → PostgreSQL)

### Why PostgreSQL for Production?

- SQLite uses file-based storage, which is **ephemeral** on Vercel (serverless functions lose file changes between invocations)
- PostgreSQL provides persistent, scalable storage with connection pooling

### Migration Steps

#### 1. Set Up a PostgreSQL Database

Choose a provider and create a database. Obtain the connection string.

#### 2. Update Environment Variables

Set `DATABASE_URL` in your Vercel project to the PostgreSQL connection string.

#### 3. Update Prisma Schema (if needed)

The current schema uses SQLite provider. For PostgreSQL, you need to either:

**Option A: Use the schema provider from environment** (recommended — handled in `prisma.config.ts`):

```typescript
// prisma.config.ts automatically selects provider based on DATABASE_URL
```

**Option B: Use a separate schema for production:**

Create `prisma/schema.postgresql.prisma` with `provider = "postgresql"`.

#### 4. Run Migrations

```bash
# Generate the Prisma client
npx prisma generate

# Create and apply migration to PostgreSQL
npx prisma migrate deploy
```

#### 5. Seed the Database (optional)

```bash
npx tsx prisma/seed.ts
```

---

## Build Verification

Before deploying, verify the build works locally:

```bash
# Generate Prisma client
npx prisma generate

# Build the project
next build
```

The `vercel.json` configuration runs `npx prisma generate && next build` automatically during Vercel deployment.

---

## Post-Deployment Verification

After deploying, verify the following:

### 1. Locale Routing

- Visit `https://your-app.vercel.app/` — should redirect to `/en` or `/th` based on browser language
- Visit `https://your-app.vercel.app/en` — should display English content
- Visit `https://your-app.vercel.app/th` — should display Thai content

### 2. TMDB Integration

- Search functionality should return results from TMDB API
- Movie and TV series pages should display TMDB data

### 3. Database Connectivity

- Check Vercel function logs for any database connection errors
- Verify data persists across page reloads

### 4. PWA (Service Worker)

- The PWA is disabled in development and enabled in production
- Verify service worker registration in browser DevTools → Application → Service Workers

---

## Project Configuration

### Vercel Settings (`vercel.json`)

| Setting | Value | Purpose |
|---|---|---|
| `framework` | `nextjs` | Auto-detect Next.js build settings |
| `buildCommand` | `npx prisma generate && next build` | Generate Prisma client before build |
| `installCommand` | `npm install` | Install dependencies |
| `regions` | `sin1` | Deploy to Singapore region |
| `rewrites` | `/(.*) → /[locale]` | i18n locale routing fallback |

### How i18n Routing Works

1. **Middleware** (`middleware.ts`) intercepts requests and detects the preferred locale from browser/cookies
2. Requests without a locale prefix (e.g., `/`) are **redirected** to the locale-prefixed path (e.g., `/en`)
3. The `next-intl` middleware handles all locale detection and routing
4. Supported locales: `en` (English), `th` (Thai)

---

## Troubleshooting

### Build Fails with Prisma Error

```
Error: Prisma has detected that this project uses `@prisma/client` but there is a `prisma/schema.prisma` that could not be found.
```

**Fix**: Ensure `npx prisma generate` runs before `next build`. The `vercel.json` build command handles this.

### Database Connection Timeout

```
Error: Can't reach database server
```

**Fix**: Check that:
- `DATABASE_URL` is correctly set in Vercel environment variables
- Your PostgreSQL provider allows connections from Vercel's IP ranges
- SSL mode is enabled (`?sslmode=require`)

### Locale Routing Not Working

**Fix**: Ensure:
- The `next-intl` middleware is configured in `middleware.ts`
- The `[locale]` dynamic segment exists in `src/app/[locale]/`
- Vercel's rewrite doesn't conflict with middleware (middleware runs first)
