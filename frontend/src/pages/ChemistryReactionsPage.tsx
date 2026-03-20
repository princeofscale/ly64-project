import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import {
 CHEMICAL_REACTIONS,
 REACTION_CATEGORIES,
 CAT_COLOR,
 type ChemicalReaction,
} from '../data/chemistryReactions';

function ReactionCard({ reaction }: { reaction: ChemicalReaction }) {
 const [open, setOpen] = useState(false);
 const colors = CAT_COLOR[reaction.category] ?? CAT_COLOR['composition']!;
 const cat = REACTION_CATEGORIES.find(c => c.key === reaction.category);

 return (
 <div className={`bg-white border rounded-xl overflow-hidden transition-shadow hover:shadow-md ${colors.border}`}>
 {/* Header row */}
 <button
 className="w-full text-left p-4"
 onClick={() => setOpen(v => !v)}
 aria-expanded={open}
 >
 <div className="flex items-start gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-2 mb-1">
 <h3 className="font-bold  text-base leading-tight" style={{ color: 'var(--color-text)' }}>{reaction.name}</h3>
 {cat && (
 <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${colors.badge}`}>
 {cat.icon} {cat.label}
 </span>
 )}
 </div>
 <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{reaction.definition}</p>
 </div>
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={2}
 stroke="currentColor"
 className={`w-4 h-4 shrink-0 text-slate-400 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
 >
 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
 </svg>
 </div>
 </button>

 {/* Expandable body */}
 {open && (
 <div className={`border-t ${colors.border} p-4 space-y-3 ${colors.bg}/30`}>
 {/* General form */}
 {reaction.generalForm && (
 <div>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Общая схема</p>
 <p className="font-mono text-sm font-semibold text-slate-700">{reaction.generalForm}</p>
 </div>
 )}

 {/* Equation */}
 <div>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Пример реакции</p>
 <p className="font-mono text-sm font-semibold text-slate-900 break-words">{reaction.equation}</p>
 <p className="text-xs text-slate-500 mt-0.5">{reaction.equationNote}</p>
 </div>

 {/* Signs */}
 {reaction.signs && reaction.signs.length > 0 && (
 <div>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Признаки / особенности</p>
 <ul className="space-y-0.5">
 {reaction.signs.map((s, i) => (
 <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
 <span className="shrink-0 text-slate-400">•</span>
 {s}
 </li>
 ))}
 </ul>
 </div>
 )}

 {/* Note */}
 {reaction.note && (
 <p className="text-xs text-slate-500 border-l-2 border-slate-200 pl-2 leading-relaxed">
 💡 {reaction.note}
 </p>
 )}
 </div>
 )}
 </div>
 );
}

export default function ChemistryReactionsPage() {
 const [activeCategory, setActiveCategory] = useState<string>('all');
 const [search, setSearch] = useState('');

 const filtered = useMemo(() => {
 const q = search.trim().toLowerCase();
 return CHEMICAL_REACTIONS.filter(r => {
 const matchCat = activeCategory === 'all' || r.category === activeCategory;
 const matchSearch =
 !q ||
 r.name.toLowerCase().includes(q) ||
 r.definition.toLowerCase().includes(q) ||
 r.equation.toLowerCase().includes(q) ||
 (r.generalForm ?? '').toLowerCase().includes(q) ||
 (r.note ?? '').toLowerCase().includes(q) ||
 (r.signs ?? []).some(s => s.toLowerCase().includes(q));
 return matchCat && matchSearch;
 });
 }, [activeCategory, search]);

 // Group by category for display
 const grouped = useMemo(() => {
 const order = REACTION_CATEGORIES.map(c => c.key);
 const map = new Map<string, typeof filtered>();
 for (const r of filtered) {
 if (!map.has(r.category)) map.set(r.category, []);
 map.get(r.category)!.push(r);
 }
 return order
 .filter(k => map.has(k))
 .map(k => ({ key: k, items: map.get(k)! }));
 }, [filtered]);

 return (
 <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 <Header />

 <main className="max-w-4xl mx-auto px-4 py-8">
 {/* Title */}
 <div className="mb-8">
 <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
 &larr; Назад к дашборду
 </Link>
 <h1 className="text-3xl font-bold  mb-1" style={{ color: 'var(--color-text)' }}>Химические реакции</h1>
 <p className="text-slate-500">
 Типы, признаки, уравнения · {CHEMICAL_REACTIONS.length} видов реакций · нажмите карточку для деталей
 </p>
 </div>

 {/* Search */}
 <div className="relative mb-5">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="text"
 placeholder="Поиск по названию, уравнению, признакам..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
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

 {/* Category tabs */}
 <div className="flex flex-wrap gap-2 mb-6">
 <button
 onClick={() => setActiveCategory('all')}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
 activeCategory === 'all'
 ? 'bg-slate-800 text-white'
 : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 Все типы
 </button>
 {REACTION_CATEGORIES.map(cat => {
 const count = CHEMICAL_REACTIONS.filter(r => r.category === cat.key).length;
 return (
 <button
 key={cat.key}
 onClick={() => setActiveCategory(cat.key)}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
 activeCategory === cat.key
 ? 'bg-slate-800 text-white'
 : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 <span>{cat.icon}</span>
 <span className="hidden sm:inline">{cat.label}</span>
 <span className="text-xs opacity-60">({count})</span>
 </button>
 );
 })}
 </div>

 {/* Results count */}
 {(search || activeCategory !== 'all') && (
 <p className="text-sm text-slate-500 mb-4">
 {filtered.length > 0 ? `Найдено: ${filtered.length} реакций` : 'Ничего не найдено'}
 </p>
 )}

 {/* Content */}
 {filtered.length === 0 ? (
 <div className="text-center py-16">
 <p className="text-4xl mb-3">⚗️</p>
 <p className="text-lg font-medium text-slate-700">Ничего не найдено</p>
 <p className="text-sm text-slate-400 mt-1">Попробуйте другой запрос или категорию</p>
 </div>
 ) : activeCategory !== 'all' && !search ? (
 // Single category — flat list
 <div className="space-y-3">
 {filtered.map(r => <ReactionCard key={r.id} reaction={r} />)}
 </div>
 ) : (
 // All categories — grouped
 <div className="space-y-8">
 {grouped.map(({ key, items }) => {
 const cat = REACTION_CATEGORIES.find(c => c.key === key)!;
 const colors = CAT_COLOR[key] ?? CAT_COLOR['composition']!;
 return (
 <section key={key}>
 <div className="flex items-center gap-2 mb-3">
 <span className="text-lg">{cat.icon}</span>
 <h2 className="font-bold text-slate-700 text-base">{cat.label}</h2>
 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
 {items.length}
 </span>
 <div className="flex-1 h-px bg-slate-100" />
 </div>
 <div className="space-y-3">
 {items.map(r => <ReactionCard key={r.id} reaction={r} />)}
 </div>
 </section>
 );
 })}
 </div>
 )}

 {/* Quick-reference footer */}
 <div className="mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-5">
 <h3 className="font-bold text-slate-700 mb-3 text-sm">⚗️ Шпаргалка: условия и признаки</h3>
 <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600">
 <div>
 <p className="font-semibold text-slate-700 mb-1">Признаки протекания реакции</p>
 <ul className="space-y-0.5">
 <li>• Выпадение осадка (↓)</li>
 <li>• Выделение газа (↑)</li>
 <li>• Изменение цвета раствора</li>
 <li>• Выделение / поглощение теплоты</li>
 <li>• Появление запаха</li>
 </ul>
 </div>
 <div>
 <p className="font-semibold text-slate-700 mb-1">Условия необратимости (обмен)</p>
 <ul className="space-y-0.5">
 <li>• Осадок: BaSO₄↓, AgCl↓, CaCO₃↓…</li>
 <li>• Газ: CO₂↑, H₂S↑, NH₃↑…</li>
 <li>• Слабый электролит: H₂O, HF, NH₃·H₂O</li>
 </ul>
 </div>
 <div>
 <p className="font-semibold text-slate-700 mb-1">Степени окисления (ключевые)</p>
 <ul className="space-y-0.5">
 <li>• O: −2 (обычно), −1 (пероксиды)</li>
 <li>• H: +1 (обычно), −1 (с металлами)</li>
 <li>• Металлы I гр.: +1; II гр.: +2</li>
 <li>• S: −2, 0, +4, +6</li>
 <li>• N: −3, 0, +1…+5</li>
 </ul>
 </div>
 <div>
 <p className="font-semibold text-slate-700 mb-1">Органика — ключевые реагенты</p>
 <ul className="space-y-0.5">
 <li>• Br₂/CCl₄ → обесцвечивает = кратная связь</li>
 <li>• KMnO₄ → обесцвечивает = кратная связь</li>
 <li>• Na + спирт → H₂↑ (−OH группа)</li>
 <li>• AgNO₃/NH₃ → Ag↓ (альдегид)</li>
 </ul>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}
