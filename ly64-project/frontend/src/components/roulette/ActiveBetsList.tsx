import { Sparkles, X } from 'lucide-react';
import { memo } from 'react';

import type { BetKey, PlacedBetSnapshot } from '@/core/types/roulette';

interface ActiveBetsListProps {
  bets: readonly PlacedBetSnapshot[];
  disabled: boolean;
  onRemove: (key: BetKey) => void;
}

export const ActiveBetsList = memo(function ActiveBetsList({
  bets,
  disabled,
  onRemove,
}: ActiveBetsListProps) {
  if (bets.length === 0) return null;

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/50 backdrop-blur p-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        Ставки ({bets.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {bets.map((bet) => (
          <button
            key={bet.key}
            type="button"
            onClick={() => onRemove(bet.key)}
            disabled={disabled}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-rose-500/20 border border-amber-500/30 hover:border-rose-500/40 transition-all disabled:opacity-50"
          >
            <span className="text-xs font-semibold text-amber-200 group-hover:text-rose-200">{bet.label}</span>
            <span className="text-xs font-black text-white tabular-nums">{bet.amount}</span>
            <X className="w-3 h-3 text-slate-400 group-hover:text-rose-300 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
});
