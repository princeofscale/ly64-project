import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AchievementCard } from '../components/AchievementCard';
import { UnfinishedTestBanner } from '../components/UnfinishedTestBanner';
import { Achievement } from '@lyceum64/shared';
import { useAuthStore } from '../store/authStore';
import { getActiveTestService } from '../core/services';
import toast from 'react-hot-toast';
import { getGreetingWithName, getRandomMotivation } from '../utils/greetings';

interface DashboardStats {
  totalTests: number;
  averageScore: number;
  bestScore: number;
}

interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({ totalTests: 0, averageScore: 0, bestScore: 0 });
  const [hasActiveTest, setHasActiveTest] = useState(false);

  // Фиксируем приветствие и мотивацию при первом рендере
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

  useEffect(() => {
    if (stats) {
      const duration = 1000;
      const steps = 20; // Уменьшено с 30 до 20 для производительности
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAnimatedStats({
          totalTests: Math.floor(stats.totalTests * easeOutQuart),
          averageScore: stats.averageScore * easeOutQuart,
          bestScore: Math.floor(stats.bestScore * easeOutQuart),
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedStats(stats);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [stats]);

  const loadDashboardData = async () => {
    try {
      const token = useAuthStore.getState().token;

      const statsRes = await fetch('/api/users/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      const achievementsRes = await fetch('/api/users/achievements', {
        headers: { 'Authorization': `Bearer ${token}` },
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
      <div className="min-h-screen bg-gray-950 dark:bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
      </div>
    );
  }

  const subjects = [
    { name: 'Тесты по математике', icon: '🔢', description: 'Подготовка к вступительным экзаменам', color: 'from-cyan-500 to-blue-500', subjectKey: 'MATHEMATICS' },
    { name: 'Тесты по физике', icon: '⚛️', description: 'Профильный предмет для техн. направлений', color: 'from-blue-500 to-purple-500', subjectKey: 'PHYSICS' },
    { name: 'Тесты по информатике', icon: '💻', description: 'Подготовка для программистов', color: 'from-purple-500 to-pink-500', subjectKey: 'INFORMATICS' },
    { name: 'Тесты по биологии', icon: '🧬', description: 'Для направлений медицина и биотехнологии', color: 'from-pink-500 to-red-500', subjectKey: 'BIOLOGY' },
    { name: 'Тесты по русскому', icon: '📖', description: 'Обязательный предмет для всех', color: 'from-red-500 to-orange-500', subjectKey: 'RUSSIAN' },
    { name: 'Тесты по истории', icon: '🏛️', description: 'Для направления культура', color: 'from-orange-500 to-yellow-500', subjectKey: 'HISTORY' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20 gpu-accelerated" />

      {/* Уменьшили blur со 120px до 80px для производительности */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-[80px] animate-pulse gpu-accelerated" style={{ willChange: 'opacity' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/15 rounded-full blur-[80px] animate-pulse gpu-accelerated" style={{ animationDelay: '1s', willChange: 'opacity' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            {isAuthenticated ? (
              `${greeting}!`
            ) : (
              <>
                <Link to="/login" className="hover:from-cyan-300 hover:via-blue-300 hover:to-purple-300 transition-all">Войдите</Link>
                <span className="text-gray-600"> в систему</span>
              </>
            )}
          </h1>
          <p className="text-xl text-gray-400 font-sans">{isAuthenticated ? motivation : 'Готовы покорять новые вершины знаний?'}</p>
        </div>

        <UnfinishedTestBanner onAbandon={() => setHasActiveTest(false)} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            title="Пройдено тестов"
            value={animatedStats.totalTests}
            icon="📊"
            color="from-cyan-500 to-blue-500"
            delay="0ms"
          />
          <StatCard
            title="Средний балл"
            value={`${animatedStats.averageScore.toFixed(1)}%`}
            icon="⭐"
            color="from-blue-500 to-purple-500"
            delay="100ms"
          />
          <StatCard
            title="Лучший результат"
            value={`${animatedStats.bestScore}%`}
            icon="🏆"
            color="from-purple-500 to-pink-500"
            delay="200ms"
          />
        </div>

        <div className="mb-12 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <Link
            to="/leaderboard"
            className="group block bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
                  🏆
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                    Таблица лидеров
                  </h3>
                  <p className="text-gray-400 text-sm">Соревнуйся с другими учениками и попади в топ!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="text-sm font-medium">Перейти</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {recentAchievements.length > 0 && (
          <div className="mb-12 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-display font-bold text-white flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                Недавние достижения
              </h2>
              <Link
                to="/profile"
                className="text-cyan-400 hover:text-cyan-300 font-sans font-medium flex items-center group transition-colors"
              >
                Смотреть все
                <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentAchievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AchievementCard
                    achievement={achievement}
                    isUnlocked={true}
                    unlockedAt={achievement.unlockedAt}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-display font-bold text-white flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.5s' }} />
                Начать подготовку
              </h2>
              <p className="text-gray-400 font-sans mt-2">
                {hasActiveTest ? 'Завершите текущий тест, чтобы начать новый' : 'Выберите предмет для тренировки'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject.name}
                subject={subject}
                index={index}
                disabled={hasActiveTest}
                onClick={() => handleSubjectClick(subject.subjectKey)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  delay: string;
}

function StatCard({ title, value, icon, color, delay }: StatCardProps) {
  return (
    <div
      className="group relative animate-scale-in"
      style={{ animationDelay: delay }}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500`} />

      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transition-all duration-500 group-hover:border-transparent">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{icon}</div>
          <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
        </div>

        <h3 className="text-sm font-sans font-medium text-gray-400 mb-2">{title}</h3>
        <p className={`text-4xl font-display font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface SubjectCardProps {
  subject: {
    name: string;
    icon: string;
    description: string;
    color: string;
    subjectKey: string;
  };
  index: number;
  disabled?: boolean;
  onClick: () => void;
}

function SubjectCard({ subject, index, disabled, onClick }: SubjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer ${disabled ? 'opacity-50' : ''}`}
    >
      <div
        className="group relative h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${subject.color} rounded-2xl opacity-0 ${!disabled && 'group-hover:opacity-100'} blur transition-all duration-500`} />

        <div className="relative h-full bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transition-all duration-500 group-hover:border-transparent">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className={`text-4xl mb-4 transform transition-transform duration-500 ${!disabled && 'group-hover:scale-110 group-hover:rotate-12'}`}>
              {subject.icon}
            </div>

            <h3 className="font-display font-semibold text-xl mb-2 text-white">
              {subject.name}
            </h3>

            <p className="text-gray-400 font-sans text-sm leading-relaxed mb-4">
              {subject.description}
            </p>

            <div className={`flex items-center font-sans font-medium bg-gradient-to-r ${subject.color} bg-clip-text text-transparent transition-all duration-300 ${isHovered && !disabled ? 'translate-x-2' : ''}`}>
              <span>{disabled ? 'Заблокировано' : 'Начать →'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
