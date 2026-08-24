import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VEGROUP — OG Circle',
    short_name: 'VEGROUP',
    description:
      'Aprendé a importar desde China, EE.UU. y Europa con el método probado de VEGROUP.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      {
        src: '/images/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
