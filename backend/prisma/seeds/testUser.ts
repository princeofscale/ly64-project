import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedTestUser() {
  console.log('Creating test user...');

  const hashedPassword = await bcrypt.hash('test123', 10);
  const now = new Date();

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@lyceum64.ru' },
  });

  if (testUser) {
    console.log('⏭️  Test user already exists');
    return;
  }

  await prisma.user.create({
    data: {
      email: 'test@lyceum64.ru',
      username: 'testuser',
      password: hashedPassword,
      name: 'Тестовый Пользователь',
      status: 'STUDENT',
      currentGrade: 9,
      agreedToTerms: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log('✅ Created test user: test@lyceum64.ru / test123');
}
