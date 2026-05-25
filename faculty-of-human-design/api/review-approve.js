// ─── ADMIN REVIEW APPROVE / REJECT ───────────────────────────────────────────
// GET /api/review-approve?token=<reviewToken>&action=approve|reject
//
// Called when admin clicks the Approve or Reject button in the review email.
// - approve: fires "app/order.approved" Inngest event so the delivery workflow
//            resumes immediately (download token is created + email sent).
// - reject:  sets order status to "needs_revision" so it shows up in the
//            backlog. The Inngest workflow will auto-approve after 72h if no
//            approval arrives, but the admin can re-trigger manually.

import { createClient } from "@supabase/supabase-js";
import { inngest } from "../lib/inngest/client.js";

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
  const { token, action } = req.query;

  // ── Validate input ─────────────────────────────────────────────────────
  if (!token || !["approve", "reject"].includes(action)) {
    return res
      .status(400)
      .send(page("Ongeldige aanvraag", "De link is onvolledig of onjuist.", "#C62828"));
  }

  // ── Look up order by review_token ──────────────────────────────────────
  const db = getSupabase();
  const { data: order, error } = await db
    .from("orders")
    .select("id, status, customer_name, report_title, review_token")
    .eq("review_token", token)
    .single();

  if (error || !order) {
    return res
      .status(404)
      .send(page("Token niet gevonden", "Deze link bestaat niet of is verlopen.", "#C62828"));
  }

  // ── Idempotency: already processed ────────────────────────────────────
  if (order.status !== "review_pending") {
    const msg = order.status === "delivered"
      ? "Dit rapport is al bezorgd bij de klant."
      : `De order heeft status: <strong>${order.status}</strong> — geen actie nodig.`;
    return res
      .status(200)
      .send(page("Al verwerkt", msg, "#888"));
  }

  // ── Approve ─────────────────────────────────────────────────────────────
  if (action === "approve") {
    try {
      // Fire the Inngest event — the waiting workflow step will receive this
      // and resume immediately with download token creation + delivery email.
      await inngest.send({
        name: "app/order.approved",
        data: { orderId: order.id },
      });

      return res
        .status(200)
        .send(page(
          "Rapport goedgekeurd ✓",
          `Het rapport <strong>${escHtml(order.report_title)}</strong> voor <strong>${escHtml(order.customer_name)}</strong> is goedgekeurd.<br><br>
           De klant ontvangt de download-email binnen enkele minuten.`,
          "#2E7D32"
        ));
    } catch (e) {
      console.error("[review-approve] Inngest send error:", e.message);
      return res
        .status(500)
        .send(page("Fout", `Kon de goedkeuring niet verzenden: ${escHtml(e.message)}`, "#C62828"));
    }
  }

  // ── Reject → show feedback form ────────────────────────────────────────
  if (action === "reject") {
    const { error: updErr } = await db
      .from("orders")
      .update({ status: "needs_revision" })
      .eq("id", order.id);

    if (updErr) {
      return res
        .status(500)
        .send(page("Fout", `DB update mislukt: ${escHtml(updErr.message)}`, "#C62828"));
    }

    // Show a feedback form so admin can describe what needs fixing
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
      <form method="POST" action="/api/review-regenerate">
        <input type="hidden" name="token" value="${escHtml(token)}">
        <label style="display:block;font-size:12px;font-weight:600;letter-spacing:.5px;
                      text-transform:uppercase;color:#9A8050;margin-bottom:10px;">
          Wat moet anders?
        </label>
        <textarea name="feedback" required
          placeholder="Beschrijf zo concreet mogelijk wat Claude moet aanpassen. Bijv: &#10;— De Type-sectie is te algemeen, mist persoonlijke observaties&#10;— De autoriteit klopt niet: zegt Emotioneel maar moet Sacraal zijn&#10;— Toon te coachend, meer observationeel schrijven"
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

// ─── SIMPLE HTML PAGE ─────────────────────────────────────────────────────────
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
