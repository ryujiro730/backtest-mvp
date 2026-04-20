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
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("SUPABASE_URL missing");
  if (!srv) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, srv, { auth: { autoRefreshToken: false, persistSession: false } });
}

function planFromPriceId(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  const starterMonthly = process.env.STRIPE_PRICE_STARTER_MONTHLY;
  const starterYearly  = process.env.STRIPE_PRICE_STARTER_YEARLY;
  const proMonthly     = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const proYearly      = process.env.STRIPE_PRICE_PRO_YEARLY;
  if (priceId === starterMonthly || priceId === starterYearly) return 'starter';
  if (priceId === proMonthly    || priceId === proYearly)     return 'pro';
  return null;
}

async function upsertSubscription(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  sub: Stripe.Subscription,
  userId: string | null,
) {
  if (!userId) return;

  const priceId = sub.items.data[0]?.price?.id ?? null;
  const plan    = planFromPriceId(priceId);

  // subscriptions テーブルを upsert
  await supabase.from("subscriptions").upsert({
    id:                   sub.id,
    user_id:              userId,
    customer_id:          sub.customer as string,
    plan:                 plan,
    status:               sub.status,
    current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
    current_period_end:   new Date((sub as any).current_period_end   * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at:           new Date().toISOString(),
  }, { onConflict: 'id' });

  // profiles.plan も同期（active/trialing → プラン名、それ以外 → free）
  const ACTIVE = ['active', 'trialing'];
  const profilePlan = ACTIVE.includes(sub.status) && plan ? plan : 'free';
  await supabase.from("profiles")
    .update({ plan: profilePlan, stripe_customer_id: sub.customer as string })
    .eq("id", userId);
}

async function resolveUserId(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  customerId: string,
  metaUserId?: string | null,
): Promise<string | null> {
  if (metaUserId) return metaUserId;
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

    const body   = await req.text();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET missing");

    const stripe  = getStripe();
    const event   = stripe.webhooks.constructEvent(body, sig, secret);
    const supabase = getSupabaseAdmin();

    switch (event.type) {
      // ── チェックアウト完了 ───────────────────────────────────────
      case "checkout.session.completed": {
        const session    = event.data.object as Stripe.Checkout.Session;
        const userId     = session.metadata?.user_id ?? null;
        const customerId = session.customer as string | null;
        if (userId && customerId) {
          await supabase.from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", userId);
        }
        break;
      }

      // ── サブスクリプション作成 / 更新 ────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub      = event.data.object as Stripe.Subscription;
        const metaUid  = sub.metadata?.user_id ?? null;
        const userId   = await resolveUserId(supabase, sub.customer as string, metaUid);
        await upsertSubscription(supabase, sub, userId);
        break;
      }

      // ── サブスクリプション削除（キャンセル確定） ─────────────────
      case "customer.subscription.deleted": {
        const sub     = event.data.object as Stripe.Subscription;
        const metaUid = sub.metadata?.user_id ?? null;
        const userId  = await resolveUserId(supabase, sub.customer as string, metaUid);
        await upsertSubscription(supabase, sub, userId);
        break;
      }

      // ── 請求成功（renewal） ──────────────────────────────────────
      case "invoice.paid": {
        const invoice  = event.data.object as Stripe.Invoice;
        const subId    = (invoice as any).subscription as string | null;
        if (!subId) break;
        const sub      = await stripe.subscriptions.retrieve(subId);
        const metaUid  = sub.metadata?.user_id ?? null;
        const userId   = await resolveUserId(supabase, sub.customer as string, metaUid);
        await upsertSubscription(supabase, sub, userId);
        break;
      }

      // ── 請求失敗 ────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice  = event.data.object as Stripe.Invoice;
        const subId    = (invoice as any).subscription as string | null;
        if (!subId) break;
        const sub      = await stripe.subscriptions.retrieve(subId);
        const metaUid  = sub.metadata?.user_id ?? null;
        const userId   = await resolveUserId(supabase, sub.customer as string, metaUid);
        // past_due など status が変わるので upsert する
        await upsertSubscription(supabase, sub, userId);
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("webhook error:", e);
    return NextResponse.json({ error: e?.message ?? "webhook_failed" }, { status: 400 });
  }
}
