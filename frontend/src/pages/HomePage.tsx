import { LYCEUM_INFO, DIRECTION_LABELS, Direction } from '@lyceum64/shared';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState, useMemo } from 'react';
import { getGreetingWithName, getRandomMotivation } from '../utils/greetings';

function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Фиксируем приветствие и мотивацию при первом рендере
  const greeting = useMemo(() => getGreetingWithName(user?.name), [user?.name]);
  const motivation = useMemo(() => getRandomMotivation(), []);

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden">
      {/* Статичный градиент вместо динамического */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-30 gpu-accelerated" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20 gpu-accelerated" />

      {/* Уменьшили blur со 120px до 80px для производительности */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[80px] animate-pulse gpu-accelerated" style={{ willChange: 'opacity' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[80px] animate-pulse gpu-accelerated" style={{ animationDelay: '1s', willChange: 'opacity' }} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-mono font-medium backdrop-blur-sm">
              {LYCEUM_INFO.name}
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            {isAuthenticated ? greeting : 'Будущее начинается здесь'}
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-gray-400 font-sans leading-relaxed">
            {isAuthenticated
              ? motivation
              : 'Интерактивная платформа нового поколения для подготовки к поступлению'
            }
          </p>

          {!isAuthenticated && (
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-display font-semibold overflow-hidden transition-[transform,box-shadow] duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] gpu-accelerated"
                style={{ willChange: 'transform' }}
              >
                <span className="relative z-10">Начать подготовку</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-cyan-500/50 text-cyan-400 rounded-xl font-display font-semibold hover:bg-cyan-500/10 hover:border-cyan-400 transition-[transform,background-color,border-color,box-shadow] duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] gpu-accelerated"
                style={{ willChange: 'transform' }}
              >
                Войти в систему
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link
                to="/dashboard"
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-display font-semibold overflow-hidden transition-[transform,box-shadow] duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] gpu-accelerated"
                style={{ willChange: 'transform' }}
              >
                <span className="relative z-10">Панель управления</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                to="/profile"
                className="px-8 py-4 border-2 border-cyan-500/50 text-cyan-400 rounded-xl font-display font-semibold hover:bg-cyan-500/10 hover:border-cyan-400 transition-[transform,background-color,border-color,box-shadow] duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] gpu-accelerated"
                style={{ willChange: 'transform' }}
              >
                Личный кабинет
              </Link>
            </div>
          )}
        </div>

        <div className="mt-24">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4 text-white">
            Направления обучения
          </h2>
          <p className="text-center text-gray-400 text-lg mb-12 font-sans">Выбери свой путь к успеху</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(DIRECTION_LABELS).map(([key, label], index) => (
              <DirectionCard
                key={key}
                direction={key as Direction}
                label={label}
                description={getDirectionDescription(key as Direction)}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-[border-color,box-shadow] duration-500 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)] contain-layout gpu-accelerated">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-2xl font-display font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" style={{ willChange: 'opacity' }} />
                Контакты
              </h3>
              <div className="space-y-3 text-gray-300">
                <p className="flex items-center">
                  <span className="text-cyan-400 font-mono mr-3">📞</span>
                  <span className="font-sans">{LYCEUM_INFO.phone}</span>
                </p>
                <p className="flex items-center">
                  <span className="text-cyan-400 font-mono mr-3">✉️</span>
                  <span className="font-sans">{LYCEUM_INFO.email}</span>
                </p>
                <a
                  href={LYCEUM_INFO.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                >
                  <span className="mr-3">🌐</span>
                  <span className="font-sans border-b border-cyan-400/0 group-hover/link:border-cyan-400/100 transition-[border-color]">
                    Официальный сайт
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-[border-color,box-shadow] duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] contain-layout gpu-accelerated">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-2xl font-display font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.5s', willChange: 'opacity' }} />
                Сроки приема
              </h3>
              <div className="space-y-3 text-gray-300">
                <p className="flex items-start">
                  <span className="text-purple-400 font-mono mr-3 mt-1">📄</span>
                  <span className="font-sans">
                    <span className="text-gray-400 text-sm block">Прием документов</span>
                    {LYCEUM_INFO.admissionPeriod.documentSubmission}
                  </span>
                </p>
                <p className="flex items-start">
                  <span className="text-purple-400 font-mono mr-3 mt-1">📝</span>
                  <span className="font-sans">
                    <span className="text-gray-400 text-sm block">Экзамены</span>
                    {LYCEUM_INFO.admissionPeriod.exams}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface DirectionCardProps {
  direction: Direction;
  label: string;
  description: string;
  index: number;
}

function DirectionCard({ label, description, index }: DirectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const icons = ['💻', '🤖', '🏥', '🧬', '🎨'];
  const gradients = [
    'from-cyan-500/20 to-blue-500/20',
    'from-blue-500/20 to-purple-500/20',
    'from-purple-500/20 to-pink-500/20',
    'from-pink-500/20 to-red-500/20',
    'from-red-500/20 to-orange-500/20',
  ];
  const borderGradients = [
    'from-cyan-500/50 to-blue-500/50',
    'from-blue-500/50 to-purple-500/50',
    'from-purple-500/50 to-pink-500/50',
    'from-pink-500/50 to-red-500/50',
    'from-red-500/50 to-orange-500/50',
  ];

  return (
    <div
      className="group relative contain-layout"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${borderGradients[index]} rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500`} />

      <div className={`relative bg-gradient-to-br ${gradients[index]} border border-gray-700/50 rounded-2xl p-8 transition-[border-color] duration-500 group-hover:border-transparent gpu-accelerated`}>
        <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        <div className="relative z-10">
          <div className="text-5xl mb-4 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 gpu-accelerated" style={{ willChange: 'transform' }}>
            {icons[index]}
          </div>

          <h3 className="text-2xl font-display font-bold text-white mb-3">
            {label}
          </h3>

          <p className="text-gray-400 font-sans leading-relaxed">
            {description}
          </p>

          <div className={`mt-6 flex items-center text-cyan-400 font-sans font-medium transition-transform duration-300 gpu-accelerated ${isHovered ? 'translate-x-2' : ''}`} style={{ willChange: 'transform' }}>
            <span>Узнать больше</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDirectionDescription(direction: Direction): string {
  const descriptions: Record<Direction, string> = {
    [Direction.PROGRAMMING]: 'Углубленное изучение программирования и информатики',
    [Direction.ROBOTICS]: 'Робототехника и автоматизация',
    [Direction.MEDICINE]: 'Медицинские технологии будущего',
    [Direction.BIOTECHNOLOGY]: 'Биотехнологии и генетика',
    [Direction.CULTURE]: 'Культура и искусство',
  };
  return descriptions[direction];
}

export default HomePage;
