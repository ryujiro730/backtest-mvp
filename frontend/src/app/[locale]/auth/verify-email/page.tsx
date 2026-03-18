"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabase/client";

function VerifyEmailContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    if (!email || loading) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (error) return setError(error.message);
    setResent(true);
  };

  return (
    <div className="text-center">
      <div className="mb-4 text-5xl">📬</div>
      <h1 className="text-2xl font-semibold mb-3">メールを確認してください</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
        確認メールを送りました。
      </p>
      {email && (
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-6">
          {email}
        </p>
      )}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        メール内のリンクをクリックするとアカウントが有効になります。
        <br />
        届かない場合はスパムフォルダもご確認ください。
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {resent ? (
        <p className="mb-6 text-sm text-green-600 font-medium">✓ 再送しました</p>
      ) : (
        <button
          onClick={resend}
          disabled={loading || !email}
          className="mb-6 rounded-xl border border-zinc-300/80 dark:border-white/10 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
        >
          {loading ? "送信中…" : "確認メールを再送する"}
        </button>
      )}

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href={`/${locale}/login`} className="text-sky-600 hover:underline">
          ← ログインに戻る
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  const { locale } = useParams<{ locale: "ja" | "en" }>();
  return (
    <main className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8 text-zinc-900 dark:text-zinc-100">
        <Suspense fallback={<p className="text-center text-sm text-zinc-500">Loading…</p>}>
          <VerifyEmailContent locale={locale} />
        </Suspense>
      </div>
    </main>
  );
}
