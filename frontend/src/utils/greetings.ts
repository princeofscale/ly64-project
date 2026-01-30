// Извлечение первого имени из полного имени
export function getFirstName(fullName: string | undefined): string {
  if (!fullName) return 'Пользователь';

  // Разбиваем по пробелам и берем первое слово
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || 'Пользователь';
}

const greetings = [
  'Привет',
  'Встречаем тебя',
  'С возвращением',
  'Приветствуем',
  'Добро пожаловать',
  'Здравствуй',
  'Здарова',
];

const motivationalPhrases = [
  'Иди дальше к своей цели!',
  'Продолжай в том же духе!',
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
