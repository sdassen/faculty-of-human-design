import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { inngest } from "./client.js";
import { generatePDF } from "../pdf/index.js";
import { sendConfirmationEmail, sendDeliveryEmail } from "../email/index.js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
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
const SYSTEM_PROMPT = `Je bent een senior analist van de Faculty of Human Design op Ibiza. Je schrijft diepgaande, gepersonaliseerde rapporten in het Nederlands voor betalende klanten.

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

async function generateSectionText(sectionTitle, order) {
  const { birth_data, report_title, customer_name } = order;
  const bd = birth_data || {};
  const chart = bd.chart || {};

  // ── Chart context ────────────────────────────────────────────────────────
  const lines = [
    `Rapport: ${report_title}`,
    `Klant: ${customer_name}`,
  ];
  if (bd.day)           lines.push(`Geboortedatum: ${bd.day}-${bd.month}-${bd.year}`);
  if (bd.hour != null)  lines.push(`Geboortetijd: ${bd.hour}:${String(bd.minute || 0).padStart(2, "0")}`);
  if (bd.place)         lines.push(`Geboorteplaats: ${bd.place}`);

  if (chart.type)    lines.push(`HD Type: ${chart.type}`);
  if (chart.strat)   lines.push(`Strategie: ${chart.strat}`);
  if (chart.auth)    lines.push(`Autoriteit: ${chart.auth}`);
  if (chart.profile) lines.push(`Profiel: ${chart.profile}`);
  if (chart.sig)     lines.push(`Signatuur (Signature): ${chart.sig}`);
  if (chart.notSelf) lines.push(`Not-Self thema: ${chart.notSelf}`);
  if (chart.cross)   lines.push(`Inkarnatie-Kruis: Poort ${chart.cross}`);

  if (chart.definedCenters?.length)
    lines.push(`Gedefinieerde centra: ${chart.definedCenters.join(", ")}`);
  if (chart.openCenters?.length)
    lines.push(`Open centra: ${chart.openCenters.join(", ")}`);
  if (chart.channels?.length)
    lines.push(`Actieve kanalen: ${chart.channels.map((c) => `${c.g1}-${c.g2} (${c.c1}↔${c.c2})`).join(", ")}`);
  if (chart.allGates?.length)
    lines.push(`Alle actieve poorten: ${chart.allGates.join(", ")}`);

  if (chart.lp)       lines.push(`Levenspadgetal: ${chart.lp}`);
  if (chart.exp)      lines.push(`Uitdrukkingsgetal: ${chart.exp}`);
  if (chart.sun_sign) lines.push(`Zonneteken: ${chart.sun_sign}`);

  if (order.partner_birth_data) {
    const p = order.partner_birth_data;
    const pc = p.chart || {};
    lines.push(`\nPartner/tweede persoon: ${p.name || "Partner"}, geboren ${p.day}-${p.month}-${p.year}`);
    if (pc.type)    lines.push(`Partner HD Type: ${pc.type}`);
    if (pc.auth)    lines.push(`Partner Autoriteit: ${pc.auth}`);
    if (pc.profile) lines.push(`Partner Profiel: ${pc.profile}`);
    if (pc.definedCenters?.length) lines.push(`Partner gedefinieerde centra: ${pc.definedCenters.join(", ")}`);
  }

  const context = lines.join("\n");

  const prompt = `${context}

Schrijf sectie "${sectionTitle}" voor ${customer_name}.

REGELS:
- Geen sectietitel in de tekst — begin direct met "In jouw chart:"
- Geen Markdown: geen **, geen *, geen #, geen _
- Schrijf platte tekst; subkopjes in de kernuitleg zijn gewone korte regels (max 8 woorden, geen punt aan het einde)
- Maancyclus altijd "28 dagen" (niet "28 of 29")
- Inkarnatie-Kruis: gebruik alleen de naam uit de chartdata hierboven

Gebruik exact het voorgeschreven format:
1. "In jouw chart:" met 3–5 concrete bullets (• Bullet) met data uit DEZE chart.
2. Kernuitleg: 3–5 subparagrafen met subkopjes als platte tekst, max ~600 woorden, verankerd in chartdata.
3. De vier slotblokken: "Valkuilen:" / "Praktijk:" / "Deze week:" / "Reflectievragen:" — elk exact 3 items.

Sluit de kernuitleg af met een volledige, afgeronde zin.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.content?.find((b) => b.type === "text")?.text || "";
  if (text.length < 100) {
    throw new Error(`Section text too short (${text.length} chars)`);
  }
  return text;
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

      // Send confirmation email immediately
      await sendConfirmationEmail({
        to: data.customer_email,
        name: data.customer_name || "klant",
        reportTitle: data.report_title,
      });

      // Mark as processing
      await db
        .from("orders")
        .update({ status: "processing" })
        .eq("id", orderId);

      return data;
    });

    // ── Step 2: Sleep until delivery time ─────────────────────────────────
    const deliveryDate = calculateDeliveryDate(order.paid_at || order.created_at);
    await step.sleepUntil("labour-illusion-delay", deliveryDate);

    // ── Steps 3…N: Generate each section via Claude ────────────────────────
    const sections = [];
    const sectionTitles = order.prompt_sections || [];

    for (let i = 0; i < sectionTitles.length; i++) {
      const title = sectionTitles[i];
      const text = await step.run(`generate-section-${i}`, async () => {
        return generateSectionText(title, order);
      });
      sections.push({ title, text });
    }

    // ── Step N+1: Render PDF ───────────────────────────────────────────────
    const pdfBytes = await step.run("render-pdf", async () => {
      const buffer = await generatePDF({ order, sections });
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
      });
    });

    return { orderId, downloadToken, deliveredAt: new Date().toISOString() };
  }
);
