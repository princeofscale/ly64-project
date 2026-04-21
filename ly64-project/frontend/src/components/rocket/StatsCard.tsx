import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { memo } from 'react';

import { formatRuth } from './constants';

import type { RocketStats } from '@lyceum64/shared';

interface StatsCardProps {
  stats: RocketStats | null;
  expanded: boolean;
  onToggle: () => void;
}

export const StatsCard = memo(function StatsCard({ stats, expanded, onToggle }: StatsCardProps) {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <p className="text-sm font-semibold text-slate-300">Моя статистика</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {expanded && stats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Ставок" value={stats.totalBets.toString()} />
              <Stat label="Поставлено" value={formatRuth(stats.totalWagered)} />
              <Stat label="Выиграно" value={formatRuth(stats.totalWon)} />
              <Stat
                label="Чистая прибыль"
                value={`${stats.netProfit >= 0 ? '+' : ''}${formatRuth(stats.netProfit)}`}
                color={stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}
              />
              <Stat
                label="Лучший выигрыш"
                value={formatRuth(stats.biggestWin)}
                color="text-amber-300"
              />
              <Stat
                label="Лучший мультипл."
                value={`${stats.biggestMultiplier.toFixed(2)}x`}
                color="text-fuchsia-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

interface StatProps {
  label: string;
  value: string;
  color?: string;
}

const Stat = memo(function Stat({ label, value, color }: StatProps) {
  return (
    <div className="bg-slate-800/50 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`font-bold tabular-nums ${color ?? 'text-slate-200'}`}>{value}</p>
    </div>
  );
});
