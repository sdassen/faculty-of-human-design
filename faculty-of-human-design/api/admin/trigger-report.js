import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { inngest } from "../../lib/inngest/client.js";

function isAuthorized(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.query.secret === secret;
}

/**
 * Trigger a real AI-generated report delivery.
 *
 * Usage: GET /api/admin/trigger-report?secret=XXX
 *        &name=Steven+Dassen
 *        &email=your@email.com
 *        &day=1&month=1&year=1990
 *        &hour=12&minute=0
 *        &place=Amsterdam
 *        &report=volledig          (optional, default: volledig)
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized. Add ?secret=<ADMIN_SECRET>" });
  }

  const {
    name = "Test Gebruiker",
    email = "test@facultyhd.com",
    day = "1", month = "1", year = "1990",
    hour = "12", minute = "0",
    place = "Amsterdam",
    report = "volledig",
  } = req.query;

  const REPORT_TITLES = {
    volledig: "Volledig Human Design Rapport",
    jaar: "Jaarrapport 2026",
    kind: "Kinderrapport",
    loopbaan: "Loopbaanrapport",
    numerologie: "Numerologie Rapport",
    horoscoop: "Geboortehoroscoop",
  };

  const REPORT_SECTIONS = {
    volledig: ["Je Energetische Blauwdruk","Type & Levensstrategie","Autoriteit","Profiel","Gedefinieerde Centra","Open Centra & Conditionering","Actieve Kanalen","Je Poorten","Inkarnatie-Kruis","Relaties & Verbinding","Praktische Guidance 2026-2028","Slotanalyse"],
    jaar: ["Energie van Je Nieuw Levensjaar","Solar Return Analyse","Dominante Themas","Kwartaal 1","Kwartaal 2","Kwartaal 3","Kwartaal 4","Kansen & Uitdagingen","Intentie voor het Jaar"],
    kind: ["De Essentie van dit Kind","Type & Strategie","Autoriteit & Beslissingen","Profiel & Levensverhaal","Centra & Energie","Open Centra & Sensitiviteit","Talenten & Krachten","Opvoedingsguidance","Slotanalyse"],
    loopbaan: ["Je Werkenergie","Type & Loopbaanstrategie","Autoriteit in Werk","Profiel & Rol","Sterke Centra op de Werkvloer","Talenten & Krachten","Ideale Werkomgeving","Pitfalls & Valkuilen","Praktisch Loopbaanadvies"],
    numerologie: ["Introductie Numerologie","Levenspad","Uitdrukking","Zielsgetal","Persoonlijkheidsgetal","Pers. Jaar 2026","Mastergetallen","Slotanalyse"],
    horoscoop: ["Introductie Horoscoop","De Zon & Je Essentie","Ascendant & Eerste Indruk","De Maan & Emoties","Mercurius & Venus","Mars & Jupiter","Saturnus & Buitenplaneten","Slotanalyse"],
  };

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const orderId = randomUUID();
    const reportTitle = REPORT_TITLES[report] || REPORT_TITLES.volledig;
    const sections = REPORT_SECTIONS[report] || REPORT_SECTIONS.volledig;

    const { error } = await supabase.from("orders").insert({
      id: orderId,
      report_id: report,
      report_title: reportTitle,
      customer_name: name,
      customer_email: email,
      status: "paid",
      paid_at: new Date().toISOString(),
      birth_data: {
        day: parseInt(day), month: parseInt(month), year: parseInt(year),
        hour: parseInt(hour), minute: parseInt(minute),
        place,
      },
      prompt_sections: sections,
    });

    if (error) throw new Error(`DB insert failed: ${error.message}`);

    // Fire the Inngest delivery workflow
    await inngest.send({
      name: "order/paid",
      data: { orderId },
    });

    return res.status(200).json({
      success: true,
      orderId,
      message: `Rapport wordt gegenereerd voor ${name}. Controleer ${email} over ~1 minuut (DELIVERY_TEST_MODE).`,
      reportTitle,
      sections: sections.length,
    });
  } catch (e) {
    console.error("[trigger-report]", e.message);
    return res.status(500).json({ error: e.message });
  }
}
