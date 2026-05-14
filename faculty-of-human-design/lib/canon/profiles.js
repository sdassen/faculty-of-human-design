// ─── HD PROFILES — 6 LIJNEN + 12 PROFIELEN ───────────────────────────────────

export const LINES = {
  1: {
    name: "Onderzoeker (Investigator)",
    archetype: "De fundamentenlegger",
    theme: "Veiligheid door grondige kennis van het fundament.",
    quality: "Onzekerheid omgezet in zekerheid via diep onderzoek; introspectief en analytisch.",
    notself: "Onzeker blijven en het onderzoek nooit afmaken; eindeloos zoeken zonder te delen.",
  },
  2: {
    name: "Kluizenaar (Hermit)",
    archetype: "De natuurlijke begaafdheid",
    theme: "Natuurlijk talent dat door anderen wordt geroepen, niet door bewuste cultivatie.",
    quality: "Behoefte aan alleen-tijd om de eigen energie te herijken; geroepen worden voor wat van nature aanwezig is.",
    notself: "Geforceerd geroepen worden tot wat geen authentieke roeping is; jezelf forceren tot productiviteit zonder rust.",
  },
  3: {
    name: "Martelaar (Martyr)",
    archetype: "De experimentator",
    theme: "Wijsheid door experiment, vallen en opstaan.",
    quality: "Bondingen aangaan en losmaken; leren wat werkt door te ontdekken wat niet werkt.",
    notself: "Bitterheid over wat 'mislukt'; weigeren om het experiment te zien als waardevol op zich.",
  },
  4: {
    name: "Opportunist (Opportunist)",
    archetype: "Het fundament voor de ander",
    theme: "Levensverandering via het netwerk — vrienden, bondgenoten, gemeenschap.",
    quality: "Hartelijke vriendschap; invloed door persoonlijk netwerk; behoefte aan zekerheid voor verandering.",
    notself: "Vasthouden aan banden die niet meer voeden uit angst voor het onzekere; netwerk uitbuiten voor persoonlijk gewin.",
  },
  5: {
    name: "Ketter (Heretic)",
    archetype: "De universele oplosser",
    theme: "Projectie en praktische oplossingen voor het collectief.",
    quality: "Anderen projecteren verwachtingen op deze persoon; in staat oplossingen aan te dragen voor algemene problemen.",
    notself: "Door projecties geleefd worden; oplossingen aanbieden waar er geen vraag is; gestraft worden voor het niet voldoen aan een geprojecteerd ideaal.",
  },
  6: {
    name: "Rolmodel (Role Model)",
    archetype: "De wijze",
    theme: "Drie levensfasen: tot 30 (experimenteren als 3), 30-50 (op het dak — observeren), 50+ (rolmodel zijn).",
    quality: "Optimist, lange-termijnvisie, leeft het voorbeeld dat anderen kunnen volgen.",
    notself: "Het experiment vermijden uit angst voor teleurstelling; cynisme; niet leven wat je predikt.",
  },
};

export const PROFILES = {
  "1-3": { lines: [1, 3], theme: "Onderzoeker / Martelaar",          summary: "Onderzoekt grondig, test in de praktijk. Diep gefundeerd door experiment." },
  "1-4": { lines: [1, 4], theme: "Onderzoeker / Opportunist",        summary: "Onderzoekt grondig, deelt via het netwerk. Hartelijke autoriteit op fundament." },
  "2-4": { lines: [2, 4], theme: "Kluizenaar / Opportunist",         summary: "Natuurlijk talent dat door het netwerk wordt geroepen. Vriendschap en alleen-tijd in balans." },
  "2-5": { lines: [2, 5], theme: "Kluizenaar / Ketter",              summary: "Natuurlijk talent waarop het collectief projecteert. Geroepen om te leiden zonder het te zoeken." },
  "3-5": { lines: [3, 5], theme: "Martelaar / Ketter",               summary: "Leert door experiment, brengt praktische oplossingen voor het collectief. Pragmatisch en moedig." },
  "3-6": { lines: [3, 6], theme: "Martelaar / Rolmodel",             summary: "Experimenteert in de eerste levensfase, observeert in de tweede, wordt rolmodel in de derde." },
  "4-6": { lines: [4, 6], theme: "Opportunist / Rolmodel",           summary: "Hartelijk netwerk; uitgesproken meningen die op een gegeven moment dienen als wijsheid voor de groep." },
  "4-1": { lines: [4, 1], theme: "Opportunist / Onderzoeker",        summary: "Netwerk dat zoekt naar diepgaande kennis. Vast fundament met sociale invloed." },
  "5-1": { lines: [5, 1], theme: "Ketter / Onderzoeker",             summary: "Praktische oplosser met diepe kennis. Geprojecteerd op door het collectief, gefundeerd door studie." },
  "5-2": { lines: [5, 2], theme: "Ketter / Kluizenaar",              summary: "Geprojecteerd door het collectief, terugtrekkend in alleen-tijd. Stille autoriteit." },
  "6-2": { lines: [6, 2], theme: "Rolmodel / Kluizenaar",            summary: "Optimist met natuurlijk talent. Lange-termijnwijsheid die door anderen wordt herkend." },
  "6-3": { lines: [6, 3], theme: "Rolmodel / Martelaar",             summary: "Optimist die geleerd heeft door experiment. Levenslange leerschool." },
};

export function describeProfile(profileStr) {
  // profileStr is like "5/1" or "5-1"
  const norm = profileStr.replace("/", "-");
  const p = PROFILES[norm];
  if (!p) return null;
  const [l1, l2] = p.lines;
  return [
    `Profiel ${norm} — ${p.theme}`,
    `Samenvatting: ${p.summary}`,
    "",
    `Lijn ${l1} — ${LINES[l1].name}: ${LINES[l1].theme} | Kwaliteit: ${LINES[l1].quality} | Not-Self: ${LINES[l1].notself}`,
    `Lijn ${l2} — ${LINES[l2].name}: ${LINES[l2].theme} | Kwaliteit: ${LINES[l2].quality} | Not-Self: ${LINES[l2].notself}`,
  ].join("\n");
}
