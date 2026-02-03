import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ConfettiService } from '../core/services/ConfettiService';
import { useAuthStore } from '../store/authStore';

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
type Subject =
  | 'all'
  | 'MATHEMATICS'
  | 'PHYSICS'
  | 'INFORMATICS'
  | 'RUSSIAN'
  | 'HISTORY'
  | 'BIOLOGY';

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
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <span className="text-slate-700 font-bold">{rank}</span>
          </div>
        );
    }
  };

  const getRowStyle = (rank: number, isCurrentUser: boolean) => {
    let baseStyle = 'flex items-center p-4 rounded-xl transition-all duration-300 ';

    if (isCurrentUser) {
      baseStyle += 'bg-blue-50 border-2 border-blue-300 shadow-lg ';
    } else if (rank === 1) {
      baseStyle +=
        'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 shadow-md ';
    } else if (rank === 2) {
      baseStyle += 'bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 shadow-md ';
    } else if (rank === 3) {
      baseStyle += 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 shadow-md ';
    } else {
      baseStyle += 'bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-md ';
    }

    return baseStyle;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px] -z-10" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Назад
          </Link>

          <div className="flex flex-col md:flex-row md:flex-items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                🏆 Таблица лидеров
              </h1>
              <p className="text-slate-600">Соревнуйся с другими учениками</p>
            </div>

            <div className="flex gap-3">
              <select
                value={period}
                onChange={e => setPeriod(e.target.value as Period)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                {periodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={subject}
                onChange={e => setSubject(e.target.value as Subject)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                {subjectOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {userRank && currentUser && (
          <div className="mb-8 bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 overflow-hidden border-2 border-white shadow-lg">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-white">
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
                  <div className="text-sm text-slate-600">Твоя позиция</div>
                  <div className="text-3xl font-bold text-slate-900">#{userRank.rank}</div>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userRank.points}</div>
                  <div className="text-sm text-slate-600">Очков</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {userRank.stats.totalTests}
                  </div>
                  <div className="text-sm text-slate-600">Тестов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600">
                    {userRank.stats.averageScore}%
                  </div>
                  <div className="text-sm text-slate-600">Средний балл</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
              />
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-lg">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Пока нет данных</h3>
            <p className="text-slate-600">Начни проходить тесты, чтобы попасть в рейтинг!</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 text-sm text-slate-600 font-medium">
              <div className="col-span-1">Место</div>
              <div className="col-span-5">Ученик</div>
              <div className="col-span-2 text-center">Тестов</div>
              <div className="col-span-2 text-center">Ср. балл</div>
              <div className="col-span-2 text-center">Очки</div>
            </div>

            <div className="p-4 space-y-3">
              {leaderboard.map(user => {
                const isCurrentUser = currentUser?.id === user.id;

                return (
                  <Link
                    key={user.id}
                    to={`/profiles/${user.username}`}
                    className={getRowStyle(user.rank, isCurrentUser)}
                  >
                    <div className="col-span-1 flex items-center">{getRankBadge(user.rank)}</div>

                    <div className="flex-1 flex items-center gap-4 ml-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 overflow-hidden border-2 border-white shadow-md">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {user.name}
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full border border-blue-200">
                              Вы
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          @{user.username}
                          {user.currentGrade && ` · ${user.currentGrade} класс`}
                        </div>
                      </div>
                    </div>

                    <div className="w-20 text-center">
                      <div className="text-slate-900 font-medium">{user.stats.totalTests}</div>
                      <div className="text-xs text-slate-500">тестов</div>
                    </div>

                    <div className="w-20 text-center">
                      <div
                        className={`font-medium ${
                          user.stats.averageScore >= 80
                            ? 'text-emerald-600'
                            : user.stats.averageScore >= 60
                              ? 'text-amber-600'
                              : 'text-red-600'
                        }`}
                      >
                        {user.stats.averageScore}%
                      </div>
                      <div className="text-xs text-slate-500">средний</div>
                    </div>

                    <div className="w-24 text-center">
                      <div className="text-xl font-bold text-amber-600">
                        {user.stats.points}
                      </div>
                      <div className="text-xs text-slate-500">очков</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <span className="mr-2">📐</span>
            Как считаются очки?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-blue-600 font-bold text-lg">+10</div>
              <div className="text-slate-600">за каждый тест</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="text-emerald-600 font-bold text-lg">+5</div>
              <div className="text-slate-600">за % среднего балла</div>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <div className="text-violet-600 font-bold text-lg">+2</div>
              <div className="text-slate-600">за % лучшего результата</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="text-amber-600 font-bold text-lg">+50</div>
              <div className="text-slate-600">за каждое достижение</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
