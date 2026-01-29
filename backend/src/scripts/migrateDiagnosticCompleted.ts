import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Starting data migration...');

    const result = await prisma.user.updateMany({
      where: {
        diagnosticCompleted: false,
      },
      data: {
        diagnosticCompleted: true,
      },
    });

    console.log(`✅ Updated ${result.count} existing users`);
    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
