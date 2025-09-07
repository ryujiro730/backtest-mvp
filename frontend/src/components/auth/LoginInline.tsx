// src/components/auth/LoginInline.tsx（モーダル用でもページ用でも）
'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginInline({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const magicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
    });
    if (error) return alert(error.message);
    setSent(true);
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
    });
    if (error) alert(error.message);
  };

  const afterLoginCheck = async () => {
    // onSuccess が渡されていれば、親側で checkout を再試行
    onSuccess?.();
  };

  // サインイン完了後は /auth/callback → /settings や /app に戻す
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
          <button className="btn w-full" onClick={magicLink} disabled={!email}>Magic Linkを送る</button>
        </>
      )}
    </div>
  );
}
