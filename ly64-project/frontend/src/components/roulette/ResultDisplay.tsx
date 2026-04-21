import { memo } from 'react';

import type { PocketColor } from '@/core/types/roulette';

import { POCKET_GRADIENT, POCKET_LABEL } from './constants';

interface ResultDisplayProps {
  number: number;
  color: PocketColor;
  netProfit: number;
}

export const ResultDisplay = memo(function ResultDisplay({
  number,
  color,
  netProfit,
}: ResultDisplayProps) {
  const outcomeLabel =
    netProfit > 0 ? 'Выигрыш' : netProfit < 0 ? 'Проигрыш' : 'Ничья';
  const outcomeColor =
    netProfit > 0
      ? 'text-emerald-300'
      : netProfit < 0
        ? 'text-rose-300'
        : 'text-slate-300';
  const cardBorder =
    netProfit > 0
      ? 'bg-emerald-500/15 border-emerald-400/50'
      : netProfit < 0
        ? 'bg-rose-500/15 border-rose-400/50'
        : 'bg-slate-700/30 border-slate-600/40';

  return (
    <div className="mt-10 animate-[fadeInUp_0.4s_ease-out]">
      <div className={`rounded-2xl p-4 border-2 ${cardBorder}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-xl ${POCKET_GRADIENT[color]}`}
            >
              {number}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Выпало</p>
              <p className="text-base font-bold text-white">{POCKET_LABEL[color]}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{outcomeLabel}</p>
            <p className={`text-2xl font-black tabular-nums ${outcomeColor}`}>
              {netProfit > 0 ? '+' : ''}
              {netProfit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
