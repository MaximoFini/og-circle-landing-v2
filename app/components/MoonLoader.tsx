'use client';

import { useEffect, useState, type ComponentType } from 'react';

/* La luna es un adorno: three.js + r3f (~169 kB gz) no deben competir con el
   video/poster/h1 del hero. `next/dynamic` solo separa el chunk, no lo
   difiere (el <script> igual sale en el HTML), por eso el import() se dispara
   a mano: solo en pantallas anchas, despues de `load` y en idle. En mobile no
   se descarga nada (el contenedor `.hero-moon` se oculta por CSS). */
export default function MoonLoader() {
  const [Moon, setMoon] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(min-width: 768px)').matches) return;

    let cancelled = false;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const load = () => {
      import('./Moon').then((mod) => {
        if (!cancelled) setMoon(() => mod.default);
      });
    };

    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(load, { timeout: 2500 });
      } else {
        timeoutHandle = window.setTimeout(load, 800);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', schedule);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, []);

  return Moon ? <Moon /> : null;
}
