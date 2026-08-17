---
source: Context7 API
library: Prisma
package: prisma
topic: prisma.config.ts configuration
fetched: 2026-08-17T00:00:00Z
official_docs: https://www.prisma.io/docs/orm/prisma-schema
---

# Prisma 7: prisma.config.ts Configuration

## Basic Configuration

```typescript
// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

type Env = {
  DATABASE_URL: string
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: env<Env>('DATABASE_URL'),
  },
})
```

## Configuration Shape

```typescript
export type PrismaConfig = {
  experimental?: Simplify<ExperimentalConfig>
  datasource?: Simplify<Datasource>
  schema?: string
  migrations?: Simplify<MigrationsConfigShape>
  tables?: Simplify<TablesConfigShape>
  enums?: Simplify<EnumsConfigShape>
  views?: Simplify<ViewsConfigShape>
  typedSql?: Simplify<TypedSqlConfigShape>
}

export type MigrationsConfigShape = {
  path?: string
  initShadowDb?: string
  seed?: string
}
```

## Key Prisma 7 Changes

- **No auto-loading of `.env`**: CLI does not auto-load `.env` files. You must load them manually in `prisma.config.ts` using `import 'dotenv/config'`.
- **Centralized configuration**: All connection settings should be in `prisma.config.ts`, not in `schema.prisma`.
- **SQLite URL resolution**: SQLite datasource URLs are resolved relative to the config file location, not the schema file.

## Configuration with Driver Adapter (e.g., for Cloudflare D1)

```typescript
import path from 'node:path'
import { defineConfig } from '@prisma/config'
import { PrismaD1 } from '@prisma/adapter-d1'

type Env = {
  CLOUDFLARE_D1_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_DATABASE_ID: string
}

const env = {
  CLOUDFLARE_D1_TOKEN: '$CLOUDFLARE_D1_TOKEN',
  CLOUDFLARE_ACCOUNT_ID: '$CLOUDFLARE_ACCOUNT_ID',
  CLOUDFLARE_DATABASE_ID: '$CLOUDFLARE_DATABASE_ID',
} satisfies Env

export default defineConfig({
  experimental: {
    adapter: true,
  },
  schema: path.join('schema.prisma'),
  engine: 'js',
  async adapter() {
    return new PrismaD1({
      CLOUDFLARE_D1_TOKEN: env.CLOUDFLARE_D1_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
      CLOUDFLARE_DATABASE_ID: env.CLOUDFLARE_DATABASE_ID,
    })
  },
})
```

## Environment Loading Policy

- The CLI does not auto-load `.env` files
- Apps must load `.env` in `prisma.config.ts` (e.g., `import 'dotenv/config'`)
- Pass values through config properties like `datasource.url` or `db.connection`
