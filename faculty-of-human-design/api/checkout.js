export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { orderId, rptId, title, price, isSubscription } = req.body;
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "STRIPE_SECRET_KEY niet geconfigureerd in Vercel" });
  }

  const BASE = "https://www.facultyofhumandesign.com";
  const body = new URLSearchParams();

  if (isSubscription) {
    body.append("mode", "subscription");
    body.append("line_items[0][quantity]", "1");
    body.append("line_items[0][price_data][currency]", "eur");
    body.append("line_items[0][price_data][product_data][name]", title);
    body.append("line_items[0][price_data][product_data][description]", "Faculty of Human Design — Maandelijks rapport");
    body.append("line_items[0][price_data][recurring][interval]", "month");
    body.append("line_items[0][price_data][unit_amount]", String(Math.round(price * 100)));
  } else {
    body.append("mode", "payment");
    body.append("payment_method_types[]", "card");
    body.append("payment_method_types[]", "ideal");
    body.append("line_items[0][quantity]", "1");
    body.append("line_items[0][price_data][currency]", "eur");
    body.append("line_items[0][price_data][product_data][name]", title);
    body.append("line_items[0][price_data][product_data][description]", "Faculty of Human Design — Persoonlijk rapport");
    body.append("line_items[0][price_data][unit_amount]", String(Math.round(price * 100)));
  }

  // success_url includes orderId so the confirmation page can display it
  const successUrl = orderId
    ? `${BASE}/?success=true&order=${orderId}`
    : `${BASE}/?success=true`;
  body.append("success_url", successUrl);
  body.append("cancel_url", `${BASE}/?cancelled=true`);
  body.append("metadata[rptId]", rptId);
  // client_reference_id lets the webhook look up the pre-created order
  if (orderId) body.append("client_reference_id", orderId);

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
