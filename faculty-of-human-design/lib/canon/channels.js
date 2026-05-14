// ─── HD CHANNELS — 36 KANALEN ─────────────────────────────────────────────────
// Canonical channel reference. Each channel is the bridge between two centers,
// formed by two specific gates. Used as ground-truth when generating
// the "Actieve Kanalen" section.
//
// Keys are sorted gate pairs as "g1-g2" where g1 < g2.

export const CHANNELS = {
  // ── Individual circuit — Knowing ─────────────────────────────────────────
  "1-8":   { name: "Inspiratie",                circuit: "Individueel · Kennen",   centers: ["G", "Throat"],          theme: "Het creatieve rolmodel — authentieke expressie die anderen inspireert." },
  "2-14":  { name: "De Sleutelhouder",          circuit: "Individueel · Kennen",   centers: ["G", "Sacral"],          theme: "Sleutel tot richting via materiële zekerheid; weten waar je naartoe beweegt." },
  "3-60":  { name: "Mutatie",                   circuit: "Individueel · Kennen",   centers: ["Sacral", "Root"],       theme: "Innovatie onder beperking — verandering die pulst vanuit het ritme van het leven." },
  "10-20": { name: "Ontwaken",                  circuit: "Individueel · Kennen",   centers: ["G", "Throat"],          theme: "Authentiek zijn in het moment — zelfliefde uitgedrukt in het nu." },
  "12-22": { name: "Openheid",                  circuit: "Individueel · Kennen",   centers: ["Throat", "Solar Plexus"], theme: "Sociaal gracieuze expressie — communicatie afgestemd op de emotionele golf." },
  "20-57": { name: "De Hersenwave",             circuit: "Individueel · Kennen",   centers: ["Throat", "Spleen"],     theme: "Doordringend bewustzijn — intuïtie uitgedrukt in het nu." },
  "23-43": { name: "Structuur",                 circuit: "Individueel · Kennen",   centers: ["Throat", "Ajna"],       theme: "Geniaal of bizar — individuele inzichten die anderen pas later begrijpen." },
  "25-51": { name: "Initiatie",                 circuit: "Individueel · Kennen",   centers: ["G", "Heart/Ego"],       theme: "Het kanaal van de sjamaan — moedig de eerste zijn." },
  "28-38": { name: "De Strijd",                 circuit: "Individueel · Kennen",   centers: ["Spleen", "Root"],       theme: "Worstelen met wat ertoe doet — koppigheid in dienst van betekenis." },
  "39-55": { name: "Emotioneren",               circuit: "Individueel · Kennen",   centers: ["Root", "Solar Plexus"], theme: "Provocatie en passie — gevoelens uitlokken om geestesgesteldheid te onderzoeken." },
  "57-34": { name: "Kracht",                    circuit: "Individueel · Kennen",   centers: ["Spleen", "Sacral"],     theme: "Archetypische macht — intuïtieve respons gekoppeld aan vitaliteit." },

  // ── Tribal circuit — Loyaliteit/Ego ──────────────────────────────────────
  "6-59":  { name: "Voortplanting",             circuit: "Tribaal · Verdediging",  centers: ["Solar Plexus", "Sacral"], theme: "Intimiteit en bonding — emotionele en seksuele verbinding." },
  "19-49": { name: "Synthese",                  circuit: "Tribaal · Verdediging",  centers: ["Root", "Solar Plexus"], theme: "Gevoelig voor de behoeften van de stam — voedsel, intimiteit en principes." },
  "21-45": { name: "De Geldlijn",               circuit: "Tribaal · Ego",          centers: ["Heart/Ego", "Throat"],  theme: "Materiële controle — de mensen-de-baas-stem." },
  "26-44": { name: "Overdracht",                circuit: "Tribaal · Ego",          centers: ["Heart/Ego", "Spleen"],  theme: "Het oude in een nieuw jasje — overlevingskennis uit het verleden bruikbaar maken." },
  "27-50": { name: "Bescherming",               circuit: "Tribaal · Verdediging",  centers: ["Sacral", "Spleen"],     theme: "Zorgen voor de stam — verantwoordelijkheid voor toekomstige generaties." },
  "32-54": { name: "Transformatie",             circuit: "Tribaal · Ego",          centers: ["Spleen", "Root"],       theme: "Ambitie met instinct voor wat duurzaam is — drive die niet snel opbrandt." },
  "37-40": { name: "De Gemeenschap",            circuit: "Tribaal · Ego",          centers: ["Solar Plexus", "Heart/Ego"], theme: "Het ondernemerscontract — werk in ruil voor erkenning en intimiteit." },

  // ── Collective circuit — Logic ───────────────────────────────────────────
  "4-63":  { name: "Logica",                    circuit: "Collectief · Logica",    centers: ["Ajna", "Head"],         theme: "Twijfel die leidt tot antwoorden — mentale verwerking van patronen." },
  "5-15":  { name: "Het Ritme",                 circuit: "Collectief · Logica",    centers: ["Sacral", "G"],          theme: "Zijn in de stroom van de natuur — extreme rangen in de menselijkheid." },
  "7-31":  { name: "De Alfa",                   circuit: "Collectief · Logica",    centers: ["G", "Throat"],          theme: "Leiderschap voor het collectief — democratische invloed." },
  "9-52":  { name: "Concentratie",              circuit: "Collectief · Logica",    centers: ["Sacral", "Root"],       theme: "Focus tot in detail — gedisciplineerd aan iets werken tot het af is." },
  "16-48": { name: "De Golf",                   circuit: "Collectief · Logica",    centers: ["Throat", "Spleen"],     theme: "Talent door herhaling — meesterschap door oefening." },
  "17-62": { name: "Aanvaarding",               circuit: "Collectief · Logica",    centers: ["Ajna", "Throat"],       theme: "Mening met details — een logisch verhaal voor anderen vertalen." },
  "18-58": { name: "Beoordeling",               circuit: "Collectief · Logica",    centers: ["Spleen", "Root"],       theme: "Onvrede in dienst van verbetering — het herkennen van wat niet werkt." },

  // ── Collective circuit — Abstract/Sensing ────────────────────────────────
  "11-56": { name: "Nieuwsgierigheid",          circuit: "Collectief · Abstract",  centers: ["Ajna", "Throat"],       theme: "Verhalen vertellen — ervaringen omzetten tot betekenisvolle verhalen." },
  "13-33": { name: "De Toehoorder",             circuit: "Collectief · Abstract",  centers: ["G", "Throat"],          theme: "Reflectie op het verleden — wijsheid uit terugblik." },
  "29-46": { name: "Ontdekking",                circuit: "Collectief · Abstract",  centers: ["Sacral", "G"],          theme: "Toewijding aan de ervaring — succes door volledig 'ja' te zeggen." },
  "30-41": { name: "Erkennen",                  circuit: "Collectief · Abstract",  centers: ["Solar Plexus", "Root"], theme: "Verlangen dat ervaring aanzwengelt — fantasie als motor voor nieuwe cycli." },
  "35-36": { name: "Veelzijdigheid",            circuit: "Collectief · Abstract",  centers: ["Throat", "Solar Plexus"], theme: "Honger naar nieuwe ervaringen — leerproces door variëteit." },
  "42-53": { name: "Volwassenheid",             circuit: "Collectief · Abstract",  centers: ["Sacral", "Root"],       theme: "Cycli afmaken — beginnen wat eindigt, eindigen wat begonnen is." },
  "47-64": { name: "Abstract Denken",           circuit: "Collectief · Abstract",  centers: ["Ajna", "Head"],         theme: "Verwarring die leidt tot betekenis — patronen herkennen achteraf." },

  // ── Integration channels ─────────────────────────────────────────────────
  "10-34": { name: "Verkenning",                circuit: "Integratie",             centers: ["G", "Sacral"],          theme: "Volgen van wat oproept — leven vanuit overtuiging." },
  "20-34": { name: "Charisma",                  circuit: "Integratie",             centers: ["Throat", "Sacral"],     theme: "Beschikbare kracht in het nu — werken aan wat oproept." },
  "10-57": { name: "Perfecte Vorm",             circuit: "Integratie",             centers: ["G", "Spleen"],          theme: "Lichamelijke zelfliefde — intuïtief weten wat het lichaam nodig heeft." },
};

/**
 * Lookup a channel by gate pair (any order). Returns canonical text snippet.
 */
export function describeChannel(g1, g2) {
  const key = [g1, g2].sort((a, b) => a - b).join("-");
  const ch = CHANNELS[key];
  if (!ch) return null;
  return [
    `Kanaal ${key} — ${ch.name}`,
    `Circuit: ${ch.circuit}`,
    `Verbindt: ${ch.centers.join(" ↔ ")}`,
    `Thema: ${ch.theme}`,
  ].join("\n");
}
