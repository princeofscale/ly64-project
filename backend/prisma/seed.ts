import prisma, { disconnectDatabase } from '../src/config/database';

import { seedAchievements } from './seeds/achievements';
import { seedAdminUser } from './seeds/adminUser';
import { seedTestUser } from './seeds/testUser';
import { seedAdminUser } from './seeds/adminUser';

async function main() {
  console.log('Starting database seeding...\n');

  try {
    await seedAchievements();
    await seedTestUser();
    await seedAdminUser();

    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('\nError during seeding:', error);
    throw error;
  }
}

void prisma;

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
