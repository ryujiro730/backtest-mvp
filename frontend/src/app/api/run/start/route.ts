// app/api/run/start/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const FREE_LIMIT = 3;
const TZ = "Asia/Tokyo";
const API = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";
// いまは強制で FREE モード
const FREE_MODE = true;

export async function POST(req: NextRequest) {
  try {
    // 1) cookieStore を先に作る
    const cookieStore = await cookies();

    // 2) SSR クライアント
    const supaSSR = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options?: any) =>
            cookieStore.set(name, value, options),
          remove: (name: string, options?: any) =>
            cookieStore.set(name, "", { ...options, maxAge: 0 }),
        },
      }
    );

    const supaAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const idem =
      req.headers.get("Idempotency-Key") ?? crypto.randomUUID();

    // --- 認証
    let userId: string | null = null;
    {
      const { data: ssr } = await supaSSR.auth.getUser();
      if (ssr?.user) {
        userId = ssr.user.id;
      } else {
        const m = (req.headers.get("authorization") || "").match(
          /^Bearer\s+(.+)$/i
        );
        if (m) {
          const { data } = await supaAdmin.auth.getUser(m[1]);
          if (data?.user) userId = data.user.id;
        }
      }
    }

    // --- クォータ
    let plan: "free" | "starter" | "pro" = "free";

    // FREE_MODE=false のときだけクォータ判定
    if (!FREE_MODE) {
      if (userId) {
        const { data: prof, error: perr } = await supaAdmin
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .single();
        if (perr)
          return NextResponse.json(
            { error: "profile_error" },
            { status: 500 }
          );
        plan = (prof?.plan ?? "free") as any;

        if (plan === "starter") {
          const { data: r } = await supaSSR.rpc("reserve_starter_quota", {
            p_idem: idem,
            p_limit: 30,
            p_tz: TZ,
          });
          if (!r || r.length === 0)
            return NextResponse.json(
              { error: "starter_quota_exceeded" },
              { status: 402 }
            );
        } else if (plan === "free") {
          const { data: r } = await supaSSR.rpc("reserve_free_quota", {
            p_idem: idem,
            p_limit: FREE_LIMIT,
            p_tz: TZ,
          });
          if (!r || r.length === 0)
            return NextResponse.json(
              { error: "free_quota_exceeded" },
              { status: 402 }
            );
        }
      } else {
        const today = new Date().toLocaleDateString("en-CA", {
          timeZone: TZ,
        });
        let used = 0;
        try {
          const raw = cookieStore.get("gt_guest_runs")?.value;
          if (raw) {
            const obj = JSON.parse(raw) as { d: string; n: number };
            if (obj?.d === today) used = Number(obj.n) || 0;
          }
        } catch {}
        if (used >= FREE_LIMIT) {
          return NextResponse.json(
            { error: "free_quota_exceeded" },
            { status: 402 }
          );
        }
        cookieStore.set(
          "gt_guest_runs",
          JSON.stringify({ d: today, n: used + 1 }),
          {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24,
          }
        );
        plan = "free";
      }
    }

    // --- FastAPI を叩く
    const payload = await req.json();
    payload.dataset_hash = `${payload.pair}__${payload.timeframe}`;

    const RUN_PATH = process.env.FASTAPI_RUN_PATH ?? "/api/run";
    const url = `${API.replace(/\/$/, "")}${RUN_PATH}`;

    const apiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // FastAPI 側の alias="Idempotency-Key" に合わせる
        "Idempotency-Key": idem,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    // FastAPI のレスポンスをそのまま扱う
    const raw = await apiRes.text().catch(() => "");
    const isJson =
      apiRes.headers.get("content-type")?.includes("application/json");

    if (!apiRes.ok) {
      return new NextResponse(isJson ? raw : JSON.stringify({ raw }), {
        status: apiRes.status,
        headers: { "content-type": "application/json" },
      });
    }

    const j = isJson ? JSON.parse(raw || "{}") : {};
    const runId = j.run_id ?? j.id;
    if (!runId) {
      return NextResponse.json(
        { error: "fastapi_no_run_id", raw: j },
        { status: 502 }
      );
    }

    return NextResponse.json({ run_id: runId, plan });
  } catch (e: any) {
    console.error("[run/start] Exception", e);
    return NextResponse.json(
      { error: "route_exception", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
