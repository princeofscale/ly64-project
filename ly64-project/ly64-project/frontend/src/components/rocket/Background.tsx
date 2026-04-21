import { memo, useMemo } from 'react';

import './starfield.css';

/** Static nebula blobs — no animation needed */
export const Nebula = memo(function Nebula() {
  return (
    <div className="pointer-events-none fixed inset-0 opacity-70">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/25 rounded-full blur-[140px]" />
      <div className="absolute top-[30%] right-[-15%] w-[55%] h-[55%] bg-fuchsia-600/20 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-cyan-600/15 rounded-full blur-[130px]" />
    </div>
  );
});

/** Pure CSS starfield — no framer-motion, no per-frame React re-renders */
export const Starfield = memo(function Starfield() {
  const stars = useMemo(() => {
    const result: Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      delay: number;
      dur: number;
      layer: 1 | 2;
    }> = [];

    for (let i = 0; i < 50; i++) {
      result.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.2 + 0.3,
        delay: Math.random() * 4,
        dur: 2 + Math.random() * 3,
        layer: 1,
      });
    }
    for (let i = 0; i < 18; i++) {
      result.push({
        id: 100 + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
        dur: 5 + Math.random() * 4,
        layer: 2,
      });
    }
    return result;
  }, []);

  const shooters = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: i,
        startY: 10 + Math.random() * 40,
        delay: i * 5 + Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <span
          key={s.id}
          className={`absolute rounded-full ${s.layer === 1 ? 'star-twinkle bg-white' : 'star-drift bg-indigo-100 shadow-[0_0_6px_rgba(199,210,254,0.8)]'}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}

      {shooters.map(s => (
        <span
          key={`sh-${s.id}`}
          className="shooting-star absolute h-[1px] w-20 bg-gradient-to-r from-white via-indigo-200 to-transparent"
          style={{
            top: `${s.startY}%`,
            left: '-10%',
            animationDelay: `${s.delay}s`,
            animationDuration: `${1.8 + s.id * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
});

/** Perspective grid floor */
export const GridFloor = memo(function GridFloor() {
  return (
    <svg
      className="absolute inset-x-0 bottom-0 h-1/3 w-full pointer-events-none opacity-30"
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="floor-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(99,102,241,0)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.5)" />
        </linearGradient>
      </defs>
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          y1={3 + i * 2.7}
          x2="100"
          y2={3 + i * 2.7}
          stroke="url(#floor-fade)"
          strokeWidth="0.15"
        />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * 10}
          y1="0"
          x2={i * 10 - 50 + i * 10}
          y2="30"
          stroke="url(#floor-fade)"
          strokeWidth="0.15"
        />
      ))}
    </svg>
  );
});
