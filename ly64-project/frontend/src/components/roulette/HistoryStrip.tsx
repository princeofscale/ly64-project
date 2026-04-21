import { History } from 'lucide-react';
import { memo } from 'react';

import type { Wheel } from '@/core/models/roulette';

import { POCKET_GRADIENT } from './constants';

interface HistoryStripProps {
  wheel: Wheel;
  history: readonly number[];
}

export const HistoryStrip = memo(function HistoryStrip({ wheel, history }: HistoryStripProps) {
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/60 backdrop-blur p-3">
      <div className="flex items-center gap-2 mb-2">
        <History className="w-3.5 h-3.5 text-slate-500" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">История</p>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {history.length === 0 ? (
          <p className="text-xs text-slate-600 py-1">Ещё нет спинов</p>
        ) : (
          history.map((n, i) => (
            <div
              key={`${i}-${n}`}
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-md ${POCKET_GRADIENT[wheel.getColor(n)]} ${
                i === 0 ? 'ring-2 ring-amber-400/70 scale-110' : 'opacity-80'
              }`}
            >
              {n}
            </div>
          ))
        )}
      </div>
    </div>
  );
});
