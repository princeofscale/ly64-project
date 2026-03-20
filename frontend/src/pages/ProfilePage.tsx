import {
 CURRENT_GRADE_LABELS,
 USER_STATUS_LABELS,
 DIRECTION_LABELS,
 SUBJECT_LABELS,
} from '@lyceum64/shared';
import { useCallback, useEffect, useState } from 'react';
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
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import api from '../services/api';

import type { AchievementWithStatus } from '../types/achievement';

interface HeatmapDay {
 date: string;
 count: number;
 points: number;
}

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
 const [activityHeatmap, setActivityHeatmap] = useState<HeatmapDay[]>([]);
 const [loading, setLoading] = useState(true);
 const [isEditing, setIsEditing] = useState(false);
 const [showAvatarPicker, setShowAvatarPicker] = useState(false);
 const [uploadingAvatar, setUploadingAvatar] = useState(false);
 const [editForm, setEditForm] = useState({
 name: '',
 bio: '',
 isPublic: true,
 });

 useEffect(() => {
 void loadProfile();
 void loadAchievements();
 void loadStats();
 void loadActivityHeatmap();
 }, []);

 const handleEscapeKey = useCallback((e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 if (showAvatarPicker) setShowAvatarPicker(false);
 if (isEditing) setIsEditing(false);
 }
 }, [showAvatarPicker, isEditing]);

 useEffect(() => {
 if (showAvatarPicker || isEditing) {
 document.addEventListener('keydown', handleEscapeKey);
 return () => document.removeEventListener('keydown', handleEscapeKey);
 }
 }, [showAvatarPicker, isEditing, handleEscapeKey]);

 const loadProfile = async () => {
 try {
 const response = await api.get('/users/profile');
 const data = response.data;
 setUser(data);
 setEditForm({
 name: data.name || '',
 bio: data.bio || '',
 isPublic: data.isPublic ?? true,
 });
 } catch {
 } finally {
 setLoading(false);
 }
 };

 const loadAchievements = async () => {
 try {
 const response = await api.get('/users/achievements');
 setAchievements(response.data.achievements || []);
 } catch {
 }
 };

 const loadStats = async () => {
 try {
 const response = await api.get('/users/stats');
 setStats(response.data);
 } catch {
 }
 };

 const loadActivityHeatmap = async () => {
 try {
 const response = await api.get('/users/activity-heatmap');
 if (response.data.success) {
 setActivityHeatmap(response.data.data as HeatmapDay[]);
 }
 } catch {
 }
 };

 const handleSave = async () => {
 try {
 const response = await api.put('/users/profile', editForm);
 setUser(response.data);
 setIsEditing(false);
 toast.success('Профиль обновлён');
 } catch (error) {
 toast.error('Ошибка сохранения');
 }
 };

 const handleAvatarChange = async (avatarUrl: string) => {
 try {
 await api.put('/users/avatar', { avatar: avatarUrl });
 setUser(prev => (prev ? { ...prev, avatar: avatarUrl } : null));
 setShowAvatarPicker(false);
 toast.success('Аватар обновлён');
 } catch (error) {
 toast.error('Ошибка обновления аватара');
 }
 };

 const handleCustomAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 if (file.size > 5 * 1024 * 1024) {
 toast.error('Файл слишком большой. Максимум 5MB');
 return;
 }

 if (!file.type.startsWith('image/')) {
 toast.error('Выберите изображение');
 return;
 }

 setUploadingAvatar(true);

 try {
 const reader = new FileReader();
 reader.onload = async event => {
 const base64String = event.target?.result as string;

 try {
 await api.put('/users/avatar', { avatar: base64String });
 setUser(prev => (prev ? { ...prev, avatar: base64String } : null));
 setShowAvatarPicker(false);
 toast.success('Аватар загружен');
 } catch {
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
 void navigator.clipboard.writeText(link);
 toast.success('Ссылка скопирована');
 };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="relative">
 <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
 </div>
 </div>
 );
 }

 if (!user) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="text-slate-600">Профиль не найден</div>
 </div>
 );
 }

 const unlockedAchievements = achievements.filter(a => a.isUnlocked);

 const getSubjectLabel = (subject: string) =>
 (SUBJECT_LABELS as Record<string, string>)[subject] || subject;

 return (
 <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -z-10" />
 <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-100/50 rounded-full blur-[80px] -z-10" />

 <div className="relative z-10 max-w-5xl mx-auto px-4">
 <div className=" backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl overflow-hidden mb-8" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="h-32 bg-gradient-to-r from-blue-50 via-violet-50 to-pink-50" />

 <div className="px-8 pb-8">
 <div className="flex flex-col gap-6 -mt-16">
 <div className="flex flex-col md:flex-row md:items-end gap-6">
 <div className="relative group flex-shrink-0">
 <div className="w-32 h-32 rounded-2xl bg-slate-100 border-4 border-white shadow-lg overflow-hidden">
 {user.avatar ? (
 <img
 src={user.avatar}
 alt={user.name}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-4xl font-bold text-white">
 {user.name.charAt(0).toUpperCase()}
 </div>
 )}
 </div>
 <button
 onClick={() => setShowAvatarPicker(true)}
 className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center"
 aria-label="Изменить аватар"
 >
 <span className="text-white text-sm">Изменить</span>
 </button>
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-3 mb-1">
 <h1 className="text-2xl md:text-3xl font-bold  break-words" style={{ color: 'var(--color-text)' }}>
 {user.name}
 </h1>
 {user.isPublic ? (
 <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full whitespace-nowrap border border-emerald-200">
 Публичный
 </span>
 ) : (
 <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full whitespace-nowrap border border-slate-200">
 Приватный
 </span>
 )}
 </div>
 <p className="text-blue-600 font-mono break-all">@{user.username}</p>
 {user.bio && <p className="text-slate-600 mt-2 break-words">{user.bio}</p>}
 </div>
 </div>

 <div className="flex flex-wrap gap-3">
 <button
 onClick={copyProfileLink}
 className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
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
 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-600/25"
 >
 Редактировать
 </button>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center group hover:shadow-lg transition-all">
 <p className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform">
 {stats?.totalTests || 0}
 </p>
 <p className="text-sm text-slate-600">Тестов пройдено</p>
 </div>
 <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center group hover:shadow-lg transition-all">
 <p className="text-3xl font-bold text-violet-600 group-hover:scale-110 transition-transform">
 {stats?.averageScore || 0}%
 </p>
 <p className="text-sm text-slate-600">Средний балл</p>
 </div>
 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center group hover:shadow-lg transition-all">
 <p className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform">
 {stats?.bestScore || 0}%
 </p>
 <p className="text-sm text-slate-600">Лучший результат</p>
 </div>
 <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center group hover:shadow-lg transition-all">
 <p className="text-3xl font-bold text-amber-600 group-hover:scale-110 transition-transform">
 {unlockedAchievements.length}
 </p>
 <p className="text-sm text-slate-600">Достижений</p>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
 <div className="flex items-center justify-center gap-2 mb-1">
 <span className="text-2xl">🔥</span>
 <p className="text-2xl font-bold text-orange-600">{stats?.currentStreak || 0}</p>
 </div>
 <p className="text-xs text-slate-600">Дней подряд</p>
 </div>
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
 <div className="flex items-center justify-center gap-2 mb-1">
 <span className="text-2xl">⏱️</span>
 <p className="text-2xl font-bold text-blue-600">
 {Math.round((stats?.totalTimeSpent || 0) / 60) || 0}
 </p>
 </div>
 <p className="text-xs text-slate-600">Минут занятий</p>
 </div>
 <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-center">
 <div className="flex items-center justify-center gap-2 mb-1">
 <span className="text-2xl">📈</span>
 <p className="text-2xl font-bold text-pink-600">+{stats?.weeklyProgress || 0}%</p>
 </div>
 <p className="text-xs text-slate-600">Прогресс</p>
 </div>
 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
 <div className="flex items-center justify-center gap-2 mb-1">
 <span className="text-2xl">⭐</span>
 <p className="text-xl font-bold text-emerald-600">
 {stats?.favoriteSubject ? getSubjectLabel(stats.favoriteSubject) : 'Нет данных'}
 </p>
 </div>
 <p className="text-xs text-slate-600">Любимый предмет</p>
 </div>
 </div>
 </div>
 </div>

 {stats?.dailyActivity && stats.dailyActivity.length > 0 && (
 <div className=" border border-slate-200 shadow-lg rounded-2xl p-4 mb-8" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-base font-semibold  flex items-center" style={{ color: 'var(--color-text)' }}>
 <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 animate-pulse" />
 Активность за 4 недели
 </h2>
 <div className="flex items-center gap-1 text-xs text-slate-500">
 <span>Меньше</span>
 {[0, 1, 2, 3, 4].map(i => (
 <div
 key={i}
 className={`w-2 h-2 rounded ${['bg-slate-100', 'bg-cyan-200', 'bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600'][i]}`}
 />
 ))}
 <span>Больше</span>
 </div>
 </div>
 <div className="flex flex-wrap gap-1.5">
 {stats.dailyActivity.slice(-28).map((day, index) => {
 const intensity = day.count === 0 ? 0 : Math.min(Math.ceil(day.count / 2), 4);
 const colors = [
 'bg-slate-100',
 'bg-cyan-200',
 'bg-cyan-400',
 'bg-cyan-500',
 'bg-cyan-600',
 ];
 return (
 <div
 key={index}
 className={`w-8 h-8 rounded-lg ${colors[intensity]} hover:scale-110 transition-all cursor-pointer group relative`}
 >
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block  shadow-lg text-slate-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 border border-slate-200" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="font-bold">
 {new Date(day.date).toLocaleDateString('ru-RU', {
 day: 'numeric',
 month: 'short',
 })}
 </div>
 <div className="text-slate-600">{day.count} тестов</div>
 {day.avgScore > 0 && (
 <div
 className={`${day.avgScore >= 70 ? 'text-green-600' : 'text-yellow-600'}`}
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
 <div className=" border border-slate-200 shadow-lg rounded-2xl p-6 mb-8" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-xl font-semibold  mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
 <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse" />
 Прогресс по тестам
 </h2>
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart
 data={stats.recentAttempts
 .slice()
 .reverse()
 .map((a) => ({
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
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
 <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
 <YAxis
 stroke="#94a3b8"
 tick={{ fill: '#64748b', fontSize: 12 }}
 domain={[0, 100]}
 tickFormatter={value => `${value}%`}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: '#ffffff',
 border: '1px solid #e2e8f0',
 borderRadius: '12px',
 padding: '12px',
 }}
 labelStyle={{ color: '#64748b', marginBottom: '4px' }}
 formatter={(value, _name, props) => [
 `${value ?? 0}%`,
 props.payload?.subject ?? '',
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
 <div className=" border border-slate-200 shadow-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-xl font-semibold  mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
 <span
 className="w-2 h-2 bg-amber-400 rounded-full mr-3 animate-pulse"
 style={{ animationDelay: '0.7s' }}
 />
 🕒 Тепловая карта активности
 </h2>
 <p className="text-slate-600 text-sm mb-6">Ваши лучшие результаты по времени суток</p>

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
 'bg-slate-100',
 'bg-red-200',
 'bg-yellow-300',
 'bg-green-300',
 'bg-green-400',
 ];

 return (
 <div key={hour} className="text-center">
 <div
 className={`aspect-square rounded-lg ${colors[intensity]} hover:scale-110 transition-all cursor-pointer group relative flex items-center justify-center`}
 title={`${hour}:00 - ${hourData.testCount} тестов, ${hourData.avgScore.toFixed(0)}%`}
 >
 <span className="text-xs text-slate-600 font-mono">{hour}</span>
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block  shadow-lg text-slate-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 border border-slate-200" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="font-bold">
 {hour}:00 - {hour + 1}:00
 </div>
 <div className="text-slate-600">{hourData.testCount} тестов</div>
 <div
 className={`${hourData.avgScore >= 70 ? 'text-green-600' : 'text-yellow-600'}`}
 >
 {hourData.avgScore.toFixed(0)}% средний балл
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>

 <div className="flex items-center justify-between mt-6 text-xs text-slate-600">
 <span>Низкие результаты</span>
 <div className="flex gap-1" role="img" aria-label="Шкала результатов от низких до высоких">
 {(['Нет данных', 'Низкий (< 60%)', 'Средний (60–70%)', 'Хороший (70–80%)', 'Отличный (> 80%)'] as const).map((label, i) => (
 <div
 key={i}
 aria-label={label}
 title={label}
 className={`w-5 h-5 rounded ${['bg-slate-100', 'bg-red-200', 'bg-yellow-300', 'bg-green-300', 'bg-green-400'][i]}`}
 />
 ))}
 </div>
 <span>Высокие результаты</span>
 </div>

 {stats?.timeHeatmap &&
 stats.timeHeatmap.length > 0 &&
 (() => {
 const firstHour = stats.timeHeatmap[0];
 if (!firstHour) return null;

 const bestHour = stats.timeHeatmap.reduce(
 (best, curr) => (curr.avgScore > best.avgScore ? curr : best),
 firstHour
 );

 return bestHour && bestHour.testCount > 0 ? (
 <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
 <div className="flex items-start gap-3">
 <span className="text-2xl">💡</span>
 <div>
 <p className="text-blue-600 font-semibold mb-1">Совет:</p>
 <p className="text-slate-700 text-sm">
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
 <div className=" border border-slate-200 shadow-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-xl font-semibold  mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
 <span
 className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"
 style={{ animationDelay: '0.9s' }}
 />
 📊 Сравнение с другими пользователями
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
 <div className="text-3xl font-bold text-blue-600 mb-1">
 #{stats?.userRank || '—'}
 </div>
 <div className="text-slate-600 text-xs">Ваше место</div>
 </div>
 <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
 <div className="text-3xl font-bold text-violet-600 mb-1">
 {stats?.percentile || 0}%
 </div>
 <div className="text-slate-600 text-xs">Перцентиль</div>
 </div>
 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
 <div className="text-3xl font-bold text-emerald-600 mb-1">
 {stats?.usersBeaten || 0}
 </div>
 <div className="text-slate-600 text-xs">Обогнали из {stats?.totalUsers || 0}</div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4">
 <div>
 <div className="flex items-center justify-between mb-2">
 <span className="text-slate-600 text-sm">Ваш средний балл</span>
 <span className="text-2xl font-bold text-blue-600">
 {stats?.averageScore || 0}%
 </span>
 </div>
 <div
 role="progressbar"
 aria-valuenow={stats?.averageScore || 0}
 aria-valuemin={0}
 aria-valuemax={100}
 aria-label={`Ваш средний балл: ${stats?.averageScore || 0}%`}
 className="h-3 bg-slate-200 rounded-full overflow-hidden"
 >
 <div
 className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
 style={{ width: `${stats?.averageScore || 0}%` }}
 />
 </div>
 </div>

 <div>
 <div className="flex items-center justify-between mb-2">
 <span className="text-slate-600 text-sm">Средний балл платформы</span>
 <span className="text-2xl font-bold text-slate-500">
 {stats?.platformAverage || 0}%
 </span>
 </div>
 <div
 role="progressbar"
 aria-valuenow={stats?.platformAverage || 0}
 aria-valuemin={0}
 aria-valuemax={100}
 aria-label={`Средний балл платформы: ${stats?.platformAverage || 0}%`}
 className="h-3 bg-slate-200 rounded-full overflow-hidden"
 >
 <div
 className="h-full bg-gradient-to-r from-slate-400 to-slate-300 rounded-full"
 style={{ width: `${stats?.platformAverage || 0}%` }}
 />
 </div>
 </div>
 </div>

 <div className="flex items-center justify-center">
 <div className="relative w-40 h-40">
 <svg className="w-full h-full transform -rotate-90">
 <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="none" />
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
 <span className="text-3xl font-bold text-slate-900">
 топ {100 - (stats?.percentile || 0)}%
 </span>
 <span className="text-slate-600 text-xs">пользователей</span>
 </div>
 </div>
 </div>
 </div>

 {(stats?.totalUsers ?? 0) <= 1 ? (
 <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
 <div className="flex items-start gap-3">
 <span className="text-2xl">🚀</span>
 <div>
 <p className="text-indigo-600 font-semibold mb-1">Вы пока первый!</p>
 <p className="text-slate-700 text-sm">
 Пригласите друзей на платформу, чтобы сравнить свои результаты и
 соревноваться!
 </p>
 </div>
 </div>
 </div>
 ) : (stats?.percentile || 0) >= 70 ? (
 <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
 <div className="flex items-start gap-3">
 <span className="text-2xl">🏆</span>
 <div>
 <p className="text-emerald-600 font-semibold mb-1">Вы в топе!</p>
 <p className="text-slate-700 text-sm">
 Вы входите в топ {100 - (stats?.percentile || 0)}% пользователей платформы.
 Обогнали {stats?.usersBeaten || 0} из {stats?.totalUsers || 0} учеников!
 </p>
 </div>
 </div>
 </div>
 ) : (stats?.percentile || 0) >= 40 ? (
 <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
 <div className="flex items-start gap-3">
 <span className="text-2xl">📈</span>
 <div>
 <p className="text-blue-600 font-semibold mb-1">Хороший результат!</p>
 <p className="text-slate-700 text-sm">
 Вы показываете результаты выше среднего. Ещё немного усилий, и вы войдёте в
 топ!
 </p>
 </div>
 </div>
 </div>
 ) : (
 <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
 <div className="flex items-start gap-3">
 <span className="text-2xl">💪</span>
 <div>
 <p className="text-amber-600 font-semibold mb-1">Время для рывка!</p>
 <p className="text-slate-700 text-sm">
 Регулярные занятия помогут вам подняться выше. Сфокусируйтесь на слабых темах!
 </p>
 </div>
 </div>
 </div>
 )}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Предсказание баллов */}
 <div className=" border border-slate-200 shadow-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-xl font-semibold  mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
 <span
 className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse"
 style={{ animationDelay: '1.1s' }}
 />
 🤖 ИИ прогноз результата
 </h2>

 <div className="text-center mb-6">
 <div className="inline-block p-6 bg-pink-50 rounded-2xl border border-pink-200">
 <div className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
 {stats?.predictedScore || 78}%
 </div>
 <p className="text-slate-600 text-sm">Прогноз на экзамен</p>
 </div>
 </div>

 <div className="space-y-3 mb-6">
 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
 <span className="text-slate-600 text-sm">Текущий средний балл</span>
 <span className="text-slate-900 font-semibold">{stats?.averageScore || 0}%</span>
 </div>
 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
 <span className="text-slate-600 text-sm">Динамика за неделю</span>
 <span
 className={`font-semibold ${(stats?.weeklyProgress || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
 >
 {(stats?.weeklyProgress || 0) >= 0 ? '+' : ''}
 {stats?.weeklyProgress || 0}%
 </span>
 </div>
 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
 <span className="text-slate-600 text-sm">Уверенность прогноза</span>
 <span className="text-blue-600 font-semibold">
 {stats?.predictionConfidence || 0}%
 </span>
 </div>
 </div>

 {stats?.predictionFactors && stats.predictionFactors.length > 0 && (
 <div className="flex flex-wrap gap-2 mb-4">
 {stats.predictionFactors.map((factor, i) => (
 <span
 key={i}
 className="px-3 py-1 bg-pink-50 border border-pink-200 rounded-full text-pink-600 text-xs"
 >
 {factor}
 </span>
 ))}
 </div>
 )}

 <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
 <div className="flex items-start gap-3">
 <span className="text-2xl">✨</span>
 <div>
 <p className="text-violet-600 font-semibold mb-1">Анализ ИИ</p>
 <p className="text-slate-700 text-sm">
 {(stats?.totalTests || 0) < 3
 ? 'Пройдите ещё несколько тестов для точного прогноза. Минимум 3 теста для анализа.'
 : `Прогноз основан на ${stats?.totalTests} тестов. При текущей динамике вы можете улучшить результат до ${Math.min(100, (stats?.predictedScore || 0) + 5).toFixed(0)}%!`}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Слабые места */}
 <div className=" border border-slate-200 shadow-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-xl font-semibold  mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
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
 className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
 >
 <div className="flex items-start justify-between mb-2">
 <div className="flex-1">
 <h3 className=" font-semibold" style={{ color: 'var(--color-text)' }}>{topic.topic}</h3>
 <p className="text-slate-600 text-xs">
 {getSubjectLabel(topic.subject)} • {topic.totalAttempts} попыток
 </p>
 </div>
 <div className="text-right">
 <div
 className={`text-2xl font-bold ${
 topic.avgScore < 50
 ? 'text-red-600'
 : topic.avgScore < 60
 ? 'text-orange-600'
 : topic.avgScore < 70
 ? 'text-yellow-600'
 : 'text-green-600'
 }`}
 >
 {topic.avgScore}%
 </div>
 <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
 topic.avgScore < 50
 ? 'bg-red-100 text-red-600'
 : topic.avgScore < 60
 ? 'bg-orange-100 text-orange-600'
 : topic.avgScore < 70
 ? 'bg-yellow-100 text-yellow-700'
 : 'bg-green-100 text-green-700'
 }`}>
 {topic.avgScore < 50 ? 'Слабо' : topic.avgScore < 60 ? 'Ниже среднего' : topic.avgScore < 70 ? 'Средне' : 'Хорошо'}
 </span>
 </div>
 </div>
 <div
 role="progressbar"
 aria-valuenow={topic.avgScore}
 aria-valuemin={0}
 aria-valuemax={100}
 aria-label={`Точность по теме «${topic.topic}»: ${topic.avgScore}%`}
 className="h-2 bg-slate-200 rounded-full overflow-hidden"
 >
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
 <div className="text-center py-8 text-slate-500">
 <div className="text-4xl mb-2">🎯</div>
 <p>Пройдите несколько тестов, чтобы мы смогли определить темы для улучшения</p>
 </div>
 )}
 </div>

 {stats?.weakTopics && stats.weakTopics.length > 0 && (
 <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
 <div className="flex items-start gap-3">
 <span className="text-2xl">📚</span>
 <div>
 <p className="text-orange-600 font-semibold mb-1">Рекомендация</p>
 <p className="text-slate-700 text-sm">
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

 {/* Activity heatmap */}
 <div className="border border-slate-200 shadow-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
 <span className="w-2 h-2 bg-violet-400 rounded-full mr-3 animate-pulse" style={{ animationDelay: '1.2s' }} />
 Активность за год
 </h2>
 <ActivityHeatmap data={activityHeatmap} />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-1">
 <div className=" border border-slate-200 shadow-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-xl font-semibold  mb-4" style={{ color: 'var(--color-text)' }}>Информация</h2>

 <div className="space-y-4">
 <div>
 <p className="text-sm text-slate-500">Статус</p>
 <p className="text-slate-900">{USER_STATUS_LABELS[user.status]}</p>
 </div>
 <div>
 <p className="text-sm text-slate-500">Класс</p>
 <p className="text-slate-900">{CURRENT_GRADE_LABELS[user.currentGrade]}</p>
 </div>
 {user.desiredDirection && (
 <div>
 <p className="text-sm text-slate-500">Направление</p>
 <p className="text-blue-600">
 {DIRECTION_LABELS[user.desiredDirection as keyof typeof DIRECTION_LABELS]}
 </p>
 </div>
 )}
 <div>
 <p className="text-sm text-slate-500">На платформе с</p>
 <p className="text-slate-900">
 {new Date(user.createdAt).toLocaleDateString('ru-RU', {
 year: 'numeric',
 month: 'long',
 })}
 </p>
 </div>
 </div>

 <div className="mt-6 pt-6 border-t border-slate-200">
 <Link
 to={`/profiles/${user.username}`}
 className="text-blue-600 hover:text-blue-500 text-sm flex items-center gap-2"
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
 <div className=" border border-slate-200 shadow-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold " style={{ color: 'var(--color-text)' }}>Достижения</h2>
 <span className="text-sm text-slate-600">
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
 <p className="text-center text-slate-500 py-8">
 Пока нет разблокированных достижений
 </p>
 )}

 {achievements.length > 6 && (
 <button className="w-full mt-4 py-3 text-blue-600 hover:text-blue-500 transition-colors">
 Показать все достижения
 </button>
 )}
 </div>
 </div>
 </div>
 </div>

 {showAvatarPicker && (
 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="avatar-picker-title">
 <div className=" rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
 <h3 id="avatar-picker-title" className="text-xl font-semibold text-slate-900 mb-4">Выберите аватар</h3>

 <div className="mb-6">
 <label className="block w-full" htmlFor="avatar-upload">
 <input
 type="file"
 accept="image/*"
 onChange={(e) => { void handleCustomAvatarUpload(e); }}
 disabled={uploadingAvatar}
 className="hidden"
 id="avatar-upload"
 />
 <div
 role="button"
 tabIndex={0}
 onClick={() => document.getElementById('avatar-upload')?.click()}
 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('avatar-upload')?.click(); } }}
 className="w-full py-4 border-2 border-dashed border-blue-400 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-blue-50 hover:bg-blue-100"
 >
 <div className="text-center">
 {uploadingAvatar ? (
 <div className="flex items-center justify-center gap-2 text-blue-600">
 <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
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
 className="w-8 h-8 mx-auto mb-2 text-blue-600"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
 />
 </svg>
 <p className="text-blue-600 font-medium">Загрузить свое фото</p>
 <p className="text-slate-500 text-sm mt-1">PNG, JPG до 5MB</p>
 </>
 )}
 </div>
 </div>
 </label>
 </div>

 <div className="border-t border-slate-200 pt-4 mb-4">
 <p className="text-slate-600 text-sm mb-3">Или выберите готовый аватар:</p>
 </div>

 <div className="grid grid-cols-4 gap-3 mb-6">
 {AVATAR_OPTIONS.map((avatar, i) => (
 <button
 key={i}
 onClick={() => { void handleAvatarChange(avatar); }}
 className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
 user.avatar === avatar ? 'border-blue-500' : 'border-transparent'
 }`}
 >
 <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full" />
 </button>
 ))}
 </div>
 <button
 onClick={() => setShowAvatarPicker(false)}
 className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
 >
 Отмена
 </button>
 </div>
 </div>
 )}

 {isEditing && (
 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
 <div className=" rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
 <h3 id="edit-profile-title" className="text-xl font-semibold text-slate-900 mb-6">Редактировать профиль</h3>

 <div className="space-y-4">
 <div>
 <label htmlFor="edit-name" className="block text-sm text-slate-600 mb-2">Имя</label>
 <input
 id="edit-name"
 type="text"
 value={editForm.name}
 onChange={e => setEditForm({ ...editForm, name: e.target.value })}
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-blue-500 focus:outline-none"
 />
 </div>

 <div>
 <label htmlFor="edit-bio" className="block text-sm text-slate-600 mb-2">О себе</label>
 <textarea
 id="edit-bio"
 value={editForm.bio}
 onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
 rows={3}
 placeholder="Расскажите о себе..."
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-blue-500 focus:outline-none resize-none"
 />
 </div>

 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
 <div>
 <p className="text-slate-900 font-medium">Публичный профиль</p>
 <p className="text-sm text-slate-600">Другие смогут видеть ваш профиль</p>
 </div>
 <button
 onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}
 className={`w-12 h-6 rounded-full transition-colors ${
 editForm.isPublic ? 'bg-blue-500' : 'bg-slate-300'
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
 className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
 >
 Отмена
 </button>
 <button
 onClick={() => { void handleSave(); }}
 className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
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
