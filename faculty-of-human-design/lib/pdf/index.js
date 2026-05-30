// ─── PDF ENTRY POINT ──────────────────────────────────────────────────────────
// Ties together bodygraph-svg (CJS), template builder, and Chromium renderer.
// Drop-in replacement for the PDFKit-based index.js — same generatePDF signature.
import { createRequire } from "module";

import { buildHTML } from "./template.js";
import { renderPDF } from "./render.js";

// Lazy — required inside generatePDF so a missing .cjs file surfaces as a
// step-level error in Inngest rather than crashing the module on cold start.
let _bodygraphSVG = null;
function getBodygraphSVG() {
  if (!_bodygraphSVG) {
    const req = createRequire(import.meta.url);
    _bodygraphSVG = req("./bodygraph-svg.cjs").bodygraphSVG;
  }
  return _bodygraphSVG;
}

export async function generatePDF({ order, sections }) {
  const bodygraphSVG = getBodygraphSVG();

  // Main (requester / parent) bodygraph
  const chart = (order.birth_data || {}).chart || {};
  const hasChart = chart.type && Array.isArray(chart.definedCenters);
  const svgBodygraph = hasChart ? bodygraphSVG(chart) : null;

  // Partner / child bodygraph (used for child reports & relatie reports)
  const partnerChart = (order.partner_birth_data || {}).chart || {};
  const hasPartnerChart = partnerChart.type && Array.isArray(partnerChart.definedCenters);
  const svgPartnerBodygraph = hasPartnerChart ? bodygraphSVG(partnerChart) : null;

  const html = buildHTML({ order, sections, svgBodygraph, svgPartnerBodygraph });
  return renderPDF(html);
}
