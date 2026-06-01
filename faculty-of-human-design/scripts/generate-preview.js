#!/usr/bin/env node
// ─── PREVIEW PDF GENERATOR ────────────────────────────────────────────────────
// Generates curated preview PDFs (NL + EN) for the volledig rapport and saves
// them to public/ so they can be served as static assets.
//
// Usage:
//   node scripts/generate-preview.js          # renders both PDFs (needs local Chrome)
//   node scripts/generate-preview.js --html   # dumps HTML only (no Chrome needed)
//   node scripts/generate-preview.js --nl     # NL only
//   node scripts/generate-preview.js --en     # EN only

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");

const args   = process.argv.slice(2);
const doHTML = args.includes("--html");
const onlyNL = args.includes("--nl");
const onlyEN = args.includes("--en");
const doNL   = !onlyEN;
const doEN   = !onlyNL;

const req = createRequire(import.meta.url);
const { bodygraphSVG } = req("../lib/pdf/bodygraph-svg.cjs");
const { buildPreviewHTML } = await import("../lib/pdf/template.js");

async function generate(lang) {
  const suffix   = lang === "en" ? "-en" : "";
  const orderFile    = lang === "en" ? "preview-order-en.json"    : "preview-order.json";
  const sectionsFile = lang === "en" ? "preview-sections-en.json" : "preview-sections.json";

  const order    = JSON.parse(readFileSync(join(__dirname, "fixtures", orderFile),    "utf8"));
  const sections = JSON.parse(readFileSync(join(__dirname, "fixtures", sectionsFile), "utf8"));
  const chart    = (order.birth_data || {}).chart || {};
  const svgBodygraph = bodygraphSVG(chart);
  const html = buildPreviewHTML({ order, sections, svgBodygraph });

  if (doHTML) {
    const htmlOut = join(ROOT, "scripts", `preview-output${suffix}.html`);
    writeFileSync(htmlOut, html);
    console.log(`✓ HTML saved → ${htmlOut}`);
    return;
  }

  const pdfOut = join(ROOT, "public", `preview-volledig${suffix}.pdf`);
  console.log(`Rendering ${lang.toUpperCase()} preview PDF…`);
  const { renderPDF } = await import("../lib/pdf/render.js");
  const pdfBuffer = await renderPDF(html);
  writeFileSync(pdfOut, pdfBuffer);
  const pages = (pdfBuffer.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  console.log(`✓ PDF rendered → ${pdfOut}  (${pages} pages)`);
}

if (doNL) await generate("nl");
if (doEN) await generate("en");
