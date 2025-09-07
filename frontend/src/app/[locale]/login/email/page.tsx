"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginWithEmailPage() {
  const { locale } = useParams<{ locale: "ja" | "en" }>();
  const router = useRouter();
  const L = `/${locale}`;

  const [showPw, setShowPw] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);

    // AutoLogin は Supabase 側で persistSession=true で実質オン
    router.push(`${L}/dashboard`);
  };

  return (
    <main className="min-h-[80vh] grid place-items-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10
                   bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8
                   text-zinc-900 dark:text-zinc-100"
        autoComplete="on"
      >
        <h1 className="text-center text-2xl font-semibold mb-8">Login with Email</h1>

        <label className="block text-sm mb-1">Email</label>
        <input
          name="email"
          type="email"
          className="mb-4 w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                     bg-white dark:bg-zinc-900 px-4 py-3 outline-none
                     text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                     focus:ring-2 focus:ring-black/10"
          required
        />

        <label className="block text-sm mb-1">Password</label>
        <div className="relative mb-2">
          <input
            name="password"
            type={showPw ? "text" : "password"}
            className="w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                       bg-white dark:bg-zinc-900 px-4 py-3 pr-10 outline-none
                       text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                       focus:ring-2 focus:ring-black/10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <Link href={`${L}/forgot`} className="text-xs text-sky-600 hover:underline">
            I forgot my password or I can’t log in.
          </Link>
        </div>

        <label className="mb-6 flex items-center gap-2 select-none">
          <input type="checkbox" className="h-4 w-4" checked={autoLogin} onChange={e => setAutoLogin(e.target.checked)} />
          <span className="text-base">AutoLogin</span>
        </label>

        {msg && <p className="mb-3 text-sm text-red-600">{msg}</p>}

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-black px-6 py-3 text-white text-lg font-medium hover:opacity-90"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
