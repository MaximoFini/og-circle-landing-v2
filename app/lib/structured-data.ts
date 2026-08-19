import { SITE_URL } from './site';
import { FAQS } from '../data/faqs';

// @graph con lo que existe realmente en la landing hoy: sin logo/sameAs
// (no hay assets de marca ni redes linkeadas en el sitio) para no declarar
// propiedades que no se puedan verificar contra el contenido visible.
export function buildStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'VEGROUP',
        url: SITE_URL,
        description:
          'Curso de importación desde China, Miami y España, con red de proveedores facilitada para armar un e-commerce en Argentina.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
      {
        '@type': 'Course',
        name: 'OG Circle — Programa de importación VEGROUP',
        description:
          'Formación práctica para importar desde China, Miami y España y montar un e-commerce en Argentina: calculadora de costos, acceso a red de proveedores y acompañamiento.',
        provider: {
          '@type': 'Organization',
          name: 'VEGROUP',
          url: SITE_URL,
        },
        offers: [
          {
            '@type': 'Offer',
            name: 'Principiante',
            price: '75000',
            priceCurrency: 'ARS',
            availability: 'https://schema.org/InStock',
            url: `${SITE_URL}/#precios`,
          },
          {
            '@type': 'Offer',
            name: 'Avanzado',
            price: '125000',
            priceCurrency: 'ARS',
            availability: 'https://schema.org/InStock',
            url: `${SITE_URL}/#precios`,
          },
        ],
      },
    ],
  };
}
