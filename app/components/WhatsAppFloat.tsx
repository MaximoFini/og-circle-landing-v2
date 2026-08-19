'use client';

const WHATSAPP_MESSAGE = `Hola, vengo de la web de VeGroup.
Tengo una duda sobre OG Circle: `;

const WHATSAPP_HREF = `https://wa.me/5491176392303?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

/**
 * Acceso directo y discreto al WhatsApp de VeGroup. Sin badge, sin
 * autoplay de tooltip: aparece quieto en la esquina y solo reacciona al
 * hover, para no competir con los CTAs principales de cada seccion.
 */
export default function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Consultar por WhatsApp"
    >
      <span className="whatsapp-float-ping" aria-hidden="true" />
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.004c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.5.05-.98.24-3.27-.68-2.75-1.1-4.52-3.9-4.66-4.08-.14-.18-1.1-1.46-1.1-2.79s.7-1.98.95-2.25c.24-.27.53-.34.7-.34.18 0 .35 0 .5.01.16.01.38-.06.6.45.24.56.8 1.95.87 2.09.07.14.11.3.02.48-.09.18-.14.3-.27.45-.14.16-.29.35-.41.47-.14.14-.28.28-.12.56.16.27.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.2 1.37.28.14.44.12.6-.07.16-.2.7-.81.88-1.09.18-.27.36-.23.6-.14.24.09 1.55.73 1.82.86.27.14.45.2.51.32.07.12.07.68-.17 1.35Z" />
      </svg>
    </a>
  );
}
