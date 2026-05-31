// ─── ADMIN REVIEW — APPROVE / REJECT / REGENERATE + CONTACT FORM ─────────────
// GET  /api/review-approve?token=<reviewToken>&action=approve|reject
// POST /api/review-approve  body: token=<reviewToken>&feedback=<text>
// POST /api/review-approve  body: contact=1&name=&email=&subject=&msg=
//
// Flows:
// - approve:    fires "app/order.approved" → delivery workflow resumes
// - reject:     sets status "needs_revision", shows feedback form
// - POST feedback: stores feedback, fires "app/order.revision_requested"
// - POST contact: sends contact form email via Resend

import { createClient } from "@supabase/supabase-js";
import { inngest } from "../lib/inngest/client.js";
import { Resend } from "resend";

// ── Contact form rate limiting (5 submissions / IP / 60 s) ───────────────────
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const _rateBuckets = new Map(); // ip → { count, resetAt }

function isRateLimited(ip) {
  const now = Date.now();
  let bucket = _rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS };
    _rateBuckets.set(ip, bucket);
  }
  bucket.count++;
  return bucket.count > RATE_MAX;
}

class _NoopWS {
  constructor() { this.readyState = 3; }
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

export default async function handler(req, res) {

  // ── POST: contact form ───────────────────────────────────────────────────
  if (req.method === "POST" && req.body?.contact) {
    // Honeypot — bots fill hidden fields, humans don't
    if (req.body.website) {
      // Silently accept so bots think it worked
      return res.status(200).json({ ok: true });
    }

    // Rate limiting
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
    if (isRateLimited(ip)) {
      console.warn("[contact] Rate limit hit for IP:", ip);
      return res.status(429).json({ error: "Te veel berichten. Probeer het over een minuut opnieuw." });
    }

    const { name, email, subject, msg } = req.body;
    if (!name?.trim() || !email?.trim() || !msg?.trim()) {
      return res.status(400).json({ error: "Vul alle verplichte velden in." });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Vul een geldig e-mailadres in." });
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error: sendError } = await resend.emails.send({
        from: "Faculty of Human Design <noreply@facultyhd.com>",
        to: process.env.ADMIN_EMAIL || "stevendassen@gmail.com",
        reply_to: email,
        subject: `Contact: ${subject || "Bericht van " + name}`,
        html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;color:#1A1715;">
          <div style="background:#1A1715;padding:20px 32px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(201,168,92,.6);">FACULTY OF HUMAN DESIGN &nbsp;·&nbsp; CONTACT</div>
          <div style="padding:32px;background:#fff;border:1px solid #E5E0D8;">
            <p><strong>Naam:</strong> ${escHtml(name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escHtml(email)}">${escHtml(email)}</a></p>
            <p><strong>Onderwerp:</strong> ${escHtml(subject || "—")}</p>
            <hr style="border:none;border-top:1px solid #E5E0D8;margin:16px 0;"/>
            <div style="white-space:pre-wrap;line-height:1.8;">${escHtml(msg)}</div>
            <div style="margin-top:24px;"><a href="mailto:${escHtml(email)}?subject=Re: ${escHtml(subject || "Jouw bericht")}" style="background:#3D2C5E;color:#fff;padding:12px 28px;border-radius:100px;font-size:13px;text-decoration:none;">Beantwoorden →</a></div>
          </div>
        </div>`,
      });
      if (sendError) {
        console.error("[contact] Resend error:", sendError);
        return res.status(500).json({ error: sendError.message || "Versturen mislukt." });
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("[contact] Exception:", e.message);
      return res.status(500).json({ error: e.message || "Versturen mislukt. Probeer het opnieuw of mail direct naar info@facultyhd.com." });
    }
  }

  // ── POST: feedback form submission (regenerate) ──────────────────────────
  if (req.method === "POST") {
    const { token, feedback } = req.body || {};

    if (!token || !feedback?.trim()) {
      return res.status(400).send(page(
        "Ontbrekende gegevens",
        "Vul eerst het feedbackveld in voordat je verstuurt.",
        "#C62828"
      ));
    }

    const db = getSupabase();
    const { data: order, error } = await db
      .from("orders")
      .select("id, status, customer_name, report_title")
      .eq("review_token", token)
      .single();

    if (error || !order) {
      return res.status(404).send(page(
        "Token niet gevonden",
        "Deze link bestaat niet of is verlopen.",
        "#C62828"
      ));
    }

    if (!["needs_revision", "review_pending"].includes(order.status)) {
      return res.status(200).send(page(
        "Al verwerkt",
        `De order heeft status <strong>${escHtml(order.status)}</strong> — geen revisie meer mogelijk.`,
        "#888"
      ));
    }

    const { error: updErr } = await db
      .from("orders")
      .update({ status: "regenerating", revision_notes: feedback.trim() })
      .eq("id", order.id);

    if (updErr) {
      return res.status(500).send(page("Fout", `DB update mislukt: ${escHtml(updErr.message)}`, "#C62828"));
    }

    try {
      await inngest.send({
        name: "app/order.revision_requested",
        data: { orderId: order.id, feedback: feedback.trim() },
      });
    } catch (e) {
      console.error("[review] Inngest send error:", e.message);
      return res.status(500).send(page("Fout", `Kon regeneratie niet starten: ${escHtml(e.message)}`, "#C62828"));
    }

    return res.status(200).send(page(
      "Regeneratie gestart ✓",
      `Het rapport <strong>${escHtml(order.report_title)}</strong> voor <strong>${escHtml(order.customer_name)}</strong>
       wordt opnieuw gegenereerd met jouw feedback.<br><br>
       Je ontvangt een nieuwe review-email zodra de herziene versie klaar is (5–15 minuten).`,
      "#2E7D32"
    ));
  }

  // ── GET: approve or reject ────────────────────────────────────────────────
  const { token, action } = req.query;

  if (!token || !["approve", "reject"].includes(action)) {
    return res.status(400).send(page("Ongeldige aanvraag", "De link is onvolledig of onjuist.", "#C62828"));
  }

  const db = getSupabase();
  const { data: order, error } = await db
    .from("orders")
    .select("id, status, customer_name, report_title, review_token")
    .eq("review_token", token)
    .single();

  if (error || !order) {
    return res.status(404).send(page("Token niet gevonden", "Deze link bestaat niet of is verlopen.", "#C62828"));
  }

  // needs_revision: allow approve (skip revision) or show feedback form again
  if (order.status === "needs_revision") {
    if (action === "approve") {
      // Admin approves without revision — resume delivery workflow
      try {
        await inngest.send({ name: "app/order.approved", data: { orderId: order.id } });
        return res.status(200).send(page(
          "Rapport goedgekeurd ✓",
          `Het rapport <strong>${escHtml(order.report_title)}</strong> voor <strong>${escHtml(order.customer_name)}</strong>
           is goedgekeurd.<br><br>De klant ontvangt de download-email binnen enkele minuten.`,
          "#2E7D32"
        ));
      } catch (e) {
        return res.status(500).send(page("Fout", `Kon goedkeuring niet verzenden: ${escHtml(e.message)}`, "#C62828"));
      }
    }
    if (action === "reject") {
      // Show feedback form again
      return res.status(200).send(feedbackForm({
        token,
        customerName: order.customer_name,
        reportTitle:  order.report_title,
      }));
    }
  }

  if (order.status !== "review_pending") {
    const msg = order.status === "delivered"
      ? "Dit rapport is al bezorgd bij de klant."
      : `De order heeft status: <strong>${order.status}</strong> — geen actie nodig.`;
    return res.status(200).send(page("Al verwerkt", msg, "#888"));
  }

  // ── Approve ────────────────────────────────────────────────────────────────
  if (action === "approve") {
    try {
      await inngest.send({ name: "app/order.approved", data: { orderId: order.id } });
      return res.status(200).send(page(
        "Rapport goedgekeurd ✓",
        `Het rapport <strong>${escHtml(order.report_title)}</strong> voor <strong>${escHtml(order.customer_name)}</strong>
         is goedgekeurd.<br><br>De klant ontvangt de download-email binnen enkele minuten.`,
        "#2E7D32"
      ));
    } catch (e) {
      console.error("[review] Inngest send error:", e.message);
      return res.status(500).send(page("Fout", `Kon goedkeuring niet verzenden: ${escHtml(e.message)}`, "#C62828"));
    }
  }

  // ── Reject → feedback form ─────────────────────────────────────────────────
  if (action === "reject") {
    const { error: updErr } = await db
      .from("orders")
      .update({ status: "needs_revision" })
      .eq("id", order.id);

    if (updErr) {
      return res.status(500).send(page("Fout", `DB update mislukt: ${escHtml(updErr.message)}`, "#C62828"));
    }

    return res.status(200).send(feedbackForm({
      token,
      customerName: order.customer_name,
      reportTitle:  order.report_title,
    }));
  }
}

// ─── FEEDBACK FORM ────────────────────────────────────────────────────────────
function feedbackForm({ token, customerName, reportTitle }) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Feedback — Faculty of Human Design</title>
</head>
<body style="margin:0;padding:48px 24px;background:#F2EFE9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:8px;
              box-shadow:0 2px 16px rgba(0,0,0,.08);overflow:hidden;">
    <div style="background:#1A1715;padding:28px 36px 0;">
      <div style="font-size:8px;letter-spacing:5px;text-transform:uppercase;
                  color:rgba(201,168,92,.5);margin-bottom:8px;font-weight:500;">
        FACULTY OF HUMAN DESIGN &nbsp;·&nbsp; IBIZA
      </div>
      <div style="height:2px;background:linear-gradient(90deg,transparent,#C9A85C 30%,#C9A85C 70%,transparent);
                  margin:24px -36px 0;"></div>
    </div>
    <div style="padding:36px;">
      <div style="width:48px;height:4px;background:#C62828;border-radius:2px;margin-bottom:20px;"></div>
      <h1 style="font-family:Georgia,serif;font-size:21px;font-weight:400;color:#1A1715;
                 margin:0 0 8px;line-height:1.3;">Feedback voor revisie</h1>
      <p style="font-size:13.5px;color:#888;margin:0 0 24px;line-height:1.6;">
        Rapport: <strong style="color:#2A2820;">${escHtml(reportTitle)}</strong>
        &nbsp;·&nbsp; Klant: <strong style="color:#2A2820;">${escHtml(customerName)}</strong>
      </p>
      <form method="POST" action="/api/review-approve">
        <input type="hidden" name="token" value="${escHtml(token)}">
        <label style="display:block;font-size:12px;font-weight:600;letter-spacing:.5px;
                      text-transform:uppercase;color:#9A8050;margin-bottom:10px;">
          Wat moet anders?
        </label>
        <textarea name="feedback" required
          placeholder="Beschrijf zo concreet mogelijk wat Claude moet aanpassen. Bijv:&#10;— De Type-sectie is te algemeen, mist persoonlijke observaties&#10;— De autoriteit klopt niet: zegt Emotioneel maar moet Sacraal zijn&#10;— Toon te coachend, meer observationeel schrijven"
          style="width:100%;box-sizing:border-box;height:200px;padding:14px 16px;
                 font-size:14px;color:#2A2820;border:1.5px solid #DDD8CE;border-radius:6px;
                 font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.7;
                 resize:vertical;outline:none;background:#FAFAF7;"></textarea>
        <p style="font-size:11.5px;color:#B0AAA4;margin:10px 0 24px;line-height:1.6;">
          Claude regenereert het volledige rapport met jouw feedback als instructie.
          Je ontvangt daarna een nieuwe review-email.
        </p>
        <button type="submit"
          style="display:block;width:100%;background:#3D2C5E;color:#fff;border:none;
                 padding:16px;border-radius:100px;font-size:14.5px;font-weight:500;
                 letter-spacing:.3px;cursor:pointer;box-shadow:0 4px 12px rgba(61,44,94,.25);">
          Regenereer rapport →
        </button>
      </form>
    </div>
  </div>
</body>
</html>`;
}

// ─── SIMPLE PAGE ──────────────────────────────────────────────────────────────
function page(title, body, accentColor) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escHtml(title)} — Faculty of Human Design</title>
</head>
<body style="margin:0;padding:48px 24px;background:#F2EFE9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;
              box-shadow:0 2px 16px rgba(0,0,0,.08);overflow:hidden;">
    <div style="background:#1A1715;padding:28px 36px 0;">
      <div style="font-size:8px;letter-spacing:5px;text-transform:uppercase;
                  color:rgba(201,168,92,.5);margin-bottom:8px;font-weight:500;">
        FACULTY OF HUMAN DESIGN &nbsp;·&nbsp; IBIZA
      </div>
      <div style="height:2px;background:linear-gradient(90deg,transparent,#C9A85C 30%,#C9A85C 70%,transparent);
                  margin:24px -36px 0;"></div>
    </div>
    <div style="padding:36px;">
      <div style="width:48px;height:4px;background:${escHtml(accentColor)};border-radius:2px;margin-bottom:20px;"></div>
      <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1A1715;
                 margin:0 0 16px;line-height:1.3;">${escHtml(title)}</h1>
      <p style="font-size:14.5px;color:#4A4840;line-height:1.8;margin:0 0 28px;">${body}</p>
      <a href="https://www.facultyhd.com" style="font-size:12.5px;color:#9A8050;text-decoration:none;">
        ← Terug naar facultyhd.com
      </a>
    </div>
  </div>
</body>
</html>`;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
