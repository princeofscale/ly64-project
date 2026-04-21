import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface ParticleTrailProps {
  pos: { x: number; y: number };
}

export const ParticleTrail = memo(function ParticleTrail({ pos }: ParticleTrailProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        delay: i * 0.12,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map(p => (
        <motion.span
          key={p.id}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 shadow-[0_0_10px_rgba(251,113,133,0.8)]"
          style={{ left: `${pos.x}%`, top: `${pos.y + 2}%`, translate: '-50% -50%' }}
          animate={{
            opacity: [1, 0.6, 0],
            scale: [1, 0.5, 0.1],
            x: [0, -14 - p.id * 2, -28 - p.id * 3],
            y: [0, 8 + p.id * 2, 18 + p.id * 3],
          }}
          transition={{ repeat: Infinity, duration: 0.9, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
});
