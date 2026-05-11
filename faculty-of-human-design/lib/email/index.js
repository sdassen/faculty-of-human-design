import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// TODO: verander naar noreply@facultyhd.com zodra domein geverifieerd is in Resend
const FROM = "Faculty of Human Design <onboarding@resend.dev>";

// ─── CONFIRMATION EMAIL ───────────────────────────────────────────────────────
// Sent immediately after payment — no download link yet
export async function sendConfirmationEmail({ to, name, reportTitle }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Bevestiging: ${reportTitle} — Faculty of Human Design`,
    html: confirmationHtml({ name, reportTitle }),
  });
}

// ─── DELIVERY EMAIL ───────────────────────────────────────────────────────────
// Sent ~20h later with the download link
export async function sendDeliveryEmail({ to, name, reportTitle, downloadUrl }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Je ${reportTitle} is klaar — Faculty of Human Design`,
    html: deliveryHtml({ name, reportTitle, downloadUrl }),
  });
}

// ─── TEMPLATES ────────────────────────────────────────────────────────────────
function base(body) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Faculty of Human Design</title>
</head>
<body style="margin:0;padding:0;background:#F7F5F0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:0 0 8px 8px;overflow:hidden;">
    <!-- Header -->
    <div style="background:#1A1715;padding:44px 40px 38px;text-align:center;">
      <div style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(201,168,92,.55);margin-bottom:10px;">FACULTY OF HUMAN DESIGN · IBIZA</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:2px;color:rgba(255,255,255,.28);text-transform:uppercase;">Est. 2014</div>
    </div>
    <!-- Body -->
    <div style="padding:40px 40px 32px;">
      ${body}
    </div>
    <!-- Footer -->
    <div style="background:#F7F5F0;padding:20px 40px;text-align:center;border-top:1px solid #E5E0D8;">
      <p style="margin:0 0 4px;font-size:11px;color:#9A9490;letter-spacing:.5px;">© 2026 Faculty of Human Design — Ibiza, Spanje</p>
      <p style="margin:0;font-size:11px;color:#B8B3AE;">
        <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function confirmationHtml({ name, reportTitle }) {
  return base(`
    <p style="font-size:22px;font-family:Georgia,'Times New Roman',serif;font-weight:300;color:#1A1715;margin:0 0 24px;line-height:1.3;">
      Bestelling bevestigd
    </p>
    <p style="font-size:15px;font-weight:300;color:#3a3a32;line-height:1.8;margin:0 0 16px;">
      Beste ${escHtml(name)},
    </p>
    <p style="font-size:15px;font-weight:300;color:#555;line-height:1.8;margin:0 0 24px;">
      Bedankt voor je bestelling van het
      <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong>.
      Je betaling is ontvangen.
    </p>
    <div style="background:#F7F5F0;border-left:3px solid #C9A85C;padding:18px 22px;margin:24px 0 28px;border-radius:0 6px 6px 0;">
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9A8050;margin-bottom:8px;font-weight:600;">Levering</div>
      <p style="margin:0;font-size:14px;color:#1A1715;line-height:1.65;">
        Jouw persoonlijke blauwdruk wordt samengesteld en
        <strong>binnen 1 werkdag per e-mail bezorgd</strong> als downloadbare PDF.
      </p>
    </div>
    <p style="font-size:13px;color:#888;line-height:1.7;margin:0 0 8px;">
      Je hoeft niets te doen — wij houden je op de hoogte via dit e-mailadres.
    </p>
    <p style="font-size:13px;color:#888;line-height:1.7;margin:0;">
      Vragen? Stuur een bericht naar
      <a href="mailto:info@facultyhd.com" style="color:#3D2C5E;text-decoration:none;">info@facultyhd.com</a>.
    </p>
  `);
}

function deliveryHtml({ name, reportTitle, downloadUrl }) {
  return base(`
    <p style="font-size:22px;font-family:Georgia,'Times New Roman',serif;font-weight:300;color:#1A1715;margin:0 0 24px;line-height:1.3;">
      Je blauwdruk is klaar
    </p>
    <p style="font-size:15px;font-weight:300;color:#3a3a32;line-height:1.8;margin:0 0 16px;">
      Beste ${escHtml(name)},
    </p>
    <p style="font-size:15px;font-weight:300;color:#555;line-height:1.8;margin:0 0 28px;">
      Je <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong>
      is samengesteld en staat klaar.
    </p>
    <div style="text-align:center;margin:32px 0 36px;">
      <a href="${downloadUrl}"
         style="display:inline-block;background:#3D2C5E;color:#ffffff;text-decoration:none;
                padding:16px 44px;border-radius:100px;font-size:14px;font-weight:500;
                letter-spacing:.3px;line-height:1;">
        Download je rapport (PDF) →
      </a>
    </div>
    <div style="background:#F7F5F0;padding:16px 20px;border-radius:8px;margin:0 0 24px;">
      <p style="margin:0;font-size:12px;color:#888;line-height:1.65;">
        De downloadlink is <strong>30 dagen geldig</strong>. Sla het PDF-bestand op voor je archief
        — dan kun je het altijd terugvinden, ook zonder de link.
      </p>
    </div>
    <p style="font-size:13px;color:#888;line-height:1.7;margin:0;">
      Vragen of opmerkingen? We horen graag van je via
      <a href="mailto:info@facultyhd.com" style="color:#3D2C5E;text-decoration:none;">info@facultyhd.com</a>.
    </p>
  `);
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
