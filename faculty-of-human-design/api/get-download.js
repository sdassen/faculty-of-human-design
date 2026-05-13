import { createClient } from "@supabase/supabase-js";

// Token download link expires after 30 days
const TOKEN_EXPIRY_DAYS = 30;

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return res.status(405).end();

  // Token comes from query string: /api/get-download?token=TOKEN
  const token = req.query.token;
  if (!token || typeof token !== "string" || token.length < 10) {
    return res.status(400).send("Ongeldige downloadlink.");
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, pdf_blob_url, delivered_at, customer_name, report_title, status")
    .eq("download_token", token)
    .single();

  if (error || !order) {
    console.error("[get-download] Token lookup failed:", token, error?.message);
    return res.status(404).end();
  }

  if (order.status !== "delivered" || !order.pdf_blob_url) {
    return res.status(202).end(); // not ready yet
  }

  // Check token expiry
  const deliveredAt = new Date(order.delivered_at);
  const expiresAt = new Date(deliveredAt.getTime() + TOKEN_EXPIRY_DAYS * 86_400_000);
  if (Date.now() > expiresAt.getTime()) {
    return res.status(410).end();
  }

  // HEAD: confirm token is valid
  if (req.method === "HEAD") {
    res.setHeader("X-FHD-Status", "ready");
    res.setHeader("X-FHD-Title", order.report_title || "");
    return res.status(200).end();
  }

  // GET: stream the PDF
  try {
    const blobRes = await fetch(order.pdf_blob_url);
    if (!blobRes.ok) throw new Error(`Blob fetch failed: ${blobRes.status}`);

    const safeFilename = (order.report_title || "rapport")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const customerSlug = (order.customer_name || "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const pdfBuffer = Buffer.from(await blobRes.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}-${customerSlug}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).send(pdfBuffer);
  } catch (e) {
    console.error("[get-download] Error fetching PDF:", e.message);
    return res.status(500).end();
  }
}
