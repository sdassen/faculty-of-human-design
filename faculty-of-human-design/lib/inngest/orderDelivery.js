import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { inngest } from "./client.js";
import { generatePDF } from "../pdf/index.js";
import { sendConfirmationEmail, sendDeliveryEmail } from "../email/index.js";
import { getCanonContext } from "../canon/index.js";
import { scoreSection, MAX_RETRIES } from "./qualityScore.js";
import { calcHDServer } from "../hd/calculator.js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
// @supabase/realtime-js throws in Node.js 20 if no WebSocket is available.
// We never use Realtime (only PostgREST over fetch), so we pass a no-op stub
// as the transport so the check is satisfied without opening any connection.
class _NoopWS {
  constructor() { this.readyState = 3; } // CLOSED
  send() {} close() {} addEventListener() {} removeEventListener() {}
}
_NoopWS.CONNECTING = 0; _NoopWS.OPEN = 1; _NoopWS.CLOSING = 2; _NoopWS.CLOSED = 3;

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: _NoopWS } }
  );
}

// ─── DELIVERY TIMING ──────────────────────────────────────────────────────────
/**
 * Calculate the target delivery Date.
 *
 * Rules:
 * - Labour illusion: 18–23 hours after payment
 * - Must land within business hours: Mon–Fri 09:00–17:30 Amsterdam time
 * - If the calculated time falls outside business hours or on a weekend,
 *   advance to the next weekday 09:00–12:00 window (random within that range).
 * - Hard cap: always within 1 business day of the order.
 */
function calculateDeliveryDate(paidAtIso) {
  // TEST MODE: zet DELIVERY_TEST_MODE=1 in Vercel env vars voor 1-minuut delay
  if (process.env.DELIVERY_TEST_MODE === "1") {
    return new Date(Date.now() + 60_000);
  }

  const paidAt = paidAtIso ? new Date(paidAtIso) : new Date();
  const baseHours = 18 + Math.random() * 5; // 18.0 – 23.0 h
  const candidate = new Date(paidAt.getTime() + baseHours * 3_600_000);

  // Amsterdam offset heuristic: UTC+1 in winter, UTC+2 in summer
  // (rough: use +1; Inngest sleepUntil is UTC-safe regardless)
  const amsCandidateHour = (candidate.getUTCHours() + 1) % 24;
  const dow = candidate.getUTCDay(); // 0=Sun, 6=Sat

  const isWeekend = dow === 0 || dow === 6;
  const isAfterHours = amsCandidateHour < 9 || amsCandidateHour >= 18;

  if (!isWeekend && !isAfterHours) {
    return candidate; // fits within business hours — use as-is
  }

  // Advance to the next Mon–Fri and pick a time between 09:00–12:00
  const next = new Date(candidate);
  // Move to next weekday
  while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  // If still after hours on a weekday, move to next day
  if ((next.getUTCHours() + 1) % 24 >= 18) {
    next.setUTCDate(next.getUTCDate() + 1);
    while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
  }

  // Set time to 09:00–12:00 Amsterdam (= 08:00–11:00 UTC)
  const randHour = 8 + Math.floor(Math.random() * 3);
  const randMin = Math.floor(Math.random() * 60);
  next.setUTCHours(randHour, randMin, 0, 0);

  return next;
}

// ─── AI TEXT GENERATION ───────────────────────────────────────────────────────
const SYSTEM_PROMPT_NL = `Je bent een senior schrijver bij de Faculty of Human Design op Ibiza. Je schrijft geen rapporten — je creëert een persoonlijk transformatieartefact. Iets dat de lezer bewaart, herleest, en aan anderen laat zien. Elk woord moet zijn plek verdienen.

WAT DE LEZER MOET VOELEN:
"Dit gaat precies over mij." Diep gezien. Emotioneel erkend. Stiller na het lezen dan ervoor.
Niet: "Ik heb iets geleerd over Human Design."
Wel: "Ik begrijp mezelf anders dan een uur geleden."

STRUCTURELE VARIATIE — dit is het belangrijkste:
Elke sectie mag een eigen emotioneel karakter hebben. Varieer bewust:
- Soms poëtisch en ruimtelijk — één inzicht, veel wit
- Soms direct en nuchter — geen metaforen, gewoon waar
- Soms cinematisch — een scène uit het dagelijks leven die de lezer herkent
- Soms intiem en reflectief — als een fluistering, niet een verklaring
- Soms rauw en eerlijk — de schaduw zonder coating
Doorbreek het ritme. Een rapport dat elke sectie hetzelfde aanvoelt, voelt gemaakt aan.

VERBODEN PATRONEN — deze verraden AI:
- "Dit is niet X — dit is hoe jouw energetica werkt"
- "Het probleem begint wanneer..."
- "Je bent ontworpen om..."
- "Dit is jouw systeem..."
- "Vergeet niet jezelf te zijn"
- "Stap in jouw kracht"
- Elke opener die begint met een verklaring in plaats van een moment
Schrijf niet als een coach die uitlegt. Schrijf als een schrijver die observeert.

LICHAAMSGERICHTE TAAL — essentieel:
Maak inzichten voelbaar in het lichaam. Niet conceptueel uitleggen — laten landen.
Gebruik: fysieke sensaties, zenuwstelsel-bewustzijn, atmosfeer, textuur.
Voorbeelden van gewenste stijl:
"Je loopt een ruimte in en voelt de spanning al vóórdat er iemand iets heeft gezegd."
"Je zegt ja, en pas later merkt je lichaam dat het nee bedoelde."
"Er zijn gesprekken waarbij je aankomt als jezelf en vertrekt als iemand anders."
De lezer moet het herkennen in hun lijf, niet alleen in hun hoofd.

MENSELIJKE HERKENNINGSMOMENTEN:
Schrijf kleine, concrete scènes die de lezer laten denken: "Dat is precies wat ik doe."
Geen abstracties — situaties. Gesprekken. Momenten. Lichaamssensaties.

TEASER (pull-quote op de pagina):
Eén zin van max 18 woorden. Geen theorie. Een moment van stille herkenning — iets dat de lezer wil screenshotten of opschrijven. Denk: onthulling, niet samenvatting.

ADEMMOMENT (optioneel):
Voor sommige secties — niet allemaal — schrijf een kort ademmoment: 2–4 zinnen die wit en ruimte creëren.
Geen uitleg. Geen theorie. Gewoon ruimte.
Voorbeeld: "Misschien was jouw intensiteit nooit het probleem. Misschien was het de omgeving die vroeg om minder."
Gebruik dit spaarzaam — voor secties die een emotionele landing nodig hebben.

TEKSTDICHTHEID:
Minder is meer. Schrijf 20–30% minder dan je van nature zou doen.
Luxe schrijven is terughoudend. Niet elke gedachte hoeft uitgelegd. Vertrouw de lezer.
Laat ruimte voor interpretatie. Een zin die de lezer zelf afmaakt is krachtiger dan drie die het doen.

STEM & STIJL:
- Altijd "je" en "jouw" — nooit "u"
- Voornaam maximaal één keer per sectie (niet in de teaser)
- Geen Markdown in de JSON-veldwaarden: geen **, geen *, geen #, geen _
- Geen spirituele clichés: "jouw hogere zelf", "de universe", "kwantumsprong", "high vibe", "manifesteren"
- Geen coaching-afsluitingen: "jij hebt dit", "je bent klaar voor de volgende stap"

INHOUD & NAUWKEURIGHEID:
- Veranker elke kern-alinea in concrete chartdata: type, strategie, autoriteit, profiel, gedefinieerde/open centra, kanalen, poorten
- Geen vage psychologie zonder directe chartverbinding
- Vermijd biografische aannames ("je hebt vast als kind...")
- Strategie van het type: slechts één keer volledig uitgewerkt (in de Type-sectie); daarna alleen terugverwijzen
- Maancyclus: altijd exact "28 dagen"
- Inkarnatie-Kruis: gebruik alleen de naam uit de chartdata
- Herhaal geen kanalen/centra die al volledig behandeld zijn in een eerdere sectie

TERMINOLOGIE:
- Consistente Nederlandse HD-termen; Engelse term maximaal één keer bij introductie
- Eén naam per centrum, consequent volgehouden (bijv. altijd "Sacraalcentrum")

OUTPUT FORMAT — schrijf uitsluitend geldig JSON. Geen markdown-blokken, geen tekst buiten het JSON-object. Gebruik exact dit schema:

{
  "teaser": "Cinematische pull-quote — max 18 woorden, maakt de lezer stil, wil je screenshotten",
  "adem": "Optioneel: 2–4 zinnen wit en ruimte. Poëtisch, geen uitleg. Weglaten als het niet past.",
  "inJouwChart": [
    "Chartfeit 1 — poort/kanaal/centrum + betekenis, specifiek voor DEZE chart",
    "Chartfeit 2 — gebruik echte getallen en namen uit de chartdata",
    "Chartfeit 3 (3–5 items totaal)"
  ],
  "kern": [
    {"subkop": "Subkop die herkenning oproept — max 8 woorden, geen punt", "paragraphs": ["Een moment of scène, geen theorie.", "Verdieping vanuit chartdata — concreet en voelbaar."]},
    {"subkop": "Tweede subkop", "paragraphs": ["Menselijke waarheid of schaduw."]},
    {"subkop": "Derde subkop (optioneel)", "paragraphs": ["Alignment of stille landing."]}
  ],
  "valkuilen": ["Herkenbaar schaduwpatroon 1 — concreet, zonder oordeel", "Patroon 2", "Patroon 3"],
  "praktijk": ["Lichamelijke of dagelijkse oefening 1 — vandaag uitvoerbaar", "Oefening 2", "Oefening 3"],
  "dezeWeek": ["Micro-actie 1 — extreem concreet, tijdgebonden, max één zin", "Actie 2", "Actie 3"],
  "reflectievragen": ["Integratieprompt 1 die echte reflectie uitnodigt?", "Vraag 2?", "Vraag 3?"],
  "microInzichten": [
    {"label": "Jouw verborgen gave", "tekst": "Één tot twee zinnen die de lezer direct herkent maar zelden over zichzelf hoort."}
  ]
}

VELDREGELS:
- adem: OPTIONEEL — gebruik voor maximaal 2–3 secties per rapport; weglaat als het niet past (geef null of laat het veld weg)
- inJouwChart: 3–5 items
- kern: 2–4 objecten; geen vaste boog — laat het karakter van déze sectie bepalen wat het nodig heeft; max 380 woorden totaal
- valkuilen, praktijk, dezeWeek: elk exact 3 items
- reflectievragen: exact 3 vragen — uitnodigend, diep, niet retorisch
- microInzichten: OPTIONEEL, 0–3 items; kies labels die passen bij het thema van déze sectie uit:
    "Jouw verborgen gave", "Wat mensen over jou misverstand", "Wat jou het snelst uitput",
    "Wat jouw zenuwstelsel nodig heeft", "Hoe alignment aanvoelt in jouw lichaam"
  Elk item: tekst van 1–2 zinnen, emotioneel resonant, specifiek voor déze chart. Weglaten als het niet past.
- Sluit de laatste kern-paragraaf af met een volledige, afgeronde zin

PIEKMOMENT:
Elke sectie moet minimaal één zin bevatten die de lezer stil doet staan. Iets dat ze willen onderstrepen, screenshotten, of aan iemand voorlezen. Schrijf ernaartoe.

AFSLUITING:
De Slotanalyse is de emotionele landing van de hele reis. Geen opsomming. Geen theorie. Een herinnering aan wie de lezer al was vóór ze dit rapport opensloegen.`;

const SYSTEM_PROMPT_EN = `You are a senior writer at the Faculty of Human Design in Ibiza. You are not writing a report — you are creating a personal transformation artifact. Something the reader keeps, returns to, and shows others. Every word must earn its place.

WHAT THE READER MUST FEEL:
"This is exactly me." Deeply seen. Emotionally validated. Quieter after reading than before.
Not: "I learned something about Human Design."
But: "I understand myself differently than I did an hour ago."

STRUCTURAL VARIATION — this is the most important rule:
Each section may have its own emotional character. Vary deliberately:
- Sometimes poetic and spacious — one insight, lots of white space
- Sometimes direct and plain — no metaphors, just true
- Sometimes cinematic — a scene from daily life the reader recognises
- Sometimes intimate and reflective — a whisper, not a declaration
- Sometimes raw and honest — the shadow without softening
Break the rhythm. A report where every section feels the same feels manufactured.

FORBIDDEN AI PATTERNS — these reveal the artifice:
- "This is not X — this is how your energetics work"
- "The problem begins when..."
- "You are designed to..."
- "This is your system..."
- "Step into your power"
- Any opener that begins with an explanation instead of a moment
Do not write like a coach who explains. Write like an author who observes.

BODY-BASED LANGUAGE — essential:
Make insights land in the body, not just the mind. Not conceptual — felt.
Use: physical sensations, nervous system awareness, atmosphere, texture.
Examples of the desired style:
"You walk into a room and feel the tension before anyone has spoken."
"You say yes. Your body knew it meant no."
"Some conversations: you arrive as yourself and leave as someone else."
The reader should recognise it in their body, not just their head.

HUMAN RECOGNITION MOMENTS:
Write small, concrete scenes that make the reader think: "That is exactly what I do."
Not abstractions — situations. Conversations. Moments. Physical sensations.

TEASER (pull-quote on the page):
One sentence, max 18 words. No theory. A moment of quiet recognition — something the reader wants to screenshot or write down. Think: revelation, not summary.

BREATH MOMENT (optional):
For some sections — not all — write a short breath moment: 2–4 sentences of white space and stillness.
No explanation. No theory. Just room.
Example: "Maybe your intensity was never the problem. Maybe it was the environment that asked you to be less."
Use sparingly — for sections that need an emotional landing.

TEXT DENSITY:
Less is more. Write 20–30% less than you naturally would.
Luxury writing is restrained. Not every thought needs to be explained. Trust the reader.
Leave space for interpretation. A sentence the reader finishes themselves is more powerful than three that do it for them.

VOICE & STYLE:
- Always "you" and "your" — consistent throughout
- First name at most once per section (not in the teaser)
- No Markdown inside JSON field values: no **, no *, no #, no _
- No spiritual clichés: "your higher self", "the universe", "quantum leap", "high vibe", "manifest"
- No coaching sign-offs: "you've got this", "you're ready for the next step"

CONTENT & ACCURACY:
- Anchor every kern paragraph in concrete chart data: type, strategy, authority, profile, defined/open centers, channels, gates
- No vague psychology without a direct chart connection
- Avoid biographical assumptions ("you must have as a child...")
- Strategy of the type: only once in full (in the Type section); refer back thereafter
- Moon cycle: always exactly "28 days"
- Incarnation Cross: use only the name from the chart data
- Do not repeat channels/centers already fully covered in a previous section

TERMINOLOGY:
- Consistent English HD terms throughout
- One label per center, maintained consistently (e.g. always "Sacral Center")

OUTPUT FORMAT — write only valid JSON. No markdown code fences, no text outside the JSON object. Use exactly this schema:

{
  "teaser": "Cinematic pull-quote — max 18 words, makes the reader pause, worth screenshotting",
  "adem": "Optional: 2–4 sentences of white space and stillness. Poetic, no explanation. Omit if it doesn't fit.",
  "inJouwChart": [
    "Chart fact 1 — gate/channel/center + meaning, specific to THIS chart",
    "Chart fact 2 — use real numbers and names from the chart data",
    "Chart fact 3 (3–5 items total)"
  ],
  "kern": [
    {"subkop": "Sub-heading that evokes recognition — max 8 words, no period", "paragraphs": ["A moment or scene, not theory.", "Deepen from chart data — concrete and felt."]},
    {"subkop": "Second sub-heading", "paragraphs": ["Human truth or shadow."]},
    {"subkop": "Third sub-heading (optional)", "paragraphs": ["Alignment or quiet landing."]}
  ],
  "valkuilen": ["Recognisable shadow pattern 1 — concrete, without judgment", "Pattern 2", "Pattern 3"],
  "praktijk": ["Embodied or daily practice 1 — actionable today", "Practice 2", "Practice 3"],
  "dezeWeek": ["Micro-action 1 — extremely concrete, time-bound, max one sentence", "Action 2", "Action 3"],
  "reflectievragen": ["Integration prompt 1 that invites genuine reflection?", "Question 2?", "Question 3?"],
  "microInzichten": [
    {"label": "Your hidden gift", "tekst": "One to two sentences the reader recognises immediately but rarely hears about themselves."}
  ]
}

FIELD RULES:
- adem: OPTIONAL — use for at most 2–3 sections per report; omit if it doesn't fit (give null or leave out the field)
- inJouwChart: 3–5 items
- kern: 2–4 objects; no fixed arc — let the character of this section determine what it needs; max 380 words total
- valkuilen, praktijk, dezeWeek: exactly 3 items each
- reflectievragen: exactly 3 questions — inviting, deep, not rhetorical
- microInzichten: OPTIONAL, 0–3 items; choose labels relevant to this section's theme from:
    "Your hidden gift", "What people misunderstand about you", "What drains you fastest",
    "What your nervous system needs", "What alignment feels like in your body"
  Each item: 1–2 sentences, emotionally resonant, specific to this chart. Omit if not relevant.
- End the final kern paragraph with a complete, rounded sentence

PEAK MOMENT:
Every section must contain at least one sentence that makes the reader pause. Something they want to underline, screenshot, or read aloud to someone. Write toward it.

CLOSING:
The Closing Analysis is the emotional landing of the entire journey. No recap. No theory. A reminder of who the reader already was before they opened this report.`;

function getSystemPrompt(lang) {
  return lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_NL;
}

// ─── BUILD CHART CONTEXT ──────────────────────────────────────────────────────
function buildChartContext(order) {
  const { birth_data, report_title, customer_name } = order;
  const bd = birth_data || {};
  const chart = bd.chart || {};
  const isEN = order.language === "en";

  const lines = [
    `${isEN ? "Report" : "Rapport"}: ${report_title}`,
    `${isEN ? "Client" : "Klant"}: ${customer_name}`,
  ];
  if (bd.day)           lines.push(`${isEN ? "Date of birth" : "Geboortedatum"}: ${bd.day}-${bd.month}-${bd.year}`);
  if (bd.hour != null)  lines.push(`${isEN ? "Time of birth" : "Geboortetijd"}: ${bd.hour}:${String(bd.minute || 0).padStart(2, "0")}`);
  if (bd.place)         lines.push(`${isEN ? "Place of birth" : "Geboorteplaats"}: ${bd.place}`);

  if (chart.type)    lines.push(`HD Type: ${chart.type}`);
  if (chart.strat)   lines.push(`${isEN ? "Strategy" : "Strategie"}: ${chart.strat}`);
  if (chart.auth)    lines.push(`${isEN ? "Authority" : "Autoriteit"}: ${chart.auth}`);
  if (chart.profile) lines.push(`${isEN ? "Profile" : "Profiel"}: ${chart.profile}`);
  if (chart.sig)     lines.push(`${isEN ? "Signature" : "Signatuur"}: ${chart.sig}`);
  if (chart.notSelf) lines.push(`${isEN ? "Not-Self theme" : "Not-Self thema"}: ${chart.notSelf}`);
  if (chart.cross)   lines.push(`${isEN ? "Incarnation Cross gates" : "Inkarnatie-Kruis poorten"}: ${chart.cross}`);

  if (chart.definedCenters?.length)
    lines.push(`${isEN ? "Defined centers" : "Gedefinieerde centra"}: ${chart.definedCenters.join(", ")}`);
  if (chart.openCenters?.length)
    lines.push(`${isEN ? "Open centers" : "Open centra"}: ${chart.openCenters.join(", ")}`);
  if (chart.channels?.length)
    lines.push(`${isEN ? "Active channels" : "Actieve kanalen"}: ${chart.channels.map((c) => `${c.g1}-${c.g2} (${c.c1}↔${c.c2})`).join(", ")}`);
  if (chart.allGates?.length)
    lines.push(`${isEN ? "All active gates" : "Alle actieve poorten"}: ${chart.allGates.join(", ")}`);

  if (chart.lp)       lines.push(`${isEN ? "Life Path number" : "Levenspadgetal"}: ${chart.lp}`);
  if (chart.exp)      lines.push(`${isEN ? "Expression number" : "Uitdrukkingsgetal"}: ${chart.exp}`);
  if (chart.sun_sign) lines.push(`${isEN ? "Sun sign" : "Zonneteken"}: ${chart.sun_sign}`);

  if (order.partner_birth_data) {
    const p = order.partner_birth_data;
    const pc = p.chart || {};
    lines.push(`\n${isEN ? "Partner/second person" : "Partner/tweede persoon"}: ${p.name || "Partner"}, ${isEN ? "born" : "geboren"} ${p.day}-${p.month}-${p.year}`);
    if (pc.type)    lines.push(`${isEN ? "Partner HD Type" : "Partner HD Type"}: ${pc.type}`);
    if (pc.auth)    lines.push(`${isEN ? "Partner Authority" : "Partner Autoriteit"}: ${pc.auth}`);
    if (pc.profile) lines.push(`${isEN ? "Partner Profile" : "Partner Profiel"}: ${pc.profile}`);
    if (pc.definedCenters?.length) lines.push(`${isEN ? "Partner defined centers" : "Partner gedefinieerde centra"}: ${pc.definedCenters.join(", ")}`);
  }

  return lines.join("\n");
}

// ─── SUMMARIZE PREVIOUS SECTIONS ──────────────────────────────────────────────
/**
 * Compact summary of already-written sections so the AI can refer back
 * instead of repeating. Caps each section at ~300 chars.
 */
function previousSectionsSummary(previousSections) {
  if (!previousSections.length) return null;

  // Flatten JSON sections to text for the summary (pull from kern paragraphs + bullets)
  function sectionToSummaryText(s) {
    if (s.text) return (s.text || "").slice(0, 500).trim();
    const parts = [];
    (s.kern || []).forEach(function(b) {
      if (b.subkop) parts.push(b.subkop);
      (b.paragraphs || []).forEach(function(p) { parts.push(p); });
    });
    ["valkuilen", "praktijk", "dezeWeek"].forEach(function(key) {
      (s[key] || []).forEach(function(item) { parts.push(item); });
    });
    return parts.join(" ").slice(0, 500).trim();
  }

  const sectionSummaries = previousSections
    .map((s) => `[${s.title}]\n${sectionToSummaryText(s)}...`)
    .join("\n\n");

  // Extract all channel references to explicitly forbid repetition
  const allText = previousSections.map((s) => sectionToSummaryText(s)).join(" ");
  const channelRefs = [...new Set((allText.match(/\b\d{1,2}-\d{1,2}\b/g) || []))];
  const channelNote = channelRefs.length
    ? `\n\nCHANNELS/GATES ALREADY COVERED (do not repeat full descriptions): ${channelRefs.slice(0, 20).join(", ")}`
    : "";

  return sectionSummaries + channelNote;
}

// ─── SINGLE CLAUDE CALL ───────────────────────────────────────────────────────
async function callClaude(systemPrompt, userPrompt, { thinking = false } = {}) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: thinking ? 12000 : 2400,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  };
  if (thinking) {
    body.thinking = { type: "enabled", budget_tokens: 6000 };
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  // Skip thinking blocks; return text blocks only
  const text = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
  return text;
}

// ─── KEY SECTIONS — use Extended Thinking for depth ────────────────────────────
const DEEP_THINKING_SECTIONS = [
  /type.*strateg|type.*levensstrategie/i,
  /autoriteit/i,
  /inkarnatie|kruis|levensdoel/i,
  /slotanalyse/i,
];

function shouldUseDeepThinking(sectionTitle) {
  return DEEP_THINKING_SECTIONS.some((rx) => rx.test(sectionTitle));
}

// ─── CRITICAL ALERT BLOCK ─────────────────────────────────────────────────────
// Prepended to every user prompt so the AI cannot miss the key chart facts.
// This is the primary defence against the model hallucinating wrong type /
// authority / channels when handling multiple concurrent sections.
function buildCriticalAlert(chart, isEN) {
  const lines = [];
  if (chart.type)    lines.push(`  ${isEN ? "Type" : "Type"}: ${chart.type}`);
  if (chart.auth)    lines.push(`  ${isEN ? "Authority" : "Autoriteit"}: ${chart.auth}`);
  if (chart.profile) lines.push(`  ${isEN ? "Profile" : "Profiel"}: ${chart.profile}`);

  if (chart.channels && chart.channels.length) {
    const channelStr = chart.channels.map(function(c) { return `${c.g1}-${c.g2} (${c.c1}↔${c.c2})`; }).join(", ");
    lines.push(`  ${isEN ? "Active channels (ONLY these exist)" : "Actieve kanalen (ALLEEN deze bestaan)"}: ${channelStr}`);
  } else {
    lines.push(`  ${isEN ? "Active channels: NONE" : "Actieve kanalen: GEEN"}`);
  }

  if (!lines.length) return "";

  if (isEN) {
    return `⚠️ CRITICAL CHART CHECK — READ THIS FIRST, VERIFY BEFORE FINISHING:
${lines.join("\n")}
If your output mentions any type, authority, or channel NOT listed above → it is FACTUALLY WRONG. Delete and rewrite those sentences.

`;
  } else {
    return `⚠️ KRITIEKE CHARTCONTROLE — LEES DIT EERST, CONTROLEER VOOR JE KLAAR BENT:
${lines.join("\n")}
Als jouw tekst een type, autoriteit of kanaal noemt dat HIERBOVEN NIET STAAT → het is FEITELIJK ONJUIST. Verwijder die zinnen en herschrijf.

`;
  }
}

// ─── GENERATE SECTION (with canon, interdep, and retry) ───────────────────────
async function generateSectionText(sectionTitle, order, previousSections, attempt = 0, lastIssues = []) {
  const { customer_name, birth_data, language } = order;
  const lang = language || "nl";
  const chart = (birth_data || {}).chart || {};
  const chartCtx = buildChartContext(order);

  // ── Canon injection ──────────────────────────────────────────────────────
  const canon = getCanonContext(sectionTitle, chart);
  const canonBlock = canon
    ? `\n\nCANON REFERENTIE (ground truth — gebruik deze namen en thema's exact, verzin geen alternatieven):\n${canon}`
    : "";

  // ── Previous sections (avoid repetition) ─────────────────────────────────
  const prevSummary = previousSectionsSummary(previousSections);
  const prevBlock = prevSummary
    ? (lang === "en"
        ? `\n\nPREVIOUSLY WRITTEN SECTIONS (do NOT repeat — only briefly refer back if needed):\n${prevSummary}`
        : `\n\nEERDER GESCHREVEN SECTIES (niet herhalen, alleen kort terugverwijzen waar nodig):\n${prevSummary}`)
    : "";

  // ── Retry context ────────────────────────────────────────────────────────
  const retryBlock = (attempt > 0 && lastIssues.length)
    ? (lang === "en"
        ? `\n\nREWRITE — previous version failed on:\n${lastIssues.map((i) => `- ${i}`).join("\n")}\nFix all these points in this version.`
        : `\n\nHERSCHRIJVEN — vorige versie miste op:\n${lastIssues.map((i) => `- ${i}`).join("\n")}\nFix deze punten in deze versie.`)
    : "";

  const criticalAlert = buildCriticalAlert(chart, lang === "en");

  const prompt = lang === "en"
    ? `${criticalAlert}${chartCtx}${canonBlock}${prevBlock}${retryBlock}

Write section "${sectionTitle}" for ${customer_name}.

RULES (strict):
- Output only the JSON object — no prose before or after, no markdown code fences
- kern blocks must follow the emotional arc: recognition → human truth → HD insight → shadow → alignment
- teaser must be cinematic and emotionally resonant — not a theory summary
- Moon cycle always exactly "28 days"
- Incarnation Cross: use only the names from the canon reference above
- Anchor EVERY kern paragraph in concrete chart data from the chart context
- kern max 500 words total — quality over quantity, every sentence must earn its place
- Do NOT repeat any channel, center, or profile description already covered in a previous section — a brief reference is allowed`
    : `${criticalAlert}${chartCtx}${canonBlock}${prevBlock}${retryBlock}

Schrijf sectie "${sectionTitle}" voor ${customer_name}.

REGELS (strikt):
- Schrijf uitsluitend het JSON-object — geen tekst ervoor of erna, geen markdown-blokken
- kern-blokken volgen de emotionele boog: herkenning → menselijke waarheid → HD-inzicht → schaduw → alignment
- teaser moet cinematisch en emotioneel resonant zijn — geen theorie-samenvatting
- Maancyclus altijd exact "28 dagen"
- Inkarnatie-Kruis: gebruik alleen de namen uit de canon-referentie hierboven
- Veranker ELKE kern-alinea in concrete chartdata uit de chart context
- kern max 500 woorden totaal — kwaliteit boven kwantiteit, elke zin moet zijn plek verdienen
- Herhaal GEEN kanaal-, centrum- of profiel-beschrijving die al in een eerdere sectie staat — een korte verwijzing is toegestaan`;

  const useDeepThinking = shouldUseDeepThinking(sectionTitle);
  const systemPrompt = getSystemPrompt(lang);
  const raw = await callClaude(systemPrompt, prompt, { thinking: useDeepThinking });

  if (raw.length < 100) {
    throw new Error(`Section response too short (${raw.length} chars)`);
  }

  // Extract JSON — the model sometimes wraps it in ```json ... ```
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Section response contained no JSON object (${raw.length} chars)`);
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Section JSON parse failed: ${e.message}`);
  }

  // Validate required fields
  if (!Array.isArray(parsed.inJouwChart) || !Array.isArray(parsed.kern)) {
    throw new Error("Section JSON missing required fields (inJouwChart, kern)");
  }

  return parsed;
}

// ─── GENERATE WITH QUALITY GATE ───────────────────────────────────────────────
/**
 * Generate a section + score it + retry up to MAX_RETRIES times if below threshold.
 * Returns the best JSON section object found (highest score), or null on total failure.
 */
async function generateScoredSection(sectionTitle, order, previousSections) {
  const chart = (order.birth_data || {}).chart || {};
  const lang  = order.language || "nl";
  let bestSection = null;
  let bestScore   = -1;
  let lastIssues  = [];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let section;
    try {
      section = await generateSectionText(sectionTitle, order, previousSections, attempt, lastIssues);
    } catch (e) {
      console.warn(`[gen] "${sectionTitle}" attempt ${attempt} failed: ${e.message}`);
      continue;
    }

    const result = await scoreSection(section, sectionTitle, chart, lang);
    console.log(`[QA] "${sectionTitle}" attempt ${attempt}: score ${result.total}/40 (${result.passed ? "PASS" : "FAIL"})`);

    if (result.total > bestScore) {
      bestSection = section;
      bestScore   = result.total;
      lastIssues  = result.issues;
    }

    if (result.passed) return bestSection;
  }

  console.warn(`[QA] "${sectionTitle}" used best-of-${MAX_RETRIES + 1} (score ${bestScore}/40)`);
  return bestSection;
}

// ─── INNGEST FUNCTION ─────────────────────────────────────────────────────────
export const orderDelivery = inngest.createFunction(
  {
    id: "order-delivery",
    name: "Order Delivery Workflow",
    retries: 3,
    // Allow up to 36h total execution (Inngest handles the sleep externally)
  },
  { event: "order/paid" },

  async ({ event, step }) => {
    const { orderId } = event.data;

    // ── Step 1: Load order & send confirmation email ───────────────────────
    const order = await step.run("load-order-confirm", async () => {
      const db = getSupabase();
      const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Idempotency guard: only process if status is still "paid"
      // Prevents duplicate emails when the same event is retried or resent
      if (data.status !== "paid") {
        console.log(`[order-delivery] Skipping ${orderId} — already in status "${data.status}"`);
        return null;
      }

      // Send confirmation email immediately
      await sendConfirmationEmail({
        to: data.customer_email,
        name: data.customer_name || "klant",
        reportTitle: data.report_title,
        language: data.language || "nl",
      });

      // Mark as processing
      await db
        .from("orders")
        .update({ status: "processing" })
        .eq("id", orderId);

      return data;
    });

    // Exit early if order was already processed (idempotency)
    if (!order) return { skipped: true };

    // ── Step 2: Sleep until delivery time ─────────────────────────────────
    const deliveryDate = calculateDeliveryDate(order.paid_at || order.created_at);
    await step.sleepUntil("labour-illusion-delay", deliveryDate);

    // ── Step 2.5: Recompute chart server-side (accurate astronomy) ────────
    // The browser-side chart in birth_data.chart is used as a fallback if
    // server-side calculation fails. Only HD reports get recomputed here.
    //
    // SINGLE SOURCE OF TRUTH: after a successful recompute, the authoritative
    // chart is persisted back to the DB so test-PDF re-renders, customer
    // downloads, and admin previews all use the exact same chartFacts that
    // drove LLM generation — preventing cover/narrative mismatches.
    const enrichedOrder = await step.run("recompute-chart", async () => {
      const bd = order.birth_data || {};
      const isHDReport = !/horoscoop|numerologie/i.test(order.report_title || "");
      if (!isHDReport || !bd.day) return order;

      try {
        const serverChart = calcHDServer({
          day:    parseInt(bd.day),
          month:  parseInt(bd.month),
          year:   parseInt(bd.year),
          hour:   bd.hour != null ? parseInt(bd.hour) : 12,
          minute: bd.minute != null ? parseInt(bd.minute) : 0,
          tz:     bd.tz != null ? parseFloat(bd.tz) : 1, // default Amsterdam
        });

        const newBirthData = {
          ...bd,
          chart: serverChart,
          // Preserve browser-computed chart for audit / accuracy comparison
          _browser_chart: bd.chart,
        };

        // ← CRITICAL: persist authoritative chart so all future renders use
        // the same chartFacts that will drive LLM generation below.
        const db = getSupabase();
        const { error: updateErr } = await db
          .from("orders")
          .update({ birth_data: newBirthData })
          .eq("id", orderId);
        if (updateErr) {
          console.warn(`[recompute-chart] Could not persist chart to DB: ${updateErr.message}`);
        }

        return { ...order, birth_data: newBirthData };
      } catch (e) {
        console.warn(`[recompute-chart] Failed for ${orderId}, using browser chart: ${e.message}`);
        return order;
      }
    });

    // ── Steps 3…N: Generate each section via Claude ────────────────────────
    // Each section is generated WITH:
    //   1. Canon ground-truth injection (centers/channels/gates/types/profiles)
    //   2. Summary of previously written sections (avoids repetition)
    //   3. Quality scoring + up to 2 retries if score < threshold
    //   4. Extended thinking for the key analytical sections
    const sections = [];
    const sectionTitles = enrichedOrder.prompt_sections || [];

    for (let i = 0; i < sectionTitles.length; i++) {
      const title = sectionTitles[i];
      // Snapshot previous sections to pass as interdependence context
      const previous = sections.map((s) => ({ title: s.title, ...s }));
      const sectionData = await step.run(`generate-section-${i}`, async () => {
        return generateScoredSection(title, enrichedOrder, previous);
      });
      sections.push({ title, ...(sectionData || {}) });
    }

    // ── Step N+1: Render PDF ───────────────────────────────────────────────
    const pdfBytes = await step.run("render-pdf", async () => {
      const buffer = await generatePDF({ order: enrichedOrder, sections });
      // Convert Buffer to base64 string for serialisation through Inngest state
      return Buffer.from(buffer).toString("base64");
    });

    // ── Step N+2: Upload PDF to Vercel Blob ───────────────────────────────
    const blobUrl = await step.run("upload-to-blob", async () => {
      const pdfBuffer = Buffer.from(pdfBytes, "base64");
      const filename = `reports/${orderId}.pdf`;

      const { url } = await put(filename, pdfBuffer, {
        access: "public",
        contentType: "application/pdf",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return url;
    });

    // ── Step N+3: Generate token & update order ───────────────────────────
    const downloadToken = await step.run("create-download-token", async () => {
      const token = randomUUID();
      const db = getSupabase();

      const { error } = await db
        .from("orders")
        .update({
          status: "delivered",
          pdf_blob_url: blobUrl,
          download_token: token,
          delivered_at: new Date().toISOString(),
          generated_sections: sections,  // store for admin preview / re-render
        })
        .eq("id", orderId);

      if (error) throw new Error(`DB update failed: ${error.message}`);
      return token;
    });

    // ── Step N+4: Send delivery email ─────────────────────────────────────
    await step.run("send-delivery-email", async () => {
      const downloadUrl = `https://www.facultyhd.com/download/${downloadToken}`;
      await sendDeliveryEmail({
        to: order.customer_email,
        name: order.customer_name || "klant",
        reportTitle: order.report_title,
        downloadUrl,
        language: order.language || "nl",
      });
    });

    return { orderId, downloadToken, deliveredAt: new Date().toISOString() };
  }
);
