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
    color: 'blue',
    subjectKey: 'MATHEMATICS',
  },
  {
    name: 'Физика',
    icon: Atom,
    description: 'Профильный предмет для техн. направлений',
    color: 'violet',
    subjectKey: 'PHYSICS',
  },
  {
    name: 'Информатика',
    icon: Code,
    description: 'Подготовка для программистов',
    color: 'emerald',
    subjectKey: 'INFORMATICS',
  },
  {
    name: 'Биология',
    icon: Dna,
    description: 'Для направлений медицина и биотехнологии',
    color: 'pink',
    subjectKey: 'BIOLOGY',
  },
  {
    name: 'Русский язык',
    icon: BookOpen,
    description: 'Обязательный предмет для всех',
    color: 'amber',
    subjectKey: 'RUSSIAN',
  },
  {
    name: 'История',
    icon: Landmark,
    description: 'Для направления культура',
    color: 'orange',
    subjectKey: 'HISTORY',
  },
];

const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800',
    icon: 'text-violet-600 dark:text-violet-400',
    hover: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800',
    icon: 'text-pink-600 dark:text-pink-400',
    hover: 'hover:border-pink-300 dark:hover:border-pink-700',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:border-amber-300 dark:hover:border-amber-700',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
    hover: 'hover:border-orange-300 dark:hover:border-orange-700',
  },
};

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
        const unlocked = data.achievements.filter((a: any) => a.isUnlocked).slice(0, 3);
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container-wide py-8 lg:py-12">
        {/* Header */}
        <header className="mb-10 animate-fade-in">
          <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
            {isAuthenticated ? (
              `${greeting}!`
            ) : (
              <>
                <Link to="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Войдите
                </Link>
                <span className="text-slate-400"> в систему</span>
              </>
            )}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            {isAuthenticated ? motivation : 'Готовы покорять новые вершины знаний?'}
          </p>
        </header>

        {/* Active Test Banner */}
        <UnfinishedTestBanner onAbandon={() => setHasActiveTest(false)} />

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-10">
          <StatCard
            title="Пройдено тестов"
            value={stats?.totalTests ?? 0}
            icon={BarChart3}
            trend={stats?.totalTests ? '+' + stats.totalTests : undefined}
          />
          <StatCard
            title="Средний балл"
            value={`${(stats?.averageScore ?? 0).toFixed(1)}%`}
            icon={TrendingUp}
          />
          <StatCard
            title="Лучший результат"
            value={`${stats?.bestScore ?? 0}%`}
            icon={Trophy}
            highlight
          />
        </section>

        {/* Leaderboard CTA */}
        <Link
          to="/leaderboard"
          className="group flex items-center justify-between p-5 mb-10 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors animate-fade-in"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">Таблица лидеров</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Соревнуйся с другими учениками
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <section className="mb-10 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Недавние достижения
              </h2>
              <Link
                to="/profile"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
              >
                Смотреть все
                <ChevronRight className="w-4 h-4" />
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

        {/* Subjects Grid */}
        <section className="animate-fade-in">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Начать подготовку
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {hasActiveTest
                ? 'Завершите текущий тест, чтобы начать новый'
                : 'Выберите предмет для тренировки'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUBJECTS.map(subject => (
              <SubjectCard
                key={subject.subjectKey}
                subject={subject}
                disabled={hasActiveTest}
                onClick={() => handleSubjectClick(subject.subjectKey)}
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
  trend?: string;
  highlight?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, highlight }: StatCardProps) {
  return (
    <div
      className={`
      p-5 rounded-xl border transition-shadow
      ${
        highlight
          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }
      shadow-sm hover:shadow-md
    `}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${highlight ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-700'}
        `}
        >
          <Icon
            className={`w-5 h-5 ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
          />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p
        className={`text-2xl font-semibold ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-50'}`}
      >
        {value}
      </p>
    </div>
  );
}

interface SubjectCardProps {
  subject: (typeof SUBJECTS)[0];
  disabled?: boolean;
  onClick: () => void;
}

function SubjectCard({ subject, disabled, onClick }: SubjectCardProps) {
  const Icon = subject.icon;
  const colors = COLOR_CLASSES[subject.color as keyof typeof COLOR_CLASSES];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left p-5 rounded-xl border transition-all duration-200
        ${colors.bg} ${colors.border} ${!disabled && colors.hover}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
        group
      `}
    >
      <div
        className={`
        w-11 h-11 rounded-lg flex items-center justify-center mb-4
        bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/5
      `}
      >
        <Icon className={`w-5 h-5 ${colors.icon}`} />
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">{subject.name}</h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
        {subject.description}
      </p>

      <span
        className={`
        text-sm font-medium ${colors.icon}
        inline-flex items-center gap-1
        ${!disabled && 'group-hover:gap-2'} transition-all
      `}
      >
        {disabled ? 'Недоступно' : 'Начать'}
        {!disabled && <ChevronRight className="w-4 h-4" />}
      </span>
    </button>
  );
}
