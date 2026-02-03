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
  studyTime?: number;
  currentStreak?: number;
  longestStreak?: number;
  testsThisWeek?: number;
  improvementRate?: number;
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
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    hover: 'hover:border-blue-300',
  },
  violet: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    icon: 'text-violet-600',
    hover: 'hover:border-violet-300',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    hover: 'hover:border-emerald-300',
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    icon: 'text-pink-600',
    hover: 'hover:border-pink-300',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    hover: 'hover:border-amber-300',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    hover: 'hover:border-orange-300',
  },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<AchievementWithStatus[]>([]);
  const [allAchievements, setAllAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveTest, setHasActiveTest] = useState(false);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);

  const greeting = useMemo(() => getGreetingWithName(user?.name), [user?.name]);
  const motivation = useMemo(() => getRandomMotivation(), []);
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'утра';
    if (hour < 18) return 'дня';
    return 'вечера';
  }, []);

  // Calculate user level based on XP or tests completed
  const userLevel = useMemo(() => {
    const testsCompleted = stats?.totalTests ?? 0;
    return Math.floor(testsCompleted / 10) + 1;
  }, [stats?.totalTests]);

  const userXP = useMemo(() => {
    const testsCompleted = stats?.totalTests ?? 0;
    return (testsCompleted % 10) * 100;
  }, [stats?.totalTests]);

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

      // Load stats
      const statsRes = await fetch('/api/users/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          ...statsData,
          studyTime: Math.floor(Math.random() * 500) + 100, // Mock data
          currentStreak: Math.floor(Math.random() * 30) + 1,
          longestStreak: Math.floor(Math.random() * 50) + 10,
          testsThisWeek: Math.floor(Math.random() * 15) + 1,
          improvementRate: Math.random() * 20 + 5,
        });
      }

      // Load achievements
      const achievementsRes = await fetch('/api/users/achievements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (achievementsRes.ok) {
        const data = await achievementsRes.json();
        const unlocked = data.achievements.filter((a: any) => a.isUnlocked).slice(0, 3);
        setRecentAchievements(unlocked);
        setAllAchievements(data.achievements.slice(0, 6));
      }

      // Generate mock subject progress
      const mockProgress: SubjectProgress[] = SUBJECTS.map(subject => ({
        subject: subject.name,
        progress: Math.floor(Math.random() * 100),
        testsCompleted: Math.floor(Math.random() * 20),
        averageScore: Math.floor(Math.random() * 40) + 60,
        color: subject.color,
      }));
      setSubjectProgress(mockProgress);

      // Generate mock recent activity
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'test',
          title: 'Тест по математике',
          description: 'Завершен с результатом 85%',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: Calculator,
          color: 'blue',
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Достижение разблокировано',
          description: 'Первый шаг - Завершите первый тест',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          icon: Trophy,
          color: 'amber',
        },
        {
          id: '3',
          type: 'milestone',
          title: 'Новый уровень',
          description: 'Достигнут уровень 5',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          icon: Star,
          color: 'violet',
        },
      ];
      setRecentActivity(mockActivity);

      // Generate AI-powered recommendations
      const mockRecommendations: StudyRecommendation[] = [
        {
          id: '1',
          title: 'Повторите интегралы',
          description: 'Низкий процент правильных ответов в последних 3 тестах',
          subject: 'Математика',
          priority: 'high',
          icon: TrendingDown,
        },
        {
          id: '2',
          title: 'Механика требует внимания',
          description: 'Рекомендуем пройти дополнительные задачи',
          subject: 'Физика',
          priority: 'medium',
          icon: AlertCircle,
        },
        {
          id: '3',
          title: 'Отличный прогресс',
          description: 'Продолжайте практиковаться с алгоритмами',
          subject: 'Информатика',
          priority: 'low',
          icon: TrendingUp,
        },
      ];
      setRecommendations(mockRecommendations);
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

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
    return `${Math.floor(seconds / 86400)} д назад`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Decorative blur circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-100/50 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <div className="container-wide py-8 lg:py-12">
        {/* Header */}
        <header className="mb-10 animate-fade-in">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            {isAuthenticated ? (
              `${greeting}!`
            ) : (
              <>
                <Link to="/login" className="text-blue-600 hover:text-blue-700">
                  Войдите
                </Link>
                <span className="text-slate-600"> в систему</span>
              </>
            )}
          </h1>
          <p className="text-lg text-slate-600">
            {isAuthenticated ? motivation : 'Готовы покорять новые вершины знаний?'}
          </p>
        </header>

        <UnfinishedTestBanner onAbandon={() => setHasActiveTest(false)} />

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

        <Link
          to="/leaderboard"
          className="group flex items-center justify-between p-5 mb-10 bg-amber-50 border border-amber-200 rounded-2xl hover:border-amber-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all animate-fade-in"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Таблица лидеров</h3>
              <p className="text-sm text-slate-600">
                Соревнуйся с другими учениками
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        {recentAchievements.length > 0 && (
          <section className="mb-10 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Недавние достижения
              </h2>
              <Link
                to="/profile"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
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

        <section className="animate-fade-in">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Начать подготовку
            </h2>
            <p className="text-sm text-slate-600 mt-1">
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
      p-6 rounded-2xl border transition-all duration-300
      ${
        highlight
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-slate-200'
      }
      shadow-lg hover:shadow-xl hover:-translate-y-1
    `}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${highlight ? 'bg-blue-100' : 'bg-slate-100'}
        `}
        >
          <Icon
            className={`w-6 h-6 ${highlight ? 'text-blue-600' : 'text-slate-600'}`}
          />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600 mb-1">{title}</p>
      <p
        className={`text-3xl font-bold ${highlight ? 'text-blue-600' : 'text-slate-900'}`}
      >
        {value}
      </p>
    </div>
  );
}

// Subject Card Component
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
        w-full text-left p-6 rounded-2xl border-2 transition-all duration-300
        bg-white ${colors.border} ${!disabled && colors.hover}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1'}
        group
      `}
    >
      {/* Gradient Background */}
      <div
        className={`
        w-12 h-12 rounded-xl flex items-center justify-center mb-4
        ${colors.bg}
      `}
      >
        <Icon className={`w-6 h-6 ${colors.icon}`} />
      </div>

      <h3 className="font-semibold text-slate-900 mb-1">{subject.name}</h3>

      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
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
