import { rateLimit, getClientIp } from "../lib/rateLimit.js";

// ── Server-side product catalog ──────────────────────────────────────────────
// NEVER trust price or isSubscription from the client. Always look up here.
const REPORT_CATALOG = {
  volledig:         { priceNum: 75,  isSubscription: false, title: "Human Design Reading" },
  relatie_liefde:   { priceNum: 95,  isSubscription: false, title: "Relatie Reading" },
  relatie_business: { priceNum: 85,  isSubscription: false, title: "Zakelijke Reading" },
  relatie_familie:  { priceNum: 75,  isSubscription: false, title: "Familie Reading" },
  jaar:             { priceNum: 55,  isSubscription: false, title: "Jaarrapport 2026" },
  kind:             { priceNum: 75,  isSubscription: false, title: "Kinderrapport" },
  loopbaan:         { priceNum: 65,  isSubscription: false, title: "Loopbaan Reading" },
  numerologie:      { priceNum: 65,  isSubscription: false, title: "Numerologie Reading" },
  horoscoop:        { priceNum: 75,  isSubscription: false, title: "Geboortehoroscoop Reading" },
  maandelijks:      { priceNum: 19,  isSubscription: true,  title: "Maandelijkse Guidance" },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // ── Rate limiting ─────────────────────────────────────────────────────────
  // Portal requests: 3 per IP per 60 s (it sends an email; abuse = spam)
  // Checkout requests: 10 per IP per 60 s (creating a Stripe session is cheap)
  const ip = getClientIp(req);
  const isPortal = !!req.body?.portal;
  const rlKey = isPortal ? `checkout-portal:${ip}` : `checkout:${ip}`;
  const rlMax = isPortal ? 3 : 10;
  const { allowed } = await rateLimit(rlKey, { max: rlMax, window: 60 });
  if (!allowed) {
    return res.status(429).json({ error: "Te veel verzoeken. Wacht even en probeer opnieuw." });
  }

  // ── Customer Portal branch ────────────────────────────────────────────────
  // Called by SubscriptionManage component with { portal: true, email }
  // SECURITY: we never return the portal URL to the browser.
  // Instead we email it to the address on file — only the real account owner
  // can follow the link, even if someone else knows their email address.
  if (req.body?.portal) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "STRIPE_SECRET_KEY not configured" });
    try {
      const searchRes = await fetch(
        `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(`email:"${email}"`)}`,
        { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } }
      );
      const searchData = await searchRes.json();
      const customer = (searchData.data || [])[0];
      if (!customer) return res.status(404).json({ error: "Geen actief abonnement gevonden voor dit e-mailadres." });

      const portalBody = new URLSearchParams();
      portalBody.append("customer", customer.id);
      portalBody.append("return_url", "https://www.facultyhd.com/?portal=return");
      const portalRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: portalBody.toString(),
      });
      const portalData = await portalRes.json();
      if (portalData.error) return res.status(400).json({ error: portalData.error.message });

      // Email the portal URL — never expose it in the API response
      const { sendPortalEmail } = await import("../lib/email/index.js");
      await sendPortalEmail({ to: email, portalUrl: portalData.url });
      return res.json({ sent: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  const { orderId, rptId, language, email, name } = req.body;
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY niet geconfigureerd in Vercel" });
  }

  // ── Server-side price lookup — reject unknown report IDs ─────────────────
  const catalogEntry = REPORT_CATALOG[rptId];
  if (!catalogEntry) {
    return res.status(400).json({ error: `Onbekend rapport: ${rptId}` });
  }
  const { priceNum, isSubscription, title } = catalogEntry;

  const BASE = "https://www.facultyhd.com";
  const body = new URLSearchParams();

  if (isSubscription) {
    body.append("mode", "subscription");
    body.append("line_items[0][quantity]", "1");
    body.append("line_items[0][price_data][currency]", "eur");
    body.append("line_items[0][price_data][product_data][name]", title);
    body.append("line_items[0][price_data][product_data][description]", "Faculty of Human Design — Maandelijks rapport");
    body.append("line_items[0][price_data][recurring][interval]", "month");
    body.append("line_items[0][price_data][unit_amount]", String(priceNum * 100));
  } else {
    body.append("mode", "payment");
    // payment_method_types intentionally omitted — Stripe uses dashboard settings
    // (enables iDEAL, Klarna, PayPal, card automatically based on what's enabled there)
    body.append("line_items[0][quantity]", "1");
    body.append("line_items[0][price_data][currency]", "eur");
    body.append("line_items[0][price_data][product_data][name]", title);
    body.append("line_items[0][price_data][product_data][description]", "Faculty of Human Design — Persoonlijk rapport");
    body.append("line_items[0][price_data][unit_amount]", String(priceNum * 100));
  }

  // success_url includes orderId so the confirmation page can display it
  // Include language prefix so the confirmation page renders in the correct language
  const langPrefix = language === "en" ? "/en" : "";
  const successUrl = orderId
    ? `${BASE}${langPrefix}/?success=true&order=${orderId}`
    : `${BASE}${langPrefix}/?success=true`;
  body.append("success_url", successUrl);
  body.append("cancel_url", `${BASE}/?cancelled=true`);
  body.append("metadata[rptId]", rptId);
  // client_reference_id lets the webhook look up the pre-created order
  if (orderId) body.append("client_reference_id", orderId);

  // ── Pre-fill customer name for iDEAL (required by Stripe for bank transfers) ──
  // Look up an existing Stripe customer by email; create one if not found.
  // Passing a Customer object pre-fills the name field in Stripe Checkout so
  // the buyer doesn't have to type it manually.
  if (email) {
    try {
      const stripeHeaders = {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      };

      // Search for existing customer
      const searchRes = await fetch(
        `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(`email:"${email}"`)}`,
        { headers: stripeHeaders }
      );
      const searchData = await searchRes.json();
      const existing = (searchData.data || [])[0];

      if (existing) {
        // Update name if it has changed or was missing
        if (name && existing.name !== name) {
          const updateBody = new URLSearchParams();
          updateBody.append("name", name);
          const updateRes = await fetch(`https://api.stripe.com/v1/customers/${existing.id}`, {
            method: "POST",
            headers: stripeHeaders,
            body: updateBody.toString(),
          });
          const updateData = await updateRes.json();
          if (updateData.error) {
            console.warn("[checkout] customer name update failed:", updateData.error.message);
          }
        }
        body.append("customer", existing.id);
      } else {
        // Create a new customer with name + email
        const createBody = new URLSearchParams();
        createBody.append("email", email);
        if (name) createBody.append("name", name);
        const createRes = await fetch("https://api.stripe.com/v1/customers", {
          method: "POST",
          headers: stripeHeaders,
          body: createBody.toString(),
        });
        const customer = await createRes.json();
        if (customer.id) {
          body.append("customer", customer.id);
        } else {
          // Fallback: at least pre-fill the email
          body.append("customer_email", email);
        }
      }
    } catch (_) {
      // Never let customer lookup block checkout — fall back to email only
      body.append("customer_email", email);
    }
  }

  // Save the name the customer types in the iDEAL form back to the Stripe Customer record.
  // Without this, billing_details.name is never persisted and the name doesn't appear in the dashboard.
  // "auto" = collect name in the form AND save it back to the customer object.
  if (body.has("customer")) {
    body.append("customer_update[name]", "auto");
  }

  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    const session = await r.json();
    if (session.error) return res.status(400).json({ error: session.error.message });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
