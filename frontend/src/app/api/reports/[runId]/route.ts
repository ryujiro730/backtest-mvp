// src/app/api/reports/[runId]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ runId: string }> }
) {
  const { runId } = await ctx.params;

  console.log("[reports route] requested runId =", runId);

  if (!runId || runId === "null") {
    return NextResponse.json(
      { error: "invalid_runId" },
      { status: 400 }
    );
  }

  const url = `${API.replace(/\/$/, "")}/api/reports/${runId}`;
  console.log("[reports route] proxy url =", url);

  try {
    const res = await fetch(url, { cache: "no-store" });

    console.log("[reports route] response status =", res.status);

    const text = await res.text();
    const contentType =
      res.headers.get("content-type") ?? "application/json";

    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (err: any) {
    console.error("[reports route] fetch error:", err);
    return NextResponse.json(
      { error: "fetch_failed", message: err?.message },
      { status: 500 }
    );
  }
}
