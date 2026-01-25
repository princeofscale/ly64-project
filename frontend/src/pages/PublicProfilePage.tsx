import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AchievementCard } from '../components/AchievementCard';
import { useAuthStore } from '../store/authStore';

interface PublicProfile {
  id: string;
  username: string;
  name: string;
  status?: string;
  currentGrade?: number;
  desiredDirection?: string;
  avatar?: string;
  bio?: string;
  isPublic: boolean;
  createdAt: string;
  message?: string;
  stats?: {
    totalTests: number;
    averageScore: number;
    bestScore: number;
    achievementsCount: number;
  };
  achievements?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    unlockedAt: string;
  }>;
  recentTests?: Array<{
    score: number;
    subject: string;
    completedAt: string;
  }>;
}

const statusLabels: Record<string, string> = {
  STUDENT: 'Ученик',
  APPLICANT: 'Абитуриент',
  GRADUATE: 'Выпускник',
  TEACHER: 'Учитель',
};

const directionLabels: Record<string, string> = {
  PHYSICS_MATH: 'Физико-математическое',
  IT: 'Информационные технологии',
  NATURAL_SCIENCE: 'Естественнонаучное',
  HUMANITIES: 'Гуманитарное',
  SOCIO_ECONOMIC: 'Социально-экономическое',
};

const subjectLabels: Record<string, string> = {
  MATHEMATICS: 'Математика',
  PHYSICS: 'Физика',
  INFORMATICS: 'Информатика',
  RUSSIAN: 'Русский язык',
  HISTORY: 'История',
  BIOLOGY: 'Биология',
};

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${username}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Пользователь не найден');
        } else {
          setError('Ошибка загрузки профиля');
        }
        return;
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-white mb-2">{error}</h1>
          <p className="text-gray-400 mb-6">Проверьте правильность ссылки</p>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = currentUser?.username === profile.username;

  if (!profile.isPublic && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-4xl">🔒</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>
            <p className="text-gray-400 mb-6">@{profile.username}</p>

            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <span className="text-5xl mb-4 block">🔐</span>
              <p className="text-gray-300 text-lg">{profile.message || 'Этот профиль приватный'}</p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Вернуться назад
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </Link>
        </div>

        <div className="relative mb-8">
          <div className="h-48 rounded-t-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0wLThoLTJWMTRoMnY0em0wLThoLTJWNmgydjR6bTAgMjRoLTJ2LTRoMnY0em0wIDhoLTJ2LTRoMnY0em0wIDhoLTJ2LTRoMnY0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          </div>

          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl border-4 border-gray-950 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden shadow-2xl">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-b-3xl rounded-tr-3xl pt-20 pb-8 px-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
              <p className="text-gray-400 text-lg mb-4">@{profile.username}</p>

              {profile.bio && (
                <p className="text-gray-300 max-w-xl mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-3">
                {profile.status && (
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                    {statusLabels[profile.status] || profile.status}
                  </span>
                )}
                {profile.currentGrade && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    {profile.currentGrade} класс
                  </span>
                )}
                {profile.desiredDirection && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    {directionLabels[profile.desiredDirection] || profile.desiredDirection}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-sm text-gray-400">
                <div>На платформе с</div>
                <div className="text-white font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {profile.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon="📊"
              value={profile.stats.totalTests}
              label="Тестов пройдено"
              color="from-cyan-500 to-blue-500"
            />
            <StatCard
              icon="⭐"
              value={`${profile.stats.averageScore}%`}
              label="Средний балл"
              color="from-blue-500 to-purple-500"
            />
            <StatCard
              icon="🏆"
              value={`${profile.stats.bestScore}%`}
              label="Лучший результат"
              color="from-purple-500 to-pink-500"
            />
            <StatCard
              icon="🎖️"
              value={profile.stats.achievementsCount}
              label="Достижений"
              color="from-pink-500 to-red-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {profile.achievements && profile.achievements.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3" />
                Достижения
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {profile.achievements.slice(0, 6).map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={true}
                    unlockedAt={new Date(achievement.unlockedAt)}
                  />
                ))}
              </div>

              {profile.achievements.length > 6 && (
                <div className="text-center mt-4 text-gray-400 text-sm">
                  И ещё {profile.achievements.length - 6} достижений
                </div>
              )}
            </div>
          )}

          {profile.recentTests && profile.recentTests.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3" />
                Недавние тесты
              </h2>

              <div className="space-y-3">
                {profile.recentTests.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
                  >
                    <div>
                      <div className="font-medium text-white">
                        {subjectLabels[test.subject] || test.subject}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(test.completedAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      test.score >= 80 ? 'text-green-400' :
                      test.score >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {test.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {(!profile.achievements || profile.achievements.length === 0) &&
         (!profile.recentTests || profile.recentTests.length === 0) && (
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">Пока нет активности</h3>
            <p className="text-gray-400">Этот пользователь ещё не прошёл ни одного теста</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  value: number | string;
  label: string;
  color: string;
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <div className="group relative">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-500`} />

      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 transition-all duration-500 group-hover:border-transparent">
        <div className="text-2xl mb-2">{icon}</div>
        <div className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </div>
  );
}
