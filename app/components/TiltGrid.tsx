'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

/**
 * A3 — Tilt con reflejo especular.
 *
 * Utilidad compartida por las tres grillas de tarjetas del sitio
 * (`.problems-grid-v2`, `.features-grid-v2`, `.prices-container`): envuelve la
 * grilla y monta **un unico listener de `pointermove` delegado**, con throttle
 * por `requestAnimationFrame`. Nunca un listener por tarjeta.
 *
 * Sobre la tarjeta apuntada escribe cuatro custom properties y nada mas; todo
 * el efecto (inclinacion + reflejo) vive en `globals.css`:
 *   --mx / --my : posicion del puntero dentro de la tarjeta, en %
 *   --rx / --ry : rotacion en grados, derivada de esa posicion
 *
 * Se desactiva entero bajo `prefers-reduced-motion: reduce` y en punteros
 * gruesos (`pointer: coarse`): ahi no se monta ni un listener.
 *
 * Con la prop `lantern` marca ademas la grilla con `data-lantern` mientras el
 * puntero fino esta activo. Es el unico gancho de B5 (la linterna de
 * `#problema`): el efecto entero es CSS y se dibuja con las mismas `--mx`/`--my`
 * de aca. Va colgado de `bind`/`unbind` para heredar exacto las mismas dos
 * condiciones que deciden si corre el tilt, sin duplicar los matchMedia.
 *
 * Cleanup: se cancela el rAF pendiente, se sacan los listeners, se saca el
 * atributo y se limpian las custom properties de la ultima tarjeta tocada
 * (patron del commit 4150ad5).
 */

type Props = {
  className: string;
  children: ReactNode;
  /** Inclinacion maxima en grados desde el centro de la tarjeta. */
  maxTilt?: number;
  /**
   * B5 — habilita la linterna de revelado (solo `.problems-grid-v2`).
   *
   * Lo unico que hace es escribir `data-lantern` sobre la grilla cuando el
   * puntero fino esta activo; TODO el efecto vive en `globals.css` y se
   * dibuja con las mismas `--mx`/`--my` que ya escribe el tilt. Se cuelga de
   * `bind`/`unbind` a proposito: asi hereda exacto las dos condiciones que ya
   * decidian si el tilt corre —`(hover:hover) and (pointer:fine)` y no
   * `prefers-reduced-motion`— en vez de duplicar los matchMedia.
   *
   * Efecto colateral buscado: sin JS el atributo no existe y el CSS de la
   * linterna no aplica, o sea que el contenido queda a opacidad plena. Es el
   * mismo fail-safe que `[data-reveal]` en los h2.
   */
  lantern?: boolean;
};

export default function TiltGrid({
  className,
  children,
  maxTilt = 5,
  lantern = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    let frame = 0;
    let active: HTMLElement | null = null;
    let pending: HTMLElement | null = null;
    let mx = 50;
    let my = 50;
    let rx = 0;
    let ry = 0;

    const clear = (card: HTMLElement | null) => {
      if (!card) return;
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
      card.removeAttribute('data-tilting');
    };

    const flush = () => {
      frame = 0;
      const card = pending;
      if (!card) return;
      if (active !== card) {
        clear(active);
        active = card;
      }
      card.style.setProperty('--mx', `${mx.toFixed(2)}%`);
      card.style.setProperty('--my', `${my.toFixed(2)}%`);
      card.style.setProperty('--rx', `${rx.toFixed(3)}deg`);
      card.style.setProperty('--ry', `${ry.toFixed(3)}deg`);
      card.setAttribute('data-tilting', '');
    };

    /** Sube desde el target hasta la tarjeta que es hija directa de la grilla. */
    const cardFor = (target: EventTarget | null): HTMLElement | null => {
      let el = target instanceof Element ? (target as HTMLElement) : null;
      while (el && el.parentElement && el.parentElement !== root) {
        el = el.parentElement;
      }
      return el && el.parentElement === root && el.hasAttribute('data-tilt')
        ? el
        : null;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const card = cardFor(e.target);
      if (!card) {
        onPointerLeave();
        return;
      }
      const r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = (e.clientX - r.left) / r.width; // 0..1
      const ny = (e.clientY - r.top) / r.height; // 0..1
      mx = nx * 100;
      my = ny * 100;
      // Centro = 0deg. El borde superior se aleja, el inferior se acerca.
      ry = (nx - 0.5) * 2 * maxTilt;
      rx = -(ny - 0.5) * 2 * maxTilt;
      pending = card;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const onPointerLeave = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      pending = null;
      clear(active);
      active = null;
    };

    let bound = false;

    const bind = () => {
      if (bound) return;
      bound = true;
      if (lantern) root.setAttribute('data-lantern', '');
      root.addEventListener('pointermove', onPointerMove, { passive: true });
      root.addEventListener('pointerleave', onPointerLeave, { passive: true });
    };

    const unbind = () => {
      if (!bound) return;
      bound = false;
      root.removeAttribute('data-lantern');
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      onPointerLeave();
    };

    const sync = () => {
      if (!reduceMotion.matches && finePointer.matches) bind();
      else unbind();
    };

    sync();
    reduceMotion.addEventListener('change', sync);
    finePointer.addEventListener('change', sync);

    return () => {
      unbind();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      reduceMotion.removeEventListener('change', sync);
      finePointer.removeEventListener('change', sync);
    };
  }, [maxTilt, lantern]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
