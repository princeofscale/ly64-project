import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

import { seedAchievements } from './seeds/achievements';
import { seedAdminUser } from './seeds/adminUser';
// import { seedDiagnosticTests } from './seeds/diagnosticTests'; // file does not exist
// import { seedRegularTests } from './seeds/regularTests'; // file does not exist
import { seedTestUser } from './seeds/testUser';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  }),
});

async function main() {
  console.log('Starting database seeding...\n');

  try {
    await seedAchievements();
    // await seedDiagnosticTests(); // file does not exist
    // await seedRegularTests(); // file does not exist
    await seedTestUser();
    await seedAdminUser();

    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('\nError during seeding:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
