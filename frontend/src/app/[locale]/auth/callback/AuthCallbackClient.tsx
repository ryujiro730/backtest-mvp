'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackClient() {
  const router = useRouter();
  const { locale } = useParams<{ locale: 'ja' | 'en' }>();

  useEffect(() => {
    (async () => {
      try {
        const href = window.location.href;
        const url = new URL(href);
        const search = url.searchParams;
        const hash = window.location.hash.startsWith('#')
          ? new URLSearchParams(window.location.hash.slice(1))
          : null;

        const code = search.get('code');
        const next = search.get('next');

        // 1) PKCE / Code flow
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(href);
          if (error) throw error;
          router.replace(next || `/${locale}/app`);
          return;
        }

        // 2) Implicit flow fallback
        if (hash?.get('access_token')) {
          const { error } = await supabase.auth.setSession({
            access_token: hash.get('access_token')!,
            refresh_token: hash.get('refresh_token') ?? '',
          });
          if (error) throw error;
          router.replace(next || `/${locale}/app`);
          return;
        }

        throw new Error('No auth code or access_token in callback URL');
      } catch (e) {
        console.error('[AuthCallback] failed:', e);
        router.replace(`/${locale}/login?error=auth`);
      }
    })();
  }, [router, locale]);

  return null;
}
