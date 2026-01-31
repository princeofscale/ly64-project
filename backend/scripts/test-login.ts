import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'admin@lyceum64.ru';
  const password = 'admin123';

  console.log('\n🔍 Testing login for:', email);
  console.log('🔑 Password:', password);
  console.log();

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('❌ User not found!');
    await prisma.$disconnect();
    return;
  }

  console.log('✅ User found:', user.email);
  console.log('   Role:', user.role);
  console.log('   Name:', user.name);
  console.log();

  // Check password
  console.log('🔐 Checking password...');
  const isValid = await bcrypt.compare(password, user.password);

  if (isValid) {
    console.log('✅ Password is correct! Login should work.');
  } else {
    console.log('❌ Password is INCORRECT!');
    console.log('   Stored hash:', user.password.substring(0, 30) + '...');
    console.log();
    console.log('🔧 Resetting password to admin123...');

    const newHash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { email },
      data: { password: newHash },
    });

    console.log('✅ Password reset complete!');
  }

  await prisma.$disconnect();
}

testLogin().catch(console.error);
