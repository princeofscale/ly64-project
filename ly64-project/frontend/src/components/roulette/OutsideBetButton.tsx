import { memo } from 'react';

import type { BetKey } from '@/core/types/roulette';

import { ChipStack } from './ChipStack';

interface OutsideBetButtonProps {
  label: string;
  betKey: BetKey;
  amount: number;
  onPlace: (key: BetKey) => void;
  onRemove: (key: BetKey) => void;
  disabled: boolean;
  variant?: 'red' | 'black';
}

export const OutsideBetButton = memo(function OutsideBetButton({
  label,
  betKey,
  amount,
  onPlace,
  onRemove,
  disabled,
  variant,
}: OutsideBetButtonProps) {
  const variantClass =
    variant === 'red'
      ? 'bg-gradient-to-br from-red-500/90 to-red-700/90 hover:from-red-400 hover:to-red-600'
      : variant === 'black'
        ? 'bg-gradient-to-br from-slate-700/90 to-slate-950/90 hover:from-slate-600 hover:to-slate-900'
        : 'bg-emerald-800/60 hover:bg-emerald-700/70';

  return (
    <button
      type="button"
      onClick={() => onPlace(betKey)}
      onContextMenu={(e) => {
        e.preventDefault();
        onRemove(betKey);
      }}
      disabled={disabled}
      className={`relative py-2 rounded-md text-white font-bold text-xs border border-amber-400/20 hover:border-amber-400/60 disabled:opacity-50 transition-all select-none ${variantClass}`}
    >
      {label}
      {amount > 0 && <ChipStack amount={amount} />}
    </button>
  );
});
