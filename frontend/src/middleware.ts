// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const COOKIE = 'anon_id';

// next-intl
const intl = createIntlMiddleware({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
});

export function middleware(req: NextRequest) {
  // 1) next-intl を先に適用
  const res = intl(req);

  // 2) 匿名IDクッキーを付与（なければ）
  const has = req.cookies.get(COOKIE)?.value;
  if (!has) {
    res.cookies.set({
      name: COOKIE,
      value: crypto.randomUUID(), // Edge Runtime の Web Crypto
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return res;
}

// 静的ファイル/API は除外
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
