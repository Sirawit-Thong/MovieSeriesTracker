// Create Admin User
// Run: $env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_series_tracker"; npx tsx prisma/create-admin.ts

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@mst.com';
  const password = 'admin123';
  const name = 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists. Updating role to ADMIN...`);
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
    console.log('Done! Role updated to ADMIN.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'ADMIN' },
  });

  console.log('Admin user created!');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role:     ${user.role}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
