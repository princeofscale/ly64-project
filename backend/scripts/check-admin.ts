import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
    },
  });

  console.log('\n📋 Admin users in database:\n');

  if (admins.length === 0) {
    console.log('❌ No admin users found!');
    console.log('\nTo create an admin, run: npm run db:seed');
  } else {
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Password: admin123 (default)\n`);
    });
  }

  await prisma.$disconnect();
}

checkAdmin().catch(console.error);
