/**
 * HomePage - Modern, minimalist education platform landing page
 * Inspired by Duolingo, Khan Academy, and Coursera
 * Features: Glassmorphism, smooth animations, responsive design
 */

import { LYCEUM_INFO, DIRECTION_LABELS, Direction } from '@lyceum64/shared';
import {
  Code,
  Bot,
  Stethoscope,
  Dna,
  Palette,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Trophy,
  BookOpen,
  Target,
  Sparkles,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import { getGreetingWithName, getRandomMotivation } from '../utils/greetings';
import {
  pageVariants,
  cardVariants,
  staggerContainer,
  fadeInVariants,
  scalePopVariants,
} from '@/utils/animations';

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
    description: 'Адаптивная система подстраивается под ваш уровень и темп обучения',
  },
  {
    icon: Zap,
    title: 'Мгновенная проверка',
    description: 'Получайте результаты сразу после выполнения заданий',
  },
  {
    icon: Trophy,
    title: 'Геймификация',
    description: 'Зарабатывайте достижения и соревнуйтесь в рейтинге',
  },
  {
    icon: BookOpen,
    title: 'База заданий',
    description: 'Тысячи задач из реальных экзаменов ОГЭ и ЕГЭ',
  },
];

const STATS = [
  { value: '500+', label: 'учеников' },
  { value: '10 000+', label: 'решённых задач' },
  { value: '95%', label: 'поступают' },
  { value: '5', label: 'направлений' },
];

function HomePage() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

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
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-600">
                Приём заявок на 2025-2026 учебный год открыт
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              {isAuthenticated ? (
                greeting
              ) : (
                <>
                  Подготовка к поступлению в{' '}
                  <span className="text-blue-600">Лицей-интернат №64</span>
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {isAuthenticated
                ? motivation
                : 'Интерактивная платформа с заданиями из реальных экзаменов, персональным планом обучения и аналитикой прогресса'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                  >
                    Начать подготовку бесплатно
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
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                  >
                    Перейти к обучению
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all"
                  >
                    Мой профиль
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Бесплатный доступ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Без регистрации по SMS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Официальная платформа лицея</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
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
              Современные инструменты и методики, которые помогут вам достичь высоких результатов
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

      <section className="py-20 bg-slate-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-violet-50 text-violet-600 text-sm font-medium rounded-full">
              <GraduationCap className="w-4 h-4" />
              Направления обучения
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Выберите свой путь
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Лицей предлагает 5 профильных направлений для всестороннего развития
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
                    Углублённое изучение профильных предметов и подготовка к олимпиадам
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

      <section className="py-20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full">
              <Target className="w-4 h-4" />
              Как это работает
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Простой путь к поступлению
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Тренеруйтесь',
                description: 'Определите свой текущий уровень знаний по каждому предмету',
                icon: Clock,
              },
              {
                step: '02',
                title: 'Следуйте плану',
                description: 'Система составит персональный план подготовки под ваши цели',
                icon: BookOpen,
              },
              {
                step: '03',
                title: 'Поступите в лицей',
                description: 'Сдайте вступительные экзамены с высокими баллами',
                icon: Star,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-slate-100 mb-4">{item.step}</div>
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
        <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Готовы начать подготовку?
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Присоединяйтесь к сотням учеников, которые уже готовятся к поступлению
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 font-semibold rounded-xl transition-all shadow-lg"
              >
                Создать аккаунт бесплатно
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-slate-50">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
                <Phone className="w-4 h-4" />
                Контакты
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Свяжитесь с нами</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Адрес</p>
                    <p className="text-slate-600">{LYCEUM_INFO.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Телефон</p>
                    <p className="text-slate-600">{LYCEUM_INFO.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-slate-600">{LYCEUM_INFO.email}</p>
                  </div>
                </div>

                <a
                  href={LYCEUM_INFO.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Официальный сайт лицея
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Admission Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-amber-50 text-amber-600 text-sm font-medium rounded-full">
                <Calendar className="w-4 h-4" />
                Приёмная кампания
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Сроки приёма</h2>

              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Приём документов</span>
                    <span className="font-semibold text-slate-900">
                      {LYCEUM_INFO.admissionPeriod.documentSubmission}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Вступительные экзамены</span>
                    <span className="font-semibold text-slate-900">
                      {LYCEUM_INFO.admissionPeriod.exams}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-600">Объявление результатов</span>
                    <span className="font-semibold text-slate-900">Июль 2025</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Приём в 8-10 классы</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Для поступления необходимо сдать экзамены по профильным предметам
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Лицей-интернат №64</p>
                <p className="text-sm text-slate-500">г. Саратов</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link to="/terms" className="hover:text-slate-700">
                Условия использования
              </Link>
              <span>© 2025 Все права защищены</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
