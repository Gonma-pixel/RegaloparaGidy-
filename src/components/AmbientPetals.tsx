import { motion, useReducedMotion } from 'motion/react';

interface AmbientPetalsProps {
  enabled: boolean;
}

const PETALS = [
  { id: 1, left: '8%', delay: 0, duration: 18, size: 10, drift: 26, rotate: 45 },
  { id: 2, left: '22%', delay: 4, duration: 22, size: 8, drift: -22, rotate: -35 },
  { id: 3, left: '38%', delay: 2, duration: 20, size: 11, drift: 30, rotate: 60 },
  { id: 4, left: '54%', delay: 7, duration: 24, size: 9, drift: -28, rotate: 20 },
  { id: 5, left: '72%', delay: 1.5, duration: 19, size: 10, drift: 20, rotate: -50 },
  { id: 6, left: '88%', delay: 5.5, duration: 21, size: 8, drift: -24, rotate: 40 },
];

export function AmbientPetals({ enabled }: AmbientPetalsProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!enabled || prefersReducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-10"
    >
      {PETALS.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{ y: -32, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '105vh'],
            x: [0, petal.drift, -petal.drift * 0.6, petal.drift * 0.4],
            opacity: [0, 0.45, 0.38, 0],
            rotate: [0, petal.rotate, petal.rotate * 2],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ left: petal.left, width: petal.size, height: petal.size * 1.35 }}
          className="absolute -top-6 rounded-tl-[85%] rounded-br-[85%] rounded-tr-[15%] rounded-bl-[15%] bg-[#15803D]/20"
        />
      ))}
    </div>
  );
}
