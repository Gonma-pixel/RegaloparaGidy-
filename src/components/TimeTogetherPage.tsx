import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import type { DedicationProfile } from '../types/dedication';
import { calculateDuration } from './TimeTogetherCounter';

interface TimeTogetherPageProps {
  profile: DedicationProfile;
  onContinue: () => void;
}

const FLOATING_PARTICLES = [
  { id: 0, left: '8%', delay: 0, duration: 9.5, size: 15, kind: 'heart' as const },
  { id: 1, left: '16%', delay: 2.1, duration: 11, kind: 'sparkle' as const, size: 14 },
  { id: 2, left: '26%', delay: 1.2, duration: 10.2, kind: 'heart' as const, size: 18 },
  { id: 3, left: '38%', delay: 3.6, duration: 12, kind: 'sparkle' as const, size: 13 },
  { id: 4, left: '52%', delay: 0.7, duration: 9.8, kind: 'heart' as const, size: 16 },
  { id: 5, left: '66%', delay: 2.8, duration: 11.4, kind: 'sparkle' as const, size: 15 },
  { id: 6, left: '78%', delay: 1.5, duration: 10.6, kind: 'heart' as const, size: 19 },
  { id: 7, left: '89%', delay: 3.1, duration: 9.2, kind: 'sparkle' as const, size: 14 },
];

export function TimeTogetherPage({
  profile,
  onContinue,
}: TimeTogetherPageProps) {
  const [now, setNow] = useState(() => new Date());
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const duration = useMemo(
    () => calculateDuration(profile.startDateIso, now),
    [profile.startDateIso, now]
  );

  const formattedStartDate = useMemo(() => {
    const d = new Date(profile.startDateIso);
    if (Number.isNaN(d.getTime())) return 'Fecha no definida';
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [profile.startDateIso]);

  const timeUnits = [
    { label: duration.years === 1 ? 'Año' : 'Años', value: duration.years, isSeconds: false },
    { label: duration.months === 1 ? 'Mes' : 'Meses', value: duration.months, isSeconds: false },
    { label: duration.days === 1 ? 'Día' : 'Días', value: duration.days, isSeconds: false },
    { label: duration.hours === 1 ? 'Hora' : 'Horas', value: duration.hours, isSeconds: false },
    { label: duration.minutes === 1 ? 'Minuto' : 'Minutos', value: duration.minutes, isSeconds: false },
    { label: duration.seconds === 1 ? 'Segundo' : 'Segundos', value: duration.seconds, isSeconds: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#E2F7E5] via-[#F4FCE6] to-[#FEF8D2] text-[#141214] flex flex-col justify-center px-6 sm:px-10 py-14 sm:py-20"
    >
      {/* Romantic ambient glowing orbs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [1, 1.12, 1], opacity: [0.42, 0.62, 0.42] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-20 w-[26rem] h-[26rem] rounded-full bg-[#86EFAC]/35 blur-3xl"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }
          }
          transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute -bottom-28 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#FDE68A]/45 blur-3xl"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [1, 1.08, 1], opacity: [0.25, 0.42, 0.25] }
          }
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[20rem] rounded-full bg-[#A7F3D0]/30 blur-3xl"
        />

        {/* Floating green hearts and sparkles */}
        {!shouldReduceMotion &&
          FLOATING_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: '108vh', opacity: 0, rotate: -10 }}
              animate={{
                y: ['108vh', '-12vh'],
                opacity: [0, 0.55, 0.55, 0],
                x: [0, p.id % 2 === 0 ? 22 : -22, 0],
                rotate: [0, p.id % 2 === 0 ? 16 : -16, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ left: p.left }}
              className="absolute top-0 text-[#15803D]/35"
            >
              {p.kind === 'heart' ? (
                <Heart
                  style={{ width: p.size, height: p.size }}
                  className="fill-[#22C55E]/20 text-[#15803D]/45"
                />
              ) : (
                <Sparkles
                  style={{ width: p.size, height: p.size }}
                  className="text-[#16A34A]/45"
                />
              )}
            </motion.div>
          ))}
      </div>

      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        aria-labelledby="time-page-title"
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-9 sm:gap-11"
      >
        <div className="max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#15803D]/20 shadow-sm text-xs sm:text-sm font-medium text-[#166534]">
            <motion.span
              animate={
                shouldReduceMotion
                  ? undefined
                  : { scale: [1, 1.24, 1, 1.15, 1] }
              }
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center"
            >
              <Heart className="w-4 h-4 text-[#15803D] fill-[#22C55E]" />
            </motion.span>
            <span>{profile.coupleNames}</span>
            <span aria-hidden="true" className="text-[#15803D]/50">·</span>
            <span>Desde el {formattedStartDate}</span>
          </div>

          <h1
            id="time-page-title"
            className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#141214] leading-[1.08] tracking-tight text-balance"
          >
            Nuestro{' '}
            <span className="italic text-[#15803D] relative inline-block">
              tiempo
            </span>{' '}
            juntos
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#4B5E4E] max-w-xl leading-relaxed">
            Cada latido, cada segundo y cada instante a tu lado se convierte en nuestro para siempre.
          </p>
        </div>

        {/* Dynamic animated 6-unit counter grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {timeUnits.map((unit, idx) => {
            const formattedValue = String(unit.value).padStart(2, '0');
            return (
              <motion.div
                key={unit.label}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.08 + idx * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.02 }}
                className={`group relative overflow-hidden py-7 px-4 sm:py-9 sm:px-5 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center text-center transition-shadow duration-300 ${
                  unit.isSeconds
                    ? 'bg-gradient-to-b from-white/95 to-[#ECFDF5]/90 border border-[#22C55E]/45 shadow-[0_14px_32px_-12px_rgba(21,128,61,0.28)]'
                    : 'bg-white/82 border border-[#15803D]/20 shadow-[0_10px_28px_-14px_rgba(20,83,45,0.18)] hover:border-[#15803D]/40 hover:shadow-[0_16px_34px_-12px_rgba(21,128,61,0.24)]'
                }`}
              >
                {/* Luminous emerald top accent line */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#86EFAC] via-[#15803D] to-[#86EFAC] transition-opacity duration-300 ${
                    unit.isSeconds ? 'opacity-100' : 'opacity-65 group-hover:opacity-100'
                  }`}
                />

                {/* Pulsing aura on the live Seconds card */}
                {unit.isSeconds && !shouldReduceMotion && (
                  <motion.div
                    aria-hidden="true"
                    animate={{ opacity: [0.18, 0.45, 0.18] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                    className="pointer-events-none absolute inset-0 bg-radial from-[#4ADE80]/20 via-transparent to-transparent"
                  />
                )}

                <div className="relative h-14 sm:h-16 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={formattedValue}
                      initial={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { y: 16, opacity: 0, filter: 'blur(4px)' }
                      }
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { y: -16, opacity: 0, filter: 'blur(4px)' }
                      }
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className={`font-serif text-5xl sm:text-6xl font-medium tabular-nums leading-none ${
                        unit.isSeconds ? 'text-[#15803D]' : 'text-[#141214]'
                      }`}
                    >
                      {formattedValue}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <span className="relative mt-2.5 text-xs sm:text-sm font-medium tracking-wide uppercase text-[#3F5943]">
                  {unit.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Romantic milestone progress & total days card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg rounded-2xl bg-white/75 backdrop-blur-md border border-[#15803D]/20 px-6 py-4 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-[#2F4634] mb-2.5">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#15803D] fill-[#15803D]" />
              <span>{duration.totalDays.toLocaleString('es-ES')} días compartidos</span>
            </span>
            <span className="text-[#15803D] tabular-nums">
              {Math.round(duration.anniversaryProgressPct)}% al próximo aniversario
            </span>
          </div>
          <div className="relative h-2.5 w-full rounded-full bg-[#DCFCE7] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(4, duration.anniversaryProgressPct))}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#22C55E] via-[#15803D] to-[#16A34A]"
            />
          </div>
        </motion.div>

        <div className="flex flex-col items-center">
          <motion.button
            type="button"
            onClick={onContinue}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className="inline-flex items-center gap-2.5 px-9 py-3.5 text-base font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-xl shadow-[0_14px_30px_-10px_rgba(21,128,61,0.55)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.main>
    </motion.div>
  );
}
