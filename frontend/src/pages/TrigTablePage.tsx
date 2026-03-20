import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';

interface TrigRow {
 deg: number;
 rad: string; // symbolic, e.g. 'π/6'
 radDecimal: number; // for unit circle
 sin: string;
 cos: string;
 tg: string;
 ctg: string;
 sinVal: number | null; // numeric for color
 cosVal: number | null;
 tgVal: number | null;
 ctgVal: number | null;
 quadrant: 1 | 2 | 3 | 4 | 0; // 0 = axis
}

const UNDEF = '—';
const S2 = '√2/2';
const S3 = '√3/2';
const S33 = '√3/3';

const ROWS: TrigRow[] = [
 { deg: 0, rad: '0', radDecimal: 0, sin: '0', cos: '1', tg: '0', ctg: UNDEF, sinVal: 0, cosVal: 1, tgVal: 0, ctgVal: null, quadrant: 0 },
 { deg: 30, rad: 'π/6', radDecimal: Math.PI / 6, sin: '1/2', cos: S3, tg: S33, ctg: '√3', sinVal: 0.5, cosVal: 0.866, tgVal: 0.577, ctgVal: 1.732, quadrant: 1 },
 { deg: 45, rad: 'π/4', radDecimal: Math.PI / 4, sin: S2, cos: S2, tg: '1', ctg: '1', sinVal: 0.707, cosVal: 0.707, tgVal: 1, ctgVal: 1, quadrant: 1 },
 { deg: 60, rad: 'π/3', radDecimal: Math.PI / 3, sin: S3, cos: '1/2', tg: '√3', ctg: S33, sinVal: 0.866, cosVal: 0.5, tgVal: 1.732, ctgVal: 0.577, quadrant: 1 },
 { deg: 90, rad: 'π/2', radDecimal: Math.PI / 2, sin: '1', cos: '0', tg: UNDEF, ctg: '0', sinVal: 1, cosVal: 0, tgVal: null, ctgVal: 0, quadrant: 0 },
 { deg: 120, rad: '2π/3', radDecimal: 2 * Math.PI / 3,sin: S3, cos: '-1/2', tg: '-√3', ctg: '-'+S33,sinVal: 0.866, cosVal: -0.5, tgVal: -1.732, ctgVal: -0.577, quadrant: 2 },
 { deg: 135, rad: '3π/4', radDecimal: 3 * Math.PI / 4,sin: S2, cos: '-'+S2, tg: '-1', ctg: '-1', sinVal: 0.707, cosVal: -0.707, tgVal: -1, ctgVal: -1, quadrant: 2 },
 { deg: 150, rad: '5π/6', radDecimal: 5 * Math.PI / 6,sin: '1/2', cos: '-'+S3, tg: '-'+S33,ctg: '-√3', sinVal: 0.5, cosVal: -0.866, tgVal: -0.577, ctgVal: -1.732, quadrant: 2 },
 { deg: 180, rad: 'π', radDecimal: Math.PI, sin: '0', cos: '-1', tg: '0', ctg: UNDEF, sinVal: 0, cosVal: -1, tgVal: 0, ctgVal: null, quadrant: 0 },
 { deg: 210, rad: '7π/6', radDecimal: 7 * Math.PI / 6,sin: '-1/2',cos: '-'+S3, tg: S33, ctg: '√3', sinVal: -0.5, cosVal: -0.866, tgVal: 0.577, ctgVal: 1.732, quadrant: 3 },
 { deg: 225, rad: '5π/4', radDecimal: 5 * Math.PI / 4,sin: '-'+S2,cos: '-'+S2, tg: '1', ctg: '1', sinVal: -0.707, cosVal: -0.707, tgVal: 1, ctgVal: 1, quadrant: 3 },
 { deg: 240, rad: '4π/3', radDecimal: 4 * Math.PI / 3,sin: '-'+S3,cos: '-1/2', tg: '√3', ctg: S33, sinVal: -0.866, cosVal: -0.5, tgVal: 1.732, ctgVal: 0.577, quadrant: 3 },
 { deg: 270, rad: '3π/2', radDecimal: 3 * Math.PI / 2,sin: '-1', cos: '0', tg: UNDEF, ctg: '0', sinVal: -1, cosVal: 0, tgVal: null, ctgVal: 0, quadrant: 0 },
 { deg: 300, rad: '5π/3', radDecimal: 5 * Math.PI / 3,sin: '-'+S3,cos: '1/2', tg: '-√3', ctg: '-'+S33,sinVal: -0.866, cosVal: 0.5, tgVal: -1.732, ctgVal: -0.577, quadrant: 4 },
 { deg: 315, rad: '7π/4', radDecimal: 7 * Math.PI / 4,sin: '-'+S2,cos: S2, tg: '-1', ctg: '-1', sinVal: -0.707, cosVal: 0.707, tgVal: -1, ctgVal: -1, quadrant: 4 },
 { deg: 330, rad: '11π/6', radDecimal: 11 * Math.PI / 6,sin: '-1/2',cos: S3, tg: '-'+S33,ctg: '-√3', sinVal: -0.5, cosVal: 0.866, tgVal: -0.577, ctgVal: -1.732, quadrant: 4 },
 { deg: 360, rad: '2π', radDecimal: 2 * Math.PI, sin: '0', cos: '1', tg: '0', ctg: UNDEF, sinVal: 0, cosVal: 1, tgVal: 0, ctgVal: null, quadrant: 0 },
];

function valColor(v: number | null): string {
 if (v === null) return 'text-slate-300';
 if (v > 0) return 'text-emerald-600 font-medium';
 if (v < 0) return 'text-rose-600 font-medium';
 return 'text-slate-500';
}

const QUADRANT_LABELS: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 0: 'Ось' };

// SVG unit circle component
function UnitCircle({ row }: { row: TrigRow }) {
 const R = 80;
 const cx = 100;
 const cy = 100;
 const rad = row.radDecimal;
 const px = cx + R * Math.cos(rad);
 const py = cy - R * Math.sin(rad); // SVG y is flipped

 return (
 <svg width="200" height="200" viewBox="0 0 200 200" className="w-full max-w-[200px]">
 {/* Axes */}
 <line x1="10" y1={cy} x2="190" y2={cy} stroke="#cbd5e1" strokeWidth="1" />
 <line x1={cx} y1="10" x2={cx} y2="190" stroke="#cbd5e1" strokeWidth="1" />
 {/* Axis arrows */}
 <polygon points={`190,${cy} 184,${cy-4} 184,${cy+4}`} fill="#cbd5e1" />
 <polygon points={`${cx},10 ${cx-4},16 ${cx+4},16`} fill="#cbd5e1" />
 {/* Axis labels */}
 <text x="192" y={cy + 4} fontSize="10" fill="#94a3b8">x</text>
 <text x={cx + 4} y="10" fontSize="10" fill="#94a3b8">y</text>
 {/* Unit circle */}
 <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
 {/* Radius line */}
 <line x1={cx} y1={cy} x2={px} y2={py} stroke="#3b82f6" strokeWidth="2" />
 {/* sin dashed line (vertical from point to x-axis) */}
 <line x1={px} y1={cy} x2={px} y2={py} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />
 {/* cos dashed line (horizontal from origin to point's x) */}
 <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
 {/* Point on circle */}
 <circle cx={px} cy={py} r="5" fill="#3b82f6" />
 {/* Degree label near point */}
 <text
 x={px + (Math.cos(rad) >= 0 ? 7 : -7)}
 y={py - (Math.sin(rad) >= 0 ? 6 : -6)}
 fontSize="11"
 fontWeight="600"
 fill="#1e40af"
 textAnchor={Math.cos(rad) >= 0 ? 'start' : 'end'}
 >
 {row.deg}°
 </text>
 {/* Legend */}
 <rect x="4" y="170" width="8" height="2" fill="#10b981" rx="1" />
 <text x="14" y="174" fontSize="9" fill="#10b981">sin</text>
 <rect x="34" y="170" width="8" height="2" fill="#f59e0b" rx="1" />
 <text x="44" y="174" fontSize="9" fill="#f59e0b">cos</text>
 <rect x="62" y="170" width="8" height="2" fill="#3b82f6" rx="1" />
 <text x="72" y="174" fontSize="9" fill="#3b82f6">r=1</text>
 </svg>
 );
}

export default function TrigTablePage() {
 const [selectedDeg, setSelectedDeg] = useState<number>(30);
 const [filterQ, setFilterQ] = useState<number | null>(null);
 const [search, setSearch] = useState('');
 const [showRadians, setShowRadians] = useState(true);

 const selectedRow = ROWS.find(r => r.deg === selectedDeg) ?? ROWS[1]!;

 const filtered = ROWS.filter(row => {
 if (filterQ !== null && row.quadrant !== filterQ) return false;
 if (search.trim()) {
 const q = search.trim().toLowerCase();
 return (
 row.deg.toString().includes(q) ||
 row.rad.toLowerCase().includes(q) ||
 row.sin.toLowerCase().includes(q) ||
 row.cos.toLowerCase().includes(q) ||
 row.tg.toLowerCase().includes(q) ||
 row.ctg.toLowerCase().includes(q)
 );
 }
 return true;
 });

 return (
 <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 <Header />
 <main className="max-w-5xl mx-auto px-4 py-8">
 {/* Back + Title */}
 <div className="mb-8">
 <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
 &larr; Назад к дашборду
 </Link>
 <h1 className="text-3xl font-bold  mb-1" style={{ color: 'var(--color-text)' }}>Таблица тригонометрии</h1>
 <p className="text-slate-500">Значения sin, cos, tg, ctg для основных углов</p>
 </div>

 <div className="grid lg:grid-cols-[1fr_220px] gap-6">
 {/* Left: table */}
 <div>
 {/* Controls */}
 <div className="flex flex-wrap items-center gap-3 mb-4">
 {/* Search */}
 <div className="relative flex-1 min-w-[180px]">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="text"
 placeholder="Угол, значение..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
 />
 </div>

 {/* Quadrant filter */}
 <div className="flex gap-1">
 {([null, 1, 2, 3, 4] as (number | null)[]).map(q => (
 <button
 key={String(q)}
 onClick={() => setFilterQ(q)}
 className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
 filterQ === q
 ? 'bg-blue-600 text-white'
 : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 {q === null ? 'Все' : `Q${q}`}
 </button>
 ))}
 </div>

 {/* Radians toggle */}
 <button
 onClick={() => setShowRadians(!showRadians)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
 showRadians
 ? 'bg-violet-600 text-white border-violet-600'
 : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 Радианы
 </button>
 </div>

 {/* Table */}
 <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200">
 <th className="px-3 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">°</th>
 {showRadians && <th className="px-3 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">рад</th>}
 <th className="px-3 py-3 text-center font-semibold text-emerald-600 text-xs uppercase tracking-wide">sin</th>
 <th className="px-3 py-3 text-center font-semibold text-amber-600 text-xs uppercase tracking-wide">cos</th>
 <th className="px-3 py-3 text-center font-semibold text-blue-600 text-xs uppercase tracking-wide">tg</th>
 <th className="px-3 py-3 text-center font-semibold text-rose-600 text-xs uppercase tracking-wide">ctg</th>
 <th className="px-3 py-3 text-center font-semibold text-slate-400 text-xs uppercase tracking-wide hidden sm:table-cell">кв.</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map(row => (
 <tr
 key={row.deg}
 onClick={() => setSelectedDeg(row.deg)}
 className={`border-b border-slate-100 cursor-pointer transition-colors ${
 row.deg === selectedDeg
 ? 'bg-blue-50'
 : 'hover:bg-slate-50'
 }`}
 >
 <td className="px-3 py-2.5">
 <span className={`font-bold ${row.deg === selectedDeg ? 'text-blue-700' : 'text-slate-900'}`}>
 {row.deg}°
 </span>
 </td>
 {showRadians && (
 <td className="px-3 py-2.5 font-mono text-xs text-violet-600">{row.rad}</td>
 )}
 <td className={`px-3 py-2.5 text-center font-mono text-xs ${valColor(row.sinVal)}`}>{row.sin}</td>
 <td className={`px-3 py-2.5 text-center font-mono text-xs ${valColor(row.cosVal)}`}>{row.cos}</td>
 <td className={`px-3 py-2.5 text-center font-mono text-xs ${row.tg === UNDEF ? 'text-slate-300' : valColor(row.tgVal)}`}>{row.tg}</td>
 <td className={`px-3 py-2.5 text-center font-mono text-xs ${row.ctg === UNDEF ? 'text-slate-300' : valColor(row.ctgVal)}`}>{row.ctg}</td>
 <td className="px-3 py-2.5 text-center text-xs text-slate-400 hidden sm:table-cell">
 {QUADRANT_LABELS[row.quadrant]}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {filtered.length === 0 && (
 <div className="text-center py-8 text-slate-400 text-sm">Ничего не найдено</div>
 )}
 </div>

 {/* Color legend */}
 <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
 <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Положительное</span>
 <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Отрицательное</span>
 <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /> Не определено (—)</span>
 </div>
 </div>

 {/* Right: unit circle + selected row detail */}
 <div className="space-y-4">
 {/* Unit circle */}
 <div className=" border border-slate-200 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Единичная окружность</h3>
 <div className="flex justify-center">
 <UnitCircle row={selectedRow} />
 </div>
 </div>

 {/* Selected angle detail */}
 <div className=" border border-blue-200 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--color-surface)' }}>
 <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
 Угол {selectedRow.deg}° = {selectedRow.rad}
 </h3>
 <div className="space-y-2">
 {([
 { label: 'sin', value: selectedRow.sin, color: 'text-emerald-600' },
 { label: 'cos', value: selectedRow.cos, color: 'text-amber-600' },
 { label: 'tg', value: selectedRow.tg, color: 'text-blue-600' },
 { label: 'ctg', value: selectedRow.ctg, color: 'text-rose-600' },
 ] as { label: string; value: string; color: string }[]).map(item => (
 <div key={item.label} className="flex items-center justify-between">
 <span className={`text-sm font-bold ${item.color}`}>{item.label}</span>
 <span className={`font-mono text-sm font-semibold ${item.value === UNDEF ? 'text-slate-300' : 'text-slate-900'}`}>
 {item.value}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Знаки по квадрантам */}
 <div className=" border border-slate-200 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Знаки по квадрантам</h3>
 <div className="grid grid-cols-2 gap-1 text-xs">
 {[
 { q: 'II (90°–180°)', sin: '+', cos: '−', tg: '−', ctg: '−' },
 { q: 'I (0°–90°)', sin: '+', cos: '+', tg: '+', ctg: '+' },
 { q: 'III (180°–270°)',sin: '−', cos: '−', tg: '+', ctg: '+' },
 { q: 'IV (270°–360°)', sin: '−', cos: '+', tg: '−', ctg: '−' },
 ].map(item => (
 <div key={item.q} className="bg-slate-50 rounded-lg p-2">
 <p className="font-semibold text-slate-600 mb-1 text-[10px]">{item.q}</p>
 <p className="font-mono text-slate-700">
 <span className={item.sin === '+' ? 'text-emerald-600' : 'text-rose-600'}>s{item.sin}</span>{' '}
 <span className={item.cos === '+' ? 'text-emerald-600' : 'text-rose-600'}>c{item.cos}</span>{' '}
 <span className={item.tg === '+' ? 'text-emerald-600' : 'text-rose-600'}>t{item.tg}</span>
 </p>
 </div>
 ))}
 </div>
 <p className="text-[10px] text-slate-400 mt-2">Мнемоника: «Все Студенты Танцуют Кекстеп» (по квадрантам I→II→III→IV)</p>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}
