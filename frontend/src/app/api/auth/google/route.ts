import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get('next') ?? '/ja/app';
  const locale = searchParams.get('locale') ?? 'ja';

  const state = crypto.randomBytes(16).toString('hex');

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 10,
    path: '/',
  };
  cookieStore.set('g_oauth_state', state, cookieOpts);
  cookieStore.set('g_oauth_next', next, cookieOpts);
  cookieStore.set('g_oauth_locale', locale, cookieOpts);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://delvertrade.com';
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
