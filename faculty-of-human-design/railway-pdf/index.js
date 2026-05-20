"use strict";
const express    = require("express");
const puppeteer  = require("puppeteer-core");

const app    = express();
const PORT   = process.env.PORT || 3000;
const SECRET = process.env.PDF_SECRET || null;

app.use(express.json({ limit: "20mb" }));

// Keep one browser instance alive between requests (Railway is persistent).
let browser = null;

async function getBrowser() {
  if (browser) {
    try { await browser.version(); return browser; } catch { browser = null; }
  }
  browser = await puppeteer.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  return browser;
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/pdf", async (req, res) => {
  if (SECRET && req.headers["x-pdf-secret"] !== SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { html } = req.body || {};
  if (!html) return res.status(400).json({ error: "html field required" });

  let page;
  try {
    const b = await getBrowser();
    page = await b.newPage();

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format:            "A4",
      printBackground:   true,
      margin:            { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      preferCSSPageSize: true,
    });

    res.set("Content-Type", "application/pdf");
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error("[pdf] render error:", err.message);
    browser = null; // force browser restart on next request
    res.status(500).json({ error: err.message });
  } finally {
    if (page) await page.close().catch(() => {});
  }
});

app.listen(PORT, () => console.log(`PDF service ready on :${PORT}`));
