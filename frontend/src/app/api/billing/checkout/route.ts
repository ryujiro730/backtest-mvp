// /frontend/src/app/api/billing/checkout/route.ts
export const runtime = 'nodejs';            // ← 重要
export const dynamic = 'force-dynamic';     // ← 事前収集を回避
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; // 可能なら SUPABASE_URL に変更推奨
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("SUPABASE_URL missing");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 認証(JWT)
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();   // ← ハンドラ内で初期化
    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = userRes.user.id;

    // プロフィール取得/作成
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", userId)
      .single();
    if (profErr) throw profErr;

    const stripe = getStripe();            // ← ここで初期化
    let customerId = prof?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: prof?.email ?? undefined,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
      await supabase.from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    // priceId 決定
    let priceId: string | null = body.priceId ?? null;
    if (!priceId) {
      const plan = String(body.plan || "").toLowerCase();      // 'starter' | 'pro'
      const period = String(body.period || "").toLowerCase();  // 'monthly' | 'yearly'
      if (plan && period) {
        if (plan === "starter") {
          priceId = process.env[`STRIPE_PRICE_STARTER_${period.toUpperCase()}`] ?? null;
        } else if (plan === "pro") {
          priceId = process.env[`STRIPE_PRICE_PRO_${period.toUpperCase()}`] ?? null;
        }
      }
    }
    if (!priceId) throw new Error("invalid price/plan");

    // Checkout セッション
    const appUrl = process.env.APP_URL;
    if (!appUrl) throw new Error("APP_URL missing");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId!,
      line_items: [{ price: priceId, quantity: 1 }],
      billing_address_collection: 'required',
      customer_update: { address: 'auto', shipping: 'auto' },
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${appUrl}/account?upgraded=1`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
      subscription_data: { metadata: { user_id: userId } },
      metadata: { user_id: userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("checkout error", e);
    return NextResponse.json({ error: e?.message ?? "checkout_failed" }, { status: 500 });
  }
}
