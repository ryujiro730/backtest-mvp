// /frontend/src/app/api/billing/portal/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("SUPABASE_URL missing");
  if (!srv) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, srv, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();          // ← 関数内で初期化
    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = userRes.user.id;
    const email = userRes.user.email ?? undefined;

    // profiles 取得
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();
    if (profErr) return NextResponse.json({ error: "profile_not_found" }, { status: 400 });

    let customerId = prof?.stripe_customer_id as string | null;

    const stripe = getStripe();                   // ← ここで初期化
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
      if (updErr) return NextResponse.json({ error: "profile_update_failed" }, { status: 500 });
    }

    const appUrl = process.env.APP_URL;
    if (!appUrl) throw new Error("APP_URL missing");

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url: `${appUrl}/app`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("portal error", e);
    return NextResponse.json({ error: e?.message ?? "portal_failed" }, { status: 500 });
  }
}
