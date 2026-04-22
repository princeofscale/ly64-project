import { DIRECTION_LABELS, Direction } from '@lyceum64/shared';
import {
  Code,
  Bot,
  Stethoscope,
  Dna,
  Palette,
  ChevronRight,
  BookOpen,
  Target,
  Sparkles,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  Zap,
  Trophy,
  Users,
  FileText,
  Code2,
  Brain,
  PenTool,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getGreetingWithName, getRandomMotivation } from '../utils/greetings';

const DIRECTION_ICONS: Record<Direction, React.ElementType> = {
  [Direction.PROGRAMMING]: Code,
  [Direction.ROBOTICS]: Bot,
  [Direction.MEDICINE]: Stethoscope,
  [Direction.BIOTECHNOLOGY]: Dna,
  [Direction.CULTURE]: Palette,
};

const DIRECTION_COLORS: Record<Direction, { bg: string; icon: string; border: string }> = {
  [Direction.PROGRAMMING]: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-100 hover:border-blue-200',
  },
  [Direction.ROBOTICS]: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    border: 'border-violet-100 hover:border-violet-200',
  },
  [Direction.MEDICINE]: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    border: 'border-rose-100 hover:border-rose-200',
  },
  [Direction.BIOTECHNOLOGY]: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    border: 'border-emerald-100 hover:border-emerald-200',
  },
  [Direction.CULTURE]: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    border: 'border-amber-100 hover:border-amber-200',
  },
};

const FEATURES = [
  {
    icon: Target,
    title: 'Персональный план',
    description: 'Система подстраивается под ваш уровень и темп обучения',
  },
  {
    icon: Zap,
    title: 'Мгновенная проверка',
    description: 'Получайте результаты сразу после выполнения заданий',
  },
  {
    icon: Trophy,
    title: 'Геймификация',
    description: 'Ачивки, рейтинги и мини-игра «Ракетка» с рисковым множителем',
  },
  {
    icon: BookOpen,
    title: 'База заданий',
    description: 'Задачи из реальных экзаменов ОГЭ и вступительных испытаний',
  },
];

const TEAM = [
  {
    name: 'Третьяков Александр',
    role: 'Full-stack разработчик',
    contributions: [
      'Архитектура и backend на Node/Express + Prisma',
      'API, авторизация, база данных',
      'Настройка инфраструктуры проекта',
    ],
    color: 'from-blue-500 via-indigo-500 to-violet-500',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Code2,
    initials: 'ТА',
    photo: null as string | null,
  },
  {
    name: 'Шишкин Александр',
    role: 'Frontend-разработчик',
    contributions: [
      'UI/UX всего приложения',
      'React-компоненты и страницы',
      'Мини-игра «Ракетка» и анимации',
    ],
    color: 'from-violet-500 via-fuchsia-500 to-pink-500',
    iconColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    icon: PenTool,
    initials: 'ША',
    photo: null as string | null,
  },
  {
    name: 'Потапов Сергей',
    role: 'Контент и аналитика',
    contributions: [
      'Наполнение базы заданиями',
      'Система достижений и рейтинги',
      'Тестирование и обратная связь',
    ],
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: Brain,
    initials: 'ПС',
    photo: null as string | null,
  },
];

function HomePage() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  const [stats, setStats] = useState({
    usersCount: 0,
    solvedQuestionsCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        if (response.data.success) {
          setStats({
            usersCount: response.data.data.usersCount,
            solvedQuestionsCount: response.data.data.solvedQuestionsCount,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    void fetchStats();
  }, []);

  const greeting = useMemo(() => getGreetingWithName(user?.name), [user?.name]);
  const motivation = useMemo(() => getRandomMotivation(), []);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-100/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative container-wide py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white border border-slate-200 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-slate-600">
                Учебный проект · 9Р класс · Лицей-интернат №64 · Саратов
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              {isAuthenticated ? (
                greeting
              ) : (
                <>
                  Наш проект для подготовки к{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    экзаменам
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              {isAuthenticated
                ? motivation
                : 'Мы — трое учеников 9Р класса лицея-интерната №64. Сделали платформу для тренировки с заданиями, статистикой и даже собственной мини-игрой «Ракетка».'}
            </p>

            {!isAuthenticated && (
              <p className="text-sm text-slate-500 mb-10 max-w-xl mx-auto">
                Это не официальный сайт лицея — это наш школьный проект. Официальный ресурс —{' '}
                <a
                  href="http://sarli64.ru/schedule/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  sarli64.ru
                </a>
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5"
                  >
                    Попробовать бесплатно
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all"
                  >
                    Войти в аккаунт
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5"
                  >
                    Перейти к обучению
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/games"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all"
                  >
                    <Rocket className="w-5 h-5 text-violet-600" />
                    Мини-игры
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Полностью бесплатно</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Открытый исходный код</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Сделано учениками</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                {stats.usersCount > 0 ? `${stats.usersCount}+` : '500+'}
              </div>
              <div className="text-sm text-slate-500">пользователей</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                {stats.solvedQuestionsCount > 0
                  ? `${stats.solvedQuestionsCount.toLocaleString()}+`
                  : '500+'}
              </div>
              <div className="text-sm text-slate-500">решённых задач</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">3</div>
              <div className="text-sm text-slate-500">разработчика</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">5</div>
              <div className="text-sm text-slate-500">направлений</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
              <Sparkles className="w-4 h-4" />
              Возможности платформы
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Всё для успешной подготовки
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Что мы сделали, чтобы готовиться к экзаменам было удобнее и интереснее
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:border-slate-300 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container-wide">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-violet-50 text-violet-600 text-sm font-medium rounded-full">
              <Users className="w-4 h-4" />
              Команда
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Кто сделал этот проект
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Мы — ученики 9Р класса лицея-интерната №64 г. Саратова. Каждый отвечал за свою часть.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TEAM.map((member, index) => (
              <div
                key={index}
                className="relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all group overflow-hidden"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${member.color}`} />

                <div className="flex flex-col items-center text-center">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-white shadow-lg"
                    />
                  ) : (
                    <div
                      className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center mb-4 ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform`}
                    >
                      <span className="text-2xl font-bold text-white">{member.initials}</span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>

                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 ${member.bgColor} ${member.iconColor} text-xs font-semibold rounded-full mb-4`}
                  >
                    <member.icon className="w-3.5 h-3.5" />
                    {member.role}
                  </div>

                  <ul className="space-y-2 text-left w-full">
                    {member.contributions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className={`w-4 h-4 ${member.iconColor} shrink-0 mt-0.5`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">Фото будут добавлены позже</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-violet-50 text-violet-600 text-sm font-medium rounded-full">
              <BookOpen className="w-4 h-4" />
              Направления
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Поддерживаемые профили
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Платформа охватывает 5 направлений, по которым обучает наш лицей
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(DIRECTION_LABELS).map(([key, label]) => {
              const direction = key as Direction;
              const Icon = DIRECTION_ICONS[direction];
              const colors = DIRECTION_COLORS[direction];

              return (
                <div
                  key={key}
                  className={`p-6 bg-white rounded-2xl border ${colors.border} transition-all hover:shadow-lg group cursor-pointer`}
                >
                  <div
                    className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{label}</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Задания профильного уровня с разбором и статистикой ответов
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium ${colors.icon} group-hover:gap-2 transition-all`}
                  >
                    Подробнее
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full">
              <Target className="w-4 h-4" />
              Как пользоваться
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Три простых шага</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Зарегистрируйтесь',
                description: 'Создайте аккаунт — это бесплатно и займёт меньше минуты',
                icon: Clock,
              },
              {
                step: '02',
                title: 'Решайте задачи',
                description: 'Проходите тесты, смотрите статистику и улучшайте слабые темы',
                icon: BookOpen,
              },
              {
                step: '03',
                title: 'Отдыхайте с «Ракеткой»',
                description: 'Устали от уроков? Попробуйте нашу мини-игру с множителем',
                icon: Rocket,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-slate-200 mb-4">{item.step}</div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl" />
          </div>
          <div className="container-wide relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-white/20 backdrop-blur border border-white/30 rounded-full text-sm font-medium text-white">
                <Star className="w-4 h-4" />
                Попробуйте наш проект
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Готовы попробовать?
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Создайте аккаунт, решайте задачи, собирайте ачивки и пробуйте нашу мини-игру
                «Ракетка»
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-semibold rounded-xl transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
              >
                Создать аккаунт бесплатно
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="py-10 bg-white border-t border-slate-200">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Лицей 64 · Учебный проект</p>
                <p className="text-xs text-slate-500">9Р класс, Лицей-интернат №64, Саратов</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link to="/terms" className="hover:text-slate-700 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Условия
              </Link>
              <span>© 2026 · Сделано учениками</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
