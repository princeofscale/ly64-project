import { Users, Circle } from 'lucide-react';
import { memo, useMemo } from 'react';

import { formatRuth } from './constants';

interface LiveBetsListProps {
  bets: Array<{
    userId: string;
    username: string;
    name: string;
    avatar?: string | null;
    amount: number;
    status: 'ACTIVE' | 'CASHED_OUT' | 'LOST';
    cashOutMultiplier?: number;
    winAmount?: number;
  }>;
  currentUserId?: string;
  onlineCount?: number;
}

function getInitials(name: string, username: string): string {
  const src = (name || username || '?').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  const a = parts[0];
  const b = parts[1];
  if (a && b) {
    return (a.charAt(0) + b.charAt(0)).toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

function getAvatarGradient(seed: string): string {
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-violet-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-cyan-500 to-blue-500',
    'from-fuchsia-500 to-purple-500',
    'from-lime-500 to-green-500',
    'from-sky-500 to-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return gradients[Math.abs(hash) % gradients.length] ?? gradients[0]!;
}

export const LiveBetsList = memo(function LiveBetsList({
  bets,
  currentUserId,
  onlineCount,
}: LiveBetsListProps) {
  const sorted = useMemo(() => [...bets].sort((a, b) => b.amount - a.amount), [bets]);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-indigo-500/20 p-4 backdrop-blur-md shadow-xl shadow-indigo-900/20">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-4 h-4 text-indigo-300" />
          </div>
          <p className="text-sm font-bold text-white tracking-wide">
            ИГРОКИ <span className="text-indigo-300">({bets.length})</span>
          </p>
        </div>
        {typeof onlineCount === 'number' && onlineCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Circle className="w-2 h-2 text-emerald-400 fill-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-300 tabular-nums">
              {onlineCount} online
            </span>
          </div>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1 -mr-1">
        {sorted.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500">Пока никто не поставил</p>
            <p className="text-[10px] text-slate-600">Будьте первым!</p>
          </div>
        )}
        {sorted.map(b => {
          const isMine = b.userId === currentUserId;
          const initials = getInitials(b.name, b.username);
          const gradient = getAvatarGradient(b.userId);

          const statusColor =
            b.status === 'CASHED_OUT'
              ? 'ring-emerald-500/60 shadow-emerald-500/20'
              : b.status === 'LOST'
                ? 'ring-rose-500/40 opacity-60'
                : 'ring-amber-400/40 shadow-amber-500/20';

          return (
            <div
              key={b.userId}
              className={`group flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all ${
                isMine
                  ? 'bg-gradient-to-r from-indigo-500/20 via-violet-500/15 to-indigo-500/10 ring-1 ring-indigo-400/50 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-800/40 hover:bg-slate-800/70'
              }`}
            >
              <div className="relative shrink-0">
                {b.avatar ? (
                  <img
                    src={b.avatar}
                    alt=""
                    className={`w-9 h-9 rounded-full object-cover ring-2 ${statusColor}`}
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center ring-2 ${statusColor}`}
                  >
                    <span className="text-[11px] font-bold text-white">{initials}</span>
                  </div>
                )}
                {b.status === 'ACTIVE' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse" />
                )}
                {b.status === 'CASHED_OUT' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900 flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1">
                  <span className={`truncate font-semibold ${isMine ? 'text-indigo-200' : 'text-slate-200'}`}>
                    {isMine ? 'Вы' : b.name || b.username}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">@{b.username}</div>
              </div>

              <div className="flex flex-col items-end shrink-0 tabular-nums">
                <span className="text-xs font-bold text-amber-300">
                  {formatRuth(b.amount)}
                </span>
                {b.status === 'CASHED_OUT' && b.cashOutMultiplier && (
                  <span className="text-[10px] font-bold text-emerald-400">
                    +{b.cashOutMultiplier.toFixed(2)}x
                  </span>
                )}
                {b.status === 'LOST' && (
                  <span className="text-[10px] font-bold text-rose-500">—</span>
                )}
                {b.status === 'ACTIVE' && (
                  <span className="text-[10px] text-slate-500">в игре</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
