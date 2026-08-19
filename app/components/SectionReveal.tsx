'use client';

import { useEffect } from 'react';

/**
 * C3 — Reveal cinetico de los h2 de seccion.
 *
 * No renderiza NADA (mismo patron que `HeroParallax`): el markup de los 8 h2
 * es server-rendered en `page.tsx` y este componente solo se engancha en
 * `useEffect`, o sea despues del primer paint. No toca el h1 del hero, que es
 * el LCP.
 *
 * ── Por que IntersectionObserver y NO `animation-timeline: view()` ──────────
 * El pedido original era replicar el patron de `--hsp` (`@supports
 * (animation-timeline: scroll())` como via rapida, JS como fallback) usando
 * `view()`. No se puede: una scroll/view timeline **scrubea** la animacion
 * contra la posicion de scroll, asi que al volver hacia arriba el reveal se
 * DESHACE. Y el requisito duro es el contrario — cada h2 se revela una sola
 * vez y no se re-anima nunca. Las dos cosas son incompatibles: no hay forma en
 * CSS estable de "latchear" una view timeline.
 *
 * Asi que hay un solo mecanismo, no dos: IntersectionObserver + una animacion
 * CSS por tiempo. Un solo camino de codigo, once-only garantizado por
 * `unobserve`, y sin la clase de bug que trae mantener dos caminos que se
 * comportan distinto.
 *
 * ── El estado por defecto es VISIBLE ───────────────────────────────────────
 * REGLA CRITICA: en `globals.css` no existe ninguna regla base que esconda un
 * h2. El estado oculto vive detras de `[data-reveal='pending']`, un atributo
 * que SOLO escribe este archivo. Si el JS no corre —navegador viejo, JS
 * desactivado, hydration fallida, este componente borrado— los 8 h2 quedan
 * exactamente como los renderizo el server: visibles. No hay forma de que la
 * pagina termine con titulos invisibles.
 *
 * ── Sin flash en los h2 que ya estan en pantalla ───────────────────────────
 * El primer callback del observer llega con el estado de interseccion de todos
 * los elementos observados. Los que YA estan en viewport se marcan `done` y no
 * se animan: nunca estuvieron ocultos, animarlos desde oculto seria un
 * parpadeo. Los que estan abajo del fold se marcan `pending` (se esconden) —
 * invisible para el usuario, justamente porque estan abajo del fold— y recien
 * pasan a `in` cuando entran.
 *
 * Cleanup: patron del commit 4150ad5 (fuga de rAF). Se desconecta el observer
 * y se borran los atributos escritos, para que un remount no deje elementos
 * con estado viejo.
 */

/** Marca los elementos que matchean `selector` para el reveal de una sola vez. */
export function useReveal(selector: string) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!els.length) return;

    // Bajo reduced-motion no se escribe ni un atributo: los h2 se quedan
    // visibles y quietos, que es el estado del server. El bloque de
    // prefers-reduced-motion de globals.css ademas neutraliza los tres
    // estados por si el usuario activa la preferencia con la pagina abierta.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let first = true;

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            // `done` en la primera pasada = ya estaba en pantalla, no se anima.
            el.dataset.reveal = first ? 'done' : 'in';
            obs.unobserve(el); // una sola vez, por definicion
          } else if (first) {
            el.dataset.reveal = 'pending';
          }
        }
        first = false;
      },
      // -12% abajo: el h2 dispara cuando entro de verdad, no cuando asoma
      // su primer pixel.
      { rootMargin: '0px 0px -12% 0px', threshold: 0 },
    );

    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      els.forEach((el) => {
        delete el.dataset.reveal;
      });
    };
  }, [selector]);
}

export default function SectionReveal() {
  useReveal('.elegant-section h2');
  return null;
}
