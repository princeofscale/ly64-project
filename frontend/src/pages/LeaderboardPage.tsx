import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { PageLayout } from '../components/layout/PageLayout';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfettiService } from '../core/services/ConfettiService';
import { useAuthStore } from '../store/authStore';
import {
  bounceInVariants,
  fadeInVariants,
  scalePopVariants,
  staggerContainer,
} from '../utils/animations';

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
          <motion.div
            variants={bounceInVariants}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/50"
          >
            <span className="text-2xl">👑</span>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            variants={bounceInVariants}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/50"
          >
            <span className="text-2xl">🥈</span>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            variants={bounceInVariants}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/50"
          >
            <span className="text-2xl">🥉</span>
          </motion.div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center border-2 border-slate-600 dark:border-slate-500">
            <span className="text-white font-bold text-sm">{rank}</span>
          </div>
        );
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-48';
      case 2:
        return 'h-36';
      case 3:
        return 'h-28';
      default:
        return 'h-24';
    }
  };

  const getPodiumGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400/20 via-amber-500/20 to-orange-500/20';
      case 2:
        return 'from-slate-300/20 via-slate-400/20 to-slate-500/20';
      case 3:
        return 'from-amber-600/20 via-amber-700/20 to-amber-800/20';
      default:
        return 'from-slate-600/20 to-slate-700/20';
    }
  };

  const calculatePercentile = (rank: number, total: number) => {
    if (total === 0) return 0;
    return Math.round(((total - rank + 1) / total) * 100);
  };

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <PageLayout
      title="Leaderboard"
      background="gradient"
      maxWidth="xl"
      action={
        <div className="flex gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as Period)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {subjectOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Hero Section - Your Rank */}
        {userRank && currentUser && (
          <motion.div variants={fadeInVariants} initial="initial" animate="animate">
            <Card variant="glass" padding="lg" className="mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <motion.div
                      variants={scalePopVariants}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden shadow-xl border-4 border-white dark:border-slate-900"
                    >
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-white font-bold">
                          {currentUser.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </motion.div>
                    {userRank.rank <= 3 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        className="absolute -top-3 -right-3"
                      >
                        {userRank.rank === 1 && <span className="text-4xl drop-shadow-lg">👑</span>}
                        {userRank.rank === 2 && <span className="text-4xl drop-shadow-lg">🥈</span>}
                        {userRank.rank === 3 && <span className="text-4xl drop-shadow-lg">🥉</span>}
                      </motion.div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Your Rank
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                      className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent"
                    >
                      #{userRank.rank}
                    </motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      {userRank.points}
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                      Points
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                      {userRank.stats.totalTests}
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                      Tests
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                      {userRank.stats.averageScore}%
                    </div>
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                      Avg Score
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full"
            />
          </div>
        ) : leaderboard.length === 0 ? (
          <Card variant="glass" padding="lg" className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Data Yet</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Start taking tests to appear on the leaderboard!
            </p>
          </Card>
        ) : (
          <>
            {/* Podium Section - Top 3 */}
            {topThree.length > 0 && (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="mb-8"
              >
                <div className="text-center mb-8">
                  <motion.div variants={bounceInVariants} className="inline-block text-6xl mb-4">
                    🏆
                  </motion.div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Top Champions
                  </h2>
                </div>

                <div className="flex items-end justify-center gap-4 mb-8">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <motion.div variants={bounceInVariants} className="flex-1 max-w-xs">
                      <Card
                        variant="glass"
                        padding="md"
                        className="text-center relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-300/10 via-slate-400/10 to-slate-500/10" />
                        <div className="relative z-10">
                          <div className="mb-4 flex justify-center">
                            <div className="relative">
                              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 overflow-hidden shadow-xl shadow-slate-400/50 border-4 border-white dark:border-slate-900">
                                {topThree[1].avatar ? (
                                  <img
                                    src={topThree[1].avatar}
                                    alt={topThree[1].name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-3xl text-white font-bold">
                                    {topThree[1].name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-3 -right-3">
                                <span className="text-4xl drop-shadow-lg">🥈</span>
                              </div>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {topThree[1].name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            @{topThree[1].username}
                          </p>
                          <div className="text-3xl font-black bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent">
                            {topThree[1].stats.points}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">points</div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <motion.div variants={bounceInVariants} className="flex-1 max-w-sm">
                      <Card
                        variant="glass"
                        padding="lg"
                        className="text-center relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-amber-500/20 to-orange-500/20" />
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"
                        />
                        <div className="relative z-10">
                          <div className="mb-4 flex justify-center">
                            <div className="relative">
                              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 overflow-hidden shadow-2xl shadow-yellow-500/50 border-4 border-white dark:border-slate-900">
                                {topThree[0].avatar ? (
                                  <img
                                    src={topThree[0].avatar}
                                    alt={topThree[0].name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-4xl text-white font-bold">
                                    {topThree[0].name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -top-4 -right-4"
                              >
                                <span className="text-5xl drop-shadow-2xl">👑</span>
                              </motion.div>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            {topThree[0].name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            @{topThree[0].username}
                          </p>
                          <div className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                            {topThree[0].stats.points}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">points</div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <motion.div variants={bounceInVariants} className="flex-1 max-w-xs">
                      <Card
                        variant="glass"
                        padding="md"
                        className="text-center relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-amber-700/10 to-amber-800/10" />
                        <div className="relative z-10">
                          <div className="mb-4 flex justify-center">
                            <div className="relative">
                              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 overflow-hidden shadow-xl shadow-amber-600/50 border-4 border-white dark:border-slate-900">
                                {topThree[2].avatar ? (
                                  <img
                                    src={topThree[2].avatar}
                                    alt={topThree[2].name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-3xl text-white font-bold">
                                    {topThree[2].name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-3 -right-3">
                                <span className="text-4xl drop-shadow-lg">🥉</span>
                              </div>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {topThree[2].name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            @{topThree[2].username}
                          </p>
                          <div className="text-3xl font-black bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                            {topThree[2].stats.points}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">points</div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Leaderboard List - 4th and beyond */}
            {restOfLeaderboard.length > 0 && (
              <motion.div variants={fadeInVariants} initial="initial" animate="animate">
                <Card variant="glass" padding="none" className="overflow-hidden">
                  <div className="bg-slate-100/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      All Rankings
                    </h3>
                  </div>

                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="divide-y divide-slate-200 dark:divide-slate-700"
                  >
                    {restOfLeaderboard.map((user, index) => {
                      const isCurrentUser = currentUser?.id === user.id;
                      const isEven = index % 2 === 0;

                      return (
                        <motion.div
                          key={user.id}
                          variants={fadeInVariants}
                          className={`
                            flex items-center gap-4 px-6 py-4 transition-all duration-300
                            ${isEven ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'bg-white/50 dark:bg-slate-800/50'}
                            ${isCurrentUser ? 'bg-gradient-to-r from-indigo-100/50 via-purple-100/50 to-pink-100/50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-l-4 border-indigo-500' : ''}
                            hover:bg-slate-100 dark:hover:bg-slate-700/50
                          `}
                        >
                          {/* Rank Badge */}
                          <div className="flex-shrink-0">{getRankBadge(user.rank)}</div>

                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden shadow-lg border-2 border-white dark:border-slate-800">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl text-white font-bold">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                                {user.name}
                              </h4>
                              {isCurrentUser && (
                                <Badge variant="primary" size="sm">
                                  You
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              @{user.username}
                              {user.currentGrade && ` · Grade ${user.currentGrade}`}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-lg font-bold text-slate-900 dark:text-white">
                                {user.stats.totalTests}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                Tests
                              </div>
                            </div>

                            <div className="text-center">
                              <div
                                className={`text-lg font-bold ${
                                  user.stats.averageScore >= 80
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : user.stats.averageScore >= 60
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                {user.stats.averageScore}%
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">Avg</div>
                            </div>

                            <div className="text-center min-w-[80px]">
                              <div className="text-xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                                {user.stats.points}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                Points
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {/* Stats Section */}
        {leaderboard.length > 0 && userRank && (
          <motion.div variants={fadeInVariants} initial="initial" animate="animate">
            <Card variant="glass" padding="lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">👥</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {leaderboard.length}
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Participants
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-1">
                    {calculatePercentile(userRank.rank, leaderboard.length)}%
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Your Percentile
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-1">
                    {userRank.rank > 1
                      ? leaderboard[userRank.rank - 2]?.stats.points - userRank.points
                      : 0}
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Points to Next Rank
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Points Calculation Info */}
        <motion.div variants={fadeInVariants} initial="initial" animate="animate">
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">📐</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                How Points are Calculated
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                <div className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
                  +10
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Per test completed
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                <div className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">
                  +5
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Per % average score
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                <div className="text-3xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  +2
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Per % best score
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                  +50
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Per achievement
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
}
