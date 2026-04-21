import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Disc3, RotateCcw, Coins, History, Sparkles, Trophy, X } from 'lucide-react';

const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
  10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const POCKET_COUNT = WHEEL_ORDER.length;
const POCKET_ANGLE = 360 / POCKET_COUNT;

type Color = 'red' | 'black' | 'green';

function getColor(n: number): Color {
  if (n === 0) return 'green';
  return RED_NUMBERS.has(n) ? 'red' : 'black';
}

type BetKey =
  | `straight:${number}`
  | 'red'
  | 'black'
  | 'even'
  | 'odd'
  | 'low'
  | 'high'
  | 'dozen1'
  | 'dozen2'
  | 'dozen3';

const BET_PAYOUTS: Record<string, number> = {
  straight: 35,
  red: 1,
  black: 1,
  even: 1,
  odd: 1,
  low: 1,
  high: 1,
  dozen1: 2,
  dozen2: 2,
  dozen3: 2,
};

function betWins(bet: BetKey, n: number): boolean {
  if (bet.startsWith('straight:')) {
    const num = Number(bet.split(':')[1]);
    return num === n;
  }
  if (n === 0) return false;
  switch (bet) {
    case 'red': return RED_NUMBERS.has(n);
    case 'black': return !RED_NUMBERS.has(n);
    case 'even': return n % 2 === 0;
    case 'odd': return n % 2 === 1;
    case 'low': return n >= 1 && n <= 18;
    case 'high': return n >= 19 && n <= 36;
    case 'dozen1': return n >= 1 && n <= 12;
    case 'dozen2': return n >= 13 && n <= 24;
    case 'dozen3': return n >= 25 && n <= 36;
    default: return false;
  }
}

function betLabel(bet: BetKey): string {
  if (bet.startsWith('straight:')) return `№${bet.split(':')[1]}`;
  const map: Record<string, string> = {
    red: 'Красное', black: 'Чёрное',
    even: 'Чётное', odd: 'Нечётное',
    low: '1–18', high: '19–36',
    dozen1: '1-я дюжина', dozen2: '2-я дюжина', dozen3: '3-я дюжина',
  };
  return map[bet] ?? bet;
}

const CHIPS = [1, 5, 25, 100];
const STARTING_BALANCE = 1000;
const BALANCE_KEY = 'ly64:roulette:balance';
const HISTORY_KEY = 'ly64:roulette:history';

function loadBalance(): number {
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    if (!raw) return STARTING_BALANCE;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : STARTING_BALANCE;
  } catch { return STARTING_BALANCE; }
}

function loadHistory(): number[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n: unknown): n is number => typeof n === 'number') : [];
  } catch { return []; }
}

export default function RoulettePage() {
  const [balance, setBalance] = useState(() => loadBalance());
  const [chipValue, setChipValue] = useState(5);
  const [bets, setBets] = useState<Map<BetKey, number>>(new Map());
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>(() => loadHistory());
  const [lastPayout, setLastPayout] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(BALANCE_KEY, String(balance)); } catch { /* ignore */ }
  }, [balance]);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30))); } catch { /* ignore */ }
  }, [history]);

  const totalBet = useMemo(() => {
    let sum = 0;
    bets.forEach(v => { sum += v; });
    return sum;
  }, [bets]);

  const placeBet = useCallback((key: BetKey) => {
    if (spinning) return;
    if (balance < chipValue) {
      toast.error('Недостаточно фишек');
      return;
    }
    setBalance(b => b - chipValue);
    setBets(prev => {
      const next = new Map(prev);
      next.set(key, (next.get(key) ?? 0) + chipValue);
      return next;
    });
  }, [chipValue, balance, spinning]);

  const removeBet = useCallback((key: BetKey) => {
    if (spinning) return;
    setBets(prev => {
      const next = new Map(prev);
      const amount = next.get(key) ?? 0;
      if (!amount) return prev;
      next.delete(key);
      setBalance(b => b + amount);
      return next;
    });
  }, [spinning]);

  const clearBets = useCallback(() => {
    if (spinning) return;
    if (bets.size === 0) return;
    setBalance(b => b + totalBet);
    setBets(new Map());
  }, [bets.size, totalBet, spinning]);

  const resetBalance = useCallback(() => {
    if (spinning) return;
    setBalance(STARTING_BALANCE);
    setBets(new Map());
    setHistory([]);
    setLastResult(null);
    setLastPayout(null);
    toast.success('Баланс восстановлен');
  }, [spinning]);

  const spin = useCallback(() => {
    if (spinning) return;
    if (bets.size === 0) {
      toast.error('Сначала сделайте ставку');
      return;
    }
    setSpinning(true);
    setLastPayout(null);
    setShowResult(false);

    const winningNumber = WHEEL_ORDER[Math.floor(Math.random() * POCKET_COUNT)]!;
    const pocketIndex = WHEEL_ORDER.indexOf(winningNumber);
    const targetAngle = pocketIndex * POCKET_ANGLE;
    const extraSpins = 6 + Math.floor(Math.random() * 3);
    const currentBase = rotation % 360;
    const finalRotation = rotation - currentBase + extraSpins * 360 - targetAngle;

    setRotation(finalRotation);

    window.setTimeout(() => {
      let winnings = 0;
      bets.forEach((amount, key) => {
        if (betWins(key, winningNumber)) {
          const kind = key.startsWith('straight:') ? 'straight' : key;
          const payout = BET_PAYOUTS[kind] ?? 0;
          winnings += amount + amount * payout;
        }
      });

      if (winnings > 0) {
        setBalance(b => b + winnings);
      }
      setLastResult(winningNumber);
      setLastPayout(winnings - totalBet);
      setHistory(h => [winningNumber, ...h].slice(0, 30));
      setBets(new Map());
      setSpinning(false);
      setShowResult(true);
    }, 5200);
  }, [bets, rotation, spinning, totalBet]);

  const betAmount = (key: BetKey) => bets.get(key) ?? 0;

  return (
    <div className="min-h-screen bg-[#0a1f1a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(52, 211, 153, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(251, 191, 36, 0.12) 0%, transparent 50%)',
      }} />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 shadow-lg shadow-amber-600/40 flex items-center justify-center ring-2 ring-amber-300/40">
              <Disc3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 tracking-tight">
                Европейская рулетка
              </h1>
              <p className="text-xs text-emerald-300/70 font-medium">Демо-режим · фишки не связаны с рутениями</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 backdrop-blur-md shadow-lg shadow-amber-900/20 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-bold text-amber-100 tabular-nums">
                {balance.toLocaleString('ru-RU')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-amber-400">фишек</span>
            </div>
            <button
              onClick={resetBalance}
              disabled={spinning}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/60 transition-colors disabled:opacity-50"
              title="Сбросить баланс"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-6 items-start">
          {/* Wheel column */}
          <div className="space-y-4">
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/80 via-emerald-950/60 to-slate-950/80 border border-amber-500/20 backdrop-blur-md p-6 shadow-2xl shadow-emerald-950/50">
              <div className="relative aspect-square max-w-[380px] mx-auto">
                {/* Outer rim */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 shadow-[0_0_40px_rgba(251,191,36,0.3)]" />
                <div className="absolute inset-[4%] rounded-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900" />

                {/* Pointer (ball indicator) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-30 pointer-events-none">
                  <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-amber-100 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" />
                </div>

                {/* Spinning wheel */}
                <div
                  className="absolute inset-[7%] rounded-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? 'transform 5s cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none',
                  }}
                >
                  <svg viewBox="-100 -100 200 200" className="w-full h-full drop-shadow-2xl">
                    {WHEEL_ORDER.map((num, idx) => {
                      const startAngle = idx * POCKET_ANGLE - 90 - POCKET_ANGLE / 2;
                      const endAngle = startAngle + POCKET_ANGLE;
                      const sRad = (startAngle * Math.PI) / 180;
                      const eRad = (endAngle * Math.PI) / 180;
                      const r = 96;
                      const x1 = r * Math.cos(sRad);
                      const y1 = r * Math.sin(sRad);
                      const x2 = r * Math.cos(eRad);
                      const y2 = r * Math.sin(eRad);
                      const d = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                      const color = getColor(num);
                      const fill = color === 'red' ? '#dc2626' : color === 'black' ? '#0f172a' : '#059669';
                      const midAngle = startAngle + POCKET_ANGLE / 2;
                      const tRad = (midAngle * Math.PI) / 180;
                      const tr = 78;
                      const tx = tr * Math.cos(tRad);
                      const ty = tr * Math.sin(tRad);
                      return (
                        <g key={num}>
                          <path d={d} fill={fill} stroke="#fbbf24" strokeWidth="0.4" />
                          <text
                            x={tx}
                            y={ty}
                            fill="#fff"
                            fontSize="7"
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                          >
                            {num}
                          </text>
                        </g>
                      );
                    })}
                    {/* Center hub */}
                    <circle r="24" fill="url(#hubGrad)" stroke="#fbbf24" strokeWidth="1" />
                    <circle r="10" fill="#78350f" />
                    <circle r="4" fill="#fbbf24" />
                    <defs>
                      <radialGradient id="hubGrad">
                        <stop offset="0%" stopColor="#92400e" />
                        <stop offset="100%" stopColor="#451a03" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>

                {/* Ball — sits at top where the winning pocket lands */}
                {lastResult !== null && (
                  <div
                    className={`absolute left-1/2 top-[10%] w-3 h-3 -ml-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)] z-20 ${spinning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                  />
                )}
              </div>

              {/* Result display */}
              {showResult && lastResult !== null && (
                <div className="mt-5 animate-scale-in">
                  <div className={`rounded-2xl p-4 border-2 ${
                    lastPayout !== null && lastPayout > 0
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/50'
                      : lastPayout !== null && lastPayout < 0
                        ? 'bg-gradient-to-r from-rose-500/20 to-red-500/20 border-rose-400/50'
                        : 'bg-gradient-to-r from-slate-700/40 to-slate-800/40 border-slate-600/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl ${
                          getColor(lastResult) === 'red' ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-600/40' :
                          getColor(lastResult) === 'black' ? 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-900/40' :
                          'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-600/40'
                        }`}>
                          {lastResult}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">Выпало</p>
                          <p className="text-lg font-bold text-white capitalize">
                            {getColor(lastResult) === 'red' ? 'Красное' : getColor(lastResult) === 'black' ? 'Чёрное' : 'Зеро'}
                          </p>
                        </div>
                      </div>
                      {lastPayout !== null && (
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
                            {lastPayout > 0 ? 'Выигрыш' : lastPayout < 0 ? 'Проигрыш' : 'Возврат'}
                          </p>
                          <p className={`text-2xl font-black tabular-nums ${
                            lastPayout > 0 ? 'text-emerald-300' : lastPayout < 0 ? 'text-rose-300' : 'text-slate-300'
                          }`}>
                            {lastPayout > 0 ? '+' : ''}{lastPayout}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* History strip */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">История</p>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {history.length === 0 && (
                  <p className="text-xs text-slate-600 py-1">Ещё нет спинов</p>
                )}
                {history.map((n, i) => {
                  const color = getColor(n);
                  return (
                    <div
                      key={i}
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-md ${
                        color === 'red' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                        color === 'black' ? 'bg-gradient-to-br from-slate-700 to-slate-900' :
                        'bg-gradient-to-br from-emerald-500 to-emerald-700'
                      } ${i === 0 ? 'ring-2 ring-amber-400/60 scale-110' : ''}`}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Betting column */}
          <div className="space-y-4">
            {/* Chip selector */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-amber-500/20 backdrop-blur-md p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  Номинал фишки
                </p>
                {totalBet > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      На столе: <span className="font-bold text-amber-300 tabular-nums">{totalBet}</span>
                    </span>
                    <button
                      onClick={clearBets}
                      disabled={spinning}
                      className="text-xs px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 transition-colors disabled:opacity-50"
                    >
                      Очистить
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {CHIPS.map(v => (
                  <button
                    key={v}
                    onClick={() => setChipValue(v)}
                    disabled={spinning}
                    className={`relative w-14 h-14 rounded-full font-black text-sm transition-all disabled:opacity-50 ${
                      chipValue === v
                        ? 'scale-110 ring-4 ring-amber-300/60 shadow-xl'
                        : 'hover:scale-105'
                    } ${
                      v === 1 ? 'bg-gradient-to-br from-slate-100 to-slate-300 text-slate-800 shadow-slate-400/40' :
                      v === 5 ? 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-600/40' :
                      v === 25 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-600/40' :
                      'bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-violet-700/40'
                    } shadow-lg border-4 ${
                      v === 1 ? 'border-slate-400' :
                      v === 5 ? 'border-red-800' :
                      v === 25 ? 'border-emerald-800' :
                      'border-violet-900'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Betting table */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/80 to-emerald-900/60 border border-amber-500/30 backdrop-blur-md p-4 shadow-xl shadow-emerald-950/50">
              <div className="flex gap-1">
                {/* Zero */}
                <button
                  onClick={() => placeBet('straight:0')}
                  onContextMenu={(e) => { e.preventDefault(); removeBet('straight:0'); }}
                  disabled={spinning}
                  className="relative w-10 md:w-12 rounded-l-xl bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-lg md:text-xl flex items-center justify-center border-2 border-amber-400/30 disabled:opacity-50 transition-all"
                >
                  0
                  {betAmount('straight:0') > 0 && <ChipStack amount={betAmount('straight:0')} />}
                </button>

                {/* Numbers grid */}
                <div className="flex-1 grid grid-cols-12 gap-1">
                  {[3, 2, 1].map(row => (
                    [...Array(12)].map((_, col) => {
                      const n = col * 3 + row;
                      const color = getColor(n);
                      const key = `straight:${n}` as BetKey;
                      return (
                        <button
                          key={n}
                          onClick={() => placeBet(key)}
                          onContextMenu={(e) => { e.preventDefault(); removeBet(key); }}
                          disabled={spinning}
                          className={`relative aspect-[3/4] md:aspect-square rounded-md text-white font-bold text-xs md:text-sm flex items-center justify-center border border-amber-400/20 hover:border-amber-400/60 disabled:opacity-50 transition-all ${
                            color === 'red'
                              ? 'bg-gradient-to-br from-red-500/90 to-red-700/90 hover:from-red-400 hover:to-red-600'
                              : 'bg-gradient-to-br from-slate-800/90 to-slate-950/90 hover:from-slate-700 hover:to-slate-900'
                          }`}
                        >
                          {n}
                          {betAmount(key) > 0 && <ChipStack amount={betAmount(key)} />}
                        </button>
                      );
                    })
                  ))}
                </div>
              </div>

              {/* Dozens */}
              <div className="grid grid-cols-3 gap-1 mt-1 ml-[44px] md:ml-[52px]">
                <OutsideBetButton label="1-я 12" betKey="dozen1" amount={betAmount('dozen1')} onPlace={placeBet} onRemove={removeBet} disabled={spinning} />
                <OutsideBetButton label="2-я 12" betKey="dozen2" amount={betAmount('dozen2')} onPlace={placeBet} onRemove={removeBet} disabled={spinning} />
                <OutsideBetButton label="3-я 12" betKey="dozen3" amount={betAmount('dozen3')} onPlace={placeBet} onRemove={removeBet} disabled={spinning} />
              </div>

              {/* Outside bets */}
              <div className="grid grid-cols-6 gap-1 mt-1 ml-[44px] md:ml-[52px]">
                <OutsideBetButton label="1–18" betKey="low" amount={betAmount('low')} onPlace={placeBet} onRemove={removeBet} disabled={spinning} />
                <OutsideBetButton label="Чёт" betKey="even" amount={betAmount('even')} onPlace={placeBet} onRemove={removeBet} disabled={spinning} />
                <OutsideBetButton
                  label="Красное"
                  betKey="red"
                  amount={betAmount('red')}
                  onPlace={placeBet}
                  onRemove={removeBet}
                  disabled={spinning}
                  variant="red"
                />
                <OutsideBetButton
                  label="Чёрное"
                  betKey="black"
                  amount={betAmount('black')}
                  onPlace={placeBet}
                  onRemove={removeBet}
                  disabled={spinning}
                  variant="black"
                />
                <OutsideBetButton label="Нечёт" betKey="odd" amount={betAmount('odd')} onPlace={placeBet} onRemove={removeBet} disabled={spinning} />
                <OutsideBetButton label="19–36" betKey="high" amount={betAmount('high')} onPlace={placeBet} onRemove={removeBet} disabled={spinning} />
              </div>

              <p className="mt-3 text-[10px] text-emerald-300/60 text-center">
                ЛКМ — поставить фишку · ПКМ — убрать ставку
              </p>
            </div>

            {/* Active bets */}
            {bets.size > 0 && (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-md p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Активные ставки ({bets.size})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(bets.entries()).map(([key, amount]) => (
                    <button
                      key={key}
                      onClick={() => removeBet(key)}
                      disabled={spinning}
                      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-rose-500/20 border border-amber-500/30 hover:border-rose-500/40 transition-all disabled:opacity-50"
                    >
                      <span className="text-xs font-semibold text-amber-200 group-hover:text-rose-200">
                        {betLabel(key)}
                      </span>
                      <span className="text-xs font-bold text-white tabular-nums">{amount}</span>
                      <X className="w-3 h-3 text-slate-400 group-hover:text-rose-300 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Spin button */}
            <button
              onClick={spin}
              disabled={spinning || bets.size === 0}
              className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all shadow-xl ${
                spinning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : bets.size === 0
                    ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white hover:brightness-110 hover:-translate-y-0.5 shadow-amber-600/40 ring-2 ring-amber-300/40'
              }`}
            >
              {spinning ? (
                <span className="inline-flex items-center gap-2">
                  <Disc3 className="w-5 h-5 animate-spin" />
                  Колесо крутится…
                </span>
              ) : bets.size === 0 ? (
                'Сделайте ставку'
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Крутить! · Ставка {totalBet}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChipStack({ amount }: { amount: number }) {
  return (
    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-700 flex items-center justify-center text-[9px] font-black text-amber-900 shadow-lg tabular-nums">
      {amount > 99 ? '99+' : amount}
    </div>
  );
}

interface OutsideBetButtonProps {
  label: string;
  betKey: BetKey;
  amount: number;
  onPlace: (k: BetKey) => void;
  onRemove: (k: BetKey) => void;
  disabled: boolean;
  variant?: 'red' | 'black';
}

function OutsideBetButton({ label, betKey, amount, onPlace, onRemove, disabled, variant }: OutsideBetButtonProps) {
  return (
    <button
      onClick={() => onPlace(betKey)}
      onContextMenu={(e) => { e.preventDefault(); onRemove(betKey); }}
      disabled={disabled}
      className={`relative py-2 rounded-md text-white font-bold text-xs border border-amber-400/20 hover:border-amber-400/60 disabled:opacity-50 transition-all ${
        variant === 'red'
          ? 'bg-gradient-to-br from-red-500/90 to-red-700/90 hover:from-red-400 hover:to-red-600'
          : variant === 'black'
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-950/90 hover:from-slate-700 hover:to-slate-900'
            : 'bg-emerald-800/60 hover:bg-emerald-700/70'
      }`}
    >
      {label}
      {amount > 0 && <ChipStack amount={amount} />}
    </button>
  );
}
