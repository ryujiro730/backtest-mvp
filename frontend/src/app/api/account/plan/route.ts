import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const cookieStore = await cookies();

  const supaSSR = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => cookieStore.set({ name: n, value: v, ...o }),
        remove: (n, o) => cookieStore.set({ name: n, value: "", ...o }),
      },
    }
  );

  // まず Cookie でユーザー特定
  let userId: string | null = null;
  try {
    const { data } = await supaSSR.auth.getUser();
    if (data?.user) userId = data.user.id;
  } catch {}

  // ダメなら Authorization ベアラートークンで特定
  if (!userId) {
    const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
    if (m) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data } = await admin.auth.getUser(m[1]);
      if (data?.user) userId = data.user.id;
    }
  }

  if (!userId) {
    return NextResponse.json({ plan: "free", _err: "no_user" }, { headers: { "Cache-Control": "no-store" } });
  }

  // ここでは存在が確実な "plan" だけを取得
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ plan: "free", _err: `select_failed:${error.code}` }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(
    { plan: (data?.plan ?? "free") as "free" | "starter" | "pro" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
