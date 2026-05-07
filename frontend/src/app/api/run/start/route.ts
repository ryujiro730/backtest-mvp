export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const API = process.env.FASTAPI_BASE_URL ?? "http://api:8000";

export async function POST(req: NextRequest) {
  try {
    const idem = req.headers.get("Idempotency-Key") ?? crypto.randomUUID();
    const payload = await req.json();

    const url = `${API.replace(/\/$/, "")}/api/run`;

    let apiRes: Response;
    try {
      apiRes = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idem,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
    } catch (fetchErr: any) {
      console.error("[run/start] fetch to FastAPI failed:", fetchErr?.message);
      return NextResponse.json(
        { error: "fastapi_unreachable", message: fetchErr?.message ?? String(fetchErr) },
        { status: 502 }
      );
    }

    const raw = await apiRes.text().catch(() => "");
    const isJson = apiRes.headers.get("content-type")?.includes("application/json");

    if (!apiRes.ok) {
      return new NextResponse(isJson ? raw : JSON.stringify({ raw }), {
        status: apiRes.status,
        headers: { "content-type": "application/json" },
      });
    }

    const j = isJson ? JSON.parse(raw || "{}") : {};
    const runId = j.run_id ?? j.id;
    if (!runId) {
      return NextResponse.json({ error: "fastapi_no_run_id", raw: j }, { status: 502 });
    }

    return NextResponse.json({ run_id: runId });
  } catch (e: any) {
    console.error("[run/start] Exception", e);
    return NextResponse.json(
      { error: "route_exception", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
