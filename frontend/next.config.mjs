import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import createNextIntlPlugin from 'next-intl/plugin'; // 👈 追加

// next-intl の設定ファイルを指定
const withNextIntl = createNextIntlPlugin('./src/i18n.ts'); 

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    domains: ['api.delvertrade.com', 'cdn.delvertrade.com'],
  },
  async redirects() {
    return [
      { source: "/:locale/dashboard", destination: "/:locale/app", permanent: false },
    ];
  },
};

// next-intl で wrap する
export default withNextIntl(nextConfig);