import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import {
 LITERATURE_AUTHORS,
 AUTHOR_PERIODS,
 PERIOD_COLOR,
 type LiteratureAuthor,
} from '../data/literatureAuthors';

function AuthorModal({ author, onClose }: { author: LiteratureAuthor; onClose: () => void }) {
 const periodObj = AUTHOR_PERIODS.find(p => p.key === author.period);
 const colors = PERIOD_COLOR[author.period] ?? PERIOD_COLOR['20c']!;

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
 <div className="text-4xl shrink-0">{author.icon}</div>
 <div className="flex-1 min-w-0">
 <h2 className="text-xl font-bold  leading-tight" style={{ color: 'var(--color-text)' }}>{author.name}</h2>
 <p className="text-slate-600 text-sm mt-0.5">{author.born} – {author.died}</p>
 <div className="flex flex-wrap gap-2 mt-2">
 {periodObj && (
 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
 {periodObj.icon} {periodObj.label}
 </span>
 )}
 {author.genres.map((g, i) => (
 <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
 {g}
 </span>
 ))}
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
 {/* Bio */}
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Биография</h3>
 <p className="text-sm text-slate-700 leading-relaxed">{author.bio}</p>
 </div>

 {/* Quote */}
 {author.quote && (
 <div className={`${colors.bg} rounded-xl p-3 border ${colors.border}`}>
 <p className="text-sm text-slate-700 italic leading-relaxed">{author.quote}</p>
 </div>
 )}

 {/* Main works */}
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Главные произведения</h3>
 <ul className="space-y-1">
 {author.mainWorks.map((w, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
 <span className="shrink-0 text-slate-300 mt-0.5">▸</span>
 {w}
 </li>
 ))}
 </ul>
 </div>

 {/* EGE facts */}
 <div>
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Важно для ЕГЭ</h3>
 <ul className="space-y-1">
 {author.egeFacts.map((f, i) => (
 <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
 <span className={`shrink-0 font-bold mt-0.5 ${colors.badge.split(' ')[1]}`}>✓</span>
 {f}
 </li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function LiteratureAuthorsPage() {
 const [activePeriod, setActivePeriod] = useState<string>('all');
 const [search, setSearch] = useState('');
 const [selectedAuthor, setSelectedAuthor] = useState<LiteratureAuthor | null>(null);

 const filtered = useMemo(() => {
 const q = search.trim().toLowerCase();
 return LITERATURE_AUTHORS.filter(a => {
 const matchPeriod = activePeriod === 'all' || a.period === activePeriod;
 const matchSearch =
 !q ||
 a.name.toLowerCase().includes(q) ||
 a.bio.toLowerCase().includes(q) ||
 a.mainWorks.some(w => w.toLowerCase().includes(q)) ||
 a.genres.some(g => g.toLowerCase().includes(q)) ||
 a.egeFacts.some(f => f.toLowerCase().includes(q));
 return matchPeriod && matchSearch;
 });
 }, [activePeriod, search]);

 return (
 <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 <Header />

 {selectedAuthor && (
 <AuthorModal author={selectedAuthor} onClose={() => setSelectedAuthor(null)} />
 )}

 <main className="max-w-5xl mx-auto px-4 py-8">
 {/* Title */}
 <div className="mb-8">
 <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
 &larr; Назад к дашборду
 </Link>
 <h1 className="text-3xl font-bold  mb-1" style={{ color: 'var(--color-text)' }}>Биографии писателей</h1>
 <p className="text-slate-500">
 Авторы из программы ЕГЭ по литературе · {LITERATURE_AUTHORS.length} биографий · нажмите для подробностей
 </p>
 </div>

 {/* Search */}
 <div className="relative mb-5">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="text"
 placeholder="Поиск по имени, произведению, жанру..."
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

 {/* Period tabs */}
 <div className="flex flex-wrap gap-2 mb-6">
 <button
 onClick={() => setActivePeriod('all')}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
 activePeriod === 'all'
 ? 'bg-slate-800 text-white'
 : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 Все эпохи
 </button>
 {AUTHOR_PERIODS.map(p => {
 const count = LITERATURE_AUTHORS.filter(a => a.period === p.key).length;
 return (
 <button
 key={p.key}
 onClick={() => setActivePeriod(p.key)}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
 activePeriod === p.key
 ? 'bg-slate-800 text-white'
 : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 <span>{p.icon}</span>
 <span className="hidden sm:inline">{p.label}</span>
 <span className="text-xs opacity-60">({count})</span>
 </button>
 );
 })}
 </div>

 {/* Count */}
 {(search || activePeriod !== 'all') && (
 <p className="text-sm text-slate-500 mb-4">
 {filtered.length > 0 ? `Найдено: ${filtered.length} авторов` : 'Ничего не найдено'}
 </p>
 )}

 {/* Grid */}
 {filtered.length === 0 ? (
 <div className="text-center py-16">
 <p className="text-4xl mb-3">📚</p>
 <p className="text-lg font-medium text-slate-700">Ничего не найдено</p>
 <p className="text-sm text-slate-400 mt-1">Попробуйте другой запрос или эпоху</p>
 </div>
 ) : (
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {filtered.map(author => {
 const periodObj = AUTHOR_PERIODS.find(p => p.key === author.period);
 const colors = PERIOD_COLOR[author.period] ?? PERIOD_COLOR['20c']!;
 return (
 <button
 key={author.id}
 onClick={() => setSelectedAuthor(author)}
 className={`bg-white border rounded-2xl p-4 text-left hover:shadow-md transition-all hover:-translate-y-0.5 ${colors.border}`}
 >
 <div className="flex items-start gap-3">
 <div className="text-3xl shrink-0">{author.icon}</div>
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">{author.name}</p>
 <p className="text-xs text-slate-400 mt-0.5">{author.born} – {author.died}</p>
 <div className="flex flex-wrap gap-1.5 mt-2">
 {periodObj && (
 <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors.badge}`}>
 {periodObj.icon} {periodObj.label}
 </span>
 )}
 {author.genres.slice(0, 2).map((g, i) => (
 <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
 {g}
 </span>
 ))}
 </div>
 </div>
 </div>

 <div className="mt-3">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ключевые произведения</p>
 <ul className="space-y-0.5">
 {author.mainWorks.slice(0, 3).map((w, i) => (
 <li key={i} className="text-xs text-slate-600 truncate">▸ {w}</li>
 ))}
 </ul>
 </div>
 </button>
 );
 })}
 </div>
 )}
 </main>
 </div>
 );
}
