import { Rocket, Users } from 'lucide-react';
import { memo } from 'react';

import { SoundSettings } from './SoundSettings';
import { formatRuth, RUTH_SYMBOL } from './constants';

interface PageHeaderProps {
  balance: number;
  connected: boolean;
  onlineCount: number;
}

export const PageHeader = memo(function PageHeader({
  balance,
  connected,
  onlineCount,
}: PageHeaderProps) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900/80 to-fuchsia-950/30 border border-indigo-500/25 backdrop-blur-md shadow-[0_0_40px_rgba(99,102,241,0.12)] px-4 py-3 md:px-5 md:py-4">
      {/* Декоративное свечение */}
      <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.55)] rocket-logo-wiggle ring-1 ring-white/10">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-fuchsia-200 bg-clip-text text-transparent leading-tight">
              Ракетка
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Рутении = пятёрки. Играй с умом.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <SoundSettings />

          <div className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-slate-900/60 border border-indigo-500/20 backdrop-blur-sm">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200 tabular-nums">
              {onlineCount}
            </span>
          </div>

          <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-900/60 border border-indigo-500/20 backdrop-blur-sm">
            <span
              className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]' : 'bg-slate-500'}`}
            />
            <span className="text-xs text-slate-300 hidden sm:inline">
              {connected ? 'Онлайн' : 'Соединение...'}
            </span>
          </div>

          <div className="h-10 px-4 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900/70 to-slate-900/80 border border-amber-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-center">
            <p className="text-[9px] uppercase tracking-widest text-amber-300/70 leading-none">Баланс</p>
            <p className="text-sm font-black text-amber-300 tabular-nums leading-none mt-0.5">
              {formatRuth(balance)} <span className="text-[10px] text-amber-300/60">{RUTH_SYMBOL}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
