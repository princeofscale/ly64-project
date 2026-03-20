import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import {
 LITERATURE_WORKS,
 LITERATURE_EPOCHS,
 LITERATURE_GENRES,
 type LiteratureWork,
} from '../data/literatureWorks';

const EPOCH_COLOR: Record<string, { badge: string; border: string; bg: string }> = {
 ancient: { badge: 'bg-amber-50 text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50/30' },
 '18c': { badge: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200', bg: 'bg-yellow-50/30' },
 '19c_early':{ badge: 'bg-blue-50 text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50/30' },
 '19c_late': { badge: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50/30' },
 silver: { badge: 'bg-violet-50 text-violet-700', border: 'border-violet-200', bg: 'bg-violet-50/30' },
 '20c': { badge: 'bg-rose-50 text-rose-700', border: 'border-rose-200', bg: 'bg-rose-50/30' },
 foreign: { badge: 'bg-slate-100 text-slate-600', border: 'border-slate-200', bg: 'bg-slate-50/30' },
};

function WorkModal({ work, onClose }: { work: LiteratureWork; onClose: () => void }) {
 const epoch = LITERATURE_EPOCHS.find(e => e.key === work.epoch);
 const genre = LITERATURE_GENRES.find(g => g.key === work.genre);
 const colors = EPOCH_COLOR[work.epoch] ?? EPOCH_COLOR['foreign']!;

 return (
 <div
 className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
 onClick={onClose}
 >
 <div
 className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8"
 onClick={e => e.stopPropagation()}
 >
 {/* Header */}
 <div className={`p-6 border-b border-slate-100 ${colors.bg} rounded-t-2xl`}>
 <div className="flex items-start gap-4">
 <div className="text-4xl shrink-0">{work.icon}</div>
 <div className="flex-1 min-w-0">
 <h2 className="text-xl font-bold  leading-tight" style={{ color: 'var(--color-text)' }}>{work.title}</h2>
 <p className="text-slate-600 text-sm mt-0.5">{work.author} · {work.year}</p>
 <div className="flex flex-wrap gap-2 mt-2">
 {epoch && (
 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
 {epoch.icon} {epoch.label}
 </span>
 )}
 {genre && (
 <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
 {genre.label}
 </span>
 )}
 </div>
 </div>
 <button
 onClick={onClose}
 className="text-slate-400 hover:text-slate-600 shrink-0"
 aria-label="Закрыть"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 </div>

 {/* Body */}
 <div className="p-6 space-y-4">
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Краткое содержание</h3>
 <p className="text-sm text-slate-700 leading-relaxed">{work.summary}</p>
 </div>
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Темы и проблемы</h3>
 <div className="flex flex-wrap gap-2">
 {work.themes.map((t, i) => (
 <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors.badge}`}>
 {t}
 </span>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function LiteraturePage() {
 const [activeEpoch, setActiveEpoch] = useState<string>('all');
 const [activeGenre, setActiveGenre] = useState<string>('all');
 const [search, setSearch] = useState('');
 const [selectedWork, setSelectedWork] = useState<LiteratureWork | null>(null);

 const filtered = useMemo(() => {
 const q = search.trim().toLowerCase();
 return LITERATURE_WORKS.filter(w => {
 const matchEpoch = activeEpoch === 'all' || w.epoch === activeEpoch;
 const matchGenre = activeGenre === 'all' || w.genre === activeGenre;
 const matchSearch =
 !q ||
 w.title.toLowerCase().includes(q) ||
 w.author.toLowerCase().includes(q) ||
 w.year.toLowerCase().includes(q) ||
 w.summary.toLowerCase().includes(q) ||
 w.themes.some(t => t.toLowerCase().includes(q));
 return matchEpoch && matchGenre && matchSearch;
 });
 }, [activeEpoch, activeGenre, search]);

 return (
 <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 <Header />

 {selectedWork && (
 <WorkModal work={selectedWork} onClose={() => setSelectedWork(null)} />
 )}

 <main className="max-w-5xl mx-auto px-4 py-8">
 {/* Back + Title */}
 <div className="mb-8">
 <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
 &larr; Назад к дашборду
 </Link>
 <h1 className="text-3xl font-bold  mb-1" style={{ color: 'var(--color-text)' }}>Справочник по литературе</h1>
 <p className="text-slate-500">Произведения для ЕГЭ — содержание, темы, авторы · {LITERATURE_WORKS.length} произведений</p>
 </div>

 {/* Search */}
 <div className="relative mb-5">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="text"
 placeholder="Поиск по названию, автору, теме..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm"
 />
 {search && (
 <button
 onClick={() => setSearch('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
 aria-label="Очистить"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </div>

 {/* Epoch tabs */}
 <div className="flex flex-wrap gap-2 mb-3">
 <button
 onClick={() => setActiveEpoch('all')}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
 activeEpoch === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 Все эпохи
 </button>
 {LITERATURE_EPOCHS.map(ep => {
 const count = LITERATURE_WORKS.filter(w => w.epoch === ep.key).length;
 return (
 <button
 key={ep.key}
 onClick={() => setActiveEpoch(ep.key)}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
 activeEpoch === ep.key ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 <span>{ep.icon}</span>
 <span className="hidden sm:inline">{ep.label}</span>
 <span className="text-xs opacity-60">({count})</span>
 </button>
 );
 })}
 </div>

 {/* Genre tabs */}
 <div className="flex flex-wrap gap-2 mb-6">
 <button
 onClick={() => setActiveGenre('all')}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
 activeGenre === 'all' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
 }`}
 >
 Все жанры
 </button>
 {LITERATURE_GENRES.map(g => {
 const count = LITERATURE_WORKS.filter(w => w.genre === g.key && (activeEpoch === 'all' || w.epoch === activeEpoch)).length;
 if (count === 0) return null;
 return (
 <button
 key={g.key}
 onClick={() => setActiveGenre(g.key)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
 activeGenre === g.key ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
 }`}
 >
 {g.label} ({count})
 </button>
 );
 })}
 </div>

 {/* Count */}
 {(search || activeEpoch !== 'all' || activeGenre !== 'all') && (
 <p className="text-sm text-slate-500 mb-4">
 {filtered.length > 0 ? `Найдено: ${filtered.length} произведений` : 'Ничего не найдено'}
 </p>
 )}

 {/* Grid */}
 {filtered.length === 0 ? (
 <div className="text-center py-16">
 <p className="text-4xl mb-3">📚</p>
 <p className="text-lg font-medium text-slate-700">Ничего не найдено</p>
 <p className="text-sm text-slate-400 mt-1">Попробуйте другой запрос или фильтр</p>
 </div>
 ) : (
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {filtered.map(work => {
 const epoch = LITERATURE_EPOCHS.find(e => e.key === work.epoch);
 const genre = LITERATURE_GENRES.find(g => g.key === work.genre);
 const colors = EPOCH_COLOR[work.epoch] ?? EPOCH_COLOR['foreign']!;
 return (
 <button
 key={work.id}
 onClick={() => setSelectedWork(work)}
 className={`bg-white border rounded-2xl p-4 text-left hover:shadow-md transition-all hover:-translate-y-0.5 ${colors.border}`}
 >
 <div className="flex items-start gap-3">
 <div className="text-3xl shrink-0">{work.icon}</div>
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">{work.title}</p>
 <p className="text-xs text-slate-500 mt-0.5">{work.author}</p>
 <p className="text-xs text-slate-400 mt-0.5">{work.year}</p>
 <div className="flex flex-wrap gap-1.5 mt-2">
 {epoch && (
 <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors.badge}`}>
 {epoch.icon} {epoch.label}
 </span>
 )}
 {genre && (
 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
 {genre.label}
 </span>
 )}
 </div>
 </div>
 </div>
 <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">{work.summary}</p>
 </button>
 );
 })}
 </div>
 )}
 </main>
 </div>
 );
}
