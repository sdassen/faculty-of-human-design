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
  tintChart: "#EEF1F6",  accentChart: "#1C2E4A",
  tintVal:   "#FDF6EC",  accentVal:   "#C9A85C",
  tintPrakt: "#F0F5F1",  accentPrakt: "#4A7A5A",
  tintWeek:  "#F3F0F8",  accentWeek:  "#3D2C5E",
  tintRefl:  "#F5F3EE",  accentRefl:  "#9A8050",
};

// ─── FORBIDDEN / QA STRINGS ──────────────────────────────────────────────────
const FORBIDDEN_STRINGS = ["**", "* ", "*\n", "##", "###", "---\n"];

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
const BLOCKS = [
  { key: "chart",  label: "In jouw chart",   tint: CLR.tintChart,  accent: CLR.accentChart },
  { key: "val",    label: "Valkuilen",        tint: CLR.tintVal,    accent: CLR.accentVal   },
  { key: "prakt",  label: "Praktijk",         tint: CLR.tintPrakt,  accent: CLR.accentPrakt },
  { key: "week",   label: "Deze week",        tint: CLR.tintWeek,   accent: CLR.accentWeek  },
  { key: "refl",   label: "Reflectievragen",  tint: CLR.tintRefl,   accent: CLR.accentRefl  },
];

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
      return line.trim().toLowerCase().startsWith(b.label.toLowerCase() + ":")
        || line.trim().toLowerCase() === b.label.toLowerCase();
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
      current.lines.push(line);
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
  doc.rect(0, 0, W, 3).fill(CLR.dark);
  drawFooter(doc, order);
  return 24;
}

function drawFooter(doc, order) {
  doc.save();
  doc.rect(ML, FY - 8, TW, 0.5).fill(CLR.border);
  doc.font(FONT.body).fontSize(7).fillColor(CLR.textLight)
    .text(order.report_title || "", ML, FY, { width: TW / 2 });
  doc.font(FONT.body).fontSize(7).fillColor(CLR.textLight)
    .text("Faculty of Human Design", ML, FY, { width: TW, align: "right" });
  doc.restore();
}

// ─── BODYGRAPH PAGE ──────────────────────────────────────────────────────────
function drawBodygraphPage(doc, order, chart) {
  doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, W, 3).fill(CLR.dark);

  doc.font(FONT.body).fontSize(7).fillColor(CLR.goldWarm)
    .text("JOUW BODYGRAPH", ML, 28, { characterSpacing: 3, width: TW });

  doc.font(FONT.display).fontSize(22).fillColor(CLR.dark)
    .text("Het visuele kaartwerk van jouw ontwerp", ML, 46, { width: TW });

  doc.rect(ML, 92, 32, 1.5).fill(CLR.gold);

  const bgScale = 0.95;
  const bgSize  = bodygraphSize(bgScale);
  const bgX = (W - bgSize.width) / 2;
  const bgY = 110;
  drawBodygraph(doc, chart, { x: bgX, y: bgY, scale: bgScale });

  const dataY = bgY + bgSize.height + 26;
  doc.font(FONT.body).fontSize(6.5).fillColor(CLR.goldWarm)
    .text("DE KERNDATA VAN DEZE CHART", ML, dataY, { characterSpacing: 2.5 });

  const items = [
    chart.type    ? { label: "Type",       value: chart.type }    : null,
    chart.strat   ? { label: "Strategie",  value: chart.strat }   : null,
    chart.auth    ? { label: "Autoriteit", value: chart.auth }    : null,
    chart.profile ? { label: "Profiel",    value: chart.profile } : null,
    chart.sig     ? { label: "Signatuur",  value: chart.sig }     : null,
    chart.notSelf ? { label: "Not-Self",   value: chart.notSelf } : null,
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
    .text("LEGENDA", ML, legY + 10, { characterSpacing: 2 });

  doc.rect(ML, legY + 24, 12, 8).fillAndStroke("#876B4A", "#2A2620");
  doc.font(FONT.body).fontSize(8).fillColor(CLR.text)
    .text("Gedefinieerd centrum — vaste eigen energie", ML + 18, legY + 26);

  doc.rect(ML + 200, legY + 24, 12, 8).fillAndStroke("#FFFFFF", "#2A2620");
  doc.font(FONT.body).fontSize(8).fillColor(CLR.text)
    .text("Open centrum — neemt op uit omgeving", ML + 218, legY + 26);

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

  // ── Geometric decoration — drawn first so text sits on top
  //    Center it between institution label and chart grid
  drawCoverDecoration(doc, 290);

  // ── Institution label
  doc.font(FONT.bodyLight).fontSize(6).fillColor("#5A5438")
    .text("FACULTY OF HUMAN DESIGN  ·  IBIZA  ·  EST. 2014", 0, 28, {
      align: "center", width: W, characterSpacing: 4,
    });

  // ── Report title (Cormorant Italic — the signature display face)
  doc.font(FONT.display).fontSize(38).fillColor("#FFFFFF")
    .text(order.report_title || "Persoonlijk Rapport", ML, 112, {
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
    const cparts = [
      chart.type,
      chart.profile ? "Profiel " + chart.profile : null,
      chart.auth    || null,
    ].filter(Boolean);
    doc.font(FONT.body).fontSize(8).fillColor(CLR.goldWarm)
      .text(cparts.join("  ·  "), 0, iy, { align: "center", width: W });
  }

  // ── Chart data grid  (2 columns × up to 4 rows — label above, value below)
  const gridItems = [
    chart.type    ? { label: "TYPE",            value: chart.type    } : null,
    chart.strat   ? { label: "STRATEGIE",       value: chart.strat   } : null,
    chart.auth    ? { label: "AUTORITEIT",      value: chart.auth    } : null,
    chart.profile ? { label: "PROFIEL",         value: chart.profile } : null,
    chart.sig     ? { label: "SIGNATUUR",       value: chart.sig     } : null,
    chart.notSelf ? { label: "NOT-SELF THEMA",  value: chart.notSelf } : null,
    (chart.definedCenters && chart.definedCenters.length)
      ? { label: "GEDEFINIEERD",
          value: chart.definedCenters.join(", ") } : null,
    chart.cross   ? { label: "INKARNATIE-KRUIS", value: chart.cross  } : null,
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
      .text("JOUW MENSELIJK ONTWERP", ML, gridY - 8, { characterSpacing: 3 });

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
      .text("INHOUD", ML, tocY, { characterSpacing: 3 });

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
    .text("© 2026 Faculty of Human Design — Ibiza, Spanje", 0, H - 26, {
      align: "center", width: W,
    });
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function drawSectionHeader(doc, section, idx) {
  doc.rect(0, 0, W, 3).fill(CLR.dark);
  doc.rect(ML - 16, 10, 2, 52).fill(CLR.gold);

  doc.font(FONT.body).fontSize(8).fillColor(CLR.goldWarm)
    .text(String(idx + 1).padStart(2, "0"), ML, 14, { characterSpacing: 1 });

  doc.font(FONT.displaySemiBold).fontSize(22).fillColor(CLR.dark)
    .text(section.title, ML, 26, { width: TW });

  const uy = doc.y + 6;
  doc.rect(ML, uy, 32, 1.5).fill(CLR.gold);
}

// ─── BLOCK RENDERER ──────────────────────────────────────────────────────────
function drawBlock(doc, order, block, lines, y) {
  const PAD    = 12;
  const innerW = TW - PAD * 2 - 4;

  const items = lines
    .map(function(l) {
      return stripMd(l.replace(/^[•\-–—*]\s*/, "").replace(/^\d+\.\s*/, ""));
    })
    .filter(Boolean);

  if (!items.length) return y;

  let bH = PAD;
  bH += strH(doc, block.label, { width: innerW, fontSize: 7 }) + 6;
  for (const item of items) {
    bH += strH(doc, item, { width: innerW - 14, lineGap: 2, fontSize: 9.5 }) + 6;
  }
  bH += PAD;

  if (needsNewPage(doc, y, bH + 16)) {
    drawFooter(doc, order);
    y = addContentPage(doc, order);
  }

  doc.rect(ML, y, TW, bH).fill(block.tint);
  doc.rect(ML, y, 3, bH).fill(block.accent);

  doc.font(FONT.bodyMedium).fontSize(7).fillColor(block.accent)
    .text(block.label.toUpperCase(), ML + PAD, y + PAD, {
      width: innerW, characterSpacing: 1.5,
    });

  let iy = y + PAD + strH(doc, block.label, { width: innerW, fontSize: 7 }) + 4;

  for (let i = 0; i < items.length; i++) {
    const item   = items[i];
    const bullet = block.key === "refl" ? (i + 1) + "." : "•";
    doc.font(FONT.bodyMedium).fontSize(9.5).fillColor(block.accent)
      .text(bullet, ML + PAD + 2, iy, { width: 12, lineBreak: false });
    doc.font(FONT.body).fontSize(9.5).fillColor(CLR.text)
      .text(item, ML + PAD + 16, iy, { width: innerW - 14, lineGap: 2 });
    iy = doc.y + 6;
  }

  return y + bH + 14;
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

    drawCover(doc, order, adjustedSections);

    const chartData    = (order.birth_data || {}).chart || {};
    const hasChartData = chartData.type && Array.isArray(chartData.definedCenters);
    if (hasChartData) {
      drawBodygraphPage(doc, order, chartData);
    }

    adjustedSections.forEach(function(section, idx) {
      const cleanText = cleanSectionText(section.text, section.title);
      qaSection(cleanText, section.title);

      doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
      drawSectionHeader(doc, section, idx);
      let y = doc.y + 18;  // capture y BEFORE footer (footer sets doc.y to page bottom)
      drawFooter(doc, order);
      const segments = parseSection(cleanText);
      let pageHasContent = false;

      for (const seg of segments) {
        if (seg.type === "block") {
          const prevY = y;
          y = drawBlock(doc, order, seg.block, seg.lines, y);
          if (y !== prevY) pageHasContent = true;
          continue;
        }

        const paras = seg.lines
          .join("\n")
          .split(/\n\n+/)
          .map(function(p) { return stripMd(p.trim()); })
          .filter(Boolean);

        for (const para of paras) {
          const isSubhead =
            para.length <= 70
            && !para.endsWith(".")
            && !para.endsWith("?")
            && para[0] === para[0].toUpperCase()
            && !para.startsWith("•")
            && !/^\d+\./.test(para)
            && para.split(" ").length <= 8;

          const opts = { width: TW, lineGap: isSubhead ? 1 : 3 };
          const h    = strH(doc, para, opts) + (isSubhead ? 14 : 16);

          if (needsNewPage(doc, y, h)) {
            drawFooter(doc, order);
            y = addContentPage(doc, order);
            pageHasContent = false;
          }

          if (isSubhead) {
            doc.font(FONT.displaySemiBold).fontSize(13).fillColor(CLR.navy)
              .text(para, ML, y, opts);
          } else {
            doc.font(FONT.body).fontSize(10.5).fillColor(CLR.text)
              .text(para, ML, y, opts);
          }
          y = doc.y + (isSubhead ? 8 : 13);
          pageHasContent = true;
        }
      }

      if (!pageHasContent) {
        console.warn("[PDF] Section produced no renderable content: " + section.title);
      }

      y += 8;
    });

    doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
    doc.rect(0, 0, W, H).fill(CLR.dark);
    doc.rect(0, 0, W, 4).fill(CLR.gold);
    doc.rect(0, H - 4, W, 4).fill(CLR.gold);

    // Subtle closing decoration — same motif as cover, centered lower
    drawCoverDecoration(doc, H / 2 + 40);

    doc.font(FONT.bodyLight).fontSize(6).fillColor("#5A5438")
      .text("FACULTY OF HUMAN DESIGN", 0, 36, {
        align: "center", width: W, characterSpacing: 4,
      });

    doc.font(FONT.display).fontSize(30).fillColor("#FFFFFF")
      .text("Met dank voor je vertrouwen.", ML, H / 2 - 100, { align: "center", width: TW });

    // Gold ornament
    const ry = doc.y + 18;
    doc.save();
    doc.rect(W / 2 - 40, ry, 80, 0.75).fill(CLR.gold);
    doc.fillOpacity(0.3).rect(W / 2 - 80, ry, 40, 0.5).fill(CLR.gold);
    doc.fillOpacity(0.3).rect(W / 2 + 40, ry, 40, 0.5).fill(CLR.gold);
    doc.restore();

    const bd2 = order.birth_data || {};
    const closingPlace = bd2.place ? " — geboren in " + bd2.place : "";
    const closing = "Dit rapport is persoonlijk samengesteld op basis van de exacte geboortedata van "
      + (order.customer_name || "jou") + closingPlace
      + ". Human Design verdiept zich naarmate je er meer mee leeft. Neem de tijd.";

    doc.font(FONT.body).fontSize(9.5).fillColor("#6A6460")
      .text(closing, ML + 32, ry + 18, { align: "center", width: TW - 64, lineGap: 5 });

    const contactY = doc.y + 32;
    doc.font(FONT.body).fontSize(8).fillColor("#484440")
      .text("info@facultyhd.com", 0, contactY, { align: "center", width: W });

    doc.font(FONT.bodyLight).fontSize(6.5).fillColor("#282420")
      .text("© 2026 Faculty of Human Design — Ibiza, Spanje  ·  Alle rechten voorbehouden", 0, H - 26, {
        align: "center", width: W,
      });

    doc.end();
  });
}
