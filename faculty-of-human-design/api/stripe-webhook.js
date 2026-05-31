// ─── STRIPE WEBHOOK HANDLER ───────────────────────────────────────────────────
// Handles all Stripe events for order delivery and subscription lifecycle.
//
// Events handled:
//   checkout.session.completed   → fires order/paid for one-time AND first sub payment
//   invoice.payment_succeeded    → fires subscription/renewal for monthly sub renewals
//   customer.subscription.deleted → marks subscription cancelled in Supabase
//
// Setup in Stripe dashboard:
//   Endpoint URL:  https://www.facultyhd.com/api/stripe-webhook
//   Events to send: checkout.session.completed, invoice.payment_succeeded,
//                   customer.subscription.deleted
//   Copy the "Signing secret" → set as STRIPE_WEBHOOK_SECRET env var in Vercel
//
// Vercel config: raw body must be preserved for signature verification.
// Add to vercel.json functions config:
//   "api/stripe-webhook.js": { "bodyParser": false }
// NOTE: Vercel disables bodyParser for this file via the export below.

import { inngest } from "../lib/inngest/client.js";

// Tell Vercel to pass the raw body (required for Stripe signature verification)
export const config = { api: { bodyParser: false } };

// ─── RAW BODY HELPER ──────────────────────────────────────────────────────────
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// ─── STRIPE SIGNATURE VERIFICATION ───────────────────────────────────────────
// Minimal implementation — avoids pulling in the full Stripe SDK.
async function verifyStripeSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const parts = {};
  for (const part of signature.split(",")) {
    const [k, v] = part.split("=");
    if (k && v) parts[k] = v;
  }
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) return false;

  const payload = `${timestamp}.${rawBody.toString("utf8")}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const hex = Buffer.from(sig).toString("hex");

  // Timing-safe comparison
  if (hex.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

// ─── SUPABASE HELPERS ─────────────────────────────────────────────────────────
function supaFetch(path, options = {}) {
  const base = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return fetch(base + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + key,
      apikey: key,
      ...(options.headers || {}),
    },
  });
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const signature = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  // Verify signature in production; allow bypass in test mode
  if (process.env.STRIPE_WEBHOOK_BYPASS !== "1") {
    const valid = await verifyStripeSignature(rawBody, signature, secret);
    if (!valid) {
      console.warn("[stripe-webhook] Invalid signature");
      return res.status(400).json({ error: "Invalid signature" });
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  console.log(`[stripe-webhook] event=${event.type} id=${event.id}`);

  try {
    switch (event.type) {

      // ── checkout.session.completed ──────────────────────────────────────
      // Fired once when a Checkout session is paid (one-time OR subscription first payment).
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.client_reference_id;
        if (!orderId) {
          console.warn("[stripe-webhook] checkout.session.completed: no client_reference_id");
          break;
        }

        // Update order: status → paid, record Stripe IDs
        const patchBody = {
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_session_id: session.id,
          stripe_customer_id: session.customer || null,
        };
        if (session.subscription) {
          patchBody.stripe_subscription_id = session.subscription;
        }

        await supaFetch(
          `/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&status=eq.pending`,
          {
            method: "PATCH",
            body: JSON.stringify(patchBody),
            headers: { Prefer: "return=minimal" },
          }
        );

        // If this is a subscription: store it in the subscriptions table too
        if (session.subscription) {
          await supaFetch("/rest/v1/subscriptions", {
            method: "POST",
            body: JSON.stringify({
              stripe_subscription_id: session.subscription,
              stripe_customer_id: session.customer || null,
              first_order_id: orderId,
              status: "active",
              customer_email: session.customer_email || null,
            }),
            headers: { Prefer: "return=minimal,resolution=merge-duplicates" },
          });
        }

        // Fire Inngest to generate the report
        await inngest.send({ name: "order/paid", data: { orderId } });
        console.log(`[stripe-webhook] order/paid sent for ${orderId}`);
        break;
      }

      // ── invoice.payment_succeeded ────────────────────────────────────────
      // Fired every billing cycle. Skip the first invoice (handled by checkout.session.completed).
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        // Skip invoices with billing_reason=subscription_create (= first payment, already handled)
        if (invoice.billing_reason === "subscription_create") break;

        // Look up the subscription record to get the first order (for birth data)
        const subRes = await supaFetch(
          `/rest/v1/subscriptions?stripe_subscription_id=eq.${encodeURIComponent(invoice.subscription)}&select=*`
        );
        const subs = subRes.ok ? await subRes.json() : [];
        const sub = subs[0];
        if (!sub) {
          console.warn(`[stripe-webhook] invoice.payment_succeeded: subscription not found for ${invoice.subscription}`);
          break;
        }

        // Load the original order to copy birth_data, language, customer details
        const orderRes = await supaFetch(
          `/rest/v1/orders?id=eq.${encodeURIComponent(sub.first_order_id)}&select=*`
        );
        const orders = orderRes.ok ? await orderRes.json() : [];
        const originalOrder = orders[0];
        if (!originalOrder) {
          console.warn(`[stripe-webhook] invoice.payment_succeeded: original order not found for ${sub.first_order_id}`);
          break;
        }

        // Create a new order row for this renewal
        const { randomUUID } = await import("crypto");
        const newOrderId = randomUUID();
        const now = new Date().toISOString();

        const newOrderBody = {
          id: newOrderId,
          report_id: originalOrder.report_id,
          report_title: originalOrder.report_title,
          language: originalOrder.language || "nl",
          customer_name: originalOrder.customer_name,
          customer_email: originalOrder.customer_email,
          birth_data: originalOrder.birth_data,
          partner_birth_data: originalOrder.partner_birth_data || null,
          prompt_sections: originalOrder.prompt_sections,
          status: "paid",
          paid_at: now,
          stripe_subscription_id: invoice.subscription,
          stripe_customer_id: invoice.customer || null,
          stripe_invoice_id: invoice.id,
          is_renewal: true,
        };

        const createRes = await supaFetch("/rest/v1/orders", {
          method: "POST",
          body: JSON.stringify(newOrderBody),
          headers: { Prefer: "return=minimal" },
        });

        if (!createRes.ok) {
          const err = await createRes.text();
          console.error(`[stripe-webhook] Failed to create renewal order: ${err}`);
          break;
        }

        // Update subscription last_renewed_at
        await supaFetch(
          `/rest/v1/subscriptions?stripe_subscription_id=eq.${encodeURIComponent(invoice.subscription)}`,
          {
            method: "PATCH",
            body: JSON.stringify({ last_renewed_at: now }),
            headers: { Prefer: "return=minimal" },
          }
        );

        // Fire Inngest to generate the renewal report
        await inngest.send({ name: "order/paid", data: { orderId: newOrderId } });
        console.log(`[stripe-webhook] order/paid (renewal) sent for ${newOrderId}`);
        break;
      }

      // ── customer.subscription.deleted ────────────────────────────────────
      // Fired when a subscription is cancelled (immediately or at period end).
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await supaFetch(
          `/rest/v1/subscriptions?stripe_subscription_id=eq.${encodeURIComponent(subscription.id)}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
            }),
            headers: { Prefer: "return=minimal" },
          }
        );
        console.log(`[stripe-webhook] subscription cancelled: ${subscription.id}`);
        break;
      }

      default:
        // Ignore other events
        break;
    }
  } catch (e) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, e.message);
    return res.status(500).json({ error: e.message });
  }

  // Always return 200 to acknowledge receipt
  return res.status(200).json({ received: true });
}
