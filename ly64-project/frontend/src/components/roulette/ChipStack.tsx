import { memo } from 'react';

interface ChipStackProps {
  amount: number;
}

export const ChipStack = memo(function ChipStack({ amount }: ChipStackProps) {
  return (
    <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-700 flex items-center justify-center text-[9px] font-black text-amber-900 shadow-lg tabular-nums z-10">
      {amount > 999 ? '999+' : amount}
    </div>
  );
});
