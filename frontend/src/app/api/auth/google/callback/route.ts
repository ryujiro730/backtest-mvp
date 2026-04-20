import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const googleError = searchParams.get('error');

  const storedState = request.cookies.get('g_oauth_state')?.value;
  const next = request.cookies.get('g_oauth_next')?.value ?? '/ja/app';
  const locale = request.cookies.get('g_oauth_locale')?.value ?? 'ja';

  const errorUrl = `${origin}/${locale}/login?error=auth`;

  if (googleError || !code || !state || state !== storedState) {
    console.error('[google/callback] invalid state or missing code', { googleError, hasCode: !!code, stateMatch: state === storedState });
    return NextResponse.redirect(errorUrl);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://delvertrade.com';
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Googleのtokenエンドポイントにcodeを送ってid_tokenを取得
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    console.error('[google/callback] token exchange failed:', await tokenRes.text());
    return NextResponse.redirect(errorUrl);
  }

  const { id_token, access_token } = await tokenRes.json();

  if (!id_token) {
    console.error('[google/callback] no id_token in response');
    return NextResponse.redirect(errorUrl);
  }

  // successResponseを先に作ってcookieをセット
  const successResponse = NextResponse.redirect(`${origin}${next}`);
  successResponse.cookies.delete('g_oauth_state');
  successResponse.cookies.delete('g_oauth_next');
  successResponse.cookies.delete('g_oauth_locale');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            successResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // SupabaseにGoogleのid_tokenを渡してセッションを作成
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: id_token,
    access_token,
  });

  if (error) {
    console.error('[google/callback] signInWithIdToken failed:', error.message);
    return NextResponse.redirect(errorUrl);
  }

  return successResponse;
}
