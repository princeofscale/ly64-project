import { Users } from 'lucide-react';
import { memo, useMemo } from 'react';

import { formatRuth } from './constants';

interface LiveBetsListProps {
  bets: Array<{
    userId: string;
    username: string;
    name: string;
    amount: number;
    status: 'ACTIVE' | 'CASHED_OUT' | 'LOST';
    cashOutMultiplier?: number;
    winAmount?: number;
  }>;
  currentUserId?: string;
}

export const LiveBetsList = memo(function LiveBetsList({
  bets,
  currentUserId,
}: LiveBetsListProps) {
  const sorted = useMemo(() => [...bets].sort((a, b) => b.amount - a.amount), [bets]);

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-semibold text-slate-300">Игроки ({bets.length})</p>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1">
        {sorted.length === 0 && (
          <p className="text-xs text-slate-500 py-4 text-center">Пока никто не поставил</p>
        )}
        {sorted.map(b => {
          const isMine = b.userId === currentUserId;
          return (
            <div
              key={b.userId}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                isMine ? 'bg-indigo-500/10 ring-1 ring-indigo-500/40' : 'bg-slate-800/40'
              }`}
            >
              <span className="truncate text-slate-300">
                {isMine ? 'Вы' : b.name || b.username}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-slate-400 tabular-nums">{formatRuth(b.amount)}</span>
                {b.status === 'CASHED_OUT' && b.cashOutMultiplier && (
                  <span className="text-emerald-400 font-bold tabular-nums text-xs">
                    {b.cashOutMultiplier.toFixed(2)}x
                  </span>
                )}
                {b.status === 'LOST' && (
                  <span className="text-rose-500 font-bold text-xs">✕</span>
                )}
                {b.status === 'ACTIVE' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
