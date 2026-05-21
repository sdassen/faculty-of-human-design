// Calls the Supabase REST API directly via fetch so we avoid the
// @supabase/realtime-js WebSocket check that throws in Node.js 20.

// ── Lazy import for PDF generation (only loaded on GET test requests) ──────────
async function renderTestPdf(orderId, res) {
  const { createClient } = await import("@supabase/supabase-js");
  const { generatePDF }  = await import("../lib/pdf/index.js");

  class _NoopWS {
    constructor() { this.readyState = 3; }
    send() {} close() {} addEventListener() {} removeEventListener() {}
  }
  _NoopWS.CONNECTING = 0; _NoopWS.OPEN = 1; _NoopWS.CLOSING = 2; _NoopWS.CLOSED = 3;

  const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: _NoopWS } }
  );

  const { data: order, error } = await db.from("orders").select("*").eq("id", orderId).single();
  if (error || !order) return res.status(404).json({ error: "order not found" });

  const sections = (order.generated_sections || []).map(function(s) {
    return { title: s.title, ...s };
  });
  if (!sections.length) return res.status(400).json({ error: "no generated_sections for this order" });

  const pdf = await generatePDF({ order, sections });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="test-${orderId.slice(0, 8)}.pdf"`);
  res.setHeader("Cache-Control", "no-store");
  return res.send(pdf);
}

export default async function handler(req, res) {
  // GET ?testPdf=<orderId>&secret=<TEST_PDF_SECRET>
  // Regenerates a PDF from stored sections for rapid layout iteration.
  if (req.method === "GET") {
    const secret = process.env.TEST_PDF_SECRET;
    if (!secret || req.query.secret !== secret) {
      return res.status(403).json({ error: "forbidden" });
    }
    const { testPdf } = req.query;
    if (!testPdf) return res.status(400).json({ error: "testPdf orderId required" });
    try {
      return await renderTestPdf(testPdf, res);
    } catch (e) {
      console.error("[test-pdf]", e);
      return res.status(500).json({ error: e.message });
    }
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
