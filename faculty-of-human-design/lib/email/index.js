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

export async function sendMiniUpsellEmail({ to, name, language, promoCode, hdType, strategy, authority, profile }) {
  const lang = language === "en" ? "en" : "nl";
  const isEN = lang === "en";

  const subject = isEN
    ? "You discovered your Type & Strategy — want the complete story?"
    : "Je hebt je Type en Strategie ontdekt — wil je het complete verhaal?";

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: miniUpsellHtml({ name, lang, promoCode, hdType, strategy, authority, profile }),
  });
  if (error) throw new Error(`Resend error (mini upsell): ${error.message}`);
  return data;
}

export async function sendOrderUpsellEmail({ to, name, language, reportId, reportTitle, personalCode, friendCode, hdType, strategy, authority }) {
  const lang = language === "en" ? "en" : "nl";
  const isEN = lang === "en";

  const subject = isEN
    ? `A small thank-you, and a code to share`
    : `Een kleine attentie, en een code om te delen`;

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: orderUpsellHtml({ name, lang, reportId, reportTitle, personalCode, friendCode, hdType, strategy, authority }),
  });
  if (error) throw new Error(`Resend error (order upsell): ${error.message}`);
  return data;
}

export async function sendPortalEmail({ to, portalUrl }) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: "Jouw abonnement beheren — Faculty of Human Design",
    html: base(`
      <div style="height:0.75px;background:#C9A85C;opacity:.4;margin-bottom:32px;"></div>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#1A1715;margin:0 0 20px;line-height:1.3;">
        Beheer je abonnement
      </h1>
      <p style="font-size:14.5px;color:#3A3830;line-height:1.85;margin:0 0 28px;font-weight:300;">
        Klik op de knop hieronder om je abonnement te beheren. Je kunt facturen bekijken, je betaalgegevens bijwerken of je abonnement opzeggen.
      </p>
      <div style="text-align:center;margin:0 0 16px;">
        <a href="${escHtml(portalUrl)}"
           style="display:inline-block;background:#1A1715;color:#C9A85C;text-decoration:none;
                  padding:16px 52px;font-size:13.5px;font-weight:500;
                  letter-spacing:1.5px;text-transform:uppercase;line-height:1;">
          Beheer abonnement →
        </a>
      </div>
      <p style="font-size:11px;color:#B0AAA4;text-align:center;margin:0 0 28px;line-height:1.6;">
        Knop werkt niet? Kopieer deze link in je browser:<br>
        <a href="${escHtml(portalUrl)}" style="color:#9A8050;text-decoration:none;word-break:break-all;">${escHtml(portalUrl)}</a>
      </p>
      <div style="height:1px;background:#EEEBE5;margin:0 0 20px;"></div>
      <p style="font-size:11.5px;color:#B0AAA4;line-height:1.75;margin:0;">
        Deze link is 24 uur geldig. Heb je vragen? Schrijf ons via
        <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.
      </p>
    `),
  });
  if (error) throw new Error(`Resend error (portal): ${error.message}`);
  return data;
}

export async function sendCancellationEmail({ to, name, language }) {
  const lang = language === "en" ? "en" : "nl";
  const isEN = lang === "en";

  const subject = isEN
    ? "Your subscription has been cancelled"
    : "Jouw abonnement is opgezegd";

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: cancellationHtml({ name, lang }),
  });
  if (error) throw new Error(`Resend error (cancellation): ${error.message}`);
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
      intro    = `Het unieke design van ${escHtml(child)} is geanalyseerd. De datapunten uit ${partnerName ? escHtml(partnerName) + "s" : "het"} chart zijn vertaald naar een persoonlijke reading — het <strong style="color:#1A1715;font-weight:500;">${escHtml(reportTitle)}</strong> staat voor je klaar.`;
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
  const isNumerologie = reportId === "numerologie";
  const isHoroscoop   = reportId === "horoscoop";
  if (isEN) {
    if (cat === "kind")         startTip = "Start with <strong>Type & Strategy</strong> — this gives you immediate, practical tools for guidance and understanding your child.";
    else if (cat === "relatie") startTip = "Start with the <strong>electromagnetic channels</strong> — these show the core dynamic between the two designs.";
    else if (isNumerologie)     startTip = "Start with your <strong>Life Path number</strong> — this is the foundational energy that runs through your entire journey.";
    else if (isHoroscoop)       startTip = "Start with your <strong>Sun sign and Ascendant</strong> — these form the foundation of your personal astrology.";
    else                        startTip = "Start with <strong>Type, Strategy and Authority</strong> — these are the foundations you can begin experimenting with straight away.";
  } else {
    if (cat === "kind")         startTip = "Begin bij <strong>Type & Strategie</strong> — dit geeft direct praktische handvatten voor begeleiding en begrip van je kind.";
    else if (cat === "relatie") startTip = "Begin bij de <strong>elektromagnetische kanalen</strong> — daar zit de kern van de dynamiek tussen jullie twee designs.";
    else if (isNumerologie)     startTip = "Begin bij je <strong>Levenspadgetal</strong> — dit is de fundamentele energie die door je hele levensreis loopt.";
    else if (isHoroscoop)       startTip = "Begin bij je <strong>Zonneteken en Ascendant</strong> — dit vormen het fundament van jouw persoonlijke astrologie.";
    else                        startTip = "Begin bij <strong>Type, Strategie en Autoriteit</strong> — dit zijn de fundamenten waarmee je direct kunt gaan experimenteren.";
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

// ─── MINI READING UPSELL TEMPLATE ─────────────────────────────────────────────
// strat and auth values come from the server-side calculator in Dutch.
// Translate to English when the order language is EN.
const STRAT_EN = {
  "Wacht om te reageren":                                    "Wait to respond",
  "Wacht om te reageren, informeer dan voor je handelt":     "Wait to respond, then inform before acting",
  "Informeer voor je handelt":                               "Inform before acting",
  "Wacht op de uitnodiging":                                 "Wait for the invitation",
  "Wacht een maancyclus van 28 dagen":                       "Wait a lunar cycle of 28 days",
};
const AUTH_EN = {
  "Emotioneel": "Emotional",
  "Sacraal":    "Sacral",
  "Splenisch":  "Splenic",
  "Ego":        "Ego",
  "G/Self":     "G/Self",
  "Mentaal":    "Mental",
  "Maancyclus": "Lunar Cycle",
};
const TYPE_NL = {
  "Generator":             "Generator",
  "Manifesting Generator": "Manifesterende Generator",
  "Projector":             "Projector",
  "Manifestor":            "Manifestor",
  "Reflector":             "Reflector",
};

function miniUpsellHtml({ name, lang, promoCode, hdType, strategy, authority, profile }) {
  const isEN = lang === "en";
  const checkoutUrl = isEN ? "https://www.facultyhd.com/en/rapport/volledig" : "https://www.facultyhd.com/rapport/volledig";

  // Localised chart labels (calculator always outputs Dutch; type names are English)
  const typeLabel     = hdType ? (isEN ? hdType : (TYPE_NL[hdType] || hdType)) : null;
  const stratLabel    = strategy  ? (isEN ? (STRAT_EN[strategy]  || strategy)  : strategy)  : null;
  const authLabel     = authority ? (isEN ? (AUTH_EN[authority]  || authority) : authority) : null;

  // Personalised headline + intro when chart data is available
  let headline, intro;
  if (typeLabel && stratLabel && authLabel) {
    if (isEN) {
      headline = `You are a ${escHtml(typeLabel)}.`;
      intro    = `Your Strategy: <em>${escHtml(stratLabel)}</em>. Your Authority: <em>${escHtml(authLabel)}</em>.<br><br>That is the foundation. But it is only the beginning of what your chart has to say about you.`;
    } else {
      headline = `Je bent een ${escHtml(typeLabel)}.`;
      intro    = `Je Strategie: <em>${escHtml(stratLabel)}</em>. Je Autoriteit: <em>${escHtml(authLabel)}</em>.<br><br>Dat is het fundament. Maar het is pas het begin van wat je chart over je te zeggen heeft.`;
    }
  } else {
    headline = isEN
      ? "You discovered your Type & Strategy."
      : "Je hebt je Type en Strategie ontdekt.";
    intro = isEN
      ? `That is the foundation. But it is only the beginning of what your chart has to say about you.`
      : `Dat is het fundament. Maar het is pas het begin van wat je chart over je te zeggen heeft.`;
  }
  const body2 = isEN
    ? `The <strong style="color:#1A1715;font-weight:500;">Full Blueprint</strong> adds your Profile, your defined and open centers, your active channels and gates, and your Incarnation Cross — the complete architecture of who you are, in 40+ pages.`
    : `De <strong style="color:#1A1715;font-weight:500;">Volledige Blauwdruk</strong> voegt je Profiel toe, je gedefinieerde en open centra, je actieve kanalen en poorten, en je Inkarnatie-Kruis — de complete architectuur van wie je bent, in 40+ pagina's.`;
  const offerLine = isEN
    ? `Your €29 is credited — receive your full blueprint today for only <strong style="color:#1A1715;font-weight:500;">€46</strong> more.`
    : `Je €29 wordt verrekend — ontvang vandaag je volledige blauwdruk voor nog maar <strong style="color:#1A1715;font-weight:500;">€46</strong> erbij.`;
  const codeLabel = isEN ? "Your code" : "Jouw code";
  const codeNote = isEN
    ? "Enter this code at checkout under \"Add promotion code\"."
    : "Vul deze code in bij checkout onder \"Add promotion code\".";
  const ctaLabel = isEN ? "Receive your full blueprint →" : "Ontvang je volledige blauwdruk →";
  const expiryNote = isEN
    ? "This code is valid for 7 days."
    : "Deze code is 7 dagen geldig.";

  return base(`
    <div style="height:0.75px;background:#C9A85C;opacity:.4;margin-bottom:32px;"></div>

    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:400;color:#1A1715;margin:0 0 20px;line-height:1.3;letter-spacing:-.3px;">
      ${headline}
    </h1>

    <p style="font-size:14.5px;color:#3A3830;line-height:1.85;margin:0 0 14px;font-weight:300;">
      ${isEN ? "Dear" : "Beste"} ${escHtml(name)},
    </p>
    <p style="font-size:14.5px;color:#4A4840;line-height:1.85;margin:0 0 20px;font-weight:300;">
      ${intro}
    </p>
    <p style="font-size:14px;color:#5A5850;line-height:1.85;margin:0 0 28px;font-weight:300;">
      ${body2}
    </p>

    <div style="background:#FAFAF7;border:1px solid #E5E0D8;border-left:3px solid #C9A85C;padding:20px 24px;margin:0 0 30px;text-align:center;">
      <p style="font-size:14px;color:#3A3830;line-height:1.7;margin:0 0 16px;font-weight:400;">${offerLine}</p>
      <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#9A8050;margin-bottom:8px;font-weight:600;">${codeLabel}</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:1.5px;color:#1A1715;margin-bottom:10px;">${escHtml(promoCode)}</div>
      <p style="font-size:11.5px;color:#9A8050;margin:0;">${codeNote}</p>
    </div>

    <div style="text-align:center;margin:0 0 16px;">
      <a href="${escHtml(checkoutUrl)}"
         style="display:inline-block;background:#1A1715;color:#C9A85C;text-decoration:none;
                padding:16px 44px;font-size:13.5px;font-weight:500;
                letter-spacing:1.5px;text-transform:uppercase;line-height:1;">
        ${ctaLabel}
      </a>
    </div>

    <p style="font-size:11px;color:#B0AAA4;text-align:center;margin:0 0 30px;">
      ${expiryNote}
    </p>

    <div style="height:1px;background:#EEEBE5;margin:0 0 20px;"></div>
    <p style="font-size:11.5px;color:#B0AAA4;line-height:1.75;margin:0;">
      ${isEN
        ? `Questions? Write to us at <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`
        : `Vragen? Schrijf ons via <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`}
    </p>
  `);
}

// ─── ORDER UPSELL TEMPLATE ───────────────────────────────────────────────────
// Fires 3 days after delivery for all reports except type-strategie (has its own)
// and maandelijks. Two Stripe codes: one personal (€15 off), one to share with a friend.
const REPORT_LABEL_NL = {
  "volledig":        "Human Design Reading",
  "relatie_liefde":  "Relatie Reading",
  "relatie_business":"Zakelijke Reading",
  "relatie_familie": "Familie Reading",
  "jaar":            "Jaarrapport",
  "kind":            "Kinderrapport",
  "loopbaan":        "Loopbaan Reading",
  "numerologie":     "Numerologie Reading",
  "horoscoop":       "Geboortehoroscoop Reading",
};
const REPORT_LABEL_EN = {
  "volledig":        "Human Design Reading",
  "relatie_liefde":  "Relationship Reading",
  "relatie_business":"Business Reading",
  "relatie_familie": "Family Reading",
  "jaar":            "Annual Report",
  "kind":            "Child Report",
  "loopbaan":        "Career Reading",
  "numerologie":     "Numerology Reading",
  "horoscoop":       "Birth Horoscope Reading",
};

function orderUpsellHtml({ name, lang, reportId, reportTitle, personalCode, friendCode, hdType, strategy, authority }) {
  const isEN = lang === "en";
  const siteUrl = isEN ? "https://www.facultyhd.com/en/readings" : "https://www.facultyhd.com/readings";

  // Personalised opening if chart data is available
  const typeLabel = hdType ? (isEN ? hdType : (TYPE_NL[hdType] || hdType)) : null;
  const stratLabel = strategy ? (isEN ? (STRAT_EN[strategy] || strategy) : strategy) : null;
  const chartLine = (typeLabel && stratLabel)
    ? (isEN
        ? `As a <strong style="color:#1A1715;font-weight:500;">${escHtml(typeLabel)}</strong> with strategy <em>${escHtml(stratLabel)}</em>. We hope the reading gave you something to sit with.`
        : `Als <strong style="color:#1A1715;font-weight:500;">${escHtml(typeLabel)}</strong> met strategie <em>${escHtml(stratLabel)}</em>. We hopen dat de reading je iets te overdenken heeft gegeven.`)
    : null;

  const rptLabel = (isEN ? REPORT_LABEL_EN[reportId] : REPORT_LABEL_NL[reportId]) || escHtml(reportTitle);

  const headline = isEN
    ? "A few days after your reading."
    : "Een paar dagen na je reading.";
  const intro = isEN
    ? `We wanted to reach out after your <strong style="color:#1A1715;font-weight:500;">${escHtml(rptLabel)}</strong>. ${chartLine || "We hope the reading gave you something real to work with."}`
    : `We wilden even contact opnemen na jouw <strong style="color:#1A1715;font-weight:500;">${escHtml(rptLabel)}</strong>. ${chartLine || "We hopen dat de reading je iets concreets heeft gegeven om mee te werken."}`;
  const body2 = isEN
    ? `As a small thank-you, here is a discount for your next reading. And a second code to pass on to someone you think might benefit from this too.`
    : `Als kleine attentie ontvang je een kortingscode voor je volgende reading. En een tweede code om door te geven aan iemand van wie je denkt dat dit ook bij hen past.`;

  const personalTitle = isEN ? "For you" : "Voor jou";
  const personalDesc  = isEN ? "€15 off your next reading" : "€15 korting op je volgende reading";
  const personalNote  = isEN
    ? "Enter this code at checkout under \"Add promotion code\"."
    : "Vul deze code in bij checkout onder \"Add promotion code\".";
  const personalExpiry = isEN ? "Valid for 30 days." : "30 dagen geldig.";

  const friendTitle = isEN ? "To share" : "Om te delen";
  const friendDesc  = isEN ? "€15 off for someone you'd like to give this to" : "€15 korting voor iemand aan wie je dit wilt geven";
  const friendNote  = isEN
    ? "Forward this code — it works for any reading."
    : "Stuur deze code door — geldig op alle readings.";
  const friendExpiry = isEN ? "Valid for 30 days." : "30 dagen geldig.";

  const ctaLabel = isEN ? "View all readings →" : "Bekijk alle readings →";

  return base(`
    <div style="height:0.75px;background:#C9A85C;opacity:.4;margin-bottom:32px;"></div>

    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:400;color:#1A1715;margin:0 0 20px;line-height:1.3;letter-spacing:-.3px;">
      ${headline}
    </h1>

    <p style="font-size:14.5px;color:#3A3830;line-height:1.85;margin:0 0 14px;font-weight:300;">
      ${isEN ? "Dear" : "Beste"} ${escHtml(name)},
    </p>
    <p style="font-size:14.5px;color:#4A4840;line-height:1.85;margin:0 0 16px;font-weight:300;">
      ${intro}
    </p>
    <p style="font-size:14px;color:#5A5850;line-height:1.85;margin:0 0 30px;font-weight:300;">
      ${body2}
    </p>

    <!-- Two code blocks side by side — styled on <td> so row height is always equal -->
    <table width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 30px;">
      <tr>
        <td width="48%" valign="top" style="background:#FAFAF7;border:1px solid #E5E0D8;border-left:3px solid #C9A85C;padding:18px 20px;text-align:center;">
          <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#9A8050;margin-bottom:6px;font-weight:600;">${personalTitle}</div>
          <p style="font-size:12px;color:#5A5850;line-height:1.6;margin:0 0 12px;font-weight:300;">${personalDesc}</p>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;letter-spacing:1.5px;color:#1A1715;margin-bottom:8px;">${escHtml(personalCode)}</div>
          <p style="font-size:10.5px;color:#9A8050;margin:0 0 6px;line-height:1.5;">${personalNote}</p>
          <p style="font-size:10px;color:#B0AAA4;margin:0;">${personalExpiry}</p>
        </td>
        <td width="4%"></td>
        <td width="48%" valign="top" style="background:#FAFAF7;border:1px solid #E5E0D8;border-left:3px solid rgba(201,168,92,.4);padding:18px 20px;text-align:center;">
          <div style="font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#9A8050;margin-bottom:6px;font-weight:600;">${friendTitle}</div>
          <p style="font-size:12px;color:#5A5850;line-height:1.6;margin:0 0 12px;font-weight:300;">${friendDesc}</p>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;letter-spacing:1.5px;color:#1A1715;margin-bottom:8px;">${escHtml(friendCode)}</div>
          <p style="font-size:10.5px;color:#9A8050;margin:0 0 6px;line-height:1.5;">${friendNote}</p>
          <p style="font-size:10px;color:#B0AAA4;margin:0;">${friendExpiry}</p>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin:0 0 28px;">
      <a href="${escHtml(siteUrl)}"
         style="display:inline-block;background:#1A1715;color:#C9A85C;text-decoration:none;
                padding:15px 44px;font-size:13px;font-weight:500;
                letter-spacing:1.5px;text-transform:uppercase;line-height:1;">
        ${ctaLabel}
      </a>
    </div>

    <div style="height:1px;background:#EEEBE5;margin:0 0 20px;"></div>
    <p style="font-size:11.5px;color:#B0AAA4;line-height:1.75;margin:0;">
      ${isEN
        ? `Questions? Write to us at <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`
        : `Vragen? Schrijf ons via <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`}
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

// ─── CANCELLATION TEMPLATE ───────────────────────────────────────────────────
function cancellationHtml({ name, lang }) {
  const isEN = lang === "en";

  const headline = isEN ? "Your subscription has been cancelled." : "Jouw abonnement is opgezegd.";
  const intro = isEN
    ? `Your monthly subscription to the <strong style="color:#1A1715;font-weight:500;">Faculty of Human Design Monthly Reading</strong> has been successfully cancelled. You will not be charged again.`
    : `Jouw maandelijks abonnement op de <strong style="color:#1A1715;font-weight:500;">Faculty of Human Design Maandelijkse Reading</strong> is succesvol opgezegd. Je wordt niet meer automatisch afgeschreven.`;
  const body2 = isEN
    ? `Any reports you've already received remain yours to keep. You can always re-subscribe from our website.`
    : `Rapporten die je al ontvangen hebt blijven van jou. Je kunt je altijd opnieuw aanmelden via onze website.`;
  const closing = isEN
    ? `Thank you for being part of our community. If you have any questions, write to us at <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`
    : `Bedankt dat je deel uitmaakte van onze community. Heb je vragen, schrijf ons dan via <a href="mailto:info@facultyhd.com" style="color:#9A8050;text-decoration:none;">info@facultyhd.com</a>.`;

  return base(`
    <div style="height:0.75px;background:#C9A85C;opacity:.4;margin-bottom:32px;"></div>

    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:400;color:#1A1715;margin:0 0 20px;line-height:1.3;letter-spacing:-.3px;">
      ${headline}
    </h1>

    <p style="font-size:14.5px;color:#3A3830;line-height:1.85;margin:0 0 14px;font-weight:300;">
      ${isEN ? "Dear" : "Beste"} ${escHtml(name)},
    </p>
    <p style="font-size:14.5px;color:#4A4840;line-height:1.85;margin:0 0 20px;font-weight:300;">
      ${intro}
    </p>
    <p style="font-size:14px;color:#5A5850;line-height:1.85;margin:0 0 28px;font-weight:300;">
      ${body2}
    </p>

    <div style="height:1px;background:#EEEBE5;margin:0 0 22px;"></div>

    <p style="font-size:12.5px;color:#888;line-height:1.75;margin:0;">
      ${closing}
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
