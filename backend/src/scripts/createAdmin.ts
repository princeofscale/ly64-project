import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.argv[2] || 'admin@lyceum64.ru';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Администратор';

  try {
    console.log('Creating admin user...');

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ User ${email} updated to ADMIN role`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0] + '_admin';

    const admin = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        status: 'STUDENT',
        currentGrade: 10,
        role: 'ADMIN',
        agreedToTerms: true,
      },
    });

    await prisma.userProgress.create({
      data: {
        userId: admin.id,
        completedTests: '[]',
        stats: '[]',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Username: ${username}`);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
