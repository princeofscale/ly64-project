import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteRegularTests() {
  console.log('Deleting regular tests...');

  // Удаляем все тесты, кроме диагностических
  const result = await prisma.test.deleteMany({
    where: {
      isDiagnostic: false,
    },
  });

  console.log(`✅ Deleted ${result.count} regular tests`);
}

deleteRegularTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
