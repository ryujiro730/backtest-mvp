// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Route Handler / Server Action 用（書き込みOK） */
export function createServerClientWritable() {
  const store = cookies();
  return createServerClient(url, key, {
    cookies: {
      get: (name) => store.get(name)?.value,
      set: (name, value, options) => store.set(name, value, options),
      remove: (name, options) => store.set(name, '', { ...options, maxAge: 0 }),
    },
  });
}

/** Server Component 用（読み取り専用：set/remove は no-op） */
export function createServerClientReadOnly() {
  const store = cookies();
  return createServerClient(url, key, {
    cookies: {
      get: (name) => store.get(name)?.value,
      set: () => {},     // ← 重要：書き換え禁止
      remove: () => {},  // ← 重要：書き換え禁止
    },
  });
}
