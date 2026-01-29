import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHEMISTRY_QUESTIONS = [
  { question: 'Какой химический символ у кислорода?', options: ['O', 'Ok', 'Ox', 'Os'], correctAnswer: 'O', difficulty: 'EASY', topic: 'Основы' },
  { question: 'Сколько электронов в атоме водорода?', options: ['0', '1', '2', '3'], correctAnswer: '1', difficulty: 'EASY', topic: 'Строение атома' },
  { question: 'Какой тип связи в молекуле NaCl?', options: ['Ковалентная', 'Ионная', 'Металлическая', 'Водородная'], correctAnswer: 'Ионная', difficulty: 'MEDIUM', topic: 'Химическая связь' },
  { question: 'Что образуется при взаимодействии кислоты и основания?', options: ['Соль и вода', 'Только соль', 'Только вода', 'Газ'], correctAnswer: 'Соль и вода', difficulty: 'EASY', topic: 'Химические реакции' },
  { question: 'Какой газ выделяется при реакции металла с кислотой?', options: ['Кислород', 'Азот', 'Водород', 'Углекислый газ'], correctAnswer: 'Водород', difficulty: 'MEDIUM', topic: 'Химические реакции' },
  { question: 'Формула воды:', options: ['H2O', 'H2O2', 'HO', 'H3O'], correctAnswer: 'H2O', difficulty: 'EASY', topic: 'Основы' },
  { question: 'Какой элемент имеет атомный номер 6?', options: ['Азот', 'Углерод', 'Кислород', 'Бор'], correctAnswer: 'Углерод', difficulty: 'MEDIUM', topic: 'Строение атома' },
  { question: 'Что такое катализатор?', options: ['Ускоряет реакцию', 'Замедляет реакцию', 'Останавливает реакцию', 'Начинает реакцию'], correctAnswer: 'Ускоряет реакцию', difficulty: 'EASY', topic: 'Химические реакции' },
  { question: 'Какой класс соединений содержит группу -OH?', options: ['Альдегиды', 'Спирты', 'Кислоты', 'Эфиры'], correctAnswer: 'Спирты', difficulty: 'MEDIUM', topic: 'Органическая химия' },
  { question: 'pH нейтральной среды равен:', options: ['0', '7', '14', '1'], correctAnswer: '7', difficulty: 'EASY', topic: 'Химические реакции' },
];

async function addChemistryTest() {
  try {
    console.log('Checking for existing chemistry test...');

    const existingTest = await prisma.test.findFirst({
      where: {
        subject: 'CHEMISTRY',
        isDiagnostic: true,
      },
    });

    if (existingTest) {
      console.log('Chemistry test already exists, skipping...');
      return;
    }

    console.log('Creating chemistry diagnostic test...');

    const now = new Date();
    const test = await prisma.test.create({
      data: {
        title: 'Диагностика: CHEMISTRY',
        description: 'Входной диагностический тест по предмету CHEMISTRY',
        subject: 'CHEMISTRY',
        examType: 'LYCEUM',
        isDiagnostic: true,
        randomizeQuestions: true,
        preventBackNavigation: true,
        timeLimit: 20,
        passingScore: 40,
        createdAt: now,
        updatedAt: now,
      },
    });

    for (let i = 0; i < CHEMISTRY_QUESTIONS.length; i++) {
      const q = CHEMISTRY_QUESTIONS[i];
      const qNow = new Date();
      const question = await prisma.question.create({
        data: {
          subject: 'CHEMISTRY',
          examType: 'LYCEUM',
          type: 'SINGLE_CHOICE',
          difficulty: q.difficulty,
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: JSON.stringify(q.correctAnswer),
          topic: q.topic,
          createdAt: qNow,
          updatedAt: qNow,
        },
      });

      await prisma.testQuestion.create({
        data: {
          testId: test.id,
          questionId: question.id,
          order: i,
        },
      });
    }

    console.log('Chemistry diagnostic test created successfully!');
  } catch (error) {
    console.error('Error creating chemistry test:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addChemistryTest();
