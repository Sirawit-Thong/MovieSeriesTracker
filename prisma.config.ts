import 'dotenv/config';
import { defineConfig } from "prisma/config";

// Migrations use the direct/session connection (DIRECT_URL) when set,
// falling back to DATABASE_URL (transaction pooler) otherwise.
const databaseUrl =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "file:./dev.db";

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