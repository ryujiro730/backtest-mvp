export function genIdemKey() {
  return `run_${crypto.randomUUID()}`;
}

export async function executeRun(payload: any, { idem }: { idem: string }) {
  const res = await fetch("/api/run/start", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Idempotency-Key": idem,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let err: any;
    try { err = text ? JSON.parse(text) : {}; } catch { err = { error: text }; }
    console.error("/api/run/start failed:", { status: res.status, body: text });
    const e: any = new Error(err?.error || err?.message || `RUN_START_FAILED (${res.status})`);
    e.code = err?.code || null;
    throw e;
  }

  return res.json();
}



export type PollResult = {
  status: "completed" | "failed";
  resultId?: string;
  summary?: any;
  equity?: { t: number; e: number }[];
};

const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max
const POLL_INTERVAL_MS = 2_000;

/**
 * バックテスト完了をポーリングして待つ。
 * 202 = まだ計算中（継続）
 * 200 + status=failed = 失敗（例外スロー）
 * 200 + status=done = 完了（結果を返す）
 * タイムアウト or ネットワークエラー = 例外スロー
 */
export async function pollReport(runId: string) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";

  for (;;) {
    if (Date.now() > deadline) {
      throw new Error("POLL_TIMEOUT");
    }

    const res = await fetch(`${base}/api/reports/${runId}/summary`, { cache: "no-store" });

    // 202 = queued/running — keep waiting
    if (res.status === 202) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
      continue;
    }

    if (!res.ok) {
      throw new Error(`REPORT_FETCH_FAILED (${res.status})`);
    }

    const data = await res.json();

    // status=failed — worker died or task error
    if (data?.status === "failed") {
      throw new Error("RUN_FAILED");
    }

    // status=queued/running in a 200 body (shouldn't happen, but guard)
    if (data?.status && data.status !== "done") {
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
      continue;
    }

    return data;
  }
}
