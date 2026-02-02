import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { PageLayout, ContentSection, GridLayout } from '../components/layout/PageLayout';
import { useAuthStore } from '../store/authStore';

import type { Achievement } from '@lyceum64/shared';

import { CURRENT_GRADE_LABELS, USER_STATUS_LABELS, DIRECTION_LABELS } from '@lyceum64/shared';

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
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
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
      <PageLayout background="pattern">
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout background="pattern">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400 text-lg">Профиль не найден</div>
        </div>
      </PageLayout>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  const filteredAchievements =
    achievementFilter === 'unlocked'
      ? unlockedAchievements
      : achievementFilter === 'locked'
        ? lockedAchievements
        : achievements;

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
    <PageLayout background="pattern" maxWidth="xl" noPadding>
      <div className="relative px-4 sm:px-6 lg:px-8 py-8">
        {/* Gradient Background Blobs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-[120px] -z-10" />
        {/* Profile Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group mb-8"
        >
          {/* Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 dark:shadow-black/20">
            {/* Gradient Header Banner */}
            <div className="h-40 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 dark:from-cyan-500/20 dark:via-purple-500/20 dark:to-pink-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-shimmer" />
            </div>

            <div className="px-6 sm:px-8 pb-8">
              <div className="flex flex-col gap-6 -mt-20">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  {/* Avatar with Gradient Ring */}
                  <motion.div whileHover={{ scale: 1.05 }} className="relative group flex-shrink-0">
                    {/* Gradient Ring */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />

                    {/* Avatar Container */}
                    <div className="relative w-36 h-36 rounded-3xl bg-white dark:bg-slate-900 p-1">
                      <div className="w-full h-full rounded-[1.375rem] overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Edit Overlay */}
                    <button
                      onClick={() => setShowAvatarPicker(true)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-3xl flex items-center justify-center backdrop-blur-sm"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-white text-xs font-medium">Изменить</span>
                      </div>
                    </button>
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white break-words">
                        {user.name}
                      </h1>

                      {/* Level Badge */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg"
                      >
                        Level {Math.floor((stats?.totalTests || 0) / 10) + 1}
                      </motion.div>

                      {user.isPublic ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                          Публичный
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-500/20 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full border border-slate-500/30">
                          Приватный
                        </span>
                      )}
                    </div>

                    <p className="text-cyan-500 dark:text-cyan-400 font-mono text-lg mb-1">
                      @{user.username}
                    </p>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      Участник с{' '}
                      {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>

                    {user.bio && (
                      <p className="text-slate-700 dark:text-slate-300 mt-3 break-words max-w-2xl">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyProfileLink}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-700"
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
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
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
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                    Редактировать
                  </motion.button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 border border-cyan-500/20 dark:border-cyan-500/30 rounded-2xl p-5 text-center backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  <div className="text-4xl font-bold bg-gradient-to-br from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-2">
                    {stats?.totalTests || 0}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Тестов пройдено
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-500/20 dark:border-purple-500/30 rounded-2xl p-5 text-center backdrop-blur-sm shadow-lg hover:shadow-purple-500/20 transition-all"
                >
                  <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                    {stats?.averageScore || 0}%
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Средний балл
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 border border-green-500/20 dark:border-green-500/30 rounded-2xl p-5 text-center backdrop-blur-sm shadow-lg hover:shadow-green-500/20 transition-all"
                >
                  <div className="text-4xl font-bold bg-gradient-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                    {stats?.currentStreak || 0}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Дней подряд 🔥
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl p-5 text-center backdrop-blur-sm shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  <div className="text-4xl font-bold bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                    {Math.round((stats?.totalTimeSpent || 0) / 60) || 0}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Минут занятий
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements Section */}
        <ContentSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  Достижения
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {unlockedAchievements.length} из {achievements.length} разблокировано
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {[
                  { key: 'all', label: 'Все' },
                  { key: 'unlocked', label: 'Открытые' },
                  { key: 'locked', label: 'Закрытые' },
                ].map(filter => (
                  <motion.button
                    key={filter.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAchievementFilter(filter.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      achievementFilter === filter.key
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Achievement Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={achievementFilter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {filteredAchievements.length > 0 ? (
                  <GridLayout cols={3} gap="md">
                    {filteredAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <AchievementCard
                          achievement={achievement}
                          isUnlocked={achievement.isUnlocked}
                          unlockedAt={achievement.unlockedAt}
                        />
                      </motion.div>
                    ))}
                  </GridLayout>
                ) : (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <div className="text-4xl mb-3">🏆</div>
                    <p>Пока нет достижений в этой категории</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Прогресс достижений
                </span>
                <span className="text-sm font-bold text-cyan-500">
                  {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(unlockedAchievements.length / achievements.length) * 100}%`,
                  }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </ContentSection>

        {/* Activity Timeline */}
        {stats?.dailyActivity && stats.dailyActivity.length > 0 && (
          <ContentSection>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    Активность за 4 недели
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Карта ваших тренировок
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Меньше</span>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded ${['bg-slate-200 dark:bg-slate-700', 'bg-cyan-200 dark:bg-cyan-900/50', 'bg-cyan-300 dark:bg-cyan-700/70', 'bg-cyan-400 dark:bg-cyan-500', 'bg-cyan-500 dark:bg-cyan-400'][i]}`}
                    />
                  ))}
                  <span>Больше</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {stats.dailyActivity.slice(-28).map((day, index) => {
                  const intensity = day.count === 0 ? 0 : Math.min(Math.ceil(day.count / 2), 4);
                  const colors = [
                    'bg-slate-200 dark:bg-slate-700',
                    'bg-cyan-200 dark:bg-cyan-900/50',
                    'bg-cyan-300 dark:bg-cyan-700/70',
                    'bg-cyan-400 dark:bg-cyan-500',
                    'bg-cyan-500 dark:bg-cyan-400',
                  ];

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.15 }}
                      className={`w-9 h-9 rounded-xl ${colors[intensity]} cursor-pointer group relative shadow-sm`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl px-4 py-3 whitespace-nowrap z-20 border border-slate-700 shadow-2xl">
                        <div className="font-bold mb-1">
                          {new Date(day.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                        <div className="text-slate-300">{day.count} тестов</div>
                        {day.avgScore > 0 && (
                          <div
                            className={`font-semibold ${day.avgScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}
                          >
                            {day.avgScore.toFixed(0)}% средний балл
                          </div>
                        )}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </ContentSection>
        )}

        {/* Performance Graph */}
        {stats?.recentAttempts && stats.recentAttempts.length > 0 && (
          <ContentSection>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  Прогресс по тестам
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Динамика ваших результатов
                </p>
              </div>

              <div className="h-72">
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
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="currentColor"
                      className="text-slate-500 dark:text-slate-400"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="currentColor"
                      className="text-slate-500 dark:text-slate-400"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      domain={[0, 100]}
                      tickFormatter={value => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(15 23 42)',
                        border: '1px solid rgb(51 65 85)',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value}%`,
                        props.payload.subject,
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </ContentSection>
        )}

        {/* Analytics Section */}
        <ContentSection title="Аналитика" description="Детальная статистика вашей активности">
          <div className="space-y-6">
            {/* Тепловая карта времени дня */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <span className="text-xl">🕒</span>
                  Тепловая карта активности
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ваши лучшие результаты по времени суток
                </p>
              </div>

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
                    'bg-slate-200 dark:bg-slate-700',
                    'bg-red-300 dark:bg-red-900/40',
                    'bg-yellow-300 dark:bg-yellow-700/60',
                    'bg-green-300 dark:bg-green-600/70',
                    'bg-green-400 dark:bg-green-400',
                  ];

                  return (
                    <motion.div
                      key={hour}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: hour * 0.02 }}
                      className="text-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        className={`aspect-square rounded-xl ${colors[intensity]} cursor-pointer group relative flex items-center justify-center shadow-sm`}
                        title={`${hour}:00 - ${hourData.testCount} тестов, ${hourData.avgScore.toFixed(0)}%`}
                      >
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-mono font-medium">
                          {hour}
                        </span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl px-4 py-3 whitespace-nowrap z-20 border border-slate-700 shadow-2xl">
                          <div className="font-bold mb-1">
                            {hour}:00 - {hour + 1}:00
                          </div>
                          <div className="text-slate-300">{hourData.testCount} тестов</div>
                          <div
                            className={`font-semibold ${hourData.avgScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}
                          >
                            {hourData.avgScore.toFixed(0)}% средний балл
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-6 text-xs text-slate-500 dark:text-slate-400">
                <span>Низкие результаты</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-lg ${['bg-slate-200 dark:bg-slate-700', 'bg-red-300 dark:bg-red-900/40', 'bg-yellow-300 dark:bg-yellow-700/60', 'bg-green-300 dark:bg-green-600/70', 'bg-green-400 dark:bg-green-400'][i]}`}
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
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="mt-6 p-4 bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="text-cyan-600 dark:text-cyan-400 font-semibold mb-1">
                            Совет:
                          </p>
                          <p className="text-slate-700 dark:text-slate-300 text-sm">
                            Ваши лучшие результаты показаны в {bestHour.hour}:00-{bestHour.hour + 1}
                            :00 ({bestHour.avgScore.toFixed(0)}%). Старайтесь заниматься в это время
                            для максимальной эффективности!
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : null;
                })()}
            </motion.div>

            {/* Сравнение со средним */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Сравнение с другими пользователями
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ваша позиция на платформе
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 border border-cyan-500/30 rounded-xl p-5 text-center"
                >
                  <div className="text-4xl font-bold bg-gradient-to-br from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-2">
                    #{stats?.userRank || '—'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Ваше место
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-500/30 rounded-xl p-5 text-center"
                >
                  <div className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                    {stats?.percentile || 0}%
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Перцентиль
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 border border-green-500/30 rounded-xl p-5 text-center"
                >
                  <div className="text-4xl font-bold bg-gradient-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                    {stats?.usersBeaten || 0}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Обогнали из {stats?.totalUsers || 0}
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Ваш средний балл
                      </span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                        {stats?.averageScore || 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.averageScore || 0}%` }}
                        transition={{ duration: 1, delay: 0.9, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Средний балл платформы
                      </span>
                      <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">
                        {stats?.platformAverage || 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.platformAverage || 0}%` }}
                        transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative w-44 h-44">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="75"
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                        strokeWidth="14"
                        fill="none"
                      />
                      <motion.circle
                        cx="88"
                        cy="88"
                        r="75"
                        stroke="url(#percentileGradient)"
                        strokeWidth="14"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 471' }}
                        animate={{
                          strokeDasharray: `${((stats?.percentile || 0) / 100) * 471} 471`,
                        }}
                        transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient id="percentileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.3 }}
                        className="text-3xl font-bold text-slate-900 dark:text-white"
                      >
                        топ {100 - (stats?.percentile || 0)}%
                      </motion.span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                        пользователей
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {(stats?.percentile || 0) >= 70 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="mt-6 p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-green-600 dark:text-green-400 font-semibold mb-1">
                        Вы в топе!
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        Вы входите в топ {100 - (stats?.percentile || 0)}% пользователей платформы.
                        Обогнали {stats?.usersBeaten || 0} из {stats?.totalUsers || 0} учеников!
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (stats?.percentile || 0) >= 40 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="mt-6 p-4 bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <p className="text-cyan-600 dark:text-cyan-400 font-semibold mb-1">
                        Хороший результат!
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        Вы показываете результаты выше среднего. Ещё немного усилий, и вы войдёте в
                        топ!
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="mt-6 p-4 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💪</span>
                    <div>
                      <p className="text-amber-600 dark:text-amber-400 font-semibold mb-1">
                        Время для рывка!
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        Регулярные занятия помогут вам подняться выше. Сфокусируйтесь на слабых
                        темах!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Предсказание баллов */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    ИИ прогноз результата
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Предсказание на основе данных
                  </p>
                </div>

                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="inline-block p-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 dark:from-pink-500/30 dark:to-purple-500/30 rounded-2xl border border-pink-500/30"
                  >
                    <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                      {stats?.predictedScore || 78}%
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      Прогноз на экзамен
                    </p>
                  </motion.div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      Текущий средний балл
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {stats?.averageScore || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      Динамика за неделю
                    </span>
                    <span
                      className={`font-bold ${(stats?.weeklyProgress || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {(stats?.weeklyProgress || 0) >= 0 ? '+' : ''}
                      {stats?.weeklyProgress || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      Уверенность прогноза
                    </span>
                    <span className="text-cyan-500 font-bold">
                      {stats?.predictionConfidence || 0}%
                    </span>
                  </div>
                </div>

                {stats?.predictionFactors && stats.predictionFactors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {stats.predictionFactors.map((factor, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="px-3 py-1.5 bg-pink-500/20 dark:bg-pink-500/30 border border-pink-500/40 rounded-full text-pink-600 dark:text-pink-400 text-xs font-medium"
                      >
                        {factor}
                      </motion.span>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="text-purple-600 dark:text-purple-400 font-semibold mb-1">
                        Анализ ИИ
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        {(stats?.totalTests || 0) < 3
                          ? 'Пройдите ещё несколько тестов для точного прогноза. Минимум 3 теста для анализа.'
                          : `Прогноз основан на ${stats?.totalTests} тестов. При текущей динамике вы можете улучшить результат до ${Math.min(100, (stats?.predictedScore || 0) + 5).toFixed(0)}%!`}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Слабые места */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    Темы для улучшения
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Сфокусируйтесь на этих темах
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {stats?.weakTopics && stats.weakTopics.length > 0 ? (
                    stats.weakTopics.slice(0, 5).map((topic, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-slate-900 dark:text-white font-semibold mb-1">
                              {topic.topic}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400 text-xs">
                              {getSubjectLabel(topic.subject)} • {topic.totalAttempts} попыток
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${
                                topic.avgScore < 50
                                  ? 'text-red-500'
                                  : topic.avgScore < 60
                                    ? 'text-orange-500'
                                    : topic.avgScore < 70
                                      ? 'text-yellow-500'
                                      : 'text-green-500'
                              }`}
                            >
                              {topic.avgScore}%
                            </div>
                          </div>
                        </div>
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${topic.avgScore}%` }}
                            transition={{ duration: 1, delay: 1 + index * 0.1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              topic.avgScore < 50
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : topic.avgScore < 60
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                  : topic.avgScore < 70
                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                    : 'bg-gradient-to-r from-green-500 to-green-600'
                            }`}
                          />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <div className="text-4xl mb-3">🎯</div>
                      <p>
                        Пройдите несколько тестов, чтобы мы смогли определить темы для улучшения
                      </p>
                    </div>
                  )}
                </div>

                {stats?.weakTopics && stats.weakTopics.length > 0 && (
                  <div className="p-4 bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📚</span>
                      <div>
                        <p className="text-orange-600 dark:text-orange-400 font-semibold mb-1">
                          Рекомендация
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 text-sm">
                          Уделите больше внимания этим темам. Решение дополнительных 5-10 задач
                          может повысить ваш балл на 10-15%!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </ContentSection>

        {/* Settings & Information Section */}
        <ContentSection>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Информация</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Статус
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {USER_STATUS_LABELS[user.status]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Класс
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {CURRENT_GRADE_LABELS[user.currentGrade]}
                  </p>
                </div>
                {user.desiredDirection && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                      Направление
                    </p>
                    <p className="text-cyan-500 dark:text-cyan-400 font-semibold">
                      {DIRECTION_LABELS[user.desiredDirection as keyof typeof DIRECTION_LABELS]}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                    На платформе с
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Link
                  to={`/profiles/${user.username}`}
                  className="text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 text-sm flex items-center gap-2 font-medium transition-colors"
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
            </motion.div>

            {/* Recent Activity Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Дополнительная статистика
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🏆</span>
                    <div className="text-2xl font-bold text-blue-500">{stats?.bestScore || 0}%</div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Лучший результат
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔥</span>
                    <div className="text-2xl font-bold text-purple-500">
                      {stats?.longestStreak || 0}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Рекорд дней подряд
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📈</span>
                    <div className="text-2xl font-bold text-green-500">
                      +{stats?.weeklyProgress || 0}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Прогресс за неделю
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">⭐</span>
                    <div className="text-lg font-bold text-amber-500">
                      {getSubjectLabel(stats?.favoriteSubject || 'MATHEMATICS')}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Любимый предмет
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </ContentSection>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Выберите аватар
              </h3>

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
                    className="w-full py-6 border-2 border-dashed border-cyan-500/50 dark:border-cyan-400/50 rounded-xl hover:border-cyan-500 dark:hover:border-cyan-400 transition-all cursor-pointer bg-cyan-500/5 dark:bg-cyan-500/10 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20"
                  >
                    <div className="text-center">
                      {uploadingAvatar ? (
                        <div className="flex items-center justify-center gap-2 text-cyan-500 dark:text-cyan-400">
                          <div className="w-5 h-5 border-2 border-cyan-500/20 border-t-cyan-500 dark:border-cyan-400/20 dark:border-t-cyan-400 rounded-full animate-spin" />
                          <span className="font-medium">Загрузка...</span>
                        </div>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-10 h-10 mx-auto mb-3 text-cyan-500 dark:text-cyan-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                            />
                          </svg>
                          <p className="text-cyan-600 dark:text-cyan-400 font-semibold mb-1">
                            Загрузить свое фото
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            PNG, JPG до 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </label>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-4">
                  Или выберите готовый аватар:
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {AVATAR_OPTIONS.map((avatar, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => handleAvatarChange(avatar)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      user.avatar === avatar
                        ? 'border-cyan-500 ring-4 ring-cyan-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full" />
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAvatarPicker(false)}
                className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Отмена
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Редактировать профиль
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-300 font-medium mb-2">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-300 font-medium mb-2">
                    О себе
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    placeholder="Расскажите о себе..."
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <div>
                    <p className="text-slate-900 dark:text-white font-semibold">
                      Публичный профиль
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Другие смогут видеть ваш профиль
                    </p>
                  </div>
                  <button
                    onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      editForm.isPublic ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: editForm.isPublic ? 28 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  Отмена
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 font-medium"
                >
                  Сохранить
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
