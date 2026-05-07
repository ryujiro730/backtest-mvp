import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import createNextIntlPlugin from 'next-intl/plugin'; // 👈 追加

// next-intl の設定ファイルを指定
const withNextIntl = createNextIntlPlugin('./src/i18n.ts'); 

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['next-mdx-remote'],
  typescript: { ignoreBuildErrors: true },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/:locale/dashboard", destination: "/:locale/app", permanent: false },
    ];
  },
};

// next-intl で wrap する
export default withNextIntl(nextConfig);