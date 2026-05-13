import { createClient } from "@supabase/supabase-js";
import { inngest } from "./client.js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// ─── ARTICLE TOPICS ───────────────────────────────────────────────────────────
// Rotating list. New articles pick the first topic not yet in the DB.
const TOPICS = [
  {
    tag: "Human Design Basics",
    title: "Wat zijn de negen centra in Human Design?",
    angle: "Leg uit welke negen centra er zijn, wat elk centrum energetisch doet, wat het verschil is tussen gedefinieerd en open, en welk not-self thema hoort bij een open centrum. Gebruik voorbeelden uit het dagelijks leven.",
    images: [
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1557318041-1ce374d55ebf?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Type",
    title: "De Manifestor in Human Design: de initiator",
    angle: "Beschrijf de Manifestor: energetische configuratie (motor verbonden met keel), strategie informeren, not-self woede, signatuur vrede, en praktische implicaties voor werk en relaties.",
    images: [
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Type",
    title: "De Projector: de gids van het nieuwe tijdperk",
    angle: "Beschrijf de Projector: geen sacrale energie, strategie wachten op uitnodiging, not-self bitterheid, signatuur succes, talent voor begeleiding en systemen. Leg uit waarom de uitnodiging zo cruciaal is.",
    images: [
      "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Type",
    title: "De Reflector: spiegel van de gemeenschap",
    angle: "Beschrijf de Reflector: geen gedefinieerde centra, maancyclus van 28 dagen als beslissingstijdlijn, extreme omgevingsgevoeligheid, not-self teleurstelling, signatuur verrassing. Leg uit hoe zeldzaam zij zijn en wat dat betekent.",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Human Design Basics",
    title: "Profiel in Human Design: jouw levensrol",
    angle: "Bespreek wat het profiel is (combinatie van twee lijnen van de hexagrammen), welke zes lijnen er zijn met hun kernkwaliteiten, hoe ze samenwerken in een profiel, en wat dat betekent voor de levenstaak en de manier waarop iemand leert en groeit.",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Kanalen & Poorten",
    title: "Kanalen in Human Design: de taal van verbinding",
    angle: "Leg uit wat kanalen zijn (twee verbonden poorten tussen twee centra), hoe zij het design definiëren, het verschil tussen design- en persoonlijkheidskanalen, en welke energie kanalen overdragen. Geef concrete voorbeelden van bekende kanalen.",
    images: [
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Inkarnatie-Kruis",
    title: "Het inkarnatie-kruis: jouw levensdoel",
    angle: "Beschrijf wat het inkarnatie-kruis is (de vier bewuste/onbewuste zon/aarde poorten), hoe het je overkoepelende levensdoel en richting aangeeft, waarom het pas na de eerste saturnus-return volledig tot zijn recht komt, en het verschil tussen de vier typen kruisen.",
    images: [
      "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Numerologie",
    title: "Je levenspadgetal berekenen en begrijpen",
    angle: "Leg uit hoe je het levenspadgetal berekent (geboortedatum optellen tot één cijfer, met uitleg over mastergetallen 11, 22, 33), wat elk getal van 1-9 energetisch betekent, en hoe het de rode draad van je leven beschrijft zonder te determineren.",
    images: [
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Numerologie",
    title: "Persoonlijk jaar in numerologie: hoe je cycli herkent",
    angle: "Beschrijf het persoonlijk jaargetal (geboortemaand + geboortedag + huidig jaar), hoe de 9-jarige cyclus werkt, wat elk jaar van 1-9 inhoudt, en hoe je dat kunt gebruiken voor planning, beslissingen en het herkennen van natuurlijke ritmes.",
    images: [
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Astrologie",
    title: "De ascendant: je eerste indruk op de wereld",
    angle: "Beschrijf wat de ascendant is (het rijzende teken op het moment van geboorte), waarom het verschilt van het zonneteken, hoe het je uiterlijk, eerste indruk en manier van de wereld benaderen beïnvloedt, en waarom een exacte geboortetijd noodzakelijk is om het te berekenen.",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Astrologie",
    title: "Saturnus-return: de grote levensscharnieren",
    angle: "Beschrijf de saturnus-return (~28-30 jaar en ~58-60 jaar), wat Saturnus astrologisch symboliseert (structuur, verantwoordelijkheid, volwassenheid), welke levensthema's typisch oplaaien, en hoe je deze transitie bewust kunt doorlopen.",
    images: [
      "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1557318041-1ce374d55ebf?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Combinaties",
    title: "Human Design en Numerologie: twee systemen, één blauwdruk",
    angle: "Bespreek hoe Human Design (chartgebaseerd, op neutrino-informatie) en Numerologie (getalgebaseerd, op geboortedatum) elkaar aanvullen, waar ze overlappen, en hoe ze samen een completer beeld geven dan elk systeem afzonderlijk.",
    images: [
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Praktijk",
    title: "Je Human Design experiment: de eerste 90 dagen",
    angle: "Geef een praktische gids voor het leven met je Human Design in de eerste drie maanden: wat je kunt verwachten, welke weerstand normaal is, hoe je kleine experimenten opzet met strategie en autoriteit, en wanneer je eerste echte shifts kunt merken.",
    images: [
      "https://images.unsplash.com/photo-1557318041-1ce374d55ebf?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Autoriteit",
    title: "Emotionele autoriteit: waarom tijd je beste beslisser is",
    angle: "Verdiep de emotionele (solarplexus) autoriteit: hoe de emotionele golf werkt (hoog naar laag en terug), waarom beslissen in het moment voor deze mensen risicovol is, wat 'emotionele helderheid' in de praktijk betekent, en hoe je leert wachten zonder te stagneren.",
    images: [
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&q=75",
    ],
  },
  {
    tag: "Relaties",
    title: "Composiet in Human Design: wat twee charts samen maken",
    angle: "Leg uit wat een composiet-chart of relationship reading is, wat elektromagnetische kanalen zijn (elk persoon heeft één poort van het kanaal), hoe samensmelting (compromise channels) en dominantie werken, en wat je kunt aflezen over de dynamiek in een relatie.",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&q=75",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&q=75",
    ],
  },
];

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const ARTICLE_SYSTEM_PROMPT = `Je bent een diepgaand schrijver voor de Faculty of Human Design op Ibiza. Je schrijft heldere, informatieve en boeiende artikelen in het Nederlands over Human Design, Numerologie en Astrologie voor een breed publiek dat geïnteresseerd is maar nog niet alles weet.

STIJL:
- Schrijf in de tweede persoon ("je", "jou", "jouw") — nooit "u" of "uw"
- Toon: warm, intellectueel, toegankelijk — geen zweverige clichés, geen overdreven superlatieven
- Alinea's zijn beknopt: 3–5 zinnen per alinea, goed leesbaar op mobiel
- Geen subkopjes, geen bulletpoints, geen opsommingen — zuivere lopende tekst
- Vermijd open deuren: "In de hedendaagse samenleving...", "Het is belangrijk om...", "Steeds meer mensen..."

INHOUD:
- Verankerd in feiten en het systeem — geen vage beweringen zonder fundament
- Vakterm maximaal één keer in het Engels tussen haakjes bij introductie; daarna alleen Nederlands
- Verwijs waar relevant naar andere concepten maar leg ze niet volledig uit — de lezer kan meer ontdekken
- Schrijf als een autoriteit die het systeem door en door kent, niet als een enthousiasteling die net begonnen is

STRUCTUUR:
- 7–9 alinea's, totaal ~1200–1500 woorden
- Eerste alinea is een sterke inleiding: trekt de lezer direct in het onderwerp
- Laatste alinea sluit af met een open uitnodiging tot verdere reflectie of onderzoek — geen harde call-to-action
- Opbouw: van concept naar context naar praktische implicatie

OUTPUT:
- Alleen de artikeltekst — geen titel, geen "Hier is het artikel:", geen inleiding eromheen
- Alinea's gescheiden door één lege regel (\\n\\n)
- Geen markdown-opmaak, geen vet, geen cursief`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const DUTCH_MONTHS = [
  "januari","februari","maart","april","mei","juni",
  "juli","augustus","september","oktober","november","december",
];

function formatDutchDate(d) {
  return `${d.getDate()} ${DUTCH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function estimateReadtime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(4, Math.round(words / 200)) + " min";
}

function extractExcerpt(body) {
  const first = body.trim().split("\n\n")[0] || "";
  return first.length > 220 ? first.slice(0, 217).trim() + "..." : first.trim();
}

// ─── INNGEST FUNCTION ─────────────────────────────────────────────────────────
export const articleGeneration = inngest.createFunction(
  {
    id: "article-generation",
    name: "Article Generation",
    retries: 2,
  },
  // Runs on the 1st and 15th of each month at 10:00 UTC
  // Also triggered manually via "article/generate" event
  [{ cron: "0 10 1,15 * *" }, { event: "article/generate" }],

  async ({ event, step }) => {
    // ── Step 1: Pick the next topic not yet in the DB ─────────────────────
    const topic = await step.run("pick-topic", async () => {
      // Manual trigger can specify a topic index
      const manualIndex = event?.data?.topicIndex;
      if (manualIndex != null && TOPICS[manualIndex]) {
        return TOPICS[manualIndex];
      }

      const db = getSupabase();
      const { data } = await db.from("articles").select("title");
      const existing = new Set((data || []).map((a) => a.title));
      // Find first topic not yet written; if all done, cycle from start
      return TOPICS.find((t) => !existing.has(t.title)) ?? TOPICS[0];
    });

    // ── Step 2: Generate article body via Claude ──────────────────────────
    const body = await step.run("generate-article", async () => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          system: ARTICLE_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Schrijf een artikel over: "${topic.title}"\n\nInvalshoek: ${topic.angle}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Anthropic API error ${res.status}: ${txt.slice(0, 200)}`);
      }

      const data = await res.json();
      const text = data.content?.find((b) => b.type === "text")?.text || "";
      if (text.length < 500) {
        throw new Error(`Article too short (${text.length} chars)`);
      }
      return text.trim();
    });

    // ── Step 3: Store in Supabase ─────────────────────────────────────────
    const articleId = await step.run("store-article", async () => {
      const db = getSupabase();
      const now = new Date();

      const row = {
        tag: topic.tag,
        title: topic.title,
        date: formatDutchDate(now),
        readtime: estimateReadtime(body),
        excerpt: extractExcerpt(body),
        body,
        images: topic.images,
        published_at: now.toISOString(),
      };

      const { data, error } = await db
        .from("articles")
        .insert(row)
        .select("id")
        .single();

      if (error) throw new Error(`DB insert failed: ${error.message}`);
      return data.id;
    });

    return {
      articleId,
      title: topic.title,
      tag: topic.tag,
      generatedAt: new Date().toISOString(),
    };
  }
);
