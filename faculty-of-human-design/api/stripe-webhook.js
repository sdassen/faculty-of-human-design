// ─── STRIPE WEBHOOK ───────────────────────────────────────────────────────────
// Receives checkout.session.completed from Stripe, marks the order as paid in
// Supabase, and fires the order/paid Inngest event to start delivery.
//
// Setup required in Stripe Dashboard (Developers → Webhooks):
//   URL:   https://www.facultyhd.com/api/stripe-webhook
//   Event: checkout.session.completed
//   Copy the Signing secret → add as STRIPE_WEBHOOK_SECRET in Vercel env vars

import { inngest } from "../lib/inngest/client.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Vercel parses application/json bodies automatically — use req.body directly.
  const event = req.body;
  if (!event || !event.type) {
    return res.status(400).json({ error: "Invalid event payload" });
  }

  console.log("[stripe-webhook] received:", event.type, event.id);

  if (event.type === "checkout.session.completed") {
    const session = event.data && event.data.object ? event.data.object : {};
    const orderId = session.client_reference_id;
    const sessionId = session.id;
    const paymentIntent = session.payment_intent || null;

    if (!orderId) {
      console.warn("[stripe-webhook] no client_reference_id in session", sessionId);
      return res.status(200).json({ received: true });
    }

    // ── Mark order as paid in Supabase (REST API — no createClient / WebSocket) ──
    const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    try {
      const dbRes = await fetch(
        supabaseUrl + "/rest/v1/orders?id=eq." + orderId,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + supabaseKey,
            apikey: supabaseKey,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            status: "paid",
            stripe_session_id: sessionId,
            stripe_payment_intent: paymentIntent,
            paid_at: new Date().toISOString(),
          }),
        }
      );
      if (!dbRes.ok) {
        const txt = await dbRes.text();
        console.error("[stripe-webhook] Supabase PATCH failed:", dbRes.status, txt);
        return res.status(500).json({ error: "DB update failed" });
      }
      console.log("[stripe-webhook] order marked paid:", orderId);
    } catch (err) {
      console.error("[stripe-webhook] Supabase fetch error:", err.message);
      return res.status(500).json({ error: "DB update error" });
    }

    // ── Fire Inngest event ───────────────────────────────────────────────────
    try {
      await inngest.send({
        name: "order/paid",
        data: { orderId, sessionId, paymentIntent },
      });
      console.log("[stripe-webhook] Inngest event sent for order:", orderId);
    } catch (err) {
      console.error("[stripe-webhook] Inngest send failed:", err.message);
      return res.status(500).json({ error: "Inngest send failed" });
    }
  }

  return res.status(200).json({ received: true });
}
