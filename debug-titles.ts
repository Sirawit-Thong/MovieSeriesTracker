import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:postgres@localhost:5432/movie_series_tracker' });
  const p = new PrismaClient({ adapter });

  try {
    const person = await p.person.findUnique({
      where: { tmdbId: 1252318 },
      select: { id: true },
    });
    if (!person) { console.log('Not found'); return; }

    // Check combined credits titles
    const combined = await p.personCombinedCredit.findMany({
      where: { personId: person.id },
      orderBy: { popularity: 'desc' },
      take: 10,
    });
    console.log('COMBINED CREDITS:', combined.length);
    for (const c of combined) {
      console.log(`  [${c.mediaType}] title="${c.title}" mediaId=${c.mediaId}`);
    }
  } finally {
    await p.$disconnect();
  }
}

main();
