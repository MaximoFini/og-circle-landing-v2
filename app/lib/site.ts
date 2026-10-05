// Dominio de produccion, usado por el JSON-LD y (a futuro) sitemap.ts. El
// sitio todavia no esta deployado: seteá NEXT_PUBLIC_SITE_URL cuando haya
// dominio final, o reemplazá el fallback directamente.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://REEMPLAZAR-CON-DOMINIO.com.ar';

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
