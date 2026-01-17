import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AchievementCard } from '../components/AchievementCard';
import { Achievement } from '@lyceum64/shared';
import { useAuthStore } from '../store/authStore';

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
  const { isAuthenticated, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = useAuthStore.getState().token;

      // Load stats
      const statsRes = await fetch('http://localhost:3001/api/users/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // Load achievements
      const achievementsRes = await fetch('http://localhost:3001/api/users/achievements', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAuthenticated ? (
              <>
                Привет, {user?.name || 'Пользователь'}!
              </>
            ) : (
              <>
                <Link to="/login" className="text-blue-600 hover:underline">Войдите</Link> <span className="text-gray-600">в систему</span>
              </>
            )}
          </h1>
          <p className="text-gray-600 mt-2">Готовы к подготовке?</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Пройдено тестов</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalTests || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Средний балл</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : '0%'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Лучший результат</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.bestScore ? `${stats.bestScore}%` : '0%'}
            </p>
          </div>
        </div>

        {/* Recent achievements */}
        {recentAchievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Недавние достижения</h2>
              <Link to="/profile" className="text-blue-600 hover:underline text-sm">
                Смотреть все →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={true}
                  unlockedAt={achievement.unlockedAt}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Начать подготовку</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/tests"
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">📝 Тесты по математике</h3>
              <p className="text-sm text-gray-600">Подготовка к вступительным экзаменам</p>
            </Link>

            <Link
              to="/tests"
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">🔬 Тесты по физике</h3>
              <p className="text-sm text-gray-600">Профильный предмет для техн. направлений</p>
            </Link>

            <Link
              to="/tests"
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">💻 Тесты по информатике</h3>
              <p className="text-sm text-gray-600">Подготовка для программистов</p>
            </Link>

            <Link
              to="/tests"
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">🧬 Тесты по биологии</h3>
              <p className="text-sm text-gray-600">Для направлений медицина и биотехнологии</p>
            </Link>

            <Link
              to="/tests"
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">📖 Тесты по русскому</h3>
              <p className="text-sm text-gray-600">Обязательный предмет для всех</p>
            </Link>

            <Link
              to="/tests"
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">🏛️ Тесты по истории</h3>
              <p className="text-sm text-gray-600">Для направления культура</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
