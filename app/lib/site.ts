// Dominio de produccion, usado por metadataBase (canonical y og:url), el
// JSON-LD, robots.txt y sitemap.ts. Antes el fallback era un placeholder y la
// home declaraba un canonical a un dominio inexistente: Google lo seguia y la
// verificacion de marca de OAuth fallaba con "la pagina principal no responde"
// (VGRP-78). NEXT_PUBLIC_SITE_URL sigue pudiendo pisarlo (p. ej. en previews).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ogcircle.com.ar';

// Registro en la plataforma (VGRP-76). Cada CTA manda su `origen` para saber
// qué botón convierte; la plataforma acepta sólo estos valores (lista cerrada
// en lib/auth/origen.ts del sistema), cualquier otro lo guarda como "otro".
const REGISTRO_URL = 'https://plataforma.ogcircle.com.ar/registro';

export type OrigenCta =
  | 'landing-nav'
  | 'landing-hero'
  | 'landing-menu-mobile'
  | 'landing-precios-principiante'
  | 'landing-precios-avanzado';

export function registroHref(origen: OrigenCta): string {
  return `${REGISTRO_URL}?origen=${origen}`;
}
