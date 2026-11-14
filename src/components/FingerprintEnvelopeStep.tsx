import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Heart } from 'lucide-react';

interface FingerprintEnvelopeStepProps {
  partnerOne: string;
  partnerTwo: string;
  coupleNames: string;
  onUnlocked: () => void;
}

const HOLD_DURATION_MS = 1800;
const RING_RADIUS = 64;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Detailed anatomical dermal ridges (whorl + loop paths with natural minutiae breaks)
const FINGERPRINT_RIDGES = [
  'M 50 42 C 55 42, 57 47, 57 53 C 57 60, 53 64, 49 64 C 45 64, 43 59, 43 53 C 43 48, 45 45, 48 44',
  'M 49 48 C 51 48, 52 51, 52 55 C 52 58, 50 60, 48 59',
  'M 41 44 C 44 37, 56 37, 60 44 C 63 50, 62 62, 57 67',
  'M 54 69 C 47 72, 39 67, 38 58 C 37 53, 38 49, 40 46',
  'M 36 42 C 41 32, 59 32, 65 42 C 68 48, 68 58, 65 65',
  'M 63 69 C 57 76, 44 77, 37 70 C 33 65, 32 54, 34 46',
  'M 31 44 C 35 28, 63 26, 70 41 C 73 48, 73 59, 70 67',
  'M 67 72 C 60 81, 43 83, 33 75 C 28 70, 27 59, 29 49',
  'M 26 46 C 29 24, 65 20, 75 39 C 78 46, 79 58, 76 68',
  'M 73 74 C 66 85, 44 89, 31 80 C 24 75, 22 63, 24 52',
  'M 21 51 C 21 25, 58 15, 76 31 C 81 36, 84 48, 82 62',
  'M 79 70 C 75 83, 59 91, 42 90 C 30 89, 21 80, 19 66',
  'M 18 45 C 24 19, 64 11, 81 30',
  'M 85 45 C 88 60, 84 76, 73 86',
  'M 27 85 C 40 96, 62 96, 75 86',
  'M 33 21 C 46 14, 62 15, 73 23',
  'M 16 58 C 16 68, 19 77, 25 83',
  'M 84 35 C 86 40, 87 46, 87 52',
  'M 35 92 C 45 97, 59 97, 68 92',
];

export function FingerprintEnvelopeStep({
  partnerOne,
  partnerTwo,
  coupleNames,
  onUnlocked,
}: FingerprintEnvelopeStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const clipId = useId();
  const glowFilterId = useId();

  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isExpandingFullscreen, setIsExpandingFullscreen] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isUnlocked) return;

    const step = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setProgress((prev) => {
        const next = isHolding
          ? Math.min(1, prev + delta / HOLD_DURATION_MS)
          : Math.max(0, prev - delta / 550);

        if (next >= 1) {
          setIsUnlocked(true);
          setIsHolding(false);
          return 1;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    if (isHolding || progress > 0) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isHolding, isUnlocked, progress > 0]);

  // Sequence: 1) Envelope flap opens & card rises -> 2) Card expands to full screen -> 3) Hand off to full-screen letter page
  useEffect(() => {
    if (!isUnlocked) return;

    const expandTimer = window.setTimeout(
      () => {
        setIsExpandingFullscreen(true);
      },
      prefersReducedMotion ? 50 : 620
    );

    const completeTimer = window.setTimeout(
      () => {
        onUnlocked();
      },
      prefersReducedMotion ? 150 : 1280
    );

    return () => {
      window.clearTimeout(expandTimer);
      window.clearTimeout(completeTimer);
    };
  }, [isUnlocked, onUnlocked, prefersReducedMotion]);

  const startHold = () => {
    if (isUnlocked) return;
    setIsHolding(true);
  };

  const endHold = () => {
    setIsHolding(false);
  };

  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const percentage = Math.round(progress * 100);
  const revealHeight = 100 * progress;
  const revealY = 100 - revealHeight;

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#E7F8E8] via-[#F7FCE6] to-[#FEF9D7] flex flex-col items-center justify-center px-6 py-10 overflow-hidden">
      <div className="w-full max-w-lg flex flex-col items-center">
        <p className="text-xs font-medium text-[#70656A] mb-2">
          <span>Tarjeta privada</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Para {partnerOne} De {partnerTwo}</span>
        </p>

        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#141214] text-center text-balance mb-9">
          {isUnlocked
            ? 'Abriendo tu carta...'
            : 'Abre el sobre y descúbrelo'}
        </h1>

        {/* Medium 3D Card Envelope */}
        <div
          className="relative w-full max-w-[390px] h-[250px] mb-10"
          style={{ perspective: '1100px' }}
        >
          <div className="absolute inset-0 rounded-2xl bg-[#EAE4E6] border border-[#D8D0D3] shadow-sm" />

          {/* Inner Card rising out on unlock */}
          <motion.div
            initial={false}
            animate={isUnlocked ? { y: -88, scale: 1.03 } : { y: 10, scale: 0.96 }}
            transition={{
              duration: prefersReducedMotion ? 0.01 : 0.65,
              delay: isUnlocked ? 0.14 : 0,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-x-5 top-4 bottom-5 rounded-xl bg-white border border-[#E5E0E2] shadow-md p-5 flex flex-col items-center justify-center text-center z-10"
          >
            <Heart className="w-6 h-6 text-[#15803D] fill-[#15803D] mb-2" />
            <p className="font-serif text-2xl sm:text-3xl font-medium text-[#141214]">
              {coupleNames}
            </p>
            <p className="mt-1 text-xs text-[#70656A]">
              Para {partnerOne}, con amor de {partnerTwo}
            </p>
          </motion.div>

          {/* Envelope Front Pocket */}
          <svg
            viewBox="0 0 390 250"
            className="absolute inset-0 w-full h-full z-20 pointer-events-none rounded-2xl overflow-hidden"
            aria-hidden="true"
          >
            <polygon points="0,0 200,134 0,250" fill="#F2EFF0" />
            <polygon points="390,0 190,134 390,250" fill="#EDE8EA" />
            <polygon points="0,250 195,120 390,250" fill="#FAF8F9" />
            <path
              d="M0,250 L195,120 L390,250"
              fill="none"
              stroke="#E5E0E2"
              strokeWidth="1.5"
            />
          </svg>

          {/* Top Flap */}
          <motion.div
            initial={false}
            animate={isUnlocked ? { rotateX: 175 } : { rotateX: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.01 : 0.52,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
            }}
            className={`absolute inset-x-0 top-0 h-[145px] pointer-events-none ${
              isUnlocked ? 'z-0' : 'z-30'
            }`}
          >
            <svg
              viewBox="0 0 390 145"
              className="w-full h-full drop-shadow-sm"
              aria-hidden="true"
            >
              <polygon
                points="0,0 390,0 195,138"
                fill="#FFFFFF"
                stroke="#E5E0E2"
                strokeWidth="1.5"
              />
            </svg>
          </motion.div>
        </div>

        {/* Medium Realistic Optical Fingerprint Sensor */}
        <div className="flex flex-col items-center gap-3.5">
          <div className="relative flex items-center justify-center">
            {isHolding && !prefersReducedMotion && (
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0.94, opacity: 0.45 }}
                animate={{ scale: 1.24, opacity: 0 }}
                transition={{ duration: 1.15, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-[#15803D]/50 pointer-events-none"
              />
            )}

            <button
              type="button"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onKeyDown={(e) => {
                if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                  e.preventDefault();
                  startHold();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  endHold();
                }
              }}
              disabled={isUnlocked}
              aria-label="Mantén presionada la huella digital para abrir el sobre"
              className="relative w-36 h-36 rounded-full p-2 bg-gradient-to-b from-[#FFFFFF] to-[#E9E4E6] shadow-[0_10px_28px_rgba(20,18,20,0.12)] border border-[#D8D0D3] flex items-center justify-center select-none touch-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 active:scale-[0.97] transition-transform duration-150"
            >
              <svg
                viewBox="0 0 144 144"
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                aria-hidden="true"
              >
                <circle
                  cx="72"
                  cy="72"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="rgba(20,18,20,0.08)"
                  strokeWidth="4.5"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#15803D"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
              </svg>

              <div
                className="relative w-28 h-28 rounded-full overflow-hidden flex items-center justify-center border border-[#3B3337] shadow-inner"
                style={{
                  background:
                    'radial-gradient(circle at 38% 30%, #2C2528 0%, #171315 70%, #0E0B0C 100%)',
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-22 h-22 pointer-events-none"
                  aria-hidden="true"
                >
                  <defs>
                    <clipPath id={clipId}>
                      <rect
                        x="0"
                        y={revealY}
                        width="100"
                        height={revealHeight}
                      />
                    </clipPath>
                    <filter
                      id={glowFilterId}
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="1.4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <g
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.22)"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  >
                    {FINGERPRINT_RIDGES.map((d, idx) => (
                      <path key={`base-${idx}`} d={d} />
                    ))}
                  </g>

                  <g
                    fill="none"
                    stroke="#4ADE80"
                    strokeWidth="2.15"
                    strokeLinecap="round"
                    clipPath={`url(#${clipId})`}
                    filter={`url(#${glowFilterId})`}
                  >
                    {FINGERPRINT_RIDGES.map((d, idx) => (
                      <path key={`glow-${idx}`} d={d} />
                    ))}
                  </g>
                </svg>

                {isHolding && !prefersReducedMotion && (
                  <motion.div
                    aria-hidden="true"
                    initial={{ y: -44 }}
                    animate={{ y: [-44, 44, -44] }}
                    transition={{
                      duration: 1.05,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-x-2 h-6 pointer-events-none flex flex-col justify-end"
                  >
                    <div className="h-5 bg-gradient-to-b from-transparent to-[#4ADE80]/35" />
                    <div className="h-[2px] bg-[#86EFAC] shadow-[0_0_10px_#22C55E]" />
                  </motion.div>
                )}

                <div
                  aria-hidden="true"
                  className="absolute -top-6 -left-6 w-24 h-16 rounded-full bg-white/[0.06] rotate-[-25deg] pointer-events-none"
                />
              </div>
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs font-medium text-[#574F53]">
              {isUnlocked
                ? 'Huella confirmada'
                : isHolding
                ? 'Escaneando huella...'
                : 'Coloca y mantén presionado'}
            </p>
            <p className="font-mono text-xs text-[#70656A] tabular-nums mt-0.5">
              {percentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Expansion Overlay Effect when envelope unlocks */}
      {isExpandingFullscreen && (
        <motion.div
          aria-hidden="true"
          initial={{
            opacity: 0.92,
            scale: 0.34,
            borderRadius: '24px',
          }}
          animate={{
            opacity: 1,
            scale: 1,
            borderRadius: '0px',
          }}
          transition={{
            duration: prefersReducedMotion ? 0.01 : 0.62,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-[#E7F8E8] via-[#F7FCE6] to-[#FEF9D7] border border-[#D5E6D6] flex flex-col items-center justify-center shadow-2xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex flex-col items-center text-center px-6"
          >
            <Heart className="w-8 h-8 text-[#15803D] fill-[#15803D] mb-3" />
            <p className="font-serif text-3xl sm:text-4xl font-medium text-[#141214]">
              Para {partnerOne}, de {partnerTwo}
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
