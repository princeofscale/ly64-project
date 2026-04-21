import { History } from 'lucide-react';
import { memo } from 'react';

import { historyTileColor } from './constants';

import type { RocketHistoryEntry } from '@lyceum64/shared';

interface HistoryStripProps {
  history: RocketHistoryEntry[];
}

export const HistoryStrip = memo(function HistoryStrip({ history }: HistoryStripProps) {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-slate-400" />
        <p className="text-sm font-semibold text-slate-300">Последние раунды</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {history.length === 0 && (
          <p className="text-xs text-slate-500">Ещё нет сыгранных раундов</p>
        )}
        {history.map(h => (
          <div
            key={h.id}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm font-bold tabular-nums ${historyTileColor(h.crashMultiplier)}`}
          >
            {h.crashMultiplier.toFixed(2)}x
          </div>
        ))}
      </div>
    </div>
  );
});
