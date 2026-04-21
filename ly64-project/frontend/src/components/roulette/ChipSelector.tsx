import { Coins } from 'lucide-react';
import { memo } from 'react';

import { CHIP_STYLES, CHIP_VALUES, type ChipValue } from './constants';

interface ChipSelectorProps {
  value: ChipValue;
  onChange: (v: ChipValue) => void;
  disabled: boolean;
  totalBet: number;
  onClearBets: () => void;
}

export const ChipSelector = memo(function ChipSelector({
  value,
  onChange,
  disabled,
  totalBet,
  onClearBets,
}: ChipSelectorProps) {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-amber-500/15 backdrop-blur p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5" />
          Номинал фишки
        </p>
        {totalBet > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              На столе: <span className="font-black text-amber-300 tabular-nums">{totalBet}</span>
            </span>
            <button
              type="button"
              onClick={onClearBets}
              disabled={disabled}
              className="text-xs px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 transition-colors disabled:opacity-50"
            >
              Очистить
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {CHIP_VALUES.map((v) => {
          const style = CHIP_STYLES[v];
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              disabled={disabled}
              aria-pressed={selected}
              className={`relative w-14 h-14 rounded-full font-black text-sm transition-all shadow-lg disabled:opacity-50 border-[5px] ${style.outer} bg-gradient-to-br ${style.inner} ${
                selected
                  ? 'scale-110 ring-4 ring-amber-300/50 shadow-xl -translate-y-0.5'
                  : 'hover:scale-105 hover:-translate-y-0.5'
              }`}
              style={{ fontSize: v === 100 ? '11px' : undefined }}
            >
              <span className="relative z-10">{v}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
