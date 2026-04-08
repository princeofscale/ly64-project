const MOTIVATIONS = [
  'Готовы покорять новые вершины знаний?',
  'Каждый день — шаг к мечте!',
  'Твои знания — твоя сила. Продолжай!',
  'Сегодня лучше, чем вчера.',
  'Успех приходит к тем, кто учится каждый день.',
];

export function getGreetingWithName(name?: string): string {
  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 6) greeting = 'Доброй ночи';
  else if (hour < 12) greeting = 'Доброе утро';
  else if (hour < 18) greeting = 'Добрый день';
  else greeting = 'Добрый вечер';
  return name ? `${greeting}, ${name}!` : `${greeting}!`;
}

export function getRandomMotivation(): string {
  return MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
}
