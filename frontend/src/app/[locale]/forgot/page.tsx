"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPage() {
  const { locale } = useParams<{ locale: "ja" | "en" }>();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const redirectTo = `${window.location.origin}/${locale}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  };

  if (sent) {
    return (
      <main className="min-h-[80vh] grid place-items-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8 text-zinc-900 dark:text-zinc-100 text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h1 className="text-2xl font-semibold mb-3">Check your email</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            <strong className="text-zinc-700 dark:text-zinc-200">{email}</strong> にパスワードリセットリンクを送りました。
            メールが届かない場合はスパムフォルダもご確認ください。
          </p>
          <Link
            href={`/${locale}/login`}
            className="text-sm text-sky-600 hover:underline"
          >
            ← ログインに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] grid place-items-center px-4 py-12">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8 text-zinc-900 dark:text-zinc-100"
      >
        <h1 className="text-center text-2xl font-semibold mb-2">パスワードをリセット</h1>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          登録済みのメールアドレスを入力するとリセットリンクを送ります。
        </p>

        <label className="block text-sm mb-1">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="mb-6 w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                     bg-white dark:bg-zinc-900 px-4 py-3 outline-none
                     text-zinc-900 dark:text-zinc-100 placeholder-zinc-400
                     focus:ring-2 focus:ring-black/10"
          placeholder="you@example.com"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-6 py-3 text-white font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "送信中…" : "リセットリンクを送る"}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href={`/${locale}/login`} className="text-sky-600 hover:underline">
            ← ログインに戻る
          </Link>
        </p>
      </form>
    </main>
  );
}
