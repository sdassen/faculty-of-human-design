// ─── HD TYPES & AUTHORITIES ───────────────────────────────────────────────────

export const TYPES = {
  "Manifestor": {
    aura: "Afstotend en gesloten — beschermt de eigen initiatiekracht.",
    strategy: "Informeer voor je handelt. Niet om toestemming te vragen, maar om mensen die door je actie geraakt worden voor te bereiden.",
    signature: "Vrede.",
    notSelf: "Woede.",
    percentage: "Ongeveer 9% van de wereldbevolking.",
    role: "Initiator — de enige type dat van nature kan beginnen zonder externe input.",
    energy: "Niet duurzaam — werkt in pieken; rust is essentieel.",
    childhood: "Vaak gecorrigeerd voor het initiëren; leert vroeg om te onderdrukken om niet 'lastig' te zijn.",
  },
  "Generator": {
    aura: "Open en omhullend — trekt aan wat oproept.",
    strategy: "Wacht om te reageren. Reageer op iets in de buitenwereld dat een sacrale respons oproept (uh-huh / unh-unh).",
    signature: "Bevrediging.",
    notSelf: "Frustratie.",
    percentage: "Ongeveer 37% van de wereldbevolking.",
    role: "Bouwer — de motor van de wereld; bouwt door consequent te reageren op wat oproept.",
    energy: "Duurzaam zolang het werk oproept. Sacraal raakt uitgeput van werk dat geen 'ja' oproept.",
    childhood: "Vaak geleerd om te initiëren en doelen te stellen i.p.v. te wachten op respons.",
  },
  "Manifesting Generator": {
    aura: "Open en omhullend, met een ingebouwde uitdrukkings-laag.",
    strategy: "Wacht om te reageren, informeer dan voor je handelt. Sacraal eerst, dan keel.",
    signature: "Bevrediging en vrede.",
    notSelf: "Frustratie en woede.",
    percentage: "Ongeveer 33% van de wereldbevolking.",
    role: "Versnelde bouwer — kan stappen overslaan om sneller bij de essentie te komen.",
    energy: "Multi-passioneel; hapert wanneer geforceerd één pad te volgen.",
    childhood: "Vaak gecorrigeerd voor snelheid; leert dat 'het slordig is' om stappen over te slaan.",
  },
  "Projector": {
    aura: "Focused en doordringend — ziet diep in andere mensen en systemen.",
    strategy: "Wacht op de uitnodiging. Niet passief, wel beschikbaar; wacht tot anderen je gave expliciet herkennen en uitnodigen.",
    signature: "Succes.",
    notSelf: "Bitterheid.",
    percentage: "Ongeveer 20% van de wereldbevolking.",
    role: "Gids — ziet wat de Generator niet ziet; meester van systemen, mensen en energiebeheer.",
    energy: "Niet sacraal; werkt niet duurzaam zoals een Generator. Pieken van helderheid en focus.",
    childhood: "Vaak energie-uitgeput door het na te bootsen van Generators; leert dat 'er hard voor werken' het pad is, wat juist het tegenovergestelde van de strategie is.",
  },
  "Reflector": {
    aura: "Resistent en kristalheld — weerspiegelt de gezondheid van de omgeving.",
    strategy: "Wacht een volledige maancyclus van 28 dagen voor belangrijke beslissingen. Voel hoe de beslissing aanvoelt doorheen verschillende energetische contexten.",
    signature: "Verrassing.",
    notSelf: "Teleurstelling.",
    percentage: "Ongeveer 1% van de wereldbevolking.",
    role: "Spiegel — neemt de gezondheid van de gemeenschap waar. Diepste sensitiviteit van alle types.",
    energy: "Lunaire energie — verandert met de stand van de maan; geen vaste energie.",
    childhood: "Vaak miskend voor sensitiviteit; leert te veel zichzelf aan te passen aan de omgeving.",
  },
};

export const AUTHORITIES = {
  "Emotioneel": {
    seat: "Gedefinieerd Solar Plexus.",
    mechanism: "Emotionele golf van hoog naar laag en terug. Beslissen op emotionele helderheid, niet in het moment.",
    practice: "Slaap er een nacht (of meerdere) over. Niets is dringend voor jou — emotionele helderheid komt na de golf.",
    notSelf: "Beslissen in een emotionele piek of dal; jezelf forceren tot beslissingen voor er helderheid is.",
    timeframe: "Uren tot dagen — afhankelijk van de hevigheid van de golf.",
  },
  "Sacraal": {
    seat: "Gedefinieerd Sacraal, ongedefinieerd Solar Plexus.",
    mechanism: "Lichamelijke respons in het moment: uh-huh (ja) of unh-unh (nee) vanuit het lichaam, niet vanuit het hoofd.",
    practice: "Laat anderen ja/nee-vragen stellen. Luister naar het geluid en de gevoel in het lichaam, niet naar de mentale redenatie.",
    notSelf: "De respons negeren omdat het mentaal niet 'klopt'; jezelf praten in een ja die geen lichaams-ja is.",
    timeframe: "Onmiddellijk.",
  },
  "Splenisch": {
    seat: "Gedefinieerd Milt, geen gedefinieerd Solar Plexus of Sacraal.",
    mechanism: "Zachte intuïtieve fluistering, eenmalig, in het moment. Milt spreekt één keer; daarna is hij stil.",
    practice: "Vertrouw het eerste, stille signaal — ook (juist) als je het niet rationeel kunt verklaren.",
    notSelf: "Het signaal overdenken tot het verdwijnt; rationaliseren tegen de intuïtie in.",
    timeframe: "Onmiddellijk en eenmalig.",
  },
  "Ego": {
    seat: "Gedefinieerd Hart/Ego, geen Solar Plexus of Sacraal autoriteit.",
    mechanism: "Wil en verlangen — 'wil ik dit echt?' is de vraag.",
    practice: "Spreek hardop wat je wilt; let op de woorden die je gebruikt. Wat de stem zegt is de autoriteit.",
    notSelf: "Doen wat je 'zou moeten willen'; jezelf overhalen tot wil die er niet is.",
    timeframe: "Variabel — kan onmiddellijk zijn of vraagt herhaling.",
  },
  "G/Self": {
    seat: "Gedefinieerd G-centrum, geen Solar Plexus of Sacraal autoriteit.",
    mechanism: "Helderheid komt door hardop spreken met iemand die je vertrouwt — niet om advies maar om je eigen stem te horen.",
    practice: "Spreek je dilemma uit. Wat eruit komt is de autoriteit.",
    notSelf: "Beslissingen in stilte nemen; mentaal analyseren zonder de stem te gebruiken.",
    timeframe: "In het moment van spreken.",
  },
  "Mentaal": {
    seat: "Voor bepaalde Projectors zonder motorische autoriteit.",
    mechanism: "Helderheid via gesprek en externe reflectie — kalibratie door spiegeling.",
    practice: "Praat met meerdere vertrouwde mensen over de keuze. De waarheid komt naar voren door het delen.",
    notSelf: "Beslissen vanuit het hoofd zonder externe reflectie; geïsoleerd kiezen.",
    timeframe: "Variabel — vraagt tijd voor gesprekken.",
  },
  "Maancyclus": {
    seat: "Reflector — geen gedefinieerde centra.",
    mechanism: "Volledige maancyclus van 28 dagen voor grote beslissingen. Voelt hoe de beslissing aanvoelt doorheen verschillende lunaire fasen.",
    practice: "Spreek de beslissing dagelijks uit met dezelfde vertrouwde mensen gedurende de cyclus. Let op verschuivingen in hoe het aanvoelt.",
    notSelf: "Snel beslissen onder druk; jezelf forceren tot tijdlijnen die niet bij jouw natuurlijke ritme passen.",
    timeframe: "28 dagen voor belangrijke beslissingen.",
  },
};

export function describeType(typeName) {
  const t = TYPES[typeName];
  if (!t) return null;
  return [
    `Type: ${typeName}`,
    `Aura: ${t.aura}`,
    `Rol: ${t.role}`,
    `Strategie: ${t.strategy}`,
    `Signatuur: ${t.signature}`,
    `Not-Self: ${t.notSelf}`,
    `Energie: ${t.energy}`,
    `Bevolking: ${t.percentage}`,
    `Kindertijd-patroon: ${t.childhood}`,
  ].join("\n");
}

export function describeAuthority(authName) {
  const a = AUTHORITIES[authName];
  if (!a) return null;
  return [
    `Autoriteit: ${authName}`,
    `Zetel: ${a.seat}`,
    `Mechanisme: ${a.mechanism}`,
    `Praktijk: ${a.practice}`,
    `Not-Self: ${a.notSelf}`,
    `Tijdlijn: ${a.timeframe}`,
  ].join("\n");
}
