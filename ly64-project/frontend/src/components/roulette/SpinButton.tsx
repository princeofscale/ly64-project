import { Disc3, Trophy } from 'lucide-react';
import { memo } from 'react';

interface SpinButtonProps {
  spinning: boolean;
  hasBets: boolean;
  totalBet: number;
  onSpin: () => void;
}

export const SpinButton = memo(function SpinButton({ spinning, hasBets, totalBet, onSpin }: SpinButtonProps) {
  const disabled = spinning || !hasBets;
  return (
    <button
      type="button"
      onClick={onSpin}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all shadow-xl ${
        spinning
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
          : !hasBets
            ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white hover:brightness-110 hover:-translate-y-0.5 shadow-amber-600/40 ring-2 ring-amber-300/30 active:translate-y-0'
      }`}
    >
      {spinning ? (
        <span className="inline-flex items-center gap-2">
          <Disc3 className="w-5 h-5 animate-spin" />
          Колесо крутится…
        </span>
      ) : !hasBets ? (
        'Сделайте ставку'
      ) : (
        <span className="inline-flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Крутить! · Ставка {totalBet}
        </span>
      )}
    </button>
  );
});
