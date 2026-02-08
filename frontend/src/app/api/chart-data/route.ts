// チャート用 OHLC を FastAPI からプロキシ
import { NextRequest, NextResponse } from "next/server";

const API = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pair = searchParams.get("pair") ?? "EURUSD";
  const timeframe = searchParams.get("timeframe") ?? "H1";
  const limit = searchParams.get("limit") ?? "10000";
  const before = searchParams.get("before") ?? "";
  const url = `${API}/api/chart-data?pair=${encodeURIComponent(pair)}&timeframe=${encodeURIComponent(timeframe)}&limit=${encodeURIComponent(limit)}${before ? `&before=${encodeURIComponent(before)}` : ""}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "chart_data_proxy_failed", detail: msg },
      { status: 502 }
    );
  }
}
