import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import PDFDocument from "pdfkit";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
// Protect with ADMIN_SECRET env var — call with ?secret=<your-secret>
function isAuthorized(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.query.secret === secret;
}

// ─── MINIMAL TEST PDF ─────────────────────────────────────────────────────────
function buildTestPDF() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 56 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Cover
    doc.rect(0, 0, 595.28, 841.89).fill("#1A1715");
    doc.rect(0, 0, 595.28, 3).fill("#C9A85C");
    doc.font("Helvetica").fontSize(7).fillColor("#7A6840")
      .text("FACULTY OF HUMAN DESIGN  ·  IBIZA", 0, 68, { align: "center", width: 595.28, characterSpacing: 4 });
    doc.font("Times-Italic").fontSize(28).fillColor("#FFFFFF")
      .text("Test Rapport", 56, 140, { align: "center", width: 483.28 });
    doc.font("Helvetica").fontSize(11).fillColor("#7A7470")
      .text("Test Klant · 1 januari 1990", 0, 200, { align: "center", width: 595.28 });
    doc.font("Helvetica").fontSize(9).fillColor("#504C48")
      .text("Dit is een testrapport om de downloadflow te verifiëren.", 0, 240, { align: "center", width: 595.28 });

    // Section page
    doc.addPage();
    doc.rect(0, 0, 595.28, 4).fill("#1A1715");
    doc.rect(0, 4, 3, 56).fill("#C9A85C");
    doc.font("Times-Roman").fontSize(19).fillColor("#1A1715")
      .text("1. Test Sectie", 68, 28, { width: 471.28 });
    doc.font("Helvetica").fontSize(10.5).fillColor("#2A2820").text(
      "Dit is een automatisch gegenereerd testrapport van Faculty of Human Design. " +
      "De download- en bezorgflow werkt correct als je dit bestand kunt lezen.\n\n" +
      "Geboortedata: 1 januari 1990, Amsterdam.\n\n" +
      "Human Design Type: Generator · Strategie: Wacht om te reageren · Autoriteit: Sacraal.\n\n" +
      "Dit rapport bevat geen echte analyse — het is uitsluitend bedoeld om de technische " +
      "werking van de PDF-generatie, blob-opslag en downloadlink te testen.",
      68, 60, { width: 471.28, lineGap: 3 }
    );

    doc.end();
  });
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized. Add ?secret=<ADMIN_SECRET> to the URL." });
  }

  try {
    // 1. Generate test PDF
    const pdfBuffer = await buildTestPDF();

    // 2. Upload to Vercel Blob
    const filename = `reports/test-${Date.now()}.pdf`;
    const { url: blobUrl } = await put(filename, pdfBuffer, {
      access: "public",
      contentType: "application/pdf",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // 3. Create order in Supabase
    const token = randomUUID();
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase.from("orders").insert({
      report_id: "volledig",
      report_title: "Test Rapport",
      customer_name: "Test Klant",
      customer_email: "test@facultyhd.com",
      status: "delivered",
      pdf_blob_url: blobUrl,
      download_token: token,
      delivered_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
      birth_data: { day: 1, month: 1, year: 1990, place: "Amsterdam" },
      prompt_sections: ["Test Sectie"],
    });

    if (error) throw new Error(`Supabase insert failed: ${error.message}`);

    const downloadUrl = `https://www.facultyhd.com/download/${token}`;

    return res.status(200).json({
      success: true,
      downloadUrl,
      token,
      blobUrl,
      message: "Test order aangemaakt. Klik op downloadUrl om te testen.",
    });
  } catch (e) {
    console.error("[create-test-order]", e.message);
    return res.status(500).json({ error: e.message });
  }
}
