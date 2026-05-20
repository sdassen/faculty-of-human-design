// ─── CHROMIUM PDF RENDERER ────────────────────────────────────────────────────
// Uses @sparticuz/chromium on Vercel, local Chrome for dev.
// Receives a full HTML string, returns a PDF Buffer.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export async function renderPDF(html) {
  let browser;

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const chromium  = require("@sparticuz/chromium");
    const puppeteer = require("puppeteer-core");
    browser = await puppeteer.launch({
      args:            chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:  await chromium.executablePath(),
      headless:        chromium.headless,
    });
  } else {
    const puppeteer = require("puppeteer-core");
    // Local dev: use system Chrome. Override with CHROMIUM_PATH env var if needed.
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

    // Wait for fonts and images to load before rendering
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 45000 });

    // Ensure custom fonts are fully loaded
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin:          { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
