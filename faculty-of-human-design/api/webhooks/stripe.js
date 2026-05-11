import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

// Inngest client (lazy-imported to avoid cold-start failures on missing env)
let _inngest = null;
async function getInngest() {
  if (!_inngest) {
    const { inngest } = await import("../../lib/inngest/client.js");
    _inngest = inngest;
  }
  return _inngest;
}

// Vercel: disable automatic body parsing so we can read the raw body
// for Stripe signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("="))
  );
  const timestamp = parts.t;
  const v1 = parts.v1;
  if (!timestamp || !v1) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  // Timing-safe comparison
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const signature = req.headers["stripe-signature"];

  if (
    !verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  ) {
    console.error("[stripe-webhook] Signature verification failed");
    return res.status(400).json({ error: "Ongeldige handtekening" });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return res.status(400).json({ error: "Ongeldige JSON" });
  }

  // Handle payment success events
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    const orderId = session.client_reference_id;

    if (!orderId) {
      // Legacy order without pre-created order — ignore
      console.warn("[stripe-webhook] No client_reference_id on session", session.id);
      return res.json({ received: true });
    }

    // Update order to paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent || null,
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("status", "pending"); // idempotency guard

    if (updateError) {
      console.error("[stripe-webhook] DB update error:", updateError.message);
      // Still fire Inngest — it will handle state recovery
    }

    // Fire Inngest delivery event
    try {
      const inngest = await getInngest();
      const { ids } = await inngest.send({
        name: "order/paid",
        data: { orderId },
      });
      console.log("[stripe-webhook] Inngest event sent:", ids?.[0]);
    } catch (inngestError) {
      console.error("[stripe-webhook] Inngest send failed:", inngestError.message);
      // Mark as failed so we can retry manually
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderId);
    }
  }

  return res.json({ received: true });
}
