import type { MetadataRoute } from 'next';

// No hay sitemap.xml todavia (no era parte de este cambio) — agregar el
// campo `sitemap` aca cuando exista app/sitemap.ts, para no apuntar a un 404.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
  };
}
