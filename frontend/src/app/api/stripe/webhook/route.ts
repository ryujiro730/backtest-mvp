// /frontend/src/app/api/stripe/webhook/route.ts
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
    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

    // Webhook では「生のボディ文字列」が必要
    const body = await req.text();

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET missing");

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, sig, secret);

    const supabase = getSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string | null;

        if (userId && customerId) {
          await supabase
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await supabase
          .from("profiles")
          .update({ plan: "free" })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "invoice.paid": {
        // 必要なら課金成功時の更新処理
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("webhook error:", e);
    return NextResponse.json({ error: e?.message ?? "webhook_failed" }, { status: 400 });
  }
}
