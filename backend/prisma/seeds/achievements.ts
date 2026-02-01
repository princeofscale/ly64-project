import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAchievements() {
  console.log('🏆 Seeding achievements...');

  const achievements = [
    {
      name: 'Успешная регистрация',
      description: 'Добро пожаловать! Вы успешно зарегистрировались на платформе',
      icon: '🎉',
      condition: 'register',
      points: 10,
    },
    {
      name: 'Входная диагностика',
      description: 'Прошли входной диагностический тест',
      icon: '🎯',
      condition: 'complete_diagnostic',
      points: 30,
    },
    {
      name: 'Ученик',
      description: 'Прошли первый тест',
      icon: '📚',
      condition: 'complete_first_test',
      points: 25,
    },
    {
      name: 'Отличник',
      description: 'Набрали 90%+ в тесте',
      icon: '⭐',
      condition: 'score_90_percent',
      points: 50,
    },
    {
      name: 'Марафонец',
      description: 'Прошли 10 тестов',
      icon: '🏃',
      condition: 'complete_10_tests',
      points: 100,
    },
    {
      name: 'Перфекционист',
      description: 'Набрали 100% в тесте',
      icon: '💯',
      condition: 'perfect_score',
      points: 150,
    },
    {
      name: 'Знаток математики',
      description: 'Прошли 5 тестов по математике',
      icon: '🔢',
      condition: 'complete_5_math_tests',
      points: 75,
    },
    {
      name: 'Покоритель языков',
      description: 'Прошли 5 тестов по русскому языку',
      icon: '📝',
      condition: 'complete_5_russian_tests',
      points: 75,
    },
    {
      name: 'Исследователь',
      description: 'Попробовали тесты по всем предметам',
      icon: '🔬',
      condition: 'try_all_subjects',
      points: 200,
    },
    {
      name: 'Стремление к знаниям',
      description: 'Занимались 7 дней подряд',
      icon: '📅',
      condition: 'seven_day_streak',
      points: 120,
    },
    {
      name: 'Целеустремленность',
      description: 'Занимались 30 дней подряд',
      icon: '🔥',
      condition: 'thirty_day_streak',
      points: 300,
    },
    {
      name: 'Спринтер',
      description: 'Прошли тест менее чем за 10 минут',
      icon: '⚡',
      condition: 'complete_test_under_10_min',
      points: 40,
    },
    {
      name: 'Хранитель знаний',
      description: 'Прошли 50 тестов',
      icon: '📖',
      condition: 'complete_50_tests',
      points: 500,
    },
  ];

  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { name: achievement.name },
    });

    if (!existing) {
      await prisma.achievement.create({
        data: achievement,
      });
      console.log(`✅ Created achievement: ${achievement.name}`);
    } else {
      console.log(`⏭️  Achievement already exists: ${achievement.name}`);
    }
  }

  console.log('✨ Achievements seeding completed!');
}

if (require.main === module) {
  seedAchievements()
    .catch((e) => {
      console.error('Error seeding achievements:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
