// PDF generation using PDFKit (pure Node.js, no React dependency)
// Runs as native ESM on Vercel (package.json "type":"module") — no ncc bundling.
//
// ALL dependencies loaded via createRequire (CJS) so the ESM static-link phase
// only sees the built-in "module" import and never parses third-party files.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const PDFDocument                      = require("pdfkit");
const { drawBodygraph, bodygraphSize } = require("./bodygraph.cjs");
const { FONT, registerFonts }          = require("./fonts.cjs");

// ─── LAYOUT TOKENS ───────────────────────────────────────────────────────────
const W  = 595.28;
const H  = 841.89;
const ML = 56;
const MR = 56;
const TW = W - ML - MR;
const FY = H - 36;

// Brand palette
const CLR = {
  dark:      "#1A1715",
  brand:     "#3D2C5E",
  navy:      "#1C2E4A",
  gold:      "#C9A85C",
  goldWarm:  "#9A8050",
  text:      "#2A2820",
  textMuted: "#6B6560",
  textLight: "#A8A29E",
  border:    "#E5E0D8",
  bg:        "#F7F5F0",
  bgMuted:   "#F0EDE6",
  tintChart: "#E8EDF5",  accentChart: "#1C2E4A",
  tintVal:   "#FBF2E4",  accentVal:   "#B8862A",
  tintPrakt: "#E8F2EB",  accentPrakt: "#3A6848",
  tintWeek:  "#EDE8F5",  accentWeek:  "#3D2C5E",
  tintRefl:  "#F0EDE4",  accentRefl:  "#7A6030",
};

// ─── TYPOGRAPHY TOKENS ───────────────────────────────────────────────────────
// Prose text is indented slightly inside the grid margins for better line length.
// At 11pt Inter, TW=483pt ≈ 90 chars — way too wide. PMW ≈ 432pt ≈ 72 chars (ideal).
const PMX = ML + 4;          // prose margin left  (4pt extra indent)
const PMW = TW - 8;          // prose text width    (narrower column)

const BODY_SIZE     = 11;    // body text size (pt)
const BODY_GAP      = 6;     // lineGap within a paragraph (was 5 — more air)
const BODY_PARA_SEP = 13;    // space after a body paragraph (was 16 — tighter)
const SUB_SIZE      = 13.5;  // subhead size (pt)
const SUB_BEFORE    = 10;    // space added before a subhead (was 12)
const SUB_AFTER     = 7;     // space added after a subhead (was 8)

// ─── FORBIDDEN / QA STRINGS ──────────────────────────────────────────────────
const FORBIDDEN_STRINGS = ["**", "* ", "*\n", "##", "###", "---\n"];

// ─── i18n HELPER ─────────────────────────────────────────────────────────────
// Returns nl string for NL orders, en string for EN orders.
function ui(order, nl, en) {
  return (order && order.language === "en") ? en : nl;
}

// ─── PULL QUOTE EXTRACTOR ────────────────────────────────────────────────────
// Grabs the first complete sentence from the core analysis (after the "In jouw
// chart:" / "In your chart:" block) to use as a header band tagline.
function extractPullQuote(text, maxLen) {
  if (maxLen === undefined) maxLen = 115;
  if (!text) return "";
  // Strip the leading chart-facts block (everything up to first blank line)
  const withoutChartBlock = text.replace(/^in (jouw|your) chart:[\s\S]*?\n\n/im, "").trim();
  // Take first sentence
  const m = withoutChartBlock.match(/[^.\n]{20,}[.]/);
  if (!m) return "";
  const sentence = m[0].replace(/^[^\w]+/, "").trim(); // strip leading punctuation
  if (sentence.length < 24) return "";
  return sentence.length > maxLen ? sentence.slice(0, maxLen - 1).trimEnd() + "…" : sentence;
}

// ─── MARKDOWN STRIPPER ───────────────────────────────────────────────────────
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
  const esc = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return stripped
    .replace(new RegExp("^\\s*" + esc + "\\s*\\n?", "i"), "")
    .trim();
}

function qaSection(text, title) {
  for (const f of FORBIDDEN_STRINGS) {
    if (text.includes(f)) {
      console.warn("[PDF QA] Forbidden string in section: " + title);
    }
  }
}

// ─── DYNAMIC CHAPTER TITLE FIXES ─────────────────────────────────────────────
function adjustSectionTitles(sections, order) {
  const chart = (order.birth_data || {}).chart || {};
  const isReflector = /reflector/i.test(chart.type || "");
  const channelCount = (chart.channels || []).length;

  return sections.map(function(s) {
    let title = s.title;
    if (isReflector && channelCount === 0 && /actieve kanalen/i.test(title)) {
      title = "Poorten & Energiestromen";
    }
    return Object.assign({}, s, { title: title });
  });
}

// ─── BLOCK DETECTION ─────────────────────────────────────────────────────────
// labels[0] = NL, labels[1] = EN — both are recognised in parseSection()
const BLOCKS = [
  { key: "chart",  labels: ["In jouw chart",   "In your chart"],         tint: CLR.tintChart,  accent: CLR.accentChart },
  { key: "val",    labels: ["Valkuilen",        "Pitfalls"],              tint: CLR.tintVal,    accent: CLR.accentVal   },
  { key: "prakt",  labels: ["Praktijk",         "Practice"],              tint: CLR.tintPrakt,  accent: CLR.accentPrakt },
  { key: "week",   labels: ["Deze week",        "This week"],             tint: CLR.tintWeek,   accent: CLR.accentWeek  },
  { key: "refl",   labels: ["Reflectievragen",  "Reflection questions"],  tint: CLR.tintRefl,   accent: CLR.accentRefl  },
];

// Draw a small decorative symbol (5×5pt) at position (sx, sy).
// Each block type has its own vector mark.
function drawBlockSymbol(doc, key, sx, sy, accent) {
  const s = 5;
  doc.save();
  doc.fillColor(accent).strokeColor(accent).lineWidth(0.8);
  switch (key) {
    case "chart": // Diamond
      doc.moveTo(sx, sy - s).lineTo(sx + s, sy).lineTo(sx, sy + s).lineTo(sx - s, sy)
         .closePath().fill();
      break;
    case "val": // Downward triangle
      doc.moveTo(sx - s, sy - s).lineTo(sx + s, sy - s).lineTo(sx, sy + s)
         .closePath().fill();
      break;
    case "prakt": // Filled circle
      doc.circle(sx, sy, s).fill();
      break;
    case "week": // Filled square
      doc.rect(sx - s, sy - s, s * 2, s * 2).fill();
      break;
    case "refl": // Open circle with centre dot
      doc.save();
      doc.strokeColor(accent).lineWidth(1);
      doc.circle(sx, sy, s).stroke();
      doc.circle(sx, sy, 1.5).fill();
      doc.restore();
      break;
    default:
      doc.circle(sx, sy, s).fill();
  }
  doc.restore();
}

function parseSection(text) {
  const rawLines = (text || "").split(/\n/);
  const segments = [];
  let current = null;

  const flush = function() {
    if (current && current.lines.some(function(l) { return l.trim(); })) {
      segments.push(current);
    }
    current = null;
  };

  for (const raw of rawLines) {
    const line = raw.trimEnd();

    const matchedBlock = BLOCKS.find(function(b) {
      return b.labels.some(function(lbl) {
        return line.trim().toLowerCase().startsWith(lbl.toLowerCase() + ":")
          || line.trim().toLowerCase() === lbl.toLowerCase();
      });
    });

    if (matchedBlock) {
      flush();
      current = { type: "block", block: matchedBlock, lines: [] };
      continue;
    }

    if (!current) {
      if (!segments.length || segments[segments.length - 1].type !== "prose") {
        segments.push({ type: "prose", lines: [] });
      }
      segments[segments.length - 1].lines.push(line);
    } else {
      // Special rule: end the "chart" block on a blank line once ≥3 bullets
      // have been collected. This prevents the AI putting the entire core
      // analysis (subheadings + paragraphs) as extra bullets inside the block.
      const isChartBlock = current.type === "block" && current.block && current.block.key === "chart";
      const bulletCount  = current.lines.filter(function(l) { return /^\s*[•\-–—*]/.test(l); }).length;
      if (isChartBlock && line.trim() === "" && bulletCount >= 3) {
        flush(); // Close the chart block — rest becomes prose
      } else {
        current.lines.push(line);
      }
    }
  }
  flush();
  return segments;
}

// ─── DRAWING HELPERS ─────────────────────────────────────────────────────────
function strH(doc, text, opts) {
  try {
    return doc.heightOfString(text, opts);
  } catch (err) {
    return 14;
  }
}

function needsNewPage(doc, y, needed) {
  if (needed === undefined) needed = 60;
  return y + needed > FY - 24;
}

function addContentPage(doc, order) {
  doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, W, 4).fill(CLR.dark);
  doc.rect(0, 0, 4, 4).fill(CLR.gold); // small gold corner dot
  drawFooter(doc, order);
  return 28;
}

function drawFooter(doc, order) {
  // Increment page counter stored on doc instance (set to 0 in generatePDF)
  doc.__pg = (doc.__pg || 0) + 1;

  // KEY: save doc.y before footer rendering and restore it afterward.
  // PDFKit auto-inserts a new page when doc.text(…, x, y) is called with
  // y < doc.y ("backward" motion). Footer renders at FY ≈ 806, which sets
  // doc.y ≈ 814. Any subsequent content at y=175 (section header page) or
  // y=28 (continuation page) would then trigger an unwanted blank page.
  // Saving/restoring doc.y makes drawFooter invisible to the cursor.
  const prevY = doc.y;

  doc.save();
  // Footer rule — gold tinted
  doc.rect(ML, FY - 9, TW, 0.5).fill(CLR.border);
  doc.rect(ML, FY - 9, 16, 0.5).fill(CLR.gold); // short gold accent on rule start

  // Left: report title
  doc.font(FONT.bodyLight).fontSize(6.5).fillColor(CLR.textLight)
    .text(order.report_title || "", ML, FY, { width: TW / 2 });

  // Center: page number (faint)
  doc.font(FONT.bodyLight).fontSize(6.5).fillColor(CLR.textLight)
    .text(String(doc.__pg), ML, FY, { width: TW, align: "center" });

  // Right: brand name
  doc.font(FONT.bodyLight).fontSize(6.5).fillColor(CLR.textLight)
    .text("Faculty of Human Design", ML, FY, { width: TW, align: "right" });
  doc.restore();

  // Restore cursor — must come AFTER doc.restore() since restore() doesn't
  // reset doc.y (it only restores graphics state like colors/transforms).
  doc.y = prevY;
}

// ─── BODYGRAPH PAGE ──────────────────────────────────────────────────────────
function drawBodygraphPage(doc, order, chart) {
  doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, W, 4).fill(CLR.dark);
  doc.rect(0, 0, 4, 4).fill(CLR.gold); // gold corner accent (consistent with content pages)

  doc.font(FONT.body).fontSize(7).fillColor(CLR.goldWarm)
    .text(ui(order, "JOUW BODYGRAPH", "YOUR BODYGRAPH"), ML, 22, { characterSpacing: 3, width: TW });

  doc.font(FONT.displaySemiBold).fontSize(22).fillColor(CLR.dark)
    .text(ui(order, "Het visuele kaartwerk van jouw ontwerp", "The visual map of your design"), ML, 36, { width: TW });

  doc.rect(ML, 78, 48, 1).fill(CLR.gold);
  doc.save();
  doc.rect(ML + 48, 78, 24, 0.5).fillOpacity(0.4).fill(CLR.gold);
  doc.restore();

  const bgScale = 0.92;
  const bgSize  = bodygraphSize(bgScale);
  const bgX = (W - bgSize.width) / 2;
  const bgY = 96;
  drawBodygraph(doc, chart, { x: bgX, y: bgY, scale: bgScale });

  const dataY = bgY + bgSize.height + 26;
  doc.font(FONT.body).fontSize(6.5).fillColor(CLR.goldWarm)
    .text(ui(order, "DE KERNDATA VAN DEZE CHART", "THE CORE DATA OF THIS CHART"), ML, dataY, { characterSpacing: 2.5 });

  const items = [
    chart.type    ? { label: ui(order, "Type",       "Type"),       value: chart.type }    : null,
    chart.strat   ? { label: ui(order, "Strategie",  "Strategy"),   value: chart.strat }   : null,
    chart.auth    ? { label: ui(order, "Autoriteit", "Authority"),  value: chart.auth }    : null,
    chart.profile ? { label: ui(order, "Profiel",    "Profile"),    value: chart.profile } : null,
    chart.sig     ? { label: ui(order, "Signatuur",  "Signature"),  value: chart.sig }     : null,
    chart.notSelf ? { label: "Not-Self",                            value: chart.notSelf } : null,
  ].filter(Boolean);

  const colW = TW / 2;
  let cy = dataY + 18;
  items.forEach(function(it, i) {
    const col   = i % 2;
    const row   = Math.floor(i / 2);
    const itemX = ML + col * colW;
    const itemY = cy + row * 30;
    // Faint row separator
    if (col === 0 && row > 0) {
      doc.save();
      doc.rect(ML, itemY - 5, TW, 0.4).fillOpacity(0.15).fill(CLR.border);
      doc.restore();
    }
    doc.font(FONT.bodyLight).fontSize(6.5).fillColor(CLR.textLight)
       .text(it.label.toUpperCase(), itemX, itemY, { characterSpacing: 1.5 });
    doc.font(FONT.displayRegular).fontSize(12).fillColor(CLR.dark)
       .text(it.value, itemX, itemY + 9);
  });

  const legY = FY - 60;
  doc.rect(ML, legY, TW, 0.5).fill(CLR.border);
  doc.font(FONT.body).fontSize(7).fillColor(CLR.goldWarm)
    .text(ui(order, "LEGENDA", "LEGEND"), ML, legY + 10, { characterSpacing: 2 });

  doc.rect(ML, legY + 24, 12, 8).fillAndStroke("#876B4A", "#2A2620");
  doc.font(FONT.body).fontSize(8).fillColor(CLR.text)
    .text(ui(order, "Gedefinieerd centrum — vaste eigen energie", "Defined center — fixed own energy"), ML + 18, legY + 26);

  doc.rect(ML + 200, legY + 24, 12, 8).fillAndStroke("#FFFFFF", "#2A2620");
  doc.font(FONT.body).fontSize(8).fillColor(CLR.text)
    .text(ui(order, "Open centrum — neemt op uit omgeving", "Open center — receives from environment"), ML + 218, legY + 26);

  drawFooter(doc, order);
}

// ─── COVER DECORATION ────────────────────────────────────────────────────────
// Faint geometric motif — concentric circles with axis lines, drawn behind text.
// Evokes the circular structure of the bodygraph without being literal.
function drawCoverDecoration(doc, cy) {
  const cx = W / 2;
  doc.save();

  // Concentric rings — progressively more visible toward center
  const rings = [
    { r: 205, w: 0.3, op: 0.05 },
    { r: 162, w: 0.3, op: 0.07 },
    { r: 118, w: 0.4, op: 0.09 },
    { r: 76,  w: 0.5, op: 0.12 },
    { r: 40,  w: 0.7, op: 0.17 },
  ];
  rings.forEach(function(ring) {
    doc.save();
    doc.strokeColor(CLR.gold).lineWidth(ring.w).strokeOpacity(ring.op);
    doc.circle(cx, cy, ring.r).stroke();
    doc.restore();
  });

  // Axis cross (horizontal + vertical)
  doc.save();
  doc.strokeColor(CLR.gold).lineWidth(0.3).strokeOpacity(0.04);
  doc.moveTo(cx - 205, cy).lineTo(cx + 205, cy).stroke();
  doc.moveTo(cx, cy - 205).lineTo(cx, cy + 205).stroke();
  doc.restore();

  // Diagonal lines (45°)
  doc.save();
  doc.strokeColor(CLR.gold).lineWidth(0.3).strokeOpacity(0.03);
  const d = 145;
  doc.moveTo(cx - d, cy - d).lineTo(cx + d, cy + d).stroke();
  doc.moveTo(cx + d, cy - d).lineTo(cx - d, cy + d).stroke();
  doc.restore();

  // Eight small diamond nodes on mid ring (evocative of gate channels)
  const nodeR = 76;
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  angles.forEach(function(deg) {
    const rad = (deg * Math.PI) / 180;
    const nx  = cx + Math.cos(rad) * nodeR;
    const ny  = cy + Math.sin(rad) * nodeR;
    doc.save();
    doc.fillColor(CLR.gold).fillOpacity(0.18);
    doc.circle(nx, ny, 2.5).fill();
    doc.restore();
  });

  // Center dot
  doc.save();
  doc.fillColor(CLR.gold).fillOpacity(0.3);
  doc.circle(cx, cy, 4).fill();
  doc.restore();

  doc.restore();
}

// ─── COVER PAGE ──────────────────────────────────────────────────────────────
function drawCover(doc, order, sections) {
  const bd    = order.birth_data || {};
  const chart = bd.chart || {};

  // ── Background
  doc.rect(0, 0, W, H).fill(CLR.dark);

  // ── Gold accent stripes (thicker = more premium)
  doc.rect(0, 0, W, 4).fill(CLR.gold);
  doc.rect(0, H - 4, W, 4).fill(CLR.gold);

  // ── Geometric decoration
  drawCoverDecoration(doc, 290);

  // ── Institution label
  doc.font(FONT.bodyLight).fontSize(6).fillColor("#5A5438")
    .text("FACULTY OF HUMAN DESIGN  ·  IBIZA  ·  EST. 2014", 0, 28, {
      align: "center", width: W, characterSpacing: 4,
    });

  // ── Report title — slightly smaller so it fits on one line more often
  doc.font(FONT.display).fontSize(34).fillColor("#FFFFFF")
    .text(order.report_title || "Persoonlijk Rapport", ML, 108, {
      align: "center", width: TW, lineGap: 9,
    });

  // ── Gold ornament line below title
  const titleBottom = doc.y + 18;
  doc.save();
  doc.rect(W / 2 - 40, titleBottom, 80, 0.75).fill(CLR.gold);
  doc.fillOpacity(0.35).rect(W / 2 - 80, titleBottom, 40, 0.5).fill(CLR.gold);
  doc.fillOpacity(0.35).rect(W / 2 + 40, titleBottom, 40, 0.5).fill(CLR.gold);
  doc.restore();

  // ── Name
  doc.font(FONT.displayLight).fontSize(17).fillColor("#C4B898")
    .text(order.customer_name || "", 0, titleBottom + 16, { align: "center", width: W });

  // ── Birth data
  let iy = doc.y + 10;
  if (bd.day) {
    const parts = [
      bd.day + "-" + bd.month + "-" + bd.year,
      bd.hour != null ? bd.hour + ":" + String(bd.minute || 0).padStart(2, "0") : null,
      bd.place || null,
    ].filter(Boolean);
    doc.font(FONT.bodyLight).fontSize(8).fillColor("#484440")
      .text(parts.join("  ·  "), 0, iy, { align: "center", width: W });
    iy = doc.y + 5;
  }
  if (chart.type) {
    const profilePrefix = ui(order, "Profiel", "Profile");
    const cparts = [
      chart.type,
      chart.profile ? profilePrefix + " " + chart.profile : null,
      chart.auth    || null,
    ].filter(Boolean);
    doc.font(FONT.body).fontSize(8).fillColor(CLR.goldWarm)
      .text(cparts.join("  ·  "), 0, iy, { align: "center", width: W });
  }

  // ── Chart data grid  (2 columns × up to 4 rows — label above, value below)
  const gridItems = [
    chart.type    ? { label: "TYPE",                                          value: chart.type    } : null,
    chart.strat   ? { label: ui(order, "STRATEGIE",       "STRATEGY"),       value: chart.strat   } : null,
    chart.auth    ? { label: ui(order, "AUTORITEIT",      "AUTHORITY"),      value: chart.auth    } : null,
    chart.profile ? { label: ui(order, "PROFIEL",         "PROFILE"),        value: chart.profile } : null,
    chart.sig     ? { label: ui(order, "SIGNATUUR",       "SIGNATURE"),      value: chart.sig     } : null,
    chart.notSelf ? { label: ui(order, "NOT-SELF THEMA",  "NOT-SELF THEME"), value: chart.notSelf } : null,
    (chart.definedCenters && chart.definedCenters.length)
      ? { label: ui(order, "GEDEFINIEERD",     "DEFINED"),
          value: chart.definedCenters.join(", ") } : null,
    chart.cross   ? { label: ui(order, "INKARNATIE-KRUIS", "INCARNATION CROSS"), value: chart.cross } : null,
  ].filter(Boolean);

  if (gridItems.length) {
    const gridY   = 420;
    const colW    = TW / 2;
    const rowH    = 38;

    // Subtle separator above grid
    doc.save();
    doc.rect(ML, gridY - 14, TW, 0.5).fillOpacity(0.25).fill(CLR.gold);
    doc.restore();
    doc.font(FONT.bodyLight).fontSize(5.5).fillColor("#5A5438")
      .text(ui(order, "JOUW MENSELIJK ONTWERP", "YOUR HUMAN DESIGN"), ML, gridY - 8, { characterSpacing: 3 });

    gridItems.slice(0, 8).forEach(function(item, i) {
      const col  = i % 2;
      const row  = Math.floor(i / 2);
      const gx   = ML + col * colW;
      const gy   = gridY + 12 + row * rowH;

      // Faint column divider for right column
      if (col === 1 && row === 0) {
        doc.save();
        doc.rect(ML + colW, gridY + 10, 0.5, rowH * Math.ceil(gridItems.length / 2) - 4)
          .fillOpacity(0.12).fill(CLR.gold);
        doc.restore();
      }

      doc.font(FONT.bodyLight).fontSize(6).fillColor("#5A5438")
        .text(item.label, gx, gy, { width: colW - 8, characterSpacing: 1.5 });
      doc.font(FONT.displayRegular).fontSize(11).fillColor("#B8B0A0")
        .text(item.value, gx, gy + 9, { width: colW - 8 });
    });

    // Separator below grid
    const gridBottom = gridY + 12 + Math.ceil(gridItems.length / 2) * rowH;
    doc.save();
    doc.rect(ML, gridBottom, TW, 0.5).fillOpacity(0.2).fill(CLR.gold);
    doc.restore();
  }

  // ── Table of contents
  const tocY = Math.max(gridItems.length ? 420 + 12 + Math.ceil(gridItems.length / 2) * 38 + 20 : 600, H * 0.72);
  if (tocY < H - 100 && sections.length) {
    doc.font(FONT.bodyLight).fontSize(5.5).fillColor("#5A5438")
      .text(ui(order, "INHOUD", "CONTENTS"), ML, tocY, { characterSpacing: 3 });

    const midToc = ML + Math.floor(sections.length / 2) * 0; // single column
    const colWToc = (TW - 12) / 2;
    sections.forEach(function(s, i) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const tx  = ML + col * (colWToc + 12);
      const ty  = tocY + 14 + row * 13;
      if (ty < H - 48) {
        doc.font(FONT.bodyLight).fontSize(6.5).fillColor("#3A3830")
          .text(String(i + 1).padStart(2, "0"), tx, ty, { width: 14, lineBreak: false });
        doc.font(FONT.body).fontSize(6.5).fillColor("#4A4840")
          .text(s.title, tx + 16, ty, { width: colWToc - 16, lineBreak: false });
      }
    });
  }

  // ── Copyright
  doc.font(FONT.bodyLight).fontSize(6.5).fillColor("#2C2A26")
    .text(ui(order, "© 2026 Faculty of Human Design — Ibiza, Spanje", "© 2026 Faculty of Human Design — Ibiza, Spain"), 0, H - 26, {
      align: "center", width: W,
    });
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
// Returns the y-position where content should begin (below the opener band).
const HEADER_H = 155; // height of the dark opener band — clean, editorial

function drawSectionHeader(doc, section, idx, order) {
  // ── Dark opener band
  doc.rect(0, 0, W, HEADER_H).fill(CLR.dark);

  // Left gold accent bar — thin, refined
  doc.rect(0, 0, 3, HEADER_H).fill(CLR.gold);

  // Section number — subtle, right-aligned, purely decorative
  doc.font(FONT.display).fontSize(72).fillColor(CLR.gold)
    .fillOpacity(0.05)
    .text(String(idx + 1).padStart(2, "0"), W - 160, -10, {
      width: 150, align: "right", lineBreak: false,
    });
  doc.fillOpacity(1);

  // "ONDERDEEL XX" / "PART XX" label
  const partLabel = ui(order, "ONDERDEEL", "PART") + "  " + String(idx + 1).padStart(2, "0");
  doc.font(FONT.body).fontSize(6.5).fillColor(CLR.goldWarm)
    .text(partLabel, ML + 16, 24, { characterSpacing: 3 });

  // Section title — Cormorant SemiBold, generous size
  doc.font(FONT.displaySemiBold).fontSize(32).fillColor("#FFFFFF")
    .text(section.title, ML + 16, 44, { width: TW - 40, lineGap: 5 });

  // Gold ornament line below title
  const titleBottom = doc.y + 10;
  doc.rect(ML + 16, titleBottom, 40, 0.75).fill(CLR.gold);
  doc.save();
  doc.rect(ML + 16 + 40, titleBottom, 20, 0.4).fillOpacity(0.35).fill(CLR.gold);
  doc.restore();

  // ── Pull quote — faint italic, first key sentence from the section
  const pullQuote = extractPullQuote(section.cleanText || "");
  if (pullQuote) {
    const pqY = titleBottom + 9;
    if (pqY + 18 < HEADER_H - 10) {
      doc.font(FONT.display).fontSize(9.5).fillColor(CLR.gold)
        .fillOpacity(0.45)
        .text(pullQuote, ML + 16, pqY, { width: TW - 72, lineGap: 3 });
      doc.fillOpacity(1);
    }
  }

  // ── Thin transition strip between dark band and content
  doc.rect(0, HEADER_H, W, 1).fill(CLR.border);
}

// ─── BLOCK HEIGHT (DRY-RUN) ──────────────────────────────────────────────────
// Returns the rendered height of a block without drawing anything.
// Mirrors the height computation in drawBlock so drawBlockGrid can do an
// accurate page-break check instead of relying on a rough estimate.
function blockHeight(doc, block, lines, bW) {
  if (bW === undefined) bW = TW;
  const isHalf  = bW < TW - 4;
  const PAD     = isHalf ? 12 : 18;
  const BW      = isHalf ? 4  : 6;
  const GAP     = BW + PAD;
  const innerW  = bW - GAP - PAD;
  const isRefl  = block.key === "refl";
  const ITEM_FONT = isHalf ? BODY_SIZE - 1.5 : BODY_SIZE - 0.5;
  const ITEM_GAP  = isHalf ? 3 : 4;
  const ITEM_SEP  = isRefl ? (isHalf ? 9 : 12) : (isHalf ? 5 : 7);
  const LABEL_H   = 14;

  const items = lines
    .map(function(l) {
      return stripMd(l.replace(/^[•\-–—*]\s*/, "").replace(/^\d+\.\s*/, ""));
    })
    .filter(Boolean);

  if (!items.length) return 0;

  let bH = PAD + LABEL_H + 6;
  for (const item of items) {
    bH += strH(doc, item, { width: innerW - (isRefl ? 18 : 14), lineGap: ITEM_GAP, fontSize: ITEM_FONT }) + ITEM_SEP;
  }
  bH += PAD;
  return bH;
}

// ─── BLOCK RENDERER ──────────────────────────────────────────────────────────
// bX / bW allow half-width rendering for the 2×2 closing block grid.
// When omitted they default to the full content column (ML / TW).
function drawBlock(doc, order, block, lines, y, bX, bW) {
  if (bX === undefined) bX = ML;
  if (bW === undefined) bW = TW;

  const isHalf  = bW < TW - 4;       // true when rendered in a 2-column grid
  const PAD     = isHalf ? 12 : 18;
  const BW      = isHalf ? 4  : 6;
  const GAP     = BW + PAD;
  const innerW  = bW - GAP - PAD;

  const isRefl = block.key === "refl";

  const items = lines
    .map(function(l) {
      return stripMd(l.replace(/^[•\-–—*]\s*/, "").replace(/^\d+\.\s*/, ""));
    })
    .filter(Boolean);

  if (!items.length) return y;

  const ITEM_FONT = isHalf ? BODY_SIZE - 1.5 : BODY_SIZE - 0.5;  // 9.5 / 10.5pt
  const ITEM_GAP  = isHalf ? 3 : 4;
  const ITEM_SEP  = isRefl
    ? (isHalf ? 9  : 12)
    : (isHalf ? 5  : 7);

  // ── Height calculation
  const LABEL_H = 14;
  let bH = PAD + LABEL_H + 6;
  for (const item of items) {
    bH += strH(doc, item, { width: innerW - (isRefl ? 18 : 14), lineGap: ITEM_GAP, fontSize: ITEM_FONT }) + ITEM_SEP;
  }
  bH += PAD;

  // Page break only for full-width blocks; grid renderer pre-checks for pairs
  if (!isHalf && needsNewPage(doc, y, bH + 24)) {
    drawFooter(doc, order);
    y = addContentPage(doc, order);
  }

  // ── Background layers
  doc.rect(bX, y, bW, bH).fill(block.tint);
  doc.save();
  doc.rect(bX, y, bW, Math.min(bH, 30)).fillOpacity(0.10).fill(block.accent);
  doc.restore();

  // ── Left accent bar
  doc.rect(bX, y, BW, bH).fill(block.accent);
  doc.save();
  doc.rect(bX + BW, y, 1, bH).fillOpacity(0.07).fill(block.accent);
  doc.restore();

  // ── Label row: symbol + label
  const symX = bX + GAP - 2;
  const symY = y + PAD + 5;
  drawBlockSymbol(doc, block.key, symX, symY, block.accent);

  const blockLabel = (order.language === "en" && block.labels[1]) ? block.labels[1] : block.labels[0];
  doc.font(FONT.displaySemiBold).fontSize(isHalf ? 11 : 12).fillColor(block.accent)
    .text(blockLabel, bX + GAP + 9, y + PAD, { width: innerW - 9, lineBreak: false });

  // ── Divider under label
  const divY = y + PAD + LABEL_H;
  doc.save();
  doc.rect(bX + GAP, divY, innerW, 0.5).fillOpacity(0.22).fill(block.accent);
  doc.restore();

  let iy = divY + 7;

  // ── Items
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (isRefl) {
      if (!isHalf) {
        // Full-width: large faint ordinal behind text
        const numStr = String(i + 1);
        doc.save();
        doc.font(FONT.display).fontSize(28).fillColor(block.accent).fillOpacity(0.07)
          .text(numStr, bX + GAP - 4, iy - 4, { width: 22, align: "right", lineBreak: false });
        doc.restore();
      }
      const numStr = String(i + 1);
      doc.font(FONT.bodyMedium).fontSize(ITEM_FONT).fillColor(block.accent)
        .text(numStr + ".", bX + GAP, iy, { width: 14, lineBreak: false });
      doc.font(FONT.body).fontSize(ITEM_FONT).fillColor(CLR.text)
        .text(item, bX + GAP + 16, iy, { width: innerW - 16, lineGap: ITEM_GAP });
    } else {
      doc.font(FONT.bodyMedium).fontSize(ITEM_FONT).fillColor(block.accent)
        .text("•", bX + GAP, iy, { width: 11, lineBreak: false });
      doc.font(FONT.body).fontSize(ITEM_FONT).fillColor(CLR.text)
        .text(item, bX + GAP + 13, iy, { width: innerW - 13, lineGap: ITEM_GAP });
    }

    iy = doc.y + ITEM_SEP;
  }

  // ── Bottom rule
  doc.save();
  doc.rect(bX + GAP, y + bH - 2, innerW, 0.4).fillOpacity(0.13).fill(block.accent);
  doc.restore();

  // No trailing gap for half-width — the grid renderer adds it after the row
  return y + bH + (isHalf ? 0 : 16);
}

// ─── 2×2 CLOSING BLOCK GRID ──────────────────────────────────────────────────
// Groups val/prakt/week/refl blocks into side-by-side pairs to save vertical space.
const CLOSING_BLOCK_KEYS = new Set(["val", "prakt", "week", "refl"]);

function groupClosingBlocks(segments) {
  const result = [];
  let i = 0;
  while (i < segments.length) {
    const seg = segments[i];
    if (seg.type === "block" && CLOSING_BLOCK_KEYS.has(seg.block.key)) {
      const group = [];
      while (i < segments.length
          && segments[i].type === "block"
          && CLOSING_BLOCK_KEYS.has(segments[i].block.key)) {
        group.push(segments[i]);
        i++;
      }
      // Only group if we have 2+ consecutive closing blocks
      if (group.length >= 2) {
        result.push({ type: "block-grid", blocks: group });
      } else {
        result.push(...group);
      }
    } else {
      result.push(seg);
      i++;
    }
  }
  return result;
}

// ─── SECTION CLOSING PAGE ─────────────────────────────────────────────────────
// The 4 closing blocks (Valkuilen/Praktijk/Deze week/Reflectievragen) always get
// their own dedicated page. This prevents the "accidentally blank" continuation
// page that appears when the grid overflows the prose page with only a fraction
// of the blocks visible against a mostly-white background.
//
// Visual treatment: warm cream background (contrasts with the dark opener),
// thin dark top stripe with section identity, then the 2×2 block grid.
function drawSectionClosingPage(doc, order, sectionTitle, sectionIdx, blocks) {
  doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });

  // Warm cream background — contrasts with the dark section header page
  doc.rect(0, 0, W, H).fill(CLR.bg);

  // Thin dark top stripe with section identity
  const STRIPE_H = 40;
  doc.rect(0, 0, W, STRIPE_H).fill(CLR.dark);
  doc.rect(0, 0, 3, STRIPE_H).fill(CLR.gold);   // left gold accent bar

  const partLabel = ui(order, "ONDERDEEL", "PART") + "  " + String(sectionIdx + 1).padStart(2, "0");
  doc.font(FONT.body).fontSize(6).fillColor(CLR.goldWarm)
    .text(partLabel, ML + 12, 10, { characterSpacing: 2, width: TW - 24, lineBreak: false });

  doc.font(FONT.displaySemiBold).fontSize(13).fillColor("#FFFFFF")
    .text(sectionTitle, ML + 12, 20, { width: TW - 120, lineBreak: false });

  // Right-aligned label: "INZICHTEN & PRAKTIJK" / "INSIGHTS & PRACTICE"
  const insightsLabel = ui(order, "INZICHTEN & PRAKTIJK", "INSIGHTS & PRACTICE");
  doc.font(FONT.bodyLight).fontSize(6).fillColor(CLR.gold)
    .text(insightsLabel, 0, 22, { width: W - ML - 12, align: "right", characterSpacing: 1.5 });

  // ── Block grid (draw BEFORE footer so doc.y is at STRIPE_H+16, not ~813)
  const GRID_GAP = 8;
  const colW = (TW - GRID_GAP) / 2;
  let y = STRIPE_H + 16;

  for (let i = 0; i < blocks.length; i += 2) {
    const left  = blocks[i];
    const right = blocks[i + 1];

    if (!right) {
      y = drawBlock(doc, order, left.block, left.lines, y, ML, TW);
    } else {
      const leftY  = drawBlock(doc, order, left.block,  left.lines,  y, ML,                  colW);
      const rightY = drawBlock(doc, order, right.block, right.lines, y, ML + colW + GRID_GAP, colW);
      y = Math.max(leftY, rightY) + 16;
    }
  }

  // Footer drawn last so it doesn't push doc.y to the page bottom before blocks render
  drawFooter(doc, order);
}

// Keep drawBlockGrid for any non-section-closing uses (defensive)
function drawBlockGrid(doc, order, blocks, y) {
  const GRID_GAP = 8;
  const colW = (TW - GRID_GAP) / 2;

  for (let i = 0; i < blocks.length; i += 2) {
    const left  = blocks[i];
    const right = blocks[i + 1];

    if (!right) {
      y = drawBlock(doc, order, left.block, left.lines, y, ML, TW);
      continue;
    }

    const leftH  = blockHeight(doc, left.block,  left.lines,  colW);
    const rightH = blockHeight(doc, right.block, right.lines, colW);
    const estH   = Math.max(leftH, rightH);

    if (needsNewPage(doc, y, estH)) {
      drawFooter(doc, order);
      y = addContentPage(doc, order);
    }

    const leftY  = drawBlock(doc, order, left.block,  left.lines,  y, ML,                  colW);
    const rightY = drawBlock(doc, order, right.block, right.lines, y, ML + colW + GRID_GAP, colW);
    y = Math.max(leftY, rightY) + 16;
  }

  return y;
}

// ─── PROFILE SUMMARY PAGE ────────────────────────────────────────────────────
// Accent color per energy type — used for the hero band behind the type name.
function typeAccent(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("manifesting generator") || t.includes("manifesterend generator")) return { bg: "#2A1F0A", fg: "#E8B060", bar: "#D4956A" };
  if (t.includes("generator"))    return { bg: "#1E1A08", fg: "#C9A85C", bar: CLR.gold };
  if (t.includes("projector"))    return { bg: "#0A1220", fg: "#8AAAD4", bar: "#3D5A8A" };
  if (t.includes("manifestor") || t.includes("manifesteerder")) return { bg: "#1A0A14", fg: "#C88AAA", bar: "#8A3D5A" };
  if (t.includes("reflector"))    return { bg: "#0E1818", fg: "#8ABABA", bar: "#3D7A7A" };
  return { bg: "#1A1715", fg: CLR.gold, bar: CLR.gold };
}

// All 9 centers in anatomical order (top → bottom of bodygraph)
const ALL_CENTERS = ["Head", "Ajna", "Throat", "G", "Heart", "Spleen", "Sacral", "Solar Plexus", "Root"];
const CENTER_NL   = {
  "Head": "Hoofd", "Ajna": "Ajna", "Throat": "Keel", "G": "G",
  "Heart": "Hart", "Spleen": "Milt", "Sacral": "Sacraal",
  "Solar Plexus": "Zonnevlecht", "Root": "Wortel",
};
const CENTER_EN   = {
  "Head": "Head", "Ajna": "Ajna", "Throat": "Throat", "G": "G",
  "Heart": "Heart", "Spleen": "Spleen", "Sacral": "Sacral",
  "Solar Plexus": "Sol.Plex.", "Root": "Root",
};

function drawProfilePage(doc, order, chart) {
  doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });

  // ── Background + top stripe
  doc.rect(0, 0, W, H).fill(CLR.bg);
  doc.rect(0, 0, W, 4).fill(CLR.dark);

  // ── Page label
  doc.font(FONT.body).fontSize(7).fillColor(CLR.goldWarm)
    .text(ui(order, "JOUW MENSELIJK ONTWERP", "YOUR HUMAN DESIGN"), ML, 18, { characterSpacing: 2.5 });

  // ── Name + birth data (right-aligned)
  const bd = order.birth_data || {};
  if (order.customer_name) {
    doc.font(FONT.displayLight).fontSize(11).fillColor(CLR.textMuted)
      .text(order.customer_name, ML, 14, { width: TW, align: "right" });
  }
  if (bd.day) {
    const bStr = [
      bd.day + "-" + bd.month + "-" + bd.year,
      bd.place || null,
    ].filter(Boolean).join("  ·  ");
    doc.font(FONT.bodyLight).fontSize(7.5).fillColor(CLR.textLight)
      .text(bStr, ML, 28, { width: TW, align: "right" });
  }

  // ── TYPE HERO BAND
  const accent = typeAccent(chart.type);
  const heroY  = 56;
  const heroH  = 90;

  doc.rect(0, heroY, W, heroH).fill(accent.bg);
  // Left color bar
  doc.rect(0, heroY, 6, heroH).fill(accent.bar);
  // Right fade strip (decorative)
  doc.save();
  doc.rect(W - 80, heroY, 80, heroH).fillOpacity(0.08).fill(accent.bar);
  doc.restore();

  // TYPE label
  doc.font(FONT.body).fontSize(6.5).fillColor(accent.bar)
    .text(ui(order, "ENERGIE TYPE", "ENERGY TYPE"), ML + 16, heroY + 14, { characterSpacing: 2 });

  // TYPE value — large Cormorant Italic
  doc.font(FONT.display).fontSize(48).fillColor(accent.fg)
    .text(chart.type || "—", ML + 16, heroY + 24, { width: TW - 24, lineGap: 0 });

  // ── KEY DATA — 3-column row (Strategy / Authority / Profile)
  const row1Y = heroY + heroH + 28;
  const col3  = TW / 3;

  const row1 = [
    { label: ui(order, "STRATEGIE",  "STRATEGY"),  value: chart.strat   || "—" },
    { label: ui(order, "AUTORITEIT", "AUTHORITY"), value: chart.auth    || "—" },
    { label: ui(order, "PROFIEL",    "PROFILE"),   value: chart.profile || "—" },
  ];

  // Thin gold top rule
  doc.rect(ML, row1Y - 12, TW, 0.75).fill(CLR.gold);

  row1.forEach(function(item, i) {
    const cx = ML + i * col3;
    if (i > 0) {
      doc.save();
      doc.rect(cx, row1Y - 8, 0.5, 44).fillOpacity(0.25).fill(CLR.gold);
      doc.restore();
    }
    doc.font(FONT.bodyLight).fontSize(6.5).fillColor(CLR.textLight)
      .text(item.label, cx, row1Y, { width: col3 - 4, characterSpacing: 1.5 });
    doc.font(FONT.displayRegular).fontSize(13).fillColor(CLR.dark)
      .text(item.value, cx, row1Y + 10, { width: col3 - 8 });
  });

  // ── KEY DATA — 2-column row (Signature / Not-Self)
  const row2Y = row1Y + 52;
  const col2  = TW / 2;

  doc.rect(ML, row2Y - 12, TW, 0.5).fill(CLR.border);

  const row2 = [
    { label: ui(order, "SIGNATUUR",      "SIGNATURE"),       value: chart.sig     || "—" },
    { label: ui(order, "NOT-SELF THEMA", "NOT-SELF THEME"),  value: chart.notSelf || "—" },
  ];
  row2.forEach(function(item, i) {
    const cx = ML + i * col2;
    if (i > 0) {
      doc.save();
      doc.rect(cx, row2Y - 8, 0.5, 40).fillOpacity(0.2).fill(CLR.gold);
      doc.restore();
    }
    doc.font(FONT.bodyLight).fontSize(6.5).fillColor(CLR.textLight)
      .text(item.label, cx, row2Y, { width: col2 - 4, characterSpacing: 1.5 });
    doc.font(FONT.displayRegular).fontSize(13).fillColor(CLR.dark)
      .text(item.value, cx, row2Y + 10, { width: col2 - 8 });
  });

  // ── CENTERS OVERVIEW
  const centersY = row2Y + 60;
  doc.rect(ML, centersY - 12, TW, 0.75).fill(CLR.gold);

  doc.font(FONT.bodyLight).fontSize(6.5).fillColor(CLR.textLight)
    .text(ui(order, "ENERGIECENTRA", "ENERGY CENTERS"), ML, centersY, { characterSpacing: 1.5 });

  const defined = new Set((chart.definedCenters || []).map(function(c) { return c.trim(); }));

  const nodeSize  = 28;
  const nodeGap   = 6;
  const perRow    = Math.min(9, Math.floor(TW / (nodeSize + nodeGap)));
  const startX    = ML;
  let   nodeX     = startX;
  let   nodeY     = centersY + 14;

  const CENTER_MAP = (order.language === "en") ? CENTER_EN : CENTER_NL;

  ALL_CENTERS.forEach(function(center, i) {
    if (i > 0 && i % perRow === 0) {
      nodeX  = startX;
      nodeY += nodeSize + nodeGap + 12;
    }
    const isDef = defined.has(center);
    const centerLabel = CENTER_MAP[center] || center;

    if (isDef) {
      doc.rect(nodeX, nodeY, nodeSize, nodeSize).fill(CLR.brand);
      doc.font(FONT.bodyLight).fontSize(6).fillColor("#FFFFFF")
        .text(centerLabel, nodeX, nodeY + 10, {
          width: nodeSize, align: "center", lineBreak: false,
        });
    } else {
      doc.save();
      doc.lineWidth(0.75).strokeColor(CLR.border)
        .rect(nodeX, nodeY, nodeSize, nodeSize).stroke();
      doc.restore();
      doc.font(FONT.bodyLight).fontSize(6).fillColor(CLR.textLight)
        .text(centerLabel, nodeX, nodeY + 10, {
          width: nodeSize, align: "center", lineBreak: false,
        });
    }

    nodeX += nodeSize + nodeGap;
  });

  // Centers legend
  const legY = nodeY + nodeSize + 14;
  doc.rect(ML, legY, nodeSize, 8).fill(CLR.brand);
  doc.font(FONT.bodyLight).fontSize(7).fillColor(CLR.textMuted)
    .text(ui(order, "Gedefinieerd — vaste eigen energie", "Defined — fixed own energy"), ML + nodeSize + 6, legY + 1);

  doc.save();
  doc.lineWidth(0.75).strokeColor(CLR.border).rect(ML + 130, legY, nodeSize, 8).stroke();
  doc.restore();
  doc.font(FONT.bodyLight).fontSize(7).fillColor(CLR.textMuted)
    .text(ui(order, "Open — ontvangt uit omgeving", "Open — receives from environment"), ML + 130 + nodeSize + 6, legY + 1);

  // ── INCARNATION CROSS
  if (chart.cross) {
    const crossY = legY + 28;
    doc.rect(ML, crossY - 12, TW, 0.5).fill(CLR.border);
    doc.font(FONT.bodyLight).fontSize(6.5).fillColor(CLR.textLight)
      .text(ui(order, "INKARNATIE-KRUIS", "INCARNATION CROSS"), ML, crossY, { characterSpacing: 1.5 });
    doc.font(FONT.displayRegular).fontSize(13).fillColor(CLR.dark)
      .text(chart.cross, ML, crossY + 10, { width: TW });
  }

  // ── Footer (light page — no dark footer bar)
  doc.rect(ML, FY - 8, TW, 0.5).fill(CLR.border);
  doc.font(FONT.body).fontSize(7).fillColor(CLR.textLight)
    .text(order.report_title || "", ML, FY, { width: TW / 2 });
  doc.font(FONT.body).fontSize(7).fillColor(CLR.textLight)
    .text("Faculty of Human Design", ML, FY, { width: TW, align: "right" });
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export async function generatePDF({ order, sections }) {
  return new Promise(function(resolve, reject) {

    const adjustedSections = adjustSectionTitles(
      sections.filter(function(s) { return s.text && s.text.trim().length > 80; }),
      order
    );

    const doc = new PDFDocument({
      size: "A4",
      autoFirstPage: true,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      info: {
        Title:    order.report_title || "Rapport",
        Author:   "Faculty of Human Design",
        Subject:  "Persoonlijk rapport voor " + (order.customer_name || ""),
        Keywords: "Human Design, persoonlijk rapport, Faculty of Human Design",
      },
    });

    const chunks = [];
    doc.on("data",  function(c) { chunks.push(c); });
    doc.on("end",   function() { resolve(Buffer.concat(chunks)); });
    doc.on("error", reject);

    registerFonts(doc);

    // Page counter — incremented by every drawFooter() call.
    // Profile page draws its own footer (doesn't call drawFooter), so starts at 0.
    doc.__pg = 0;

    drawCover(doc, order, adjustedSections);

    const chartData    = (order.birth_data || {}).chart || {};
    const hasChartData = chartData.type && Array.isArray(chartData.definedCenters);

    // Profile summary page — always shown when chart data is available
    if (hasChartData) {
      drawProfilePage(doc, order, chartData);
    }

    // Bodygraph visualisation
    if (hasChartData) {
      drawBodygraphPage(doc, order, chartData);
    }

    adjustedSections.forEach(function(section, idx) {
      const cleanText = cleanSectionText(section.text, section.title);
      qaSection(cleanText, section.title);

      // Attach cleanText to section so drawSectionHeader can extract a pull quote
      const sectionWithClean = Object.assign({}, section, { cleanText: cleanText });

      doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
      drawSectionHeader(doc, sectionWithClean, idx, order);
      // Content starts after the dark opener band + breathing room
      let y = HEADER_H + 20;
      drawFooter(doc, order);
      const segments = groupClosingBlocks(parseSection(cleanText));
      let pageHasContent = false;

      for (const seg of segments) {
        if (seg.type === "block") {
          const prevY = y;
          y = drawBlock(doc, order, seg.block, seg.lines, y);
          if (y !== prevY) pageHasContent = true;
          continue;
        }

        if (seg.type === "block-grid") {
          // Always render closing blocks on their own designed page —
          // this prevents accidentally sparse white continuation pages.
          drawSectionClosingPage(doc, order, section.title, idx, seg.blocks);
          pageHasContent = true;
          continue;
        }

        // Split on double newlines AND on single newlines that precede a likely
        // subheading (short line, capitalised, no trailing period/comma/question).
        // This handles Claude's single-newline paragraph separators correctly.
        const rawProse = seg.lines.join("\n");
        const paras = rawProse
          .split(/\n\n+|\n(?=[A-ZÁÉÍÓÚ][^\n]{2,60}(?:\n|$)(?![•\-–\d]))/u)
          .map(function(p) { return stripMd(p.trim()); })
          .filter(Boolean);

        for (const para of paras) {
          // A subhead is: short, capitalised, no sentence-ending punctuation,
          // no bullet/number prefix, and doesn't contain multiple sentences.
          const isSubhead =
            para.length <= 80
            && !para.endsWith(".")
            && !para.endsWith("?")
            && !para.endsWith("!")
            && !para.endsWith(",")
            && !para.endsWith(":")
            && para.length > 3
            && para[0] === para[0].toUpperCase()
            && !para.startsWith("•")
            && !para.startsWith("-")
            && !/^\d+\./.test(para)
            && !para.includes(". ")        // no mid-sentence periods
            && para.split(/\s+/).length <= 10;

          if (isSubhead) {
            // Subhead: Display SemiBold with generous breathing room
            const opts = { width: PMW, lineGap: 2 };
            const h    = SUB_BEFORE + strH(doc, para, opts) + SUB_AFTER + 4;
            if (needsNewPage(doc, y, h + 40)) {
              drawFooter(doc, order);
              y = addContentPage(doc, order);
              pageHasContent = false;
            }
            y += SUB_BEFORE;
            doc.font(FONT.displaySemiBold).fontSize(SUB_SIZE).fillColor(CLR.navy)
              .text(para, PMX, y, opts);
            // Short gold rule under subhead
            doc.rect(PMX, doc.y + 3, 24, 0.75).fill(CLR.gold);
            y = doc.y + SUB_AFTER + 4;
          } else {
            // Body paragraph — 11pt Inter, generous lineGap
            const opts = { width: PMW, lineGap: BODY_GAP };
            const h    = strH(doc, para, opts) + BODY_PARA_SEP;
            if (needsNewPage(doc, y, h)) {
              drawFooter(doc, order);
              y = addContentPage(doc, order);
              pageHasContent = false;
            }
            doc.font(FONT.body).fontSize(BODY_SIZE).fillColor(CLR.text)
              .text(para, PMX, y, opts);
            y = doc.y + BODY_PARA_SEP;
          }
          pageHasContent = true;
        }
      }

      if (!pageHasContent) {
        console.warn("[PDF] Section produced no renderable content: " + section.title);
      }

      y += 8;
    });

    // ── CLOSING PAGE
    doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
    doc.rect(0, 0, W, H).fill(CLR.dark);
    doc.rect(0, 0, W, 4).fill(CLR.gold);
    doc.rect(0, H - 4, W, 4).fill(CLR.gold);

    // Geometric decoration (faint, centered lower half)
    drawCoverDecoration(doc, H * 0.62);

    // ── Institution label
    doc.font(FONT.bodyLight).fontSize(6).fillColor("#5A5438")
      .text("FACULTY OF HUMAN DESIGN  ·  IBIZA", 0, 28, {
        align: "center", width: W, characterSpacing: 4,
      });

    // ── Main message
    doc.font(FONT.display).fontSize(34).fillColor("#FFFFFF")
      .text(ui(order, "Met dank voor je vertrouwen.", "Thank you for your trust."), ML, 76, { align: "center", width: TW, lineGap: 8 });

    // Gold triple-line ornament
    const ornY = doc.y + 20;
    doc.save();
    doc.rect(W / 2 - 48, ornY, 96, 0.75).fill(CLR.gold);
    doc.fillOpacity(0.35).rect(W / 2 - 80, ornY, 32, 0.5).fill(CLR.gold);
    doc.fillOpacity(0.35).rect(W / 2 + 48, ornY, 32, 0.5).fill(CLR.gold);
    doc.restore();

    // ── Personal identity recap (name + type)
    const bd2    = order.birth_data || {};
    const chart2 = bd2.chart || {};
    if (order.customer_name) {
      doc.font(FONT.displayLight).fontSize(18).fillColor("#C4B898")
        .text(order.customer_name, 0, ornY + 18, { align: "center", width: W });
    }
    if (chart2.type) {
      const typeStr = [chart2.type, chart2.profile ? ui(order, "Profiel ", "Profile ") + chart2.profile : null]
        .filter(Boolean).join("  ·  ");
      doc.font(FONT.body).fontSize(8).fillColor(CLR.goldWarm)
        .text(typeStr, 0, doc.y + 5, { align: "center", width: W });
    }

    // ── Three brand pillars (concise, inspiring) — language-aware
    const pillars = order.language === "en" ? [
      { num: "I",   text: "Stay curious about your design — it deepens as you live with it." },
      { num: "II",  text: "Trust your strategy and authority. They are your personal navigation system." },
      { num: "III", text: "This report is a starting point, not a destination. You are the expert on yourself." },
    ] : [
      { num: "I",   text: "Blijf nieuwsgierig naar je ontwerp — het verdiept zich naarmate je er meer mee leeft." },
      { num: "II",  text: "Vertrouw op je strategie en autoriteit. Zij zijn jouw persoonlijke navigatiesysteem." },
      { num: "III", text: "Dit rapport is een startpunt, geen eindbestemming. Jij bent de expert op jezelf." },
    ];

    const pillarY = doc.y + 36;
    const pColW   = (TW - 32) / 3;

    // Subtle separator
    doc.save();
    doc.rect(ML, pillarY - 12, TW, 0.5).fillOpacity(0.15).fill(CLR.gold);
    doc.restore();

    pillars.forEach(function(p, i) {
      const px = ML + i * (pColW + 16);

      // Roman numeral
      doc.font(FONT.display).fontSize(14).fillColor(CLR.gold)
        .text(p.num, px, pillarY, { width: pColW, align: "center" });

      // Short divider
      doc.save();
      doc.rect(px + pColW / 2 - 10, doc.y + 3, 20, 0.5).fillOpacity(0.4).fill(CLR.gold);
      doc.restore();

      // Text
      doc.font(FONT.bodyLight).fontSize(8).fillColor("#6A6460")
        .text(p.text, px, doc.y + 8, { width: pColW, align: "center", lineGap: 3 });
    });

    // ── Separator before contact
    const contSepY = Math.max(doc.y + 36, H * 0.74);
    doc.save();
    doc.rect(ML, contSepY, TW, 0.5).fillOpacity(0.15).fill(CLR.gold);
    doc.restore();

    // ── Contact block (centered)
    doc.font(FONT.bodyLight).fontSize(6.5).fillColor("#484440")
      .text(ui(order, "Vragen of een persoonlijk gesprek?", "Questions or a personal conversation?"), 0, contSepY + 14, { align: "center", width: W });

    doc.font(FONT.displayRegular).fontSize(13).fillColor("#7A6840")
      .text("info@facultyhd.com", 0, contSepY + 26, { align: "center", width: W });

    doc.font(FONT.bodyLight).fontSize(6.5).fillColor("#383430")
      .text("www.facultyhd.com", 0, contSepY + 42, { align: "center", width: W });

    // ── Copyright
    doc.font(FONT.bodyLight).fontSize(6).fillColor("#282420")
      .text(ui(order, "© 2026 Faculty of Human Design — Ibiza, Spanje  ·  Alle rechten voorbehouden", "© 2026 Faculty of Human Design — Ibiza, Spain  ·  All rights reserved"), 0, H - 24, {
        align: "center", width: W,
      });

    doc.end();
  });
}
