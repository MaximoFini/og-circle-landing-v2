'use client';

import { useEffect, useState } from 'react';

/**
 * WorldClocks — Tres relojes en tiempo real.
 *
 * Muestra la hora actual en Buenos Aires (BUE), Guangzhou (CAN) y Miami (MIA).
 * El punto junto a CAN se pone verde cuando es horario laboral en Guangzhou
 * (09:00–18:00 hora local), indicando que los agentes probablemente están activos.
 *
 * Implementación sin dependencias:
 * - `Intl.DateTimeFormat` nativo para formatear cada timezone.
 * - `setInterval` de 1 s para actualizar.
 * - SSR-safe: renderiza "--:--" en el servidor y actualiza en el cliente.
 */

const ZONES = [
  { id: 'bue', label: 'BUE', tz: 'America/Argentina/Buenos_Aires' },
  { id: 'bcn', label: 'BCN', tz: 'Europe/Madrid' },
  { id: 'gzh', label: 'CAN', tz: 'Asia/Shanghai' },
  { id: 'mia', label: 'MIA', tz: 'America/New_York' },
] as const;

function formatTime(tz: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(new Date());
}

/** Devuelve la hora en formato numérico (0-23) para determinar si es horario laboral. */
function getHour(tz: string): number {
  return parseInt(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: tz,
    }).format(new Date()),
    10,
  );
}

export default function WorldClocks() {
  const [times, setTimes] = useState<Record<string, string>>({
    bue: '--:--',
    bcn: '--:--',
    gzh: '--:--',
    mia: '--:--',
  });
  const [activeZones, setActiveZones] = useState<Record<string, boolean>>({
    bue: false,
    bcn: false,
    gzh: false,
    mia: false,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const nextTimes: Record<string, string> = {};
      const nextActive: Record<string, boolean> = {};

      for (const z of ZONES) {
        nextTimes[z.id] = formatTime(z.tz);
        const hr = getHour(z.tz);
        nextActive[z.id] = hr >= 9 && hr < 18;
      }

      setTimes(nextTimes);
      setActiveZones(nextActive);

      // Los relojes muestran HH:MM, asi que solo hace falta re-renderizar
      // cuando cambia el minuto — no cada segundo. Se alinea al proximo
      // limite de minuto en vez de tickear cada 1s de por vida.
      const msToNextMinute = 60000 - (Date.now() % 60000);
      timeoutId = setTimeout(tick, msToNextMinute);
    };

    tick(); // Primer tick inmediato para evitar el flash de "--:--"
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="world-clocks" aria-label="Horarios de nuestras oficinas">
      {ZONES.map((z, i) => {
        const isActive = activeZones[z.id];
        return (
          <div key={z.id} className="wc-item">
            {/* Separador entre items — solo entre ellos, no al principio */}
            {i > 0 && <span className="wc-sep" aria-hidden="true" />}

            {/* Punto de estado */}
            <span
              className={`wc-dot${isActive ? ' wc-dot--on' : ''}`}
              aria-label={isActive ? 'Oficina activa' : 'Fuera de horario'}
              title={`${z.label}: ${isActive ? 'Horario laboral activo (09:00 - 18:00)' : 'Fuera de horario'}`}
            />

            <span className="wc-label">{z.label}</span>
            <time className="wc-time" dateTime={times[z.id]}>
              {times[z.id]}
            </time>
          </div>
        );
      })}
    </div>
  );
}
