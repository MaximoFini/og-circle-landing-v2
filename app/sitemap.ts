import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/site';

// /terminos y /privacidad quedan afuera a proposito: ambas paginas tienen
// `robots: { index: false }` (son borradores legales sin validar por un
// abogado todavia) y listarlas aca seria una señal contradictoria para los
// buscadores. Agregarlas cuando se les saque el noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
