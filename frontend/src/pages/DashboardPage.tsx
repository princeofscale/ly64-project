import {
 BarChart3,
 Trophy,
 ChevronRight,
 Calculator,
 Atom,
 Code,
 Dna,
 BookOpen,
 PenLine,
 FlaskConical,
 Globe,
 Map,
 Award,
 TrendingUp,
 ClipboardList,
 Landmark,
 Users,
 FunctionSquare,
 Layers,
 Flame,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import { AchievementCard } from '../components/AchievementCard';
import { UnfinishedTestBanner } from '../components/UnfinishedTestBanner';
import { getActiveTestService } from '../core/services';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

import type { AchievementWithStatus } from '../types/achievement';

interface DashboardStats {
 totalTests: number;
 averageScore: number;
 bestScore: number;
 currentStreak?: number;
}

const TOOLS = [
 { to: '/cheat-sheets', icon: Layers, label: 'Шпаргалки', color: 'text-blue-600 bg-blue-50 border-blue-200' },
 { to: '/flashcards', icon: ClipboardList, label: 'Флеш-карточки', color: 'text-violet-600 bg-violet-50 border-violet-200'},
 { to: '/theory', icon: BookOpen, label: 'Теория', color: 'text-emerald-600 bg-emerald-50 border-emerald-200'},
 { to: '/trig-table', icon: Calculator, label: 'Тригонометрия', color: 'text-orange-600 bg-orange-50 border-orange-200' },
 { to: '/calc-table', icon: FunctionSquare, label: 'Производные/∫', color: 'text-pink-600 bg-pink-50 border-pink-200' },
 { to: '/timeline', icon: Landmark, label: 'Лента истории', color: 'text-amber-600 bg-amber-50 border-amber-200' },
 { to: '/history-figures', icon: Users, label: 'Деятели ист.', color: 'text-yellow-600 bg-yellow-50 border-yellow-200'},
 { to: '/literature', icon: BookOpen, label: 'Литература', color: 'text-rose-600 bg-rose-50 border-rose-200' },
 { to: '/literature-authors', icon: Users, label: 'Писатели', color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200'},
 { to: '/chemistry-reactions',icon: FlaskConical, label: 'Реакции хим.', color: 'text-teal-600 bg-teal-50 border-teal-200' },
 { to: '/physics-constants', icon: Atom, label: 'Физ. константы', color: 'text-indigo-600 bg-indigo-50 border-indigo-200'},
 { to: '/literary-terms', icon: BookOpen, label: 'Термины лит.', color: 'text-purple-600 bg-purple-50 border-purple-200'},
 { to: '/social-terms', icon: Globe, label: 'Обществознание', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
];

const SUBJECTS = [
 {
 name: 'Математика',
 icon: Calculator,
 description: 'Подготовка к вступительным экзаменам',
 color: 'blue',
 subjectKey: 'MATHEMATICS',
 },
 {
 name: 'Физика',
 icon: Atom,
 description: 'Профильный предмет для техн. направлений',
 color: 'violet',
 subjectKey: 'PHYSICS',
 },
 {
 name: 'Информатика',
 icon: Code,
 description: 'Подготовка для программистов',
 color: 'emerald',
 subjectKey: 'INFORMATICS',
 },
 {
 name: 'Биология',
 icon: Dna,
 description: 'Для направлений медицина и биотехнологии',
 color: 'pink',
 subjectKey: 'BIOLOGY',
 },
 {
 name: 'Русский язык',
 icon: BookOpen,
 description: 'Обязательный предмет для всех',
 color: 'amber',
 subjectKey: 'RUSSIAN',
 },
 {
 name: 'Химия',
 icon: FlaskConical,
 description: 'Для медицинских и химических направлений',
 color: 'orange',
 subjectKey: 'CHEMISTRY',
 },
 {
 name: 'Обществознание',
 icon: Globe,
 description: 'Право, экономика, политика и общество',
 color: 'teal',
 subjectKey: 'SOCIAL',
 },
 {
 name: 'Литература',
 icon: PenLine,
 description: 'Анализ произведений, авторы и термины',
 color: 'rose',
 subjectKey: 'LITERATURE',
 },
];

const COLOR_CLASSES = {
 blue: {
 bg: 'bg-blue-50',
 border: 'border-blue-200',
 icon: 'text-blue-600',
 hover: 'hover:border-blue-300',
 },
 violet: {
 bg: 'bg-violet-50',
 border: 'border-violet-200',
 icon: 'text-violet-600',
 hover: 'hover:border-violet-300',
 },
 emerald: {
 bg: 'bg-emerald-50',
 border: 'border-emerald-200',
 icon: 'text-emerald-600',
 hover: 'hover:border-emerald-300',
 },
 pink: {
 bg: 'bg-pink-50',
 border: 'border-pink-200',
 icon: 'text-pink-600',
 hover: 'hover:border-pink-300',
 },
 amber: {
 bg: 'bg-amber-50',
 border: 'border-amber-200',
 icon: 'text-amber-600',
 hover: 'hover:border-amber-300',
 },
 orange: {
 bg: 'bg-orange-50',
 border: 'border-orange-200',
 icon: 'text-orange-600',
 hover: 'hover:border-orange-300',
 },
 teal: {
 bg: 'bg-teal-50',
 border: 'border-teal-200',
 icon: 'text-teal-600',
 hover: 'hover:border-teal-300',
 },
 rose: {
 bg: 'bg-rose-50',
 border: 'border-rose-200',
 icon: 'text-rose-600',
 hover: 'hover:border-rose-300',
 },
};

export default function DashboardPage() {
 const navigate = useNavigate();
 const { isAuthenticated, user } = useAuthStore();
 const [stats, setStats] = useState<DashboardStats | null>(null);
 const [recentAchievements, setRecentAchievements] = useState<AchievementWithStatus[]>([]);
 const [loading, setLoading] = useState(true);
 const [hasActiveTest, setHasActiveTest] = useState(false);

 const greeting = user?.name ? `Привет, ${user.name}` : 'Привет';
 const motivation = 'Готовы покорять новые вершины знаний?';

 useEffect(() => {
 const loadDashboardData = async () => {
 try {
 const [statsRes, achievementsRes] = await Promise.all([
 api.get('/users/stats'),
 api.get('/users/achievements'),
 ]);

 setStats(statsRes.data);

 const unlocked = achievementsRes.data.achievements
 .filter((a: AchievementWithStatus) => a.isUnlocked)
 .slice(0, 3);
 setRecentAchievements(unlocked);
 } catch {
 } finally {
 setLoading(false);
 }
 };

 void loadDashboardData();

 const activeTestService = getActiveTestService();
 setHasActiveTest(activeTestService.hasActiveTest());
 }, []);

 const handleSubjectClick = (subjectKey: string) => {
 if (hasActiveTest) {
 toast.error('Сначала завершите текущий тест');
 return;
 }
 void navigate(`/test/setup/${subjectKey}`);
 };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="flex flex-col items-center gap-4">
 <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
 <p className="text-slate-600 text-sm">Загрузка...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="relative min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 {/* Decorative blur circles */}
 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />
 <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-100/50 rounded-full blur-[80px] -z-10 pointer-events-none" />

 <div className="container-wide py-8 lg:py-12">
 {/* Header */}
 <header className="mb-10 animate-fade-in">
 <h1 className="text-3xl lg:text-4xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>
 {isAuthenticated ? (
 `${greeting}!`
 ) : (
 <>
 <Link to="/login" className="text-blue-600 hover:text-blue-700">
 Войдите
 </Link>
 <span className="text-slate-600"> в систему</span>
 </>
 )}
 </h1>
 <p className="text-lg text-slate-600">
 {isAuthenticated ? motivation : 'Готовы покорять новые вершины знаний?'}
 </p>
 </header>

 <UnfinishedTestBanner onAbandon={() => setHasActiveTest(false)} />

 {/* Streak banner */}
 {stats?.currentStreak !== undefined && stats.currentStreak > 0 && (
 <div className="mb-6 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 animate-fade-in">
 <Flame className="w-5 h-5 text-orange-500 shrink-0" />
 <p className="text-sm font-medium text-orange-700">
 Серия: <strong>{stats.currentStreak} {stats.currentStreak === 1 ? 'день' : stats.currentStreak < 5 ? 'дня' : 'дней'} подряд!</strong> Продолжай в том же духе 🔥
 </p>
 </div>
 )}

 <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-10">
 <StatCard
 title="Пройдено тестов"
 value={stats?.totalTests ?? 0}
 icon={BarChart3}
 trend={stats?.totalTests ? '+' + stats.totalTests : undefined}
 />
 <StatCard
 title="Средний балл"
 value={`${(stats?.averageScore ?? 0).toFixed(1)}%`}
 icon={TrendingUp}
 />
 <StatCard
 title="Лучший результат"
 value={`${stats?.bestScore ?? 0}%`}
 icon={Trophy}
 highlight
 />
 </section>

 {/* Tools section */}
 <section className="mb-10 animate-fade-in">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold " style={{ color: 'var(--color-text)' }}>Инструменты и справочники</h2>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
 {TOOLS.map(tool => {
 const Icon = tool.icon;
 const [textCls, bgCls, borderCls] = tool.color.split(' ');
 return (
 <Link
 key={tool.to}
 to={tool.to}
 className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${bgCls} ${borderCls} hover:shadow-sm hover:-translate-y-0.5 transition-all text-sm font-medium ${textCls}`}
 >
 <Icon className="w-4 h-4 shrink-0" />
 <span className="leading-tight">{tool.label}</span>
 </Link>
 );
 })}
 </div>
 </section>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 animate-fade-in">
 <Link
 to="/leaderboard"
 className="group flex items-center justify-between p-5 bg-amber-50 border border-amber-200 rounded-2xl hover:border-amber-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
 >
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
 <Trophy className="w-6 h-6 text-amber-600" />
 </div>
 <div>
 <h3 className="font-semibold " style={{ color: 'var(--color-text)' }}>Таблица лидеров</h3>
 <p className="text-sm text-slate-600">Соревнуйся с другими</p>
 </div>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
 </Link>

 <Link
 to="/knowledge-map"
 className="group flex items-center justify-between p-5 bg-indigo-50 border border-indigo-200 rounded-2xl hover:border-indigo-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
 >
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
 <Map className="w-6 h-6 text-indigo-600" />
 </div>
 <div>
 <h3 className="font-semibold " style={{ color: 'var(--color-text)' }}>Карта знаний</h3>
 <p className="text-sm text-slate-600">Отслеживай прогресс по темам</p>
 </div>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
 </Link>

 <Link
 to="/test-history"
 className="group flex items-center justify-between p-5 bg-violet-50 border border-violet-200 rounded-2xl hover:border-violet-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
 >
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
 <ClipboardList className="w-6 h-6 text-violet-600" />
 </div>
 <div>
 <h3 className="font-semibold " style={{ color: 'var(--color-text)' }}>История тестов</h3>
 <p className="text-sm text-slate-600">Все пройденные варианты</p>
 </div>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>

 {recentAchievements.length > 0 && (
 <section className="mb-10 animate-fade-in">
 <div className="flex items-center justify-between mb-5">
 <h2 className="text-xl font-semibold  flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
 <Award className="w-5 h-5 text-amber-600" />
 Недавние достижения
 </h2>
 <Link
 to="/profile"
 className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
 >
 Смотреть все
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {recentAchievements.map(achievement => (
 <AchievementCard
 key={achievement.id}
 achievement={achievement}
 isUnlocked={true}
 unlockedAt={achievement.unlockedAt}
 />
 ))}
 </div>
 </section>
 )}

 <section className="animate-fade-in">
 <div className="mb-5">
 <h2 className="text-xl font-semibold " style={{ color: 'var(--color-text)' }}>
 Начать подготовку
 </h2>
 <p className="text-sm text-slate-600 mt-1">
 {hasActiveTest
 ? 'Завершите текущий тест, чтобы начать новый'
 : 'Выберите предмет для тренировки'}
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {SUBJECTS.map(subject => (
 <SubjectCard
 key={subject.subjectKey}
 subject={subject}
 disabled={hasActiveTest}
 onClick={() => handleSubjectClick(subject.subjectKey)}
 />
 ))}
 </div>
 </section>
 </div>
 </div>
 );
}

interface StatCardProps {
 title: string;
 value: number | string;
 icon: React.ElementType;
 trend?: string;
 highlight?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, highlight }: StatCardProps) {
 return (
 <div
 className={`
 p-6 rounded-2xl border transition-all duration-300
 ${
 highlight
 ? 'bg-blue-50 border-blue-200'
 : 'bg-white border-slate-200'
 }
 shadow-lg hover:shadow-xl hover:-translate-y-1
 `}
 >
 <div className="flex items-start justify-between mb-3">
 <div
 className={`
 w-12 h-12 rounded-xl flex items-center justify-center
 ${highlight ? 'bg-blue-100' : 'bg-slate-100'}
 `}
 >
 <Icon
 className={`w-6 h-6 ${highlight ? 'text-blue-600' : 'text-slate-600'}`}
 />
 </div>
 {trend && (
 <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
 {trend}
 </span>
 )}
 </div>
 <p className="text-sm text-slate-600 mb-1">{title}</p>
 <p
 className={`text-3xl font-bold ${highlight ? 'text-blue-600' : 'text-slate-900'}`}
 >
 {value}
 </p>
 </div>
 );
}

interface SubjectCardProps {
 subject: (typeof SUBJECTS)[0];
 disabled?: boolean;
 onClick: () => void;
}

function SubjectCard({ subject, disabled, onClick }: SubjectCardProps) {
 const Icon = subject.icon;
 const colors = COLOR_CLASSES[subject.color as keyof typeof COLOR_CLASSES];

 return (
 <button
 onClick={onClick}
 disabled={disabled}
 className={`
 w-full text-left p-6 rounded-2xl border-2 transition-all duration-300
 bg-white ${colors.border} ${!disabled && colors.hover}
 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1'}
 group
 `}
 >
 <div
 className={`
 w-12 h-12 rounded-xl flex items-center justify-center mb-4
 ${colors.bg}
 `}
 >
 <Icon className={`w-6 h-6 ${colors.icon}`} />
 </div>

 <h3 className="font-semibold  mb-1" style={{ color: 'var(--color-text)' }}>{subject.name}</h3>

 <p className="text-sm text-slate-600 mb-4 line-clamp-2">
 {subject.description}
 </p>

 <span
 className={`
 text-sm font-medium ${colors.icon}
 inline-flex items-center gap-1
 ${!disabled && 'group-hover:gap-2'} transition-all
 `}
 >
 {disabled ? 'Недоступно' : 'Начать'}
 {!disabled && <ChevronRight className="w-4 h-4" />}
 </span>
 </button>
 );
}
