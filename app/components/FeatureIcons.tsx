import type { CSSProperties, ReactNode } from 'react';

/**
 * Los 10 glifos de la seccion "Que incluye OG Circle".
 *
 * Son los mismos trazos de lucide (ISC), pero copiados como SVG propio y
 * partidos en grupos con clase `fi-*`: con el componente de lucide cada icono
 * es una caja negra y no se puede mover una parte (la tecla de la calculadora,
 * la mano derecha del apreton) sin tocar el resto. La animacion vive en
 * `25-feature-icon-motion.css` y se dispara con el hover de la card o con el
 * spotlight de mobile (`data-og-active`); este archivo es solo markup, sin
 * estado ni JS, asi que sin JS (o con reduced-motion) los iconos quedan
 * quietos y completos.
 */

function Glyph({ name, children }: { name: string; children: ReactNode }) {
  return (
    <svg
      className={`fi fi-${name}`}
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// Origen de transformacion en coordenadas del viewBox (24x24). Las teclas de
// la calculadora y las columnas son trazos de largo cero o muy finos, asi que
// `fill-box` no sirve: el pivote se declara a mano.
const at = (x: number, y: number, delay?: number): CSSProperties =>
  ({ transformOrigin: `${x}px ${y}px`, ...(delay !== undefined ? { '--d': `${delay}ms` } : null) }) as CSSProperties;

export function CapIcon() {
  return (
    <Glyph name="cap">
      <path className="fi-cap-top" style={at(12, 10)} d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path className="fi-cap-tassel" style={at(22, 10)} d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </Glyph>
  );
}

export function CalculatorIcon() {
  return (
    <Glyph name="calc">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line className="fi-calc-screen" style={at(8, 6)} x1="8" x2="16" y1="6" y2="6" />
      <line className="fi-calc-key" style={at(16, 16, 380)} x1="16" x2="16" y1="14" y2="18" />
      <path className="fi-calc-key" style={at(16, 10, 0)} d="M16 10h.01" />
      <path className="fi-calc-key" style={at(12, 10, 90)} d="M12 10h.01" />
      <path className="fi-calc-key" style={at(8, 10, 180)} d="M8 10h.01" />
      <path className="fi-calc-key" style={at(12, 14, 270)} d="M12 14h.01" />
      <path className="fi-calc-key" style={at(8, 14, 360)} d="M8 14h.01" />
      <path className="fi-calc-key" style={at(12, 18, 450)} d="M12 18h.01" />
      <path className="fi-calc-key" style={at(8, 18, 540)} d="M8 18h.01" />
    </Glyph>
  );
}

export function WarehouseIcon() {
  return (
    <Glyph name="wh">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z" />
      <path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11" />
      <path className="fi-wh-slat fi-wh-slat--1" d="M6 13h12" />
      <path className="fi-wh-slat fi-wh-slat--2" d="M6 17h12" />
    </Glyph>
  );
}

export function HandshakeIcon() {
  return (
    <Glyph name="hs">
      <g className="fi-hs-left">
        <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
        <path d="M3 4h8" />
      </g>
      <g className="fi-hs-right">
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
        <path d="m21 3 1 11h-2" />
      </g>
    </Glyph>
  );
}

export function UsersIcon() {
  return (
    <Glyph name="users">
      <g className="fi-users-main">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </g>
      <g className="fi-users-side">
        <path d="M16 3.128a4 4 0 0 1 0 7.744" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      </g>
    </Glyph>
  );
}

export function PlaneIcon() {
  return (
    <Glyph name="plane">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </Glyph>
  );
}

export function ShipIcon() {
  return (
    <Glyph name="ship">
      <g className="fi-ship-body" style={at(12, 21)}>
        <path d="M12 10.189V14" />
        <path d="M12 2v3" />
        <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
        <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76" />
      </g>
      <path className="fi-ship-wave" d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </Glyph>
  );
}

export function ChatIcon() {
  return (
    <Glyph name="chat">
      <path className="fi-chat-bubble" style={at(12, 12)} d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
      <path className="fi-chat-dot" style={{ '--d': '0ms' } as CSSProperties} d="M8 11h.01" />
      <path className="fi-chat-dot" style={{ '--d': '110ms' } as CSSProperties} d="M12 11h.01" />
      <path className="fi-chat-dot" style={{ '--d': '220ms' } as CSSProperties} d="M16 11h.01" />
    </Glyph>
  );
}

export function CommunityIcon() {
  return (
    <Glyph name="comm">
      <g className="fi-comm-main">
        <path d="M18 21a8 8 0 0 0-16 0" />
        <circle cx="10" cy="8" r="5" />
      </g>
      <path className="fi-comm-side" d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
    </Glyph>
  );
}

export function LandmarkIcon() {
  return (
    <Glyph name="bank">
      <path className="fi-bank-roof" d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z" />
      <path className="fi-bank-col" style={at(6, 18, 0)} d="M6 18v-7" />
      <path className="fi-bank-col" style={at(10, 18, 70)} d="M10 18v-7" />
      <path className="fi-bank-col" style={at(14, 18, 140)} d="M14 18v-7" />
      <path className="fi-bank-col" style={at(18, 18, 210)} d="M18 18v-7" />
      <path d="M3 22h18" />
    </Glyph>
  );
}
