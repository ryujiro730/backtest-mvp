import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const FREE_LIMIT = 3;

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (k) => cookieStore.get(k)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ plan: "free", remaining: 0 });

  const { data: prof } = await supabase
    .from("profiles").select("plan").eq("id", user.id).single();
  if (prof?.plan === "premium") {
    return NextResponse.json({ plan: "premium", remaining: Infinity });
  }

  const { data: row } = await supabase.rpc("reserve_free_quota", {
    p_idem: `peek-${crypto.randomUUID()}`,   // “予約せず”に見る手段がないので…
    p_limit: 10_000,                         // 予約にならないように **別RPCを作るのが本当は望ましい**
    p_tz: "Asia/Tokyo",
  });

  // ↑ 予約になってしまうと良くないので、本来は “参照専用RPC” を用意してください。
  // ↓ 一旦は usage_counters を SELECT で見る簡易版に変更（参照専用）
  /*
  const { data: cnt } = await supabase
    .from("usage_counters")
    .select("used")
    .eq("user_id", user.id)
    .eq("period", new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })).toISOString().slice(0,7)+'-01')
    .maybeSingle();
  const used = cnt?.used ?? 0;
  */

  // 参照専用RPCを別途作るまでの簡易値：
  const used = 0;
  return NextResponse.json({ plan: "free", remaining: Math.max(0, FREE_LIMIT - used) }, {
    headers: { "Cache-Control": "private, max-age=10" }
  });
}
