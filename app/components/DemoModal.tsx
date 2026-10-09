'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';

/**
 * DemoFlow es React grande (AgentQuote 717 lineas, PriceStrategy 772 lineas,
 * mas el motor de calculo): mismo patron que `Moon.tsx` con three.js, para
 * que ese bundle nunca entre en el chunk inicial server-rendered. `DemoFlow`
 * ya trae su propio wrapper `.vg-demo` y no incluye overlay ni boton de
 * cerrar — eso lo resuelve este componente.
 */
const DemoFlow = dynamic(() => import('./demo/DemoFlow'), {
  ssr: false,
  loading: () => (
    <div className="vg-demo-modal-loading" role="status" aria-live="polite">
      Cargando simulador…
    </div>
  ),
});

export const OPEN_DEMO_EVENT = 'vegroup:open-demo';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Primer modal/dialog del repo (no habia ningun `createPortal` ni
 * `role="dialog"` antes de esto). Se monta una sola vez dentro de
 * `CostCalculator.tsx` (no se toca `page.tsx`) y se abre/cierra por
 * `CustomEvent` en `window` — mismo patron desacoplado que usa la
 * calculadora original con `vegroup:logout`, asi el boton de la calculadora
 * y el link "Demo" del nav no necesitan una referencia directa al modal.
 */
export default function DemoModal({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  // Dos estados (open/visible), mismo patron que el overlay mobile de
  // SiteHeader.tsx: `open` monta/desmonta, `visible` dispara la transicion
  // de fade sin que el elemento desaparezca de golpe.
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Destino pendiente cuando el cierre viene de un CTA interno (ver
  // `navigate`): reemplaza la devolucion de foco al disparador, que si no
  // arrastraba el scroll de vuelta a la calculadora.
  const navTargetRef = useRef<string | null>(null);

  const close = useCallback(() => {
    setVisible(false);
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Sin motion: no hay transicion de salida que esperar, se desmonta ya.
    // Con motion: se espera el fade (duracion espejada en la CSS de
    // .vg-demo-modal-overlay, 12-calculator.css).
    if (reduceMotion) {
      setOpen(false);
    } else {
      setTimeout(() => setOpen(false), 280);
    }
  }, []);

  const navigate = useCallback(
    (hash: string) => {
      navTargetRef.current = hash;
      close();
    },
    [close],
  );

  // Apertura por evento global.
  useEffect(() => {
    const onOpenEvent = () => {
      triggerRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener(OPEN_DEMO_EVENT, onOpenEvent);
    return () => window.removeEventListener(OPEN_DEMO_EVENT, onOpenEvent);
  }, []);

  // Stagger de entrada (mismo patron que SiteHeader: rAF antes de marcar
  // `visible` para que el fade tenga un frame de partida real). Bajo
  // reduced-motion salta directo al estado final: doble chequeo (JS + CSS,
  // ver el bloque prefers-reduced-motion en 12-calculator.css), mismo
  // patron dual que Moon.tsx / SectionReveal.tsx.
  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVisible(true);
    } else {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [open]);

  // Scroll lock, Escape, focus trap y devolucion de foco — todo atado al
  // ciclo de vida de `open` (no de `visible`) para que quede activo durante
  // todo el tiempo que el dialog esta en pantalla, fade incluido.
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    const focusFirst = () => {
      const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []).filter(
        (el) => !el.closest('[inert]'),
      );
      (focusable[0] ?? dialog)?.focus();
    };
    focusFirst();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;

      // `closest('[inert]')`: la vista previa bloqueada de DemoFlow deja los
      // controles en el DOM pero inertes; contarlos rompería el ciclo del trap.
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null && !el.closest('[inert]'),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
      const target = navTargetRef.current;
      navTargetRef.current = null;
      const el = target ? document.querySelector<HTMLElement>(target) : null;
      if (el) {
        // El overflow ya se restauro arriba, asi que el scroll aplica. El foco
        // va al destino (sin scroll propio) para que el teclado siga desde ahi.
        history.replaceState(null, '', target);
        el.scrollIntoView({ block: 'start' });
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
        return;
      }
      // Foco de vuelta al disparador (boton "Ver simulador" o link "Demo" del nav).
      triggerRef.current?.focus?.();
    };
  }, [open, close]);

  if (!open) return null;
  // `document` no existe en SSR, pero `open` arranca en `false` salvo que
  // se pase `defaultOpen` (solo para pruebas standalone), asi que este
  // `createPortal` nunca corre en el server en produccion.
  if (typeof document === 'undefined') return null;

  const titleId = 'vg-demo-modal-title';

  return createPortal(
    <div
      className={`vg-demo-modal-overlay${visible ? ' is-visible' : ''}`}
      onClick={close}
    >
      <div
        ref={dialogRef}
        className="vg-demo-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="vg-sr-only">
          Simulador de costos de importación
        </h2>
        <button type="button" className="vg-demo-modal-close" onClick={close} aria-label="Cerrar simulador">
          <X size={20} />
        </button>
        <DemoFlow onClose={close} onNavigate={navigate} />
      </div>
    </div>,
    document.body,
  );
}
