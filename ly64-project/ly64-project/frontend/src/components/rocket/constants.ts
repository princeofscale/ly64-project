/** Символ валюты Рутений */
export const RUTH_SYMBOL = 'Ɍ';

export const QUICK_BET_AMOUNTS = [0.5, 1, 2, 5];

export const formatRuth = (n: number): string =>
  n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const multiplierColor = (m: number): string => {
  if (m < 1.5) return 'text-white';
  if (m < 2) return 'text-cyan-300';
  if (m < 3) return 'text-sky-300';
  if (m < 5) return 'text-yellow-300';
  if (m < 10) return 'text-orange-400';
  return 'text-pink-500';
};

export const multiplierGlow = (m: number): string => {
  if (m < 1.5) return 'drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]';
  if (m < 2) return 'drop-shadow-[0_0_40px_rgba(103,232,249,0.55)]';
  if (m < 5) return 'drop-shadow-[0_0_50px_rgba(250,204,21,0.55)]';
  if (m < 10) return 'drop-shadow-[0_0_55px_rgba(251,146,60,0.65)]';
  return 'drop-shadow-[0_0_60px_rgba(236,72,153,0.7)]';
};

export const historyTileColor = (m: number): string => {
  if (m < 1.5) return 'bg-slate-800/60 text-slate-300 ring-1 ring-inset ring-slate-700';
  if (m < 2) return 'bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-500/40';
  if (m < 5) return 'bg-yellow-500/15 text-yellow-300 ring-1 ring-inset ring-yellow-500/40';
  if (m < 10) return 'bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-500/40';
  return 'bg-pink-500/15 text-pink-300 ring-1 ring-inset ring-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.3)]';
};

/** Map multiplier -> 0..1 progress along trajectory curve */
export const multiplierProgress = (m: number): number => {
  const MAX = 10;
  return Math.min(1, Math.log(Math.max(m, 1)) / Math.log(MAX));
};

/** Rocket position in percent (viewBox 100x100, origin top-left) */
export const rocketPos = (progress: number): { x: number; y: number } => ({
  x: 10 + progress * 78,
  y: 85 - progress * 70,
});
