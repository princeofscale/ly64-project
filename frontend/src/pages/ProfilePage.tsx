import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { AchievementCard } from '../components/AchievementCard';
import { useAuthStore } from '../store/authStore';

import type {
  Achievement,
  CURRENT_GRADE_LABELS,
  USER_STATUS_LABELS,
  DIRECTION_LABELS,
} from '@lyceum64/shared';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  status: 'STUDENT' | 'APPLICANT';
  currentGrade: number;
  desiredDirection?: string;
  motivation?: string;
  authProvider: 'EMAIL';
  avatar?: string;
  bio?: string;
  isPublic: boolean;
  createdAt: string;
}

interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: Date;
}

interface RecentAttempt {
  id: string;
  testId: string;
  subject: string;
  score: number;
  completedAt: string;
}

interface DailyActivity {
  date: string;
  count: number;
  avgScore: number;
}

interface TimeHeatmap {
  hour: number;
  avgScore: number;
  testCount: number;
}

interface WeakTopic {
  topic: string;
  subject: string;
  avgScore: number;
  totalAttempts: number;
}

interface UserStats {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  recentAttempts?: RecentAttempt[];
  dailyActivity?: DailyActivity[];
  totalTimeSpent?: number;
  currentStreak?: number;
  longestStreak?: number;
  favoriteSubject?: string;
  weeklyProgress?: number;
  timeHeatmap?: TimeHeatmap[];
  platformAverage?: number;
  predictedScore?: number;
  predictionConfidence?: number;
  predictionFactors?: string[];
  weakTopics?: WeakTopic[];
  percentile?: number;
  usersBeaten?: number;
  totalUsers?: number;
  userRank?: number;
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  'https://api.dicebear.com/7.x/bottts/svg?seed=1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=4',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=1',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=2',
];

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    isPublic: true,
  });

  useEffect(() => {
    loadProfile();
    loadAchievements();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const token = useAuthStore.getState().token;

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditForm({
          name: data.name || '',
          bio: data.bio || '',
          isPublic: data.isPublic ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

      const response = await fetch('/api/users/achievements', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadStats = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

      const response = await fetch('/api/users/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsEditing(false);
        toast.success('Профиль обновлён');
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

      const response = await fetch('/api/users/avatar', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      if (response.ok) {
        setUser(prev => (prev ? { ...prev, avatar: avatarUrl } : null));
        setShowAvatarPicker(false);
        toast.success('Аватар обновлён');
      }
    } catch (error) {
      toast.error('Ошибка обновления аватара');
    }
  };

  const handleCustomAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 5MB');
      return;
    }

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Конвертация в base64
      const reader = new FileReader();
      reader.onload = async event => {
        const base64String = event.target?.result as string;

        const token = useAuthStore.getState().token;
        if (!token) return;

        const response = await fetch('/api/users/avatar', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatar: base64String }),
        });

        if (response.ok) {
          setUser(prev => (prev ? { ...prev, avatar: base64String } : null));
          setShowAvatarPicker(false);
          setShowCustomUpload(false);
          toast.success('Аватар загружен');
        } else {
          toast.error('Ошибка загрузки');
        }
        setUploadingAvatar(false);
      };

      reader.onerror = () => {
        toast.error('Ошибка чтения файла');
        setUploadingAvatar(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Ошибка загрузки аватара');
      setUploadingAvatar(false);
    }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/profiles/${user?.username}`;
    navigator.clipboard.writeText(link);
    toast.success('Ссылка скопирована');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Профиль не найден</div>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      MATHEMATICS: 'Математика',
      PHYSICS: 'Физика',
      INFORMATICS: 'Информатика',
      RUSSIAN: 'Русский язык',
      HISTORY: 'История',
      BIOLOGY: 'Биология',
    };
    return labels[subject] || subject;
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20" />

          <div className="px-8 pb-8">
            <div className="flex flex-col gap-6 -mt-16">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="relative group flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl bg-gray-800 border-4 border-gray-900 overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center"
                  >
                    <span className="text-white text-sm">Изменить</span>
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white break-words">
                      {user.name}
                    </h1>
                    {user.isPublic ? (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full whitespace-nowrap">
                        Публичный
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full whitespace-nowrap">
                        Приватный
                      </span>
                    )}
                  </div>
                  <p className="text-cyan-400 font-mono break-all">@{user.username}</p>
                  {user.bio && <p className="text-gray-400 mt-2 break-words">{user.bio}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyProfileLink}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                  </svg>
                  Поделиться
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors"
                >
                  Редактировать
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center group hover:bg-gray-800/70 transition-all">
                <p className="text-3xl font-bold text-cyan-400 group-hover:scale-110 transition-transform">
                  {stats?.totalTests || 0}
                </p>
                <p className="text-sm text-gray-400">Тестов пройдено</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center group hover:bg-gray-800/70 transition-all">
                <p className="text-3xl font-bold text-purple-400 group-hover:scale-110 transition-transform">
                  {stats?.averageScore || 0}%
                </p>
                <p className="text-sm text-gray-400">Средний балл</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center group hover:bg-gray-800/70 transition-all">
                <p className="text-3xl font-bold text-green-400 group-hover:scale-110 transition-transform">
                  {stats?.bestScore || 0}%
                </p>
                <p className="text-sm text-gray-400">Лучший результат</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center group hover:bg-gray-800/70 transition-all">
                <p className="text-3xl font-bold text-amber-400 group-hover:scale-110 transition-transform">
                  {unlockedAchievements.length}
                </p>
                <p className="text-sm text-gray-400">Достижений</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">🔥</span>
                  <p className="text-2xl font-bold text-orange-400">{stats?.currentStreak || 0}</p>
                </div>
                <p className="text-xs text-gray-400">Дней подряд</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">⏱️</span>
                  <p className="text-2xl font-bold text-blue-400">
                    {Math.round((stats?.totalTimeSpent || 0) / 60) || 0}
                  </p>
                </div>
                <p className="text-xs text-gray-400">Минут занятий</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">📈</span>
                  <p className="text-2xl font-bold text-pink-400">+{stats?.weeklyProgress || 0}%</p>
                </div>
                <p className="text-xs text-gray-400">Прогресс</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl">⭐</span>
                  <p className="text-xl font-bold text-green-400">
                    {getSubjectLabel(stats?.favoriteSubject || 'MATHEMATICS')}
                  </p>
                </div>
                <p className="text-xs text-gray-400">Любимый предмет</p>
              </div>
            </div>
          </div>
        </div>

        {stats?.dailyActivity && stats.dailyActivity.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 animate-pulse" />
                Активность за 4 недели
              </h2>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>Меньше</span>
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded ${['bg-gray-800', 'bg-cyan-900/50', 'bg-cyan-700/70', 'bg-cyan-500', 'bg-cyan-400'][i]}`}
                  />
                ))}
                <span>Больше</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stats.dailyActivity.slice(-28).map((day, index) => {
                const intensity = day.count === 0 ? 0 : Math.min(Math.ceil(day.count / 2), 4);
                const colors = [
                  'bg-gray-800',
                  'bg-cyan-900/50',
                  'bg-cyan-700/70',
                  'bg-cyan-500',
                  'bg-cyan-400',
                ];
                return (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-lg ${colors[intensity]} hover:scale-110 transition-all cursor-pointer group relative`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 border border-gray-700 shadow-xl">
                      <div className="font-bold">
                        {new Date(day.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      <div className="text-gray-400">{day.count} тестов</div>
                      {day.avgScore > 0 && (
                        <div
                          className={`${day.avgScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}
                        >
                          {day.avgScore.toFixed(0)}% средний балл
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats?.recentAttempts && stats.recentAttempts.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse" />
              Прогресс по тестам
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.recentAttempts
                    .slice()
                    .reverse()
                    .map((a, i) => ({
                      name: new Date(a.completedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      }),
                      score: a.score,
                      subject: getSubjectLabel(a.subject),
                    }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={value => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      padding: '12px',
                    }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value}%`,
                      props.payload.subject,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Аналитика */}
        <div className="mb-8 space-y-8">
          {/* Тепловая карта времени дня */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span
                className="w-2 h-2 bg-amber-400 rounded-full mr-3 animate-pulse"
                style={{ animationDelay: '0.7s' }}
              />
              🕒 Тепловая карта активности
            </h2>
            <p className="text-gray-400 text-sm mb-6">Ваши лучшие результаты по времени суток</p>

            <div className="grid grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourData = stats?.timeHeatmap?.find(h => h.hour === hour) || {
                  hour,
                  avgScore: 0,
                  testCount: 0,
                };

                const intensity =
                  hourData.testCount === 0
                    ? 0
                    : hourData.avgScore < 60
                      ? 1
                      : hourData.avgScore < 70
                        ? 2
                        : hourData.avgScore < 80
                          ? 3
                          : 4;

                const colors = [
                  'bg-gray-800',
                  'bg-red-900/40',
                  'bg-yellow-700/60',
                  'bg-green-600/70',
                  'bg-green-400',
                ];

                return (
                  <div key={hour} className="text-center">
                    <div
                      className={`aspect-square rounded-lg ${colors[intensity]} hover:scale-110 transition-all cursor-pointer group relative flex items-center justify-center`}
                      title={`${hour}:00 - ${hourData.testCount} тестов, ${hourData.avgScore.toFixed(0)}%`}
                    >
                      <span className="text-xs text-gray-400 font-mono">{hour}</span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 border border-gray-700 shadow-xl">
                        <div className="font-bold">
                          {hour}:00 - {hour + 1}:00
                        </div>
                        <div className="text-gray-400">{hourData.testCount} тестов</div>
                        <div
                          className={`${hourData.avgScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}
                        >
                          {hourData.avgScore.toFixed(0)}% средний балл
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6 text-xs text-gray-400">
              <span>Низкие результаты</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded ${['bg-gray-800', 'bg-red-900/40', 'bg-yellow-700/60', 'bg-green-600/70', 'bg-green-400'][i]}`}
                  />
                ))}
              </div>
              <span>Высокие результаты</span>
            </div>

            {stats?.timeHeatmap &&
              stats.timeHeatmap.length > 0 &&
              (() => {
                const bestHour = stats.timeHeatmap.reduce(
                  (best, curr) => (curr.avgScore > best.avgScore ? curr : best),
                  stats.timeHeatmap[0]
                );

                return bestHour.testCount > 0 ? (
                  <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-cyan-400 font-semibold mb-1">Совет:</p>
                        <p className="text-gray-300 text-sm">
                          Ваши лучшие результаты показаны в {bestHour.hour}:00-{bestHour.hour + 1}
                          :00 ({bestHour.avgScore.toFixed(0)}%). Старайтесь заниматься в это время
                          для максимальной эффективности!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
          </div>

          {/* Сравнение со средним */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span
                className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"
                style={{ animationDelay: '0.9s' }}
              />
              📊 Сравнение с другими пользователями
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-1">
                  #{stats?.userRank || '—'}
                </div>
                <div className="text-gray-400 text-xs">Ваше место</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {stats?.percentile || 0}%
                </div>
                <div className="text-gray-400 text-xs">Перцентиль</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {stats?.usersBeaten || 0}
                </div>
                <div className="text-gray-400 text-xs">Обогнали из {stats?.totalUsers || 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Ваш средний балл</span>
                    <span className="text-2xl font-bold text-cyan-400">
                      {stats?.averageScore || 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${stats?.averageScore || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Средний балл платформы</span>
                    <span className="text-2xl font-bold text-gray-400">
                      {stats?.platformAverage || 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gray-600 to-gray-500 rounded-full"
                      style={{ width: `${stats?.platformAverage || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#1f2937" strokeWidth="12" fill="none" />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#percentileGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${((stats?.percentile || 0) / 100) * 439.8} 439.8`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="percentileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      топ {100 - (stats?.percentile || 0)}%
                    </span>
                    <span className="text-gray-400 text-xs">пользователей</span>
                  </div>
                </div>
              </div>
            </div>

            {(stats?.percentile || 0) >= 70 ? (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-green-400 font-semibold mb-1">Вы в топе!</p>
                    <p className="text-gray-300 text-sm">
                      Вы входите в топ {100 - (stats?.percentile || 0)}% пользователей платформы.
                      Обогнали {stats?.usersBeaten || 0} из {stats?.totalUsers || 0} учеников!
                    </p>
                  </div>
                </div>
              </div>
            ) : (stats?.percentile || 0) >= 40 ? (
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="text-cyan-400 font-semibold mb-1">Хороший результат!</p>
                    <p className="text-gray-300 text-sm">
                      Вы показываете результаты выше среднего. Ещё немного усилий, и вы войдёте в
                      топ!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💪</span>
                  <div>
                    <p className="text-amber-400 font-semibold mb-1">Время для рывка!</p>
                    <p className="text-gray-300 text-sm">
                      Регулярные занятия помогут вам подняться выше. Сфокусируйтесь на слабых темах!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Предсказание баллов */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span
                  className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse"
                  style={{ animationDelay: '1.1s' }}
                />
                🤖 ИИ прогноз результата
              </h2>

              <div className="text-center mb-6">
                <div className="inline-block p-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl border border-pink-500/30">
                  <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stats?.predictedScore || 78}%
                  </div>
                  <p className="text-gray-400 text-sm">Прогноз на экзамен</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400 text-sm">Текущий средний балл</span>
                  <span className="text-white font-semibold">{stats?.averageScore || 0}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400 text-sm">Динамика за неделю</span>
                  <span
                    className={`font-semibold ${(stats?.weeklyProgress || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {(stats?.weeklyProgress || 0) >= 0 ? '+' : ''}
                    {stats?.weeklyProgress || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400 text-sm">Уверенность прогноза</span>
                  <span className="text-cyan-400 font-semibold">
                    {stats?.predictionConfidence || 0}%
                  </span>
                </div>
              </div>

              {stats?.predictionFactors && stats.predictionFactors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {stats.predictionFactors.map((factor, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-400 text-xs"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              )}

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="text-purple-400 font-semibold mb-1">Анализ ИИ</p>
                    <p className="text-gray-300 text-sm">
                      {(stats?.totalTests || 0) < 3
                        ? 'Пройдите ещё несколько тестов для точного прогноза. Минимум 3 теста для анализа.'
                        : `Прогноз основан на ${stats?.totalTests} тестов. При текущей динамике вы можете улучшить результат до ${Math.min(100, (stats?.predictedScore || 0) + 5).toFixed(0)}%!`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Слабые места */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span
                  className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"
                  style={{ animationDelay: '1.3s' }}
                />
                🎯 Темы для улучшения
              </h2>

              <div className="space-y-3 mb-6">
                {stats?.weakTopics && stats.weakTopics.length > 0 ? (
                  stats.weakTopics.slice(0, 5).map((topic, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{topic.topic}</h3>
                          <p className="text-gray-400 text-xs">
                            {getSubjectLabel(topic.subject)} • {topic.totalAttempts} попыток
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              topic.avgScore < 50
                                ? 'text-red-400'
                                : topic.avgScore < 60
                                  ? 'text-orange-400'
                                  : topic.avgScore < 70
                                    ? 'text-yellow-400'
                                    : 'text-green-400'
                            }`}
                          >
                            {topic.avgScore}%
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            topic.avgScore < 50
                              ? 'bg-gradient-to-r from-red-600 to-red-500'
                              : topic.avgScore < 60
                                ? 'bg-gradient-to-r from-orange-600 to-orange-500'
                                : topic.avgScore < 70
                                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500'
                                  : 'bg-gradient-to-r from-green-600 to-green-500'
                          }`}
                          style={{ width: `${topic.avgScore}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>Пройдите несколько тестов, чтобы мы смогли определить темы для улучшения</p>
                  </div>
                )}
              </div>

              {stats?.weakTopics && stats.weakTopics.length > 0 && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                      <p className="text-orange-400 font-semibold mb-1">Рекомендация</p>
                      <p className="text-gray-300 text-sm">
                        Уделите больше внимания этим темам. Решение дополнительных 5-10 задач может
                        повысить ваш балл на 10-15%!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Информация</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Статус</p>
                  <p className="text-white">{USER_STATUS_LABELS[user.status]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Класс</p>
                  <p className="text-white">{CURRENT_GRADE_LABELS[user.currentGrade]}</p>
                </div>
                {user.desiredDirection && (
                  <div>
                    <p className="text-sm text-gray-500">Направление</p>
                    <p className="text-cyan-400">
                      {DIRECTION_LABELS[user.desiredDirection as keyof typeof DIRECTION_LABELS]}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">На платформе с</p>
                  <p className="text-white">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <Link
                  to={`/profiles/${user.username}`}
                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Посмотреть публичный профиль
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Достижения</h2>
                <span className="text-sm text-gray-400">
                  {unlockedAchievements.length} из {achievements.length}
                </span>
              </div>

              {unlockedAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlockedAchievements.slice(0, 6).map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={true}
                      unlockedAt={achievement.unlockedAt}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Пока нет разблокированных достижений
                </p>
              )}

              {achievements.length > 6 && (
                <button className="w-full mt-4 py-3 text-cyan-400 hover:text-cyan-300 transition-colors">
                  Показать все достижения
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAvatarPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Выберите аватар</h3>

            <div className="mb-6">
              <label className="block w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                  id="avatar-upload"
                />
                <div
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="w-full py-4 border-2 border-dashed border-cyan-500/50 rounded-xl hover:border-cyan-500 transition-all cursor-pointer bg-cyan-500/5 hover:bg-cyan-500/10"
                >
                  <div className="text-center">
                    {uploadingAvatar ? (
                      <div className="flex items-center justify-center gap-2 text-cyan-400">
                        <div className="w-5 h-5 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                        <span>Загрузка...</span>
                      </div>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-8 h-8 mx-auto mb-2 text-cyan-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        <p className="text-cyan-400 font-medium">Загрузить свое фото</p>
                        <p className="text-gray-500 text-sm mt-1">PNG, JPG до 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            </div>

            <div className="border-t border-gray-700 pt-4 mb-4">
              <p className="text-gray-400 text-sm mb-3">Или выберите готовый аватар:</p>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {AVATAR_OPTIONS.map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => handleAvatarChange(avatar)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                    user.avatar === avatar ? 'border-cyan-500' : 'border-transparent'
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="w-full py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">Редактировать профиль</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Имя</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">О себе</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  placeholder="Расскажите о себе..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">Публичный профиль</p>
                  <p className="text-sm text-gray-400">Другие смогут видеть ваш профиль</p>
                </div>
                <button
                  onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    editForm.isPublic ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      editForm.isPublic ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
