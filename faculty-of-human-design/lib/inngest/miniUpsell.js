import { createClient } from "@supabase/supabase-js";
import { inngest } from "./client.js";
import { sendMiniUpsellEmail } from "../email/index.js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
class _NoopWS {
  constructor() { this.readyState = 3; } // CLOSED
  send() {} close() {} addEventListener() {} removeEventListener() {}
}
_NoopWS.CONNECTING = 0; _NoopWS.OPEN = 1; _NoopWS.CLOSING = 2; _NoopWS.CLOSED = 3;

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: _NoopWS } }
  );
}

// ─── STRIPE PROMO CODE ────────────────────────────────────────────────────────
// Creates a one-off €29 coupon + a single-use promotion code tied to this order.
// Note: Stripe coupons created this way apply to ANY checkout (our line items
// use inline price_data, not Product IDs, so per-product restriction isn't
// available). Acceptable for a small, time-limited upsell — flagged for awareness.
async function createUpgradePromoCode(orderId) {
  const headers = {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const couponBody = new URLSearchParams();
  couponBody.append("amount_off", "2900");
  couponBody.append("currency", "eur");
  couponBody.append("duration", "once");
  couponBody.append("name", "Vervolg op Type & Strategie Reading");
  const couponRes = await fetch("https://api.stripe.com/v1/coupons", {
    method: "POST", headers, body: couponBody.toString(),
  });
  const coupon = await couponRes.json();
  if (coupon.error) throw new Error(`Stripe coupon error: ${coupon.error.message}`);

  const code = "BLAUWDRUK29" + orderId.replace(/-/g, "").slice(0, 6).toUpperCase();
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 3600; // 7 days

  const promoBody = new URLSearchParams();
  promoBody.append("coupon", coupon.id);
  promoBody.append("code", code);
  promoBody.append("max_redemptions", "1");
  promoBody.append("expires_at", String(expiresAt));
  const promoRes = await fetch("https://api.stripe.com/v1/promotion_codes", {
    method: "POST", headers, body: promoBody.toString(),
  });
  const promo = await promoRes.json();
  if (promo.error) throw new Error(`Stripe promotion code error: ${promo.error.message}`);

  return promo.code;
}

// ─── INNGEST FUNCTION ─────────────────────────────────────────────────────────
// Triggered by order-delivery once a Type & Strategie Reading is delivered.
// Waits 24h, then offers a €29-credited upgrade to the Full Blueprint.
export const miniUpsell = inngest.createFunction(
  { id: "mini-reading-upsell", name: "Mini Reading Upsell Email", retries: 2 },
  { event: "order/mini-delivered" },

  async ({ event, step }) => {
    const { orderId } = event.data;

    await step.sleep("wait-24h", "24h");

    const order = await step.run("load-order", async () => {
      const db = getSupabase();
      const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      if (error || !data) throw new Error(`Order not found: ${orderId}`);
      return data;
    });

    // Skip the upsell if the customer already ordered the Full Blueprint since
    const alreadyUpgraded = await step.run("check-existing-upgrade", async () => {
      const db = getSupabase();
      const { data } = await db
        .from("orders")
        .select("id")
        .eq("customer_email", order.customer_email)
        .eq("report_id", "volledig")
        .gte("created_at", order.created_at);
      return (data || []).length > 0;
    });

    if (alreadyUpgraded) {
      console.log(`[mini-upsell] Skipping ${orderId} — customer already upgraded`);
      return { skipped: "already_upgraded" };
    }

    const promoCode = await step.run("create-promo-code", () => createUpgradePromoCode(orderId));

    await step.run("send-upsell-email", async () => {
      await sendMiniUpsellEmail({
        to: order.customer_email,
        name: order.customer_name || (order.language === "en" ? "there" : "daar"),
        language: order.language || "nl",
        promoCode,
      });
    });

    return { orderId, promoCode };
  }
);
