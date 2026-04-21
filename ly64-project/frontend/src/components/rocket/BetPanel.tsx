import { motion } from 'framer-motion';
import { memo } from 'react';

import { formatRuth, QUICK_BET_AMOUNTS, RUTH_SYMBOL } from './constants';

interface BetPanelProps {
  betAmount: string;
  setBetAmount: (v: string) => void;
  autoTarget: string;
  setAutoTarget: (v: string) => void;
  autoEnabled: boolean;
  setAutoEnabled: (v: boolean) => void;
  canBet: boolean;
  canCashOut: boolean;
  placing: boolean;
  cashingOut: boolean;
  myBet:
    | {
        amount: number;
        status: 'ACTIVE' | 'CASHED_OUT' | 'LOST';
        cashOutMultiplier?: number;
        winAmount?: number;
      }
    | undefined;
  potentialWin: number;
  onPlaceBet: () => void;
  onCashOut: () => void;
  balance: number;
  status: 'BETTING' | 'RUNNING' | 'CRASHED';
  bettingSecondsLeft: number;
}

export const BetPanel = memo(function BetPanel({
  betAmount,
  setBetAmount,
  autoTarget,
  setAutoTarget,
  autoEnabled,
  setAutoEnabled,
  canBet,
  canCashOut,
  placing,
  cashingOut,
  myBet,
  potentialWin,
  onPlaceBet,
  onCashOut,
  balance,
  status,
  bettingSecondsLeft,
}: BetPanelProps) {
  const changeAmount = (factor: number) => {
    const current = parseFloat(betAmount || '0');
    const next = Math.max(0.1, current * factor);
    setBetAmount(next.toFixed(2));
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/20 p-5 shadow-[0_0_40px_rgba(99,102,241,0.12)] backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Ставка</p>
          <p className="text-[10px] text-slate-500">мин. 0.10 · макс. 20/день</p>
        </div>
        {myBet && (
          <div className="text-right">
            <p className="text-[10px] uppercase text-slate-500">Моя ставка</p>
            <p className="text-sm font-bold text-amber-300">
              {formatRuth(myBet.amount)} {RUTH_SYMBOL}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-stretch gap-1.5 mb-3">
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={betAmount}
          onChange={e => setBetAmount(e.target.value)}
          disabled={!canBet}
          className="min-w-0 flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-lg font-bold text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 tabular-nums"
        />
        <button
          onClick={() => changeAmount(0.5)}
          disabled={!canBet}
          className="shrink-0 w-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 disabled:opacity-50"
        >
          ½
        </button>
        <button
          onClick={() => changeAmount(2)}
          disabled={!canBet}
          className="shrink-0 w-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 disabled:opacity-50"
        >
          2×
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {QUICK_BET_AMOUNTS.map(a => (
          <button
            key={a}
            onClick={() => setBetAmount(a.toFixed(2))}
            disabled={!canBet || a > balance}
            className="py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-40"
          >
            {a} {RUTH_SYMBOL}
          </button>
        ))}
      </div>

      {/* Автовывод */}
      <div className="mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-700/50">
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoEnabled}
            onChange={e => setAutoEnabled(e.target.checked)}
            disabled={!canBet}
            className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 disabled:opacity-50"
          />
          <span className="text-xs font-semibold text-slate-300">Автовывод</span>
        </label>
        {autoEnabled && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">при</span>
            <input
              type="number"
              min="1.01"
              step="0.01"
              value={autoTarget}
              onChange={e => setAutoTarget(e.target.value)}
              disabled={!canBet}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 tabular-nums"
            />
            <span className="text-xs text-slate-500">x</span>
          </div>
        )}
      </div>

      {canCashOut ? (
        <motion.button
          onClick={onCashOut}
          disabled={cashingOut}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all disabled:opacity-60"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          Забрать {formatRuth(potentialWin)} {RUTH_SYMBOL}
        </motion.button>
      ) : myBet && status === 'RUNNING' && myBet.status !== 'ACTIVE' ? (
        <button
          disabled
          className="w-full py-4 rounded-xl bg-slate-800 text-slate-500 font-bold text-lg"
        >
          {myBet.status === 'CASHED_OUT' ? 'Выведено ✓' : 'Раунд активен'}
        </button>
      ) : (
        <button
          onClick={onPlaceBet}
          disabled={!canBet || placing}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] text-white font-black text-lg shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'BETTING'
            ? myBet
              ? 'Ставка принята'
              : `Поставить (${bettingSecondsLeft.toFixed(1)}с)`
            : status === 'RUNNING'
              ? 'Ставки закрыты'
              : 'Ожидание раунда'}
        </button>
      )}
    </div>
  );
});
