import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';

// ─── Data ───────────────────────────────────────────────────────────────────

interface FormulaEntry {
 f: string; // function
 result: string; // derivative / integral
 note?: string; // condition / comment
 group: string; // category key
}

interface RuleEntry {
 name: string;
 formula: string;
 note?: string;
}

const DERIV_GROUPS: { key: string; label: string; color: string }[] = [
 { key: 'power', label: 'Степенные', color: 'blue' },
 { key: 'exp', label: 'Показательные', color: 'amber' },
 { key: 'log', label: 'Логарифмические', color: 'emerald' },
 { key: 'trig', label: 'Тригонометрия', color: 'violet' },
 { key: 'atrig', label: 'Обратные триг.', color: 'rose' },
];

const DERIV_TABLE: FormulaEntry[] = [
 // Power
 { f: 'c', result: '0', group: 'power' },
 { f: 'x', result: '1', group: 'power' },
 { f: 'xⁿ', result: 'n · xⁿ⁻¹', note: 'n ∈ ℝ', group: 'power' },
 { f: '√x', result: '1 / (2√x)', group: 'power' },
 { f: '1/x', result: '−1/x²', group: 'power' },
 { f: '1/xⁿ', result: '−n / xⁿ⁺¹', group: 'power' },
 // Exponential
 { f: 'eˣ', result: 'eˣ', group: 'exp' },
 { f: 'aˣ', result: 'aˣ · ln a', note: 'a > 0, a ≠ 1', group: 'exp' },
 // Logarithmic
 { f: 'ln x', result: '1/x', note: 'x > 0', group: 'log' },
 { f: 'log_a x', result: '1 / (x · ln a)', note: 'a > 0, a ≠ 1', group: 'log' },
 { f: 'ln|x|', result: '1/x', note: 'x ≠ 0', group: 'log' },
 // Trig
 { f: 'sin x', result: 'cos x', group: 'trig' },
 { f: 'cos x', result: '−sin x', group: 'trig' },
 { f: 'tg x', result: '1/cos²x', note: 'x ≠ π/2 + πn', group: 'trig' },
 { f: 'ctg x', result: '−1/sin²x', note: 'x ≠ πn', group: 'trig' },
 // Inverse trig
 { f: 'arcsin x', result: '1/√(1−x²)', note: '|x| < 1', group: 'atrig' },
 { f: 'arccos x', result: '−1/√(1−x²)', note: '|x| < 1', group: 'atrig' },
 { f: 'arctg x', result: '1/(1+x²)', group: 'atrig' },
 { f: 'arcctg x', result: '−1/(1+x²)', group: 'atrig' },
];

const DERIV_RULES: RuleEntry[] = [
 { name: 'Константа', formula: '(c · f)\' = c · f\'', note: 'c = const' },
 { name: 'Сумма / разность', formula: '(f ± g)\' = f\' ± g\'' },
 { name: 'Произведение', formula: '(f · g)\' = f\'g + fg\'' },
 { name: 'Частное', formula: '(f/g)\' = (f\'g − fg\') / g²', note: 'g ≠ 0' },
 { name: 'Цепочка (сложная ф.)',formula: '(f(g(x)))\' = f\'(g(x)) · g\'(x)', note: 'правило цепочки' },
];

const INTEG_GROUPS: { key: string; label: string; color: string }[] = [
 { key: 'power', label: 'Степенные', color: 'blue' },
 { key: 'exp', label: 'Показательные', color: 'amber' },
 { key: 'log', label: 'Логарифмические', color: 'emerald' },
 { key: 'trig', label: 'Тригонометрия', color: 'violet' },
 { key: 'atrig', label: 'Обратные триг.', color: 'rose' },
];

const INTEG_TABLE: FormulaEntry[] = [
 // Power
 { f: '0', result: 'C', group: 'power' },
 { f: '1', result: 'x + C', group: 'power' },
 { f: 'xⁿ', result: 'xⁿ⁺¹/(n+1) + C', note: 'n ≠ −1', group: 'power' },
 { f: '1/x', result: 'ln|x| + C', note: 'x ≠ 0', group: 'power' },
 { f: '√x', result: '(2/3)x^(3/2) + C', group: 'power' },
 { f: '1/√x', result: '2√x + C', group: 'power' },
 { f: '1/x²', result: '−1/x + C', group: 'power' },
 // Exponential
 { f: 'eˣ', result: 'eˣ + C', group: 'exp' },
 { f: 'aˣ', result: 'aˣ/ln a + C', note: 'a > 0, a ≠ 1', group: 'exp' },
 // Log (none as standalone ∫ — covered by 1/x)
 { f: 'ln x', result: 'x·ln x − x + C', note: 'x > 0', group: 'log' },
 // Trig
 { f: 'sin x', result: '−cos x + C', group: 'trig' },
 { f: 'cos x', result: 'sin x + C', group: 'trig' },
 { f: '1/cos²x', result: 'tg x + C', note: 'x ≠ π/2+πn', group: 'trig' },
 { f: '1/sin²x', result: '−ctg x + C', note: 'x ≠ πn', group: 'trig' },
 { f: 'tg x', result: '−ln|cos x| + C', group: 'trig' },
 { f: 'ctg x', result: 'ln|sin x| + C', group: 'trig' },
 // Inverse trig
 { f: '1/√(1−x²)', result: 'arcsin x + C', note: '|x| < 1', group: 'atrig' },
 { f: '−1/√(1−x²)', result: 'arccos x + C', note: '|x| < 1', group: 'atrig' },
 { f: '1/(1+x²)', result: 'arctg x + C', group: 'atrig' },
 { f: '−1/(1+x²)', result: 'arcctg x + C', group: 'atrig' },
];

const INTEG_RULES: RuleEntry[] = [
 { name: 'Линейность (константа)', formula: '∫c·f dx = c·∫f dx', note: 'c = const' },
 { name: 'Линейность (сумма)', formula: '∫(f±g) dx = ∫f dx ± ∫g dx' },
 { name: 'По частям', formula: '∫u dv = u·v − ∫v du', note: 'выбирай u = логарифм/степень' },
 { name: 'Замена переменной', formula: '∫f(g(x))·g\'(x) dx = ∫f(t) dt', note: 't = g(x)' },
 { name: 'Ньютона–Лейбница', formula: '∫[a→b] f(x) dx = F(b) − F(a)', note: 'F\' = f' },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

const GROUP_COLOR: Record<string, { border: string; badge: string; row: string }> = {
 power: { border: 'border-l-blue-400', badge: 'bg-blue-50 text-blue-700', row: 'bg-blue-50/40' },
 exp: { border: 'border-l-amber-400', badge: 'bg-amber-50 text-amber-700', row: 'bg-amber-50/40' },
 log: { border: 'border-l-emerald-400',badge: 'bg-emerald-50 text-emerald-700', row: 'bg-emerald-50/40' },
 trig: { border: 'border-l-violet-400', badge: 'bg-violet-50 text-violet-700',row: 'bg-violet-50/40' },
 atrig: { border: 'border-l-rose-400', badge: 'bg-rose-50 text-rose-700', row: 'bg-rose-50/40' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CalcTablePage() {
 const [tab, setTab] = useState<'deriv' | 'integ'>('deriv');
 const [search, setSearch] = useState('');
 const [activeGroup, setActiveGroup] = useState<string | null>(null);

 const table = tab === 'deriv' ? DERIV_TABLE : INTEG_TABLE;
 const groups = tab === 'deriv' ? DERIV_GROUPS : INTEG_GROUPS;
 const rules = tab === 'deriv' ? DERIV_RULES : INTEG_RULES;

 const filtered = useMemo(() => {
 const q = search.trim().toLowerCase();
 return table.filter(row => {
 const matchGroup = !activeGroup || row.group === activeGroup;
 const matchSearch =
 !q ||
 row.f.toLowerCase().includes(q) ||
 row.result.toLowerCase().includes(q) ||
 (row.note ?? '').toLowerCase().includes(q);
 return matchGroup && matchSearch;
 });
 }, [table, search, activeGroup]);

 return (
 <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 <Header />
 <main className="max-w-4xl mx-auto px-4 py-8">
 {/* Back + Title */}
 <div className="mb-8">
 <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
 &larr; Назад к дашборду
 </Link>
 <h1 className="text-3xl font-bold  mb-1" style={{ color: 'var(--color-text)' }}>Производные и интегралы</h1>
 <p className="text-slate-500">Таблицы и правила дифференцирования и интегрирования</p>
 </div>

 {/* Tab switcher */}
 <div className="flex gap-2 mb-6">
 {([
 { key: 'deriv', label:"f ′(x) — Производные" },
 { key: 'integ', label:"∫f dx — Интегралы" },
 ] as { key: 'deriv' | 'integ'; label: string }[]).map(t => (
 <button
 key={t.key}
 onClick={() => { setTab(t.key); setActiveGroup(null); setSearch(''); }}
 className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
 tab === t.key
 ? 'bg-slate-900 text-white shadow-sm'
 : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 {t.label}
 </button>
 ))}
 </div>

 {/* Rules card */}
 <div className=" border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
 {tab === 'deriv' ? 'Правила дифференцирования' : 'Правила интегрирования'}
 </h2>
 <div className="space-y-2">
 {rules.map((rule, i) => (
 <div key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
 <span className="text-xs font-semibold text-slate-500 w-40 shrink-0">{rule.name}</span>
 <span className="font-mono text-sm text-slate-900">{rule.formula}</span>
 {rule.note && <span className="text-xs text-slate-400 italic">{rule.note}</span>}
 </div>
 ))}
 </div>
 </div>

 {/* Search + group filter */}
 <div className="flex flex-wrap gap-3 mb-4">
 <div className="relative flex-1 min-w-[180px]">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="text"
 placeholder="Поиск по функции или результату..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
 />
 </div>
 <div className="flex flex-wrap gap-1">
 <button
 onClick={() => setActiveGroup(null)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
 !activeGroup ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 Все
 </button>
 {groups.map(g => (
 <button
 key={g.key}
 onClick={() => setActiveGroup(activeGroup === g.key ? null : g.key)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
 activeGroup === g.key
 ? 'bg-slate-800 text-white'
 : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 {g.label}
 </button>
 ))}
 </div>
 </div>

 {/* Formula table */}
 <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200">
 <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide w-8">#</th>
 <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
 {tab === 'deriv' ? 'f(x)' : 'f(x)'}
 </th>
 <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
 {tab === 'deriv' ?"f ′(x)" :"∫f(x) dx"}
 </th>
 <th className="px-4 py-3 text-left font-semibold text-slate-400 text-xs uppercase tracking-wide hidden sm:table-cell">Группа / условие</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((row, i) => {
 const c = GROUP_COLOR[row.group] ?? GROUP_COLOR['power']!;
 return (
 <tr key={i} className={`border-b border-slate-100 ${c.row} transition-colors hover:brightness-95`}>
 <td className="px-4 py-2.5 text-xs text-slate-400">{i + 1}</td>
 <td className={`px-4 py-2.5 border-l-4 ${c.border}`}>
 <span className="font-mono text-slate-900 font-medium">{row.f}</span>
 </td>
 <td className="px-4 py-2.5">
 <span className="font-mono text-slate-900">{row.result}</span>
 </td>
 <td className="px-4 py-2.5 hidden sm:table-cell">
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
 {groups.find(g => g.key === row.group)?.label}
 </span>
 {row.note && <span className="text-xs text-slate-400 italic">{row.note}</span>}
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 {filtered.length === 0 && (
 <div className="text-center py-10 text-slate-400 text-sm">Ничего не найдено</div>
 )}
 </div>

 {filtered.length > 0 && (
 <p className="text-xs text-slate-400 mt-2 text-right">{filtered.length} формул</p>
 )}

 {/* Newton–Leibniz hint for integrals */}
 {tab === 'integ' && (
 <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
 <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Формула Ньютона–Лейбница</p>
 <p className="font-mono text-sm text-amber-900">∫[a→b] f(x) dx = F(b) − F(a)</p>
 <p className="text-xs text-amber-600 mt-1">где F(x) — любая первообразная f(x), то есть F′(x) = f(x)</p>
 </div>
 )}

 {/* Chain rule visual for derivatives */}
 {tab === 'deriv' && (
 <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
 <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Правило цепочки — пример</p>
 <p className="font-mono text-sm text-blue-900">(sin(3x²))′ = cos(3x²) · (3x²)′ = cos(3x²) · 6x</p>
 <p className="text-xs text-blue-600 mt-1">Производная внешней функции × производная внутренней функции</p>
 </div>
 )}
 </main>
 </div>
 );
}
