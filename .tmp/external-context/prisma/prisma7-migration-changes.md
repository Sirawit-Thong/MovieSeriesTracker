---
source: Context7 API
library: Prisma
package: prisma
topic: Prisma 7 migration changes
fetched: 2026-08-17T00:00:00Z
official_docs: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
---

# Prisma 7 Migration Changes

## Key Changes from Prisma 5/6 to Prisma 7

### 1. Centralized Configuration

**Prisma 5/6**: Connection settings in `schema.prisma`
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Prisma 7**: Configuration in `prisma.config.ts`
```typescript
// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: env<Env>('DATABASE_URL'),
  },
})
```

### 2. No Automatic `.env` Loading

- **Prisma 5/6**: CLI auto-loads `.env` files
- **Prisma 7**: CLI does NOT auto-load `.env` files. You must load them manually in `prisma.config.ts` using `import 'dotenv/config'`

### 3. New Generator

**Prisma 5/6**:
```prisma
generator client {
  provider = "prisma-client-js"
}
```

**Prisma 7**:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

### 4. Import Path Change

**Prisma 5/6**:
```typescript
import { PrismaClient } from '@prisma/client'
```

**Prisma 7**:
```typescript
import { PrismaClient } from './generated/prisma/client'
```

### 5. SQLite URL Resolution

- **Prisma 5/6**: SQLite URLs resolved relative to schema file
- **Prisma 7**: SQLite URLs resolved relative to config file location

### 6. `datasource` Block in schema.prisma

In Prisma 7, the `datasource` block in `schema.prisma` is still allowed but only specifies the `provider` - not the URL:

```prisma
datasource db {
  provider = "sqlite"  // Only provider is specified here
}
```

The URL is now configured in `prisma.config.ts`.

### 7. Driver Adapters

Prisma 7 uses driver adapters for database connections:

```typescript
// For SQLite
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// For PostgreSQL
import { PrismaPg } from '@prisma/adapter-pg'

// For Cloudflare D1
import { PrismaD1 } from '@prisma/adapter-d1'
```

### 8. Migration Commands

Migration commands now read from `prisma.config.ts`:

```typescript
// From Prisma 7 source code
const dbConnection = inputs.db ?? config.db?.connection;
if (dbConnection === undefined) {
  // Error: "Database connection is required for migrate (set db.connection in prisma.config.ts, or pass --db <url>)"
}
```

## Migration Checklist

- [ ] Create `prisma.config.ts` with `defineConfig`
- [ ] Move datasource URL to `prisma.config.ts`
- [ ] Add `import 'dotenv/config'` at top of config file
- [ ] Update generator to `provider = "prisma-client"`
- [ ] Set output directory for generated client
- [ ] Update import paths for PrismaClient
- [ ] Install appropriate driver adapter package
- [ ] Test migrations and client generation
