// ─── PDF ENTRY POINT ──────────────────────────────────────────────────────────
// Ties together bodygraph-svg (CJS), template builder, and Chromium renderer.
// Drop-in replacement for the PDFKit-based index.js — same generatePDF signature.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { bodygraphSVG } = require("./bodygraph-svg.cjs");

import { buildHTML } from "./template.js";
import { renderPDF } from "./render.js";

export async function generatePDF({ order, sections }) {
  const chart = (order.birth_data || {}).chart || {};
  const hasChart = chart.type && Array.isArray(chart.definedCenters);
  const svgBodygraph = hasChart ? bodygraphSVG(chart) : null;
  const html = buildHTML({ order, sections, svgBodygraph });
  return renderPDF(html);
}
