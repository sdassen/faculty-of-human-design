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
const SYSTEM_PROMPT_NL = `Je bent een senior analist van de Faculty of Human Design op Ibiza. Je schrijft diepgaande, gepersonaliseerde rapporten in het Nederlands voor betalende klanten.

STEM & STIJL:
- Spreek de lezer altijd aan met "je" en "jouw" — nooit "u" of "uw", nooit wisselen binnen één rapport.
- Gebruik de voornaam van de klant maximaal één keer per sectie.
- Toon: rustig, premium, warm-spiritueel, precies en betrouwbaar. Geen zweverige clichés, geen overdreven superlatieven, geen sensatie.
- Begin elke sectie direct met relevantie voor de lezer — vermijd openers als "Het is belangrijk om...", "In de hedendaagse samenleving...", "Laat ons eerst...", "Het is van cruciaal belang...".
- Houd zinnen beknopt; liever meerdere korte alinea's dan lange blokken.
- GEEN Markdown-opmaak: geen sterretjes (**bold**, *italic*), geen hekjes (# Heading), geen underscores. Schrijf uitsluitend platte tekst en gebruik de structuurlabels hieronder als kopjes.

INHOUD:
- Veranker elke alinea in de concrete chartdata: noem type, strategie, autoriteit, profiel, gedefinieerde/open centra, kanalen en poorten waar relevant.
- Geen algemene psychologie of vage uitspraken zonder directe koppeling aan dit specifieke ontwerp.
- Vermijd biografische aannames ("je hebt vast...") — beschrijf alleen patronen als werk-hypotheses vanuit de chart.
- Noem de Strategie van het type slechts één keer uitgebreid (in de Type-sectie); verwijs daarna alleen terug.
- Maancyclus: gebruik altijd exact "28 dagen" (niet "28 of 29", niet "een maandcyclus").
- Inkarnatie-Kruis: noem het kruis alleen bij de naam die in de chartdata staat; verzin geen alternative namen.
- Herhaal geen volledige beschrijvingen van kanalen of centra die al in een eerdere sectie zijn behandeld — verwijs alleen terug.

TERMINOLOGIE:
- Gebruik consistente Nederlandse HD-termen. Engelse term maximaal één keer tussen haakjes bij introductie, daarna alleen Nederlands.
- Kies één label per centrum en houd dat vast (bijv. altijd "Sacraalcentrum", nooit afwisselend "Sacral"/"Sacraal").

STRUCTUUR — elke sectie volgt exact dit format. Gebruik precies deze labels als kopjes (geen Markdown, geen extra opmaak):

In jouw chart:
• [3–5 concrete feiten specifiek voor DEZE chart: getallen, poorten, centra, kanalen]

[Kernuitleg: 3–5 korte subparagrafen met subkopjes als platte tekst. Elke paragraaf verankerd in chartdata. Max ~600 woorden totaal — streef naar kwaliteit boven kwantiteit.]

Valkuilen:
• [concreet, operationeel — geen algemeenheden]
• [...]
• [...]

Praktijk:
• [concrete oefening of antidote, vandaag uitvoerbaar]
• [...]
• [...]

Deze week:
• [micro-actie — extreem concreet, tijdgebonden, max één zin]
• [...]
• [...]

Reflectievragen:
1. [Vraag]
2. [Vraag]
3. [Vraag]

AFSLUITING:
- Sluit de kernuitleg af met een volledige, afgeronde zin — geen afgekapte regels.
- De Slotanalyse synthethiseert de rode draad van het rapport; herhaal geen kanaalbeschrijvingen die al eerder staan.`;

const SYSTEM_PROMPT_EN = `You are a senior analyst at the Faculty of Human Design in Ibiza. You write in-depth, personalised reports in English for paying clients.

VOICE & STYLE:
- Always address the reader as "you" and "your" — consistent throughout the report.
- Use the client's first name at most once per section.
- Tone: calm, premium, warm-spiritual, precise and trustworthy. No vague spiritual clichés, no excessive superlatives, no sensationalism.
- Begin each section directly with relevance for the reader — avoid openers like "It is important to...", "In today's society...", "Let us first...", "It is of crucial importance...".
- Keep sentences concise; prefer multiple short paragraphs over long blocks.
- NO Markdown formatting: no asterisks (**bold**, *italic*), no hashes (# Heading), no underscores. Write plain text only and use the structure labels below as headings.

CONTENT:
- Anchor every paragraph in concrete chart data: mention type, strategy, authority, profile, defined/open centers, channels and gates where relevant.
- No general psychology or vague statements without direct connection to this specific design.
- Avoid biographical assumptions ("you must have...") — describe only patterns as working hypotheses from the chart.
- Mention the Strategy of the type only once in full (in the Type section); refer back only thereafter.
- Moon cycle: always use exactly "28 days" (not "28 or 29", not "a lunar cycle").
- Incarnation Cross: name the cross only by the name in the chart data; do not invent alternative names.
- Do not repeat full descriptions of channels or centers already covered in a previous section — only refer back.

TERMINOLOGY:
- Use consistent English HD terms throughout.
- Choose one label per center and maintain it (e.g. always "Sacral Center", never alternating).

STRUCTURE — every section follows exactly this format. Use precisely these labels as headings (no Markdown, no extra formatting):

In your chart:
• [3–5 concrete facts specific to THIS chart: numbers, gates, centers, channels]

[Core analysis: 3–5 short sub-paragraphs with sub-headings as plain text. Each paragraph anchored in chart data. Max ~600 words total — quality over quantity.]

Pitfalls:
• [concrete, operational — no generalities]
• [...]
• [...]

Practice:
• [concrete exercise or antidote, actionable today]
• [...]
• [...]

This week:
• [micro-action — extremely concrete, time-bound, max one sentence]
• [...]
• [...]

Reflection questions:
1. [Question]
2. [Question]
3. [Question]

CLOSING:
- End the core analysis with a complete, rounded sentence — no cut-off lines.
- The Closing Analysis synthesises the key thread of the report; do not repeat channel descriptions already covered earlier.`;

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
  const sectionSummaries = previousSections
    .map((s) => `[${s.title}]\n${(s.text || "").slice(0, 500).trim()}...`)
    .join("\n\n");

  // Extract all channel references to explicitly forbid repetition
  const allText = previousSections.map((s) => s.text || "").join(" ");
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
- No section title in the text — begin directly with "In your chart:"
- No Markdown: no **, no *, no #, no _
- Sub-headings in the core analysis are short lines (max 8 words, no period at end)
- Moon cycle always exactly "28 days"
- Incarnation Cross: use only the names from the canon reference above
- Anchor EVERY paragraph in concrete chart data from the chart context
- STRICT word limit: core analysis max 500 words. Quality over quantity. Every sentence must earn its place.
- Do NOT repeat any channel, center, or profile description already covered in a previous section — only a brief callback reference is allowed.

REQUIRED FORMAT — copy this structure exactly:

In your chart:
• [Concrete fact 1 — gate/channel/center + meaning]
• [Concrete fact 2 — specific to this chart]
• [Concrete fact 3 — max 5 bullets total]

[Short sub-heading for first core paragraph — no bullet, no colon]
[Paragraph text. Plain prose, NO "•" prefix. Anchored in chart data.]

[Short sub-heading for second core paragraph]
[Paragraph text. Max 500 words total across all core paragraphs.]

Pitfalls:
• [item 1]
• [item 2]
• [item 3]

Practice:
• [item 1]
• [item 2]
• [item 3]

This week:
• [item 1]
• [item 2]
• [item 3]

Reflection questions:
• [item 1]
• [item 2]
• [item 3]

CRITICAL: The "In your chart:" block ends after the bullets and a blank line. The core analysis that follows has NEVER a "•" bullet prefix. Sub-headings are plain lines with no prefix. End the core analysis with a complete sentence.`
    : `${criticalAlert}${chartCtx}${canonBlock}${prevBlock}${retryBlock}

Schrijf sectie "${sectionTitle}" voor ${customer_name}.

REGELS (strikt):
- Geen sectietitel in de tekst — begin direct met "In jouw chart:"
- Geen Markdown: geen **, geen *, geen #, geen _
- Subkopjes in de kernuitleg zijn korte regels (max 8 woorden, geen punt aan het einde)
- Maancyclus altijd exact "28 dagen"
- Inkarnatie-Kruis: gebruik alleen de namen uit de canon-referentie hierboven
- Veranker ELKE alinea in concrete chartdata uit de chart context
- STRIKTE woordgrens: kernuitleg max 500 woorden. Kwaliteit boven kwantiteit. Elke zin moet zijn plek verdienen.
- Herhaal GEEN kanaal-, centrum- of profiel-beschrijving die al in een eerdere sectie staat — alleen een korte terugverwijzing is toegestaan.

VERPLICHT FORMAT — kopieer deze structuur exact:

In jouw chart:
• [Concreet feit 1 — poort/kanaal/centrum + betekenis]
• [Concreet feit 2 — specifiek voor DEZE chart]
• [Concreet feit 3 — max 5 bullets totaal]

[Kort subkopje eerste kernparagraaf — geen bullet, geen dubbele punt]
[Alineatekst. Gewone lopende tekst, NOOIT "•" bullet-prefix. Verankerd in chartdata.]

[Kort subkopje tweede kernparagraaf]
[Alineatekst. Max 500 woorden totaal voor alle kernparagrafen samen.]

Valkuilen:
• [item 1]
• [item 2]
• [item 3]

Praktijk:
• [item 1]
• [item 2]
• [item 3]

Deze week:
• [item 1]
• [item 2]
• [item 3]

Reflectievragen:
• [item 1]
• [item 2]
• [item 3]

CRUCIAAL: De "In jouw chart:" sectie eindigt na de bullets en een witregel. De kernuitleg die DAARNA komt heeft NOOIT een "•" bullet-prefix. Subkopjes zijn gewone regels zonder prefix. Sluit de kernuitleg af met een volledige, afgeronde zin.`;

  const useDeepThinking = shouldUseDeepThinking(sectionTitle);
  const systemPrompt = getSystemPrompt(lang);
  const text = await callClaude(systemPrompt, prompt, { thinking: useDeepThinking });

  if (text.length < 200) {
    throw new Error(`Section text too short (${text.length} chars)`);
  }
  return text;
}

// ─── GENERATE WITH QUALITY GATE ───────────────────────────────────────────────
/**
 * Generate a section + score it + retry up to MAX_RETRIES times if below threshold.
 * Returns the best version found (highest score), even if all attempts failed.
 */
async function generateScoredSection(sectionTitle, order, previousSections) {
  const chart = (order.birth_data || {}).chart || {};
  const lang  = order.language || "nl";
  let bestText = "";
  let bestScore = -1;
  let lastIssues = [];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let text;
    try {
      text = await generateSectionText(sectionTitle, order, previousSections, attempt, lastIssues);
    } catch (e) {
      console.warn(`[gen] "${sectionTitle}" attempt ${attempt} failed: ${e.message}`);
      continue;
    }

    const result = await scoreSection(text, sectionTitle, chart, lang);
    console.log(`[QA] "${sectionTitle}" attempt ${attempt}: score ${result.total}/40 (${result.passed ? "PASS" : "FAIL"})`);

    if (result.total > bestScore) {
      bestText = text;
      bestScore = result.total;
      lastIssues = result.issues;
    }

    if (result.passed) return bestText;
  }

  console.warn(`[QA] "${sectionTitle}" used best-of-${MAX_RETRIES + 1} (score ${bestScore}/40)`);
  return bestText;
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
      const previous = sections.map((s) => ({ title: s.title, text: s.text }));
      const text = await step.run(`generate-section-${i}`, async () => {
        return generateScoredSection(title, enrichedOrder, previous);
      });
      sections.push({ title, text });
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
