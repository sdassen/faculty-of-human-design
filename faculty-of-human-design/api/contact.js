// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
// POST /api/contact
// body: { name, email, subject, msg }
// Sends the message to ADMIN_EMAIL via Resend and returns JSON.

import { Resend } from "resend";

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, subject, msg } = req.body || {};

  if (!name?.trim() || !email?.trim() || !msg?.trim()) {
    return res.status(400).json({ error: "Vul alle verplichte velden in." });
  }

  const to = process.env.ADMIN_EMAIL || "stevendassen@gmail.com";

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1715;">
      <div style="background:#1A1715;padding:24px 32px;">
        <div style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(201,168,92,.6);">
          FACULTY OF HUMAN DESIGN &nbsp;·&nbsp; CONTACT
        </div>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #E5E0D8;">
        <h2 style="font-family:Georgia,serif;font-weight:400;font-size:20px;margin:0 0 24px;">
          Nieuw contactbericht
        </h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #E5E0D8;font-size:12px;color:#9A8050;font-weight:600;width:120px;">NAAM</td><td style="padding:8px 0;border-bottom:1px solid #E5E0D8;font-size:14px;">${escHtml(name)}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #E5E0D8;font-size:12px;color:#9A8050;font-weight:600;">EMAIL</td><td style="padding:8px 0;border-bottom:1px solid #E5E0D8;font-size:14px;"><a href="mailto:${escHtml(email)}" style="color:#3D2C5E;">${escHtml(email)}</a></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #E5E0D8;font-size:12px;color:#9A8050;font-weight:600;">ONDERWERP</td><td style="padding:8px 0;border-bottom:1px solid #E5E0D8;font-size:14px;">${escHtml(subject || "—")}</td></tr>
        </table>
        <div style="font-size:12px;color:#9A8050;font-weight:600;margin-bottom:10px;">BERICHT</div>
        <div style="font-size:14px;line-height:1.8;color:#3A3830;white-space:pre-wrap;background:#F7F5F0;padding:16px;border-radius:6px;">${escHtml(msg)}</div>
        <div style="margin-top:24px;">
          <a href="mailto:${escHtml(email)}?subject=Re: ${escHtml(subject || "Jouw bericht")}"
             style="display:inline-block;background:#3D2C5E;color:#fff;padding:12px 28px;border-radius:100px;font-size:13px;text-decoration:none;">
            Beantwoorden →
          </a>
        </div>
      </div>
    </div>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Faculty of Human Design <noreply@facultyhd.com>",
      to,
      replyTo: email,
      subject: `[Contact] ${subject || "Bericht van " + name}`,
      html,
    });

    if (error) throw new Error(error.message);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[contact]", e.message);
    return res.status(500).json({ error: "Versturen mislukt. Probeer het opnieuw of mail direct naar info@facultyhd.com." });
  }
}
