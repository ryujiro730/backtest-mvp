import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ja'],
  defaultLocale: 'ja',
  localePrefix: 'always',
  localeDetection: true
});

// ← ここがポイント。必ず '/' を含める
export const config = {
  matcher: ['/', '/((?!_next|.*\\..*).*)']
};
