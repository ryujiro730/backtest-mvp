// チャート用 OHLC を FastAPI バックエンドからプロキシ（Docker/Vercel で同一オリジンにし、chart-data を取得）
import { NextRequest, NextResponse } from "next/server";

const API = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";
const TIMEOUT_MS = 30_000;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pair = searchParams.get("pair") ?? "EURUSD";
  const timeframe = searchParams.get("timeframe") ?? "H1";
  const limit = searchParams.get("limit") ?? "2000";
  const before = searchParams.get("before");

  const query = new URLSearchParams({
    pair,
    timeframe,
    limit,
  });
  if (before != null && before !== "") query.set("before", before);

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API}/api/chart-data?${query.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(to);
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (e: unknown) {
    clearTimeout(to);
    const msg =
      process.env.FASTAPI_BASE_URL
        ? `Backend unreachable: ${e instanceof Error ? e.message : String(e)}`
        : "FASTAPI_BASE_URL is not set (set it to your backend URL, e.g. http://api:8000 in Docker)";
    return NextResponse.json(
      { error: "chart_data_proxy_failed", detail: msg },
      { status: 502 }
    );
  }
}
