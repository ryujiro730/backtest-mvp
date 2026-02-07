// lib/strategy/runBacktest.ts
import { executeRun, genIdemKey, pollReport } from "@/lib/backtest";

export async function runBacktest(payload: any) {
  const { run_id } = await executeRun(payload, { idem: genIdemKey() });
  const data = await pollReport(run_id);

  return {
    runId: run_id,
    summary: data.summary ?? null,
    equity: Array.isArray(data.equity) ? data.equity : [],
    resultId: data.resultId ?? data.id ?? run_id,
  };
}
