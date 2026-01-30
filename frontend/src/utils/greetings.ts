export function getFirstName(fullName: string | undefined): string {
  if (!fullName) return 'Пользователь';

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
  'Иди дальше к своей цели',
  'Продолжай в том же духе',
  'Мы в тебя верим'
];

export function getRandomGreeting(): string {
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export function getRandomMotivation(): string {
  return motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
}

export function getGreetingWithName(fullName: string | undefined): string {
  const firstName = getFirstName(fullName);
  const greeting = getRandomGreeting();
  return `${greeting}, ${firstName}`;
}
