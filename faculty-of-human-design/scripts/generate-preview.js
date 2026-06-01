#!/usr/bin/env node
// ─── PREVIEW PDF GENERATOR ────────────────────────────────────────────────────
// Generates a curated preview PDF for the volledig rapport and saves it to
// public/preview-volledig.pdf so it can be served as a static asset.
//
// Usage:
//   node scripts/generate-preview.js          # renders PDF (needs local Chrome)
//   node scripts/generate-preview.js --html   # dumps HTML only (no Chrome needed)

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");

const args   = process.argv.slice(2);
const doHTML = args.includes("--html");
const pdfOut = join(ROOT, "public", "preview-volledig.pdf");
const htmlOut = join(ROOT, "scripts", "preview-output.html");

// ── Load fixtures ─────────────────────────────────────────────────────────────
const order    = JSON.parse(readFileSync(join(__dirname, "fixtures", "preview-order.json"),    "utf8"));
const sections = JSON.parse(readFileSync(join(__dirname, "fixtures", "preview-sections.json"), "utf8"));

// ── Build bodygraph SVG ───────────────────────────────────────────────────────
const req = createRequire(import.meta.url);
const { bodygraphSVG } = req("../lib/pdf/bodygraph-svg.cjs");
const chart = (order.birth_data || {}).chart || {};
const svgBodygraph = bodygraphSVG(chart);

// ── Build HTML ────────────────────────────────────────────────────────────────
const { buildPreviewHTML } = await import("../lib/pdf/template.js");
const html = buildPreviewHTML({ order, sections, svgBodygraph });

if (doHTML) {
  writeFileSync(htmlOut, html);
  console.log(`✓ HTML saved → ${htmlOut}`);
  process.exit(0);
}

// ── Render PDF ────────────────────────────────────────────────────────────────
console.log("Rendering preview PDF…");
const { renderPDF } = await import("../lib/pdf/render.js");
const pdfBuffer = await renderPDF(html);
writeFileSync(pdfOut, pdfBuffer);

const pdfStr = pdfBuffer.toString("latin1");
const pages  = (pdfStr.match(/\/Type\s*\/Page\b/g) || []).length;
console.log(`✓ PDF rendered → ${pdfOut}  (${pages} pages)`);
