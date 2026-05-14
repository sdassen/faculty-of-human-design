import { createClient } from "@supabase/supabase-js";
import { generatePDF } from "../../lib/pdf/index.js";

function isAuthorized(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.query.secret === secret;
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Generate a full report on-demand and return the PDF inline.
 *
 * Two modes:
 *   1. ?orderId=XXX   — re-render an existing order (no AI, uses stored sections if any)
 *   2. ?sample=1      — generate a sample report with hardcoded test data
 *
 * Usage:
 *   GET /api/admin/preview-report?secret=XXX&orderId=YYY
 *   GET /api/admin/preview-report?secret=XXX&sample=1
 *
 * Returns: application/pdf inline (browser displays it)
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized. Add ?secret=<ADMIN_SECRET>" });
  }

  const { orderId, sample } = req.query;

  try {
    let order, sections;

    if (sample === "1") {
      // ── Generate a sample with mock data (no Supabase, no AI) ────────────
      order = makeSampleOrder();
      sections = makeSampleSections();
    } else if (orderId) {
      // ── Re-render an existing order ──────────────────────────────────────
      const db = getSupabase();
      const { data, error } = await db.from("orders").select("*").eq("id", orderId).single();
      if (error || !data) {
        return res.status(404).json({ error: `Order ${orderId} not found` });
      }
      order = data;

      // Try to load existing sections from a previously stored full text,
      // otherwise generate fresh placeholder sections.
      sections = (data.generated_sections && Array.isArray(data.generated_sections))
        ? data.generated_sections
        : makeSampleSections();
    } else {
      return res.status(400).json({
        error: "Specify ?orderId=<id> to preview an existing order, or ?sample=1 for a test render.",
      });
    }

    // ── Render PDF ────────────────────────────────────────────────────────
    const pdfBuffer = await generatePDF({ order, sections });

    // ── Stream back as inline PDF ─────────────────────────────────────────
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="preview-${orderId || "sample"}.pdf"`
    );
    res.setHeader("Cache-Control", "no-store");
    return res.end(pdfBuffer);
  } catch (e) {
    console.error("[preview-report]", e);
    return res.status(500).json({ error: e.message });
  }
}

// ─── SAMPLE DATA HELPERS ──────────────────────────────────────────────────────
function makeSampleOrder() {
  return {
    id: "sample-preview-id",
    report_title: "Volledig Human Design Rapport",
    customer_name: "Test Klant",
    customer_email: "test@facultyhd.com",
    birth_data: {
      day: 15, month: 3, year: 1988,
      hour: 14, minute: 30,
      place: "Amsterdam, Nederland",
      chart: {
        type: "Manifesting Generator",
        strat: "Wacht om te reageren, informeer dan voor je handelt",
        auth: "Sacraal",
        profile: "5/1",
        sig: "Bevrediging en vrede",
        notSelf: "Frustratie en woede",
        cross: "13 / 7 / 1 / 2",
        definedCenters: ["Sacral", "Throat", "G", "Ajna", "Head"],
        openCenters: ["Heart/Ego", "Spleen", "Solar Plexus", "Root"],
        channels: [
          { g1: 1, g2: 8, c1: "G", c2: "Throat" },
          { g1: 34, g2: 20, c1: "Sacral", c2: "Throat" },
          { g1: 11, g2: 56, c1: "Ajna", c2: "Throat" },
        ],
        allGates: [1, 8, 11, 13, 20, 34, 47, 64, 56, 7, 2],
      },
    },
    prompt_sections: [],
  };
}

function makeSampleSections() {
  return [
    {
      title: "Je Energetische Blauwdruk",
      text: `In jouw chart:
• Type: Manifesting Generator
• Strategie: Wacht om te reageren, informeer dan voor je handelt
• Autoriteit: Sacraal
• Profiel: 5/1 — Ketter / Onderzoeker
• 5 gedefinieerde centra, 4 open centra

De energetische signatuur van het Manifesting Generator-design

Jij bent een Manifesting Generator. Dat betekent dat je twee energetische snelheden in jezelf hebt: de onderzoekende, reagerende kracht van het sacraal én de directe uitdrukkingskracht van een gedefinieerde keel. Waar een Generator wacht en bouwt, mag jij stappen overslaan om sneller bij de essentie te komen.

De rol van het 5/1 profiel

Met een 5/1 profiel draag je twee tegengestelde maar versterkende kwaliteiten in je. De vijfde lijn projecteert op je: anderen zien in jou de oplossing voor problemen die jij niet altijd herkent. De eerste lijn vraagt om diepgang — om écht te weten waar je over praat voor je naar buiten treedt.

Valkuilen:
• Doorlopen in werk dat geen sacrale 'ja' meer heeft, uit gewoonte of verplichting
• De stem van anderen aanzien voor je eigen autoriteit
• Je inzichten delen voor er een uitnodiging tot reflectie is

Praktijk:
• Test elke beslissing met een ja/nee-vraag — luister naar het lichaam, niet het hoofd
• Informeer mensen om je heen voor je een nieuwe richting in slaat
• Maak ruimte voor onderzoek — diep gaan voor je naar buiten treedt

Deze week:
• Stel jezelf elke ochtend de vraag: voelt vandaag als sacrale 'ja' of 'nee'?
• Informeer minstens één persoon over iets wat je gaat doen
• Reserveer 30 minuten stille tijd om je gedachten te ordenen

Reflectievragen:
1. Waar in mijn leven negeer ik nu mijn sacrale respons?
2. Welke uitnodiging tot diepgang heb ik in de afgelopen weken gemist?
3. Op welke manier draag ik nu projecties van anderen die niet bij mij horen?`,
    },
    {
      title: "Type & Levensstrategie",
      text: `In jouw chart:
• Type: Manifesting Generator
• Aura: Open en omhullend met directe uitdrukkings-laag
• Strategie: Wacht om te reageren, informeer dan voor je handelt
• Niet-sacraal werk leidt tot frustratie en woede

De Manifesting Generator als versnelde bouwer

In tegenstelling tot een pure Generator kun jij meerdere paden tegelijk volgen. Je sacrale respons brengt je naar wat oproept, en je gedefinieerde keel maakt manifestatie direct mogelijk. Dat geeft je een natuurlijke snelheid die anderen soms onrustig vinden, maar voor jou correct is.

Multi-passioneel zijn als kracht

Je hoeft niet één ding te kiezen. Multi-passie is geen gebrek aan focus maar een correcte energetische uitdrukking voor jouw type. Forceren tot één pad leidt tot stilstand.

Valkuilen:
• Stappen overslaan zonder de noodzakelijke fundamenten te leggen
• Niet informeren en daardoor weerstand oproepen bij mensen om je heen
• Werk vasthouden waar de sacrale 'ja' al lang weg is

Praktijk:
• Voor elk nieuw project: check de sacrale respons hardop
• Bij richtingverandering: informeer de mensen die het raakt
• Maak ruimte voor je multi-passie i.p.v. ze te onderdrukken

Deze week:
• Identificeer één plek waar je nog 'ja' zegt maar je lichaam 'nee' fluistert
• Informeer één persoon over een verandering die je in gedachten hebt
• Geef jezelf toestemming om aan twee dingen tegelijk te werken

Reflectievragen:
1. Welk werk in mijn leven heeft geen sacrale respons meer?
2. Wie heb ik niet geïnformeerd over iets wat hen raakt?
3. Welke passie heb ik onderdrukt omdat ik dacht dat ik moest kiezen?`,
    },
  ];
}
