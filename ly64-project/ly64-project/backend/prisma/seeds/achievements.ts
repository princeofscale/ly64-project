import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  }),
});

export async function seedAchievements() {
  console.log('🏆 Seeding achievements...');

  const achievements = [
    {
      name: 'Успешная регистрация',
      description: 'Добро пожаловать! Вы успешно зарегистрировались на платформе',
      icon: '🎉',
      condition: 'register',
      points: 10,
      rutheniumReward: 2,
      rarity: 'COMMON',
    },
    {
      name: 'Входная диагностика',
      description: 'Прошли входной диагностический тест',
      icon: '🎯',
      condition: 'complete_diagnostic',
      points: 30,
      rutheniumReward: 3,
      rarity: 'COMMON',
    },
    {
      name: 'Ученик',
      description: 'Прошли первый тест',
      icon: '📚',
      condition: 'complete_first_test',
      points: 25,
      rutheniumReward: 3,
      rarity: 'COMMON',
    },
    {
      name: 'Отличник',
      description: 'Набрали 90%+ в тесте',
      icon: '⭐',
      condition: 'score_90_percent',
      points: 50,
      rutheniumReward: 5,
      rarity: 'RARE',
    },
    {
      name: 'Марафонец',
      description: 'Прошли 10 тестов',
      icon: '🏃',
      condition: 'complete_10_tests',
      points: 100,
      rutheniumReward: 10,
      rarity: 'RARE',
    },
    {
      name: 'Перфекционист',
      description: 'Набрали 100% в тесте',
      icon: '💯',
      condition: 'perfect_score',
      points: 150,
      rutheniumReward: 15,
      rarity: 'EPIC',
    },
    {
      name: 'Знаток математики',
      description: 'Прошли 5 тестов по математике',
      icon: '🔢',
      condition: 'complete_5_math_tests',
      points: 75,
      rutheniumReward: 7,
      rarity: 'RARE',
    },
    {
      name: 'Покоритель языков',
      description: 'Прошли 5 тестов по русскому языку',
      icon: '📝',
      condition: 'complete_5_russian_tests',
      points: 75,
      rutheniumReward: 7,
      rarity: 'RARE',
    },
    {
      name: 'Исследователь',
      description: 'Попробовали тесты по всем предметам',
      icon: '🔬',
      condition: 'try_all_subjects',
      points: 200,
      rutheniumReward: 20,
      rarity: 'EPIC',
    },
    {
      name: 'Стремление к знаниям',
      description: 'Занимались 7 дней подряд',
      icon: '📅',
      condition: 'seven_day_streak',
      points: 120,
      rutheniumReward: 12,
      rarity: 'RARE',
    },
    {
      name: 'Целеустремленность',
      description: 'Занимались 30 дней подряд',
      icon: '🔥',
      condition: 'thirty_day_streak',
      points: 300,
      rutheniumReward: 30,
      rarity: 'LEGENDARY',
    },
    {
      name: 'Спринтер',
      description: 'Прошли тест менее чем за 10 минут',
      icon: '⚡',
      condition: 'complete_test_under_10_min',
      points: 40,
      rutheniumReward: 4,
      rarity: 'COMMON',
    },
    {
      name: 'Хранитель знаний',
      description: 'Прошли 50 тестов',
      icon: '📖',
      condition: 'complete_50_tests',
      points: 500,
      rutheniumReward: 50,
      rarity: 'LEGENDARY',
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
      await prisma.achievement.update({
        where: { id: existing.id },
        data: {
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          rutheniumReward: achievement.rutheniumReward,
          rarity: achievement.rarity,
        },
      });
      console.log(`🔄 Updated achievement: ${achievement.name}`);
    }
  }

  console.log('✨ Achievements seeding completed!');
}

if (require.main === module) {
  seedAchievements()
    .catch(e => {
      console.error('Error seeding achievements:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
