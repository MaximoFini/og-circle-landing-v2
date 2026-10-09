'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Calculator,
  GraduationCap,
  Handshake,
  Landmark,
  MessageSquareMore,
  Plane,
  Ship,
  Users,
  UsersRound,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import TiltGrid from './TiltGrid';

/**
 * OG Circle — la guia que dirige la mirada por las 8 features.
 *
 * Mobile (<=560px): scroll-driven. Un IntersectionObserver banda el centro
 * del viewport (mismo patron que la seccion activa del nav en SiteHeader) y
 * la card que cruza esa banda queda "activa": se ilumina, aparece un badge
 * de avion en su esquina, y el punto correspondiente del riel lateral se
 * enciende. Efecto spotlight — solo una activa a la vez, nunca mas de una.
 *
 * Desktop (>=901px): un tour automatico, UNA sola vez, disparado al entrar
 * la seccion en viewport (mismo patron "un reveal, una vez" que ya usa
 * `SectionReveal`). El avion recorre las 8 en un trazo curvo (spline de
 * Catmull-Rom con un "bulge" aleatorio por tramo — nunca la misma curva dos
 * veces) medido de la posicion REAL de las cards. El highlight NO se agenda
 * con timers a tiempo fijo: un loop de `requestAnimationFrame` lee la
 * posicion real del avion sobre el `<path>` SVG (`getPointAtLength`, con la
 * MISMA curva de easing que usa el CSS del avion) e ilumina la card mas
 * cercana a esa posicion, cuadro a cuadro. Es la unica forma de que el
 * highlight nunca se desincronice del avion, sea cual sea la duracion o la
 * forma de la curva ese vuelo en particular. Al terminar, el avion
 * desaparece y la linea queda de fondo, tenue, permanente; el hover/tilt de
 * siempre (TiltGrid, sin tocar) sigue funcionando igual despues.
 *
 * Tablet (561-900px): nada de esto. Ni riel ni tour — grilla normal. Es el
 * rango mas angosto de trafico real (la mayoria es mobile puro via
 * Instagram, o desktop) y ninguno de los dos mecanismos calza limpio en 2
 * columnas sin inventar una tercera regla que nadie pidio.
 *
 * `prefers-reduced-motion`: ninguno de los dos mecanismos se monta (los dos
 * `useEffect` de abajo chequean la preferencia antes de bindear cualquier
 * observer/rAF) — mismo criterio que ya usa el resto del sitio.
 */

// `icons`: uno o dos glifos de lucide (vectoriales, nitidos a cualquier
// escala) dentro del recuadro dorado que reemplazo a la etiqueta de texto.
// Dos glifos cuando la feature cubre dos cosas (flete aereo + maritimo,
// comunidad + soporte).
const FEATURES: ReadonlyArray<{ num: string; icons: LucideIcon[]; title: string; body: string }> = [
  { num: '01', icons: [GraduationCap], title: 'Formación', body: 'Importaciones Courier y Marítimas. E-commerce y ADS. Videos prácticos, paso a paso.' },
  { num: '02', icons: [Calculator], title: 'Calculadora de Costos', body: '10.502 NCM + 33.025 posiciones SIM. Estimá aranceles, despacho y costo final antes de comprar.' },
  { num: '03', icons: [Warehouse], title: 'Infraestructura', body: 'Casilleros y depósitos en Guangzhou, Miami y Barcelona para recibir y consolidar cargas.' },
  { num: '04', icons: [Handshake], title: 'Agentes en China', body: 'Acceso a 6 agentes verificados. Búsqueda de productos, muestras, negociación y control de calidad.' },
  { num: '05', icons: [Users], title: 'Red de Profesionales', body: 'Contactos de despachantes, contadores y especialistas en comercio exterior.' },
  { num: '06', icons: [Plane, Ship], title: 'Logística Internacional', body: 'Flete aéreo y marítimo gestionado por VeGroup, con seguimiento internacional.' },
  { num: '07', icons: [MessageSquareMore, UsersRound], title: 'Comunidad y Soporte', body: 'Grupo privado de importadores, actualizaciones, soporte 24/7 y una clase grupal semanal.' },
  { num: '08', icons: [Landmark], title: 'Cross-border Financiero', body: 'Herramientas y vías para gestionar pagos SWIFT a proveedores en China.' },
];

const TOTAL = FEATURES.length;
const TOUR_DURATION_MS = 17000;

/**
 * Icono real de avion (silueta clasica top-down, glyph de "flight" estandar)
 * — mismo criterio que el buque del nav: un solo path reconocible, sin caja
 * ni relleno de circulo detras cuando viaja (ver `.og-tour-plane`, que lo
 * pinta igual que `.nav-progress-boat`: color solido + drop-shadow, nada
 * mas). La nariz apunta a +X en reposo (`rotate(-45 12 12)` sobre el glyph
 * original, que la trae a 45°) para calzar con `offset-rotate: auto`: ese
 * modo alinea el eje "hacia adelante" del elemento con la tangente del path,
 * y esa convencion es +X.
 */
function PlaneIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="rotate(-45 12 12)">
        <path d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2.5 1.5V22l4-1 4 1v-1.5L13 19v-5.5l8 2.5z" />
      </g>
    </svg>
  );
}

type Point = { x: number; y: number };

/**
 * Spline de Catmull-Rom con un "bulge" aleatorio por tramo: pasa exacto por
 * los 8 puntos medidos (nunca se aleja del centro real de una card), pero la
 * curva ENTRE puntos se hincha para un lado u otro al azar — nunca la misma
 * forma dos veces, que es justo lo que pide "que no se sienta tan
 * deterministico". El bulge es perpendicular al segmento, escalado a su
 * largo, asi que nunca se vuelve una curva absurda en tramos cortos.
 */
function organicSplinePath(points: Point[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    let cp1x = p1.x + (p2.x - p0.x) / 6;
    let cp1y = p1.y + (p2.y - p0.y) / 6;
    let cp2x = p2.x - (p3.x - p1.x) / 6;
    let cp2y = p2.y - (p3.y - p1.y) / 6;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const segLen = Math.hypot(dx, dy) || 1;
    const nx = -dy / segLen;
    const ny = dx / segLen;
    const bulge = (Math.random() - 0.5) * 2 * Math.min(segLen * 0.35, 60);

    cp1x += nx * bulge;
    cp1y += ny * bulge;
    cp2x += nx * bulge;
    cp2y += ny * bulge;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Solver exacto de `cubic-bezier(x1,y1,x2,y2)` — el mismo algoritmo que usan
 * los navegadores (busqueda por tabla + Newton-Raphson). Antes esto se
 * aproximaba con un `easeInOutCubic` generico, que NO es la misma curva que
 * el `cubic-bezier(.45,.05,.55,.95)` del CSS: la diferencia entre ambas es
 * chica en terminos relativos pero, sobre una animacion de 15s, se traduce
 * en segundos de desfase — de ahi el "las cards estan atrasadas" que se
 * reporto. Con el solver exacto, `easing(t)` da EXACTAMENTE lo mismo que el
 * navegador esta pintando en pantalla en ese instante.
 */
function makeCubicBezierEasing(x1: number, y1: number, x2: number, y2: number) {
  const A = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1;
  const B = (a1: number, a2: number) => 3 * a2 - 6 * a1;
  const C = (a1: number) => 3 * a1;

  const calc = (t: number, a1: number, a2: number) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const slope = (t: number, a1: number, a2: number) => 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);

  function getTForX(x: number): number {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const currentSlope = slope(t, x1, x2);
      if (currentSlope === 0) break;
      const currentX = calc(t, x1, x2) - x;
      t -= currentX / currentSlope;
    }
    return Math.min(1, Math.max(0, t));
  }

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return calc(getTForX(x), y1, y2);
  };
}

export default function OGCircleFeatures() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const tourPointsRef = useRef<Point[] | null>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tour, setTour] = useState<{ path: string; width: number; height: number } | null>(null);
  const [tourPlaying, setTourPlaying] = useState(false);

  // ── Mobile: IntersectionObserver banda el centro, spotlight por scroll ──
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 560px)');

    let io: IntersectionObserver | null = null;

    const bind = () => {
      if (io) return;
      const cards = cardRefs.current;
      if (!cards.length || cards.some((c) => c === null)) return;

      const crossing = new Set<number>();
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const idx = cards.indexOf(entry.target as HTMLDivElement);
            if (idx === -1) continue;
            if (entry.isIntersecting) crossing.add(idx);
            else crossing.delete(idx);
          }
          let next: number | null = null;
          for (let i = 0; i < TOTAL; i++) if (crossing.has(i)) next = i;
          setActiveIndex(next);
        },
        { rootMargin: '-38% 0px -38% 0px', threshold: 0 },
      );
      cards.forEach((c) => c && io!.observe(c));
    };

    const unbind = () => {
      io?.disconnect();
      io = null;
      setActiveIndex(null);
    };

    const sync = () => {
      if (mobile.matches && !motion.matches) bind();
      else unbind();
    };

    sync();
    mobile.addEventListener('change', sync);
    motion.addEventListener('change', sync);

    return () => {
      unbind();
      mobile.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  // ── Desktop: medir las 8 cards y armar la curva (una sola vez) ──────────
  const measure = useCallback((): { points: Point[]; width: number; height: number } | null => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const wrapRect = wrap.getBoundingClientRect();
    const points: Point[] = [];
    for (const card of cardRefs.current) {
      if (!card) return null;
      const r = card.getBoundingClientRect();
      points.push({
        x: r.left - wrapRect.left + r.width / 2,
        y: r.top - wrapRect.top + r.height / 2,
      });
    }
    return { points, width: wrapRect.width, height: wrapRect.height };
  }, []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 901px)');

    let io: IntersectionObserver | null = null;
    let played = false;

    const playTour = () => {
      if (played) return;
      const m = measure();
      if (!m) return;
      played = true;

      tourPointsRef.current = m.points;
      const d = organicSplinePath(m.points);
      setTour({ path: d, width: m.width, height: m.height });
      setTourPlaying(true);
    };

    const bind = () => {
      if (io || played) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            io!.unobserve(entry.target);
            playTour();
          }
        },
        { threshold: 0.4 },
      );
      io.observe(wrap);
    };

    const unbind = () => {
      io?.disconnect();
      io = null;
    };

    const sync = () => {
      if (desktop.matches && !motion.matches) bind();
      else unbind();
    };

    sync();
    desktop.addEventListener('change', sync);
    motion.addEventListener('change', sync);

    return () => {
      unbind();
      desktop.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, [measure]);

  // ── El highlight sigue la posicion REAL del avion, cuadro a cuadro ──────
  // Arranca solo cuando `tour` ya se renderizo (asi `pathRef.current` existe
  // de verdad — no se puede leer `getTotalLength()` de un <path> que todavia
  // no monto).
  useEffect(() => {
    if (!tour || !tourPlaying) return;
    const pathEl = pathRef.current;
    const points = tourPointsRef.current;
    if (!pathEl || !points) return;

    const easing = makeCubicBezierEasing(0.45, 0.05, 0.55, 0.95);
    const totalLength = pathEl.getTotalLength();
    const start = performance.now();
    let raf = 0;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / TOUR_DURATION_MS);
      const eased = easing(t);
      const pt = pathEl.getPointAtLength(eased * totalLength);

      let nearest = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < points.length; i++) {
        const dx = points[i].x - pt.x;
        const dy = points[i].y - pt.y;
        const dist = dx * dx + dy * dy;
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }
      setActiveIndex(nearest);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        finishTimer = setTimeout(() => {
          setActiveIndex(null);
          setTourPlaying(false);
        }, 300);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [tour, tourPlaying]);

  return (
    <div className="og-circle-wrap" ref={wrapRef}>
      {/* Riel lateral — solo visible <=560px via CSS. Distribucion aproximada
          (space-around sobre la altura total), no medida: las 8 cards son de
          alto similar y una desviacion de unos px en un elemento puramente
          decorativo no vale medirla con JS. */}
      <div className="og-rail" aria-hidden="true">
        {FEATURES.map((f, i) => (
          <span key={f.num} className="og-rail-dot" data-active={activeIndex === i ? '' : undefined} />
        ))}
      </div>

      <TiltGrid className="features-grid-v2">
        {FEATURES.map((f, i) => (
          <div
            key={f.num}
            className="feature-card-v2"
            data-tilt
            data-og-active={activeIndex === i ? '' : undefined}
            data-half={i >= FEATURES.length - 2 ? '' : undefined}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          >
            <div className="feature-num-big">{f.num}</div>
            <div className="feature-icon" aria-hidden="true">
              {f.icons.map((Icon, k) => (
                <Icon key={k} size={24} strokeWidth={1.5} />
              ))}
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-body">{f.body}</p>
            <div className="feature-shine" aria-hidden="true" />
          </div>
        ))}
      </TiltGrid>

      {/* Tour de desktop — linea + avion. Los dos leen el mismo `tour.path`,
          y el highlight de arriba lee ese MISMO <path> del DOM (`pathRef`),
          asi que los tres nunca se desalinean entre si. */}
      {tour && (
        <svg
          className="og-tour-line"
          width={tour.width}
          height={tour.height}
          aria-hidden="true"
        >
          <path ref={pathRef} d={tour.path} />
        </svg>
      )}
      {tour && tourPlaying && (
        <div
          className="og-tour-plane"
          style={{
            offsetPath: `path('${tour.path}')`,
            animationDuration: `${TOUR_DURATION_MS}ms`,
          } as React.CSSProperties}
          aria-hidden="true"
        >
          {/* El bamboleo (`og-tour-plane-bob`) es una oscilacion propia,
              independiente del recorrido — mismo patron que `nav-boat-bob`
              del barco del nav: el objeto no solo avanza, tambien "vive"
              mientras avanza. */}
          <span className="og-tour-plane-bob">
            <PlaneIcon size={28} />
          </span>
        </div>
      )}
    </div>
  );
}
