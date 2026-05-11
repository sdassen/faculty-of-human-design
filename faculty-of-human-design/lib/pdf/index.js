// PDF generation using @react-pdf/renderer
// Runs server-side in Node.js (Inngest steps / Vercel functions)
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // Cover page
  cover: {
    backgroundColor: "#1A1715",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: 72,
  },
  coverInst: {
    fontSize: 7,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: "rgba(201,168,92,0.5)",
    marginBottom: 18,
  },
  coverTitle: {
    fontFamily: "Helvetica",
    fontSize: 32,
    fontWeight: "300",
    color: "#ffffff",
    lineHeight: 1.2,
    marginBottom: 10,
  },
  coverName: {
    fontSize: 18,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 28,
    fontStyle: "italic",
  },
  coverMeta: {
    fontSize: 8,
    color: "rgba(255,255,255,0.22)",
    letterSpacing: 2,
    textTransform: "uppercase",
    lineHeight: 1.8,
  },
  coverDivider: {
    height: 1,
    backgroundColor: "rgba(201,168,92,0.18)",
    marginBottom: 28,
    marginTop: 4,
  },

  // Content pages
  page: {
    paddingTop: 64,
    paddingBottom: 64,
    paddingLeft: 72,
    paddingRight: 72,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontFamily: "Helvetica",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1715",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E0D8",
  },
  body: {
    fontSize: 10,
    color: "#3a3a32",
    lineHeight: 1.85,
    fontWeight: "normal",
  },
  paragraph: {
    marginBottom: 10,
  },

  // Page footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 72,
    right: 72,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EDEBE5",
    paddingTop: 8,
  },
  footerInst: {
    fontSize: 7,
    color: "#B8B3AE",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  footerPage: {
    fontSize: 7,
    color: "#B8B3AE",
  },

  // Summary box on first content page
  summaryBox: {
    backgroundColor: "#F7F5F0",
    borderLeftWidth: 2,
    borderLeftColor: "#C9A85C",
    padding: 16,
    marginBottom: 28,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#9A8050",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    width: 100,
    flexShrink: 0,
  },
  summaryValue: {
    fontSize: 9,
    color: "#1A1715",
    flex: 1,
  },
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
/** Split markdown-style text into paragraphs, stripping leading ### headers */
function splitParagraphs(text) {
  return (text || "")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("###"))
    .map((l) => l.trim());
}

// ─── DOCUMENT ─────────────────────────────────────────────────────────────────
function ReportDocument({ order, sections }) {
  const { customer_name, report_title, birth_data } = order;

  // Birth meta line
  const bd = birth_data || {};
  const birthLine = [
    bd.day && bd.month && bd.year ? `${bd.day}-${bd.month}-${bd.year}` : null,
    bd.hour !== undefined && bd.minute !== undefined
      ? `${String(bd.hour).padStart(2, "0")}:${String(bd.minute).padStart(2, "0")}`
      : null,
    bd.place || null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  // Chart summary rows (HD, Numerology, or Horoscoop)
  const chartData = bd.chart || {};
  const summaryRows = buildSummaryRows(order.report_id, chartData);

  return React.createElement(
    Document,
    {
      title: report_title,
      author: "Faculty of Human Design",
      subject: `${report_title} — ${customer_name}`,
    },

    // ── Cover page ──
    React.createElement(
      Page,
      { size: "A4", style: S.cover },
      React.createElement(Text, { style: S.coverInst }, "Faculty of Human Design  ·  Ibiza, Spanje"),
      React.createElement(View, { style: S.coverDivider }),
      React.createElement(Text, { style: S.coverTitle }, report_title),
      React.createElement(Text, { style: S.coverName }, customer_name || ""),
      React.createElement(
        Text,
        { style: S.coverMeta },
        birthLine || ""
      )
    ),

    // ── Content pages (one section per page) ──
    ...sections.map((sec, i) =>
      React.createElement(
        Page,
        { key: i, size: "A4", style: S.page },

        // First page: insert summary box above section text
        i === 0 && summaryRows.length > 0
          ? React.createElement(
              View,
              { style: S.summaryBox },
              ...summaryRows.map((row, ri) =>
                React.createElement(
                  View,
                  { key: ri, style: S.summaryRow },
                  React.createElement(Text, { style: S.summaryLabel }, row.label),
                  React.createElement(Text, { style: S.summaryValue }, String(row.value || ""))
                )
              )
            )
          : null,

        // Section title
        React.createElement(Text, { style: S.sectionTitle }, sec.title),

        // Section body paragraphs
        ...splitParagraphs(sec.text).map((para, pi) =>
          React.createElement(
            View,
            { key: pi, style: S.paragraph },
            React.createElement(Text, { style: S.body }, para)
          )
        ),

        // Footer
        React.createElement(
          View,
          { style: S.footer, fixed: true },
          React.createElement(Text, { style: S.footerInst }, "Faculty of Human Design"),
          React.createElement(
            Text,
            { style: S.footerPage, render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}` }
          )
        )
      )
    )
  );
}

function buildSummaryRows(reportId, chart) {
  if (!chart || Object.keys(chart).length === 0) return [];

  if (chart.isNumerology) {
    return [
      { label: "Levenspad", value: chart.lp },
      { label: "Uitdrukking", value: chart.exp },
      { label: "Ziel", value: chart.soul },
      { label: "Pers. Jaar", value: chart.py },
    ].filter((r) => r.value != null);
  }
  if (chart.isHoroscoop) {
    return [
      { label: "Zonneteken", value: chart.sun_sign },
      { label: "Ascendant", value: chart.ascendant ? `${chart.ascendant.degree}° ${chart.ascendant.sign}` : null },
      { label: "Dom. element", value: chart.dom_element },
    ].filter((r) => r.value != null);
  }
  // Human Design
  return [
    { label: "Type", value: chart.type },
    { label: "Autoriteit", value: chart.auth },
    { label: "Strategie", value: chart.strat },
    { label: "Profiel", value: chart.profile },
    { label: "Signatuur", value: chart.sig },
    { label: "Not-Self", value: chart.notSelf },
  ].filter((r) => r.value != null);
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
/**
 * Generate a PDF buffer for a completed order.
 *
 * @param {{ order: object, sections: Array<{title: string, text: string}> }} opts
 * @returns {Promise<Buffer>}
 */
export async function generatePDF({ order, sections }) {
  const doc = React.createElement(ReportDocument, { order, sections });
  return renderToBuffer(doc);
}
