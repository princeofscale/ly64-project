import { Award } from 'lucide-react';
import { memo } from 'react';

import { formatRuth, RUTH_SYMBOL } from './constants';

import type { RocketBetHistoryItem } from '@lyceum64/shared';

interface MyBetsListProps {
  items: RocketBetHistoryItem[];
}

export const MyBetsList = memo(function MyBetsList({ items }: MyBetsListProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-4 h-4 text-slate-400" />
        <p className="text-sm font-semibold text-slate-300">Мои ставки</p>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {items.map(b => (
          <div
            key={b.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 text-xs"
          >
            <span className="text-slate-400 tabular-nums">
              {formatRuth(b.amount)} {RUTH_SYMBOL}
            </span>
            <span
              className={`tabular-nums font-bold ${
                b.status === 'CASHED_OUT'
                  ? 'text-emerald-400'
                  : b.status === 'LOST'
                    ? 'text-rose-500'
                    : 'text-slate-500'
              }`}
            >
              {b.status === 'CASHED_OUT' && b.cashOutMultiplier
                ? `+${formatRuth(b.winAmount)} (${b.cashOutMultiplier.toFixed(2)}x)`
                : b.status === 'LOST'
                  ? `✕ ${b.crashMultiplier.toFixed(2)}x`
                  : '...'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
