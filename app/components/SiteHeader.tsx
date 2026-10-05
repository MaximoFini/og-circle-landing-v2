'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import AmbientAudio from './AmbientAudio';
import { OPEN_DEMO_EVENT } from './DemoModal';
import { registroHref } from '../lib/site';

/**
 * Los unicos anclas del nav. `#no-es-para-vos` existe como seccion en
 * `page.tsx` pero NO tiene link aca a proposito: el highlight de seccion
 * activa (B1) solo puede recaer sobre estas. El orden de este array es
 * tambien el orden de documento de las secciones, y de eso depende el
 * desempate del observer de mas abajo.
 */
const NAV_LINKS = [
  { href: '#problema', label: 'El Problema' },
  { href: '#pilares-servicio', label: 'OG Circle' },
  { href: '#calculadora', label: 'Demo' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#precios', label: 'Niveles' },
];

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

// El link "Demo" ancla a #calculadora (scroll normal, no se toca) y ADEMAS
// dispara el modal de la demo real via CustomEvent — mismo patron
// desacoplado que ya usa la calculadora original con `vegroup:logout`.
const DEMO_HREF = '#calculadora';

const WHATSAPP_MESSAGE = `Hola, vengo de la web de VeGroup.
Producto:
Desde: China / Miami / España
Peso aproximado: `;

const WHATSAPP_HREF = `https://wa.me/5491176392303?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  /**
   * B1 — El header como tracking del propio scroll.
   *
   * Dos mecanismos distintos en un solo efecto, porque comparten ciclo de vida
   * y montan sobre el mismo elemento:
   *
   * (a) HILO DE PROGRESO. Escribe `--progress` (0..1) sobre `.nav-header`; el
   *     `::after` de la capsula lo consume con un `scaleX()`. Es el mismo
   *     patron espejo CSS-first / JS-fallback que `--hsp` en el hero: donde el
   *     navegador soporta `animation-timeline: scroll()` lo resuelve el
   *     compositor y aca NO se registra un solo listener de scroll (ver el
   *     `@supports` de `globals.css`). El fallback es UN listener en `window`,
   *     `passive`, throttleado por rAF.
   *
   *     No se usa IntersectionObserver: IO es binario (entro / salio) y esto
   *     necesita progreso continuo.
   *
   * (b) SECCION ACTIVA. UN solo IntersectionObserver sobre las 4 secciones que
   *     tienen link, con un `rootMargin` de -45%/-45% que deja una banda de
   *     ~10vh en el centro exacto del viewport: una seccion esta "activa"
   *     cuando cruza esa banda, no cuando asoma. En los tramos que no tienen
   *     link (`#pilares-servicio`, `#no-es-para-vos`, fundadores, FAQ) no hay
   *     ninguna seccion en la banda y el highlight simplemente desaparece —
   *     que es lo correcto: mentir marcando el link anterior seria peor.
   *
   * Cleanup: patron del commit 4150ad5 (fuga de rAF). Se desconecta el
   * observer, se sacan los listeners, se cancela el frame pendiente y se borra
   * la custom property escrita.
   */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ── (a) Hilo de progreso ───────────────────────────────────────────────
    const nativeScrollTimeline =
      typeof CSS !== 'undefined' &&
      CSS.supports?.('animation-timeline', 'scroll()') === true;

    let frame = 0;

    const flush = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      nav.style.setProperty('--progress', p.toFixed(4));
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
      nav.style.setProperty('--progress', '0');
    };

    const sync = () => {
      if (!reduceMotion.matches && !nativeScrollTimeline) bindScroll();
      else unbindScroll();
    };

    sync();
    reduceMotion.addEventListener('change', sync);

    // ── (b) Seccion activa ─────────────────────────────────────────────────
    let io: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== 'undefined') {
      const getSections = () => SECTION_IDS
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      const sections = getSections();

      if (sections.length) {
        const crossing = new Set<string>();

        io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) crossing.add(entry.target.id);
              else crossing.delete(entry.target.id);
            }
            // Desempate: si dos secciones cruzan la banda a la vez (el limite
            // entre una y otra), gana la ULTIMA en orden de documento, o sea
            // la que se esta entrando. Nunca hay mas de un link marcado.
            let next: string | null = null;
            for (const id of SECTION_IDS) if (crossing.has(id)) next = id;
            setActiveId(next);
          },
          // Margin mas permisivo (-30% en lugar de -45%) para detectar
          // secciones mas cortas como 'Nosotros' que de otra forma no tocarian el centro
          { rootMargin: '-30% 0px -30% 0px', threshold: 0 },
        );

        sections.forEach((s) => io!.observe(s));
      }
    }

    return () => {
      io?.disconnect();
      unbindScroll();
      reduceMotion.removeEventListener('change', sync);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      nav.style.removeProperty('--progress');
    };
  }, []);

  // Staggered open/close animation
  useEffect(() => {
    if (mobileMenuOpen) {
      requestAnimationFrame(() => setMenuVisible(true));
    } else {
      setMenuVisible(false);
    }
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => {
    setMenuVisible(false);
    setTimeout(() => setMobileMenuOpen(false), 500);
  };

  return (
    <>
      {/* ── Navigation Bar ─────────────────────── */}
      <nav className="nav-header" ref={navRef}>
        {/* B1 · El barco viaja sobre el hilo de progreso: misma franja
            (inset 32px) que `.nav-header::after`, posicionado por `--progress`
            en CSS puro — no necesita su propio estado ni listener. */}
        <div className="nav-progress-track" aria-hidden="true">
          <span className="nav-progress-boat">
            {/* Buque de carga: casco + contenedores apilados + puente de mando.
                No un velero — coherente con lo que VeGroup mueve de verdad. */}
            <svg viewBox="0 0 34 22" width="30" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 15h30l-3.3 4.4a2.2 2.2 0 0 1-1.76.9H7.06a2.2 2.2 0 0 1-1.76-.9L2 15z" fill="currentColor" />
              <rect x="5.5" y="10" width="5" height="5" fill="currentColor" opacity=".8" />
              <rect x="11.5" y="8" width="5" height="7" fill="currentColor" opacity=".65" />
              <rect x="17.5" y="10.5" width="5" height="4.5" fill="currentColor" opacity=".8" />
              <rect x="24" y="6.5" width="5" height="8.5" rx=".5" fill="currentColor" opacity=".95" />
              <rect x="25.2" y="4.5" width="2.6" height="2.4" fill="currentColor" opacity=".95" />
            </svg>
          </span>
        </div>

        {/* Logo */}
        <a href="#top" className="nav-logo" onClick={closeMenu}>
          <Image src="/images/logo-icon.png" alt="" width={28} height={32} className="nav-logo-icon" priority />
          <span>
            OG CIRCLE
            <span className="nav-logo-by">by VeGroup</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-active={activeId === l.href.slice(1) ? '' : undefined}
              aria-current={activeId === l.href.slice(1) ? 'true' : undefined}
              onClick={
                l.href === DEMO_HREF
                  ? () => window.dispatchEvent(new CustomEvent(OPEN_DEMO_EVENT))
                  : undefined
              }
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="nav-cta-group">
          <AmbientAudio className="nav-audio-toggle" />
          <a
            href={registroHref('landing-nav')}
            className="nav-cta"
          >
            Quiero Aprender
          </a>
        </div>

        {/* Mobile: audio toggle a la izquierda del hamburguesa. Agrupados en
            un solo flex child para que .nav-header (justify-content:
            space-between) no los separe como si fueran items independientes. */}
        <div className="nav-mobile-actions">
          <AmbientAudio className="nav-audio-toggle-mobile" />

          <button
            className="mobile-toggle-btn"
            onClick={() => mobileMenuOpen ? closeMenu() : setMobileMenuOpen(true)}
            aria-label="Menú"
            style={{ zIndex: 60, position: 'relative' }}
          >
            <span style={{
              position: 'absolute',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.75)',
            }}>
              <X size={24} />
            </span>
            <span style={{
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              opacity: mobileMenuOpen ? 0 : 1,
              transform: mobileMenuOpen ? 'rotate(90deg) scale(0.75)' : 'rotate(0deg) scale(1)',
            }}>
              <Menu size={24} />
            </span>
          </button>
        </div>
      </nav>

      {/* ── Mobile Overlay ─────────────────────── */}
      {mobileMenuOpen && (
        <div
          className={`mobile-nav-overlay ${menuVisible ? 'open' : ''}`}
          onClick={closeMenu}
        >
          {NAV_LINKS.map((l, idx) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => {
                closeMenu();
                if (l.href === DEMO_HREF) {
                  window.dispatchEvent(new CustomEvent(OPEN_DEMO_EVENT));
                }
              }}
              style={{
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                opacity: menuVisible ? 1 : 0,
                transform: menuVisible ? 'translateY(0)' : 'translateY(12px)',
                transitionDelay: menuVisible ? `${350 + idx * 50}ms` : '0ms',
              }}
            >
              {l.label}
            </a>
          ))}

          <a
            href={registroHref('landing-menu-mobile')}
            className="mobile-nav-cta"
            onClick={closeMenu}
            style={{
              padding: '14px 36px',
              borderRadius: '9999px',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              backgroundColor: '#fff',
              color: '#050505',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              opacity: menuVisible ? 1 : 0,
              transform: menuVisible ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: menuVisible ? `${350 + NAV_LINKS.length * 50}ms` : '0ms',
            }}
          >
            Quiero Aprender
          </a>
        </div>
      )}
    </>
  );
}
