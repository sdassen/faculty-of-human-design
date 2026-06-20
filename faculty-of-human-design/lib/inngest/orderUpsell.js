import { createClient } from "@supabase/supabase-js";
import { inngest } from "./client.js";
import { sendOrderUpsellEmail } from "../email/index.js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
class _NoopWS {
  constructor() { this.readyState = 3; }
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

// ─── STRIPE PROMO CODES ───────────────────────────────────────────────────────
// Creates two €15 coupons + single-use promo codes:
//   personal — for the customer's own next purchase
//   friend   — to share with someone else
async function createUpsellPromoCodes(orderId) {
  const headers = {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 24 * 3600; // 30 days
  const suffix = orderId.replace(/-/g, "").slice(0, 6).toUpperCase();

  async function makeCode(codePrefix, couponName) {
    const couponBody = new URLSearchParams();
    couponBody.append("amount_off", "1500");
    couponBody.append("currency", "eur");
    couponBody.append("duration", "once");
    couponBody.append("name", couponName);
    const couponRes = await fetch("https://api.stripe.com/v1/coupons", {
      method: "POST", headers, body: couponBody.toString(),
    });
    const coupon = await couponRes.json();
    if (coupon.error) throw new Error(`Stripe coupon error: ${coupon.error.message}`);

    const promoBody = new URLSearchParams();
    promoBody.append("coupon", coupon.id);
    promoBody.append("code", codePrefix + suffix);
    promoBody.append("max_redemptions", "1");
    promoBody.append("expires_at", String(expiresAt));
    const promoRes = await fetch("https://api.stripe.com/v1/promotion_codes", {
      method: "POST", headers, body: promoBody.toString(),
    });
    const promo = await promoRes.json();
    if (promo.error) throw new Error(`Stripe promotion code error: ${promo.error.message}`);
    return promo.code;
  }

  const [personalCode, friendCode] = await Promise.all([
    makeCode("TERUG15", "€15 korting — volgende reading"),
    makeCode("DELEN15", "€15 korting — gedeeld door klant"),
  ]);

  return { personalCode, friendCode };
}

// ─── INNGEST FUNCTION ─────────────────────────────────────────────────────────
// Triggered after every non-mini, non-subscription report is delivered.
// Waits 3 days, then sends a thank-you email with two €15 discount codes.
export const orderUpsell = inngest.createFunction(
  { id: "order-upsell", name: "Post-Delivery Upsell Email", retries: 2 },
  { event: "order/delivered" },

  async ({ event, step }) => {
    const { orderId } = event.data;

    await step.sleep("wait-3d", "3d");

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

    const { personalCode, friendCode } = await step.run("create-promo-codes", () =>
      createUpsellPromoCodes(orderId)
    );

    await step.run("send-upsell-email", async () => {
      const chart = (order.birth_data || {}).chart || {};
      await sendOrderUpsellEmail({
        to:          order.customer_email,
        name:        order.customer_name || (order.language === "en" ? "there" : "daar"),
        language:    order.language || "nl",
        reportId:    order.report_id || "",
        reportTitle: order.report_title || "",
        personalCode,
        friendCode,
        hdType:    chart.type  || null,
        strategy:  chart.strat || null,
        authority: chart.auth  || null,
      });
    });

    return { orderId, personalCode, friendCode };
  }
);
