// PDF generation using PDFKit (pure Node.js, no React dependency)
import PDFDocument from "pdfkit";

const W = 595.28; // A4 width in points
const H = 841.89; // A4 height in points
const M  = 56;    // page margin
const TW = W - M * 2; // text width
const FY = H - 38;    // footer Y

// ─── COVER PAGE ──────────────────────────────────────────────────────────────
function drawCover(doc, order, sections) {
  // Dark background
  doc.rect(0, 0, W, H).fill("#1A1715");
  // Gold top bar
  doc.rect(0, 0, W, 3).fill("#C9A85C");

  // Institute label
  doc.font("Helvetica").fontSize(7).fillColor("#7A6840")
    .text("FACULTY OF HUMAN DESIGN  ·  IBIZA", 0, 68, {
      align: "center", width: W, characterSpacing: 4,
    });

  // Report title
  doc.font("Times-Italic").fontSize(30).fillColor("#FFFFFF")
    .text(order.report_title || "Persoonlijk Rapport", M, 148, {
      align: "center", width: TW, lineGap: 8,
    });

  const ty = doc.y + 22;
  // Gold divider
  doc.rect(W / 2 - 20, ty, 40, 1).fill("#C9A85C");

  // Customer name
  doc.font("Helvetica").fontSize(12).fillColor("#7A7470")
    .text(order.customer_name || "", 0, ty + 14, { align: "center", width: W });

  // Birth + chart data
  const bd = order.birth_data || {};
  const chart = bd.chart || {};
  let iy = ty + 38;

  if (bd.day) {
    doc.font("Helvetica").fontSize(9).fillColor("#504C48")
      .text(
        `${bd.day}-${bd.month}-${bd.year}${bd.place ? "  ·  " + bd.place : ""}`,
        0, iy, { align: "center", width: W }
      );
    iy += 16;
  }
  if (chart.type) {
    doc.font("Helvetica").fontSize(9).fillColor("#7A6840")
      .text(
        [chart.type, chart.profile ? "Profiel " + chart.profile : null, chart.auth || null]
          .filter(Boolean).join("  ·  "),
        0, iy, { align: "center", width: W }
      );
    iy += 16;
  }

  // Table of contents
  const tocY = Math.max(iy + 44, H / 2 - 20);
  doc.font("Helvetica").fontSize(7).fillColor("#3A3630")
    .text("INHOUD", M, tocY, { characterSpacing: 3 });
  let ly = tocY + 18;
  sections.forEach((s, i) => {
    if (ly < H - 80) {
      doc.font("Helvetica").fontSize(9).fillColor("#4A4640")
        .text(`${i + 1}.  ${s.title}`, M + 12, ly);
      ly += 16;
    }
  });

  // Footer
  doc.font("Helvetica").fontSize(7).fillColor("#252320")
    .text("© 2026 Faculty of Human Design — Ibiza, Spanje", 0, H - 38, {
      align: "center", width: W,
    });
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function drawSectionHeader(doc, section, idx) {
  doc.rect(0, 0, W, 4).fill("#1A1715");
  doc.rect(0, 4, 3, 56).fill("#C9A85C");
  doc.font("Helvetica").fontSize(8).fillColor("#9A8050")
    .text(String(idx + 1).padStart(2, "0"), M + 12, 16, { characterSpacing: 1 });
  doc.font("Times-Roman").fontSize(19).fillColor("#1A1715")
    .text(section.title, M + 12, 28, { width: TW - 12 });
  const dy = doc.y + 8;
  doc.rect(M + 12, dy, 28, 1).fill("#C9A85C");
}

// ─── PAGE FOOTER ─────────────────────────────────────────────────────────────
function drawFooter(doc, order) {
  doc.rect(M + 8, FY - 6, TW - 8, 0.5).fill("#E5E0D8");
  doc.font("Helvetica").fontSize(7.5).fillColor("#B8B3AE")
    .text(order.report_title || "", M + 8, FY, { width: TW / 2 });
  doc.font("Helvetica").fontSize(7.5).fillColor("#B8B3AE")
    .text("Faculty of Human Design", M + 8, FY, { width: TW - 8, align: "right" });
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
      },
    });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Cover
    drawCover(doc, order, sections);

    // Section pages
    sections.forEach((section, idx) => {
      doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
      drawSectionHeader(doc, section, idx);
      let y = doc.y + 14;

      const paras = (section.text || "").split(/\n\n+/).filter((p) => p.trim());
      for (const para of paras) {
        const h = doc.heightOfString(para.trim(), { width: TW - 8, lineGap: 3 });
        if (y + h > FY - 20) {
          drawFooter(doc, order);
          doc.addPage({ margins: { top: 0, bottom: 0, left: 0, right: 0 } });
          doc.rect(0, 0, W, 4).fill("#1A1715");
          y = 28;
        }
        doc.font("Helvetica").fontSize(10.5).fillColor("#2A2820")
          .text(para.trim(), M + 8, y, { width: TW - 8, lineGap: 3 });
        y = doc.y + 14;
      }
      drawFooter(doc, order);
    });

    doc.end();
  });
}
