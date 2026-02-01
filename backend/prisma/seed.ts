import { PrismaClient } from '@prisma/client';

import { seedAchievements } from './seeds/achievements';
import { seedAdminUser } from './seeds/adminUser';
import { seedDiagnosticTests } from './seeds/diagnosticTests';
import { seedRegularTests } from './seeds/regularTests';
import { seedTestUser } from './seeds/testUser';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...\n');

  try {
    await seedAchievements();
    await seedDiagnosticTests();
    await seedRegularTests();
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
