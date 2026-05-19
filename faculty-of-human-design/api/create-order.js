// Calls the Supabase REST API directly via fetch so we avoid the
// @supabase/realtime-js WebSocket check that throws in Node.js 20.
export default async function handler(req, res) {
  // Temporary GET diagnostic — remove once orders are working
  if (req.method === "GET") {
    return res.json({
      SUPABASE_URL: process.env.SUPABASE_URL ? "✅ set" : "❌ MISSING",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ set" : "❌ MISSING",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "✅ set" : "❌ MISSING",
    });
  }

  if (req.method !== "POST") return res.status(405).end();

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[create-order] Missing Supabase env vars");
    return res.status(500).json({ error: "Server configuratiefout." });
  }

  const {
    reportId,
    reportTitle,
    language,
    price,
    customerName,
    customerEmail,
    birthData,
    partnerBirthData,
    promptSections,
  } = req.body;

  if (!reportId || !customerEmail || !birthData || !promptSections) {
    return res.status(400).json({ error: "Vereiste velden ontbreken" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return res.status(400).json({ error: "Ongeldig e-mailadres" });
  }

  const { randomUUID } = await import("crypto");
  const orderId = randomUUID();

  const row = {
    id: orderId,
    report_id: reportId,
    report_title: reportTitle || reportId,
    language: language || "nl",
    customer_name: customerName || null,
    customer_email: customerEmail.trim().toLowerCase(),
    birth_data: birthData,
    partner_birth_data: partnerBirthData || null,
    prompt_sections: promptSections,
    status: "pending",
  };

  const url = process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/orders";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let dbRes;
  try {
    dbRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key,
        "apikey": key,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(row),
    });
  } catch (e) {
    console.error("[create-order] fetch to Supabase failed:", e.message);
    return res.status(500).json({ error: "Order aanmaken mislukt. Probeer opnieuw." });
  }

  if (!dbRes.ok) {
    let errBody = "";
    try { errBody = await dbRes.text(); } catch (_) {}
    console.error("[create-order] Supabase error:", dbRes.status, errBody);
    return res.status(500).json({ error: "Order aanmaken mislukt. Probeer opnieuw." });
  }

  return res.json({ orderId });
}
