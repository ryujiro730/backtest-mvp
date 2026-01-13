'use client';
import { useMemo, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginInline({
  next = '/app',
  onSuccess,
}: { next?: string; onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const origin = useMemo(
    () => (typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? ''),
    []
  );
  const callbackUrl = useMemo(
    () => `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    [origin, next]
  );

  const google = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl, flowType: 'pkce' },
    });
    if (error) alert(error.message);
  }, [callbackUrl]);

  const magicLink = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl, shouldCreateUser: true },
    });
    if (error) return alert(error.message);
    setSent(true);
  }, [email, callbackUrl]);

  const afterLoginCheck = useCallback(() => { onSuccess?.(); }, [onSuccess]);

  return (
    <div className="space-y-3">
      <button className="btn w-full" onClick={google}>Googleで続行</button>
      <div className="text-center text-xs text-zinc-500">or</div>
      {sent ? (
        <div className="text-sm">メールを送信しました。受信箱をご確認ください。</div>
      ) : (
        <>
          <input
            className="w-full rounded-lg border p-2 bg-transparent"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn w-full" onClick={magicLink} disabled={!email}>
            Magic Linkを送る
          </button>
        </>
      )}
    </div>
  );
}
