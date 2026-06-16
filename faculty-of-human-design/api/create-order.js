// Calls the Supabase REST API directly via fetch so we avoid the
// @supabase/supabase-js WebSocket check that throws in Node.js 20.

import { rateLimit, getClientIp } from "../lib/rateLimit.js";

// ── Server-side section catalog ───────────────────────────────────────────────
// NEVER trust promptSections from the client. Always look up here by reportId + language.
const REPORT_SECTIONS = {
  volledig: {
    nl: ["Je Energetische Blauwdruk","Type & Levensstrategie","Autoriteit","Profiel","Gedefinieerde Centra","Open Centra & Conditionering","Actieve Kanalen","Je Poorten","Inkarnatie-Kruis","Relaties & Verbinding","Praktische Guidance 2026-2028","Slotanalyse"],
    en: ["Your Energetic Blueprint","Type & Life Strategy","Authority","Profile","Defined Centers","Open Centers & Conditioning","Active Channels","Your Gates","Incarnation Cross","Relationships & Connection","Practical Guidance 2026-2028","Closing Analysis"],
  },
  "type-strategie": {
    nl: ["Jouw Type","Jouw Strategie","Jouw Autoriteit"],
    en: ["Your Type","Your Strategy","Your Authority"],
  },
  relatie_liefde: {
    nl: ["De Energie van Jullie Verbinding","Chart Analyse — Jouw Design","Chart Analyse — Partners Design","Elektromagnetische Verbindingen","Compatibiliteit & Aantrekking","Communicatie & Intimiteit","Spanningsvelden & Doorbraken","Gezamenlijk Groeipad","Praktisch Advies voor Harmonie"],
    en: ["The Energy of Your Connection","Chart Analysis — Your Design","Chart Analysis — Partner's Design","Electromagnetic Connections","Compatibility & Attraction","Communication & Intimacy","Tension Points & Breakthroughs","Shared Growth Path","Practical Advice for Harmony"],
  },
  relatie_business: {
    nl: ["De Energie van Jullie Samenwerking","Chart Analyse — Jouw Design","Chart Analyse — Zakenpartner Design","Besluitvormingsdynamieken","Complementariteit & Sterktes","Leiderschapsstijl & Rolverdeling","Communicatie & Conflictpatronen","Gezamenlijke Visie & Richting","Praktisch Advies voor Samenwerking"],
    en: ["The Energy of Your Partnership","Chart Analysis — Your Design","Chart Analysis — Business Partner's Design","Decision-Making Dynamics","Complementarity & Strengths","Leadership Style & Role Division","Communication & Conflict Patterns","Shared Vision & Direction","Practical Advice for Collaboration"],
  },
  relatie_familie: {
    nl: ["De Energie van Jullie Familiebinding","Chart Analyse — Jouw Design","Chart Analyse — Familielid","Familiedynamieken & Patronen","Communicatiestijlen & Begrip","Groeimogelijkheden voor Beiden","Spanningsvelden & Oplossingen","Guidance voor Meer Verbinding","Slotanalyse"],
    en: ["The Energy of Your Family Bond","Chart Analysis — Your Design","Chart Analysis — Family Member's Design","Family Dynamics & Patterns","Communication Styles & Understanding","Growth Opportunities for Both","Tension Points & Solutions","Guidance for More Connection","Closing Analysis"],
  },
  jaar: {
    nl: ["Energie van Je Nieuw Levensjaar","Solar Return Analyse","Dominante Themas","Kwartaal 1","Kwartaal 2","Kwartaal 3","Kwartaal 4","Kansen & Uitdagingen","Intentie voor het Jaar"],
    en: ["Energy of Your New Personal Year","Solar Return Analysis","Dominant Themes","Quarter 1","Quarter 2","Quarter 3","Quarter 4","Opportunities & Challenges","Intention for the Year"],
  },
  kind: {
    nl: ["Het Unieke Design van Je Kind","Type & Energie","Beslissingen Nemen","Hoe Je Kind Leert","Behoeften & Grenzen","Centra Analyse","Opvoedtips Op Maat","Gaven & Talenten","Relatie Ouder-Kind","Slotanalyse"],
    en: ["Your Child's Unique Design","Type & Energy","Making Decisions","How Your Child Learns","Needs & Boundaries","Centers Analysis","Parenting Tips Tailored to Your Child","Gifts & Talents","Parent-Child Relationship","Closing Analysis"],
  },
  loopbaan: {
    nl: ["Professionele Blauwdruk","Ideale Werkomgeving","Hoe Je Geld Aantrekt","Je Professionele Kracht","Samenwerking & Leiderschap","Valkuilen","Ondernemen vs. Loondienst","Financiele Strategie","Volgende Stap"],
    en: ["Professional Blueprint","Ideal Work Environment","How You Attract Money","Your Professional Strengths","Collaboration & Leadership","Pitfalls","Self-Employment vs. Employment","Financial Strategy","Your Next Step"],
  },
  numerologie: {
    nl: ["Je Numerologische Blauwdruk","Levenspadgetal","Uitdrukkingsgetal","Zielsgetal","Persoonlijkheidsgetal","Verjaardagsgetal","Persoonlijk Jaar 2026","Rijpingsgetal","Mastergetallen","Hoe Je Getallen Samenwerken","Guidance 2026-2028","Slotanalyse"],
    en: ["Your Numerological Blueprint","Life Path Number","Expression Number","Soul Urge Number","Personality Number","Birthday Number","Personal Year 2026","Maturity Number","Master Numbers","How Your Numbers Work Together","Guidance 2026-2028","Closing Analysis"],
  },
  horoscoop: {
    nl: ["Je Astrologische Blauwdruk","Zonneteken","Ascendant","De Maan","Mercurius Venus Mars","Jupiter Saturnus","Buitenste Planeten","De Huizen","Aspecten","Midhemel","Guidance 2026-2028","Slotanalyse"],
    en: ["Your Astrological Blueprint","Sun Sign","Ascendant","The Moon","Mercury, Venus & Mars","Jupiter & Saturn","Outer Planets","The Houses","Aspects","Midheaven","Guidance 2026-2028","Closing Analysis"],
  },
  maandelijks: {
    nl: ["Energie van Deze Maand","Planetaire Invloeden","Wat Er van jou Gevraagd Wordt","Kansen","Aandachtspunten","Intentie voor de Maand"],
    en: ["Energy of This Month","Planetary Influences","What Is Asked of You","Opportunities","Points of Attention","Intention for the Month"],
  },
};

// ── Lazy import for PDF generation (only loaded on GET test requests) ──────────
async function renderTestPdf(orderId, res) {
  const { createClient } = await import("@supabase/supabase-js");
  const { generatePDF }  = await import("../lib/pdf/index.js");

  class _NoopWS {
    constructor() { this.readyState = 3; }
    send() {} close() {} addEventListener() {} removeEventListener() {}
  }
  _NoopWS.CONNECTING = 0; _NoopWS.OPEN = 1; _NoopWS.CLOSING = 2; _NoopWS.CLOSED = 3;

  const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: _NoopWS } }
  );

  const { data: order, error } = await db.from("orders").select("*").eq("id", orderId).single();
  if (error || !order) return res.status(404).json({ error: "order not found" });

  const sections = (order.generated_sections || []).map(function(s) {
    return { title: s.title, ...s };
  });
  if (!sections.length) return res.status(400).json({ error: "no generated_sections for this order" });

  const pdf = await generatePDF({ order, sections });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="test-${orderId.slice(0, 8)}.pdf"`);
  res.setHeader("Cache-Control", "no-store");
  return res.send(pdf);
}

export default async function handler(req, res) {
  // GET ?testPdf=<orderId>&secret=<TEST_PDF_SECRET>
  // Regenerates a PDF from stored sections for rapid layout iteration.
  if (req.method === "GET") {
    const secret = process.env.TEST_PDF_SECRET;
    if (!secret || req.query.secret !== secret) {
      return res.status(403).json({ error: "forbidden" });
    }
    const { testPdf } = req.query;
    if (!testPdf) return res.status(400).json({ error: "testPdf orderId required" });
    try {
      return await renderTestPdf(testPdf, res);
    } catch (e) {
      console.error("[test-pdf]", e);
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method !== "POST") return res.status(405).end();

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[create-order] Missing Supabase env vars");
    return res.status(500).json({ error: "Server configuratiefout." });
  }

  // ── Rate limiting: 5 orders per IP per 60 seconds ────────────────────────
  const ip = getClientIp(req);
  const { allowed } = await rateLimit(`create-order:${ip}`, { max: 5, window: 60 });
  if (!allowed) {
    return res.status(429).json({ error: "Te veel verzoeken. Wacht even en probeer opnieuw." });
  }

  const {
    reportId,
    reportTitle,
    language,
    price,
    customerName,
    customerEmail,
    birthData,
    partnerBirthData,
    // promptSections intentionally ignored — section titles are looked up
    // server-side from REPORT_SECTIONS to prevent prompt injection.
  } = req.body;

  if (!reportId || !customerEmail || !birthData) {
    return res.status(400).json({ error: "Vereiste velden ontbreken" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return res.status(400).json({ error: "Ongeldig e-mailadres" });
  }

  // ── Server-side section lookup — reject unknown report IDs ───────────────
  const lang = language === "en" ? "en" : "nl";
  const sectionsEntry = REPORT_SECTIONS[reportId];
  if (!sectionsEntry) {
    return res.status(400).json({ error: `Onbekend rapport: ${reportId}` });
  }
  const promptSections = sectionsEntry[lang];

  const { randomUUID } = await import("crypto");
  const orderId = randomUUID();

  const row = {
    id: orderId,
    report_id: reportId,
    report_title: reportTitle || reportId,
    language: lang,
    customer_name: customerName || null,
    customer_email: customerEmail.trim().toLowerCase(),
    birth_data: birthData,
    partner_birth_data: partnerBirthData || null,
    prompt_sections: promptSections,
    status: "pending",
  };

  const url = process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/orders";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let dbRes;
  try {
    dbRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key,
        "apikey": key,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(row),
    });
  } catch (e) {
    console.error("[create-order] fetch to Supabase failed:", e.message);
    return res.status(500).json({ error: "Order aanmaken mislukt. Probeer opnieuw." });
  }

  if (!dbRes.ok) {
    let errBody = "";
    try { errBody = await dbRes.text(); } catch (_) {}
    console.error("[create-order] Supabase error:", dbRes.status, errBody);
    return res.status(500).json({ error: "Order aanmaken mislukt. Probeer opnieuw." });
  }

  return res.json({ orderId });
}
