const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@lyceum64.ru' },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@lyceum64.ru');
      console.log('Password: admin123');
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
        authProvider: 'EMAIL',
        agreedToTerms: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@lyceum64.ru');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
