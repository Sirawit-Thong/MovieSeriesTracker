<div align="center">

# 🎬 Movie & Series Tracker

<p align="center">
  <strong>The Ultimate Entertainment Hub — Track, Discover, and Curate Movies & TV Series with Real-Time TMDB Sync.</strong>
</p>

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Quick Start</a> •
  <a href="#-architecture--database">Architecture</a> •
  <a href="#-admin-suite">Admin Suite</a> •
  <a href="#-scripts">Scripts</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TMDB_API-v3-01d277?style=flat-square&logo=themoviedatabase&logoColor=white" alt="TMDB" />
  <img src="https://img.shields.io/badge/NextAuth.js-v5_Beta-purple?style=flat-square&logo=auth0&logoColor=white" alt="NextAuth" />
  <img src="https://img.shields.io/badge/i18n-TH_%2F_EN-blue?style=flat-square" alt="i18n" />
  <img src="https://img.shields.io/badge/Tests-40_Passed-success?style=flat-square&logo=vitest&logoColor=white" alt="Tests" />
  <img src="https://img.shields.io/badge/PWA-Ready-orange?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
</p>

---

</div>

## 📖 Overview

**Movie & Series Tracker** is a production-grade, cinematic web application built with **Next.js 16 (App Router + Turbopack)**. Designed with a sleek, Netflix-inspired dark aesthetic, it empowers users to seamlessly track their watchlist progress, rate titles, discover trending movies and series, and explore rich multimedia cast filmographies. 

Powered by a **hybrid database architecture**, the application queries local PostgreSQL records instantly while fetching on-demand data from **The Movie Database (TMDB)** API in parallel — delivering blazing fast page loads and rich metadata without redundant storage overhead.

---

## ✨ Key Features

<table>
  <tr>
    <td width="50%">
      <h3>🎯 Discovery & Media Richness</h3>
      <ul>
        <li><b>Trending & Top Charts</b>: Live popularity rankings for Movies, TV Series, and People.</li>
        <li><b>Comprehensive Details</b>: High-res backdrops, official trailers/video embeds, photo galleries, age certifications, and provider streaming links.</li>
        <li><b>Actor & Crew Filmographies</b>: Filterable filmography by department (Acting, Directing, Producing, Crew) with <i>"Known For"</i> highlights.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔍 Hybrid Dual-Engine Search</h3>
      <ul>
        <li><b>Parallel Lookups</b>: Queries your local PostgreSQL catalog and TMDB API concurrently.</li>
        <li><b>Intelligent Deduplication</b>: Automatically merges records, eliminating duplicates in milliseconds.</li>
        <li><b>Instant Library Sync</b>: Add any live TMDB search result straight into your personal library with one click.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🌐 Full Internationalization (i18n)</h3>
      <ul>
        <li><b>Bilingual UI</b>: Full English (<code>en</code>) and Thai (<code>th</code>) support via <code>next-intl</code>.</li>
        <li><b>Smart Script Fallbacks</b>: Automatic detection for non-Latin / Asian scripts (Chinese, Korean, Japanese, Cyrillic) — fallback to English titles when Thai translations are unavailable to keep text clean and readable.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📚 Personal Library & Watchlists</h3>
      <ul>
        <li><b>Watch State Tracking</b>: <code>WATCHED</code>, <code>WATCHING</code>, <code>WANT_TO_WATCH</code>, and <code>DROPPED</code>.</li>
        <li><b>Personal Scores & Notes</b>: 1–5 star personal ratings, custom private notes, and episode trackers.</li>
        <li><b>Custom Watchlists</b>: Create, share, and curate unlimited personalized playlists.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🛡️ Enterprise Admin Suite</h3>
      <ul>
        <li><b>Live Data Ingestion</b>: Trigger single-entity or batch TMDB synchronization with live heartbeat tracking and cancel controls.</li>
        <li><b>Moderation & Auditing</b>: Inspect user activities, ban fraudulent accounts, and monitor audit logs (IP, User-Agent, status).</li>
        <li><b>Catalog Moderation</b>: Prune or delete cached media directly from the UI.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔒 Robust Security & Performance</h3>
      <ul>
        <li><b>NextAuth.js v5 (RBAC)</b>: Secure JWT session handling, Credentials auth, and Google OAuth support.</li>
        <li><b>In-Memory Rate Limiting</b>: Tiered DDoS and brute-force protection across authentication and search endpoints.</li>
        <li><b>Progressive Web App (PWA)</b>: Installable app with offline fallback support.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Core Framework | Database & ORM | Authentication & Security | UI & Styling | Testing & Quality |
|:---:|:---:|:---:|:---:|:---:|
| **Next.js 16** (Turbopack) | **PostgreSQL** | **NextAuth.js v5** (Beta) | **Tailwind CSS v4** | **Vitest** (Unit Tests) |
| **React 19** | **Prisma ORM** | **Bcrypt.js** | **next-intl** (i18n) | **ESLint v9** (Flat Config) |
| **TypeScript** | `@prisma/adapter-pg` | Rate Limiter Middleware | **PWA Service Worker** | **Prettier** |

</div>

---

## 🏗️ Architecture & Database

```mermaid
graph TD
    Client["🌐 Client Browser (PWA / Mobile / Desktop)"]
    Proxy["🛡️ Next.js Middleware (Rate Limiter + i18n Routing)"]
    
    subgraph AppServer["⚡ Next.js 16 Application Server"]
        AppRouter["App Router (SSR / Dynamic Pages)"]
        API["REST API Endpoints (/api/...)"]
        AuthService["Auth Service (NextAuth v5 + RBAC)"]
        SyncEngine["TMDB Ingestion & Sync Engine"]
    end
    
    subgraph DataTier["💾 Data & External Services"]
        Postgres[("🐘 PostgreSQL Database\n(Movies, Series, People, Library, Users)")]
        TMDB["🎬 TMDB API (External Service)"]
    end

    Client -->|HTTP / HTTPS| Proxy
    Proxy --> AppRouter
    Proxy --> API
    AppRouter --> AuthService
    AppRouter --> Postgres
    API --> SyncEngine
    API --> Postgres
    SyncEngine -->|Fetch Metadata & Translations| TMDB
    SyncEngine -->|Upsert Entity & Credits| Postgres
```

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally on your machine.

### 1. Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL**: Running instance (Local or Docker)
- **TMDB API Key**: Free API key from [The Movie Database](https://www.themoviedb.org/settings/api)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/Sirawit-Thong/MovieSeriesTracker.git

# Navigate into project directory
cd MovieSeriesTracker

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Create your local `.env` file:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key_here

# PostgreSQL Database Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_series_tracker"

# NextAuth.js Configuration (Generate secret: openssl rand -base64 32)
AUTH_SECRET="your-secure-random-32-character-secret"
AUTH_URL="http://localhost:3000"

# Optional: Google OAuth Login
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Database Setup & Seeding

```bash
# Generate Prisma Client types
npm run db:generate

# Push database schema to PostgreSQL
npm run db:push

# (Optional) Seed genres & reference languages
npm run db:seed
```

### 5. Launch Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing & Code Quality

The codebase includes automated unit test suites covering rate limiting, logger utilities, sync locks, and dual-language credit resolution:

```bash
# Run unit tests with Vitest
npm test

# Run TypeScript type verification
npm run typecheck

# Run ESLint analysis
npm run lint

# Check code formatting with Prettier
npm run format:check
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local Next.js development server with Turbopack |
| `npm run build` | Compiles optimized production build (with static prerendering) |
| `npm start` | Runs the compiled production server |
| `npm test` | Executes all Vitest unit tests |
| `npm run typecheck` | Generates Prisma client types & verifies TypeScript compilation |
| `npm run lint` | Analyzes codebase for errors and style warnings using ESLint |
| `npm run format` | Auto-formats all code using Prettier |
| `npm run db:push` | Synchronizes the Prisma schema with the database without migrations |
| `npm run db:studio` | Launches visual Prisma Studio database manager at `localhost:5555` |

---

## 📁 Repository Structure

```
MovieSeriesTracker/
├── .github/
│   └── workflows/ci.yml       # Automated CI workflow (Lint, Typecheck, Test, Build)
├── prisma/
│   ├── schema.prisma          # Comprehensive Prisma database schema
│   ├── seed.ts                # Database seed script
│   └── create-admin.ts        # Admin creation utility
├── public/
│   ├── icons/                 # PWA icons
│   └── manifest.json          # Web App Manifest
├── src/
│   ├── app/
│   │   ├── [locale]/          # Localized App Router pages (admin, library, movie, tv, person)
│   │   └── api/               # Serverless API routes (admin, annotations, library, search, sync)
│   ├── components/            # Reusable UI, feature modules & layouts
│   ├── i18n/                  # next-intl routing & navigation configuration
│   ├── lib/                   # Database access, ingestion pipeline, TMDB client, and auth
│   ├── messages/              # Translation dictionaries (en.json, th.json)
│   └── middleware.ts          # Edge rate-limiting, authentication & locale middleware
├── vitest.config.mts          # Vitest unit test configuration
├── eslint.config.mjs          # ESLint v9 Flat configuration
└── package.json               # Dependencies & scripts
```

---

## 📄 License

This project is open-source and available under the **[MIT License](LICENSE)**.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Sirawit-Thong">Sirawit Thong</a></sub>
</div>
