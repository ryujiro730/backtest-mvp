'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const sp = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // 二重実行ガード
    ran.current = true;

    (async () => {
      const next = sp.get('next') || '/';

      // 既にセッションがあるなら交換スキップ
      const { data: s } = await supabase.auth.getSession();
      if (s.session) {
        router.replace(next);
        return;
      }

      const href = window.location.href;
      const hasCode = href.includes('?code=');
      const hasHashToken = href.includes('#access_token=');

      // code/hash が無い＝誤到達
      if (!hasCode && !hasHashToken) {
        router.replace(`/auth/continue?next=${encodeURIComponent(next)}`);
        return;
      }

      // 交換
      const { error } = await supabase.auth.exchangeCodeForSession();
      if (error) {
        router.replace('/?auth_error=1');
        return;
      }

      // サーバ Cookie へセッション橋渡し（必要な場合）
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          });
        }
      } catch { /* no-op */ }

      // クエリを消してから遷移（戻る時の再発防止）
      history.replaceState(null, '', window.location.pathname);
      router.replace(next);
    })();
  }, [router, sp]);

  return null;
}
