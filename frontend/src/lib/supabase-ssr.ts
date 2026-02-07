import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServerSupabase } from './env';

// 読み書き可（Route Handler / Server Action 用）
export async function supabaseServer() {
  const { url, anon } = getServerSupabase();
  const store = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      get: (n) => store.get(n)?.value,
      set: (n, v, o) => {
        store.set({
          name: n,
          value: v,
          ...o,
        });
      },
      remove: (n, o) => {
        store.set({
          name: n,
          value: '',
          maxAge: 0,
          ...o,
        });
      },
    },
  });
}

// 読み取り専用（Server Component 用）
export async function supabaseServerRO() {
  const { url, anon } = getServerSupabase();
  const store = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      get: (n) => store.get(n)?.value,
      set: () => {},
      remove: () => {},
    },
  });
}
