import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

interface DailyBonusCardProps {
  available: boolean;
  nextAvailableAt: string | null;
  onClaim: () => void;
}

export const DailyBonusCard = memo(function DailyBonusCard({
  available,
  nextAvailableAt,
  onClaim,
}: DailyBonusCardProps) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!nextAvailableAt || available) {
      setCountdown('');
      return;
    }
    const update = () => {
      const diff = new Date(nextAvailableAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${h}ч ${m}м`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [nextAvailableAt, available]);

  return (
    <motion.div
      className="rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/30 p-4 backdrop-blur-sm"
      animate={
        available
          ? {
              boxShadow: [
                '0 0 0px 0px rgba(251,191,36,0)',
                '0 0 30px 4px rgba(251,191,36,0.4)',
                '0 0 0px 0px rgba(251,191,36,0)',
              ],
            }
          : {}
      }
      transition={{ repeat: Infinity, duration: 2.5 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Gift className="w-5 h-5 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-200">Ежедневный бонус</p>
          <p className="text-xs text-slate-400">
            {available ? '1–2 рутения готовы' : `Следующий через ${countdown || 'скоро'}`}
          </p>
        </div>
        <button
          onClick={onClaim}
          disabled={!available}
          className="shrink-0 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Забрать
        </button>
      </div>
    </motion.div>
  );
});
