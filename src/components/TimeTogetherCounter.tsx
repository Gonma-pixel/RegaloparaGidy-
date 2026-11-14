import { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimeTogetherCounterProps {
  startDateIso: string;
}

export interface DurationBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  daysUntilNextAnniversary: number;
  anniversaryProgressPct: number;
  isFuture: boolean;
}

export function calculateDuration(startIso: string, now: Date): DurationBreakdown {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      daysUntilNextAnniversary: 365,
      anniversaryProgressPct: 0,
      isFuture: false,
    };
  }

  if (now.getTime() < start.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      daysUntilNextAnniversary: Math.ceil((start.getTime() - now.getTime()) / 86400000),
      anniversaryProgressPct: 0,
      isFuture: true,
    };
  }

  // Exact calendar-aware years, months, days, hours, minutes, seconds
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalDays = Math.floor((now.getTime() - start.getTime()) / 86400000);

  // Next anniversary progress
  const thisYearAnniv = new Date(
    now.getFullYear(),
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes()
  );
  const lastAnniv =
    now >= thisYearAnniv
      ? thisYearAnniv
      : new Date(
          now.getFullYear() - 1,
          start.getMonth(),
          start.getDate(),
          start.getHours(),
          start.getMinutes()
        );
  const nextAnniv = new Date(
    lastAnniv.getFullYear() + 1,
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes()
  );

  const cycleTotal = nextAnniv.getTime() - lastAnniv.getTime();
  const cycleElapsed = now.getTime() - lastAnniv.getTime();
  const anniversaryProgressPct = Math.min(100, Math.max(0, (cycleElapsed / cycleTotal) * 100));
  const daysUntilNextAnniversary = Math.max(
    0,
    Math.ceil((nextAnniv.getTime() - now.getTime()) / 86400000)
  );

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    daysUntilNextAnniversary,
    anniversaryProgressPct,
    isFuture: false,
  };
}

export function TimeTogetherCounter({
  startDateIso,
}: TimeTogetherCounterProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const duration = useMemo(() => calculateDuration(startDateIso, now), [startDateIso, now]);

  const formattedStartDate = useMemo(() => {
    const d = new Date(startDateIso);
    if (Number.isNaN(d.getTime())) return 'Fecha no definida';
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [startDateIso]);

  const units = [
    { label: duration.years === 1 ? 'Año' : 'Años', value: duration.years },
    { label: duration.months === 1 ? 'Mes' : 'Meses', value: duration.months },
    { label: duration.days === 1 ? 'Día' : 'Días', value: duration.days },
    { label: duration.hours === 1 ? 'Hora' : 'Horas', value: duration.hours },
    { label: duration.minutes === 1 ? 'Minuto' : 'Minutos', value: duration.minutes },
    { label: duration.seconds === 1 ? 'Segundo' : 'Segundos', value: duration.seconds },
  ];

  return (
    <section
      id="contador"
      className="py-12 sm:py-16 border-b border-[#D5E6D6]"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-[#70656A] mb-1.5">
              <span>Contador en tiempo real</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>Desde el {formattedStartDate}</span>
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141214] tracking-tight">
              Nuestro tiempo juntos
            </h2>
          </div>
        </div>

        {/* 6-unit architectural counter grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="p-5 rounded-xl bg-white/92 border border-[#D5E6D6] flex flex-col justify-between"
            >
              <span className="font-serif text-4xl sm:text-5xl font-medium text-[#141214] tabular-nums leading-none">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="mt-3 text-xs font-medium text-[#70656A]">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* Summary & next anniversary progress */}
        <div className="mt-6 pt-5 border-t border-[#E5E0E2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#574F53]">
            <Clock className="w-4 h-4 text-[#15803D] shrink-0" />
            <span className="tabular-nums">
              {duration.isFuture
                ? `Faltan ${duration.daysUntilNextAnniversary} días para esa fecha`
                : `En total sumamos ${duration.totalDays.toLocaleString('es-ES')} días compartidos · Faltan ${duration.daysUntilNextAnniversary} días para nuestro próximo aniversario`}
            </span>
          </div>

          {!duration.isFuture && (
            <div className="flex items-center gap-3 w-full sm:w-56">
              <div className="flex-1 h-1.5 bg-[#F2EFF0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#15803D] rounded-full transition-all duration-500"
                  style={{ width: `${duration.anniversaryProgressPct}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-[#70656A] tabular-nums shrink-0">
                {Math.round(duration.anniversaryProgressPct)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
