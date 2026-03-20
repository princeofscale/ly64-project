import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';

interface HistoryAttempt {
 id: string;
 score: number;
 correctCount: number;
 totalQuestions: number;
 completedAt: string | null;
 startedAt: string;
 test: {
 title: string;
 subject: string;
 examType: string;
 targetGrade: string | null;
 };
}

const SUBJECT_LABELS: Record<string, string> = {
 MATHEMATICS: 'Математика',
 RUSSIAN: 'Русский язык',
 PHYSICS: 'Физика',
 BIOLOGY: 'Биология',
 CHEMISTRY: 'Химия',
 INFORMATICS: 'Информатика',
 HISTORY: 'История',
 ENGLISH: 'Английский язык',
 SOCIAL: 'Обществознание',
};

const SUBJECT_COLORS: Record<string, string> = {
 MATHEMATICS: 'bg-cyan-100 text-cyan-700',
 RUSSIAN: 'bg-red-100 text-red-700',
 PHYSICS: 'bg-purple-100 text-purple-700',
 BIOLOGY: 'bg-lime-100 text-lime-700',
 CHEMISTRY: 'bg-green-100 text-green-700',
 INFORMATICS: 'bg-blue-100 text-blue-700',
 HISTORY: 'bg-amber-100 text-amber-700',
 ENGLISH: 'bg-sky-100 text-sky-700',
 SOCIAL: 'bg-teal-100 text-teal-700',
};

const EXAM_LABELS: Record<string, string> = {
 OGE: 'ОГЭ',
 EGE: 'ЕГЭ',
 VPR: 'ВПР',
 REGULAR: 'Тест',
 LYCEUM_ENTRANCE: 'Вступительный',
};

function scoreTextColor(score: number) {
 if (score >= 80) return 'text-green-600';
 if (score >= 60) return 'text-yellow-600';
 if (score >= 40) return 'text-orange-500';
 return 'text-red-500';
}

function scoreBarColor(score: number) {
 if (score >= 80) return 'bg-green-500';
 if (score >= 60) return 'bg-yellow-500';
 if (score >= 40) return 'bg-orange-400';
 return 'bg-red-400';
}

function formatDate(dateStr: string) {
 return new Date(dateStr).toLocaleDateString('ru-RU', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 });
}

function ScoreTrendChart({ attempts }: { attempts: HistoryAttempt[] }) {
 const data = useMemo(
 () =>
 [...attempts]
 .filter(a => a.completedAt)
 .reverse()
 .slice(-30),
 [attempts]
 );

 if (data.length < 2) return null;

 const W = 500;
 const H = 80;
 const padX = 12;
 const padY = 8;
 const chartW = W - padX * 2;
 const chartH = H - padY * 2;

 const scores = data.map(d => d.score);
 const rawMin = Math.min(...scores);
 const rawMax = Math.max(...scores);
 const minY = Math.max(0, rawMin - 15);
 const maxY = Math.min(100, rawMax + 15);
 const range = maxY - minY || 1;

 const pts = data.map((d, i) => ({
 x: padX + (i / (data.length - 1)) * chartW,
 y: padY + chartH - ((d.score - minY) / range) * chartH,
 score: d.score,
 }));

 const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
 const areaPath = `${linePath} L ${pts[pts.length - 1]!.x.toFixed(1)} ${padY + chartH} L ${pts[0]!.x.toFixed(1)} ${padY + chartH} Z`;

 // 80% guide line Y position
 const line80Y = padY + chartH - ((80 - minY) / range) * chartH;
 const show80Line = line80Y > padY && line80Y < padY + chartH;

 const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

 return (
 <div className=" border border-slate-200 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-center justify-between mb-3">
 <span className="text-sm font-semibold text-slate-700">Динамика результатов</span>
 <div className="flex items-center gap-3 text-xs text-slate-400">
 <span>последние {data.length} тестов</span>
 <span>
 среднее:
 <span className={`ml-1 font-bold ${scoreTextColor(avgScore)}`}>{avgScore}%</span>
 </span>
 </div>
 </div>
 <svg
 viewBox={`0 0 ${W} ${H}`}
 className="w-full"
 style={{ height: 80 }}
 preserveAspectRatio="none"
 >
 <defs>
 <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
 <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
 </linearGradient>
 </defs>
 {show80Line && (
 <line
 x1={padX}
 y1={line80Y}
 x2={padX + chartW}
 y2={line80Y}
 stroke="#22c55e"
 strokeWidth="1"
 strokeDasharray="5 4"
 opacity="0.6"
 />
 )}
 <path d={areaPath} fill="url(#histGrad)" />
 <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
 {pts.map((p, i) => (
 <circle
 key={i}
 cx={p.x}
 cy={p.y}
 r={i === pts.length - 1 ? 5 : 3}
 fill={i === pts.length - 1 ? '#2563eb' : '#93c5fd'}
 />
 ))}
 </svg>
 <div className="flex justify-between text-[10px] text-slate-400 mt-1">
 <span>{formatDate(data[0]!.completedAt!)}</span>
 {show80Line && <span className="text-green-500 font-medium">── 80%</span>}
 <span>{formatDate(data[data.length - 1]!.completedAt!)}</span>
 </div>
 </div>
 );
}

export default function TestHistoryPage() {
 const navigate = useNavigate();
 const [attempts, setAttempts] = useState<HistoryAttempt[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedSubject, setSelectedSubject] = useState('ALL');

 useEffect(() => {
 const load = async () => {
 try {
 const res = await api.get<{ success: boolean; data: HistoryAttempt[] }>('/tests/my-history');
 if (res.data.success) setAttempts(res.data.data);
 } catch {
 // ignore
 } finally {
 setLoading(false);
 }
 };
 void load();
 }, []);

 const subjects = useMemo(
 () => ['ALL', ...Array.from(new Set(attempts.map(a => a.test.subject)))],
 [attempts]
 );

 const filtered = useMemo(
 () => (selectedSubject === 'ALL' ? attempts : attempts.filter(a => a.test.subject === selectedSubject)),
 [attempts, selectedSubject]
 );

 // Stats for selected filter
 const avgScore = useMemo(() => {
 if (!filtered.length) return 0;
 return Math.round(filtered.reduce((s, a) => s + a.score, 0) / filtered.length);
 }, [filtered]);

 const bestScore = useMemo(() => (filtered.length ? Math.max(...filtered.map(a => a.score)) : 0), [filtered]);

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
 </div>
 );
 }

 return (
 <div className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-3xl mx-auto">

 {/* Back */}
 <button
 onClick={() => void navigate('/dashboard')}
 className="group mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
 >
 <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
 </svg>
 Назад к главной
 </button>

 {/* Header */}
 <div className="flex items-start justify-between mb-6">
 <div>
 <h1 className="text-3xl font-bold " style={{ color: 'var(--color-text)' }}>История тестов</h1>
 <p className="text-slate-500 text-sm mt-1">Все пройденные варианты и задания</p>
 </div>
 <div className="flex gap-3">
 <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2 text-center">
 <div className="text-2xl font-bold text-blue-600">{attempts.length}</div>
 <div className="text-xs text-blue-500">всего</div>
 </div>
 {attempts.length > 0 && (
 <>
 <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-2 text-center">
 <div className="text-2xl font-bold text-green-600">{bestScore}%</div>
 <div className="text-xs text-green-500">лучший</div>
 </div>
 <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-2 text-center">
 <div className="text-2xl font-bold text-violet-600">{avgScore}%</div>
 <div className="text-xs text-violet-500">среднее</div>
 </div>
 </>
 )}
 </div>
 </div>

 {/* Chart */}
 {attempts.length >= 2 && (
 <div className="mb-6">
 <ScoreTrendChart attempts={attempts} />
 </div>
 )}

 {/* Subject filter */}
 {subjects.length > 2 && (
 <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
 {subjects.map(s => (
 <button
 key={s}
 onClick={() => setSelectedSubject(s)}
 className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-sm font-medium transition-colors shrink-0 ${
 selectedSubject === s
 ? 'bg-blue-600 text-white shadow-sm'
 : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
 }`}
 >
 {s === 'ALL' ? `Все (${attempts.length})` : `${SUBJECT_LABELS[s] ?? s} (${attempts.filter(a => a.test.subject === s).length})`}
 </button>
 ))}
 </div>
 )}

 {/* Empty state */}
 {filtered.length === 0 && (
 <div className="text-center py-24">
 <div className="text-6xl mb-4">📋</div>
 <p className="text-slate-600 font-medium">Тестов пока нет</p>
 <p className="text-slate-400 text-sm mt-2">Пройдите первый тест на главной странице</p>
 <button
 onClick={() => void navigate('/dashboard')}
 className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
 >
 На главную
 </button>
 </div>
 )}

 {/* List */}
 {filtered.length > 0 && (
 <div className="space-y-3">
 {filtered.map(attempt => (
 <div
 key={attempt.id}
 className=" border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:border-slate-300 transition-all" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-start gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1.5 flex-wrap">
 <span
 className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${SUBJECT_COLORS[attempt.test.subject] ?? 'bg-slate-100 text-slate-700'}`}
 >
 {SUBJECT_LABELS[attempt.test.subject] ?? attempt.test.subject}
 </span>
 <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium">
 {EXAM_LABELS[attempt.test.examType] ?? attempt.test.examType}
 </span>
 </div>
 <p className="text-sm font-medium text-slate-800 truncate">{attempt.test.title}</p>
 <p className="text-xs text-slate-400 mt-0.5">
 {attempt.completedAt ? formatDate(attempt.completedAt) : '—'}
 </p>
 </div>
 <div className="shrink-0 text-right">
 <div className={`text-2xl font-bold leading-none ${scoreTextColor(attempt.score)}`}>
 {attempt.score}%
 </div>
 {attempt.totalQuestions > 0 && (
 <div className="text-xs text-slate-400 mt-0.5">
 {attempt.correctCount}&thinsp;/&thinsp;{attempt.totalQuestions}
 </div>
 )}
 </div>
 </div>
 <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(attempt.score)}`}
 style={{ width: `${attempt.score}%` }}
 />
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
