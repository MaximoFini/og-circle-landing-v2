/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Header X-Powered-By en cada respuesta, sin utilidad.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Static assets in public/ keep their filename when replaced, so no
      // `immutable` + 1 year: 30 days plus a day of stale-while-revalidate.
      ...['/textures/:path*', '/images/:path*', '/audio/:path*'].map((source) => ({
        source,
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      })),
    ];
  },
};

module.exports = nextConfig;
