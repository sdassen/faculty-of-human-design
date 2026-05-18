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
  doc.font("Helvetica").fontSize(7).fillColor(CLR.textLight)
    .text(order.report_title || "", ML, FY, { width: TW / 2 });
  doc.font("Helvetica").fontSize(7).fillColor(CLR.textLight)
    .text("Faculty of Human Design", ML, FY, { width: TW, align: "right" });
  doc.restore();
}

// ─── BODYGRAPH PAGE ──────────────────────────────────────────────────────────
function drawBodygraphPage(doc, order, chart) {
  doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, W, 3).fill(CLR.dark);

  doc.font("Helvetica").fontSize(7).fillColor(CLR.goldWarm)
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
  doc.font("Helvetica").fontSize(6.5).fillColor(CLR.goldWarm)
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
    const col  = i % 2;
    const row  = Math.floor(i / 2);
    const itemX = ML + col * colW;
    const itemY = cy + row * 26;
    doc.font("Helvetica").fontSize(7).fillColor(CLR.textMuted)
       .text(it.label.toUpperCase(), itemX, itemY, { characterSpacing: 1.5 });
    doc.font(FONT.displayRegular).fontSize(12).fillColor(CLR.dark)
       .text(it.value, itemX, itemY + 10);
  });

  const legY = FY - 60;
  doc.rect(ML, legY, TW, 0.5).fill(CLR.border);
  doc.font("Helvetica").fontSize(7).fillColor(CLR.goldWarm)
    .text("LEGENDA", ML, legY + 10, { characterSpacing: 2 });

  doc.rect(ML, legY + 24, 12, 8).fillAndStroke("#876B4A", "#2A2620");
  doc.font("Helvetica").fontSize(8).fillColor(CLR.text)
    .text("Gedefinieerd centrum — vaste eigen energie", ML + 18, legY + 26);

  doc.rect(ML + 200, legY + 24, 12, 8).fillAndStroke("#FFFFFF", "#2A2620");
  doc.font("Helvetica").fontSize(8).fillColor(CLR.text)
    .text("Open centrum — neemt op uit omgeving", ML + 218, legY + 26);

  drawFooter(doc, order);
}

// ─── COVER PAGE ──────────────────────────────────────────────────────────────
function drawCover(doc, order, sections) {
  doc.rect(0, 0, W, H).fill(CLR.dark);
  doc.rect(0, 0, W, 3).fill(CLR.gold);
  doc.rect(0, H - 3, W, 3).fill(CLR.gold);

  doc.font("Helvetica").fontSize(6.5).fillColor("#7A6840")
    .text("FACULTY OF HUMAN DESIGN  ·  IBIZA  ·  EST. 2014", 0, 64, {
      align: "center", width: W, characterSpacing: 3.5,
    });

  doc.font(FONT.display).fontSize(28).fillColor("#FFFFFF")
    .text(order.report_title || "Persoonlijk Rapport", ML, 140, {
      align: "center", width: TW, lineGap: 6,
    });

  const gy = doc.y + 20;
  doc.rect(W / 2 - 24, gy, 48, 1).fill(CLR.gold);

  doc.font("Helvetica").fontSize(13).fillColor("#B8A880")
    .text(order.customer_name || "", 0, gy + 16, { align: "center", width: W });

  const bd    = order.birth_data || {};
  const chart = bd.chart || {};
  let iy = gy + 40;

  if (bd.day) {
    const parts = [
      bd.day + "-" + bd.month + "-" + bd.year,
      bd.hour != null ? bd.hour + ":" + String(bd.minute || 0).padStart(2, "0") : null,
      bd.place || null,
    ].filter(Boolean);
    doc.font("Helvetica").fontSize(8.5).fillColor("#504C48")
      .text(parts.join("  ·  "), 0, iy, { align: "center", width: W });
    iy += 18;
  }

  if (chart.type) {
    const cparts = [
      chart.type,
      chart.profile ? "Profiel " + chart.profile : null,
      chart.auth || null,
    ].filter(Boolean);
    doc.font("Helvetica").fontSize(8.5).fillColor(CLR.goldWarm)
      .text(cparts.join("  ·  "), 0, iy, { align: "center", width: W });
    iy += 16;
  }

  const sumY = Math.max(iy + 36, 360);
  const sumItems = [
    chart.type    ? "Type: " + chart.type       : null,
    chart.strat   ? "Strategie: " + chart.strat : null,
    chart.auth    ? "Autoriteit: " + chart.auth : null,
    chart.profile ? "Profiel: " + chart.profile : null,
    chart.sig     ? "Signatuur: " + chart.sig   : null,
    chart.notSelf ? "Not-Self: " + chart.notSelf : null,
    (chart.definedCenters && chart.definedCenters.length)
      ? "Gedefinieerd: " + chart.definedCenters.join(", ") : null,
    chart.cross   ? "Inkarnatie-Kruis: " + chart.cross : null,
  ].filter(Boolean);

  if (sumItems.length) {
    doc.rect(ML, sumY - 8, TW, 1).fill("#2A2620");
    doc.font("Helvetica").fontSize(6).fillColor("#7A6840")
      .text("JOUW ONTWERP — KERNDATA", ML, sumY + 2, { characterSpacing: 2.5 });
    let sy = sumY + 16;
    for (const item of sumItems.slice(0, 8)) {
      if (sy > H - 100) break;
      doc.rect(ML, sy + 3, 3, 8).fill(CLR.gold);
      doc.font("Helvetica").fontSize(8.5).fillColor("#A09880")
        .text(item, ML + 10, sy, { width: TW - 10 });
      sy += 16;
    }
    doc.rect(ML, sy + 6, TW, 1).fill("#2A2620");
  }

  const tocY = Math.max(doc.y + 32, H * 0.68);
  if (tocY < H - 100) {
    doc.font("Helvetica").fontSize(6).fillColor("#3A3630")
      .text("INHOUD", ML, tocY, { characterSpacing: 2.5 });
    let ly = tocY + 16;
    sections.forEach(function(s, i) {
      if (ly < H - 52) {
        doc.font("Helvetica").fontSize(8).fillColor("#4A4640")
          .text(String(i + 1).padStart(2, "0") + "  " + s.title, ML + 10, ly);
        ly += 14;
      }
    });
  }

  doc.font("Helvetica").fontSize(7).fillColor("#2A2620")
    .text("© 2026 Faculty of Human Design — Ibiza, Spanje", 0, H - 30, {
      align: "center", width: W,
    });
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function drawSectionHeader(doc, section, idx) {
  doc.rect(0, 0, W, 3).fill(CLR.dark);
  doc.rect(ML - 16, 10, 2, 52).fill(CLR.gold);

  doc.font("Helvetica").fontSize(8).fillColor(CLR.goldWarm)
    .text(String(idx + 1).padStart(2, "0"), ML, 14, { characterSpacing: 1 });

  doc.font(FONT.displayRegular).fontSize(20).fillColor(CLR.dark)
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

  doc.font("Helvetica").fontSize(7).fillColor(block.accent)
    .text(block.label.toUpperCase(), ML + PAD, y + PAD, {
      width: innerW, characterSpacing: 1.5,
    });

  let iy = y + PAD + strH(doc, block.label, { width: innerW, fontSize: 7 }) + 4;

  for (let i = 0; i < items.length; i++) {
    const item   = items[i];
    const bullet = block.key === "refl" ? (i + 1) + "." : "•";
    doc.font("Helvetica").fontSize(9.5).fillColor(block.accent)
      .text(bullet, ML + PAD + 2, iy, { width: 12, lineBreak: false });
    doc.font("Helvetica").fontSize(9.5).fillColor(CLR.text)
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
      drawFooter(doc, order);

      let y = doc.y + 18;
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
            doc.font(FONT.displayRegular).fontSize(12.5).fillColor(CLR.navy)
              .text(para, ML, y, opts);
          } else {
            doc.font("Helvetica").fontSize(10.5).fillColor(CLR.text)
              .text(para, ML, y, opts);
          }
          y = doc.y + (isSubhead ? 6 : 13);
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
    doc.rect(0, 0, W, 3).fill(CLR.gold);
    doc.rect(0, H - 3, W, 3).fill(CLR.gold);

    doc.font(FONT.display).fontSize(22).fillColor("#FFFFFF")
      .text("Met dank voor je vertrouwen.", ML, 180, { align: "center", width: TW });

    const bd2 = order.birth_data || {};
    const closingPlace = bd2.place ? " — geboren in " + bd2.place : "";
    const closing = "Dit rapport is persoonlijk samengesteld op basis van de exacte"
      + " geboortedata van " + (order.customer_name || "jou") + closingPlace
      + ". Human Design verdiept zich naarmate je er meer mee leeft. Neem de tijd.";

    doc.font("Helvetica").fontSize(9.5).fillColor("#7A7470")
      .text(closing, ML + 24, 230, { align: "center", width: TW - 48, lineGap: 4 });

    const ry = doc.y + 28;
    doc.rect(W / 2 - 20, ry, 40, 1).fill(CLR.gold);

    doc.font("Helvetica").fontSize(8).fillColor("#504C48")
      .text("Vragen of opmerkingen? info@facultyhd.com", 0, ry + 14, { align: "center", width: W });

    doc.font("Helvetica").fontSize(7).fillColor("#2A2620")
      .text("© 2026 Faculty of Human Design — Ibiza, Spanje  ·  Alle rechten voorbehouden", 0, H - 30, {
        align: "center", width: W,
      });

    doc.end();
  });
}
