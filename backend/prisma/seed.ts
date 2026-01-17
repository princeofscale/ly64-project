import { PrismaClient } from '@prisma/client';
import { seedAchievements } from './seeds/achievements';

const prisma = new PrismaClient();

/**
 * Главный файл для seeding базы данных
 * Запускает все seed скрипты
 */
async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed достижений
    await seedAchievements();

    // TODO: Добавить другие seeds
    // await seedQuestions();
    // await seedTests();

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
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
