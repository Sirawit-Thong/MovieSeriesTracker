// Prisma Client Singleton
// Prevents multiple Prisma Client instances in development (hot-reload)

import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {assertProductionEnv} from '../env';

assertProductionEnv();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
