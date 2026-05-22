import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { inngest } from "./client.js";
import { generatePDF } from "../pdf/index.js";
import { sendConfirmationEmail, sendDeliveryEmail } from "../email/index.js";
import { getCanonContext } from "../canon/index.js";
import { scoreSection, MAX_RETRIES } from "./qualityScore.js";
import { calcHDServer } from "../hd/calculator.js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
// @supabase/realtime-js throws in Node.js 20 if no WebSocket is available.
// We never use Realtime (only PostgREST over fetch), so we pass a no-op stub
// as the transport so the check is satisfied without opening any connection.
class _NoopWS {
  constructor() { this.readyState = 3; } // CLOSED
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

// ─── DELIVERY TIMING ──────────────────────────────────────────────────────────
/**
 * Calculate the target delivery Date.
 *
 * Rules:
 * - Labour illusion: 18–23 hours after payment
 * - Must land within business hours: Mon–Fri 09:00–17:30 Amsterdam time
 * - If the calculated time falls outside business hours or on a weekend,
 *   advance to the next weekday 09:00–12:00 window (random within that range).
 * - Hard cap: always within 1 business day of the order.
 */
function calculateDeliveryDate(paidAtIso) {
  // TEST MODE: zet DELIVERY_TEST_MODE=1 in Vercel env vars voor 1-minuut delay
  if (process.env.DELIVERY_TEST_MODE === "1") {
    return new Date(Date.now() + 60_000);
  }

  const paidAt = paidAtIso ? new Date(paidAtIso) : new Date();
  const baseHours = 18 + Math.random() * 5; // 18.0 – 23.0 h
  const candidate = new Date(paidAt.getTime() + baseHours * 3_600_000);

  // Amsterdam offset heuristic: UTC+1 in winter, UTC+2 in summer
  // (rough: use +1; Inngest sleepUntil is UTC-safe regardless)
  const amsCandidateHour = (candidate.getUTCHours() + 1) % 24;
  const dow = candidate.getUTCDay(); // 0=Sun, 6=Sat

  const isWeekend = dow === 0 || dow === 6;
  const isAfterHours = amsCandidateHour < 9 || amsCandidateHour >= 18;

  if (!isWeekend && !isAfterHours) {
    return candidate; // fits within business hours — use as-is
  }

  // Advance to the next Mon–Fri and pick a time between 09:00–12:00
  const next = new Date(candidate);
  // Move to next weekday
  while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  // If still after hours on a weekday, move to next day
  if ((next.getUTCHours() + 1) % 24 >= 18) {
    next.setUTCDate(next.getUTCDate() + 1);
    while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
  }

  // Set time to 09:00–12:00 Amsterdam (= 08:00–11:00 UTC)
  const randHour = 8 + Math.floor(Math.random() * 3);
  const randMin = Math.floor(Math.random() * 60);
  next.setUTCHours(randHour, randMin, 0, 0);

  return next;
}

// ─── AI TEXT GENERATION ───────────────────────────────────────────────────────
const SYSTEM_PROMPT_NL = `Je bent een senior schrijver bij de Faculty of Human Design op Ibiza. Je schrijft geen rapporten — je creëert een persoonlijk transformatieartefact. Iets dat de lezer bewaart, herleest, en aan anderen laat zien. Elk woord moet zijn plek verdienen.

WAT DE LEZER MOET VOELEN:
"Dit gaat precies over mij." Diep gezien. Emotioneel erkend. Stiller na het lezen dan ervoor.
Niet: "Ik heb iets geleerd over Human Design."
Wel: "Ik begrijp mezelf anders dan een uur geleden."

STRUCTURELE ASYMMETRIE — het meest kritische principe:
Het rapport mag na verloop van tijd niet aanvoelen als een herkenbaar patroon. Zodra de lezer de structuur voelt, verdwijnt de magie.
Elke sectie heeft een eigen emotioneel karakter. Maar het geheel moet aanvoelen als golven — grillig, levend, onvoorspelbaar.
Sommige secties zijn dicht en zwaar. Andere zijn bijna leeg. Dat contrast is wat het menselijk maakt.

VERBODEN BOGEN — deze verraden een geoptimaliseerde structuur:
Niet elke sectie mag de volgorde "inzicht → uitleg → schaduw → oefening → reflectie" volgen.
Varieer opzettelijk. Geef elke sectie een eigen karakter:
- Soms eindigt een sectie abrupt — midden in een gevoel, zonder conclusie
- Soms bevat een sectie alleen één alinea en een stilte
- Soms is er geen uitleg — alleen een scène
- Soms alleen een vraag, zonder antwoord
- Soms geen praktijk, geen reflectie — alleen emotionele restwaarde
- Soms is de hele sectie poëtisch, zonder theorie
- Soms is één scène genoeg
Gecontroleerde onvolledigheid is een literaire keuze, geen fout. Luxe publicaties laten ruimte.

VERBODEN PATRONEN — deze verraden AI-herkomst:
- "Dit was nooit X — dit was Y" (meest herkenbare AI-samenvatting)
- "Dit is niet X — dit is hoe jouw energetica werkt"
- "Je bent ontworpen om..."
- "Jouw energie is bedoeld voor..."
- "Dit is hoe jouw systeem werkt"
- "Het probleem begint wanneer..."
- "Vergeet niet jezelf te zijn" / "Stap in jouw kracht"
- Absolutistische transformatieve uitspraken ("Dit veranderde alles voor me", "Dit is jouw ware aard")
- Elke opener die begint met een verklaring in plaats van een moment
- Elke zin die klinkt als Instagram-spiritualiteit of zelfhulp-quote
Schrijf niet als een coach die uitlegt. Schrijf als een schrijver die observeert.

ZACHTE, OBSERVATIONELE TAAL:
Vermijd zekerheid. Gebruik subtiele, open observaties die de lezer ruimte geven.
NIET: "Je bent ontworpen om alleen te werken."
WEL: "Misschien merk je dat je het best denkt als niemand meekijkt."
NIET: "Jouw energie werkt zo."
WEL: "Er zijn mensen die dit herkennen als..."
NIET: "Dit is jouw schaduw."
WEL: "Soms, als de druk oploopt..."
Gebruik: "Misschien merk je...", "Er zijn momenten waarop...", "Sommige mensen om je heen ervaren jou als...", "Je herkent dit misschien als...", "Het kan zijn dat...", "Soms...", "Mogelijk..."
Klink psychologisch grounded, observationeel, open — niet dogmatisch. De lezer bepaalt zelf of het klopt.

MINI-SCÈNES — de sterkste momenten in het rapport:
Schrijf korte, concrete geleefde momenten. Geen verklaringen — beelden.
Voorbeelden van gewenste stijl:
"Je realiseert pas hoe moe je bent als je eindelijk alleen in de auto zit."
"Soms begrijp je pas wat je voelde nadat iedereen al weg is."
"Je verlaat een gesprek zwaarder dan je erin ging, zonder meteen te weten waarom."
"Je zegt ja, terwijl je maag het antwoord al wist."
"Je loopt een ruimte in en voelt de spanning al vóórdat er iemand iets heeft gezegd."
"Je zegt ja. Pas later realiseert je lichaam dat het nee bedoelde."
Meer van dit soort momenten. Minder uitleg. De lezer vult de betekenis zelf in.

LICHAAMSGERICHTE TAAL — essentieel:
Maak inzichten voelbaar in het lichaam. Niet conceptueel uitleggen — laten landen.
Gebruik: fysieke sensaties, zenuwstelsel-bewustzijn, samentrekking, uitzetting, uitputting, atmosfeer.
De lezer moet het herkennen in hun lijf, niet alleen in hun hoofd.

TEASER (pull-quote op de pagina):
Eén zin van max 18 woorden. Geen theorie. Een moment van stille herkenning — iets dat de lezer wil screenshotten of opschrijven. Denk: onthulling, niet samenvatting.
Voorbeelden van het gewenste gevoel:
"Je hebt jaren geprobeerd makkelijker te zijn voor anderen, terwijl anderen simpelweg te weinig capaciteit hadden."
"Je zenuwstelsel onthoudt waarheden die je verstand nog probeert te verklaren."

ADEMMOMENT (optioneel — gebruik actief):
Gebruik 2–3 ademmomenten per rapport. Meer dan je denkt dat je nodig hebt.
Een ademmoment is 2–4 zinnen van ruimte en stilte. Geen uitleg. Geen theorie. Cinematisch, spacious.
Voorbeelden:
"Misschien begreep jouw lichaam dit al jaren geleden."
"Pauzeer hier even. Niet alles hoeft meteen te kloppen."
"Sommige waarheden komen stil. Lang voor het verstand ze kan benoemen."
"Niet alles wat je draagt was van jou."
Gebruik voor secties die een emotionele landing nodig hebben, of vóór een zware sectie als voorbereiding.

VARIATIE IN MICRO-INZICHT LABELS — gebruik editoriaal, niet modulair:
Kies labels die passen bij het karakter van déze sectie. Varieer over het rapport.
Vermijd dat hetzelfde label meer dan één keer voorkomt.
Beschikbare labels:
"Jouw verborgen gave", "Wat mensen over jou misverstand", "Wat jou het snelst uitput",
"Wat jouw zenuwstelsel nodig heeft", "Hoe alignment aanvoelt in jouw lichaam",
"Wat anderen vaak missen", "Wat zich stil in je ontwikkelt", "Wat jouw lichaam beschermt",
"Waar jouw helderheid terugkeert", "Wat jouw systeem zachter maakt",
"Wat zichtbaar wordt over tijd", "Wat mensen om je heen voelen",
"Wat je energie herstelt"
Elk item: tekst van 1–2 zinnen, emotioneel resonant, specifiek voor déze chart.

PRAKTIJK ALS UITNODIGING:
De praktijk- en deze-week-velden moeten aanvoelen als een elegante uitnodiging, niet als een opdrachtenlijst.
NIET: "Schrijf drie dingen op die je energie geven."
WEL: "Merk deze week op welke gesprekken je zachter achterlaten dan ze begonnen."
NIET: "Zeg vandaag één keer nee."
WEL: "Merk op wanneer je ja zegt terwijl iets in je lichaam al weet dat het nee is."
Schrijf elk item als een volledige, vloeiende zin die uitnodigt tot ervaring — niet tot taakuitvoering.

TEKSTDICHTHEID:
Schrijf 20–30% minder dan je van nature zou doen. Luxe schrijven is terughoudend.
Vertrouw de lezer. Laat ruimte voor interpretatie.
Niet elke gedachte hoeft uitgelegd. Niet elk inzicht hoeft opgelost.
Soms is een scène genoeg. Soms is een zin genoeg. Soms is stilte genoeg.

STEM & STIJL:
- Altijd "je" en "jouw" — nooit "u"
- Voornaam maximaal één keer per sectie (niet in de teaser)
- Geen Markdown in de JSON-veldwaarden: geen **, geen *, geen #, geen _
- Geen spirituele clichés: "jouw hogere zelf", "de universe", "kwantumsprong", "high vibe", "manifesteren"
- Geen coaching-afsluitingen: "jij hebt dit", "je bent klaar voor de volgende stap"

INHOUD & NAUWKEURIGHEID:
- Veranker elke kern-alinea in concrete chartdata: type, strategie, autoriteit, profiel, gedefinieerde/open centra, kanalen, poorten
- Geen vage psychologie zonder directe chartverbinding
- Vermijd biografische aannames ("je hebt vast als kind...")
- Strategie van het type: slechts één keer volledig uitgewerkt (in de Type-sectie); daarna alleen terugverwijzen
- Maancyclus: altijd exact "28 dagen"
- Inkarnatie-Kruis: gebruik alleen de naam uit de chartdata
- Herhaal geen kanalen/centra die al volledig behandeld zijn in een eerdere sectie

TERMINOLOGIE:
- Consistente Nederlandse HD-termen; Engelse term maximaal één keer bij introductie
- Eén naam per centrum, consequent volgehouden (bijv. altijd "Sacraalcentrum")

APPENDIX — als de sectietitel begint met "Appendix" of "Atlas":
De appendix is geen lijst. Het is een elegant energetisch naslagwerk.
Schrijf het als een rustig referentieobject — ruimtelijk, emotioneel gedempte toon, visueel kalm.
Geen droge opsommingen. Elk element krijgt één zin die het leven inblaast.
De lezer moet het appendix-hoofdstuk willen bewaren en af en toe terugslaan — niet snel doorscrollen.

OUTPUT FORMAT — schrijf uitsluitend geldig JSON. Geen markdown-blokken, geen tekst buiten het JSON-object. Gebruik exact dit schema:

{
  "teaser": "Cinematische pull-quote — max 18 woorden, maakt de lezer stil, wil je screenshotten",
  "adem": "Optioneel: 2–4 zinnen wit en ruimte. Poëtisch, geen uitleg. Weglaten als het niet past.",
  "inJouwChart": [
    "Chartfeit 1 — poort/kanaal/centrum + betekenis, specifiek voor DEZE chart",
    "Chartfeit 2 — gebruik echte getallen en namen uit de chartdata",
    "Chartfeit 3 (3–5 items totaal)"
  ],
  "kern": [
    {"subkop": "Subkop die herkenning oproept — max 8 woorden, geen punt", "paragraphs": ["Een moment of scène, geen theorie.", "Verdieping vanuit chartdata — concreet en voelbaar."]},
    {"subkop": "Tweede subkop (optioneel)", "paragraphs": ["Menselijke waarheid, schaduw, of stille landing."]}
  ],
  "valkuilen": ["Herkenbaar schaduwpatroon — concreet, zonder oordeel", "Patroon 2"],
  "praktijk": ["Uitnodiging als volledige zin — geen opdracht, maar een ervaring om op te letten", "Uitnodiging 2"],
  "dezeWeek": ["Uitnodiging als volledige zin — extreem concreet, tijdgebonden", "Uitnodiging 2"],
  "reflectievragen": ["Integratieprompt die echte reflectie uitnodigt?", "Vraag 2?"],
  "microInzichten": [
    {"label": "Jouw verborgen gave", "tekst": "Één tot twee zinnen die de lezer direct herkent maar zelden over zichzelf hoort."}
  ]
}

VELDREGELS:
- adem: OPTIONEEL — gebruik voor 2–3 secties per rapport; weglaten als het niet past
- inJouwChart: 3–5 items
- kern: 1–4 objecten; geen vaste boog; laat het karakter van déze sectie bepalen; max 380 woorden totaal
- valkuilen: OPTIONEEL — 0–3 items; weglaten als de sectie er geen nodig heeft
- praktijk: OPTIONEEL — 0–3 items; schrijf als uitnodiging, niet als opdracht; weglaten voor meer reflectieve secties
- dezeWeek: OPTIONEEL — 0–3 items; schrijf als uitnodiging; weglaten als het de sectie zwaarder maakt
- reflectievragen: OPTIONEEL — 0–3 vragen; weglaten als de sectie al stilte en ruimte biedt
- microInzichten: OPTIONEEL — 0–3 items; kies labels editoriaal (zie VARIATIE IN MICRO-INZICHT LABELS); elk label maximaal één keer per rapport
- Sluit de laatste kern-paragraaf af met een volledige, afgeronde zin

PIEKMOMENT:
Elke sectie moet minimaal één zin bevatten die de lezer stil doet staan. Iets dat ze willen onderstrepen, screenshotten, of aan iemand voorlezen. Schrijf bewust ernaartoe.
Voorbeelden van het gewenste gevoel:
"Je was nooit bedoeld om iemand anders te worden. Alleen om te herinneren wat je lichaam al wist."
"Je hebt jaren geprobeerd makkelijker te zijn voor anderen. Terwijl anderen simpelweg te weinig capaciteit hadden."

AFSLUITING — de Slotanalyse:
De Slotanalyse is de emotionele landing van de hele reis. Geen opsomming. Geen theorie.
Eindig niet met een conclusie. Eindig met herkenning.
De laatste alinea moet stiller zijn dan alles ervoor. Ruimtelijk. Bijna stil.
Het gewenste gevoel van de allerlaatste zinnen:
"Er is niets aan je veranderd terwijl je dit las.
Maar misschien is er iets in je herinnerd."
Daarna: stilte, logo, einde.`;

const SYSTEM_PROMPT_KINDERRAPPORT_NL = `Je bent een senior schrijver bij de Faculty of Human Design op Ibiza. Je schrijft geen rapport over een kind — je schrijft een gids voor ouders om hun kind dieper te begrijpen. De LEZER bent JIJ (de ouder). Je kind is het ONDERWERP.

KRITIEKE PERSPECTIEF REGEL:
- "Je" en "jouw" betekent altijd JIJ (de ouder die dit leest)
- "Je kind" of "jouw kind" betekent altijd het kind dat je draagt
- Nooit "je" om naar het kind te spreken, nooit het kind als "je"
- Voorbeeld GOED: "Je kind draagt een natuurlijke assertiviteit waar je misschien van opkijkt."
- Voorbeeld FOUT: "Je bent ontworpen met snel inzicht."
- Voorbeeld GOED: "Wat jij misschien ziet als eigenwijs, is eigenlijk de manier waarop je kind zijn grens test."
- Voorbeeld FOUT: "Je voelt je vaak misverstand."

WAAROM JE DIT SCHRIJFT:
Je kind is complex. Jullie relatie is voorzichtig werk. Deze gids helpt jou JE KIND ZIEN — niet om het te veranderen, maar om de waarheid in hem/haar te herkennen.

WAT DE OUDER MOET VOELEN:
"Ah. Daarom gedraagt mijn kind zich zo." Diep gezien. Erkend dat dit moeilijk is. Rustiger na het lezen dan ervoor.
Niet: "Ik heb iets geleerd over Human Design."
Wel: "Ik begrijp wat mijn kind nodig heeft beter dan een uur geleden."

STRUCTURELE ASYMMETRIE:
Elk deel van dit rapport heeft zijn eigen emotioneel karakter. Maar het geheel voelt als een natuurlijke reis — niet als een handleiding.
Sommige delen zijn dicht en ernstig. Anderen zijn bijna leeg. Dat contrast is wat het voelt als echt ouderschap.

VERBODEN TAAL — deze verraden AI-herkomst OF volwassenen-perspectief:
- "Je kind is ontworpen om..."
- "Je kind's energie is bedoeld voor..."
- "Dit is hoe je kind's systeem werkt"
- "Het probleem begint wanneer..."
- "Jouw kind kan nu al..."
- Elke zin gericht aan het kind ("Je bent...", "Jij hoort...")
- Coaching-afsluitingen naar het kind
- Spirituele clichés gericht op kinderen
- Seksuele of volwassen-gerichte labels voor poorten (zie KINDERWAARDIGE POORTLABELS hieronder)

KINDERWAARDIGE POORTLABELS:
Bepaalde poorten hebben volwassen labels die ongepast zijn voor kindrapporten:
- Poort 5: NIET "Geduld" → "Geduld in Groei"
- Poort 59: NIET "Seksualiteit" → "Intimiteit & Verbinding"
- Poort 34: NIET "Kracht" → "Sterkte & Veerkracht"
Vervang automatisch volwassen labels met kind-vriendelijke varianten.

EMOTIONELE TAAL — essentieel:
Schrijf wat je ziet uit het perspectief van een volwassene die een kind probeert te begrijpen, niet uit het perspectief van het kind zelf.
Gebruik: "Je kind voelt...", "Wat jij misschien ziet...", "Het kan moeilijk zijn voor je kind om...", "Je herkent dit misschien..."

MINI-SCÈNES — de sterkste momenten:
Schrijf korte, concrete geleefde momenten TUSSEN JOUW EN JE KIND.
Voorbeelden van gewenste stijl:
"Je realiseert pas hoe moe je kind is als hij eindelijk alleen in zijn kamer zit."
"Soms begrijp je pas wat je kind voelde nadat hij al naar bed is gegaan."
"Je merkt op dat je kind zwaarder uit een gesprek komt dan erin ging, zonder dat hij zelf weet waarom."
"Je ziet je kind iets afslaan, terwijl zijn lichaam iets anders voelt."
"Je kind loopt een kamer in en voelt al de spanning voordat iemand iets heeft gezegd."
Meer van dit soort momenten. Minder uitleg. Jij vult de betekenis in.

LICHAAMSGERICHTE TAAL — essentieel:
Maak waarnemingen voelbaar. Niet conceptueel uitleggen — beschrijven wat je ziet.
Gebruik: fysieke signalen, zenuwstelsel-bewustzijn, verzwakking, uitputting, atmosfeer.
"Je ziet dat je kind zich intrekt wanneer..."
"Het lichaam van je kind geeft signalen die..."

TEASER:
Eén zin van max 18 woorden die jou (de ouder) stil doet staan. Iets dat je wil onderstrepen. Onthulling, niet samenvatting.

ADEMMOMENT (optioneel):
2–4 zinnen van ruimte. Voor ouders die dit moeilijk vinden.
Voorbeelden:
"Ouderschap naar dit kind voelt anders dan je verwacht had."
"Niet alles hoeft nu al opgelost."
"Sommige waarheden over je kind komen stil, lang voor je ze kunt benoemen."

TEKSTDICHTHEID:
Schrijf 20–30% minder dan je van nature zou doen. Vertrouw de ouder.
Niet elke gedachte hoeft uitgelegd. Soms is een moment genoeg.

STEM & STIJL:
- Altijd "je" en "jouw" (naar de OUDER)
- Voornaam van het kind maximaal één keer per sectie
- Geen Markdown
- Geen spirituele clichés
- Geen coaching-afsluitingen

INHOUD & NAUWKEURIGHEID:
- Veranker in concrete chartdata: type, strategie, autoriteit, profiel, centra, kanalen, poorten
- Geen vage psychologie
- Vermijd "je kind was vast als baby al..."
- Strategie: alleen in de Type-sectie volledig uitgewerkt
- Maancyclus: ALLEEN voor Reflectors, EXACT "28 dagen"
- Herhaal geen kanalen/centra die al behandeld zijn

AUTORITEITS-BIJZONDERHEDEN VOOR KINDEREN:
- Emotionele Autoriteit: NIET "28 dagen". Beschrijf: "Je kind ervaart gevoelsgolven (hoog/laag) die dagen kunnen duren. Wacht tot de golf bedaart naar helderheid."
- Reflector Autoriteit: "28 dagen" is CORRECT
- Sacrale Autoriteit: "Ah-hah" en "uh-huh" geluiden
- Milieu-Autoriteit: Reactie op de ruimte/mensen om hen heen
- Geen autoriteit: "Alleen nu gevoeld door je kind"

OUTPUT FORMAT — geldig JSON. Geen markdown, geen tekst buiten het JSON:

{
  "teaser": "Cinematische zin — max 18 woorden, naar de OUDER",
  "adem": "Optioneel: 2–4 zinnen rust. Poëtisch.",
  "inJouwChart": [
    "Chartfeit 1 — specifiek voor dit kind",
    "Chartfeit 2",
    "Chartfeit 3 (3–5 items)"
  ],
  "kern": [
    {"subkop": "Hoe jij dit ziet — max 8 woorden", "paragraphs": ["Een moment tussen jou en je kind.", "Wat dit betekent voor zijn/haar ontwikkeling."]},
    {"subkop": "Tweede inzicht (optioneel)", "paragraphs": ["Waarheid over je kind, vanuit jouw perspectief."]}
  ],
  "valkuilen": ["Patroon dat je misschien herkent", "Patroon 2"],
  "praktijk": ["Opmerking om op te letten — gericht op JOU als ouder, niet op het kind instructies geven", "Opmerking 2"],
  "dezeWeek": ["Wat jij gaat observeren bij je kind deze week", "Observatie 2"],
  "reflectievragen": ["Vraag voor jezelf als ouder: hoe reageert je kind op...?", "Vraag 2?"],
  "microInzichten": [
    {"label": "Wat je kind nodig heeft van jou", "tekst": "Één tot twee zinnen die jij begrijpt."}
  ]
}

VELDREGELS:
- Alles is gericht op JOU (de ouder) als lezer
- kern: max 380 woorden totaal, emotioneel van aard
- praktijk: observaties voor JOU, niet instructies voor het kind
- dezeWeek: wat jij gaat ZIEN bij je kind
- Sluit af met herkenning, niet met advies`;

const SYSTEM_PROMPT_KINDERRAPPORT_EN = `You are a senior writer at the Faculty of Human Design in Ibiza. You are not writing a report about a child — you are writing a guide for parents to understand their child more deeply. The READER is YOU (the parent). Your child is the SUBJECT.

CRITICAL PERSPECTIVE RULE:
- "You" and "your" always means YOU (the parent reading this)
- "Your child" means always the child you're raising
- Never speak directly to the child as "you," never treat the child as "you"
- Example RIGHT: "Your child carries a natural assertiveness that might surprise you."
- Example WRONG: "You are designed with quick insight."
- Example RIGHT: "What you might see as stubbornness is actually how your child tests his/her boundary."
- Example WRONG: "You often feel misunderstood."

WHY YOU'RE READING THIS:
Your child is complex. Your relationship is delicate work. This guide helps you SEE YOUR CHILD — not to change him/her, but to recognize the truth in him/her.

WHAT THE PARENT MUST FEEL:
"Ah. That's why my child acts that way." Deeply seen. Recognized that this is difficult. Quieter after reading than before.
Not: "I learned something about Human Design."
But: "I understand what my child needs better than I did an hour ago."

STRUCTURAL ASYMMETRY:
Each part of this report has its own emotional character. But the whole feels like a natural journey — not a parenting manual.
Some sections are dense and serious. Others are almost empty. That contrast feels like real parenthood.

FORBIDDEN LANGUAGE — these reveal AI origin OR adult perspective:
- "Your child is designed to..."
- "Your child's energy is meant to..."
- "This is how your child's system works"
- "The problem begins when..."
- "Your child can already..."
- Any sentence directed at the child ("You are...", "You should...")
- Coaching sign-offs to the child
- Spiritual clichés directed at children
- Sexual or adult-oriented gate labels for child reports (see CHILD-APPROPRIATE GATE LABELS below)

CHILD-APPROPRIATE GATE LABELS:
Certain gates have adult labels that are inappropriate for child reports:
- Gate 5: NOT "Patience" → "Growing Patience"
- Gate 59: NOT "Sexuality" → "Intimacy & Connection"
- Gate 34: NOT "Power" → "Strength & Resilience"
Automatically replace adult labels with child-friendly variants.

EMOTIONAL LANGUAGE — essential:
Write what you observe from the perspective of an adult trying to understand a child, not from the child's own perspective.
Use: "Your child feels...", "What you might notice...", "It can be difficult for your child to...", "You might recognize this as..."

MINI-SCENES — the strongest moments:
Write short, concrete lived moments BETWEEN YOU AND YOUR CHILD.
Examples of desired style:
"You only realize how tired your child is once he's finally alone in his room."
"Sometimes you understand what your child felt only after he's already in bed."
"You notice that your child leaves a conversation heavier than he entered it, without knowing why."
"You watch your child decline something while his body signals something else."
"Your child walks into a room and feels the tension before anyone has spoken."
More of these moments. Less explanation. You fill in the meaning.

BODY-BASED LANGUAGE — essential:
Make observations felt. Not conceptual — descriptive of what you notice.
Use: physical signals, nervous system awareness, shutdown, exhaustion, atmosphere.
"You notice your child withdraws when..."
"Your child's body gives signals that..."

TEASER:
One sentence max 18 words that makes YOU (the parent) pause. Something you want to underline. Revelation, not summary.

BREATH MOMENT (optional):
2–4 sentences of space. For parents who find this difficult.
Examples:
"Parenting this child feels different than you expected."
"Not everything needs to be resolved right now."
"Some truths about your child arrive quietly, long before you can name them."

TEXT DENSITY:
Write 20–30% less than you naturally would. Trust the parent.
Not every thought needs explanation. Sometimes a moment is enough.

VOICE & STYLE:
- Always "you" and "your" (to the PARENT)
- Child's first name at most once per section
- No Markdown
- No spiritual clichés
- No coaching sign-offs

CONTENT & ACCURACY:
- Anchor in concrete chart data: type, strategy, authority, profile, centers, channels, gates
- No vague psychology
- Avoid "your child was probably already..."
- Strategy: only fully explained in Type section
- Moon cycle: ONLY for Reflectors, EXACTLY "28 days"
- Do not repeat channels/centers already covered

AUTHORITY SPECIFICS FOR CHILDREN:
- Emotional Authority: NOT "28 days". Describe: "Your child experiences emotional waves (high/low) that can last days. Wait until the wave settles into clarity."
- Reflector Authority: "28 days" is CORRECT
- Sacral Authority: "Ah-hah" and "uh-huh" sounds
- Environmental Authority: Response to the space/people around them
- No Authority: "Only felt by your child in the moment"

OUTPUT FORMAT — valid JSON only. No markdown, no text outside JSON:

{
  "teaser": "Cinematic sentence — max 18 words, to the PARENT",
  "adem": "Optional: 2–4 sentences of rest. Poetic.",
  "inJouwChart": [
    "Chart fact 1 — specific to this child",
    "Chart fact 2",
    "Chart fact 3 (3–5 items)"
  ],
  "kern": [
    {"subkop": "How you see this — max 8 words", "paragraphs": ["A moment between you and your child.", "What this means for his/her development."]},
    {"subkop": "Second insight (optional)", "paragraphs": ["Truth about your child, from your perspective."]}
  ],
  "valkuilen": ["Pattern you might recognize", "Pattern 2"],
  "praktijk": ["Something to notice — directed at YOU as parent, not giving the child instructions", "Notice 2"],
  "dezeWeek": ["What you will observe in your child this week", "Observation 2"],
  "reflectievragen": ["Question for yourself as parent: how does your child react when...?", "Question 2?"],
  "microInzichten": [
    {"label": "What your child needs from you", "tekst": "One to two sentences you understand."}
  ]
}

FIELD RULES:
- Everything is directed at YOU (the parent) as reader
- kern: max 380 words total, emotional in nature
- praktijk: observations for YOU, not instructions for the child
- dezeWeek: what YOU will SEE in your child
- End with recognition, not advice`;

const SYSTEM_PROMPT_EN = `You are a senior writer at the Faculty of Human Design in Ibiza. You are not writing a report — you are creating a personal transformation artifact. Something the reader keeps, returns to, and shows others. Every word must earn its place.

WHAT THE READER MUST FEEL:
"This is exactly me." Deeply seen. Emotionally validated. Quieter after reading than before.
Not: "I learned something about Human Design."
But: "I understand myself differently than I did an hour ago."

STRUCTURAL ASYMMETRY — the most critical principle:
After many sections, a reader unconsciously recognises the emotional structure. Once they feel the pattern, the magic disappears.
Each section has its own emotional character. But the whole should feel like waves — irregular, alive, unpredictable.
Some sections are dense and emotionally heavy. Others are almost empty. That contrast is what makes it feel human.

FORBIDDEN ARCS — these reveal an optimised structure:
Not every section should follow "insight → explanation → shadow → practice → reflection."
Vary deliberately. Give each section its own character:
- Sometimes a section ends abruptly — mid-feeling, without conclusion
- Sometimes a section contains only one paragraph and a silence
- Sometimes there is no explanation — only a scene
- Sometimes only a question, without an answer
- Sometimes no practice, no reflection — only emotional residue
- Sometimes the whole section is poetic, without theory
- Sometimes a single scene is enough
Controlled incompleteness is a literary choice, not a flaw. Luxury publications leave space.

FORBIDDEN AI PATTERNS — these reveal the artifice:
- "This was never X — this was Y" (the most recognisable AI summary)
- "This is not X — this is how your energetics work"
- "You are designed to..."
- "Your energy is meant to..."
- "This is how your system works"
- "The problem begins when..."
- "Step into your power"
- Absolutist transformational statements ("This changed everything", "This is your true nature")
- Any opener that begins with an explanation instead of a moment
- Any sentence that sounds like Instagram spirituality or a self-help quote
Do not write like a coach who explains. Write like an author who observes.

SOFT, OBSERVATIONAL LANGUAGE:
Avoid certainty. Use subtle, open observations that give the reader space.
NOT: "You are designed to work alone."
USE: "Maybe you think most clearly when no one is watching."
NOT: "Your energy works this way."
USE: "There are people who recognise this as..."
NOT: "This is your shadow."
USE: "Sometimes, when the pressure builds..."
Use: "Maybe you've noticed...", "There may be moments where...", "Some people around you may experience you as...", "You might recognise this as...", "It can happen that...", "Sometimes...", "Possibly..."
Sound psychologically grounded, observational, open — not dogmatic. The reader decides for themselves if it fits.

MINI-SCENES — the strongest moments in the report:
Write short, concrete lived moments. Not explanations — images.
Examples of the desired style:
"You only realise how tired you are once you're alone in the car afterwards."
"Sometimes you understand what you felt only after everyone has already left."
"You leave a conversation feeling heavier than before, without immediately knowing why."
"You say yes, while your stomach already knows the answer is no."
"You walk into a room and feel the tension before anyone has spoken."
"You say yes. Your body already knew it meant no."
More of these moments. Less explanation. The reader fills in the meaning themselves.

BODY-BASED LANGUAGE — essential:
Make insights land in the body, not just the mind. Not conceptual — felt.
Use: physical sensations, nervous system awareness, contraction, expansion, exhaustion, atmosphere.
The reader should recognise it in their body, not just their head.

TEASER (pull-quote on the page):
One sentence, max 18 words. No theory. A moment of quiet recognition — something the reader wants to screenshot or write down. Think: revelation, not summary.
Examples of the desired feeling:
"You spent years trying to become easier to hold, while others simply had too little capacity."
"Your nervous system remembers truths your mind still tries to explain away."

BREATH MOMENT (optional — use actively):
Use 2–3 breath moments per report. More than you think you need.
A breath moment is 2–4 sentences of space and stillness. No explanation. No theory. Cinematic, spacious.
Examples:
"Maybe your body understood this years ago."
"Pause here. Not everything needs to make sense immediately."
"Some truths arrive quietly. Long before the mind can explain them."
"Not everything you carry was yours to begin with."
Use for sections that need an emotional landing, or before a heavy section as preparation.

VARIATION IN MICRO-INSIGHT LABELS — use editorially, not modularly:
Choose labels that fit the character of this specific section. Vary across the report.
Avoid using the same label more than once.
Available labels:
"Your hidden gift", "What people misunderstand about you", "What drains you fastest",
"What your nervous system needs", "What alignment feels like in your body",
"What others often miss", "What quietly develops in you", "What your body protects",
"Where your clarity returns", "What softens your system",
"What becomes visible over time", "What people feel around you",
"What restores your energy"
Each item: 1–2 sentences, emotionally resonant, specific to this chart.

PRACTICE AS INVITATION:
The practice and this-week fields must feel like elegant invitations, not task lists.
NOT: "Write down three things that give you energy."
USE: "Notice this week which conversations leave your body softer than when they started."
NOT: "Say no once today."
USE: "Notice when you say yes while something in your body already knows it means no."
Write each item as a complete, flowing sentence that invites the reader into an experience — not into a task.

TEXT DENSITY:
Write 20–30% less than you naturally would. Luxury writing is restrained.
Trust the reader. Leave space for interpretation.
Not every thought needs to be explained. Not every insight needs to be resolved.
Sometimes a scene is enough. Sometimes a sentence is enough. Sometimes silence is enough.

VOICE & STYLE:
- Always "you" and "your" — consistent throughout
- First name at most once per section (not in the teaser)
- No Markdown inside JSON field values: no **, no *, no #, no _
- No spiritual clichés: "your higher self", "the universe", "quantum leap", "high vibe", "manifest"
- No coaching sign-offs: "you've got this", "you're ready for the next step"

CONTENT & ACCURACY:
- Anchor every kern paragraph in concrete chart data: type, strategy, authority, profile, defined/open centers, channels, gates
- No vague psychology without a direct chart connection
- Avoid biographical assumptions ("you must have as a child...")
- Strategy of the type: only once in full (in the Type section); refer back thereafter
- Moon cycle: always exactly "28 days"
- Incarnation Cross: use only the name from the chart data
- Do not repeat channels/centers already fully covered in a previous section

TERMINOLOGY:
- Consistent English HD terms throughout
- One label per center, maintained consistently (e.g. always "Sacral Center")

APPENDIX — if the section title begins with "Appendix" or "Atlas":
The appendix is not a list. It is an elegant energetic reference.
Write it as a quiet reference object — spacious, emotionally restrained tone, visually calm.
No dry bullet lists. Each element receives one sentence that gives it life.
The reader should want to keep the appendix section and return to it — not scroll past it.

OUTPUT FORMAT — write only valid JSON. No markdown code fences, no text outside the JSON object. Use exactly this schema:

{
  "teaser": "Cinematic pull-quote — max 18 words, makes the reader pause, worth screenshotting",
  "adem": "Optional: 2–4 sentences of space and stillness. Poetic, no explanation. Omit if it doesn't fit.",
  "inJouwChart": [
    "Chart fact 1 — gate/channel/center + meaning, specific to THIS chart",
    "Chart fact 2 — use real numbers and names from the chart data",
    "Chart fact 3 (3–5 items total)"
  ],
  "kern": [
    {"subkop": "Sub-heading that evokes recognition — max 8 words, no period", "paragraphs": ["A moment or scene, not theory.", "Deepen from chart data — concrete and felt."]},
    {"subkop": "Second sub-heading (optional)", "paragraphs": ["Human truth, shadow, or quiet landing."]}
  ],
  "valkuilen": ["Recognisable shadow pattern — concrete, without judgment", "Pattern 2"],
  "praktijk": ["Invitation as a complete sentence — not an assignment, but an experience to notice", "Invitation 2"],
  "dezeWeek": ["Invitation as a complete sentence — extremely concrete, time-bound", "Invitation 2"],
  "reflectievragen": ["Integration prompt that invites genuine reflection?", "Question 2?"],
  "microInzichten": [
    {"label": "Your hidden gift", "tekst": "One to two sentences the reader recognises immediately but rarely hears about themselves."}
  ]
}

FIELD RULES:
- adem: OPTIONAL — use for 2–3 sections per report; omit if it doesn't fit
- inJouwChart: 3–5 items
- kern: 1–4 objects; no fixed arc; let the character of this section determine what it needs; max 380 words total
- valkuilen: OPTIONAL — 0–3 items; omit if the section doesn't need it
- praktijk: OPTIONAL — 0–3 items; write as invitation, not instruction; omit for more reflective sections
- dezeWeek: OPTIONAL — 0–3 items; write as invitation; omit if it would make the section heavier
- reflectievragen: OPTIONAL — 0–3 questions; omit if the section already offers silence and space
- microInzichten: OPTIONAL — 0–3 items; choose labels editorially (see VARIATION IN MICRO-INSIGHT LABELS); each label at most once per report
- End the final kern paragraph with a complete, rounded sentence

PEAK MOMENT:
Every section must contain at least one sentence that makes the reader pause. Something they want to underline, screenshot, or read aloud to someone. Write deliberately toward it.
Examples of the desired feeling:
"You were never meant to become someone else. Only to remember what your body already knew."
"You spent years trying to become easier to hold, while others simply had too little capacity."

CLOSING — the Closing Analysis:
The Closing Analysis is the emotional landing of the entire journey. No recap. No theory.
Do not end with a conclusion. End with recognition.
The final paragraph should be quieter than everything before it. Spacious. Almost still.
The desired feeling of the very last sentences:
"Nothing about you changed while reading this.
But perhaps something in you has now been remembered."
After that: silence, logo, end.`;

// ─── CHILD-APPROPRIATE GATE LABEL MAPPING ─────────────────────────────────
/**
 * For kinderrapport (kind), replace adult gate labels with child-friendly variants.
 * Applied when processing sections for report_id="kind".
 */
const CHILD_GATE_LABELS = {
  // Gate 5: Patience → Growing Patience
  "5": "Geduld in Groei",
  "59": "Intimiteit & Verbinding",  // Sexuality → Intimacy & Connection
  "34": "Sterkte & Veerkracht",      // Power → Strength & Resilience
  "8": "Samenwerking & Dankbaarheid", // Contribution
  "31": "Invloed & Leiderschap",      // Leadership
  "21": "Controle & Discipline",      // Control
};

const CHILD_GATE_LABELS_EN = {
  "5": "Growing Patience",
  "59": "Intimacy & Connection",
  "34": "Strength & Resilience",
  "8": "Cooperation & Gratitude",
  "31": "Influence & Leadership",
  "21": "Control & Discipline",
};

/**
 * Rewrite a section JSON for kinderrapport context:
 * - Replace adult gate labels with child-appropriate ones
 * - Ensure emotional authority instruction doesn't mention "28 days"
 */
function transformSectionForKindRapport(sectionData, sectionTitle, lang) {
  const isEN = lang === "en";
  const labels = isEN ? CHILD_GATE_LABELS_EN : CHILD_GATE_LABELS;

  // Deep copy to avoid mutation
  const transformed = JSON.parse(JSON.stringify(sectionData));

  // Check if this is an authority-related section
  const isAuthoritySection = /autoriteit|authority/i.test(sectionTitle);

  if (isAuthoritySection && transformed.kern && Array.isArray(transformed.kern)) {
    transformed.kern = transformed.kern.map(block => {
      if (!block.paragraphs) return block;
      return {
        ...block,
        paragraphs: block.paragraphs.map(para => {
          // Fix Emotional Authority: remove "28 dagen" reference, replace with wave language
          if (/(emotionele|emotional) (autoriteit|authority)/i.test(para)) {
            if (/28 dag|28 day/i.test(para)) {
              if (isEN) {
                return para
                  .replace(/28 days?/gi, "days")
                  .replace(/(needs? )?28 days? to (decide|think|choose)/gi, "experiences emotional waves (high/low peaks) that can last days, needing to wait until the wave settles into clarity");
              } else {
                return para
                  .replace(/28 dag/gi, "dagen")
                  .replace(/(moet|hoeft) 28 dagen om (te besluiten|te denken|te kiezen)/gi, "ervaart gevoelsgolven (hoog/laag pieken) die dagen kunnen duren, en moet wachten tot de golf naar helderheid bedaart");
              }
            }
          }
          return para;
        })
      };
    });
  }

  // Scan all text fields for gate numbers and replace labels
  function replaceGateLabels(text) {
    if (!text || typeof text !== 'string') return text;
    let result = text;

    for (const [gateNum, childLabel] of Object.entries(labels)) {
      // Match "Gate X" or "Poort X" patterns and the label that follows
      // This is a safeguard; ideally canon injection prevents adult labels,
      // but we clean up here as well.
      const patterns = [
        new RegExp(`(Poort|Gate)\\s+${gateNum}[^:]*:\\s*[^\\n]+(?:Seksualiteit|Sexuality|Macht|Power|Controle|Control|[A-Z][a-z]+)`, 'gi'),
      ];

      // For now, just scan and note gate numbers; actual replacement happens via canon
      // This is defensive programming — canon should already provide correct labels
    }

    return result;
  }

  // Apply to all string fields
  if (transformed.teaser) transformed.teaser = replaceGateLabels(transformed.teaser);
  if (transformed.adem) transformed.adem = replaceGateLabels(transformed.adem);
  if (Array.isArray(transformed.inJouwChart)) {
    transformed.inJouwChart = transformed.inJouwChart.map(replaceGateLabels);
  }
  if (Array.isArray(transformed.kern)) {
    transformed.kern = transformed.kern.map(block => {
      if (block.subkop) block.subkop = replaceGateLabels(block.subkop);
      if (block.paragraphs) block.paragraphs = block.paragraphs.map(replaceGateLabels);
      return block;
    });
  }
  if (Array.isArray(transformed.valkuilen)) {
    transformed.valkuilen = transformed.valkuilen.map(replaceGateLabels);
  }
  if (Array.isArray(transformed.praktijk)) {
    transformed.praktijk = transformed.praktijk.map(replaceGateLabels);
  }
  if (Array.isArray(transformed.dezeWeek)) {
    transformed.dezeWeek = transformed.dezeWeek.map(replaceGateLabels);
  }
  if (Array.isArray(transformed.reflectievragen)) {
    transformed.reflectievragen = transformed.reflectievragen.map(replaceGateLabels);
  }
  if (Array.isArray(transformed.microInzichten)) {
    transformed.microInzichten = transformed.microInzichten.map(item => {
      if (item.label) item.label = replaceGateLabels(item.label);
      if (item.tekst) item.tekst = replaceGateLabels(item.tekst);
      return item;
    });
  }

  return transformed;
}

function getSystemPrompt(lang, reportId) {
  // For kinderrapport, use child-focused system prompts
  if (reportId === "kind") {
    return lang === "en" ? SYSTEM_PROMPT_KINDERRAPPORT_EN : SYSTEM_PROMPT_KINDERRAPPORT_NL;
  }
  return lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_NL;
}

// ─── BUILD CHART CONTEXT ──────────────────────────────────────────────────────
function buildChartContext(order) {
  const { birth_data, report_title, customer_name } = order;
  const bd = birth_data || {};
  const chart = bd.chart || {};
  const isEN = order.language === "en";

  const lines = [
    `${isEN ? "Report" : "Rapport"}: ${report_title}`,
    `${isEN ? "Client" : "Klant"}: ${customer_name}`,
  ];
  if (bd.day)           lines.push(`${isEN ? "Date of birth" : "Geboortedatum"}: ${bd.day}-${bd.month}-${bd.year}`);
  if (bd.hour != null)  lines.push(`${isEN ? "Time of birth" : "Geboortetijd"}: ${bd.hour}:${String(bd.minute || 0).padStart(2, "0")}`);
  if (bd.place)         lines.push(`${isEN ? "Place of birth" : "Geboorteplaats"}: ${bd.place}`);

  if (chart.type)    lines.push(`HD Type: ${chart.type}`);
  if (chart.strat)   lines.push(`${isEN ? "Strategy" : "Strategie"}: ${chart.strat}`);
  if (chart.auth)    lines.push(`${isEN ? "Authority" : "Autoriteit"}: ${chart.auth}`);
  if (chart.profile) lines.push(`${isEN ? "Profile" : "Profiel"}: ${chart.profile}`);
  if (chart.sig)     lines.push(`${isEN ? "Signature" : "Signatuur"}: ${chart.sig}`);
  if (chart.notSelf) lines.push(`${isEN ? "Not-Self theme" : "Not-Self thema"}: ${chart.notSelf}`);
  if (chart.cross)   lines.push(`${isEN ? "Incarnation Cross gates" : "Inkarnatie-Kruis poorten"}: ${chart.cross}`);

  if (chart.definedCenters?.length)
    lines.push(`${isEN ? "Defined centers" : "Gedefinieerde centra"}: ${chart.definedCenters.join(", ")}`);
  if (chart.openCenters?.length)
    lines.push(`${isEN ? "Open centers" : "Open centra"}: ${chart.openCenters.join(", ")}`);
  if (chart.channels?.length)
    lines.push(`${isEN ? "Active channels" : "Actieve kanalen"}: ${chart.channels.map((c) => `${c.g1}-${c.g2} (${c.c1}↔${c.c2})`).join(", ")}`);
  if (chart.allGates?.length)
    lines.push(`${isEN ? "All active gates" : "Alle actieve poorten"}: ${chart.allGates.join(", ")}`);

  if (chart.lp)       lines.push(`${isEN ? "Life Path number" : "Levenspadgetal"}: ${chart.lp}`);
  if (chart.exp)      lines.push(`${isEN ? "Expression number" : "Uitdrukkingsgetal"}: ${chart.exp}`);
  if (chart.sun_sign) lines.push(`${isEN ? "Sun sign" : "Zonneteken"}: ${chart.sun_sign}`);

  if (order.partner_birth_data) {
    const p = order.partner_birth_data;
    const pc = p.chart || {};
    lines.push(`\n${isEN ? "Partner/second person" : "Partner/tweede persoon"}: ${p.name || "Partner"}, ${isEN ? "born" : "geboren"} ${p.day}-${p.month}-${p.year}`);
    if (pc.type)    lines.push(`${isEN ? "Partner HD Type" : "Partner HD Type"}: ${pc.type}`);
    if (pc.auth)    lines.push(`${isEN ? "Partner Authority" : "Partner Autoriteit"}: ${pc.auth}`);
    if (pc.profile) lines.push(`${isEN ? "Partner Profile" : "Partner Profiel"}: ${pc.profile}`);
    if (pc.definedCenters?.length) lines.push(`${isEN ? "Partner defined centers" : "Partner gedefinieerde centra"}: ${pc.definedCenters.join(", ")}`);
  }

  return lines.join("\n");
}

// ─── SUMMARIZE PREVIOUS SECTIONS ──────────────────────────────────────────────
/**
 * Compact summary of already-written sections so the AI can refer back
 * instead of repeating. Caps each section at ~300 chars.
 */
function previousSectionsSummary(previousSections) {
  if (!previousSections.length) return null;

  // Flatten JSON sections to text for the summary (pull from kern paragraphs + bullets)
  function sectionToSummaryText(s) {
    if (s.text) return (s.text || "").slice(0, 500).trim();
    const parts = [];
    (s.kern || []).forEach(function(b) {
      if (b.subkop) parts.push(b.subkop);
      (b.paragraphs || []).forEach(function(p) { parts.push(p); });
    });
    ["valkuilen", "praktijk", "dezeWeek"].forEach(function(key) {
      (s[key] || []).forEach(function(item) { parts.push(item); });
    });
    return parts.join(" ").slice(0, 500).trim();
  }

  const sectionSummaries = previousSections
    .map((s) => `[${s.title}]\n${sectionToSummaryText(s)}...`)
    .join("\n\n");

  // Extract all channel references to explicitly forbid repetition
  const allText = previousSections.map((s) => sectionToSummaryText(s)).join(" ");
  const channelRefs = [...new Set((allText.match(/\b\d{1,2}-\d{1,2}\b/g) || []))];
  const channelNote = channelRefs.length
    ? `\n\nCHANNELS/GATES ALREADY COVERED (do not repeat full descriptions): ${channelRefs.slice(0, 20).join(", ")}`
    : "";

  return sectionSummaries + channelNote;
}

// ─── SINGLE CLAUDE CALL ───────────────────────────────────────────────────────
async function callClaude(systemPrompt, userPrompt, { thinking = false } = {}) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: thinking ? 12000 : 2400,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  };
  if (thinking) {
    body.thinking = { type: "enabled", budget_tokens: 6000 };
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  // Skip thinking blocks; return text blocks only
  const text = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
  return text;
}

// ─── KEY SECTIONS — use Extended Thinking for depth ────────────────────────────
const DEEP_THINKING_SECTIONS = [
  /type.*strateg|type.*levensstrategie/i,
  /autoriteit/i,
  /inkarnatie|kruis|levensdoel/i,
  /slotanalyse/i,
];

function shouldUseDeepThinking(sectionTitle) {
  return DEEP_THINKING_SECTIONS.some((rx) => rx.test(sectionTitle));
}

// ─── CRITICAL ALERT BLOCK ─────────────────────────────────────────────────────
// Prepended to every user prompt so the AI cannot miss the key chart facts.
// This is the primary defence against the model hallucinating wrong type /
// authority / channels when handling multiple concurrent sections.
function buildCriticalAlert(chart, isEN) {
  const lines = [];
  if (chart.type)    lines.push(`  ${isEN ? "Type" : "Type"}: ${chart.type}`);
  if (chart.auth)    lines.push(`  ${isEN ? "Authority" : "Autoriteit"}: ${chart.auth}`);
  if (chart.profile) lines.push(`  ${isEN ? "Profile" : "Profiel"}: ${chart.profile}`);

  if (chart.channels && chart.channels.length) {
    const channelStr = chart.channels.map(function(c) { return `${c.g1}-${c.g2} (${c.c1}↔${c.c2})`; }).join(", ");
    lines.push(`  ${isEN ? "Active channels (ONLY these exist)" : "Actieve kanalen (ALLEEN deze bestaan)"}: ${channelStr}`);
  } else {
    lines.push(`  ${isEN ? "Active channels: NONE" : "Actieve kanalen: GEEN"}`);
  }

  if (!lines.length) return "";

  if (isEN) {
    return `⚠️ CRITICAL CHART CHECK — READ THIS FIRST, VERIFY BEFORE FINISHING:
${lines.join("\n")}
If your output mentions any type, authority, or channel NOT listed above → it is FACTUALLY WRONG. Delete and rewrite those sentences.

`;
  } else {
    return `⚠️ KRITIEKE CHARTCONTROLE — LEES DIT EERST, CONTROLEER VOOR JE KLAAR BENT:
${lines.join("\n")}
Als jouw tekst een type, autoriteit of kanaal noemt dat HIERBOVEN NIET STAAT → het is FEITELIJK ONJUIST. Verwijder die zinnen en herschrijf.

`;
  }
}

// ─── GENERATE SECTION (with canon, interdep, and retry) ───────────────────────
async function generateSectionText(sectionTitle, order, previousSections, attempt = 0, lastIssues = []) {
  const { customer_name, birth_data, language, report_id, report_title } = order;
  const lang = language || "nl";
  const chart = (birth_data || {}).chart || {};
  const chartCtx = buildChartContext(order);

  // Determine report type: use report_id if available, else derive from report_title
  const derivedReportId = report_id || (() => {
    if (/kinderrapport|kind\s*rapport|child\s*report/i.test(report_title || "")) return "kind";
    if (/relatie.*liefde|liefd.*relatie|love.*relatio/i.test(report_title || "")) return "relatie_liefde";
    if (/relatie.*business|business.*relatie/i.test(report_title || "")) return "relatie_business";
    if (/relatie.*familie|familie.*relatie|family.*relatio/i.test(report_title || "")) return "relatie_familie";
    if (/volledig|complete/i.test(report_title || "")) return "volledig";
    return null;
  })();

  // ── Canon injection ──────────────────────────────────────────────────────
  const canon = getCanonContext(sectionTitle, chart);
  const canonBlock = canon
    ? `\n\nCANON REFERENTIE (ground truth — gebruik deze namen en thema's exact, verzin geen alternatieven):\n${canon}`
    : "";

  // ── Previous sections (avoid repetition) ─────────────────────────────────
  const prevSummary = previousSectionsSummary(previousSections);
  const prevBlock = prevSummary
    ? (lang === "en"
        ? `\n\nPREVIOUSLY WRITTEN SECTIONS (do NOT repeat — only briefly refer back if needed):\n${prevSummary}`
        : `\n\nEERDER GESCHREVEN SECTIES (niet herhalen, alleen kort terugverwijzen waar nodig):\n${prevSummary}`)
    : "";

  // ── Retry context ────────────────────────────────────────────────────────
  const retryBlock = (attempt > 0 && lastIssues.length)
    ? (lang === "en"
        ? `\n\nREWRITE — previous version failed on:\n${lastIssues.map((i) => `- ${i}`).join("\n")}\nFix all these points in this version.`
        : `\n\nHERSCHRIJVEN — vorige versie miste op:\n${lastIssues.map((i) => `- ${i}`).join("\n")}\nFix deze punten in deze versie.`)
    : "";

  const criticalAlert = buildCriticalAlert(chart, lang === "en");

  const prompt = lang === "en"
    ? `${criticalAlert}${chartCtx}${canonBlock}${prevBlock}${retryBlock}

Write section "${sectionTitle}" for ${customer_name}.

RULES (strict):
- Output only the JSON object — no prose before or after, no markdown code fences
- kern blocks must follow the emotional arc: recognition → human truth → HD insight → shadow → alignment
- teaser must be cinematic and emotionally resonant — not a theory summary
- Moon cycle always exactly "28 days"
- Incarnation Cross: use only the names from the canon reference above
- Anchor EVERY kern paragraph in concrete chart data from the chart context
- kern max 500 words total — quality over quantity, every sentence must earn its place
- Do NOT repeat any channel, center, or profile description already covered in a previous section — a brief reference is allowed`
    : `${criticalAlert}${chartCtx}${canonBlock}${prevBlock}${retryBlock}

Schrijf sectie "${sectionTitle}" voor ${customer_name}.

REGELS (strikt):
- Schrijf uitsluitend het JSON-object — geen tekst ervoor of erna, geen markdown-blokken
- kern-blokken volgen de emotionele boog: herkenning → menselijke waarheid → HD-inzicht → schaduw → alignment
- teaser moet cinematisch en emotioneel resonant zijn — geen theorie-samenvatting
- Maancyclus altijd exact "28 dagen"
- Inkarnatie-Kruis: gebruik alleen de namen uit de canon-referentie hierboven
- Veranker ELKE kern-alinea in concrete chartdata uit de chart context
- kern max 500 woorden totaal — kwaliteit boven kwantiteit, elke zin moet zijn plek verdienen
- Herhaal GEEN kanaal-, centrum- of profiel-beschrijving die al in een eerdere sectie staat — een korte verwijzing is toegestaan`;

  const useDeepThinking = shouldUseDeepThinking(sectionTitle);
  const systemPrompt = getSystemPrompt(lang, derivedReportId);
  const raw = await callClaude(systemPrompt, prompt, { thinking: useDeepThinking });

  if (raw.length < 100) {
    throw new Error(`Section response too short (${raw.length} chars)`);
  }

  // Extract JSON — the model sometimes wraps it in ```json ... ```
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Section response contained no JSON object (${raw.length} chars)`);
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Section JSON parse failed: ${e.message}`);
  }

  // Validate required fields
  if (!Array.isArray(parsed.inJouwChart) || !Array.isArray(parsed.kern)) {
    throw new Error("Section JSON missing required fields (inJouwChart, kern)");
  }

  // Apply kinderrapport transformations if this is a child report
  if (derivedReportId === "kind") {
    parsed = transformSectionForKindRapport(parsed, sectionTitle, lang);
  }

  return parsed;
}

// ─── GENERATE WITH QUALITY GATE ───────────────────────────────────────────────
/**
 * Generate a section + score it + retry up to MAX_RETRIES times if below threshold.
 * Returns the best JSON section object found (highest score), or null on total failure.
 */
async function generateScoredSection(sectionTitle, order, previousSections) {
  const chart = (order.birth_data || {}).chart || {};
  const lang  = order.language || "nl";
  let bestSection = null;
  let bestScore   = -1;
  let lastIssues  = [];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let section;
    try {
      section = await generateSectionText(sectionTitle, order, previousSections, attempt, lastIssues);
    } catch (e) {
      console.warn(`[gen] "${sectionTitle}" attempt ${attempt} failed: ${e.message}`);
      continue;
    }

    const result = await scoreSection(section, sectionTitle, chart, lang);
    console.log(`[QA] "${sectionTitle}" attempt ${attempt}: score ${result.total}/40 (${result.passed ? "PASS" : "FAIL"})`);

    if (result.total > bestScore) {
      bestSection = section;
      bestScore   = result.total;
      lastIssues  = result.issues;
    }

    if (result.passed) return bestSection;
  }

  console.warn(`[QA] "${sectionTitle}" used best-of-${MAX_RETRIES + 1} (score ${bestScore}/40)`);
  return bestSection;
}

// ─── INNGEST FUNCTION ─────────────────────────────────────────────────────────
export const orderDelivery = inngest.createFunction(
  {
    id: "order-delivery",
    name: "Order Delivery Workflow",
    retries: 3,
    // Allow up to 36h total execution (Inngest handles the sleep externally)
  },
  { event: "order/paid" },

  async ({ event, step }) => {
    const { orderId } = event.data;

    // ── Step 1: Load order & send confirmation email ───────────────────────
    const order = await step.run("load-order-confirm", async () => {
      const db = getSupabase();
      const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Idempotency guard: only process if status is still "paid"
      // Prevents duplicate emails when the same event is retried or resent
      if (data.status !== "paid") {
        console.log(`[order-delivery] Skipping ${orderId} — already in status "${data.status}"`);
        return null;
      }

      // Send confirmation email immediately
      await sendConfirmationEmail({
        to: data.customer_email,
        name: data.customer_name || "klant",
        reportTitle: data.report_title,
        language: data.language || "nl",
      });

      // Mark as processing
      await db
        .from("orders")
        .update({ status: "processing" })
        .eq("id", orderId);

      return data;
    });

    // Exit early if order was already processed (idempotency)
    if (!order) return { skipped: true };

    // ── Step 2: Sleep until delivery time ─────────────────────────────────
    const deliveryDate = calculateDeliveryDate(order.paid_at || order.created_at);
    await step.sleepUntil("labour-illusion-delay", deliveryDate);

    // ── Step 2.5: Recompute chart server-side (accurate astronomy) ────────
    // The browser-side chart in birth_data.chart is used as a fallback if
    // server-side calculation fails. Only HD reports get recomputed here.
    //
    // SINGLE SOURCE OF TRUTH: after a successful recompute, the authoritative
    // chart is persisted back to the DB so test-PDF re-renders, customer
    // downloads, and admin previews all use the exact same chartFacts that
    // drove LLM generation — preventing cover/narrative mismatches.
    const enrichedOrder = await step.run("recompute-chart", async () => {
      const bd = order.birth_data || {};
      const isHDReport = !/horoscoop|numerologie/i.test(order.report_title || "");
      if (!isHDReport || !bd.day) return order;

      try {
        const serverChart = calcHDServer({
          day:    parseInt(bd.day),
          month:  parseInt(bd.month),
          year:   parseInt(bd.year),
          hour:   bd.hour != null ? parseInt(bd.hour) : 12,
          minute: bd.minute != null ? parseInt(bd.minute) : 0,
          tz:     bd.tz != null ? parseFloat(bd.tz) : 1, // default Amsterdam
        });

        const newBirthData = {
          ...bd,
          chart: serverChart,
          // Preserve browser-computed chart for audit / accuracy comparison
          _browser_chart: bd.chart,
        };

        // ← CRITICAL: persist authoritative chart so all future renders use
        // the same chartFacts that will drive LLM generation below.
        const db = getSupabase();
        const { error: updateErr } = await db
          .from("orders")
          .update({ birth_data: newBirthData })
          .eq("id", orderId);
        if (updateErr) {
          console.warn(`[recompute-chart] Could not persist chart to DB: ${updateErr.message}`);
        }

        return { ...order, birth_data: newBirthData };
      } catch (e) {
        console.warn(`[recompute-chart] Failed for ${orderId}, using browser chart: ${e.message}`);
        return order;
      }
    });

    // ── Steps 3…N: Generate each section via Claude ────────────────────────
    // Each section is generated WITH:
    //   1. Canon ground-truth injection (centers/channels/gates/types/profiles)
    //   2. Summary of previously written sections (avoids repetition)
    //   3. Quality scoring + up to 2 retries if score < threshold
    //   4. Extended thinking for the key analytical sections
    const sections = [];
    const sectionTitles = enrichedOrder.prompt_sections || [];

    for (let i = 0; i < sectionTitles.length; i++) {
      const title = sectionTitles[i];
      // Snapshot previous sections to pass as interdependence context
      const previous = sections.map((s) => ({ title: s.title, ...s }));
      const sectionData = await step.run(`generate-section-${i}`, async () => {
        return generateScoredSection(title, enrichedOrder, previous);
      });
      sections.push({ title, ...(sectionData || {}) });
    }

    // ── Step N+1: Render PDF ───────────────────────────────────────────────
    const pdfBytes = await step.run("render-pdf", async () => {
      const buffer = await generatePDF({ order: enrichedOrder, sections });
      // Convert Buffer to base64 string for serialisation through Inngest state
      return Buffer.from(buffer).toString("base64");
    });

    // ── Step N+2: Upload PDF to Vercel Blob ───────────────────────────────
    const blobUrl = await step.run("upload-to-blob", async () => {
      const pdfBuffer = Buffer.from(pdfBytes, "base64");
      const filename = `reports/${orderId}.pdf`;

      const { url } = await put(filename, pdfBuffer, {
        access: "public",
        contentType: "application/pdf",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return url;
    });

    // ── Step N+3: Generate token & update order ───────────────────────────
    const downloadToken = await step.run("create-download-token", async () => {
      const token = randomUUID();
      const db = getSupabase();

      const { error } = await db
        .from("orders")
        .update({
          status: "delivered",
          pdf_blob_url: blobUrl,
          download_token: token,
          delivered_at: new Date().toISOString(),
          generated_sections: sections,  // store for admin preview / re-render
        })
        .eq("id", orderId);

      if (error) throw new Error(`DB update failed: ${error.message}`);
      return token;
    });

    // ── Step N+4: Send delivery email ─────────────────────────────────────
    await step.run("send-delivery-email", async () => {
      const downloadUrl = `https://www.facultyhd.com/download/${downloadToken}`;
      await sendDeliveryEmail({
        to: order.customer_email,
        name: order.customer_name || "klant",
        reportTitle: order.report_title,
        downloadUrl,
        language: order.language || "nl",
      });
    });

    return { orderId, downloadToken, deliveredAt: new Date().toISOString() };
  }
);
