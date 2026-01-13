// supabase/functions/stripe-webhook/index.ts
// Deno (Supabase Edge) 用：esm 経由で Stripe を読み込む
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // Webhook はRLSを越えるためSRK必須
);

// lookup_key → plan のマッピング（あなたのStripe価格に合わせて調整）
function mapPlan(lookupKey?: string | null, productTier?: string | null) {
  const key = (lookupKey ?? productTier ?? "").toLowerCase();
  if (key.includes("pro")) return "pro";
  if (key.includes("starter")) return "starter";
  return "free";
}

async function upsertSubscriptionByCustomerId(customerId: string, plan: string, currentPeriodEnd?: number) {
  // customer.metadata.user_id から Supabase の profiles.id を特定する
  const customer = await stripe.customers.retrieve(customerId);
  const userId = typeof customer !== "string" ? (customer.metadata?.user_id as string | undefined) : undefined;
  if (!userId) {
    console.warn("No user_id metadata on customer; skip", customerId);
    return;
  }

  const payload: Record<string, unknown> = {
    plan,
    stripe_customer_id: customerId,
  };
  if (currentPeriodEnd) {
    // Stripe は Unix 秒
    payload.current_period_end = new Date(currentPeriodEnd * 1000).toISOString();
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  if (error) {
    console.error("profiles update error", error);
  }
}

serve(async (req) => {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) return new Response("Missing signature", { status: 400 });

    const body = await req.text(); // 生ボディ必須
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        // 初回購入時の保険：profiles に stripe_customer_id を埋める
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string | undefined;
        // user_id は Checkout 作成時に metadata か client_reference_id で渡しておくのがベター
        if (customerId) {
          // 可能なら product/price から plan 推定
          let plan = "starter";
          try {
            if (session.line_items?.data?.length) {
              const item = session.line_items.data[0];
              const price = await stripe.prices.retrieve(item.price?.id as string);
              const product = await stripe.products.retrieve(price.product as string);
              plan = mapPlan(price.lookup_key as string | null, (product.metadata?.tier as string | undefined) ?? null);
            }
          } catch (_) {}
          await upsertSubscriptionByCustomerId(customerId, plan);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        // 代表 item から価格を取る（複数価格想定なら集約ルールを決める）
        const item = sub.items.data[0];
        let plan = "free";
        try {
          const price = await stripe.prices.retrieve(item.price.id);
          const product = await stripe.products.retrieve(price.product as string);
          plan = mapPlan(price.lookup_key as string | null, (product.metadata?.tier as string | undefined) ?? null);
        } catch (_) {}
        await upsertSubscriptionByCustomerId(customerId, plan, sub.current_period_end ?? undefined);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await upsertSubscriptionByCustomerId(customerId, "free", sub.current_period_end ?? undefined);
        break;
      }

      default:
        // 必要に応じてログのみ
        // console.log(`Unhandled event type ${event.type}`);
        break;
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error("webhook error", err?.message ?? err);
    return new Response(`Webhook Error: ${err?.message ?? "unknown"}`, { status: 400 });
  }
});
