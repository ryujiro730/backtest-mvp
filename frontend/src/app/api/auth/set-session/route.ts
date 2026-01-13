// app/api/auth/set-session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json();

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      get: (n) => cookieStore.get(n)?.value,
      set: (n, v, o) => cookieStore.set(n, v, o),
      remove: (n, o) => cookieStore.set(n, '', { ...o, maxAge: 0 }),
    },
  });

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) {
    console.error('setSession error', error);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
