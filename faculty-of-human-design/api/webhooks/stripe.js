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

// Use Supabase REST API directly — avoids the @supabase/realtime-js
// WebSocket check that throws in Node.js 20.
async function supabasePatch(table, filter, data) {
  const base = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const params = new URLSearchParams(
    Object.entries(filter).map(([k, v]) => [k, "eq." + v])
  );
  const res = await fetch(base + "/rest/v1/" + table + "?" + params, {
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
    throw new Error("Supabase PATCH " + table + " failed (" + res.status + "): " + txt);
  }
}

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
      console.warn("[stripe-webhook] No client_reference_id on session", session.id);
      return res.json({ received: true });
    }

    // Update order to paid (idempotent — only if still pending)
    try {
      await supabasePatch(
        "orders",
        { id: orderId, status: "pending" },
        {
          status: "paid",
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent || null,
          paid_at: new Date().toISOString(),
        }
      );
    } catch (dbErr) {
      console.error("[stripe-webhook] DB update error:", dbErr.message);
      // Still fire Inngest — it handles state recovery
    }

    // Fire Inngest delivery event
    try {
      const inngest = await getInngest();
      const { ids } = await inngest.send({
        name: "order/paid",
        data: { orderId },
      });
      console.log("[stripe-webhook] Inngest event sent:", ids?.[0]);
    } catch (inngestErr) {
      console.error("[stripe-webhook] Inngest send failed:", inngestErr.message);
      return res.status(500).json({ error: "Inngest send failed" });
    }
  }

  return res.json({ received: true });
}
