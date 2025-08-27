// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

// 省略可だが明示推奨：i18n.ts のパスを渡す
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig = {
  reactStrictMode: true
  // 他の設定があればここに
};

export default withNextIntl(nextConfig);
