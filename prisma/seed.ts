// Prisma Seed Script Entry Point
// Run via: npx prisma db seed
// Requires TMDB_API_KEY environment variable

import { seedReferenceData } from '../src/lib/ingestion/seed-reference';

async function main() {
  try {
    await seedReferenceData();
    process.exit(0);
  } catch (error) {
    console.error('[seed] Fatal error during seeding:', error);
    process.exit(1);
  }
}

main();
