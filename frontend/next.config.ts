// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// 本番は https の公開オリジンを使う
const MINIO_ORIGIN = process.env.MINIO_ORIGIN ?? 'https://cdn.delvertrade.com';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: { styledComponents: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.delvertrade.com', pathname: '/public-uploads/**' },
      { protocol: 'http',  hostname: 'localhost', port: '9000', pathname: '/public-uploads/**' },
      { protocol: 'http',  hostname: '192.168.11.2', port: '9000', pathname: '/public-uploads/**' },
    ],
    // 切り分け用: 出ない時だけ一時的に true
    // unoptimized: true,
  }, // ← ← ← ここで images を閉じるのがポイント

  // /media/* → MinIO へプロキシ（使わないなら丸ごと削除してOK）
  async rewrites() {
    return [{ source: '/media/:path*', destination: 'https://api.delvertrade.com/api/:path*' }];
  },

  // （任意）/media/* にキャッシュ
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
