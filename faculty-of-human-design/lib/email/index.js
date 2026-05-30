import { Resend } from "resend";

// Lazy — Resend constructor throws if RESEND_API_KEY is missing, which would
// crash the module on cold start and break every /api/inngest request.
let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "Faculty of Human Design <noreply@facultyhd.com>";

// ─── REPORT CATEGORY ─────────────────────────────────────────────────────────
// Returns "kind" | "relatie" | "self" based on report_id.
function reportCategory(reportId) {
  const id = (reportId || "").toLowerCase();
  if (id === "kind") return "kind";
  if (id.startsWith("relatie_")) return "relatie";
  return "self";
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export async function sendAdminReviewEmail({ order, pdfUrl, reviewToken, orderId, violations = [] }) {
  const approveUrl = `https://www.facultyhd.com/api/review-approve?token=${encodeURIComponent(reviewToken)}&action=approve`;
  const rejectUrl  = `https://www.facultyhd.com/api/review-approve?token=${encodeURIComponent(reviewToken)}&action=reject`;

  const violationSuffix = violations.length ? ` ⚠️ ${violations.length} patroon(en)` : "";
  const subject = `[Review vereist] ${order.report_title} — ${order.customer_name}${violationSuffix}`;

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL || "stevendassen@gmail.com",
    subject,
    html: adminReviewHtml({ order, pdfUrl, approveUrl, rejectUrl, orderId, violations }),
  });
  if (error) throw new Error(`Resend error (admin review): ${error.message}`);
  return data;
}

export async function sendConfirmationEmail({ to, name, reportTitle, reportId, partnerName, language }) {
  const lang = language === "en" ? "en" : "nl";
  const cat  = reportCategory(reportId);

  let subject;
  if (lang === "en") {
    subject = cat === "kind"
      ? `Your payment has been received — we've started the analysis`
      : `Your payment has been received — we've started your analysis`;
  } else {
    subject = cat === "kind"
      ? `Je betaling is ontvangen — we zijn gestart met de analyse`
      : `Je betaling is ontvangen — we zijn gestart met jouw analyse`;
  }

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: confirmationHtml({ name, reportTitle, reportId, partnerName, lang }),
  });
  if (error) throw new Error(`Resend error (confirmation): ${error.message}`);
  return data;
}

export async function sendDeliveryEmail({ to, name, reportTitle, reportId, partnerName, downloadUrl, language }) {
  const lang = language === "en" ? "en" : "nl";
  const cat  = reportCategory(reportId);

  let subject;
  if (lang === "en") {
    subject = cat === "kind"
      ? `The ${reportTitle} for ${partnerName || "your child"} is ready`
      : `Your ${reportTitle} is ready`;
  } else {
    subject = cat === "kind"
      ? `Het ${reportTitle} voor ${partnerName || "je kind"} staat klaar`
      : `Jouw ${reportTitle} staat klaar`;
  }

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: deliveryHtml({ name, reportTitle, reportId, partnerName, downloadUrl, lang }),
  });
  if (error) throw new Error(`Resend error (delivery): ${error.message}`);
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
  <div style="max-width:560px;margin:0 auto;background:#ffffff;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,.09);">

    <!-- Header -->
    <div style="background:#1A1715;padding:36px 44px 0;text-align:center;">
      <div style="font-size:7.5px;letter-spacing:5.5px;text-transform:uppercase;color:rgba(201,168,92,.45);margin-bottom:8px;font-weight:500;">
        FACULTY OF HUMAN DESIGN &nbsp;·&nbsp; IBIZA
      </div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:10px;letter-spacing:2.5px;color:rgba(255,255,255,.15);text-transform:uppercase;margin-bottom:28px;">
        Est. 2014
      </div>
      <!-- Gold rule -->
      <div style="height:1px;background:linear-gradient(90deg,transparent,#C9A85C 25%,#C9A85C 75%,transparent);margin:0 -44px;"></div>
    </div>

    <!-- Body -->
    <div style="padding:40px 44px 36px;">
      ${body}
    </div>

    <!-- Footer -->
    <div style="background:#F7F5F0;padding:20px 44px;text-align:center;border-top:1px solid #E8E3DB;">
      <p style="margin:0 0 5px;font-size:10px;color:#A8A39E;letter-spacing:.3px;">
        © 2026 Faculty of Human Design &nbsp;·&nbsp; Ibiza, Spanje
      </p>
      <p style="margin:0;font-size:10px;color:#B8B3AE;">
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
function confirmationHtml({ name, reportTitle, reportId, partnerName, lang }) {
  const cat   = reportCategory(reportId);
  const isEN  = lang === "en";
  const child = partnerName || (isEN ? "your child" : "je kind");

  // ── Headline ──────────────────────────────────────────────────────────────
  let headline, greeting2, reasonLine;

  if (isEN) {
    if (cat === "kind") {
      headline    = "A beautiful step for your child.";
      greeting2   = `Your payment has been received and we immediately began the analysis of <strong style="color:#1A1715;font-weight:500;">${escHtml(child)}</strong>'s unique design.`;
      reasonLine  = `${escHtml(child)}'s report is fully assembled from their exact birth data — from the calculation of type, centres and channels to the incarnation cross. We take that time deliberately.`;
    } else if (cat === "relatie") {
      headline    = "The analysis of your connection has started.";
      greeting2   = `Your payment has been received and we immediately began assembling your <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong>.`;
      reasonLine  = `This report is fully built from both birth charts — mapping the electromagnetic connections, defined channels and the dynamic between two designs. We take that time deliberately.`;
    } else {
      headline    = "Congratulations on this step.";
      greeting2   = `Your payment has been received and we immediately began assembling your <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong>.`;
      reasonLine  = `Your report is fully custom-assembled from your exact birth data — from the calculation of type, centres and channels to your incarnation cross. We take that time deliberately.`;
    }
  } else {
    if (cat === "kind") {
      headline    = "Een mooie stap voor je kind.";
      greeting2   = `Je betaling is succesvol ontvangen en we zijn direct begonnen met de analyse van het unieke design van <strong style="color:#1A1715;font-weight:500;">${escHtml(child)}</strong>.`;
      reasonLine  = `Het rapport van ${escHtml(child)} wordt volledig op maat samengesteld op basis van de exacte geboortegegevens — van de berekening van type, centra en kanalen tot aan het inkarnatie-kruis. We nemen die tijd bewust.`;
    } else if (cat === "relatie") {
      headline    = "De analyse van jullie verbinding is gestart.";
      greeting2   = `Je betaling is succesvol ontvangen en we zijn direct begonnen met het samenstellen van jouw <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong>.`;
      reasonLine  = `Dit rapport wordt volledig opgebouwd vanuit beide geboortekaarten — de elektromagnetische verbindingen, gedefinieerde kanalen en de dynamiek tussen twee ontwerpen. We nemen die tijd bewust.`;
    } else {
      headline    = "Gefeliciteerd met deze stap.";
      greeting2   = `Je betaling is succesvol ontvangen en we zijn direct begonnen met het samenstellen van jouw <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong>.`;
      reasonLine  = `Jouw rapport wordt volledig op maat samengesteld op basis van jouw exacte geboortegegevens — van de berekening van type, centra en kanalen tot aan je inkarnatie-kruis. We nemen die tijd bewust.`;
    }
  }

  // ── Delivery callout ──────────────────────────────────────────────────────
  let deliveryBlock;
  if (isEN) {
    deliveryBlock = `
    <div style="background:#FAFAF7;border:1px solid #E5E0D8;border-left:3px solid #C9A85C;padding:18px 22px;margin:0 0 30px;">
      <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#9A8050;margin-bottom:12px;font-weight:600;">${isEN ? "What to expect" : "Wat je kunt verwachten"}</div>
      ${bulletItem("Delivery", "Your report will be <strong>in your inbox within 1 business day</strong> — you'll receive a separate email as soon as it's ready.")}
      ${bulletItem("Contents", "An in-depth, personalised report of <strong>40+ pages</strong> as a downloadable PDF.")}
      ${bulletItem("In the meantime", "Plan a quiet moment for tomorrow. This report is meant to be read slowly.")}
    </div>`;
  } else {
    deliveryBlock = `
    <div style="background:#FAFAF7;border:1px solid #E5E0D8;border-left:3px solid #C9A85C;padding:18px 22px;margin:0 0 30px;">
      <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#9A8050;margin-bottom:12px;font-weight:600;">Wat je kunt verwachten</div>
      ${bulletItem("Levertijd", "Jouw rapport is <strong>binnen 1 werkdag</strong> in je inbox — je ontvangt een aparte e-mail zodra het klaar staat.")}
      ${bulletItem("Inhoud", "Een diepgaand, gepersonaliseerd rapport van <strong>40+ pagina's</strong> als downloadbare PDF.")}
      ${bulletItem("Alvast doen", "Zorg voor een rustig moment morgen. Dit rapport is bedoeld om langzaam te lezen.")}
    </div>`;
  }

  return base(`
    <!-- Thin gold accent line -->
    <div style="height:0.75px;background:#C9A85C;opacity:.4;margin-bottom:32px;"></div>

    <!-- Headline -->
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:400;color:#1A1715;margin:0 0 20px;line-height:1.3;letter-spacing:-.3px;">
      ${headline}
    </h1>

    <p style="font-size:14.5px;color:#3A3830;line-height:1.85;margin:0 0 14px;font-weight:300;">
      ${isEN ? "Dear" : "Beste"} ${escHtml(name)},
    </p>
    <p style="font-size:14.5px;color:#4A4840;line-height:1.85;margin:0 0 20px;font-weight:300;">
      ${greeting2}
    </p>
    <p style="font-size:14px;color:#5A5850;line-height:1.85;margin:0 0 28px;font-weight:300;">
      ${reasonLine}
    </p>

    ${deliveryBlock}

    <!-- Divider -->
    <div style="height:1px;background:#EEEBE5;margin:0 0 22px;"></div>

    <p style="font-size:12.5px;color:#888;line-height:1.75;margin:0 0 8px;">
      <strong style="color:#555;font-weight:500;">${isEN ? "No email after 1 business day?" : "Geen mail ontvangen na 1 werkdag?"}</strong>
      ${isEN
        ? `Check your spam folder. Still nothing? Write to <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`
        : `Controleer je spam-map. Staat hij daar ook niet, schrijf dan naar <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`}
    </p>
  `);
}

// ─── DELIVERY TEMPLATE ────────────────────────────────────────────────────────
function deliveryHtml({ name, reportTitle, reportId, partnerName, downloadUrl, lang }) {
  const cat  = reportCategory(reportId);
  const isEN = lang === "en";
  const child = partnerName || (isEN ? "your child" : "je kind");

  // ── Headline & intro ──────────────────────────────────────────────────────
  let headline, intro;

  if (isEN) {
    if (cat === "kind") {
      headline = `${partnerName ? partnerName + "'s" : "Your child's"} reading is ready.`;
      intro    = `The analysis of ${escHtml(child)}'s unique design is complete. The data from their chart has been translated into a personal reading — the <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong> is ready for you.`;
    } else if (cat === "relatie") {
      headline = "The reading of your connection is ready.";
      intro    = `The analysis of both designs is complete. The connection points from both charts have been translated into a personal reading — your <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong> is ready.`;
    } else {
      headline = "Your reading is ready.";
      intro    = `The analysis of your unique design is complete. The data points from your chart have been translated into a personal reading — your <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong> is ready for you.`;
    }
  } else {
    if (cat === "kind") {
      headline = `De reading van ${partnerName ? escHtml(partnerName) : "je kind"} is klaar.`;
      intro    = `Het unieke design van ${escHtml(child)} is geanalyseerd. De datapunten uit ${partnerName ? "hun" : "het"} chart zijn vertaald naar een persoonlijke reading — de <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong> staat voor je klaar.`;
    } else if (cat === "relatie") {
      headline = "De reading van jullie verbinding is klaar.";
      intro    = `De analyse van jullie twee designs is voltooid. De verbindingspunten uit beide charts zijn vertaald naar een persoonlijke reading — jouw <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong> staat klaar.`;
    } else {
      headline = "Jouw reading is klaar.";
      intro    = `De analyse van jouw unieke design is voltooid. De datapunten uit je chart zijn vertaald naar een persoonlijke reading — jouw <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong> staat voor je klaar.`;
    }
  }

  // ── Reading tips (start tip is report-type aware) ─────────────────────────
  let startTip;
  if (isEN) {
    if (cat === "kind")    startTip = "Start with <strong>Type & Strategy</strong> — this gives you immediate, practical tools for guidance and understanding your child.";
    else if (cat === "relatie") startTip = "Start with the <strong>electromagnetic channels</strong> — these show the core dynamic between the two designs.";
    else                   startTip = "Start with <strong>Type, Strategy and Authority</strong> — these are the foundations you can begin experimenting with straight away.";
  } else {
    if (cat === "kind")    startTip = "Begin bij <strong>Type & Strategie</strong> — dit geeft direct praktische handvatten voor begeleiding en begrip van je kind.";
    else if (cat === "relatie") startTip = "Begin bij de <strong>elektromagnetische kanalen</strong> — daar zit de kern van de dynamiek tussen jullie twee designs.";
    else                   startTip = "Begin bij <strong>Type, Strategie en Autoriteit</strong> — dit zijn de fundamenten waarmee je direct kunt gaan experimenteren.";
  }

  const tipsTitle     = isEN ? "Tips for reading" : "Tips voor het lezen";
  const tipTime       = isEN
    ? (cat === "kind"
        ? "There is a lot of information about your child. You don't need to understand everything at once — let it settle first."
        : "There is a lot of information. You don't need to understand it all at once — the report grows in value the more you live with it.")
    : (cat === "kind"
        ? "Het is veel informatie over je kind. Je hoeft niet alles in één keer te begrijpen — laat het eerst even landen."
        : "Het is veel informatie. Je hoeft niet alles in één keer te begrijpen — het rapport vergroot zijn waarde naarmate je er meer mee leeft.");
  const tipExperiment = isEN
    ? "This is not a set of rules but a map. Notice what happens when you start applying what you read."
    : "Dit is geen set regels maar een kaart. Kijk wat er gebeurt als je gaat handelen vanuit wat je leest.";
  const tipSave       = isEN
    ? "Save the PDF to your archive — that way you can always return to it, even without the download link."
    : "Sla de PDF op in je archief — dan kun je er altijd op terugvallen, ook zonder de downloadlink.";

  const ctaLabel  = isEN ? "Download your reading (PDF) →" : "Download jouw reading (PDF) →";
  const fallback  = isEN ? "Button not working? Copy this link into your browser:" : "Werkt de knop niet? Kopieer deze link in je browser:";
  const validNote = isEN
    ? `The download link is <strong style="color:#6B6560;">valid for 30 days</strong>. Save the file locally afterwards so you always have it to hand.`
    : `De downloadlink is <strong style="color:#6B6560;">30 dagen geldig</strong>. Sla het bestand daarna lokaal op zodat je het altijd bij de hand hebt.`;
  const questNote = isEN
    ? `Questions or feedback? Write to us at <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`
    : `Vragen of opmerkingen? Schrijf ons via <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`;

  return base(`
    <!-- Thin gold accent line -->
    <div style="height:0.75px;background:#C9A85C;opacity:.4;margin-bottom:32px;"></div>

    <!-- Headline -->
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:400;color:#1A1715;margin:0 0 20px;line-height:1.3;letter-spacing:-.3px;">
      ${headline}
    </h1>

    <p style="font-size:14.5px;color:#3A3830;line-height:1.85;margin:0 0 14px;font-weight:300;">
      ${isEN ? "Dear" : "Beste"} ${escHtml(name)},
    </p>
    <p style="font-size:14.5px;color:#4A4840;line-height:1.85;margin:0 0 30px;font-weight:300;">
      ${intro}
    </p>

    <!-- CTA button -->
    <div style="text-align:center;margin:0 0 12px;">
      <a href="${escHtml(downloadUrl)}"
         style="display:inline-block;background:#1A1715;color:#C9A85C;text-decoration:none;
                padding:16px 52px;font-size:13.5px;font-weight:500;
                letter-spacing:1.5px;text-transform:uppercase;line-height:1;">
        ${ctaLabel}
      </a>
    </div>

    <!-- Fallback URL -->
    <p style="font-size:11px;color:#B0AAA4;text-align:center;margin:0 0 34px;line-height:1.6;">
      ${fallback}<br>
      <a href="${escHtml(downloadUrl)}" style="color:#9A8050;text-decoration:none;word-break:break-all;">${escHtml(downloadUrl)}</a>
    </p>

    <!-- Reading tips -->
    <div style="background:#FAFAF7;border:1px solid #E5E0D8;border-left:3px solid #C9A85C;padding:20px 24px;margin:0 0 26px;">
      <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#9A8050;margin-bottom:14px;font-weight:600;">${tipsTitle}</div>
      ${bulletItem(isEN ? "Where to start" : "Waar te beginnen", startTip)}
      ${bulletItem(isEN ? "Take your time"  : "Neem de tijd",    tipTime)}
      ${bulletItem(isEN ? "Experiment"      : "Experimenteer",   tipExperiment)}
      ${bulletItem(isEN ? "Save the file"   : "Bewaar het bestand", tipSave)}
    </div>

    <!-- Link validity & contact -->
    <p style="font-size:11.5px;color:#B0AAA4;line-height:1.75;margin:0 0 8px;">
      ${validNote}
    </p>
    <p style="font-size:11.5px;color:#B0AAA4;line-height:1.75;margin:0;">
      ${questNote}
    </p>
  `);
}

// ─── ADMIN REVIEW TEMPLATE ────────────────────────────────────────────────────
function adminReviewHtml({ order, pdfUrl, approveUrl, rejectUrl, orderId, violations = [] }) {
  const bd    = order.birth_data || {};
  const chart = bd.chart || {};
  const lang  = order.language === "en" ? "EN" : "NL";

  const birthLine = [bd.day, bd.month, bd.year].filter(Boolean).join("-");
  const timeLine  = bd.hour != null ? `${bd.hour}:${String(bd.minute || 0).padStart(2, "0")}` : "—";

  const rows = [
    ["Order ID",    escHtml(orderId || order.id)],
    ["Klant",       escHtml(order.customer_name || "—")],
    ["Email",       escHtml(order.customer_email || "—")],
    ["Rapport",     escHtml(order.report_title || "—")],
    ["Taal",        lang],
    ["Geboortedatum", birthLine || "—"],
    ["Geboortetijd",  timeLine],
    ["Geboorteplaats", escHtml(bd.place || "—")],
    ["HD Type",     escHtml(chart.type  || "—")],
    ["Autoriteit",  escHtml(chart.auth  || "—")],
    ["Profiel",     escHtml(chart.profile || "—")],
  ];

  const tableRows = rows.map(([k, v]) => `
    <tr>
      <td style="padding:6px 12px 6px 0;font-size:12.5px;color:#888;font-weight:500;white-space:nowrap;vertical-align:top;">${k}</td>
      <td style="padding:6px 0 6px 12px;font-size:12.5px;color:#2A2820;border-left:1px solid #E8E3DB;">${v}</td>
    </tr>`).join("");

  return base(`
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#1A1715;margin:0 0 6px;line-height:1.3;">
      Rapport klaar voor review
    </h1>
    <p style="font-size:13px;color:#888;margin:0 0 28px;">
      Controleer het rapport vóórdat het naar de klant gaat — keur het goed of stuur het ter revisie.
    </p>

    <!-- Order details -->
    <div style="background:#FAFAF7;border:1px solid #E5E0D8;padding:20px 24px;margin:0 0 28px;">
      <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#9A8050;margin-bottom:14px;font-weight:600;">Ordergegevens</div>
      <table style="border-collapse:collapse;width:100%;">
        ${tableRows}
      </table>
    </div>

    <!-- PDF preview link -->
    <div style="background:#F0EDE7;border:1px solid #DDD8CE;padding:16px 22px;margin:0 0 30px;">
      <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#9A8050;margin-bottom:10px;font-weight:600;">PDF-preview</div>
      <a href="${escHtml(pdfUrl)}" style="color:#1A1715;font-size:13.5px;text-decoration:none;word-break:break-all;">
        📄 &nbsp;Open PDF in browser →
      </a>
      <p style="margin:8px 0 0;font-size:11px;color:#A8A39E;">
        Direct de Vercel Blob-link — geen login vereist.
      </p>
    </div>

    ${violations.length ? `
    <!-- Forbidden pattern warnings -->
    <div style="background:#FFF8E1;border:1px solid #FFD54F;border-left:3px solid #E65100;padding:16px 20px;margin:0 0 22px;">
      <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#E65100;margin-bottom:10px;font-weight:700;">⚠️ Verboden patronen gevonden (${violations.length})</div>
      ${violations.map(v => `
      <div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #FFE082;">
        <div style="font-size:12px;font-weight:600;color:#BF360C;">${escHtml(v.sectionTitle)} — ${escHtml(v.patternLabel)}</div>
        <div style="font-size:11.5px;color:#5D4037;font-style:italic;margin-top:3px;line-height:1.6;">${escHtml(v.excerpt)}</div>
      </div>`).join("")}
      <div style="font-size:11px;color:#E65100;margin-top:4px;line-height:1.5;">Overweeg te verwerpen en revisie aan te vragen als deze patronen zichtbaar zijn in het rapport.</div>
    </div>` : ""}

    <!-- Action buttons -->
    <div style="text-align:center;margin:0 0 12px;">
      <a href="${escHtml(approveUrl)}"
         style="display:inline-block;background:#2E7D32;color:#ffffff;text-decoration:none;
                padding:15px 40px;border-radius:100px;font-size:14px;font-weight:500;
                letter-spacing:.3px;margin-right:12px;box-shadow:0 4px 12px rgba(46,125,50,.25);">
        ✓ &nbsp;Goedkeuren
      </a>
      <a href="${escHtml(rejectUrl)}"
         style="display:inline-block;background:#C62828;color:#ffffff;text-decoration:none;
                padding:15px 40px;border-radius:100px;font-size:14px;font-weight:500;
                letter-spacing:.3px;box-shadow:0 4px 12px rgba(198,40,40,.25);">
        ✗ &nbsp;Ter revisie
      </a>
    </div>
    <p style="font-size:11.5px;color:#B0AAA4;text-align:center;margin:0 0 32px;">
      Knoppen werken niet? Kopieer links uit de browser:<br>
      <span style="color:#9A8050;">Goedkeuren:</span> ${escHtml(approveUrl)}<br>
      <span style="color:#9A8050;">Revisie:</span> ${escHtml(rejectUrl)}
    </p>

    <div style="height:1px;background:#EEEBE5;margin:0 0 20px;"></div>
    <p style="font-size:11.5px;color:#C0BAB4;line-height:1.6;margin:0;">
      Als je niet reageert wordt het rapport na <strong>72 uur</strong> automatisch goedgekeurd en bezorgd.
    </p>
  `);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function bulletItem(label, text) {
  return `
    <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">
      <div style="flex-shrink:0;width:4px;height:4px;border-radius:50%;background:#C9A85C;margin-top:8px;"></div>
      <p style="margin:0;font-size:13px;color:#4A4840;line-height:1.75;font-weight:300;">
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
