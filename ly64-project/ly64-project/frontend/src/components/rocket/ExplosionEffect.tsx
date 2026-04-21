import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface ExplosionEffectProps {
  pos: { x: number; y: number };
}

export const ExplosionEffect = memo(function ExplosionEffect({ pos }: ExplosionEffectProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const speed = 30 + Math.random() * 40;
        return {
          id: i,
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          size: 3 + Math.random() * 5,
          delay: Math.random() * 0.1,
        };
      }),
    [],
  );

  return (
    <>
      {/* Screen shake container */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-40"
        initial={{ x: 0, y: 0 }}
        animate={{
          x: [0, -4, 4, -3, 3, -2, 2, 0],
          y: [0, 3, -3, 2, -2, 1, -1, 0],
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Red flash overlay */}
        <motion.div
          className="absolute inset-0 bg-rose-500/40 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.4 }}
        />

        {/* Explosion particles */}
        <div className="absolute inset-0">
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: p.size,
                height: p.size,
                background: `linear-gradient(135deg, #fbbf24, #f97316, #ef4444)`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: [1, 0.8, 0],
                scale: [1, 1.2, 0.3],
              }}
              transition={{
                duration: 0.8,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Smoke clouds */}
        <div className="absolute inset-0">
          {[0, 1, 2].map(i => (
            <motion.div
              key={`smoke-${i}`}
              className="absolute rounded-full bg-slate-700/60 blur-md"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: 40 + i * 15,
                height: 40 + i * 15,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.7, 0.4, 0],
                scale: [0.5, 1.2, 1.8, 2.2],
                y: [-10, -20, -35, -50],
              }}
              transition={{
                duration: 2,
                delay: i * 0.15,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
});
