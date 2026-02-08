// カタログを FastAPI バックエンドからプロキシ（Vercel 上で同一オリジンにし、銘柄・時間足を取得）
import { NextResponse } from "next/server";

const API = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function GET() {
  const res = await fetch(`${API}/api/catalog`, { cache: "no-store" });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
