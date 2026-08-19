'use client';

import { useEffect } from 'react';

/**
 * A6 — Parallax de scroll del hero.
 *
 * No renderiza NADA: el markup del hero es server-rendered en `page.tsx` y este
 * componente solo se engancha en `useEffect` (o sea, despues del primer paint).
 * El h1 del hero es el LCP de la pagina: ningun byte de este archivo puede
 * correr antes de que pinte.
 *
 * Escribe una custom property sobre `.hero-stage`:
 *   --hsp : progreso de scroll del hero, 0..1 (alejado + desaturado)
 *
 * `--hsp` solo se calcula por JS cuando el navegador NO soporta
 * `animation-timeline: scroll()`. Donde existe, el CSS lo resuelve solo y aca
 * no se registra ni un listener de scroll.
 *
 * Cleanup: el commit 4150ad5 de este repo arreglo una fuga de rAF. Todo
 * listener y todo frame pendiente se cancela en el return del efecto.
 */
export default function HeroParallax() {
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>('.hero-stage');
    if (!stage) return;

    const video = stage.querySelector<HTMLVideoElement>('video');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ── Video: prefers-reduced-motion ──────────────────────────────────────
    // El <video> sale del server con autoPlay para no perder tiempo de LCP.
    // Si el usuario pidio menos movimiento lo congelamos en el primer frame,
    // que es exactamente la imagen de `poster` (se extrajo de t=0).
    const applyVideoMotion = () => {
      if (!video) return;
      if (reduceMotion.matches) {
        video.autoplay = false;
        video.pause();
        try {
          video.currentTime = 0;
        } catch {
          /* el metadata puede no estar listo todavia; el pause alcanza */
        }
      } else if (video.paused) {
        void video.play().catch(() => {
          /* autoplay bloqueado por el navegador: queda el poster */
        });
      }
    };
    applyVideoMotion();
    reduceMotion.addEventListener('change', applyVideoMotion);

    // ── Estado compartido ──────────────────────────────────────────────────
    let frame = 0;

    // `animation-timeline: scroll()` resuelve --hsp en el compositor.
    // Donde exista, no montamos el camino JS de scroll.
    const nativeScrollTimeline =
      typeof CSS !== 'undefined' &&
      CSS.supports?.('animation-timeline', 'scroll()') === true;

    const flush = () => {
      frame = 0;
      const h = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / h));
      stage.style.setProperty('--hsp', p.toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(flush);
    };

    let scrollBound = false;

    const bindScroll = () => {
      if (scrollBound) return;
      scrollBound = true;
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();
    };

    const unbindScroll = () => {
      if (!scrollBound) return;
      scrollBound = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      stage.style.setProperty('--hsp', '0');
    };

    const sync = () => {
      if (!reduceMotion.matches && !nativeScrollTimeline) bindScroll();
      else unbindScroll();
    };

    sync();
    reduceMotion.addEventListener('change', sync);

    return () => {
      unbindScroll();
      reduceMotion.removeEventListener('change', sync);
      reduceMotion.removeEventListener('change', applyVideoMotion);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      stage.style.removeProperty('--hsp');
    };
  }, []);

  return null;
}
