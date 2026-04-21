import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { Zap } from 'lucide-react';
import { memo, useEffect, useLayoutEffect, useRef } from 'react';

import { useRocketStore } from '../../store/rocketStore';
import { GridFloor, Starfield } from './Background';
import { ExplosionEffect } from './ExplosionEffect';
import { ParticleTrail } from './ParticleTrail';
import { RocketSvg } from './RocketSvg';
import { multiplierColor, multiplierGlow, multiplierProgress, rocketPos } from './constants';

interface GameCanvasProps {
  status: 'BETTING' | 'RUNNING' | 'CRASHED';
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

// Launch position (multiplier = 1.0)
const LAUNCH_POS = rocketPos(multiplierProgress(1.0));

export const GameCanvas = memo(function GameCanvas({
  status,
  crashMultiplier,
  bettingSecondsLeft,
}: GameCanvasProps) {
  /**
   * ZERO-RERENDER PATTERN for 10Hz multiplier ticks:
   *
   * During RUNNING, the rocketStore emits multiplier updates at ~10Hz.
   * Instead of subscribing via the Zustand hook (which would re-render this
   * component 10×/sec), we:
   *   1. Drive rocket position via Framer Motion MotionValues (Framer updates
   *      the DOM directly — no React reconciliation).
   *   2. Update SVG trail paths via setAttribute() (React never touches those
   *      attributes again once the paths are mounted).
   *   3. Update the multiplier text via textContent (same idea).
   *   4. Share posRef with ParticleTrail so its RAF loop always reads the
   *      latest position without any prop updates.
   *
   * The component only re-renders when status/bettingSecondsLeft/crashMultiplier
   * change — which are infrequent, slow-changing props.
   */

  // MotionValues for rocket position — driven by subscribe callback, not React state
  const mvPosX = useMotionValue(LAUNCH_POS.x);
  const mvPosY = useMotionValue(LAUNCH_POS.y);
  const mvRocketOpacity = useMotionValue(1);
  // useTransform converts raw numbers to "42.3%" strings without re-renders
  const styleLeft = useTransform(mvPosX, v => `${v}%`);
  const styleTop = useTransform(mvPosY, v => `${v}%`);

  // posRef is shared with ParticleTrail — its RAF loop reads posRef.current directly
  const posRef = useRef<{ x: number; y: number }>(LAUNCH_POS);

  // DOM refs for direct manipulation during RUNNING
  const multTextRef = useRef<HTMLParagraphElement>(null);
  const trailGlowRef = useRef<SVGPathElement>(null);
  const trailLineRef = useRef<SVGPathElement>(null);

  // Persist last RUNNING position so CRASHED state can render the rocket there
  const lastPosRef = useRef<{ x: number; y: number }>(LAUNCH_POS);
  const lastProgressRef = useRef(0);

  const rotation = status === 'CRASHED' ? 135 : status === 'RUNNING' ? 35 : -10;
  // Keep rotation readable inside the subscribe callback without resubscribing
  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;

  // Seed multiplier display synchronously before first paint (prevents empty-text flash).
  // useLayoutEffect runs after DOM mutations but before browser paint.
  useLayoutEffect(() => {
    if (status !== 'RUNNING' || !multTextRef.current) return;
    const m = useRocketStore.getState().multiplier;
    multTextRef.current.textContent = `${m.toFixed(2)}x`;
    multTextRef.current.className = `text-8xl md:text-9xl font-black tabular-nums animate-multiplier-pulse ${multiplierColor(m)} ${multiplierGlow(m)}`;
  }, [status]);

  useEffect(() => {
    if (status !== 'RUNNING') return;

    const applyMultiplier = (m: number) => {
      const progress = multiplierProgress(m);
      const pos = rocketPos(progress);
      const rot = rotationRef.current;

      posRef.current = pos;
      lastPosRef.current = pos;
      lastProgressRef.current = progress;

      mvPosX.set(pos.x);
      mvPosY.set(pos.y);

      // Fade rocket when it overlaps with the centre multiplier text
      mvRocketOpacity.set(
        pos.x > 35 && pos.x < 65 && pos.y > 30 && pos.y < 60 ? 0.2 : 1,
      );

      // Update SVG trail via setAttribute — React won't override these after mount
      const path = buildTrailPath(progress, rot);
      trailGlowRef.current?.setAttribute('d', path);
      trailLineRef.current?.setAttribute('d', path);

      // Update multiplier display via direct DOM.
      // <p ref={multTextRef}> has NO JSX children so React tracks zero text fibers —
      // setting textContent here is safe and won't cause removeChild errors.
      const el = multTextRef.current;
      if (el) {
        el.textContent = `${m.toFixed(2)}x`;
        el.className = `text-8xl md:text-9xl font-black tabular-nums animate-multiplier-pulse ${multiplierColor(m)} ${multiplierGlow(m)}`;
      }
    };

    // Seed with current store value (for reconnect mid-round)
    applyMultiplier(useRocketStore.getState().multiplier);

    // Skip subscriber calls where only non-multiplier state changed
    let prevM = useRocketStore.getState().multiplier;
    const unsubscribe = useRocketStore.subscribe(state => {
      const m = state.multiplier;
      if (m === prevM) return;
      prevM = m;
      applyMultiplier(m);
    });

    return unsubscribe;
  }, [status, mvPosX, mvPosY, mvRocketOpacity]);

  // Positions for static states (computed once — no store subscription)
  const crashedProgress = crashMultiplier
    ? multiplierProgress(crashMultiplier)
    : lastProgressRef.current;
  const crashedPos = crashMultiplier ? rocketPos(crashedProgress) : lastPosRef.current;
  const crashedTrailPath = buildTrailPath(crashedProgress, 135);

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

        {/* RUNNING: paths start empty, subscribe callback drives them via setAttribute */}
        {status === 'RUNNING' && (
          <>
            <path
              ref={trailGlowRef}
              d="M 10 85 L 10 85"
              stroke="url(#trail-glow)"
              strokeWidth="3"
              fill="none"
              filter="url(#soft-blur)"
              strokeLinecap="round"
            />
            <path
              ref={trailLineRef}
              d="M 10 85 L 10 85"
              stroke="url(#trail-grad)"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}

        {status === 'CRASHED' && (
          <path
            d={crashedTrailPath}
            stroke="rgba(244,63,94,0.4)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="1 1"
          />
        )}
      </svg>

      {/* particle trail — receives shared posRef, no re-renders from position updates */}
      {status === 'RUNNING' && <ParticleTrail posRef={posRef} rotation={rotation} />}

      {/* explosion effect */}
      {status === 'CRASHED' && <ExplosionEffect pos={crashedPos} />}

      {/* Rocket */}
      {status === 'RUNNING' ? (
        /* MotionValues drive left/top directly — zero React re-renders from position */
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{
            left: styleLeft,
            top: styleTop,
            transform: 'translate(-50%, -50%)',
            opacity: mvRocketOpacity,
          }}
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
        >
          <RocketSvg running={true} crashed={false} />
        </motion.div>
      ) : (
        /* Static states: plain percentage strings, no MotionValues needed */
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{
            left: `${status === 'CRASHED' ? crashedPos.x : LAUNCH_POS.x}%`,
            top: `${status === 'CRASHED' ? crashedPos.y : LAUNCH_POS.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            rotate: rotation,
            scale: status === 'CRASHED' ? 0.8 : 1,
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
        >
          <RocketSvg running={false} crashed={status === 'CRASHED'} />
        </motion.div>
      )}

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
              {/*
               * Plain <p> with NO JSX children — React creates zero text fiber nodes.
               * textContent + className are set directly by the subscribe callback and
               * useLayoutEffect, which is safe because React has nothing to reconcile here.
               * CSS animate-multiplier-pulse replaces Framer Motion's scale animation
               * to avoid Framer's internal <Text> wrapper that caused removeChild errors.
               */}
              <p
                ref={multTextRef}
                className={`text-8xl md:text-9xl font-black tabular-nums animate-multiplier-pulse ${multiplierColor(1.0)} ${multiplierGlow(1.0)}`}
              />
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
                {(crashMultiplier ?? 1).toFixed(2)}x
              </p>
              <p className="text-sm text-slate-500 mt-3">новый раунд скоро...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
