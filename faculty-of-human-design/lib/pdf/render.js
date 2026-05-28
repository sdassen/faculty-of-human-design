// ─── PDF RENDERER ─────────────────────────────────────────────────────────────
// On Vercel: delegates to Railway PDF microservice via HTTP (PDF_SERVICE_URL).
// Local dev: launches system Chrome directly via puppeteer-core.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export async function renderPDF(html) {
  // ── Vercel / production: call the Railway microservice
  if (process.env.PDF_SERVICE_URL) {
    const res = await fetch(`${process.env.PDF_SERVICE_URL}/pdf`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        ...(process.env.PDF_SECRET ? { "x-pdf-secret": process.env.PDF_SECRET } : {}),
      },
      body: JSON.stringify({ html }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`PDF service ${res.status}: ${msg}`);
    }

    return Buffer.from(await res.arrayBuffer());
  }

  // ── Local dev: system Chrome
  const puppeteer = require("puppeteer-core");
  const executablePath =
    process.env.CHROMIUM_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.emulateMediaType("print");
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin:          { top: "28mm", bottom: "10mm", left: "0mm", right: "0mm" },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
