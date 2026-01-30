// Извлечение первого имени из полного имени
export function getFirstName(fullName: string | undefined): string {
  if (!fullName) return 'Пользователь';

  // Разбиваем по пробелам и берем первое слово
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || 'Пользователь';
}

// Массив случайных приветствий
const greetings = [
  'Привет',
  'Рады видеть тебя',
  'С возвращением',
  'Приветствуем',
  'Добро пожаловать',
  'Здравствуй',
  'Хэй',
  'Снова здесь',
  'Отлично, что ты здесь',
];

// Мотивационные фразы
const motivationalPhrases = [
  'Продолжай свой путь к вершинам знаний',
  'Каждый шаг приближает тебя к успеху',
  'Знания - твоя суперсила',
  'Сегодня ты станешь лучше, чем вчера',
  'Готовься покорять новые высоты',
  'Твоё будущее начинается прямо сейчас',
  'Учись с удовольствием, побеждай с уверенностью',
  'Путь к мечте начинается с первого шага',
  'Твой потенциал безграничен',
  'Стремись к знаниям, достигай целей',
];

// Получение случайного приветствия
export function getRandomGreeting(): string {
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// Получение случайной мотивационной фразы
export function getRandomMotivation(): string {
  return motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
}

// Полное приветствие с именем
export function getGreetingWithName(fullName: string | undefined): string {
  const firstName = getFirstName(fullName);
  const greeting = getRandomGreeting();
  return `${greeting}, ${firstName}`;
}
