// ─── REVIEW REGENERATE ────────────────────────────────────────────────────────
// POST /api/review-regenerate  (form submission from feedback form)
// Body: token=<reviewToken>&feedback=<text>
//
// Validates the review token, stores the feedback in DB, then fires
// "app/order.revision_requested" so the orderRevision Inngest function picks
// it up and regenerates the report with the editor's notes.

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
  if (req.method !== "POST") return res.status(405).end();

  const { token, feedback } = req.body || {};

  if (!token || !feedback?.trim()) {
    return res.status(400).send(simplePage(
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
    return res.status(404).send(simplePage(
      "Token niet gevonden",
      "Deze link bestaat niet of is verlopen.",
      "#C62828"
    ));
  }

  // Allow re-submission if still needs_revision (idempotent)
  if (!["needs_revision", "review_pending"].includes(order.status)) {
    return res.status(200).send(simplePage(
      "Al verwerkt",
      `De order heeft status <strong>${escHtml(order.status)}</strong> — geen revisie meer mogelijk.`,
      "#888"
    ));
  }

  // Store feedback + mark as regenerating
  const { error: updErr } = await db
    .from("orders")
    .update({
      status: "regenerating",
      revision_notes: feedback.trim(),
    })
    .eq("id", order.id);

  if (updErr) {
    return res.status(500).send(simplePage(
      "Fout",
      `DB update mislukt: ${escHtml(updErr.message)}`,
      "#C62828"
    ));
  }

  // Fire Inngest event — orderRevision function handles the rest
  try {
    await inngest.send({
      name: "app/order.revision_requested",
      data: { orderId: order.id, feedback: feedback.trim() },
    });
  } catch (e) {
    console.error("[review-regenerate] Inngest send error:", e.message);
    return res.status(500).send(simplePage(
      "Fout",
      `Kon de regeneratie niet starten: ${escHtml(e.message)}`,
      "#C62828"
    ));
  }

  return res.status(200).send(simplePage(
    "Regeneratie gestart ✓",
    `Het rapport <strong>${escHtml(order.report_title)}</strong> voor <strong>${escHtml(order.customer_name)}</strong> wordt opnieuw gegenereerd met jouw feedback.<br><br>
     Je ontvangt een nieuwe review-email zodra de herziene versie klaar is.
     Dat duurt normaal gesproken 5–15 minuten.`,
    "#2E7D32"
  ));
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function simplePage(title, body, accentColor) {
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
