import { motion } from 'framer-motion';
import { Rocket, Users } from 'lucide-react';
import { memo } from 'react';

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
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.55)]"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
        >
          <Rocket className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-fuchsia-200 bg-clip-text text-transparent">
            Ракетка
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Рутении = пятёрки. Играй с умом.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300 tabular-nums">
            {onlineCount}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span
            className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]' : 'bg-slate-500'}`}
          />
          {connected ? 'Онлайн' : 'Соединение...'}
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <p className="text-[10px] uppercase tracking-widest text-slate-400">Баланс</p>
          <p className="text-lg font-bold text-amber-300 tabular-nums">
            {formatRuth(balance)} <span className="text-xs text-slate-400">{RUTH_SYMBOL}</span>
          </p>
        </div>
      </div>
    </div>
  );
});
