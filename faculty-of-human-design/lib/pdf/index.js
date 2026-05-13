// PDF generation using PDFKit (pure Node.js, no React dependency)
import PDFDocument from "pdfkit";

// ─── LAYOUT TOKENS ───────────────────────────────────────────────────────────
const W   = 595.28;   // A4 width (points)
const H   = 841.89;   // A4 height (points)
const ML  = 56;       // left margin
const MR  = 56;       // right margin
const TW  = W - ML - MR; // text width
const FY  = H - 36;  // footer baseline

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
  // block tints
  tintChart: "#EEF1F6",  // "In jouw chart" — light navy
  tintVal:   "#FDF6EC",  // "Valkuilen"     — light amber
  tintPrakt: "#F0F5F1",  // "Praktijk"      — light green
  tintWeek:  "#F3F0F8",  // "Deze week"     — light brand
  tintRefl:  "#F5F3EE",  // "Reflecties"    — warm sand
  // block accent bars
  accentChart: "#1C2E4A",
  accentVal:   "#C9A85C",
  accentPrakt: "#4A7A5A",
  accentWeek:  "#3D2C5E",
  accentRefl:  "#9A8050",
};

// ─── BLOCK DETECTION ─────────────────────────────────────────────────────────
const BLOCKS = [
  { key: "chart",  label: "In jouw chart",    tint: CLR.tintChart,  accent: CLR.accentChart },
  { key: "val",    label: "Valkuilen",         tint: CLR.tintVal,    accent: CLR.accentVal   },
  { key: "prakt",  label: "Praktijk",          tint: CLR.tintPrakt,  accent: CLR.accentPrakt },
  { key: "week",   label: "Deze week",         tint: CLR.tintWeek,   accent: CLR.accentWeek  },
  { key: "refl",   label: "Reflectievragen",   tint: CLR.tintRefl,   accent: CLR.accentRefl  },
];

/**
 * Parse the raw AI text into typed segments.
 * Returns an array of { type: "prose"|"block", block?, lines[] }
 */
function parseSection(text) {
  const rawLines = (text || "").split(/\n/);
  const segments = [];
  let current = null;

  const flush = () => {
    if (current && current.lines.some((l) => l.trim())) segments.push(current);
    current = null;
  };

  for (const raw of rawLines) {
    const line = raw.trimEnd();

    // Check if this line is a block header
    const matchedBlock = BLOCKS.find((b) =>
      line.trim().toLowerCase().startsWith(b.label.toLowerCase() + ":")
        || line.trim().toLowerCase() === b.label.toLowerCase()
    );

    if (matchedBlock) {
      flush();
      current = { type: "block", block: matchedBlock, lines: [] };
      continue;
    }

    // Empty line inside a block => keep; empty line between prose => separator
    if (!current) {
      // prose mode
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

/** Returns the height PDFKit would need for a string (used for page-break checks) */
function strH(doc, text, opts) {
  try { return doc.heightOfString(text, opts); } catch { return 14; }
}

function needsNewPage(doc, y, needed = 60) {
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

// ─── COVER PAGE ──────────────────────────────────────────────────────────────
function drawCover(doc, order, sections) {
  doc.rect(0, 0, W, H).fill(CLR.dark);
  doc.rect(0, 0, W, 3).fill(CLR.gold);
  doc.rect(0, H - 3, W, 3).fill(CLR.gold);

  // Institute label
  doc.font("Helvetica").fontSize(6.5).fillColor("#7A6840")
    .text("FACULTY OF HUMAN DESIGN  ·  IBIZA  ·  EST. 2014", 0, 64, {
      align: "center", width: W, characterSpacing: 3.5,
    });

  // Report title
  doc.font("Times-Italic").fontSize(28).fillColor("#FFFFFF")
    .text(order.report_title || "Persoonlijk Rapport", ML, 140, {
      align: "center", width: TW, lineGap: 6,
    });

  // Gold rule
  const gy = doc.y + 20;
  doc.rect(W / 2 - 24, gy, 48, 1).fill(CLR.gold);

  // Customer name
  doc.font("Helvetica").fontSize(13).fillColor("#B8A880")
    .text(order.customer_name || "", 0, gy + 16, { align: "center", width: W });

  // Birth data line
  const bd = order.birth_data || {};
  const chart = bd.chart || {};
  let iy = gy + 40;

  if (bd.day) {
    const bline = [
      `${bd.day}-${bd.month}-${bd.year}`,
      bd.hour != null ? `${bd.hour}:${String(bd.minute || 0).padStart(2, "0")}` : null,
      bd.place || null,
    ].filter(Boolean).join("  ·  ");
    doc.font("Helvetica").fontSize(8.5).fillColor("#504C48")
      .text(bline, 0, iy, { align: "center", width: W });
    iy += 18;
  }

  if (chart.type) {
    const cline = [
      chart.type,
      chart.profile ? `Profiel ${chart.profile}` : null,
      chart.auth || null,
    ].filter(Boolean).join("  ·  ");
    doc.font("Helvetica").fontSize(8.5).fillColor(CLR.goldWarm)
      .text(cline, 0, iy, { align: "center", width: W });
    iy += 16;
  }

  // ── Executive summary box ────────────────────────────────────────────────
  const sumY = Math.max(iy + 36, 360);
  const sumItems = [
    chart.type    && `Type: ${chart.type}`,
    chart.strat   && `Strategie: ${chart.strat}`,
    chart.auth    && `Autoriteit: ${chart.auth}`,
    chart.profile && `Profiel: ${chart.profile}`,
    chart.sig     && `Signatuur: ${chart.sig}`,
    chart.notSelf && `Not-Self: ${chart.notSelf}`,
    chart.definedCenters?.length && `Gedefinieerd: ${chart.definedCenters.join(", ")}`,
    chart.cross   && `Inkarnatie-Kruis: ${chart.cross}`,
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

  // ── Table of contents ────────────────────────────────────────────────────
  const tocY = Math.max(doc.y + 32, H * 0.68);
  if (tocY < H - 100) {
    doc.font("Helvetica").fontSize(6).fillColor("#3A3630")
      .text("INHOUD", ML, tocY, { characterSpacing: 2.5 });
    let ly = tocY + 16;
    sections.forEach((s, i) => {
      if (ly < H - 52) {
        doc.font("Helvetica").fontSize(8).fillColor("#4A4640")
          .text(`${String(i + 1).padStart(2, "0")}  ${s.title}`, ML + 10, ly);
        ly += 14;
      }
    });
  }

  // Footer
  doc.font("Helvetica").fontSize(7).fillColor("#2A2620")
    .text("© 2026 Faculty of Human Design — Ibiza, Spanje", 0, H - 30, {
      align: "center", width: W,
    });
}

// ─── SECTION HEADER PAGE ─────────────────────────────────────────────────────
function drawSectionHeader(doc, section, idx) {
  // Top accent bar
  doc.rect(0, 0, W, 3).fill(CLR.dark);
  // Left gold rule
  doc.rect(ML - 16, 10, 2, 52).fill(CLR.gold);

  // Section number
  doc.font("Helvetica").fontSize(8).fillColor(CLR.goldWarm)
    .text(String(idx + 1).padStart(2, "0"), ML, 14, { characterSpacing: 1 });

  // Section title
  doc.font("Times-Roman").fontSize(20).fillColor(CLR.dark)
    .text(section.title, ML, 26, { width: TW });

  // Underline rule
  const uy = doc.y + 6;
  doc.rect(ML, uy, 32, 1.5).fill(CLR.gold);
}

// ─── BLOCK RENDERERS ─────────────────────────────────────────────────────────

/**
 * Draw a coloured block (In jouw chart / Valkuilen / Praktijk / Deze week / Reflectievragen).
 * Returns new Y position.
 */
function drawBlock(doc, order, block, lines, y) {
  const PAD  = 12;
  const BPAD = 8;
  const innerW = TW - PAD * 2 - 4; // account for left accent bar

  // Collect non-empty text lines
  const items = lines
    .map((l) => l.replace(/^[•\-–—*]\s*/, "").replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);

  if (!items.length) return y;

  // Calculate block height
  let bH = PAD;
  bH += strH(doc, block.label, { width: innerW, fontSize: 7 }) + 6;
  for (const item of items) {
    bH += strH(doc, item, { width: innerW - 14, lineGap: 2, fontSize: 9.5 }) + 6;
  }
  bH += PAD;

  // Page break if needed
  if (needsNewPage(doc, y, bH + 16)) {
    y = addContentPage(doc, order);
    drawFooter(doc, order);
  }

  // Background
  doc.rect(ML, y, TW, bH).fill(block.tint);
  // Left accent bar
  doc.rect(ML, y, 3, bH).fill(block.accent);

  // Label
  doc.font("Helvetica").fontSize(7).fillColor(block.accent)
    .text(block.label.toUpperCase(), ML + PAD, y + PAD, {
      width: innerW, characterSpacing: 1.5,
    });

  let iy = y + PAD + strH(doc, block.label, { width: innerW, fontSize: 7 }) + 4;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const bullet = block.key === "refl" ? `${i + 1}.` : "•";
    // Bullet
    doc.font("Helvetica").fontSize(9.5).fillColor(block.accent)
      .text(bullet, ML + PAD + 2, iy, { width: 12, lineBreak: false });
    // Text
    doc.font("Helvetica").fontSize(9.5).fillColor(CLR.text)
      .text(item, ML + PAD + 16, iy, { width: innerW - 14, lineGap: 2 });
    iy = doc.y + 6;
  }

  return y + bH + 14;
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export async function generatePDF({ order, sections }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      autoFirstPage: true,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      info: {
        Title: order.report_title || "Rapport",
        Author: "Faculty of Human Design",
        Subject: `Persoonlijk rapport voor ${order.customer_name || ""}`,
        Keywords: "Human Design, persoonlijk rapport, Faculty of Human Design",
      },
    });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Cover ──────────────────────────────────────────────────────────────
    drawCover(doc, order, sections);

    // ── Section pages ──────────────────────────────────────────────────────
    sections.forEach((section, idx) => {
      doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
      drawSectionHeader(doc, section, idx);
      drawFooter(doc, order);

      let y = doc.y + 18;

      const segments = parseSection(section.text);

      for (const seg of segments) {
        if (seg.type === "block") {
          y = drawBlock(doc, order, seg.block, seg.lines, y);
          continue;
        }

        // Prose: render paragraph by paragraph
        const paras = seg.lines
          .join("\n")
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter(Boolean);

        for (const para of paras) {
          // Detect subheading: short line (≤60 chars), no trailing period, capitalised
          const isSubhead = para.length <= 70
            && !para.endsWith(".")
            && para[0] === para[0].toUpperCase()
            && !para.startsWith("•")
            && !para.match(/^\d+\./)
            && para.split(" ").length <= 8;

          const opts = { width: TW, lineGap: isSubhead ? 1 : 3 };
          const h = strH(doc, para, opts) + (isSubhead ? 14 : 16);

          if (needsNewPage(doc, y, h)) {
            drawFooter(doc, order);
            y = addContentPage(doc, order);
            drawFooter(doc, order);
          }

          if (isSubhead) {
            doc.font("Times-Roman").fontSize(12.5).fillColor(CLR.navy)
              .text(para, ML, y, opts);
            y = doc.y + 6;
          } else {
            doc.font("Helvetica").fontSize(10.5).fillColor(CLR.text)
              .text(para, ML, y, opts);
            y = doc.y + 13;
          }
        }
      }

      // Section spacing
      y += 8;
    });

    // ── Closing page ───────────────────────────────────────────────────────
    doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
    doc.rect(0, 0, W, H).fill(CLR.dark);
    doc.rect(0, 0, W, 3).fill(CLR.gold);
    doc.rect(0, H - 3, W, 3).fill(CLR.gold);

    doc.font("Times-Italic").fontSize(22).fillColor("#FFFFFF")
      .text("Met dank voor je vertrouwen.", ML, 180, { align: "center", width: TW });

    const bd = order.birth_data || {};
    const closing = `Dit rapport is persoonlijk samengesteld op basis van de exacte geboortedata van ${order.customer_name || "jou"}${bd.place ? " — geboren in " + bd.place : ""}. Human Design verdiept zich naarmate je er meer mee leeft. Neem de tijd.`;
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
