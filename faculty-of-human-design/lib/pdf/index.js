// PDF generation using PDFKit (pure Node.js, no React dependency)
import PDFDocument from "pdfkit";
import { drawBodygraph, bodygraphSize } from "./bodygraph.js";
import { FONT, registerFonts } from "./fonts.js";

// ─── LAYOUT TOKENS ───────────────────────────────────────────────────────────
const W   = 595.28;          // A4 width  (points)
const H   = 841.89;          // A4 height (points)
const ML  = 56;              // left  margin
const MR  = 56;              // right margin
const TW  = W - ML - MR;    // text  width
const FY  = H - 36;         // footer baseline

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
  tintChart: "#EEF1F6",  accentChart: "#1C2E4A",
  tintVal:   "#FDF6EC",  accentVal:   "#C9A85C",
  tintPrakt: "#F0F5F1",  accentPrakt: "#4A7A5A",
  tintWeek:  "#F3F0F8",  accentWeek:  "#3D2C5E",
  tintRefl:  "#F5F3EE",  accentRefl:  "#9A8050",
};

// ─── FORBIDDEN / QA STRINGS ──────────────────────────────────────────────────
const FORBIDDEN_STRINGS = ["**", "* ", "*\n", "##", "###", "---\n"];

// ─── MARKDOWN STRIPPER ────────────────────────────────────────────────────────
/**
 * Remove all Markdown markup from a string so it renders as plain text in PDFKit.
 * Handles: bold (**), italic (*/_), bold+italic (***), ATX headings (#),
 * inline code (`), links ([text](url)), horizontal rules (---), and
 * stray leading/trailing asterisks.
 */
function stripMd(text) {
  if (!text) return "";
  return text
    // Bold + italic (must come before bold/italic)
    .replace(/\*{3}([\s\S]*?)\*{3}/g, "$1")
    // Bold
    .replace(/\*{2}([\s\S]*?)\*{2}/g, "$1")
    // Italic with *
    .replace(/\*([\s\S]*?)\*/g, "$1")
    // Italic with _
    .replace(/_([\s\S]*?)_/g, "$1")
    // ATX headings (# ## ### …)
    .replace(/^#{1,6}\s+/gm, "")
    // Inline code
    .replace(/`([^`]+)`/g, "$1")
    // Markdown links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // Stray leading asterisks/dashes used as bullets (already handled by block parser)
    .replace(/^[*\-–—]\s+/gm, "")
    // Stray trailing asterisks
    .replace(/\*+$/gm, "")
    .trim();
}

/**
 * Strip the section title from the very beginning of the AI text
 * (AI sometimes echoes the title back despite being told not to).
 */
function cleanSectionText(text, title) {
  if (!text || !title) return text || "";
  const stripped = stripMd(text);
  // Escape regex special chars in title
  const esc = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return stripped
    .replace(new RegExp(`^\\s*${esc}\\s*\\n?`, "i"), "")
    .trim();
}

/**
 * QA pass: log warnings if forbidden markdown strings survive stripping.
 * Does NOT throw — just warns to Vercel function logs.
 */
function qaSection(text, title) {
  for (const f of FORBIDDEN_STRINGS) {
    if (text.includes(f)) {
      console.warn(`[PDF QA] Forbidden string "${f.trim()}" in section "${title}"`);
    }
  }
}

// ─── DYNAMIC CHAPTER TITLE FIXES ─────────────────────────────────────────────
/**
 * Adjust section titles that would be misleading given the actual chart data.
 * E.g. a Reflector with 0 defined channels should not have "Actieve Kanalen".
 */
function adjustSectionTitles(sections, order) {
  const chart = (order.birth_data || {}).chart || {};
  const isReflector = /reflector/i.test(chart.type || "");
  const channelCount = (chart.channels || []).length;

  return sections.map((s) => {
    let { title } = s;

    // Reflector with no defined channels
    if (isReflector && channelCount === 0 && /actieve kanalen/i.test(title)) {
      title = "Poorten & Energiestromen";
    }

    return { ...s, title };
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

/**
 * Parse raw AI text into typed segments: { type:"prose"|"block", block?, lines[] }
 * All text is markdown-stripped before being stored in lines[].
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

    // Check for a block header line
    const matchedBlock = BLOCKS.find((b) =>
      line.trim().toLowerCase().startsWith(b.label.toLowerCase() + ":")
        || line.trim().toLowerCase() === b.label.toLowerCase()
    );

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
  try { return doc.heightOfString(text, opts); } catch { return 14; }
}

function needsNewPage(doc, y, needed = 60) {
  return y + needed > FY - 24;
}

/**
 * Add a new content page with the top bar and footer already drawn.
 * IMPORTANT: callers must draw the footer for the OLD page before calling this.
 */
function addContentPage(doc, order) {
  doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  doc.rect(0, 0, W, 3).fill(CLR.dark);
  drawFooter(doc, order);
  return 24; // start Y for content
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

  // Page label
  doc.font("Helvetica").fontSize(7).fillColor(CLR.goldWarm)
    .text("JOUW BODYGRAPH", ML, 28, { characterSpacing: 3, width: TW });

  // Title
  doc.font(FONT.display).fontSize(22).fillColor(CLR.dark)
    .text("Het visuele kaartwerk van jouw ontwerp", ML, 46, { width: TW });

  // Gold rule
  doc.rect(ML, 92, 32, 1.5).fill(CLR.gold);

  // ── Bodygraph drawing (centered) ────────────────────────────────────────
  const bgScale = 0.95;
  const { width: bgW, height: bgH } = bodygraphSize(bgScale);
  const bgX = (W - bgW) / 2;
  const bgY = 110;
  drawBodygraph(doc, chart, { x: bgX, y: bgY, scale: bgScale });

  // ── Below: Chart kerndata as compact grid ───────────────────────────────
  const dataY = bgY + bgH + 26;
  doc.font("Helvetica").fontSize(6.5).fillColor(CLR.goldWarm)
    .text("DE KERNDATA VAN DEZE CHART", ML, dataY, { characterSpacing: 2.5 });

  const items = [
    chart.type    && { label: "Type",       value: chart.type },
    chart.strat   && { label: "Strategie",  value: chart.strat },
    chart.auth    && { label: "Autoriteit", value: chart.auth },
    chart.profile && { label: "Profiel",    value: chart.profile },
    chart.sig     && { label: "Signatuur",  value: chart.sig },
    chart.notSelf && { label: "Not-Self",   value: chart.notSelf },
  ].filter(Boolean);

  // 2-column layout
  const colW = TW / 2;
  let cy = dataY + 18;
  items.forEach((it, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const itemX = ML + col * colW;
    const itemY = cy + row * 26;
    doc.font("Helvetica").fontSize(7).fillColor(CLR.textMuted)
       .text(it.label.toUpperCase(), itemX, itemY, { characterSpacing: 1.5 });
    doc.font(FONT.displayRegular).fontSize(12).fillColor(CLR.dark)
       .text(it.value, itemX, itemY + 10);
  });

  // ── Legend (small bottom strip) ─────────────────────────────────────────
  const legY = FY - 60;
  doc.rect(ML, legY, TW, 0.5).fill(CLR.border);
  doc.font("Helvetica").fontSize(7).fillColor(CLR.goldWarm)
    .text("LEGENDA", ML, legY + 10, { characterSpacing: 2 });

  // Defined center swatch
  doc.rect(ML, legY + 24, 12, 8).fillAndStroke("#876B4A", "#2A2620");
  doc.font("Helvetica").fontSize(8).fillColor(CLR.text)
    .text("Gedefinieerd centrum — vaste eigen energie", ML + 18, legY + 26);

  // Open center swatch
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

  // Executive summary box
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

  // Table of contents
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

  doc.font("Helvetica").fontSize(7).fillColor("#2A2620")
    .text("© 2026 Faculty of Human Design — Ibiza, Spanje", 0, H - 30, {
      align: "center", width: W,
    });
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
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

  // Strip markdown + bullet prefixes; skip empty
  const items = lines
    .map((l) => stripMd(l.replace(/^[•\-–—*]\s*/, "").replace(/^\d+\.\s*/, "")))
    .filter(Boolean);

  if (!items.length) return y;

  // Calculate block height
  let bH = PAD;
  bH += strH(doc, block.label, { width: innerW, fontSize: 7 }) + 6;
  for (const item of items) {
    bH += strH(doc, item, { width: innerW - 14, lineGap: 2, fontSize: 9.5 }) + 6;
  }
  bH += PAD;

  // Page break — draw footer on OLD page BEFORE adding new page
  if (needsNewPage(doc, y, bH + 16)) {
    drawFooter(doc, order);
    y = addContentPage(doc, order); // addContentPage draws footer on new page
  }

  // Background + accent bar
  doc.rect(ML, y, TW, bH).fill(block.tint);
  doc.rect(ML, y, 3, bH).fill(block.accent);

  // Block label
  doc.font("Helvetica").fontSize(7).fillColor(block.accent)
    .text(block.label.toUpperCase(), ML + PAD, y + PAD, {
      width: innerW, characterSpacing: 1.5,
    });

  let iy = y + PAD + strH(doc, block.label, { width: innerW, fontSize: 7 }) + 4;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const bullet = block.key === "refl" ? `${i + 1}.` : "•";
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
  return new Promise((resolve, reject) => {

    // 1. Adjust chapter titles for edge cases (Reflector + 0 channels, etc.)
    const adjustedSections = adjustSectionTitles(
      sections.filter((s) => s.text && s.text.trim().length > 80),
      order
    );

    const doc = new PDFDocument({
      size: "A4",
      autoFirstPage: true,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      info: {
        Title:    order.report_title || "Rapport",
        Author:   "Faculty of Human Design",
        Subject:  `Persoonlijk rapport voor ${order.customer_name || ""}`,
        Keywords: "Human Design, persoonlijk rapport, Faculty of Human Design",
      },
    });

    const chunks = [];
    doc.on("data",  (c) => chunks.push(c));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Register premium fonts (silent fallback to built-ins if files missing)
    registerFonts(doc);

    // ── Cover ──────────────────────────────────────────────────────────────
    drawCover(doc, order, adjustedSections);

    // ── Bodygraph page (only if chart data is present) ─────────────────────
    const chartData = (order.birth_data || {}).chart || {};
    const hasChartData = chartData.type && Array.isArray(chartData.definedCenters);
    if (hasChartData) {
      drawBodygraphPage(doc, order, chartData);
    }

    // ── Section pages ──────────────────────────────────────────────────────
    adjustedSections.forEach((section, idx) => {
      // 2. Clean + QA the section text
      const cleanText = cleanSectionText(section.text, section.title);
      qaSection(cleanText, section.title);

      doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
      drawSectionHeader(doc, section, idx);
      drawFooter(doc, order);

      let y = doc.y + 18;

      const segments = parseSection(cleanText);

      // Track if any visible content was written to the current page
      let pageHasContent = false;

      for (const seg of segments) {
        // ── Block segment ───────────────────────────────────────────────
        if (seg.type === "block") {
          const prevY = y;
          y = drawBlock(doc, order, seg.block, seg.lines, y);
          if (y !== prevY) pageHasContent = true;
          continue;
        }

        // ── Prose segment ───────────────────────────────────────────────
        const paras = seg.lines
          .join("\n")
          .split(/\n\n+/)
          .map((p) => stripMd(p.trim()))
          .filter(Boolean);

        for (const para of paras) {
          // Detect subheading: short, no trailing period, capitalised, ≤8 words
          const isSubhead =
            para.length <= 70
            && !para.endsWith(".")
            && !para.endsWith("?")
            && para[0] === para[0].toUpperCase()
            && !para.startsWith("•")
            && !para.match(/^\d+\./)
            && para.split(" ").length <= 8;

          const opts = { width: TW, lineGap: isSubhead ? 1 : 3 };
          const h    = strH(doc, para, opts) + (isSubhead ? 14 : 16);

          if (needsNewPage(doc, y, h)) {
            // Draw footer on OLD page before adding new one
            drawFooter(doc, order);
            y = addContentPage(doc, order); // addContentPage draws footer on new page
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

      // 3. If this section produced NO content (empty AI text), do not leave a blank page.
      // We can't remove a PDFKit page after creation, so we guard with the
      // sections.filter above (length > 80). This is the belt-AND-suspenders safety check.
      if (!pageHasContent) {
        console.warn(`[PDF] Section "${section.title}" produced no renderable content.`);
      }

      y += 8;
    });

    // ── Closing page ───────────────────────────────────────────────────────
    doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
    doc.rect(0, 0, W, H).fill(CLR.dark);
    doc.rect(0, 0, W, 3).fill(CLR.gold);
    doc.rect(0, H - 3, W, 3).fill(CLR.gold);

    doc.font(FONT.display).fontSize(22).fillColor("#FFFFFF")
      .text("Met dank voor je vertrouwen.", ML, 180, { align: "center", width: TW });

    const bd      = order.birth_data || {};
    const closing = `Dit rapport is persoonlijk samengesteld op basis van de exacte geboortedata van ${
      order.customer_name || "jou"
    }${bd.place ? " — geboren in " + bd.place : ""}. Human Design verdiept zich naarmate je er meer mee leeft. Neem de tijd.`;

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
