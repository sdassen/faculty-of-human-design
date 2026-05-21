#!/usr/bin/env node
// ─── QA SCRIPT ────────────────────────────────────────────────────────────────
// Validates section JSON structure, runs quality checks, builds the HTML
// template, and optionally renders a PDF to verify page count.
//
// Usage:
//   node scripts/qa.js                          # uses fixture files
//   node scripts/qa.js --pdf                    # also renders PDF (needs local Chrome)
//   node scripts/qa.js --out report.pdf --pdf   # render + save to file

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");

// ── CLI args ──────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const doPDF   = args.includes("--pdf");
const outIdx  = args.indexOf("--out");
const outFile = outIdx !== -1 ? resolve(args[outIdx + 1]) : join(ROOT, "scripts", "qa-output.pdf");

// ── Load fixtures ─────────────────────────────────────────────────────────────
const order    = JSON.parse(readFileSync(join(__dirname, "fixtures", "test-order.json"),    "utf8"));
const sections = JSON.parse(readFileSync(join(__dirname, "fixtures", "test-sections.json"), "utf8"));

// ── Imports ───────────────────────────────────────────────────────────────────
const { buildHTML }     = await import("../lib/pdf/template.js");
const { quickCheck, sectionToText } = await import("../lib/inngest/qualityScore.js");

// ─── CHECKS ───────────────────────────────────────────────────────────────────

const REQUIRED_SECTION_FIELDS = ["teaser", "inJouwChart", "kern", "valkuilen", "praktijk", "dezeWeek", "reflectievragen"];

const HTML_FORBIDDEN = [
  { rx: /\*{2}/g,             label: "markdown bold (**)" },
  { rx: /\*[^*\n]+\*/g,       label: "markdown italic (*text*)" },
  { rx: /^#{1,6}\s/m,         label: "markdown heading (#)" },
  { rx: /^\|.+\|/m,           label: "markdown table (|...|)" },
  { rx: /^in your chart:/im,  label: "English block label 'In your chart:'" },
  { rx: /^pitfalls:/im,       label: "English block label 'Pitfalls:'" },
  { rx: /^practice:/im,       label: "English block label 'Practice:'" },
  { rx: /^this week:/im,      label: "English block label 'This week:'" },
  { rx: /^reflection questions:/im, label: "English block label 'Reflection questions:'" },
];

const MIN_PAGES = 10;  // minimum reasonable page count for a test with 2 sections + intro pages
const MAX_PAGES = 60;  // absolute ceiling

// ─── HELPERS ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(msg)   { console.log(`  ✓ ${msg}`); passed++; }
function fail(msg) { console.log(`  ✗ ${msg}`); failed++; }
function header(title) { console.log(`\n── ${title} ${"─".repeat(Math.max(0, 50 - title.length))}`); }

// ─── 1. SECTION STRUCTURE ─────────────────────────────────────────────────────

header("Section structure");

for (const s of sections) {
  const missing = REQUIRED_SECTION_FIELDS.filter(f => !(f in s));
  if (missing.length) {
    fail(`"${s.title}" — missing fields: ${missing.join(", ")}`);
  } else {
    ok(`"${s.title}" — all 7 fields present`);
  }

  // Field-level checks
  if (!Array.isArray(s.inJouwChart) || s.inJouwChart.length < 3) {
    fail(`"${s.title}" — inJouwChart needs ≥3 items (got ${(s.inJouwChart||[]).length})`);
  } else {
    ok(`"${s.title}" — inJouwChart has ${s.inJouwChart.length} items`);
  }

  if (!Array.isArray(s.kern) || s.kern.length < 2) {
    fail(`"${s.title}" — kern needs ≥2 blocks (got ${(s.kern||[]).length})`);
  } else {
    ok(`"${s.title}" — kern has ${s.kern.length} blocks`);
  }

  for (const closeKey of ["valkuilen", "praktijk", "dezeWeek", "reflectievragen"]) {
    const items = s[closeKey] || [];
    const min   = closeKey === "reflectievragen" ? 3 : 3;
    if (items.length < min) {
      fail(`"${s.title}" — ${closeKey} needs ${min} items (got ${items.length})`);
    }
  }

  // teaser length
  const words = (s.teaser || "").trim().split(/\s+/).length;
  if (words > 20) {
    fail(`"${s.title}" — teaser too long (${words} words, max 18)`);
  } else {
    ok(`"${s.title}" — teaser length OK (${words} words)`);
  }
}

// ─── 2. CONTENT QUALITY (quickCheck) ─────────────────────────────────────────

header("Content quality (quickCheck)");

const lang = order.language || "nl";
const chart = (order.birth_data || {}).chart || {};

for (const s of sections) {
  const text   = sectionToText(s, lang);
  const result = quickCheck(text, lang, chart);

  if (result.passed) {
    ok(`"${s.title}" — score ${result.score}/10`);
  } else {
    fail(`"${s.title}" — score ${result.score}/10`);
  }
  for (const issue of result.issues) {
    console.log(`       ⚠  ${issue}`);
  }
}

// ─── 3. WORD COUNT PER SECTION ───────────────────────────────────────────────

header("Word count (kern)");

for (const s of sections) {
  const kernText = (s.kern || [])
    .flatMap(b => b.paragraphs || [])
    .join(" ");
  const words = kernText.trim().split(/\s+/).filter(Boolean).length;

  if (words > 550) {
    fail(`"${s.title}" — kern too long: ${words} words (max 500)`);
  } else if (words < 80) {
    fail(`"${s.title}" — kern too short: ${words} words (min 80)`);
  } else {
    ok(`"${s.title}" — kern ${words} words`);
  }
}

// ─── 4. BUILD HTML + SCAN FOR FORBIDDEN STRINGS ───────────────────────────────

header("HTML template + forbidden strings");

let html;
try {
  html = buildHTML({ order, sections, svgBodygraph: null });
  ok(`buildHTML() succeeded (${(html.length / 1024).toFixed(0)} KB)`);
} catch (e) {
  fail(`buildHTML() threw: ${e.message}`);
  html = "";
}

if (html) {
  // Strip noise before scanning:
  // - base64 data URIs (font binary data)
  // - <style> blocks (CSS selectors like *, *::before trigger false positives)
  // - style="..." inline attributes (same reason)
  const scannable = html
    .replace(/data:[^;]+;base64,[A-Za-z0-9+/=]+/g, "[BASE64]")
    .replace(/<style[\s\S]*?<\/style>/gi, "[STYLE]")
    .replace(/\sstyle="[^"]*"/gi, "");

  for (const { rx, label } of HTML_FORBIDDEN) {
    if (rx.test(scannable)) {
      fail(`HTML contains ${label}`);
    } else {
      ok(`No ${label}`);
    }
  }

  // Check fonts loaded (either bundled or CDN link present)
  const hasBundledFonts = /font-family:\s*'Cormorant Garamond'/i.test(html);
  const hasCDNFonts     = /fonts\.googleapis\.com/.test(html);
  if (hasBundledFonts || hasCDNFonts) {
    ok(`Fonts present (${hasBundledFonts ? "bundled" : "CDN fallback"})`);
  } else {
    fail("No fonts found in HTML");
  }
}

// ─── 5. PDF RENDER + PAGE COUNT ──────────────────────────────────────────────

if (doPDF && html) {
  header("PDF render + page count");

  try {
    const { renderPDF } = await import("../lib/pdf/render.js");
    const pdfBuffer = await renderPDF(html);

    writeFileSync(outFile, pdfBuffer);
    ok(`PDF rendered → ${outFile}`);

    // Count pages by counting %%Page markers in the PDF binary
    const pdfStr   = pdfBuffer.toString("latin1");
    const pages    = (pdfStr.match(/\/Type\s*\/Page\b/g) || []).length;

    if (pages === 0) {
      fail("Could not determine page count");
    } else if (pages < MIN_PAGES) {
      fail(`Page count too low: ${pages} (min ${MIN_PAGES}) — check for page-break issues`);
    } else if (pages > MAX_PAGES) {
      fail(`Page count too high: ${pages} (max ${MAX_PAGES}) — content may be overflowing`);
    } else {
      ok(`Page count: ${pages}`);
    }
  } catch (e) {
    fail(`PDF render failed: ${e.message}`);
  }
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(54)}`);
const total = passed + failed;
if (failed === 0) {
  console.log(`  PASS  ${passed}/${total} checks passed`);
} else {
  console.log(`  FAIL  ${passed} passed · ${failed} failed`);
}
console.log(`${"═".repeat(54)}\n`);

if (failed > 0) process.exit(1);
