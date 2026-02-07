'use client';

const API = process.env.NEXT_PUBLIC_API_BASE!;

export function genIdemKey() {
  return `fe-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

export async function executeRun(payload: any, opts?: { idem?: string }) {
  const res = await fetch(`${API}/api/run`, {
    method:"POST",
    headers: {
      "Content-Type":"application/json",
      ...(opts?.idem ? {"Idempotency-Key": opts.idem} : {})
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${API}/api/run ${res.status}: ${text}`);
  // 外部実行APIが別の場合はここで差し替え
  const data = JSON.parse(text);
  // 最低限 run_id を返す前提（ない場合はダミー生成）
  return { run_id: data.run_id ?? crypto.randomUUID() };
}

export async function pollReport(id: string) {
  const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
  for (let i=0;i<120;i++){
    const res = await fetch(`${API}/api/reports/${id}/summary`);
    if(res.status===202){ await sleep(1000); continue; }
    const text = await res.text();
    if(res.status!==200) throw new Error(`GET /api/reports/${id} ${res.status}: ${text}`);
    return JSON.parse(text);
  }
  throw new Error("timeout");
}

