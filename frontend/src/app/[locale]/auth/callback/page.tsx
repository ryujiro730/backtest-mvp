// app/[locale]/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const { locale } = useParams<{ locale: 'ja' | 'en' }>();

  useEffect(() => {
    (async () => {
      try {
        const href = window.location.href;
        const hash = window.location.hash.startsWith('#')
          ? new URLSearchParams(window.location.hash.slice(1))
          : null;
        const search = new URL(href).searchParams;
        const code = search.get('code');

        console.log('[AuthCallback] href=', href);
        console.log('[AuthCallback] code=', code);
        console.log('[AuthCallback] has access_token(hash)=', !!hash?.get('access_token'));

        // 1) まずPKCE/Codeフロー
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(href);
          if (error) throw error;
          router.replace(`/${locale}/app`);
          return;
        }

        // 2) まだImplicitで返ってきている場合のフォールバック
        if (hash?.get('access_token')) {
          const { error } = await supabase.auth.setSession({
            access_token: hash.get('access_token')!,
            refresh_token: hash.get('refresh_token') ?? '',
          });
          if (error) throw error;
          router.replace(`/${locale}/app`);
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
