// src/app/api/reports/[runId]/summary/route.ts
import { NextRequest, NextResponse } from "next/server";

const API = process.env.FASTAPI_BASE_URL!;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ runId: string }> }
) {
  const { runId } = await ctx.params; // ★ここが必須

  const url = `${API}/api/reports/${runId}/summary`;

  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
