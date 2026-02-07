// app/api/run-sim/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ← server only!
);

const KIND = "trade-sim";
const DAILY_LIMIT = 3;
const COOKIE_KEY = "delver_anon_id";

function getOrSetAnonId() {
  const store = cookies();
  let id = store.get(COOKIE_KEY)?.value;
  if (!id) {
    id = crypto.randomUUID();
    store.set(COOKIE_KEY, id, { httpOnly: true, sameSite: "Lax", maxAge: 60*60*24*365 });
  }
  return id;
}

export async function POST(req: Request) {
  try {
    // 1) （任意）ユーザー判定：JWTがあるなら user_id を使う
    //    認証を使ってないなら null でOK
    const authHeader = headers().get("authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    let user_id: string | null = null;
    if (jwt) {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${jwt}` } } }
      );
      const { data } = await sb.auth.getUser();
      user_id = data.user?.id ?? null;
    }

    // 2) 未ログイン利用の識別子（クッキー）
    const anon_id = user_id ? null : getOrSetAnonId();

    // 3) Stripeチェックは**完全に削除**。無料クオータだけ確認。
    const { data: allowed, error } = await supabaseAdmin
      .rpc("reserve_free_quota", { p_kind: KIND, p_user_id: user_id, p_anon_id: anon_id, p_daily_limit: DAILY_LIMIT });

    if (error) {
      console.error("quota rpc error", error);
      return NextResponse.json({ error: "quota_failed" }, { status: 500 });
    }
    if (!allowed) {
      return NextResponse.json({ error: "limit_reached", limit: DAILY_LIMIT }, { status: 429 });
    }

    // 4) ここで本体の処理（バックテストやシミュレーション）を実行
    // 例:
    // const body = await req.json();
    // const result = await runSimulation(body);
    const result = { ok: true }; // ダミー

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
