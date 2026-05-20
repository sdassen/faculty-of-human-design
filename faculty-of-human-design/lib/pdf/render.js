// ─── CHROMIUM PDF RENDERER ────────────────────────────────────────────────────
// On Vercel: connects to Browserless managed Chrome (requires BROWSERLESS_TOKEN env var).
// Local dev: launches system Chrome directly.
// Receives a full HTML string, returns a PDF Buffer.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export async function renderPDF(html) {
  const puppeteer = require("puppeteer-core");
  let browser;

  if (process.env.VERCEL || process.env.BROWSERLESS_TOKEN) {
    const token = process.env.BROWSERLESS_TOKEN;
    if (!token) throw new Error("BROWSERLESS_TOKEN env var is required on Vercel");
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${token}`,
    });
  } else {
    const executablePath =
      process.env.CHROMIUM_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    browser = await puppeteer.launch({
      executablePath,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format:            "A4",
      printBackground:   true,
      margin:            { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
