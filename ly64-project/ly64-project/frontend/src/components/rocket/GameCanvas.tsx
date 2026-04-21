import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { memo, useMemo } from 'react';

import { GridFloor, Starfield } from './Background';
import { ExplosionEffect } from './ExplosionEffect';
import { ParticleTrail } from './ParticleTrail';
import { RocketSvg } from './RocketSvg';
import { multiplierColor, multiplierGlow, multiplierProgress, rocketPos } from './constants';

interface GameCanvasProps {
  status: 'BETTING' | 'RUNNING' | 'CRASHED';
  multiplier: number;
  crashMultiplier?: number;
  bettingSecondsLeft: number;
}

/** Straight trail from launch point to rocket center */
const buildTrailPath = (pos: { x: number; y: number }): string =>
  `M 10 85 L ${pos.x} ${pos.y}`;

export const GameCanvas = memo(function GameCanvas({
  status,
  multiplier,
  crashMultiplier,
  bettingSecondsLeft,
}: GameCanvasProps) {
  const displayedMultiplier =
    status === 'CRASHED' ? (crashMultiplier ?? multiplier) : multiplier;

  const progress = useMemo(() => multiplierProgress(multiplier), [multiplier]);
  const pos = useMemo(() => rocketPos(progress), [progress]);
  const rotation = status === 'CRASHED' ? 135 : status === 'RUNNING' ? 35 : -10;
  const trailPath = useMemo(() => buildTrailPath(pos), [pos]);

  // Затемняем ракету, когда она перекрывает центральный текст
  const rocketOpacity =
    status === 'RUNNING' && pos.x > 35 && pos.x < 65 && pos.y > 30 && pos.y < 60 ? 0.2 : 1;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-black shadow-[0_0_60px_rgba(99,102,241,0.15)] aspect-[16/10]">
      <Starfield />
      <GridFloor />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="trail-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(99,102,241,0)" />
            <stop offset="35%" stopColor="rgba(168,85,247,0.35)" />
            <stop offset="100%" stopColor="rgba(244,114,182,0.95)" />
          </linearGradient>
          <linearGradient id="trail-glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(236,72,153,0)" />
            <stop offset="100%" stopColor="rgba(236,72,153,0.5)" />
          </linearGradient>
          <filter id="soft-blur">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        {status === 'RUNNING' && progress > 0 && (
          <>
            <path
              d={trailPath}
              stroke="url(#trail-glow)"
              strokeWidth="3"
              fill="none"
              filter="url(#soft-blur)"
              strokeLinecap="round"
            />
            <path
              d={trailPath}
              stroke="url(#trail-grad)"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}

        {status === 'CRASHED' && (
          <path
            d={trailPath}
            stroke="rgba(244,63,94,0.4)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="1 1"
          />
        )}
      </svg>

      {status === 'RUNNING' && <ParticleTrail pos={pos} />}
      {status === 'CRASHED' && <ExplosionEffect pos={pos} />}

      {/* Ракета — CSS transitions вместо framer-motion */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${status === 'CRASHED' ? 0.8 : 1})`,
          opacity: rocketOpacity,
          transition:
            'left 100ms linear, top 100ms linear, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s linear',
          willChange: 'left, top, transform',
        }}
      >
        <RocketSvg running={status === 'RUNNING'} crashed={status === 'CRASHED'} />
      </div>

      {/* Центральный текст */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
        <AnimatePresence mode="wait">
          {status === 'BETTING' && (
            <motion.div
              key="betting"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="text-center z-10"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-400/80 mb-3">
                Приём ставок
              </p>
              <p className="text-7xl md:text-8xl font-black text-emerald-300 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)] tabular-nums">
                {bettingSecondsLeft.toFixed(1)}
              </p>
              <p className="text-sm text-slate-500 mt-3">секунд до взлёта</p>
              <div className="mt-4 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{
                    width: `${(bettingSecondsLeft / 10) * 100}%`,
                    transition: 'width 100ms linear',
                    willChange: 'width',
                  }}
                />
              </div>
            </motion.div>
          )}

          {status === 'RUNNING' && (
            <motion.div
              key="running"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center z-10"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-3">
                Множитель
              </p>
              <p
                className={`multiplier-pulse text-8xl md:text-9xl font-black tabular-nums transition-colors ${multiplierColor(multiplier)} ${multiplierGlow(multiplier)}`}
              >
                {multiplier.toFixed(2)}x
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Zap className="w-3 h-3" />
                <span>летит...</span>
              </div>
            </motion.div>
          )}

          {status === 'CRASHED' && (
            <motion.div
              key="crashed"
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center z-10"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-rose-400 mb-3">
                Взрыв!
              </p>
              <p className="text-7xl md:text-8xl font-black text-rose-500 drop-shadow-[0_0_40px_rgba(244,63,94,0.7)] tabular-nums">
                {(displayedMultiplier ?? 1).toFixed(2)}x
              </p>
              <p className="text-sm text-slate-500 mt-3">новый раунд скоро...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
