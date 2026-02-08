// カタログを FastAPI バックエンドからプロキシ（Vercel 上で同一オリジンにし、銘柄・時間足を取得）
import { NextResponse } from "next/server";

const API = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";
const TIMEOUT_MS = 15_000;

export async function GET() {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API}/api/catalog`, {
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
  } catch (e: any) {
    clearTimeout(to);
    const msg =
      process.env.FASTAPI_BASE_URL
        ? `Backend unreachable: ${e?.message ?? String(e)}`
        : "FASTAPI_BASE_URL is not set (Vercel: set it to your backend URL)";
    return NextResponse.json(
      { error: "catalog_proxy_failed", detail: msg },
      { status: 502 }
    );
  }
}
