import { motion } from 'framer-motion';
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
  Clock,
  Flame,
  Target,
  Zap,
  Brain,
  Star,
  Play,
  RotateCcw,
  BookMarked,
  Calendar,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import { AchievementCard } from '../components/AchievementCard';
import { AchievementBadge } from '../components/ui/AchievementBadge';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { LevelBadge } from '../components/ui/LevelBadge';
import { ProgressCard } from '../components/ui/ProgressCard';
import { StatCard } from '../components/ui/StatCard';
import { Streak } from '../components/ui/Streak';
import { StreakCalendar } from '../components/ui/StreakCalendar';
import { UnfinishedTestBanner } from '../components/UnfinishedTestBanner';
import { ContentSection } from '../components/layout/ContentSection';
import { GridLayout } from '../components/layout/GridLayout';
import { PageLayout } from '../components/layout/PageLayout';
import { getActiveTestService } from '../core/services';
import { useAuthStore } from '../store/authStore';
import { fadeIn, staggerContainer, slideUp, scaleIn } from '../utils/animations';
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

interface SubjectProgress {
  subject: string;
  progress: number;
  testsCompleted: number;
  averageScore: number;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'test' | 'achievement' | 'milestone';
  title: string;
  description: string;
  timestamp: Date;
  icon: any;
  color: string;
}

interface StudyRecommendation {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  icon: any;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Загрузка панели...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageLayout title="Dashboard">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="container-wide py-8 lg:py-12">
          {/* Active Test Banner */}
          <UnfinishedTestBanner onAbandon={() => setHasActiveTest(false)} />

          {/* Welcome Section */}
          <motion.section
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mb-10"
          >
            <motion.div
              variants={fadeIn}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 p-8 text-white shadow-xl"
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div variants={scaleIn}>
                      <LevelBadge level={userLevel} size="lg" />
                    </motion.div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-1">
                        {isAuthenticated ? (
                          `${greeting}!`
                        ) : (
                          <>
                            <Link to="/login" className="text-white hover:text-blue-200">
                              Войдите
                            </Link>
                            <span className="text-white/70"> в систему</span>
                          </>
                        )}
                      </h1>
                      <p className="text-blue-100 text-lg">
                        {isAuthenticated ? motivation : 'Готовы покорять новые вершины знаний?'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Clock className="w-3 h-3 mr-1" />
                      {timeOfDay}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Target className="w-3 h-3 mr-1" />
                      Уровень {userLevel}
                    </Badge>
                  </div>

                  {/* XP Progress Bar */}
                  <div className="mt-6 max-w-md">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-blue-100">Прогресс до уровня {userLevel + 1}</span>
                      <span className="font-semibold">{userXP}/1000 XP</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(userXP / 1000) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Streak Component */}
                <motion.div variants={slideUp} className="lg:ml-auto">
                  <Streak
                    currentStreak={stats?.currentStreak ?? 0}
                    longestStreak={stats?.longestStreak ?? 0}
                    size="lg"
                  />
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-0" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl -z-0" />
            </motion.div>
          </motion.section>

          {/* Stats Overview */}
          <ContentSection title="Обзор статистики" icon={BarChart3}>
            <GridLayout cols={4}>
              <motion.div variants={fadeIn}>
                <StatCard
                  title="Пройдено тестов"
                  value={stats?.totalTests ?? 0}
                  icon={BarChart3}
                  trend={stats?.testsThisWeek ? `+${stats.testsThisWeek} за неделю` : undefined}
                  color="blue"
                />
              </motion.div>
              <motion.div variants={fadeIn}>
                <StatCard
                  title="Средний балл"
                  value={`${(stats?.averageScore ?? 0).toFixed(1)}%`}
                  icon={TrendingUp}
                  trend={
                    stats?.improvementRate
                      ? `+${stats.improvementRate.toFixed(1)}% улучшение`
                      : undefined
                  }
                  color="emerald"
                />
              </motion.div>
              <motion.div variants={fadeIn}>
                <StatCard
                  title="Время обучения"
                  value={`${stats?.studyTime ?? 0} мин`}
                  icon={Clock}
                  color="violet"
                />
              </motion.div>
              <motion.div variants={fadeIn}>
                <StatCard
                  title="Текущая серия"
                  value={`${stats?.currentStreak ?? 0} дней`}
                  icon={Flame}
                  color="orange"
                  highlight
                />
              </motion.div>
            </GridLayout>
          </ContentSection>

          {/* Progress Section */}
          <ContentSection title="Прогресс по предметам" icon={TrendingUp}>
            <GridLayout cols={2}>
              {subjectProgress.slice(0, 4).map((progress, index) => (
                <motion.div
                  key={progress.subject}
                  variants={fadeIn}
                  custom={index}
                  initial="initial"
                  animate="animate"
                >
                  <ProgressCard
                    title={progress.subject}
                    progress={progress.progress}
                    subtitle={`${progress.testsCompleted} тестов · ${progress.averageScore}% средний балл`}
                    color={progress.color}
                    showAnimation
                  />
                </motion.div>
              ))}
            </GridLayout>
          </ContentSection>

          {/* Recent Activity & Streak Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <ContentSection title="Недавняя активность" icon={Calendar}>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      variants={slideUp}
                      custom={index}
                      initial="initial"
                      animate="animate"
                    >
                      <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div
                            className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            bg-${activity.color}-100 dark:bg-${activity.color}-950/30
                          `}
                          >
                            <activity.icon
                              className={`w-5 h-5 text-${activity.color}-600 dark:text-${activity.color}-400`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                              {activity.description}
                            </p>
                            <span className="text-xs text-slate-400">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ContentSection>
            </div>

            {/* Streak Calendar */}
            <div>
              <ContentSection title="Календарь активности" icon={Flame}>
                <StreakCalendar
                  streakDays={[
                    new Date(),
                    new Date(Date.now() - 86400000),
                    new Date(Date.now() - 2 * 86400000),
                    new Date(Date.now() - 3 * 86400000),
                    new Date(Date.now() - 5 * 86400000),
                  ]}
                />
              </ContentSection>
            </div>
          </div>

          {/* Quick Actions */}
          <ContentSection title="Быстрые действия" icon={Zap}>
            <GridLayout cols={4}>
              <motion.div variants={scaleIn}>
                <Card
                  onClick={() => !hasActiveTest && navigate('/test/setup/MATHEMATICS')}
                  className={`
                    p-6 text-center cursor-pointer hover:shadow-lg transition-all
                    bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30
                    border-2 border-blue-200 dark:border-blue-800
                    ${hasActiveTest ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                  `}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-3">
                    <Play className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                    Начать тест
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Новое испытание</p>
                </Card>
              </motion.div>

              <motion.div variants={scaleIn}>
                <Card
                  onClick={() => navigate('/subjects')}
                  className="p-6 text-center cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                    Продолжить обучение
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Изучайте материалы</p>
                </Card>
              </motion.div>

              <motion.div variants={scaleIn}>
                <Card
                  onClick={() => navigate('/history')}
                  className="p-6 text-center cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/30 border-2 border-violet-200 dark:border-violet-800"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center mx-auto mb-3">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                    Разбор ошибок
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Учитесь на ошибках</p>
                </Card>
              </motion.div>

              <motion.div variants={scaleIn}>
                <Card
                  onClick={() => navigate('/flashcards')}
                  className="p-6 text-center cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 border-2 border-amber-200 dark:border-amber-800"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center mx-auto mb-3">
                    <BookMarked className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">Карточки</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Быстрое повторение</p>
                </Card>
              </motion.div>
            </GridLayout>
          </ContentSection>

          {/* Achievements Showcase */}
          {allAchievements.length > 0 && (
            <ContentSection title="Достижения" icon={Award}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Разблокировано {allAchievements.filter(a => a.isUnlocked).length} из{' '}
                  {allAchievements.length}
                </p>
                <Link
                  to="/profile"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                >
                  Смотреть все
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <GridLayout cols={3}>
                {allAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    variants={scaleIn}
                    custom={index}
                    initial="initial"
                    animate="animate"
                  >
                    <AchievementBadge
                      achievement={achievement}
                      isUnlocked={achievement.isUnlocked}
                      showProgress
                    />
                  </motion.div>
                ))}
              </GridLayout>
            </ContentSection>
          )}

          {/* AI Recommendations */}
          <ContentSection title="Рекомендации для обучения" icon={Brain}>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  variants={slideUp}
                  custom={index}
                  initial="initial"
                  animate="animate"
                >
                  <Card
                    className={`
                    p-5 border-l-4 transition-all hover:shadow-md
                    ${
                      rec.priority === 'high'
                        ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
                        : rec.priority === 'medium'
                          ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
                    }
                  `}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${
                          rec.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-900/50'
                            : rec.priority === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-900/50'
                              : 'bg-green-100 dark:bg-green-900/50'
                        }
                      `}
                      >
                        <rec.icon
                          className={`w-5 h-5 ${
                            rec.priority === 'high'
                              ? 'text-red-600 dark:text-red-400'
                              : rec.priority === 'medium'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-green-600 dark:text-green-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50">
                            {rec.title}
                          </h4>
                          <Badge
                            variant={
                              rec.priority === 'high'
                                ? 'destructive'
                                : rec.priority === 'medium'
                                  ? 'warning'
                                  : 'success'
                            }
                            size="sm"
                          >
                            {rec.priority === 'high'
                              ? 'Срочно'
                              : rec.priority === 'medium'
                                ? 'Средний'
                                : 'Низкий'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          {rec.description}
                        </p>
                        <span className="text-xs text-slate-400">{rec.subject}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ContentSection>

          {/* Leaderboard CTA */}
          <motion.div variants={fadeIn}>
            <Link
              to="/leaderboard"
              className="group relative overflow-hidden flex items-center justify-between p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Таблица лидеров</h3>
                  <p className="text-white/90">
                    Соревнуйтесь с другими учениками и поднимайтесь в рейтинге
                  </p>
                </div>
              </div>
              <ChevronRight className="relative z-10 w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />

              {/* Decorative gradient orbs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl" />
            </Link>
          </motion.div>

          {/* Subject Cards Grid */}
          <ContentSection title="Начать подготовку" icon={BookOpen} className="mt-10">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {hasActiveTest
                ? 'Завершите текущий тест, чтобы начать новый'
                : 'Выберите предмет для тренировки'}
            </p>

            <GridLayout cols={3}>
              {SUBJECTS.map((subject, index) => (
                <motion.div
                  key={subject.subjectKey}
                  variants={fadeIn}
                  custom={index}
                  initial="initial"
                  animate="animate"
                >
                  <SubjectCard
                    subject={subject}
                    disabled={hasActiveTest}
                    onClick={() => handleSubjectClick(subject.subjectKey)}
                  />
                </motion.div>
              ))}
            </GridLayout>
          </ContentSection>
        </div>
      </div>
    </PageLayout>
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

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    violet: 'from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700',
    emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    amber: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`
        relative w-full text-left p-6 rounded-xl overflow-hidden
        transition-all duration-300 group
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg hover:shadow-2xl'}
      `}
    >
      {/* Gradient Background */}
      <div
        className={`
        absolute inset-0 bg-gradient-to-br transition-all duration-300
        ${colorClasses[subject.color as keyof typeof colorClasses]}
      `}
      />

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{subject.name}</h3>

        <p className="text-white/90 text-sm mb-4 line-clamp-2">{subject.description}</p>

        <div
          className={`
          inline-flex items-center gap-1 text-sm font-semibold text-white
          ${!disabled && 'group-hover:gap-2'} transition-all
        `}
        >
          {disabled ? 'Недоступно' : 'Начать'}
          {!disabled && <ChevronRight className="w-4 h-4" />}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full blur-xl" />
    </motion.button>
  );
}
