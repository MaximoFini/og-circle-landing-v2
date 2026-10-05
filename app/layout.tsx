import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Montserrat } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { SITE_URL } from './lib/site';

const helveticaNow = localFont({
  src: './fonts/HelveticaNowVar.woff2',
  // Subset (latin + latin-ext, wdth pinned, wght 300-900) — see git history for the original.
  weight: '300 900',
  display: 'swap',
  variable: '--font-helvetica',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300'],
  display: 'swap',
  variable: '--font-cormorant',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'OG Circle by VEGROUP — Importá desde cualquier parte del mundo',
  description: 'Aprendé a importar desde China, EE.UU. y Europa con el método probado de VEGROUP. Calculadora de costos, acompañamiento real y acceso a nuestra red de proveedores.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'OG Circle by VEGROUP — Importá desde cualquier parte del mundo',
    description: 'El método para importar que ya usaron cientos de personas en Argentina.',
    type: 'website',
    url: '/',
    siteName: 'OG Circle by VEGROUP',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OG Circle by VEGROUP — Importá desde cualquier parte del mundo',
    description: 'El método para importar que ya usaron cientos de personas en Argentina.',
  },
};

export const viewport: Viewport = {
  themeColor: '#050505',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-AR"
      className={`${helveticaNow.variable} ${cormorant.variable} ${inter.variable} ${montserrat.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Video del hero: preconnect para arrancar la conexion TCP+TLS
            durante el parseo del HTML. */}
        <link rel="preconnect" href="https://d8j0ntlcm91z4.cloudfront.net" />
      </head>
      <body>
        {/* C1 — Grano de pelicula + viñeta. Primer hijo del <body> y no de
            `.hero-stage`: bajo `@supports (animation-timeline: scroll())` el
            stage recibe `hero-scroll` con `animation-fill-mode: both`, y un
            hijo ahi quedaria atado al parallax sin motivo. `body` no tiene
            filter/transform/perspective, asi que este `position: fixed` se
            resuelve contra el viewport; el `overflow-x: hidden` del body no lo
            rompe. Es 100% CSS: no necesita 'use client'. */}
        <div className="film-grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
