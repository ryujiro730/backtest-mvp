export async function triggerSim(payload: any) {
  const res = await fetch("/api/run-sim", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status === 429) return { ok: false, reason: "limit" as const };
  if (!res.ok) return { ok: false, reason: "error" as const };

  const data = await res.json();
  return { ok: true as const, data };
}
