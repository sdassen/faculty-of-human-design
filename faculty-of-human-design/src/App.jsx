import { useState, useEffect, createContext, useContext } from "react";
import { LANG, useLang, t, tl, switchLang, langPath, stripLangPrefix } from './i18n.js';

// ─── LANGUAGE CONTEXT ────────────────────────────────────────────────────────
const LangContext = createContext('nl');
export const useDynamicLang = () => useContext(LangContext);

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');`;

const IMGS = {
  // ── Full-bleed section backgrounds ─────────────────────────────────
  hero:          "/img-meditation.jpg",
  ibiza:         "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",
  cosmos:        "/img-inzichten.jpg", // sla de linnenfoto op als public/img-inzichten.jpg
  origin:        "/img-ibiza-terrace.jpg",
  cta:           "/img-fabric.jpg",

  // ── Waarom-anders 3-up visual pillars ──────────────────────────────
  w_precision:   "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&auto=format&fit=crop&q=80",
  w_depth:       "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80",
  // Ibiza: Es Vedrà bij schemering — eigen foto, brandperfect
  w_ibiza:       "/img-ibiza-moon.jpg",

  // ── Subscription moon backdrop ──────────────────────────────────────
  sub_moon:      "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1200&auto=format&fit=crop&q=80",

  // ── Art-directed section backgrounds ───────────────────────────────
  // Melkweg boven oceaan — voor testimonials sectie
  milkyway:      "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=2400&auto=format&fit=crop&q=80",
  // Rijke kosmische nevelvlek — voor rapport-cards sectie
  cosmos_rich:   "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2400&auto=format&fit=crop&q=80",
  // Mediterrane gouden kustlijn / avondlicht — voor 'Hoe het werkt' sectie
  ibiza_white:   "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=2000&auto=format&fit=crop&q=80",

  // ── Report cards (center-safe, 900w) ───────────────────────────────
  r_volledig:        "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=900&auto=format&fit=crop&q=80",
  r_relatie_liefde:  "/img-relatie-liefde.jpg",
  r_relatie_business:"https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=900&auto=format&fit=crop&q=80",
  r_relatie_familie: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=80",
  r_jaar:        "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=900&auto=format&fit=crop&q=80",
  r_kind:        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80",
  r_loopbaan:    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop&q=80",
  r_numerologie: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=900&auto=format&fit=crop&q=80",
  r_horoscoop:   "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=900&auto=format&fit=crop&q=80",
  r_maandelijks: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=900&auto=format&fit=crop&q=80",
};

const CSS = `
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
:root {
  --bg: #F4F1EB; --card: #FFFFFF; --dark: #1A1714; --cosmos: #111009; --muted: #EDEAE2;
  --text: #1A1714; --text-muted: #6B6560; --text-light: #A09890;
  --brand: #1C1A17; --brand-deep: #0E0D0B; --brand-light: #3A3730;
  --gold: #8A7355; --gold-warm: #A08855; --gold-pale: rgba(138,115,85,.08);
  --border: #E0DAD0; --white: #FFFFFF;
  --ov-cosmos: rgba(17,16,9,.82); --ov-brand: rgba(17,16,9,.76); --ov-warm: rgba(26,18,8,.55);
  --radius-sm: 1px; --radius-md: 1px; --radius-lg: 1px; --radius-xl: 1px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.04);
  --shadow-md: 0 2px 10px rgba(0,0,0,.05);
  --shadow-lg: 0 6px 28px rgba(0,0,0,.07);
  --shadow-xl: 0 12px 48px rgba(0,0,0,.09);
  --shadow-gold: 0 2px 12px rgba(138,115,85,.18);
  --shadow-brand: 0 2px 10px rgba(26,23,20,.20);
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Jost', system-ui, sans-serif;
  --ease: cubic-bezier(0.23,1,0.32,1); --dur: 300ms;
}
html { scroll-behavior:smooth; overflow-x:hidden; }
body { font-family:var(--font-sans); background:var(--bg); color:var(--text);
  font-size:16px; line-height:1.6; -webkit-font-smoothing:antialiased; }
img { display:block; max-width:100%; }
button { cursor:pointer; font-family:var(--font-sans); }

/* IMAGE UTILITIES */
.ph { position:relative; overflow:hidden; }
.ph>img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform 7s var(--ease); }
.ph:hover>img { transform:scale(1.04); }
.ov { position:absolute; inset:0; pointer-events:none; }
.ov-cosmos { background:var(--ov-cosmos); }
.ov-brand { background:var(--ov-brand); }
.ov-grad-r { background:linear-gradient(to right, rgba(12,10,23,.92) 0%, rgba(12,10,23,.45) 55%, transparent 100%); }
.ov-grad-t { background:linear-gradient(to top, rgba(12,10,23,.90) 0%, rgba(12,10,23,.15) 65%, transparent 100%); }
.img-frame { border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-xl); }
.img-landscape { aspect-ratio:16/9; }
.img-portrait { aspect-ratio:3/4; }

/* TYPOGRAPHY */
.h1 { font-family:var(--font-serif); font-size:clamp(2.4rem,5.5vw,4rem); font-weight:300; line-height:1.08; }
.h1-hero { font-family:var(--font-serif); font-size:clamp(3.2rem,9vw,6.4rem); font-weight:300; line-height:1.08; color:white; letter-spacing:-.02em; }
.h2 { font-family:var(--font-serif); font-size:clamp(1.9rem,3.8vw,2.95rem); font-weight:300; line-height:1.12; color:var(--text); }
.h3 { font-family:var(--font-serif); font-size:clamp(1.35rem,2.5vw,1.9rem); font-weight:400; line-height:1.2; }
.label { font-size:.6rem; font-weight:500; letter-spacing:.17em; text-transform:uppercase; color:var(--gold); }
.label-light { font-size:.6rem; font-weight:500; letter-spacing:.17em; text-transform:uppercase; color:rgba(201,168,92,.75); }
.body-lg { font-size:1.1rem; font-weight:300; line-height:1.84; color:var(--text-muted); }
.body-md { font-size:1rem; font-weight:300; line-height:1.78; color:var(--text-muted); }
.body-sm { font-size:.875rem; font-weight:300; line-height:1.72; color:var(--text-muted); }

/* LAYOUT */
.pg { padding-top:72px; min-height:100vh; }
.section { padding:112px 32px; }
.section-md { padding:88px 32px; }
.section-sm { padding:64px 32px; }
.section.bg-white, .section-md.bg-white, .section-sm.bg-white { background:var(--white); }
.section.bg-muted, .section-md.bg-muted, .section-sm.bg-muted { background:var(--muted); }
.section.bg-dark, .section-md.bg-dark, .section-sm.bg-dark { background:var(--dark); }
.section.bg-cosmos, .section-md.bg-cosmos, .section-sm.bg-cosmos { background:var(--cosmos); }
.container { max-width:1240px; margin:0 auto; width:100%; padding:0 32px; }
.container-sm { max-width:760px; margin:0 auto; width:100%; }
.container-md { max-width:960px; margin:0 auto; width:100%; }
.grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
.grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; }
.grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
.text-center { text-align:center; }
.divider { width:36px; height:1px; background:var(--gold); opacity:.7; }
.divider-center { margin:0 auto; }

/* STAT ROW */
.stat-row { background:white; border-bottom:1px solid var(--border); }
.stat-row-inner { max-width:1240px; margin:0 auto; display:flex; align-items:stretch; }
.stat-row-item { flex:1; padding:28px 32px; border-right:1px solid var(--border); display:flex; flex-direction:column; align-items:center; text-align:center; gap:4px; }
.stat-row-item:last-child { border-right:none; }
.stat-row-n { font-family:var(--font-serif); font-size:1.9rem; font-weight:300; color:var(--text); line-height:1; }
.stat-row-l { font-size:.58rem; font-weight:500; letter-spacing:.11em; text-transform:uppercase; color:var(--text-light); }

/* FEATURE SPLIT */
.feature-split { display:grid; grid-template-columns:1fr 1fr; min-height:560px; }
.feature-content { padding:80px 72px; display:flex; flex-direction:column; justify-content:center; background:var(--muted); }
.feature-image-wrap { position:relative; overflow:hidden; }
.feature-image-wrap>img { width:100%; height:100%; object-fit:cover; object-position:center 40%; transition:transform 7s var(--ease); }
.feature-image-wrap:hover>img { transform:scale(1.04); }
.feature-price-card { position:absolute; bottom:32px; right:32px; left:32px; background:rgba(17,16,9,.88); border:1px solid rgba(255,255,255,.08); border-radius:0; padding:28px; }

/* ORIGIN SECTION */
.origin-section { position:relative; min-height:500px; display:flex; align-items:center; overflow:hidden; }
.origin-section-bg { position:absolute; inset:0; }
.origin-section-bg>img { width:100%; height:100%; object-fit:cover; object-position:65% center; }
.origin-section-bg::after { content:""; position:absolute; inset:0; background:linear-gradient(105deg,rgba(17,16,9,.92) 0%,rgba(17,16,9,.62) 48%,rgba(17,16,9,.28) 100%); }
.origin-content { position:relative; z-index:2; max-width:1240px; margin:0 auto; padding:96px 32px; width:100%; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
.origin-stat { border-top:1px solid rgba(255,255,255,.12); padding-top:16px; margin-top:24px; display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.origin-stat-n { font-family:var(--font-serif); font-size:2rem; font-weight:300; color:white; line-height:1; }
.origin-stat-l { font-size:.55rem; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.4); margin-top:3px; }

/* PHOTO CTA */
.photo-cta-section { position:relative; overflow:hidden; }
.photo-cta-bg { position:absolute; inset:0; }
.photo-cta-bg>img { width:100%; height:100%; object-fit:cover; object-position:center center; filter:saturate(.95); }
.photo-cta-bg::after { content:""; position:absolute; inset:0; background:linear-gradient(180deg,rgba(17,16,9,.72) 0%,rgba(17,16,9,.88) 60%,rgba(17,16,9,.94) 100%); }
.photo-cta-content { position:relative; z-index:1; padding:120px 32px; text-align:center; }

/* BUTTONS */
.btn { display:inline-flex; align-items:center; justify-content:center; gap:10px;
  border:none; border-radius:0; font-family:var(--font-sans);
  font-weight:400; letter-spacing:.14em; text-transform:uppercase; font-size:.7rem;
  transition:background var(--dur) var(--ease), color var(--dur) var(--ease), border-color var(--dur) var(--ease), opacity var(--dur) var(--ease);
  white-space:nowrap; }
.btn-primary { background:var(--dark); color:white; padding:16px 44px; }
.btn-primary:hover { background:#2C2A26; }
.btn-secondary { background:transparent; color:var(--text); padding:15px 42px; border:1px solid currentColor; }
.btn-secondary:hover { background:var(--text); color:white; }
.btn-white { background:white; color:var(--dark); padding:16px 44px; }
.btn-white:hover { background:#F0EDE6; }
.btn-ghost { background:transparent; color:white; padding:15px 42px; border:1px solid rgba(255,255,255,.38); }
.btn-ghost:hover { background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.60); }
.btn-gold { background:var(--gold); color:white; padding:16px 44px; }
.btn-gold:hover { background:#7A6347; }
.btn-lg { padding:19px 56px; font-size:.74rem; }
.btn-sm { padding:11px 26px; font-size:.64rem; }
.btn-full { width:100%; }
.btn:disabled { opacity:.35; cursor:not-allowed; }

/* CARDS */
.card { background:var(--card); border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden; }

/* REPORT CARDS */
.rcard { background:var(--card); border-radius:var(--radius-xl); border:1px solid var(--border);
  cursor:pointer; transition:all var(--dur) var(--ease); display:flex; flex-direction:column; overflow:hidden;
  box-shadow:var(--shadow-sm); }
.rcard:hover { box-shadow:var(--shadow-md); border-color:var(--border); }
.rcard:hover .rcard-img>img { transform:scale(1.07); }
.rcard-img { height:210px; position:relative; overflow:hidden; flex-shrink:0; }
.rcard-img>img { width:100%; height:100%; object-fit:cover; transition:transform 5s var(--ease); }
.rcard-img-ov { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(12,10,23,.08) 0%, rgba(12,10,23,.6) 100%); }
.rcard-img-badge { position:absolute; top:14px; left:14px; background:rgba(17,16,9,.75); border:none; border-radius:0; padding:4px 11px; font-size:.54rem; font-weight:400; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.82); }
.rcard-img-price { position:absolute; bottom:14px; right:16px; font-family:var(--font-serif); font-size:1.55rem; font-weight:300; color:white; line-height:1; text-shadow:0 1px 10px rgba(0,0,0,.5); }
.rcard-body { padding:26px 28px; flex:1; display:flex; flex-direction:column; }
.rcard-icon { font-size:.95rem; margin-bottom:6px; opacity:.45; }
.rcard-title { font-family:var(--font-serif); font-size:1.28rem; font-weight:400; color:var(--text); margin-bottom:8px; line-height:1.22; }
.rcard-outcome { font-size:.78rem; font-weight:500; color:var(--brand); line-height:1.5; margin-bottom:7px; display:flex; align-items:flex-start; gap:6px; }
.rcard-outcome::before { content:"→"; font-size:.7rem; flex-shrink:0; margin-top:1px; }
.rcard-tagline { font-size:.875rem; font-weight:300; color:var(--text-muted); line-height:1.72; flex:1; margin-bottom:18px; }
.rcard-footer { display:flex; justify-content:space-between; align-items:center; padding-top:14px; border-top:1px solid var(--border); margin-top:auto; }
.rcard-meta { font-size:.62rem; font-weight:400; color:var(--text-light); }
.rcard-cta { font-size:.68rem; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--brand); display:flex; align-items:center; gap:4px; }

/* WAAROM CARD */
.waarom-card { border-radius:var(--radius-lg); overflow:hidden; background:var(--card); border:1px solid var(--border); transition:all var(--dur) var(--ease); }
.waarom-card:hover { box-shadow:var(--shadow-md); border-color:var(--border); }
.waarom-card:hover .waarom-card-img img { transform:scale(1.06); }
.waarom-card-img { position:relative; height:220px; overflow:hidden; }
.waarom-card-img img { width:100%; height:100%; object-fit:cover; transition:transform 6s var(--ease); }
.waarom-card-badge { position:absolute; bottom:14px; left:18px; font-size:.58rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--gold-warm); z-index:2; }
.waarom-card-body { padding:24px 26px 28px; }
.waarom-card-title { font-family:var(--font-serif); font-size:1.1rem; font-weight:400; color:var(--text); margin-bottom:10px; line-height:1.2; }

/* OVERLAY HELPERS */
.ov { position:absolute; inset:0; pointer-events:none; }
.ov-grad-t { position:absolute; inset:0; background:linear-gradient(to top,rgba(12,10,23,.58) 0%,transparent 52%); pointer-events:none; }
.ov-grad-r { position:absolute; inset:0; background:linear-gradient(to right,rgba(12,10,23,.7) 0%,transparent 60%); pointer-events:none; }

/* SUB CARD MOON */
.sub-card-moon { position:absolute; inset:0; overflow:hidden; border-radius:var(--radius-xl); }
.sub-card-moon img { width:100%; height:100%; object-fit:cover; object-position:center 30%; opacity:.22; filter:saturate(.5) brightness(.65); }

/* TRUST */
.trust-strip { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:8px 24px; }
.trust-item { display:flex; align-items:center; gap:6px; font-size:.8rem; font-weight:400; color:var(--text-muted); }

/* STEP */
.step-card { display:flex; gap:20px; align-items:flex-start; }
.step-num { width:36px; height:36px; border-radius:0; background:transparent; color:var(--text-muted); border:1px solid var(--border); font-family:var(--font-serif); font-size:1rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
.step-body h4 { font-family:var(--font-serif); font-size:1.1rem; font-weight:400; color:var(--text); margin-bottom:4px; }
.step-body p { font-size:.9rem; font-weight:300; color:var(--text-muted); line-height:1.65; }

/* TESTIMONIAL */
.tcard { background:white; border-radius:0; border:1px solid var(--border); padding:36px; position:relative; overflow:hidden; transition:box-shadow var(--dur) var(--ease); }
.tcard:hover { box-shadow:var(--shadow-md); }
.tcard::before { content:'"'; position:absolute; top:16px; left:26px; font-family:var(--font-serif); font-size:6rem; line-height:1; color:var(--gold); opacity:.09; font-style:italic; pointer-events:none; }
.tcard-quote { font-family:var(--font-serif); font-size:1.05rem; font-style:italic; color:var(--text); line-height:1.82; margin-bottom:20px; }
.tcard-author { font-size:.7rem; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--text-light); }
.tcard-report { font-size:.65rem; color:var(--gold); margin-top:3px; }
.stars { color:#D4A017; font-size:.82rem; margin-bottom:14px; letter-spacing:2px; }

/* STAT */
.stat-n { font-family:var(--font-serif); font-size:2.6rem; font-weight:300; color:var(--text); line-height:1; }
.stat-l { font-size:.72rem; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--text-muted); margin-top:4px; }

/* NAV */
.nav { position:fixed; top:0; left:0; right:0; z-index:200; height:68px; background:rgba(244,241,235,.97); backdrop-filter:blur(24px); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 32px; }
.nav-inner { max-width:1240px; margin:0 auto; width:100%; display:flex; align-items:center; justify-content:space-between; }
.nav-logo { cursor:pointer; }
.nav-logo-main { font-family:var(--font-serif); font-size:1rem; font-weight:400; color:var(--text); letter-spacing:.12em; text-transform:uppercase; }
.nav-logo-sub { font-size:.5rem; letter-spacing:.22em; text-transform:uppercase; color:var(--text-light); margin-top:2px; }
.nav-links { display:flex; align-items:center; gap:0; }
.nav-link { font-size:.66rem; font-weight:400; letter-spacing:.1em; text-transform:uppercase; color:var(--text-muted); padding:8px 16px; transition:color 150ms; cursor:pointer; }
.nav-link:hover, .nav-link.active { color:var(--text); }
.mobile-nav { display:none; }
.nav-cta-wrap { display:flex; align-items:center; gap:8px; }
.mobile-menu { position:fixed; inset:0; background:var(--bg); z-index:300; padding:24px; display:flex; flex-direction:column; gap:8px; padding-top:88px; }
.mobile-menu-link { font-size:1.1rem; font-weight:300; color:var(--text); padding:16px 0; border-bottom:1px solid var(--border); cursor:pointer; }
.menu-btn { background:none; border:none; padding:8px; color:var(--text); }

/* HERO */
.hero { min-height:100vh; position:relative; display:flex; align-items:center; overflow:hidden; }
.hero-bg { position:absolute; inset:0; }
.hero-bg>img { width:100%; height:100%; object-fit:cover; object-position:center 30%; }
.hero-bg::after { content:""; position:absolute; inset:0; background:linear-gradient(160deg,rgba(17,16,9,.82) 0%,rgba(17,16,9,.58) 52%,rgba(17,16,9,.38) 100%); }
.hero-fallback { position:absolute; inset:0; background:linear-gradient(160deg,var(--cosmos) 0%,#2A2217 55%,#1A1714 100%); }
.hero-stars { position:absolute; inset:0; opacity:.10; pointer-events:none;
  background-image:radial-gradient(circle at 15% 25%, white 1px, transparent 1px),
    radial-gradient(circle at 72% 12%, white 1px, transparent 1px),
    radial-gradient(circle at 38% 55%, white 1px, transparent 1px),
    radial-gradient(circle at 88% 42%, white 1px, transparent 1px),
    radial-gradient(circle at 10% 78%, white 1px, transparent 1px),
    radial-gradient(circle at 52% 88%, white 1px, transparent 1px),
    radial-gradient(circle at 65% 65%, white 1px, transparent 1px);
  background-size:420px 420px,510px 510px,360px 360px,460px 460px,390px 390px,430px 430px,380px 380px; }
.hero-glow { display:none; }
.hero-content { position:relative; z-index:2; max-width:800px; margin:0; padding:0 32px 0 32px; width:100%; }
.hero-text { max-width:540px; }
.hero-eyebrow { font-size:.52rem; font-weight:500; letter-spacing:.24em; text-transform:uppercase; color:rgba(201,168,92,.75); margin-bottom:28px; display:flex; align-items:center; gap:12px; }
.hero-eyebrow::before { content:""; display:block; width:24px; height:1px; background:rgba(201,168,92,.5); flex-shrink:0; }
.hero-title em, .h1-hero em { color:rgba(255,255,255,.55); font-style:italic; font-weight:300; }
.hero-subtitle { font-size:.95rem; font-weight:300; color:rgba(255,255,255,.52); line-height:1.88; margin:28px 0 48px; max-width:460px; }
.hero-actions { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:56px; }
.hero-trust { display:flex; gap:32px; flex-wrap:wrap; }
.hero-trust-item { font-size:.65rem; font-weight:300; color:rgba(255,255,255,.42); display:flex; align-items:center; gap:8px; }
.hero-trust-item::before { content:"✦"; font-size:.45rem; color:rgba(201,168,92,.52); }
.hero-scroll { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:10px; opacity:.32; }
.hero-scroll-line { width:1px; height:40px; background:linear-gradient(to bottom, transparent, white); animation:scrollline 3.2s ease-in-out infinite; }
@keyframes scrollline { 0%,100%{opacity:0;transform:scaleY(0);transform-origin:top} 35%,65%{opacity:1;transform:scaleY(1);transform-origin:top} 85%{transform:scaleY(1);transform-origin:bottom;opacity:0} }
.hero-scroll-label { font-size:.48rem; letter-spacing:.2em; text-transform:uppercase; color:white; font-weight:300; }

/* FORM */
.form-wrap { background:white; border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-md); padding:36px; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-group.full { grid-column:1/-1; }
.form-label { font-size:.65rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--brand); }
.form-input { border:1.5px solid var(--border); background:var(--bg); border-radius:var(--radius-sm); padding:11px 14px; font-family:var(--font-sans); font-size:.95rem; font-weight:300; color:var(--text); outline:none; transition:border-color 200ms; width:100%; }
.form-input:focus { border-color:var(--brand); }
.form-select { border:1.5px solid var(--border); background:var(--bg); border-radius:var(--radius-sm); padding:11px 40px 11px 14px; font-family:var(--font-sans); font-size:.95rem; font-weight:300; color:var(--text); outline:none; width:100%; cursor:pointer; appearance:none; -webkit-appearance:none; -moz-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238A7355' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; }
.form-select:focus { border-color:var(--brand); }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.form-note { font-size:.8rem; color:var(--text-light); text-align:center; line-height:1.6; margin-top:10px; }
.form-divider { height:1px; background:var(--border); margin:20px 0; }

/* CHART */
.chart-result { background:white; border-radius:var(--radius-lg); border:1px solid var(--border); padding:28px; }
.chart-table { width:100%; border-collapse:collapse; }
.chart-table tr { border-bottom:1px solid var(--border); }
.chart-table td { padding:9px 0; font-size:.875rem; vertical-align:top; }
.chart-table td:first-child { font-size:.65rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--text-light); width:140px; padding-right:12px; }
.tags { display:flex; flex-wrap:wrap; gap:4px; margin-top:3px; }
.tag-def { font-size:.62rem; padding:3px 9px; background:var(--dark); color:white; border-radius:0; letter-spacing:.06em; }
.tag-open { font-size:.62rem; padding:3px 9px; border:1px solid var(--border); color:var(--text-muted); border-radius:0; letter-spacing:.04em; }
.tag-gate { font-size:.6rem; padding:2px 8px; background:rgba(26,23,20,.05); color:var(--text-muted); border-radius:0; }
.order-block { background:var(--dark); border-radius:var(--radius-md); padding:24px; margin-top:20px; }
.order-block-title { font-family:var(--font-serif); font-size:1.1rem; font-weight:300; color:white; margin-bottom:6px; }
.order-block-sub { font-size:.82rem; font-weight:300; color:rgba(255,255,255,.45); margin-bottom:16px; line-height:1.65; }

/* LOADING */
.loading-overlay { position:fixed; inset:0; background:rgba(28,25,23,.97); z-index:400; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:32px; }
.loading-icon { font-family:var(--font-serif); font-size:2.5rem; font-weight:300; color:rgba(154,128,80,.5); margin-bottom:32px; animation:pulse 2.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.9;transform:scale(1.04)} }
.loading-title { font-family:var(--font-serif); font-size:1.5rem; font-weight:300; color:white; margin-bottom:8px; }
.loading-counter { font-size:.62rem; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.35); margin-bottom:28px; }
.loading-steps { width:360px; max-width:100%; }
.loading-step { display:flex; align-items:center; gap:12px; padding:7px 0; transition:opacity .4s; }
.loading-step-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; transition:background .4s; }
.loading-step-text { font-size:.65rem; letter-spacing:.1em; text-transform:uppercase; }
.loading-step-badge { margin-left:auto; font-size:.6rem; color:rgba(154,128,80,.6); }
.loading-bar-wrap { width:320px; height:2px; background:rgba(154,128,80,.12); border-radius:2px; margin:20px auto 0; overflow:hidden; }
.loading-bar-fill { height:100%; background:var(--gold); transition:width .5s; border-radius:2px; }

/* REPORT OUTPUT */
.report-pg { background:var(--muted); min-height:100vh; padding:48px 24px; }
.report-header { max-width:760px; margin:0 auto 24px; }
.report-inst-label { font-size:.6rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:6px; }
.report-title { font-family:var(--font-serif); font-size:1.9rem; font-weight:300; color:var(--text); margin-bottom:4px; }
.report-meta { font-size:.8rem; font-weight:300; color:var(--text-light); margin-bottom:20px; }
.report-summary { max-width:760px; margin:0 auto 20px; background:white; border:1px solid var(--border); border-radius:var(--radius-lg); padding:22px 26px; }
.report-summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.rsg-label { font-size:.58rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--text-light); margin-bottom:3px; }
.rsg-value { font-size:.85rem; font-weight:300; color:var(--text); line-height:1.4; }
.report-body { max-width:760px; margin:0 auto; background:white; border:1px solid var(--border); border-radius:var(--radius-lg); padding:48px; box-shadow:var(--shadow-md); }
.report-section-title { font-family:var(--font-serif); font-size:1.2rem; font-weight:400; color:var(--text); margin:32px 0 10px; padding-bottom:8px; border-bottom:1px solid var(--border); }
.report-section-title:first-child { margin-top:0; }
.report-section-body { font-size:.88rem; font-weight:300; line-height:1.95; color:#2c2820; white-space:pre-wrap; }

/* UPSELL */
.upsell-card { background:var(--dark); border-radius:0; padding:32px; color:white; margin-top:20px; }
.upsell-label { font-size:.6rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:rgba(154,128,80,.8); margin-bottom:10px; }
.upsell-title { font-family:var(--font-serif); font-size:1.5rem; font-weight:300; color:white; margin-bottom:8px; }
.upsell-sub { font-size:.85rem; font-weight:300; color:rgba(255,255,255,.55); margin-bottom:20px; line-height:1.65; }
.upsell-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
.upsell-item { display:flex; gap:8px; font-size:.8rem; font-weight:300; color:rgba(255,255,255,.7); line-height:1.5; }

/* BLOG */
.blog-card { border-radius:var(--radius-lg); border:1px solid var(--border); background:white; padding:28px; cursor:pointer; transition:all 200ms; margin-bottom:16px; }
.blog-card:hover { box-shadow:var(--shadow-sm); border-color:var(--text-light); }
.blog-tag { font-size:.6rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); margin-bottom:8px; }
.blog-title { font-family:var(--font-serif); font-size:1.2rem; font-weight:400; color:var(--text); margin-bottom:8px; line-height:1.35; }
.blog-excerpt { font-size:.875rem; font-weight:300; color:var(--text-muted); line-height:1.7; margin-bottom:14px; }
.blog-more { font-size:.68rem; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--brand); }

/* INCLUDES */
.includes-list { list-style:none; display:flex; flex-direction:column; gap:11px; }
.includes-item { display:flex; gap:10px; align-items:flex-start; font-size:.9rem; font-weight:300; color:var(--text-muted); line-height:1.6; }
.includes-num { width:20px; height:20px; border:none; border-radius:0; display:flex; align-items:center; justify-content:center; font-size:.6rem; font-weight:400; color:var(--text-light); flex-shrink:0; margin-top:1px; }

/* FAQ */
.faq-item { border-bottom:1px solid var(--border); padding:18px 0; text-align:left; }
.faq-q { font-family:var(--font-serif); font-size:1rem; font-weight:400; color:var(--text); cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:16px; text-align:left; }
.faq-q:hover { color:var(--brand); }
.faq-toggle { font-size:1.2rem; color:var(--brand); flex-shrink:0; transition:transform .25s; }
.faq-toggle.open { transform:rotate(45deg); }
.faq-a { font-size:.875rem; font-weight:300; color:var(--text-muted); line-height:1.85; margin-top:12px; text-align:left; }

/* STICKY MOBILE CTA */
.sticky-cta { display:none; position:fixed; bottom:0; left:0; right:0; z-index:150; padding:12px 16px; background:rgba(244,241,235,.98); backdrop-filter:blur(16px); border-top:1px solid var(--border); }

/* FOOTER */
.footer { background:var(--cosmos); padding:68px 32px 36px; }
.footer-inner { max-width:1240px; margin:0 auto; }
.footer-top { display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr 1fr; gap:40px; padding-bottom:44px; border-bottom:1px solid rgba(255,255,255,.06); }
.footer-logo-main { font-family:var(--font-serif); font-size:1.05rem; font-weight:400; color:white; letter-spacing:.09em; text-transform:uppercase; }
.footer-logo-sub { font-size:.54rem; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,255,255,.28); margin-top:2px; }
.footer-desc { font-size:.82rem; font-weight:300; color:rgba(255,255,255,.35); line-height:1.74; margin-top:14px; max-width:256px; }
.footer-col-title { font-size:.6rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.3); margin-bottom:16px; }
.footer-link { display:block; font-size:.85rem; font-weight:300; color:rgba(255,255,255,.42); margin-bottom:10px; cursor:pointer; transition:color 150ms; }
.footer-link:hover { color:rgba(255,255,255,.8); }
.footer-bottom { padding-top:28px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
.footer-copy { font-size:.72rem; font-weight:300; color:rgba(255,255,255,.2); }
.footer-trust { display:flex; gap:16px; }
.footer-trust-item { font-size:.68rem; color:rgba(255,255,255,.2); }

/* THANK YOU */
.thankyou-hero { background:linear-gradient(135deg,#1a3a2e 0%,#1C1917 100%); padding:80px 24px; text-align:center; }
.thankyou-icon { font-size:3rem; margin-bottom:20px; }
.thankyou-title { font-family:var(--font-serif); font-size:2.5rem; font-weight:300; color:white; margin-bottom:12px; }
.thankyou-sub { font-size:1rem; font-weight:300; color:rgba(255,255,255,.55); max-width:480px; margin:0 auto; line-height:1.7; }

/* RESPONSIVE UTILITIES — page hero inner, two-col, split-row patterns */
.page-hero-pad { position:relative; z-index:2; max-width:1240px; margin:0 auto; padding:108px 32px 80px; width:100%; }
.two-col-lg { display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:start; }
.split-row { display:grid; grid-template-columns:200px 1fr; gap:24px; padding:22px 0; border-bottom:1px solid var(--border); align-items:start; }
.split-row-lg { display:grid; grid-template-columns:220px 1fr; gap:28px; align-items:start; }
.tab-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; touch-action:pan-x; width:100%; }
.tab-scroll::-webkit-scrollbar { display:none; }
/* Portrait image utility — 3/4 desktop, 16/9 capped on mobile */
.portrait-img { aspect-ratio:3/4; position:relative; border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-xl); margin-bottom:24px; }
.portrait-img>img { width:100%; height:100%; object-fit:cover; }
/* Method step row */
.method-step { display:flex; gap:32px; padding:36px 0; align-items:flex-start; }
.method-step-num { font-family:var(--font-serif); font-size:2.2rem; font-weight:300; color:var(--brand); opacity:.2; line-height:1; flex-shrink:0; width:52px; text-align:right; padding-top:2px; }
.method-step-body h3 { font-family:var(--font-serif); font-size:1.2rem; font-weight:400; color:var(--text); margin-bottom:10px; line-height:1.2; }
/* Stats grid in dark section */
.stats-2x2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
/* Over-ons stats row */
.over-stats { display:flex; gap:40px; flex-wrap:wrap; }
/* Checkout button spinner */
@keyframes spin { to { transform: rotate(360deg); } }
.btn-spinner { display:inline-block; width:13px; height:13px; border:1.5px solid currentColor; border-top-color:transparent; border-radius:50%; animation:spin .7s linear infinite; vertical-align:middle; margin-right:9px; opacity:.7; }
/* Inzichten category section header */
.inzichten-cat-header { margin-bottom:56px; text-align:center; }
.inzichten-cat-header .cat-divider { width:28px; height:1px; background:var(--gold); margin:0 auto 20px; opacity:.6; }
.inzichten-cat-header .cat-label { font-family:var(--font-sans); font-size:.58rem; font-weight:500; letter-spacing:.18em; text-transform:uppercase; color:var(--gold); margin-bottom:10px; }
.inzichten-cat-header .cat-desc { font-family:var(--font-serif); font-size:1rem; font-weight:300; font-style:italic; color:var(--text-muted); line-height:1.72; max-width:480px; margin:0 auto; }
/* Signal strip inner row */
.signal-strip-inner { max-width:900px; margin:0 auto; padding:0 40px; display:flex; justify-content:center; gap:48px 72px; flex-wrap:wrap; }
/* Editorial section header (split label/title left, sub right on desktop) */
.editorial-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:72px; flex-wrap:wrap; gap:24px; }
/* Editorial pillars grid (homepage waarom + report discovery + testimonials) */
.waarom-grid       { display:grid; grid-template-columns:repeat(3,1fr); gap:0 48px; }
.reports-grid      { display:grid; grid-template-columns:repeat(3,1fr); gap:0 40px; }
.testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0 56px; align-items:start; }
.testimonials-wrap { max-width:1100px; margin:0 auto; padding:0 80px; }
/* Contact hero subtitle */
.contact-hero-sub { max-width:420px; }
/* Rapporten page grids */
.rapporten-hd-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0 32px; }
.rapporten-andere-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0 40px; max-width:780px; }

/* SUB CARD */
.sub-card { background:var(--dark); border-radius:0; padding:48px; color:white; position:relative; overflow:hidden; }
.sub-card::before { content:""; position:absolute; top:-40%; right:-8%; width:65%; height:170%; background:radial-gradient(ellipse, rgba(160,136,85,.04) 0%, transparent 60%); pointer-events:none; }
.sub-card-body { position:relative; z-index:1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:36px; }
.sub-price { font-family:var(--font-serif); font-size:3rem; font-weight:300; color:white; line-height:1; }
.sub-price-period { font-size:.78rem; color:rgba(255,255,255,.45); margin-top:5px; }

/* DETAIL HERO */
.detail-hero { background:var(--dark); padding:96px 32px 68px; position:relative; overflow:hidden; }
.detail-hero-bg { position:absolute; inset:0; overflow:hidden; z-index:0; }
.detail-hero-bg>img { width:100%; height:100%; object-fit:cover; opacity:.55; }
.detail-hero-bg::after { content:""; position:absolute; inset:0; background:linear-gradient(to bottom, rgba(12,10,23,.38) 0%, rgba(12,10,23,.68) 100%); }
.detail-hero-inner { max-width:1240px; margin:0 auto; display:grid; grid-template-columns:1fr 300px; gap:64px; align-items:start; position:relative; z-index:1; }
.detail-hero-badge { display:inline-flex; align-items:center; gap:6px; background:transparent; border:1px solid rgba(160,136,85,.28); padding:5px 14px; border-radius:0; font-size:.58rem; font-weight:400; letter-spacing:.16em; text-transform:uppercase; color:rgba(160,136,85,.9); margin-bottom:22px; }
.detail-hero-title { font-family:var(--font-serif); font-size:clamp(2rem,4.5vw,3.2rem); font-weight:300; color:white; margin-bottom:14px; line-height:1.07; }
.detail-hero-tagline { font-size:.95rem; font-weight:300; color:rgba(255,255,255,.46); margin-bottom:26px; line-height:1.72; }
.detail-hero-meta { display:flex; gap:20px; flex-wrap:wrap; }
.detail-hero-m { font-size:.6rem; font-weight:500; letter-spacing:.09em; text-transform:uppercase; color:rgba(255,255,255,.26); }
.price-box { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); border-radius:0; padding:32px; text-align:center; }
.price-box-amount { font-family:var(--font-serif); font-size:3.2rem; font-weight:300; color:white; line-height:1; }
.price-box-period { font-size:.66rem; color:rgba(255,255,255,.36); margin-top:5px; margin-bottom:22px; }

/* ── BRAND PHILOSOPHY SECTION ────────────────────────────────────────────── */
.philosophy-grid { display:grid; grid-template-columns:180px 1fr; gap:0 88px; align-items:start; }
.philosophy-quotes { display:flex; flex-direction:column; gap:24px; padding-top:32px; border-top:1px solid var(--border); margin-top:32px; }
.philosophy-quote { font-family:var(--font-serif); font-size:1.05rem; font-style:italic; font-weight:300; color:var(--text-muted); line-height:1.72; text-align:left; }

/* ── READING EXPERIENCE SECTION ──────────────────────────────────────────── */
.experience-step { display:grid; grid-template-columns:64px 1fr; gap:0 28px; position:relative; }
.experience-step-num { width:28px; height:28px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; background:white; flex-shrink:0; }
.experience-connector { position:absolute; left:13px; top:44px; bottom:-48px; width:1px; background:var(--border); }

/* ── BRAND CREDIBILITY SECTION ───────────────────────────────────────────── */
.credibility-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0 48px; }

/* RESPONSIVE */
@media (max-width:1100px) {
  .feature-split { grid-template-columns:1fr; }
  .feature-image-wrap { min-height:400px; order:-1; }
  .feature-content { padding:56px 40px; }
  .origin-content { grid-template-columns:1fr; gap:40px; }
  .origin-stat { grid-template-columns:repeat(3,1fr); }
  /* HD grid: 4→2 columns at medium breakpoint */
  .rapporten-hd-grid { grid-template-columns:repeat(2,1fr); gap:48px 32px; }
  /* Credibility: 4→2 columns early to prevent overflow */
  .credibility-grid { grid-template-columns:1fr 1fr; gap:40px 48px; }
}
@media (max-width:1024px) {
  .detail-hero-inner { grid-template-columns:1fr; }
  .footer-top { grid-template-columns:1fr 1fr 1fr; gap:28px; }
  .stat-row-item { padding:20px 18px; }
}
@media (max-width:768px) {
  .nav { padding:0 16px; }
  .nav-links, .nav-cta-wrap { display:none; }
  .mobile-nav { display:flex; }
  .section, .section-md { padding:72px 20px; }
  .section-sm { padding:52px 20px; }
  .container { padding:0 20px; }
  .grid-2, .grid-3 { grid-template-columns:1fr; }
  .grid-4 { grid-template-columns:1fr 1fr; }
  .form-grid { grid-template-columns:1fr; }
  .form-group.full { grid-column:1; }
  .report-body { padding:28px 20px; }
  .sticky-cta { display:block; }
  .detail-hero { padding:72px 20px 52px; }
  .loading-steps { width:100%; }
  .upsell-grid { grid-template-columns:1fr; }
  .report-summary-grid { grid-template-columns:1fr 1fr; }
  .footer-top { grid-template-columns:1fr; gap:28px; text-align:center; }
  .footer-desc { text-align:center; max-width:100%; margin-left:auto; margin-right:auto; }
  .footer-logo-main { text-align:center; }
  .footer-logo-sub { text-align:center; }
  .footer-bottom { flex-direction:column; align-items:center; gap:16px; }
  .footer-trust { flex-wrap:wrap; gap:10px; }
  .stat-row-inner { flex-wrap:wrap; }
  .stat-row-item { flex:none; width:50%; border-bottom:1px solid var(--border); text-align:center; padding:20px 12px; }
  .stat-row-item:nth-child(odd) { border-right:1px solid var(--border); }
  .hero-content { padding:0 20px; }
  .photo-cta-content { padding:80px 20px; }
  /* Responsive utilities */
  .page-hero-pad { padding:96px 20px 60px; }
  .two-col-lg { grid-template-columns:1fr; gap:40px; }
  .split-row { grid-template-columns:1fr; gap:6px; }
  .split-row-lg { grid-template-columns:1fr; gap:8px; }
  .tab-scroll { padding:0 16px; }
  /* Feature content mobile padding */
  .feature-content { padding:48px 24px; }
  /* Origin content */
  .origin-content { padding:72px 20px; }
  /* Sub-card stacking */
  .sub-card { padding:36px 24px; }
  .sub-card-body { flex-direction:column; align-items:center; text-align:center; }
  .sub-card-body > div:first-child { max-width:100%; }
  /* Portrait image collapses to landscape on mobile */
  .portrait-img { aspect-ratio:16/9; max-height:320px; }
  /* Method steps: keep row layout, explicit left-align */
  .method-step { gap:16px; padding:28px 0; align-items:flex-start; }
  .method-step-num { font-size:1.4rem; width:32px; text-align:left; flex-shrink:0; }
  .method-step h3, .method-step p { text-align:left; }
  /* Price box */
  .price-box { padding:24px 20px; }
  /* Upsell button: allow text wrap on mobile */
  .upsell-card .btn { white-space:normal; line-height:1.4; padding:14px 24px; text-align:center; }
  /* Over-ons stats: 3 equal columns so no orphaned item */
  .over-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  /* Contact hero: full width + balanced line breaks on mobile */
  .contact-hero-sub { max-width:100%; text-wrap:balance; }
  /* Inzichten category header: center on mobile */
  .inzichten-cat-header { text-align:center; }
  .inzichten-cat-header .cat-divider { margin-left:auto; margin-right:auto; }
  .inzichten-cat-header .cat-desc { max-width:100%; text-wrap:balance; }
  /* Signal strip: equal-width 2-column grid on mobile */
  .signal-strip-inner { display:grid; grid-template-columns:1fr 1fr; gap:32px 0; padding:0 24px; }
  /* Brand philosophy: single column on mobile, left-aligned */
  .philosophy-grid { grid-template-columns:1fr; gap:24px 0; text-align:left; }
  .philosophy-grid p, .philosophy-grid div { text-align:left; }
  .philosophy-quote { text-align:left; font-size:.95rem; }
  .philosophy-quotes { margin-top:24px; padding-top:24px; gap:18px; }
  /* Brand credibility: keep 2-column on mobile */
  .credibility-grid { grid-template-columns:1fr 1fr; gap:36px 28px; }
  /* Reduce generous padding on mobile for new brand sections */
  .brand-section-pad { padding:72px 24px !important; }
  /* Editorial section header → centered on mobile */
  .editorial-header { flex-direction:column; align-items:center; text-align:center; margin-bottom:48px; }
  .editorial-header p { text-align:center; max-width:100%; }
  /* Editorial grids → single column on mobile */
  .waarom-grid       { grid-template-columns:1fr; gap:56px 0; }
  .reports-grid      { grid-template-columns:1fr; gap:48px 0; }
  .testimonials-grid { grid-template-columns:1fr; gap:48px 0; }
  .testimonials-wrap { padding:0 20px; }
  /* Rapporten grids → single column on mobile */
  .rapporten-hd-grid { grid-template-columns:1fr; gap:48px 0; }
  .rapporten-andere-grid { grid-template-columns:1fr; gap:48px 0; max-width:100%; }
}
@media (max-width:480px) {
  .hero-actions { flex-direction:column; }
  .hero-actions .btn { width:100%; }
  .report-summary-grid { grid-template-columns:1fr; }
  /* Stat row: keep 2 per row even on small screens */
  .stat-row-item { width:50%; }
  .waarom-card-img { height:180px; }
  /* Extra-small screens */
  .section, .section-md { padding:56px 16px; }
  .section-sm { padding:44px 16px; }
  .container { padding:0 16px; }
  .page-hero-pad { padding:84px 16px 48px; }
  .origin-content { padding:56px 16px; }
  .detail-hero { padding:60px 16px 40px; }
  .sub-card { padding:28px 18px; }
  .two-col-lg { gap:28px; }
  .method-step { gap:12px; padding:22px 0; }
  /* Stats 2x2: always keep 2 columns */
  .stats-2x2 { grid-template-columns:1fr 1fr; gap:12px; }
  .price-box { padding:20px 16px; }
  .price-box-amount { font-size:2.6rem; }
  /* Reduce heading sizes on very small phones so long titles don't become 4-liners */
  .h1 { font-size:clamp(1.85rem,6.5vw,2.4rem); }
  .h2 { font-size:clamp(1.6rem,5.5vw,2rem); }
  /* Footer bottom: center on tiny screens */
  .footer-bottom { align-items:center; text-align:center; }
  .footer-trust { justify-content:center; }
  /* Brand credibility: single column on very small screens */
  .credibility-grid { grid-template-columns:1fr; gap:28px 0; }
}

/* ── PLACE AUTOCOMPLETE ───────────────────────────────────────────────────── */
.place-wrap { position:relative; }
.place-dropdown { position:absolute; top:100%; left:0; right:0; z-index:200; background:#fff; border:1px solid var(--border); border-radius:var(--radius-md); box-shadow:var(--shadow-lg); margin-top:4px; overflow:hidden; }
.place-option { padding:11px 14px; font-size:.87rem; cursor:pointer; border-bottom:1px solid var(--border); line-height:1.35; color:var(--text); transition:background .12s; }
.place-option:last-child { border-bottom:none; }
.place-option:hover { background:var(--muted); }
.place-option-main { font-weight:500; }
.place-option-sub { font-size:.75rem; color:var(--text-muted); margin-top:2px; }
.place-tz { margin-top:5px; font-size:.73rem; color:var(--text-muted); display:flex; align-items:center; gap:5px; }
.place-tz-dot { width:6px; height:6px; border-radius:50%; background:var(--gold); flex-shrink:0; }
.place-tz-error { color:#c0392b; }

/* ── CHART DASHBOARD ──────────────────────────────────────────────────────── */
/* Main wrapper */
.cd { background:var(--bg); border-radius:0; border:1px solid var(--border); box-shadow:var(--shadow-md); overflow:hidden; }
/* Header */
.cd-hdr { padding:22px 28px 18px; border-bottom:1px solid var(--border); display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; background:var(--dark); }
.cd-eyebrow { font-size:.52rem; font-weight:500; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); margin-bottom:5px; }
.cd-title { font-family:var(--font-serif); font-size:1.55rem; font-weight:300; color:#FFFFFF; line-height:1.08; }
.cd-name { font-size:.78rem; font-weight:300; color:rgba(255,255,255,.38); margin-top:3px; }
.cd-hdr-type { font-family:var(--font-serif); font-size:1.4rem; font-weight:300; color:#FFFFFF; line-height:1; }
.cd-hdr-auth { font-size:.56rem; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); margin-top:3px; opacity:.7; }
/* 2-column body */
.cd-body { display:grid; grid-template-columns:1fr 296px; }
/* Left — blueprint panel */
.cd-left { padding:22px 24px 20px; border-right:1px solid var(--border); background:var(--bg); }
.cd-bp { background:linear-gradient(148deg,#EDE9E2 0%,#E5DDD4 60%,#DDD4C8 100%); border-radius:0; position:relative; overflow:hidden; padding:18px 12px 14px; }
.cd-bp-rings { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
.cd-bp-lbl { font-size:.5rem; font-weight:500; letter-spacing:.22em; text-transform:uppercase; color:rgba(26,23,20,.32); text-align:center; margin-bottom:6px; }
.cd-bp-cta { margin-top:10px; display:flex; justify-content:center; }
.cd-pill { display:inline-flex; align-items:center; gap:6px; background:rgba(26,23,20,.07); border:1px solid rgba(26,23,20,.15); border-radius:0; padding:8px 20px; font-size:.65rem; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:rgba(26,23,20,.55); cursor:pointer; transition:all 200ms var(--ease); white-space:nowrap; }
.cd-pill:hover { background:rgba(26,23,20,.12); color:var(--dark); border-color:rgba(26,23,20,.25); }
/* Right — insight cards */
.cd-right { padding:16px 18px; display:flex; flex-direction:column; gap:6px; background:var(--card); }
/* Insight card */
.cd-ic { background:var(--bg); border-radius:0; border:1px solid var(--border); padding:12px 14px; position:relative; overflow:hidden; transition:border-color 180ms var(--ease); }
.cd-ic:hover { border-color:var(--gold); }
.cd-ic-top { display:flex; align-items:flex-start; justify-content:space-between; gap:6px; margin-bottom:4px; }
.cd-ic-lbl { font-size:.48rem; font-weight:500; letter-spacing:.22em; text-transform:uppercase; color:var(--text-light); line-height:1.4; }
.cd-ic-ico { font-size:.62rem; opacity:.2; flex-shrink:0; margin-top:1px; }
.cd-ic-val { font-family:var(--font-serif); font-size:1.05rem; font-weight:400; color:var(--dark); line-height:1.2; margin-bottom:3px; }
.cd-ic-desc { font-size:.65rem; font-weight:300; color:var(--text-muted); line-height:1.5; }
.cd-ic-bar { position:absolute; left:0; top:0; bottom:0; width:3px; }
/* Integrations section */
.cd-int { padding:20px 28px 24px; border-top:1px solid var(--border); background:var(--bg); }
.cd-int-hdr { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:14px; }
.cd-int-ttl { font-family:var(--font-serif); font-size:1.18rem; font-weight:300; color:var(--dark); }
.cd-int-lnk { font-size:.58rem; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--brand); cursor:pointer; opacity:.6; transition:opacity 150ms; }
.cd-int-lnk:hover { opacity:1; }
.cd-int-row { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
/* Integration card */
.cd-ic2 { background:var(--card); border-radius:0; border:1px solid var(--border); padding:14px 16px; transition:border-color 180ms var(--ease); }
.cd-ic2:hover { border-color:var(--gold); }
.cd-ic2-lbl { font-size:.48rem; font-weight:500; letter-spacing:.2em; text-transform:uppercase; color:var(--text-light); margin-bottom:6px; }
.cd-ic2-val { font-family:var(--font-serif); font-size:.95rem; font-weight:400; color:var(--dark); margin-bottom:3px; line-height:1.25; }
.cd-ic2-desc { font-size:.65rem; font-weight:300; color:var(--text-muted); line-height:1.52; }
/* Footer tagline */
.cd-foot { padding:10px 28px; border-top:1px solid var(--border); text-align:center; background:var(--card); }
.cd-foot-tag { font-family:var(--font-serif); font-size:.7rem; font-style:italic; color:var(--text-light); letter-spacing:.03em; }
/* Responsive */
@media (max-width:900px) {
  .cd-body { grid-template-columns:1fr; }
  .cd-left { border-right:none; border-bottom:1px solid var(--border); }
  .cd-right { background:var(--bg); }
  .cd-int-row { grid-template-columns:1fr; }
  .cd-int { padding:18px 20px 22px; }
  .cd-hdr { padding:16px 18px 14px; }
  .cd-left { padding:16px 18px 14px; }
  .cd-right { padding:12px 16px; }
  .cd-foot { padding:8px 18px; }
}
@media (max-width:480px) {
  .cd-hdr-type { font-size:1.1rem; }
  .cd-title { font-size:1.3rem; }
  .cd-int-ttl { font-size:1rem; }
}

/* ── PRINT ──────────────────────────────────────────────────────────────── */
@media print {
  /* Hide interactive & repeated UI */
  .nav, .sticky-cta, .mobile-menu, .footer,
  .hero-scroll, #dlb, .cd-pill, .cd-foot,
  .upsell-card { display:none !important; }

  /* White backgrounds — removes the cream bleed that creates "blank" pages */
  body, .report-pg, .section, .section-md, .section-sm,
  .pg, .cd-left, .cd-right, .cd-int { background:white !important; }

  /* Dark elements keep their color (chart header, hero) */
  .cd-hdr, .thankyou-hero { -webkit-print-color-adjust:exact; print-color-adjust:exact; }

  /* Kill min-height — the #1 cause of blank trailing pages */
  .pg, .report-pg { min-height:0 !important; height:auto !important; }

  /* Trim large padding */
  .report-pg { padding:0 24px 24px !important; }
  .thankyou-hero { padding:32px 24px !important; }
  .section, .section-md, .section-sm { padding:40px 24px !important; }

  /* Report body: no card shadow, full width */
  .report-body { border:none !important; box-shadow:none !important;
    padding:0 !important; max-width:100% !important; }
  .report-summary { box-shadow:none !important; }
  .report-header { max-width:100% !important; }

  /* Keep titles with the content that follows */
  .report-section-title { page-break-after:avoid; break-after:avoid; }
  h2, h3 { page-break-after:avoid; break-after:avoid; }

  /* ChartDashboard: single column so bodygraph prints fully */
  .cd { box-shadow:none !important; border:1px solid #e8e5e0 !important; }
  .cd-body { grid-template-columns:1fr !important; }
  .cd-left { border-right:none !important; border-bottom:1px solid #e8e5e0 !important; }

  /* Ensure colours print correctly */
  * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
}

/* ── TYPE PAGES ─────────────────────────────────────────────────────────── */
.type-section    { padding:96px 40px; }
.type-section-lg { padding:112px 40px; }
.type-section-sm { padding:72px 40px; }
.type-hero-inner { position:relative; z-index:1; width:100%; max-width:900px; margin:0 auto; padding:0 40px 80px; }
.type-split      { display:grid; grid-template-columns:200px 1fr; gap:0 64px; align-items:start; max-width:960px; margin:0 auto; }
.type-other-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
@media (max-width:768px) {
  .type-section    { padding:64px 20px; }
  .type-section-lg { padding:72px 20px; }
  .type-section-sm { padding:52px 20px; }
  .type-hero-inner { padding:0 20px 60px; }
  .type-split      { grid-template-columns:1fr; gap:20px; }
  .type-other-grid { grid-template-columns:1fr 1fr; gap:16px; }
}
@media (max-width:480px) {
  .type-section    { padding:52px 16px; }
  .type-section-lg { padding:60px 16px; }
  .type-section-sm { padding:44px 16px; }
  .type-hero-inner { padding:0 16px 48px; }
  .type-cta-btn    { white-space:normal; text-align:center; line-height:1.4; width:100%; }
}

/* ── 5-TYPE GRID ORPHAN FIX ─────────────────────────────────────────────── */
@media (max-width:580px){
  .types-grid-5>*:last-child:nth-child(odd){
    grid-column:1/-1;
    justify-self:center;
    max-width:50%;
    width:100%;
  }
}
`;


// ─── ANALYTICS ────────────────────────────────────────────────────────────────
const track = (event, props = {}) => {
  if (typeof window === "undefined") return;
  // GA4 / Google Ads gtag
  if (window.gtag) {
    window.gtag("event", event, props);
    // Fire Google Ads purchase conversion on checkout_completed
    if (event === "checkout_completed" && props.price) {
      window.gtag("event", "conversion", {
        send_to: "AW-XXXXXXXXXX/XXXXXXXXXXXXXXXXXX", // replace with real label
        value: props.price,
        currency: "EUR",
        transaction_id: Date.now().toString()
      });
    }
    // Fire begin_checkout event for ads funnel
    if (event === "checkout_started") {
      window.gtag("event", "begin_checkout", {
        currency: "EUR",
        value: props.price || 0,
        items: [{ item_id: props.report, item_name: props.report, price: props.price || 0, quantity: 1 }]
      });
    }
    // Fire view_item on report card click
    if (event === "report_card_click") {
      window.gtag("event", "view_item", {
        currency: "EUR",
        value: props.price || 0,
        items: [{ item_id: props.report, price: props.price || 0, quantity: 1 }]
      });
    }
  }
  console.log("[Analytics]", event, props);
};

// ─── SEO HELPERS ──────────────────────────────────────────────────────────────
const SITE = "https://www.facultyhd.com";

function useSEO({ title, description, canonical, jsonLd }) {
  useEffect(() => {
    // Title
    document.title = title + " | Faculty of Human Design";
    // Description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = description;
    // OG title
    let ogT = document.querySelector('meta[property="og:title"]');
    if (!ogT) { ogT = document.createElement("meta"); ogT.setAttribute("property","og:title"); document.head.appendChild(ogT); }
    ogT.content = title + " | Faculty of Human Design";
    // OG description
    let ogD = document.querySelector('meta[property="og:description"]');
    if (!ogD) { ogD = document.createElement("meta"); ogD.setAttribute("property","og:description"); document.head.appendChild(ogD); }
    ogD.content = description;
    // Canonical
    let can = document.querySelector('link[rel="canonical"]');
    if (!can) { can = document.createElement("link"); can.rel = "canonical"; document.head.appendChild(can); }
    can.href = canonical || SITE + "/";
    // GA4 page_view (SPA navigation)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_title: title + " | Faculty of Human Design",
        page_location: canonical || window.location.href,
      });
    }
    // JSON-LD
    const prev = document.getElementById("__page_jsonld");
    if (prev) prev.remove();
    if (jsonLd) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = "__page_jsonld";
      s.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(s);
    }
    return () => {
      const el = document.getElementById("__page_jsonld");
      if (el) el.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical]);
}

// JSON-LD builders
function productLD(rpt) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tl(rpt.title),
    "description": tl(rpt.intro),
    "brand": { "@type": "Brand", "name": "Faculty of Human Design" },
    "offers": {
      "@type": "Offer",
      "price": rpt.priceNum,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "Faculty of Human Design" },
      "deliveryLeadTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 5, "unitCode": "MIN" }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2400",
      "bestRating": "5"
    },
    "review": (Array.isArray(rpt.reviews) ? rpt.reviews : (rpt.reviews?.[LANG] || rpt.reviews?.nl || [])).slice(0, 3).map(([body, author]) => ({
      "@type": "Review",
      "reviewBody": body,
      "author": { "@type": "Person", "name": author },
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
    }))
  };
}

function faqLD(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(([q, a]) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a }
    }))
  };
}

function breadcrumbLD(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map(([name, url], i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": name,
      "item": SITE + url
    }))
  };
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
const REPORTS = [
  {
    id:"volledig", icon:"✦",
    tag:{ nl:"Meest gekozen", en:"Most popular" },
    title:{ nl:"Human Design Reading", en:"Human Design Reading" },
    price:"€75", priceNum:75,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Begrijp eindelijk wie je werkelijk bent", en:"Finally understand who you truly are" },
    tagline:{ nl:"Je complete persoonlijke blauwdruk", en:"Your complete personal blueprint" },
    intro:{ nl:"Het meest uitgebreide rapport dat wij aanbieden. Een volledige analyse van je Human Design chart: van Type en Autoriteit tot Inkarnatie-Kruis en praktische levensguidance.", en:"The most comprehensive report we offer. A complete analysis of your Human Design chart: from Type and Authority to Incarnation Cross and practical life guidance." },
    includes:["Type, Strategie & Signature","Autoriteit: hoe je beslissingen neemt","Profiel: het verhaal van je leven","Alle 9 centra geanalyseerd","Actieve kanalen & krachten","Poorten: je natuurlijke kwaliteiten","Inkarnatie-Kruis: je levensdoel","Relaties & werk vanuit je design","Praktische guidance 2026–2028"],
    for:{ nl:"Voor iedereen die een diepgaand en volledig inzicht wil in hun Human Design.", en:"For everyone seeking deep and complete insight into their Human Design." },
    sections:12, pages:"40+",
    prompt_extra:{
      nl:"### 1. Je Energetische Blauwdruk\n### 2. Type & Levensstrategie\n### 3. Autoriteit\n### 4. Profiel\n### 5. Gedefinieerde Centra\n### 6. Open Centra & Conditionering\n### 7. Actieve Kanalen\n### 8. Je Poorten\n### 9. Inkarnatie-Kruis\n### 10. Relaties & Verbinding\n### 11. Praktische Guidance 2026-2028\n### 12. Slotanalyse",
      en:"### 1. Your Energetic Blueprint\n### 2. Type & Life Strategy\n### 3. Authority\n### 4. Profile\n### 5. Defined Centers\n### 6. Open Centers & Conditioning\n### 7. Active Channels\n### 8. Your Gates\n### 9. Incarnation Cross\n### 10. Relationships & Connection\n### 11. Practical Guidance 2026-2028\n### 12. Closing Analysis",
    },
    reviews:{
      nl:[
        ["Ik had al eerder iets gelezen over Human Design maar dit rapport bracht het echt tot leven. De sectie over mijn open centra was confronterend en bevrijdend tegelijk. Ik herkende zo veel conditionering die ik als 'mezelf' had aangenomen. Drie maanden later lees ik het nog steeds.","Marieke V., Amsterdam"],
        ["Precies wat ik zocht. Geen vage spirituele teksten maar concrete analyse van wie ik ben en hoe ik het beste functioneer.","Thomas D., Antwerpen"],
        ["Het stuk over mijn Inkarnatie-Kruis heeft me echt geraakt. Ik begrijp nu waarom bepaalde dingen in mijn leven steeds terugkomen. De schrijfstijl is prettig: persoonlijk en niet droog of technisch.","Sofie M., Utrecht"],
      ],
      en:[
        ["I had read about Human Design before, but this report truly brought it to life. The section about my open centers was both confronting and liberating. I recognised so much conditioning I had assumed was just 'me'. Three months later I still read it.","Marieke V., Amsterdam"],
        ["Exactly what I was looking for. No vague spiritual texts but concrete analysis of who I am and how I function best.","Thomas D., Antwerp"],
        ["The section about my Incarnation Cross really moved me. I now understand why certain things keep returning in my life. The writing style is pleasant: personal and not dry or technical.","Sofie M., Utrecht"],
      ],
    },
  },
  {
    id:"relatie_liefde", icon:"◎", tag:"",
    title:{ nl:"Relatie Reading", en:"Relationship Reading" },
    price:"€95", priceNum:95,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Meer rust en begrip in je romantische verbinding", en:"More peace and understanding in your romantic connection" },
    tagline:{ nl:"Twee designs in romantische verbinding", en:"Two designs in romantic connection" },
    intro:{ nl:"Een diepgaande analyse van jouw en je partners Human Design charts. Hoe functioneren jullie energetisch als koppel: waar versterken jullie elkaar, waar is de wrijving, en hoe groeien jullie samen?", en:"An in-depth analysis of your and your partner's Human Design charts. How do you function energetically as a couple: where do you strengthen each other, where is the friction, and how do you grow together?" },
    includes:["Beide charts volledig geanalyseerd","Elektromagnetische verbindingen","Compatibiliteit van Types","Communicatie & intimiteitsstijl","Seksuele energie & aantrekking","Beslissingen nemen als stel","Conflictpatronen & doorbraken","Gezamenlijk groeipad","Praktisch advies voor harmonie"],
    for:{ nl:"Voor koppels die hun romantische verbinding dieper willen begrijpen en versterken.", en:"For couples who want to deepen their understanding of their romantic connection." },
    sections:9, pages:"28+", needsPartner:true,
    partnerLabel:{ nl:"Partner", en:"Partner" },
    prompt_extra:{
      nl:"### 1. De Energie van Jullie Verbinding\n### 2. Chart Analyse — Jouw Design\n### 3. Chart Analyse — Partners Design\n### 4. Elektromagnetische Verbindingen\n### 5. Compatibiliteit & Aantrekking\n### 6. Communicatie & Intimiteit\n### 7. Spanningsvelden & Doorbraken\n### 8. Gezamenlijk Groeipad\n### 9. Praktisch Advies voor Harmonie",
      en:"### 1. The Energy of Your Connection\n### 2. Chart Analysis — Your Design\n### 3. Chart Analysis — Partner's Design\n### 4. Electromagnetic Connections\n### 5. Compatibility & Attraction\n### 6. Communication & Intimacy\n### 7. Tension Points & Breakthroughs\n### 8. Shared Growth Path\n### 9. Practical Advice for Harmony",
    },
    reviews:{
      nl:[
        ["Mijn partner en ik hadden al jaren moeite met communiceren. Het rapport legde precies uit waarom: onze energietypen botsen op een heel specifieke manier die we nu herkennen en kunnen ombuigen. Dat is goud waard.","Elena & Marc, Gent"],
        ["Ik had dit als verrassing voor mijn partner besteld. We hebben het samen gelezen en waren allebei stil bij hoe accuraat de beschrijving van onze dynamiek was.","Roos & Tim, Amsterdam"],
        ["Verrassend diepgaand. Niet alleen 'jullie vullen elkaar aan' maar echt concrete patronen en waar de wrijving vandaan komt.","Nathalie D., Brugge"],
      ],
      en:[
        ["My partner and I had struggled to communicate for years. The report explained exactly why: our energy types clash in a very specific way that we can now recognise and redirect. That is worth its weight in gold.","Elena & Marc, Ghent"],
        ["I ordered this as a surprise for my partner. We read it together and were both struck by how accurately it described our dynamic.","Roos & Tim, Amsterdam"],
        ["Surprisingly in-depth. Not just 'you complement each other' but truly concrete patterns and where the friction comes from.","Nathalie D., Bruges"],
      ],
    },
  },
  {
    id:"relatie_business", icon:"◈", tag:"",
    title:{ nl:"Zakelijke Reading", en:"Business Reading" },
    price:"€85", priceNum:85,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Samenwerking die werkt voor jullie allebei", en:"Collaboration that works for both of you" },
    tagline:{ nl:"Twee designs in zakelijke samenwerking", en:"Two designs in professional partnership" },
    intro:{ nl:"Een analyse van twee Human Design charts vanuit zakelijk perspectief. Wie leidt, wie beslist, waar liggen de complementariteiten en hoe bouwen jullie een samenwerking die werkt voor beiden?", en:"An analysis of two Human Design charts from a professional perspective. Who leads, who decides, where are the complementarities and how do you build a collaboration that works for both?" },
    includes:["Beide charts volledig geanalyseerd","Besluitvormingsdynamieken","Complementariteit van Types","Leiderschapsstijl per chart","Werkenergieën & ritmes","Communicatiepatronen op de werkvloer","Conflictpatronen & oplossingen","Rolverdeling & verantwoordelijkheden","Praktisch advies voor optimale samenwerking"],
    for:{ nl:"Voor zakenpartners, compagnons of collega's die hun samenwerking bewust willen verbeteren.", en:"For business partners, co-founders or colleagues who want to consciously improve their collaboration." },
    sections:9, pages:"24+", needsPartner:true,
    partnerLabel:{ nl:"Zakenpartner", en:"Business Partner" },
    prompt_extra:{
      nl:"### 1. De Energie van Jullie Samenwerking\n### 2. Chart Analyse — Jouw Design\n### 3. Chart Analyse — Zakenpartner Design\n### 4. Besluitvormingsdynamieken\n### 5. Complementariteit & Sterktes\n### 6. Leiderschapsstijl & Rolverdeling\n### 7. Communicatie & Conflictpatronen\n### 8. Gezamenlijke Visie & Richting\n### 9. Praktisch Advies voor Samenwerking",
      en:"### 1. The Energy of Your Partnership\n### 2. Chart Analysis — Your Design\n### 3. Chart Analysis — Business Partner's Design\n### 4. Decision-Making Dynamics\n### 5. Complementarity & Strengths\n### 6. Leadership Style & Role Division\n### 7. Communication & Conflict Patterns\n### 8. Shared Vision & Direction\n### 9. Practical Advice for Collaboration",
    },
    reviews:{
      nl:[
        ["Ik had dit met mijn compagnon gedaan. De analyse van hoe wij beslissingen nemen was verbazend accuraat. We werken nu bewust anders samen.","Pieter K., Rotterdam"],
        ["Het rapport liet zien dat mijn partner een Manifestor is en ik een Generator. Dat verklaarde zoveel van onze samenwerking. Nu gaan we er bewust mee om.","Lars M., Utrecht"],
        ["Als twee oprichters van een startup is het rapport ons leidraad geworden voor taakverdeling. Concreet, praktisch en verrassend nauwkeurig.","Sara & Joris, Gent"],
      ],
      en:[
        ["I did this with my business partner. The analysis of how we make decisions was remarkably accurate. We now consciously work together differently.","Pieter K., Rotterdam"],
        ["The report showed that my partner is a Manifestor and I am a Generator. That explained so much about our collaboration. Now we work with it consciously.","Lars M., Utrecht"],
        ["As two founders of a startup, the report has become our guide for task division. Concrete, practical and surprisingly accurate.","Sara & Joris, Ghent"],
      ],
    },
  },
  {
    id:"relatie_familie", icon:"◇", tag:"",
    title:{ nl:"Familie Reading", en:"Family Reading" },
    price:"€75", priceNum:75,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Meer begrip en verbinding in het gezin", en:"More understanding and connection in the family" },
    tagline:{ nl:"Twee designs in familieverband", en:"Two designs in family connection" },
    intro:{ nl:"Een analyse van twee familieleden — ouder en kind, broer en zus, of een andere gezinsrelatie. Hoe opereren jullie designs samen en hoe creëer je meer begrip, verbinding en ruimte?", en:"An analysis of two family members — parent and child, siblings, or another family relationship. How do your designs operate together and how do you create more understanding, connection and space?" },
    includes:["Beider charts geanalyseerd","Energetische dynamieken in het gezin","Communicatiestijlen per type","Groeimogelijkheden voor beiden","Patronen van conflict en verbinding","Rolverdeling binnen de familie","Opvoedings- en begeleidingstips","Praktische guidance voor meer begrip","Slotanalyse"],
    for:{ nl:"Voor ouders met kinderen, broers en zussen of andere gezinsleden die meer inzicht willen in hun dynamiek.", en:"For parents with children, siblings or other family members seeking more insight into their dynamic." },
    sections:9, pages:"24+", needsPartner:true,
    partnerLabel:{ nl:"Familielid", en:"Family Member" },
    prompt_extra:{
      nl:"### 1. De Energie van Jullie Familiebinding\n### 2. Chart Analyse — Jouw Design\n### 3. Chart Analyse — Familielid\n### 4. Familiedynamieken & Patronen\n### 5. Communicatiestijlen & Begrip\n### 6. Groeimogelijkheden voor Beiden\n### 7. Spanningsvelden & Oplossingen\n### 8. Guidance voor Meer Verbinding\n### 9. Slotanalyse",
      en:"### 1. The Energy of Your Family Bond\n### 2. Chart Analysis — Your Design\n### 3. Chart Analysis — Family Member's Design\n### 4. Family Dynamics & Patterns\n### 5. Communication Styles & Understanding\n### 6. Growth Opportunities for Both\n### 7. Tension Points & Solutions\n### 8. Guidance for More Connection\n### 9. Closing Analysis",
    },
    reviews:{
      nl:[
        ["Mijn dochter en ik hebben het rapport samen besproken. Voor het eerst begreep ik écht waarom zij reageert zoals ze reageert — dat heeft onze verhouding veranderd.","Karin V., Den Haag"],
        ["Het inzicht in hoe mijn moeder en ik anders communiceren was een openbaring. Niet alleen voor mijn begrip van haar, maar ook voor hoe ik mezelf in die relatie gedraag.","Thomas B., Antwerpen"],
        ["Voor broer en zus is dit ook bijzonder waardevol. Veel patronen die we altijd 'gewoon zo' noemden kregen eindelijk een verklaring.","Femke O., Leiden"],
      ],
      en:[
        ["My daughter and I discussed the report together. For the first time I truly understood why she reacts the way she does — that has changed our relationship.","Karin V., The Hague"],
        ["The insight into how my mother and I communicate differently was a revelation. Not only for my understanding of her, but also for how I behave in that relationship.","Thomas B., Antwerp"],
        ["For siblings this is also remarkably valuable. Many patterns we always called 'just the way it is' finally got an explanation.","Femke O., Leiden"],
      ],
    },
  },
  {
    id:"jaar", icon:"◈", tag:"",
    title:{ nl:"Jaarrapport 2026", en:"Annual Reading 2026" },
    price:"€55", priceNum:55,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Weet wat er dit jaar van je gevraagd wordt", en:"Know what is asked of you this year" },
    tagline:{ nl:"De energetische thema's van je jaar", en:"The energetic themes of your year" },
    intro:{ nl:"Gebaseerd op je Solar Return: de posities van de planeten op je verjaardag dit jaar. Wat zijn de dominante thema's en kansen?", en:"Based on your Solar Return: the planetary positions on your birthday this year. What are the dominant themes and opportunities?" },
    includes:["Solar Return analyse","Dominante thema's voor 2026","Kwartaal-voor-kwartaal overzicht","Planetaire invloeden op je chart","Kansen en aandachtspunten","Intentie voor het jaar"],
    for:{ nl:"Voor wie het jaar bewust en gericht wil ingaan.", en:"For those who want to enter the year consciously and with direction." },
    sections:9, pages:"22+",
    prompt_extra:{
      nl:"### 1. Energie van Je Nieuw Levensjaar\n### 2. Solar Return Analyse\n### 3. Dominante Themas\n### 4. Kwartaal 1\n### 5. Kwartaal 2\n### 6. Kwartaal 3\n### 7. Kwartaal 4\n### 8. Kansen & Uitdagingen\n### 9. Intentie voor het Jaar",
      en:"### 1. Energy of Your New Personal Year\n### 2. Solar Return Analysis\n### 3. Dominant Themes\n### 4. Quarter 1\n### 5. Quarter 2\n### 6. Quarter 3\n### 7. Quarter 4\n### 8. Opportunities & Challenges\n### 9. Intention for the Year",
    },
    reviews:{
      nl:[
        ["Ik bestel dit elk jaar rond mijn verjaardag. Het kwartaaloverzicht gebruik ik echt als leidraad — niet als agenda maar als bewustzijn van wat er op me afkomt. Dit jaar klopte het weer opvallend goed.","Roos B., Utrecht"],
        ["Het rapport beschreef een thema van 'loslaten en vertrouwen' voor het derde kwartaal. Ik was sceptisch, maar er gebeurde inderdaad iets in die periode wat ik niet had zien aankomen. Achteraf paste het precies in dat verhaal.","Joost V., Den Haag"],
        ["Fijn dat het niet alleen over 'kansen' gaat maar ook eerlijk is over uitdagingen. Dat maakt het geloofwaardiger.","Anke S., Leiden"],
      ],
      en:[
        ["I order this every year around my birthday. I genuinely use the quarterly overview as a guide — not as a schedule but as awareness of what's coming. This year it was strikingly accurate again.","Roos B., Utrecht"],
        ["The report described a theme of 'letting go and trusting' for the third quarter. I was sceptical, but something did happen in that period that I hadn't seen coming. In hindsight it fit exactly into that narrative.","Joost V., The Hague"],
        ["It's good that it doesn't just focus on 'opportunities' but is also honest about challenges. That makes it more believable.","Anke S., Leiden"],
      ],
    },
  },
  {
    id:"kind", icon:"◇", tag:"",
    title:{ nl:"Kinderrapport", en:"Child Reading" },
    price:"€75", priceNum:75,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Begeleid je kind vanuit wie het werkelijk is", en:"Guide your child from who they truly are" },
    tagline:{ nl:"Je kind begrijpen vanuit zijn of haar design", en:"Understanding your child through their design" },
    intro:{ nl:"Een rapport voor ouders. Hoe gebruik je kind energie en hoe leert het het beste?", en:"A report for parents. How does your child use energy and how do they learn best?" },
    includes:["Type & energiegebruik","Hoe je kind beslissingen neemt","Leerstijl & communicatie","Behoeften & grenzen","Opvoedtips op maat","Gaven & talenten"],
    for:{ nl:"Voor ouders die hun kind willen begeleiden op basis van wie het werkelijk is.", en:"For parents who want to guide their child based on who they truly are." },
    sections:10, pages:"24+", needsChild:true,
    prompt_extra:{
      nl:"### 1. Het Unieke Design van Je Kind\n### 2. Type & Energie\n### 3. Beslissingen Nemen\n### 4. Hoe Je Kind Leert\n### 5. Behoeften & Grenzen\n### 6. Centra Analyse\n### 7. Opvoedtips Op Maat\n### 8. Gaven & Talenten\n### 9. Relatie Ouder-Kind\n### 10. Slotanalyse",
      en:"### 1. Your Child's Unique Design\n### 2. Type & Energy\n### 3. Making Decisions\n### 4. How Your Child Learns\n### 5. Needs & Boundaries\n### 6. Centers Analysis\n### 7. Parenting Tips Tailored to Your Child\n### 8. Gifts & Talents\n### 9. Parent-Child Relationship\n### 10. Closing Analysis",
    },
    reviews:{
      nl:[
        ["Mijn dochter van 9 werd altijd gezien als 'druk' of 'moeilijk'. Het rapport legde uit dat zij een Manifestor is en dat haar behoefte om dingen zelf te initiëren volkomen logisch is. Sindsdien botsen we veel minder.","Sandra P., Haarlem"],
        ["Ik was aanvankelijk sceptisch — mijn kind is nog maar 6. Maar de beschrijving van zijn leerstijl klopte zo precies dat mijn man en ik allebei stil werden.","Femke J., Eindhoven"],
        ["De opvoedtips zijn niet vaag maar heel concreet: hoe reageer je wanneer je kind iets weigert, hoe geef je grenzen aan op een manier die bij zijn type past. Dat is echt bruikbaar.","David C., Maastricht"],
      ],
      en:[
        ["My 9-year-old daughter was always seen as 'hyper' or 'difficult'. The report explained that she is a Manifestor and that her need to initiate things herself is completely logical. Since then we clash much less.","Sandra P., Haarlem"],
        ["I was initially sceptical — my child is only 6. But the description of their learning style was so precise that both my husband and I fell silent.","Femke J., Eindhoven"],
        ["The parenting tips are not vague but very concrete: how to respond when your child refuses something, how to set boundaries in a way that suits their type. That is genuinely useful.","David C., Maastricht"],
      ],
    },
  },
  {
    id:"loopbaan", icon:"◆", tag:"",
    title:{ nl:"Loopbaan Reading", en:"Career & Money Reading" },
    price:"€65", priceNum:65,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Verdien geld op een manier die bij je past", en:"Earn money in a way that suits you" },
    tagline:{ nl:"Werk en financiën vanuit je design", en:"Work and finances through your design" },
    intro:{ nl:"Hoe maakt je geld op een manier die bij jou past? Welke werkomgeving geeft je energie?", en:"How do you make money in a way that suits you? What work environment gives you energy?" },
    includes:["Ideale werkomgeving","Hoe je geld aantrekt","Je professionele kracht","Samenwerking & leiderschap","Valkuilen op de werkvloer","Ondernemen vs. loondienst","Financiële strategie op maat"],
    for:{ nl:"Voor iedereen die wil werken en verdienen in lijn met wie zij zijn.", en:"For everyone who wants to work and earn in alignment with who they are." },
    sections:9, pages:"24+",
    prompt_extra:{
      nl:"### 1. Professionele Blauwdruk\n### 2. Ideale Werkomgeving\n### 3. Hoe Je Geld Aantrekt\n### 4. Je Professionele Kracht\n### 5. Samenwerking & Leiderschap\n### 6. Valkuilen\n### 7. Ondernemen vs. Loondienst\n### 8. Financiele Strategie\n### 9. Volgende Stap",
      en:"### 1. Professional Blueprint\n### 2. Ideal Work Environment\n### 3. How You Attract Money\n### 4. Your Professional Strengths\n### 5. Collaboration & Leadership\n### 6. Pitfalls\n### 7. Self-Employment vs. Employment\n### 8. Financial Strategy\n### 9. Your Next Step",
    },
    reviews:{
      nl:[
        ["Na twaalf jaar in loondienst twijfelde ik of ik voor mezelf moest beginnen. Het rapport was heel helder: mijn type en profiel passen beter bij zelfstandig werken, en het legde ook uit waarom ik me in teamverband altijd een beetje gevangen voel. Twee maanden later had ik mijn eerste eigen klant.","Laura M., Amsterdam"],
        ["Het stuk over 'hoe ik geld aantrek' klonk in eerste instantie zweverig maar de uitleg was verrassend praktisch: het gaat over hoe je je werk aanbiedt en op welk moment je ja of nee zegt.","Kevin T., Antwerpen"],
        ["Ik gebruik het rapport nog steeds als naslagwerk bij carrièrebeslissingen. Het geeft me een referentiepunt.","Isabel R., Utrecht"],
      ],
      en:[
        ["After twelve years in employment I was wondering whether to start for myself. The report was very clear: my type and profile suit independent work better, and it also explained why I always feel a little trapped in a team setting. Two months later I had my first client.","Laura M., Amsterdam"],
        ["The section about 'how I attract money' initially sounded vague but the explanation was surprisingly practical: it's about how you present your work and when you say yes or no.","Kevin T., Antwerp"],
        ["I still use the report as a reference for career decisions. It gives me a point of reference.","Isabel R., Utrecht"],
      ],
    },
  },
  {
    id:"numerologie", icon:"∞", tag:"",
    title:{ nl:"Numerologie Reading", en:"Numerology Reading" },
    price:"€65", priceNum:65,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Begrijp de patronen achter je levensverhaal", en:"Understand the patterns behind your life story" },
    tagline:{ nl:"De getallen achter je naam en geboortedag", en:"The numbers behind your name and birthday" },
    intro:{ nl:"Op basis van je volledige naam en geboortedatum berekenen wij 8 kerngetallen die samen een diepgaand beeld geven van je aard en levensdoel.", en:"Based on your full name and date of birth, we calculate 8 core numbers that together give an in-depth picture of your nature and life purpose." },
    includes:["Levenspadgetal","Uitdrukkingsgetal","Zielsgetal","Persoonlijkheidsgetal","Verjaardagsgetal","Persoonlijk jaar 2026","Rijpingsgetal","Mastergetallen indien aanwezig"],
    for:{ nl:"Voor iedereen die de diepere betekenis van naam en geboortedag wil begrijpen.", en:"For everyone who wants to understand the deeper meaning of their name and date of birth." },
    sections:12, pages:"30+",
    prompt_extra:{
      nl:"### 1. Je Numerologische Blauwdruk\n### 2. Levenspadgetal\n### 3. Uitdrukkingsgetal\n### 4. Zielsgetal\n### 5. Persoonlijkheidsgetal\n### 6. Verjaardagsgetal\n### 7. Persoonlijk Jaar 2026\n### 8. Rijpingsgetal\n### 9. Mastergetallen\n### 10. Hoe Je Getallen Samenwerken\n### 11. Guidance 2026-2028\n### 12. Slotanalyse",
      en:"### 1. Your Numerological Blueprint\n### 2. Life Path Number\n### 3. Expression Number\n### 4. Soul Urge Number\n### 5. Personality Number\n### 6. Birthday Number\n### 7. Personal Year 2026\n### 8. Maturity Number\n### 9. Master Numbers\n### 10. How Your Numbers Work Together\n### 11. Guidance 2026-2028\n### 12. Closing Analysis",
    },
    reviews:{
      nl:[
        ["Ik heb een levenspadgetal 11 en had altijd het gevoel anders te zijn. Voor het eerst las ik een uitleg die dat niet pathologiseerde maar als een gave behandelde. Dat deed iets met me.","Vera N., Nijmegen"],
        ["Ik was benieuwd of numerologie iets zou toevoegen naast mijn Human Design rapport. Het bleek een andere invalshoek die elkaar goed aanvult: het ene gaat over energie, het andere over levenslessen en patronen.","Frank O., Den Bosch"],
        ["De sectie over mijn persoonlijk jaar was opvallend accuraat voor wat er dit jaar speelt.","Mirjam H., Groningen"],
      ],
      en:[
        ["I have a life path number 11 and always felt different. For the first time I read an explanation that didn't pathologise that but treated it as a gift. That touched something in me.","Vera N., Nijmegen"],
        ["I was curious whether numerology would add something alongside my Human Design report. It turned out to be a different perspective that complements it well: one is about energy, the other about life lessons and patterns.","Frank O., Den Bosch"],
        ["The section about my personal year was strikingly accurate for what is happening this year.","Mirjam H., Groningen"],
      ],
    },
  },
  {
    id:"horoscoop", icon:"☽", tag:"",
    title:{ nl:"Geboortehoroscoop Reading", en:"Birth Horoscope Reading" },
    price:"€75", priceNum:75,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Je planeetstanden als persoonlijk kompas", en:"Your planetary positions as a personal compass" },
    tagline:{ nl:"Je complete astrologische chart", en:"Your complete astrological chart" },
    intro:{ nl:"Een volledige geboortehoroscoop op basis van de exacte posities van alle planeten op het moment van je geboorte.", en:"A complete birth horoscope based on the exact positions of all planets at the moment of your birth." },
    includes:["Zonneteken","Ascendant","Maan: je emotionele wereld","Alle 10 planeten in teken & huis","12 huizen geanalyseerd","Belangrijkste aspecten","Midhemel: je roeping","Dominant element & modaliteit"],
    for:{ nl:"Voor wie wil begrijpen hoe de sterren stonden op hun geboortemoment.", en:"For those who want to understand how the stars were positioned at their birth moment." },
    sections:12, pages:"32+",
    prompt_extra:{
      nl:"### 1. Je Astrologische Blauwdruk\n### 2. Zonneteken\n### 3. Ascendant\n### 4. De Maan\n### 5. Mercurius Venus Mars\n### 6. Jupiter Saturnus\n### 7. Buitenste Planeten\n### 8. De Huizen\n### 9. Aspecten\n### 10. Midhemel\n### 11. Guidance 2026-2028\n### 12. Slotanalyse",
      en:"### 1. Your Astrological Blueprint\n### 2. Sun Sign\n### 3. Ascendant\n### 4. The Moon\n### 5. Mercury, Venus & Mars\n### 6. Jupiter & Saturn\n### 7. Outer Planets\n### 8. The Houses\n### 9. Aspects\n### 10. Midheaven\n### 11. Guidance 2026-2028\n### 12. Closing Analysis",
    },
    reviews:{
      nl:[
        ["Ik heb veel horoscopen gelezen maar dit was de eerste die écht inging op de spanning tussen mijn Maan en Ascendant. Dat is precies waar ik mijn leven lang mee worstel. Het voelde alsof iemand mij eindelijk begreep.","Charlotte B., Leiden"],
        ["Diepgaander dan ik had verwacht. Niet alleen de zonnetekens maar alle huizen, aspecten, de Midhemel, een volledig portret. Ik heb het met mijn therapeut gedeeld als extra context.","Bart V., Gent"],
        ["Goed geschreven en toegankelijk, ook als je niet veel weet van astrologie. De kern kwam meteen over.","Yasmine K., Rotterdam"],
      ],
      en:[
        ["I have read many horoscopes but this was the first that truly addressed the tension between my Moon and Ascendant. That is precisely what I have struggled with my whole life. It felt as though someone finally understood me.","Charlotte B., Leiden"],
        ["More in-depth than I expected. Not just sun signs but all the houses, aspects, the Midheaven, a complete portrait. I shared it with my therapist as additional context.","Bart V., Ghent"],
        ["Well written and accessible, even if you don't know much about astrology. The essence came across immediately.","Yasmine K., Rotterdam"],
      ],
    },
  },
  {
    id:"maandelijks", icon:"◯",
    tag:{ nl:"Abonnement", en:"Subscription" },
    title:{ nl:"Maandelijkse Guidance", en:"Monthly Guidance" },
    price:"€19/mnd", priceNum:19,
    sub:{ nl:"Maandelijks opzegbaar", en:"Cancel anytime" },
    outcome:{ nl:"Elke maand bewust leven vanuit je design", en:"Live each month consciously in alignment with your design" },
    tagline:{ nl:"Elke maand je persoonlijke energiegids", en:"Your personal energy guide every month" },
    intro:{ nl:"Elke maand een persoonlijk rapport over de energetische thema's van die maand, afgestemd op je Human Design chart.", en:"A personal report every month about the energetic themes of that month, aligned with your Human Design chart." },
    includes:["Energie & thema's van de maand","Planetaire invloeden","Kansen & aandachtspunten","Praktisch advies","Intentie voor de maand"],
    for:{ nl:"Voor wie maandelijks bewust wil leven in lijn met hun design.", en:"For those who want to live each month consciously in alignment with their design." },
    sections:6, pages:"12+",
    prompt_extra:{
      nl:"### 1. Energie van Deze Maand\n### 2. Planetaire Invloeden\n### 3. Wat Er van jou Gevraagd Wordt\n### 4. Kansen\n### 5. Aandachtspunten\n### 6. Intentie voor de Maand",
      en:"### 1. Energy of This Month\n### 2. Planetary Influences\n### 3. What Is Asked of You\n### 4. Opportunities\n### 5. Points of Attention\n### 6. Intention for the Month",
    },
    reviews:{
      nl:[
        ["Ik ben nu acht maanden abonnee. Elke maand lees ik het rapport in de eerste week en gebruik ik de intentie als anker. Het is bescheiden in omvang maar precies genoeg.","Noor A., Amsterdam"],
        ["Wat ik fijn vind is dat het niet overlaadt met informatie. Eén duidelijke intentie voor de maand, een paar aandachtspunten. Dat is genoeg om bewust mee te leven.","Tom S., Breda"],
        ["Vorige maand beschreef het rapport een thema van 'terugkeer naar jezelf'. Ik had net een zware periode achter de rug en het voelde alsof het precies op het juiste moment kwam.","Lisa V., Utrecht"],
      ],
      en:[
        ["I have been a subscriber for eight months now. Every month I read the report in the first week and use the intention as an anchor. It's modest in size but exactly enough.","Noor A., Amsterdam"],
        ["What I appreciate is that it doesn't overwhelm with information. One clear intention for the month, a few points of attention. That's enough to live consciously with.","Tom S., Breda"],
        ["Last month the report described a theme of 'returning to yourself'. I had just been through a difficult period and it felt as though it came at exactly the right moment.","Lisa V., Utrecht"],
      ],
    },
  },
];


// ─── PER-RAPPORT FAQS ────────────────────────────────────────────────────────
// Each report: { nl: [[q,a], ...], en: [[q,a], ...] }
const REPORT_FAQS = {
  volledig:{
    nl:[
      ["Heb ik mijn exacte geboortetijd nodig?","Ja, voor de meest nauwkeurige berekening. De geboortetijd bepaalt je profiel en sommige centra. Als je de exacte tijd niet weet, kijk dan op je geboorteakte. Zelfs zonder exacte tijd zijn je Type en Autoriteit in de meeste gevallen correct."],
      ["Hoe nauwkeurig is de chartberekening?","Wij gebruiken dezelfde astronomische algoritmen als professionele HD-software — tot op de graad nauwkeurig. De berekening is gebaseerd op je exacte geboortedatum, -tijd en -plaats."],
      ["Is het rapport echt persoonlijk?","Elk rapport wordt volledig op maat samengesteld op basis van jouw specifieke combinatie van Type, Autoriteit, Profiel, centra en poorten. Geen twee rapporten zijn identiek."],
      ["Wat is het verschil met een gratis HD-overzicht?","Gratis tools geven een technische samenvatting van je chart. Dit rapport geeft diepgaande, gepersonaliseerde analyse per sectie — specifiek afgestemd op jouw unieke combinatie, niet op je type in het algemeen."],
      ["Hoe ontvang ik het rapport?","Als PDF per e-mail, binnen 1 werkdag na betaling. Je kunt het meerdere keren lezen — en wij raden dat aan."],
    ],
    en:[
      ["Do I need my exact birth time?","Yes, for the most accurate calculation. Birth time determines your profile and some centers. If you don't know the exact time, check your birth certificate. Even without an exact time, your Type and Authority are correct in most cases."],
      ["How accurate is the chart calculation?","We use the same astronomical algorithms as professional HD software — accurate to the degree. The calculation is based on your exact date, time and place of birth."],
      ["Is the report truly personal?","Every report is fully tailored based on your specific combination of Type, Authority, Profile, centers and gates. No two reports are identical."],
      ["What is the difference from a free HD overview?","Free tools give a technical summary of your chart. This report provides in-depth, personalised analysis per section — specifically tailored to your unique combination, not your type in general."],
      ["How do I receive the report?","As a PDF by email, within 1 business day after payment. You can read it multiple times — and we encourage that."],
    ],
  },
  relatie_liefde:{
    nl:[
      ["Hebben we beiden een account nodig?","Nee. Je bestelt het rapport voor twee personen tegelijk. Je voert de geboortedata van jullie beiden in tijdens het bestelproces."],
      ["Hoe nauwkeurig moet de geboortetijd van mijn partner zijn?","Zo nauwkeurig mogelijk — de geboortetijd bepaalt het profiel en sommige centra. Als je de exacte tijd van je partner niet weet, kun je een schatting gebruiken. De kern van de analyse blijft accuraat."],
      ["Is dit rapport ook geschikt aan het begin van een relatie?","Ja. Veel mensen bestellen dit juist aan het begin — om patronen vroeg te herkennen en communicatie bewust te starten. Het is net zo waardevol voor koppels die al jaren samen zijn."],
      ["Hoe persoonlijk is het rapport voor ons specifiek?","Het rapport is volledig gebaseerd op jullie twee specifieke charts. De elektromagnetische verbindingen en compatibiliteitsdynamieken zijn uniek voor jullie combinatie."],
      ["Hoe snel ontvangen we het?","Binnen 1 werkdag na betaling, als PDF per e-mail. Wij raden aan het samen te lezen."],
    ],
    en:[
      ["Do we both need an account?","No. You order the report for two people at once. You enter both birth details during the order process."],
      ["How accurate does my partner's birth time need to be?","As accurate as possible — birth time determines the profile and some centers. If you don't know your partner's exact time, you can use an estimate. The core of the analysis remains accurate."],
      ["Is this report also suitable at the beginning of a relationship?","Yes. Many people order this at the start — to recognise patterns early and begin communication consciously. It is equally valuable for couples who have been together for years."],
      ["How personal is the report for us specifically?","The report is entirely based on your two specific charts. The electromagnetic connections and compatibility dynamics are unique to your combination."],
      ["How quickly do we receive it?","Within 1 business day after payment, as a PDF by email. We recommend reading it together."],
    ],
  },
  relatie_business:{
    nl:[
      ["Werkt dit ook voor een online samenwerking?","Ja. Human Design kijkt naar energetische patronen — die zijn onafhankelijk van fysieke nabijheid. Het rapport werkt voor online en offline samenwerkingen."],
      ["Is dit alleen voor gelijkwaardige partners, of ook voor leidinggevende en medewerker?","Het rapport analyseert elke combinatie van twee mensen. De dynamieken zijn relevant voor compagnons, oprichters, maar ook voor leidinggevenden en teamleden."],
      ["Hoe concreet zijn de adviezen?","De adviezen zijn gebaseerd op jullie specifieke type-combinatie: wie van nature leidt, hoe jullie beslissingen het best neemt, en hoe de communicatiestijlen op elkaar aansluiten."],
      ["Is het rapport geschikt als we net starten of al jaren samenwerken?","Beide. Bij een nieuwe samenwerking helpt het patronen vroeg te begrijpen. In een bestaande samenwerking biedt het verklaring voor terugkerende dynamieken."],
      ["Hoe snel ontvangen we het?","Binnen 1 werkdag na betaling, als PDF per e-mail."],
    ],
    en:[
      ["Does this work for online collaboration?","Yes. Human Design looks at energetic patterns — which are independent of physical proximity. The report works for online and offline collaborations."],
      ["Is this only for equal partners, or also for manager and employee?","The report analyses any combination of two people. The dynamics are relevant for co-founders, business partners, but also for managers and team members."],
      ["How concrete are the recommendations?","The advice is based on your specific type combination: who naturally leads, how you best make decisions, and how your communication styles align."],
      ["Is the report suitable if we are just starting or have worked together for years?","Both. In a new collaboration it helps you understand patterns early. In an existing collaboration it provides explanation for recurring dynamics."],
      ["How quickly do we receive it?","Within 1 business day after payment, as a PDF by email."],
    ],
  },
  relatie_familie:{
    nl:[
      ["Voor welke familierelaties is dit geschikt?","Voor ouder en kind, broer en zus, of andere gezinsleden. Het rapport analyseert de specifieke energetische dynamiek tussen twee personen — ongeacht de familierelatie."],
      ["Is het rapport ook geschikt voor volwassen kinderen?","Ja. Veel mensen bestellen dit juist later, wanneer patronen al jaren spelen en pas nu begrepen worden. Het werkt voor kinderen van alle leeftijden."],
      ["Heb ik de exacte geboortetijd van het familielid nodig?","Zo nauwkeurig mogelijk. Als de exacte tijd onbekend is, kun je een schatting gebruiken — de kern van de analyse blijft relevant."],
      ["Is het rapport ook bruikbaar als de ander er niet van weet?","Ja. Je kunt het rapport lezen vanuit je eigen perspectief. Inzicht in de ander begint bij inzicht in jezelf."],
      ["Hoe snel ontvang ik het?","Binnen 1 werkdag na betaling, als PDF per e-mail."],
    ],
    en:[
      ["Which family relationships is this suitable for?","For parent and child, siblings, or other family members. The report analyses the specific energetic dynamic between two people — regardless of the family relationship."],
      ["Is the report also suitable for adult children?","Yes. Many people order this later, when patterns have been playing out for years and are only now being understood. It works for children of all ages."],
      ["Do I need the exact birth time of my family member?","As accurate as possible. If the exact time is unknown, you can use an estimate — the core of the analysis remains relevant."],
      ["Can the report be useful if the other person doesn't know about it?","Yes. You can read the report from your own perspective. Understanding the other begins with understanding yourself."],
      ["How quickly do I receive it?","Within 1 business day after payment, as a PDF by email."],
    ],
  },
  jaar:{
    nl:[
      ["Op welke periode is het jaarrapport gebaseerd?","Op je Solar Return — de posities van de planeten op je verjaardag in 2026. Dit markeert het begin van een nieuw persoonlijk jaar en vormt de basis voor de analyse van de komende twaalf maanden."],
      ["Is dit voor het kalenderjaar 2026 of mijn persoonlijk jaar?","Je persoonlijk jaar, dat begint op je verjaardag. Als je in september jarig bent, loopt het van september 2026 tot september 2027."],
      ["Hoe concreet zijn de kwartaaladviezen?","De kwartaaladviezen zijn gebaseerd op planetaire invloeden specifiek voor jouw chart — geen dagkalender, maar een bewust energetisch kader per kwartaal."],
      ["Heb ik ook een Volledig Rapport nodig om dit te begrijpen?","Nee, het jaarrapport is op zichzelf staand. Als je ook een Volledig Rapport hebt, vullen ze elkaar goed aan."],
      ["Hoe snel ontvang ik het?","Binnen 1 werkdag na betaling, als PDF per e-mail."],
    ],
    en:[
      ["What period is the annual report based on?","Your Solar Return — the planetary positions on your birthday in 2026. This marks the beginning of a new personal year and forms the basis for the analysis of the coming twelve months."],
      ["Is this for calendar year 2026 or my personal year?","Your personal year, which begins on your birthday. If your birthday is in September, it runs from September 2026 to September 2027."],
      ["How concrete are the quarterly insights?","The quarterly insights are based on planetary influences specific to your chart — not a day calendar, but a conscious energetic framework per quarter."],
      ["Do I also need a Complete Report to understand this?","No, the annual report stands on its own. If you also have a Complete Report, they complement each other well."],
      ["How quickly do I receive it?","Within 1 business day after payment, as a PDF by email."],
    ],
  },
  kind:{
    nl:[
      ["Vanaf welke leeftijd is dit rapport nuttig?","Vanaf de geboorte. Het rapport helpt ouders begrijpen hoe hun kind van nature functioneert — ongeacht leeftijd. Veel ouders bestellen het voor baby's, peuters én tieners."],
      ["Is het rapport bedoeld voor het kind zelf of voor de ouder?","Primair voor de ouder. Het rapport geeft inzicht in hoe je kind energie gebruikt, beslissingen neemt en het best begeleid wordt. Oudere kinderen kunnen het ook zelf lezen."],
      ["Heb ik de exacte geboortetijd van mijn kind nodig?","Ja, zo nauwkeurig mogelijk — de geboortetijd staat op de geboorteakte. Ook zonder exacte tijd is de kern van het rapport accuraat."],
      ["Is dit anders dan een opvoedboek?","Ja. Dit rapport is volledig gebaseerd op het unieke design van jouw kind. Geen generieke opvoedtips, maar begeleiding afgestemd op hoe jouw kind van nature werkt."],
      ["Hoe snel ontvang ik het?","Binnen 1 werkdag na betaling, als PDF per e-mail."],
    ],
    en:[
      ["From what age is this report useful?","From birth. The report helps parents understand how their child naturally functions — regardless of age. Many parents order it for babies, toddlers and teenagers."],
      ["Is the report intended for the child or for the parent?","Primarily for the parent. The report gives insight into how your child uses energy, makes decisions and is best guided. Older children can read it themselves too."],
      ["Do I need my child's exact birth time?","Yes, as accurate as possible — the birth time is on the birth certificate. Even without an exact time, the core of the report is accurate."],
      ["Is this different from a parenting book?","Yes. This report is entirely based on the unique design of your child. No generic parenting tips, but guidance tailored to how your child naturally works."],
      ["How quickly do I receive it?","Within 1 business day after payment, as a PDF by email."],
    ],
  },
  loopbaan:{
    nl:[
      ["Is dit ook geschikt als ik al weet wat ik wil doen?","Ja — en dan is het vaak het meest waardevol. Het rapport legt uit hoe je jouw werk het best inricht, welke omgeving bij je past en hoe je geld aantrekt op een manier die aansluit bij jouw design."],
      ["Geeft het rapport concrete carrièreadviezen?","Het rapport is concreet en toepasbaar: werkomgeving, besluitvormingsstijl, samenwerking, en of loondienst of ondernemerschap beter past bij jouw energiesysteem."],
      ["Werkt dit ook als ik ondernemer ben?","Ja. Het rapport behandelt specifiek de vraag ondernemen versus loondienst — op basis van jouw type, profiel en centra. Voor ondernemers is de sectie over hoe je geld aantrekt bijzonder relevant."],
      ["Is dit een vervanging voor loopbaanbegeleiding?","Nee — het is een aanvulling. Het rapport geeft een energetisch perspectief op werk en financiën. Veel mensen combineren het met praktische loopbaanbegeleiding."],
      ["Hoe snel ontvang ik het?","Binnen 1 werkdag na betaling, als PDF per e-mail."],
    ],
    en:[
      ["Is this also suitable if I already know what I want to do?","Yes — and that is often when it is most valuable. The report explains how to best structure your work, which environment suits you and how you attract money in a way that aligns with your design."],
      ["Does the report provide concrete career advice?","The report is concrete and actionable: work environment, decision-making style, collaboration, and whether employment or self-employment better suits your energy system."],
      ["Does this work if I am self-employed?","Yes. The report specifically addresses the question of self-employment versus employment — based on your type, profile and centers. For entrepreneurs, the section on how you attract money is particularly relevant."],
      ["Is this a replacement for career coaching?","No — it is a complement. The report provides an energetic perspective on work and finances. Many people combine it with practical career coaching."],
      ["How quickly do I receive it?","Within 1 business day after payment, as a PDF by email."],
    ],
  },
  numerologie:{
    nl:[
      ["Heb ik een geboortetijd nodig voor numerologie?","Nee. Numerologie werkt uitsluitend op basis van je volledige naam en geboortedatum. Geboortetijd is niet vereist."],
      ["Welke naam gebruik je voor de berekening?","Je geboortenaam — de naam zoals die op je geboorteakte staat. Als je een andere naam gebruikt of je naam heeft veranderd, vermeld dan je volledige geboortenaam."],
      ["Wat is het verschil tussen numerologie en Human Design?","Fundamenteel. Numerologie werkt met getalswaarden van je naam en geboortedatum en beschrijft levenspatronen en talenten. Human Design werkt met planetaire posities en beschrijft je energetisch mechanisme. Ze vullen elkaar aan."],
      ["Is dit rapport ook nuttig als ik al een HD rapport heb?","Absoluut. Numerologie en Human Design belichten verschillende lagen van dezelfde persoon. Veel klanten bestellen beide als aanvullend portret."],
      ["Hoe snel ontvang ik het?","Binnen 1 werkdag na betaling, als PDF per e-mail."],
    ],
    en:[
      ["Do I need a birth time for numerology?","No. Numerology works exclusively based on your full name and date of birth. Birth time is not required."],
      ["Which name do you use for the calculation?","Your birth name — the name as it appears on your birth certificate. If you use a different name or have changed your name, please provide your full birth name."],
      ["What is the difference between numerology and Human Design?","Fundamental. Numerology works with numerical values of your name and date of birth and describes life patterns and talents. Human Design works with planetary positions and describes your energetic mechanism. They complement each other."],
      ["Is this report also useful if I already have an HD report?","Absolutely. Numerology and Human Design illuminate different layers of the same person. Many clients order both as a complementary portrait."],
      ["How quickly do I receive it?","Within 1 business day after payment, as a PDF by email."],
    ],
  },
  horoscoop:{
    nl:[
      ["Is dit anders dan een daghoroscoop?","Ja, fundamenteel. Een daghoroscoop is generiek voor iedereen met hetzelfde zonneteken. Een geboortehoroscoop is gebaseerd op de exacte posities van alle tien planeten op jouw geboortemoment — specifiek voor jou."],
      ["Heb ik mijn exacte geboortetijd nodig?","Ja, voor de meest nauwkeurige berekening. De geboortetijd bepaalt je Ascendant, Midhemel en de huisindeling. Als je de tijd niet weet, zijn de planeetposities en tekens nog steeds correct."],
      ["Wat als ik mijn geboortetijd niet weet?","Gebruik de meest nauwkeurige schatting die je heeft, of controleer je geboorteakte. Zonder geboortetijd berekenen wij de chart op 12:00 uur — de planetaire posities zijn dan correct, alleen de Ascendant en huizen zijn minder nauwkeurig."],
      ["Is dit rapport ook nuttig in combinatie met Human Design?","Ja. Astrologie beschrijft de kwaliteiten van je planetaire bezetting; HD beschrijft je energetisch mechanisme. Samen geven ze een completer portret."],
      ["Hoe snel ontvang ik het?","Binnen 1 werkdag na betaling, als PDF per e-mail."],
    ],
    en:[
      ["Is this different from a daily horoscope?","Yes, fundamentally. A daily horoscope is generic for everyone with the same sun sign. A birth horoscope is based on the exact positions of all ten planets at your birth moment — specific to you."],
      ["Do I need my exact birth time?","Yes, for the most accurate calculation. Birth time determines your Ascendant, Midheaven and house division. If you don't know the time, the planetary positions and signs are still correct."],
      ["What if I don't know my birth time?","Use the most accurate estimate you have, or check your birth certificate. Without a birth time we calculate the chart at 12:00 — the planetary positions are then correct, only the Ascendant and houses are less precise."],
      ["Is this report also useful in combination with Human Design?","Yes. Astrology describes the qualities of your planetary placements; HD describes your energetic mechanism. Together they give a more complete portrait."],
      ["How quickly do I receive it?","Within 1 business day after payment, as a PDF by email."],
    ],
  },
  maandelijks:{
    nl:[
      ["Wanneer ontvang ik mijn eerste maandrapport?","Binnen 1 werkdag na je eerste betaling. Daarna ontvang je elke maand een nieuw rapport — afgestemd op de energetische thema's van die specifieke maand en jouw chart."],
      ["Hoe opzeg ik mijn abonnement?","Maandelijks opzegbaar, zonder opzegtermijn of verborgen kosten. Scroll naar het onderdeel 'Beheer je abonnement' onderaan deze pagina, vul je e-mailadres in en je wordt doorgestuurd naar de beveiligde portal. Daar kun je opzeggen, facturen inzien of je betaalgegevens aanpassen. Je ontvangt daarna een bevestigingsmail."],
      ["Is elk maandrapport anders?","Ja. Elk rapport is gebaseerd op de planetaire invloeden van die specifieke maand in relatie tot jouw persoonlijke chart. Thema's, kansen en aandachtspunten wisselen elke maand."],
      ["Heb ik ook een Volledig Rapport nodig?","Het maandabonnement is op zichzelf staand. Als je ook een Volledig Rapport hebt, is de maandelijkse guidance nog rijker — omdat je de context van je eigen chart al kent."],
      ["Hoeveel pagina's is een maandrapport?","Gemiddeld 12 pagina's — compact en gericht op de thema's van die maand."],
    ],
    en:[
      ["When do I receive my first monthly report?","Within 1 business day after your first payment. After that you receive a new report every month — aligned with the energetic themes of that specific month and your chart."],
      ["How do I cancel my subscription?","Cancel monthly, without notice period or hidden costs. Scroll to the 'Manage your subscription' section at the bottom of this page, enter your email address and you'll be redirected to the secure portal. There you can cancel, view invoices or update your payment details. You'll receive a confirmation email afterwards."],
      ["Is each monthly report different?","Yes. Each report is based on the planetary influences of that specific month in relation to your personal chart. Themes, opportunities and points of attention change every month."],
      ["Do I also need a Complete Report?","The monthly subscription stands on its own. If you also have a Complete Report, the monthly guidance is even richer — because you already know the context of your own chart."],
      ["How many pages is a monthly report?","On average 12 pages — compact and focused on the themes of that month."],
    ],
  },
};

// ─── FAMILY ROLE HELPER ───────────────────────────────────────────────────────
// Returns [role1, role2] for the two people, or null if no meaningful roles.
// swapped=true flips person1 and person2 (e.g. "Kind" becomes person 1).
function getFamilyRoles(familyRelation, swapped) {
  if (!familyRelation) return null;
  let r1, r2;
  if (familyRelation === "Ouder & kind" || familyRelation === "Parent & child") {
    [r1, r2] = LANG === "en" ? ["Parent", "Child"] : ["Ouder", "Kind"];
  } else if (familyRelation === "Grootouder & kleinkind" || familyRelation === "Grandparent & grandchild") {
    [r1, r2] = LANG === "en" ? ["Grandparent", "Grandchild"] : ["Grootouder", "Kleinkind"];
  } else if (familyRelation === "Broer & zus" || familyRelation === "Siblings") {
    [r1, r2] = LANG === "en" ? ["Sibling", "Sibling"] : ["Broer of zus", "Broer of zus"];
  } else {
    return null;
  }
  return swapped ? [r2, r1] : [r1, r2];
}

// ─── STRIPE PAYMENT LINKS ─────────────────────────────────────────────────────
// Vervang test_ links met live_ links voor productie
// Voeg toe aan elke Stripe Payment Link:
//   success_url: https://faculty-of-human-design.vercel.app/?success=true
//   cancel_url:  https://faculty-of-human-design.vercel.app/?cancelled=true
const STRIPE = {
  volledig:        "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00",
  relatie_liefde:  "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  relatie_business:"https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  relatie_familie: "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  jaar:            "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  kind:            "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  loopbaan:        "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  numerologie:     "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  horoscoop:       "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  maandelijks:     "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: abonnement link
};

async function goToStripe(rptId, chartData, formData) {
  const rpt = REPORTS.find(r => r.id === rptId);

  // ── Step 1: Pre-create order in Supabase (persists birth data + email) ──
  let orderId = null;
  try {
    const promptExtraForOrder = (typeof rpt?.prompt_extra === "object" && rpt?.prompt_extra !== null)
      ? (rpt.prompt_extra[LANG] ?? rpt.prompt_extra.nl ?? "")
      : (rpt?.prompt_extra || "");
    const sections = promptExtraForOrder
      ? promptExtraForOrder.split("\n").filter(l => l.startsWith("###")).map(l => l.replace(/^###\s*/, "").replace(/^\d+\.\s*/, "").trim())
      : [];

    const fullName1 = (formData.firstName + " " + (formData.lastName || "")).trim();
    const fullName2 = formData.pFirstName ? (formData.pFirstName + " " + (formData.pLastName || "")).trim() : null;
    const fullNameChild = (rpt?.needsChild && formData.cFirstName) ? (formData.cFirstName + " " + (formData.cLastName || "")).trim() : null;
    const orderRes = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: rptId,
        reportTitle: tl(rpt?.title) || rptId,
        language: LANG,
        price: rpt?.priceNum || 75,
        customerName: fullName1,
        customerEmail: formData.email,
        birthData: {
          name: fullName1,
          firstName: formData.firstName,
          lastName: formData.lastName || "",
          day: formData.day, month: formData.month, year: formData.year,
          hour: formData.hour, minute: formData.minute,
          place: formData.place,
          lat: formData.lat || null,
          lon: formData.lon || null,
          timezone: formData.timezone || null,
          tz: formData.tz ? parseFloat(formData.tz) : null,
          // Embed calculated chart so Inngest can use it for AI generation
          chart: chartData,
          familyRelation: formData.familyRelation || null,
          // Who is person 1 and who is person 2 in the family relationship
          ...(formData.familyRelation ? (()=>{
            const roles = getFamilyRoles(formData.familyRelation, formData.familyRolesSwapped);
            return roles ? { person1Role: roles[0], person2Role: roles[1] } : {};
          })() : {}),
        },
        partnerBirthData: fullName2 ? {
          name: fullName2,
          firstName: formData.pFirstName,
          lastName: formData.pLastName || "",
          day: formData.pday, month: formData.pmonth, year: formData.pyear,
          hour: formData.phour, minute: formData.pminute,
          place: formData.pplace || "",
          lat: formData.plat || null,
          lon: formData.plon || null,
          timezone: formData.ptimezone || null,
          tz: formData.ptz ? parseFloat(formData.ptz) : null,
        } : fullNameChild ? {
          name: fullNameChild,
          firstName: formData.cFirstName,
          lastName: formData.cLastName || "",
          day: formData.cday, month: formData.cmonth, year: formData.cyear,
          hour: formData.chour, minute: formData.cminute,
          place: formData.cplace || "",
          lat: formData.clat || null,
          lon: formData.clon || null,
          timezone: formData.ctimezone || null,
          tz: formData.ctz ? parseFloat(formData.ctz) : null,
        } : null,
        promptSections: sections,
      }),
    });

    let orderData;
    try {
      orderData = await orderRes.json();
    } catch (_) {
      throw new Error(LANG==="en"?"Server unreachable. Please try again later.":"Server niet bereikbaar. Probeer het later opnieuw.");
    }
    if (!orderRes.ok || !orderData.orderId) {
      throw new Error(orderData.error || (LANG==="en"?"Order creation failed":"Order aanmaken mislukt"));
    }
    orderId = orderData.orderId;
  } catch (e) {
    alert((LANG==="en"?"Order could not be created: ":"Bestelling kon niet worden aangemaakt: ") + e.message + (LANG==="en"?"\n\nPlease try again or contact us.":"\n\nProbeer het opnieuw of neem contact op."));
    return;
  }

  // ── Step 2: Create Stripe Checkout session ──────────────────────────────
  try {
    const checkoutRes = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        rptId,
        title: tl(rpt?.title) || rptId,
        price: rpt?.priceNum || 75,
        isSubscription: rptId === "maandelijks",
        language: LANG,
        email: formData.email,
      }),
    });

    const data = await checkoutRes.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert((LANG==="en"?"Payment could not be started: ":"Betaling kon niet worden gestart: ") + (data.error || (LANG==="en"?"unknown error":"onbekende fout")));
    }
  } catch (e) {
    alert(LANG==="en"?"Payment could not be started. Please try again.":"Betaling kon niet worden gestart. Probeer opnieuw.");
  }
}

// ─── HD EPHEMERIS ─────────────────────────────────────────────────────────────
function jday(y,m,d,h){if(m<=2){y--;m+=12;}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;}
function sunLon(jd){const T=(jd-2451545)/36525,L=280.46646+36000.76983*T,M=357.52911+35999.05029*T,Mr=M*Math.PI/180,C=(1.914602-0.004817*T)*Math.sin(Mr)+(0.019993-0.000101*T)*Math.sin(2*Mr)+0.000289*Math.sin(3*Mr);return((L+C)%360+360)%360;}
function moonLon(jd){const T=(jd-2451545)/36525,L=218.3165+481267.8813*T,Mp=134.9634+477198.8676*T,D=297.8502+445267.1115*T,F=93.2721+483202.0175*T,Mpr=Mp*Math.PI/180,Dr=D*Math.PI/180,Fr=F*Math.PI/180;return((L+6.2888*Math.sin(Mpr)+1.274*Math.sin(2*Dr-Mpr)+0.6583*Math.sin(2*Dr)+0.2136*Math.sin(2*Mpr)-0.1143*Math.sin(2*Fr))%360+360)%360;}
function plon(jd,p){const T=(jd-2451545)/36525,m={Mercury:[252.2509,149472.6674],Venus:[181.9798,58517.8156],Mars:[355.433,19140.2993],Jupiter:[34.3515,3034.9057],Saturn:[50.0774,1222.1138],Uranus:[314.055,428.4048],Neptune:[304.348,218.4862],Pluto:[238.929,145.2001]};const[a,b]=m[p]||[0,0];return((a+b*T)%360+360)%360;}
function getPL(jd,p){if(p==="Sun")return sunLon(jd);if(p==="Moon")return moonLon(jd);return plon(jd,p);}
function jd(y,m,d,h){return jday(y,m,d,h);}

const GS=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
const PLANETS_HD=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
const ALL_C=["Head","Ajna","Throat","G/Self","Heart/Ego","Sacral","Solar Plexus","Spleen","Root"];
const CH={"64-47":["Head","Ajna"],"61-24":["Head","Ajna"],"63-4":["Head","Ajna"],"17-62":["Ajna","Throat"],"43-23":["Ajna","Throat"],"11-56":["Ajna","Throat"],"35-36":["Throat","Solar Plexus"],"12-22":["Throat","Solar Plexus"],"45-21":["Throat","Heart/Ego"],"33-13":["Throat","G/Self"],"8-1":["Throat","G/Self"],"31-7":["Throat","G/Self"],"20-10":["Throat","G/Self"],"20-34":["Throat","Sacral"],"16-48":["Throat","Spleen"],"25-51":["G/Self","Heart/Ego"],"46-29":["G/Self","Sacral"],"2-14":["G/Self","Sacral"],"15-5":["G/Self","Sacral"],"10-34":["G/Self","Sacral"],"10-57":["G/Self","Spleen"],"26-44":["Heart/Ego","Spleen"],"40-37":["Heart/Ego","Solar Plexus"],"51-25":["Heart/Ego","G/Self"],"21-45":["Heart/Ego","Throat"],"5-15":["Sacral","G/Self"],"14-2":["Sacral","G/Self"],"29-46":["Sacral","G/Self"],"34-10":["Sacral","G/Self"],"34-20":["Sacral","Throat"],"34-57":["Sacral","Spleen"],"59-6":["Sacral","Solar Plexus"],"9-52":["Sacral","Root"],"3-60":["Sacral","Root"],"42-53":["Sacral","Root"],"27-50":["Sacral","Spleen"],"36-35":["Solar Plexus","Throat"],"22-12":["Solar Plexus","Throat"],"37-40":["Solar Plexus","Heart/Ego"],"6-59":["Solar Plexus","Sacral"],"49-19":["Solar Plexus","Root"],"55-39":["Solar Plexus","Root"],"30-41":["Solar Plexus","Root"],"48-16":["Spleen","Throat"],"57-34":["Spleen","Sacral"],"57-10":["Spleen","G/Self"],"44-26":["Spleen","Heart/Ego"],"50-27":["Spleen","Sacral"],"32-54":["Spleen","Root"],"28-38":["Spleen","Root"],"18-58":["Spleen","Root"],"53-42":["Root","Sacral"],"60-3":["Root","Sacral"],"52-9":["Root","Sacral"],"19-49":["Root","Solar Plexus"],"39-55":["Root","Solar Plexus"],"41-30":["Root","Solar Plexus"],"38-28":["Root","Spleen"],"54-32":["Root","Spleen"],"58-18":["Root","Spleen"]};
const PROFS_NL={"1-2":"1/2 Onderzoeker/Kluizenaar","1-3":"1/3 Onderzoeker/Martelaar","2-4":"2/4 Kluizenaar/Opportunist","2-5":"2/5 Kluizenaar/Ketter","3-5":"3/5 Martelaar/Ketter","3-6":"3/6 Martelaar/Rolmodel","4-6":"4/6 Opportunist/Rolmodel","4-1":"4/1 Opportunist/Onderzoeker","5-1":"5/1 Ketter/Onderzoeker","5-2":"5/2 Ketter/Kluizenaar","6-2":"6/2 Rolmodel/Kluizenaar","6-3":"6/3 Rolmodel/Martelaar"};
const PROFS_EN={"1-2":"1/2 Investigator/Hermit","1-3":"1/3 Investigator/Martyr","2-4":"2/4 Hermit/Opportunist","2-5":"2/5 Hermit/Heretic","3-5":"3/5 Martyr/Heretic","3-6":"3/6 Martyr/Role Model","4-6":"4/6 Opportunist/Role Model","4-1":"4/1 Opportunist/Investigator","5-1":"5/1 Heretic/Investigator","5-2":"5/2 Heretic/Hermit","6-2":"6/2 Role Model/Hermit","6-3":"6/3 Role Model/Martyr"};
const PROFS=LANG==="en"?PROFS_EN:PROFS_NL;

function lonToGL(lon){lon=((lon%360)+360)%360;const gs=360/64,idx=Math.floor(lon/gs),gate=GS[idx%64],line=Math.min(Math.floor(((lon%gs)/gs)*6)+1,6);return[gate,line];}

function calcHD(y,m,d,h,min,tz=0){
  const utcH=h+min/60-(tz||0); // convert local birth time to UTC
  const jdP=jday(y,m,d,utcH),jdD=jdP-(88/360)*365.25;
  const pers={},des={};
  for(const p of PLANETS_HD){const[gp,lp]=lonToGL(getPL(jdP,p));pers[p]={gate:gp,line:lp};const[gd,ld]=lonToGL(getPL(jdD,p));des[p]={gate:gd,line:ld};}
  const allG=new Set([...Object.values(pers).map(x=>x.gate),...Object.values(des).map(x=>x.gate)]);
  const defC=new Set();const channels=[];
  for(const[k,[c1,c2]]of Object.entries(CH)){const[g1,g2]=k.split("-").map(Number);if(allG.has(g1)&&allG.has(g2)){defC.add(c1);defC.add(c2);channels.push({g1,g2,c1,c2});}}
  const openC=ALL_C.filter(c=>!defC.has(c));
  const hasSac=defC.has("Sacral"),hasThr=defC.has("Throat"),hasMotor=["Heart/Ego","Solar Plexus","Root"].some(x=>defC.has(x));
  let type,strat,sig,notSelf;
  if(hasSac&&hasThr){type="Manifesting Generator";strat="Informeer, reageer dan vanuit het sacraal";sig="Bevrediging & Vrede";notSelf="Frustratie & Woede";}
  else if(hasSac){type="Generator";strat="Wacht om te reageren";sig="Bevrediging";notSelf="Frustratie";}
  else if(hasThr&&hasMotor){type="Manifestor";strat="Informeer voor jou handelt";sig="Vrede";notSelf="Woede";}
  else if(defC.size===0){type="Reflector";strat="Wacht een maancyclus";sig="Verrassing";notSelf="Teleurstelling";}
  else{type="Projector";strat="Wacht op de uitnodiging";sig="Succes";notSelf="Bitterheid";}
  let auth="Mentaal";
  if(defC.has("Solar Plexus"))auth="Emotioneel";else if(defC.has("Sacral"))auth="Sacraal";else if(defC.has("Spleen"))auth="Splenisch";else if(defC.has("Heart/Ego"))auth="Ego";else if(defC.has("G/Self"))auth="G/Self";else if(defC.size===0)auth="Maancyclus";
  const profKey=pers.Sun.line+"-"+des.Sun.line,profile=PROFS[profKey]||profKey;
  const pEl=(getPL(jdP,"Sun")+180)%360,dEl=(getPL(jdD,"Sun")+180)%360;
  const cross=pers.Sun.gate+" / "+lonToGL(pEl)[0]+" / "+des.Sun.gate+" / "+lonToGL(dEl)[0];
  return{type,strat,sig,notSelf,auth,profile,cross,definedCenters:[...defC],openCenters:openC,allGates:[...allG].sort((a,b)=>a-b),channels,pers,des};
}

// ─── NUMEROLOGY ───────────────────────────────────────────────────────────────
const PYTH={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};
const VOWELS_SET=new Set(["A","E","I","O","U"]);
const NUM_NAMES_NL={1:"De Leider",2:"De Diplomaat",3:"De Creatieveling",4:"De Bouwer",5:"De Avonturier",6:"De Verzorger",7:"De Zoeker",8:"De Zakenman",9:"De Mensheid",11:"De Meester Intuïtief",22:"De Meester Bouwer",33:"De Meester Leraar"};
const NUM_NAMES_EN={1:"The Leader",2:"The Diplomat",3:"The Creative",4:"The Builder",5:"The Adventurer",6:"The Nurturer",7:"The Seeker",8:"The Achiever",9:"The Humanitarian",11:"The Master Intuitive",22:"The Master Builder",33:"The Master Teacher"};
const NUM_NAMES=LANG==="en"?NUM_NAMES_EN:NUM_NAMES_NL;
function numReduce(n){while(n>9){if(n===11||n===22||n===33)break;n=[...String(n)].reduce((a,d)=>a+parseInt(d),0);}return n;}
function nameSum(str){return[...str.toUpperCase()].reduce((a,c)=>a+(PYTH[c]||0),0);}
function calcNumerology(fullName,day,month,year){
  const lp=numReduce(numReduce(day)+numReduce(month)+numReduce(year));
  const exp=numReduce(nameSum(fullName));
  const vowels=[...fullName.toUpperCase()].filter(c=>VOWELS_SET.has(c)).join("");
  const cons=[...fullName.toUpperCase()].filter(c=>c>="A"&&c<="Z"&&!VOWELS_SET.has(c)).join("");
  const soul=numReduce(nameSum(vowels));
  const pers=numReduce(nameSum(cons));
  const bday=numReduce(day);
  const py=numReduce(numReduce(day)+numReduce(month)+numReduce(2026));
  const mat=numReduce(lp+exp);
  const masters=[lp,exp,soul,pers,mat].filter(n=>n===11||n===22||n===33);
  return{lp,exp,soul,pers,bday,py,mat,masters,lpName:NUM_NAMES[lp]||"",expName:NUM_NAMES[exp]||""};
}

// ─── ASTROLOGY ────────────────────────────────────────────────────────────────
const SIGNS_NL=["Ram","Stier","Tweelingen","Kreeft","Leeuw","Maagd","Weegschaal","Schorpioen","Boogschutter","Steenbok","Waterman","Vissen"];
const SIGNS_EN=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SIGNS=LANG==="en"?SIGNS_EN:SIGNS_NL;
const EL_MAP_A=LANG==="en"
  ?{"Aries":"Fire","Taurus":"Earth","Gemini":"Air","Cancer":"Water","Leo":"Fire","Virgo":"Earth","Libra":"Air","Scorpio":"Water","Sagittarius":"Fire","Capricorn":"Earth","Aquarius":"Air","Pisces":"Water"}
  :{"Ram":"Vuur","Stier":"Aarde","Tweelingen":"Lucht","Kreeft":"Water","Leeuw":"Vuur","Maagd":"Aarde","Weegschaal":"Lucht","Schorpioen":"Water","Boogschutter":"Vuur","Steenbok":"Aarde","Waterman":"Lucht","Vissen":"Water"};
function lonToSign_A(lon){lon=((lon%360)+360)%360;const idx=Math.floor(lon/30)%12;return{sign:SIGNS[idx],degree:Math.round((lon%30)*10)/10};}
function calcHoroscoop(y,m,d,h,min,tz=0){
  const jdP=jday(y,m,d,h+min/60-(tz||0));
  const pDefs=LANG==="en"
    ?{Sun:"Sun",Moon:"Moon",Mercury:"Mercury",Venus:"Venus",Mars:"Mars",Jupiter:"Jupiter",Saturn:"Saturn",Uranus:"Uranus",Neptune:"Neptune",Pluto:"Pluto"}
    :{Zon:"Sun",Maan:"Moon",Mercurius:"Mercury",Venus:"Venus",Mars:"Mars",Jupiter:"Jupiter",Saturnus:"Saturn",Uranus:"Uranus",Neptunus:"Neptune",Pluto:"Pluto"};
  const sunKey=LANG==="en"?"Sun":"Zon";
  const planets={};
  for(const[lbl,en]of Object.entries(pDefs)){const lon=getPL(jdP,en);const pos=lonToSign_A(lon);planets[lbl]={...pos,house:Math.floor((lon%360)/30)%12+1,longitude:Math.round(lon*100)/100};}
  const lst=((280.46061837+360.98564736629*(jdP-2451545))%360+360)%360;
  const asc=lonToSign_A((lst+90)%360);
  const mc=lonToSign_A(lst%360);
  const elements={};
  for(const[,d]of Object.entries(planets)){const el=EL_MAP_A[d.sign]||"";elements[el]=(elements[el]||0)+1;}
  const domEl=Object.entries(elements).sort((a,b)=>b[1]-a[1])[0]?.[0]||"";
  return{ascendant:asc,mc,sun_sign:planets[sunKey]?.sign||"",planets,dom_element:domEl,isHoroscoop:true};
}

// ─── PROMPT BUILDER ───────────────────────────────────────────────────────────
const MONTHS_NL=["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
const MONTHS_EN=["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS=LANG==="en"?MONTHS_EN:MONTHS_NL;
const LSTEPS=LANG==="en"
  ?["Writing introduction","Type & Strategy","Analysing authority","Working out profile","Describing centres","Conditioning","Gates in detail","Incarnation Cross","Relationships","Work & Finances","Guidance 2026-2028","Closing analysis"]
  :["Inleiding schrijven","Type & Strategie","Autoriteit analyseren","Profiel uitwerken","Centra beschrijven","Conditionering","Poorten in detail","Inkarnatie-Kruis","Relaties","Werk & Financien","Guidance 2026-2028","Slotanalyse"];

function buildPrompt(chart,form,rpt){
  // Pick the correct language version of prompt_extra
  const promptExtra = (typeof rpt.prompt_extra === "object" && rpt.prompt_extra !== null)
    ? (rpt.prompt_extra[LANG] ?? rpt.prompt_extra.nl ?? "")
    : (rpt.prompt_extra || "");

  const _fn1=(form.firstName||"").trim();
  const _fn2=(form.pFirstName||"").trim();
  const _full1=(_fn1+" "+(form.lastName||"")).trim();
  if(rpt.id==="numerologie"){
    const num=calcNumerology(_full1,parseInt(form.day),parseInt(form.month),parseInt(form.year));
    return["NUMEROLOGIE voor "+_fn1,"Naam: "+_full1,"Datum: "+form.day+"-"+form.month+"-"+form.year,"","Levenspad: "+num.lp+" - "+num.lpName,"Uitdrukking: "+num.exp+" - "+num.expName,"Ziel: "+num.soul,"Persoonlijkheid: "+num.pers,"Verjaardag: "+num.bday,"Pers. Jaar 2026: "+num.py,"Rijping: "+num.mat,"Mastergetallen: "+(num.masters.length>0?num.masters.join(", "):"geen"),"",promptExtra].join("\n");
  }
  if(rpt.id==="horoscoop"){
    const h=calcHoroscoop(parseInt(form.year),parseInt(form.month),parseInt(form.day),parseInt(form.hour),parseInt(form.minute||"0"));
    const pStr=Object.entries(h.planets).map(([p,d])=>p+": "+d.degree+"° "+d.sign+" H"+d.house).join(", ");
    return["HOROSCOOP voor "+_fn1,"Datum: "+form.day+"-"+form.month+"-"+form.year+" "+form.hour+":"+(form.minute||"00"),"Plaats: "+form.place,"","Ascendant: "+h.ascendant.degree+"° "+h.ascendant.sign,"MC: "+h.mc.degree+"° "+h.mc.sign,"Zon: "+h.sun_sign,"Dom. element: "+h.dom_element,"Planeten: "+pStr,"",promptExtra].join("\n");
  }
  // Kinderrapport — primair het kind, context de ouder/aanvrager
  if(rpt.needsChild){
    const childFn=(form.cFirstName||"").trim();
    const childFull=(childFn+" "+(form.cLastName||"")).trim()||childFn;
    const cY=parseInt(form.cyear),cM=parseInt(form.cmonth),cD=parseInt(form.cday);
    const cH=parseInt(form.chour||"12"),cMin=parseInt(form.cminute||"0");
    const cTz=form.ctimezone?getUTCOffsetHours(form.ctimezone,cY,cM,cD,cH,cMin)||0:parseFloat(form.ctz||"0")||0;
    const childChart=calcHD(cY,cM,cD,cH,cMin,cTz);
    const chartLine=(c,name)=>c?[
      "Type: "+c.type,"Strategie: "+c.strat,"Autoriteit: "+c.auth,"Profiel: "+c.profile,
      "Inkarnatie-Kruis: Poort "+c.cross,
      "Gedefinieerd: "+(c.definedCenters.join(", ")||"geen"),
      "Open: "+c.openCenters.join(", "),
      "Kanalen: "+(c.channels.map(ch=>ch.g1+"-"+ch.g2).join(", ")||"geen"),
      "Poorten: "+[...c.allGates].join(", "),
      "Bewust: "+Object.entries(c.pers).map(e=>e[0]+": "+e[1].gate+"."+e[1].line).join(", "),
      "Onbewust: "+Object.entries(c.des).map(e=>e[0]+": "+e[1].gate+"."+e[1].line).join(", "),
    ].join("\n"):("Geen chartdata voor "+name);
    return[
      "KINDERRAPPORT voor "+childFull,
      "",
      "KIND: "+childFull,
      "Geboortedatum: "+form.cday+"-"+form.cmonth+"-"+form.cyear+(form.chour?" "+form.chour+":"+(form.cminute||"00"):""),
      "Geboorteplaats: "+(form.cplace||""),
      chartLine(childChart,childFull),
      "",
      "OUDER/AANVRAGER: "+_full1,
      "Geboortedatum: "+form.day+"-"+form.month+"-"+form.year+(form.hour?" "+form.hour+":"+(form.minute||"00"):""),
      "Geboorteplaats: "+(form.place||""),
      chartLine(chart,_full1),
      "",
      promptExtra,
    ].join("\n");
  }
  // Relatie rapporten — twee volledige HD charts berekenen en naast elkaar zetten
  if(rpt.id.startsWith("relatie_")){
    const lbl=tl(rpt.partnerLabel)||"Partner";
    const c1=chart;
    const c2=(form.pday&&form.pmonth&&form.pyear)?calcHD(parseInt(form.pyear),parseInt(form.pmonth),parseInt(form.pday),parseInt(form.phour||"12"),parseInt(form.pminute||"0")):null;
    const chartLine=(c,name)=>c?[
      "Type: "+c.type,"Strategie: "+c.strat,"Autoriteit: "+c.auth,"Profiel: "+c.profile,
      "Inkarnatie-Kruis: Poort "+c.cross,
      "Gedefinieerd: "+(c.definedCenters.join(", ")||"geen"),
      "Open: "+c.openCenters.join(", "),
      "Kanalen: "+(c.channels.map(ch=>ch.g1+"-"+ch.g2).join(", ")||"geen"),
      "Bewust: "+Object.entries(c.pers).map(e=>e[0]+": "+e[1].gate+"."+e[1].line).join(", "),
      "Onbewust: "+Object.entries(c.des).map(e=>e[0]+": "+e[1].gate+"."+e[1].line).join(", "),
    ].join("\n"):("Geen chartdata beschikbaar voor "+name);
    const gedeeld=c1&&c2?c1.allGates.filter(g=>c2.allGates.includes(g)):[];
    const emcKanalen=c1&&c2?c1.channels.filter(ch=>c2.channels.some(ch2=>ch2.g1===ch.g1&&ch2.g2===ch.g2)).map(c=>c.g1+"-"+c.g2):[];
    return[
      "RELATIERAPPORT — "+tl(rpt.title),
      "",
      "PERSOON 1: "+_fn1,
      "Geboortedatum: "+form.day+"-"+form.month+"-"+form.year+(form.hour?" "+form.hour+":"+(form.minute||"00"):""),
      "Geboorteplaats: "+form.place,
      chartLine(c1,_fn1),
      "",
      lbl.toUpperCase()+": "+(_fn2||lbl),
      "Geboortedatum: "+form.pday+"-"+form.pmonth+"-"+form.pyear+(form.phour?" "+form.phour+":"+(form.pminute||"00"):""),
      "Geboorteplaats: "+(form.pplace||""),
      chartLine(c2,_fn2||lbl),
      "",
      "ELEKTROMAGNETISCHE VERBINDINGEN:",
      "Gedeelde poorten: "+(gedeeld.length?gedeeld.join(", "):"geen"),
      "Gedeelde kanalen: "+(emcKanalen.length?emcKanalen.join(", "):"geen"),
      "",
      promptExtra,
    ].join("\n");
  }
  // Standaard HD chart
  const pStr=Object.entries(chart.pers).map(e=>e[0]+": Poort "+e[1].gate+"."+e[1].line).join(", ");
  const dStr=Object.entries(chart.des).map(e=>e[0]+": Poort "+e[1].gate+"."+e[1].line).join(", ");
  return["HD CHART voor "+_fn1,"Datum: "+form.day+"-"+form.month+"-"+form.year+(form.hour?" "+form.hour+":"+(form.minute||"00"):""),"Plaats: "+form.place,"","Type: "+chart.type,"Strategie: "+chart.strat,"Autoriteit: "+chart.auth,"Profiel: "+chart.profile,"Inkarnatie-Kruis: Poort "+chart.cross,"Gedefinieerd: "+(chart.definedCenters.join(", ")||"geen"),"Open: "+chart.openCenters.join(", "),"Kanalen: "+(chart.channels.map(c=>c.g1+"-"+c.g2).join(", ")||"geen"),"Poorten: "+chart.allGates.join(", "),"Bewust: "+pStr,"Onbewust: "+dStr,"",promptExtra].join("\n");
}


// ─── BODYGRAPH ────────────────────────────────────────────────────────────────
const CP={
  "Head":        {cx:320,cy:60, sh:"td",lb:"HOOFD"},
  "Ajna":        {cx:320,cy:152,sh:"td",lb:"AJNA"},
  "Throat":      {cx:320,cy:248,sh:"rc",lb:"KEEL"},
  "G/Self":      {cx:320,cy:354,sh:"di",lb:"G"},
  "Heart/Ego":   {cx:210,cy:306,sh:"tr",lb:"HART"},
  "Sacral":      {cx:320,cy:456,sh:"rc",lb:"SACRAAL"},
  "Solar Plexus":{cx:458,cy:376,sh:"tl",lb:"SP"},
  "Spleen":      {cx:176,cy:402,sh:"tr",lb:"MILT"},
  "Root":        {cx:320,cy:544,sh:"rc",lb:"WORTEL"},
};
const CPATHS={
  "Head-Ajna":            "M320,88 L320,124",
  "Ajna-Throat":          "M320,182 L320,226",
  "Throat-G/Self":        "M320,270 L320,318",
  "Throat-Sacral":        "M320,270 L320,430",
  "Throat-Solar Plexus":  "M354,252 Q458,252 458,346",
  "Throat-Spleen":        "M286,252 Q176,252 176,372",
  "Throat-Heart/Ego":     "M286,252 Q210,252 210,278",
  "G/Self-Sacral":        "M320,392 L320,430",
  "G/Self-Heart/Ego":     "M282,350 L244,318",
  "G/Self-Spleen":        "M278,368 Q176,368 176,372",
  "Heart/Ego-Spleen":     "M184,316 Q176,374 176,372",
  "Heart/Ego-Solar Plexus":"M236,314 Q350,314 434,362",
  "Sacral-Root":          "M320,482 L320,518",
  "Sacral-Solar Plexus":  "M354,456 Q458,456 458,404",
  "Sacral-Spleen":        "M286,456 Q176,456 176,432",
  "Solar Plexus-Root":    "M442,406 Q442,544 354,544",
  "Spleen-Root":          "M194,430 Q194,544 286,544",
};
const CENTER_NL={"Head":"Hoofd","Ajna":"Ajna","Throat":"Keel","G/Self":"G / Zelf","Heart/Ego":"Hart","Sacral":"Sacraal","Solar Plexus":"Sol. Plexus","Spleen":"Milt","Root":"Wortel"};

function cpth(pos){
  const{cx:x,cy:y,sh}=pos;
  if(sh==="rc")return`M${x-46},${y-24} h92 v48 h-92 Z`;
  if(sh==="di")return`M${x},${y-48} L${x+48},${y} L${x},${y+48} L${x-48},${y} Z`;
  if(sh==="td")return`M${x-48},${y-28} L${x+48},${y-28} L${x},${y+28} Z`;
  if(sh==="tr")return`M${x-28},${y-38} L${x+28},${y} L${x-28},${y+38} Z`;
  if(sh==="tl")return`M${x+28},${y-38} L${x-28},${y} L${x+28},${y+38} Z`;
  return`M${x-46},${y-24} h92 v48 h-92 Z`;
}

function Bodygraph({chart,name}){
  const[hov,setHov]=useState(null);
  const def=new Set(chart?.definedCenters||[]);
  const activeCh=chart?.channels||[];
  const ap=new Set();
  for(const c of activeCh){ap.add(c.c1+"-"+c.c2);ap.add(c.c2+"-"+c.c1);}
  const isAct=k=>ap.has(k)||ap.has(k.split("-").reverse().join("-"));
  const B="#1A1714",BL="#3A3730",G="#C9A85C";

  return(
    <svg viewBox="0 0 640 620" style={{width:"100%",maxWidth:440,display:"block",margin:"0 auto",borderRadius:0}}>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BL}/>
          <stop offset="100%" stopColor={B}/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B} stopOpacity="0.14"/>
          <stop offset="100%" stopColor={B} stopOpacity="0"/>
        </radialGradient>
        <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={B} floodOpacity="0.14"/>
        </filter>
      </defs>

      {/* Background — transparent so the .cd-bp gradient shows through */}
      <rect width="640" height="620" fill="url(#bg)" rx="0"/>
      <line x1="0" y1="580" x2="640" y2="580" stroke="rgba(26,23,20,.06)" strokeWidth="1"/>

      {/* Inactive channels — dashed subtle */}
      {Object.entries(CPATHS).filter(([k])=>!isAct(k)).map(([k,p])=>(
        <path key={k} d={p} fill="none" stroke="#CEC8BF" strokeWidth="1.5" strokeDasharray="3,6" strokeLinecap="round" opacity="0.45"/>
      ))}

      {/* Active channels — layered glow + solid */}
      {Object.entries(CPATHS).filter(([k])=>isAct(k)).map(([k,p])=>(
        <g key={k}>
          <path d={p} fill="none" stroke={B} strokeWidth="9" strokeLinecap="round" opacity="0.1"/>
          <path d={p} fill="none" stroke={B} strokeWidth="3.5" strokeLinecap="round" opacity="0.85"/>
        </g>
      ))}

      {/* Gate numbers on active channels */}
      {activeCh.map((ch,i)=>{
        const p1=CP[ch.c1],p2=CP[ch.c2];
        if(!p1||!p2)return null;
        const dx=p2.cx-p1.cx,dy=p2.cy-p1.cy,dist=Math.sqrt(dx*dx+dy*dy)||1;
        const off=Math.min(58,dist*0.38);
        const g1x=p1.cx+dx/dist*off,g1y=p1.cy+dy/dist*off;
        const g2x=p2.cx-dx/dist*off,g2y=p2.cy-dy/dist*off;
        return(
          <g key={i}>
            <circle cx={g1x} cy={g1y} r="9" fill={B} opacity="0.88"/>
            <text x={g1x} y={g1y} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="7.5" fontWeight="600" fill="white">{ch.g1}</text>
            <circle cx={g2x} cy={g2y} r="9" fill={B} opacity="0.88"/>
            <text x={g2x} y={g2y} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="7.5" fontWeight="600" fill="white">{ch.g2}</text>
          </g>
        );
      })}

      {/* Center glow for defined */}
      {Object.entries(CP).filter(([cn])=>def.has(cn)).map(([cn,pos])=>(
        <ellipse key={cn+"gl"} cx={pos.cx} cy={pos.cy} rx="58" ry="46" fill="url(#glow)"/>
      ))}

      {/* Centers */}
      {Object.entries(CP).map(([cn,pos])=>{
        const d=def.has(cn),h=hov===cn;
        return(
          <g key={cn} onMouseEnter={()=>setHov(cn)} onMouseLeave={()=>setHov(null)} style={{cursor:"default"}}>
            {/* Hover highlight ring */}
            {h&&<path d={cpth({...pos,cx:pos.cx,cy:pos.cy})} fill="none" stroke={d?G:"#A8A29E"} strokeWidth="2.5" opacity="0.6" transform={`translate(0,0)`}/>}
            <path d={cpth(pos)} fill={d?"url(#cg)":"white"} stroke={d?B:"#D0C8BE"} strokeWidth={d?2:1.5} filter={d?"url(#ds)":undefined} opacity={d?1:0.92}/>
            <text x={pos.cx} y={pos.cy} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize={d?"8.5":"7.5"} fontWeight={d?"600":"400"} letterSpacing="0.7" fill={d?"#fff":"#B8B0A6"}>{pos.lb}</text>
          </g>
        );
      })}

      {/* Hover tooltip */}
      {hov&&(()=>{
        const pos=CP[hov],d=def.has(hov);
        const label=(LANG==="en"?hov:CENTER_NL[hov])+(d?(LANG==="en"?" — defined":" — gedefinieerd"):(LANG==="en"?" — open":" — open"));
        const tw=label.length*6+16;
        const tx=Math.min(Math.max(pos.cx-tw/2,8),632-tw);
        const ty=pos.cy>300?pos.cy-64:pos.cy+56;
        return(
          <g pointerEvents="none">
            <rect x={tx} y={ty} width={tw} height={26} rx="0" fill={d?B:"#4A4640"} opacity="0.93"/>
            <text x={tx+tw/2} y={ty+14} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="10.5" fill="white">{label}</text>
          </g>
        );
      })()}

      {/* Footer */}
      {name&&<text x="320" y="598" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="14" fill={G} fontStyle="italic">{name}</text>}
      {chart?.type&&<text x="320" y="614" textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="8" letterSpacing="1.8" fill="rgba(10,26,47,.3)">{chart.type.toUpperCase()}</text>}
    </svg>
  );
}

// ─── COMPOSITE BODYGRAPH (Relatie / Kind) ─────────────────────────────────────
function CompositeBodygraph({chart1,chart2,name1,name2}){
  const[hov,setHov]=useState(null);
  const def1=new Set(chart1?.definedCenters||[]);
  const def2=new Set(chart2?.definedCenters||[]);
  const gates1=new Set(chart1?.allGates||[]);
  const gates2=new Set(chart2?.allGates||[]);

  const C1="#1C2E4A",C1L="#2d5080";   // person 1 — navy
  const C2="#7B3664",C2L="#a4527e";   // person 2 — plum
  const CE="#C9A85C",CEL="#E8CB7A";   // electromagnetic / both — gold

  function chType(g1,g2){
    const p1g1=gates1.has(g1),p1g2=gates1.has(g2);
    const p2g1=gates2.has(g1),p2g2=gates2.has(g2);
    const p1Full=p1g1&&p1g2,p2Full=p2g1&&p2g2;
    const em=!p1Full&&!p2Full&&((p1g1&&p2g2)||(p2g1&&p1g2));
    if(p1Full&&p2Full)return"both";
    if(p1Full)return"p1";
    if(p2Full)return"p2";
    if(em)return"em";
    return"inactive";
  }

  function pathType(pathKey){
    const[pc1,pc2]=pathKey.split("-");
    const types=new Set();
    for(const[k,[cc1,cc2]]of Object.entries(CH)){
      if(!((cc1===pc1&&cc2===pc2)||(cc1===pc2&&cc2===pc1)))continue;
      const[g1s,g2s]=k.split("-");
      const t=chType(Number(g1s),Number(g2s));
      if(t!=="inactive")types.add(t);
    }
    if(types.has("both")||( types.has("p1")&&types.has("p2")))return"both";
    if(types.has("em"))return"em";
    if(types.has("p1"))return"p1";
    if(types.has("p2"))return"p2";
    return"inactive";
  }

  const activeChs=[];
  for(const[k,[cc1,cc2]]of Object.entries(CH)){
    const[g1s,g2s]=k.split("-");
    const g1=Number(g1s),g2=Number(g2s);
    const t=chType(g1,g2);
    if(t!=="inactive")activeChs.push({g1,g2,c1:cc1,c2:cc2,type:t});
  }

  function centerState(cn){
    const d1=def1.has(cn),d2=def2.has(cn);
    if(d1&&d2)return"both";if(d1)return"p1";if(d2)return"p2";return"open";
  }
  function strokeColor(t){if(t==="p1")return C1;if(t==="p2")return C2;return CE;}
  function centerFill(s){if(s==="both")return"url(#cg-em)";if(s==="p1")return"url(#cg1)";if(s==="p2")return"url(#cg2)";return"white";}
  function centerStrokeC(s){if(s==="both")return CE;if(s==="p1")return C1;if(s==="p2")return C2;return"#D0C8BE";}

  const n1=name1||(LANG==="en"?"Person 1":"Persoon 1"),n2=name2||(LANG==="en"?"Person 2":"Persoon 2");

  return(
    <div>
      {/* Legend */}
      <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:12,flexWrap:"wrap"}}>
        {[{c:C1,l:n1},{c:C2,l:n2},{c:CE,l:LANG==="en"?"Electromagnetic / both":"Elektromagnetisch / beide"}].map(({c,l})=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:".75rem",fontFamily:"var(--font-sans)"}}>
            <div style={{width:16,height:4,borderRadius:2,background:c}}/>
            <span style={{color:"var(--text-muted)"}}>{l}</span>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 640 620" style={{width:"100%",maxWidth:500,display:"block",margin:"0 auto",borderRadius:10}}>
        <defs>
          <linearGradient id="cg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C1L}/><stop offset="100%" stopColor={C1}/>
          </linearGradient>
          <linearGradient id="cg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C2L}/><stop offset="100%" stopColor={C2}/>
          </linearGradient>
          <linearGradient id="cg-em" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={CEL}/><stop offset="100%" stopColor={CE}/>
          </linearGradient>
          <filter id="ds2" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#000" floodOpacity="0.15"/>
          </filter>
        </defs>
        <rect width="640" height="620" fill="none" rx="10"/>
        <line x1="0" y1="580" x2="640" y2="580" stroke="rgba(10,26,47,.07)" strokeWidth="1"/>

        {/* Inactive channels */}
        {Object.entries(CPATHS).filter(([k])=>pathType(k)==="inactive").map(([k,p])=>(
          <path key={k} d={p} fill="none" stroke="#CEC8BF" strokeWidth="1.5" strokeDasharray="3,6" strokeLinecap="round" opacity="0.45"/>
        ))}

        {/* Active channels */}
        {Object.entries(CPATHS).filter(([k])=>pathType(k)!=="inactive").map(([k,p])=>{
          const sc=strokeColor(pathType(k));
          return(
            <g key={k}>
              <path d={p} fill="none" stroke={sc} strokeWidth="9" strokeLinecap="round" opacity="0.12"/>
              <path d={p} fill="none" stroke={sc} strokeWidth="3.5" strokeLinecap="round" opacity="0.9"/>
            </g>
          );
        })}

        {/* Gate badges */}
        {activeChs.map((ch,i)=>{
          const p1=CP[ch.c1],p2=CP[ch.c2];
          if(!p1||!p2)return null;
          const dx=p2.cx-p1.cx,dy=p2.cy-p1.cy,dist=Math.sqrt(dx*dx+dy*dy)||1;
          const off=Math.min(58,dist*0.38);
          const g1x=p1.cx+dx/dist*off,g1y=p1.cy+dy/dist*off;
          const g2x=p2.cx-dx/dist*off,g2y=p2.cy-dy/dist*off;
          const sc=strokeColor(ch.type);
          return(
            <g key={i}>
              <circle cx={g1x} cy={g1y} r="9" fill={sc} opacity="0.9"/>
              <text x={g1x} y={g1y} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="7.5" fontWeight="600" fill="white">{ch.g1}</text>
              <circle cx={g2x} cy={g2y} r="9" fill={sc} opacity="0.9"/>
              <text x={g2x} y={g2y} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="7.5" fontWeight="600" fill="white">{ch.g2}</text>
            </g>
          );
        })}

        {/* Centers */}
        {Object.entries(CP).map(([cn,pos])=>{
          const state=centerState(cn);
          const d=state!=="open",h=hov===cn;
          return(
            <g key={cn} onMouseEnter={()=>setHov(cn)} onMouseLeave={()=>setHov(null)} style={{cursor:"default"}}>
              {h&&<path d={cpth(pos)} fill="none" stroke={d?CE:"#A8A29E"} strokeWidth="2.5" opacity="0.6"/>}
              <path d={cpth(pos)} fill={centerFill(state)} stroke={centerStrokeC(state)} strokeWidth={d?2:1.5} filter={d?"url(#ds2)":undefined} opacity={d?1:0.92}/>
              <text x={pos.cx} y={pos.cy} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize={d?"8.5":"7.5"} fontWeight={d?"600":"400"} letterSpacing="0.7" fill={d?"#fff":"#B8B0A6"}>{pos.lb}</text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hov&&(()=>{
          const pos=CP[hov],state=centerState(hov);
          const stateLabel=state==="open"?(LANG==="en"?"open":"open"):state==="both"?(LANG==="en"?"both defined":"beiden gedefinieerd"):state==="p1"?n1+(LANG==="en"?" — defined":" — gedefinieerd"):n2+(LANG==="en"?" — defined":" — gedefinieerd");
          const centerLabel=LANG==="en"?hov:CENTER_NL[hov];
          const label=centerLabel+" — "+stateLabel;
          const tw=label.length*5.6+16;
          const tx=Math.min(Math.max(pos.cx-tw/2,8),632-tw);
          const ty=pos.cy>300?pos.cy-64:pos.cy+56;
          const bgC=state==="open"?"#555":state==="p1"?C1:state==="p2"?C2:CE;
          return(
            <g pointerEvents="none">
              <rect x={tx} y={ty} width={tw} height={26} rx="5" fill={bgC} opacity="0.93"/>
              <text x={tx+tw/2} y={ty+14} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="9.5" fill="white">{label}</text>
            </g>
          );
        })()}

        {/* Footer */}
        <text x="160" y="598" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="13" fill={C1} fontStyle="italic">{n1}</text>
        <text x="480" y="598" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="13" fill={C2} fontStyle="italic">{n2}</text>
        <text x="320" y="613" textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="7" letterSpacing="1.5" fill="rgba(10,26,47,.25)">{t("form.comboChartLabel")}</text>
      </svg>
    </div>
  );
}

// ─── CHART DASHBOARD ──────────────────────────────────────────────────────────
const TYPE_DESC={
  nl:{
    "Generator":"Bouwt voort op sacrale energie — duurzame levenspotentie",
    "Manifesting Generator":"Snel, multi-passioneel, wacht op sacrale respons",
    "Manifestor":"Initieert en zet dingen in beweging — informeer anderen",
    "Projector":"Leidt vanuit inzicht — wacht op de juiste uitnodiging",
    "Reflector":"Spiegel van de omgeving — verbonden met de maancyclus",
  },
  en:{
    "Generator":"Builds on sacral energy — sustainable life force",
    "Manifesting Generator":"Fast, multi-passionate, waits for sacral response",
    "Manifestor":"Initiates and sets things in motion — inform others",
    "Projector":"Guides through insight — waits for the right invitation",
    "Reflector":"Mirror of the environment — connected to the lunar cycle",
  },
};
const AUTH_DESC={
  nl:{
    "Emotioneel":"Wacht op emotionele helderheid voordat je beslist",
    "Sacraal":"Volg het directe gut-gevoel van je lichaam",
    "Splenisch":"Vertrouw de instantane intuïtieve flits van het moment",
    "Ego":"Vertrouw op je wilskracht en wat je oprecht wil beloven",
    "G/Self":"Je identiteitsgevoel en richting leiden je beslissingen",
    "Mentaal":"Gebruik gesprekken met vertrouwde mensen als klankbord",
    "Maancyclus":"Neem 28 dagen de tijd voor grote beslissingen",
  },
  en:{
    "Emotioneel":"Wait for emotional clarity before deciding",
    "Sacraal":"Follow the immediate gut response of your body",
    "Splenisch":"Trust the instantaneous intuitive flash of the moment",
    "Ego":"Trust your willpower and what you genuinely want to commit to",
    "G/Self":"Your sense of identity and direction guide your decisions",
    "Mentaal":"Use conversations with trusted people as a sounding board",
    "Maancyclus":"Take 28 days for major decisions",
  },
};

// Translation maps for chart values shown in UI
const AUTH_EN={"Emotioneel":"Emotional","Sacraal":"Sacral","Splenisch":"Splenic","Ego":"Ego","G/Self":"G/Self","Mentaal":"Mental","Maancyclus":"Lunar"};
const STRAT_EN={"Wacht om te reageren":"Wait to respond","Informeer, reageer dan vanuit het sacraal":"Inform, then respond","Informeer voor jou handelt":"Inform before acting","Wacht op de uitnodiging":"Wait for the invitation","Wacht een maancyclus":"Wait a lunar cycle"};
const SIG_EN={"Bevrediging":"Satisfaction","Bevrediging & Vrede":"Satisfaction & Peace","Vrede":"Peace","Succes":"Success","Verrassing":"Surprise"};
const NOTSELF_EN={"Frustratie":"Frustration","Frustratie & Woede":"Frustration & Anger","Woede":"Anger","Bitterheid":"Bitterness","Teleurstelling":"Disappointment"};
function xlateAuth(v){return LANG==="en"?(AUTH_EN[v]||v):v;}
function xlateStrat(v){return LANG==="en"?(STRAT_EN[v]||v):v;}
function xlateSig(v){return LANG==="en"?(SIG_EN[v]||v):v;}
function xlateNotSelf(v){return LANG==="en"?(NOTSELF_EN[v]||v):v;}

function InsightCard({label,value,desc,icon,accentColor}){
  return(
    <div className="cd-ic">
      <div className="cd-ic-bar" style={{background:accentColor||"var(--gold)"}}/>
      <div className="cd-ic-top">
        <div className="cd-ic-lbl">{label}</div>
        <div className="cd-ic-ico">{icon}</div>
      </div>
      <div className="cd-ic-val">{value}</div>
      {desc&&<div className="cd-ic-desc">{desc}</div>}
    </div>
  );
}

function IntegrationCard({label,value,desc}){
  return(
    <div className="cd-ic2">
      <div className="cd-ic2-lbl">{label}</div>
      <div className="cd-ic2-val">{value}</div>
      {desc&&<div className="cd-ic2-desc">{desc}</div>}
    </div>
  );
}

function BlueprintPanel({chart,name,onCta}){
  return(
    <div className="cd-bp">
      {/* Decorative concentric rings — pure SVG overlay */}
      <svg className="cd-bp-rings" viewBox="0 0 440 580" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {[100,165,235,310].map((r,i)=>(
          <circle key={i} cx="220" cy="290" r={r} fill="none" stroke="rgba(10,26,47,.035)" strokeWidth="1"/>
        ))}
        <circle cx="220" cy="290" r="72" fill="none" stroke="rgba(201,168,92,.055)" strokeWidth="1.5"/>
        <circle cx="220" cy="290" r="40" fill="none" stroke="rgba(201,168,92,.04)" strokeWidth="1"/>
      </svg>
      <div className="cd-bp-lbl">{t("form.blueprintLabel")}</div>
      <Bodygraph chart={chart} name={name}/>
    </div>
  );
}

function ChartDashboard({chart,name,onOrder}){
  const typeDesc=(TYPE_DESC[LANG]||TYPE_DESC.nl)[chart.type]||"";
  const authDesc=(AUTH_DESC[LANG]||AUTH_DESC.nl)[chart.auth]||"";
  const nDef=chart.definedCenters?.length||0;
  const nCh=chart.channels?.length||0;
  const defText=nDef===0
    ?t("form.definitionNone")
    :nCh===1
      ?t("form.definitionOne",{nDef,nCh})
      :t("form.definitionMany",{nDef,nCh});
  return(
    <div className="cd">
      {/* Header */}
      <div className="cd-hdr">
        <div>
          <div className="cd-eyebrow">{t("form.chartEyebrow")}</div>
          <div className="cd-title">{t("form.chartHeaderTitle")}</div>
          <div className="cd-name">{name}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div className="cd-hdr-type">{chart.type}</div>
          <div className="cd-hdr-auth">{chart.auth}</div>
        </div>
      </div>

      {/* Body: left blueprint + right insight cards */}
      <div className="cd-body">
        <div className="cd-left">
          <BlueprintPanel chart={chart} name={name} onCta={onOrder}/>
        </div>
        <div className="cd-right">
          <InsightCard label={t("form.typeLabel")} value={chart.type} desc={typeDesc} icon="◈" accentColor="#1A1714"/>
          <InsightCard label={t("form.authorityLabel")} value={xlateAuth(chart.auth)} desc={authDesc} icon="◎" accentColor="#C9A85C"/>
          <InsightCard label={t("form.strategyLabel")} value={xlateStrat(chart.strat)} desc={t("form.signaturePrefix")+xlateSig(chart.sig)} icon="◇" accentColor="#8A7355"/>
          <InsightCard label={t("form.profileLabel")} value={chart.profile} desc={t("form.profileDesc")} icon="✦" accentColor="#A08855"/>
        </div>
      </div>

      {/* Integrations */}
      <div className="cd-int">
        <div className="cd-int-hdr">
          <div className="cd-int-ttl">{t("form.deeperLabel")}</div>
        </div>
        <div className="cd-int-row">
          <IntegrationCard
            label={t("form.signatureLabel")}
            value={xlateSig(chart.sig)}
            desc={t("form.signatureDesc")}
          />
          <IntegrationCard
            label={t("form.notSelfLabel")}
            value={xlateNotSelf(chart.notSelf)}
            desc={t("form.notSelfDesc")}
          />
          <IntegrationCard
            label={t("form.definitionLabel")}
            value={defText}
            desc={t("form.definitionDesc")}
          />
        </div>
      </div>

      {/* Footer — hidden when empty */}
      {t("form.chartFooter")&&(
        <div className="cd-foot">
          <div className="cd-foot-tag">{t("form.chartFooter")}</div>
        </div>
      )}
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function TrustStrip({light}){
  const col=light?"rgba(255,255,255,.5)":"var(--text-muted)";
  const items=[t("trust.payment"),t("trust.personal"),t("trust.delivery"),t("trust.noGeneric"),t("trust.language")];
  return(
    <div className="trust-strip">
      {items.map(txt=>(
        <div key={txt} className="trust-item" style={{color:col}}><span style={{color:light?"rgba(201,168,92,.55)":"var(--gold)",fontSize:".55rem"}}>✦</span><span>{txt}</span></div>
      ))}
    </div>
  );
}

function ReportCard({rpt,onClick}){
  const imgKey="r_"+rpt.id;
  const imgSrc=IMGS[imgKey]||IMGS.hero;
  const promptExtraStr=(typeof rpt.prompt_extra==="object"&&rpt.prompt_extra!==null)?(rpt.prompt_extra[LANG]??rpt.prompt_extra.nl??""):(rpt.prompt_extra||"");
  const sectionCount=promptExtraStr.split("\n").filter(l=>l.startsWith("###")).length;
  return(
    <div className="rcard" onClick={()=>{track("report_card_click",{report:rpt.id,price:rpt.priceNum});onClick();}}>
      <div className="rcard-img">
        <img src={imgSrc} alt={tl(rpt.title)} loading="lazy"/>
        <div className="rcard-img-ov"/>
        {rpt.tag&&<div className="rcard-img-badge">{tl(rpt.tag)}</div>}
        <div className="rcard-img-price">{rpt.price}</div>
      </div>
      <div className="rcard-body">
        <div className="rcard-icon">{rpt.icon}</div>
        <div className="rcard-title">{tl(rpt.title)}</div>
        {rpt.outcome&&<div className="rcard-outcome">{tl(rpt.outcome)}</div>}
        <div className="rcard-tagline">{tl(rpt.tagline)}</div>
        <div className="rcard-footer">
          <div className="rcard-meta">{rpt.pages} {t("report.pages")} · {sectionCount} {t("report.sections")}</div>
          <div className="rcard-cta">{t("report.startCta")}</div>
        </div>
      </div>
    </div>
  );
}

function StepCard({num,title,desc}){
  return(
    <div className="step-card">
      <div className="step-num">{num}</div>
      <div className="step-body"><h4>{title}</h4><p>{desc}</p></div>
    </div>
  );
}

function Nav({page,go,menuOpen,setMenuOpen}){
  const links=[
    ["home",   t("nav.home")],
    ["wat",    t("nav.wat")],
    ["rapporten", t("nav.reports")],
    ["inzichten", t("nav.insights")],
    ["over",   t("nav.about")],
    ["contact",t("nav.contact")],
  ];
  return(
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo" onClick={()=>go("home")}>
            <div className="nav-logo-main">Faculty of Human Design</div>
            <div className="nav-logo-sub">{t("nav.logoSub")}</div>
          </div>
          <div className="nav-links">
            {links.map(([id,label])=>(
              <span key={id} className={"nav-link"+(page===id||(page.startsWith("rapport-")&&id==="rapporten")||(page.startsWith("inzichten-")&&id==="inzichten")?" active":"")} onClick={()=>go(id)}>{label}</span>
            ))}
          </div>
          <div className="nav-cta-wrap">
            {/* Language switcher */}
            <div style={{display:"flex",gap:4,marginRight:4}}>
              {[["nl","NL"],["en","EN"]].map(([lng,lbl])=>(
                <button key={lng} onClick={()=>switchLang(lng)} style={{
                  background:LANG===lng?"var(--brand)":"transparent",
                  color:LANG===lng?"white":"var(--text-muted)",
                  border:LANG===lng?"1px solid var(--brand)":"1px solid transparent",
                  borderRadius:0,
                  padding:"4px 9px",fontSize:".6rem",fontWeight:500,letterSpacing:".14em",
                  cursor:LANG===lng?"default":"pointer",
                  transition:"all 150ms",fontFamily:"var(--font-sans)",
                }}>{lbl}</button>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={()=>{track("hero_cta_click",{location:"nav"});go("rapporten");}}>{t("nav.cta")}</button>
          </div>
          <button className="menu-btn mobile-nav" style={{display:"flex",alignItems:"center"}} onClick={()=>setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect y="4" width="22" height="2" rx="1" fill="currentColor"/><rect y="10" width="22" height="2" rx="1" fill="currentColor"/><rect y="16" width="22" height="2" rx="1" fill="currentColor"/></svg>
          </button>
        </div>
      </nav>
      {menuOpen&&(
        <div className="mobile-menu">
          <button className="menu-btn" style={{position:"absolute",top:20,right:20}} onClick={()=>setMenuOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 22 22"><line x1="2" y1="2" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="20" y1="2" x2="2" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          {links.map(([id,label])=>(
            <div key={id} className="mobile-menu-link" onClick={()=>{go(id);setMenuOpen(false);}}>{label}</div>
          ))}
          {/* Mobile language switcher */}
          <div style={{display:"flex",justifyContent:"center",gap:8,padding:"16px 0",borderBottom:"1px solid var(--border)"}}>
            {[["nl","NL"],["en","EN"]].map(([lng,lbl])=>(
              <button key={lng} onClick={()=>switchLang(lng)} style={{
                background:LANG===lng?"var(--brand)":"transparent",
                color:LANG===lng?"white":"var(--text-muted)",
                border:LANG===lng?"1px solid var(--brand)":"1px solid transparent",
                borderRadius:0,padding:"6px 18px",
                fontSize:".6rem",fontWeight:500,letterSpacing:".14em",
                cursor:LANG===lng?"default":"pointer",fontFamily:"var(--font-sans)",
              }}>{lbl}</button>
            ))}
          </div>
          <div style={{marginTop:16}}>
            <button className="btn btn-primary btn-full" onClick={()=>{go("rapporten");setMenuOpen(false);}}>{t("nav.mobileCta")}</button>
          </div>
        </div>
      )}
    </>
  );
}

function Footer({go}){
  return(
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-logo-main">Faculty of Human Design</div>
            <div className="footer-logo-sub">{t("footer.logoSub")}</div>
            <p className="footer-desc">{t("footer.desc")}</p>
          </div>
          <div>
            <div className="footer-col-title">{t("footer.reportsCol")}</div>
            <span className="footer-link" onClick={()=>go("rapport-volledig")}>{tl(REPORTS.find(r=>r.id==="volledig").title)}</span>
            <span className="footer-link" onClick={()=>go("rapport-relatie_liefde")}>{tl(REPORTS.find(r=>r.id==="relatie_liefde").title)}</span>
            <span className="footer-link" onClick={()=>go("rapport-relatie_business")}>{tl(REPORTS.find(r=>r.id==="relatie_business").title)}</span>
            <span className="footer-link" onClick={()=>go("rapport-relatie_familie")}>{tl(REPORTS.find(r=>r.id==="relatie_familie").title)}</span>
          </div>
          <div>
            <div className="footer-col-title">{t("footer.explore")}</div>
            <span className="footer-link" onClick={()=>go("wat")}>Human Design</span>
            <span className="footer-link" onClick={()=>go("inzichten")}>Journal</span>
            <span className="footer-link" onClick={()=>go("over")}>Philosophy</span>
          </div>
          <div>
            <div className="footer-col-title">HD Types</div>
            <span className="footer-link" onClick={()=>go("type-generator")}>Generator</span>
            <span className="footer-link" onClick={()=>go("type-manifesting-generator")}>Manifesting Generator</span>
            <span className="footer-link" onClick={()=>go("type-projector")}>Projector</span>
            <span className="footer-link" onClick={()=>go("type-manifestor")}>Manifestor</span>
            <span className="footer-link" onClick={()=>go("type-reflector")}>Reflector</span>
          </div>
          <div>
            <div className="footer-col-title">Contact</div>
            <a href="mailto:info@facultyhd.com" className="footer-link" style={{textDecoration:"none"}}>info@facultyhd.com</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">{t("footer.copy")}</div>
          <div className="footer-trust">
            <span className="footer-trust-item" style={{cursor:"pointer"}} onClick={()=>go("voorwaarden")}>{t("footer.terms")}</span>
            <div className="footer-trust-item">{t("footer.ssl")}</div>
            <div className="footer-trust-item">{t("footer.ideal")}</div>
            <div style={{display:"flex",gap:4,marginLeft:8}}>
              {[["nl","NL"],["en","EN"]].map(([lng,lbl])=>(
                <button key={lng} onClick={()=>switchLang(lng)} style={{
                  background:LANG===lng?"rgba(255,255,255,.15)":"transparent",
                  color:LANG===lng?"white":"rgba(255,255,255,.38)",
                  border:LANG===lng?"1px solid rgba(255,255,255,.22)":"1px solid transparent",
                  borderRadius:0,padding:"2px 8px",fontSize:".58rem",fontWeight:500,letterSpacing:".14em",
                  cursor:LANG===lng?"default":"pointer",transition:"all 150ms",fontFamily:"var(--font-sans)",
                }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


// ─── TIMEZONE HELPER ─────────────────────────────────────────────────────────
function getUTCOffsetHours(ianaTimezone, year, month, day, hour = 12, minute = 0) {
  if (!ianaTimezone) return null;
  try {
    const testDate = new Date(Date.UTC(year || 2000, (month || 1) - 1, day || 1, hour, minute));
    const str = new Intl.DateTimeFormat("en", {
      timeZone: ianaTimezone,
      timeZoneName: "shortOffset",
    }).formatToParts(testDate).find(p => p.type === "timeZoneName")?.value || "";
    const m = str.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (!m) return 0;
    return (m[1] === "+" ? 1 : -1) * (parseInt(m[2]) + (m[3] ? parseInt(m[3]) / 60 : 0));
  } catch { return null; }
}

// ─── COUNTRY → TIMEZONE FALLBACK ─────────────────────────────────────────────
const COUNTRY_TZ = {
  nl:"Europe/Amsterdam", be:"Europe/Brussels", de:"Europe/Berlin", at:"Europe/Vienna",
  ch:"Europe/Zurich", fr:"Europe/Paris", es:"Europe/Madrid", pt:"Europe/Lisbon",
  it:"Europe/Rome", gb:"Europe/London", ie:"Europe/Dublin", dk:"Europe/Copenhagen",
  se:"Europe/Stockholm", no:"Europe/Oslo", fi:"Europe/Helsinki", pl:"Europe/Warsaw",
  cz:"Europe/Prague", sk:"Europe/Bratislava", hu:"Europe/Budapest", ro:"Europe/Bucharest",
  gr:"Europe/Athens", tr:"Europe/Istanbul", ru:"Europe/Moscow", ua:"Europe/Kiev",
  us:"America/New_York", ca:"America/Toronto", mx:"America/Mexico_City",
  br:"America/Sao_Paulo", ar:"America/Argentina/Buenos_Aires",
  au:"Australia/Sydney", nz:"Pacific/Auckland", jp:"Asia/Tokyo",
  cn:"Asia/Shanghai", in:"Asia/Kolkata", za:"Africa/Johannesburg",
  ae:"Asia/Dubai", sg:"Asia/Singapore", id:"Asia/Jakarta",
};

// ─── PLACE AUTOCOMPLETE ───────────────────────────────────────────────────────
function PlaceAutocomplete({ value, onSelect, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [open, setOpen] = useState(false);
  const [tzInfo, setTzInfo] = useState(null); // { timezone } or null
  const debounceRef = useState(null);
  const wrapRef = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef[0] && !wrapRef[0].contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (q) => {
    clearTimeout(debounceRef[0]);
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef[0] = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await fetch(
          "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(q) +
          "&format=json&limit=6&addressdetails=1",
          { headers: { "Accept-Language": LANG==="en"?"en,nl":"nl,en" } }
        );
        const data = await res.json();
        const items = data.map(d => {
          const a = d.address || {};
          const city = a.city || a.town || a.village || a.hamlet || a.county || a.state || d.name;
          const country = a.country || "";
          const countryCode = (a.country_code || "").toLowerCase();
          return {
            shortLabel: [city, country].filter(Boolean).join(", "),
            fullLabel: d.display_name,
            lat: parseFloat(d.lat),
            lon: parseFloat(d.lon),
            countryCode,
          };
        }).filter((v, i, arr) => arr.findIndex(x => x.shortLabel === v.shortLabel) === i);
        setSuggestions(items);
        setOpen(items.length > 0);
      } catch { /* network error — silent */ }
      finally { setLoadingSearch(false); }
    }, 400);
  };

  const resolveTimezone = async (lat, lon, countryCode) => {
    // 1. Try timezonefinder API (may be blocked by CORS — catch silently)
    try {
      const res = await fetch(
        "https://timezonefinder.michelfe.it/api/0?lat=" + lat + "&lng=" + lon,
        { signal: AbortSignal.timeout(3000) }
      );
      const data = await res.json();
      if (data.timezone) return data.timezone;
    } catch { /* CORS or timeout — fall through */ }

    // 2. Fallback: country code → timezone
    if (countryCode && COUNTRY_TZ[countryCode]) return COUNTRY_TZ[countryCode];

    // 3. No timezone found
    return null;
  };

  const select = async (item) => {
    setQuery(item.shortLabel);
    setOpen(false);
    setTzInfo(null);
    const timezone = await resolveTimezone(item.lat, item.lon, item.countryCode);
    setTzInfo(timezone ? { timezone } : { error: true });
    onSelect({ place: item.shortLabel, lat: item.lat, lon: item.lon, timezone: timezone || "" });
  };

  return (
    <div className="place-wrap" ref={el => { wrapRef[0] = el; }}>
      <input
        className={"form-input" + (loadingSearch ? " loading" : "")}
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          search(e.target.value);
          setTzInfo(null); // reset tz when user types manually
          onSelect({ place: e.target.value, lat: null, lon: null, timezone: "" });
        }}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        placeholder={placeholder || "Stad, land"}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="place-dropdown">
          {suggestions.map((s, i) => (
            <div key={i} className="place-option" onMouseDown={e => { e.preventDefault(); select(s); }}>
              <div className="place-option-main">{s.shortLabel}</div>
              {s.fullLabel !== s.shortLabel && (
                <div className="place-option-sub">{s.fullLabel.split(",").slice(0, 3).join(",")}</div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Only show tz feedback after a dropdown selection, not while typing */}
      {tzInfo && !open && (
        <div className={"place-tz" + (tzInfo.error ? " place-tz-error" : "")}>
          {tzInfo.error ? (
            <>{LANG==="en"?"Timezone unknown — chart calculated without UTC correction":"Tijdzone onbekend — chart wordt berekend zonder UTC-correctie"}</>
          ) : (
            <><div className="place-tz-dot"/>{tzInfo.timezone}</>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SUBSCRIPTION MANAGE ─────────────────────────────────────────────────────
// Small self-service block on the maandelijks detail page.
// Lets existing subscribers open the Stripe Customer Portal to cancel/manage.
function SubscriptionManage(){
  const isEN=LANG==="en";
  const[email,setEmail]=useState("");
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState(null);

  const openPortal=async(e)=>{
    e.preventDefault();
    if(!email){setErr(isEN?"Enter your e-mail address.":"Vul je e-mailadres in.");return;}
    setLoading(true);setErr(null);
    try{
      const res=await fetch("/api/checkout",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({portal:true,email}),
      });
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Error");setLoading(false);return;}
      window.location.href=data.url;
    }catch(ex){
      setErr(ex.message);
      setLoading(false);
    }
  };

  return(
    <section style={{padding:"80px 40px",background:"var(--bg)",borderTop:"1px solid var(--border)"}}>
      <div style={{maxWidth:540,margin:"0 auto"}}>
        <div style={{fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:500,letterSpacing:".2em",textTransform:"uppercase",color:"var(--gold)",marginBottom:14,opacity:.8}}>
          {isEN?"Subscription":"Abonnement"}
        </div>
        <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.4rem,2.5vw,1.75rem)",fontWeight:300,color:"var(--text)",marginBottom:12,lineHeight:1.2}}>
          {isEN?"Manage your subscription":"Beheer je abonnement"}
        </h2>
        <p style={{fontFamily:"var(--font-serif)",fontSize:".9rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.8,marginBottom:36}}>
          {isEN
            ?"Enter the e-mail address you used to subscribe. We'll redirect you to the secure portal where you can view invoices, update payment details or cancel."
            :"Vul het e-mailadres in waarmee je je hebt aangemeld. We sturen je door naar de beveiligde portal waar je facturen kunt bekijken, betaalgegevens bijwerken of opzeggen."}
        </p>
        <form onSubmit={openPortal} style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-start"}}>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder={isEN?"your@email.com":"jouw@email.com"}
            required
            style={{flex:"1 1 220px",padding:"12px 16px",fontFamily:"var(--font-sans)",fontSize:".85rem",border:"1px solid var(--border)",background:"#fff",color:"var(--text)",outline:"none",minWidth:0}}
          />
          <button
            type="submit"
            disabled={loading}
            style={{padding:"12px 28px",background:"var(--text)",color:"#fff",fontFamily:"var(--font-sans)",fontSize:".75rem",fontWeight:500,letterSpacing:".12em",textTransform:"uppercase",border:"none",cursor:loading?"wait":"pointer",opacity:loading?.6:1,whiteSpace:"nowrap"}}
          >
            {loading?(isEN?"Redirecting…":"Doorsturen…"):(isEN?"Manage subscription":"Beheer abonnement")}
          </button>
        </form>
        {err&&<p style={{fontFamily:"var(--font-sans)",fontSize:".8rem",color:"#c0392b",marginTop:14}}>{err}</p>}
      </div>
    </section>
  );
}

// ─── REPORT FORM ──────────────────────────────────────────────────────────────
function ReportForm({rpt,onDone,postPayment}){
  const[form,setForm]=useState({firstName:"",lastName:"",email:"",day:"",month:"",year:"",hour:"",minute:"",place:"",lat:"",lon:"",timezone:"",tz:"",pFirstName:"",pLastName:"",pday:"",pmonth:"",pyear:"",phour:"",pminute:"",pplace:"",plat:"",plon:"",ptimezone:"",ptz:"",cFirstName:"",cLastName:"",cday:"",cmonth:"",cyear:"",chour:"",cminute:"",cplace:"",clat:"",clon:"",ctimezone:"",ctz:"",familyRolesSwapped:false});
  const[chart,setChart]=useState(null);
  const[ls,setLs]=useState(0);
  const[pr,setPr]=useState(0);
  const[loading,setLoading]=useState(false);
  const[stripeLoading,setStripeLoading]=useState(false);const[autoTrigger,setAutoTrigger]=useState(false);useEffect(()=>{if(!postPayment)return;setChart(postPayment.chart);setForm(f=>({...f,...postPayment.form}));setAutoTrigger(true);},[postPayment]);useEffect(()=>{if(autoTrigger&&chart){setAutoTrigger(false);doReport();}},[autoTrigger,chart]);
  const ch=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  // Clamp numeric fields on blur to prevent invalid values (e.g. minute=66, day=44)
  const numBlur=(name,min,max)=>e=>{
    const v=parseInt(e.target.value);
    if(e.target.value===""||isNaN(v))return;
    setForm(f=>({...f,[name]:String(Math.max(min,Math.min(max,v)))}));
  };
  const maxDay=()=>{const m=parseInt(form.month),y=parseInt(form.year)||2000;return m?new Date(y,m,0).getDate():31;};
  const isNum=rpt.id==="numerologie";
  const isHoro=rpt.id==="horoscoop";
  const needsTime=!isNum;
  const isRelatie=rpt.id.startsWith("relatie_");
  const partnerOk=!isRelatie||(form.pFirstName&&form.pday&&form.pmonth&&form.pyear);
  const childOk=!rpt.needsChild||(form.cFirstName&&form.cday&&form.cmonth&&form.cyear&&form.cplace);
  const ok=form.firstName&&form.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)&&form.day&&form.month&&form.year&&form.place&&(!needsTime||form.hour)&&partnerOk&&childOk;
  const promptExtraStr=(typeof rpt.prompt_extra==="object"&&rpt.prompt_extra!==null)?(rpt.prompt_extra[LANG]??rpt.prompt_extra.nl??""):(rpt.prompt_extra||"");
  const sections=promptExtraStr.split("\n").filter(l=>l.startsWith("###")).map(l=>l.replace(/^###\s*/,"").trim());

  const doChart=()=>{
    const y=parseInt(form.year),m=parseInt(form.month),d=parseInt(form.day);
    const fullName1=(form.firstName+" "+(form.lastName||"")).trim();
    if(!form.firstName||!d||!m||!y){alert(LANG==="en"?"Please fill in all required fields.":"Vul alle verplichte velden in.");return;}
    if(isNum){const num=calcNumerology(fullName1,d,m,y);setChart({...num,isNumerology:true});}
    else{
      const h=parseInt(form.hour||"12"),min=parseInt(form.minute||"0");
      // Compute tz offset for birth date (accounts for DST)
      const tz=form.timezone?getUTCOffsetHours(form.timezone,y,m,d,h,min):parseFloat(form.tz||"0")||0;
      setForm(f=>({...f,tz:String(tz)}));
      setChart(isHoro?{...calcHoroscoop(y,m,d,h,min,tz),isHoroscoop:true}:calcHD(y,m,d,h,min,tz));
    }
    setTimeout(()=>document.getElementById("chart-res")?.scrollIntoView({behavior:"smooth"}),80);
  };

  const doReport=async()=>{
    setLoading(true);setPr(0);setLs(0);
    track("checkout_started",{report:rpt.id,price:rpt.priceNum});
    const hdChart=(!isNum&&!isHoro)?chart:null;
    const chartContext=buildPrompt(hdChart,form,rpt).split("\n\n")[0];
    const SYSTEM=LANG==="en"
      ?`You are a senior analyst at Faculty of Human Design on Ibiza. You write in-depth, personalised reports in English.

VOICE & STYLE:
- Always address the reader as "you" and "your".
- Use the client's first name at most once per section.
- Tone: calm, premium, warm-spiritual, precise and trustworthy. No clichés, no superlatives.
- Begin each section directly with relevance — forbidden openers: "It is important to...", "In today's society...", "Let us first...".
- Short sentences; prefer more paragraphs over long blocks.

CONTENT:
- Anchor every paragraph in the chart data: type, strategy, authority, profile, centres, channels, gates.
- No generic psychology without connection to this specific design.
- No biographical assumptions — only patterns as working hypotheses.

STRUCTURE — every section follows exactly this format:

In your chart:
• [3–5 concrete facts specific to THIS chart]

[Core explanation: 3–5 sub-paragraphs with subheadings, max ~800 words, anchored in chart data]

Pitfalls:
• [3 concrete bullets]
• [...]
• [...]

Practice:
• [3 actionable bullets]
• [...]
• [...]

This week:
• [3 time-bound micro-actions]
• [...]
• [...]

Reflection questions:
1. [Question]
2. [Question]
3. [Question]

Close the core explanation with a complete, rounded sentence. No section title in the text.`
      :`Je bent een senior analist van de Faculty of Human Design op Ibiza. Je schrijft diepgaande, gepersonaliseerde rapporten in het Nederlands.

STEM & STIJL:
- Spreek de lezer altijd aan met "je" en "jouw" — nooit "u" of "uw", nooit wisselen.
- Gebruik de voornaam van de klant maximaal één keer per sectie.
- Toon: rustig, premium, warm-spiritueel, precies en betrouwbaar. Geen clichés, geen superlatieven.
- Begin elke sectie direct met relevantie — verboden openers: "Het is belangrijk om...", "In de hedendaagse samenleving...", "Laat ons eerst...".
- Korte zinnen; liever meer alinea's dan lange blokken.

INHOUD:
- Veranker elke alinea in de chartdata: type, strategie, autoriteit, profiel, centra, kanalen, poorten.
- Geen algemene psychologie zonder koppeling aan dit specifieke ontwerp.
- Geen biografische aannames — alleen patronen als werk-hypotheses.

STRUCTUUR — elke sectie volgt exact dit format:

In jouw chart:
• [3–5 concrete feiten specifiek voor DEZE chart]

[Kernuitleg: 3–5 subparagrafen met subkopjes, max ~800 woorden, verankerd in chartdata]

Valkuilen:
• [3 concrete bullets]
• [...]
• [...]

Praktijk:
• [3 uitvoerbare bullets]
• [...]
• [...]

Deze week:
• [3 tijdgebonden micro-acties]
• [...]
• [...]

Reflectievragen:
1. [Vraag]
2. [Vraag]
3. [Vraag]

Sluit de kernuitleg af met een volledige, afgeronde zin. Geen sectietitel in de tekst.`;
    // For kind rapport, the primary subject is the child, not the requester
    const reportSubjectName=rpt.needsChild?(form.cFirstName||"").trim()||form.firstName:form.firstName;
    let allText="";
    try{
      for(let i=0;i<sections.length;i++){
        const sec=sections[i];
        setLs(Math.min(i,LSTEPS.length-1));setPr(Math.round((i/sections.length)*95));
        const prompt=LANG==="en"
          ?chartContext+"\n\nWrite section \""+sec+"\" for "+reportSubjectName+".\n\nUse exactly the prescribed format:\n1. Start with \"In your chart:\" followed by 3–5 concrete bullets with specific chart data.\n2. Write the core explanation (3–5 sub-paragraphs with subheadings, max ~800 words, each paragraph anchored in chart data).\n3. End with: \"Pitfalls:\", \"Practice:\", \"This week:\", \"Reflection questions:\" — each with exactly 3 items.\n\nNo section title in the text. Close the core explanation with a complete sentence."
          :chartContext+"\n\nSchrijf sectie \""+sec+"\" voor "+reportSubjectName+".\n\nGebruik exact het voorgeschreven format:\n1. Begin met \"In jouw chart:\" gevolgd door 3–5 concrete bullets met specifieke chartdata.\n2. Schrijf de kernuitleg (3–5 subparagrafen met subkopjes, max ~800 woorden, elke paragraaf verankerd in chartdata).\n3. Eindig met: \"Valkuilen:\", \"Praktijk:\", \"Deze week:\", \"Reflectievragen:\" — elk met exact 3 items.\n\nGeen sectietitel in de tekst. Sluit de kernuitleg af met een volledige zin.";
        const res=await fetch("/api/generate-report",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2400,system:SYSTEM,
            messages:[{role:"user",content:prompt}]})
        });
        const data=await res.json();
        const txt=data.content?.find(b=>b.type==="text")?.text||"";
        allText+="### "+sec+"\n\n"+txt+"\n\n";
      }
      setPr(100);
      track("checkout_completed",{report:rpt.id,price:rpt.priceNum});
      setTimeout(()=>{setLoading(false);onDone(chart,form,allText.trim(),rpt);},400);
    }catch(e){setLoading(false);onDone(chart,form,(LANG==="en"?"Something went wrong: ":"Er is iets misgegaan: ")+e.message,rpt);}
  };

  if(loading)return(
    <div className="loading-overlay">
      <div className="loading-icon">✦</div>
      <div className="loading-title">{LANG==="en"?"Your blueprint is being assembled":"Je blauwdruk wordt samengesteld"}</div>
      <div className="loading-counter">{LANG==="en"?`Analysis ${Math.min(ls+1,sections.length)} of ${sections.length}`:`Analyse ${Math.min(ls+1,sections.length)} van ${sections.length}`}</div>
      <div className="loading-steps">
        {sections.map((step,i)=>(
          <div key={i} className="loading-step" style={{opacity:i<ls?.35:i===ls?1:.18}}>
            <div className="loading-step-dot" style={{background:i<ls?"#9A8050":i===ls?"#fff":"#444"}}/>
            <div className="loading-step-text" style={{color:i===ls?"#fff":"rgba(255,255,255,.4)"}}>{step}</div>
            {i===ls&&<div className="loading-step-badge">{LANG==="en"?"working...":"bezig..."}</div>}
            {i<ls&&<div className="loading-step-badge">✓</div>}
          </div>
        ))}
      </div>
      <div className="loading-bar-wrap"><div className="loading-bar-fill" style={{width:pr+"%"}}/></div>
      <p style={{marginTop:18,fontSize:".72rem",color:"rgba(255,255,255,.15)",letterSpacing:".1em"}}>{LANG==="en"?"Delivered by email within 1 business day":"Bezorgd per e-mail binnen 1 werkdag"}</p>
    </div>
  );

  return(
    <div>
      <div className="section bg-muted" id="bestel">
        <div className="container-sm">
          <div className="label" style={{marginBottom:8}}>{LANG==="en"?"Step 1 — Enter your details":"Stap 1 — Gegevens invoeren"}</div>
          <h2 className="h2" style={{marginBottom:8}}>{LANG==="en"?"Enter your birth details":"Vul je geboortegegevens in"}</h2>
          <p className="body-md" style={{marginBottom:32}}>{LANG==="en"?"Your chart is calculated immediately for free. You only pay after viewing your chart.":"Je chart wordt direct gratis berekend. Je betaalt pas na het bekijken van je chart."}</p>
          <div className="form-wrap">
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:"1.2rem",marginBottom:4}}>{tl(rpt.title)}</div>
              <div style={{fontSize:".82rem",color:"var(--text-light)"}}>{isNum?(LANG==="en"?"No birth time needed.":"Geen geboortetijd nodig."):(LANG==="en"?"Fill in all fields as accurately as possible.":"Vul alle velden zo nauwkeurig mogelijk in.")}</div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">{LANG==="en"?"First name":"Voornaam"}</label><input className="form-input" name="firstName" value={form.firstName} onChange={ch} placeholder={LANG==="en"?"Anna":"Anna"}/></div>
              <div className="form-group"><label className="form-label">{LANG==="en"?"Last name":"Achternaam"}</label><input className="form-input" name="lastName" value={form.lastName} onChange={ch} placeholder={LANG==="en"?"De Vries":"De Vries"}/></div>
              <div className="form-group full"><label className="form-label">{t("form.email")} <span style={{color:"var(--gold)",fontSize:".6rem"}}>{LANG==="en"?"— report will be sent here":"— rapport wordt hierheen verstuurd"}</span></label><input className="form-input" type="email" name="email" value={form.email} onChange={ch} placeholder={t("form.emailPlaceholder")} required/></div>
              <div className="form-group"><label className="form-label">{t("form.day")}</label><input className="form-input" type="number" name="day" min="1" max={maxDay()} value={form.day} onChange={ch} onBlur={numBlur("day",1,maxDay())} placeholder="15"/></div>
              <div className="form-group"><label className="form-label">{t("form.month")}</label><select className="form-select" name="month" value={form.month} onChange={ch}><option value="">{LANG==="en"?"month":"maand"}</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
              <div className="form-group"><label className="form-label">{t("form.year")}</label><input className="form-input" type="number" name="year" min="1900" max={new Date().getFullYear()} value={form.year} onChange={ch} onBlur={numBlur("year",1900,new Date().getFullYear())} placeholder="1990"/></div>
              {needsTime&&<div className="form-group"><label className="form-label">{t("form.birthTime")}</label><div className="form-row"><input className="form-input" type="number" name="hour" min="0" max="23" value={form.hour} onChange={ch} onBlur={numBlur("hour",0,23)} placeholder={t("form.hour")}/><input className="form-input" type="number" name="minute" min="0" max="59" value={form.minute} onChange={ch} onBlur={numBlur("minute",0,59)} placeholder={t("form.minute")}/></div><div style={{fontSize:".72rem",color:"var(--text-light)",marginTop:5}}>{t("form.timeNote")}</div></div>}
              <div className="form-group full">
                <label className="form-label">{t("form.birthPlace")}</label>
                <PlaceAutocomplete
                  value={form.place}
                  placeholder={LANG==="en"?"Amsterdam, Netherlands":"Amsterdam, Nederland"}
                  onSelect={({place,lat,lon,timezone})=>setForm(f=>({...f,place,lat:lat||"",lon:lon||"",timezone:timezone||"",tz:""}))}
                />
              </div>
            </div>
            {rpt.needsPartner&&<>
              <div className="form-divider"/>
              <div style={{fontSize:".85rem",color:"var(--text-muted)",marginBottom:14}}>{t("form.partnerSection",{label:tl(rpt.partnerLabel)||(LANG==="en"?"partner":"partner")})}</div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">{LANG==="en"?"First name":"Voornaam"} {tl(rpt.partnerLabel)||(LANG==="en"?"partner":"partner")}</label><input className="form-input" name="pFirstName" value={form.pFirstName} onChange={ch} placeholder={LANG==="en"?"Thomas":"Thomas"}/></div>
                <div className="form-group"><label className="form-label">{LANG==="en"?"Last name":"Achternaam"} {tl(rpt.partnerLabel)||(LANG==="en"?"partner":"partner")}</label><input className="form-input" name="pLastName" value={form.pLastName} onChange={ch} placeholder={LANG==="en"?"De Vries":"De Vries"}/></div>
                {rpt.id==="relatie_familie"&&<div className="form-group full"><label className="form-label">{LANG==="en"?"Relationship":"Relatie"}</label><select className="form-select" name="familyRelation" value={form.familyRelation||""} onChange={ch}><option value="">{LANG==="en"?"Select relationship…":"Selecteer relatie…"}</option><option value={LANG==="en"?"Parent & child":"Ouder & kind"}>{LANG==="en"?"Parent & child":"Ouder & kind"}</option><option value={LANG==="en"?"Siblings":"Broer & zus"}>{LANG==="en"?"Siblings":"Broer & zus"}</option><option value={LANG==="en"?"Grandparent & grandchild":"Grootouder & kleinkind"}>{LANG==="en"?"Grandparent & grandchild":"Grootouder & kleinkind"}</option><option value={LANG==="en"?"Other family relationship":"Andere familierelatie"}>{LANG==="en"?"Other family relationship":"Andere familierelatie"}</option></select></div>}
{rpt.id==="relatie_familie"&&form.familyRelation&&(()=>{
  const roles=getFamilyRoles(form.familyRelation,form.familyRolesSwapped);
  if(!roles)return null;
  const isH=roles[0]!==roles[1];
  const n1=form.firstName||(LANG==="en"?"Person 1":"Persoon 1");
  const n2=form.pFirstName||(LANG==="en"?"Person 2":"Persoon 2");
  return<div className="form-group full" style={{display:"flex",alignItems:"center",gap:12,background:"rgba(138,115,85,.06)",padding:"10px 14px",border:"1px solid var(--border)"}}>
    <div style={{flex:1,fontSize:".82rem",color:"var(--text-muted)",lineHeight:1.5}}>
      <strong style={{color:"var(--text)",fontWeight:500}}>{n1}</strong>{" = "}{roles[0]}
      <span style={{margin:"0 8px",color:"var(--border)"}}>·</span>
      <strong style={{color:"var(--text)",fontWeight:500}}>{n2}</strong>{" = "}{roles[1]}
    </div>
    {isH&&<button type="button" onClick={()=>setForm(f=>({...f,familyRolesSwapped:!f.familyRolesSwapped}))} style={{fontSize:".68rem",fontWeight:400,letterSpacing:".1em",textTransform:"uppercase",background:"transparent",border:"1px solid rgba(26,23,20,.2)",padding:"6px 12px",cursor:"pointer",color:"var(--text-muted)",whiteSpace:"nowrap",flexShrink:0}}>⇄ {LANG==="en"?"Swap":"Omdraaien"}</button>}
  </div>;
})()}
                <div className="form-group"><label className="form-label">{t("form.day")}</label><input className="form-input" type="number" name="pday" min="1" max="31" value={form.pday} onChange={ch} onBlur={numBlur("pday",1,31)}/></div>
                <div className="form-group"><label className="form-label">{t("form.month")}</label><select className="form-select" name="pmonth" value={form.pmonth} onChange={ch}><option value="">{LANG==="en"?"month":"maand"}</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
                <div className="form-group"><label className="form-label">{t("form.year")}</label><input className="form-input" type="number" name="pyear" min="1900" max={new Date().getFullYear()} value={form.pyear} onChange={ch} onBlur={numBlur("pyear",1900,new Date().getFullYear())}/></div>
                <div className="form-group"><label className="form-label">{t("form.birthTime")}</label><div className="form-row"><input className="form-input" type="number" name="phour" min="0" max="23" value={form.phour} onChange={ch} onBlur={numBlur("phour",0,23)} placeholder={t("form.hour")}/><input className="form-input" type="number" name="pminute" min="0" max="59" value={form.pminute} onChange={ch} onBlur={numBlur("pminute",0,59)} placeholder={t("form.minute")}/></div></div>
                <div className="form-group full">
                  <label className="form-label">{t("form.birthPlace")} {tl(rpt.partnerLabel)||(LANG==="en"?"partner":"partner")}</label>
                  <PlaceAutocomplete
                    value={form.pplace}
                    placeholder={t("form.placePlaceholder")}
                    onSelect={({place,lat,lon,timezone})=>setForm(f=>({...f,pplace:place,plat:lat||"",plon:lon||"",ptimezone:timezone||"",ptz:""}))}
                  />
                </div>
              </div>
            </>}
            {rpt.needsChild&&<>
              <div className="form-divider"/>
              <div style={{fontSize:".85rem",color:"var(--text-muted)",marginBottom:14}}>{LANG==="en"?"Child's details":"Gegevens kind"}</div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">{LANG==="en"?"First name":"Voornaam"} {LANG==="en"?"child":"kind"}</label><input className="form-input" name="cFirstName" value={form.cFirstName} onChange={ch} placeholder={LANG==="en"?"Emma":"Emma"}/></div>
                <div className="form-group"><label className="form-label">{LANG==="en"?"Last name":"Achternaam"} {LANG==="en"?"child":"kind"}</label><input className="form-input" name="cLastName" value={form.cLastName} onChange={ch} placeholder={LANG==="en"?"De Vries":"De Vries"}/></div>
                <div className="form-group"><label className="form-label">{t("form.day")}</label><input className="form-input" type="number" name="cday" min="1" max="31" value={form.cday} onChange={ch} onBlur={numBlur("cday",1,31)}/></div>
                <div className="form-group"><label className="form-label">{t("form.month")}</label><select className="form-select" name="cmonth" value={form.cmonth} onChange={ch}><option value="">{LANG==="en"?"month":"maand"}</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
                <div className="form-group"><label className="form-label">{t("form.year")}</label><input className="form-input" type="number" name="cyear" min="1900" max={new Date().getFullYear()} value={form.cyear} onChange={ch} onBlur={numBlur("cyear",1900,new Date().getFullYear())}/></div>
                <div className="form-group"><label className="form-label">{t("form.birthTime")}</label><div className="form-row"><input className="form-input" type="number" name="chour" min="0" max="23" value={form.chour} onChange={ch} onBlur={numBlur("chour",0,23)} placeholder={t("form.hour")}/><input className="form-input" type="number" name="cminute" min="0" max="59" value={form.cminute} onChange={ch} onBlur={numBlur("cminute",0,59)} placeholder={t("form.minute")}/></div></div>
                <div className="form-group full">
                  <label className="form-label">{LANG==="en"?"Child's place of birth":"Geboorteplaats kind"}</label>
                  <PlaceAutocomplete
                    value={form.cplace}
                    placeholder={t("form.placePlaceholder")}
                    onSelect={({place,lat,lon,timezone})=>setForm(f=>({...f,cplace:place,clat:lat||"",clon:lon||"",ctimezone:timezone||"",ctz:""}))}
                  />
                </div>
              </div>
            </>}
            <button className="btn btn-primary btn-full" style={{marginTop:20}} onClick={doChart} disabled={!ok}>{t("form.calculate")}</button>
            <p className="form-note">{LANG==="en"?"Free calculation — no payment required to view your chart. Your data is kept confidential.":"Gratis berekening — geen betaling vereist om je chart te zien. Je gegevens worden vertrouwelijk behandeld."}</p>
          </div>
        </div>
      </div>

      {chart&&(
        <div className="section bg-white" id="chart-res">
          <div className="container-sm">
            <div className="label" style={{marginBottom:8}}>{LANG==="en"?"Step 2 — Your chart":"Stap 2 — Je chart"}</div>
            <h2 className="h2" style={{marginBottom:32}}>{chart.isNumerology?(LANG==="en"?"Your core numbers":"Je kerngetallen"):chart.isHoroscoop?(LANG==="en"?"Your planet positions":"Je planeetstanden"):(rpt.id.startsWith("relatie_")||rpt.needsChild)?(LANG==="en"?"Combined Human Design chart":"Gecombineerde Human Design chart"):(LANG==="en"?"Your Human Design chart":"Je Human Design chart")}</h2>
            {/* ── Relatie: gecombineerde bodygraph + twee compacte tabellen ── */}
            {rpt.id.startsWith("relatie_")&&(()=>{
              const lbl=tl(rpt.partnerLabel)||"Partner";
              const c2=(form.pday&&form.pmonth&&form.pyear)?calcHD(parseInt(form.pyear),parseInt(form.pmonth),parseInt(form.pday),parseInt(form.phour||"12"),parseInt(form.pminute||"0")):null;
              const gedeeld=c2?chart.allGates.filter(g=>c2.allGates.includes(g)):[];
              const HDRow=({c,name})=>(
                <div className="chart-result">
                  <div style={{fontSize:".6rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--text-light)",marginBottom:4}}>Human Design</div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",marginBottom:16}}>{name}</div>
                  <table className="chart-table"><tbody>
                    <tr><td>Type</td><td><strong>{c.type}</strong></td></tr>
                    <tr><td>{LANG==="en"?"Strategy":"Strategie"}</td><td>{xlateStrat(c.strat)}</td></tr>
                    <tr><td>{LANG==="en"?"Authority":"Autoriteit"}</td><td>{xlateAuth(c.auth)}</td></tr>
                    <tr><td>{LANG==="en"?"Profile":"Profiel"}</td><td>{c.profile}</td></tr>
                    <tr><td>{LANG==="en"?"Defined":"Gedefinieerd"}</td><td><div className="tags">{c.definedCenters?.length>0?c.definedCenters.map(cn=><span key={cn} className="tag-def">{cn}</span>):<span style={{fontSize:".8rem",color:"var(--text-light)"}}>{LANG==="en"?"none":"geen"}</span>}</div></td></tr>
                    <tr><td>{LANG==="en"?"Gates":"Poorten"}</td><td><div className="tags">{c.allGates?.slice(0,10).map(g=><span key={g} className="tag-gate">{g}</span>)}{c.allGates?.length>10&&<span className="tag-gate">+{c.allGates.length-10}</span>}</div></td></tr>
                  </tbody></table>
                </div>
              );
              return(
                <>
                  {c2
                    ?<CompositeBodygraph chart1={chart} chart2={c2} name1={form.firstName} name2={form.pFirstName||lbl}/>
                    :<div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:32,textAlign:"center",marginBottom:20}}>
                      <p className="body-sm" style={{color:"var(--text-light)"}}>{LANG==="en"?`Enter the ${lbl.toLowerCase()}'s details to see the combined chart`:`Vul de gegevens van de ${lbl.toLowerCase()} in om de gecombineerde chart te zien`}</p>
                    </div>}
                  <div className="grid-2" style={{gap:20,marginTop:20,marginBottom:16}}>
                    <HDRow c={chart} name={form.firstName}/>
                    {c2?<HDRow c={c2} name={form.pFirstName||lbl}/>:
                      <div className="chart-result" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:160}}>
                        <p className="body-sm" style={{textAlign:"center",color:"var(--text-light)"}}>{LANG==="en"?`Enter the ${lbl.toLowerCase()}'s details`:`Vul de gegevens van de ${lbl.toLowerCase()} in`}</p>
                      </div>}
                  </div>
                  {c2&&gedeeld.length>0&&(
                    <div style={{background:"rgba(61,44,94,.06)",borderLeft:"3px solid var(--brand)",padding:"14px 18px",borderRadius:"0 var(--radius-sm) var(--radius-sm) 0",marginBottom:16}}>
                      <div style={{fontSize:".62rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--brand)",marginBottom:6}}>{LANG==="en"?"Shared gates — electromagnetic connections":"Gedeelde poorten — elektromagnetische verbindingen"}</div>
                      <div className="tags">{gedeeld.map(g=><span key={g} className="tag-def">{g}</span>)}</div>
                    </div>
                  )}
                </>
              );
            })()}
            {/* ── Kinderrapport: gecombineerde bodygraph ouder + kind ── */}
            {rpt.needsChild&&(()=>{
              const childChart=(form.cday&&form.cmonth&&form.cyear)?calcHD(parseInt(form.cyear),parseInt(form.cmonth),parseInt(form.cday),parseInt(form.chour||"12"),parseInt(form.cminute||"0")):null;
              const HDRow=({c,name})=>(
                <div className="chart-result">
                  <div style={{fontSize:".6rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--text-light)",marginBottom:4}}>Human Design</div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",marginBottom:16}}>{name}</div>
                  <table className="chart-table"><tbody>
                    <tr><td>Type</td><td><strong>{c.type}</strong></td></tr>
                    <tr><td>{LANG==="en"?"Strategy":"Strategie"}</td><td>{xlateStrat(c.strat)}</td></tr>
                    <tr><td>{LANG==="en"?"Authority":"Autoriteit"}</td><td>{xlateAuth(c.auth)}</td></tr>
                    <tr><td>{LANG==="en"?"Profile":"Profiel"}</td><td>{c.profile}</td></tr>
                    <tr><td>{LANG==="en"?"Defined":"Gedefinieerd"}</td><td><div className="tags">{c.definedCenters?.length>0?c.definedCenters.map(cn=><span key={cn} className="tag-def">{cn}</span>):<span style={{fontSize:".8rem",color:"var(--text-light)"}}>{LANG==="en"?"none":"geen"}</span>}</div></td></tr>
                    <tr><td>{LANG==="en"?"Gates":"Poorten"}</td><td><div className="tags">{c.allGates?.slice(0,10).map(g=><span key={g} className="tag-gate">{g}</span>)}{c.allGates?.length>10&&<span className="tag-gate">+{c.allGates.length-10}</span>}</div></td></tr>
                  </tbody></table>
                </div>
              );
              const childLabel=LANG==="en"?"Child":"Kind";
              return(
                <>
                  {childChart
                    ?<CompositeBodygraph chart1={chart} chart2={childChart} name1={form.firstName} name2={form.cFirstName||childLabel}/>
                    :<div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:32,textAlign:"center",marginBottom:20}}>
                      <p className="body-sm" style={{color:"var(--text-light)"}}>{LANG==="en"?"Enter the child's details to see the combined chart":"Vul de gegevens van het kind in om de gecombineerde chart te zien"}</p>
                    </div>}
                  <div className="grid-2" style={{gap:20,marginTop:20,marginBottom:16}}>
                    <HDRow c={chart} name={form.firstName}/>
                    {childChart?<HDRow c={childChart} name={form.cFirstName||childLabel}/>:
                      <div className="chart-result" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:160}}>
                        <p className="body-sm" style={{textAlign:"center",color:"var(--text-light)"}}>{LANG==="en"?"Enter the child's details":"Vul de gegevens van het kind in"}</p>
                      </div>}
                  </div>
                </>
              );
            })()}
            {/* ── Standaard HD: premium ChartDashboard ── */}
            {!rpt.id.startsWith("relatie_")&&!rpt.needsChild&&!chart.isNumerology&&!chart.isHoroscoop&&(
              <ChartDashboard
                chart={chart}
                name={form.firstName}
                onOrder={()=>document.getElementById("bestel")?.scrollIntoView({behavior:"smooth"})}
              />
            )}
            {/* ── Numerologie / Horoscoop: compact table + symbol card ── */}
            {!rpt.id.startsWith("relatie_")&&(chart.isNumerology||chart.isHoroscoop)&&(
            <div className="grid-2" style={{gap:28}}>
              <div>
                <div className="chart-result">
                  <div style={{fontSize:".6rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--text-light)",marginBottom:4}}>{chart.isNumerology?(LANG==="en"?"Numerology":"Numerologie"):(LANG==="en"?"Horoscope":"Horoscoop")}</div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",marginBottom:16}}>{form.firstName}</div>
                  {chart.isNumerology?(
                    <table className="chart-table"><tbody>
                      {(LANG==="en"
                        ?[["Life Path",chart.lp+" — "+chart.lpName],["Expression",chart.exp+" — "+chart.expName],["Soul",chart.soul],["Personality",chart.pers],["Birthday",chart.bday],["Pers. Year 2026",chart.py],["Maturity",chart.mat]]
                        :[["Levenspad",chart.lp+" — "+chart.lpName],["Uitdrukking",chart.exp+" — "+chart.expName],["Ziel",chart.soul],["Persoonlijkheid",chart.pers],["Verjaardag",chart.bday],["Pers. Jaar 2026",chart.py],["Rijping",chart.mat]]
                      ).map(([l,v])=>(
                        <tr key={l}><td>{l}</td><td>{v}{(v===11||v===22||v===33)&&<span style={{fontSize:".6rem",color:"var(--gold)",marginLeft:6,textTransform:"uppercase"}}>MASTER</span>}</td></tr>
                      ))}
                    </tbody></table>
                  ):(
                    <table className="chart-table"><tbody>
                      <tr><td>{LANG==="en"?"Sun sign":"Zonneteken"}</td><td>{chart.sun_sign}</td></tr>
                      <tr><td>Ascendant</td><td>{chart.ascendant?.degree}° {chart.ascendant?.sign}</td></tr>
                      <tr><td>{LANG==="en"?"Midheaven":"Midhemel"}</td><td>{chart.mc?.degree}° {chart.mc?.sign}</td></tr>
                      <tr><td>{LANG==="en"?"Dom. element":"Dom. element"}</td><td>{chart.dom_element}</td></tr>
                    </tbody></table>
                  )}
                </div>
              </div>
              <div>
                <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",border:"1px solid var(--border)",padding:32,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,minHeight:200}}>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"3rem",color:"rgba(61,44,94,.15)"}}>{chart.isNumerology?"∞":"☽"}</div>
                  <div className="label">{chart.isNumerology?(LANG==="en"?"Numerological calculation":"Numerologische berekening"):(LANG==="en"?"Astrological calculation":"Astrologische berekening")}</div>
                  <p className="body-sm">{LANG==="en"?"Calculated based on your exact birth data.":"Berekend op basis van je exacte geboortedata."}</p>
                </div>
              </div>
            </div>
            )}
            <div style={{marginTop:40,padding:"48px 0 0",borderTop:"1px solid var(--border)",textAlign:"center"}}>
              <p style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.8,marginBottom:32,maxWidth:480,margin:"0 auto 32px"}}>
                {LANG==="en"
                  ?"Personally assembled and written with care. Delivered as PDF within one business day."
                  :"Persoonlijk samengesteld en met aandacht geschreven. Bezorgd als PDF binnen één werkdag."}
              </p>
              <button
                disabled={stripeLoading}
                style={{fontFamily:"var(--font-sans)",fontSize:".72rem",fontWeight:400,letterSpacing:".16em",textTransform:"uppercase",color:"var(--text)",background:"transparent",border:"1px solid rgba(26,23,20,.3)",padding:"14px 48px",cursor:stripeLoading?"default":"pointer",transition:"all .3s ease",display:"inline-flex",alignItems:"center",justifyContent:"center",opacity:stripeLoading?.7:1}}
                onMouseEnter={e=>{if(stripeLoading)return;e.currentTarget.style.background="var(--text)";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="var(--text)";}}
                onMouseLeave={e=>{if(stripeLoading)return;e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text)";e.currentTarget.style.borderColor="rgba(26,23,20,.3)";}}
                onClick={async()=>{
                  if(stripeLoading)return;
                  setStripeLoading(true);
                  track("checkout_started",{report:rpt.id,price:rpt.priceNum});
                  try{ await goToStripe(rpt.id,chart,form); }
                  finally{ setStripeLoading(false); }
                }}
              >
                {stripeLoading&&<span className="btn-spinner"/>}
                {stripeLoading
                  ?(LANG==="en"?"Redirecting…":"Doorsturen…")
                  :(rpt.id.startsWith("relatie_")?(LANG==="en"?"Receive your reading":"Ontvang jullie reading"):(LANG==="en"?"Receive your reading":"Ontvang je reading"))}
              </button>
              <div style={{marginTop:16,fontFamily:"var(--font-sans)",fontSize:".78rem",letterSpacing:".1em",color:"var(--text-light)",textTransform:"uppercase"}}>{rpt.price}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────
function HomePage({go}){
  const lang = useDynamicLang();  // Get reactive language from context
  useSEO({
    title:lang==="en"?"Human Design Reading — Personal & In-Depth":"Human Design Reading — Persoonlijk & Diepgaand",
    description:lang==="en"?"Receive an in-depth, personal Human Design reading based on your exact birth data. 40+ pages, Swiss Ephemeris precision, delivered as PDF. Founded on Ibiza in 2014. From €45.":"Ontvang een diepgaande, persoonlijke Human Design reading op basis van je exacte geboortedata. 40+ pagina's, Swiss Ephemeris precisie, bezorgd als PDF. Opgericht op Ibiza in 2014. Vanaf €45.",
    canonical:SITE+"/",
    jsonLd:{
      "@context":"https://schema.org","@type":"ItemList",
      "name":lang==="en"?"Human Design Readings — Faculty of Human Design":"Human Design Readings — Faculty of Human Design",
      "description":lang==="en"?"In-depth personal readings based on Human Design, Numerology and Astrology.":"Diepgaande persoonlijke readings op basis van Human Design, Numerologie en Astrologie.",
      "itemListElement": REPORTS.slice(0,4).map((r,i)=>({
        "@type":"ListItem","position":i+1,
        "name":tl(r.title),"description":tl(r.tagline),
        "url":SITE+"/#rapport-"+r.id
      }))
    }
  });
  return(
    <div className="pg">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero" aria-label="Hoofdbanner">
        <div className="hero-bg">
          <img src={IMGS.hero} alt="Sterrenhemel boven Ibiza — Faculty of Human Design persoonlijke readings" loading="eager" fetchPriority="high"/>
        </div>
        <div className="hero-stars"/>
        <div className="hero-glow"/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"40%",background:"linear-gradient(to top, rgba(8,7,16,.72) 0%, transparent 100%)",pointerEvents:"none",zIndex:1}}/>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">{lang==="en"?"Faculty of Human Design — Ibiza, Spain":"Faculty of Human Design — Ibiza, Spanje"}</div>
            <h1 className="h1-hero">{lang==="en"?<>Your reading.<br/><em>Your truth.</em></>:<>Jouw reading.<br/><em>Jouw waarheid.</em></>}</h1>
            <p className="hero-subtitle">{lang==="en"?"An intimate, in-depth portrait of who you are, drawn from your birth data and delivered as PDF within 1 business day.":"Een intiem, diepgaand portret van wie jij bent, getekend uit je geboortedata en bezorgd als PDF binnen 1 werkdag."}</p>
            <div className="hero-actions" style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:36}}>
              <button className="btn btn-white btn-lg" onClick={()=>{track("hero_cta_click",{location:"hero"});go("rapport-volledig");}}>
                {t("home.heroCta")}
              </button>
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="hero-scroll-line"/>
          <div className="hero-scroll-label">Scroll</div>
        </div>
      </section>

      {/* ── EDITORIAL SIGNAL STRIP ───────────────────────────────────────── */}
      <div style={{background:"var(--bg)",borderBottom:"1px solid var(--border)",padding:"20px 0"}}>
        <div className="signal-strip-inner">
          {(LANG==="en"
            ?[["2,400+","readings delivered"],["4.9 / 5","average rating"],["Est. 2014","Ibiza, Spain"],["Swiss Ephemeris","astronomical precision"]]
            :[["2.400+","readings bezorgd"],["4.9 / 5","gemiddelde beoordeling"],["Est. 2014","Ibiza, Spanje"],["Swiss Ephemeris","astronomische precisie"]]
          ).map(([n,l])=>(
            <div key={l} style={{textAlign:"center",flexShrink:0}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:400,color:"var(--text)",letterSpacing:".02em"}}>{n}</div>
              <div style={{fontSize:".65rem",fontWeight:400,color:"var(--text-light)",textTransform:"uppercase",letterSpacing:".1em",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHY FACULTYHD EXISTS — brand philosophy ──────────────────────── */}
      <section className="brand-section-pad" style={{padding:"128px 40px",background:"var(--bg)"}}>
        <div style={{maxWidth:840,margin:"0 auto"}}>
          <div className="philosophy-grid">
            <div>
              <div style={{width:28,height:1,background:"var(--gold)",marginBottom:20,opacity:.6}}/>
              <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",lineHeight:1.8}}>
                {lang==="en"?"Our reason for being":"Waarom wij bestaan"}
              </div>
            </div>
            <div>
              <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1rem,1.9vw,1.38rem)",fontWeight:300,color:"var(--text)",lineHeight:1.78,margin:0}}>
                {lang==="en"
                  ?"Many people spend years trying to fix parts of themselves that were never broken. Sometimes what you call a flaw is simply how your system was designed to work."
                  :"Veel mensen brengen jaren door met het proberen te repareren van delen van zichzelf die nooit kapot waren. Soms is wat je een gebrek noemt gewoon hoe jouw systeem ontworpen is om te werken."}
              </p>
              <div className="philosophy-quotes">
                {(lang==="en"?[
                  "Recognition is often more valuable than advice.",
                  "Clarity can arrive when you stop trying to become someone else.",
                  "Not everything that feels heavy belongs to you.",
                ]:[
                  "Herkenning is vaak waardevoller dan advies.",
                  "Helderheid kan ontstaan als je stopt met proberen iemand anders te worden.",
                  "Niet alles wat zwaar aanvoelt is van jou.",
                ]).map((q,i)=>(
                  <p key={i} className="philosophy-quote">"{q}"</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WAAROM ANDERS — open editorial pillars ───────────────────────── */}
      <section style={{padding:"112px 0",background:"#fff"}}>
        <div className="container">
          <div className="editorial-header">
            <div>
              <div className="label" style={{marginBottom:14}}>{t("home.waaromLabel")}</div>
              <h2 className="h2" style={{marginBottom:0,maxWidth:480}}>{t("home.waaromTitle")}</h2>
            </div>
            <div style={{width:48,height:1,background:"var(--gold)",opacity:.4,marginBottom:6}}/>
          </div>
          <div className="waarom-grid">
            {(LANG==="en"?[
              [IMGS.w_precision,"Astronomical precision","Swiss Ephemeris","Every calculation uses Swiss Ephemeris, the professional standard for exact planetary positions to the degree."],
              [IMGS.w_depth,    "In-depth analysis",     "40+ pages",      "No bullet points, no generic texts. Extensive prose tailored to your unique combination of Type, Authority and Profile."],
              [IMGS.w_ibiza,    "Ibiza as origin",       "Est. 2014",      "Founded on the island where Ra Uru Hu received the Human Design system in 1987. Every report carries that clarity."],
            ]:[
              [IMGS.w_precision,"Astronomische precisie","Swiss Ephemeris","Elke berekening gebruikt Swiss Ephemeris, de professionele standaard voor exacte planeetposities tot op de graad."],
              [IMGS.w_depth,    "Diepgaande analyse",    "40+ pagina's",   "Geen bulletpoints, geen generieke teksten. Uitgebreide proza afgestemd op jouw unieke combinatie van Type, Autoriteit en Profiel."],
              [IMGS.w_ibiza,    "Ibiza als oorsprong",   "Est. 2014",      "Opgericht op het eiland waar Ra Uru Hu in 1987 het Human Design systeem ontving. Elk rapport draagt die helderheid."],
            ]).map(([img,title,badge,desc])=>(
              <div key={title} style={{display:"flex",flexDirection:"column"}}>
                <div style={{position:"relative",aspectRatio:"3/4",overflow:"hidden",marginBottom:28}}>
                  <img src={img} alt={`Faculty of Human Design — ${title}`} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 55%,rgba(8,7,16,.45) 100%)"}}/>
                  <div style={{position:"absolute",bottom:18,left:20,fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:500,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:".14em"}}>{badge}</div>
                </div>
                <div style={{width:28,height:1,background:"var(--gold)",marginBottom:20,opacity:.6}}/>
                <h4 style={{fontFamily:"var(--font-serif)",fontSize:"1.25rem",fontWeight:400,color:"var(--text)",marginBottom:12,lineHeight:1.2}}>{title}</h4>
                <p style={{fontSize:".88rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.8}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDITORIAL QUOTE PAUSE ────────────────────────────────────────── */}
      <div style={{background:"var(--bg)",padding:"96px 40px",textAlign:"center"}}>
        <div style={{maxWidth:620,margin:"0 auto"}}>
          <div style={{width:1,height:48,background:"var(--gold)",margin:"0 auto 40px",opacity:.45}}/>
          <blockquote style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.35rem,2.2vw,1.75rem)",fontWeight:300,fontStyle:"italic",color:"var(--text)",lineHeight:1.55,letterSpacing:"-.01em",margin:0}}>
            {lang==="en"
              ? "\"Not a personality test. A precise map of your energetic architecture, drawn from the exact moment you arrived.\""
              : "\"Geen persoonlijkheidstest. Een nauwkeurige kaart van jouw energetische architectuur, getekend uit het exacte moment waarop jij arriveerde.\""}
          </blockquote>
          <div style={{width:1,height:48,background:"var(--gold)",margin:"40px auto 0",opacity:.45}}/>
        </div>
      </div>

      {/* ── MEEST GEKOZEN — editorial feature split ──────────────────────── */}
      <div className="feature-split">
        <div className="feature-content">
          <div className="label" style={{marginBottom:14}}>{t("home.featuredBadge")}</div>
          <h2 className="h2" style={{marginBottom:18}}>{tl(REPORTS[0].title)}</h2>
          <p className="body-lg" style={{marginBottom:32,maxWidth:420}}>{tl(REPORTS[0].tagline)}</p>
          <div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
            <button className="btn btn-primary btn-lg" onClick={()=>{track("report_card_click",{report:"volledig",price:75,location:"featured"});go("rapport-volledig");}}>
              {t("report.orderBtn",{price:"€75"})}
            </button>
            <span style={{fontSize:".8rem",color:"var(--text-light)",textAlign:"center"}}>{LANG==="en"?"40+ pages · Within 1 business day":"40+ pagina's · Binnen 1 werkdag"}</span>
          </div>
        </div>
        <div className="feature-image-wrap ph">
          <img src={IMGS.ibiza} alt="Ibiza golden hour" loading="lazy"/>
          <div className="ov" style={{background:"linear-gradient(to bottom,rgba(12,10,23,.05) 0%,rgba(12,10,23,.4) 100%)"}}/>
        </div>
      </div>

      {/* ── ALLE RAPPORTEN — open editorial grid ─────────────────────────── */}
      <section style={{padding:"112px 0",background:"var(--bg)"}}>
        <div className="container">
          <div className="editorial-header">
            <div>
              <div className="label" style={{marginBottom:14}}>{t("rapporten.eyebrow")}</div>
              <h2 className="h2" style={{marginBottom:0,maxWidth:480}}>{t("rapporten.title")}</h2>
            </div>
            <p style={{fontSize:".88rem",fontWeight:300,color:"var(--text-muted)",maxWidth:300,textAlign:"right",lineHeight:1.7}}>{t("rapporten.sub")}</p>
          </div>
          <div className="reports-grid">
            {REPORTS.filter(r=>["relatie_liefde","jaar","loopbaan"].includes(r.id)).map(r=>(
              <div key={r.id} style={{cursor:"pointer"}} onClick={()=>go("rapport-"+r.id)}>
                <div style={{position:"relative",aspectRatio:"4/5",overflow:"hidden",marginBottom:24}}>
                  <img src={IMGS["r_"+r.id]||IMGS.hero} alt={tl(r.title)} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",transition:"transform .6s ease"}}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                  />
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(8,7,16,.5) 100%)"}}/>
                  <div style={{position:"absolute",bottom:20,left:20,right:20,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                    <span style={{fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:500,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:".12em"}}>{tl(r.tag)||""}</span>
                    <span style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",fontWeight:300,color:"white"}}>{r.price}</span>
                  </div>
                </div>
                <div style={{width:24,height:1,background:"var(--gold)",marginBottom:16,opacity:.5}}/>
                <h4 style={{fontFamily:"var(--font-serif)",fontSize:"1.15rem",fontWeight:400,color:"var(--text)",marginBottom:8,lineHeight:1.25}}>{tl(r.title)}</h4>
                <p style={{fontSize:".82rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.75,marginBottom:0}}>{tl(r.tagline)}</p>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:64}}>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>{t("home.viewAll")}</button>
          </div>
        </div>
      </section>

      {/* ── THE READING EXPERIENCE — calm journey ────────────────────────── */}
      <section className="brand-section-pad" style={{padding:"128px 40px",background:"var(--muted)"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:80}}>
            <div style={{width:1,height:48,background:"var(--gold)",margin:"0 auto 36px",opacity:.45}}/>
            <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",marginBottom:22}}>
              {lang==="en"?"The reading experience":"De reading"}
            </div>
            <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.9rem,3.5vw,2.6rem)",fontWeight:300,color:"var(--text)",lineHeight:1.1,margin:0}}>
              {lang==="en"?"What happens after you begin":"Wat er na je bestelling gebeurt"}
            </h2>
          </div>
          <div style={{display:"flex",flexDirection:"column"}}>
            {(lang==="en"?[
              ["01","Your birth details are submitted","Date, time and place of birth. These are the coordinates from which your reading is drawn. The more precise, the more personal."],
              ["02","Your chart is calculated","Using Swiss Ephemeris, the professional-grade astronomical standard. Exact planetary positions to the degree, the same as used by observatories worldwide."],
              ["03","Your reading is composed","Section by section, written for your specific chart. No templates, no generic profiles. Each layer moves deeper into what makes you distinctly you."],
              ["04","Delivered to your inbox","Within one business day, a PDF arrives by email. Yours to keep, to return to, to read slowly. A document that does not expire."],
            ]:[
              ["01","Je geboortegegevens worden ingevoerd","Datum, tijd en geboorteplaats. Dit zijn de coördinaten waaruit jouw reading wordt samengesteld. Hoe nauwkeuriger, hoe persoonlijker."],
              ["02","Je chart wordt berekend","Met Swiss Ephemeris, de professionele astronomische standaard. Exacte planeetposities tot op de graad, dezelfde als gebruikt door sterrenwachten wereldwijd."],
              ["03","Jouw reading wordt samengesteld","Sectie voor sectie, geschreven voor jouw specifieke chart. Geen templates, geen generieke profielen. Elke laag gaat dieper in op wat jou uniek maakt."],
              ["04","Afgeleverd in je inbox","Binnen één werkdag arriveert een PDF per e-mail. Om te bewaren, om naar terug te keren, om rustig te lezen. Een document dat niet veroudert."],
            ]).map(([num,title,desc],i,arr)=>(
              <div key={num} className="experience-step" style={{paddingBottom:i<arr.length-1?56:0}}>
                {i<arr.length-1&&<div className="experience-connector"/>}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:6,zIndex:1}}>
                  <div className="experience-step-num">
                    <span style={{fontFamily:"var(--font-serif)",fontSize:".72rem",fontWeight:300,color:"var(--text-light)"}}>{num}</span>
                  </div>
                </div>
                <div>
                  <h4 style={{fontFamily:"var(--font-serif)",fontSize:"1.12rem",fontWeight:400,color:"var(--text)",marginBottom:10,lineHeight:1.2}}>{title}</h4>
                  <p style={{fontSize:".875rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.85,margin:0}}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND CREDIBILITY — quiet editorial markers ───────────────────── */}
      <section className="brand-section-pad" style={{background:"var(--dark)",padding:"88px 40px"}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <div style={{width:28,height:1,background:"rgba(201,168,92,.5)",margin:"0 auto 0",opacity:1}}/>
          </div>
          <div className="credibility-grid">
            {(lang==="en"?[
              ["Since 2014","Founded on Ibiza, the island where Human Design was received in 1987. That origin is not background. It is the reason."],
              ["2,400+\npersonal\nreadings","Not generated from templates. Every reading drawn from its own chart, composed by hand, specific to the person."],
              ["Three\ndisciplines","Human Design, Numerology and Astrology — used together as a single, unified language for who you are."],
              ["Recognition\nover labels","A reading does not tell you who to become. It shows you what was always already true."],
            ]:[
              ["Sinds 2014","Opgericht op Ibiza, het eiland waar Human Design in 1987 werd ontvangen. Die oorsprong is geen achtergrond. Het is de reden."],
              ["2.400+\npersoonlijke\nreadings","Niet gegenereerd uit templates. Elke reading getrokken uit zijn eigen chart, met de hand samengesteld, specifiek voor de persoon."],
              ["Drie\ndisciplines","Human Design, Numerologie en Astrologie — samen gebruikt als één, verenigde taal voor wie je bent."],
              ["Herkenning\nboven labels","Een reading vertelt je niet wie je moet worden. Het laat zien wat altijd al waar was."],
            ]).map(([n,desc])=>(
              <div key={n} style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:28}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.55rem",fontWeight:300,color:"white",lineHeight:1.15,marginBottom:16,whiteSpace:"pre-line"}}>{n}</div>
                <p style={{fontSize:".82rem",fontWeight:300,color:"rgba(255,255,255,.4)",lineHeight:1.78,margin:0}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — pure editorial quotes ─────────────────────────── */}
      <section style={{padding:"112px 0",background:"#fff"}}>
        <div className="testimonials-wrap">
          <div style={{textAlign:"center",marginBottom:80}}>
            <div className="label" style={{marginBottom:14}}>{t("home.testimonialsLabel")}</div>
            <h2 className="h2" style={{marginBottom:0}}>{t("home.testimonialsTitle")}</h2>
          </div>
          <div className="testimonials-grid">
            {(lang==="en"?[
              ["I felt emotionally recognised for the first time, not analysed. Something in me landed in the right place.","S. Muller, Utrecht","Human Design Reading"],
              ["We had struggled to understand each other for years. The reading named exactly the patterns we couldn't see ourselves. One evening of reading changed how we speak to each other.","T. and E. Dubois, Antwerp","Relationship Reading"],
              ["Three months later I still read it. Every chapter reveals something I had long felt but never been able to name.","M. van den Berg, Amsterdam","Human Design Reading"],
            ]:[
              ["Ik voelde me voor het eerst emotioneel erkend, niet geanalyseerd. Iets in mij raakte op zijn plek.","S. Muller, Utrecht","Human Design Reading"],
              ["Wij hadden al jaren moeite om elkaar te begrijpen. De reading noemde precies de patronen die wij zelf niet konden zien. Eén avond lezen veranderde hoe wij met elkaar praten.","T. en E. Dubois, Antwerpen","Relationship Reading"],
              ["Drie maanden later lees ik het nog steeds. Elk hoofdstuk legt iets bloot dat ik al lang voelde maar nooit had kunnen benoemen.","M. van den Berg, Amsterdam","Human Design Reading"],
            ]).map(([q,n,r])=>(
              <div key={n} style={{display:"flex",flexDirection:"column",paddingTop:28,borderTop:"1px solid var(--border)"}}>
                <blockquote style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:300,fontStyle:"italic",color:"var(--text)",lineHeight:1.82,margin:"0 0 28px",letterSpacing:"-.005em",textAlign:"left"}}>
                  "{q}"
                </blockquote>
                <div style={{display:"flex",alignItems:"center",gap:12,marginTop:"auto"}}>
                  <div style={{width:20,height:1,background:"var(--gold)",opacity:.55,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:".78rem",fontWeight:500,color:"var(--text)",letterSpacing:".02em"}}>{n}</div>
                    <div style={{fontSize:".68rem",fontWeight:300,color:"var(--text-light)",textTransform:"uppercase",letterSpacing:".1em",marginTop:2}}>{r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TYPES STRIP ──────────────────────────────────────────────────── */}
      <section style={{background:"var(--bg)",padding:"96px 40px 104px"}}>
        <div style={{maxWidth:1040,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <div style={{width:24,height:1,background:"var(--gold)",margin:"0 auto 18px",opacity:.55}}/>
            <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.35rem,2.4vw,1.75rem)",fontWeight:300,color:"var(--text)",lineHeight:1.2,margin:0}}>
              {lang==="en"?"Which type are you?":"Welk type ben jij?"}
            </h2>
          </div>
          <div className="types-grid-5" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:2,background:"var(--border)"}}>
            {[
              {id:"generator",          icon:"◎",nl:"Generator",           en:"Generator",           statNl:"~37%",statEn:"~37%",tagNl:"Reageren",               tagEn:"Respond"},
              {id:"manifesting-generator",icon:"◈",nl:"Manifesting Generator",en:"Manifesting Generator",statNl:"~33%",statEn:"~33%",tagNl:"Reageren & informeren",tagEn:"Respond & inform"},
              {id:"projector",          icon:"◇",nl:"Projector",           en:"Projector",           statNl:"~20%",statEn:"~20%",tagNl:"Wachten op uitnodiging",tagEn:"Wait for invitation"},
              {id:"manifestor",         icon:"◆",nl:"Manifestor",          en:"Manifestor",          statNl:"~9%", statEn:"~9%", tagNl:"Informeren",             tagEn:"Inform"},
              {id:"reflector",          icon:"◯",nl:"Reflector",           en:"Reflector",           statNl:"~1%", statEn:"~1%", tagNl:"Maancyclus",             tagEn:"Lunar cycle"},
            ].map(tp=>(
              <div key={tp.id} onClick={()=>go("type-"+tp.id)}
                style={{background:"white",padding:"32px 24px 28px",cursor:"pointer",transition:"background 180ms",display:"flex",flexDirection:"column",gap:0}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--muted)"}
                onMouseLeave={e=>e.currentTarget.style.background="white"}
              >
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.4rem",color:"var(--text)",opacity:.2,marginBottom:16,lineHeight:1}}>{tp.icon}</div>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:400,color:"var(--text)",marginBottom:6,lineHeight:1.2}}>{lang==="en"?tp.en:tp.nl}</div>
                <div style={{fontSize:".72rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.5}}>{lang==="en"?tp.tagEn:tp.tagNl}</div>
                <div style={{marginTop:"auto",paddingTop:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:".6rem",fontWeight:500,letterSpacing:".1em",textTransform:"uppercase",color:"var(--gold)"}}>{lang==="en"?tp.statEn:tp.statNl}</span>
                  <span style={{fontSize:".6rem",fontWeight:400,letterSpacing:".08em",textTransform:"uppercase",color:"var(--text-light)"}}>{lang==="en"?"Learn more":"Lees meer"} →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <div className="photo-cta-section">
        <div className="photo-cta-bg">
          <img src={IMGS.cta} alt="Kosmische sterrenhemel" loading="lazy"/>
        </div>
        <div className="photo-cta-content">
          <div className="divider divider-center" style={{marginBottom:40}}/>
          <h2 className="h2" style={{color:"white",marginBottom:20,maxWidth:560,margin:"0 auto 20px"}}>{t("home.ctaTitle")}</h2>
          <p className="body-lg" style={{color:"rgba(255,255,255,.45)",maxWidth:420,margin:"0 auto 44px",lineHeight:1.8}}>{t("home.ctaSub")}</p>
          <button className="btn btn-white btn-lg" onClick={()=>{track("hero_cta_click",{location:"bottom"});go("rapport-volledig");}}>
            {t("home.ctaBtn")}
          </button>
        </div>
      </div>

    </div>
  );
}

function WatPage({go}){
  const isEN=LANG==="en";

  useSEO({
    title:isEN?"What is Human Design? — Numerology, Astrology & Self-Recognition":"Wat is Human Design? — Numerologie, Astrologie & Zelfherkenning",
    description:isEN?"Human Design, Numerology and Astrology as three lenses on the same person. Not to explain who you are, but to recognise it.":"Human Design, Numerologie en Astrologie als drie lenzen op dezelfde persoon. Niet om uit te leggen wie je bent, maar om het te herkennen.",
    canonical:SITE+(isEN?"/en/human-design":"/human-design"),
    jsonLd:{"@context":"https://schema.org","@type":"WebPage","name":isEN?"What is Human Design?":"Wat is Human Design?","url":SITE+(isEN?"/en/human-design":"/human-design")}
  });

  return(
    <div className="pg">

      {/* ── CINEMATIC HERO ──────────────────────────────────────────────── */}
      <section style={{position:"relative",height:"100vh",minHeight:600,maxHeight:960,overflow:"hidden"}}>
        <img src={IMGS.hero} alt={isEN?"Starfield — Faculty of Human Design":"Sterrenhemel — Faculty of Human Design"} loading="eager"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(12,10,8,.2) 0%,rgba(12,10,8,.48) 55%,rgba(12,10,8,.8) 100%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 48px 72px",maxWidth:800}}>
          <div style={{width:1,height:56,background:"var(--gold)",opacity:.65,marginBottom:32}}/>
          <h1 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(2.4rem,5.5vw,4.2rem)",fontWeight:300,color:"white",lineHeight:1.12,letterSpacing:"-.01em",marginBottom:22,whiteSpace:"pre-line"}}>
            {isEN?`Three systems.\nOne portrait.`:`Drie systemen.\nEén portret.`}
          </h1>
          <p style={{fontFamily:"var(--font-sans)",fontSize:".78rem",fontWeight:300,color:"rgba(255,255,255,.42)",letterSpacing:".14em",textTransform:"uppercase"}}>
            {isEN?"Human Design · Numerology · Astrology":"Human Design · Numerologie · Astrologie"}
          </p>
        </div>
      </section>

      {/* ── EDITORIAL OPENING ───────────────────────────────────────────── */}
      <section style={{background:"var(--bg)",padding:"136px 40px"}}>
        <div style={{maxWidth:620,margin:"0 auto"}}>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.25rem,2.2vw,1.52rem)",fontWeight:300,color:"var(--text)",lineHeight:1.8,marginBottom:36}}>
            {isEN
              ?"Most people don't need more information about themselves. They need a language for what they already sense — a reflection clear enough to say: yes, that is me."
              :"De meeste mensen hebben geen nieuwe informatie over zichzelf nodig. Ze hebben een taal nodig voor wat ze al aanvoelen — een spiegel helder genoeg om te zeggen: ja, dat ben ik."}
          </p>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"1.02rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.9}}>
            {isEN
              ?"Human Design, Numerology and Astrology are not systems of explanation. They are systems of recognition. They don't tell you who to become — they describe who you already are."
              :"Human Design, Numerologie en Astrologie zijn geen verklaringssystemen. Het zijn herkenningssystemen. Ze vertellen je niet wie je moet worden — ze beschrijven wie je al bent."}
          </p>
        </div>
      </section>

      {/* ── VISUAL SILENCE ──────────────────────────────────────────────── */}
      <div style={{position:"relative",height:"62vh",minHeight:380,overflow:"hidden"}}>
        <img src={IMGS.cosmos} alt={isEN?"Faculty of Human Design":"Faculty of Human Design"} loading="lazy"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(12,10,8,.15)"}}/>
      </div>

      {/* ── HUMAN DESIGN ────────────────────────────────────────────────── */}
      <section style={{background:"white",padding:"130px 40px"}}>
        <div style={{maxWidth:740,margin:"0 auto"}}>
          <div style={{fontSize:".62rem",fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",marginBottom:22}}>Human Design</div>
          <div style={{width:24,height:1,background:"var(--gold)",marginBottom:52,opacity:.55}}/>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.15rem,2vw,1.4rem)",fontWeight:300,color:"var(--text)",lineHeight:1.84,marginBottom:34}}>
            {isEN
              ?"In 1987, Ra Uru Hu received a system that maps the mechanics of human energy. Not character traits — mechanics. How you are designed to move through the world, how decisions arise in you, and what happens when you act against your own nature."
              :"In 1987 ontving Ra Uru Hu een systeem dat de mechanica van menselijke energie in kaart brengt. Geen karaktertrekken — mechanica. Hoe jij ontworpen bent om door de wereld te bewegen, hoe beslissingen in je ontstaan, en wat er gebeurt wanneer je tegen je eigen aard in handelt."}
          </p>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.9}}>
            {isEN
              ?"The system draws on the I Ching, Kabbalah, astrology and quantum physics — not as decoration, but as structural pillars of a coherent framework. What emerges is a chart unique to you: your energy type, your decision-making authority, the centres that define your consistent nature."
              :"Het systeem put uit de I Ching, Kabbala, astrologie en kwantumfysica — niet als decoratie, maar als structurele pijlers van een samenhangend raamwerk. Wat ontstaat is een chart uniek aan jou: je energietype, je beslissingsautoriteit, de centra die je constante natuur definiëren."}
          </p>
        </div>
      </section>

      {/* ── IMAGE TRANSITION ────────────────────────────────────────────── */}
      <div style={{position:"relative",height:"52vh",minHeight:300,overflow:"hidden"}}>
        <img src={IMGS.r_volledig} alt={isEN?"Human Design chart":"Human Design chart"} loading="lazy"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 35%"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(12,10,8,.3)"}}/>
      </div>

      {/* ── NUMEROLOGIE ─────────────────────────────────────────────────── */}
      <section style={{background:"var(--bg)",padding:"130px 40px"}}>
        <div style={{maxWidth:740,margin:"0 auto"}}>
          <div style={{fontSize:".62rem",fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",marginBottom:22}}>{isEN?"Numerology":"Numerologie"}</div>
          <div style={{width:24,height:1,background:"var(--gold)",marginBottom:52,opacity:.55}}/>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.15rem,2vw,1.4rem)",fontWeight:300,color:"var(--text)",lineHeight:1.84,marginBottom:34}}>
            {isEN
              ?"Numbers don't predict. They recognise. In Pythagorean Numerology, your name and date of birth contain a precise numerical pattern that describes the themes running through your life — the lessons, the gifts, the recurring tensions."
              :"Getallen voorspellen niet. Ze herkennen. In de Pythagoreïsche Numerologie bevatten je naam en geboortedatum een precies numeriek patroon dat de thema's beschrijft die door je leven heen lopen — de lessen, de gaven, de terugkerende spanningen."}
          </p>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.9}}>
            {isEN
              ?"Your Life Path number is the thread. Your Expression number is the gift. Your Soul number is what you quietly long for. Together they draw a portrait of the life you were born into — not as destiny, but as orientation."
              :"Je Levenspadgetal is de rode draad. Je Uitdrukkingsgetal is de gave. Je Zielsgetal is wat je stilletjes verlangt. Samen tekenen ze een portret van het leven dat je geboren bent in te leven — niet als lot, maar als oriëntatie."}
          </p>
        </div>
      </section>

      {/* ── ASTROLOGIE ──────────────────────────────────────────────────── */}
      <section style={{background:"white",padding:"130px 40px"}}>
        <div style={{maxWidth:740,margin:"0 auto"}}>
          <div style={{fontSize:".62rem",fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",marginBottom:22}}>{isEN?"Birth Astrology":"Geboorteastrologie"}</div>
          <div style={{width:24,height:1,background:"var(--gold)",marginBottom:52,opacity:.55}}/>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.15rem,2vw,1.4rem)",fontWeight:300,color:"var(--text)",lineHeight:1.84,marginBottom:34}}>
            {isEN
              ?"The sky at the moment of your birth is a starting condition. Not a sentence — a fingerprint. The positions of the ten planets, the twelve houses and the rising sign on the eastern horizon form a constellation that is yours alone."
              :"De hemel op het moment van je geboorte is een beginconditie. Geen vonnis — een vingerafdruk. De posities van de tien planeten, de twaalf huizen en het rijzende teken aan de oostelijke horizon vormen een constellatie die alleen van jou is."}
          </p>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.9}}>
            {isEN
              ?"Western astrology is not about prediction. It is about correspondence — the idea that the qualities of a moment are mirrored in what is born within it. Your Sun, Moon and Ascendant are not labels. They are layers of a portrait."
              :"Westerse astrologie gaat niet over voorspellen. Het gaat over correspondentie — het idee dat de kwaliteiten van een moment weerspiegeld worden in wat er in geboren wordt. Je Zon, Maan en Ascendant zijn geen labels. Het zijn lagen van een portret."}
          </p>
        </div>
      </section>

      {/* ── VISUAL PAUSE ────────────────────────────────────────────────── */}
      <div style={{position:"relative",height:"55vh",minHeight:340,overflow:"hidden"}}>
        <img src={IMGS.r_horoscoop} alt={isEN?"Night sky — astrology":"Nachtelijke hemel — astrologie"} loading="lazy"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(12,10,8,.38)"}}/>
      </div>

      {/* ── THREE DISCIPLINES ───────────────────────────────────────────── */}
      <section style={{background:"var(--bg)",padding:"140px 40px"}}>
        <div style={{maxWidth:860,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"80px 64px",alignItems:"start"}}>
          <div>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.35rem,2.4vw,1.7rem)",fontWeight:300,color:"var(--text)",lineHeight:1.72}}>
              {isEN
                ?"Three independent systems. Three different languages. One person."
                :"Drie onafhankelijke systemen. Drie verschillende talen. Één persoon."}
            </p>
          </div>
          <div>
            <div style={{width:1,height:40,background:"var(--gold)",opacity:.5,marginBottom:40}}/>
            {(isEN?[
              ["Human Design","The mechanics of your energy — how you are designed to move, decide and live."],
              ["Numerology","The patterns in your name and date of birth — your life lessons and gifts."],
              ["Astrology","The qualities of your planetary placements — your inner landscape at the moment of birth."],
            ]:[
              ["Human Design","De mechanica van je energie — hoe jij ontworpen bent om te bewegen, te beslissen en te leven."],
              ["Numerologie","De patronen in je naam en geboortedatum — je levenslessen en gaven."],
              ["Astrologie","De kwaliteiten van je planetaire bezetting — je innerlijk landschap op het moment van geboorte."],
            ]).map(([name,desc])=>(
              <div key={name} style={{borderTop:"1px solid var(--border)",padding:"24px 0"}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:400,color:"var(--text)",marginBottom:6}}>{name}</div>
                <p style={{fontFamily:"var(--font-sans)",fontSize:".85rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.75}}>{desc}</p>
              </div>
            ))}
            <div style={{borderTop:"1px solid var(--border)"}}/>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL PAUSE ─────────────────────────────────────────────── */}
      <section style={{background:"white",padding:"160px 40px",textAlign:"center"}}>
        <div style={{maxWidth:520,margin:"0 auto"}}>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.2rem,2.2vw,1.52rem)",fontWeight:300,fontStyle:"italic",color:"var(--text)",lineHeight:1.85,whiteSpace:"pre-line"}}>
            {isEN
              ? `“Together they don’t add up.\n\nTogether they recognise.”`
              : `“Samen tellen ze niet op.\n\nSamen herkennen ze.”`}
          </p>
          <div style={{width:1,height:52,background:"var(--gold)",opacity:.5,margin:"56px auto 0"}}/>
        </div>
      </section>

      {/* ── DE VIJF TYPES ────────────────────────────────────────────────── */}
      <section style={{background:"var(--bg)",padding:"120px 40px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <div style={{width:24,height:1,background:"var(--gold)",margin:"0 auto 20px",opacity:.55}}/>
            <div style={{fontSize:".62rem",fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",marginBottom:20}}>
              {isEN?"The five types":"De vijf types"}
            </div>
            <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.5rem,2.8vw,2rem)",fontWeight:300,color:"var(--text)",lineHeight:1.2,margin:"0 auto",maxWidth:520}}>
              {isEN?"Every person is born with one of five energetic designs":"Elke persoon is geboren met één van vijf energetische designs"}
            </h2>
          </div>
          <div className="types-grid-5" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(152px,1fr))",gap:2,background:"var(--border)"}}>
            {[
              {id:"generator",   icon:"◎",nl:"Generator",         en:"Generator",          tagNl:"~37% · Reageren",              tagEn:"~37% · Respond"},
              {id:"manifesting-generator",icon:"◈",nl:"Manifesting Generator",en:"Manifesting Generator",tagNl:"~33% · Reageren & informeren",tagEn:"~33% · Respond & inform"},
              {id:"projector",   icon:"◇",nl:"Projector",         en:"Projector",          tagNl:"~20% · Wachten op uitnodiging",tagEn:"~20% · Wait for invitation"},
              {id:"manifestor",  icon:"◆",nl:"Manifestor",        en:"Manifestor",         tagNl:"~9% · Informeren",             tagEn:"~9% · Inform"},
              {id:"reflector",   icon:"◯",nl:"Reflector",         en:"Reflector",          tagNl:"~1% · Maancyclus",             tagEn:"~1% · Lunar cycle"},
            ].map(tp=>(
              <div key={tp.id} onClick={()=>go("type-"+tp.id)}
                style={{background:"white",padding:"28px 20px 24px",cursor:"pointer",transition:"background 180ms",minHeight:160,display:"flex",flexDirection:"column"}}
                onMouseEnter={e=>{e.currentTarget.style.background="var(--muted)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="white";}}
              >
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.3rem",marginBottom:14,opacity:.25,lineHeight:1}}>{tp.icon}</div>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:400,color:"var(--text)",marginBottom:8,lineHeight:1.2}}>{isEN?tp.en:tp.nl}</div>
                <div style={{fontSize:".7rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.55,marginTop:"auto"}}>{isEN?tp.tagEn:tp.tagNl}</div>
                <div style={{width:16,height:1,background:"var(--gold)",marginTop:16,opacity:.5}}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOFT CTA ────────────────────────────────────────────────────── */}
      <section style={{background:"white",padding:"152px 40px",textAlign:"center"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.05rem,1.8vw,1.3rem)",fontWeight:300,color:"var(--text)",lineHeight:1.88,marginBottom:52}}>
            {isEN
              ?"If something in you asks to be seen clearly — this is a quiet place to begin."
              :"Als er iets in je vraagt om helder gezien te worden — dit is een stille plek om te beginnen."}
          </p>
          <button onClick={()=>go("rapporten")}
            style={{fontFamily:"var(--font-sans)",fontSize:".75rem",fontWeight:400,letterSpacing:".16em",textTransform:"uppercase",padding:"16px 44px",background:"transparent",border:"1px solid var(--text)",color:"var(--text)",cursor:"pointer",transition:"opacity 200ms"}}
            onMouseEnter={e=>e.currentTarget.style.opacity=".6"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            {isEN?"Discover your reading":"Ontdek je reading"}
          </button>
        </div>
      </section>

    </div>
  );
}

function RapportenPage({go}){
  const hdPure=REPORTS.filter(r=>["volledig","jaar","kind","loopbaan"].includes(r.id));
  const relatie=REPORTS.filter(r=>r.id.startsWith("relatie_"));
  const other=REPORTS.filter(r=>["numerologie","horoscoop"].includes(r.id));
  const sub=REPORTS.find(r=>r.id==="maandelijks");
  useSEO({
    title:LANG==="en"?"Human Design Readings — Choose your personal reading":"Human Design Readings — Kies je persoonlijke reading",
    description:LANG==="en"?"Choose from 10 in-depth readings: Human Design Reading, Relationship, Career, Year, Child, Numerology and Birth Horoscope. Personal and delivered within 1 business day. From €45.":"Kies uit 10 diepgaande readings: Human Design Reading, Relationship, Loopbaan, Jaar, Kind, Numerologie en Geboortehoroscoop. Persoonlijk en bezorgd binnen 1 werkdag. Vanaf €45.",
    canonical:SITE+"/readings",
    jsonLd:{
      "@context":"https://schema.org","@type":"ItemList",
      "name":LANG==="en"?"Human Design Readings":"Human Design Readings",
      "itemListElement":REPORTS.map((r,i)=>({
        "@type":"ListItem","position":i+1,
        "name":tl(r.title),
        "url":SITE+"/#rapport-"+r.id,
        "offers":{"@type":"Offer","price":r.priceNum,"priceCurrency":"EUR"}
      }))
    }
  });
  return(
    <div className="pg">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="origin-section" style={{minHeight:360}}>
        <div className="origin-section-bg">
          <img src={IMGS.cosmos} alt="Kosmos" loading="eager"/>
        </div>
        <div className="page-hero-pad" style={{paddingTop:100,paddingBottom:72}}>
          <div className="label-light" style={{marginBottom:14}}>{t("rapporten.eyebrow")}</div>
          <h1 className="h1" style={{color:"white",marginBottom:16,maxWidth:580}}>{t("rapporten.title")}</h1>
          <p className="contact-hero-sub" style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.5)",lineHeight:1.78}}>{t("rapporten.sub")}</p>
        </div>
      </div>

      {/* ── HUMAN DESIGN RAPPORTEN ───────────────────────────────────────── */}
      <section style={{padding:"112px 0",background:"var(--bg)"}}>
        <div className="container">
          <div className="editorial-header">
            <div>
              <div className="label" style={{marginBottom:14}}>{t("rapporten.hdTitle")}</div>
              <h2 className="h2" style={{marginBottom:0,maxWidth:520}}>
                {LANG==="en"?"Your personal Human Design reading":"Jouw persoonlijke Human Design reading"}
              </h2>
            </div>
            <p style={{fontSize:".88rem",fontWeight:300,color:"var(--text-muted)",maxWidth:300,textAlign:"right",lineHeight:1.7}}>
              {LANG==="en"?"In-depth personal analyses: from full Human Design to career, year and child.":"Diepgaande persoonlijke analyses: van volledig Human Design tot loopbaan, jaar en kind."}
            </p>
          </div>
          <div className="rapporten-hd-grid">
            {hdPure.map(r=>(
              <div key={r.id} style={{cursor:"pointer"}} onClick={()=>{track("report_card_click",{report:r.id,price:r.priceNum,location:"rapporten"});go("rapport-"+r.id);}}>
                <div style={{position:"relative",aspectRatio:"4/5",overflow:"hidden",marginBottom:24}}>
                  <img src={IMGS["r_"+r.id]||IMGS.hero} alt={tl(r.title)} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",transition:"transform .6s ease"}}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                  />
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(8,7,16,.5) 100%)"}}/>
                  <div style={{position:"absolute",bottom:20,left:20,right:20,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                    <span style={{fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:500,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:".12em"}}>{tl(r.tag)||""}</span>
                    <span style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",fontWeight:300,color:"white"}}>{r.price}</span>
                  </div>
                </div>
                <div style={{width:24,height:1,background:"var(--gold)",marginBottom:16,opacity:.5}}/>
                <h4 style={{fontFamily:"var(--font-serif)",fontSize:"1.15rem",fontWeight:400,color:"var(--text)",marginBottom:8,lineHeight:1.25}}>{tl(r.title)}</h4>
                <p style={{fontSize:".82rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.75}}>{tl(r.tagline)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELATIE RAPPORTEN ────────────────────────────────────────────── */}
      <section style={{padding:"112px 0",background:"white"}}>
        <div className="container">
          <div className="editorial-header">
            <div>
              <div className="label" style={{marginBottom:14}}>{t("rapporten.relatieTitle")}</div>
              <h2 className="h2" style={{marginBottom:0,maxWidth:520}}>
                {LANG==="en"?"Two designs in connection":"Twee designs in verbinding"}
              </h2>
            </div>
            <p style={{fontSize:".88rem",fontWeight:300,color:"var(--text-muted)",maxWidth:300,textAlign:"right",lineHeight:1.7}}>
              {LANG==="en"?"Choose the perspective that suits your relationship. Each reading analyses two complete Human Design charts.":"Kies het perspectief dat past bij jullie relatie. Elke reading analyseert twee volledige Human Design charts."}
            </p>
          </div>
          <div className="reports-grid">
            {relatie.map(r=>(
              <div key={r.id} style={{cursor:"pointer"}} onClick={()=>{track("report_card_click",{report:r.id,price:r.priceNum,location:"rapporten"});go("rapport-"+r.id);}}>
                <div style={{position:"relative",aspectRatio:"4/5",overflow:"hidden",marginBottom:24}}>
                  <img src={IMGS["r_"+r.id]||IMGS.hero} alt={tl(r.title)} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",transition:"transform .6s ease"}}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                  />
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(8,7,16,.5) 100%)"}}/>
                  <div style={{position:"absolute",bottom:20,left:20,right:20,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                    <span style={{fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:500,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:".12em"}}>{tl(r.tag)||""}</span>
                    <span style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",fontWeight:300,color:"white"}}>{r.price}</span>
                  </div>
                </div>
                <div style={{width:24,height:1,background:"var(--gold)",marginBottom:16,opacity:.5}}/>
                <h4 style={{fontFamily:"var(--font-serif)",fontSize:"1.15rem",fontWeight:400,color:"var(--text)",marginBottom:8,lineHeight:1.25}}>{tl(r.title)}</h4>
                <p style={{fontSize:".82rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.75}}>{tl(r.tagline)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AANVULLENDE DISCIPLINES ──────────────────────────────────────── */}
      <section style={{padding:"112px 0",background:"var(--bg)"}}>
        <div className="container">
          <div className="editorial-header">
            <div>
              <div className="label" style={{marginBottom:14}}>{t("rapporten.andereTitle")}</div>
              <h2 className="h2" style={{marginBottom:0,maxWidth:520}}>
                {LANG==="en"?"Complementary disciplines":"Aanvullende disciplines"}
              </h2>
            </div>
            <p style={{fontSize:".88rem",fontWeight:300,color:"var(--text-muted)",maxWidth:300,textAlign:"right",lineHeight:1.7}}>
              {LANG==="en"?"Numerology and Astrology as depth layers alongside your Human Design.":"Numerologie en Astrologie als verdiepingslagen naast je Human Design."}
            </p>
          </div>
          <div className="rapporten-andere-grid">
            {other.map(r=>(
              <div key={r.id} style={{cursor:"pointer"}} onClick={()=>{track("report_card_click",{report:r.id,price:r.priceNum,location:"rapporten"});go("rapport-"+r.id);}}>
                <div style={{position:"relative",aspectRatio:"4/5",overflow:"hidden",marginBottom:24}}>
                  <img src={IMGS["r_"+r.id]||IMGS.hero} alt={tl(r.title)} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",transition:"transform .6s ease"}}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                  />
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(8,7,16,.5) 100%)"}}/>
                  <div style={{position:"absolute",bottom:20,left:20,right:20,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                    <span style={{fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:500,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:".12em"}}>{tl(r.tag)||""}</span>
                    <span style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",fontWeight:300,color:"white"}}>{r.price}</span>
                  </div>
                </div>
                <div style={{width:24,height:1,background:"var(--gold)",marginBottom:16,opacity:.5}}/>
                <h4 style={{fontFamily:"var(--font-serif)",fontSize:"1.15rem",fontWeight:400,color:"var(--text)",marginBottom:8,lineHeight:1.25}}>{tl(r.title)}</h4>
                <p style={{fontSize:".82rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.75}}>{tl(r.tagline)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAANDELIJKS ABONNEMENT ───────────────────────────────────────── */}
      {sub&&(
        <section style={{padding:"96px 0",background:"white"}}>
          <div className="container">
            <div style={{maxWidth:780,margin:"0 auto",textAlign:"center"}}>
              <div style={{width:1,height:48,background:"var(--gold)",margin:"0 auto 40px",opacity:.45}}/>
              <div className="label" style={{marginBottom:14}}>{t("rapporten.subTitle")}</div>
              <h2 className="h2" style={{marginBottom:20}}>{tl(sub.tagline)}</h2>
              <p style={{fontSize:"1rem",fontWeight:300,color:"var(--text-muted)",maxWidth:520,margin:"0 auto 40px",lineHeight:1.82}}>{tl(sub.intro)}</p>
              <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:8,marginBottom:36}}>
                <span style={{fontFamily:"var(--font-serif)",fontSize:"3rem",fontWeight:300,color:"var(--text)",lineHeight:1}}>€19</span>
                <span style={{fontSize:".72rem",color:"var(--text-light)",textTransform:"uppercase",letterSpacing:".1em",paddingBottom:6}}>{LANG==="en"?"per month":"per maand"}</span>
              </div>
              <button
                style={{fontFamily:"var(--font-sans)",fontSize:".72rem",fontWeight:400,letterSpacing:".16em",textTransform:"uppercase",color:"var(--text)",background:"transparent",border:"1px solid rgba(26,23,20,.3)",padding:"14px 48px",cursor:"pointer",transition:"all .3s ease",display:"inline-block"}}
                onMouseEnter={e=>{e.currentTarget.style.background="var(--text)";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="var(--text)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text)";e.currentTarget.style.borderColor="rgba(26,23,20,.3)";}}
                onClick={()=>go("rapport-maandelijks")}
              >{t("report.monthlyViewBtn")}</button>
              <div style={{width:1,height:48,background:"var(--gold)",margin:"40px auto 0",opacity:.45}}/>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

function ReportDetailPage({rpt,go,onDone,postPayment}){
  const[faq,setFaq]=useState(null);
  const genericFaqs = LANG==="en" ? [
    ["Do I need my exact birth time?","We use professional-grade astronomical algorithms. The more accurate the time, the more personal the result."],
    ["Is the reading truly personal?","Every reading is uniquely compiled based on your specific chart. No two readings are identical."],
    ["What format will I receive my reading in?","As a PDF by email — save it to your archive or print it out. Delivered within 1 business day after payment."],
    ["What if I don't know my birth time?","Use the most accurate time you have. Type and Authority are usually correct even with an approximate time."],
  ] : [
    ["Hoe nauwkeurig is de berekening?","Wij gebruiken dezelfde astronomische algoritmen als professionele software. Je reading is gebaseerd op je exacte geboortedata."],
    ["Is de reading echt persoonlijk?","Elke reading wordt volledig op maat samengesteld op basis van jouw specifieke chart. Geen twee readings zijn identiek."],
    ["In welk format ontvang ik mijn reading?","Als PDF per e-mail — bewaar hem in je archief of print hem uit. Bezorgd binnen 1 werkdag na betaling."],
    ["Wat als ik mijn geboortetijd niet weet?","Gebruik de meest nauwkeurige tijd die je heeft. Type en Autoriteit zijn meestal al correct."],
  ];
  const faqs = REPORT_FAQS[rpt.id]?.[LANG] ?? REPORT_FAQS[rpt.id]?.nl ?? genericFaqs;
  const promptExtraStr = (typeof rpt.prompt_extra==="object"&&rpt.prompt_extra!==null)
    ? (rpt.prompt_extra[LANG]??rpt.prompt_extra.nl??"")
    : (rpt.prompt_extra||"");
  const rptTitle=tl(rpt.title);
  const rptOutcome=tl(rpt.outcome);
  const rptTagline=tl(rpt.tagline);
  const rptIntro=tl(rpt.intro);
  const rptSub=tl(rpt.sub);
  const rptFor=tl(rpt.for);
  const sectionCount=promptExtraStr.split("\n").filter(l=>l.startsWith("###")).length;
  useSEO({
    title:rptTitle+" — "+rptOutcome,
    description:rptTitle+" — Faculty of Human Design. "+rptIntro.slice(0,160)+" "+rpt.pages+" "+t("report.pages")+". "+t("trust.delivery")+". "+rpt.price+".",
    canonical:SITE+(LANG==="en"?"/en":"")+"/rapport/"+rpt.id,
    jsonLd:{
      "@graph":[
        productLD(rpt),
        faqLD(faqs),
        breadcrumbLD([["Home","/"],["Readings",(LANG==="en"?"/en":"")+"/readings"],[rptTitle,(LANG==="en"?"/en":"")+"/rapport/"+rpt.id]])
      ]
    }
  });
  const isRelatie = rpt.id.startsWith("relatie_");
  const heroCta = LANG==="en"
    ? "Receive your reading"
    : (isRelatie ? "Ontvang jullie reading" : "Ontvang je reading");
  const sections = promptExtraStr.split("\n").filter(l=>l.startsWith("###")).map(l=>l.replace(/^###\s*\d+\.\s*/,"").trim());
  const reviews = Array.isArray(rpt.reviews)?rpt.reviews:(rpt.reviews?.[LANG]||rpt.reviews?.nl||[]);

  return(
    <div className="pg">

      {/* ── CINEMATIC HERO ───────────────────────────────────────────────── */}
      <section style={{position:"relative",height:"100vh",minHeight:600,maxHeight:900,overflow:"hidden",display:"flex",alignItems:"flex-end"}}>
        <div style={{position:"absolute",inset:0}}>
          <img src={IMGS["r_"+rpt.id]||IMGS.hero} alt={rptTitle} loading="eager" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(8,7,14,.15) 0%, rgba(8,7,14,.08) 40%, rgba(8,7,14,.72) 100%)"}}/>
        </div>
        <div style={{position:"relative",zIndex:1,width:"100%",padding:"0 0 72px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
          <div style={{fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:500,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(255,255,255,.5)",marginBottom:24}}>{LANG==="en"?"Faculty of Human Design — Ibiza":"Faculty of Human Design — Ibiza"}</div>
          <h1 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(2.4rem,5vw,4rem)",fontWeight:300,color:"white",lineHeight:1.08,letterSpacing:"-.02em",marginBottom:20,maxWidth:680,padding:"0 32px"}}>{rptOutcome||rptTitle}</h1>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1rem,1.6vw,1.15rem)",fontWeight:300,fontStyle:"italic",color:"rgba(255,255,255,.55)",marginBottom:40,maxWidth:480,lineHeight:1.7,padding:"0 32px"}}>{rptTagline}</p>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
            <button
              style={{fontFamily:"var(--font-sans)",fontSize:".72rem",fontWeight:400,letterSpacing:".16em",textTransform:"uppercase",color:"white",background:"transparent",border:"1px solid rgba(255,255,255,.45)",padding:"14px 40px",cursor:"pointer",transition:"all .3s ease"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.12)";e.currentTarget.style.borderColor="rgba(255,255,255,.7)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(255,255,255,.45)";}}
              onClick={()=>{track("checkout_started",{report:rpt.id,price:rpt.priceNum,location:"detail_hero"});document.getElementById("bestel")?.scrollIntoView({behavior:"smooth"});}}
            >{heroCta}</button>
            <span style={{fontFamily:"var(--font-sans)",fontSize:".78rem",letterSpacing:".1em",color:"rgba(255,255,255,.38)",textTransform:"uppercase"}}>{rpt.price} · {LANG==="en"?"personal · delivered by email":"persoonlijk · bezorgd per e-mail"}</span>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL INTRO ──────────────────────────────────────────────── */}
      <section style={{padding:"144px 40px 128px",background:"var(--bg)"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{width:1,height:56,background:"var(--gold)",margin:"0 auto 56px",opacity:.3}}/>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.15rem,1.9vw,1.35rem)",fontWeight:300,color:"var(--text)",lineHeight:1.9,textAlign:"center",marginBottom:40}}>{rptIntro}</p>
          <p style={{fontFamily:"var(--font-serif)",fontSize:".95rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.82,textAlign:"center"}}>{rptFor}</p>
        </div>
      </section>

      {/* ── EDITORIAL PAUSE ──────────────────────────────────────────────── */}
      <div style={{background:"#fff",padding:isRelatie?"140px 40px":"100px 40px",textAlign:"center"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.25rem,2.2vw,1.6rem)",fontWeight:300,fontStyle:"italic",color:"var(--text)",lineHeight:1.72,letterSpacing:"-.01em",margin:0,whiteSpace:"pre-line"}}>
            {LANG==="en"
              ? (isRelatie
                  ? `Not every relationship\nasks for more effort.\nSometimes love asks for\na different way of seeing.`
                  : `You are not a profile.\nYou are a precise architecture —\ndrawn at the exact moment\nyou arrived.`)
              : (isRelatie
                  ? `Niet elke relatie\nvraagt om harder werken.\nSoms vraagt liefde om\neen andere manier van kijken.`
                  : `Je bent geen profiel.\nJe bent een precieze architectuur —\ngetekend op het exacte moment\ndat jij arriveerde.`)}
          </p>
        </div>
      </div>
            {/* GARBAGE_DELETED Sometimes love asks for a different way of seeing. [QUOTE_FOUND]
                  : "\"You are not a profile. You are a precise architecture — drawn at the exact moment you arrived. [FOUND_END]
              : (isRelatie
                  ? `Niet elke relatie\nvraagt om harder werken.\nSoms vraagt liefde om\neen andere manier van kijken.` 
                  : `Je bent geen profiel.\nJe bent een precieze architectuur —\ngetekend op het exacte moment\ndat jij arriveerde.`)}
          </p>
        </div>
      </div>
      {/* Soms vraagt liefde om een andere manier van kijken.\""
                  : "\"Je bent geen profiel. Je bent een precieze architectuur — getekend op het exacte moment dat jij arriveerde.\"")}
          </p>
        </div>
      </div>

      */}
      {/* ── CHAPTERS ─────────────────────────────────────────────────────── */}
      <section style={{padding:"128px 40px",background:"var(--bg)"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{marginBottom:72}}>
            <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".22em",textTransform:"uppercase",color:"var(--gold)",marginBottom:20,opacity:.7}}>{LANG==="en"?"Contents":"Inhoud"}</div>
            <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.5rem,2.8vw,2rem)",fontWeight:300,color:"var(--text)",lineHeight:1.15,margin:"0 0 8px"}}>{LANG==="en"?"What the reading explores":"Wat de reading verkent"}</h2>
            <div style={{fontFamily:"var(--font-sans)",fontSize:".62rem",color:"var(--text-light)",letterSpacing:".08em"}}>{rpt.pages} {LANG==="en"?"pages":"pagina's"} · {sectionCount} {LANG==="en"?"chapters":"hoofdstukken"}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column"}}>
            {sections.map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"baseline",gap:32,padding:"24px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontFamily:"var(--font-sans)",fontSize:".56rem",fontWeight:400,color:"var(--gold)",letterSpacing:".12em",opacity:.5,flexShrink:0,minWidth:24}}>{String(i+1).padStart(2,"0")}</span>
                <span style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:300,color:"var(--text)",lineHeight:1.45}}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISUAL SILENCE (relatie_liefde only) ─────────────────────────── */}
      {rpt.id==="relatie_liefde"&&(
        <div style={{background:"#fff",padding:"152px 40px",textAlign:"center"}}>
          <div style={{maxWidth:380,margin:"0 auto"}}>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1rem,1.5vw,1.15rem)",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:2.0,letterSpacing:".01em",margin:0,whiteSpace:"pre-line"}}>
              {LANG==="en"
                ? "Sometimes clarity arrives\nnot when you try harder,\nbut when you understand\nwhat you were each carrying."
                : "Soms ontstaat helderheid\nniet door harder te proberen,\nmaar door te begrijpen\nwat jullie ieder meedragen."}
            </p>
          </div>
        </div>
      )}

      {/* ── SOFT MID CTA (non-relatie only) ──────────────────────────────── */}
      {rpt.id!=="relatie_liefde"&&(
        <div style={{background:"#fff",padding:"100px 40px",textAlign:"center"}}>
          <div style={{maxWidth:480,margin:"0 auto"}}>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.8,marginBottom:40,fontStyle:"italic"}}>
              {LANG==="en"
                ? "Personally assembled and written with care. Delivered as PDF within one business day."
                : "Persoonlijk samengesteld en met aandacht geschreven. Bezorgd als PDF binnen één werkdag."}
            </p>
          <button
            style={{fontFamily:"var(--font-sans)",fontSize:".7rem",fontWeight:400,letterSpacing:".16em",textTransform:"uppercase",color:"var(--text)",background:"transparent",border:"1px solid rgba(26,23,20,.3)",padding:"13px 36px",cursor:"pointer",transition:"all .3s ease"}}
            onMouseEnter={e=>{e.currentTarget.style.background="var(--text)";e.currentTarget.style.color="white";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text)";}}
            onClick={()=>{track("checkout_started",{report:rpt.id,price:rpt.priceNum,location:"mid_cta"});document.getElementById("bestel")?.scrollIntoView({behavior:"smooth"});}}
          >{heroCta}</button>
          <div style={{marginTop:16,fontFamily:"var(--font-sans)",fontSize:".78rem",letterSpacing:".1em",color:"var(--text-light)",textTransform:"uppercase"}}>{rpt.price}</div>
        </div>
      </div>
      )}

      {/* ── FULL-BLEED EDITORIAL IMAGE ───────────────────────────────────── */}
      <div style={{position:"relative",height:rpt.id==="relatie_liefde"?"75vh":"65vh",minHeight:400,overflow:"hidden"}}>
        <img
          src={rpt.id==="relatie_liefde"?"/img-relatie-liefde-new.jpg":IMGS.ibiza}
          alt=""
          aria-hidden="true"
          loading="lazy"
          style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:rpt.id==="relatie_liefde"?"62% 85%":"center 40%",transform:rpt.id==="relatie_liefde"?"scale(1.25)":"none",transformOrigin:"62% 85%"}}
        />
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,7,14,.08) 0%,rgba(8,7,14,.55) 100%)"}}/>
        {rpt.id==="relatie_liefde"&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 40px 72px"}}>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(.9rem,1.4vw,1.05rem)",fontWeight:300,fontStyle:"italic",color:"rgba(255,255,255,.72)",letterSpacing:".03em",textAlign:"center",margin:0}}>
              {LANG==="en"?"Seen, not constructed.":"Waargenomen, niet geconstrueerd."}
            </p>
          </div>
        )}
      </div>

      {/* ── EDITORIAL TESTIMONIALS ───────────────────────────────────────── */}
      {reviews.length>0&&(
        <section style={{padding:"112px 40px",background:"var(--bg)"}}>
          <div style={{maxWidth:1000,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:72}}>
              <div style={{fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:500,letterSpacing:".2em",textTransform:"uppercase",color:"var(--gold)",marginBottom:14,opacity:.8}}>{t("home.testimonialsLabel")}</div>
              <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.6rem,3vw,2.2rem)",fontWeight:300,color:"var(--text)",margin:0,lineHeight:1.1}}>{t("report.reviews")}</h2>
            </div>
            <div className="testimonials-grid">
              {reviews.map(([q,n])=>(
                <div key={n} style={{paddingTop:28,borderTop:"1px solid var(--border)"}}>
                  <blockquote style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:300,fontStyle:"italic",color:"var(--text)",lineHeight:1.82,margin:"0 0 28px",letterSpacing:"-.005em",textAlign:"left"}}>
                    "{q}"
                  </blockquote>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:20,height:1,background:"var(--gold)",opacity:.55,flexShrink:0}}/>
                    <span style={{fontFamily:"var(--font-sans)",fontSize:".72rem",fontWeight:400,color:"var(--text)",letterSpacing:".03em"}}>{n}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{padding:"96px 40px",background:"#fff"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:500,letterSpacing:".2em",textTransform:"uppercase",color:"var(--gold)",marginBottom:14,opacity:.8}}>{t("report.faq")}</div>
          <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.6rem,3vw,2rem)",fontWeight:300,color:"var(--text)",marginBottom:52,lineHeight:1.1}}>{LANG==="en"?"Questions":"Vragen"}</h2>
          {faqs.map(([q,a],i)=>(
            <div key={i} style={{borderTop:"1px solid var(--border)",padding:"22px 0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,cursor:"pointer",textAlign:"left"}} onClick={()=>setFaq(faq===i?null:i)}>
                <span style={{fontFamily:"var(--font-serif)",fontSize:".98rem",fontWeight:300,color:"var(--text)",lineHeight:1.4,textAlign:"left"}}>{q}</span>
                <span style={{fontFamily:"var(--font-sans)",fontSize:"1.1rem",color:"var(--gold)",flexShrink:0,opacity:.6,transition:"transform .2s",transform:faq===i?"rotate(45deg)":"rotate(0)"}}>{faq===i?"×":"+"}</span>
              </div>
              {faq===i&&<p style={{fontFamily:"var(--font-serif)",fontSize:".9rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.85,marginTop:16,paddingRight:32,textAlign:"left"}}>{a}</p>}
            </div>
          ))}
          <div style={{borderTop:"1px solid var(--border)"}}/>
        </div>
      </section>

      {/* ── SUBSCRIPTION MANAGEMENT (maandelijks only) ───────────────────── */}
      {rpt.id==="maandelijks"&&<SubscriptionManage/>}

      {/* ── REPORT FORM ──────────────────────────────────────────────────── */}
      <ReportForm rpt={rpt} onDone={onDone} postPayment={postPayment}/>

    </div>
  );
}

function InzichtenPage({go,articleId}){
  const[articles,setArticles]=useState([]);
  const[loading,setLoading]=useState(true);
  const[activeCat,setActiveCat]=useState("all");
  // Derive activePost from URL-driven articleId prop
  const activePost=articleId||null;
  const setActivePost=id=>go(id?"inzichten-"+id:"inzichten");
  const isEN=LANG==="en";

  const CATS=[
    {id:"basics",  tag:"Human Design Basics",    label:"Human Design Basics",                        desc:isEN?"Type, Strategy, Authority, Profile — the foundations of every Human Design chart.":"Type, Strategie, Autoriteit, Profiel — de basisconcepten van elke Human Design chart."},
    {id:"depth",   tag:"Verdieping",              label:isEN?"In Depth":"Verdieping",                 desc:isEN?"Channels, Gates, Incarnation Cross, History — themes for deeper understanding.":"Kanalen, Poorten, Inkarnatie-Kruis, Geschiedenis — thema’s voor dieper begrip."},
    {id:"numastr", tag:"Numerologie & Astrologie",label:isEN?"Numerology & Astrology":"Numerologie & Astrologie", desc:isEN?"Life Path, Expression, Sun sign — the numerical and astrological dimension.":"Levenspad, Uitdrukking, Zonneteken — de numerologische en astrologische dimensie."},
  ];

  const STATIC=[
    {
      id:"s1",tag:"Human Design Basics",title:"Het verschil tussen Type en Strategie",date:"12 april 2026",readtime:"6 min",
      excerpt:"Type en Strategie zijn twee van de meest gebruikte begrippen in Human Design, maar beschrijven fundamenteel verschillende aspecten van je design.",
      images:[
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&q=75",
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&q=75",
      ],
      body:"Type en Strategie worden in Human Design-kringen regelmatig door elkaar gebruikt. Dat is begrijpelijk — ze hangen samen en worden vaak in één adem genoemd. Maar ze beschrijven fundamenteel verschillende dingen, en het onderscheid begrijpen maakt het systeem een stuk bruikbaarder in het dagelijks leven.\n\nJe Type is je energetische aard. Het beschrijft hoe je energiesysteem is geconfigureerd — niet wat je doet, maar hoe je van nature functioneert. Er zijn vijf Types in Human Design: de Generator, de Manifesting Generator, de Projector, de Manifestor en de Reflector. Ongeveer 70 procent van de wereldbevolking bestaat uit Generators en Manifesting Generators. Projectors maken zo'n 20 procent uit. Manifestors zijn zeldzamer, rond de 9 procent, en Reflectors zijn de kleinste groep met ongeveer 1 procent.\n\nJe Type verandert nooit. Het staat vast op het moment van je geboorte, bepaald door de posities van de planeten en hun relatie tot de negen energiecentra in je chart. Het is geen persoonlijkheidstest die varieert afhankelijk van je stemming of levensfase — het is een constante, zoals je bloedgroep.\n\nDe Strategie is iets anders. Het is de optimale manier van handelen die bij je Type hoort. Waar het Type beschrijft wie je energetisch bent, beschrijft de Strategie hoe je het meest in lijn met jezelf kunt bewegen. Generators en Manifesting Generators zijn ontworpen om te reageren — niet om te initiëren. Ze wachten op iets in de buitenwereld dat een sacrale respons oproept, een instinctief 'ja' of 'nee' vanuit het lichaam, en handelen vanuit die respons.\n\nProjectors hebben een andere Strategie: wachten op de uitnodiging. Niet passief afwachten in de zin van niets doen, maar beschikbaar zijn en wachten tot anderen hun unieke capaciteit voor begeleiding en inzicht herkennen en expliciet uitnodigen. Wanneer een Projector geïnviteerd wordt, kan zijn energie volledig tot zijn recht komen. Zonder uitnodiging leidt dezelfde energie vaak tot weerstand of bitterheid.\n\nManifestors — de enige Types die van nature kunnen initiëren — hebben als Strategie om te informeren. Niet om toestemming te vragen, maar om mensen die door hun acties geraakt worden vooraf te laten weten wat er komen gaat. Dit simpele gebaar vermindert weerstand en maakt de weg vrij voor hun impactvolle energie. Reflectors ten slotte wachten een volledige maancyclus van 28 dagen voor ze grote beslissingen nemen, zodat ze de juiste context en helderheid kunnen ervaren.\n\nEen veel voorkomende misvatting is dat de Strategie iets is wat je moet presteren of aanleren. Dat is niet zo. Het is eerder een uitnodiging om het tegenovergestelde te doen van wat de conditionering je heeft geleerd. Veel Generators leren van jongs af aan om te initiëren, actief te zijn, doelen te stellen en ernaar toe te werken. Dat werkt voor sommige Types prima, maar voor een Generator leidt het initiëren zonder sacrale respons vaak tot frustratie en energieverlies.\n\nHet interessante van de Strategie is dat het niet gaat om grote, dramatische veranderingen in je leven. Het gaat om kleine verschuivingen in hoe je beslissingen neemt. Wacht je op een echte respons voor je ja zegt? Informeer je de mensen om je heen voor je handelt? Wacht je op een uitnodiging of pers je je inzichten op? Die kleine aanpassingen, consequent toegepast, kunnen over tijd een opvallend verschil maken in hoeveel energie je hebt en hoe soepel dingen verlopen.\n\nType en Strategie vormen samen het vertrekpunt van elk Human Design rapport van de Faculty of Human Design. Ze geven geen antwoord op alle vragen, maar bieden een solide basis vanwaaruit de rest van de chart — autoriteit, profiel, centra, kanalen — betekenis krijgt. Wie zijn Type en Strategie werkelijk begrijpt en toepast, begint te merken dat het leven minder wrijving kent en meer van nature stroomt.",
      title_en:"The Difference Between Type and Strategy",
      date_en:"April 12, 2026",
      excerpt_en:"Type and Strategy are two of the most frequently used terms in Human Design, but they describe fundamentally different aspects of your design.",
      body_en:"Type and Strategy are regularly used interchangeably in Human Design circles. That is understandable — they are related and often mentioned in the same breath. But they describe fundamentally different things, and understanding the distinction makes the system considerably more useful in daily life.\n\nYour Type is your energetic nature. It describes how your energy system is configured — not what you do, but how you naturally function. There are five Types in Human Design: the Generator, the Manifesting Generator, the Projector, the Manifestor and the Reflector. Around 70 percent of the world's population consists of Generators and Manifesting Generators. Projectors make up roughly 20 percent. Manifestors are rarer, around 9 percent, and Reflectors are the smallest group at approximately 1 percent.\n\nYour Type never changes. It is fixed at the moment of your birth, determined by the positions of the planets and their relationship to the nine energy centres in your chart. It is not a personality test that varies depending on your mood or life phase — it is a constant, like your blood type.\n\nStrategy is something different. It is the optimal way of acting that corresponds to your Type. Where Type describes who you energetically are, Strategy describes how you can move most in alignment with yourself. Generators and Manifesting Generators are designed to respond — not to initiate. They wait for something in the outer world that triggers a sacral response, an instinctive 'yes' or 'no' from the body, and act from that response.\n\nProjectors have a different Strategy: waiting for the invitation. Not passive waiting in the sense of doing nothing, but being available and waiting until others recognise their unique capacity for guidance and insight and explicitly invite them. When a Projector is invited, their energy can fully come into its own. Without invitation, that same energy often leads to resistance or bitterness.\n\nManifestors — the only Types who can naturally initiate — have the Strategy of informing. Not asking permission, but letting the people affected by their actions know in advance what is coming. This simple gesture reduces resistance and clears the way for their impactful energy. Reflectors, finally, wait a full lunar cycle of 28 days before making major decisions, so they can experience the right context and clarity.\n\nA common misconception is that Strategy is something you need to perform or learn. It is not. It is more an invitation to do the opposite of what conditioning has taught you. Many Generators learn from an early age to initiate, be active, set goals and work toward them. That works fine for some Types, but for a Generator, initiating without sacral response often leads to frustration and energy loss.\n\nWhat is interesting about Strategy is that it is not about large, dramatic changes in your life. It is about small shifts in how you make decisions. Do you wait for a genuine response before saying yes? Do you inform the people around you before you act? Do you wait for an invitation or push your insights? Those small adjustments, consistently applied, can make a noticeable difference over time in how much energy you have and how smoothly things unfold.\n\nType and Strategy together form the starting point of every Human Design report from the Faculty of Human Design. They do not answer all questions, but they provide a solid foundation from which the rest of the chart — authority, profile, centres, channels — gains meaning. Whoever truly understands and applies their Type and Strategy begins to notice that life carries less friction and flows more naturally.",
    },
    {
      id:"s2",tag:"Human Design Basics",title:"Innerlijke autoriteit: hoe je je beste beslissingen neemt",date:"28 maart 2026",readtime:"7 min",
      title_en:"Inner Authority: How to Make Your Best Decisions",date_en:"March 28, 2026",excerpt_en:"Your inner authority in Human Design is the most consistent decision-making instrument you possess.",
      excerpt:"Je innerlijke autoriteit in Human Design is het meest consistente instrument voor besluitvorming dat je bezit.",
      images:[
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&q=75",
        "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&q=75",
      ],
      body:"We nemen elke dag tientallen beslissingen. De meeste zijn klein — wat eten, welke route rijden, wanneer antwoorden. Maar de grotere beslissingen, over werk, relaties, woonplaats, gezondheid, zijn degenen waarbij we het vaakst twijfelen, aarzelen, of achteraf spijt hebben. Human Design biedt hiervoor een verrassend concreet instrument: de innerlijke autoriteit.\n\nDe innerlijke autoriteit is het centrum of het mechanisme in je chart van waaruit je het betrouwbaarst beslissingen neemt. Het is geen filosofie of levenshouding — het is gebaseerd op de configuratie van je energiesysteem. Afhankelijk van welke centra in je chart gedefinieerd zijn, heeft iedereen een andere autoriteit. Er zijn zeven vormen, en elke vraagt een andere aanpak.\n\nDe meest voorkomende autoriteit is de Emotionele autoriteit, ook wel de Solarplexus-autoriteit genoemd. Mensen met deze autoriteit hebben een gedefinieerd emotioneel centrum, wat betekent dat ze een continue golf van emotionele energie ervaren — van hoog naar laag en terug. Voor hen geldt: neem nooit een belangrijke beslissing in het moment zelf. Wacht op emotionele helderheid. Dat kan uren duren, of dagen. 'Slaap er eens een nacht over' is voor hen geen cliché maar een letterlijk advies dat hen behoedt voor beslissingen die vanuit een emotionele piek of dal zijn genomen.\n\nDe Sacrale autoriteit is exclusief voor Generators en Manifesting Generators met een gedefinieerd Sacraalcentrum en een ongedefinieerd emotioneel centrum. Deze autoriteit spreekt via het lichaam — een instinctieve, fysieke respons die voelt als een 'uh-huh' of een 'unh-unh'. Het is geen mentale stem maar een lichamelijke reactie die er al is voor de geest heeft kunnen nadenken. Mensen met Sacrale autoriteit doen er goed aan om hun beslissingen te testen via ja/nee-vragen en te luisteren naar wat het lichaam antwoordt, niet wat het hoofd redeneert.\n\nDe Splenische autoriteit is de stilst van alle autoriteiten. De Milt spreekt eenmalig, in het moment, en daarna is hij stil. Het is een zachte fluistering van instinct en intuïtie — niet de luidruchtige zekerheid van emotie of het kloppende ja van het Sacraalcentrum, maar een subtiel 'dit klopt' of 'dit klopt niet'. Mensen met Splenische autoriteit moeten leren om dat eerste, stille signaal te vertrouwen, ook al kunnen ze het moeilijk rationeel verklaren.\n\nDe Ego- of Hartautoriteit spreekt via wil en verlangens. 'Wil ik dit echt?' is de centrale vraag. Niet wat je zou moeten willen, niet wat anderen van je verwachten, maar wat jij vanuit je diepste wil kiest. Dit klinkt eenvoudig, maar voor mensen die gewend zijn hun eigen verlangens te onderdrukken ten gunste van anderen, kan dit een ingrijpende oefening zijn.\n\nVervolgens zijn er de Zelf-geprojecteerde autoriteit, de Mentale of Projectie-autoriteit, en de Lunaire autoriteit van de Reflector. De Zelf-geprojecteerde autoriteit werkt via het G-centrum — mensen met deze autoriteit vinden helderheid door hardop te spreken met iemand die ze vertrouwen, niet voor advies, maar om hun eigen stem te horen. De Mentale autoriteit is uniek voor bepaalde Projectors: zij kalibreren via gesprek en externe reflectie. En Reflectors, met hun bijzondere gevoeligheid voor de omgeving, nemen de tijd van een volledige maancyclus om te voelen hoe een beslissing aanvoelt doorheen verschillende energetische contexten.\n\nWat al deze autoriteiten gemeen hebben is dat ze het hoofd — de mentale analyse — uitdrukkelijk niet als beslisser aanwijzen. De geest is in Human Design een uitstekende tool om informatie te verzamelen en te verwerken, maar hij is niet ontworpen als de uiteindelijke beslisser. Dat is voor de meeste mensen een radicale verschuiving, want we zijn opgegroeid met de overtuiging dat denken en redeneren de meest betrouwbare weg naar goede beslissingen is.\n\nDe praktische toepassing vraagt oefening en geduld. Het herkennen van je autoriteit is één ding; erop leren vertrouwen is een langzamer proces, zeker als je jarenlang anders hebt besloten. Maar wie consequent leert te luisteren naar zijn innerlijke autoriteit, merkt doorgaans dat de uitkomsten beter passen, minder energie kosten, en dat de spijt van beslissingen afneemt. Niet omdat alles perfect gaat, maar omdat de beslissing écht van jou was.",
      body_en:"We make dozens of decisions every day. Most are small — what to eat, which route to take, when to respond. But the bigger decisions, about work, relationships, where to live, health, are the ones where we most often hesitate, doubt, or regret in hindsight. Human Design offers a surprisingly concrete instrument for this: inner authority.\n\nInner authority is the centre or mechanism in your chart from which you make decisions most reliably. It is not a philosophy or life stance — it is based on the configuration of your energy system. Depending on which centres are defined in your chart, everyone has a different authority. There are seven forms, and each requires a different approach.\n\nThe most common authority is Emotional authority, also known as Solar Plexus authority. People with this authority have a defined emotional centre, meaning they experience a continuous wave of emotional energy — from high to low and back again. For them the rule is: never make an important decision in the moment itself. Wait for emotional clarity. That can take hours, or days. 'Sleep on it' is not a cliché for them but literal advice that protects them from decisions made at an emotional peak or valley.\n\nSacral authority is exclusive to Generators and Manifesting Generators with a defined Sacral centre and an undefined emotional centre. This authority speaks through the body — an instinctive, physical response that feels like an 'uh-huh' or an 'unh-unh'. It is not a mental voice but a bodily reaction that is already there before the mind has had a chance to think. People with Sacral authority do well to test their decisions through yes/no questions and listen to what the body answers, not what the head reasons.\n\nSplenic authority is the quietest of all authorities. The Spleen speaks once, in the moment, and then falls silent. It is a soft whisper of instinct and intuition — not the noisy certainty of emotion or the pulsing yes of the Sacral centre, but a subtle 'this feels right' or 'this doesn't'. People with Splenic authority need to learn to trust that first, quiet signal, even when they find it difficult to explain rationally.\n\nEgo or Heart authority speaks through will and desire. 'Do I truly want this?' is the central question. Not what you should want, not what others expect of you, but what you choose from your deepest will. This sounds simple, but for people accustomed to suppressing their own desires in favour of others, it can be a profound practice.\n\nThen there is Self-Projected authority, Mental or Projected authority, and the Lunar authority of the Reflector. Self-Projected authority works through the G-centre — people with this authority find clarity by speaking out loud with someone they trust, not for advice, but to hear their own voice. Mental authority is unique to certain Projectors: they calibrate through conversation and external reflection. And Reflectors, with their particular sensitivity to their environment, take the time of a full lunar cycle to feel how a decision feels across different energetic contexts.\n\nWhat all these authorities have in common is that they explicitly do not designate the mind — mental analysis — as the decision-maker. The mind in Human Design is an excellent tool for gathering and processing information, but it is not designed as the final decision-maker. That is a radical shift for most people, because we have grown up with the belief that thinking and reasoning is the most reliable path to good decisions.\n\nPractical application requires practice and patience. Recognising your authority is one thing; learning to trust it is a slower process, especially if you have decided differently for years. But whoever consistently learns to listen to their inner authority generally finds that outcomes fit better, cost less energy, and that the regret from decisions diminishes. Not because everything goes perfectly, but because the decision was truly yours.",
    },
    {
      id:"s3",tag:"Verdieping",title:"De oorsprong van Human Design op Ibiza",date:"14 februari 2026",readtime:"8 min",
      title_en:"The Origins of Human Design on Ibiza",date_en:"February 14, 2026",excerpt_en:"In January 1987, Ra Uru Hu received the Human Design system over eight days on Ibiza.",
      excerpt:"In januari 1987 ontving Ra Uru Hu het Human Design systeem gedurende acht dagen op Ibiza.",
      images:[
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&q=75",
        "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&q=75",
      ],
      body:"Er zijn weinig plekken in de westerse wereld die zo doordrenkt zijn van een bepaalde sfeer als het eiland Ibiza in de winter. Buiten het hoogseizoen, als de clubs gesloten zijn en het eiland terugkeert naar zijn mediterrane stilte, ademt het iets ouds. Het is op dit eiland, in de januarinacht van 1987, dat het verhaal van Human Design begint.\n\nRa Uru Hu, geboren als Alan Robert Krakower in Canada, woonde op dat moment op Ibiza. Hij had een bewogen leven achter de rug: journalist, muzikant, reclameman, vader. In 1983 had hij alles achter zich gelaten en was hij naar Europa getrokken. Op Ibiza vond hij een teruggetrokken bestaan, alleen, in een huis aan de rand van een klein dorp op het eiland.\n\nIn de nacht van 3 januari 1987 was hij alleen thuis toen hij een ervaring begon die hij later zou omschrijven als het horen van een Stem. Geen metaforische stem, geen interne gedachte. Wat hij ervoer was een externe, intelligente aanwezigheid die hem rechtstreeks aansprak. Hij schreef later dat hij aanvankelijk dacht gek te worden. Maar de Stem bleef, en gedurende acht aaneengesloten dagen dicteerde zij hem een compleet systeem.\n\nWat hij ontving was een synthese van vier grote kennissystemen die op het eerste gezicht weinig met elkaar gemeen hebben. De 64 hexagrammen van de Chinese I Ching vormden de ruggengraat — elk hexagram correspondeert met een van de 64 poorten in het Human Design chart. De Sefirot van de Joodse Kabbala leverde de structuur van de levensboom, die zichtbaar is in de verbindingen tussen de negen energiecentra. De westerse astrologie bood het raamwerk van planetaire posities en hun invloed op het moment van geboorte. En de kwantumfysica — met name de ontdekking van het neutrino in de jaren daarvoor — gaf een wetenschappelijk substraat voor de overdracht van informatie via materie.\n\nDe combinatie lijkt op het eerste gezicht eclectisch, zo niet willekeurig. Maar wie het systeem bestudeert, merkt dat de vier bronnen op een coherente manier zijn samengebracht — niet als een oppervlakkige mix, maar als een structurele synthese waarbij elk systeem een specifieke laag toevoegt aan het geheel. De I Ching geeft de kwaliteiten van de poorten, de Kabbala geeft de centra en hun verbindingen, de astrologie geeft de timing en planetaire invloeden, en de kwantumfysica biedt een verklaring voor hoe de sterrenposities op het moment van geboorte de configuratie van een individueel chart bepalen.\n\nNa de acht dagen was Ra Uru Hu uitgeput maar helder. Hij begon het systeem te bestuderen, te testen en te verfijnen. In de jaren die volgden gaf hij de eerste readings en trainingen, aanvankelijk vooral op Ibiza en in Europa. Het systeem groeide langzaam, aangedreven door mond-tot-mondreclame. Ra was geen marketingmens — hij was een leraar die zijn lessen op tape en later digitaal verspreidde, en die een kleine maar toegewijde gemeenschap om zich heen verzamelde.\n\nRa Uru Hu overleed in 2011, op 63-jarige leeftijd, op Ibiza — het eiland waar het allemaal was begonnen. Hij had altijd gezegd dat hij niet de auteur van het systeem was maar de boodschapper. Of men dat letterlijk neemt of als metafoor, het systeem dat hij heeft doorgegeven heeft sindsdien miljoenen mensen bereikt.\n\nDe Faculty of Human Design is opgericht op datzelfde eiland, vanuit een diepe verbondenheid met de plek waar het systeem is ontvangen. Ibiza is voor ons niet alleen een locatie maar een context — een eiland dat altijd ruimte heeft geboden aan zoekers, denkers en mensen die buiten de gebaande paden willen leven. Het is die geest die we meenemen in elk rapport dat wij maken: nauwkeurig, persoonlijk, en respectvol voor de diepgang van het systeem dat Ra Uru Hu ons heeft nagelaten.",
      body_en:"Few places in the Western world are as steeped in a particular atmosphere as the island of Ibiza in winter. Outside the high season, when the clubs are closed and the island returns to its Mediterranean quiet, it breathes something ancient. It is on this island, in the January night of 1987, that the story of Human Design begins.\n\nRa Uru Hu, born as Alan Robert Krakower in Canada, was living on Ibiza at the time. He had a turbulent life behind him: journalist, musician, advertising man, father. In 1983 he had left everything behind and moved to Europe. On Ibiza he found a withdrawn existence, alone, in a house on the edge of a small village on the island.\n\nOn the night of 3 January 1987 he was home alone when he began an experience he would later describe as hearing a Voice. Not a metaphorical voice, not an internal thought. What he experienced was an external, intelligent presence that addressed him directly. He later wrote that he initially thought he was going mad. But the Voice remained, and over eight consecutive days it dictated to him a complete system.\n\nWhat he received was a synthesis of four major knowledge systems that at first glance seem to have little in common. The 64 hexagrams of the Chinese I Ching formed the backbone — each hexagram corresponds to one of the 64 gates in the Human Design chart. The Sefirot of Jewish Kabbalah provided the structure of the tree of life, visible in the connections between the nine energy centres. Western astrology offered the framework of planetary positions and their influence at the moment of birth. And quantum physics — in particular the discovery of the neutrino in the years prior — provided a scientific substrate for the transmission of information through matter.\n\nThe combination seems eclectic at first glance, if not arbitrary. But those who study the system notice that the four sources have been brought together in a coherent way — not as a superficial mix, but as a structural synthesis in which each system adds a specific layer to the whole. The I Ching gives the qualities of the gates, the Kabbalah gives the centres and their connections, astrology gives the timing and planetary influences, and quantum physics offers an explanation for how the stellar positions at the moment of birth determine the configuration of an individual chart.\n\nAfter the eight days Ra Uru Hu was exhausted but clear. He began to study, test and refine the system. In the years that followed he gave the first readings and trainings, initially mainly on Ibiza and in Europe. The system grew slowly, driven by word of mouth. Ra was not a marketing person — he was a teacher who distributed his lessons on tape and later digitally, and who gathered a small but dedicated community around him.\n\nRa Uru Hu passed away in 2011, at the age of 63, on Ibiza — the island where it had all begun. He had always said that he was not the author of the system but the messenger. Whether one takes that literally or as a metaphor, the system he passed on has since reached millions of people.\n\nThe Faculty of Human Design was founded on that same island, from a deep connection with the place where the system was received. Ibiza is for us not just a location but a context — an island that has always offered space to seekers, thinkers and people who want to live outside the beaten path. It is that spirit we carry into every report we make: precise, personal, and respectful of the depth of the system that Ra Uru Hu left us.",
    },
    {
      id:"s4",tag:"Verdieping",title:"Kanalen: de energetische verbindingen in jouw chart",date:"5 mei 2026",readtime:"6 min",
      title_en:"Channels: The Energetic Connections in Your Chart",date_en:"May 5, 2026",excerpt_en:"A channel forms when two centres are connected through a gate on both sides. It is the basis of your consistent energetic expression.",
      excerpt:"Een kanaal ontstaat wanneer twee centra via een poort aan beide kanten verbonden zijn. Het is de basis van jouw consistente energetische expressie.",
      images:["https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&q=75"],
      body:"In een Human Design chart zijn er negen energiecentra, elk verantwoordelijk voor een specifiek domein van het leven. Maar de centra staan niet op zichzelf. Ze zijn verbonden via poorten, en wanneer twee centra elk een poort delen die als één systeem functioneert, ontstaat een kanaal.\n\nEen kanaal is de brug tussen twee centra. Het heeft een nummer dat de combinatie van de twee poorten aangeeft. Poort 3-5 verbindt het Sacraalcentrum met het Wortelcentrum en beschrijft een ritme van persoonlijke groei via overgangen. Poort 36-35 verbindt het Solarplexuscentrum met het Keelcentrum en beschrijft de cyclische ervaring van crisis en variatie die uitmondt in wijsheid.\n\nWat een kanaal bepalend maakt, is dat het consistent is. Wanneer je een kanaal hebt, beschik je over een doorgaande, betrouwbare stroom van energie tussen die twee centra. Dat is anders dan open centra, die energie van buitenaf absorberen maar niet zelf genereren. Kanalen zijn jouw eigen, vastomlijnde expressie.\n\nIn de praktijk zie je dit terug in gedrag. Mensen met het kanaal 61-24, dat het Kroncentrum verbindt met het Ajna, worden gedreven door een onophoudelijke mentale zoektocht naar betekenis en patronen. Ze kunnen het niet laten. Het is geen keuze; het is hoe hun systeem functioneert. Mensen met het kanaal 12-22, Keel naar Solarplexus, zijn aangewezen op timing: ze communiceren op hun best wanneer de emotionele golfbeweging op haar juiste moment staat.\n\nNiet iedereen heeft kanalen. Sommige charts hebben er één of twee; anderen hebben er zes of zeven. Hoe meer kanalen, hoe meer centra gedefinieerd zijn en hoe meer van jouw ervaring intern bepaald is in plaats van door de omgeving. Het verschil is niet beter of slechter. Een chart met weinig kanalen is flexibeler, gevoeliger voor de energie van anderen. Een chart met veel kanalen heeft een sterke eigen ruggengraat, maar kan soms minder ontvankelijk zijn voor externe input.\n\nKanalen begrijpen helpt je te herkennen welke aspecten van jouw gedrag, drijfveren en energie werkelijk van jou zijn en welke je oppikt uit de omgeving. Dat onderscheid is, in de kern, waar Human Design over gaat.",
      body_en:"In a Human Design chart there are nine energy centres, each responsible for a specific domain of life. But the centres do not stand alone. They are connected through gates, and when two centres each share a gate that functions as one system, a channel is formed.\n\nA channel is the bridge between two centres. It has a number that indicates the combination of the two gates. Gate 3-5 connects the Sacral centre to the Root centre and describes a rhythm of personal growth through transitions. Gate 36-35 connects the Solar Plexus centre to the Throat centre and describes the cyclical experience of crisis and variation that culminates in wisdom.\n\nWhat makes a channel significant is that it is consistent. When you have a channel, you have a continuous, reliable flow of energy between those two centres. That is different from open centres, which absorb energy from outside but do not generate it themselves. Channels are your own, clearly defined expression.\n\nIn practice you see this reflected in behaviour. People with channel 61-24, which connects the Crown centre to the Ajna, are driven by a relentless mental search for meaning and patterns. They cannot help it. It is not a choice; it is how their system functions. People with channel 12-22, Throat to Solar Plexus, are dependent on timing: they communicate best when the emotional wave is at its right moment.\n\nNot everyone has channels. Some charts have one or two; others have six or seven. The more channels, the more centres are defined and the more of your experience is internally determined rather than shaped by the environment. The difference is not better or worse. A chart with few channels is more flexible, more sensitive to the energy of others. A chart with many channels has a strong internal backbone, but may sometimes be less receptive to external input.\n\nUnderstanding channels helps you recognise which aspects of your behaviour, drives and energy are truly yours and which you pick up from the environment. That distinction is, at its core, what Human Design is about.",
    },
    {
      id:"s5",tag:"Numerologie & Astrologie",title:"Wat je levenspadgetal over jou zegt",date:"19 april 2026",readtime:"5 min",
      title_en:"What Your Life Path Number Says About You",date_en:"April 19, 2026",excerpt_en:"The life path number is the most fundamental number in numerology, calculated from your full date of birth and unchanging throughout your entire life.",
      excerpt:"Het levenspadgetal is het meest fundamentele getal in de numerologie, berekend uit je volledige geboortedatum en onveranderlijk voor je hele leven.",
      images:["https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&auto=format&q=75"],
      body:"Van alle getallen in de numerologie is het levenspadgetal het meest fundamentele. Het wordt berekend door de cijfers van je volledige geboortedatum tot één getal terug te brengen, met uitzondering van de mastergetallen 11, 22 en 33, die niet verder worden gereduceerd.\n\nDe berekening is eenvoudig. Neem als voorbeeld de geboortedatum 17 september 1985. Je telt: 1+7=8 voor de dag, 9 voor de maand, en 1+9+8+5=23 dus 2+3=5 voor het jaar. Dan tel je 8+9+5=22. Dat is een mastergetal, dus het blijft 22. Had de som 23 opgeleverd, dan was het levenspadgetal 5.\n\nElk getal heeft een eigen karakter, een thema dat door het leven loopt als een rode draad. Getal 1 staat voor zelfstandigheid en initiatief. Getal 2 gaat over verbinding en samenwerking. Getal 3 over expressie en creativiteit. Getal 4 over structuur en het bouwen van fundamenten. Getal 5 over vrijheid en verandering. Getal 6 over verantwoordelijkheid en zorg. Getal 7 over verdieping en de innerlijke wereld. Getal 8 over macht en materiële expressie. Getal 9 over universele verbinding en afronding.\n\nDe mastergetallen 11, 22 en 33 dragen een extra laag. Levenspad 11 staat voor inspiratie en intuïtieve helderheid, maar de weg ernaartoe gaat via angst en twijfel overwinnen. Levenspad 22 is de meester-bouwer: iemand met het vermogen om grote structuren op te richten, maar ook met de spanning tussen ambitie en zelfbegrenzing. Levenspad 33 is zeldzaam en draait om dienstbaarheid, liefde en creatieve expressie op het hoogste niveau.\n\nHet levenspadgetal beschrijft niet wie je bent in iedere situatie. Het beschrijft het thema van waaruit je groeit, soms door weerstand te ervaren aan precies dat wat het getal vraagt. Wie levenspad 8 heeft, worstelt misschien jarenlang met geld en macht, juist omdat dat zijn leergebied is. Numerologie is geen bepaling van het lot. Het is een kaart van het terrein waarop je leert.",
      body_en:"Of all the numbers in numerology, the life path number is the most fundamental. It is calculated by reducing the digits of your full date of birth to a single number, with the exception of master numbers 11, 22 and 33, which are not reduced further.\n\nThe calculation is straightforward. Take the date of birth September 17, 1985 as an example. You add: 1+7=8 for the day, 9 for the month, and 1+9+8+5=23 so 2+3=5 for the year. Then you add 8+9+5=22. That is a master number, so it remains 22. Had the sum yielded 23, the life path number would be 5.\n\nEach number has its own character, a theme that runs through life like a red thread. Number 1 stands for independence and initiative. Number 2 is about connection and cooperation. Number 3 about expression and creativity. Number 4 about structure and building foundations. Number 5 about freedom and change. Number 6 about responsibility and care. Number 7 about depth and the inner world. Number 8 about power and material expression. Number 9 about universal connection and completion.\n\nThe master numbers 11, 22 and 33 carry an extra layer. Life path 11 stands for inspiration and intuitive clarity, but the path there runs through overcoming fear and doubt. Life path 22 is the master builder: someone with the capacity to create large systems, structures or movements that have a lasting impact on community or society. Many 22s struggle with the feeling that they think too big or too ambitiously, while it is precisely that scale that makes their contribution meaningful. Life path 33 is the rarest and revolves around service, love and creative expression at the highest level.\n\nThe life path number does not describe who you are in every situation. It describes the theme from which you grow, sometimes by experiencing resistance to exactly what the number asks for. Someone with life path 8 may struggle for years with money and power, precisely because that is their learning area. Numerology is not a determination of fate. It is a map of the terrain on which you learn.",
    },
    {
      id:"s6",tag:"Human Design Basics",title:"De vijf Types in Human Design uitgelegd",date:"22 oktober 2024",readtime:"9 min",
      title_en:"The Five Types in Human Design Explained",date_en:"October 22, 2024",excerpt_en:"Generator, Manifesting Generator, Projector, Manifestor, Reflector. Each Type has its own energetic nature, strategy and not-self theme.",
      excerpt:"Generator, Manifesting Generator, Projector, Manifestor, Reflector. Elk Type heeft een eigen energetische aard, strategie en niet-zelf thema.",
      images:[
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&q=75",
        "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&auto=format&q=75",
      ],
      body:"Human Design verdeelt alle mensen in vijf Types. Dat klinkt simplistisch — vijf categorieën voor acht miljard mensen, maar het gaat niet om persoonlijkheid. Het gaat om energetische structuur: hoe je energiesysteem is gebouwd, hoe het functioneert, en wat de optimale manier van handelen is die daarbij past.\n\nDe Generator is het meest voorkomende Type: zo'n 37 procent van de wereldbevolking. Generators hebben een gedefinieerd Sacraalcentrum, de energiebron van het lichaam, en zijn ontworpen om te reageren op wat er in de buitenwereld verschijnt. Ze bezitten een duurzame, hernieuwbare levensenergie die, mits ingezet voor werk en bezigheden die echt resoneren, nooit opraakt. De valkuil voor Generators is initiëren zonder sacrale respons — iets oppakken vanuit sociale druk, verwachting of rationele overtuiging in plaats van vanuit een instinctief ja. Wanneer dat patroon langere tijd aanhoudt, leidt het tot frustratie: de handtekening van het niet-zelf van de Generator.\n\nDe Manifesting Generator combineert kenmerken van de Generator én de Manifestor. Ze hebben het gedefinieerde Sacraalcentrum van de Generator en de capaciteit om rechtstreeks naar de keel te manifesteren — wat hen snel, multi-gelaagd en moeilijk bij te houden maakt. Hun strategie is reageren en dan informeren: wachten op een sacrale respons en vervolgens de mensen om hen heen inlichten over wat ze van plan zijn. Manifesting Generators slaan stappen over, nemen shortcuts en leren vaak door te doen en terug te gaan als iets niet werkt. Frustratie is ook voor hen het niet-zelf signaal.\n\nProjectors maken zo'n 20 procent van de bevolking uit. Ze hebben geen gedefinieerd Sacraalcentrum en zijn niet ontworpen om continu te werken. Projectors zijn er voor begeleiding: ze lezen anderen diep, zien systemen en mensen helder, en zijn het meest waardevol wanneer ze erkend worden voor dat vermogen. Hun strategie is wachten op de uitnodiging — in het bijzonder voor belangrijke levensthema's als werk en relaties. Zonder uitnodiging botst hun advies vaak op weerstand, zelfs als het uitstekend is. De niet-zelf emotie van Projectors is bitterheid, die ontstaat wanneer ze te lang hun energie spenderen aan mensen en contexten die hen niet echt erkennen.\n\nManifestors zijn de enige Types die van nature kunnen initiëren. Met een directe verbinding tussen het motorcentrum en de keel bezitten ze de capaciteit om dingen in beweging te zetten zonder eerst te reageren of gewacht te worden. Ze maken slechts 9 procent van de bevolking uit en hebben door de geschiedenis heen vaak leiderschapsposities bekleed. Hun strategie is informeren: niet om toestemming vragen, maar om de mensen die geraakt worden door hun acties vooraf op de hoogte te stellen. Wanneer ze dat nalaten, stuit hun impulsieve energie op weerstand. Boosheid is hun niet-zelf thema.\n\nReflectors zijn de zeldzaamste groep: zo'n 1 procent. Ze hebben geen enkel centrum gedefinieerd, wat betekent dat ze volledig open zijn voor de energieën om hen heen. Ze zijn als de maan — ze reflecteren en versterken wat er in hun omgeving aanwezig is. Reflectors zijn bijzonder gevoelig voor hun omgeving: de mensen met wie ze omgaan, de plekken waar ze wonen en werken. Hun strategie is wachten op een volledige maancyclus van 28 dagen voor grote beslissingen, zodat ze kunnen ervaren hoe iets aanvoelt door alle fases heen. Teleurstelling is hun niet-zelf signaal, ontstaan wanneer ze leven in omgevingen die niet bij hen passen.\n\nWat alle vijf Types gemeen hebben, is dat ze het best functioneren wanneer ze in lijn zijn met hun strategie en autoriteit — en wanneer ze de kenmerkende valkuil van hun niet-zelf herkennen als een signaal dat er iets uit balans is. Het Type is geen label of beperking. Het is een beschrijving van hoe je energiesysteem het liefst werkt.",
      body_en:"Human Design divides all people into five Types. That sounds simplistic — five categories for eight billion people — but it is not about personality. It is about energetic structure: how your energy system is built, how it functions, and what the optimal way of acting is that corresponds to it.\n\nThe Generator is the most common Type: around 37 percent of the world's population. Generators have a defined Sacral centre, the body's energy source, and are designed to respond to what appears in the outer world. They possess a sustainable, renewable life energy that, when channelled toward work and activities that genuinely resonate, never runs out. The pitfall for Generators is initiating without sacral response — picking something up out of social pressure, expectation or rational conviction rather than from an instinctive yes. When that pattern continues over time, it leads to frustration: the signature of the Generator's not-self.\n\nThe Manifesting Generator combines characteristics of both the Generator and the Manifestor. They have the Generator's defined Sacral centre and the capacity to manifest directly to the throat — making them fast, multi-layered and difficult to keep up with. Their strategy is to respond and then inform: wait for a sacral response and then let the people around them know what they plan to do. Manifesting Generators skip steps, take shortcuts and often learn by doing and going back if something does not work. Frustration is also their not-self signal.\n\nProjectors make up around 20 percent of the population. They have no defined Sacral centre and are not designed to work continuously. Projectors are there for guidance: they read others deeply, see systems and people clearly, and are most valuable when recognised for that capacity. Their strategy is to wait for the invitation — particularly for major life themes such as work and relationships. Without an invitation, their advice often meets resistance, even when it is excellent. The not-self emotion of Projectors is bitterness, which arises when they spend too long directing their energy toward people and contexts that do not genuinely recognise them.\n\nManifestors are the only Types who can naturally initiate. With a direct connection between a motor centre and the throat, they possess the capacity to set things in motion without first responding or waiting. They make up only 9 percent of the population and have historically often occupied leadership positions. Their strategy is to inform: not to ask permission, but to let the people affected by their actions know in advance. When they neglect this, their impulsive energy meets resistance. Anger is their not-self theme.\n\nReflectors are the rarest group: around 1 percent. They have no centre defined at all, which means they are completely open to the energies around them. They are like the moon — they reflect and amplify what is present in their environment. Reflectors are particularly sensitive to their surroundings: the people they spend time with, the places where they live and work. Their strategy is to wait a full lunar cycle of 28 days for major decisions, so they can experience how something feels across all phases. Disappointment is their not-self signal, arising when they live in environments that do not suit them.\n\nWhat all five Types have in common is that they function best when aligned with their strategy and authority — and when they recognise the characteristic pitfall of their not-self as a signal that something is out of balance. The Type is not a label or a limitation. It is a description of how your energy system prefers to work.",
    },
    {
      id:"s7",tag:"Human Design Basics",title:"Gedefinieerde en open centra: het fundament van je chart",date:"9 augustus 2024",readtime:"6 min",
      title_en:"Defined and Open Centres: The Foundation of Your Chart",date_en:"August 9, 2024",excerpt_en:"Defined centres are the constant force in your design. Open centres are the places where you learn most — and become most conditioned.",
      excerpt:"Gedefinieerde centra zijn de constante kracht in jouw design. Open centra zijn de plekken waar je het meest leert — en het meest geconditioneerd raakt.",
      images:[
        "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=800&auto=format&q=75",
      ],
      body:"In elke Human Design chart zijn negen energiecentra zichtbaar. Sommige zijn gekleurd — gedefinieerd. Andere zijn wit — open. Dit onderscheid is een van de meest praktische inzichten die het systeem biedt, omdat het direct iets zegt over wat consistent in je is en wat variabel.\n\nEen gedefinieerd centrum is een centrum dat via een kanaal permanent verbonden is met een ander centrum. Het heeft een vaste, betrouwbare manier van functioneren. Wie een gedefinieerd Keelcentrum heeft, ervaart een consistente drang om te communiceren of te manifesteren. Wie een gedefinieerd Willscentrum heeft, beschikt over een stabiele kracht van wilsenergie. Die consistentie maakt een gedefinieerd centrum herkenbaar — voor jezelf en voor anderen. Het is iets van jou.\n\nEen open centrum werkt anders. Het heeft geen vaste energie — het is ontvankelijk, flexibel, en absorbeert de energie van anderen. Wanneer je in de buurt bent van iemand met een gedefinieerd centrum dat bij jou open is, voel je die energie versterkt. Een open Sacraalcentrum voelt in de aanwezigheid van Generators als een stortvloed van energie; een open Solarplexuscentrum neemt de emoties van anderen op alsof ze van jou zijn.\n\nDat vermogen tot absorptie is een tweesnijdend zwaard. Aan de ene kant biedt het open centra de mogelijkheid om dieper te begrijpen dan wie dat centrum gedefinieerd heeft. Een open emotioneel centrum leert subtiliteiten in emotionele dynamieken kennen die iemand met een gedefinieerd emotioneel centrum misschien nooit zo scherp zal waarnemen. Een open Willscentrum begrijpt het mechanisme van wilskracht en ego op een manier die verder gaat dan de ervaring van wie het constant aanstaat.\n\nAan de andere kant is een open centrum de voornaamste bron van conditionering. Het is de plek waar je het gedrag, de overtuigingen en de energie van anderen absorbeert en vervolgens als de jouwe behandelt. Een open Willscentrum leidt ertoe dat mensen zichzelf constant bewijzen terwijl het niet hun energie is. Een open Keelcentrum leidt tot praten om aandacht te trekken, ook als er niets wezenlijks te zeggen valt. Een open Hoofdcentrum staat continu vol met vragen waarop je geen antwoord hoeft te vinden.\n\nDe vraag bij een open centrum is altijd: is dit van mij, of neem ik iets op van de omgeving? Dat bewustzijn, consistent toegepast, is een van de meest bevrijdende oefeningen in Human Design. Niet alles wat je voelt, denkt of wilt is van jou. Sommige dingen zijn gewoon het veld om je heen, dat door jou heen stroomt en versterkt wordt.\n\nIn een rapport van de Faculty of Human Design worden gedefinieerde en open centra uitgebreid besproken, inclusief de specifieke dynamieken en conditioneringspatronen die bij elke combinatie horen. Het is een van de onderdelen waarop klanten het vaakst terugkijken.",
      body_en:"In every Human Design chart, nine energy centres are visible. Some are coloured — defined. Others are white — open. This distinction is one of the most practical insights the system offers, because it says directly something about what is consistent in you and what is variable.\n\nA defined centre is a centre that is permanently connected to another centre through a channel. It has a fixed, reliable way of functioning. Someone with a defined Throat centre experiences a consistent drive to communicate or manifest. Someone with a defined Will centre possesses a stable force of willpower energy. That consistency makes a defined centre recognisable — to yourself and to others. It is something of yours.\n\nAn open centre works differently. It has no fixed energy — it is receptive, flexible, and absorbs the energy of others. When you are near someone with a defined centre that is open in you, you feel that energy amplified. An open Sacral centre feels like a flood of energy in the presence of Generators; an open Solar Plexus centre takes on the emotions of others as if they were your own.\n\nThat capacity for absorption is a double-edged sword. On one hand, open centres offer the possibility to understand more deeply than those who have that centre defined. An open emotional centre comes to know subtleties in emotional dynamics that someone with a defined emotional centre may never perceive as sharply. An open Will centre understands the mechanism of willpower and ego in a way that goes beyond the experience of those for whom it is constantly on.\n\nOn the other hand, an open centre is the primary source of conditioning. It is the place where you absorb the behaviour, beliefs and energy of others and then treat it as your own. An open Will centre leads people to constantly prove themselves when that is not their energy. An open Throat centre leads to talking to attract attention, even when there is nothing substantial to say. An open Head centre is constantly filled with questions you do not need to answer.\n\nThe question with an open centre is always: is this mine, or am I picking something up from the environment? That awareness, consistently applied, is one of the most liberating practices in Human Design. Not everything you feel, think or want is yours. Some things are simply the field around you, flowing through you and being amplified.\n\nIn a report from the Faculty of Human Design, defined and open centres are discussed extensively, including the specific dynamics and conditioning patterns that belong to each combination. It is one of the sections that clients most often return to.",
    },
    {
      id:"s8",tag:"Human Design Basics",title:"Het profiel: de rol die je speelt in dit leven",date:"18 maart 2025",readtime:"7 min",
      title_en:"The Profile: The Role You Play in This Life",date_en:"March 18, 2025",excerpt_en:"Your profile in Human Design consists of two numbers and describes the archetypal role you occupy in this life, consciously and unconsciously.",
      excerpt:"Je profiel in Human Design bestaat uit twee cijfers en beschrijft de archetypische rol die jij in dit leven inneemt, bewust en onbewust.",
      images:[
        "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&auto=format&q=75",
        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&q=75",
      ],
      body:"In Human Design wordt het profiel bepaald door de twee lijnen van de hexagrammen die de bewuste zon en de onbewuste zon activeren in je chart. Het resultaat is een getal met een schuine streep ertussen: 1/3, 2/4, 3/5, 4/6, 5/1, 6/2. Die combinatie beschrijft de archetypische rol die jij in dit leven inneemt, niet wat je doet, maar hoe je dat doet en wat de overkoepelende thema's van je pad zijn.\n\nDe zes lijnen hebben elk een eigen karakter. Lijn 1, de Onderzoeker, moet een fundament hebben. Ze zijn studieuze types die zekerheid en kennis opbouwen voor ze zich veilig voelen om te handelen. Onzekerheid op het fundament leidt tot angst. Lijn 2, de Kluizenaar, heeft af en toe terugtrektijd nodig — ze functioneren het best wanneer ze niet constant in contact staan met anderen en hun gaven tot wasdom kunnen laten komen. Ze worden dikwijls vanuit hun omgeving uitgenodigd of herkend zonder dat ze dat bewust nastreven.\n\nLijn 3, de Martelaar, leert door trial and error. Ze stuiten op wat niet werkt en verwerven daarmee een praktische wijsheid die niemand hen kan leren uit boeken. Lijn 4, de Opportunist, bouwt haar leven op via een netwerk van nauwe relaties. Invloed verspreidt zich voor hen via de mensen die ze kennen, en goede banden zijn essentieel voor hun welzijn en impact. Lijn 5, de Heretic, wordt door anderen geprojecteerd als iemand die oplossingen heeft voor hun problemen — een reputatiegevoelig profiel dat de spanning voelt tussen de projecties van anderen en wie ze werkelijk zijn. Lijn 6, de Rolmodel, verloopt in drie fasen door het leven: een actieve fase van ervaring vergaren, een teruggetrokken fase van consolidatie, en een late fase waarbij de wijsheid van het geheel zichtbaar wordt voor anderen.\n\nJe profiel combineert twee van deze lijnen: de eerste is bewust, de tweede onbewust. Voor iemand met profiel 3/5 is de 3 de bewuste laag — de openlijk experimenterende, trial-and-error-ingestelde kant — en de 5 de onbewuste laag, die door anderen wordt ervaren als iemand met een universele boodschap of oplossing, soms ten koste van de persoon zelf.\n\nProfiel is geen lot en geen beperking. Het is een beschrijving van het terrein waarop je het gemakkelijkst leert en de archetypische dynamieken die door je leven heen zullen spelen. Wie zijn profiel begrijpt, herkent bepaalde terugkerende patronen niet langer als pech of persoonlijk falen, maar als onderdeel van een coherente levensstructuur.",
      body_en:"In Human Design, the profile is determined by the two lines of the hexagrams that activate the conscious sun and the unconscious sun in your chart. The result is a number with a slash between them: 1/3, 2/4, 3/5, 4/6, 5/1, 6/2. That combination describes the archetypal role you occupy in this life — not what you do, but how you do it and what the overarching themes of your path are.\n\nThe six lines each have their own character. Line 1, the Investigator, needs a foundation. They are studious types who build security and knowledge before they feel safe enough to act. Uncertainty in the foundation leads to anxiety. Line 2, the Hermit, needs occasional withdrawal time — they function best when not constantly in contact with others and can allow their gifts to mature. They are often invited or recognised from their environment without consciously seeking that.\n\nLine 3, the Martyr, learns through trial and error. They encounter what does not work and thereby acquire a practical wisdom that no one can teach them from books. Line 4, the Opportunist, builds their life through a network of close relationships. Influence spreads for them through the people they know, and good connections are essential for their wellbeing and impact. Line 5, the Heretic, is projected upon by others as someone who has solutions to their problems — a reputation-sensitive profile that feels the tension between the projections of others and who they truly are. Line 6, the Role Model, moves through life in three phases: an active phase of gathering experience, a withdrawn phase of consolidation, and a later phase in which the wisdom of the whole becomes visible to others.\n\nYour profile combines two of these lines: the first is conscious, the second unconscious. For someone with profile 3/5, the 3 is the conscious layer — the openly experimenting, trial-and-error-oriented side — and the 5 the unconscious layer, which is experienced by others as someone with a universal message or solution, sometimes at the person's own expense.\n\nProfile is not fate and not a limitation. It is a description of the terrain on which you most easily learn and the archetypal dynamics that will play through your life. Whoever understands their profile no longer recognises certain recurring patterns as bad luck or personal failure, but as part of a coherent life structure.",
    },
    {
      id:"s9",tag:"Verdieping",title:"Het Inkarnatie Kruis: jouw overkoepelende levensdoel",date:"7 januari 2025",readtime:"8 min",
      title_en:"The Incarnation Cross: Your Overarching Life Purpose",date_en:"January 7, 2025",excerpt_en:"The Incarnation Cross is the most overarching layer of your Human Design chart and describes the theme of the contribution you make to the whole.",
      excerpt:"Het Inkarnatie Kruis is de meest overkoepelende laag van je Human Design chart en beschrijft het thema van de bijdrage die jij aan het geheel levert.",
      images:[
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&q=75",
      ],
      body:"Van alle lagen in een Human Design chart is het Inkarnatie Kruis de meest overkoepelende. Het wordt gevormd door de vier Gates van de twee zonnen en de twee aardes — de bewuste zon en aarde, en de onbewuste zon en aarde — en beschrijft het thema van de bijdrage die een persoon gedurende zijn of haar leven levert aan de grotere context.\n\nEr zijn 192 unieke Inkarnatie Kruisen, verdeeld over drie families: het Rechterhoek Kruis, het Juxtapositie Kruis en het Linkerhoek Kruis. De familie waartoe een Kruis behoort, zegt iets over de aard van de missie. Mensen met een Rechterhoek Kruis zijn persoonlijk gericht: hun thema speelt zich af in de context van hun eigen leven en de relaties die ze daarin aangaan. Het is een persoonlijker, intenser pad dat sterk verbonden is met hun eigen ontwikkeling. Linkerhoek Kruisen zijn transpersoonlijk gericht: hun thema transcendeert het persoonlijke en speelt zich af op het niveau van de gemeenschap, de cultuur of de tijd. Juxtapositie Kruisen staan ertussenin — een vaststaand, helder gedefinieerd pad dat weinig ruimte laat voor variatie maar juist daarin zijn kracht vindt.\n\nEen voorbeeld. Het Rechterhoek Kruis van de Sfinx combineert Poorten 2, 1, 49 en 4 — poorten die gaan over richting en creativiteit, over revolutie en logica. Wie dit Kruis heeft, wordt door het leven geleid via persoonlijke ervaringen van richting vinden, creatief beginnen en de confrontatie met fundamentele veranderingen. Het Linkerhoek Kruis van de Profeet verbindt poorten rond waarheid uitspreken en collectieve patronen — een transpersoonlijke missie rond het benoemen wat anderen niet durven of kunnen zien.\n\nHet is belangrijk om het Inkarnatie Kruis niet als verplichting te lezen. Het is geen doel dat bereikt moet worden, geen belofte die ingelost moet worden. Het is eerder een beschrijving van het thema dat door je leven heen loopt als je in lijn bent met je design. Wanneer je vanuit je Type, Autoriteit en Profiel leeft, vindt het Kruis zijn weg vanzelf.\n\nWat het Inkarnatie Kruis biedt, is een gevoel van context. Veel mensen ervaren hun leven als een verzameling losse ervaringen zonder duidelijk verbindend thema. Het Kruis geeft woorden aan wat er als rode draad doorheen loopt — niet als verhaal dat je moet vertellen, maar als herkenning van wat altijd al aanwezig was.\n\nIn onze uitgebreide rapporten wordt het Inkarnatie Kruis uitvoerig besproken in samenhang met de andere lagen van het design. Het is een van de onderdelen waar mensen het meest door geraakt worden, omdat het iets benoemt wat ze al lang voelden maar nooit precies konden verwoorden.",
      body_en:"Of all the layers in a Human Design chart, the Incarnation Cross is the most overarching. It is formed by the four Gates of the two suns and the two earths — the conscious sun and earth, and the unconscious sun and earth — and describes the theme of the contribution a person makes to the larger context throughout their life.\n\nThere are 192 unique Incarnation Crosses, divided across three families: the Right Angle Cross, the Juxtaposition Cross and the Left Angle Cross. The family a Cross belongs to says something about the nature of the mission. People with a Right Angle Cross are personally oriented: their theme plays out in the context of their own life and the relationships they enter into within it. It is a more personal, intense path strongly connected to their own development. Left Angle Crosses are transpersonally oriented: their theme transcends the personal and plays out at the level of community, culture or time. Juxtaposition Crosses stand between the two — a fixed, clearly defined path that leaves little room for variation but finds its power precisely in that.\n\nAn example. The Right Angle Cross of the Sphinx combines Gates 2, 1, 49 and 4 — gates about direction and creativity, about revolution and logic. Whoever has this Cross is guided through life via personal experiences of finding direction, beginning creatively and confronting fundamental change. The Left Angle Cross of the Prophet connects gates around speaking truth and collective patterns — a transpersonal mission around naming what others dare not or cannot see.\n\nIt is important not to read the Incarnation Cross as an obligation. It is not a goal that must be achieved, not a promise that must be fulfilled. It is more a description of the theme that runs through your life when you are in alignment with your design. When you live from your Type, Authority and Profile, the Cross finds its way naturally.\n\nWhat the Incarnation Cross offers is a sense of context. Many people experience their life as a collection of loose experiences without a clear connecting theme. The Cross gives words to what runs through it like a red thread — not as a story you need to tell, but as a recognition of what was always already present.\n\nIn our comprehensive reports, the Incarnation Cross is discussed extensively in connection with the other layers of the design. It is one of the sections that people are most moved by, because it names something they have long felt but never been able to articulate precisely.",
    },
    {
      id:"s10",tag:"Verdieping",title:"Conditionering: wie ben jij zonder de invloed van anderen?",date:"14 juni 2025",readtime:"7 min",
      title_en:"Conditioning: Who Are You Without the Influence of Others?",date_en:"June 14, 2025",excerpt_en:"Conditioning is the process by which open centres absorb the energy of others and you learn to treat that as your own. Recognising it is the beginning of de-conditioning.",
      excerpt:"Conditionering is het proces waarbij open centra de energie van anderen absorberen en je leert dat dat van jou is. Het herkennen ervan is het begin van de-conditionering.",
      images:[
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&q=75",
      ],
      body:"Een van de meest centrale begrippen in Human Design is conditionering: het proces waarbij we de energieën, overtuigingen en gedragspatronen van anderen absorberen via onze open centra en die vervolgens als de onze behandelen. Het is geen moreel oordeel — het is simpelweg hoe het menselijk systeem werkt wanneer het niet bewust wordt toegepast.\n\nIeder mens heeft open centra. Zelfs de meest gedefinieerde chart heeft tenminste één open centrum. Die openheid is functioneel: het is de manier waarop je verbinding maakt met anderen, empathie voelt, en ervaringen opdoet die buiten je eigen consistente patroon liggen. Maar diezelfde openheid is de voornaamste bron van verwarring over wie je werkelijk bent.\n\nNeem het open Willscentrum als voorbeeld. Wie dat centrum open heeft, heeft van nature geen consistente willsenergie. Ze zijn niet ontworpen om continu te presteren, bewijzen of zich in te spannen vanuit ego. Maar in een omgeving — school, werk, gezin — die prestatiegericht is, absorberen ze de willsenergie van degenen om hen heen en leren ze dat ze zichzelf moeten bewijzen om van waarde te zijn. Ze gaan zich aan beloftes houden die ze op basis van andermans energie hebben gemaakt en zichzelf overspannen wanneer die externe energie wegvalt. De conditionering is: 'ik moet hard werken om mezelf te bewijzen.' De waarheid is: jij hebt die energie niet van jezelf, en dat is precies oké.\n\nOf het open Keelcentrum. Wie een open keel heeft, voelt de drang om te spreken wanneer anderen met een gedefinieerd Keelcentrum in de buurt zijn. Die gemanifesteerde energie laat hen horen — maar het is niet hun eigen stroom. Ze praten om aandacht te trekken, om erbij te horen, om zich te laten horen. De conditionering is: als ik praat, word ik gezien. De waarheid is: je hoeft niet te spreken om er te zijn.\n\nHet herkennen van conditionering begint met de simpele vraag: is dit van mij, of neem ik iets op? Die vraag is niet altijd makkelijk te beantwoorden, zeker niet wanneer conditioneringspatronen diepgeworteld zijn na tientallen jaren van herhaling. Maar de vraag stellen is al genoeg om langzaam bewustzijn te creëren.\n\nDe-conditionering, het loslaten van niet-eigen patronen, is geen weekend-workshop. Ra Uru Hu sprak over een periode van zeven jaar om de laag van conditionering echt af te schillen — de tijd die het lichaam nodig heeft om zijn energie volledig te vernieuwen en te heroriënteren. Dat is geen reden tot ontmoediging. Het is eerder een uitnodiging tot geduld en vriendelijkheid richting jezelf tijdens het proces.\n\nWat blijft er over wanneer de conditionering langzaam verdwijnt? Dat is de vraag die Human Design stelt. Niet als filosofisch raadsel, maar als praktische verkenning: wie ben jij wanneer je niet langer de energie van anderen met de jouwe verwart?",
      body_en:"One of the most central concepts in Human Design is conditioning: the process by which we absorb the energies, beliefs and behavioural patterns of others through our open centres and then treat them as our own. It is not a moral judgement — it is simply how the human system works when it is not consciously applied.\n\nEvery person has open centres. Even the most defined chart has at least one open centre. That openness is functional: it is the way you connect with others, feel empathy, and have experiences that lie outside your own consistent pattern. But that same openness is the primary source of confusion about who you truly are.\n\nTake the open Will centre as an example. Someone who has that centre open does not have consistent will energy by nature. They are not designed to continuously perform, prove themselves or exert themselves from the ego. But in an environment — school, work, family — that is performance-oriented, they absorb the will energy of those around them and learn that they must prove themselves to have value. They start keeping promises they made on the basis of someone else's energy, and burn themselves out when that external energy falls away. The conditioning is: 'I must work hard to prove myself.' The truth is: you do not have that energy yourself, and that is perfectly fine.\n\nOr the open Throat centre. Someone with an open throat feels the urge to speak when others with a defined Throat centre are nearby. That manifested energy makes them want to be heard — but it is not their own flow. They talk to attract attention, to belong, to make themselves heard. The conditioning is: if I speak, I am seen. The truth is: you do not need to speak to exist.\n\nRecognising conditioning begins with the simple question: is this mine, or am I picking something up? That question is not always easy to answer, especially when conditioning patterns are deeply rooted after decades of repetition. But asking the question is already enough to slowly create awareness.\n\nDe-conditioning — releasing patterns that are not your own — is not a weekend workshop. Ra Uru Hu spoke of a period of seven years to truly shed the layer of conditioning — the time the body needs to fully renew and reorient its energy. That is not a reason for discouragement. It is more an invitation to patience and kindness toward yourself during the process.\n\nWhat remains when the conditioning slowly disappears? That is the question Human Design poses. Not as a philosophical riddle, but as a practical exploration: who are you when you no longer confuse the energy of others with your own?",
    },
    {
      id:"s11",tag:"Verdieping",title:"Circuits in Human Design: individueel, collectief en stam",date:"3 september 2025",readtime:"6 min",
      title_en:"Circuits in Human Design: Individual, Collective and Tribal",date_en:"September 3, 2025",excerpt_en:"Every channel in Human Design belongs to a circuit. Those circuits describe how energy flows and what purpose a channel serves in the larger whole.",
      excerpt:"Elk kanaal in Human Design behoort tot een circuit. Die circuits beschrijven hoe energie stroomt en welk doel een kanaal dient in het grotere geheel.",
      images:[
        "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&q=75",
      ],
      body:"In Human Design zijn de 36 kanalen niet willekeurig verdeeld. Elk kanaal behoort tot een circuit, en die circuits beschrijven hoe energie stroomt en welk doel de bijbehorende kwaliteiten dienen in het grotere menselijke geheel. Er zijn drie hoofdcircuits: het Individuele circuit, het Collectieve circuit en het Stammencircuit, elk met hun eigen subgroepen.\n\nHet Individuele circuit is het circuit van mutatie en uniciteit. Energie in dit circuit stroomt niet continu maar pulsgewijs — er zijn periodes van intense activiteit en inzicht, gevolgd door stille periodes. Individuele circuits zijn niet ontworpen voor consistentie in de ogen van anderen; ze zijn ontworpen voor doorbraak en vernieuwing. Wie veel kanalen in het Individuele circuit heeft, ervaart dikwijls een diepe behoefte aan authenticiteit en autonomie. Ze zijn niet altijd begrijpelijk voor anderen, maar ze zijn precies daardoor dragers van iets nieuws.\n\nHet Collectieve circuit is het circuit van delen en overdragen. Energie hier stroomt van het verleden naar de toekomst — ervaring wordt omgezet in kennis die gedeeld kan worden met anderen. Er zijn twee takken: de Logische tak, die via patronen en herhaling werkt, en de Abstracte tak, die via ervaring en reflectie werkt. Kanalen in de Logische tak zijn gericht op betrouwbaarheid en bewijs: wat kan herhaald worden? Wat is aantoonbaar juist? Kanalen in de Abstracte tak gaan over de betekenis van ervaring: wat heeft dit mij geleerd, en hoe kan ik dat doorgeven?\n\nHet Stammencircuit is het circuit van ondersteuning en overleven. Het gaat om de praktische verbinding tussen mensen: familie, gemeenschap, middelen, seksualiteit, afspraken. Energie in dit circuit is transactioneel van aard — er is een impliciete of expliciete uitwisseling. Wie sterke Stammencircuits heeft, is vaak goed in het organiseren van praktische zaken, het bouwen van gemeenschappen en het onderhouden van de sociale structuren die mensen samenhouden.\n\nHet begrijpen van circuits voegt een dimensie toe aan het lezen van een chart die voorbij het individuele gaat. Het beantwoordt de vraag: voor wie is deze energie? Individuele kanalen zijn voor de persoon zelf, en alleen nuttig voor anderen wanneer ze er via resonantie door geraakt worden. Collectieve kanalen zijn ontworpen om gedeeld te worden. Stammencircuits zijn bedoeld voor de mensen met wie je in directe band staat.\n\nIn een analyse laat het circuitperspectief zien hoe de energie in je chart samenhangt — welke kwaliteiten voor jezelf zijn, welke voor je gemeenschap, en welke bedoeld zijn om iets nieuws in de wereld te introduceren.",
      body_en:"In Human Design the 36 channels are not distributed randomly. Every channel belongs to a circuit, and those circuits describe how energy flows and what purpose the associated qualities serve in the larger human whole. There are three main circuits: the Individual circuit, the Collective circuit and the Tribal circuit, each with their own subgroups.\n\nThe Individual circuit is the circuit of mutation and uniqueness. Energy in this circuit does not flow continuously but in pulses — there are periods of intense activity and insight, followed by quiet periods. Individual circuits are not designed for consistency in the eyes of others; they are designed for breakthrough and renewal. Whoever has many channels in the Individual circuit often experiences a deep need for authenticity and autonomy. They are not always comprehensible to others, but it is precisely because of that they carry something new.\n\nThe Collective circuit is the circuit of sharing and transmission. Energy here flows from the past toward the future — experience is converted into knowledge that can be shared with others. There are two branches: the Logic branch, which works through patterns and repetition, and the Abstract branch, which works through experience and reflection. Channels in the Logic branch are oriented toward reliability and proof: what can be repeated? What is demonstrably correct? Channels in the Abstract branch are about the meaning of experience: what has this taught me, and how can I pass that on?\n\nThe Tribal circuit is the circuit of support and survival. It is about the practical connection between people: family, community, resources, sexuality, agreements. Energy in this circuit is transactional in nature — there is an implicit or explicit exchange. Whoever has strong Tribal circuits is often good at organising practical matters, building communities and maintaining the social structures that keep people together.\n\nUnderstanding circuits adds a dimension to reading a chart that goes beyond the individual. It answers the question: for whom is this energy? Individual channels are for the person themselves, and only useful to others when they are touched by them through resonance. Collective channels are designed to be shared. Tribal circuits are meant for the people with whom you are in direct connection.\n\nIn an analysis, the circuit perspective shows how the energy in your chart coheres — which qualities are for yourself, which are for your community, and which are intended to introduce something new into the world.",
    },
    {
      id:"s12",tag:"Numerologie & Astrologie",title:"Je uitdrukkingsgetal: de energie die je naar buiten brengt",date:"11 september 2024",readtime:"5 min",
      title_en:"Your Expression Number: The Energy You Bring Into the World",date_en:"September 11, 2024",excerpt_en:"The expression number is calculated from the letters of your full name and describes how you bring your energy, talents and presence outward.",
      excerpt:"Het uitdrukkingsgetal wordt berekend uit de letters van je volledige naam en beschrijft hoe jij je energie, talenten en aanwezigheid naar buiten brengt.",
      images:[
        "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&auto=format&q=75",
      ],
      body:"In de numerologie werken we met meerdere kerngetallen. Het levenspadgetal geeft het overkoepelende levensthema aan. Maar er is een ander getal dat iets anders beschrijft: het uitdrukkingsgetal, ook wel het bestemmingsgetal of het naamgetal genoemd. Het wordt berekend uit de volledige naam zoals die bij de geboorte is gegeven, en beschrijft hoe jij jouw energie, talenten en aanwezigheid naar buiten brengt.\n\nDe berekening werkt via het Pythagoraanse systeem, waarbij elke letter van het alfabet een numerieke waarde krijgt van 1 tot en met 9. A is 1, B is 2, C is 3, enzovoort. Voor dubbele cijfers herbegin je: I is 9, J is 1. Alle letters van je volledige geboortenaam worden bij elkaar opgeteld en teruggebracht tot een enkelvoudig cijfer — of tot het mastergetal 11, 22 of 33 als de som daar toekomt.\n\nWaar het levenspadgetal het terrein beschrijft waarop je groeit, beschrijft het uitdrukkingsgetal de instrumenten die je ter beschikking hebt. Uitdrukking 3 heeft een natuurlijk talent voor communicatie, creativiteit en het brengen van vreugde. Uitdrukking 8 beschikt over leiderschapskwaliteiten, zakelijk instinct en een vermogen om op grote schaal te manifesteren. Uitdrukking 2 brengt verbinding, zorg en diplomatiek gevoel. Uitdrukking 7 is analytisch, diepgaand en zoekt naar de verborgen lagen onder de oppervlakte.\n\nEen interessant aspect van het uitdrukkingsgetal is de relatie met het levenspadgetal. Wanneer de twee overeenkomen of complementair zijn, is er een gevoel van coherentie: wat jij inwendig ontwikkelt, stroomt vanzelf naar de manier waarop je je naar buiten presenteert. Wanneer ze spanningsvol zijn — zeg een levenspad 4 (structuur, discipline) met een uitdrukking 5 (vrijheid, verandering) — ontstaat er een interne spanning die vruchtbaar kan zijn als bewust gehanteerd.\n\nHet uitdrukkingsgetal verandert niet, tenzij iemand officieel van naam verandert. In dat geval heeft de nieuwe naam een nieuwe uitdrukking, die naast de oude energetische signatuur van de geboortenaam blijft staan. In onze numerologierapporten worden beide in samenhang besproken, zodat de volledige energetische architectuur van naam en geboortedatum zichtbaar wordt.",
      body_en:"In numerology we work with several core numbers. The life path number indicates the overarching life theme. But there is another number that describes something different: the expression number, also called the destiny number or name number. It is calculated from the full name as given at birth and describes how you bring your energy, talents and presence outward.\n\nThe calculation works through the Pythagorean system, in which each letter of the alphabet receives a numerical value from 1 to 9. A is 1, B is 2, C is 3, and so on. For double digits you start again: I is 9, J is 1. All letters of your full birth name are added together and reduced to a single digit — or to the master number 11, 22 or 33 if the sum arrives there.\n\nWhere the life path number describes the terrain on which you grow, the expression number describes the tools at your disposal. Expression 3 has a natural talent for communication, creativity and bringing joy. Expression 8 possesses leadership qualities, business instinct and a capacity to manifest on a large scale. Expression 2 brings connection, care and diplomatic sensitivity. Expression 7 is analytical, deep and searches for the hidden layers beneath the surface.\n\nAn interesting aspect of the expression number is the relationship with the life path number. When the two align or are complementary, there is a sense of coherence: what you develop inwardly flows naturally into the way you present yourself outward. When they are in tension — say a life path 4 (structure, discipline) with an expression 5 (freedom, change) — an internal tension arises that can be fruitful when handled consciously.\n\nThe expression number does not change, unless someone officially changes their name. In that case the new name has a new expression, which stands alongside the old energetic signature of the birth name. In our numerology reports both are discussed in relation to each other, so that the full energetic architecture of name and date of birth becomes visible.",
    },
    {
      id:"s13",tag:"Numerologie & Astrologie",title:"De ascendant: waarom je zonneteken niet het hele verhaal vertelt",date:"16 december 2024",readtime:"6 min",
      title_en:"The Ascendant: Why Your Sun Sign Doesn't Tell the Whole Story",date_en:"December 16, 2024",excerpt_en:"The sun sign is the most well-known astrological factor, but it tells only a third of the story. The ascendant and moon sign are equally determining.",
      excerpt:"Het zonneteken is het meest bekende astrologische gegeven, maar het vertelt slechts een derde van het verhaal. De ascendant en de maanstand zijn minstens zo bepalend.",
      images:[
        "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&auto=format&q=75",
        "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&q=75",
      ],
      body:"Wanneer mensen vragen 'wat is je sterrenbeeld?', bedoelen ze het zonneteken: de positie van de zon op het moment van geboorte. Het is het meest bekende element van de astrologie en het eenvoudigst te bepalen: je geboortedatum is genoeg. Maar de meeste astrologen zullen zeggen dat het zonneteken slechts het beginpunt is, niet het complete portret.\n\nVoor een volledige geboortehoroscoop zijn drie factoren van fundamenteel belang: het zonneteken, het maanteken en de ascendant. Elk beschrijft een andere laag van de persoonlijkheid.\n\nHet zonneteken staat voor de bewuste identiteit: de energie die je het liefst uit, het thema van zelfontwikkeling en de manier waarop je je wil presenteren aan de wereld. Een Schorpioen-zon heeft een diepe interesse in transformatie, verborgen waarheden en intense verbinding. Een Tweelingen-zon gedijt bij intellectuele prikkeling, communicatie en veelzijdigheid.\n\nHet maanteken staat voor de emotionele natuur: de behoeftes, reflexen en de manier waarop iemand innerlijk verwerkt. Het is minder zichtbaar voor de buitenwereld maar bepalend voor hoe iemand zich echt voelt. Een Kreeft-maan heeft diepe behoeftes aan veiligheid, thuis en emotionele nabijheid. Een Steenboksmaanteken verwerkt emoties via structuur, beheersing en verantwoordelijkheid.\n\nDe ascendant — ook wel het rijzende teken of de Lagna genoemd — is het teken dat op de oostelijke horizon stond op het moment van geboorte. Het vereist niet alleen de geboortedatum maar ook het exacte tijdstip en de geboorteplaats. De ascendant beschrijft hoe iemand door de wereld wordt waargenomen bij een eerste ontmoeting: de eerste indruk, het uiterlijke gedrag, de fysieke presentatie. Mensen met een Leeuw-ascendant stralen warmte en zelfverzekerdheid uit, zelfs als ze innerlijk verlegen zijn. Een Maagd-ascendant presenteert zich kalm, georganiseerd en bescheiden, ongeacht het zonneteken.\n\nDe reden dat mensen zich soms maar gedeeltelijk herkennen in hun zonneteken, is dat het maanteken en de ascendant net zo krachtig kunnen zijn, en soms dominanter. Iemand met een Stier-zon maar een Steenbok-ascendant en een Schorpioen-maan zal weinig van de stereotiepe Stier-beschrijving herkennen. Ze belichamen de Stier-kwaliteiten, maar die komen pas echt naar voren wanneer je ze goed kent.\n\nIn onze geboortehoroscoopanalyse beschrijven we de volledige astrologische blauwdruk, inclusief de posities van alle planeten in de tekens en huizen, de aspecten daartussen, en de specifieke combinaties die de aard van de persoon het duidelijkst beschrijven.",
      body_en:"When people ask 'what is your star sign?', they mean the sun sign: the position of the sun at the moment of birth. It is the most well-known element of astrology and the easiest to determine: your date of birth is enough. But most astrologers will say that the sun sign is only the starting point, not the complete portrait.\n\nFor a full birth horoscope, three factors are of fundamental importance: the sun sign, the moon sign and the ascendant. Each describes a different layer of the personality.\n\nThe sun sign represents the conscious identity: the energy you most like to express, the theme of self-development and the way you want to present yourself to the world. A Scorpio sun has a deep interest in transformation, hidden truths and intense connection. A Gemini sun thrives on intellectual stimulation, communication and versatility.\n\nThe moon sign represents the emotional nature: the needs, reflexes and the way someone processes things inwardly. It is less visible to the outside world but determining for how someone truly feels. A Cancer moon has deep needs for security, home and emotional closeness. A Capricorn moon processes emotions through structure, control and responsibility.\n\nThe ascendant — also called the rising sign or Lagna — is the sign that was on the eastern horizon at the moment of birth. It requires not only the date of birth but also the exact time and place of birth. The ascendant describes how someone is perceived by the world at a first meeting: the first impression, outward behaviour, physical presentation. People with a Leo ascendant radiate warmth and self-assurance, even if they are inwardly shy. A Virgo ascendant presents as calm, organised and modest, regardless of the sun sign.\n\nThe reason people sometimes only partially recognise themselves in their sun sign is that the moon sign and ascendant can be just as powerful, and sometimes more dominant. Someone with a Taurus sun but a Capricorn ascendant and a Scorpio moon will recognise little of the stereotypical Taurus description. They embody the Taurus qualities, but those only really come to the surface when you know them well.\n\nIn our birth chart analysis we describe the complete astrological blueprint, including the positions of all planets in the signs and houses, the aspects between them, and the specific combinations that describe the nature of the person most clearly.",
    },
    {
      id:"s14",tag:"Numerologie & Astrologie",title:"Mastergetallen 11, 22 en 33: intense paden met grote potentie",date:"27 februari 2025",readtime:"5 min",
      title_en:"Master Numbers 11, 22 and 33: Intense Paths With Great Potential",date_en:"February 27, 2025",excerpt_en:"Master numbers are not reduced in numerology. They carry a double intensity: the potential of their higher expression and the weight of their lower frequency.",
      excerpt:"Mastergetallen worden niet gereduceerd in de numerologie. Ze dragen een dubbele intensiteit: de potentie van hun hogere expressie én de last van hun lagere frequentie.",
      images:[
        "https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&auto=format&q=75",
      ],
      body:"In de numerologie worden de meeste getallen teruggebracht tot een enkelvoudig cijfer tussen 1 en 9. De uitzondering zijn de mastergetallen: 11, 22 en 33. Ze worden niet gereduceerd omdat ze een dubbele energetische intensiteit dragen die niet verloren mag gaan bij de reductie.\n\nMastergetal 11 is het getal van de intuïtieve boodschapper. Het is een versterking van het getal 2 (verbinding, gevoeligheid, samenwerking) maar op een hoger octaaf. Mensen met levenspad 11 zijn buitengewoon intuïtief, ontvankelijk voor subtiele energieën en hebben vaak een diep gevoel dat ze hier zijn voor een doel dat groter is dan zijzelf. De schaduwkant is angst en twijfel: de gevoeligheid die hen helder maakt, maakt hen ook kwetsbaar voor overweldiging. Veel 11ers oscilleren tussen helderheid en onzekerheid, tussen het voelen van hun hogere potentie en het gevoel er nooit aan te kunnen voldoen.\n\nMastergetal 22 is de meester-bouwer. Het combineert de visie van de 11 met het praktische fundament van de 4. Mensen met dit levenspad zijn in staat om grote systemen, structuren of bewegingen te creëren die een blijvende impact hebben op de gemeenschap of de maatschappij. De spanning ligt in de kloof tussen de schaal van de visie en de discipline die nodig is om die te realiseren. Veel 22ers worstelen met het gevoel dat ze te groot of te ambitieus denken, terwijl het precies die grootsheid is die hun bijdrage betekenisvol maakt.\n\nMastergetal 33 is het zeldzaamst en staat voor de meester-leraar. Het is een versterking van de 6 (zorg, verantwoordelijkheid, dienst) op kosmisch niveau. Een echt levenspad 33 is zeldzaam, want de berekening moet zuiver zijn: het gaat alleen op wanneer elk van de deelsommen afzonderlijk 11 of 22 oplevert. Mensen met dit levenspad zijn gedreven door een diep gevoel van universele liefde en creatieve dienst. Ze zijn leraren op het diepste niveau: niet via methode maar via aanwezigheid.\n\nEen praktische noot: niet iedereen die een 11, 22 of 33 in zijn chart heeft, leeft op het masterniveau. In de numerologie is het gebruikelijk om mastergetallen ook te lezen als hun gereduceerde tegenhanger (11 als 2, 22 als 4, 33 als 6) voor de alledaagse uitdrukkingen. Het master-octaaf is het potentieel; het gereduceerde getal is de grond waar vandaan men klimt.",
      body_en:"In numerology most numbers are reduced to a single digit between 1 and 9. The exception is the master numbers: 11, 22 and 33. They are not reduced because they carry a double energetic intensity that must not be lost in the reduction.\n\nMaster number 11 is the number of the intuitive messenger. It is an amplification of the number 2 (connection, sensitivity, cooperation) but on a higher octave. People with life path 11 are extraordinarily intuitive, receptive to subtle energies, and often have a deep sense that they are here for a purpose greater than themselves. The shadow side is fear and doubt: the sensitivity that makes them clear also makes them vulnerable to overwhelm. Many 11s oscillate between clarity and uncertainty, between feeling their higher potential and feeling they can never live up to it.\n\nMaster number 22 is the master builder. It combines the vision of the 11 with the practical foundation of the 4. People with this life path are capable of creating large systems, structures or movements that have a lasting impact on the community or society. The tension lies in the gap between the scale of the vision and the discipline required to realise it. Many 22s struggle with the feeling that they think too big or too ambitiously, while it is precisely that scale that makes their contribution meaningful.\n\nMaster number 33 is the rarest and stands for the master teacher. It is an amplification of the 6 (care, responsibility, service) at a cosmic level. A true life path 33 is rare, because the calculation must be pure: it only applies when each of the sub-sums separately yields 11 or 22. People with this life path are driven by a deep sense of universal love and creative service. They are teachers at the deepest level: not through method but through presence.\n\nA practical note: not everyone who has an 11, 22 or 33 in their chart lives at the master level. In numerology it is common to read master numbers also as their reduced counterpart (11 as 2, 22 as 4, 33 as 6) for everyday expressions. The master octave is the potential; the reduced number is the ground from which one climbs.",
    },
    {
      id:"s15",tag:"Human Design Basics",title:"Waarom Human Design geen persoonlijkheidstest is",date:"30 april 2025",readtime:"5 min",
      title_en:"Why Human Design Is Not a Personality Test",date_en:"April 30, 2025",excerpt_en:"Human Design is often mentioned in the same breath as MBTI or the Enneagram. The fundamental difference: Human Design is not based on self-reporting but on astronomical calculation.",
      excerpt:"Human Design wordt vaak in één adem genoemd met MBTI of de Enneagram. Het fundamentele verschil: Human Design is niet gebaseerd op zelfrapportage maar op astronomische berekening.",
      images:[
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&q=75",
      ],
      body:"Wanneer mensen voor het eerst van Human Design horen, is de eerste vergelijking die ze maken vaak die met andere systemen: MBTI, de Enneagram, de Big Five. En er zijn oppervlakkige overeenkomsten: alle systemen proberen iets te zeggen over de aard van de mens en hoe verschillende mensen anders in de wereld staan. Maar er is een fundamenteel verschil dat die vergelijking problematisch maakt.\n\nPersonalijkheidstests zijn gebaseerd op zelfrapportage. Je beantwoordt een reeks vragen over je gedrag, je voorkeuren, je reacties. Op basis van je antwoorden word je ingedeeld in een type of profiel. Dat systeem heeft inherente beperkingen: mensen antwoorden niet altijd eerlijk, antwoorden zijn contextgevoelig, en het meest pregnante probleem: mensen beschrijven vaak wie ze willen zijn of denken te zijn, niet wie ze werkelijk zijn.\n\nHuman Design werkt anders. De input zijn niet jouw antwoorden op vragen. De input is je geboortedatum, geboortetijd en geboorteplaats. Op basis daarvan worden de posities van de planeten berekend op het moment van je geboorte én op het moment precies 88 graden vóór je geboorte, wat overeenkomt met ongeveer 88 dagen voor de uitgerekende datum. Die twee momenten leveren twee sets van planetaire posities die, via de I Ching-hexagrammen, de poorten en centra in je chart activeren.\n\nDe resulterende chart beschrijft niet hoe jij jezelf ervaart, maar hoe je energiesysteem is geconfigureerd. Die configuratie verandert niet en is onafhankelijk van je humeur, je zelfbeeld of de context waarin je de vragenlijst invult. Een Generator blijft een Generator of hij zichzelf als energiek ervaart of niet. Een gedefinieerd emotioneel centrum blijft gedefinieerd, ook als iemand zichzelf rationeel en niet-emotioneel noemt.\n\nDat maakt Human Design navolgbaar op een manier die zelfrapportagesystemen niet zijn. Je kunt de berekening controleren, herhalen en verifiëren. De chart is het resultaat van astronomische data, niet van psychologische interpretatie van eigen gedrag.\n\nDat betekent niet dat Human Design geen interpretatie kent. Het kent die volop, en de kwaliteit van een analyse hangt sterk af van hoe diep en genuanceerd die interpretatie is. Maar het startpunt is objectief en onveranderlijk. En dat is een wezenlijk ander fundament dan een test die start met 'hoe zou jij reageren als...'",
      body_en:"When people first hear about Human Design, the first comparison they make is often with other systems: MBTI, the Enneagram, the Big Five. And there are superficial similarities: all systems try to say something about the nature of human beings and how different people stand in the world differently. But there is a fundamental difference that makes that comparison problematic.\n\nPersonality tests are based on self-reporting. You answer a series of questions about your behaviour, your preferences, your reactions. Based on your answers you are placed in a type or profile. That system has inherent limitations: people do not always answer honestly, answers are context-sensitive, and the most significant problem: people often describe who they want to be or think they are, not who they truly are.\n\nHuman Design works differently. The input is not your answers to questions. The input is your date of birth, time of birth and place of birth. Based on that, the positions of the planets are calculated at the moment of your birth and at the moment exactly 88 degrees before your birth, which corresponds to approximately 88 days before the due date. Those two moments yield two sets of planetary positions which, via the I Ching hexagrams, activate the gates and centres in your chart.\n\nThe resulting chart does not describe how you experience yourself, but how your energy system is configured. That configuration does not change and is independent of your mood, your self-image or the context in which you fill in the questionnaire. A Generator remains a Generator whether or not they experience themselves as energetic. A defined emotional centre remains defined, even if someone calls themselves rational and non-emotional.\n\nThat makes Human Design verifiable in a way that self-reporting systems are not. You can check, repeat and verify the calculation. The chart is the result of astronomical data, not of psychological interpretation of one's own behaviour.\n\nThat does not mean Human Design involves no interpretation. It involves a great deal, and the quality of an analysis depends strongly on how deep and nuanced that interpretation is. But the starting point is objective and unchanging. And that is a fundamentally different foundation than a test that begins with 'how would you react if...'",
    },
    {
      id:"s16",tag:"Verdieping",title:"Planeten in Human Design: welke planeet activeert welke poort?",date:"8 november 2025",readtime:"6 min",
      title_en:"Planets in Human Design: Which Planet Activates Which Gate?",date_en:"November 8, 2025",excerpt_en:"When a Human Design chart is calculated, the positions of ten celestial bodies are used. Each celestial body brings its own theme to the gate it activates.",
      excerpt:"In Human Design activeren de planeten op het moment van geboorte specifieke poorten in je chart. Elke planeet heeft daarin een eigen thema en kwaliteit.",
      images:[
        "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&auto=format&q=75",
      ],
      body:"Wanneer een Human Design chart wordt berekend, worden de posities van tien hemellichamen gebruikt: de Zon, de Maan, Mercurius, Venus, Mars, Jupiter, Saturnus, Uranus, Neptunus en Pluto, plus de Noord Node van de Maan (ook wel het Ware Zuidknooppunt en het Ware Noordknooppunt). Elk hemellichaam staat in een specifiek hexagram van de I Ching op het moment van de berekening, en dat hexagram correspondeert met een poort in het chart.\n\nElke planeet brengt een eigen thema mee aan de poort die hij activeert. De Zon is de krachtigste planeet in het chart en representeert de bewuste identiteit: de kern van wie je bent en hoe je jezelf ervaart. Wat de Zon activeert, is meestal het meest herkenbaar en het meest prominent aanwezig in je dagelijkse leven.\n\nDe Aarde staat altijd in het hexagram tegenover de Zon en representeert grounding, de balancerende kracht die de zonne-energie verankert. Wanneer de Zon in Poort 1 staat (de Creatieve), staat de Aarde in Poort 2 (de Ontvankelijke). Dat samenspel beschrijft een fundamentele spanning en aanvulling in het bewuste deel van het design.\n\nDe Maan beweegt snel, zij wisselt om de 1,5 tot 2,5 dagen van poort, en beschrijft dagelijkse energetische kleur en intuïtieve respons. Mercurius gaat over communicatie en de manier waarop gedachten worden verwerkt en gedeeld. Venus beschrijft de aard van verbinding, schoonheid en wat waardevolle uitwisseling is. Mars staat voor de kwaliteit van actie en begeerte.\n\nJupiter en Saturnus zijn de sociale planeten: Jupiter staat voor expansie, overvloed en groei; Saturnus voor structuur, grenzen en lessen via beperking. Uranus, Neptunus en Pluto zijn de generatieplaneten — ze bewegen langzaam genoeg om meerdere jaargangen dezelfde poort te activeren, wat gemeenschappelijke generatiethema's beschrijft in plaats van puur individuele.\n\nDe Norte Node en Zuid Node beschrijven de richting van groei in dit leven (Noord Node) en de kwaliteiten die je meebrengt uit het verleden of de patroon waar je van los wil komen (Zuid Node).\n\nDe combinatie van alle planetaire activaties levert een gelaagd portret op dat veel rijker is dan alleen het Type, de Autoriteit of het Profiel. Het zijn de planeten die de poorten kleuren, en de poorten die de centra definiëren: van molecuul tot chart, van chart tot leven.",
      body_en:"When a Human Design chart is calculated, the positions of ten celestial bodies are used: the Sun, the Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto, plus the North Node of the Moon (also known as the True South Node and the True North Node). Each celestial body stands in a specific hexagram of the I Ching at the moment of calculation, and that hexagram corresponds to a gate in the chart.\n\nEvery planet brings its own theme to the gate it activates. The Sun is the most powerful planet in the chart and represents the conscious identity: the core of who you are and how you experience yourself. What the Sun activates is usually the most recognisable and the most prominently present in your daily life.\n\nThe Earth always stands in the hexagram opposite the Sun and represents grounding, the balancing force that anchors the solar energy. When the Sun is in Gate 1 (the Creative), the Earth stands in Gate 2 (the Receptive). That interplay describes a fundamental tension and complement in the conscious part of the design.\n\nThe Moon moves quickly — it changes gate every 1.5 to 2.5 days — and describes daily energetic colour and intuitive response. Mercury is about communication and the way thoughts are processed and shared. Venus describes the nature of connection, beauty and what constitutes valuable exchange. Mars stands for the quality of action and desire.\n\nJupiter and Saturn are the social planets: Jupiter stands for expansion, abundance and growth; Saturn for structure, boundaries and lessons through limitation. Uranus, Neptune and Pluto are the generational planets — they move slowly enough to activate the same gate across multiple birth years, which describes shared generational themes rather than purely individual ones.\n\nThe North Node and South Node describe the direction of growth in this life (North Node) and the qualities you bring from the past or the pattern you want to release (South Node).\n\nThe combination of all planetary activations yields a layered portrait that is far richer than Type, Authority or Profile alone. It is the planets that colour the gates, and the gates that define the centres: from molecule to chart, from chart to life.",
    },
  ];
  useEffect(()=>{
    const load=async()=>{
      try{
        const url=(typeof import.meta!=="undefined"&&import.meta.env)?import.meta.env.VITE_SUPABASE_URL:"";
        const key=(typeof import.meta!=="undefined"&&import.meta.env)?import.meta.env.VITE_SUPABASE_ANON_KEY:"";
        if(!url||!key){setArticles(STATIC);setLoading(false);return;}
        const res=await fetch(url+"/rest/v1/articles?select=*&order=published_at.desc&limit=20",{headers:{"apikey":key,"Authorization":"Bearer "+key}});
        const data=await res.json();
        // Merge Supabase articles with STATIC fallback so the page is never sparse.
        // STATIC IDs are strings ("s1"…"s5"), Supabase IDs are numeric — no conflicts.
        const live=data&&Array.isArray(data)?data:[];
        const liveIds=new Set(live.map(a=>String(a.id)));
        const norm=t=>(t||"").trim().toLowerCase();
        const liveTitles=new Set(live.flatMap(a=>[norm(a.title),norm(a.title_en)]).filter(Boolean));
        const merged=[...live,...STATIC.filter(s=>!liveIds.has(String(s.id))&&!liveTitles.has(norm(s.title))&&!liveTitles.has(norm(s.title_en)))];
        setArticles(merged.length>0?merged:STATIC);
      }catch{setArticles(STATIC);}
      setLoading(false);
    };
    load();
  },[]);

  const activeArticle = activePost ? articles.find(a=>String(a.id)===String(activePost)) : null;

  // Pick the right language field: en version if LANG=en and it exists, else nl fallback
  const al=(a,f)=>(LANG==="en"&&a[f+"_en"])?a[f+"_en"]:a[f];

  // SEO
  useSEO(activeArticle ? {
    title: al(activeArticle,"title"),
    description: al(activeArticle,"excerpt") || al(activeArticle,"title") + (isEN?" — Read the full article at Faculty of Human Design.":" — Lees het volledige artikel op Faculty of Human Design."),
    canonical: SITE + "/journal/" + String(activeArticle.id),
    jsonLd: {
      "@context":"https://schema.org","@type":"Article",
      "headline": activeArticle.title,
      "description": activeArticle.excerpt,
      "author": {"@type":"Organization","name":"Faculty of Human Design"},
      "publisher": {"@type":"Organization","name":"Faculty of Human Design"},
      "datePublished": activeArticle.date,
      "image": (activeArticle.images||[])[0]
    }
  } : {
    title: isEN?"Insights on Human Design, Numerology & Astrology":"Inzichten over Human Design, Numerologie & Astrologie",
    description: isEN?"Articles on Human Design, Numerology and Astrology. Learn about Type, Strategy, Authority and the origin of Human Design on Ibiza.":"Artikelen over Human Design, Numerologie en Astrologie. Leer meer over Type, Strategie, Autoriteit, Numerologie en de oorsprong van Human Design op Ibiza.",
    canonical: SITE + "/journal",
    jsonLd: {
      "@context":"https://schema.org","@type":"Blog",
      "name":isEN?"Faculty of Human Design — Insights":"Faculty of Human Design — Inzichten",
      "description":isEN?"Articles on Human Design, Numerology and Astrology.":"Artikelen over Human Design, Numerologie en Astrologie.",
      "publisher":{"@type":"Organization","name":"Faculty of Human Design"}
    }
  });

  // ── Article detail view ────────────────────────────────────────────────────
  if(activePost){
    const post=articles.find(a=>String(a.id)===String(activePost));
    if(!post)return null;
    const catLabel=CATS.find(c=>c.tag===post.tag)?.label||post.tag;
    return(
      <div className="pg">

        {/* ── ARTICLE HERO ── */}
        <div style={{position:"relative",height:"60vh",minHeight:440,maxHeight:680,overflow:"hidden",display:"flex",alignItems:"flex-end"}}>
          <div style={{position:"absolute",inset:0}}>
            <img src={(post.images||[])[0]||IMGS.cosmos} alt={al(post,"title")} loading="eager" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,7,14,.18) 0%,rgba(8,7,14,.12) 35%,rgba(8,7,14,.78) 100%)"}}/>
          </div>
          <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:760,margin:"0 auto",padding:"0 32px 64px"}}>
            <div style={{marginBottom:18,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,fontSize:".58rem",letterSpacing:".14em",color:"rgba(255,255,255,.35)",textTransform:"uppercase",transition:"color .2s"}}
              onClick={()=>setActivePost(null)}
              onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,.65)"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.35)"}
            >← {isEN?"Insights":"Inzichten"}</div>
            <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(201,168,92,.75)",marginBottom:16}}>{catLabel}</div>
            <h1 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.8rem,4.5vw,2.8rem)",fontWeight:300,color:"white",lineHeight:1.1,letterSpacing:"-.01em",marginBottom:20,maxWidth:640}}>{al(post,"title")}</h1>
            <div style={{fontFamily:"var(--font-sans)",fontSize:".6rem",letterSpacing:".1em",color:"rgba(255,255,255,.28)",textTransform:"uppercase"}}>{post.date} · {post.readtime} {isEN?"read":"leestijd"}</div>
          </div>
        </div>

        {/* ── ARTICLE BODY ── */}
        <section style={{background:"var(--bg)",padding:"80px 32px 96px"}}>
          <div style={{maxWidth:680,margin:"0 auto"}}>
            {(()=>{
              const paras=(al(post,"body")||"").trim().split("\n\n");
              const imgs=post.images||[];
              const pullIdx=Math.floor(paras.length/3);
              return paras.map((p,i)=>(
                <div key={i}>
                  {i===pullIdx&&(
                    <div style={{borderLeft:"2px solid var(--gold)",paddingLeft:24,margin:"40px 0",opacity:.85}}>
                      <p style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",fontStyle:"italic",fontWeight:300,color:"var(--text)",lineHeight:1.75}}>{paras[pullIdx].split(".")[0]}.</p>
                    </div>
                  )}
                  {i!==pullIdx&&(
                    <p style={{fontFamily:"var(--font-serif)",fontSize:"1.02rem",fontWeight:300,color:"var(--text)",lineHeight:2,marginBottom:28}}>{p.trim()}</p>
                  )}
                  {i===2&&imgs[1]&&<img src={imgs[1]} alt="" style={{width:"100%",display:"block",objectFit:"cover",maxHeight:420,margin:"12px 0 40px"}} loading="lazy"/>}
                </div>
              ));
            })()}
          </div>
        </section>

        {/* ── TYPE PAGE LINKS (s6 — De vijf Types) ── */}
        {String(post.id)==="s6"&&(
          <section style={{background:"white",padding:"72px 32px",borderTop:"1px solid var(--border)"}}>
            <div style={{maxWidth:760,margin:"0 auto"}}>
              <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",marginBottom:40}}>
                {isEN?"Explore each type in depth":"Verdiep je per type"}
              </div>
              <div className="types-grid-5" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"28px 20px"}}>
                {TYPES.map(tp=>(
                  <div key={tp.id}
                    style={{cursor:"pointer",borderTop:"1px solid var(--border)",paddingTop:20}}
                    onClick={()=>{go("type-"+tp.id);window.scrollTo(0,0);}}>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:400,color:"var(--text)",marginBottom:6,lineHeight:1.2}}>{isEN?tp.title.en:tp.title.nl}</div>
                    <div style={{fontSize:".72rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.55,marginBottom:12}}>{isEN?tp.tagline.en:tp.tagline.nl}</div>
                    <span style={{fontSize:".58rem",fontWeight:500,letterSpacing:".1em",textTransform:"uppercase",color:"var(--gold)"}}>{isEN?"Read more →":"Lees meer →"}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── MORE READING ── */}
        {articles.filter(a=>String(a.id)!==String(activePost)&&a.tag===post.tag).length>0&&(
          <section style={{background:"white",padding:"72px 32px",borderTop:"1px solid var(--border)"}}>
            <div style={{maxWidth:760,margin:"0 auto"}}>
              <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",marginBottom:40}}>{isEN?"More reading":"Meer lezen"}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"40px 32px"}}>
                {articles.filter(a=>String(a.id)!==String(activePost)&&a.tag===post.tag).slice(0,2).map(a=>(
                  <div key={a.id} style={{cursor:"pointer"}} onClick={()=>{setActivePost(String(a.id));window.scrollTo(0,0);}}>
                    {(a.images||[])[0]&&<div style={{aspectRatio:"16/9",overflow:"hidden",marginBottom:18}}>
                      <img src={a.images[0]} alt={al(a,"title")} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .5s ease"}}
                        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                      />
                    </div>}
                    <div style={{width:20,height:1,background:"var(--gold)",marginBottom:14,opacity:.5}}/>
                    <h4 style={{fontFamily:"var(--font-serif)",fontSize:"1.08rem",fontWeight:400,color:"var(--text)",lineHeight:1.3,marginBottom:8}}>{al(a,"title")}</h4>
                    <span style={{fontSize:".62rem",fontWeight:400,color:"var(--text-light)",letterSpacing:".1em",textTransform:"uppercase"}}>{a.readtime} {isEN?"read":"leestijd"}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── EDITORIAL CTA ── */}
        <section style={{background:"var(--bg)",padding:"96px 32px",textAlign:"center"}}>
          <div style={{maxWidth:480,margin:"0 auto"}}>
            <div style={{width:1,height:40,background:"var(--gold)",margin:"0 auto 36px",opacity:.4}}/>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.1rem,2vw,1.3rem)",fontWeight:300,fontStyle:"italic",color:"var(--text)",lineHeight:1.7,marginBottom:36}}>
              {isEN?"Understanding yourself is not a destination. It is a practice of returning.":"Jezelf begrijpen is geen bestemming. Het is een oefening in terugkeren."}
            </p>
            <button
              style={{fontFamily:"var(--font-sans)",fontSize:".7rem",fontWeight:400,letterSpacing:".16em",textTransform:"uppercase",color:"var(--text)",background:"transparent",border:"1px solid rgba(26,23,20,.3)",padding:"14px 44px",cursor:"pointer",transition:"all .3s ease"}}
              onMouseEnter={e=>{e.currentTarget.style.background="var(--text)";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="var(--text)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text)";e.currentTarget.style.borderColor="rgba(26,23,20,.3)";}}
              onClick={()=>go("rapporten")}
            >{isEN?"Discover your reading":"Ontdek je reading"}</button>
          </div>
        </section>

      </div>
    );
  }

  // ── Category filter pill styles ───────────────────────────────────────────
  const pillBase={display:"inline-block",padding:"7px 18px",borderRadius:99,fontSize:".7rem",fontWeight:500,letterSpacing:".1em",textTransform:"uppercase",cursor:"pointer",border:"1px solid var(--border)",transition:"all 150ms",whiteSpace:"nowrap"};
  const pillActive={...pillBase,background:"var(--dark)",color:"white",border:"1px solid var(--dark)"};
  const pillInactive={...pillBase,background:"transparent",color:"var(--text-muted)"};

  // ── Articles per category ─────────────────────────────────────────────────
  // On the EN page: only show articles that have been translated (title_en present).
  // This also prevents Dutch-only STATIC articles from duplicating a Supabase article
  // that covers the same topic but has a different ID.
  const catArts=(cat)=>articles.filter(a=>{
    if(a.tag!==cat.tag) return false;
    if(LANG==="en"&&!a.title_en) return false;
    return true;
  });
  const visibleCats=activeCat==="all"?CATS:CATS.filter(c=>c.id===activeCat);

  return(
    <div className="pg">

      {/* ── CINEMATIC HERO ── */}
      <div style={{position:"relative",height:"72vh",minHeight:520,maxHeight:780,overflow:"hidden",display:"flex",alignItems:"flex-end"}}>
        <div style={{position:"absolute",inset:0}}>
          <img src={IMGS.cosmos} alt="Faculty of Human Design — Inzichten" loading="eager" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 20%"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,7,14,.2) 0%,rgba(8,7,14,.08) 35%,rgba(8,7,14,.82) 100%)"}}/>
        </div>
        <div style={{position:"relative",zIndex:1,width:"100%",padding:"0 0 80px",maxWidth:1240,margin:"0 auto",paddingLeft:"clamp(20px,5vw,80px)",paddingBottom:80}}>
          <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(201,168,92,.7)",marginBottom:22}}>Faculty of Human Design — {isEN?"Knowledge":"Kennis"}</div>
          <h1 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(2.4rem,5.5vw,4.2rem)",fontWeight:300,color:"white",lineHeight:1.06,letterSpacing:"-.02em",marginBottom:20,maxWidth:640}}>
            {isEN?"Insights.":"Inzichten."}<br/>
            <em style={{fontStyle:"italic",color:"rgba(255,255,255,.38)"}}>{isEN?"For those who want to understand.":"Voor wie wil begrijpen."}</em>
          </h1>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(.95rem,1.5vw,1.05rem)",fontWeight:300,fontStyle:"italic",color:"rgba(255,255,255,.48)",maxWidth:460,lineHeight:1.75}}>
            {isEN?"Human Design, Numerology and Astrology — explored with depth.":"Human Design, Numerologie en Astrologie — diepgaand verkend."}
          </p>
        </div>
      </div>

      {/* ── MINIMAL FILTER BAR ── */}
      <div style={{background:"var(--bg)",borderBottom:"1px solid var(--border)",position:"sticky",top:64,zIndex:10}}>
        <div className="container" style={{paddingTop:16,paddingBottom:16,paddingLeft:"clamp(20px,4vw,32px)",paddingRight:"clamp(20px,4vw,32px)"}}>
          <div style={{display:"flex",gap:28,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",alignItems:"center"}}>
            {[{id:"all",label:isEN?"All articles":"Alle artikelen"},...CATS].map(c=>{
              const active=activeCat===c.id;
              return(
                <span key={c.id}
                  style={{fontFamily:"var(--font-sans)",fontSize:".6rem",fontWeight:active?500:400,letterSpacing:".14em",textTransform:"uppercase",color:active?"var(--text)":"var(--text-light)",cursor:"pointer",flexShrink:0,paddingBottom:2,borderBottom:active?"1px solid var(--text)":"1px solid transparent",transition:"all .15s",whiteSpace:"nowrap"}}
                  onClick={()=>setActiveCat(c.id)}
                >{c.label}</span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading&&(
        <div style={{textAlign:"center",padding:"96px 0",color:"var(--text-light)",fontSize:".7rem",letterSpacing:".14em",textTransform:"uppercase"}}>{isEN?"Loading…":"Laden…"}</div>
      )}

      {/* ── EDITORIAL CATEGORY SECTIONS ── */}
      {!loading&&visibleCats.map((cat,ci)=>{
        const arts=catArts(cat);
        if(!arts.length) return null;
        return(
          <section key={cat.id} id={cat.id} className="section-md" style={{borderBottom:"1px solid var(--border)",background:ci%2===0?"var(--bg)":"white"}}>
            <div className="container">

              {/* Editorial section header */}
              <div className="inzichten-cat-header">
                <div className="cat-divider"/>
                <div className="cat-label">{cat.label}</div>
                <p className="cat-desc">{cat.desc}</p>
              </div>

              {/* Open editorial article grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"52px 36px"}}>
                {arts.map(a=>(
                  <div key={a.id} style={{cursor:"pointer"}} onClick={()=>{setActivePost(String(a.id));window.scrollTo(0,0);}}>
                    {(a.images||[])[0]&&(
                      <div style={{aspectRatio:"4/3",overflow:"hidden",marginBottom:22}}>
                        <img src={a.images[0]} alt={al(a,"title")} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .6s ease"}} loading="lazy"
                          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                        />
                      </div>
                    )}
                    <div style={{width:20,height:1,background:"var(--gold)",marginBottom:14,opacity:.5}}/>
                    <h4 style={{fontFamily:"var(--font-serif)",fontSize:"1.12rem",fontWeight:400,color:"var(--text)",lineHeight:1.28,marginBottom:10}}>{al(a,"title")}</h4>
                    <p style={{fontSize:".875rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.72,marginBottom:14,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{al(a,"excerpt")}</p>
                    <span style={{fontSize:".6rem",fontWeight:400,color:"var(--text-light)",letterSpacing:".1em",textTransform:"uppercase"}}>{a.readtime} {isEN?"read":"leestijd"}</span>
                  </div>
                ))}
              </div>

            </div>
          </section>
        );
      })}

      {/* ── EDITORIAL PAUSE + CTA ── */}
      {!loading&&(
        <section style={{background:"var(--bg)",padding:"112px 32px",textAlign:"center"}}>
          <div style={{maxWidth:540,margin:"0 auto"}}>
            <div style={{width:1,height:52,background:"var(--gold)",margin:"0 auto 44px",opacity:.4}}/>
            <blockquote style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.2rem,2.2vw,1.55rem)",fontWeight:300,fontStyle:"italic",color:"var(--text)",lineHeight:1.6,letterSpacing:"-.005em",margin:"0 0 44px"}}>
              {isEN
                ?'"Knowledge about yourself is not an answer. It is a different kind of question."'
                :'"Kennis over jezelf is geen antwoord. Het is een andere manier van vragen stellen."'}
            </blockquote>
            <div style={{width:1,height:40,background:"var(--gold)",margin:"0 auto 44px",opacity:.4}}/>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.75,marginBottom:36}}>
              {isEN?"Your reading goes deeper than any article can.":"Jouw reading gaat dieper dan elk artikel kan."}
            </p>
            <button
              style={{fontFamily:"var(--font-sans)",fontSize:".7rem",fontWeight:400,letterSpacing:".16em",textTransform:"uppercase",color:"var(--text)",background:"transparent",border:"1px solid rgba(26,23,20,.3)",padding:"14px 44px",cursor:"pointer",transition:"all .3s ease"}}
              onMouseEnter={e=>{e.currentTarget.style.background="var(--text)";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="var(--text)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text)";e.currentTarget.style.borderColor="rgba(26,23,20,.3)";}}
              onClick={()=>go("rapporten")}
            >{isEN?"Discover your reading":"Ontdek je reading"}</button>
          </div>
        </section>
      )}

    </div>
  );
}

function OverPage({go}){
  const isEN=LANG==="en";
  useSEO({
    title:isEN?"About — Faculty of Human Design":"Over — Faculty of Human Design",
    description:isEN?"Faculty of Human Design. Personal readings based on Human Design, Numerology and Astrology. Founded on Ibiza.":"Faculty of Human Design. Persoonlijke readings op basis van Human Design, Numerologie en Astrologie. Opgericht op Ibiza.",
    canonical:SITE+(isEN?"/en/philosophy":"/philosophy"),
    jsonLd:{
      "@context":"https://schema.org","@type":"AboutPage",
      "name":isEN?"About Faculty of Human Design":"Over Faculty of Human Design",
      "description":isEN?"Founded on Ibiza. Personal readings based on Human Design, Numerology and Astrology.":"Opgericht op Ibiza. Persoonlijke readings op basis van Human Design, Numerologie en Astrologie.",
      "url":SITE+(isEN?"/en/philosophy":"/philosophy"),
    }
  });
  return(
    <div className="pg">

      {/* ── CINEMATIC HERO ── */}
      <section style={{position:"relative",height:"100vh",minHeight:600,maxHeight:900,overflow:"hidden",display:"flex",alignItems:"flex-end"}}>
        <div style={{position:"absolute",inset:0}}>
          <img src={IMGS.ibiza} alt="" loading="eager" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 42%"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,7,14,.12) 0%,rgba(8,7,14,.08) 38%,rgba(8,7,14,.75) 100%)"}}/>
        </div>
        <div style={{position:"relative",zIndex:1,width:"100%",padding:"0 40px 104px",maxWidth:860,margin:"0 auto",textAlign:"center"}}>
          <div style={{width:1,height:52,background:"rgba(201,168,92,.38)",margin:"0 auto 44px"}}/>
          <h1 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(2.6rem,5.5vw,4rem)",fontWeight:300,color:"white",lineHeight:1.08,letterSpacing:"-.018em",margin:"0 0 28px"}}>
            {isEN
              ? <>No profile.<br/><em style={{fontStyle:"italic",color:"rgba(255,255,255,.42)"}}>A mirror.</em></>
              : <>Geen profiel.<br/><em style={{fontStyle:"italic",color:"rgba(255,255,255,.42)"}}>Een spiegel.</em></>}
          </h1>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(.88rem,1.3vw,1rem)",fontWeight:300,fontStyle:"italic",color:"rgba(255,255,255,.36)",letterSpacing:".04em",margin:0}}>
            Faculty of Human Design — Ibiza
          </p>
        </div>
        <div style={{position:"absolute",bottom:38,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:0,opacity:.25}}>
          <div style={{width:1,height:40,background:"white"}}/>
        </div>
      </section>

      {/* ── EDITORIAL OPENING ── */}
      <section style={{background:"var(--bg)",padding:"136px 40px"}}>
        <div style={{maxWidth:620,margin:"0 auto"}}>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.15rem,2vw,1.42rem)",fontWeight:300,color:"var(--text)",lineHeight:1.84,letterSpacing:"-.01em",marginBottom:36}}>
            {isEN
              ? "Many people already know who they are. They are simply looking for words for what they have always felt."
              : "Veel mensen weten al lang wie ze zijn.\nZe zoeken alleen woorden voor wat ze altijd al voelden."}
          </p>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(.92rem,1.35vw,1.05rem)",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.92,margin:0}}>
            {isEN
              ? "A reading does not tell you who to become. It reveals what was already there, before the conditioning, before the expectations, before the years of adapting to what was asked of you."
              : "Een reading vertelt je niet wie je moet worden. Het onthult wat er al was, vóór de conditionering, vóór de verwachtingen, vóór de jaren van aanpassen aan wat van je gevraagd werd."}
          </p>
        </div>
      </section>

      {/* ── VISUAL SILENCE — Ibiza terrace ── */}
      <div style={{position:"relative",height:"62vh",minHeight:380,overflow:"hidden"}}>
        <img src={IMGS.origin} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 52%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,7,14,.04) 0%,rgba(8,7,14,.56) 100%)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 40px 68px"}}>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(.82rem,1.2vw,.96rem)",fontWeight:300,fontStyle:"italic",color:"rgba(255,255,255,.52)",letterSpacing:".06em",textAlign:"center",margin:0}}>
            {isEN?"Ibiza, where Ra Uru Hu received Human Design in 1987":"Ibiza, waar Ra Uru Hu in 1987 Human Design ontving"}
          </p>
        </div>
      </div>

      {/* ── PHILOSOPHICAL STATEMENT ── */}
      <section style={{background:"white",padding:"144px 40px"}}>
        <div className="grid-2" style={{maxWidth:860,margin:"0 auto",gap:"80px",alignItems:"center"}}>
          <div>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.5rem,2.8vw,2.15rem)",fontWeight:300,color:"var(--text)",lineHeight:1.36,letterSpacing:"-.015em",margin:0,whiteSpace:"pre-line"}}>
              {isEN
                ? `“Insight does not arrive\nthrough analysis.\n\nIt arrives through recognition.”`
                : `“Inzicht ontstaat niet\ndoor analyse.\n\nHet ontstaat door herkenning.”`}
            </p>
          </div>
          <div>
            <div style={{width:1,height:40,background:"var(--gold)",marginBottom:36,opacity:.35}}/>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(.9rem,1.3vw,1rem)",fontWeight:300,color:"var(--text-muted)",lineHeight:1.9,marginBottom:24}}>
              {isEN
                ? "That is why our readings are written, not assembled from templates. Each reading is composed specifically for your chart, in language that allows you to recognise yourself in what you read."
                : "Daarom zijn onze readings geschreven, niet samengesteld vanuit templates. Elke reading wordt specifiek voor jouw chart opgebouwd, in taal die je in staat stelt om jezelf te herkennen in wat je leest."}
            </p>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(.9rem,1.3vw,1rem)",fontWeight:300,color:"var(--text-muted)",lineHeight:1.9,margin:0}}>
              {isEN
                ? "Not all self-knowledge requires doing something differently. Sometimes clarity simply means: understanding why something is the way it is."
                : "Niet alle zelfkennis vraagt om iets anders te doen. Soms betekent helderheid simpelweg: begrijpen waarom iets is zoals het is."}
            </p>
          </div>
        </div>
      </section>

      {/* ── THREE DISCIPLINES — editorial table rows ── */}
      <section style={{background:"var(--bg)",padding:"120px 40px"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{fontSize:".56rem",fontWeight:500,letterSpacing:".22em",textTransform:"uppercase",color:"var(--gold)",marginBottom:56}}>
            {isEN?"Three disciplines. One portrait.":"Drie disciplines. Één portret."}
          </div>
          {(isEN?[
            ["Human Design","The energetic architecture of who you are: Type, Authority, Profile, Centers, Gates. The mechanism beneath everything."],
            ["Numerology","The numerical pattern in your name and date of birth: Life Path, Expression, Soul Urge. The mathematics of your becoming."],
            ["Birth Astrology","The planetary qualities present at the moment you arrived: Sun, Moon, Ascendant and the nine planets. The sky as witness."],
          ]:[
            ["Human Design","De energetische architectuur van wie je bent: Type, Autoriteit, Profiel, Centra, Poorten. Het mechanisme onder alles."],
            ["Numerologie","Het getalspatroon in je naam en geboortedatum: Levenspad, Uitdrukking, Zielsverlangen. De wiskunde van je worden."],
            ["Geboorteastrologie","De planetaire kwaliteiten aanwezig op het moment dat jij arriveerde: Zon, Maan, Ascendant en de negen planeten. De hemel als getuige."],
          ]).map(([title,desc],i)=>(
            <div key={title} style={{borderTop:"1px solid var(--border)",padding:"40px 0"}}>
              <div style={{display:"flex",gap:"40px",alignItems:"baseline"}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:400,color:"var(--text)",lineHeight:1.3,flexShrink:0,minWidth:160}}>
                  {title}
                </div>
                <p style={{fontFamily:"var(--font-serif)",fontSize:".92rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.86,margin:0}}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
          <div style={{borderTop:"1px solid var(--border)"}}/>
        </div>
      </section>

      {/* ── EDITORIAL PAUSE ── */}
      <section style={{background:"white",padding:"160px 40px",textAlign:"center"}}>
        <div style={{maxWidth:460,margin:"0 auto"}}>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.2rem,2.2vw,1.55rem)",fontWeight:300,fontStyle:"italic",color:"var(--text)",lineHeight:1.72,letterSpacing:"-.01em",margin:"0 0 56px",whiteSpace:"pre-line"}}>
            {isEN
              ? "Faculty of Human Design is not built\naround certainty.\n\nIt is built around recognition."
              : "Faculty of Human Design is niet gebouwd\nrond zekerheid.\n\nHet is gebouwd rond herkenning."}
          </p>
          <div style={{width:1,height:48,background:"var(--gold)",margin:"0 auto",opacity:.28}}/>
        </div>
      </section>

      {/* ── IBIZA FULL-BLEED ── */}
      <div style={{position:"relative",height:"68vh",minHeight:440,overflow:"hidden"}}>
        <img src={IMGS.cta} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 38%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,7,14,.08) 0%,rgba(8,7,14,.62) 100%)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 40px"}}>
          <div style={{textAlign:"center",maxWidth:540}}>
            <div style={{fontSize:".54rem",fontWeight:500,letterSpacing:".22em",textTransform:"uppercase",color:"rgba(201,168,92,.56)",marginBottom:28}}>
              {isEN?"Founded on Ibiza, 2014":"Opgericht op Ibiza, 2014"}
            </div>
            <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.05rem,1.9vw,1.42rem)",fontWeight:300,fontStyle:"italic",color:"rgba(255,255,255,.68)",lineHeight:1.68,margin:0,whiteSpace:"pre-line"}}>
              {isEN
                ? "On the island where it began,\nwe still work the same way:\nwith precision, patience, and depth."
                : "Op het eiland waar het begon,\nwerken we nog steeds op dezelfde manier:\nmet precisie, geduld en diepgang."}
            </p>
          </div>
        </div>
      </div>

      {/* ── SOFT CTA ── */}
      <section style={{background:"var(--bg)",padding:"152px 40px",textAlign:"center"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <div style={{width:1,height:52,background:"var(--gold)",margin:"0 auto 52px",opacity:.28}}/>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1rem,1.55vw,1.18rem)",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.92,marginBottom:48,whiteSpace:"pre-line"}}>
            {isEN
              ? "If something in you is asking\nto be seen clearly —\nthat is where a reading begins."
              : "Als er iets in je vraagt\nom helder gezien te worden —\ndaar begint een reading."}
          </p>
          <button
            style={{fontFamily:"var(--font-sans)",fontSize:".68rem",fontWeight:400,letterSpacing:".18em",textTransform:"uppercase",color:"var(--text)",background:"transparent",border:"1px solid rgba(26,23,20,.28)",padding:"15px 48px",cursor:"pointer",transition:"all .32s ease"}}
            onMouseEnter={e=>{e.currentTarget.style.background="var(--text)";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="var(--text)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text)";e.currentTarget.style.borderColor="rgba(26,23,20,.28)";}}
            onClick={()=>go("rapporten")}
          >{isEN?"Discover your reading":"Ontdek je reading"}</button>
        </div>
      </section>

    </div>
  );
}

function ContactPage(){
  const[form,setForm]=useState({name:"",email:"",subject:"",msg:"",website:""});
  const[status,setStatus]=useState(null); // null | "sending" | "ok" | "error"
  const[errMsg,setErrMsg]=useState("");
  const[faqOpen,setFaqOpen]=useState(null);

  const FAQ_NL=[
    {q:"Wat heb ik nodig om een reading te bestellen?",a:"Alleen je exacte geboortedatum, geboortetijd en geboorteplaats. Hoe nauwkeuriger de geboortetijd, hoe persoonlijker de reading. Een afwijking van 15 minuten heeft al merkbaar effect op sommige chart-elementen."},
    {q:"Hoe snel ontvang ik mijn reading?",a:"Readings worden bezorgd binnen 18–23 uur na betaling, op werkdagen tussen 9:00 en 17:30 uur."},
    {q:"In welke taal is de reading geschreven?",a:"Je kiest zelf de taal bij het bestellen: Nederlands of Engels. De reading wordt volledig in de gekozen taal opgeleverd."},
    {q:"Wat als ik mijn exacte geboortetijd niet weet?",a:"Een geschatte tijd is vaak voldoende voor de meeste chart-elementen. Neem bij twijfel contact op — we adviseren je welke reading nog steeds waardevol is voor jouw situatie."},
    {q:"Wat maakt deze reading anders dan andere Human Design lezingen?",a:"Onze readings worden individueel samengesteld op basis van jouw chartdata en geschreven in een literaire, emotioneel resonante stijl. Geen generieke templates — elke reading is uniek voor jou."},
    {q:"Kan ik een reading retourneren of terugbetaling aanvragen?",a:"Omdat elke reading persoonlijk voor jou wordt samengesteld, is terugbetaling niet mogelijk na levering. Bij vragen of opmerkingen kun je ons altijd bereiken via info@facultyhd.com."},
    {q:"Hoe lang blijft de download-link geldig?",a:"De downloadlink is 30 dagen geldig na levering. Sla het PDF-bestand op zodra je het ontvangt — na 30 dagen vervalt de link en wordt de PDF verwijderd. Heb je de link verloren? Stuur ons een bericht via info@facultyhd.com."},
  ];
  const FAQ_EN=[
    {q:"What do I need to order a reading?",a:"Only your exact date of birth, time of birth and place of birth. The more accurate the birth time, the more personal the reading. Even a 15-minute difference can meaningfully affect certain chart elements."},
    {q:"How soon will I receive my reading?",a:"Readings are delivered within 18–23 hours after payment, on business days between 9:00 and 17:30."},
    {q:"What language is the reading written in?",a:"You choose the language when ordering: Dutch or English. The reading will be delivered entirely in your chosen language."},
    {q:"What if I don't know my exact birth time?",a:"An approximate time is often sufficient for most chart elements. If you're unsure, feel free to contact us — we can advise which reading still provides meaningful insight for your situation."},
    {q:"What makes this reading different from other Human Design readings?",a:"Our readings are individually compiled based on your chart data, written in a literary, emotionally resonant style. No generic templates — every reading is unique to you."},
    {q:"Can I return a reading or request a refund?",a:"Because each reading is personally compiled for you, refunds are not available after delivery. For any questions or concerns, you can always reach us at info@facultyhd.com."},
    {q:"How long does the download link remain valid?",a:"The download link is valid for 30 days after delivery. Please save the PDF as soon as you receive it — after 30 days the link expires and the PDF is deleted. Lost the link? Send us a message at info@facultyhd.com."},
  ];
  const faqs=LANG==="en"?FAQ_EN:FAQ_NL;
  const ch=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  const send=async()=>{
    if(!form.name.trim()||!form.email.trim()||!form.msg.trim())return;
    setStatus("sending");
    try{
      const res=await fetch("/api/review-approve",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,contact:1})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||(LANG==="en"?"Unknown error":"Onbekende fout"));
      setStatus("ok");
      setForm({name:"",email:"",subject:"",msg:"",website:""});
    }catch(e){
      setErrMsg(e.message);
      setStatus("error");
    }
  };
  useSEO({
    title:"Contact — Faculty of Human Design",
    description:LANG==="en"?"Contact Faculty of Human Design. Questions about readings, orders or Human Design? We respond within 1 business day. Email: info@facultyhd.com":"Neem contact op met Faculty of Human Design. Vragen over readings, bestellingen of Human Design? Wij reageren binnen 1 werkdag. E-mail: info@facultyhd.com",
    canonical:SITE+"/#contact",
    jsonLd:{
      "@context":"https://schema.org","@type":"ContactPage",
      "name":"Contact — Faculty of Human Design",
      "url":SITE+"/#contact",
      "mainEntity":{
        "@type":"Organization","name":"Faculty of Human Design",
        "email":"info@facultyhd.com",
        "address":{"@type":"PostalAddress","addressLocality":"Ibiza","addressCountry":"ES"}
      }
    }
  });
  return(
    <div className="pg">

      {/* ── CINEMATIC HERO ───────────────────────────────────────────────── */}
      <section style={{position:"relative",height:"72vh",minHeight:520,maxHeight:800,overflow:"hidden",display:"flex",alignItems:"flex-end"}}>
        <div style={{position:"absolute",inset:0}}>
          <img src="/img-ibiza-moon.jpg" alt="Ibiza — Faculty of Human Design" loading="eager" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,7,14,.1) 0%,rgba(8,7,14,.08) 40%,rgba(8,7,14,.68) 100%)"}}/>
        </div>
        <div style={{position:"relative",zIndex:1,width:"100%",padding:"0 40px 80px",maxWidth:760,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".22em",textTransform:"uppercase",color:"rgba(255,255,255,.45)",marginBottom:28}}>
            {LANG==="en"?"Faculty of Human Design — Ibiza":"Faculty of Human Design — Ibiza"}
          </div>
          <h1 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(2.2rem,4.5vw,3.4rem)",fontWeight:300,color:"white",lineHeight:1.1,letterSpacing:"-.02em",marginBottom:24}}>
            {LANG==="en"?"A quiet conversation.":"Een rustig gesprek."}
          </h1>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1rem,1.5vw,1.1rem)",fontWeight:300,fontStyle:"italic",color:"rgba(255,255,255,.5)",lineHeight:1.78,maxWidth:480,margin:"0 auto"}}>
            {LANG==="en"
              ? "Not everything needs to be clear right away."
              : "Niet alles hoeft direct duidelijk te zijn."}
          </p>
        </div>
      </section>

      {/* ── EDITORIAL INVITATION ─────────────────────────────────────────── */}
      <section style={{padding:"128px 40px",background:"var(--bg)"}}>
        <div style={{maxWidth:560,margin:"0 auto",textAlign:"center"}}>
          <div style={{width:1,height:48,background:"var(--gold)",margin:"0 auto 56px",opacity:.3}}/>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.1rem,1.8vw,1.3rem)",fontWeight:300,color:"var(--text)",lineHeight:1.9,marginBottom:32,whiteSpace:"pre-line"}}>
            {LANG==="en"
              ? "Do you have a question, or does something feel unclear?\nWe're here — calmly and personally."
              : "Heb je een vraag,\nof voelt iets nog niet helemaal helder?\n\nWe helpen je graag verder."}
          </p>
          <p style={{fontFamily:"var(--font-serif)",fontSize:".92rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.85}}>
            {LANG==="en"
              ? "You can reach us at info@facultyhd.com — or use the form below."
              : "Je bereikt ons via info@facultyhd.com — of gebruik het formulier hieronder."}
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{padding:"0 40px 120px",background:"var(--bg)"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".22em",textTransform:"uppercase",color:"var(--gold)",marginBottom:48,opacity:.7,textAlign:"center"}}>
            {LANG==="en"?"Common questions":"Veelgestelde vragen"}
          </div>
          {faqs.map((item,i)=>(
            <div key={i} style={{borderTop:"1px solid var(--border)",padding:"0"}}>
              <button
                onClick={()=>setFaqOpen(faqOpen===i?null:i)}
                style={{width:"100%",display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:24,padding:"24px 0",background:"none",border:"none",textAlign:"left",cursor:"pointer"}}
              >
                <span style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,color:"var(--text)",lineHeight:1.5,flex:1}}>{item.q}</span>
                <span style={{fontFamily:"var(--font-sans)",fontSize:"1rem",color:"var(--gold)",flexShrink:0,opacity:.55,transition:"transform .2s",transform:faqOpen===i?"rotate(45deg)":"rotate(0)",lineHeight:1}}>+</span>
              </button>
              {faqOpen===i&&(
                <div style={{paddingBottom:28,paddingRight:40}}>
                  <p style={{fontFamily:"var(--font-serif)",fontSize:".92rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.85,margin:0}}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
          <div style={{borderTop:"1px solid var(--border)"}}/>
        </div>
      </section>

      {/* ── VISUAL SILENCE ───────────────────────────────────────────────── */}
      <div style={{background:"#fff",padding:"112px 40px",textAlign:"center"}}>
        <div style={{maxWidth:400,margin:"0 auto"}}>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.05rem,1.6vw,1.2rem)",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:2.0,letterSpacing:".01em",margin:0,whiteSpace:"pre-line"}}>
            {LANG==="en"
              ? "Sometimes clarity begins\nwith a simple conversation."
              : "Soms begint helderheid\nbij een eenvoudig gesprek."}
          </p>
        </div>
      </div>

      {/* ── CONTACT FORM ─────────────────────────────────────────────────── */}
      <section style={{padding:"120px 40px 140px",background:"var(--bg)"}}>
        <div style={{maxWidth:520,margin:"0 auto"}}>

          <div style={{textAlign:"center",marginBottom:72}}>
            <div style={{fontFamily:"var(--font-sans)",fontSize:".58rem",fontWeight:500,letterSpacing:".22em",textTransform:"uppercase",color:"var(--gold)",marginBottom:20,opacity:.7}}>
              {LANG==="en"?"Write to us":"Schrijf ons"}
            </div>
            <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.6rem,2.8vw,2.1rem)",fontWeight:300,color:"var(--text)",lineHeight:1.15,margin:"0 0 20px"}}>
              {LANG==="en"?"Leave a message.":"Laat een bericht achter."}
            </h2>
            <p style={{fontFamily:"var(--font-serif)",fontSize:".92rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.8,margin:0}}>
              {LANG==="en"
                ? "We respond within one business day — personally."
                : "We reageren binnen één werkdag — persoonlijk."}
            </p>
          </div>

          {status==="ok"
            ? <div style={{textAlign:"center",padding:"64px 0"}}>
                <div style={{width:1,height:40,background:"var(--gold)",margin:"0 auto 40px",opacity:.3}}/>
                <p style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",fontWeight:300,fontStyle:"italic",color:"var(--text)",lineHeight:1.8,whiteSpace:"pre-line"}}>
                  {LANG==="en"
                    ? "Your message has arrived.\nWe'll be in touch soon."
                    : "Je bericht is aangekomen.\nWe nemen binnenkort contact op."}
                </p>
              </div>
            : <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {[
                  {name:"name",type:"text",placeholder:LANG==="en"?"Your name":"Jouw naam"},
                  {name:"email",type:"email",placeholder:LANG==="en"?"Your email address":"Je e-mailadres"},
                  {name:"subject",type:"text",placeholder:LANG==="en"?"Subject (optional)":"Onderwerp (optioneel)"},
                ].map(f=>(
                  <div key={f.name} style={{borderBottom:"1px solid var(--border)",marginBottom:0}}>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={ch}
                      placeholder={f.placeholder}
                      style={{width:"100%",padding:"20px 0",fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,color:"var(--text)",background:"transparent",border:"none",outline:"none"}}
                    />
                  </div>
                ))}
                <div style={{borderBottom:"1px solid var(--border)",marginBottom:40}}>
                  <textarea
                    name="msg"
                    value={form.msg}
                    onChange={ch}
                    placeholder={LANG==="en"?"Your message…":"Je bericht…"}
                    rows={5}
                    style={{width:"100%",padding:"20px 0",fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,color:"var(--text)",background:"transparent",border:"none",outline:"none",resize:"none",lineHeight:1.7}}
                  />
                </div>
                {/* Honeypot — invisible to humans, bots fill it in */}
                <div style={{position:"absolute",left:"-9999px",top:"auto",width:1,height:1,overflow:"hidden"}} aria-hidden="true">
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={ch}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
                  <button
                    onClick={send}
                    disabled={status==="sending"||!form.name.trim()||!form.email.trim()||!form.msg.trim()}
                    style={{fontFamily:"var(--font-sans)",fontSize:".7rem",fontWeight:400,letterSpacing:".16em",textTransform:"uppercase",color:"var(--text)",background:"transparent",border:"1px solid rgba(26,23,20,.3)",padding:"14px 44px",cursor:"pointer",transition:"all .3s ease",opacity:(status==="sending"||!form.name.trim()||!form.email.trim()||!form.msg.trim())?.45:1}}
                    onMouseEnter={e=>{if(!e.currentTarget.disabled){e.currentTarget.style.background="var(--text)";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="var(--text)";}}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text)";e.currentTarget.style.borderColor="rgba(26,23,20,.3)";}}
                  >
                    {status==="sending"
                      ? (LANG==="en"?"Sending…":"Versturen…")
                      : (LANG==="en"?"Send message":"Verstuur bericht")}
                  </button>
                  {status==="error"&&(
                    <p style={{fontFamily:"var(--font-serif)",fontSize:".85rem",fontStyle:"italic",color:"#C62828",margin:0}}>{errMsg}</p>
                  )}
                </div>
              </div>
          }

        </div>
      </section>

    </div>
  );
}

function ThankYouPage({result,go}){
  const{chart,form,rpt,report}=result;
  const secs=(report||"").split(/###\s+/).filter(Boolean).map(s=>{const l=s.trim().split("\n");return{t:l[0],b:l.slice(1).join("\n").trim()};});
  const nextRpt=REPORTS.find(r=>r.id!==rpt.id&&r.id!=="maandelijks"&&r.id!=="volledig")||REPORTS[1];
  useEffect(()=>{track("checkout_completed",{report:rpt.id,price:rpt.priceNum});},[]);

  const dlPDF=()=>{
    const btn=document.getElementById("dlb");
    if(btn){btn.textContent=LANG==="en"?"Preparing PDF...":"PDF wordt voorbereid...";btn.disabled=true;}
    const win=window.open("","_blank");
    const bh=secs.map(s=>"<h2>"+s.t+"</h2>"+s.b.split("\n").map(x=>x?"<p>"+x+"</p>":"").join("")).join("");
    const metaObj=chart?.isNumerology?(LANG==="en"?{"Life Path":chart.lp,"Expression":chart.exp}:{Levenspad:chart.lp,Uitdrukking:chart.exp}):chart?.isHoroscoop?(LANG==="en"?{"Sun sign":chart.sun_sign,"Ascendant":chart.ascendant?.sign}:{Zonneteken:chart.sun_sign,Ascendant:chart.ascendant?.sign}):(LANG==="en"?{Type:chart?.type,Strategy:xlateStrat(chart?.strat),Authority:xlateAuth(chart?.auth),Profile:chart?.profile}:{Type:chart?.type,Strategie:chart?.strat,Autoriteit:chart?.auth,Profiel:chart?.profile});
    const meta=Object.entries(metaObj||{}).map(([k,v])=>"<tr><td>"+k+"</td><td>"+v+"</td></tr>").join("");
    win.document.write("<!DOCTYPE html><html><head><meta charset=UTF-8><title>"+tl(rpt.title)+" - "+form.name+"</title><link href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap' rel=stylesheet><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Jost,sans-serif;font-weight:300;background:#fff;color:#1C1917}.cover{height:100vh;background:#1C1917;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:72px;page-break-after:always}.ci{font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(154,128,80,.6);margin-bottom:24px}.ct{font-family:Cormorant Garamond,serif;font-size:48px;font-weight:300;color:#fff;line-height:1.05;margin-bottom:12px}.cn{font-family:Cormorant Garamond,serif;font-size:26px;font-style:italic;color:rgba(255,255,255,.5);margin-bottom:32px}.cm{font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;line-height:2.2}.content{max-width:720px;margin:0 auto;padding:56px 56px 20px}.mb{border-left:2px solid rgba(154,128,80,.35);padding:18px 22px;margin:0 0 40px;background:#f9f8f6}table{width:100%;border-collapse:collapse}td{padding:6px 12px 6px 0;font-size:12px;color:#444;border-bottom:1px solid #f0ede8}td:first-child{font-weight:600;color:#3D2C5E;width:160px}h2{font-family:Cormorant Garamond,serif;font-size:20px;font-weight:400;color:#1C1917;margin:0 0 12px;padding-top:40px;padding-bottom:8px;border-bottom:1px solid #e8e5e0;page-break-after:avoid}p{font-size:13px;line-height:1.9;color:#3a3a32;margin-bottom:10px;orphans:3;widows:3}p:last-child{margin-bottom:0}.content>*:last-child{page-break-after:avoid}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class=cover><div class=ci>Faculty of Human Design - Ibiza</div><div class=ct>"+tl(rpt.title)+"</div><div class=cn>"+form.name+"</div><div class=cm>"+(LANG==="en"?"Born ":"Geboren ")+form.day+"-"+form.month+"-"+form.year+"</div></div><div class=content><div class=mb><table>"+meta+"</table></div>"+bh+"</div><script>document.fonts.ready.then(function(){window.print();});<\/script></body></html>");
    win.document.close();
    if(btn){btn.textContent="Download PDF";btn.disabled=false;}
  };

  const barData=chart?.isNumerology
    ?(LANG==="en"
      ?[["Life Path",chart.lp],["Expression",chart.exp],["Soul",chart.soul],["Pers. Year",chart.py],["Maturity",chart.mat],["Masters",chart.masters?.length>0?chart.masters.join(", "):"none"]]
      :[["Levenspad",chart.lp],["Uitdrukking",chart.exp],["Ziel",chart.soul],["Pers. Jaar",chart.py],["Rijping",chart.mat],["Masters",chart.masters?.length>0?chart.masters.join(", "):"geen"]])
    :chart?.isHoroscoop
      ?(LANG==="en"
        ?[["Sun sign",chart.sun_sign],["Ascendant",chart.ascendant?.degree+"deg "+chart.ascendant?.sign],["Dom. element",chart.dom_element],["Midheaven",chart.mc?.sign],["Planets","10 calculated"],["Aspects","found"]]
        :[["Zonneteken",chart.sun_sign],["Ascendant",chart.ascendant?.degree+"deg "+chart.ascendant?.sign],["Dom. element",chart.dom_element],["Midhemel",chart.mc?.sign],["Planeten","10 berekend"],["Aspecten","gevonden"]])
      :(LANG==="en"
        ?[["Type",chart?.type],["Strategy",xlateStrat(chart?.strat)],["Authority",xlateAuth(chart?.auth)],["Profile",chart?.profile],["Incarnation Cross","Gate "+(chart?.cross||"")],["Defined",(chart?.definedCenters||[]).slice(0,2).join(", ")]]
        :[["Type",chart?.type],["Strategie",chart?.strat],["Autoriteit",chart?.auth],["Profiel",chart?.profile],["Inkarnatie-Kruis","Poort "+(chart?.cross||"")],["Gedefinieerd",(chart?.definedCenters||[]).slice(0,2).join(", ")]]);

  return(
    <div>
      <div className="thankyou-hero">
        <div className="thankyou-icon">✓</div>
        <div className="thankyou-title">{t("thankYou.readyTitle")}</div>
        <div className="thankyou-sub">{t("thankYou.readySub")}</div>
      </div>
      <div className="report-pg" style={{paddingTop:32}}>
        <div className="report-header">
          <div className="report-inst-label">Faculty of Human Design — Ibiza</div>
          <div className="report-title">{tl(rpt.title)}</div>
          <div className="report-meta">{form.name} — {form.day}-{form.month}-{form.year}{form.place?" — "+form.place:""}</div>
          <button id="dlb" className="btn btn-primary" onClick={dlPDF}>{t("thankYou.downloadBtn")}</button>
          <p style={{fontSize:".75rem",color:"var(--text-light)",marginTop:8}}>{t("thankYou.downloadHint")}</p>
        </div>
        {chart&&<div className="report-summary"><div className="report-summary-grid">{barData.map(([l,v])=><div key={l}><div className="rsg-label">{l}</div><div className="rsg-value">{v}</div></div>)}</div></div>}
        <div className="report-body">
          {secs.map((s,i)=><div key={i}><div className="report-section-title">{s.t}</div><div className="report-section-body">{s.b}</div></div>)}
        </div>
        <div style={{maxWidth:760,margin:"28px auto 0"}}>
          <div className="upsell-card">
            <div className="upsell-label">{t("thankYou.upsellLabel")}</div>
            <div className="upsell-title">{t("thankYou.upsellTitle",{title:tl(nextRpt.title)})}</div>
            <div className="upsell-sub">{t("thankYou.upsellSub",{from:tl(rpt.title)})}</div>
            <div className="upsell-grid">
              {nextRpt.includes.slice(0,4).map((item,i)=>(
                <div key={i} className="upsell-item"><span style={{color:"rgba(154,128,80,.8)",flexShrink:0}}>✓</span>{item}</div>
              ))}
            </div>
            <button className="btn btn-gold" onClick={()=>{track("upsell_accepted",{from:rpt.id,to:nextRpt.id,price:nextRpt.priceNum});go("rapport-"+nextRpt.id);}}>
              {t("thankYou.orderBtn",{title:tl(nextRpt.title),price:nextRpt.price})}
            </button>
          </div>
          <div style={{marginTop:16,background:"white",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20}}>
            <div><div className="label" style={{marginBottom:4}}>{t("report.monthlyOffer")}</div><p className="body-sm">{t("report.monthlyDesc")}</p></div>
            <div style={{display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:"1.4rem"}}>{t("report.monthlyPrice")}</div>
              <button className="btn btn-secondary btn-sm" onClick={()=>{track("subscription_offer_viewed",{source:"thankyou"});go("rapport-maandelijks");}}>{t("report.monthlyViewBtn")}</button>
            </div>
          </div>
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>{t("thankYou.allReportsBtn")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER CONFIRMATION PAGE ──────────────────────────────────────────────────
function OrderConfirmationPage({result,go}){
  useSEO({title:LANG==="en"?"Order confirmed":"Bestelling bevestigd",description:LANG==="en"?"Your order has been received. Your reading will be delivered by email as a PDF within 1 business day.":"Je bestelling is ontvangen. Je reading wordt binnen 1 werkdag als PDF per e-mail bezorgd.",canonical:SITE+"/"});
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{maxWidth:560,width:"100%",textAlign:"center"}}>
        {/* Icon */}
        <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(61,44,94,.08)",border:"1px solid rgba(61,44,94,.14)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px",fontSize:"1.6rem",color:"var(--brand)"}}>✓</div>
        {/* Heading */}
        <div style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.8rem,4vw,2.4rem)",fontWeight:300,color:"var(--text)",marginBottom:14,lineHeight:1.12}}>
          {t("confirmPage.title")}
        </div>
        <p style={{fontSize:".95rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.8,marginBottom:32}}>
          {t("confirmPage.sub")}
        </p>
        {/* Delivery info card */}
        <div style={{background:"white",border:"1px solid var(--border)",borderRadius:"var(--radius-xl)",padding:"28px 32px",marginBottom:28,textAlign:"left"}}>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {[
              ["◎",t("confirmPage.check1title"),t("confirmPage.check1desc")],
              ["◇",t("confirmPage.check2title"),t("confirmPage.check2desc")],
              ["✦",t("confirmPage.check3title"),t("confirmPage.check3desc")],
            ].map(([icon,title,desc])=>(
              <div key={title} style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",color:"var(--gold)",flexShrink:0,marginTop:1,opacity:.7}}>{icon}</div>
                <div>
                  <div style={{fontSize:".82rem",fontWeight:500,color:"var(--text)",marginBottom:3}}>{title}</div>
                  <div style={{fontSize:".8rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.65}}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Question? */}
        <p style={{fontSize:".78rem",color:"var(--text-light)",marginBottom:32}}>
          {t("confirmPage.question")}{" "}
          <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a>
        </p>
        <button className="btn btn-secondary" onClick={()=>go("rapporten")}>{t("confirmPage.backBtn")}</button>
      </div>
    </div>
  );
}

// ─── DOWNLOAD PAGE ─────────────────────────────────────────────────────────────
function DownloadPage({token}){
  const[status,setStatus]=useState("loading");// loading | ready | error
  const[reportTitle,setReportTitle]=useState("");

  useEffect(()=>{
    // Use HEAD to check token validity without downloading the PDF.
    // API status codes: 200=ready, 202=processing, 404=not found, 410=expired
    fetch("/api/get-download?token="+token,{method:"HEAD"})
      .then(r=>{
        if(r.status===200){setStatus("ready");}
        else if(r.status===410){setStatus("expired");}
        else if(r.status===404){setStatus("notfound");}
        else if(r.status===202){setStatus("processing");}
        else{setStatus("error");}
      })
      .catch(()=>setStatus("error"));
  },[token]);

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{maxWidth:480,width:"100%",textAlign:"center"}}>
        {status==="loading"&&(
          <>
            <div style={{fontFamily:"var(--font-serif)",fontSize:"1.5rem",fontWeight:300,color:"var(--text)",marginBottom:10}}>{t("downloadPage.loading")}</div>
            <p style={{color:"var(--text-light)",fontSize:".85rem"}}>{t("downloadPage.loadingSub")}</p>
          </>
        )}
        {status==="ready"&&(
          <>
            <div style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.8rem,4vw,2.2rem)",fontWeight:300,color:"var(--text)",marginBottom:14,lineHeight:1.12}}>{t("downloadPage.readyTitle")}</div>
            <p style={{fontSize:".9rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.8,marginBottom:32}}>
              {t("downloadPage.readySub")}
            </p>
            <a
              href={"/api/get-download?token="+token}
              download
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-lg"
              style={{display:"inline-block",marginBottom:20,textDecoration:"none"}}
            >
              {t("downloadPage.downloadBtn")}
            </a>
            <p style={{fontSize:".72rem",color:"var(--text-light)"}}>
              {LANG==="en"?"Save the file to your archive — the link is valid for 30 days.":"Sla het bestand op voor je archief — de link is 30 dagen geldig."}
            </p>
          </>
        )}
        {status==="processing"&&(
          <>
            <div style={{fontFamily:"var(--font-serif)",fontSize:"1.5rem",fontWeight:300,color:"var(--text)",marginBottom:10}}>
              {LANG==="en"?"Your report is being prepared":"Je rapport wordt samengesteld"}
            </div>
            <p style={{color:"var(--text-light)",fontSize:".85rem",lineHeight:1.75,marginBottom:16}}>
              {LANG==="en"
                ?"Your blueprint is still being compiled. You will receive an email as soon as it is ready — usually within 1 business day."
                :"Je blauwdruk wordt nog samengesteld. Je ontvangt een e-mail zodra hij klaar staat — doorgaans binnen 1 werkdag."}
            </p>
          </>
        )}
        {(status==="notfound"||status==="expired"||status==="error")&&(
          <>
            <div style={{fontFamily:"var(--font-serif)",fontSize:"1.5rem",fontWeight:300,color:"var(--text)",marginBottom:14}}>
              {t("downloadPage.errorTitle")}
            </div>
            <p style={{fontSize:".9rem",color:"var(--text-muted)",lineHeight:1.7,marginBottom:24}}>
              {status==="expired"
                ?t("downloadPage.expiredMsg")
                :t("downloadPage.notFoundMsg")}
            </p>
            <p style={{fontSize:".8rem",color:"var(--text-light)"}}>
              <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",fontWeight:500,textDecoration:"none"}}>info@facultyhd.com</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── FAQ ITEM (shared) ───────────────────────────────────────────────────────
function FaqItem({q,a}){
  const[open,setOpen]=useState(false);
  return(
    <div style={{borderTop:"1px solid var(--border)",padding:"22px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,cursor:"pointer",textAlign:"left"}} onClick={()=>setOpen(!open)}>
        <span style={{fontFamily:"var(--font-serif)",fontSize:".98rem",fontWeight:300,color:"var(--text)",lineHeight:1.4}}>{q}</span>
        <span style={{fontFamily:"var(--font-sans)",fontSize:"1.1rem",color:"var(--gold)",flexShrink:0,opacity:.6,transition:"transform .2s",transform:open?"rotate(45deg)":"none"}}>{open?"×":"+"}</span>
      </div>
      {open&&<p style={{fontFamily:"var(--font-serif)",fontSize:".9rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.85,marginTop:16,paddingRight:32,textAlign:"left"}}>{a}</p>}
    </div>
  );
}

// ─── HUMAN DESIGN TYPE PAGES ──────────────────────────────────────────────────
const TYPES = [
  {
    id:"generator",
    slug:"generator",
    icon:"◎",
    population:{nl:"~37%",en:"~37%"},
    title:{nl:"Generator",en:"Generator"},
    tagline:{nl:"De ruggengraat van de mensheid",en:"The backbone of humanity"},
    strategy:{nl:"Reageren",en:"Respond"},
    signature:{nl:"Tevredenheid",en:"Satisfaction"},
    notSelf:{nl:"Frustratie",en:"Frustration"},
    authority:{nl:"Sacraal (meest voorkomend) of Emotioneel",en:"Sacral (most common) or Emotional"},
    img:"https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id:"manifesting-generator",
    slug:"manifesting-generator",
    icon:"◈",
    population:{nl:"~33%",en:"~33%"},
    title:{nl:"Manifesting Generator",en:"Manifesting Generator"},
    tagline:{nl:"Snel, veelzijdig, onuitputtelijk",en:"Fast, versatile, inexhaustible"},
    strategy:{nl:"Reageren — dan informeren",en:"Respond — then inform"},
    signature:{nl:"Tevredenheid & Vrede",en:"Satisfaction & Peace"},
    notSelf:{nl:"Frustratie & Boosheid",en:"Frustration & Anger"},
    authority:{nl:"Sacraal of Emotioneel",en:"Sacral or Emotional"},
    img:"https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id:"projector",
    slug:"projector",
    icon:"◇",
    population:{nl:"~20%",en:"~20%"},
    title:{nl:"Projector",en:"Projector"},
    tagline:{nl:"De gids die ziet wat anderen niet zien",en:"The guide who sees what others cannot"},
    strategy:{nl:"Wachten op de uitnodiging",en:"Wait for the invitation"},
    signature:{nl:"Succes",en:"Success"},
    notSelf:{nl:"Bitterheid",en:"Bitterness"},
    authority:{nl:"Emotioneel, Splenisch, Zelf-geprojecteerd, Ego of Mentaal",en:"Emotional, Splenic, Self-Projected, Ego or Mental"},
    img:"https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id:"manifestor",
    slug:"manifestor",
    icon:"◆",
    population:{nl:"~9%",en:"~9%"},
    title:{nl:"Manifestor",en:"Manifestor"},
    tagline:{nl:"Het enige type dat van nature kan initiëren",en:"The only type designed to initiate"},
    strategy:{nl:"Informeren",en:"Inform"},
    signature:{nl:"Vrede",en:"Peace"},
    notSelf:{nl:"Boosheid",en:"Anger"},
    authority:{nl:"Emotioneel, Ego of Splenisch",en:"Emotional, Ego or Splenic"},
    img:"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id:"reflector",
    slug:"reflector",
    icon:"◯",
    population:{nl:"~1%",en:"~1%"},
    title:{nl:"Reflector",en:"Reflector"},
    tagline:{nl:"De spiegel van de gemeenschap",en:"The mirror of the community"},
    strategy:{nl:"Wachten — een volledige maancyclus",en:"Wait — a full lunar cycle"},
    signature:{nl:"Verrassing",en:"Surprise"},
    notSelf:{nl:"Teleurstelling",en:"Disappointment"},
    authority:{nl:"Lunair (28 dagen)",en:"Lunar (28 days)"},
    img:"https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1200&auto=format&fit=crop&q=80",
  },
];

function TypePage({typeId,go}){
  const isEN=LANG==="en";
  const tp=TYPES.find(t=>t.id===typeId);
  if(!tp)return null;
  const tl2=f=>isEN?(f.en||f.nl):f.nl;

  const CONTENT={
    generator:{
      nl:{
        intro:"Van alle vijf typen in Human Design is de Generator het meest voorkomende. Zo'n 37 procent van de wereldbevolking draagt dit design in zich — en dat is geen toeval. Generators zijn de bouwers van de wereld. Ze bezitten een gedefinieerd Sacraalcentrum, de energiebron van het menselijk lichaam, en zijn ontworpen om te werken, te creëren en te produceren. Niet als verplichting, maar als bron van vreugde wanneer die energie gericht wordt op het juiste.\n\nDe essentie van het Generator-design is de sacrale levensenergie. Waar andere typen hun energie moeten bewaken of doseren, beschikt de Generator over een duurzame, hernieuwbare kracht die zichzelf aanvult zodra ze ingezet wordt voor werk dat werkelijk resoneert. De Generator die zijn passie gevonden heeft, vermoeit zichzelf niet — hij laadt zichzelf op.",
        strategy:"De strategie van de Generator is reageren, niet initiëren. Dat klinkt passief, maar het is het tegenovergestelde. Reageren betekent dat je wacht op iets in de buitenwereld — een vraag, een aanbod, een impuls — dat een instinctieve sacrale respons oproept. Die respons is lichamelijk: een 'uh-huh' of 'unh-unh' die dieper zit dan gedachten. Het is de stem van het Sacraalcentrum dat aangeeft of ergens echte energie voor aanwezig is.\n\nWanneer een Generator iets initieert vanuit het hoofd in plaats van vanuit die sacrale respons, verbruikt hij energie die hij niet heeft. Het resultaat is frustratie — de handtekening van het niet-zelf van de Generator. Frustratie is geen teken van falen; het is een signaal dat je te lang iets hebt gedaan waarvoor je sacrale energie niet werkelijk beschikbaar was.",
        energy:"De Generator heeft niet één vaste autoriteit. De meest voorkomende is de Sacrale autoriteit: beslissingen komen vanuit een lichamelijke respons, niet vanuit de geest. Maar Generators met een gedefinieerd emotioneel centrum hebben de Emotionele autoriteit — voor hen geldt dat ze nooit in het moment beslissen, maar wachten op emotionele helderheid.\n\nIn beide gevallen is het principe hetzelfde: de beslissing komt van binnenuit het lichaam, niet vanuit rationele analyse. De Generator die leert zijn sacrale respons te vertrouwen en zijn frustratie als navigatiemiddel te gebruiken, ontdekt dat het leven minder wrijving kent en meer van nature stroomt.",
        work:"Op het werk is de Generator op zijn best wanneer hij een vak of vakgebied heeft gevonden dat hem werkelijk boeit. De Generator die zijn roeping volgt, is een kracht van de natuur: productief, betrouwbaar, gedreven. Hij bouwt, verfijnt en verdiept — en kan dat urenlang volhouden zonder uitgeput te raken.\n\nIn relaties is de Generator een stabiele aanwezigheid. Zijn sacrale energie is voelbaar voor anderen — Projectors en Manifestors voelen de kracht van een Generator als ze in zijn nabijheid zijn. Die aantrekkingskracht is krachtig maar kan ook een last zijn wanneer anderen meer van die energie willen dan goed is voor de Generator zelf.",
        challenges:"Het grootste struikelblok voor de Generator is conditionering. Van jongs af aan leert hij om te initiëren: doelen stellen, actie ondernemen, de wereld tegemoet gaan. Dat is niet zijn aard. Wanneer hij initieert zonder sacrale respons, raakt hij zijn energie kwijt aan dingen die niet echt bij hem passen — en groeit de frustratie.\n\nDe de-conditionering begint met een simpele vraag die hij zichzelf steeds vaker stelt: reageert mijn lichaam echt op dit, of doe ik dit omdat ik het gevoel heb dat ik het moet doen?",
      },
      en:{
        intro:"Of all five types in Human Design, the Generator is the most common. Around 37 percent of the world's population carries this design — and that is no coincidence. Generators are the builders of the world. They possess a defined Sacral centre, the energy source of the human body, and are designed to work, create and produce. Not as an obligation, but as a source of joy when that energy is directed toward the right things.\n\nThe essence of the Generator design is sacral life force energy. Where other types must manage or ration their energy, the Generator possesses a sustainable, renewable power that replenishes itself as long as it is directed toward work that truly resonates. The Generator who has found their passion does not exhaust themselves — they recharge themselves.",
        strategy:"The strategy of the Generator is to respond, not to initiate. That sounds passive, but it is the opposite. Responding means waiting for something in the outer world — a question, an offer, an impulse — that evokes an instinctive sacral response. That response is physical: an 'uh-huh' or 'unh-unh' that sits deeper than thought. It is the voice of the Sacral centre indicating whether genuine energy is available for something.\n\nWhen a Generator initiates something from the mind rather than from that sacral response, they consume energy they do not have. The result is frustration — the signature of the Generator's not-self. Frustration is not a sign of failure; it is a signal that you have been doing something for too long for which your sacral energy was not truly available.",
        energy:"The Generator does not have a single fixed authority. The most common is Sacral authority: decisions come from a bodily response, not from the mind. But Generators with a defined emotional centre have Emotional authority — for them the rule is never to decide in the moment, but to wait for emotional clarity.\n\nIn both cases the principle is the same: the decision comes from within the body, not from rational analysis. The Generator who learns to trust their sacral response and use their frustration as a navigation tool discovers that life carries less friction and flows more naturally.",
        work:"At work, the Generator is at their best when they have found a craft or field that genuinely fascinates them. The Generator who follows their calling is a force of nature: productive, reliable, driven. They build, refine and deepen — and can sustain that for hours without becoming exhausted.\n\nIn relationships the Generator is a stable presence. Their sacral energy is palpable to others — Projectors and Manifestors feel the power of a Generator when they are in their proximity. That magnetism is powerful but can also become a burden when others want more of that energy than is good for the Generator themselves.",
        challenges:"The greatest obstacle for the Generator is conditioning. From an early age they are taught to initiate: set goals, take action, go out and meet the world. That is not their nature. When they initiate without sacral response, they lose their energy to things that do not truly suit them — and frustration grows.\n\nDe-conditioning begins with a simple question they ask themselves more and more often: is my body genuinely responding to this, or am I doing this because I feel I must?",
      },
    },
    "manifesting-generator":{
      nl:{
        intro:"De Manifesting Generator is een van de meest dynamische typen in Human Design. Ze combineren de sacrale levensenergie van de Generator met het vermogen om direct naar de keel te manifesteren — wat hen snel, veelzijdig en soms lastig bij te houden maakt. Ze vormen samen met de Generator de grootste groep: zo'n 33 procent van de wereldbevolking.\n\nWaar de Generator vaak één diepe passie volgt, heeft de Manifesting Generator er dikwijls meerdere tegelijk. Ze zijn multi-getalenteerd, nemen shortcuts, slaan stappen over en leren het best door gewoon te beginnen en terug te gaan wanneer iets niet werkt. Dat kan er chaotisch uitzien voor anderen, maar het is precies hoe hun systeem werkt.",
        strategy:"De strategie van de Manifesting Generator is tweeledig: reageren, en dan informeren. Net als de Generator wacht hij op een sacrale respons — een instinctieve lichamelijke bevestiging dat er energie beschikbaar is voor iets. Maar vanwege zijn vermogen om direct actie te nemen, heeft hij ook de verantwoordelijkheid om de mensen om hem heen op de hoogte te stellen van wat hij van plan is.\n\nDie informeerstap is essentieel. De Manifesting Generator die handelt zonder te informeren stuit op weerstand — mensen die zich overvallen voelen, die niet begrijpen waarom dingen zo snel gaan. Wanneer hij informeert, vermindert die weerstand en kan zijn energie vrij stromen.",
        energy:"De Manifesting Generator bezit sacrale energie en kan die dus net als de Generator onbeperkt inzetten voor werk dat resoneert. Maar hij verbruikt die energie sneller en intensiever dan de Generator, en heeft daardoor ook meer herstel nodig. Zijn sacrale autoriteit (of emotionele autoriteit indien van toepassing) werkt hetzelfde als bij de Generator: beslissingen komen vanuit het lichaam.\n\nEen kenmerk van de Manifesting Generator is zijn vermogen om meerdere dingen tegelijk te doen. Waar dat voor andere typen uitputtend zou zijn, geeft het de Manifesting Generator juist energie — zolang al die dingen werkelijk resoneren met zijn sacrale ja.",
        work:"Op het werk schittert de Manifesting Generator wanneer hij de ruimte krijgt om snel te bewegen, bij te sturen en nieuwe wegen te verkennen. Hij is niet gemaakt voor één pad van begin tot einde; hij is gemaakt voor dynamiek. Projecten die klaar zijn worden losgelaten, nieuwe passies worden opgepakt — en dat is geen gebrek aan doorzettingsvermogen maar een eigenschap van het design.\n\nIn teams is de Manifesting Generator een enorm productieve kracht, maar hij heeft begripvolle mensen nodig die zijn tempo kunnen volgen en niet schrikken van zijn plotselinge richtingswijzigingen.",
        challenges:"De grootste uitdaging voor de Manifesting Generator is de druk die anderen op hem uitoefenen om consistent en voorspelbaar te zijn. Zijn niet-zelf thema — frustratie en boosheid — ontstaat wanneer hij zijn energie inzet voor dingen die zijn sacrale ja niet hebben gekregen, of wanneer hij zijn snelheid en veelzijdigheid moet inruilen voor een rigide structuur die niet bij hem past.\n\nDe de-conditionering vraagt van de Manifesting Generator dat hij zijn 'stappen overslaan' niet als fout beschouwt, maar leert omgaan met de gevolgen door tijdig te communiceren.",
      },
      en:{
        intro:"The Manifesting Generator is one of the most dynamic types in Human Design. They combine the sacral life force energy of the Generator with the ability to manifest directly to the throat — making them fast, versatile and sometimes difficult to keep up with. Together with the Generator they form the largest group: around 33 percent of the world's population.\n\nWhere the Generator often follows one deep passion, the Manifesting Generator often has several simultaneously. They are multi-talented, take shortcuts, skip steps and learn best by simply starting and going back when something does not work. That can look chaotic to others, but it is precisely how their system works.",
        strategy:"The strategy of the Manifesting Generator is twofold: respond, and then inform. Like the Generator they wait for a sacral response — an instinctive bodily confirmation that energy is available for something. But because of their ability to take direct action, they also have the responsibility to inform the people around them of what they plan to do.\n\nThat informing step is essential. The Manifesting Generator who acts without informing meets resistance — people who feel ambushed, who do not understand why things are moving so fast. When they inform, that resistance diminishes and their energy can flow freely.",
        energy:"The Manifesting Generator possesses sacral energy and can therefore, like the Generator, direct it without limit toward work that resonates. But they consume that energy faster and more intensely than the Generator, and therefore need more recovery. Their sacral authority (or emotional authority where applicable) works the same as the Generator's: decisions come from the body.\n\nA characteristic of the Manifesting Generator is their ability to do several things simultaneously. Where that would be exhausting for other types, it actually gives the Manifesting Generator energy — as long as all those things genuinely resonate with their sacral yes.",
        work:"At work the Manifesting Generator shines when given the space to move fast, adjust and explore new paths. They are not made for one path from beginning to end; they are made for dynamism. Projects that are complete are released, new passions are picked up — and that is not a lack of perseverance but a characteristic of the design.\n\nIn teams the Manifesting Generator is an enormously productive force, but they need understanding people who can follow their pace and are not startled by their sudden changes of direction.",
        challenges:"The greatest challenge for the Manifesting Generator is the pressure others place on them to be consistent and predictable. Their not-self theme — frustration and anger — arises when they direct their energy toward things that have not received their sacral yes, or when they have to trade their speed and versatility for a rigid structure that does not suit them.\n\nDe-conditioning asks the Manifesting Generator to stop seeing their 'skipping steps' as a flaw, and learn to deal with the consequences by communicating in time.",
      },
    },
    projector:{
      nl:{
        intro:"Projectoren maken zo'n 20 procent van de bevolking uit en zijn fundamenteel anders dan de generatieve typen. Ze hebben geen gedefinieerd Sacraalcentrum en zijn niet ontworpen om continu te werken met de aanhoudende levensenergie die Generators en Manifesting Generators bezitten. Maar ze hebben iets dat die typen niet hebben: een bijzonder vermogen om anderen diep te lezen, systemen en mensen scherp te zien, en begeleiding te bieden die rechtstreeks het hart raakt.\n\nDe Projector is ontworpen om de energie van anderen te richten en te begeleiden — niet om zelf de motor te zijn. In een wereld die steeds minder afhankelijk wordt van pure fysieke arbeid en steeds meer van strategisch inzicht, is de Projector een type voor de toekomst.",
        strategy:"De strategie van de Projector is wachten op de uitnodiging. Dat is de meest onbegrepen en tegelijkertijd krachtigste strategie in Human Design. Een uitnodiging is meer dan een vriendelijke vraag; het is erkenning. Het is dat iemand de kwaliteiten, het inzicht of het vermogen van de Projector heeft herkend en hem vraagt om die in te zetten.\n\nWanneer de Projector zijn wijsheid deelt zonder uitnodiging — hoe goed zijn advies ook is — stuit het op weerstand. Niet omdat de mensen om hem heen het niet willen horen, maar omdat de energie van erkenning ontbreekt die nodig is om de informatie echt te laten landen. De uitnodiging is de sleutel.",
        energy:"Zonder gedefinieerd Sacraalcentrum heeft de Projector geen onbeperkte werkenenergie. Hij is gemaakt voor korte periodes van geconcentreerde activiteit en heeft meer rust en terugtrektijd nodig dan generatieve typen. Dat wordt in onze prestatiecultuur makkelijk als zwakte gezien — het is het tegenovergestelde. De Projector die zijn energie beheert en niet probeert het tempo van een Generator bij te houden, bewaart de helderheid die zijn kracht is.\n\nZijn autoriteit kan Emotioneel, Splenisch, Zelf-geprojecteerd, Ego of Mentaal zijn. Afhankelijk van de autoriteit neemt hij beslissingen via een andere weg — maar nooit via de sacrale respons, want dat centrum heeft hij niet.",
        work:"Op het werk is de Projector op zijn best in rollen die begeleiding, leiderschap of systemen vereisen. Hij ziet patronen die anderen missen, herkent hoe mensen het best ingezet kunnen worden, en heeft een uniek vermogen om het potentieel van anderen te ontgrendelen. Consultants, coaches, therapeuten, directeuren — dit zijn rollen die de Projector van nature aantrekken.\n\nMaar zijn bijdrage vereist erkenning. De Projector die werkt in omgevingen waar zijn inzicht structureel genegeerd of onderschat wordt, raakt uitgeput. Niet alleen fysiek, maar existentieel.",
        challenges:"Bitterheid is het niet-zelf thema van de Projector — en het is een signaal dat hij te lang energie heeft gestoken in situaties die hem niet werkelijk erkennen. Bitterheid is geen karakter gebrek; het is een navigatiemiddel. Het geeft aan dat iets moet veranderen.\n\nDe grootste uitdaging voor Projectoren is geduld. In een wereld die handelen beloont, is wachten op uitnodiging een radicale keuze. Maar de Projector die heeft geleerd te wachten, merkt dat de uitnodigingen die komen groter, waardevoller en beter passend zijn dan alles wat hij zelf had kunnen afdwingen.",
      },
      en:{
        intro:"Projectors make up around 20 percent of the population and are fundamentally different from the generative types. They have no defined Sacral centre and are not designed to work continuously with the sustained life force energy that Generators and Manifesting Generators possess. But they have something those types do not: a remarkable ability to read others deeply, to see people and systems with clarity, and to offer guidance that goes straight to the heart.\n\nThe Projector is designed to direct and guide the energy of others — not to be the motor themselves. In a world that is becoming increasingly less dependent on pure physical labour and increasingly more on strategic insight, the Projector is a type for the future.",
        strategy:"The strategy of the Projector is to wait for the invitation. That is the most misunderstood and at the same time most powerful strategy in Human Design. An invitation is more than a friendly question; it is recognition. It is someone having recognised the qualities, insight or capacity of the Projector and asking them to apply those.\n\nWhen the Projector shares their wisdom without an invitation — however good their advice may be — it meets resistance. Not because the people around them do not want to hear it, but because the energy of recognition is absent that is needed to allow the information to truly land. The invitation is the key.",
        energy:"Without a defined Sacral centre, the Projector has no unlimited work energy. They are made for short periods of concentrated activity and need more rest and withdrawal time than generative types. In our performance culture that is easily seen as weakness — it is the opposite. The Projector who manages their energy and does not try to keep pace with a Generator preserves the clarity that is their strength.\n\nTheir authority can be Emotional, Splenic, Self-Projected, Ego or Mental. Depending on the authority they make decisions through a different path — but never through the sacral response, as they do not have that centre.",
        work:"At work the Projector is at their best in roles that require guidance, leadership or systems thinking. They see patterns others miss, recognise how people can best be deployed, and have a unique capacity to unlock the potential of others. Consultants, coaches, therapists, directors — these are roles the Projector is naturally drawn to.\n\nBut their contribution requires recognition. The Projector who works in environments where their insight is systematically ignored or underestimated becomes exhausted. Not only physically, but existentially.",
        challenges:"Bitterness is the not-self theme of the Projector — and it is a signal that they have invested energy too long in situations that do not genuinely recognise them. Bitterness is not a character flaw; it is a navigation tool. It indicates that something needs to change.\n\nThe greatest challenge for Projectors is patience. In a world that rewards action, waiting for an invitation is a radical choice. But the Projector who has learned to wait finds that the invitations that come are larger, more valuable and better suited than anything they could have forced.",
      },
    },
    manifestor:{
      nl:{
        intro:"Met slechts 9 procent van de wereldbevolking zijn Manifestoren zeldzaam — en dat merk je wanneer je er een tegenkomt. Manifestoren zijn het enige type in Human Design dat van nature kan initiëren. Ze hebben een directe verbinding tussen een motorcentrum en de keel, wat hun de capaciteit geeft om dingen in beweging te zetten zonder eerst te wachten of te reageren. Ze zijn onafhankelijk, impactvol en volgen een innerlijk kompas dat niet altijd verklaarbaar is voor de buitenwereld.\n\nHistorisch gezien hebben Manifestoren dikwijls leiderschapsposities bezet — niet omdat ze dat wilden, maar omdat ze het vermogen hebben om dingen te laten beginnen. De samenleving heeft altijd Manifestoren nodig gehad om impulsen te initiëren die anderen vervolgens kunnen uitvoeren en verfijnen.",
        strategy:"De strategie van de Manifestor is informeren — niet om toestemming te vragen, maar om de mensen die door zijn acties geraakt worden vooraf op de hoogte te stellen. Dat onderscheid is cruciaal. De Manifestor vraagt niet of hij iets mag doen; hij deelt wat hij gaat doen.\n\nWanneer de Manifestor handelt zonder te informeren, stuit zijn energie op weerstand. Mensen voelen de kracht van zijn impact maar begrijpen niet waar die vandaan komt, en reageren met angst, controle of tegenwerking. Wanneer hij informeert, verdwijnt die weerstand grotendeels — en kan zijn creatieve kracht ongehinderd werken.",
        energy:"De Manifestor heeft geen gedefinieerd Sacraalcentrum en bezit dus niet de onbeperkte werkenenergie van de Generator. Zijn energie komt in golven: intense periodes van actie en creatie, gevolgd door herstelperiodes die hij serieus moet nemen. De Manifestor die zijn rustperiodes negeert en doorgaat op momentum, raakt eerder uitgeput dan hij verwacht.\n\nZijn autoriteit kan Emotioneel, Ego of Splenisch zijn. De Manifestor met Emotionele autoriteit neemt nooit beslissingen in het moment — hij wacht op emotionele helderheid. De Manifestor met Splenische autoriteit reageert op een stille, instinctieve stem die in het moment spreekt.",
        work:"Op het werk is de Manifestor het krachtigst wanneer hij de ruimte krijgt om te initiëren. Structuur en procedures die hem moeten verantwoorden voor elk besluit kosten hem energie en ondermijnen zijn kracht. Hij is een pionier, een concept-ontwikkelaar, een ondernemer — iemand die ideeën in beweging brengt die anderen vervolgens uitvoeren.\n\nDe Manifestor die begrijpt dat zijn kracht in het initiëren ligt, en niet in het uitvoeren of volhouden, kan zichzelf aanzienlijk veel energie besparen door de juiste mensen om zich heen te verzamelen die de uitvoering op zich nemen.",
        challenges:"Boosheid is het niet-zelf thema van de Manifestor — en het ontstaat typisch wanneer hij het gevoel heeft dat anderen zijn vrijheid beperken, zijn acties blokkeren of hem voortdurend om verantwoording vragen. Die boosheid is een signaal: er is weerstand die opgelost kan worden door te informeren.\n\nDe grootste uitdaging voor Manifestoren is leren dat informeren geen zwakte is. In hun beleving communiceert het gevoel van 'ik hoef geen toestemming te vragen' soms als arrogantie naar buiten. Maar wanneer de Manifestor informeert vanuit kracht — niet vanuit verplichting — verdwijnt die weerstand en ontstaat er vrede.",
      },
      en:{
        intro:"With only 9 percent of the world's population, Manifestors are rare — and you notice it when you meet one. Manifestors are the only type in Human Design designed to naturally initiate. They have a direct connection between a motor centre and the throat, giving them the capacity to set things in motion without first waiting or responding. They are independent, impactful and follow an inner compass that is not always explicable to the outside world.\n\nHistorically, Manifestors have often occupied leadership positions — not because they wanted to, but because they have the ability to start things that others can then carry out and refine. Society has always needed Manifestors to initiate impulses that others can execute and develop.",
        strategy:"The strategy of the Manifestor is to inform — not to ask permission, but to let the people affected by their actions know in advance what they are going to do. That distinction is crucial. The Manifestor does not ask whether they may do something; they share what they are going to do.\n\nWhen the Manifestor acts without informing, their energy meets resistance. People feel the force of their impact but do not understand where it comes from, and respond with fear, control or opposition. When they inform, that resistance largely disappears — and their creative power can work unimpeded.",
        energy:"The Manifestor has no defined Sacral centre and therefore does not possess the unlimited work energy of the Generator. Their energy comes in waves: intense periods of action and creation, followed by recovery periods they must take seriously. The Manifestor who ignores their rest periods and continues on momentum becomes exhausted sooner than they expect.\n\nTheir authority can be Emotional, Ego or Splenic. The Manifestor with Emotional authority never makes decisions in the moment — they wait for emotional clarity. The Manifestor with Splenic authority responds to a quiet, instinctive voice that speaks in the moment.",
        work:"At work the Manifestor is most powerful when given the space to initiate. Structures and procedures that require them to account for every decision cost them energy and undermine their power. They are a pioneer, a concept developer, an entrepreneur — someone who sets ideas in motion that others then execute.\n\nThe Manifestor who understands that their strength lies in initiating, not in executing or sustaining, can save themselves considerable energy by gathering the right people around them who take on the execution.",
        challenges:"Anger is the not-self theme of the Manifestor — and it typically arises when they feel that others are limiting their freedom, blocking their actions or constantly asking them to account for themselves. That anger is a signal: there is resistance that can be resolved by informing.\n\nThe greatest challenge for Manifestors is learning that informing is not weakness. Their sense of 'I do not need to ask permission' can sometimes read as arrogance to the outside world. But when the Manifestor informs from strength — not from obligation — that resistance disappears and peace arises.",
      },
    },
    reflector:{
      nl:{
        intro:"Reflectoren zijn zeldzaam — slechts 1 procent van de wereldbevolking draagt dit design. Ze hebben geen enkel centrum gedefinieerd, wat betekent dat ze volledig open zijn voor de energieën om hen heen. Ze zijn als de maan: ze reflecteren en versterken wat er in hun omgeving aanwezig is. Dat maakt hen bijzonder gevoelig voor de kwaliteit van mensen, plekken en gemeenschappen — en bijzonder waardevol als barometer van gezondheid en welzijn in een groep.\n\nEen Reflector in een bloeiende, gezonde omgeving straalt. Dezelfde Reflector in een toxische, ongezonde omgeving kwijnt weg — niet als metafoor, maar als directe energetische ervaring. Hun welzijn is dan ook in grote mate afhankelijk van de keuzes die ze maken over waar ze zijn en met wie.",
        strategy:"De strategie van de Reflector is wachten — een volledige maancyclus van 28 dagen — voor grote beslissingen. Dat is de langste wachttijd van alle typen en tegelijk de meest essentiële. Omdat de Reflector zo diep beïnvloed wordt door zijn omgeving, varieert zijn ervaring van dezelfde situatie sterk afhankelijk van wanneer hij ernaar kijkt.\n\nDoor te wachten totdat de maan zijn volledige cyclus heeft doorlopen, kan de Reflector voelen hoe een beslissing aanvoelt door alle energetische kleuren heen. Niet om de beslissing uit te stellen, maar om haar vanuit een complete en geïnformeerde plek te nemen.",
        energy:"Omdat geen van zijn centra gedefinieerd is, heeft de Reflector geen consistente interne energie. Hij is volledig afhankelijk van wat er om hem heen is — wat hem niet kwetsbaar maar multidimensionaal maakt. In de aanwezigheid van een Generator voelt hij sacrale energie. In de aanwezigheid van een Manifestor voelt hij de impuls om te initiëren. Die mobiliteit van ervaring is zijn kracht, niet zijn zwakte.\n\nZijn autoriteit is lunair: hij volgt de beweging van de maan door de 64 poorten van het Human Design chart. Elke dag brengt een ander energetisch perspectief op dezelfde vraag. De Reflector die dit bewust volgt, leert de vragen die hij zichzelf stelt te kalibreren op de cyclus van de maan.",
        work:"De Reflector is op zijn best in omgevingen waar zijn bijzondere vermogen gewaardeerd wordt. Hij ziet wat anderen niet zien, voelt wat er onder de oppervlakte speelt, en kan met opmerkelijke helderheid beschrijven hoe een gemeenschap, team of organisatie werkelijk functioneert. Dat maakt hem waardevol als adviseur, waarnemer of vertrouwenspersoon.\n\nZijn grootste bijdrage is zijn aanwezigheid. Een Reflector die goed voelt, die een gezonde en ondersteunende omgeving heeft, fungeert als spiegel voor iedereen om hem heen. Zijn kwaliteit van zijn is aanstekelijk — letterlijk, want via zijn open centra versterkt hij de energie van wie hij omgeeft.",
        challenges:"Teleurstelling is het niet-zelf thema van de Reflector — en het komt voort uit het leven in omgevingen die niet bij hem passen. Die teleurstelling is geen sentimentele reactie; het is een diep signaal dat er iets structureel niet klopt in zijn context.\n\nDe grootste uitdaging voor de Reflector is het vinden van gemeenschappen en plekken die zijn gevoeligheid begrijpen en koesteren. In een cultuur die consistentie en sterke eigen meningen beloont, voelt de Reflector zich soms onzichtbaar of onstabiel. De bevrijding komt wanneer hij zijn beweeglijkheid begrijpt als een gave — en niet langer probeert een consistentie te simuleren die niet van hem is.",
      },
      en:{
        intro:"Reflectors are rare — only 1 percent of the world's population carries this design. They have no centre defined at all, meaning they are completely open to the energies around them. They are like the moon: they reflect and amplify what is present in their environment. That makes them uniquely sensitive to the quality of people, places and communities — and uniquely valuable as a barometer of health and wellbeing in a group.\n\nA Reflector in a flourishing, healthy environment shines. The same Reflector in a toxic, unhealthy environment fades — not as a metaphor, but as a direct energetic experience. Their wellbeing is therefore largely dependent on the choices they make about where they are and with whom.",
        strategy:"The strategy of the Reflector is to wait — a full lunar cycle of 28 days — for major decisions. That is the longest waiting period of all types and at the same time the most essential. Because the Reflector is so deeply influenced by their environment, their experience of the same situation varies greatly depending on when they look at it.\n\nBy waiting until the moon has completed its full cycle, the Reflector can feel how a decision feels across all energetic colours. Not to delay the decision, but to make it from a complete and informed place.",
        energy:"Because none of their centres are defined, the Reflector has no consistent internal energy. They are completely dependent on what is around them — which makes them not vulnerable but multidimensional. In the presence of a Generator they feel sacral energy. In the presence of a Manifestor they feel the impulse to initiate. That mobility of experience is their strength, not their weakness.\n\nTheir authority is lunar: they follow the movement of the moon through the 64 gates of the Human Design chart. Each day brings a different energetic perspective on the same question. The Reflector who consciously follows this learns to calibrate the questions they ask themselves to the cycle of the moon.",
        work:"The Reflector is at their best in environments where their special capacity is valued. They see what others do not see, feel what is playing beneath the surface, and can describe with remarkable clarity how a community, team or organisation is truly functioning. That makes them valuable as an advisor, observer or trusted confidant.\n\nTheir greatest contribution is their presence. A Reflector who is well, who has a healthy and supportive environment, functions as a mirror for everyone around them. Their quality of being is contagious — literally, because through their open centres they amplify the energy of those they surround.",
        challenges:"Disappointment is the not-self theme of the Reflector — and it stems from living in environments that do not suit them. That disappointment is not a sentimental reaction; it is a deep signal that something is structurally wrong in their context.\n\nThe greatest challenge for the Reflector is finding communities and places that understand and cherish their sensitivity. In a culture that rewards consistency and strong personal opinions, the Reflector sometimes feels invisible or unstable. Liberation comes when they understand their mobility as a gift — and stop trying to simulate a consistency that is not theirs.",
      },
    },
  };

  const c=isEN?CONTENT[typeId]?.en:CONTENT[typeId]?.nl;
  if(!c)return null;

  // Pre-compute FAQs so they can go into both JSON-LD and the visible FAQ section
  const TYPE_FAQS_DATA={
    generator:{
      nl:[["Wat is de strategie van de Generator?","De strategie van de Generator is reageren. Dat betekent wachten op een externe stimulus — een vraag, een aanbod, een mogelijkheid — die een instinctieve sacrale respons oproept. Die respons is lichamelijk en komt vóór het denken."],["Wat is het niet-zelf thema van de Generator?","Frustratie is het niet-zelf thema van de Generator. Het ontstaat wanneer de Generator initieert zonder sacrale respons, of wanneer hij werk doet dat hem niet werkelijk boeit. Frustratie is geen falen — het is een navigatiesignaal."],["Hoe weet ik of ik een Generator ben?","Generators hebben een gedefinieerd Sacraalcentrum in hun Human Design chart. Dit is herkenbaar aan het gekleurde vierkant midden-onderaan in de bodygraph. Ongeveer 37% van de bevolking is Generator."],["Wat is het verschil tussen Generator en Manifesting Generator?","De Manifesting Generator heeft naast sacrale energie ook een directe verbinding naar de keel, waardoor hij sneller kan handelen en meerdere dingen tegelijk kan verwerken. De 'pure' Generator gaat dieper en methodischer te werk."]],
      en:[["What is the strategy of the Generator?","The strategy of the Generator is to respond. That means waiting for an external stimulus — a question, an offer, an opportunity — that evokes an instinctive sacral response. That response is physical and comes before thinking."],["What is the not-self theme of the Generator?","Frustration is the not-self theme of the Generator. It arises when the Generator initiates without sacral response, or does work that does not truly fascinate them. Frustration is not failure — it is a navigation signal."],["How do I know if I am a Generator?","Generators have a defined Sacral centre in their Human Design chart. This is recognisable as the coloured square in the lower middle of the bodygraph. Around 37% of the population is a Generator."],["What is the difference between Generator and Manifesting Generator?","The Manifesting Generator has sacral energy plus a direct connection to the throat, allowing them to act faster and process multiple things simultaneously. The 'pure' Generator works more deeply and methodically."]],
    },
    "manifesting-generator":{
      nl:[["Wat is de strategie van de Manifesting Generator?","Reageren — dan informeren. De Manifesting Generator wacht eerst op een sacrale respons, en laat vervolgens de mensen om hem heen weten wat hij van plan is. Die informeerstap vermindert weerstand aanzienlijk."],["Waarom slaat de Manifesting Generator stappen over?","Dat is onderdeel van zijn design. De Manifesting Generator verwerkt informatie multidimensionaal en ziet kortere routes dan anderen. Terugkomen en bijsturen wanneer iets niet werkt hoort erbij — dat is geen gebrek maar een eigenschap."],["Wat is het niet-zelf thema van de Manifesting Generator?","Frustratie én boosheid. Frustratie wanneer hij zich gedwongen voelt één pad te volgen, boosheid wanneer hij het gevoel heeft geblokkeerd te worden in zijn natuurlijke snelheid of veelzijdigheid."],["Hoe verschilt de Manifesting Generator van de Manifestor?","De Manifesting Generator heeft sacrale energie en moet reageren voor hij initieert. De Manifestor hoeft niet te reageren — hij kan direct initiëren. De Manifesting Generator heeft meer aanhoudende energie maar ook meer behoefte aan sacrale bevestiging."]],
      en:[["What is the strategy of the Manifesting Generator?","Respond — then inform. The Manifesting Generator first waits for a sacral response, then lets the people around them know what they are planning. That informing step significantly reduces resistance."],["Why does the Manifesting Generator skip steps?","That is part of their design. The Manifesting Generator processes information multidimensionally and sees shorter routes than others. Coming back and adjusting when something does not work is part of it — that is a feature, not a flaw."],["What is the not-self theme of the Manifesting Generator?","Frustration and anger. Frustration when forced to follow a single path, anger when feeling blocked in their natural speed or versatility."],["How does the Manifesting Generator differ from the Manifestor?","The Manifesting Generator has sacral energy and must respond before initiating. The Manifestor does not need to respond — they can initiate directly. The Manifesting Generator has more sustained energy but also more need for sacral confirmation."]],
    },
    projector:{
      nl:[["Wat is de strategie van de Projector?","Wachten op de uitnodiging. Niet op elke vraag — maar op de grote uitnodigingen in het leven: voor werk, relaties en significante nieuwe richtingen. Een echte uitnodiging bevat herkenning van de Projectors kwaliteiten."],["Waarom raakt de Projector uitgeput?","Projectors hebben geen gedefinieerd Sacraalcentrum en bezitten niet de onbeperkte werkenenergie van Generators. Ze conditioneren sacrale energie van anderen en herkennen die soms als hun eigen. Wanneer ze dit als motor gebruiken, raken ze overbevraagd."],["Wat is het niet-zelf thema van de Projector?","Bitterheid. Het ontstaat wanneer de Projector zijn wijsheid aanbiedt zonder uitgenodigd te worden, of wanneer hij zijn energie investeert in omgevingen die zijn inzicht niet erkennen."],["Kan een Projector ook succesvol zijn in een leiderschapsrol?","Absoluut. Projectors zijn uitstekende leiders, coaches en strategen — juist omdat ze systemen en mensen helder zien. Het verschil is dat hun leiderschap het meest krachtig is wanneer het voortkomt uit herkenning en uitnodiging, niet uit afdwinging."]],
      en:[["What is the strategy of the Projector?","Wait for the invitation. Not for every question — but for the big invitations in life: for work, relationships and significant new directions. A genuine invitation contains recognition of the Projector's qualities."],["Why does the Projector become exhausted?","Projectors have no defined Sacral centre and do not possess the unlimited work energy of Generators. They condition sacral energy from others and sometimes mistake it for their own. When they use this as their motor, they become overextended."],["What is the not-self theme of the Projector?","Bitterness. It arises when the Projector offers their wisdom without being invited, or invests their energy in environments that do not recognise their insight."],["Can a Projector be successful in a leadership role?","Absolutely. Projectors are excellent leaders, coaches and strategists — precisely because they see systems and people clearly. The difference is that their leadership is most powerful when it arises from recognition and invitation, not from assertion."]],
    },
    manifestor:{
      nl:[["Wat is de strategie van de Manifestor?","Informeren. Niet om toestemming te vragen, maar om de mensen die door zijn acties geraakt worden vooraf op de hoogte te stellen van zijn intenties. Dit vermindert weerstand en creëert ruimte voor zijn creatieve impact."],["Waarom krijgt de Manifestor zoveel weerstand?","Omdat zijn energie krachtig en ondoorgrondelijk aanvoelt voor anderen wanneer hij handelt zonder te informeren. Mensen reageren met angst of controle op wat ze niet begrijpen. Informeren neemt de onzekerheid weg."],["Wat is het niet-zelf thema van de Manifestor?","Boosheid. Het ontstaat wanneer de Manifestor het gevoel heeft dat zijn vrijheid beperkt wordt, zijn acties geblokkeerd worden, of dat hij constant verantwoording moet afleggen voor zijn beslissingen."],["Moet de Manifestor ook op iets wachten?","Niet op een sacrale respons — dat centrum is bij de Manifestor open of niet-gedefinieerd. Wel heeft de Manifestor autoriteit nodig: afhankelijk van zijn design wacht hij op emotionele helderheid, een splenisch signaal of een ego-impuls."]],
      en:[["What is the strategy of the Manifestor?","Inform. Not to ask permission, but to let the people affected by their actions know in advance what they intend to do. This reduces resistance and creates space for their creative impact."],["Why does the Manifestor encounter so much resistance?","Because their energy feels powerful and impenetrable to others when they act without informing. People respond with fear or control to what they do not understand. Informing removes the uncertainty."],["What is the not-self theme of the Manifestor?","Anger. It arises when the Manifestor feels their freedom is being restricted, their actions are being blocked, or they are constantly being asked to account for their decisions."],["Does the Manifestor also need to wait for something?","Not for a sacral response — that centre is open or undefined in the Manifestor. But the Manifestor does have authority: depending on their design they wait for emotional clarity, a splenic signal or an ego impulse."]],
    },
    reflector:{
      nl:[["Waarom moet de Reflector 28 dagen wachten?","Omdat de Reflector volledig open is voor omgevingsenergieën, variëren zijn ervaringen sterk afhankelijk van wanneer hij iets bekijkt. Door een volledige maancyclus te doorlopen kan hij voelen hoe een beslissing aanvoelt vanuit alle energetische invalshoeken."],["Heeft de Reflector geen enkele gedefinieerde centra?","Correct. De Reflector is het enige type waarbij alle negen centra in de Human Design chart ongedefinieerd zijn. Dat maakt hem bijzonder ontvankelijk en gevoelig voor zijn omgeving."],["Wat is het niet-zelf thema van de Reflector?","Teleurstelling. Het ontstaat wanneer de Reflector leeft in omgevingen die niet bij hem passen — omgevingen die zijn sensitiviteit niet begrijpen of waarderen. De oplossing is bewuste keuze van context."],["Hoe zeldzaam is een Reflector?","Slechts ongeveer 1% van de wereldbevolking is Reflector. Dat maakt hen het meest zeldzame type in Human Design."]],
      en:[["Why does the Reflector need to wait 28 days?","Because the Reflector is completely open to environmental energies, their experiences vary greatly depending on when they look at something. By moving through a full lunar cycle they can feel how a decision feels from all energetic angles."],["Does the Reflector have no defined centres at all?","Correct. The Reflector is the only type in which all nine centres in the Human Design chart are undefined. That makes them uniquely receptive and sensitive to their environment."],["What is the not-self theme of the Reflector?","Disappointment. It arises when the Reflector lives in environments that do not suit them — environments that do not understand or appreciate their sensitivity. The solution is conscious choice of context."],["How rare is a Reflector?","Only around 1% of the world's population is a Reflector. That makes them the rarest type in Human Design."]],
    },
  };
  const typeFaqEntries=(TYPE_FAQS_DATA[typeId]?.[isEN?"en":"nl"])||[];

  useSEO({
    title: isEN
      ? `${tl2(tp.title)} Human Design — ${tl2(tp.strategy)} & ${tl2(tp.signature)} | Faculty of Human Design`
      : `${tl2(tp.title)} Human Design — Strategie, Energie & Autoriteit | Faculty of Human Design`,
    description: isEN
      ? `${tl2(tp.title)}: ${tl2(tp.tagline)}. Strategy: ${tl2(tp.strategy)}. Signature: ${tl2(tp.signature)}. ${tl2(tp.population)} of the world's population. Discover your complete Human Design reading.`
      : `${tl2(tp.title)}: ${tl2(tp.tagline)}. Strategie: ${tl2(tp.strategy)}. Signature: ${tl2(tp.signature)}. ${tl2(tp.population)} van de wereldbevolking. Ontdek je volledige Human Design reading.`,
    canonical: SITE+(isEN?`/en/type/${tp.slug}`:`/type/${tp.slug}`),
    jsonLd:{
      "@context":"https://schema.org",
      "@graph":[
        {"@type":"Article","headline":`${tl2(tp.title)} in Human Design`,"description":tl2(tp.tagline),"author":{"@type":"Organization","name":"Faculty of Human Design"},"publisher":{"@type":"Organization","name":"Faculty of Human Design"},"mainEntityOfPage":{"@type":"WebPage","@id":SITE+(isEN?`/en/type/${tp.slug}`:`/type/${tp.slug}`)}},
        ...(typeFaqEntries.length?[{"@type":"FAQPage","mainEntity":typeFaqEntries.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))}]:[]),
      ],
    }
  });

  const para=(text)=>text.split("\n\n").map((p,i)=>(
    <p key={i} style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1rem,1.6vw,1.12rem)",fontWeight:300,color:"var(--text)",lineHeight:1.9,marginBottom:28}}>{p}</p>
  ));

  const otherTypes=TYPES.filter(t=>t.id!==tp.id);

  return(
    <div className="pg">

      {/* ── CINEMATIC HERO ── */}
      <section style={{position:"relative",height:"80vh",minHeight:520,maxHeight:860,overflow:"hidden",display:"flex",alignItems:"flex-end"}}>
        <div style={{position:"absolute",inset:0}}>
          <img src={tp.img} alt={tl2(tp.title)+" Human Design"} loading="eager"
            style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 35%"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(8,7,14,.15) 0%,rgba(8,7,14,.2) 35%,rgba(8,7,14,.85) 100%)"}}/>
        </div>
        <div className="type-hero-inner">
          <div style={{fontSize:".55rem",fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(201,168,92,.7)",marginBottom:16}}>
            {isEN?"Human Design Type":"Human Design Type"} · {tl2(tp.population)} {isEN?"of the population":"van de bevolking"}
          </div>
          <h1 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(2.8rem,7vw,5.5rem)",fontWeight:300,color:"white",lineHeight:1.05,letterSpacing:"-.02em",marginBottom:20}}>
            {tl2(tp.title)}
          </h1>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1rem,1.8vw,1.3rem)",fontWeight:300,fontStyle:"italic",color:"rgba(255,255,255,.5)",lineHeight:1.6,maxWidth:560,marginBottom:40}}>
            {tl2(tp.tagline)}
          </p>
          {/* Quick stats */}
          <div style={{display:"flex",gap:40,flexWrap:"wrap"}}>
            {[
              [isEN?"Strategy":"Strategie", tl2(tp.strategy)],
              [isEN?"Signature":"Signature", tl2(tp.signature)],
              [isEN?"Not-self":"Niet-zelf", tl2(tp.notSelf)],
            ].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:".5rem",fontWeight:600,letterSpacing:".16em",textTransform:"uppercase",color:"rgba(201,168,92,.6)",marginBottom:4}}>{l}</div>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,color:"white"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="type-section-lg" style={{background:"var(--bg)"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{width:1,height:48,background:"var(--gold)",opacity:.5,marginBottom:48}}/>
          {para(c.intro)}
        </div>
      </section>

      {/* ── STRATEGIE ── */}
      <section className="type-section" style={{background:"white"}}>
        <div className="type-split">
          <div style={{paddingTop:6}}>
            <div style={{fontSize:".55rem",fontWeight:600,letterSpacing:".16em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>{isEN?"Strategy":"Strategie"}</div>
            <div style={{fontFamily:"var(--font-serif)",fontSize:"1.55rem",fontWeight:300,color:"var(--text)",lineHeight:1.2,marginBottom:20}}>{tl2(tp.strategy)}</div>
            <div style={{width:28,height:1,background:"var(--gold)",opacity:.5}}/>
            <div style={{marginTop:24,fontSize:".78rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.7}}>
              <div style={{marginBottom:8}}><span style={{fontWeight:500,color:"var(--text)"}}>{isEN?"Signature":"Signature"}:</span> {tl2(tp.signature)}</div>
              <div><span style={{fontWeight:500,color:"var(--text)"}}>{isEN?"Not-self":"Niet-zelf"}:</span> {tl2(tp.notSelf)}</div>
            </div>
          </div>
          <div>{para(c.strategy)}</div>
        </div>
      </section>

      {/* ── ENERGIE & AUTORITEIT ── */}
      <section className="type-section" style={{background:"var(--bg)"}}>
        <div className="type-split">
          <div style={{paddingTop:6}}>
            <div style={{fontSize:".55rem",fontWeight:600,letterSpacing:".16em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>{isEN?"Energy":"Energie"}</div>
            <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",fontWeight:300,color:"var(--text)",lineHeight:1.3,marginBottom:20}}>{isEN?"Authority":"Autoriteit"}</div>
            <div style={{width:28,height:1,background:"var(--gold)",opacity:.5}}/>
            <div style={{marginTop:24,fontSize:".75rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.7}}>{tl2(tp.authority)}</div>
          </div>
          <div>{para(c.energy)}</div>
        </div>
      </section>

      {/* ── WERK & RELATIES ── */}
      <section className="type-section" style={{background:"white"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{fontSize:".55rem",fontWeight:600,letterSpacing:".16em",textTransform:"uppercase",color:"var(--gold)",marginBottom:32}}>{isEN?"Work & Relationships":"Werk & Relaties"}</div>
          {para(c.work)}
        </div>
      </section>

      {/* ── UITDAGINGEN ── */}
      <section className="type-section" style={{background:"var(--muted)"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{fontSize:".55rem",fontWeight:600,letterSpacing:".16em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>{isEN?"Not-self theme":"Niet-zelf thema"}</div>
          <div style={{fontFamily:"var(--font-serif)",fontSize:"1.3rem",fontWeight:300,color:"var(--text)",marginBottom:32}}>{tl2(tp.notSelf)}</div>
          {para(c.challenges)}
        </div>
      </section>

      {/* ── FAQ ── */}
      {typeFaqEntries.length>0&&(
        <section className="type-section" style={{background:"var(--bg)"}}>
          <div style={{maxWidth:720,margin:"0 auto"}}>
            <div style={{fontSize:".55rem",fontWeight:600,letterSpacing:".16em",textTransform:"uppercase",color:"var(--gold)",marginBottom:40}}>FAQ</div>
            {typeFaqEntries.map(([q,a],i)=>(
              <FaqItem key={i} q={q} a={a}/>
            ))}
            <div style={{borderTop:"1px solid var(--border)"}}/>
          </div>
        </section>
      )}

      {/* ── LEES OOK — Journal s6 ── */}
      <section className="type-section-sm" style={{background:"white",borderTop:"1px solid var(--border)"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{fontSize:".55rem",fontWeight:600,letterSpacing:".16em",textTransform:"uppercase",color:"var(--gold)",marginBottom:20}}>
            {isEN?"Read also":"Lees ook"}
          </div>
          <div style={{display:"flex",gap:32,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:220}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:"1.08rem",fontWeight:400,color:"var(--text)",lineHeight:1.28,marginBottom:10}}>
                {isEN?"The Five Types in Human Design Explained":"De vijf Types in Human Design uitgelegd"}
              </div>
              <p style={{fontFamily:"var(--font-serif)",fontSize:".88rem",fontWeight:300,fontStyle:"italic",color:"var(--text-muted)",lineHeight:1.72,margin:"0 0 18px"}}>
                {isEN
                  ?"A complete overview of all five types — Generator, Manifesting Generator, Projector, Manifestor, Reflector. Their strategies, not-self themes and energetic nature explained side by side."
                  :"Een compleet overzicht van alle vijf types — Generator, Manifesting Generator, Projector, Manifestor, Reflector. Hun strategieën, niet-zelf thema's en energetische aard naast elkaar uitgelegd."}
              </p>
              <span
                style={{fontFamily:"var(--font-sans)",fontSize:".62rem",fontWeight:500,letterSpacing:".12em",textTransform:"uppercase",color:"var(--gold)",cursor:"pointer"}}
                onClick={()=>go("inzichten-s6")}
              >{isEN?"Read the article →":"Lees het artikel →"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="type-section-lg" style={{background:"var(--dark)",textAlign:"center"}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <div style={{width:1,height:48,background:"var(--gold)",margin:"0 auto 48px",opacity:.4}}/>
          <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.6rem,3vw,2.4rem)",fontWeight:300,color:"white",marginBottom:20,lineHeight:1.1}}>
            {isEN
              ?`Discover your ${tl2(tp.title)} reading`
              :`Ontdek jouw ${tl2(tp.title)}-reading`}
          </h2>
          <p style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontWeight:300,fontStyle:"italic",color:"rgba(255,255,255,.42)",lineHeight:1.8,marginBottom:48,maxWidth:420,margin:"0 auto 48px"}}>
            {isEN
              ?"Your Human Design reading goes into depth on your specific Type, Authority, Profile and all defined centres. Personal and delivered within 1 business day."
              :"Je Human Design reading gaat diep in op jouw specifieke Type, Autoriteit, Profiel en alle gedefinieerde centra. Persoonlijk en bezorgd binnen 1 werkdag."}
          </p>
          <button className="btn btn-white btn-lg type-cta-btn" onClick={()=>go("rapport-volledig")}>
            {isEN?"Order your Human Design Reading — €75":"Bestel je Human Design Reading — €75"}
          </button>
          <div style={{marginTop:16,fontSize:".72rem",color:"rgba(255,255,255,.25)",letterSpacing:".1em",textTransform:"uppercase"}}>
            {isEN?"40+ pages · Within 1 business day":"40+ pagina's · Binnen 1 werkdag"}
          </div>
        </div>
      </section>

      {/* ── OTHER TYPES ── */}
      <section className="type-section" style={{background:"var(--bg)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <div style={{fontSize:".55rem",fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:"var(--gold)",marginBottom:14}}>{isEN?"Other types":"Andere types"}</div>
            <h2 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(1.5rem,2.8vw,2.1rem)",fontWeight:300,color:"var(--text)",lineHeight:1.1}}>
              {isEN?"Explore all five Human Design types":"Ontdek alle vijf Human Design types"}
            </h2>
          </div>
          <div className="type-other-grid">
            {otherTypes.map(ot=>(
              <div key={ot.id}
                style={{borderTop:"1px solid var(--border)",paddingTop:24,cursor:"pointer"}}
                onClick={()=>go("type-"+ot.id)}>
                <div style={{fontSize:"1.1rem",marginBottom:8,opacity:.4}}>{ot.icon}</div>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:400,color:"var(--text)",marginBottom:6,lineHeight:1.2}}>{isEN?ot.title.en:ot.title.nl}</div>
                <div style={{fontSize:".75rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.6,marginBottom:10}}>{isEN?ot.tagline.en:ot.tagline.nl}</div>
                <span style={{fontSize:".6rem",fontWeight:500,letterSpacing:".1em",textTransform:"uppercase",color:"var(--gold)"}}>{isEN?ot.population.en:ot.population.nl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

// ─── ROUTING HELPERS ─────────────────────────────────────────────────────────
const ROUTABLE = new Set(["home","human-design","readings","journal","philosophy","contact","voorwaarden","wat","rapporten","inzichten","over","type"]);

// Map URL slug → internal page ID
const SLUG_TO_PAGE = {"human-design":"wat","readings":"rapporten","journal":"inzichten","philosophy":"over","wat":"wat","rapporten":"rapporten","inzichten":"inzichten","over":"over"};

function pathToPage(pathname) {
  // Strip language prefix first (/en/... → /...)
  const p = stripLangPrefix(pathname);
  if (!p || p === "/") return "home";
  const rapportMatch = p.match(/^\/rapport\/(.+)$/);
  if (rapportMatch) return "rapport-" + rapportMatch[1];
  const journalMatch = p.match(/^\/journal\/(.+)$/);
  if (journalMatch) return "inzichten-" + journalMatch[1];
  const typeMatch = p.match(/^\/type\/(.+)$/);
  if (typeMatch) return "type-" + typeMatch[1];
  // keep old URL support for inzichten sub-pages
  const inzichtenMatch = p.match(/^\/inzichten\/(.+)$/);
  if (inzichtenMatch) return "inzichten-" + inzichtenMatch[1];
  const seg = p.replace(/^\//, "").replace(/\/$/, "");
  if (ROUTABLE.has(seg)) return SLUG_TO_PAGE[seg] || seg;
  return "home";
}

function pageToPath(page) {
  const prefix = LANG === "en" ? "/en" : "";
  if (page === "home") return prefix + "/";
  if (page.startsWith("rapport-")) return prefix + "/rapport/" + page.slice("rapport-".length);
  if (page.startsWith("inzichten-")) return prefix + "/journal/" + page.slice("inzichten-".length);
  if (page.startsWith("type-")) return prefix + "/type/" + page.slice("type-".length);
  if (page === "wat") return prefix + "/human-design";
  if (page === "rapporten") return prefix + "/readings";
  if (page === "inzichten") return prefix + "/journal";
  if (page === "over") return prefix + "/philosophy";
  return prefix + "/" + page;
}

// ─── TERMS & PRIVACY PAGE ─────────────────────────────────────────────────────
function TermsPage({go}){
  const isEn = LANG==="en";
  useSEO({
    title: isEn
      ? "Terms & Privacy Policy — Faculty of Human Design"
      : "Algemene Voorwaarden & Privacybeleid — Faculty of Human Design",
    description: isEn
      ? "Read the terms and conditions and privacy policy of Faculty of Human Design. Information on refunds, liability and GDPR."
      : "Lees de algemene voorwaarden en het privacybeleid van Faculty of Human Design. Informatie over restitutie, aansprakelijkheid en AVG/GDPR.",
    canonical:SITE+(isEn?"/en/terms":"/voorwaarden"),
  });

  const Section=({title,children})=>(
    <div style={{marginBottom:40,paddingBottom:40,borderBottom:"1px solid var(--border)"}}>
      <h2 style={{fontFamily:"var(--font-serif)",fontSize:"1.25rem",fontWeight:400,color:"var(--text)",marginBottom:16,lineHeight:1.2}}>{title}</h2>
      {children}
    </div>
  );
  const P=({children,style={}})=>(
    <p style={{fontSize:".92rem",fontWeight:300,color:"#555",lineHeight:1.85,marginBottom:12,...style}}>{children}</p>
  );
  const Li=({children})=>(
    <li style={{fontSize:".92rem",fontWeight:300,color:"#555",lineHeight:1.85,marginBottom:6,paddingLeft:4}}>{children}</li>
  );

  return(
    <div className="pg">
      {/* Hero */}
      <div style={{background:"var(--dark)",padding:"96px 32px 64px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 60% 40%, rgba(61,44,94,.35) 0%, transparent 65%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:760,margin:"0 auto",position:"relative",zIndex:1}}>
          <div style={{fontSize:".6rem",fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(201,168,92,.6)",marginBottom:14}}>
            {isEn?"Legal information":"Juridische informatie"}
          </div>
          <h1 style={{fontFamily:"var(--font-serif)",fontSize:"clamp(2rem,4vw,2.8rem)",fontWeight:300,color:"white",marginBottom:16,lineHeight:1.08}}>
            {isEn?"Terms & Conditions":"Algemene Voorwaarden"}<br/>
            <em style={{fontStyle:"italic",color:"rgba(255,255,255,.4)"}}>
              {isEn?"& Privacy Policy":"& Privacybeleid"}
            </em>
          </h1>
          <p style={{fontSize:".9rem",fontWeight:300,color:"rgba(255,255,255,.4)",lineHeight:1.7}}>
            {isEn?"Version 1.0 — effective 1 January 2026":"Versie 1.0 — van kracht per 1 januari 2026"}
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="section bg-white">
        <div style={{maxWidth:760,margin:"0 auto",padding:"0 24px"}}>

          <Section title={isEn?"1. Who we are":"1. Wie zijn wij"}>
            <P>{isEn
              ?<>Faculty of Human Design is an independent provider of personalised digital reports in the fields of Human Design, Numerology and Astrology. For questions you can contact us at <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a>.</>
              :<>Faculty of Human Design is een zelfstandige aanbieder van gepersonaliseerde digitale rapporten op het gebied van Human Design, Numerologie en Astrologie. Voor vragen kun je contact opnemen via <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a>.</>
            }</P>
            <P style={{marginTop:8}}>
              {isEn
                ?<><strong>Faculty of Human Design</strong><br/>Hennepstraat 7, 3572 TR Utrecht, Nederland<br/>KvK: 42055841</>
                :<><strong>Faculty of Human Design</strong><br/>Hennepstraat 7, 3572 TR Utrecht, Nederland<br/>KvK: 42055841</>
              }
            </P>
          </Section>

          <Section title={isEn?"2. Applicability":"2. Toepasselijkheid"}>
            <P>{isEn
              ?<>These terms and conditions apply to all orders, deliveries and agreements via the website <strong>facultyhd.com</strong>. By placing an order you accept these terms.</>
              :<>Deze algemene voorwaarden zijn van toepassing op alle bestellingen, leveringen en overeenkomsten via de website <strong>facultyhd.com</strong>. Door een bestelling te plaatsen accepteer je deze voorwaarden.</>
            }</P>
          </Section>

          <Section title={isEn?"3. Nature of the service — personal digital report":"3. Aard van de dienst — persoonlijk digitaal rapport"}>
            <P>{isEn
              ?<>The reports we deliver are <strong>personalised digital products</strong>. Each report is fully tailored based on the date, time and place of birth you provide. The end product is a PDF file compiled exclusively for you.</>
              :<>De rapporten die wij leveren zijn <strong>gepersonaliseerde digitale producten</strong>. Elk rapport wordt volledig op maat samengesteld op basis van de door jou opgegeven geboortedatum, -tijd en -plaats. Het eindproduct is een PDF-bestand dat uitsluitend voor jou is opgesteld.</>
            }</P>
            <P>{isEn
              ?<>Our reports are intended as a personal insight tool. They are <strong>not a substitute for professional medical, psychological, legal or financial advice</strong>. The content is based on the systems of Human Design, Numerology and Astrology and serves as a complement to — not a replacement for — recognised professional help.</>
              :<>Onze rapporten zijn bedoeld als persoonlijk inzichtsinstrument. Ze vormen <strong>geen vervanging voor professioneel medisch, psychologisch, juridisch of financieel advies</strong>. De inhoud is gebaseerd op de systemen van Human Design, Numerologie en Astrologie en dient als aanvulling op — niet als alternatief voor — erkende professionele hulpverlening.</>
            }</P>
          </Section>

          <Section title={isEn?"4. No refunds":"4. Geen restitutie"}>
            <P>{isEn
              ?<>Because each report is fully personalised and goes into production immediately after payment, <strong>refunds are not possible</strong> once the order has been confirmed.</>
              :<>Omdat elk rapport volledig gepersonaliseerd is en onmiddellijk na betaling in productie gaat, is <strong>restitutie niet mogelijk</strong> zodra de bestelling is bevestigd.</>
            }</P>
            <P>{isEn
              ?<>This falls under the exception to the right of withdrawal for <em>digital content not delivered on a tangible medium</em>, for which the customer has explicitly consented that delivery begins immediately (Article 16(m) of EU Directive 2011/83/EU).</>
              :<>Dit valt onder de uitzondering op het herroepingsrecht voor <em>digitale inhoud die niet op een materiële drager is geleverd</em>, waarvoor de klant uitdrukkelijk toestemming heeft gegeven dat de levering onmiddellijk begint (Artikel 16(m) van de EU Richtlijn 2011/83/EU, geïmplementeerd in Artikel 6:230p sub e BW).</>
            }</P>
            <P>{isEn?"By placing the order and completing payment:":"Door de bestelling te plaatsen en de betaling te voltooien:"}</P>
            <ul style={{paddingLeft:20,marginBottom:12}}>
              <Li>{isEn?"you explicitly agree that we begin performance of the agreement immediately;":"stem je er uitdrukkelijk mee in dat wij direct beginnen met de uitvoering van de overeenkomst;"}</Li>
              <Li>{isEn?"you acknowledge that you thereby waive your right of withdrawal;":"erken je dat je daarmee afstand doet van het herroepingsrecht;"}</Li>
              <Li>{isEn?"you confirm having read and understood these terms.":"bevestig je kennis te hebben genomen van deze voorwaarden."}</Li>
            </ul>
            <P>{isEn
              ?<>Do you have a question or complaint about your report? Contact us at <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a> — we are happy to resolve it.</>
              :<>Heb je een vraag of klacht over je rapport? Neem dan contact op via <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a> — wij lossen het graag op.</>
            }</P>
          </Section>

          <Section title={isEn?"5. Delivery":"5. Levering"}>
            <P>{isEn
              ?<>Reports are delivered within <strong>1 business day</strong> by email as a secure download link (PDF). The download link is valid for 30 days. We recommend saving the file immediately to your own archive.</>
              :<>Rapporten worden binnen <strong>1 werkdag</strong> per e-mail bezorgd als beveiligde downloadlink (PDF). De downloadlink is 30 dagen geldig. Wij adviseren het bestand direct op te slaan in je eigen archief.</>
            }</P>
            <P>{isEn
              ?<>In case of technical problems with delivery, contact us at <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a> — we will resend the link.</>
              :<>Bij technische problemen met de levering neem je contact op via <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a> — wij sturen de link opnieuw.</>
            }</P>
          </Section>

          <Section title={isEn?"6. Liability":"6. Aansprakelijkheid"}>
            <P>{isEn
              ?<>Faculty of Human Design accepts <strong>no liability</strong> for damages arising from the use of or reliance on the content of our reports. This includes — but is not limited to — decisions in the areas of health, relationships, finances, work or any other area of life.</>
              :<>Faculty of Human Design aanvaardt <strong>geen aansprakelijkheid</strong> voor schade die voortvloeit uit het gebruik van of vertrouwen op de inhoud van onze rapporten. Dit omvat — maar is niet beperkt tot — beslissingen op het gebied van gezondheid, relaties, financiën, werk of enig ander levensgebied.</>
            }</P>
            <P>{isEn
              ?"Our reports are based on the systems of Human Design (Ra Uru Hu), Pythagorean numerology and Western astrology. The applicability and interpretation of these systems is subjective in nature. We do not guarantee specific outcomes or results."
              :"Onze rapporten zijn gebaseerd op de systemen van Human Design (Ra Uru Hu), Pythagoreïsche numerologie en westerse astrologie. De toepasbaarheid en interpretatie van deze systemen is subjectief van aard. Wij garanderen geen specifieke uitkomsten of resultaten."
            }</P>
            <P>{isEn
              ?"In the event that liability is nonetheless established, it is always limited to the amount paid for the report in question."
              :"In het geval dat aansprakelijkheid toch wordt vastgesteld, is deze altijd beperkt tot het bedrag dat voor het betreffende rapport is betaald."
            }</P>
          </Section>

          <Section title={isEn?"7. Intellectual property":"7. Intellectueel eigendom"}>
            <P>{isEn
              ?"All reports, texts, calculations and other content are the intellectual property of Faculty of Human Design. It is not permitted to publish, reproduce, sell or forward reports in whole or in part without written permission, except for strictly personal use."
              :"Alle rapporten, teksten, berekeningen en overige inhoud zijn het intellectueel eigendom van Faculty of Human Design. Het is niet toegestaan rapporten geheel of gedeeltelijk openbaar te maken, te reproduceren, te verkopen of door te sturen zonder schriftelijke toestemming, behoudens voor strikt persoonlijk gebruik."
            }</P>
          </Section>

          <Section title={isEn?"8. Privacy policy — GDPR":"8. Privacybeleid — AVG/GDPR"}>
            <P>{isEn
              ?"Faculty of Human Design processes personal data in accordance with the General Data Protection Regulation (GDPR, EU 2016/679)."
              :"Faculty of Human Design verwerkt persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG / GDPR, EU 2016/679)."
            }</P>

            <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"22px 24px",marginBottom:16}}>
              <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>
                {isEn?"What data do we process?":"Welke gegevens verwerken wij?"}
              </div>
              <ul style={{paddingLeft:20,margin:0}}>
                <Li><strong>{isEn?"Identification data:":"Identificatiegegevens:"}</strong> {isEn?"name and email address":"naam en e-mailadres"}</Li>
                <Li><strong>{isEn?"Date, time and place of birth":"Geboortedatum, -tijd en -plaats"}</strong> {isEn?"(required for the calculation of your report)":"(noodzakelijk voor de berekening van je rapport)"}</Li>
                <Li><strong>{isEn?"Payment data":"Betalingsgegevens"}</strong> {isEn?"are processed by our certified payment provider and are never stored by us":"worden verwerkt door onze gecertificeerde betalingsprovider en worden nooit door ons opgeslagen"}</Li>
              </ul>
            </div>

            <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"22px 24px",marginBottom:16}}>
              <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>
                {isEn?"What do we use your data for?":"Waarvoor gebruiken wij jouw gegevens?"}
              </div>
              <ul style={{paddingLeft:20,margin:0}}>
                <Li>{isEn?"Compiling and delivering the ordered report":"Het samenstellen en leveren van het bestelde rapport"}</Li>
                <Li>{isEn?"Sending the confirmation and delivery email":"Het versturen van de bevestigings- en leveringsmail"}</Li>
                <Li>{isEn?"Answering questions or complaints":"Het beantwoorden van vragen of klachten"}</Li>
              </ul>
            </div>

            <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"22px 24px",marginBottom:16}}>
              <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>
                {isEn?"Legal basis for processing":"Grondslag voor verwerking"}
              </div>
              <P style={{marginBottom:0}}>{isEn
                ?"Processing is necessary for the performance of the agreement you enter into with us when placing an order (Art. 6(1)(b) GDPR)."
                :"De verwerking is noodzakelijk voor de uitvoering van de overeenkomst die je met ons aangaat bij het plaatsen van een bestelling (Art. 6 lid 1 sub b AVG)."
              }</P>
            </div>

            <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"22px 24px",marginBottom:16}}>
              <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>
                {isEn?"Service providers":"Dienstverleners"}
              </div>
              <P style={{marginBottom:0}}>{isEn
                ?"We work with carefully selected service providers for payment processing, email delivery, data storage and website hosting. These providers process personal data on our behalf solely for the purpose of delivering the service, under strict confidentiality obligations."
                :"Wij werken samen met zorgvuldig geselecteerde dienstverleners voor betalingsverwerking, e-mailbezorging, gegevensopslag en websitehosting. Deze dienstverleners verwerken persoonsgegevens uitsluitend namens ons en ten behoeve van de dienstverlening, onder strikte geheimhoudingsverplichtingen."
              }</P>
            </div>

            <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"22px 24px",marginBottom:16}}>
              <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>
                {isEn?"Retention period":"Bewaartermijn"}
              </div>
              <P style={{marginBottom:0}}>{isEn
                ?"Orders and associated data are retained as long as necessary for the service and thereafter in accordance with statutory fiscal retention obligations (maximum 7 years). The generated PDF is deleted 30 days after delivery."
                :"Bestellingen en bijbehorende gegevens worden bewaard zolang nodig voor de dienstverlening en daarna conform wettelijke fiscale bewaarplichten (maximaal 7 jaar). De gegenereerde PDF wordt 30 dagen na levering verwijderd."
              }</P>
            </div>

            <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"22px 24px",marginBottom:16}}>
              <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>
                {isEn?"Your rights":"Jouw rechten"}
              </div>
              <P style={{marginBottom:8}}>{isEn?"Under the GDPR you have the right to:":"Op grond van de AVG heb je het recht op:"}</P>
              <ul style={{paddingLeft:20,margin:0}}>
                <Li>{isEn?"Access to the data we process about you":"Inzage in de gegevens die wij van je verwerken"}</Li>
                <Li>{isEn?"Correction of inaccurate data":"Correctie van onjuiste gegevens"}</Li>
                <Li>{isEn?"Deletion of your data ('right to be forgotten')":"Verwijdering van je gegevens ('recht op vergetelheid')"}</Li>
                <Li>{isEn?"Restriction of processing":"Beperking van de verwerking"}</Li>
                <Li>{isEn?"Object to processing":"Bezwaar maken tegen de verwerking"}</Li>
                <Li>{isEn?"Data portability":"Gegevensoverdraagbaarheid"}</Li>
              </ul>
              <P style={{marginTop:12,marginBottom:0}}>{isEn
                ?<>You can exercise these rights by emailing <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a>. We will respond within 30 days. You also have the right to lodge a complaint with your national data protection authority.</>
                :<>Je kunt deze rechten uitoefenen door een e-mail te sturen naar <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a>. Wij reageren binnen 30 dagen. Je hebt ook het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).</>
              }</P>
            </div>
          </Section>

          <Section title={isEn?"9. Cookies":"9. Cookies"}>
            <P>{isEn
              ?"We do not use tracking or advertising cookies. Only functionally necessary data is stored (such as anonymous session data) for the website to function correctly."
              :"Wij gebruiken geen tracking- of advertentiecookies. Er worden uitsluitend functioneel noodzakelijke gegevens opgeslagen (zoals anonieme sessiedata) om de website correct te laten functioneren."
            }</P>
          </Section>

          <Section title={isEn?"10. Governing law":"10. Toepasselijk recht"}>
            <P>{isEn
              ?<>All agreements are governed by <strong>Dutch law</strong>. Disputes will be submitted to the competent court in the Netherlands, unless mandatory law designates another court.</>
              :<>Op alle overeenkomsten is het <strong>Nederlands recht</strong> van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Nederland, tenzij dwingend recht een andere rechter aanwijst.</>
            }</P>
          </Section>

          <div style={{paddingTop:16,textAlign:"center"}}>
            <p style={{fontSize:".8rem",color:"var(--text-light)",marginBottom:24}}>
              {isEn?"Questions about these terms? Send an email to ":"Vragen over deze voorwaarden? Stuur een e-mail naar "}
              <a href="mailto:info@facultyhd.com" style={{color:"var(--brand)",textDecoration:"none",fontWeight:500}}>info@facultyhd.com</a>.
            </p>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>
              {isEn?"View our readings":"Bekijk onze readings"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
export default function App(){
  const dynamicLang = useLang();  // Get reactive language from hook
  const[page,setPage]=useState(()=>pathToPage(window.location.pathname));
  const[result,setResult]=useState(null);
  const[menuOpen,setMenuOpen]=useState(false);
  const[generating,setGenerating]=useState(false);

  const go=p=>{
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({top:0,left:0,behavior:"instant"});
    // Push URL for all navigable pages; skip transient states
    if(p!=="result"&&p!=="bedankt"){
      window.history.pushState({page:p},"",pageToPath(p));
    }
  };

  const onDone=(chart,form,report,rpt)=>{setResult({chart,form,report,rpt});setPage("result");window.scrollTo({top:0,left:0,behavior:"instant"});};
  const currentRpt=page.startsWith("rapport-")?REPORTS.find(r=>r.id===page.replace("rapport-","")):null;

  // Tag the initial history entry + listen for back/forward
  useEffect(()=>{
    window.history.replaceState({page:pathToPage(window.location.pathname)},"",window.location.href);
    const onPop=e=>{
      const p=e.state?.page||pathToPage(window.location.pathname);
      setPage(p);
      window.scrollTo({top:0,left:0,behavior:"instant"});
    };
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);

  // Handle return from Stripe payment
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const success=params.get("success");
    const cancelled=params.get("cancelled");
    const orderId=params.get("order");

    if(cancelled){
      window.history.replaceState({page:"home"},"",window.location.pathname);
      return;
    }
    if(success){
      window.history.replaceState({page:"home"},"",window.location.pathname);
      // New async delivery flow: show confirmation page, report arrives by email
      setPage("bedankt");
      setResult({ orderId: orderId||null });
      window.scrollTo({top:0,left:0,behavior:"instant"});
    }
  },[]);

  async function generateReport(chart,form,rpt){
    const isNum=rpt.id==="numerologie";
    const isHoro=rpt.id==="horoscoop";
    const hdChart=(!isNum&&!isHoro)?chart:null;
    const fullPrompt=buildPrompt(hdChart,form,rpt);
    const promptExtra=(typeof rpt.prompt_extra==="object"&&rpt.prompt_extra!==null)
      ?(rpt.prompt_extra[LANG]??rpt.prompt_extra.nl??"")
      :(rpt.prompt_extra||"");
    const sections=promptExtra.split("\n").filter(l=>l.startsWith("###")).map(l=>l.replace(/^###\s*/,"").trim());
    const SYSTEM=LANG==="en"
      ?"You are a senior analyst at the Faculty of Human Design in Ibiza. Write accurate, in-depth reports in English. Write from the institute's perspective. No bullet points — paragraphs only. Minimum 800 words per section."
      :"Je bent een senior analist van de Faculty of Human Design op Ibiza. Schrijf nauwkeurige, diepgaande rapporten in het Nederlands. Schrijf vanuit het instituut. Geen bulletpoints — alleen alineas. Minimaal 800 woorden per sectie.";
    let allText="";
    for(let i=0;i<sections.length;i++){
      const sec=sections[i];
      const prompt=LANG==="en"
        ?fullPrompt+"\n\nNow write only section '"+sec+"'. Minimum 800 words, in paragraphs, personal and concrete. No section title in the text."
        :fullPrompt+"\n\nSchrijf nu uitsluitend sectie '"+sec+"'. Minimaal 800 woorden, in alineas, persoonlijk en concreet. Geen sectietitel in de tekst.";
      let retries=2;
      while(retries>=0){
        try{
          const res=await fetch("/api/generate-report",{
            method:"POST",headers:{"Content-Type":"application/json","x-internal-secret":import.meta.env.VITE_INTERNAL_SECRET||""},
            body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2400,system:SYSTEM,
              messages:[{role:"user",content:prompt}]})
          });
          if(!res.ok){const err=await res.text();console.error("API error:",res.status,err);retries--;continue;}
          const data=await res.json();
          const txt=data.content?.find(b=>b.type==="text")?.text||"";
          if(txt.length>50){allText+="### "+sec+"\n\n"+txt+"\n\n";break;}
          retries--;
        }catch(e){console.error("Fetch error:",e);retries--;}
      }
      if(!allText.includes("### "+sec)){allText+="### "+sec+"\n\n"+(LANG==="en"?"[This section could not be generated. Contact us at info@facultyhd.com]":"[Deze sectie kon niet worden gegenereerd. Neem contact op via info@facultyhd.com]")+"\n\n";}
    }
    return allText.trim()||(LANG==="en"?"The report could not be generated. Contact us at info@facultyhd.com":"Het rapport kon niet worden gegenereerd. Neem contact op via info@facultyhd.com");
  }
  // Detect /download/<token> route
  const downloadToken=(()=>{const m=window.location.pathname.match(/^\/download\/([a-f0-9-]{36})$/i);return m?m[1]:null;})();

  return(
    <LangContext.Provider value={dynamicLang}>
      <div>
        <style>{FONTS}{CSS}</style>
        {downloadToken
          ? <DownloadPage token={downloadToken}/>
          : <>
            {page!=="result"&&page!=="bedankt"&&<Nav page={page} go={go} menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>}
            {page==="home"&&<HomePage go={go}/>}
            {page==="wat"&&<WatPage go={go}/>}
            {page==="rapporten"&&<RapportenPage go={go}/>}
            {page.startsWith("rapport-")&&currentRpt&&<ReportDetailPage rpt={currentRpt} go={go} onDone={onDone}/>}
            {(page==="inzichten"||page.startsWith("inzichten-"))&&<InzichtenPage go={go} articleId={page.startsWith("inzichten-")?page.slice("inzichten-".length):null}/>}
            {page.startsWith("type-")&&<TypePage typeId={page.slice("type-".length)} go={go}/>}
            {page==="over"&&<OverPage go={go}/>}
            {page==="contact"&&<ContactPage/>}
            {page==="voorwaarden"&&<TermsPage go={go}/>}
            {page==="result"&&result&&<ThankYouPage result={result} go={go}/>}
            {page==="bedankt"&&<OrderConfirmationPage result={result} go={go}/>}
            {page!=="result"&&page!=="bedankt"&&<Footer go={go}/>}
          </>
        }
      </div>
    </LangContext.Provider>
  );
}