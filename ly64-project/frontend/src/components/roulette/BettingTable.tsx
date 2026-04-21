import { memo } from 'react';

import { Wheel } from '@/core/models/roulette';
import type { BetKey } from '@/core/types/roulette';

import { ChipStack } from './ChipStack';
import { OutsideBetButton } from './OutsideBetButton';

interface BettingTableProps {
  wheel: Wheel;
  disabled: boolean;
  betAmountFor: (key: BetKey) => number;
  onPlace: (key: BetKey) => void;
  onRemove: (key: BetKey) => void;
}

const NUMBER_ROWS = [3, 2, 1] as const;
const COLUMNS = 12;

export const BettingTable = memo(function BettingTable({
  wheel,
  disabled,
  betAmountFor,
  onPlace,
  onRemove,
}: BettingTableProps) {
  return (
    <div
      className="rounded-2xl bg-gradient-to-br from-emerald-950/90 to-emerald-900/70 border border-amber-400/20 backdrop-blur p-4 shadow-xl shadow-emerald-950/60"
      style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(5,150,105,0.12) 0%, transparent 70%)',
      }}
    >
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onPlace('straight:0')}
          onContextMenu={(e) => {
            e.preventDefault();
            onRemove('straight:0');
          }}
          disabled={disabled}
          className="relative w-10 md:w-12 rounded-l-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-xl flex items-center justify-center border-2 border-amber-300/30 hover:border-amber-300/60 disabled:opacity-50 transition-all select-none shadow-lg"
        >
          0
          {betAmountFor('straight:0') > 0 && <ChipStack amount={betAmountFor('straight:0')} />}
        </button>

        <div className="flex-1 grid grid-cols-12 gap-0.5">
          {NUMBER_ROWS.map((row) =>
            Array.from({ length: COLUMNS }, (_, col) => {
              const n = col * 3 + row;
              const color = wheel.getColor(n);
              const key = `straight:${n}` satisfies BetKey;
              const amount = betAmountFor(key);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onPlace(key)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onRemove(key);
                  }}
                  disabled={disabled}
                  className={`relative aspect-[3/4] md:aspect-square rounded text-white font-bold text-[10px] md:text-xs flex items-center justify-center border border-amber-300/15 hover:border-amber-300/50 disabled:opacity-50 transition-all select-none ${
                    color === 'red'
                      ? 'bg-gradient-to-b from-red-500/90 to-red-700/90 hover:from-red-400 hover:to-red-600'
                      : 'bg-gradient-to-b from-slate-800/90 to-slate-950/90 hover:from-slate-700 hover:to-slate-900'
                  }`}
                >
                  {n}
                  {amount > 0 && <ChipStack amount={amount} />}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0.5 mt-1 ml-[44px] md:ml-[52px]">
        <OutsideBetButton label="1-я 12" betKey="dozen1" amount={betAmountFor('dozen1')} onPlace={onPlace} onRemove={onRemove} disabled={disabled} />
        <OutsideBetButton label="2-я 12" betKey="dozen2" amount={betAmountFor('dozen2')} onPlace={onPlace} onRemove={onRemove} disabled={disabled} />
        <OutsideBetButton label="3-я 12" betKey="dozen3" amount={betAmountFor('dozen3')} onPlace={onPlace} onRemove={onRemove} disabled={disabled} />
      </div>

      <div className="grid grid-cols-6 gap-0.5 mt-0.5 ml-[44px] md:ml-[52px]">
        <OutsideBetButton label="1–18" betKey="low" amount={betAmountFor('low')} onPlace={onPlace} onRemove={onRemove} disabled={disabled} />
        <OutsideBetButton label="Чёт" betKey="even" amount={betAmountFor('even')} onPlace={onPlace} onRemove={onRemove} disabled={disabled} />
        <OutsideBetButton label="Красн." betKey="red" amount={betAmountFor('red')} onPlace={onPlace} onRemove={onRemove} disabled={disabled} variant="red" />
        <OutsideBetButton label="Чёрн." betKey="black" amount={betAmountFor('black')} onPlace={onPlace} onRemove={onRemove} disabled={disabled} variant="black" />
        <OutsideBetButton label="Нечёт" betKey="odd" amount={betAmountFor('odd')} onPlace={onPlace} onRemove={onRemove} disabled={disabled} />
        <OutsideBetButton label="19–36" betKey="high" amount={betAmountFor('high')} onPlace={onPlace} onRemove={onRemove} disabled={disabled} />
      </div>

      <p className="mt-2.5 text-[10px] text-emerald-400/50 text-center">
        ЛКМ — поставить · ПКМ — убрать ставку
      </p>
    </div>
  );
});
