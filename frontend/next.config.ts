// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
const MINIO_ORIGIN = process.env.MINIO_ORIGIN ?? 'http://127.0.0.1:8000'; 

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: { styledComponents: true },

  // /media/* → MinIO へプロキシ
  async rewrites() {
    return [
      { source: '/media/:path*', destination: `${MINIO_ORIGIN}/:path*` },
    ];
  },

  // （任意）/media/* に軽いキャッシュヘッダ
  async headers() {
    return [
      {
        source: '/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
