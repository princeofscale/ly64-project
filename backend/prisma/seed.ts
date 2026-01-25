import { PrismaClient } from '@prisma/client';
import { seedAchievements } from './seeds/achievements';
import { seedDiagnosticTests } from './seeds/diagnosticTests';
import { seedTestUser } from './seeds/testUser';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...\n');

  try {
    await seedAchievements();
    await seedDiagnosticTests();
    await seedTestUser();

    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('\nError during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
