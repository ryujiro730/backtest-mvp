// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/app";

  // Supabaseが付けてくるエラー（例: ?error=access_denied）
  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    return NextResponse.redirect(new URL("/?auth_error=1", url.origin));
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => cookieStore.set(n, v, o),
        remove: (n, o) => cookieStore.set(n, "", { ...o, maxAge: 0 }),
      },
    }
  );

  // コード⇄セッション交換
  const { error } = await supabase.auth.exchangeCodeForSession();
  if (error) {
    return NextResponse.redirect(new URL("/?auth_error=1", url.origin));
  }

  // 成功 → 希望の遷移先（Stripe入口）へ
  return NextResponse.redirect(new URL(next, url.origin));
}
