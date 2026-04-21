import { Flame, Rocket, Trophy } from 'lucide-react';
import { memo, type ReactNode } from 'react';

import { formatRuth, RUTH_SYMBOL } from './constants';

import type { RocketStats } from '@lyceum64/shared';

interface RecordsCardProps {
  stats: RocketStats | null;
}

/** Карточка «Мои рекорды»: макс. мультипликатор, макс. выигрыш, самая длинная серия */
export const RecordsCard = memo(function RecordsCard({ stats }: RecordsCardProps) {
  const hasData = !!stats &&
    (stats.biggestMultiplier > 0 ||
      stats.biggestWin > 0 ||
      stats.longestWinStreak > 0);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/70 to-slate-900/80 border border-amber-500/20 p-4 backdrop-blur-sm shadow-[0_0_30px_rgba(245,158,11,0.08)]">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-amber-300" />
        <p className="text-sm font-semibold text-slate-200">Мои рекорды</p>
      </div>

      {hasData && stats ? (
        <div className="grid grid-cols-3 gap-2">
          <Record
            icon={<Rocket className="w-3.5 h-3.5" />}
            label="Макс. ×"
            value={`${stats.biggestMultiplier.toFixed(2)}x`}
            accent="text-fuchsia-300"
          />
          <Record
            icon={<Trophy className="w-3.5 h-3.5" />}
            label="Макс. выигрыш"
            value={`${formatRuth(stats.biggestWin)} ${RUTH_SYMBOL}`}
            accent="text-amber-300"
          />
          <Record
            icon={<Flame className="w-3.5 h-3.5" />}
            label="Серия побед"
            value={stats.longestWinStreak.toString()}
            accent="text-orange-300"
          />
        </div>
      ) : (
        <p className="text-xs text-slate-500 text-center py-3">
          Выведи первую ставку — появятся рекорды 🚀
        </p>
      )}
    </div>
  );
});

interface RecordProps {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}

const Record = memo(function Record({ icon, label, value, accent }: RecordProps) {
  return (
    <div className="bg-slate-900/60 rounded-lg px-2 py-2 border border-slate-800/60">
      <div className={`flex items-center gap-1 mb-0.5 ${accent}`}>
        {icon}
        <p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
      </div>
      <p className={`font-black tabular-nums text-sm ${accent}`}>{value}</p>
    </div>
  );
});
