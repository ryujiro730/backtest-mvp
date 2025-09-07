import Link from "next/link";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function LoginIndexPage({ params }: { params: { locale: "ja" | "en" } }) {
  const L = `/${params.locale}`;

  return (
    <main className="min-h-[80vh] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10
                      bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8
                      text-zinc-900 dark:text-zinc-100">
        <h1 className="text-center text-2xl font-semibold mb-8">Login to Delver</h1>

        {/* Google（Supabase OAuth） */}
        <GoogleAuthButton label="Continue with Google" />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200/80 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/90 dark:bg-zinc-900/85 text-zinc-500 dark:text-zinc-400">
              or
            </span>
          </div>
        </div>

        {/* Email ログイン入口 */}
        <Link
          href={`${L}/login/email`}
          className="block w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                     bg-white/95 dark:bg-zinc-900/60 px-4 py-3 text-center shadow-sm hover:opacity-95 transition
                     text-zinc-900 dark:text-zinc-100"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
              <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="text-sm">Email</span>
          </div>
        </Link>

        <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don’t have an account yet?{" "}
          <Link href={`${L}/signup`} className="text-sky-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
