---
source: Context7 API
library: Prisma
package: prisma
topic: PrismaClient SQLite setup
fetched: 2026-08-17T00:00:00Z
official_docs: https://www.prisma.io/docs/orm/prisma-client
---

# Prisma 7: PrismaClient with SQLite

## Instantiation with Driver Adapter

In Prisma 7, you use the `@prisma/adapter-better-sqlite3` driver adapter with PrismaClient:

```typescript
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from './generated/prisma/client'

async function main() {
  const prisma = new PrismaClient({ 
    adapter: new PrismaBetterSqlite3({ url: 'file:prisma/dev.db' }) 
  })

  // Use prisma client normally
  const email = `user.${Date.now()}@prisma.io`
  await prisma.user.create({
    data: {
      email,
    },
  })

  const users = await prisma.user.findMany()
  console.log(users)
}

void main().catch((e) => {
  console.log(e.message)
  process.exit(1)
})
```

## Important Notes

1. **Import path**: The client is imported from `./generated/prisma/client` (not from `@prisma/client`)
2. **URL resolution**: SQLite datasource URLs are now resolved relative to the config file location in Prisma 7
3. **Adapter required**: You must use a driver adapter (like `@prisma/adapter-better-sqlite3`) for SQLite in Prisma 7

## Schema Setup for SQLite

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model User {
  id    String @id @default(uuid())
  email String
}
```

## Prisma 7 Generator Changes

- New generator: `provider = "prisma-client"` (replaces `prisma-client-js`)
- Output directory: `output = "../generated/prisma"`
- Import path: `import { PrismaClient } from './generated/prisma/client'`
