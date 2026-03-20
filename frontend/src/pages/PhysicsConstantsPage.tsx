import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';

interface PhysConst {
 id: string;
 name: string;
 symbol: string;
 value: string;
 unit: string;
 description: string;
 category: string;
}

const CATEGORIES: { key: string; label: string; icon: string; color: string }[] = [
 { key: 'mechanics', label: 'Механика', icon: '⚙️', color: 'blue' },
 { key: 'thermo', label: 'Термодинамика', icon: '🌡️', color: 'orange' },
 { key: 'electro', label: 'Электромагнетизм',icon: '⚡', color: 'yellow' },
 { key: 'atomic', label: 'Атомная физика', icon: '⚛️', color: 'violet' },
 { key: 'astro', label: 'Астрономия', icon: '🌍', color: 'emerald' },
 { key: 'math', label: 'Математические', icon: '🔢', color: 'slate' },
];

const CAT_COLOR: Record<string, { badge: string; border: string; row: string }> = {
 mechanics: { badge: 'bg-blue-50 text-blue-700', border: 'border-l-blue-400', row: 'hover:bg-blue-50/40' },
 thermo: { badge: 'bg-orange-50 text-orange-700',border: 'border-l-orange-400', row: 'hover:bg-orange-50/40' },
 electro: { badge: 'bg-yellow-50 text-yellow-700',border: 'border-l-yellow-400', row: 'hover:bg-yellow-50/40' },
 atomic: { badge: 'bg-violet-50 text-violet-700',border: 'border-l-violet-400', row: 'hover:bg-violet-50/40' },
 astro: { badge: 'bg-emerald-50 text-emerald-700',border:'border-l-emerald-400',row: 'hover:bg-emerald-50/40' },
 math: { badge: 'bg-slate-100 text-slate-600', border: 'border-l-slate-400', row: 'hover:bg-slate-50/60' },
};

const CONSTANTS: PhysConst[] = [
 // Mechanics
 { id: 'g', name: 'Ускорение свободного падения', symbol: 'g', value: '9,8', unit: 'м/с²', category: 'mechanics', description: 'Ускорение, с которым все тела падают вблизи поверхности Земли (в вакууме). Точное значение: 9,80665 м/с².' },
 { id: 'G', name: 'Гравитационная постоянная', symbol: 'G', value: '6,674 · 10⁻¹¹', unit: 'Н·м²/кг²', category: 'mechanics', description: 'Коэффициент в законе всемирного тяготения Ньютона: F = G·m₁m₂/r².' },
 { id: 'atm', name: 'Стандартное атмосферное давление', symbol: 'p₀', value: '101 325', unit: 'Па', category: 'mechanics', description: 'Нормальное атмосферное давление. Часто принимают p₀ = 10⁵ Па = 100 кПа для расчётов.' },
 { id: 'rho_water', name: 'Плотность воды (4°C)', symbol: 'ρ_вода', value: '1000', unit: 'кг/м³', category: 'mechanics', description: 'Максимальная плотность воды при +4°C. При 20°C ≈ 998 кг/м³.' },
 { id: 'rho_air', name: 'Плотность воздуха', symbol: 'ρ_возд', value: '1,29', unit: 'кг/м³', category: 'mechanics', description: 'При нормальных условиях (0°C, 101325 Па). При 20°C ≈ 1,2 кг/м³.' },

 // Thermodynamics
 { id: 'R', name: 'Универсальная газовая постоянная', symbol: 'R', value: '8,314', unit: 'Дж/(моль·К)', category: 'thermo', description: 'Входит в уравнение Менделеева-Клапейрона: pV = νRT. Связывает R = Nₐ · k.' },
 { id: 'k', name: 'Постоянная Больцмана', symbol: 'k', value: '1,38 · 10⁻²³', unit: 'Дж/К', category: 'thermo', description: 'Связывает среднюю кинетическую энергию молекул с температурой: ⟨E⟩ = (3/2)kT.' },
 { id: 'Na', name: 'Число Авогадро', symbol: 'Nₐ', value: '6,022 · 10²³', unit: 'моль⁻¹', category: 'thermo', description: 'Число структурных единиц (атомов, молекул) в одном моле вещества.' },
 { id: 'T0', name: 'Абсолютный ноль / 0°C в кельвинах', symbol: 'T₀', value: '273,15', unit: 'К', category: 'thermo', description: 'T(К) = t(°C) + 273,15. Для расчётов часто принимают 273 К. Абсолютный ноль = 0 К = −273,15°C.' },
 { id: 'mu0', name: 'Молярная масса воздуха', symbol: 'μ_возд', value: '0,029', unit: 'кг/моль', category: 'thermo', description: 'Средняя молярная масса сухого воздуха (смесь N₂ ≈78%, O₂ ≈21%).' },

 // Electromagnetism
 { id: 'c', name: 'Скорость света в вакууме', symbol: 'c', value: '3 · 10⁸', unit: 'м/с', category: 'electro', description: 'Точное значение: 299 792 458 м/с. Максимальная скорость передачи информации и движения частиц.' },
 { id: 'e', name: 'Элементарный заряд', symbol: 'e', value: '1,6 · 10⁻¹⁹', unit: 'Кл', category: 'electro', description: 'Заряд одного протона (и по модулю — электрона). Наименьший свободно существующий заряд.' },
 { id: 'k_el',name: 'Константа Кулона', symbol: 'k', value: '9 · 10⁹', unit: 'Н·м²/Кл²', category: 'electro', description: 'Коэффициент в законе Кулона: F = k·q₁q₂/r². k = 1/(4πε₀).' },
 { id: 'eps0',name: 'Электрическая постоянная', symbol: 'ε₀', value: '8,85 · 10⁻¹²', unit: 'Ф/м', category: 'electro', description: 'Диэлектрическая проницаемость вакуума. ε₀ = 1/(4πk) = 8,854 · 10⁻¹² Ф/м.' },
 { id: 'mu0_magn', name: 'Магнитная постоянная', symbol: 'μ₀', value: '4π · 10⁻⁷', unit: 'Гн/м', category: 'electro', description: 'Магнитная проницаемость вакуума. μ₀ = 1,257 · 10⁻⁶ Гн/м. Входит в формулу индуктивности соленоида.' },

 // Atomic
 { id: 'me', name: 'Масса электрона', symbol: 'mₑ', value: '9,11 · 10⁻³¹', unit: 'кг', category: 'atomic', description: 'Масса покоя электрона. В единицах а.е.м.: mₑ ≈ 0,000549 а.е.м.' },
 { id: 'mp', name: 'Масса протона', symbol: 'mₚ', value: '1,673 · 10⁻²⁷', unit: 'кг', category: 'atomic', description: 'Масса покоя протона. В а.е.м.: mₚ ≈ 1,007276 а.е.м. Примерно в 1836 раз тяжелее электрона.' },
 { id: 'mn', name: 'Масса нейтрона', symbol: 'mₙ', value: '1,675 · 10⁻²⁷', unit: 'кг', category: 'atomic', description: 'Масса покоя нейтрона. В а.е.м.: mₙ ≈ 1,008665 а.е.м. Чуть тяжелее протона.' },
 { id: 'amu', name: 'Атомная единица массы', symbol: 'а.е.м.', value: '1,66 · 10⁻²⁷', unit: 'кг', category: 'atomic', description: '1/12 массы атома углерода-12. 1 а.е.м. = 1,66054 · 10⁻²⁷ кг ≈ 931,5 МэВ/c².' },
 { id: 'h', name: 'Постоянная Планка', symbol: 'h', value: '6,626 · 10⁻³⁴', unit: 'Дж·с', category: 'atomic', description: 'Квант действия. E = hν (энергия фотона). ℏ = h/(2π) = 1,055 · 10⁻³⁴ Дж·с.' },
 { id: 'ev', name: 'Электронвольт', symbol: 'эВ', value: '1,6 · 10⁻¹⁹', unit: 'Дж', category: 'atomic', description: 'Единица энергии: работа по перемещению заряда e через разность потенциалов 1 В. 1 эВ = 1,602 · 10⁻¹⁹ Дж.' },
 { id: 'r0_bohr', name: 'Радиус Бора (первая орбита)', symbol: 'a₀', value: '5,29 · 10⁻¹¹', unit: 'м', category: 'atomic', description: 'Радиус первой боровской орбиты атома водорода ≈ 0,053 нм. Характерный размер атома.' },

 // Astronomy
 { id: 'Me', name: 'Масса Земли', symbol: 'M⊕', value: '5,97 · 10²⁴', unit: 'кг', category: 'astro', description: 'Масса планеты Земля. Используется в задачах на тяготение и первую/вторую космические скорости.' },
 { id: 'Re', name: 'Радиус Земли (средний)', symbol: 'R⊕', value: '6,37 · 10⁶', unit: 'м', category: 'astro', description: 'Средний радиус Земли ≈ 6371 км. Экваториальный: 6378 км, полярный: 6357 км.' },
 { id: 'Ms', name: 'Масса Солнца', symbol: 'M☉', value: '1,99 · 10³⁰', unit: 'кг', category: 'astro', description: 'Масса Солнца ≈ 333 000 масс Земли. Составляет ~99,86% массы Солнечной системы.' },
 { id: 'au', name: 'Астрономическая единица', symbol: 'а.е.', value: '1,496 · 10¹¹', unit: 'м', category: 'astro', description: 'Среднее расстояние от Земли до Солнца ≈ 150 млн км. Единица расстояний в Солнечной системе.' },
 { id: 'ly', name: 'Световой год', symbol: 'св. год', value: '9,46 · 10¹⁵', unit: 'м', category: 'astro', description: 'Расстояние, которое свет проходит за один год. 1 св. год ≈ 9,46 · 10¹² км ≈ 63 241 а.е.' },

 // Math
 { id: 'pi', name: 'Число Пи', symbol: 'π', value: '3,14159265…', unit: 'б/р', category: 'math', description: 'Отношение длины окружности к диаметру. Трансцендентное число. Для задач: π ≈ 3,14.' },
 { id: 'euler', name: 'Число Эйлера', symbol: 'e', value: '2,71828182…', unit: 'б/р', category: 'math', description: 'Основание натурального логарифма. ln e = 1. Трансцендентное число. e = lim(1+1/n)ⁿ при n→∞.' },
 { id: 'sqrt2', name: 'Корень из двух', symbol: '√2', value: '1,41421356…', unit: 'б/р', category: 'math', description: 'Диагональ единичного квадрата. √2 ≈ 1,414. Встречается в тригонометрии: sin 45° = √2/2.' },
 { id: 'sqrt3', name: 'Корень из трёх', symbol: '√3', value: '1,73205080…', unit: 'б/р', category: 'math', description: 'Высота правильного треугольника со стороной 2. √3 ≈ 1,732. sin 60° = √3/2, tg 60° = √3.' },
];

export default function PhysicsConstantsPage() {
 const [activeCategory, setActiveCategory] = useState<string>('all');
 const [search, setSearch] = useState('');
 const [copiedId, setCopiedId] = useState<string | null>(null);

 const filtered = useMemo(() => {
 const q = search.trim().toLowerCase();
 return CONSTANTS.filter(c => {
 const matchCat = activeCategory === 'all' || c.category === activeCategory;
 const matchSearch =
 !q ||
 c.name.toLowerCase().includes(q) ||
 c.symbol.toLowerCase().includes(q) ||
 c.value.toLowerCase().includes(q) ||
 c.unit.toLowerCase().includes(q) ||
 c.description.toLowerCase().includes(q);
 return matchCat && matchSearch;
 });
 }, [activeCategory, search]);

 const handleCopy = (c: PhysConst) => {
 void navigator.clipboard.writeText(`${c.symbol} = ${c.value} ${c.unit}`);
 setCopiedId(c.id);
 setTimeout(() => setCopiedId(null), 1500);
 };

 return (
 <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 <Header />
 <main className="max-w-4xl mx-auto px-4 py-8">
 {/* Back + Title */}
 <div className="mb-8">
 <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
 &larr; Назад к дашборду
 </Link>
 <h1 className="text-3xl font-bold  mb-1" style={{ color: 'var(--color-text)' }}>Физические константы</h1>
 <p className="text-slate-500">Справочник основных констант для ЕГЭ по физике и химии · {CONSTANTS.length} констант</p>
 </div>

 {/* Search */}
 <div className="relative mb-5">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="text"
 placeholder="Поиск по названию, символу, значению..."
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
 activeCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 Все
 </button>
 {CATEGORIES.map(cat => {
 const count = CONSTANTS.filter(c => c.category === cat.key).length;
 return (
 <button
 key={cat.key}
 onClick={() => setActiveCategory(cat.key)}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
 activeCategory === cat.key ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 <span>{cat.icon}</span>
 <span className="hidden sm:inline">{cat.label}</span>
 <span className="text-xs opacity-60">({count})</span>
 </button>
 );
 })}
 </div>

 {/* Count when filtered */}
 {(search || activeCategory !== 'all') && (
 <p className="text-sm text-slate-500 mb-3">
 {filtered.length > 0 ? `Найдено: ${filtered.length}` : 'Ничего не найдено'}
 </p>
 )}

 {/* Cards grid */}
 {filtered.length === 0 ? (
 <div className="text-center py-16">
 <p className="text-4xl mb-3">🔍</p>
 <p className="text-lg font-medium text-slate-700">Ничего не найдено</p>
 </div>
 ) : (
 <div className="space-y-2">
 {filtered.map(c => {
 const colors = CAT_COLOR[c.category] ?? CAT_COLOR['math']!;
 const catInfo = CATEGORIES.find(cat => cat.key === c.category);
 const isCopied = copiedId === c.id;
 return (
 <div
 key={c.id}
 className={`bg-white border border-slate-200 rounded-xl p-4 border-l-4 ${colors.border} transition-all ${colors.row}`}
 >
 <div className="flex items-start gap-4">
 {/* Symbol */}
 <div className="shrink-0 w-16 text-center">
 <span className="font-mono text-lg font-bold text-slate-900">{c.symbol}</span>
 </div>

 {/* Main info */}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2 flex-wrap">
 <div>
 <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
 <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
 <span className="font-mono text-base font-bold text-slate-800">{c.value}</span>
 <span className="text-sm text-slate-500">{c.unit}</span>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 {catInfo && (
 <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-flex items-center gap-1 ${colors.badge}`}>
 {catInfo.icon} {catInfo.label}
 </span>
 )}
 <button
 onClick={() => handleCopy(c)}
 className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
 isCopied
 ? 'bg-emerald-100 text-emerald-700'
 : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
 }`}
 title="Копировать"
 >
 {isCopied ? '✓ Скопировано' : 'Копировать'}
 </button>
 </div>
 </div>
 <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{c.description}</p>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Quick reference card */}
 <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5">
 <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Самые важные для ЕГЭ</p>
 <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm font-mono">
 {[
 ['g', '9,8 м/с²'],
 ['c', '3 · 10⁸ м/с'],
 ['e', '1,6 · 10⁻¹⁹ Кл'],
 ['k (Кулон)', '9 · 10⁹ Н·м²/Кл²'],
 ['R', '8,314 Дж/(моль·К)'],
 ['Nₐ', '6,022 · 10²³ моль⁻¹'],
 ['h', '6,626 · 10⁻³⁴ Дж·с'],
 ['mₑ', '9,11 · 10⁻³¹ кг'],
 ].map(([sym, val]) => (
 <div key={sym} className="flex gap-2 py-0.5">
 <span className="font-bold text-blue-800 w-24 shrink-0">{sym}</span>
 <span className="text-blue-700">{val}</span>
 </div>
 ))}
 </div>
 </div>
 </main>
 </div>
 );
}
