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
  ibiza:        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",

  // 'Inzichten' sectie — achtergrondafbeelding
  cosmos:       "/img-inzichten.jpg",

  // 'Onze oorsprong / Ibiza' sectie — achtergrondafbeelding
  origin:       "/img-ibiza-terrace.jpg",

  // Call-to-action sectie onderaan de homepage — achtergrondafbeelding
  cta:          "/img-fabric.jpg",

  // 'Waarom anders' blok — linker foto (precisie)
  w_precision:  "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&auto=format&fit=crop&q=80",

  // 'Waarom anders' blok — middelste foto (diepte)
  w_depth:      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80",

  // 'Waarom anders' blok — rechter foto (Ibiza, Es Vedrà)
  w_ibiza:      "/img-ibiza-moon.jpg",

  // Maandelijks abonnement sectie — achtergrondafbeelding
  sub_moon:     "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1200&auto=format&fit=crop&q=80",

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
  // RAPPORT KAARTJES — foto op de readings-overzichtspagina
  // Aanbevolen: 900×1125px (4:5 verhouding), portret
  // ════════════════════════════════════════════════════════════════════════════

  r_volledig:         "/img-volledig-hero.jpg",
  r_relatie_liefde:   "/img-relatie-liefde.jpg",
  r_relatie_business: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=900&auto=format&fit=crop&q=80",
  r_relatie_familie:  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=80",
  r_jaar:             "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=900&auto=format&fit=crop&q=80",
  r_kind:             "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80",
  r_loopbaan:         "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop&q=80",
  r_numerologie:      "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=900&auto=format&fit=crop&q=80",
  r_horoscoop:        "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=900&auto=format&fit=crop&q=80",
  r_maandelijks:      "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=900&auto=format&fit=crop&q=80",


  // ════════════════════════════════════════════════════════════════════════════
  // RAPPORT DETAIL PAGINA'S — grote foto halverwege de pagina
  // Dit is de full-bleed afbeelding die ONDER het inhoudsoverzicht staat,
  // vóór de testimonials en het bestelformulier
  // ════════════════════════════════════════════════════════════════════════════

  detail_volledig:         "/img-volledig-terras.jpg",
  detail_relatie_liefde:   "/img-relatie-liefde-new.jpg",
  detail_relatie_business: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",
  detail_relatie_familie:  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",
  detail_jaar:             "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",
  detail_kind:             "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",
  detail_loopbaan:         "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",
  detail_numerologie:      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",
  detail_horoscoop:        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",
  detail_maandelijks:      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",

};
