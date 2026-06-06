// ─────────────────────────────────────────────────────────────────────────────
// AFBEELDINGEN BEHEER — wijzig hier alle plaatjes van de site
//
// Lokale bestanden: sla op in /public/ en gebruik "/bestandsnaam.jpg"
// Externe URL:      gebruik de volledige https://... URL
//
// Aanbevolen formaten:
//   Hero (full-bleed):    1920×1080px of groter, landscape
//   Rapport kaartjes:     900×1125px (4:5 verhouding), portret
//   Sectie-achtergronden: 1600×900px of groter, landscape
// ─────────────────────────────────────────────────────────────────────────────

export const IMGS = {

  // ════════════════════════════════════════════════════════════════════════════
  // HOMEPAGE
  // ════════════════════════════════════════════════════════════════════════════

  // Grote hero bovenaan de homepage (full-bleed achtergrond)
  hero:         "/img-meditation.jpg",

  // 'Wat is Human Design' sectie — achtergrondafbeelding
  ibiza:        "/img-volledig-hero.jpg",

  // 'Inzichten' sectie — achtergrondafbeelding
  cosmos:       "/img-inzichten.jpg",

  // 'Onze oorsprong / Ibiza' sectie — achtergrondafbeelding
  origin:       "/img-ibiza-terrace.jpg",

  // Call-to-action sectie onderaan de homepage — achtergrondafbeelding
  cta:          "/img-fabric.jpg",

  // 'Waarom anders' blok — linker foto (precisie)
  w_precision:  "/img-precision.jpg",

  // 'Waarom anders' blok — middelste foto (diepte)
  w_depth:      "/img-table-book.jpg",

  // 'Waarom anders' blok — rechter foto (Ibiza, Es Vedrà)
  w_ibiza:      "/img-ibiza-moon.jpg",

  // Testimonials sectie — achtergrondafbeelding
  milkyway:     "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=2400&auto=format&fit=crop&q=80",

  // Rapport-cards sectie op de homepage — achtergrondafbeelding
  cosmos_rich:  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2400&auto=format&fit=crop&q=80",

  // 'Hoe het werkt' sectie — achtergrondafbeelding
  ibiza_white:  "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=2000&auto=format&fit=crop&q=80",


  // ════════════════════════════════════════════════════════════════════════════
  // READINGS OVERZICHT (facultyhd.com/readings)
  // De hero bovenaan gebruikt IMGS.cosmos (zie hierboven)
  // ════════════════════════════════════════════════════════════════════════════


  // ════════════════════════════════════════════════════════════════════════════
  // HUMAN DESIGN PAGINA (/human-design)
  // ════════════════════════════════════════════════════════════════════════════

  // Hero bovenaan de pagina (full-bleed, 100vh)
  wat_hero:        "/img-meditation.jpg",

  // Visuele pauze na de intro-tekst
  wat_cosmos:      "/img-inzichten.jpg",

  // Tussendoor-afbeelding bij het Human Design blok
  wat_hd:          "/img-volledig-hero.jpg",

  // Visuele pauze bij het Astrologie blok
  wat_astro:       "/img-elements-landscape.jpg",


  // ════════════════════════════════════════════════════════════════════════════
  // RAPPORT KAARTJES — foto op de readings-overzichtspagina
  // Aanbevolen: 900×1125px (4:5 verhouding), portret
  // ════════════════════════════════════════════════════════════════════════════

  r_volledig:         "/img-volledig-hero.jpg",
  r_relatie_liefde:   "/img-relatie-liefde.jpg",
  r_relatie_business: "/img-business-reading.jpg",
  r_relatie_familie:  "/img-family-hero.jpg",
  r_jaar:             "/img-year-reading.jpg",
  r_kind:             "/img-child-reading.jpg",
  r_loopbaan:         "/img_business-woman.jpg",
  r_numerologie:      "/img-numerology.jpg",
  r_horoscoop:        "/img-birth-reading.jpg",
  r_maandelijks:      "/img-moon-sub-hero.jpg",


  // ════════════════════════════════════════════════════════════════════════════
  // RAPPORT DETAIL PAGINA'S — grote foto halverwege de pagina
  // Dit is de full-bleed afbeelding die ONDER het inhoudsoverzicht staat,
  // vóór de testimonials en het bestelformulier
  // ════════════════════════════════════════════════════════════════════════════

  detail_volledig:         "/img-family-middle.jpg",
  detail_relatie_liefde:   "/img-relatie-liefde-new.jpg",
  detail_relatie_business: "/img-family-middle.jpg",
  detail_relatie_familie:  "/img-family-middle.jpg",
  detail_jaar:             "/img-fabric-4.jpg",
  detail_kind:             "/img-elements-landscape.jpg",
  detail_loopbaan:         "/img-fabric-4.jpg",
  detail_numerologie:      "/img-elements-landscape.jpg",
  detail_horoscoop:        "/img-elements-landscape.jpg",
  detail_maandelijks:      "/img-fabric-3.jpg",


  // ════════════════════════════════════════════════════════════════════════════
  // TYPE PAGINA'S — hero-afbeelding bovenaan elke type-pagina (/type/generator etc.)
  // Aanbevolen: 1920×1080px of groter, landscape
  // ════════════════════════════════════════════════════════════════════════════

  type_generator:          "/img-generator.jpg",
  type_mg:                 "/img-mg.jpg",
  type_projector:          "/img-year-reading.jpg",
  type_manifestor:         "/img-volledig-hero.jpg",
  type_reflector:          "/img-reflector.jpg",


  // ════════════════════════════════════════════════════════════════════════════
  // ARTIKEL AFBEELDINGEN (/journal)
  // Hero bovenaan het artikel + kaartje op de overzichtspagina
  // Aanbevolen: 1600×900px of groter, landscape
  //
  // NB: s1, s2, s3 worden overschreven door Supabase-artikelen met dezelfde
  // titel — hun afbeelding wordt beheerd via Supabase (tabel: articles).
  // ════════════════════════════════════════════════════════════════════════════

  // s4 — Kanalen: de energetische verbindingen in jouw chart
  article_s4:              "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&q=75",

  // s5 — Wat je levenspadgetal over jou zegt
  article_s5:              "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&auto=format&q=75",

  // s6 — De vijf Types in Human Design uitgelegd
  article_s6:              "/img-table-book.jpg",

  // s7 — Gedefinieerde en open centra
  article_s7:              "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=800&auto=format&q=75",

  // s8 — Het profiel
  article_s8:              "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&auto=format&q=75",

  // s9 — Het Inkarnatie Kruis
  article_s9:              "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&q=75",

  // s10 — Conditionering
  article_s10:             "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&q=75",

  // s11 — Circuits
  article_s11:             "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&q=75",

  // s12 — Uitdrukkingsgetal
  article_s12:             "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&auto=format&q=75",

  // s13 — De ascendant
  article_s13:             "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&auto=format&q=75",

  // s14 — Mastergetallen 11, 22 en 33
  article_s14:             "https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&auto=format&q=75",

  // s15 — Waarom Human Design geen persoonlijkheidstest is
  article_s15:             "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&q=75",

  // s16 — Planeten in Human Design (uniek — verschilt van s13)
  article_s16:             "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&q=75",

};
