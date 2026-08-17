import { defineConfig } from "prisma/config";

// Use DATABASE_URL env var when set (production: PostgreSQL),
// fall back to local SQLite file for development.
const databaseUrl =
  process.env.DATABASE_URL ?? "file:./dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
