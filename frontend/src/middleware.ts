// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const COOKIE = 'anon_id';

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
  if (pathname.startsWith('/api')) {
    const res = NextResponse.next();
    attachAnonCookie(req, res);
    return res;
  }

  const res = intlMiddleware(req);

  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get('Location');
    if (loc && (res.status === 307 || res.status === 308)) {
      const permanent = NextResponse.redirect(loc, 301);
      attachAnonCookie(req, permanent);
      return permanent;
    }
    attachAnonCookie(req, res);
    return res;
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  const out = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.forEach((value, key) => out.headers.set(key, value));
  attachAnonCookie(req, out);
  return out;
}

function attachAnonCookie(req: NextRequest, res: NextResponse) {
  if (!req.cookies.get(COOKIE)?.value) {
    res.cookies.set({
      name: COOKIE,
      value: crypto.randomUUID(),
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|robots.txt|sitemap|fonts|.*\\..*).*)'],
};
