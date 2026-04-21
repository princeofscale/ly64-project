import {
  BarChart3,
  Trophy,
  ChevronRight,
  Calculator,
  Atom,
  Code,
  Dna,
  BookOpen,
  Landmark,
  Award,
  TrendingUp,
  Sparkles,
  Rocket,
  Flame,
  Target,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import { AchievementCard } from '../components/AchievementCard';
import { UnfinishedTestBanner } from '../components/UnfinishedTestBanner';
import { getActiveTestService } from '../core/services';
import { useAuthStore } from '../store/authStore';
import { getGreetingWithName, getRandomMotivation } from '../utils/greetings';

import type { Achievement } from '@lyceum64/shared';

interface DashboardStats {
  totalTests: number;
  averageScore: number;
  bestScore: number;
}

interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: Date;
}

const SUBJECTS = [
  {
    name: 'Математика',
    icon: Calculator,
    description: 'Подготовка к вступительным экзаменам',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    hover: 'hover:border-blue-400',
    iconColor: 'text-blue-600',
    subjectKey: 'MATHEMATICS',
  },
  {
    name: 'Физика',
    icon: Atom,
    description: 'Профильный предмет для техн. направлений',
    gradient: 'from-violet-500 to-fuchsia-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    hover: 'hover:border-violet-400',
    iconColor: 'text-violet-600',
    subjectKey: 'PHYSICS',
  },
  {
    name: 'Информатика',
    icon: Code,
    description: 'Подготовка для программистов',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hover: 'hover:border-emerald-400',
    iconColor: 'text-emerald-600',
    subjectKey: 'INFORMATICS',
  },
  {
    name: 'Биология',
    icon: Dna,
    description: 'Для направлений медицина и биотехнологии',
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    hover: 'hover:border-pink-400',
    iconColor: 'text-pink-600',
    subjectKey: 'BIOLOGY',
  },
  {
    name: 'Русский язык',
    icon: BookOpen,
    description: 'Обязательный предмет для всех',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    hover: 'hover:border-amber-400',
    iconColor: 'text-amber-600',
    subjectKey: 'RUSSIAN',
  },
  {
    name: 'История',
    icon: Landmark,
    description: 'Для направления культура',
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    hover: 'hover:border-orange-400',
    iconColor: 'text-orange-600',
    subjectKey: 'HISTORY',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveTest, setHasActiveTest] = useState(false);

  const greeting = useMemo(() => getGreetingWithName(user?.name), [user?.name]);
  const motivation = useMemo(() => getRandomMotivation(), []);

  useEffect(() => {
    loadDashboardData();
    checkActiveTest();
  }, []);

  const checkActiveTest = () => {
    const activeTestService = getActiveTestService();
    setHasActiveTest(activeTestService.hasActiveTest());
  };

  const loadDashboardData = async () => {
    try {
      const token = useAuthStore.getState().token;

      const statsRes = await fetch('/api/users/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      const achievementsRes = await fetch('/api/users/achievements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (achievementsRes.ok) {
        const data = await achievementsRes.json();
        const unlocked = data.achievements.filter((a: AchievementWithStatus) => a.isUnlocked).slice(0, 3);
        setRecentAchievements(unlocked);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subjectKey: string) => {
    if (hasActiveTest) {
      toast.error('Сначала завершите текущий тест');
      return;
    }
    navigate(`/test/setup/${subjectKey}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-blue-600 border-r-indigo-600 rounded-full animate-spin" />
          </div>
          <p className="text-slate-600 text-sm font-medium">Загружаем ваши данные…</p>
        </div>
      </div>
    );
  }

  const rutheniumBalance = user?.rutheniumBalance ?? 0;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-fuchsia-200/20 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/2" />

      <div className="container-wide py-8 lg:py-12 relative">
        <header className="mb-10 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-white/60 backdrop-blur border border-slate-200 rounded-full text-xs font-medium text-slate-600 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Добро пожаловать
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold mb-2 tracking-tight">
                {isAuthenticated ? (
                  <>
                    <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                      {greeting}
                    </span>
                    <span className="text-amber-500">!</span>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-blue-600 hover:text-blue-700">
                      Войдите
                    </Link>
                    <span className="text-slate-600"> в систему</span>
                  </>
                )}
              </h1>
              <p className="text-base lg:text-lg text-slate-600 max-w-xl">
                {isAuthenticated ? motivation : 'Готовы покорять новые вершины знаний?'}
              </p>
            </div>

            {isAuthenticated && (
              <Link
                to="/rocket"
                className="group shrink-0 flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-50 font-medium">Баланс</p>
                  <p className="text-lg font-bold text-white tabular-nums leading-tight">
                    {rutheniumBalance.toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })} Ru
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </header>

        <UnfinishedTestBanner onAbandon={() => setHasActiveTest(false)} />

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 mb-10">
          <StatCard
            title="Пройдено тестов"
            value={stats?.totalTests ?? 0}
            icon={BarChart3}
            gradient="from-blue-500 to-indigo-600"
            bgGlow="bg-blue-500/10"
          />
          <StatCard
            title="Средний балл"
            value={`${(stats?.averageScore ?? 0).toFixed(1)}%`}
            icon={TrendingUp}
            gradient="from-emerald-500 to-teal-600"
            bgGlow="bg-emerald-500/10"
          />
          <StatCard
            title="Лучший результат"
            value={`${stats?.bestScore ?? 0}%`}
            icon={Trophy}
            gradient="from-amber-500 to-orange-600"
            bgGlow="bg-amber-500/10"
            highlight
          />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <QuickAction
            to="/leaderboard"
            title="Таблица лидеров"
            subtitle="Соревнуйся с другими"
            icon={Trophy}
            gradient="from-amber-400 via-orange-500 to-red-500"
          />
          <QuickAction
            to="/learning-plan"
            title="План обучения"
            subtitle="Личная траектория"
            icon={Target}
            gradient="from-blue-500 via-indigo-500 to-violet-500"
          />
          <QuickAction
            to="/error-analysis"
            title="Анализ ошибок"
            subtitle="Разбор слабых тем"
            icon={Zap}
            gradient="from-emerald-500 via-teal-500 to-cyan-500"
          />
        </section>

        {recentAchievements.length > 0 && (
          <section className="mb-10 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Недавние достижения</h2>
                  <p className="text-xs text-slate-500">Ваши последние успехи</p>
                </div>
              </div>
              <Link
                to="/profile"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                Все достижения
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={true}
                  unlockedAt={achievement.unlockedAt}
                />
              ))}
            </div>
          </section>
        )}

        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Начать подготовку</h2>
                <p className="text-xs text-slate-500">
                  {hasActiveTest
                    ? 'Завершите текущий тест, чтобы начать новый'
                    : 'Выберите предмет для тренировки'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUBJECTS.map((subject, i) => (
              <SubjectCard
                key={subject.subjectKey}
                subject={subject}
                disabled={hasActiveTest}
                onClick={() => handleSubjectClick(subject.subjectKey)}
                animationDelay={i * 50}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  bgGlow: string;
  highlight?: boolean;
}

function StatCard({ title, value, icon: Icon, gradient, bgGlow, highlight }: StatCardProps) {
  return (
    <div
      className={`relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden group ${
        highlight
          ? 'bg-white/80 backdrop-blur-xl border-amber-200/60 shadow-xl shadow-amber-200/40'
          : 'bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-lg shadow-slate-200/40'
      } hover:shadow-2xl hover:-translate-y-1`}
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${bgGlow} rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="relative flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="relative text-sm text-slate-500 mb-1 font-medium">{title}</p>
      <p className="relative text-3xl lg:text-4xl font-bold text-slate-900 tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

interface QuickActionProps {
  to: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
}

function QuickAction({ to, title, subtitle, icon: Icon, gradient }: QuickActionProps) {
  return (
    <Link
      to={to}
      className="group relative flex items-center gap-4 p-5 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className={`relative shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="relative flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 truncate">{title}</h3>
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      </div>
      <ChevronRight className="relative w-5 h-5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all shrink-0" />
    </Link>
  );
}

interface SubjectCardProps {
  subject: (typeof SUBJECTS)[0];
  disabled?: boolean;
  onClick: () => void;
  animationDelay?: number;
}

function SubjectCard({ subject, disabled, onClick, animationDelay = 0 }: SubjectCardProps) {
  const Icon = subject.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ animationDelay: `${animationDelay}ms` }}
      className={`group relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-xl animate-fade-in ${subject.border} ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : `cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 ${subject.hover}`
      }`}
    >
      <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${subject.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none`} />

      <div className="relative">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center mb-4 shadow-lg ${!disabled && 'group-hover:scale-110 group-hover:-rotate-3'} transition-all`}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        <h3 className="font-bold text-lg text-slate-900 mb-1">{subject.name}</h3>

        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {subject.description}
        </p>

        <span className={`text-sm font-semibold ${subject.iconColor} inline-flex items-center gap-1 ${!disabled && 'group-hover:gap-2'} transition-all`}>
          {disabled ? 'Недоступно' : 'Начать'}
          {!disabled && <ChevronRight className="w-4 h-4" />}
        </span>
      </div>
    </button>
  );
}
