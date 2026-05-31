// ─── STRIPE CUSTOMER PORTAL ───────────────────────────────────────────────────
// Creates a Stripe Billing Portal session so customers can manage/cancel their
// monthly subscription themselves.
//
// Setup in Stripe dashboard first:
//   Billing → Customer portal → Activate & configure
//   Enable: Cancel subscriptions, View invoices
//
// Usage (from frontend):
//   POST /api/customer-portal
//   Body: { email: "customer@email.com" }
//   Returns: { url: "https://billing.stripe.com/session/..." }
//   Redirect the user to that URL.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY not configured" });
  }

  try {
    // Look up Stripe customer ID by email
    const searchRes = await fetch(
      `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(`email:"${email}"`)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      }
    );
    const searchData = await searchRes.json();
    const customer = (searchData.data || [])[0];

    if (!customer) {
      return res.status(404).json({
        error: "Geen actief abonnement gevonden voor dit e-mailadres.",
      });
    }

    // Create portal session
    const BASE = "https://www.facultyhd.com";
    const portalBody = new URLSearchParams();
    portalBody.append("customer", customer.id);
    portalBody.append("return_url", BASE + "/?portal=return");

    const portalRes = await fetch(
      "https://api.stripe.com/v1/billing_portal/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: portalBody.toString(),
      }
    );
    const portalData = await portalRes.json();

    if (portalData.error) {
      return res.status(400).json({ error: portalData.error.message });
    }

    return res.json({ url: portalData.url });
  } catch (e) {
    console.error("[customer-portal]", e.message);
    return res.status(500).json({ error: e.message });
  }
}
