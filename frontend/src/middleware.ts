// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const COOKIE = 'anon_id';

// next-intl のミドルウェアを作成
const intlMiddleware = createMiddleware(routing);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ① すべての静的アセットは intl を通さない
  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    return NextResponse.next();
  }

  if (
    pathname === '/robots.txt' ||
    /^\/sitemap(\-\d+)?\.xml(\.gz)?$/.test(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    const res = NextResponse.next();
    attachAnonCookie(req, res);
    return res;
  }

  const res = intlMiddleware(req);
  attachAnonCookie(req, res);
  return res;
}


// Cookie 付与関数（既存のまま）
function attachAnonCookie(req: NextRequest, res: NextResponse) {
  if (!req.cookies.get(COOKIE)?.value) {
    res.cookies.set({
      name: COOKIE,
      value: crypto.randomUUID(),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1年
    });
  }
}

// matcher 設定
// middleware.ts
export const config = {
  matcher: [
    '/',
    '/(ja|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)', // ←これ
  ],
};
