// ─── STRIPE WEBHOOK ───────────────────────────────────────────────────────────
// Receives checkout.session.completed from Stripe, updates the order in
// Supabase, and fires the order/paid Inngest event to kick off delivery.
//
// Uses the Supabase REST API directly (no createClient) so there is no
// @supabase/realtime-js WebSocket check in Node.js 20.
//
// Setup:
//   1. Stripe Dashboard → Developers → Webhooks → Add endpoint
//      URL: https://www.facultyhd.com/api/stripe-webhook
//      Event: checkout.session.completed
//   2. Copy "Signing secret" → add as STRIPE_WEBHOOK_SECRET in Vercel env vars
//   3. Deploy

import { createHmac, timingSafeEqual } from "crypto";
import { inngest } from "../lib/inngest/client.js";

// ─── RAW BODY HELPER ──────────────────────────────────────────────────────────
// Vercel provides req.rawBody (Buffer) when Content-Type is application/json.
// Fall back to reading the stream if it isn't available.
async function getRawBody(req) {
  if (req.rawBody) {
    return Buffer.isBuffer(req.rawBody)
      ? req.rawBody
      : Buffer.from(req.rawBody);
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// ─── STRIPE SIGNATURE VERIFICATION ───────────────────────────────────────────
function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = {};
  for (const part of sigHeader.split(",")) {
    const eq = part.indexOf("=");
    if (eq !== -1) parts[part.slice(0, eq)] = part.slice(eq + 1);
  }
  if (!parts.t || !parts.v1) {
    throw new Error("Stripe-Signature header malformed");
  }

  const payload = parts.t + "." + rawBody.toString();
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  let match = false;
  try {
    match = timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
  } catch (_) {
    match = false;
  }
  if (!match) throw new Error("Stripe signature mismatch");

  const age = Math.abs(Date.now() / 1000 - parseInt(parts.t, 10));
  if (age > 300) throw new Error("Stripe webhook timestamp too old");
}

// ─── SUPABASE REST HELPER ─────────────────────────────────────────────────────
async function supabasePatch(table, match, data) {
  const base = process.env.SUPABASE_URL.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(match)) params.set(k, "eq." + v);

  const res = await fetch(`${base}/rest/v1/${table}?${params}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + key,
      apikey: key,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Supabase PATCH ${table} failed (${res.status}): ${txt}`);
  }
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // ── 1. Read raw body ────────────────────────────────────────────────────────
  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (e) {
    console.error("[stripe-webhook] Failed to read body:", e.message);
    return res.status(400).json({ error: "Could not read request body" });
  }

  // ── 2. Verify Stripe signature (skip if no secret configured yet) ───────────
  const sigHeader = req.headers["stripe-signature"] || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    try {
      verifyStripeSignature(rawBody, sigHeader, webhookSecret);
    } catch (e) {
      console.error("[stripe-webhook] Signature verification failed:", e.message);
      return res.status(400).json({ error: "Signature verification failed" });
    }
  } else {
    console.warn("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature check");
  }

  // ── 3. Parse event ──────────────────────────────────────────────────────────
  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch (e) {
    // If Vercel already parsed the body, fall back to req.body
    event = req.body;
  }

  if (!event || !event.type) {
    return res.status(400).json({ error: "Invalid event payload" });
  }

  console.log("[stripe-webhook] Event:", event.type, event.id);

  // ── 4. Handle checkout.session.completed ────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data?.object || {};
    const orderId = session.client_reference_id;
    const sessionId = session.id;
    const paymentIntent = session.payment_intent || null;
    const amountTotal = session.amount_total;

    if (!orderId) {
      console.warn("[stripe-webhook] No client_reference_id in session:", sessionId);
      return res.status(200).json({ received: true, warning: "No orderId" });
    }

    // ── Update order in Supabase ────────────────────────────────────────────
    try {
      await supabasePatch(
        "orders",
        { id: orderId },
        {
          status: "paid",
          stripe_session_id: sessionId,
          stripe_payment_intent: paymentIntent,
          paid_at: new Date().toISOString(),
        }
      );
      console.log("[stripe-webhook] Order updated:", orderId);
    } catch (e) {
      console.error("[stripe-webhook] Supabase update failed:", e.message);
      // Return 500 so Stripe retries the webhook
      return res.status(500).json({ error: "DB update failed" });
    }

    // ── Fire Inngest event ──────────────────────────────────────────────────
    try {
      await inngest.send({
        name: "order/paid",
        data: { orderId, sessionId, paymentIntent, amountTotal },
      });
      console.log("[stripe-webhook] Inngest event fired for order:", orderId);
    } catch (e) {
      console.error("[stripe-webhook] Inngest send failed:", e.message);
      // Return 500 so Stripe retries; Supabase is already updated so a retry is safe
      return res.status(500).json({ error: "Inngest send failed" });
    }
  }

  return res.status(200).json({ received: true });
}
