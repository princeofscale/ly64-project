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

/**
 * Trail goes from the launch point straight through the rocket's flame.
 * RocketSvg draws the rocket nose-up; CSS rotate rotates clockwise.
 * A rocket rotated by θ has its nose pointing (sin θ, -cos θ) and its flame
 * pointing the opposite way, so flame offset = (-sin θ, cos θ) * d.
 */
const buildTrailPath = (progress: number, rotation: number): string => {
  const rocketCenter = rocketPos(progress);
  const angleRad = (rotation * Math.PI) / 180;
  const flameOffsetDist = 3;
  const flameX = rocketCenter.x - Math.sin(angleRad) * flameOffsetDist;
  const flameY = rocketCenter.y + Math.cos(angleRad) * flameOffsetDist;
  return `M 10 85 L ${flameX.toFixed(3)} ${flameY.toFixed(3)}`;
};

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
  const trailPath = useMemo(() => buildTrailPath(progress, rotation), [progress, rotation]);

  // Fade rocket when it overlaps with multiplier text (center area)
  const rocketOpacity = status === 'RUNNING' && pos.x > 35 && pos.x < 65 && pos.y > 30 && pos.y < 60 ? 0.2 : 1;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-black shadow-[0_0_60px_rgba(99,102,241,0.15)] aspect-[16/10]">
      <Starfield />
      <GridFloor />

      {/* trajectory + rocket — absolute svg overlay */}
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

      {/* particle trail */}
      {status === 'RUNNING' && <ParticleTrail pos={pos} />}

      {/* explosion effect */}
      {status === 'CRASHED' && <ExplosionEffect pos={pos} />}

      {/* Rocket — absolutely positioned using percent */}
      <motion.div
        className="absolute pointer-events-none z-20"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
          opacity: rocketOpacity,
        }}
        animate={{
          rotate: rotation,
          scale: status === 'CRASHED' ? 0.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 80, damping: 14 }}
      >
        <RocketSvg running={status === 'RUNNING'} crashed={status === 'CRASHED'} />
      </motion.div>

      {/* center overlay text */}
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
              <motion.p
                className="text-7xl md:text-8xl font-black text-emerald-300 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)] tabular-nums"
                key={Math.floor(bettingSecondsLeft)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {bettingSecondsLeft.toFixed(1)}
              </motion.p>
              <p className="text-sm text-slate-500 mt-3">секунд до взлёта</p>
              <div className="mt-4 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(bettingSecondsLeft / 10) * 100}%` }}
                  transition={{ ease: 'linear', duration: 0.1 }}
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
              <motion.p
                className={`text-8xl md:text-9xl font-black tabular-nums transition-colors ${multiplierColor(multiplier)} ${multiplierGlow(multiplier)}`}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                {multiplier.toFixed(2)}x
              </motion.p>
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-xs uppercase tracking-[0.4em] text-rose-400 mb-3">
                  Взрыв!
                </p>
              </motion.div>
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
