// ─── HD CENTERS — 9 ENERGIECENTRA ────────────────────────────────────────────
// Canonical reference: official Dutch names, functions, definedness behavior,
// not-self themes, and conditioning patterns. Used as ground-truth context
// for the AI when generating sections about centers.
//
// Keys MUST match the labels used in calcHD() — see CH/ALL_C in App.jsx.

export const CENTERS = {
  Head: {
    name: "Hoofdcentrum",
    nameEn: "Head",
    function: "Bron van inspiratie, mentale druk en vragen die uitnodigen tot onderzoek.",
    biological: "Hypofyse — drukcentrum dat ideeën en vragen voortbrengt.",
    defined: {
      behavior: "Vaste manier van denken; consequente bron van inspiratie en vragen vanuit het hoofd. Druk om te begrijpen is constant.",
      gift: "Betrouwbare inspiratiestroom; mentale richting voor anderen.",
    },
    open: {
      behavior: "Neemt mentale druk van anderen op en versterkt die. Voelt zich verantwoordelijk voor het beantwoorden van vragen die niet eens van zichzelf komen.",
      notself: "Zich druk maken om vragen en problemen die niet de jouwe zijn; mentale rusteloosheid die niet bij jou hoort.",
      wisdom: "Weten welke inspiratie het waard is om te volgen en welke alleen geleende mentale druk is.",
    },
    gates: [64, 61, 63],
  },

  Ajna: {
    name: "Ajna-centrum",
    nameEn: "Ajna",
    function: "Bewustzijnscentrum voor conceptualisatie, analyse en mentale verwerking.",
    biological: "Voorste hersenkwab — verwerkt informatie tot concepten en mening.",
    defined: {
      behavior: "Vaste manier van denken en concepten vormen. Mentale zekerheid is consistent.",
      gift: "Heldere conceptuele structuur; betrouwbare manier om kennis te ordenen.",
    },
    open: {
      behavior: "Flexibele geest; opent zich voor verschillende perspectieven en concepten van anderen.",
      notself: "Doen alsof je zeker weet wat je niet zeker weet; je vasthouden aan opinies om mentale onzekerheid te verbergen.",
      wisdom: "Comfortabel worden met niet-weten; in staat zijn meerdere perspectieven naast elkaar te houden zonder te moeten kiezen.",
    },
    gates: [47, 24, 4, 17, 43, 11],
  },

  Throat: {
    name: "Keelcentrum",
    nameEn: "Throat",
    function: "Centrum van manifestatie en communicatie. Hier wordt energie omgezet in actie en spraak.",
    biological: "Schildklier en stembanden — metabolisme en uiting.",
    defined: {
      behavior: "Consistente manier van spreken en handelen. Wat de keel zegt of doet, komt vanuit een vaste energetische bron.",
      gift: "Betrouwbare expressie; mensen kunnen rekenen op hoe je communiceert.",
    },
    open: {
      behavior: "Aandacht zoeken via spreken om gehoord te worden; spreken wanneer het juiste moment er nog niet is.",
      notself: "Druk voelen om iets te zeggen om aandacht te krijgen; te veel praten op het verkeerde moment; gesprekken proberen te sturen.",
      wisdom: "Wachten tot je wordt aangesproken of tot de juiste energetische context er is. Wat dan komt heeft natuurlijke autoriteit.",
    },
    gates: [62, 23, 56, 16, 20, 31, 8, 33, 35, 12, 45],
  },

  G: {
    name: "G-centrum (Zelf)",
    nameEn: "G/Self",
    function: "Centrum van identiteit, richting en liefde. Bepaalt wie je bent en waar je naartoe gaat.",
    biological: "Lever en bloed — kern van identiteit en levensrichting.",
    defined: {
      behavior: "Vaste identiteit en richting. Weet wie je bent, ook als de omgeving verandert.",
      gift: "Stabiele identiteitskern; anderen kunnen op je richting vertrouwen.",
    },
    open: {
      behavior: "Identiteit en richting komen via de omgeving. Op de juiste plek met de juiste mensen voel je je helder over wie je bent.",
      notself: "Worstelen om te weten wie je bent; je identiteit kameleontisch aanpassen aan elke omgeving; obsessief zoeken naar 'de juiste richting' vanuit het hoofd.",
      wisdom: "Vertrouwen op de plekken en mensen die je een gevoel van helderheid geven. Identiteit komt door juiste plaatsing, niet door zoeken.",
    },
    gates: [1, 2, 7, 13, 10, 15, 25, 46],
  },

  "Heart/Ego": {
    name: "Hart-/Egocentrum",
    nameEn: "Heart/Ego",
    function: "Centrum van wilskracht, eigenwaarde en materiële kracht.",
    biological: "Hart, maag, galblaas en thymus — wilskracht en immuunsysteem.",
    defined: {
      behavior: "Consistente wilskracht; in staat om beloften na te komen en doelen te zetten en te halen.",
      gift: "Betrouwbare wilskracht; weet wat het waard is en handelt ernaar.",
    },
    open: {
      behavior: "Wilskracht is niet consistent; eigenwaarde wisselt afhankelijk van de omgeving.",
      notself: "Iets willen bewijzen; beloften doen die je niet kunt nakomen; jezelf forceren om consistent te willen; aan eigenwaarde-issues lijden.",
      wisdom: "Niets te bewijzen hebben. Eigenwaarde komt van binnen, niet van prestaties.",
    },
    gates: [21, 40, 26, 51],
  },

  "Solar Plexus": {
    name: "Solar Plexus (Emotioneel centrum)",
    nameEn: "Solar Plexus",
    function: "Emotioneel bewustzijnscentrum. Werkt via een golf van hoog en laag; bron van diepe gevoeligheid en passie.",
    biological: "Nieren, prostaat, zenuwstelsel — emotionele frequentie.",
    defined: {
      behavior: "Emotionele golf van hoog naar laag en terug. Beslissingen vereisen tijd voor emotionele helderheid; nooit beslissen in het moment.",
      gift: "Diepe emotionele intelligentie; capaciteit voor passie, romantiek, geestdrift.",
    },
    open: {
      behavior: "Versterkt emoties van anderen. Voelt emoties intens als die van iemand anders aanwezig is.",
      notself: "Waarheid vermijden om vrede te bewaren; confrontatie vermijden ten koste van eerlijkheid; emoties van anderen aanzien voor de jouwe.",
      wisdom: "Weten welke emoties van anderen zijn en welke van jou. Vrij zijn van emotionele bagage die niet de jouwe is.",
    },
    gates: [6, 37, 22, 36, 30, 55, 49],
  },

  Sacral: {
    name: "Sacraalcentrum",
    nameEn: "Sacral",
    function: "Levenskracht- en vruchtbaarheidscentrum. Bron van werk-energie en seksualiteit. Spreekt via fysieke respons.",
    biological: "Geslachtsorganen — voortplanting en levensenergie.",
    defined: {
      behavior: "Constante toegang tot werkenergie; in staat om herhaaldelijk diep te werken aan wat oproept. Spreekt via lichamelijke 'uh-huh / unh-unh' respons.",
      gift: "Krachtige levensenergie voor werk dat oproept; betrouwbare bron van vitaliteit.",
    },
    open: {
      behavior: "Geen consistente eigen werkenergie. Neemt sacrale energie van anderen op en kan die versterken.",
      notself: "Niet weten wanneer genoeg is genoeg; opbranden door door te werken aan wat geen plezier geeft; jezelf forceren tot werk omdat anderen het doen.",
      wisdom: "Weten wanneer het tijd is om te stoppen; geen vaste energie hebben en daar tevreden mee zijn.",
    },
    gates: [34, 5, 14, 29, 9, 3, 42, 27, 59],
  },

  Spleen: {
    name: "Miltcentrum",
    nameEn: "Spleen",
    function: "Bewustzijnscentrum voor intuïtie, instinct, smaak en gezondheid. Spreekt zacht, één keer, in het moment.",
    biological: "Milt, lymfestelsel, immuunsysteem — overleving.",
    defined: {
      behavior: "Constante toegang tot intuïtieve waarschuwingen en instinctieve helderheid. Stille zekerheid in het moment.",
      gift: "Betrouwbare intuïtie; voelt direct of iets gezond of ongezond is.",
    },
    open: {
      behavior: "Vasthouden aan ongezonde mensen, gewoonten en situaties uit angst om los te laten.",
      notself: "Vastklampen aan wat niet meer goed is; angst voor verandering; ongezonde patronen overnemen van mensen om je heen.",
      wisdom: "Weten wat gezond is en wat niet, omdat je het verschil door en door hebt ervaren. Loslaten wat niet meer dient.",
    },
    gates: [48, 57, 44, 50, 32, 28, 18],
  },

  Root: {
    name: "Wortelcentrum",
    nameEn: "Root",
    function: "Adrenale-druk- en motorcentrum. Bron van stress die tot actie zet.",
    biological: "Bijnieren — stress, fight-or-flight, druk.",
    defined: {
      behavior: "Consistente, ritmische druk om dingen gedaan te krijgen. In staat om met stress te werken.",
      gift: "Betrouwbare drive; weet hoe je druk constructief gebruikt.",
    },
    open: {
      behavior: "Versterkt adrenale druk van anderen. Voelt zich opgejaagd, vooral in omgevingen met deadlines.",
      notself: "Sneller willen werken om de druk kwijt te zijn; alles afhandelen om vrij te zijn van stress; nooit het gevoel hebben dat je 'klaar' bent.",
      wisdom: "Druk kunnen hanteren zonder erin te verdrinken; weten welke deadlines echt zijn en welke door anderen worden opgelegd.",
    },
    gates: [58, 38, 54, 53, 60, 52, 19, 39, 41],
  },
};

/**
 * Get canonical text for a specific center, with state (defined/open).
 * Used to inject ground-truth context into AI prompts.
 */
export function describeCenter(centerKey, state) {
  const c = CENTERS[centerKey];
  if (!c) return null;
  const s = state === "defined" ? c.defined : c.open;
  const lines = [
    `${c.name} (${c.nameEn}) — ${state === "defined" ? "GEDEFINIEERD" : "OPEN"}`,
    `Functie: ${c.function}`,
    `Biologie: ${c.biological}`,
    `Gedrag: ${s.behavior}`,
  ];
  if (state === "defined") {
    lines.push(`Gift: ${s.gift}`);
  } else {
    lines.push(`Not-Self: ${s.notself}`);
    lines.push(`Wijsheid (wanneer geleefd): ${s.wisdom}`);
  }
  return lines.join("\n");
}
