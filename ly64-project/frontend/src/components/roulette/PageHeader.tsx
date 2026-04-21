import { Coins, Disc3, RotateCcw } from 'lucide-react';
import { memo } from 'react';

interface PageHeaderProps {
  balance: number;
  disabled: boolean;
  onReset: () => void;
}

export const PageHeader = memo(function PageHeader({ balance, disabled, onReset }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 shadow-lg shadow-amber-600/40 flex items-center justify-center ring-2 ring-amber-300/30">
          <Disc3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-100 tracking-tight">
            Европейская рулетка
          </h1>
          <p className="text-xs text-emerald-400/60 font-medium">
            Демо-режим · фишки не связаны с рутениями
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 backdrop-blur flex items-center gap-2 shadow-lg">
          <Coins className="w-4 h-4 text-amber-300" />
          <span className="text-sm font-black text-amber-100 tabular-nums">
            {balance.toLocaleString('ru-RU')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-amber-400">фишек</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 transition-colors disabled:opacity-50"
          title="Сбросить баланс"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
});
