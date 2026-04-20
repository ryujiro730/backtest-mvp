// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr';

const COOKIE = 'anon_id';

const CRAWLER_UA =
  /Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|Slurp|facebookexternalhit|Twitterbot|LinkedInBot|Applebot|PetalBot/i;

const intlMiddleware = createMiddleware(routing);

// ログインが必要なパス（ロケールプレフィックス /ja /en を除いた部分で判定）
// ログイン必須パス（課金チェックはページ側で行う）
const PROTECTED_PATHS = ['/settings'];

function isProtected(pathname: string): boolean {
  const m = pathname.match(/^\/[a-z]{2}(\/.*)?$/);
  if (!m) return false;
  const rest = m[1] ?? '/';
  return PROTECTED_PATHS.some(p => rest === p || rest.startsWith(p + '/'));
}

function getLocaleFromPath(pathname: string): string {
  const m = pathname.match(/^\/([a-z]{2})(\/|$)/);
  return m ? m[1] : 'ja';
}

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
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    const res = NextResponse.next();
    attachAnonCookie(req, res);
    return res;
  }

  // 認証が必要なルートのガード
  if (isProtected(pathname)) {
    const authRes = NextResponse.next({ request: req });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              authRes.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const locale = getLocaleFromPath(pathname);
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // 認証OK → intl ミドルウェアを通してから返す
  }

  // ルート (/) へのクローラーアクセスはリダイレクトせず、app/page.tsx でコンテンツを返す
  if (pathname === '/' && CRAWLER_UA.test(req.headers.get('user-agent') ?? '')) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', '/');
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    attachAnonCookie(req, res);
    return res;
  }

  const res = intlMiddleware(req);

  // ロケールなし→/ja 等へのリダイレクトを 301（恒久）にして SEO 評価を引き継ぐ
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

  // ページ応答時のみ x-pathname を付与（generateMetadata で canonical 用）
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
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
}

// next-intl 推奨: ページ系のみ（api / _next / 静的ファイルを除く）
export const config = {
  matcher: ['/((?!api|auth|_next|_vercel|robots.txt|sitemap|fonts|.*\\..*).*)'],
};
