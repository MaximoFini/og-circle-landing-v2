'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * B4 — Los numeros del hero que se cuentan solos.
 *
 * ── Por que un componente propio y no logica dentro de `HeroParallax` ───────
 * `HeroParallax` no renderiza NADA a proposito: se engancha en `useEffect` y
 * escribe custom properties. Este item necesita lo contrario — cambiar el TEXTO
 * de tres nodos, 60 veces por segundo, durante 900ms. Hacerlo desde ahi
 * obligaria a escribir `textContent` a mano sobre markup que React no maneja,
 * que es exactamente la clase de mutacion que pelea con la hidratacion. Asi que
 * la `.numbers-bar` pasa a ser un componente cliente y el texto lo maneja
 * React. El resto del hero —el h1, el CTA y el video, o sea el LCP real— sigue
 * siendo server-only y no se toco.
 *
 * ── El valor por defecto es el FINAL ───────────────────────────────────────
 * Mismo fail-safe que el reveal de los h2 (`SectionReveal.tsx`): el estado
 * inicial de `useCountUp` es el string final (`6`, `3`, `+5`), asi que eso es
 * lo que emite el server y lo que ve cualquiera sin JS, con JS desactivado o
 * con la hidratacion caida. El cero solo existe si el conteo efectivamente
 * arranca.
 *
 * Contrapartida asumida: la `.numbers-bar` vive DENTRO del hero, o sea que casi
 * siempre esta en viewport al cargar. El observer dispara enseguida y el numero
 * baja del valor final a 0 para contar. O sea que entre el primer paint del
 * HTML y la hidratacion se ve el valor final unos milisegundos. Es el precio de
 * que el estado sin JS sea el correcto, y se paga a proposito: la alternativa
 * —emitir 0 desde el server— deja la pagina mostrando tres ceros para siempre
 * si el JS no corre.
 *
 * ── Un solo observer ───────────────────────────────────────────────────────
 * El IntersectionObserver observa el CONTENEDOR `.numbers-bar`, no los tres
 * numeros. Un solo disparo enciende los tres conteos, con 0 / 120 / 240ms de
 * retraso, y hace `unobserve` inmediatamente: volver a scrollear no re-cuenta.
 *
 * Bajo `prefers-reduced-motion: reduce` no se monta ni el observer (mismo
 * criterio que `TiltGrid`): los tres numeros quedan en su valor final, sin
 * conteo y sin flash.
 *
 * Cleanup: patron del commit 4150ad5. Cada conteo cancela su rAF pendiente y su
 * timeout de retraso; el observer se desconecta.
 */

const NUMBERS = [
  { value: '6', label: 'Agentes verificados en China' },
  { value: '3', label: 'Depósitos: Miami, China, España' },
  { value: '+5', label: 'Profesionales al servicio' },
];

/** Duracion de cada conteo y escalonado entre uno y el siguiente. */
const COUNT_MS = 900;
const STAGGER_MS = 120;

/**
 * easeOutExpo: arranca disparado y frena largo. Es la curva que hace que el
 * numero se lea como si "aterrizara" en su valor en vez de llegar de casualidad
 * — la misma intencion que el `cubic-bezier(.16,1,.3,1)` del sistema, que es su
 * equivalente para transforms.
 */
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Cuenta de 0 hasta el entero que trae `target`, conservando su prefijo (el
 * `+` de `+5`). Devuelve el string formateado y si el conteo ya termino.
 *
 * `run` es un parametro y no un observer propio: el requisito es UN solo
 * IntersectionObserver para los tres numeros, asi que el disparo tiene que
 * venir de afuera.
 */
function useCountUp(target: string, run: boolean, delay = 0) {
  const [text, setText] = useState(target);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!run) return;

    const firstDigit = target.search(/\d/);
    if (firstDigit < 0) return;
    const prefix = target.slice(0, firstDigit);
    const end = parseInt(target.slice(firstDigit), 10);
    if (!Number.isFinite(end)) return;

    let frame = 0;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / COUNT_MS);
      setText(prefix + Math.round(easeOutExpo(t) * end));
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        frame = 0;
        setDone(true);
      }
    };

    setText(prefix + '0');
    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
  }, [target, run, delay]);

  return { text, done };
}

function NumCard({
  value,
  label,
  run,
  delay,
}: {
  value: string;
  label: string;
  run: boolean;
  delay: number;
}) {
  const { text, done } = useCountUp(value, run, delay);

  return (
    <div
      className="num-card"
      style={{ textAlign: 'center' }}
      /* El flash ambar del borde inferior lo dispara el CSS con este atributo:
         el hook no toca ni un estilo a mano. */
      data-counted={done ? '' : undefined}
    >
      <div className="number">{text}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export default function NumbersBar() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          obs.unobserve(entry.target); // una sola vez, por definicion
          setRun(true);
        }
      },
      { threshold: 0.35 },
    );

    io.observe(root);

    return () => io.disconnect();
  }, []);

  return (
    <div className="numbers-bar" ref={rootRef}>
      {NUMBERS.map((n, i) => (
        <NumCard
          key={n.label}
          value={n.value}
          label={n.label}
          run={run}
          delay={i * STAGGER_MS}
        />
      ))}
    </div>
  );
}
