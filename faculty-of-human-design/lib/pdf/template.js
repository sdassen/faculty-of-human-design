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

// ─── CHART VALUE TRANSLATIONS (NL → EN) ──────────────────────────────────────
// Chart data is always stored in Dutch. When rendering an EN report, run values
// through this map so strategy / authority / signature / not-self appear in EN.
const CHART_TRANSLATIONS = {
  // ── Type ───────────────────────────────────────────────────────────────────
  "manifesteerend generator":                                   "Manifesting Generator",
  "manifesteerder":                                             "Manifestor",
  // ── Strategy ───────────────────────────────────────────────────────────────
  "wacht op te reageren":                                       "Wait to respond",
  "wacht om te reageren":                                       "Wait to respond",
  "wacht om te reageren, informeer dan voor je handelt":        "Wait to respond, then inform before acting",
  "wacht op te reageren, informeer dan voor je handelt":        "Wait to respond, then inform before acting",
  "informeer voor je handelt":                                  "Inform before acting",
  "informeer voordat je handelt":                               "Inform before acting",
  "wacht op de uitnodiging":                                    "Wait for the invitation",
  "wacht een maancyclus":                                       "Wait a lunar cycle",
  // ── Authority ──────────────────────────────────────────────────────────────
  "sacraal":                                                    "Sacral",
  "emotioneel":                                                 "Emotional",
  "milt":                                                       "Splenic",
  "ego":                                                        "Ego / Heart",
  "ego manifesteerder":                                         "Ego Manifestor",
  "g-center":                                                   "G-Center / Self",
  "zelf":                                                       "Self / G-Center",
  "mentaal":                                                    "Mental",
  "geen":                                                       "None",
  // ── Signature ──────────────────────────────────────────────────────────────
  "bevrediging":                                                "Satisfaction",
  "bevrediging en vrede":                                       "Satisfaction and peace",
  "vrede":                                                      "Peace",
  "succes":                                                     "Success",
  "verrassing":                                                 "Surprise",
  // ── Not-Self ───────────────────────────────────────────────────────────────
  "frustratie":                                                 "Frustration",
  "frustratie en woede":                                        "Frustration and anger",
  "woede":                                                      "Anger",
  "bitterheid":                                                 "Bitterness",
  "teleurstelling":                                             "Disappointment",
};

function tvl(value, lang) {
  if (lang !== "en" || !value) return value;
  return CHART_TRANSLATIONS[(value || "").toLowerCase().trim()] || value;
}

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

// ─── TRANSITION QUOTE PAGE ───────────────────────────────────────────────────
function buildTransitionPage(quoteNL, quoteEN, order) {
  const lang  = order.language || "nl";
  const quote = lang === "en" ? quoteEN : quoteNL;
  return `
<div style="width:210mm;height:247mm;margin-top:0;background:#1A1715;position:relative;overflow:hidden;break-before:page;break-inside:avoid;display:flex;flex-direction:column;align-items:center;justify-content:center;">
  <div style="position:absolute;top:0;left:0;right:0;height:1px;background:#C9A85C;opacity:0.18;"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:1px;background:#C9A85C;opacity:0.18;"></div>
  <div style="padding:0 32mm;text-align:center;position:relative;">
    <div style="font-family:'Cormorant Garamond',serif;font-size:6pt;font-weight:300;color:#C9A85C;letter-spacing:0.35em;text-transform:uppercase;margin-bottom:24px;opacity:0.6;">— Faculty of Human Design —</div>
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:22pt;color:#FFFFFF;line-height:1.55;letter-spacing:0.01em;">${esc(quote)}</div>
  </div>
</div>`;
}

// ─── PAGE: CINEMATIC INTRODUCTION ────────────────────────────────────────────
function buildIntroPage(order) {
  const lang = order.language || "nl";
  const name = order.customer_name || "";

  const contentNL = {
    label:    "VOOR JOU",
    headline: "Een woord vooraf",
    body: [
      `Dit rapport is niet geschreven om je te vertellen wie je zou moeten worden.`,
      `Het is geschreven om je te herinneren wie je al was — voor de wereld je vroeg je aan te passen.`,
      `Human Design is geen persoonlijkheidstest. Het is een kaart van de energie die door jou stroomt. Van de manier waarop jij beslissingen het best neemt. Van de patronen die jouw leven kleuren, zowel als ze in je voordeel werken als wanneer ze je uitputten.`,
      `Dit rapport zal je niet veranderen. Maar het kan je wel iets teruggeven: herkenning. De stille bevestiging dat wat jij voelt — de twijfel, de kracht, de zoetheid van bepaalde momenten — niet toevallig is.`,
      `Lees dit niet als een handleiding. Lees het als een spiegel.`,
    ],
    sign: "Met respect voor jouw ontwerp,",
    org:  "Faculty of Human Design · Ibiza",
  };

  const contentEN = {
    label:    "FOR YOU",
    headline: "A word before we begin",
    body: [
      `This report was not written to tell you who you should become.`,
      `It was written to remind you who you already were — before the world asked you to perform.`,
      `Human Design is not a personality test. It is a map of the energy that moves through you. Of the way you make decisions best. Of the patterns that colour your life, both when they serve you and when they drain you.`,
      `This report will not change you. But it can give something back: recognition. The quiet confirmation that what you feel — the doubt, the strength, the sweetness of certain moments — is not random.`,
      `Read this not as a manual. Read it as a mirror.`,
    ],
    sign: "With respect for your design,",
    org:  "Faculty of Human Design · Ibiza",
  };

  const c = lang === "en" ? contentEN : contentNL;

  const parasHTML = c.body.map(function(p, i) {
    if (i === 0) {
      return `<p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16pt;font-weight:300;color:#1A1715;line-height:1.45;margin-bottom:20px;">${esc(p)}</p>`;
    }
    return `<p style="font-family:'Inter',sans-serif;font-size:10pt;font-weight:300;color:#3A3830;line-height:1.8;margin-bottom:14px;max-width:125mm;">${esc(p)}</p>`;
  }).join("");

  return `
<div style="width:210mm;height:247mm;margin-top:0;background:#F7F5F0;position:relative;overflow:hidden;break-before:page;break-inside:avoid;">
  <div style="height:3px;background:#1A1715;"></div>
  <div style="padding:18mm 24mm 0;">
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#C9A85C;letter-spacing:0.28em;text-transform:uppercase;margin-bottom:18px;">${esc(c.label)}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:28pt;font-weight:400;color:#1A1715;margin-bottom:6px;line-height:1.1;">${esc(c.headline)}</div>
    <div style="width:56px;height:0.75px;background:#C9A85C;margin-bottom:28px;"></div>
    ${parasHTML}
    <div style="margin-top:28px;padding-top:20px;border-top:0.4px solid #D8D4CC;">
      <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:10pt;color:#6B6560;margin-bottom:4px;">${esc(c.sign)}</div>
      <div style="font-family:'Inter',sans-serif;font-size:7.5pt;font-weight:300;color:#A8A29E;letter-spacing:0.08em;">${esc(c.org)}</div>
    </div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;padding:0 24mm 12mm;display:flex;justify-content:space-between;align-items:center;">
    <div style="height:0.4px;flex:1;background:#E5E0D8;"></div>
    ${name ? `<div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:9pt;color:#C9A85C;padding:0 14px;">${esc(name)}</div>` : ""}
    <div style="height:0.4px;flex:1;background:#E5E0D8;"></div>
  </div>
</div>`;
}

// ─── PAGE: HOW TO READ ────────────────────────────────────────────────────────
function buildHowToReadPage(order) {
  const lang = order.language || "nl";

  const contentNL = {
    label:    "LEESWIJZER",
    headline: "Hoe dit rapport het best tot je spreekt",
    intro:    "Dit is geen rapport dat je snel doorleest. Het is een ervaring die vraagt om aanwezigheid. Neem de tijd — elke sectie is geschreven om iets in je wakker te maken.",
    items: [
      { num: "01", title: "Lees langzaam",           body: "Elke sectie is bedoeld voor rustige aandacht, niet voor snelle consumptie. Geef jezelf de ruimte." },
      { num: "02", title: "Pauzeer bij herkenning",  body: "Als een zin iets in je raakt — stop. Schrijf het op, of laat het even gewoon landen." },
      { num: "03", title: "Gebruik het journaal",    body: "Aan het einde van elke sectie staan drie reflectievragen. Ze zijn uitnodigingen, geen opdrachten." },
      { num: "04", title: "Lees in stilte",          body: "Het liefst op een moment dat je niet gehaast bent. Een kop thee erbij is geen slecht idee." },
      { num: "05", title: "Laat het rijpen",          body: "Niet alles hoeft direct te kloppen. Sommige inzichten krijgen pas na een paar dagen hun betekenis." },
    ],
  };

  const contentEN = {
    label:    "READING GUIDE",
    headline: "How this report speaks best to you",
    intro:    "This is not a report you read in a hurry. It is an experience that asks for presence. Take your time — each section is written to awaken something in you.",
    items: [
      { num: "01", title: "Read slowly",              body: "Each section is meant for quiet attention, not quick consumption. Give yourself the space." },
      { num: "02", title: "Pause at recognition",     body: "If a sentence lands on something — stop. Write it down, or simply let it sit." },
      { num: "03", title: "Use the journal prompts",  body: "At the end of each section there are three reflection questions. They are invitations, not assignments." },
      { num: "04", title: "Read in silence",          body: "Ideally at a moment when you are not in a rush. A cup of tea alongside is not a bad idea." },
      { num: "05", title: "Let it settle",            body: "Not everything needs to make sense immediately. Some insights take a few days to find their meaning." },
    ],
  };

  const c = lang === "en" ? contentEN : contentNL;

  const itemsHTML = c.items.map(function(item) {
    return `<div style="display:flex;gap:18px;padding:14px 0;border-bottom:0.4px solid #E5E0D8;break-inside:avoid;">
      <div style="font-family:'Cormorant Garamond',serif;font-size:18pt;font-weight:400;color:#C9A85C;opacity:0.5;min-width:28px;line-height:1;padding-top:2px;">${esc(item.num)}</div>
      <div>
        <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:13pt;color:#1A1715;margin-bottom:3px;line-height:1.2;">${esc(item.title)}</div>
        <div style="font-family:'Inter',sans-serif;font-size:9.5pt;font-weight:300;color:#6B6560;line-height:1.65;">${esc(item.body)}</div>
      </div>
    </div>`;
  }).join("");

  return `
<div style="width:210mm;height:247mm;margin-top:0;background:#F7F5F0;position:relative;overflow:hidden;break-before:page;break-inside:avoid;">
  <div style="height:3px;background:#1A1715;"></div>
  <div style="padding:14mm 24mm 0;">
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#C9A85C;letter-spacing:0.28em;text-transform:uppercase;margin-bottom:10px;">${esc(c.label)}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:24pt;font-weight:400;color:#1A1715;line-height:1.1;margin-bottom:8px;">${esc(c.headline)}</div>
    <div style="width:56px;height:0.75px;background:#C9A85C;margin-bottom:16px;"></div>
    <p style="font-family:'Inter',sans-serif;font-size:10pt;font-weight:300;color:#6B6560;line-height:1.72;margin-bottom:20px;max-width:150mm;">${esc(c.intro)}</p>
    ${itemsHTML}
  </div>
</div>`;
}

// ─── PAGE: COVER ──────────────────────────────────────────────────────────────
function buildCoverPage(order) {
  const bd    = order.birth_data || {};
  const chart = bd.chart || {};
  const lang  = order.language || "nl";
  const ta    = typeAccent(chart.type);
  const coverMonthsNL = ["","jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  const coverMonthsEN = ["","jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  const dateStr = bd.day ? `${bd.day} ${(lang === "en" ? coverMonthsEN : coverMonthsNL)[parseInt(bd.month)] || bd.month} ${bd.year}` : "";

  return `
<div style="width:210mm;height:247mm;margin-top:0;background:#1A1715;position:relative;overflow:hidden;break-inside:avoid;display:flex;flex-direction:column;align-items:center;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:#C9A85C;"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:#C9A85C;"></div>
  ${coverDecoration(297, 260)}
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
function buildTOCPage(sections, order, hasChart, hasSvg) {
  const lang = order.language || "nl";
  const tocLabel = ui(lang, "INHOUD", "CONTENTS");

  // ── Approximate page number calculation ─────────────────────────────────
  // Fixed pages before the first section:
  //   Cover(1) + Intro(1) + HowToRead(1) + ExecSummary(hasChart?1:0)
  //   + Methodology(1) + TOC(1) + Profile(hasChart?2:0)
  //   + Bodygraph(hasChart&&hasSvg?1:0) + GateAppendix(hasChart?1:0)
  // Profile can run long; we count it as 2 pages for a typical chart.
  // GateAppendix is now placed directly after Bodygraph, before sections.
  const fixedPages = 1 + 1 + 1 + (hasChart ? 1 : 0) + 1 + 1 + (hasChart ? 2 : 0) + (hasChart && hasSvg ? 1 : 0) + (hasChart ? 1 : 0);

  const midIdx  = sections.length > 3 ? Math.floor(sections.length / 2) : -1;
  const lastIdx = sections.length > 1 ? sections.length - 1 : -1;

  let runningPage = fixedPages + 1; // first section starts on this page

  const sectionStartPages = sections.map(function(s, i) {
    // Transition pages are inserted *before* midIdx and lastIdx sections
    if (i === midIdx || i === lastIdx) runningPage += 1;

    const startPage = runningPage;

    // Estimate pages consumed by this section:
    //   1 (main page, always)
    // + 1 if adem breath page is present
    // + 1 if section has closing content (valkuilen / praktijk / dezeWeek / reflectievragen)
    let pagesThisSection = 1;
    if (s.adem && String(s.adem).trim().length > 0) pagesThisSection += 1;
    const hasClosing = (
      (Array.isArray(s.valkuilen)       && s.valkuilen.length > 0)       ||
      (Array.isArray(s.praktijk)        && s.praktijk.length > 0)        ||
      (Array.isArray(s.dezeWeek)        && s.dezeWeek.length > 0)        ||
      (Array.isArray(s.reflectievragen) && s.reflectievragen.length > 0)
    );
    if (hasClosing) pagesThisSection += 1;
    // Text-path sections (legacy): no closing metadata, assume 1 page
    runningPage += pagesThisSection;
    return startPage;
  });

  const items = sections.map(function(s, i) {
    const pageNum = sectionStartPages[i];
    return `<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:0.4px solid #E5E0D8;">
      <span style="font-family:'Cormorant Garamond',serif;font-weight:400;font-size:11pt;color:#C9A85C;min-width:28px;">${pageNum}</span>
      <span style="flex:1;height:0.4px;background:#E5E0D8;max-width:0;"></span>
      <span style="font-family:'Inter',sans-serif;font-size:10pt;font-weight:400;color:#2A2820;flex:1;letter-spacing:0.01em;">${esc(s.title)}</span>
    </div>`;
  }).join("");

  return `
<div style="width:210mm;height:247mm;margin-top:0;background:#F7F5F0;position:relative;overflow:hidden;break-before:page;break-inside:avoid;padding:20mm;">
  <div style="height:2px;background:#1A1715;margin-bottom:3px;"></div>
  <div style="height:0.5px;background:#C9A85C;margin-bottom:32px;"></div>
  <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#C9A85C;letter-spacing:0.25em;margin-bottom:16px;">${tocLabel}</div>
  <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:28pt;font-weight:400;color:#1A1715;margin-bottom:28px;line-height:1.1;">${esc(order.report_title || "Volledig Human Design Rapport")}</div>
  ${items}
</div>`;
}

// ─── PAGE: PROFILE SUMMARY ────────────────────────────────────────────────────
function buildProfilePage(order) {
  // For child reports, show the child's chart from partner_birth_data
  const childReport = isChildReport(order);
  const bd    = childReport ? (order.partner_birth_data || order.birth_data || {}) : (order.birth_data || {});
  const chart = bd.chart || {};
  const lang  = order.language || "nl";
  const ta    = typeAccent(chart.type);
  const personName = childReport ? (bd.name || null) : null;

  const keyData = [
    chart.type    ? { label: ui(lang, "Type",        "Type"),        value: tvl(chart.type,    lang) } : null,
    chart.strat   ? { label: ui(lang, "Strategie",   "Strategy"),    value: tvl(chart.strat,   lang) } : null,
    chart.auth    ? { label: ui(lang, "Autoriteit",  "Authority"),   value: tvl(chart.auth,    lang) } : null,
    chart.profile ? { label: ui(lang, "Profiel",     "Profile"),     value: chart.profile }            : null,
    chart.sig     ? { label: ui(lang, "Signatuur",   "Signature"),   value: tvl(chart.sig,     lang) } : null,
    chart.notSelf ? { label: "Not-Self",                              value: tvl(chart.notSelf, lang) } : null,
    chart.cross   ? { label: ui(lang, "Inkarnatie-Kruis", "Incarnation Cross"), value: chart.cross }   : null,
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
<div style="width:210mm;height:247mm;margin-top:0;background:#F7F5F0;position:relative;overflow:hidden;break-before:page;break-inside:avoid;">
  <div style="height:70mm;background:${ta.bg};position:relative;overflow:hidden;">
    <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${ta.bar};"></div>
    <div style="padding:20mm 20mm 0 24mm;">
      <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:${ta.fg};letter-spacing:0.22em;opacity:0.7;text-transform:uppercase;margin-bottom:8px;">${personName ? esc((lang === "en" ? "HUMAN DESIGN OF " : "HUMAN DESIGN VAN ") + personName.toUpperCase()) : ui(lang, "JOUW HUMAN DESIGN", "YOUR HUMAN DESIGN")}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:32pt;font-weight:400;color:#FFFFFF;line-height:1.1;">${esc(tvl(chart.type, lang) || "")}</div>
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
</div>`;
}

// ─── PAGE: BODYGRAPH ──────────────────────────────────────────────────────────
function buildBodygraphPage(svgBodygraph, order) {
  const lang = order.language || "nl";
  const childReport = isChildReport(order);
  const personName = childReport ? ((order.partner_birth_data || {}).name || null) : null;

  const bgLabel = personName
    ? (lang === "en" ? `BODYGRAPH OF ${personName.toUpperCase()}` : `BODYGRAPH VAN ${personName.toUpperCase()}`)
    : (childReport
        ? (lang === "en" ? `BODYGRAPH OF YOUR CHILD` : `BODYGRAPH VAN JE KIND`)
        : ui(lang, "JOUW BODYGRAPH", "YOUR BODYGRAPH"));

  const bgSubtitle = personName
    ? (lang === "en" ? `The visual map of ${personName}'s design` : `Het visuele kaartwerk van het ontwerp van ${personName}`)
    : (childReport
        ? (lang === "en" ? `The visual map of your child's design` : `Het visuele kaartwerk van het ontwerp van je kind`)
        : ui(lang, "Het visuele kaartwerk van jouw ontwerp", "The visual map of your design"));

  return `
<div style="width:210mm;height:247mm;background:#FFFFFF;position:relative;overflow:hidden;break-before:page;break-inside:avoid;padding:0 20mm;">
  <div style="height:4px;background:#1A1715;"></div>
  <div style="padding-top:10px;margin-bottom:4px;">
    <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#C9A85C;letter-spacing:0.22em;text-transform:uppercase;">${esc(bgLabel)}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:16pt;color:#1A1715;margin-top:3px;">${esc(bgSubtitle)}</div>
    <div style="width:48px;height:1px;background:#C9A85C;margin-top:6px;"></div>
  </div>
  <div style="display:flex;justify-content:center;margin-top:4px;">
    <div style="height:215mm;aspect-ratio:360/500;">${svgBodygraph}</div>
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
  <div style="padding:16mm 0 0;max-width:160mm;margin:0 auto;-webkit-box-decoration-break:clone;box-decoration-break:clone;">
    ${chartBlockHTML}
    ${contentHTML}
  </div>
</div>`;
}

function sectionClosingHTML(section, idx, order, gridHTML) {
  const lang      = order.language || "nl";
  const partLabel = ui(lang, "ONDERDEEL", "PART") + "  " + String(idx + 1).padStart(2, "0");
  return `
<div style="height:247mm;background:#F7F5F0;position:relative;overflow:hidden;break-before:page;break-inside:avoid;">
  <div style="height:40mm;background:#1A1715;position:relative;">
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:#C9A85C;"></div>
    <div style="padding:9mm 16mm 0 20mm;">
      <div style="font-family:'Inter',sans-serif;font-size:6pt;font-weight:500;color:#9A8050;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:5px;">${esc(partLabel)}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:14pt;color:#FFFFFF;max-width:120mm;">${esc(section.title)}</div>
    </div>
    <div style="position:absolute;right:20mm;top:12mm;font-family:'Inter',sans-serif;font-size:6pt;font-weight:300;color:#C9A85C;letter-spacing:0.15em;text-transform:uppercase;">${ui(lang, "INZICHTEN & PRAKTIJK", "INSIGHTS & PRACTICE")}</div>
  </div>
  <div style="padding:6mm 20mm 0;">${gridHTML}</div>
</div>`;
}

// ─── CLOSING PAGE (JSON path) ─────────────────────────────────────────────────
// Clean, retreat-style layout — no colored boxes, generous whitespace.
function buildSectionClosingJSON(section, idx, order) {
  const lang      = order.language || "nl";
  const isEN      = lang === "en";
  const partLabel = ui(lang, "ONDERDEEL", "PART") + "  " + String(idx + 1).padStart(2, "0");

  function closingCol(labelNL, labelEN, items, isQuestions) {
    if (!items || !items.length) return "";
    const label = isEN ? labelEN : labelNL;
    const itemsHTML = items.map(function(item, i) {
      return isQuestions
        ? `<div style="display:flex;gap:12px;margin-bottom:16px;line-height:1.65;break-inside:avoid;">
            <span style="font-family:'Cormorant Garamond',serif;font-size:14pt;color:#C9A85C;font-weight:400;min-width:16px;line-height:1.1;">${i + 1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:9.5pt;font-weight:300;color:#2A2820;font-style:italic;">${esc(item)}</span>
          </div>`
        : `<div style="display:flex;gap:10px;margin-bottom:11px;line-height:1.62;break-inside:avoid;">
            <span style="font-family:'Cormorant Garamond',serif;font-size:12pt;color:#C9A85C;font-weight:400;line-height:1.2;min-width:12px;">—</span>
            <span style="font-family:'Inter',sans-serif;font-size:9.5pt;font-weight:300;color:#2A2820;">${esc(item)}</span>
          </div>`;
    }).join("");
    return `<div style="width:24px;height:1.5px;background:#C9A85C;margin-bottom:10px;"></div>
      <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#1A1715;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:14px;">${esc(label)}</div>
      ${itemsHTML}`;
  }

  const topLeft  = closingCol("Valkuilen",       "Pitfalls",            section.valkuilen,       false);
  const topRight = closingCol("Praktijk",         "Practice",            section.praktijk,        false);
  const botLeft  = closingCol("Deze week",        "This week",           section.dezeWeek,        false);
  const botRight = closingCol("Reflectievragen",  "Reflection questions",section.reflectievragen, true);

  const hasAny = topLeft || topRight || botLeft || botRight;
  if (!hasAny) return "";

  return `
<div style="background:#F7F5F0;position:relative;break-before:page;break-inside:avoid;min-height:247mm;">
  <div style="height:26mm;background:#1A1715;position:relative;overflow:hidden;">
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:#C9A85C;"></div>
    <div style="padding:8mm 20mm 0 24mm;">
      <div style="font-family:'Inter',sans-serif;font-size:6pt;font-weight:500;color:#9A8050;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:5px;">${esc(partLabel)}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:13pt;font-weight:600;color:#FFFFFF;line-height:1.2;">${esc(section.title)}</div>
    </div>
  </div>

  ${topLeft || topRight ? `
  <div style="display:grid;grid-template-columns:1fr 1fr;padding:10mm 20mm 0;gap:0;">
    <div style="padding-right:22px;border-right:0.4px solid #EBEBE6;">${topLeft}</div>
    <div style="padding-left:22px;">${topRight}</div>
  </div>` : ""}

  ${(topLeft || topRight) && (botLeft || botRight) ? `<div style="margin:8mm 20mm;height:0.4px;background:#EBEBE6;"></div>` : ""}

  ${botLeft || botRight ? `
  <div style="display:grid;grid-template-columns:1fr 1fr;padding:${(topLeft || topRight) ? "0" : "10mm"} 20mm 0;gap:0;">
    <div style="padding-right:22px;border-right:0.4px solid #EBEBE6;">${botLeft}</div>
    <div style="padding-left:22px;">${botRight}</div>
  </div>` : ""}

</div>`;
}

// JSON path — section has structured fields (inJouwChart, kern, valkuilen, etc.)
function buildSectionPagesJSON(section, idx, order) {
  const lang      = order.language || "nl";
  const partLabel = ui(lang, "ONDERDEEL", "PART") + "  " + String(idx + 1).padStart(2, "0");

  // ── Pull quote strip (teaser) — prominent, between header and content ───
  const pullQuote = (section.teaser || "").trim();
  const pullQuoteStrip = pullQuote
    ? `<div style="background:#FFFFFF;border-bottom:0.5px solid #E8E4DC;padding:9mm 25mm 7mm;">
        <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:18pt;color:#1A1715;line-height:1.5;max-width:130mm;">${esc(pullQuote)}</div>
        <div style="width:36px;height:0.75px;background:#C9A85C;margin-top:10px;"></div>
      </div>`
    : `<div style="height:1px;background:#E5E0D8;"></div>`;

  // ── Kern (subheadings + paragraphs) — FIRST, emotional content ─────────
  const kernHTML = (section.kern || []).map(function(block) {
    const subkop = (block.subkop || "").trim();
    const paras  = (block.paragraphs || []).filter(Boolean);
    const subkopHTML = subkop
      ? `<h3 style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:14pt;color:#1C2E4A;margin:20px 0 7px;break-after:avoid;line-height:1.3;">${esc(subkop)}<span style="display:block;width:24px;height:0.75px;background:#C9A85C;margin-top:5px;"></span></h3>`
      : "";
    const parasHTML = paras.map(function(p) {
      return `<p style="font-family:'Inter',sans-serif;font-size:10.5pt;line-height:1.78;color:#2A2820;margin-bottom:14px;break-inside:avoid;max-width:138mm;">${esc(p)}</p>`;
    }).join("");
    return subkopHTML + parasHTML;
  }).join("");

  // ── Micro-inzichten — optional insight cards ───────────────────────────
  const microInzichten = (section.microInzichten || []).filter(function(m) {
    return m && m.label && m.tekst;
  });
  const microInzichtenHTML = microInzichten.length
    ? `<div style="margin-top:24px;break-inside:avoid;">
        ${microInzichten.map(function(m) {
          return `<div style="padding:13px 0;border-top:0.4px solid #E8E4DC;break-inside:avoid;break-before:avoid;">
            <div style="font-family:'Inter',sans-serif;font-size:6pt;font-weight:500;color:#C9A85C;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:7px;">${esc(m.label)}</div>
            <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12pt;color:#1A1715;line-height:1.55;max-width:130mm;">${esc(m.tekst)}</div>
          </div>`;
        }).join("")}
      </div>`
    : "";

  // ── "In jouw chart" — AFTER kern, as grounding reference ───────────────
  const chartLabel = ui(lang, "In jouw chart", "In your chart");
  const chartItems = (section.inJouwChart || []).filter(Boolean);
  const chartBlockHTML = chartItems.length
    ? `<div style="margin-top:22px;border-top:0.4px solid #E8E4DC;padding-top:14px;break-inside:avoid;break-before:avoid;">
        <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:10px;">${esc(chartLabel)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px;">
          ${chartItems.map(function(item) {
            return `<div style="display:flex;gap:8px;line-height:1.5;padding:5px 0;border-bottom:0.3px solid #F0EDE8;">
              <span style="font-family:'Cormorant Garamond',serif;font-size:11pt;color:#C9A85C;font-weight:400;line-height:1.3;flex-shrink:0;">·</span>
              <span style="font-family:'Inter',sans-serif;font-size:8.5pt;font-weight:300;color:#5A5650;">${esc(item)}</span>
            </div>`;
          }).join("")}
        </div>
      </div>`
    : "";

  // ── Breath page (adem) — minimalist pause before this section ────────────
  const ademText = (section.adem || "").trim();
  const ademPage = ademText
    ? `<div style="break-before:page;min-height:247mm;background:#F7F5F0;display:flex;align-items:center;justify-content:center;position:relative;">
        <div style="max-width:120mm;text-align:center;padding:0 20mm;">
          <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:17pt;color:#1A1715;line-height:1.7;">${esc(ademText)}</div>
        </div>
        <div style="position:absolute;bottom:10mm;left:0;right:0;text-align:center;">
          <div style="font-family:'Inter',sans-serif;font-size:6pt;font-weight:300;color:#C8C4BC;letter-spacing:0.18em;text-transform:uppercase;">Faculty of Human Design</div>
        </div>
      </div>`
    : "";

  // ── Build full page layout directly (no sectionHeaderHTML wrapper) ──────
  const page = `
${ademPage}<div style="break-before:page;">
  <div style="height:55mm;background:#1A1715;position:relative;overflow:hidden;">
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:#C9A85C;"></div>
    <div style="position:absolute;right:16mm;top:0;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:72pt;font-weight:400;color:#C9A85C;opacity:0.05;line-height:1;padding-top:2mm;">${String(idx + 1).padStart(2, "0")}</div>
    <div style="padding:10mm 16mm 0 24mm;">
      <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#9A8050;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:6px;">${esc(partLabel)}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:28pt;color:#FFFFFF;line-height:1.15;max-width:150mm;">${esc(section.title)}</div>
      <div style="display:flex;align-items:center;margin-top:8px;">
        <div style="width:40px;height:0.75px;background:#C9A85C;"></div>
        <div style="width:20px;height:0.4px;background:#C9A85C;opacity:0.35;"></div>
      </div>
    </div>
  </div>
  ${pullQuoteStrip}
  <div style="padding:16mm 0 12mm;max-width:160mm;margin:0 auto;-webkit-box-decoration-break:clone;box-decoration-break:clone;">
    ${kernHTML}
    ${microInzichtenHTML}
    ${chartBlockHTML}
  </div>
</div>`;

  return page + buildSectionClosingJSON(section, idx, order);
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
function buildExecutiveSummaryPage(order) {
  // For child reports, show the child's chart — parent's data is just context
  const childReport = isChildReport(order);
  const bd    = childReport ? (order.partner_birth_data || order.birth_data || {}) : (order.birth_data || {});
  const chart = bd.chart || {};
  const lang  = order.language || "nl";
  const ta    = typeAccent(chart.type);
  const isEN  = lang === "en";
  // Label: "JOUW ONTWERP" for self, "ONTWERP VAN [name]" for child
  const personName = childReport ? (bd.name || (isEN ? "your child" : "je kind")) : null;

  // Type taglines — short emotional framing per type
  const TYPE_TAGLINE = {
    nl: {
      "generator":            "Een onuitputtelijke bron van levensenergie — geboren om te doen wat werkelijk resoneert.",
      "manifesting generator":"Snelheid en veelzijdigheid in één — een ontwerp dat meerdere wegen tegelijk bewandelt.",
      "manifesteerend generator": "Snelheid en veelzijdigheid in één — een ontwerp dat meerdere wegen tegelijk bewandelt.",
      "projector":            "Diepgaand inzicht in anderen — geboren om te leiden zonder energie te forceren.",
      "manifestor":           "Onafhankelijk en initiërend — een kracht die in beweging komt op eigen gezag.",
      "manifesteerder":       "Onafhankelijk en initiërend — een kracht die in beweging komt op eigen gezag.",
      "reflector":            "Een unieke spiegel — geboren om de gezondheid van haar omgeving te weerspiegelen.",
    },
    en: {
      "generator":            "An inexhaustible source of life force — born to do what truly resonates.",
      "manifesting generator":"Speed and versatility in one — a design that walks multiple paths at once.",
      "projector":            "Deep insight into others — born to guide without forcing energy.",
      "manifestor":           "Independent and initiating — a force that moves on its own authority.",
      "reflector":            "A unique mirror — born to reflect the health of the world around them.",
    },
  };

  const typeKey = (chart.type || "").toLowerCase();
  const taglineMap = isEN ? TYPE_TAGLINE.en : TYPE_TAGLINE.nl;
  const tagline = Object.keys(taglineMap).find(function(k) { return typeKey.includes(k); });
  const typeTagline = tagline ? taglineMap[tagline] : "";

  // Data pairs — left / right columns
  const pairs = [
    chart.strat   ? { label: ui(lang, "Strategie",        "Strategy"),         value: tvl(chart.strat,   lang) } : null,
    chart.auth    ? { label: ui(lang, "Autoriteit",       "Authority"),        value: tvl(chart.auth,    lang) } : null,
    chart.profile ? { label: ui(lang, "Profiel",          "Profile"),          value: chart.profile }            : null,
    chart.sig     ? { label: ui(lang, "Signatuur",        "Signature"),        value: tvl(chart.sig,     lang) } : null,
    chart.notSelf ? { label: "Not-Self",                                        value: tvl(chart.notSelf, lang) } : null,
    chart.cross   ? { label: ui(lang, "Inkarnatie-kruis", "Incarnation cross"), value: chart.cross }              : null,
  ].filter(Boolean);

  // Render as a clean 2-column grid
  const pairsHTML = pairs.map(function(p) {
    return `<div style="padding:11px 0;border-bottom:0.4px solid #E5E0D8;">
      <div style="font-family:'Inter',sans-serif;font-size:6pt;font-weight:500;color:#A8A29E;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:4px;">${esc(p.label)}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:13pt;font-weight:600;color:#1A1715;line-height:1.2;">${esc(p.value)}</div>
    </div>`;
  }).join("");

  // Signature / not-self pull-quote (use translated values for EN)
  const sigTvl     = tvl(chart.sig,     lang);
  const notSelfTvl = tvl(chart.notSelf, lang);
  const sigQuote = chart.sig && chart.notSelf
    ? (isEN
        ? `You know you are on the right path when you feel <em>${esc(sigTvl)}</em>. When <em>${esc(notSelfTvl)}</em> arises, it is not failure — it is navigation.`
        : `Je weet dat je op het goede pad bent als je <em>${esc(chart.sig)}</em> voelt. Wanneer <em>${esc(chart.notSelf)}</em> opkomt, is dat geen falen — het is navigatie.`)
    : null;

  return `
<div style="width:210mm;height:247mm;margin-top:0;background:#FFFFFF;position:relative;overflow:hidden;break-before:page;break-inside:avoid;">
  <!-- Dark header with type -->
  <div style="background:${ta.bg};position:relative;overflow:hidden;padding:14mm 20mm 12mm 24mm;">
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:${ta.bar};"></div>
    <div style="position:absolute;right:14mm;top:0;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:80pt;font-weight:400;color:${ta.fg};opacity:0.04;line-height:1;padding-top:4mm;white-space:nowrap;overflow:hidden;">HD</div>
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:${ta.fg};letter-spacing:0.28em;text-transform:uppercase;opacity:0.65;margin-bottom:8px;">${personName ? esc((isEN ? "DESIGN OF " : "ONTWERP VAN ") + personName.toUpperCase()) : ui(lang, "JOUW ONTWERP", "YOUR DESIGN")}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-weight:400;font-size:36pt;color:#FFFFFF;line-height:1.1;letter-spacing:-0.01em;">${esc(tvl(chart.type, lang) || "")}</div>
    ${chart.profile ? `<div style="font-family:'Inter',sans-serif;font-size:8.5pt;font-weight:300;color:${ta.fg};opacity:0.7;margin-top:6px;letter-spacing:0.06em;">${ui(lang, "Profiel", "Profile")} ${esc(chart.profile)}</div>` : ""}
    ${typeTagline ? `<div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:10pt;font-weight:300;color:#FFFFFF;opacity:0.45;margin-top:10px;max-width:140mm;line-height:1.5;">${esc(typeTagline)}</div>` : ""}
  </div>

  <!-- Data grid -->
  <div style="padding:6mm 20mm 0;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 28px;">
      ${pairsHTML}
    </div>
  </div>

  <!-- Signature / not-self framing -->
  ${sigQuote ? `
  <div style="margin:8mm 20mm 0;padding:14px 18px;background:#FFFFFF;border-left:3px solid #C9A85C;">
    <div style="font-family:'Inter',sans-serif;font-size:6pt;font-weight:500;color:#C9A85C;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:7px;">${ui(lang, "JOUW KOMPAS", "YOUR COMPASS")}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11pt;color:#2A2820;line-height:1.6;">${sigQuote}</div>
  </div>` : ""}

  <div style="position:absolute;bottom:0;left:0;right:0;padding:0 20mm 10mm;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">${esc(order.report_title || "")}</div>
    <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:300;color:#A8A29E;">Faculty of Human Design</div>
  </div>
</div>`;
}

// ─── PAGE: METHODOLOGY ────────────────────────────────────────────────────────
function buildMethodologyPage(order) {
  const bd   = order.birth_data || {};
  const lang = order.language || "nl";
  const isEN = lang === "en";

  const MAANDEN = ["","januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
  const MONTHS  = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
  const dateStr = bd.day
    ? `${bd.day} ${(isEN ? MONTHS : MAANDEN)[parseInt(bd.month)] || bd.month} ${bd.year}`
    : "";
  const timeStr = bd.hour != null
    ? `${String(bd.hour).padStart(2,"0")}:${String(bd.minute || 0).padStart(2,"0")}`
    : "";

  return `
<div style="width:210mm;height:247mm;margin-top:0;background:#FFFFFF;position:relative;overflow:hidden;break-before:page;break-inside:avoid;">
  <div style="height:4px;background:#1A1715;"></div>
  <div style="padding:10mm 20mm 0;">
    <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#C9A85C;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:6px;">${ui(lang, "BEREKENING", "CALCULATION")}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:22pt;color:#1A1715;line-height:1.1;margin-bottom:10px;">${ui(lang, "Zo is dit rapport berekend", "How this report was calculated")}</div>
    <div style="height:0.75px;background:#C9A85C;margin-bottom:16px;"></div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin-bottom:20px;">
      ${dateStr ? `<div style="padding:8px 0;border-bottom:0.4px solid #E5E0D8;">
        <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">${ui(lang, "GEBOORTEDATUM", "DATE OF BIRTH")}</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:13pt;color:#1A1715;">${esc(dateStr)}</div>
      </div>` : ""}
      ${timeStr ? `<div style="padding:8px 0;border-bottom:0.4px solid #E5E0D8;">
        <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">${ui(lang, "GEBOORTETIJD", "TIME OF BIRTH")}</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:13pt;color:#1A1715;">${esc(timeStr)}</div>
      </div>` : ""}
      ${bd.place ? `<div style="padding:8px 0;border-bottom:0.4px solid #E5E0D8;">
        <div style="font-family:'Inter',sans-serif;font-size:6.5pt;font-weight:500;color:#A8A29E;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">${ui(lang, "GEBOORTEPLAATS", "PLACE OF BIRTH")}</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:13pt;color:#1A1715;">${esc(bd.place)}</div>
      </div>` : ""}
    </div>

    <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#A8A29E;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:10px;">${ui(lang, "BEREKENINGSWIJZE", "CALCULATION METHOD")}</div>
    <p style="font-family:'Inter',sans-serif;font-size:9.5pt;line-height:1.72;color:#2A2820;margin-bottom:10px;">${ui(lang,
      "Dit rapport is berekend met behulp van de Swiss Ephemeris — de meest nauwkeurige astronomische database ter wereld, ook gebruikt door professionele astrologen en sterrenwachten. Op basis van jouw exacte geboortetijdstip worden de planetaire posities op de minuut nauwkeurig bepaald.",
      "This report was calculated using the Swiss Ephemeris — the most accurate astronomical database in the world, also used by professional astrologers and observatories. Based on your exact birth time, planetary positions are determined to the minute."
    )}</p>
    <p style="font-family:'Inter',sans-serif;font-size:9.5pt;line-height:1.72;color:#2A2820;margin-bottom:10px;">${ui(lang,
      "Vanuit die posities worden jouw 64 poorten, gedefinieerde centra en actieve kanalen afgeleid via de Human Design systematiek zoals beschreven door Ra Uru Hu. De berekening combineert de bewuste (persoonlijkheid) en onbewuste (ontwerp) component op basis van twee afzonderlijke planetaire momentopnames.",
      "From those positions, your 64 gates, defined centers and active channels are derived through the Human Design system as described by Ra Uru Hu. The calculation combines the conscious (personality) and unconscious (design) component based on two separate planetary snapshots."
    )}</p>
    <p style="font-family:'Inter',sans-serif;font-size:9.5pt;line-height:1.72;color:#2A2820;margin-bottom:20px;">${ui(lang,
      "Elke berekening is uniek voor jouw geboortegegevens en kan niet worden veralgemeend naar anderen.",
      "Every calculation is unique to your birth data and cannot be generalised to others."
    )}</p>

    <div style="background:#FFFFFF;border-left:3px solid #E5E0D8;padding:10px 14px;">
      <p style="font-family:'Inter',sans-serif;font-size:8.5pt;line-height:1.65;color:#6B6560;font-style:italic;">${ui(lang,
        "Dit rapport is een persoonlijk werkdocument bedoeld voor zelfreflectie en bewustwording. Het is geen vervanging voor medisch, psychologisch, financieel of juridisch advies. Faculty of Human Design aanvaardt geen aansprakelijkheid voor beslissingen genomen op basis van de inhoud van dit rapport.",
        "This report is a personal working document intended for self-reflection and awareness. It is not a substitute for medical, psychological, financial or legal advice. Faculty of Human Design accepts no liability for decisions made based on the contents of this report."
      )}</p>
    </div>
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
<div style="width:210mm;height:247mm;margin-top:0;background:#1A1715;position:relative;overflow:hidden;break-before:page;break-inside:avoid;display:flex;flex-direction:column;align-items:center;justify-content:center;">
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:#C9A85C;"></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:#C9A85C;"></div>
  ${coverDecoration(297, 380)}
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

// ─── GATE REFERENCE (NL / EN) ─────────────────────────────────────────────────
const GATE_REF = {
   1: { nl: "Zelfuitdrukking",          en: "Self-Expression" },
   2: { nl: "Richting van het Zelf",    en: "Direction of the Higher" },
   3: { nl: "Ordening",                 en: "Ordering" },
   4: { nl: "Formulering",              en: "Formulization" },
   5: { nl: "Vaste Patronen",           en: "Fixed Rhythms" },
   6: { nl: "Wrijving",                 en: "Friction" },
   7: { nl: "Rol van het Zelf",         en: "Role of the Self" },
   8: { nl: "Bijdrage",                 en: "Contribution" },
   9: { nl: "Focus",                    en: "Focus" },
  10: { nl: "Gedrag van het Zelf",      en: "Behavior of the Self" },
  11: { nl: "Ideeën",                   en: "Ideas" },
  12: { nl: "Voorzichtigheid",          en: "Caution" },
  13: { nl: "De Luisteraar",            en: "The Listener" },
  14: { nl: "Kracht door Bezit",        en: "Power Skills" },
  15: { nl: "Uitersten",                en: "Extremes" },
  16: { nl: "Vaardigheden",             en: "Skills" },
  17: { nl: "Meningen",                 en: "Opinions" },
  18: { nl: "Correctie",                en: "Correction" },
  19: { nl: "Behoefte",                 en: "Want" },
  20: { nl: "Nu",                       en: "The Now" },
  21: { nl: "De Jager",                 en: "The Hunter/Huntress" },
  22: { nl: "Openheid",                 en: "Openness" },
  23: { nl: "Assimilatie",              en: "Assimilation" },
  24: { nl: "Rationalisatie",           en: "Rationalization" },
  25: { nl: "Geest van het Zelf",       en: "Spirit of the Self" },
  26: { nl: "De Egoist",                en: "The Egoist" },
  27: { nl: "Zorg",                     en: "Caring" },
  28: { nl: "De Speler",                en: "The Game Player" },
  29: { nl: "Zeggen Ja",               en: "Perseverance" },
  30: { nl: "Erkenning van Gevoelens",  en: "Feelings" },
  31: { nl: "Leiderschap",              en: "Leadership" },
  32: { nl: "Continuïteit",             en: "Continuity" },
  33: { nl: "Privacy",                  en: "Privacy" },
  34: { nl: "Kracht",                   en: "Power" },
  35: { nl: "Verandering",              en: "Change" },
  36: { nl: "Duisternis van het Licht", en: "Crisis" },
  37: { nl: "Vriendelijkheid",          en: "Friendship" },
  38: { nl: "De Strijder",              en: "The Fighter" },
  39: { nl: "Provocateur",              en: "The Provocateur" },
  40: { nl: "Eenzaamheid",              en: "Aloneness" },
  41: { nl: "Contractie",               en: "Contraction" },
  42: { nl: "Groei",                    en: "Growth" },
  43: { nl: "Doorbraak",                en: "Insight" },
  44: { nl: "Waarschuwing",             en: "Coming to Meet" },
  45: { nl: "De Vergadering",           en: "The Gatherer" },
  46: { nl: "Determinatie van het Zelf",en: "Determination of the Self" },
  47: { nl: "Realisatie",               en: "Realization" },
  48: { nl: "De Diepte",                en: "The Depth" },
  49: { nl: "Principes",                en: "Principles" },
  50: { nl: "Waarden",                  en: "Values" },
  51: { nl: "Schok",                    en: "Shock" },
  52: { nl: "Stilte",                   en: "Stillness" },
  53: { nl: "Beginnen",                 en: "Beginnings" },
  54: { nl: "De Drijfveer",             en: "Ambition" },
  55: { nl: "Geest",                    en: "Spirit" },
  56: { nl: "Stimulering",              en: "Stimulation" },
  57: { nl: "Intuïtief Inzicht",        en: "Intuitive Clarity" },
  58: { nl: "Levensenergie",            en: "Joy" },
  59: { nl: "Seksualiteit",             en: "Sexuality" },
  60: { nl: "Acceptatie",               en: "Acceptance" },
  61: { nl: "Innerlijke Waarheid",      en: "Mystery" },
  62: { nl: "Details",                  en: "Details" },
  63: { nl: "Twijfel",                  en: "Doubt" },
  64: { nl: "Verwarring",               en: "Confusion" },
};

// ─── CHILD-SAFE GATE OVERRIDES ───────────────────────────────────────────────
// For kinderrapport (report_id="kind"), replace adult gate labels with child-appropriate names.
const CHILD_GATE_OVERRIDE = {
  nl: { 59: "Verbinding & Creatie", 5: "Geduld in Groei", 34: "Sterkte & Veerkracht" },
  en: { 59: "Connection & Creation", 5: "Growing Patience", 34: "Strength & Resilience" },
};

function isChildReport(order) {
  const rid = (order.report_id || "").toLowerCase();
  const rtitle = (order.report_title || "").toLowerCase();
  return rid === "kind" || /kinderrapport|child\s*report/.test(rtitle);
}

// ─── PAGE: GATE APPENDIX ──────────────────────────────────────────────────────
function buildGateAppendixPage(order) {
  const lang  = order.language || "nl";
  // For child reports, the gate appendix shows the CHILD's gates (from partner_birth_data)
  const childReport = isChildReport(order);
  const chartSource = childReport ? (order.partner_birth_data || order.birth_data || {}) : (order.birth_data || {});
  const chart = chartSource.chart || {};
  const gates = (chart.allGates || []).slice().sort(function(a, b) { return a - b; });

  if (!gates.length) return "";

  const childOverrides = CHILD_GATE_OVERRIDE[lang === "en" ? "en" : "nl"] || {};

  const headerLabel = ui(lang, "JOUW CHART", "YOUR CHART");
  const pageTitle   = ui(lang,
    childReport ? "Actieve poorten van je kind" : "Jouw actieve poorten",
    childReport ? "Your child's active gates" : "Your active gates"
  );
  const introText   = ui(lang,
    childReport
      ? "Onderstaande poorten zijn actief in het chart van je kind — zowel vanuit de bewuste (persoonlijkheid) als de onbewuste (ontwerp) component. Elke poort draagt een specifiek energetisch thema dat deel uitmaakt van het ontwerp van je kind."
      : "Onderstaande poorten zijn actief in jouw chart — zowel vanuit de bewuste (persoonlijkheid) als de onbewuste (ontwerp) component. Elke poort draagt een specifiek energetisch thema dat deel uitmaakt van jouw ontwerp.",
    childReport
      ? "The gates below are active in your child's chart — from both the conscious (personality) and unconscious (design) component. Each gate carries a specific energetic theme that is part of your child's design."
      : "The gates below are active in your chart — from both the conscious (personality) and unconscious (design) component. Each gate carries a specific energetic theme that is part of your design."
  );

  const gateCards = gates.map(function(g) {
    const ref  = GATE_REF[g] || { nl: "—", en: "—" };
    // For child reports, override adult gate labels with child-appropriate names
    const baseLabel = lang === "en" ? ref.en : ref.nl;
    const name = (childReport && childOverrides[g]) ? childOverrides[g] : baseLabel;
    return `<div style="padding:10px 14px;border:0.5px solid #E5E0D8;background:#FFFFFF;break-inside:avoid;">
      <div style="font-family:'Cormorant Garamond',serif;font-size:18pt;font-weight:600;color:#C9A85C;line-height:1;">${g}</div>
      <div style="font-family:'Inter',sans-serif;font-size:8.5pt;font-weight:400;color:#1A1715;margin-top:4px;line-height:1.35;">${esc(name)}</div>
    </div>`;
  }).join("");

  const cols = gates.length <= 18 ? 3 : 4;

  return `
<div style="background:#FFFFFF;position:relative;break-before:page;padding:0 0 34mm;">
  <div style="height:4px;background:#1A1715;"></div>
  <div style="padding:10mm 20mm 0;">
    <div style="font-family:'Inter',sans-serif;font-size:7pt;font-weight:500;color:#C9A85C;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:6px;">${esc(headerLabel)}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:24pt;color:#1A1715;line-height:1.1;margin-bottom:8px;">${esc(pageTitle)}</div>
    <div style="height:0.75px;background:#C9A85C;margin-bottom:12px;"></div>
    <p style="font-family:'Inter',sans-serif;font-size:8.5pt;line-height:1.65;color:#6B6560;margin-bottom:16px;max-width:160mm;">${esc(introText)}</p>
    <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;">
      ${gateCards}
    </div>
  </div>
</div>`;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function buildHTML({ order, sections, svgBodygraph, svgPartnerBodygraph }) {
  const lang = order.language || "nl";
  const bd = order.birth_data || {};
  const chart = bd.chart || {};
  const childReport = isChildReport(order);

  const hasChart = chart.type && Array.isArray(chart.definedCenters);

  // For child reports: profile/bodygraph/gate pages show the child's chart
  const partnerBD = order.partner_birth_data || {};
  const partnerChart = partnerBD.chart || {};
  const hasPartnerChart = partnerChart.type && Array.isArray(partnerChart.definedCenters);
  // Which chart has data for the profile/bodygraph pages
  const hasProfileChart = childReport ? hasPartnerChart : hasChart;
  // Which SVG to render on the bodygraph page
  const profileSvg = childReport ? (svgPartnerBodygraph || svgBodygraph) : svgBodygraph;

  const bundledFonts = buildFontCSS();
  const fontBlock = bundledFonts
    ? `<style>${bundledFonts}</style>`
    : `<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>`;

  // Transition pages — one halfway, one before the final section
  const midTransition = buildTransitionPage(
    "Afstemming is niet iemand anders worden.\nHet is onthouden wat jouw lichaam al weet.",
    "Alignment is not becoming someone else.\nIt is remembering what your body already knows.",
    order
  );
  const finalTransition = buildTransitionPage(
    "Jij bent niet hier om jezelf te worden.\nJij bent hier om te onthouden wie je al bent.",
    "You are not here to become yourself.\nYou are here to remember who you already are.",
    order
  );
  const midIdx  = Math.floor(sections.length / 2);
  const lastIdx = sections.length - 1;
  const sectionPagesWithTransition = sections.map(function(s, i) {
    const page = buildSectionPages(s, i, order);
    if (sections.length > 3 && i === midIdx) return midTransition + page;
    if (sections.length > 1 && i === lastIdx) return finalTransition + page;
    return page;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
${fontBlock}
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @page { size: A4 portrait; margin: 0; }
  html, body { width: 210mm; background: #F7F5F0; color-scheme: light; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Inter', sans-serif; }
  @media print {
    html, body { width: 210mm; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
${buildCoverPage(order)}
${buildIntroPage(order)}
${buildHowToReadPage(order)}
${hasProfileChart ? buildExecutiveSummaryPage(order) : ""}
${buildMethodologyPage(order)}
${buildTOCPage(sections, order, hasProfileChart, !!profileSvg)}
${hasProfileChart ? buildProfilePage(order) : ""}
${hasProfileChart && profileSvg ? buildBodygraphPage(profileSvg, order) : ""}
${hasProfileChart ? buildGateAppendixPage(order) : ""}
${sectionPagesWithTransition}
${buildClosingPage(order)}
</body>
</html>`;
}
