// ─── HTML TEMPLATE BUILDER ────────────────────────────────────────────────────
// Produces a full A4 HTML document from order + sections + bodygraph SVG.
// Designed for Puppeteer/Chromium rendering — all styles inline, print-optimised.

import { buildFontCSS } from "./fonts.js";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function ui(lang, nl, en) { return lang === "en" ? en : nl; }

function stripMd(text) {
  if (!text) return "";
  return text
    .replace(/\*{3}([\s\S]*?)\*{3}/g, "$1")
    .replace(/\*{2}([\s\S]*?)\*{2}/g, "$1")
    .replace(/\*([\s\S]*?)\*/g, "$1")
    .replace(/_([\s\S]*?)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/^[*\-–—]\s+/gm, "")
    .replace(/\*+$/gm, "")
    .trim();
}

function cleanSectionText(text, title) {
  if (!text || !title) return text || "";
  const stripped = stripMd(text);
  const esc2 = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return stripped.replace(new RegExp("^\\s*" + esc2 + "\\s*\\n?", "i"), "").trim();
}

function extractPullQuote(text, maxLen) {
  maxLen = maxLen || 120;
  if (!text) return "";
  const withoutBlock = text.replace(/^in (jouw|your) chart:[\s\S]*?\n\n/im, "").trim();
  const m = withoutBlock.match(/[^.\n]{20,}[.]/);
  if (!m) return "";
  const s = m[0].replace(/^[^\w]+/, "").trim();
  if (s.length < 24) return "";
  return s.length > maxLen ? s.slice(0, maxLen - 1).trimEnd() + "…" : s;
}

// ─── BLOCK DEFINITIONS ───────────────────────────────────────────────────────
const BLOCKS = [
  { key: "chart", labels: ["In jouw chart", "In your chart"],        tint: "#E8EDF5", accent: "#1C2E4A" },
  { key: "val",   labels: ["Valkuilen",      "Pitfalls"],             tint: "#FBF2E4", accent: "#B8862A" },
  { key: "prakt", labels: ["Praktijk",       "Practice"],             tint: "#E8F2EB", accent: "#3A6848" },
  { key: "week",  labels: ["Deze week",      "This week"],            tint: "#EDE8F5", accent: "#3D2C5E" },
  { key: "refl",  labels: ["Reflectievragen","Reflection questions"], tint: "#F0EDE4", accent: "#7A6030" },
];
const CLOSING_KEYS = new Set(["val", "prakt", "week", "refl"]);

function matchBlock(line) {
  return BLOCKS.find(function(b) {
    return b.labels.some(function(lbl) {
      return line.trim().toLowerCase().startsWith(lbl.toLowerCase() + ":")
          || line.trim().toLowerCase() === lbl.toLowerCase();
    });
  });
}

// ─── SECTION TEXT PARSER ─────────────────────────────────────────────────────
// Returns { chartBlock, prose, closingBlocks }
function parseSection(text) {
  const lines = (text || "").split("\n");
  let chartBlock = null;
  const closingBlocks = {};
  const proseLines = [];
  let current = null;
  let bulletsSeen = 0;
  let chartClosed = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const block = matchBlock(line);

    if (block) {
      if (current && current.key !== "chart") {
        closingBlocks[current.key] = { ...current };
      } else if (current && current.key === "chart") {
        chartBlock = { ...current };
        chartClosed = true;
      }
      current = { key: block.key, block, lines: [] };
      bulletsSeen = 0;
      continue;
    }

    if (!current) {
      if (!chartClosed) proseLines.push(line);
      else proseLines.push(line);
      continue;
    }

    // Auto-close chart block after ≥3 bullets + blank line
    if (current.key === "chart") {
      if (/^\s*[•\-–—*]/.test(line)) bulletsSeen++;
      if (line.trim() === "" && bulletsSeen >= 3) {
        chartBlock = { ...current };
        chartClosed = true;
        current = null;
        continue;
      }
    }

    current.lines.push(line);
  }

  // Flush last block
  if (current) {
    if (current.key === "chart") chartBlock = { ...current };
    else closingBlocks[current.key] = { ...current };
  }

  return { chartBlock, prose: proseLines.join("\n"), closingBlocks };
}

// ─── TYPE COLOR ───────────────────────────────────────────────────────────────
function typeAccent(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("manifesting generator") || t.includes("manifesterend generator"))
    return { bg: "#2A1F0A", fg: "#E8B060", bar: "#D4956A" };
  if (t.includes("generator"))  return { bg: "#1E1A08", fg: "#C9A85C", bar: "#C9A85C" };
  if (t.includes("projector"))  return { bg: "#0A1220", fg: "#8AAAD4", bar: "#3D5A8A" };
  if (t.includes("manifestor") || t.includes("manifesteerder"))
    return { bg: "#1A0A14", fg: "#C88AAA", bar: "#8A3D5A" };
  if (t.includes("reflector"))  return { bg: "#0E1818", fg: "#8ABABA", bar: "#3D7A7A" };
  return { bg: "#1A1715", fg: "#C9A85C", bar: "#C9A85C" };
}

// ─── BLOCK HTML ───────────────────────────────────────────────────────────────
function blockHTML(blockDef, lines, half) {
  const items = lines
    .map(function(l) { return stripMd(l.replace(/^[•\-–—*]\s*/, "").replace(/^\d+\.\s*/, "")); })
    .filter(Boolean);
  if (!items.length) return "";

  const isRefl = blockDef.key === "refl";
  const tint   = blockDef.tint;
  const accent = blockDef.accent;
  const label  = blockDef.labels[0];
  const fontSize = half ? "9pt" : "10pt";
  const padding  = half ? "14px 16px 16px" : "18px 20px 20px";

  const itemsHTML = items.map(function(item, i) {
    const prefix = isRefl
      ? `<span style="font-weight:500;color:${accent};min-width:18px;display:inline-block;">${i + 1}.</span>`
      : `<span style="font-weight:500;color:${accent};min-width:14px;display:inline-block;">•</span>`;
    return `<div style="display:flex;gap:6px;margin-bottom:${isRefl ? "10px" : "7px"};line-height:1.55;">
      ${prefix}
      <span>${esc(item)}</span>
    </div>`;
  }).join("");

  return `<div style="background:${tint};border-left:5px solid ${accent};padding:${padding};break-inside:avoid;">
    <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:${half ? "11pt" : "13pt"};color:${accent};margin-bottom:10px;letter-spacing:0.01em;">${esc(label)}</div>
    <div style="font-family:'Inter',sans-serif;font-size:${fontSize};color:#2A2820;">${itemsHTML}</div>
  </div>`;
}

// ─── PROSE HTML ───────────────────────────────────────────────────────────────
function proseHTML(text) {
  if (!text || !text.trim()) return "";
  const paras = text
    .split(/\n\n+|\n(?=[A-ZÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ][^\n]{2,60}(?:\n|$)(?![•\-–\d]))/u)
    .map(function(p) { return stripMd(p.trim()); })
    .filter(Boolean);

  return paras.map(function(para) {
    const isSubhead =
      para.length <= 80
      && !para.endsWith(".") && !para.endsWith("?") && !para.endsWith("!")
      && !para.endsWith(",") && !para.endsWith(":")
      && para.length > 3
      && para[0] === para[0].toUpperCase()
      && !para.startsWith("•") && !para.startsWith("-")
      && !/^\d+\./.test(para)
      && !para.includes(". ")
      && para.split(/\s+/).length <= 10;

    if (isSubhead) {
      return `<h3 style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:14pt;color:#1C2E4A;margin:18px 0 6px;break-after:avoid;line-height:1.3;">${esc(para)}<span style="display:block;width:24px;height:0.75px;background:#C9A85C;margin-top:5px;"></span></h3>`;
    }
    return `<p style="font-family:'Inter',sans-serif;font-size:11pt;line-height:1.72;color:#2A2820;margin-bottom:13px;break-inside:avoid;">${esc(para)}</p>`;
  }).join("");
}

// ─── GEOMETRIC DECORATION (concentric circles, cover) ────────────────────────
function coverDecoration(cx, cy) {
  const rings = [
    { r: 205, op: 0.04 }, { r: 162, op: 0.06 }, { r: 118, op: 0.08 },
    { r: 76, op: 0.12 }, { r: 40, op: 0.18 },
  ];
  const ringsSVG = rings.map(function(ring) {
    return `<circle cx="${cx}" cy="${cy}" r="${ring.r}" fill="none" stroke="#C9A85C" stroke-width="0.4" opacity="${ring.op}"/>`;
  }).join("\n");
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const dotsSVG = angles.map(function(deg) {
    const rad = (deg * Math.PI) / 180;
    const nx = cx + Math.cos(rad) * 76;
    const ny = cy + Math.sin(rad) * 76;
    return `<circle cx="${nx}" cy="${ny}" r="2.5" fill="#C9A85C" opacity="0.18"/>`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;" viewBox="0 0 595 842">
    ${ringsSVG}
    <line x1="${cx - 205}" y1="${cy}" x2="${cx + 205}" y2="${cy}" stroke="#C9A85C" stroke-width="0.3" opacity="0.04"/>
    <line x1="${cx}" y1="${cy - 205}" x2="${cx}" y2="${cy + 205}" stroke="#C9A85C" stroke-width="0.3" opacity="0.04"/>
    ${dotsSVG}
    <circle cx="${cx}" cy="${cy}" r="4" fill="#C9A85C" opacity="0.28"/>
  </svg>`;
}

// ─── PAGE: COVER ──────────────────────────────────────────────────────────────
function buildCoverPage(order) {
  const bd    = order.birth_data || {};
  const chart = bd.chart || {};
  const lang  = order.language || "nl";
  const ta    = typeAccent(chart.type);
  const dateStr = bd.day ? `${bd.day} ${["","jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"][parseInt(bd.month)] || bd.month} ${bd.year}` : "";

  return `
<div style="width:210mm;height:285mm;background:#1A1715;position:relative;overflow:hidden;break-after:page;display:flex;flex-direction:column;align-items:center;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:#C9A85C;"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:#C9A85C;"></div>
  ${coverDecoration(297, 290)}
  <div style="position:absolute;top:28px;left:0;right:0;text-align:center;font-family:'Inter',sans-serif;font-size:6pt;font-weight:300;color:#5A5438;letter-spacing:0.3em;text-transform:uppercase;">
    ${ui(lang, "Faculty of Human Design  ·  Ibiza  ·  Est. 2014", "Faculty of Human Design  ·  Ibiza  ·  Est. 2014")}
  </div>
  <div style="margin-top:108px;padding:0 30mm;text-align:center;">
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:34pt;color:#FFFFFF;line-height:1.25;letter-spacing:-0.01em;">${esc(order.report_title || "Volledig Human Design Rapport")}</div>
    <div style="width:72px;height:1px;background:#C9A85C;margin:20px auto;opacity:0.6;"></div>
    ${order.customer_name ? `<div style="font-family:'Inter',sans-serif;font-weight:300;font-size:11pt;color:#C9A85C;letter-spacing:0.12em;text-transform:uppercase;margin-top:4px;">${esc(order.customer_name)}</div>` : ""}
    ${dateStr ? `<div style="font-family:'Inter',sans-serif;font-weight:300;font-size:8.5pt;color:#9A8050;margin-top:8px;letter-spacing:0.04em;">${esc(dateStr)}${bd.place ? "  ·  " + esc(bd.place) : ""}</div>` : ""}
  </div>
  ${chart.type ? `
  <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;">
    <div style="display:inline-block;background:${ta.bg};border:1px solid ${ta.bar};padding:7px 22px;border-radius:2px;">
      <span style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:${ta.fg};letter-spacing:0.18em;text-transform:uppercase;">${esc(chart.type)}</span>
    </div>
  </div>` : ""}
  <div style="position:absolute;bottom:28px;left:0;right:0;text-align:center;font-family:'Inter',sans-serif;font-size:6pt;font-weight:300;color:#3A3830;letter-spacing:0.2em;">
    © 2026 FACULTY OF HUMAN DESIGN
  </div>
</div>`;
}

// ─── PAGE: TABLE OF CONTENTS ──────────────────────────────────────────────────
function buildTOCPage(sections, order) {
  const lang = order.language || "nl";
  const tocLabel = ui(lang, "INHOUD", "CONTENTS");
  const items = sections.map(function(s, i) {
    return `<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:0.4px solid #E5E0D8;">
      <span style="font-family:'Cormorant Garamond',serif;font-weight:400;font-size:11pt;color:#C9A85C;min-width:28px;">${String(i + 1).padStart(2, "0")}</span>
      <span style="flex:1;height:0.4px;background:#E5E0D8;max-width:0;"></span>
      <span style="font-family:'Inter',sans-serif;font-size:10pt;font-weight:400;color:#2A2820;flex:1;letter-spacing:0.01em;">${esc(s.title)}</span>
    </div>`;
  }).join("");

  return `
<div style="width:210mm;height:285mm;background:#F7F5F0;position:relative;overflow:hidden;break-after:page;padding:20mm;">
  <div style="height:2px;background:#1A1715;margin-bottom:3px;"></div>
  <div style="height:0.5px;background:#C9A85C;margin-bottom:32px;"></div>
  <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#C9A85C;letter-spacing:0.25em;margin-bottom:16px;">${tocLabel}</div>
  <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:28pt;font-weight:400;color:#1A1715;margin-bottom:28px;line-height:1.1;">${esc(order.report_title || "Volledig Human Design Rapport")}</div>
  ${items}
  <div style="position:absolute;bottom:20mm;left:20mm;right:20mm;">
    <div style="height:0.5px;background:#E5E0D8;margin-bottom:10px;"></div>
    <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:300;color:#A8A29E;">Faculty of Human Design  ·  Ibiza</div>
  </div>
</div>`;
}

// ─── PAGE: PROFILE SUMMARY ────────────────────────────────────────────────────
function buildProfilePage(order) {
  const bd    = order.birth_data || {};
  const chart = bd.chart || {};
  const lang  = order.language || "nl";
  const ta    = typeAccent(chart.type);

  const keyData = [
    chart.type    ? { label: ui(lang, "Type",        "Type"),        value: chart.type }    : null,
    chart.strat   ? { label: ui(lang, "Strategie",   "Strategy"),    value: chart.strat }   : null,
    chart.auth    ? { label: ui(lang, "Autoriteit",  "Authority"),   value: chart.auth }    : null,
    chart.profile ? { label: ui(lang, "Profiel",     "Profile"),     value: chart.profile } : null,
    chart.sig     ? { label: ui(lang, "Signatuur",   "Signature"),   value: chart.sig }     : null,
    chart.notSelf ? { label: "Not-Self",                              value: chart.notSelf } : null,
    chart.cross   ? { label: ui(lang, "Inkarnatie-Kruis", "Incarnation Cross"), value: chart.cross } : null,
  ].filter(Boolean);

  const dataGrid = keyData.map(function(it) {
    return `<div style="padding:10px 0;border-bottom:0.4px solid #E5E0D8;">
      <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">${esc(it.label)}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:13pt;font-weight:600;color:#1A1715;">${esc(it.value)}</div>
    </div>`;
  }).join("");

  const channels = (chart.channels || []).slice(0, 12).map(function(ch) {
    return `<div style="font-family:'Inter',sans-serif;font-size:8pt;color:#6B6560;padding:3px 0;border-bottom:0.3px solid #F0EDE6;">${esc(ch.g1 + "–" + ch.g2)}<span style="color:#A8A29E;font-size:7pt;margin-left:6px;">${esc(ch.c1 + " ↔ " + ch.c2)}</span></div>`;
  }).join("");

  const definedCenters = (chart.definedCenters || []).join("  ·  ");

  return `
<div style="width:210mm;height:285mm;background:#F7F5F0;position:relative;overflow:hidden;break-after:page;">
  <div style="height:70mm;background:${ta.bg};position:relative;overflow:hidden;">
    <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${ta.bar};"></div>
    <div style="padding:20mm 20mm 0 24mm;">
      <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:${ta.fg};letter-spacing:0.22em;opacity:0.7;text-transform:uppercase;margin-bottom:8px;">${ui(lang, "JOUW HUMAN DESIGN", "YOUR HUMAN DESIGN")}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:32pt;font-weight:400;color:#FFFFFF;line-height:1.1;">${esc(chart.type || "")}</div>
      ${chart.profile ? `<div style="font-family:'Inter',sans-serif;font-size:9pt;font-weight:300;color:${ta.fg};opacity:0.75;margin-top:8px;">${ui(lang, "Profiel", "Profile")} ${esc(chart.profile)}</div>` : ""}
    </div>
  </div>
  <div style="padding:8mm 20mm 0;display:grid;grid-template-columns:1fr 1fr;gap:0 24px;">
    ${dataGrid}
  </div>
  ${channels ? `<div style="padding:6mm 20mm 0;">
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">${ui(lang, "ACTIEVE KANALEN", "ACTIVE CHANNELS")}</div>
    ${channels}
  </div>` : ""}
  ${definedCenters ? `<div style="padding:5mm 20mm 0;">
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">${ui(lang, "GEDEFINIEERDE CENTRA", "DEFINED CENTERS")}</div>
    <div style="font-family:'Inter',sans-serif;font-size:8pt;color:#6B6560;">${esc(definedCenters)}</div>
  </div>` : ""}
  <div style="position:absolute;bottom:10mm;left:20mm;right:20mm;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">${esc(order.report_title || "")}</div>
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">Faculty of Human Design</div>
  </div>
</div>`;
}

// ─── PAGE: BODYGRAPH ──────────────────────────────────────────────────────────
function buildBodygraphPage(svgBodygraph, order) {
  const lang = order.language || "nl";

  return `
<div style="width:210mm;height:285mm;background:#FFFFFF;position:relative;overflow:hidden;break-after:page;padding:0 20mm;">
  <div style="height:4px;background:#1A1715;"></div>
  <div style="padding-top:10px;margin-bottom:4px;">
    <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#C9A85C;letter-spacing:0.22em;text-transform:uppercase;">${ui(lang, "JOUW BODYGRAPH", "YOUR BODYGRAPH")}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:16pt;color:#1A1715;margin-top:3px;">${ui(lang, "Het visuele kaartwerk van jouw ontwerp", "The visual map of your design")}</div>
    <div style="width:48px;height:1px;background:#C9A85C;margin-top:6px;"></div>
  </div>
  <div style="display:flex;justify-content:center;margin-top:4px;">
    <div style="width:170mm;aspect-ratio:360/500;">${svgBodygraph}</div>
  </div>
  <div style="position:absolute;bottom:10mm;left:20mm;right:20mm;">
    <div style="height:0.5px;background:#E5E0D8;margin-bottom:8px;"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">${esc(order.report_title || "")}</div>
      <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">Faculty of Human Design</div>
    </div>
  </div>
</div>`;
}

// ─── PAGE: SECTION ────────────────────────────────────────────────────────────
// Shared header+closing shell used by both JSON and legacy text paths.
function sectionHeaderHTML(section, idx, order, pullQuote, chartBlockHTML, contentHTML) {
  const lang      = order.language || "nl";
  const partLabel = ui(lang, "ONDERDEEL", "PART") + "  " + String(idx + 1).padStart(2, "0");
  return `
<div style="break-before:page;">
  <div style="height:55mm;background:#1A1715;position:relative;overflow:hidden;">
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:#C9A85C;"></div>
    <div style="position:absolute;right:16mm;top:0;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:72pt;font-weight:400;color:#C9A85C;opacity:0.05;line-height:1;padding-top:2mm;">${String(idx + 1).padStart(2, "0")}</div>
    <div style="padding:10mm 16mm 0 20mm;">
      <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#9A8050;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:6px;">${esc(partLabel)}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:28pt;color:#FFFFFF;line-height:1.15;max-width:150mm;">${esc(section.title)}</div>
      <div style="display:flex;align-items:center;gap:0;margin-top:8px;">
        <div style="width:40px;height:0.75px;background:#C9A85C;"></div>
        <div style="width:20px;height:0.4px;background:#C9A85C;opacity:0.35;"></div>
      </div>
      ${pullQuote ? `<div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:9.5pt;color:#C9A85C;opacity:0.45;margin-top:7px;max-width:145mm;line-height:1.4;">${esc(pullQuote)}</div>` : ""}
    </div>
  </div>
  <div style="height:1px;background:#E5E0D8;"></div>
  <div style="padding:6mm 20mm 0;">
    ${chartBlockHTML}
    ${contentHTML}
  </div>
</div>`;
}

function sectionClosingHTML(section, idx, order, gridHTML) {
  const lang      = order.language || "nl";
  const partLabel = ui(lang, "ONDERDEEL", "PART") + "  " + String(idx + 1).padStart(2, "0");
  return `
<div style="height:285mm;background:#F7F5F0;position:relative;overflow:hidden;break-before:page;break-after:page;">
  <div style="height:40mm;background:#1A1715;position:relative;">
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:#C9A85C;"></div>
    <div style="padding:9mm 16mm 0 20mm;">
      <div style="font-family:'Inter',sans-serif;font-size:6pt;font-weight:500;color:#9A8050;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:5px;">${esc(partLabel)}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:14pt;color:#FFFFFF;max-width:120mm;">${esc(section.title)}</div>
    </div>
    <div style="position:absolute;right:20mm;top:12mm;font-family:'Inter',sans-serif;font-size:6pt;font-weight:300;color:#C9A85C;letter-spacing:0.15em;text-transform:uppercase;">${ui(lang, "INZICHTEN & PRAKTIJK", "INSIGHTS & PRACTICE")}</div>
  </div>
  <div style="padding:6mm 20mm 0;">${gridHTML}</div>
  <div style="position:absolute;bottom:10mm;left:20mm;right:20mm;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">${esc(order.report_title || "")}</div>
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">Faculty of Human Design</div>
  </div>
</div>`;
}

// JSON path — section has structured fields (inJouwChart, kern, valkuilen, etc.)
function buildSectionPagesJSON(section, idx, order) {
  const lang = order.language || "nl";

  // ── Pull quote (teaser field) ───────────────────────────────────────────
  const pullQuote = section.teaser || "";

  // ── "In jouw chart" block ───────────────────────────────────────────────
  const chartBlockDef = BLOCKS.find(function(b) { return b.key === "chart"; });
  const chartLabel    = ui(lang, "In jouw chart", "In your chart");
  const chartItems    = (section.inJouwChart || []).filter(Boolean);
  const chartBlockHTML = chartItems.length
    ? `<div style="background:${chartBlockDef.tint};border-left:5px solid ${chartBlockDef.accent};padding:18px 20px 20px;break-inside:avoid;margin-bottom:4px;">
        <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:13pt;color:${chartBlockDef.accent};margin-bottom:10px;letter-spacing:0.01em;">${esc(chartLabel)}</div>
        <div style="font-family:'Inter',sans-serif;font-size:10pt;color:#2A2820;">
          ${chartItems.map(function(item) {
            return `<div style="display:flex;gap:6px;margin-bottom:7px;line-height:1.55;">
              <span style="font-weight:500;color:${chartBlockDef.accent};min-width:14px;display:inline-block;">•</span>
              <span>${esc(item)}</span>
            </div>`;
          }).join("")}
        </div>
      </div>`
    : "";

  // ── Kern (subheadings + paragraphs) ────────────────────────────────────
  const kernHTML = (section.kern || []).map(function(block) {
    const subkop = (block.subkop || "").trim();
    const paras  = (block.paragraphs || []).filter(Boolean);
    const subkopHTML = subkop
      ? `<h3 style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:14pt;color:#1C2E4A;margin:18px 0 6px;break-after:avoid;line-height:1.3;">${esc(subkop)}<span style="display:block;width:24px;height:0.75px;background:#C9A85C;margin-top:5px;"></span></h3>`
      : "";
    const parasHTML = paras.map(function(p) {
      return `<p style="font-family:'Inter',sans-serif;font-size:11pt;line-height:1.72;color:#2A2820;margin-bottom:13px;break-inside:avoid;">${esc(p)}</p>`;
    }).join("");
    return subkopHTML + parasHTML;
  }).join("");

  const headerPage = sectionHeaderHTML(section, idx, order, pullQuote, chartBlockHTML, kernHTML);

  // ── Closing blocks grid ─────────────────────────────────────────────────
  const closingDefs = [
    { key: "valkuilen",       blockKey: "val"  },
    { key: "praktijk",        blockKey: "prakt" },
    { key: "dezeWeek",        blockKey: "week"  },
    { key: "reflectievragen", blockKey: "refl"  },
  ];
  const closingPairs = [];
  for (let i = 0; i < closingDefs.length; i += 2) {
    closingPairs.push([closingDefs[i], closingDefs[i + 1]]);
  }

  const gridHTML = closingPairs.map(function(pair) {
    const left  = pair[0] ? blockHTML(BLOCKS.find(function(b) { return b.key === pair[0].blockKey; }), section[pair[0].key] || [], true) : "";
    const right = pair[1] ? blockHTML(BLOCKS.find(function(b) { return b.key === pair[1].blockKey; }), section[pair[1].key] || [], true) : "";
    return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
      <div>${left}</div>
      <div>${right}</div>
    </div>`;
  }).join("");

  const hasClosing = closingDefs.some(function(d) { return (section[d.key] || []).length > 0; });
  const closingPage = hasClosing ? sectionClosingHTML(section, idx, order, gridHTML) : "";

  return headerPage + closingPage;
}

// Legacy text path — section has a plain `text` string
function buildSectionPagesText(section, idx, order) {
  const cleanText = cleanSectionText(section.text, section.title);
  const { chartBlock, prose, closingBlocks } = parseSection(cleanText);
  const pullQuote = extractPullQuote(cleanText);

  const chartBlockHTML = chartBlock
    ? blockHTML(chartBlock.block, chartBlock.lines, false)
    : "";

  const headerPage = sectionHeaderHTML(section, idx, order, pullQuote, chartBlockHTML, proseHTML(prose));

  const blockOrder = ["val", "prakt", "week", "refl"];
  const closingKeys = blockOrder.filter(function(k) { return closingBlocks[k]; });

  let closingPage = "";
  if (closingKeys.length) {
    const pairs = [];
    for (let i = 0; i < closingKeys.length; i += 2) {
      pairs.push([closingKeys[i], closingKeys[i + 1]]);
    }
    const gridHTML = pairs.map(function(pair) {
      const left  = pair[0] ? blockHTML(closingBlocks[pair[0]].block, closingBlocks[pair[0]].lines, true) : "";
      const right = pair[1] ? blockHTML(closingBlocks[pair[1]].block, closingBlocks[pair[1]].lines, true) : "";
      return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div>${left}</div>
        <div>${right}</div>
      </div>`;
    }).join("");
    closingPage = sectionClosingHTML(section, idx, order, gridHTML);
  }

  return headerPage + closingPage;
}

function buildSectionPages(section, idx, order) {
  return Array.isArray(section.inJouwChart)
    ? buildSectionPagesJSON(section, idx, order)
    : buildSectionPagesText(section, idx, order);
}

// ─── PAGE: EXECUTIVE SUMMARY ─────────────────────────────────────────────────
// Shown when order.executive_summary exists (new JSON schema).
// Falls back to a chart-data overview when not yet available.
function buildExecutiveSummaryPage(order) {
  const bd    = order.birth_data || {};
  const chart = bd.chart || {};
  const es    = order.executive_summary || null;

  const bullets = [
    chart.type    ? { label: "Type",              value: chart.type }    : null,
    chart.strat   ? { label: "Strategie",         value: chart.strat }   : null,
    chart.auth    ? { label: "Autoriteit",         value: chart.auth }    : null,
    chart.profile ? { label: "Profiel",            value: chart.profile } : null,
    (chart.channels || []).length
      ? { label: "Sterkste kanaal",
          value: chart.channels[0].g1 + "–" + chart.channels[0].g2 + "  (" + chart.channels[0].c1 + " ↔ " + chart.channels[0].c2 + ")" }
      : null,
    chart.cross   ? { label: "Inkarnatie-kruis",  value: chart.cross }   : null,
  ].filter(Boolean);

  const bulletsHTML = bullets.map(function(b) {
    return `<div style="display:flex;gap:14px;padding:9px 0;border-bottom:0.4px solid #E5E0D8;align-items:baseline;">
      <span style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#C9A85C;letter-spacing:0.12em;text-transform:uppercase;min-width:38mm;">${esc(b.label)}</span>
      <span style="font-family:'Cormorant Garamond',serif;font-size:13pt;font-weight:600;color:#1A1715;">${esc(b.value)}</span>
    </div>`;
  }).join("");

  const integrationText = es && es.integrationText
    ? `<p style="font-family:'Inter',sans-serif;font-size:10.5pt;line-height:1.75;color:#2A2820;margin-bottom:14px;">${esc(es.integrationText)}</p>`
    : "";

  const focusThemes = es && es.focusThemes && es.focusThemes.length
    ? `<div style="margin-top:14px;">
        <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:8px;">FOCUS THEMA'S</div>
        ${es.focusThemes.map(function(t) {
          return `<div style="display:flex;gap:10px;margin-bottom:6px;font-family:'Inter',sans-serif;font-size:9.5pt;color:#2A2820;line-height:1.5;">
            <span style="color:#C9A85C;font-weight:500;">·</span><span>${esc(t)}</span></div>`;
        }).join("")}
      </div>`
    : "";

  const startDezeWeek = es && es.startDezeWeek && es.startDezeWeek.length
    ? `<div style="margin-top:14px;background:#F0EDE6;border-left:3px solid #C9A85C;padding:12px 16px;">
        <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#9A8050;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:8px;">START DEZE WEEK</div>
        ${es.startDezeWeek.map(function(a, i) {
          return `<div style="display:flex;gap:10px;margin-bottom:6px;font-family:'Inter',sans-serif;font-size:9.5pt;color:#2A2820;line-height:1.5;">
            <span style="color:#C9A85C;font-weight:600;min-width:14px;">${i + 1}.</span><span>${esc(a)}</span></div>`;
        }).join("")}
      </div>`
    : "";

  return `
<div style="width:210mm;height:285mm;background:#F7F5F0;position:relative;overflow:hidden;break-after:page;">
  <div style="height:4px;background:#1A1715;"></div>
  <div style="padding:10mm 20mm 0;">
    <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#C9A85C;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:6px;">SAMENVATTING</div>
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:24pt;color:#1A1715;line-height:1.1;margin-bottom:10px;">Jouw ontwerp in één oogopslag</div>
    <div style="height:0.75px;background:#C9A85C;margin-bottom:14px;"></div>
    ${integrationText}
    ${bulletsHTML}
    ${focusThemes}
    ${startDezeWeek}
  </div>
  <div style="position:absolute;bottom:10mm;left:20mm;right:20mm;display:flex;justify-content:space-between;">
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">${esc(order.report_title || "Volledig Human Design Rapport")}</div>
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">Faculty of Human Design</div>
  </div>
</div>`;
}

// ─── PAGE: METHODOLOGY ────────────────────────────────────────────────────────
function buildMethodologyPage(order) {
  const bd   = order.birth_data || {};
  const lang = order.language || "nl";
  const MAANDEN = ["","januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
  const dateStr = bd.day
    ? `${bd.day} ${MAANDEN[parseInt(bd.month)] || bd.month} ${bd.year}`
    : "";
  const timeStr = bd.hour != null
    ? `${String(bd.hour).padStart(2,"0")}:${String(bd.minute || 0).padStart(2,"0")}`
    : "";

  return `
<div style="width:210mm;height:285mm;background:#FFFFFF;position:relative;overflow:hidden;break-after:page;">
  <div style="height:4px;background:#1A1715;"></div>
  <div style="padding:10mm 20mm 0;">
    <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#C9A85C;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:6px;">BEREKENING</div>
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:22pt;color:#1A1715;line-height:1.1;margin-bottom:10px;">Zo is dit rapport berekend</div>
    <div style="height:0.75px;background:#C9A85C;margin-bottom:16px;"></div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin-bottom:20px;">
      ${dateStr ? `<div style="padding:8px 0;border-bottom:0.4px solid #E5E0D8;">
        <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">GEBOORTEDATUM</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:13pt;color:#1A1715;">${esc(dateStr)}</div>
      </div>` : ""}
      ${timeStr ? `<div style="padding:8px 0;border-bottom:0.4px solid #E5E0D8;">
        <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">GEBOORTETIJD</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:13pt;color:#1A1715;">${esc(timeStr)}</div>
      </div>` : ""}
      ${bd.place ? `<div style="padding:8px 0;border-bottom:0.4px solid #E5E0D8;">
        <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">GEBOORTEPLAATS</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:13pt;color:#1A1715;">${esc(bd.place)}</div>
      </div>` : ""}
    </div>

    <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#A8A29E;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:10px;">BEREKENINGSWIJZE</div>
    <p style="font-family:'Inter',sans-serif;font-size:9.5pt;line-height:1.72;color:#2A2820;margin-bottom:10px;">Dit rapport is berekend met behulp van de Swiss Ephemeris — de meest nauwkeurige astronomische database ter wereld, ook gebruikt door professionele astrologen en sterrenwachten. Op basis van jouw exacte geboortetijdstip worden de planetaire posities op de minuut nauwkeurig bepaald.</p>
    <p style="font-family:'Inter',sans-serif;font-size:9.5pt;line-height:1.72;color:#2A2820;margin-bottom:10px;">Vanuit die posities worden jouw 64 poorten, gedefinieerde centra en actieve kanalen afgeleid via de Human Design systematiek zoals beschreven door Ra Uru Hu. De berekening combineert de bewuste (persoonlijkheid) en onbewuste (ontwerp) component op basis van twee afzonderlijke planetaire momentopnames.</p>
    <p style="font-family:'Inter',sans-serif;font-size:9.5pt;line-height:1.72;color:#2A2820;margin-bottom:20px;">Elke berekening is uniek voor jouw geboortegegevens en kan niet worden veralgemeend naar anderen.</p>

    <div style="background:#F7F5F0;border-left:3px solid #E5E0D8;padding:10px 14px;">
      <p style="font-family:'Inter',sans-serif;font-size:8.5pt;line-height:1.65;color:#6B6560;font-style:italic;">Dit rapport is een persoonlijk werkdocument bedoeld voor zelfreflectie en bewustwording. Het is geen vervanging voor medisch, psychologisch, financieel of juridisch advies. Faculty of Human Design aanvaardt geen aansprakelijkheid voor beslissingen genomen op basis van de inhoud van dit rapport.</p>
    </div>
  </div>
  <div style="position:absolute;bottom:10mm;left:20mm;right:20mm;display:flex;justify-content:space-between;">
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">${esc(order.report_title || "Volledig Human Design Rapport")}</div>
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">Faculty of Human Design</div>
  </div>
</div>`;
}

// ─── PAGE: CLOSING ────────────────────────────────────────────────────────────
function buildClosingPage(order) {
  const lang = order.language || "nl";
  const bd = order.birth_data || {};
  const chart = bd.chart || {};
  const ta = typeAccent(chart.type);

  return `
<div style="width:210mm;height:285mm;background:#1A1715;position:relative;overflow:hidden;break-before:page;display:flex;flex-direction:column;align-items:center;justify-content:center;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:#C9A85C;"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:#C9A85C;"></div>
  ${coverDecoration(297, 420)}
  <div style="position:absolute;top:28px;left:0;right:0;text-align:center;font-family:'Inter',sans-serif;font-size:6pt;font-weight:300;color:#5A5438;letter-spacing:0.25em;text-transform:uppercase;">Faculty of Human Design  ·  Ibiza</div>
  <div style="padding:0 30mm;text-align:center;position:relative;">
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:30pt;color:#FFFFFF;line-height:1.3;">${ui(lang, "Met dank voor je vertrouwen.", "Thank you for your trust.")}</div>
    <div style="width:96px;height:0.75px;background:#C9A85C;margin:18px auto;"></div>
    ${order.customer_name ? `<div style="font-family:'Inter',sans-serif;font-weight:300;font-size:10pt;color:#C9A85C;letter-spacing:0.12em;">${esc(order.customer_name)}</div>` : ""}
    ${chart.type ? `<div style="margin-top:8px;"><span style="display:inline-block;background:${ta.bg};border:1px solid ${ta.bar};padding:5px 18px;font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:${ta.fg};letter-spacing:0.16em;text-transform:uppercase;">${esc(chart.type)}</span></div>` : ""}
    <div style="margin-top:24px;font-family:'Inter',sans-serif;font-size:7.5pt;font-weight:300;color:#6B6560;line-height:1.8;max-width:120mm;">${ui(lang,
      "Dit rapport is persoonlijk samengesteld op basis van jouw geboortegegevens en is uitsluitend voor eigen gebruik.",
      "This report has been personally compiled based on your birth data and is for personal use only."
    )}</div>
  </div>
  <div style="position:absolute;bottom:22px;left:0;right:0;text-align:center;font-family:'Inter',sans-serif;font-size:6pt;font-weight:300;color:#3A3830;letter-spacing:0.18em;">© 2026 FACULTY OF HUMAN DESIGN  ·  IBIZA, SPANJE</div>
</div>`;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function buildHTML({ order, sections, svgBodygraph }) {
  const lang = order.language || "nl";
  const bd = order.birth_data || {};
  const chart = bd.chart || {};

  const sectionPages = sections.map(function(s, i) {
    return buildSectionPages(s, i, order);
  }).join("\n");

  const hasChart = chart.type && Array.isArray(chart.definedCenters);

  const bundledFonts = buildFontCSS();
  const fontBlock = bundledFonts
    ? `<style>${bundledFonts}</style>`
    : `<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
${fontBlock}
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4 portrait; margin: 0; }
  html, body { width: 210mm; background: #F7F5F0; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Inter', sans-serif; }
  @media print {
    html, body { width: 210mm; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
${buildCoverPage(order)}
${hasChart ? buildExecutiveSummaryPage(order) : ""}
${buildMethodologyPage(order)}
${buildTOCPage(sections, order)}
${hasChart ? buildProfilePage(order) : ""}
${hasChart && svgBodygraph ? buildBodygraphPage(svgBodygraph, order) : ""}
${sectionPages}
${buildClosingPage(order)}
</body>
</html>`;
}
