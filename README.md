# 🎬 Movie & Series Tracker

A modern, high-performance, full-stack **Movie & TV Series Tracker** web application built with **Next.js 16 (App Router + Turbopack)**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, and **PostgreSQL**. Integrated with **The Movie Database (TMDB)** API for rich entertainment media metadata, credits, media galleries, and localized translations.

---

## ✨ Features

### 🌟 Discovery & Exploration
- **Trending & Popular Content**: Explore trending, popular, and top-rated Movies, TV Series, and People.
- **Detailed Media Pages**: Full metadata including cast & crew, trailers/videos, photo galleries, release dates, age ratings, genres, production companies, and recommendations.
- **Detailed Person Pages**: Actor and director filmographies categorized by role (Acting, Directing, Producing, Crew), "Known For" highlights, biographies, and image galleries.
- **Hybrid Multi-Search**: Instant full-text search across both the local database and TMDB live API concurrently with deduplication.

### 🌐 Dual-Language Support (i18n)
- **English & Thai (`en` / `th`)**: Powered by `next-intl` with route-based localization (`/[locale]/...`).
- **Intelligent Title Fallbacks**: Smart language handling that preserves Thai translations when available, and automatically falls back to English for unreadable foreign titles (e.g. Chinese, Korean, Japanese original titles without Thai translations).

### 📚 Personal Library & Watchlists
- **Watch Tracking**: Categorize media by status (`WATCHED`, `WATCHING`, `WANT_TO_WATCH`, `DROPPED`).
- **Ratings & Notes**: Give personal 1–5 star ratings, log watch dates, track episode progress, and record private notes.
- **Custom Watchlists**: Create and manage multiple custom watchlists with item counts and quick-add capabilities.
- **One-Click Library Add**: Save movies and TV shows to your library directly from search, media cards, or person filmographies (with automated on-demand TMDB fetching).

### 🛡️ Admin Dashboard & Moderation
- **Media Management**: Search, inspect, and delete cached movies, TV series, and persons.
- **Data Ingestion & Sync Controls**: Trigger single-entity or bulk synchronization from TMDB with live heartbeat, progress status, and cancellation capabilities.
- **User & Watchlist Moderation**: View all registered users, manage user roles, ban abusive accounts, and inspect public/private watchlists.
- **Audit & Security Logs**: Comprehensive login audit trail (IP, User-Agent, timestamp, success/failure reasons) and sync history logs.

### 🔒 Authentication & Security
- **NextAuth.js v5**: Secure JWT session management with credentials login and Google OAuth integration.
- **Role-Based Access Control (RBAC)**: Role protection (`USER` vs `ADMIN`) on protected routes and administration endpoints.
- **In-Memory Rate Limiting**: Tiered IP rate limiting on sensitive endpoints (Authentication, Registration, Search, and Admin API).
- **Environment Validation**: Fail-fast startup checks to ensure production secrets are strictly configured.

### 📱 Progressive Web App (PWA)
- **Mobile-First & PWA Ready**: Installable app with offline fallback support, responsive Netflix-inspired dark UI theme, and smooth touch navigation.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (React 19, Turbopack, App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma ORM](https://www.prisma.io/) (with `@prisma/adapter-pg`) |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) (`@auth/prisma-adapter`, `bcryptjs`) |
| **Internationalization** | [next-intl](https://next-intl-docs.vercel.app/) |
| **Testing** | [Vitest](https://vitest.dev/) |
| **Code Quality** | ESLint v9 (Flat Config), Prettier |
| **External API** | [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api) |
| **CI/CD** | GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `20.x` or higher
- **npm**: `10.x` or higher
- **PostgreSQL**: Local PostgreSQL instance (or Docker)
- **TMDB API Key**: Free API key from [The Movie Database](https://www.themoviedb.org/settings/api)

### 1. Clone the Repository

```bash
git clone https://github.com/Sirawit-Thong/MovieSeriesTracker.git
cd MovieSeriesTracker
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# TMDB API Key (Required for fetching movie and TV show data)
TMDB_API_KEY=your_tmdb_api_key_here

# PostgreSQL Database Connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_series_tracker"

# NextAuth.js Secret (Generate using `openssl rand -base64 32`)
AUTH_SECRET="your-secure-random-32-character-secret"
AUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Database Setup & Seeding

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to your PostgreSQL database
npm run db:push

# (Optional) Seed reference genres and languages from TMDB
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run build` | Builds the application for production deployment |
| `npm start` | Starts the production server |
| `npm test` | Runs automated unit tests with Vitest |
| `npm run typecheck` | Generates Prisma & route types, then validates TypeScript types |
| `npm run lint` | Runs ESLint analysis across the project |
| `npm run format:check` | Checks formatting against Prettier rules |
| `npm run format` | Auto-formats code with Prettier |
| `npm run db:generate` | Generates Prisma Client types |
| `npm run db:push` | Pushes the Prisma schema state to the database |
| `npm run db:studio` | Opens Prisma Studio visual database browser |

---

## 📁 Project Structure

```
MovieSeriesTracker/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI workflow
├── prisma/
│   ├── migrations/            # SQL migration history
│   ├── schema.prisma          # Comprehensive Prisma database schema
│   ├── seed.ts                # Database seed entrypoint
│   └── create-admin.ts        # Admin user creation helper script
├── public/
│   ├── icons/                 # PWA icons
│   └── manifest.json          # Web App Manifest
├── src/
│   ├── app/
│   │   ├── [locale]/          # Localized Next.js App Router pages
│   │   │   ├── admin/         # Admin dashboard pages
│   │   │   ├── library/       # User library page
│   │   │   ├── movie/         # Movie details & TMDB resolver
│   │   │   ├── person/        # Person / Cast details & TMDB resolver
│   │   │   ├── tv/            # TV Series details & TMDB resolver
│   │   │   ├── search/        # Search results page
│   │   │   ├── watchlists/    # Custom watchlists pages
│   │   │   ├── login/         # Auth login page
│   │   │   └── register/      # Auth registration page
│   │   └── api/               # Next.js API Routes (REST endpoints)
│   ├── components/            # Reusable UI & feature components
│   │   ├── admin/             # Admin management components
│   │   ├── layout/            # Header, Footer, BottomNav, LanguageSwitcher
│   │   ├── media/             # Media cards, carousels, galleries, filters
│   │   ├── movie/             # Movie-specific presentation components
│   │   ├── tv/                # TV-specific presentation components
│   │   ├── person/            # Filmography & person presentation
│   │   ├── search/            # Live search input & results
│   │   ├── user/              # Annotation panels & rating controls
│   │   └── ui/                # Base UI components (TmdbImage, etc.)
│   ├── i18n/                  # next-intl routing & navigation setup
│   ├── lib/                   # Core business logic & services
│   │   ├── auth/              # NextAuth configuration & password hashing
│   │   ├── db/                # Database queries & Prisma singleton
│   │   ├── ingestion/         # TMDB data sync, credit sync & translation services
│   │   ├── tmdb/              # TMDB API Client & rate limiter
│   │   └── rate-limit/        # Rate limiting middleware helpers
│   ├── messages/              # Translation dictionaries (en.json, th.json)
│   └── middleware.ts          # Edge rate-limiting & auth/intl middleware
├── vitest.config.mts          # Vitest testing configuration
├── eslint.config.mjs          # ESLint v9 Flat configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies and npm scripts
```

---

## 🔒 Security & Privacy

- **Protected API Keys**: All TMDB and database credentials remain on the server and are never exposed to client-side bundles.
- **Password Security**: Passwords are encrypted using salted `bcryptjs` hashing.
- **SQL Injection Prevention**: Prisma ORM executes parameterized queries under the hood.
- **XSS & CSRF Protection**: Next.js built-in sanitization and NextAuth CSRF protection tokens.
- **Rate Limiting**: Defends authentication and search endpoints from brute force and automated scraping.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the rich media metadata API.
- [Next.js](https://nextjs.org/) & [Vercel](https://vercel.com/) for the React framework and hosting platform.
