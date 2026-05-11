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
const SYSTEM_PROMPT =
  "Je bent een senior analist van de Faculty of Human Design op Ibiza. " +
  "Schrijf nauwkeurige, diepgaande rapporten in het Nederlands. " +
  "Schrijf vanuit het instituut. " +
  "Geen bulletpoints, geen headers in de tekst — alleen alinea's. " +
  "Minimaal 900 woorden per sectie.";

async function generateSectionText(sectionTitle, order) {
  const { birth_data, report_title, customer_name, report_id } = order;
  const bd = birth_data || {};

  // Build context paragraph
  let context = `Rapport: ${report_title}\nKlant: ${customer_name}\n`;
  if (bd.day) {
    context += `Geboortedatum: ${bd.day}-${bd.month}-${bd.year}\n`;
  }
  if (bd.hour !== undefined) {
    context += `Geboortetijd: ${bd.hour}:${String(bd.minute || 0).padStart(2, "0")}\n`;
  }
  if (bd.place) context += `Geboorteplaats: ${bd.place}\n`;

  // Add chart data to context
  const chart = bd.chart || {};
  if (chart.type)     context += `HD Type: ${chart.type}\n`;
  if (chart.strat)    context += `Strategie: ${chart.strat}\n`;
  if (chart.auth)     context += `Autoriteit: ${chart.auth}\n`;
  if (chart.profile)  context += `Profiel: ${chart.profile}\n`;
  if (chart.sig)      context += `Signatuur: ${chart.sig}\n`;
  if (chart.notSelf)  context += `Not-Self: ${chart.notSelf}\n`;
  if (chart.cross)    context += `Inkarnatie-Kruis: Poort ${chart.cross}\n`;
  if (chart.definedCenters?.length) {
    context += `Gedefinieerde centra: ${chart.definedCenters.join(", ")}\n`;
  }
  if (chart.channels?.length) {
    context += `Actieve kanalen: ${chart.channels.map((c) => `${c.g1}-${c.g2}`).join(", ")}\n`;
  }
  if (chart.lp)        context += `Levenspad: ${chart.lp}\n`;
  if (chart.exp)       context += `Uitdrukking: ${chart.exp}\n`;
  if (chart.sun_sign)  context += `Zonneteken: ${chart.sun_sign}\n`;

  // Add partner data if present
  if (order.partner_birth_data) {
    const p = order.partner_birth_data;
    context += `\nPartner: ${p.name || "Partner"}, geboren ${p.day}-${p.month}-${p.year}`;
    if (p.chart?.type) context += `, HD Type: ${p.chart.type}`;
    context += "\n";
  }

  const prompt =
    context +
    `\nSchrijf uitsluitend sectie '${sectionTitle}' van het rapport voor ${customer_name}. ` +
    "Minimaal 900 woorden, in alinea's, persoonlijk en concreet. Geen sectietitel in de tekst.";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1800,
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
        access: "private",           // Private: not publicly accessible
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
      const downloadUrl = `https://www.facultyofhumandesign.com/download/${downloadToken}`;
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
