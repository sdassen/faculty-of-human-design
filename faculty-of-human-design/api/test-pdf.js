// ─── TEST PDF ENDPOINT ────────────────────────────────────────────────────────
// Regenerates a PDF from stored sections without AI calls.
// Use for rapid layout iteration: push code → hit URL → see result instantly.
//
// GET /api/test-pdf?orderId=<uuid>&secret=<TEST_PDF_SECRET>
//
// Requires env var TEST_PDF_SECRET to be set.
// Never returns sensitive data — only the rendered PDF.

import { createClient } from "@supabase/supabase-js";
import { generatePDF } from "../lib/pdf/index.js";

class _NoopWS {
  constructor() { this.readyState = 3; }
  send() {} close() {} addEventListener() {} removeEventListener() {}
}
_NoopWS.CONNECTING = 0; _NoopWS.OPEN = 1; _NoopWS.CLOSING = 2; _NoopWS.CLOSED = 3;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  // Secret guard — never expose this endpoint without a token
  const secret = process.env.TEST_PDF_SECRET;
  if (!secret || req.query.secret !== secret) {
    return res.status(403).json({ error: "forbidden" });
  }

  const { orderId } = req.query;
  if (!orderId) return res.status(400).json({ error: "orderId required" });

  const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: _NoopWS } }
  );

  const { data: order, error } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return res.status(404).json({ error: "order not found" });
  }

  const sections = (order.generated_sections || []).map(function(s) {
    return { title: s.title, text: s.text };
  });

  if (!sections.length) {
    return res.status(400).json({ error: "no generated_sections stored for this order" });
  }

  try {
    const pdf = await generatePDF({ order, sections });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="test-${orderId.slice(0, 8)}.pdf"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(pdf);
  } catch (e) {
    console.error("[test-pdf]", e);
    res.status(500).json({ error: e.message });
  }
}
