import { useEffect, useState } from 'react';
import { Achievement } from '@lyceum64/shared';
import { AchievementCard } from '../components/AchievementCard';
import { CURRENT_GRADE_LABELS, USER_STATUS_LABELS, DIRECTION_LABELS, AUTH_PROVIDER_LABELS } from '@lyceum64/shared';
import { useAuthStore } from '../store/authStore';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  status: 'STUDENT' | 'APPLICANT';
  currentGrade: number;
  desiredDirection?: string;
  motivation?: string;
  authProvider: 'EMAIL' | 'DNEVNIK';
  avatar?: string;
  createdAt: string;
}

interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadAchievements();
  }, []);

  const loadProfile = async () => {
    try {
      const token = useAuthStore.getState().token;
      const username = useAuthStore.getState().user?.username;

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
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

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:3001/api/users/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Профиль не найден</div>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Профиль</h1>

        {/* Personal Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Личная информация</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Имя</p>
              <p className="text-lg font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="text-lg font-medium text-blue-600">@{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Статус</p>
              <p className="text-lg font-medium">
                {USER_STATUS_LABELS[user.status as keyof typeof USER_STATUS_LABELS]}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Текущий класс</p>
              <p className="text-lg font-medium">{CURRENT_GRADE_LABELS[user.currentGrade]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Способ входа</p>
              <p className="text-lg font-medium">
                {AUTH_PROVIDER_LABELS[user.authProvider as keyof typeof AUTH_PROVIDER_LABELS]}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Дата регистрации</p>
              <p className="text-lg font-medium">
                {new Date(user.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>

          {user.desiredDirection && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Желаемое направление</p>
              <p className="text-lg font-medium">
                {DIRECTION_LABELS[user.desiredDirection as keyof typeof DIRECTION_LABELS]}
              </p>
            </div>
          )}

          {user.motivation && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Мотивация</p>
              <p className="text-gray-800">{user.motivation}</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Достижения</h2>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Прогресс</span>
              <span className="text-sm font-medium text-gray-900">
                {unlockedAchievements.length} / {achievements.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(unlockedAchievements.length / achievements.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Unlocked achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-green-700">
                Разблокировано ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
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

          {/* Locked achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-600">
                Заблокировано ({lockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={false}
                  />
                ))}
              </div>
            </div>
          )}

          {achievements.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Достижения пока не загружены
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
