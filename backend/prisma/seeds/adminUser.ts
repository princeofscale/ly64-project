import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdminUser() {
  console.log('Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const now = new Date();

  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@lyceum64.ru' },
  });

  if (adminUser) {
    console.log('⏭️  Admin user already exists');
    return;
  }

  await prisma.user.create({
    data: {
      email: 'admin@lyceum64.ru',
      username: 'admin',
      password: hashedPassword,
      name: 'Администратор',
      role: 'ADMIN',
      status: 'STUDENT',
      currentGrade: 11,
      agreedToTerms: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log('✅ Created admin user: admin@lyceum64.ru / admin123');
}
