// ─── HD GATES — 64 POORTEN ─────────────────────────────────────────────────────
// Canonical gate reference. Each gate corresponds to one of the 64 I Ching hexagrams.
// Used as ground-truth when generating "Je Poorten" or referencing specific gates.

export const GATES = {
  1:  { name: "Het Creatieve",                center: "G",            theme: "Authentieke zelfexpressie via creatie.",                  notself: "Imiteren wat anderen creëren." },
  2:  { name: "Het Ontvankelijke",            center: "G",            theme: "Richting via overgave; weten waar je naartoe wilt.",      notself: "Geforceerd zoeken naar levensrichting." },
  3:  { name: "Innovatie",                    center: "Sacral",       theme: "Vernieuwing onder beperking; orde uit chaos.",            notself: "Verstijven onder druk in plaats van te muteren." },
  4:  { name: "Antwoorden",                   center: "Ajna",         theme: "Mentale formules en hypotheses voor het collectief.",     notself: "Antwoorden geven die niet getest zijn." },
  5:  { name: "Vaste Patronen",               center: "Sacral",       theme: "Ritmische gewoonten die de stroom van het leven volgen.", notself: "Vasthouden aan ritme dat niet meer dient." },
  6:  { name: "Wrijving",                     center: "Solar Plexus", theme: "Emotionele filter voor intimiteit en relatie.",           notself: "Intimiteit afsluiten of vermijden uit angst." },
  7:  { name: "Het Zelf in Interactie",       center: "G",            theme: "Leiderschap voor de toekomst; rol voor het collectief.",  notself: "Leiderschap forceren of vermijden." },
  8:  { name: "Bijdrage",                     center: "Throat",       theme: "Creatieve individuele bijdrage aan de groep.",            notself: "Bijdrage onderdrukken om niet op te vallen." },
  9:  { name: "Focus",                        center: "Sacral",       theme: "Concentratie op detail om iets af te maken.",             notself: "Verstrooid raken in irrelevante details." },
  10: { name: "Gedrag van het Zelf",          center: "G",            theme: "Zelfliefde; jezelf zijn in het moment.",                  notself: "Jezelf veroordelen of aanpassen aan anderen." },
  11: { name: "Ideeën",                       center: "Ajna",         theme: "Mentale doorgang voor ideeën; geen drager van waarheid.", notself: "Ideeën als jouw waarheid claimen." },
  12: { name: "Voorzichtigheid",              center: "Throat",       theme: "Sociale gracieuze expressie op het juiste moment.",       notself: "Spreken zonder afstemming op de emotionele golf." },
  13: { name: "De Toehoorder",                center: "G",            theme: "Het geheim bewaren; ontvangen van anderen' verhalen.",    notself: "Verhalen doorvertellen of in oordeel raken." },
  14: { name: "Macht via Bezit",              center: "Sacral",       theme: "Werk dat materiële zekerheid creëert.",                   notself: "Werken aan wat geen oproep heeft." },
  15: { name: "Extremen",                     center: "G",            theme: "Liefde voor de menselijke variatie; eigen ritme.",        notself: "Jezelf aanpassen aan één ritme dat niet bij je past." },
  16: { name: "Vaardigheid",                  center: "Throat",       theme: "Talent door enthousiasme en herhaling.",                  notself: "Enthousiasme voorwenden zonder echte affiniteit." },
  17: { name: "Mening",                       center: "Ajna",         theme: "Mentale conceptie van de toekomst.",                      notself: "Mening verkondigen zonder data." },
  18: { name: "Verbetering",                  center: "Spleen",       theme: "Onvrede in dienst van correctie; herkennen wat niet werkt.", notself: "Kritiek leveren zonder oplossing." },
  19: { name: "Behoeftes",                    center: "Root",         theme: "Sensitiviteit voor de stam; voedsel, intimiteit, principes.", notself: "Behoeftes vermijden uit angst voor afwijzing." },
  20: { name: "Het Nu",                       center: "Throat",       theme: "Bewustzijn in het huidige moment.",                       notself: "Druk om iets te zeggen of doen i.p.v. te zijn." },
  21: { name: "Controle",                     center: "Heart/Ego",    theme: "Wil tot leiding over materiële zaken.",                   notself: "Controle uitoefenen waar het niet jouw domein is." },
  22: { name: "Openheid",                     center: "Solar Plexus", theme: "Sociale gratie via emotionele afstemming.",               notself: "Sociaal kunstmatig zijn ondanks de golf." },
  23: { name: "Versplintering",               center: "Throat",       theme: "Individuele inzichten omgezet in woorden.",               notself: "Spreken voor je gevraagd bent." },
  24: { name: "Rationaliseren",               center: "Ajna",         theme: "Mentale terugkeer naar dezelfde vraag tot er antwoord komt.", notself: "Vasthouden aan de vraag uit gewoonte." },
  25: { name: "Onschuld",                     center: "G",            theme: "Universele liefde; liefde zonder voorwaarden.",           notself: "Liefde voorwaardelijk maken." },
  26: { name: "De Egoïst",                    center: "Heart/Ego",    theme: "Verkoop en overdracht; informatie verkleinen voor het ego.", notself: "Onwaarheden vertellen voor materieel gewin." },
  27: { name: "Voeding",                      center: "Sacral",       theme: "Zorg voor anderen; verantwoordelijkheid voor de stam.",   notself: "Zorgen voor wie niet jouw verantwoordelijkheid is." },
  28: { name: "Het Spel van het Leven",       center: "Spleen",       theme: "Worsteling voor wat zin geeft.",                          notself: "Worstelen om de worsteling zelf, zonder doel." },
  29: { name: "Toezeggen",                    center: "Sacral",       theme: "Sacrale 'ja' tot diepe ervaring.",                        notself: "Ja zeggen vanuit verplichting i.p.v. respons." },
  30: { name: "Verlangen",                    center: "Solar Plexus", theme: "Fantasie over wat ervaring zou geven; emotionele honger.", notself: "Verlangen consumeren i.p.v. ervaren." },
  31: { name: "Invloed",                      center: "Throat",       theme: "Stem voor de groep; democratisch leiderschap.",           notself: "Spreken voor het collectief zonder mandaat." },
  32: { name: "Continuïteit",                 center: "Spleen",       theme: "Instinct voor wat duurzaam is; angst voor mislukking.",   notself: "Vasthouden aan wat al niet meer duurzaam is." },
  33: { name: "Privacy",                      center: "Throat",       theme: "Reflectie via terugtrekking; wijsheid uit ervaring.",     notself: "Verhalen vertellen zonder verteerd te zijn." },
  34: { name: "Macht",                        center: "Sacral",       theme: "Pure sacrale kracht voor werk dat oproept.",              notself: "Kracht inzetten zonder respons." },
  35: { name: "Verandering",                  center: "Throat",       theme: "Honger naar nieuwe ervaring; vooruitgang.",               notself: "Ervaring najagen om de leegte te vullen." },
  36: { name: "Crisis",                       center: "Solar Plexus", theme: "Emotionele intensiteit van nieuwe ervaring.",             notself: "Crisis aantrekken om iets te voelen." },
  37: { name: "Vriendschap",                  center: "Solar Plexus", theme: "Tribaal contract; vrede via afspraken.",                  notself: "Afspraken maken voor vrede zonder eerlijkheid." },
  38: { name: "De Strijder",                  center: "Root",         theme: "Strijd voor wat ertoe doet; betekenis via koppigheid.",   notself: "Strijden om de strijd zelf." },
  39: { name: "Provocatie",                   center: "Root",         theme: "Druk om emotionele waarheid uit te lokken.",              notself: "Provoceren zonder doel of doelwit." },
  40: { name: "Levering",                     center: "Heart/Ego",    theme: "Wil tot werk in ruil voor erkenning.",                    notself: "Werk leveren zonder erkenning vragen." },
  41: { name: "Verlangen",                    center: "Root",         theme: "Fantasie als motor voor nieuwe ervaring; start van cycli.", notself: "Fantasie nemen voor realiteit." },
  42: { name: "Groei",                        center: "Sacral",       theme: "Cycli afmaken; eindigen wat begonnen is.",                notself: "Eindigen voor de cyclus af is." },
  43: { name: "Inzicht",                      center: "Ajna",         theme: "Individuele kennis die anders is dan het collectief weet.", notself: "Inzicht delen voor het gevraagd is." },
  44: { name: "Waakzaamheid",                 center: "Spleen",       theme: "Instinct voor patronen uit het verleden in het nu.",      notself: "Verleden projecteren op heden zonder onderscheid." },
  45: { name: "De Verzamelaar",               center: "Throat",       theme: "Stem van de leider; bezit en distributie.",               notself: "Leiderschap claimen zonder de mensen erbij." },
  46: { name: "Liefde voor het Lichaam",      center: "G",            theme: "Toewijding aan het lichaam; succes door fysieke aanwezigheid.", notself: "Het lichaam verwaarlozen of veroordelen." },
  47: { name: "Realisatie",                   center: "Ajna",         theme: "Mentale verwarring die tot betekenis leidt.",             notself: "Verwarring laten verwarren zonder vertrouwen." },
  48: { name: "De Diepte",                    center: "Spleen",       theme: "Diepe intuïtieve kennis; gevoel van ontoereikendheid.",   notself: "Ontoereikendheid als feit aannemen." },
  49: { name: "Principes",                    center: "Solar Plexus", theme: "Principiële revolutie; voedsel en huwelijk als basis.",   notself: "Principes loslaten voor sociale vrede." },
  50: { name: "Waarden",                      center: "Spleen",       theme: "Zorg voor toekomstige generaties; wetten en waarden.",    notself: "Waarden opleggen zonder relevantie." },
  51: { name: "Schok",                        center: "Heart/Ego",    theme: "Moed door schok; het pad van de sjamaan.",                notself: "Schok zoeken om los te komen." },
  52: { name: "Stilte",                       center: "Root",         theme: "Stille concentratie; zit-energie voor focus.",            notself: "Onrust in stilte aanzien voor noodzaak tot bewegen." },
  53: { name: "Begin",                        center: "Root",         theme: "Druk om nieuwe cycli te starten.",                        notself: "Beginnen voor de juiste cyclus zich aandient." },
  54: { name: "Ambitie",                      center: "Root",         theme: "Drive om hogerop te komen; transformatie via inzet.",     notself: "Ambitie najagen voor erkenning, niet voor transformatie." },
  55: { name: "Overvloed",                    center: "Solar Plexus", theme: "Emotionele golf van geest; vrijheid van keuze.",          notself: "Stemming aanzien voor blijvend feit." },
  56: { name: "Verhalenverteller",            center: "Throat",       theme: "Stimulering via verhalen; ervaringen omgezet in betekenis.", notself: "Verhalen vertellen zonder ervaring." },
  57: { name: "Intuïtie",                     center: "Spleen",       theme: "Doordringend intuïtief gehoor; instinct voor de toekomst.", notself: "Intuïtie negeren omdat ze 'te zacht' lijkt." },
  58: { name: "Vitaliteit",                   center: "Root",         theme: "Vreugde door verbetering; energie om dingen beter te maken.", notself: "Onvrede zonder constructieve uitlaatklep." },
  59: { name: "Seksualiteit",                 center: "Sacral",       theme: "Intimiteit en voortplanting; doorbreken van barrières.",  notself: "Intimiteit vermijden of forceren." },
  60: { name: "Beperking",                    center: "Root",         theme: "Acceptatie van wat is; mutatie binnen grenzen.",          notself: "Tegen beperkingen vechten i.p.v. erbinnen muteren." },
  61: { name: "Innerlijke Waarheid",          center: "Head",         theme: "Mystieke druk om het onkenbare te kennen.",               notself: "Antwoorden zoeken voor vragen die geen antwoord hebben." },
  62: { name: "Details",                      center: "Throat",       theme: "Logische verbeelding via feiten en namen.",               notself: "Details verkondigen zonder de mening die ze ondersteunen." },
  63: { name: "Twijfel",                      center: "Head",         theme: "Mentale druk via twijfel; vragen die naar bewijs leiden.", notself: "Twijfel persoonlijk nemen i.p.v. als vraag." },
  64: { name: "Verwarring",                   center: "Head",         theme: "Mentale druk via beelden uit het verleden.",              notself: "De verwarring proberen op te lossen i.p.v. te ondergaan." },
};

export function describeGate(num) {
  const g = GATES[num];
  if (!g) return null;
  return `Poort ${num} — ${g.name} (centrum: ${g.center}). Thema: ${g.theme} | Not-Self: ${g.notself}`;
}

export function describeGates(gateNumbers) {
  return gateNumbers
    .map((n) => describeGate(n))
    .filter(Boolean)
    .join("\n");
}
