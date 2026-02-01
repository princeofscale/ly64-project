import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export const useAchievementNotifications = () => {
  const { isAuthenticated, token } = useAuthStore();
  const previousAchievements = useRef<Set<string>>(new Set());
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      hasInitialized.current = false;
      previousAchievements.current.clear();
      return;
    }

    const checkNewAchievements = async () => {
      try {
        const response = await api.get('/users/achievements');
        const data = response.data;
        const achievements: Achievement[] = data.achievements || [];
        const unlockedAchievements = achievements.filter((a) => a.isUnlocked);

        if (!hasInitialized.current) {
          previousAchievements.current = new Set(
            unlockedAchievements.map((a) => a.id)
          );
          hasInitialized.current = true;
          return;
        }

        for (const achievement of unlockedAchievements) {
          if (!previousAchievements.current.has(achievement.id)) {
            showAchievementToast(achievement);
            previousAchievements.current.add(achievement.id);
          }
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          hasInitialized.current = false;
          previousAchievements.current.clear();
          return;
        }
        // Игнорируем другие ошибки (429, сетевые и т.д.)
      }
    };

    checkNewAchievements();

    const interval = setInterval(checkNewAchievements, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);
};

const showAchievementToast = (achievement: Achievement) => {
  const animationClass = 'animate-enter';

  toast.custom(
    (t) => (
      <div className={`${t.visible ? animationClass : 'animate-leave'} max-w-md w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
        <div className="flex-1 flex items-center">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
              {achievement.icon}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white uppercase tracking-wide">
                🎉 Новое достижение!
              </p>
            </div>
            <p className="mt-1 text-lg font-bold text-white">
              {achievement.name}
            </p>
            <p className="mt-1 text-sm text-yellow-100">
              {achievement.description}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs font-semibold text-white bg-white bg-opacity-20 px-2 py-1 rounded">
                +{achievement.points} очков
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="ml-4 flex-shrink-0 text-white hover:text-yellow-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ),
    {
      duration: 6000,
      position: 'top-center',
    }
  );
};
