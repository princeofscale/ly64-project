import type { PocketColor } from '@/core/types/roulette';

export const CHIP_VALUES = [1, 5, 25, 100] as const;

export type ChipValue = (typeof CHIP_VALUES)[number];

export const STARTING_BALANCE = 1_000;
export const SPIN_DURATION_MS = 5_200;

/** Outer track radius in SVG units. */
export const BALL_OUTER_RADIUS = 87;
/** Pocket centreline radius in SVG units. */
export const BALL_INNER_RADIUS = 72;

export interface ChipStyle {
  outer: string;
  inner: string;
}

export const CHIP_STYLES: Record<ChipValue, ChipStyle> = {
  1: {
    outer: 'border-slate-400',
    inner: 'from-slate-100 to-slate-300 text-slate-800 shadow-slate-400/30',
  },
  5: {
    outer: 'border-red-800',
    inner: 'from-red-400 to-red-600 text-white shadow-red-600/30',
  },
  25: {
    outer: 'border-emerald-800',
    inner: 'from-emerald-400 to-emerald-600 text-white shadow-emerald-600/30',
  },
  100: {
    outer: 'border-violet-800',
    inner: 'from-indigo-500 to-violet-700 text-white shadow-violet-700/30',
  },
};

export const POCKET_GRADIENT: Record<PocketColor, string> = {
  red: 'bg-gradient-to-br from-red-500 to-red-700',
  black: 'bg-gradient-to-br from-slate-700 to-slate-900',
  green: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
};

export const POCKET_LABEL: Record<PocketColor, string> = {
  red: 'Красное',
  black: 'Чёрное',
  green: 'Зеро',
};
