// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'anon_id';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ① 完全に素通しするパス（最優先）
  if (
    pathname === '/robots.txt' ||
    /^\/sitemap(\-\d+)?\.xml(\.gz)?$/.test(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/og')
  ) {
    return NextResponse.next();
  }

  // ② API / Auth 系は素通し（Cookieだけ付与）
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    const res = NextResponse.next();
    attachAnonCookie(req, res);
    return res;
  }

  // ③ それ以外（通常ページ）
  const res = NextResponse.next();
  attachAnonCookie(req, res);
  return res;
}

// Cookie 付与を関数化
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

// matcher は「触りたいものだけ」に限定
export const config = {
  matcher: [
    '/((?!_next|favicon\\.ico|robots\\.txt|sitemap(?:-[0-9]+)?\\.xml(?:\\.gz)?).*)',
  ],
};
