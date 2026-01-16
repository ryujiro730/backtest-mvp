export function genIdemKey() {
  return `run_${crypto.randomUUID()}`;
}

// ブラウザ側で access_token を付与（Cookieが怪しい時の保険）
import { supabase } from "@/lib/supabase/client";

// lib/backtest.ts の executeRun を置き換え
export async function executeRun(payload: any, { idem }: { idem: string }) {
  const { data: sess } = await supabase.auth.getSession();
  const access = sess.session?.access_token;

  const res = await fetch("/api/run/start", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Idempotency-Key": idem,
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  // 402 → Paywall
const FREE_MODE = true; // ← いまはベタ書きでOK（あとで env に）

// 402 → Paywall
if (res.status === 402) {
  if (FREE_MODE) {
    console.warn("FREE MODE: skip paywall");
    return await res.json(); // ← API が結果返す前提
  }

  let details: any = {};
  try { details = await res.json(); } catch {}
  const e: any = new Error("SHOW_PAYWALL");
  e.code = "SHOW_PAYWALL";
  e.details = details;
  throw e;
}


  // 401 → 未ログイン/期限切れ
  if (res.status === 401) {
    const e: any = new Error("UNAUTHORIZED");
    e.code = "UNAUTHORIZED";
    throw e;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let err: any; try { err = text ? JSON.parse(text) : {}; } catch { err = { error: text }; }
    console.error("/api/run/start failed:", { status: res.status, body: text });
    const e: any = new Error(err?.error || err?.message || `RUN_START_FAILED (${res.status})`);
    e.code = err?.code || null;
    throw e;
  }

  return res.json();
}


const API = process.env.NEXT_PUBLIC_API_BASE!; // 例: https://api.delvertrade.com

export type PollResult = {
  status: "completed" | "failed";
  resultId?: string;
  summary?: any;
  equity?: { t: number; e: number }[];
};

/**
 * FastAPI 側の run ステータスを定期ポーリングして完了を待つ
 * 期待レスポンス例: { status: "running"|"completed"|"failed", result_id?: string, summary?: ..., equity?: ... }
 */
export async function pollReport(runId: string) {
  for (;;) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/reports/${runId}`, {
      method: "GET",
    });
    if (res.status === 202) {
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }
    if (!res.ok) throw new Error("REPORT_FETCH_FAILED");
    return res.json();
  }
}
