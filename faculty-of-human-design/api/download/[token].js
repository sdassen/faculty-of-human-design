import { createClient } from "@supabase/supabase-js";
import { head, del } from "@vercel/blob";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Token download link expires after 30 days
const TOKEN_EXPIRY_DAYS = 30;

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return res.status(405).end();

  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).send("Ongeldige downloadlink.");
  }

  // Look up the order by download token
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, pdf_blob_url, delivered_at, customer_name, report_title, status")
    .eq("download_token", token)
    .single();

  if (error || !order) {
    return res.status(404).send(notFoundPage());
  }

  if (order.status !== "delivered" || !order.pdf_blob_url) {
    return res.status(404).send(notReadyPage(order.report_title));
  }

  // Check token expiry
  const deliveredAt = new Date(order.delivered_at);
  const expiresAt = new Date(deliveredAt.getTime() + TOKEN_EXPIRY_DAYS * 86_400_000);
  if (Date.now() > expiresAt.getTime()) {
    return res.status(410).send(expiredPage());
  }

  // HEAD request: just confirm the token is valid, don't stream the file
  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  // GET: fetch the full PDF buffer and send it in one response
  try {
    const blobRes = await fetch(order.pdf_blob_url);

    if (!blobRes.ok) {
      throw new Error(`Blob fetch failed: ${blobRes.status}`);
    }

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
    console.error("[download] Error fetching PDF:", e.message);
    return res.status(500).send("Er is een fout opgetreden. Probeer het opnieuw of neem contact op.");
  }
}

// ─── HTML FALLBACK PAGES ──────────────────────────────────────────────────────
function shell(title, body) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Faculty of Human Design</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #F7F5F0;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: white; border-radius: 16px; padding: 52px 48px; max-width: 480px;
            text-align: center; box-shadow: 0 8px 40px rgba(0,0,0,.07); }
    .ico { font-size: 2.2rem; margin-bottom: 20px; }
    h1 { font-size: 1.5rem; font-weight: 300; color: #1A1715; margin-bottom: 14px;
         font-family: Georgia, serif; }
    p { font-size: .9rem; color: #777; line-height: 1.7; margin-bottom: 10px; }
    a { color: #3D2C5E; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`;
}

function notFoundPage() {
  return shell("Niet gevonden", `
    <div class="ico">✦</div>
    <h1>Link niet gevonden</h1>
    <p>Deze downloadlink bestaat niet of is al verwijderd.</p>
    <p>Heb je vragen? Stuur een bericht naar
      <a href="mailto:info@facultyhd.com">info@facultyhd.com</a>.</p>
  `);
}

function notReadyPage(title) {
  return shell("Rapport in behandeling", `
    <div class="ico">◎</div>
    <h1>${title || "Jouw rapport"} is in behandeling</h1>
    <p>We zijn bezig met het samenstellen van je persoonlijke blauwdruk.
       Je ontvangt een e-mail zodra het klaar staat.</p>
    <p>Verwachte levering: binnen 1 werkdag.</p>
  `);
}

function expiredPage() {
  return shell("Link verlopen", `
    <div class="ico">◇</div>
    <h1>Downloadlink verlopen</h1>
    <p>Deze link is ouder dan 30 dagen en niet meer geldig.</p>
    <p>Neem contact op via
      <a href="mailto:info@facultyhd.com">info@facultyhd.com</a>
      — wij sturen je een nieuwe link.</p>
  `);
}
