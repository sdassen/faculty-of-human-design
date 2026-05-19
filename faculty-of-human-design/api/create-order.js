// Dynamic import so any module-init error is returned as JSON rather than
// crashing the Lambda silently with FUNCTION_INVOCATION_FAILED.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // ── Load Supabase (dynamic so import errors surface as JSON) ─────────────
  let createClient;
  try {
    ({ createClient } = await import("@supabase/supabase-js"));
  } catch (e) {
    console.error("[create-order] supabase import FAILED:", e);
    return res.status(500).json({
      error: "Server configuratiefout. Neem contact op met support.",
      _debug: { phase: "import", message: e.message },
    });
  }

  // ── Validate env vars ─────────────────────────────────────────────────────
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[create-order] Missing Supabase env vars");
    return res.status(500).json({
      error: "Server configuratiefout. Neem contact op met support.",
      _debug: { phase: "env", missing: !process.env.SUPABASE_URL ? "SUPABASE_URL" : "SUPABASE_SERVICE_ROLE_KEY" },
    });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  const {
    reportId,
    reportTitle,
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

  // ── Create order ──────────────────────────────────────────────────────────
  let orderId;
  try {
    const { randomUUID } = await import("crypto");
    orderId = randomUUID();
  } catch (e) {
    orderId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
  }

  let supabase;
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (e) {
    console.error("[create-order] createClient FAILED:", e);
    return res.status(500).json({
      error: "Server configuratiefout. Neem contact op met support.",
      _debug: { phase: "createClient", message: e.message },
    });
  }

  const { error } = await supabase.from("orders").insert({
    id: orderId,
    report_id: reportId,
    report_title: reportTitle,
    customer_name: customerName || null,
    customer_email: customerEmail.trim().toLowerCase(),
    birth_data: birthData,
    partner_birth_data: partnerBirthData || null,
    prompt_sections: promptSections,
    status: "pending",
  });

  if (error) {
    console.error("[create-order] Supabase insert error:", error.message, error.code, error.details);
    return res.status(500).json({
      error: "Order aanmaken mislukt. Probeer opnieuw.",
      _debug: { phase: "insert", message: error.message, code: error.code },
    });
  }

  return res.json({ orderId });
}
