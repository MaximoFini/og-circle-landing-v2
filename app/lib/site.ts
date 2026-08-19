// Dominio de produccion, usado por el JSON-LD y (a futuro) sitemap.ts. El
// sitio todavia no esta deployado: seteá NEXT_PUBLIC_SITE_URL cuando haya
// dominio final, o reemplazá el fallback directamente.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://REEMPLAZAR-CON-DOMINIO.com.ar';
