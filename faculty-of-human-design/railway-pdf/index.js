"use strict";
const express    = require("express");
const puppeteer  = require("puppeteer-core");
const fs         = require("fs");
const path       = require("path");
const crypto     = require("crypto");

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
      "--force-color-profile=srgb",
      "--allow-file-access-from-files",
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

  // Write HTML to a temp file so Chromium loads it via file:// (avoids CDP
  // message-size limits and ensures local file access for any relative refs).
  const tmpFile = path.join("/tmp", `report-${crypto.randomUUID()}.html`);

  let page;
  try {
    fs.writeFileSync(tmpFile, html, "utf8");

    const b = await getBrowser();
    page = await b.newPage();

    // Tell Chromium to treat this as a print context so print CSS and fonts
    // are applied before we call document.fonts.ready.
    await page.emulateMediaType("print");

    await page.goto(`file://${tmpFile}`, { waitUntil: "networkidle0", timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin:          { top: "36mm", bottom: "10mm", left: "0mm", right: "0mm" },
    });

    res.set("Content-Type", "application/pdf");
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error("[pdf] render error:", err.message);
    browser = null; // force browser restart on next request
    res.status(500).json({ error: err.message });
  } finally {
    if (page) await page.close().catch(() => {});
    try { fs.unlinkSync(tmpFile); } catch {}
  }
});

app.listen(PORT, () => console.log(`PDF service ready on :${PORT}`));
