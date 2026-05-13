import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Faculty of Human Design <noreply@facultyhd.com>";

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export async function sendConfirmationEmail({ to, name, reportTitle }) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Je betaling is ontvangen — we zijn gestart met jouw analyse`,
    html: confirmationHtml({ name, reportTitle }),
  });
  if (error) throw new Error(`Resend fout (bevestiging): ${error.message}`);
  return data;
}

export async function sendDeliveryEmail({ to, name, reportTitle, downloadUrl }) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Jouw ${reportTitle} staat klaar`,
    html: deliveryHtml({ name, reportTitle, downloadUrl }),
  });
  if (error) throw new Error(`Resend fout (levering): ${error.message}`);
  return data;
}

// ─── BASE LAYOUT ──────────────────────────────────────────────────────────────
function base(body) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Faculty of Human Design</title>
</head>
<body style="margin:0;padding:24px 0;background:#F2EFE9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);">

    <!-- Header -->
    <div style="background:#1A1715;padding:40px 40px 0;text-align:center;">
      <div style="font-size:8.5px;letter-spacing:5px;text-transform:uppercase;color:rgba(201,168,92,.5);margin-bottom:10px;font-weight:500;">
        FACULTY OF HUMAN DESIGN &nbsp;·&nbsp; IBIZA
      </div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:2.5px;color:rgba(255,255,255,.2);text-transform:uppercase;margin-bottom:32px;">
        Est. 2014
      </div>
      <!-- Gold rule -->
      <div style="height:2px;background:linear-gradient(90deg,transparent,#C9A85C 30%,#C9A85C 70%,transparent);margin:0 -40px;"></div>
    </div>

    <!-- Body -->
    <div style="padding:40px 40px 36px;">
      ${body}
    </div>

    <!-- Footer -->
    <div style="background:#F7F5F0;padding:22px 40px;text-align:center;border-top:1px solid #E8E3DB;">
      <p style="margin:0 0 5px;font-size:10.5px;color:#A8A39E;letter-spacing:.4px;">
        © 2026 Faculty of Human Design — Ibiza, Spanje
      </p>
      <p style="margin:0;font-size:10.5px;color:#B8B3AE;">
        <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>
        &nbsp;·&nbsp;
        <a href="https://www.facultyhd.com" style="color:#9A8050;text-decoration:none;">facultyhd.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─── CONFIRMATION TEMPLATE ────────────────────────────────────────────────────
function confirmationHtml({ name, reportTitle }) {
  const isHD = /human design/i.test(reportTitle);

  return base(`
    <!-- Title -->
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;color:#1A1715;margin:0 0 22px;line-height:1.3;letter-spacing:-.3px;">
      Gefeliciteerd met deze stap.
    </h1>

    <!-- Greeting -->
    <p style="font-size:15px;color:#3A3830;line-height:1.85;margin:0 0 16px;font-weight:300;">
      Beste ${escHtml(name)},
    </p>
    <p style="font-size:15px;color:#4A4840;line-height:1.85;margin:0 0 24px;font-weight:300;">
      Je betaling is succesvol ontvangen en we zijn direct begonnen met het samenstellen van jouw
      <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong>.
    </p>

    <!-- Why it takes time -->
    <p style="font-size:14.5px;color:#5A5850;line-height:1.85;margin:0 0 28px;font-weight:300;">
      Jouw rapport wordt volledig op maat samengesteld op basis van jouw exacte geboortegegevens — van
      ${isHD
        ? "de berekening van type, centra en kanalen tot aan je inkarnatie-kruis"
        : "de numerieke berekeningen tot aan jouw persoonlijke jaarcyclus"
      }. We nemen die tijd bewust.
    </p>

    <!-- Delivery callout -->
    <div style="background:#FAFAF7;border:1px solid #E5E0D8;border-left:3px solid #C9A85C;border-radius:0 6px 6px 0;padding:20px 24px;margin:0 0 32px;">
      <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#9A8050;margin-bottom:10px;font-weight:600;">Wat je kunt verwachten</div>
      ${bulletItem("Levertijd", "Jouw rapport is <strong>binnen 1 werkdag</strong> in je inbox — je ontvangt een aparte e-mail zodra het klaar staat.")}
      ${bulletItem("Inhoud", `Een diepgaand, gepersonaliseerd rapport van <strong>40+ pagina's</strong> als downloadbare PDF.`)}
      ${bulletItem("Alvast doen", "Zorg voor een rustig moment morgen. Dit rapport bevat veel informatie die het beste binnenkomt als je er aandacht voor hebt.")}
    </div>

    <!-- Divider -->
    <div style="height:1px;background:#EEEBE5;margin:0 0 28px;"></div>

    <!-- Spam tip -->
    <p style="font-size:13px;color:#888;line-height:1.75;margin:0 0 10px;">
      <strong style="color:#555;font-weight:500;">Geen mail ontvangen na 24 uur?</strong>
      Controleer dan je spam-map. Staat hij daar ook niet, stuur dan een reply op deze e-mail — we kijken direct met je mee.
    </p>
    <p style="font-size:13px;color:#AAA;line-height:1.75;margin:0;">
      Vragen? Schrijf ons via <a href="mailto:info@facultyhd.com" style="color:#3D2C5E;text-decoration:none;">info@facultyhd.com</a>.
    </p>
  `);
}

// ─── DELIVERY TEMPLATE ────────────────────────────────────────────────────────
function deliveryHtml({ name, reportTitle, downloadUrl }) {
  const isHD      = /human design/i.test(reportTitle);
  const isKind    = /kind/i.test(reportTitle);
  const isRelatie = /relatie|samenwerking/i.test(reportTitle);

  // Context-aware reading tip
  let startTip;
  if (isKind) {
    startTip = "Begin bij <strong>Type & Strategie</strong> — dit geeft direct praktische handvatten voor begeleiding en opvoeding.";
  } else if (isRelatie) {
    startTip = "Begin bij de <strong>elektromagnetische kanalen</strong> — daar zit de kern van de dynamiek tussen jullie twee designs.";
  } else if (isHD) {
    startTip = "Begin bij <strong>Type, Strategie en Autoriteit</strong> — dit zijn de fundamenten waarmee je direct kunt gaan experimenteren.";
  } else {
    startTip = "Begin bij het begin van het rapport en lees het door zonder te willen begrijpen. Laat het even landen.";
  }

  return base(`
    <!-- Title -->
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;color:#1A1715;margin:0 0 22px;line-height:1.3;letter-spacing:-.3px;">
      Jouw blauwdruk is klaar.
    </h1>

    <!-- Greeting -->
    <p style="font-size:15px;color:#3A3830;line-height:1.85;margin:0 0 16px;font-weight:300;">
      Beste ${escHtml(name)},
    </p>
    <p style="font-size:15px;color:#4A4840;line-height:1.85;margin:0 0 28px;font-weight:300;">
      De analyse van jouw unieke design is voltooid. De datapunten uit je chart zijn vertaald naar een persoonlijke blauwdruk — jouw
      <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong>
      staat voor je klaar.
    </p>

    <!-- CTA button -->
    <div style="text-align:center;margin:0 0 14px;">
      <a href="${escHtml(downloadUrl)}"
         style="display:inline-block;background:#3D2C5E;color:#ffffff;text-decoration:none;
                padding:17px 52px;border-radius:100px;font-size:14.5px;font-weight:500;
                letter-spacing:.4px;line-height:1;box-shadow:0 4px 14px rgba(61,44,94,.3);">
        Download jouw blauwdruk (PDF) &rarr;
      </a>
    </div>

    <!-- Fallback URL -->
    <p style="font-size:11.5px;color:#B0AAA4;text-align:center;margin:0 0 36px;line-height:1.6;">
      Werkt de knop niet? Kopieer deze link in je browser:<br>
      <a href="${escHtml(downloadUrl)}" style="color:#9A8050;text-decoration:none;word-break:break-all;">${escHtml(downloadUrl)}</a>
    </p>

    <!-- Reading tips -->
    <div style="background:#FAFAF7;border:1px solid #E5E0D8;border-radius:6px;padding:22px 26px;margin:0 0 28px;">
      <div style="font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#9A8050;margin-bottom:14px;font-weight:600;">Tips voor het lezen</div>
      ${bulletItem("Waar te beginnen", startTip)}
      ${bulletItem("Neem de tijd", "Het is veel informatie. Je hoeft niet alles in één keer te begrijpen — het rapport is een naslagwerk dat zijn waarde vergroot naarmate je er meer mee leeft.")}
      ${bulletItem("Experimenteer", `${isHD ? "Human Design" : "Dit systeem"} is geen set regels maar een experiment. Kijk wat er gebeurt als je beslissingen gaat nemen vanuit wat het rapport beschrijft.`)}
      ${bulletItem("Bewaar het bestand", "Sla de PDF op in je archief — dan kun je er altijd op terugvallen, ook zonder de downloadlink.")}
    </div>

    <!-- Link validity -->
    <p style="font-size:12px;color:#B0AAA4;line-height:1.75;margin:0 0 10px;">
      De downloadlink is <strong style="color:#888;">30 dagen geldig</strong>. Sla het bestand daarna lokaal op zodat je het altijd bij de hand hebt.
    </p>
    <p style="font-size:12px;color:#B0AAA4;line-height:1.75;margin:0;">
      Vragen of opmerkingen? We horen graag van je via
      <a href="mailto:info@facultyhd.com" style="color:#3D2C5E;text-decoration:none;">info@facultyhd.com</a>.
    </p>
  `);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function bulletItem(label, text) {
  return `
    <div style="display:flex;gap:12px;margin-bottom:13px;align-items:flex-start;">
      <div style="flex-shrink:0;width:5px;height:5px;border-radius:50%;background:#C9A85C;margin-top:7px;"></div>
      <p style="margin:0;font-size:13.5px;color:#4A4840;line-height:1.75;font-weight:300;">
        <strong style="color:#1A1715;font-weight:500;">${label}:</strong>
        ${text}
      </p>
    </div>`;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
