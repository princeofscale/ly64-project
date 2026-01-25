import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ConfettiService } from '../core/services/ConfettiService';

interface LeaderboardUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  currentGrade?: number;
  rank: number;
  stats: {
    totalTests: number;
    averageScore: number;
    bestScore: number;
    achievementsCount: number;
    points: number;
  };
}

interface UserRank {
  rank: number;
  points: number;
  stats: {
    totalTests: number;
    averageScore: number;
    bestScore: number;
    achievementsCount: number;
  };
}

type Period = 'all' | 'month' | 'week';
type Subject = 'all' | 'MATHEMATICS' | 'PHYSICS' | 'INFORMATICS' | 'RUSSIAN' | 'HISTORY' | 'BIOLOGY';

const subjectOptions: { value: Subject; label: string }[] = [
  { value: 'all', label: 'Все предметы' },
  { value: 'MATHEMATICS', label: 'Математика' },
  { value: 'PHYSICS', label: 'Физика' },
  { value: 'INFORMATICS', label: 'Информатика' },
  { value: 'RUSSIAN', label: 'Русский язык' },
  { value: 'HISTORY', label: 'История' },
  { value: 'BIOLOGY', label: 'Биология' },
];

const periodOptions: { value: Period; label: string }[] = [
  { value: 'all', label: 'Всё время' },
  { value: 'month', label: 'Месяц' },
  { value: 'week', label: 'Неделя' },
];

export default function LeaderboardPage() {
  const { user: currentUser, token } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('all');
  const [subject, setSubject] = useState<Subject>('all');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadLeaderboard();
    if (token) {
      loadUserRank();
    }
  }, [period, subject, token]);

  useEffect(() => {
    if (userRank && userRank.rank <= 3 && !showCelebration) {
      setShowCelebration(true);
      ConfettiService.preset('achievement');
    }
  }, [userRank]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('period', period);
      if (subject !== 'all') {
        params.append('subject', subject);
      }
      params.append('limit', '50');

      const response = await fetch(`/api/users/leaderboard?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRank = async () => {
    try {
      const response = await fetch('/api/users/my-rank', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserRank(data);
      }
    } catch (error) {
      console.error('Failed to load user rank:', error);
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <span className="text-xl">👑</span>
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg shadow-gray-400/30">
            <span className="text-xl">🥈</span>
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/30">
            <span className="text-xl">🥉</span>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <span className="text-white font-bold">{rank}</span>
          </div>
        );
    }
  };

  const getRowStyle = (rank: number, isCurrentUser: boolean) => {
    let baseStyle = 'flex items-center p-4 rounded-xl transition-all duration-300 ';

    if (isCurrentUser) {
      baseStyle += 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 ';
    } else if (rank === 1) {
      baseStyle += 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 ';
    } else if (rank === 2) {
      baseStyle += 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-400/20 ';
    } else if (rank === 3) {
      baseStyle += 'bg-gradient-to-r from-amber-600/10 to-amber-700/10 border border-amber-600/20 ';
    } else {
      baseStyle += 'bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50 ';
    }

    return baseStyle;
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  🏆 Таблица лидеров
                </span>
              </h1>
              <p className="text-gray-400">Соревнуйся с другими учениками</p>
            </div>

            <div className="flex gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {periodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {subjectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {userRank && currentUser && (
          <div className="mb-8 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {currentUser.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {userRank.rank <= 3 && (
                    <div className="absolute -top-2 -right-2">
                      {userRank.rank === 1 && <span className="text-2xl">👑</span>}
                      {userRank.rank === 2 && <span className="text-2xl">🥈</span>}
                      {userRank.rank === 3 && <span className="text-2xl">🥉</span>}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-400">Твоя позиция</div>
                  <div className="text-3xl font-bold text-white">#{userRank.rank}</div>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{userRank.points}</div>
                  <div className="text-sm text-gray-400">Очков</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{userRank.stats.totalTests}</div>
                  <div className="text-sm text-gray-400">Тестов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{userRank.stats.averageScore}%</div>
                  <div className="text-sm text-gray-400">Средний балл</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
              />
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Пока нет данных</h3>
            <p className="text-gray-400">Начни проходить тесты, чтобы попасть в рейтинг!</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-700/50 text-sm text-gray-400 font-medium">
              <div className="col-span-1">Место</div>
              <div className="col-span-5">Ученик</div>
              <div className="col-span-2 text-center">Тестов</div>
              <div className="col-span-2 text-center">Ср. балл</div>
              <div className="col-span-2 text-center">Очки</div>
            </div>

            <div className="p-4 space-y-3">
              {leaderboard.map((user) => {
                const isCurrentUser = currentUser?.id === user.id;

                return (
                  <Link
                    key={user.id}
                    to={`/profiles/${user.username}`}
                    className={getRowStyle(user.rank, isCurrentUser)}
                  >
                    <div className="col-span-1 flex items-center">
                      {getRankBadge(user.rank)}
                    </div>

                    <div className="flex-1 flex items-center gap-4 ml-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          {user.name}
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">
                              Вы
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          @{user.username}
                          {user.currentGrade && ` · ${user.currentGrade} класс`}
                        </div>
                      </div>
                    </div>

                    <div className="w-20 text-center">
                      <div className="text-white font-medium">{user.stats.totalTests}</div>
                      <div className="text-xs text-gray-500">тестов</div>
                    </div>

                    <div className="w-20 text-center">
                      <div className={`font-medium ${
                        user.stats.averageScore >= 80 ? 'text-green-400' :
                        user.stats.averageScore >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {user.stats.averageScore}%
                      </div>
                      <div className="text-xs text-gray-500">средний</div>
                    </div>

                    <div className="w-24 text-center">
                      <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                        {user.stats.points}
                      </div>
                      <div className="text-xs text-gray-500">очков</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <span className="mr-2">📐</span>
            Как считаются очки?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-cyan-400 font-bold text-lg">+10</div>
              <div className="text-gray-400">за каждый тест</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-green-400 font-bold text-lg">+5</div>
              <div className="text-gray-400">за % среднего балла</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-purple-400 font-bold text-lg">+2</div>
              <div className="text-gray-400">за % лучшего результата</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-yellow-400 font-bold text-lg">+50</div>
              <div className="text-gray-400">за каждое достижение</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
