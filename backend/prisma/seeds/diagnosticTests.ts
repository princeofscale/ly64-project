import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DIAGNOSTIC_QUESTIONS = {
  RUSSIAN: [
    { question: 'В каком слове допущена орфографическая ошибка?', options: ['корова', 'молоко', 'сабака', 'дорога'], correctAnswer: 'сабака', difficulty: 'EASY', topic: 'Орфография' },
    { question: 'Укажите слово с чередующейся гласной в корне:', options: ['загорать', 'гора', 'город', 'горевать'], correctAnswer: 'загорать', difficulty: 'MEDIUM', topic: 'Орфография' },
    { question: 'В каком предложении НЕ пишется слитно?', options: ['(Не)большой дом', '(Не)читал книгу', '(Не)он виноват', '(Не)смотря вперёд'], correctAnswer: '(Не)большой дом', difficulty: 'MEDIUM', topic: 'Орфография' },
    { question: 'Сколько запятых нужно поставить: "Солнце светило ярко и птицы пели"?', options: ['0', '1', '2', '3'], correctAnswer: '1', difficulty: 'EASY', topic: 'Пунктуация' },
    { question: 'Укажите сложноподчинённое предложение:', options: ['Я читал, а он писал.', 'Когда пришла весна, снег растаял.', 'День был тёплый и солнечный.', 'Ни дождя, ни снега.'], correctAnswer: 'Когда пришла весна, снег растаял.', difficulty: 'MEDIUM', topic: 'Пунктуация' },
    { question: 'Какое слово является синонимом к слову "смелый"?', options: ['трусливый', 'отважный', 'глупый', 'медленный'], correctAnswer: 'отважный', difficulty: 'EASY', topic: 'Лексика' },
    { question: 'Определите часть речи слова "читая":', options: ['глагол', 'причастие', 'деепричастие', 'наречие'], correctAnswer: 'деепричастие', difficulty: 'MEDIUM', topic: 'Грамматика' },
    { question: 'В каком ряду все слова — существительные?', options: ['дом, бежать, красный', 'книга, стол, окно', 'быстро, медленно, тихо', 'я, ты, он'], correctAnswer: 'книга, стол, окно', difficulty: 'EASY', topic: 'Грамматика' },
    { question: 'Укажите предложение с обособленным определением:', options: ['Мальчик, читающий книгу, сидел у окна.', 'Красивая девочка пела песню.', 'Он быстро бежал.', 'Солнце светило.'], correctAnswer: 'Мальчик, читающий книгу, сидел у окна.', difficulty: 'HARD', topic: 'Пунктуация' },
    { question: 'Что такое метафора?', options: ['Прямое сравнение', 'Скрытое сравнение', 'Преувеличение', 'Преуменьшение'], correctAnswer: 'Скрытое сравнение', difficulty: 'MEDIUM', topic: 'Речь и текст' },
  ],
  MATHEMATICS: [
    { question: 'Решите уравнение: 2x + 5 = 15', options: ['x = 5', 'x = 10', 'x = 7', 'x = 4'], correctAnswer: 'x = 5', difficulty: 'EASY', topic: 'Уравнения' },
    { question: 'Найдите значение выражения: 3² + 4²', options: ['25', '12', '7', '49'], correctAnswer: '25', difficulty: 'EASY', topic: 'Арифметика' },
    { question: 'Решите неравенство: x - 3 > 7', options: ['x > 10', 'x > 4', 'x < 10', 'x < 4'], correctAnswer: 'x > 10', difficulty: 'MEDIUM', topic: 'Неравенства' },
    { question: 'Упростите: (a + b)²', options: ['a² + b²', 'a² + 2ab + b²', 'a² - b²', '2a + 2b'], correctAnswer: 'a² + 2ab + b²', difficulty: 'MEDIUM', topic: 'Алгебра' },
    { question: 'Найдите площадь прямоугольника со сторонами 5 и 8:', options: ['13', '26', '40', '80'], correctAnswer: '40', difficulty: 'EASY', topic: 'Геометрия' },
    { question: 'Чему равен sin(90°)?', options: ['0', '1', '-1', '0.5'], correctAnswer: '1', difficulty: 'MEDIUM', topic: 'Тригонометрия' },
    { question: 'Найдите корни уравнения: x² - 9 = 0', options: ['x = 3', 'x = -3', 'x = ±3', 'x = 9'], correctAnswer: 'x = ±3', difficulty: 'MEDIUM', topic: 'Уравнения' },
    { question: 'Какова вероятность выпадения орла при подбрасывании монеты?', options: ['0', '0.25', '0.5', '1'], correctAnswer: '0.5', difficulty: 'EASY', topic: 'Вероятность' },
    { question: 'Найдите производную функции f(x) = x³:', options: ['3x', '3x²', 'x²', '3x³'], correctAnswer: '3x²', difficulty: 'HARD', topic: 'Производные' },
    { question: 'В прямоугольном треугольнике катеты равны 3 и 4. Найдите гипотенузу:', options: ['5', '7', '12', '25'], correctAnswer: '5', difficulty: 'MEDIUM', topic: 'Геометрия' },
  ],
  PHYSICS: [
    { question: 'Какая единица измерения силы в СИ?', options: ['Джоуль', 'Ватт', 'Ньютон', 'Паскаль'], correctAnswer: 'Ньютон', difficulty: 'EASY', topic: 'Механика' },
    { question: 'Формула скорости при равномерном движении:', options: ['v = s/t', 'v = s·t', 'v = t/s', 'v = s + t'], correctAnswer: 'v = s/t', difficulty: 'EASY', topic: 'Механика' },
    { question: 'Чему равно ускорение свободного падения на Земле?', options: ['9.8 м/с²', '10 м/с', '9.8 м/с', '10 м/с²'], correctAnswer: '9.8 м/с²', difficulty: 'EASY', topic: 'Механика' },
    { question: 'Закон Ома для участка цепи:', options: ['I = U/R', 'I = U·R', 'U = I/R', 'R = U·I'], correctAnswer: 'I = U/R', difficulty: 'MEDIUM', topic: 'Электричество' },
    { question: 'Какой тип линз собирает свет?', options: ['Выпуклая', 'Вогнутая', 'Плоская', 'Призма'], correctAnswer: 'Выпуклая', difficulty: 'EASY', topic: 'Оптика' },
    { question: 'Формула кинетической энергии:', options: ['E = mv²/2', 'E = mv', 'E = mgh', 'E = m/v'], correctAnswer: 'E = mv²/2', difficulty: 'MEDIUM', topic: 'Механика' },
    { question: 'Что происходит с объёмом газа при увеличении температуры (при постоянном давлении)?', options: ['Увеличивается', 'Уменьшается', 'Не изменяется', 'Сначала растёт, потом падает'], correctAnswer: 'Увеличивается', difficulty: 'MEDIUM', topic: 'Термодинамика' },
    { question: 'Единица измерения мощности:', options: ['Джоуль', 'Ватт', 'Ньютон', 'Ампер'], correctAnswer: 'Ватт', difficulty: 'EASY', topic: 'Механика' },
    { question: 'Формула работы:', options: ['A = F·s', 'A = F/s', 'A = m·a', 'A = P·t'], correctAnswer: 'A = F·s', difficulty: 'MEDIUM', topic: 'Механика' },
    { question: 'Что такое период колебаний?', options: ['Число колебаний в секунду', 'Время одного полного колебания', 'Максимальное отклонение', 'Скорость колебаний'], correctAnswer: 'Время одного полного колебания', difficulty: 'MEDIUM', topic: 'Колебания' },
  ],
  INFORMATICS: [
    { question: 'Переведите число 10 из десятичной в двоичную систему:', options: ['1010', '1001', '1100', '1000'], correctAnswer: '1010', difficulty: 'EASY', topic: 'Системы счисления' },
    { question: 'Какой оператор используется для логического "И"?', options: ['OR', 'AND', 'NOT', 'XOR'], correctAnswer: 'AND', difficulty: 'EASY', topic: 'Логика' },
    { question: 'Что выведет print(2 + 2 * 2)?', options: ['6', '8', '4', '2'], correctAnswer: '6', difficulty: 'EASY', topic: 'Программирование' },
    { question: 'Какая сложность у алгоритма бинарного поиска?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 'O(log n)', difficulty: 'HARD', topic: 'Алгоритмы' },
    { question: 'Что такое переменная?', options: ['Константа', 'Именованная область памяти', 'Функция', 'Оператор'], correctAnswer: 'Именованная область памяти', difficulty: 'EASY', topic: 'Программирование' },
    { question: 'Результат выражения: NOT (True AND False)', options: ['True', 'False', 'None', 'Error'], correctAnswer: 'True', difficulty: 'MEDIUM', topic: 'Логика' },
    { question: 'Какой тип данных для целых чисел в Python?', options: ['float', 'int', 'str', 'bool'], correctAnswer: 'int', difficulty: 'EASY', topic: 'Программирование' },
    { question: 'Сколько байт в 1 килобайте?', options: ['100', '1000', '1024', '256'], correctAnswer: '1024', difficulty: 'EASY', topic: 'Информация' },
    { question: 'Что делает цикл for?', options: ['Условное выполнение', 'Повторение действий', 'Объявление функции', 'Ввод данных'], correctAnswer: 'Повторение действий', difficulty: 'EASY', topic: 'Программирование' },
    { question: 'Переведите A из 16-ричной в десятичную:', options: ['10', '11', '15', '16'], correctAnswer: '10', difficulty: 'MEDIUM', topic: 'Системы счисления' },
  ],
  BIOLOGY: [
    { question: 'Какая органелла отвечает за синтез белка?', options: ['Митохондрия', 'Рибосома', 'Лизосома', 'Ядро'], correctAnswer: 'Рибосома', difficulty: 'MEDIUM', topic: 'Клетка' },
    { question: 'Сколько хромосом в клетке человека?', options: ['23', '46', '48', '44'], correctAnswer: '46', difficulty: 'EASY', topic: 'Генетика' },
    { question: 'Какой газ выделяется при фотосинтезе?', options: ['CO2', 'O2', 'N2', 'H2'], correctAnswer: 'O2', difficulty: 'EASY', topic: 'Фотосинтез' },
    { question: 'Кто открыл законы наследственности?', options: ['Дарвин', 'Мендель', 'Ламарк', 'Линней'], correctAnswer: 'Мендель', difficulty: 'EASY', topic: 'Генетика' },
    { question: 'Какая кровь течёт по артериям большого круга?', options: ['Венозная', 'Артериальная', 'Смешанная', 'Лимфа'], correctAnswer: 'Артериальная', difficulty: 'MEDIUM', topic: 'Анатомия' },
    { question: 'Что такое ДНК?', options: ['Белок', 'Углевод', 'Нуклеиновая кислота', 'Липид'], correctAnswer: 'Нуклеиновая кислота', difficulty: 'EASY', topic: 'Генетика' },
    { question: 'Какой орган вырабатывает инсулин?', options: ['Печень', 'Почки', 'Поджелудочная железа', 'Селезёнка'], correctAnswer: 'Поджелудочная железа', difficulty: 'MEDIUM', topic: 'Анатомия' },
    { question: 'Что такое экосистема?', options: ['Только животные', 'Только растения', 'Сообщество организмов и среда', 'Только почва'], correctAnswer: 'Сообщество организмов и среда', difficulty: 'EASY', topic: 'Экология' },
    { question: 'Какой процесс противоположен фотосинтезу?', options: ['Дыхание', 'Питание', 'Рост', 'Размножение'], correctAnswer: 'Дыхание', difficulty: 'MEDIUM', topic: 'Фотосинтез' },
    { question: 'Сколько камер в сердце человека?', options: ['2', '3', '4', '5'], correctAnswer: '4', difficulty: 'EASY', topic: 'Анатомия' },
  ],
  HISTORY: [
    { question: 'В каком году было Крещение Руси?', options: ['862', '988', '1054', '1147'], correctAnswer: '988', difficulty: 'EASY', topic: 'Древняя Русь' },
    { question: 'Кто был первым русским царём?', options: ['Иван III', 'Иван IV', 'Пётр I', 'Борис Годунов'], correctAnswer: 'Иван IV', difficulty: 'MEDIUM', topic: 'XVI-XVIII вв' },
    { question: 'В каком году отменили крепостное право?', options: ['1812', '1861', '1905', '1917'], correctAnswer: '1861', difficulty: 'EASY', topic: 'XIX век' },
    { question: 'Когда началась Великая Отечественная война?', options: ['1939', '1940', '1941', '1942'], correctAnswer: '1941', difficulty: 'EASY', topic: 'XX век' },
    { question: 'Кто провёл реформы "сверху" в начале XVIII века?', options: ['Иван Грозный', 'Пётр I', 'Екатерина II', 'Александр II'], correctAnswer: 'Пётр I', difficulty: 'EASY', topic: 'XVI-XVIII вв' },
    { question: 'Что такое "Смутное время"?', options: ['Период реформ', 'Период междоусобиц', 'Кризис начала XVII в.', 'Время правления Ивана Грозного'], correctAnswer: 'Кризис начала XVII в.', difficulty: 'MEDIUM', topic: 'XVI-XVIII вв' },
    { question: 'В каком году образовался СССР?', options: ['1917', '1918', '1922', '1924'], correctAnswer: '1922', difficulty: 'MEDIUM', topic: 'XX век' },
    { question: 'Кто был последним российским императором?', options: ['Александр II', 'Александр III', 'Николай II', 'Николай I'], correctAnswer: 'Николай II', difficulty: 'EASY', topic: 'XX век' },
    { question: 'Что такое "оттепель"?', options: ['Период Сталина', 'Период Хрущёва', 'Период Брежнева', 'Перестройка'], correctAnswer: 'Период Хрущёва', difficulty: 'MEDIUM', topic: 'XX век' },
    { question: 'В каком году распался СССР?', options: ['1989', '1990', '1991', '1993'], correctAnswer: '1991', difficulty: 'EASY', topic: 'XX век' },
  ],
  ENGLISH: [
    { question: 'Choose the correct form: She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], correctAnswer: 'goes', difficulty: 'EASY', topic: 'Grammar' },
    { question: 'What is the past tense of "eat"?', options: ['eated', 'ate', 'eaten', 'eating'], correctAnswer: 'ate', difficulty: 'EASY', topic: 'Grammar' },
    { question: 'Choose the correct article: ___ apple a day keeps the doctor away.', options: ['A', 'An', 'The', 'No article'], correctAnswer: 'An', difficulty: 'EASY', topic: 'Grammar' },
    { question: 'What does "enormous" mean?', options: ['Small', 'Very large', 'Fast', 'Slow'], correctAnswer: 'Very large', difficulty: 'EASY', topic: 'Vocabulary' },
    { question: 'Choose the correct preposition: I am interested ___ music.', options: ['at', 'in', 'on', 'for'], correctAnswer: 'in', difficulty: 'MEDIUM', topic: 'Grammar' },
    { question: 'Which word is a synonym for "happy"?', options: ['Sad', 'Angry', 'Joyful', 'Tired'], correctAnswer: 'Joyful', difficulty: 'EASY', topic: 'Vocabulary' },
    { question: 'Complete: If I ___ rich, I would travel the world.', options: ['am', 'was', 'were', 'be'], correctAnswer: 'were', difficulty: 'MEDIUM', topic: 'Grammar' },
    { question: 'What is the plural of "child"?', options: ['Childs', 'Children', 'Childes', 'Child'], correctAnswer: 'Children', difficulty: 'EASY', topic: 'Grammar' },
    { question: 'Choose the correct form: He has ___ finished his homework.', options: ['already', 'yet', 'still', 'ago'], correctAnswer: 'already', difficulty: 'MEDIUM', topic: 'Grammar' },
    { question: 'What does "occasionally" mean?', options: ['Always', 'Never', 'Sometimes', 'Often'], correctAnswer: 'Sometimes', difficulty: 'MEDIUM', topic: 'Vocabulary' },
  ],
};

export async function seedDiagnosticTests() {
  console.log('Seeding diagnostic tests...');

  for (const [subject, questions] of Object.entries(DIAGNOSTIC_QUESTIONS)) {
    const now = new Date();
    const test = await prisma.test.create({
      data: {
        title: `Диагностика: ${subject}`,
        description: `Входной диагностический тест по предмету ${subject}`,
        subject,
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

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNow = new Date();
      const question = await prisma.question.create({
        data: {
          subject,
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

    console.log(`Created diagnostic test for ${subject}`);
  }

  console.log('Diagnostic tests seeded successfully!');
}
