// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// 本番は https の公開オリジンを使う
const MINIO_ORIGIN = process.env.MINIO_ORIGIN ?? 'https://cdn.delvertrade.com';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // まずは domains でOKにする（最小構成）
    domains: ['api.delvertrade.com', 'cdn.delvertrade.com'],
    // remotePatterns に戻したい場合は↓でも良い
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'api.delvertrade.com' },
    //   { protocol: 'https', hostname: 'cdn.delvertrade.com' },
    // ],
  },
};


export default withNextIntl(nextConfig);
