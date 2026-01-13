import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServerSupabase } from './env';

export function supabaseServer() {
  const { url, anon } = getServerSupabase();
  const store = cookies();
  return createServerClient(url, anon, {
    cookies: {
      get: (n) => store.get(n)?.value,
      set: (n, v, o) => store.set(n, v, o),
      remove: (n, o) => store.set(n, '', { ...o, maxAge: 0 }),
    },
  });
}

export function supabaseServerRO() {
  const { url, anon } = getServerSupabase();
  const store = cookies();
  return createServerClient(url, anon, {
    cookies: {
      get: (n) => store.get(n)?.value,
      set: () => {},
      remove: () => {},
    },
  });
}
