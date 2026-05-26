import { useState, useEffect, createContext, useContext } from "react";
import { LANG, useLang, t, tl, switchLang, langPath, stripLangPrefix } from './i18n.js';

// ─── LANGUAGE CONTEXT ────────────────────────────────────────────────────────
const LangContext = createContext('nl');
export const useDynamicLang = () => useContext(LangContext);

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');`;

const IMGS = {
  // ── Full-bleed section backgrounds ─────────────────────────────────
  hero:          "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=2400&auto=format&fit=crop&q=82",
  ibiza:         "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&auto=format&fit=crop&q=82",
  cosmos:        "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=2000&auto=format&fit=crop&q=82",
  origin:        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=2000&auto=format&fit=crop&q=82",
  cta:           "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=2000&auto=format&fit=crop&q=82",

  // ── Waarom-anders 3-up visual pillars ──────────────────────────────
  w_precision:   "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&auto=format&fit=crop&q=80",
  w_depth:       "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80",
  // Ibiza: Es Vedrà bij schemering — eigen foto, brandperfect
  w_ibiza:       "/ibiza-es-vedra.jpg",

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
  r_relatie_liefde:  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=900&auto=format&fit=crop&q=80",
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
  --bg: #F7F5F0; --card: #FFFFFF; --dark: #1A1715; --cosmos: #0C0A17; --muted: #F0EDE6;
  --text: #1A1715; --text-muted: #78716C; --text-light: #A8A29E;
  --brand: #3D2C5E; --brand-deep: #241649; --brand-light: #5a4288;
  --gold: #9A8050; --gold-warm: #C9A85C; --gold-pale: rgba(154,128,80,.1);
  --border: #E5E0D8; --white: #FFFFFF;
  --ov-cosmos: rgba(12,10,23,.80); --ov-brand: rgba(36,22,73,.72); --ov-warm: rgba(40,24,8,.52);
  --radius-sm: 6px; --radius-md: 12px; --radius-lg: 18px; --radius-xl: 26px;
  --shadow-sm: 0 1px 4px rgba(0,0,0,.05);
  --shadow-md: 0 4px 20px rgba(0,0,0,.07);
  --shadow-lg: 0 16px 48px rgba(0,0,0,.1);
  --shadow-xl: 0 28px 90px rgba(0,0,0,.13);
  --shadow-gold: 0 4px 20px rgba(154,128,80,.22);
  --shadow-brand: 0 4px 20px rgba(61,44,94,.28);
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
.container { max-width:1240px; margin:0 auto; width:100%; }
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
.feature-price-card { position:absolute; bottom:32px; right:32px; left:32px; background:rgba(12,10,23,.82); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,.1); border-radius:var(--radius-lg); padding:28px; }

/* ORIGIN SECTION */
.origin-section { position:relative; min-height:500px; display:flex; align-items:center; overflow:hidden; }
.origin-section-bg { position:absolute; inset:0; }
.origin-section-bg>img { width:100%; height:100%; object-fit:cover; object-position:center 45%; }
.origin-section-bg::after { content:""; position:absolute; inset:0; background:linear-gradient(105deg,rgba(12,10,23,.94) 0%,rgba(36,22,73,.7) 55%,rgba(12,10,23,.5) 100%); }
.origin-content { position:relative; z-index:2; max-width:1240px; margin:0 auto; padding:96px 32px; width:100%; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
.origin-stat { border-top:1px solid rgba(255,255,255,.12); padding-top:16px; margin-top:24px; display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.origin-stat-n { font-family:var(--font-serif); font-size:2rem; font-weight:300; color:white; line-height:1; }
.origin-stat-l { font-size:.55rem; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.4); margin-top:3px; }

/* PHOTO CTA */
.photo-cta-section { position:relative; overflow:hidden; }
.photo-cta-bg { position:absolute; inset:0; }
.photo-cta-bg>img { width:100%; height:100%; object-fit:cover; object-position:center 60%; filter:saturate(.8); }
.photo-cta-bg::after { content:""; position:absolute; inset:0; background:linear-gradient(135deg,rgba(12,10,23,.93) 0%,rgba(36,22,73,.88) 50%,rgba(12,10,23,.78) 100%); }
.photo-cta-content { position:relative; z-index:1; padding:120px 32px; text-align:center; }

/* BUTTONS */
.btn { display:inline-flex; align-items:center; justify-content:center; gap:8px;
  border:none; border-radius:var(--radius-md); font-family:var(--font-sans);
  font-weight:500; letter-spacing:.05em; transition:all var(--dur) var(--ease); white-space:nowrap; }
.btn-primary { background:var(--brand); color:white; padding:15px 36px; font-size:.92rem; box-shadow:var(--shadow-brand); }
.btn-primary:hover { background:var(--brand-deep); transform:translateY(-2px); box-shadow:0 8px 28px rgba(61,44,94,.42); }
.btn-secondary { background:transparent; color:var(--brand); padding:14px 34px; font-size:.92rem; border:1.5px solid var(--brand); }
.btn-secondary:hover { background:var(--brand); color:white; box-shadow:var(--shadow-brand); }
.btn-white { background:white; color:var(--brand); padding:15px 36px; font-size:.92rem; box-shadow:var(--shadow-md); }
.btn-white:hover { box-shadow:var(--shadow-lg); transform:translateY(-2px); }
.btn-ghost { background:rgba(255,255,255,.1); color:white; padding:14px 34px; font-size:.92rem; border:1px solid rgba(255,255,255,.22); backdrop-filter:blur(8px); }
.btn-ghost:hover { background:rgba(255,255,255,.18); border-color:rgba(255,255,255,.38); }
.btn-gold { background:var(--gold); color:white; padding:15px 36px; font-size:.92rem; }
.btn-gold:hover { background:#876e43; transform:translateY(-2px); box-shadow:var(--shadow-gold); }
.btn-lg { padding:18px 44px; font-size:1rem; }
.btn-sm { padding:10px 22px; font-size:.82rem; }
.btn-full { width:100%; }
.btn:disabled { opacity:.4; cursor:not-allowed; transform:none !important; }

/* CARDS */
.card { background:var(--card); border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden; }

/* REPORT CARDS */
.rcard { background:var(--card); border-radius:var(--radius-xl); border:1px solid var(--border);
  cursor:pointer; transition:all var(--dur) var(--ease); display:flex; flex-direction:column; overflow:hidden;
  box-shadow:var(--shadow-sm); }
.rcard:hover { transform:translateY(-5px); box-shadow:var(--shadow-xl); border-color:transparent; }
.rcard:hover .rcard-img>img { transform:scale(1.07); }
.rcard-img { height:210px; position:relative; overflow:hidden; flex-shrink:0; }
.rcard-img>img { width:100%; height:100%; object-fit:cover; transition:transform 5s var(--ease); }
.rcard-img-ov { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(12,10,23,.08) 0%, rgba(12,10,23,.6) 100%); }
.rcard-img-badge { position:absolute; top:14px; left:14px; background:rgba(12,10,23,.72); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.12); border-radius:100px; padding:4px 12px; font-size:.56rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.82); }
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
.waarom-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-xl); border-color:transparent; }
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
.step-num { width:40px; height:40px; border-radius:50%; background:var(--brand); color:white; font-family:var(--font-serif); font-size:1.1rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
.step-body h4 { font-family:var(--font-serif); font-size:1.1rem; font-weight:400; color:var(--text); margin-bottom:4px; }
.step-body p { font-size:.9rem; font-weight:300; color:var(--text-muted); line-height:1.65; }

/* TESTIMONIAL */
.tcard { background:white; border-radius:var(--radius-lg); border:1px solid var(--border); padding:34px; position:relative; overflow:hidden; transition:box-shadow var(--dur) var(--ease); }
.tcard:hover { box-shadow:var(--shadow-lg); }
.tcard::before { content:'"'; position:absolute; top:16px; left:26px; font-family:var(--font-serif); font-size:6rem; line-height:1; color:var(--gold); opacity:.09; font-style:italic; pointer-events:none; }
.tcard-quote { font-family:var(--font-serif); font-size:1.05rem; font-style:italic; color:var(--text); line-height:1.82; margin-bottom:20px; }
.tcard-author { font-size:.7rem; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--text-light); }
.tcard-report { font-size:.65rem; color:var(--gold); margin-top:3px; }
.stars { color:#D4A017; font-size:.82rem; margin-bottom:14px; letter-spacing:2px; }

/* STAT */
.stat-n { font-family:var(--font-serif); font-size:2.6rem; font-weight:300; color:var(--text); line-height:1; }
.stat-l { font-size:.72rem; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--text-muted); margin-top:4px; }

/* NAV */
.nav { position:fixed; top:0; left:0; right:0; z-index:200; height:72px; background:rgba(248,246,241,.96); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 32px; }
.nav-inner { max-width:1240px; margin:0 auto; width:100%; display:flex; align-items:center; justify-content:space-between; }
.nav-logo { cursor:pointer; }
.nav-logo-main { font-family:var(--font-serif); font-size:1.1rem; font-weight:400; color:var(--text); letter-spacing:.08em; text-transform:uppercase; }
.nav-logo-sub { font-size:.55rem; letter-spacing:.18em; text-transform:uppercase; color:var(--text-light); margin-top:1px; }
.nav-links { display:flex; align-items:center; gap:2px; }
.nav-link { font-size:.78rem; font-weight:400; color:var(--text-muted); padding:8px 14px; border-radius:var(--radius-sm); transition:all 150ms; cursor:pointer; }
.nav-link:hover, .nav-link.active { color:var(--brand); background:rgba(61,44,94,.06); }
.mobile-nav { display:none; }
.nav-cta-wrap { display:flex; align-items:center; gap:8px; }
.mobile-menu { position:fixed; inset:0; background:white; z-index:300; padding:24px; display:flex; flex-direction:column; gap:8px; padding-top:88px; }
.mobile-menu-link { font-size:1.1rem; font-weight:300; color:var(--text); padding:16px 0; border-bottom:1px solid var(--border); cursor:pointer; }
.menu-btn { background:none; border:none; padding:8px; color:var(--text); }

/* HERO */
.hero { min-height:100vh; position:relative; display:flex; align-items:center; overflow:hidden; }
.hero-bg { position:absolute; inset:0; }
.hero-bg>img { width:100%; height:100%; object-fit:cover; object-position:center 30%; }
.hero-bg::after { content:""; position:absolute; inset:0; background:linear-gradient(135deg,rgba(12,10,23,.94) 0%,rgba(36,22,73,.8) 50%,rgba(12,10,23,.65) 100%); }
.hero-fallback { position:absolute; inset:0; background:linear-gradient(135deg,var(--cosmos) 0%,var(--brand-deep) 55%,var(--brand) 100%); }
.hero-stars { position:absolute; inset:0; opacity:.22; pointer-events:none;
  background-image:radial-gradient(circle at 15% 25%, white 1px, transparent 1px),
    radial-gradient(circle at 72% 12%, white 1px, transparent 1px),
    radial-gradient(circle at 38% 55%, white 1px, transparent 1px),
    radial-gradient(circle at 88% 42%, white 1px, transparent 1px),
    radial-gradient(circle at 10% 78%, white 1px, transparent 1px),
    radial-gradient(circle at 52% 88%, white 1px, transparent 1px),
    radial-gradient(circle at 65% 65%, white 1px, transparent 1px);
  background-size:420px 420px,510px 510px,360px 360px,460px 460px,390px 390px,430px 430px,380px 380px; }
.hero-glow { position:absolute; top:-10%; right:-8%; width:60%; height:85%; border-radius:50%; background:radial-gradient(ellipse, rgba(154,128,80,.07) 0%, transparent 60%); pointer-events:none; }
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
.form-select { border:1.5px solid var(--border); background:var(--bg); border-radius:var(--radius-sm); padding:11px 14px; font-family:var(--font-sans); font-size:.95rem; font-weight:300; color:var(--text); outline:none; width:100%; cursor:pointer; }
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
.tag-def { font-size:.68rem; padding:2px 9px; background:var(--brand); color:white; border-radius:100px; }
.tag-open { font-size:.68rem; padding:2px 9px; border:1px solid var(--border); color:var(--text-muted); border-radius:100px; }
.tag-gate { font-size:.65rem; padding:2px 7px; background:rgba(61,44,94,.07); color:var(--brand); border-radius:100px; }
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
.report-section-title { font-family:var(--font-serif); font-size:1.2rem; font-weight:400; color:var(--brand); margin:32px 0 10px; padding-bottom:8px; border-bottom:1px solid var(--border); }
.report-section-title:first-child { margin-top:0; }
.report-section-body { font-size:.88rem; font-weight:300; line-height:1.95; color:#2c2820; white-space:pre-wrap; }

/* UPSELL */
.upsell-card { background:linear-gradient(135deg,#2e1f4e 0%,var(--brand) 100%); border-radius:var(--radius-lg); padding:32px; color:white; margin-top:20px; }
.upsell-label { font-size:.6rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:rgba(154,128,80,.8); margin-bottom:10px; }
.upsell-title { font-family:var(--font-serif); font-size:1.5rem; font-weight:300; color:white; margin-bottom:8px; }
.upsell-sub { font-size:.85rem; font-weight:300; color:rgba(255,255,255,.55); margin-bottom:20px; line-height:1.65; }
.upsell-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
.upsell-item { display:flex; gap:8px; font-size:.8rem; font-weight:300; color:rgba(255,255,255,.7); line-height:1.5; }

/* BLOG */
.blog-card { border-radius:var(--radius-lg); border:1px solid var(--border); background:white; padding:28px; cursor:pointer; transition:all 200ms; margin-bottom:16px; }
.blog-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); border-color:var(--brand); }
.blog-tag { font-size:.6rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); margin-bottom:8px; }
.blog-title { font-family:var(--font-serif); font-size:1.2rem; font-weight:400; color:var(--text); margin-bottom:8px; line-height:1.35; }
.blog-excerpt { font-size:.875rem; font-weight:300; color:var(--text-muted); line-height:1.7; margin-bottom:14px; }
.blog-more { font-size:.68rem; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--brand); }

/* INCLUDES */
.includes-list { list-style:none; display:flex; flex-direction:column; gap:11px; }
.includes-item { display:flex; gap:10px; align-items:flex-start; font-size:.9rem; font-weight:300; color:var(--text-muted); line-height:1.6; }
.includes-num { width:22px; height:22px; border:1px solid var(--border); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.6rem; font-weight:600; color:var(--brand); flex-shrink:0; margin-top:1px; }

/* FAQ */
.faq-item { border-bottom:1px solid var(--border); padding:18px 0; text-align:left; }
.faq-q { font-family:var(--font-serif); font-size:1rem; font-weight:400; color:var(--text); cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:16px; text-align:left; }
.faq-q:hover { color:var(--brand); }
.faq-toggle { font-size:1.2rem; color:var(--brand); flex-shrink:0; transition:transform .25s; }
.faq-toggle.open { transform:rotate(45deg); }
.faq-a { font-size:.875rem; font-weight:300; color:var(--text-muted); line-height:1.85; margin-top:12px; text-align:left; }

/* STICKY MOBILE CTA */
.sticky-cta { display:none; position:fixed; bottom:0; left:0; right:0; z-index:150; padding:12px 16px; background:rgba(248,246,241,.97); backdrop-filter:blur(12px); border-top:1px solid var(--border); }

/* FOOTER */
.footer { background:var(--cosmos); padding:68px 32px 36px; }
.footer-inner { max-width:1240px; margin:0 auto; }
.footer-top { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:48px; padding-bottom:44px; border-bottom:1px solid rgba(255,255,255,.06); }
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

/* SUB CARD */
.sub-card { background:linear-gradient(135deg,var(--brand) 0%,var(--brand-deep) 100%); border-radius:var(--radius-xl); padding:48px; color:white; position:relative; overflow:hidden; }
.sub-card::before { content:""; position:absolute; top:-40%; right:-8%; width:65%; height:170%; background:radial-gradient(ellipse, rgba(201,168,92,.05) 0%, transparent 60%); pointer-events:none; }
.sub-card-body { position:relative; z-index:1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:36px; }
.sub-price { font-family:var(--font-serif); font-size:3rem; font-weight:300; color:white; line-height:1; }
.sub-price-period { font-size:.78rem; color:rgba(255,255,255,.45); margin-top:5px; }

/* DETAIL HERO */
.detail-hero { background:var(--dark); padding:96px 32px 68px; position:relative; overflow:hidden; }
.detail-hero-bg { position:absolute; inset:0; overflow:hidden; z-index:0; }
.detail-hero-bg>img { width:100%; height:100%; object-fit:cover; opacity:.55; }
.detail-hero-bg::after { content:""; position:absolute; inset:0; background:linear-gradient(to bottom, rgba(12,10,23,.38) 0%, rgba(12,10,23,.68) 100%); }
.detail-hero-inner { max-width:1240px; margin:0 auto; display:grid; grid-template-columns:1fr 300px; gap:64px; align-items:start; position:relative; z-index:1; }
.detail-hero-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(154,128,80,.12); border:1px solid rgba(154,128,80,.22); padding:5px 14px; border-radius:100px; font-size:.6rem; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:rgba(201,168,92,.9); margin-bottom:22px; }
.detail-hero-title { font-family:var(--font-serif); font-size:clamp(2rem,4.5vw,3.2rem); font-weight:300; color:white; margin-bottom:14px; line-height:1.07; }
.detail-hero-tagline { font-size:.95rem; font-weight:300; color:rgba(255,255,255,.46); margin-bottom:26px; line-height:1.72; }
.detail-hero-meta { display:flex; gap:20px; flex-wrap:wrap; }
.detail-hero-m { font-size:.6rem; font-weight:500; letter-spacing:.09em; text-transform:uppercase; color:rgba(255,255,255,.26); }
.price-box { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:var(--radius-xl); padding:32px; text-align:center; backdrop-filter:blur(12px); }
.price-box-amount { font-family:var(--font-serif); font-size:3.2rem; font-weight:300; color:white; line-height:1; }
.price-box-period { font-size:.66rem; color:rgba(255,255,255,.36); margin-top:5px; margin-bottom:22px; }

/* RESPONSIVE */
@media (max-width:1100px) {
  .feature-split { grid-template-columns:1fr; }
  .feature-image-wrap { min-height:400px; order:-1; }
  .feature-content { padding:56px 40px; }
  .origin-content { grid-template-columns:1fr; gap:40px; }
  .origin-stat { grid-template-columns:repeat(3,1fr); }
}
@media (max-width:1024px) {
  .detail-hero-inner { grid-template-columns:1fr; }
  .footer-top { grid-template-columns:1fr 1fr; gap:32px; }
  .stat-row-item { padding:20px 18px; }
}
@media (max-width:768px) {
  .nav { padding:0 16px; }
  .nav-links, .nav-cta-wrap { display:none; }
  .mobile-nav { display:flex; }
  .section, .section-md { padding:72px 20px; }
  .section-sm { padding:52px 20px; }
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
  .footer-top { grid-template-columns:1fr; gap:28px; }
  .footer-desc { text-align:center; max-width:100%; }
  .footer-bottom { flex-direction:column; align-items:flex-start; gap:16px; }
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
.cd { background:#F9F8F5; border-radius:20px; border:1px solid #E8E3DB; box-shadow:0 8px 40px rgba(10,26,47,.08),0 2px 8px rgba(10,26,47,.04); overflow:hidden; }
/* Header */
.cd-hdr { padding:22px 28px 18px; border-bottom:1px solid #EBE7E0; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.cd-eyebrow { font-size:.52rem; font-weight:700; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); margin-bottom:5px; }
.cd-title { font-family:var(--font-serif); font-size:1.55rem; font-weight:300; color:#0A1A2F; line-height:1.08; }
.cd-name { font-size:.78rem; font-weight:300; color:rgba(10,26,47,.38); margin-top:3px; }
.cd-hdr-type { font-family:var(--font-serif); font-size:1.4rem; font-weight:300; color:#0A1A2F; line-height:1; }
.cd-hdr-auth { font-size:.56rem; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--text-light); margin-top:3px; }
/* 2-column body */
.cd-body { display:grid; grid-template-columns:1fr 296px; }
/* Left — blueprint panel */
.cd-left { padding:22px 24px 20px; border-right:1px solid #EBE7E0; }
.cd-bp { background:linear-gradient(148deg,#eeeae4 0%,#e4ddd5 60%,#dcd4ca 100%); border-radius:16px; position:relative; overflow:hidden; padding:18px 12px 14px; }
.cd-bp-rings { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
.cd-bp-lbl { font-size:.5rem; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:rgba(10,26,47,.28); text-align:center; margin-bottom:6px; }
.cd-bp-cta { margin-top:10px; display:flex; justify-content:center; }
.cd-pill { display:inline-flex; align-items:center; gap:6px; background:rgba(10,26,47,.07); border:1px solid rgba(10,26,47,.13); border-radius:100px; padding:8px 20px; font-size:.68rem; font-weight:500; letter-spacing:.04em; color:rgba(10,26,47,.58); cursor:pointer; transition:all 200ms var(--ease); white-space:nowrap; }
.cd-pill:hover { background:rgba(10,26,47,.12); color:#0A1A2F; border-color:rgba(10,26,47,.22); }
/* Right — insight cards */
.cd-right { padding:16px 18px; display:flex; flex-direction:column; gap:8px; background:white; }
/* Insight card */
.cd-ic { background:#FAFAF8; border-radius:12px; border:1px solid #EDEBE5; padding:12px 14px; position:relative; transition:transform 180ms var(--ease),box-shadow 180ms var(--ease); overflow:hidden; }
.cd-ic:hover { transform:translateY(-2px); box-shadow:0 5px 18px rgba(10,26,47,.08); }
.cd-ic-top { display:flex; align-items:flex-start; justify-content:space-between; gap:6px; margin-bottom:4px; }
.cd-ic-lbl { font-size:.48rem; font-weight:700; letter-spacing:.22em; text-transform:uppercase; color:var(--text-light); line-height:1.4; }
.cd-ic-ico { font-size:.62rem; opacity:.3; flex-shrink:0; margin-top:1px; }
.cd-ic-val { font-family:var(--font-serif); font-size:1.05rem; font-weight:400; color:#0A1A2F; line-height:1.2; margin-bottom:3px; }
.cd-ic-desc { font-size:.65rem; font-weight:300; color:var(--text-muted); line-height:1.5; }
.cd-ic-bar { position:absolute; left:0; top:0; bottom:0; width:3px; }
/* Integrations section */
.cd-int { padding:20px 28px 24px; border-top:1px solid #EBE7E0; background:#FAFAF8; }
.cd-int-hdr { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:14px; }
.cd-int-ttl { font-family:var(--font-serif); font-size:1.18rem; font-weight:300; color:#0A1A2F; }
.cd-int-lnk { font-size:.58rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--brand); cursor:pointer; opacity:.6; transition:opacity 150ms; }
.cd-int-lnk:hover { opacity:1; }
.cd-int-row { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; }
/* Integration card */
.cd-ic2 { background:white; border-radius:11px; border:1px solid #EDEBE5; padding:14px 16px; transition:transform 180ms var(--ease),box-shadow 180ms var(--ease); }
.cd-ic2:hover { transform:translateY(-2px); box-shadow:0 5px 16px rgba(10,26,47,.07); }
.cd-ic2-lbl { font-size:.48rem; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:var(--text-light); margin-bottom:6px; }
.cd-ic2-val { font-family:var(--font-serif); font-size:.95rem; font-weight:400; color:#0A1A2F; margin-bottom:3px; line-height:1.25; }
.cd-ic2-desc { font-size:.65rem; font-weight:300; color:var(--text-muted); line-height:1.52; }
/* Footer tagline */
.cd-foot { padding:10px 28px; border-top:1px solid #EBE7E0; text-align:center; }
.cd-foot-tag { font-family:var(--font-serif); font-size:.7rem; font-style:italic; color:rgba(10,26,47,.24); letter-spacing:.03em; }
/* Responsive */
@media (max-width:900px) {
  .cd-body { grid-template-columns:1fr; }
  .cd-left { border-right:none; border-bottom:1px solid #EBE7E0; }
  .cd-right { background:#FAFAF8; }
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
const SITE = "https://www.facultyofhumandesign.com";

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
    title:{ nl:"Volledig Human Design Rapport", en:"Complete Human Design Report" },
    price:"€75", priceNum:75,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Begrijp eindelijk wie je werkelijk bent", en:"Finally understand who you truly are" },
    tagline:{ nl:"Je complete persoonlijke blauwdruk", en:"Your complete personal blueprint" },
    intro:{ nl:"Het meest uitgebreide rapport dat wij aanbieden. Een volledige analyse van je Human Design chart — van Type en Autoriteit tot Inkarnatie-Kruis en praktische levensguidance.", en:"The most comprehensive report we offer. A complete analysis of your Human Design chart — from Type and Authority to Incarnation Cross and practical life guidance." },
    includes:["Type, Strategie & Signature","Autoriteit — hoe je beslissingen neemt","Profiel — het verhaal van je leven","Alle 9 centra geanalyseerd","Actieve kanalen & krachten","Poorten — je natuurlijke kwaliteiten","Inkarnatie-Kruis — je levensdoel","Relaties & werk vanuit je design","Praktische guidance 2026–2028"],
    for:{ nl:"Voor iedereen die een diepgaand en volledig inzicht wil in hun Human Design.", en:"For everyone seeking deep and complete insight into their Human Design." },
    sections:12, pages:"40+",
    prompt_extra:{
      nl:"### 1. Je Energetische Blauwdruk\n### 2. Type & Levensstrategie\n### 3. Autoriteit\n### 4. Profiel\n### 5. Gedefinieerde Centra\n### 6. Open Centra & Conditionering\n### 7. Actieve Kanalen\n### 8. Je Poorten\n### 9. Inkarnatie-Kruis\n### 10. Relaties & Verbinding\n### 11. Praktische Guidance 2026-2028\n### 12. Slotanalyse",
      en:"### 1. Your Energetic Blueprint\n### 2. Type & Life Strategy\n### 3. Authority\n### 4. Profile\n### 5. Defined Centers\n### 6. Open Centers & Conditioning\n### 7. Active Channels\n### 8. Your Gates\n### 9. Incarnation Cross\n### 10. Relationships & Connection\n### 11. Practical Guidance 2026-2028\n### 12. Closing Analysis",
    },
    reviews:{
      nl:[
        ["Ik had al eerder iets gelezen over Human Design maar dit rapport bracht het echt tot leven. De sectie over mijn open centra was confronterend en bevrijdend tegelijk — ik herkende zo veel conditionering die ik als 'mezelf' had aangenomen. Drie maanden later lees ik het nog steeds.","Marieke V., Amsterdam"],
        ["Precies wat ik zocht. Geen vage spirituele teksten maar concrete analyse van wie ik ben en hoe ik het beste functioneer.","Thomas D., Antwerpen"],
        ["Het stuk over mijn Inkarnatie-Kruis heeft me echt geraakt. Ik begrijp nu waarom bepaalde dingen in mijn leven steeds terugkomen. De schrijfstijl is ook prettig — persoonlijk, niet droog of technisch.","Sofie M., Utrecht"],
      ],
      en:[
        ["I had read about Human Design before, but this report truly brought it to life. The section about my open centers was both confronting and liberating — I recognised so much conditioning I had assumed was just 'me'. Three months later I still read it.","Marieke V., Amsterdam"],
        ["Exactly what I was looking for. No vague spiritual texts but concrete analysis of who I am and how I function best.","Thomas D., Antwerp"],
        ["The section about my Incarnation Cross really moved me. I now understand why certain things keep returning in my life. The writing style is also pleasant — personal, not dry or technical.","Sofie M., Utrecht"],
      ],
    },
  },
  {
    id:"relatie_liefde", icon:"◎", tag:"",
    title:{ nl:"Relatierapport — Liefde", en:"Relationship Report — Love" },
    price:"€95", priceNum:95,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Meer rust en begrip in je romantische verbinding", en:"More peace and understanding in your romantic connection" },
    tagline:{ nl:"Twee designs in romantische verbinding", en:"Two designs in romantic connection" },
    intro:{ nl:"Een diepgaande analyse van jouw en je partners Human Design charts. Hoe functioneren jullie energetisch als koppel — waar versterken jullie elkaar, waar is de wrijving, en hoe groeien jullie samen?", en:"An in-depth analysis of your and your partner's Human Design charts. How do you function energetically as a couple — where do you strengthen each other, where is the friction, and how do you grow together?" },
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
        ["Mijn partner en ik hadden al jaren moeite met communiceren. Het rapport legde precies uit waarom — onze energietypen botsen op een heel specifieke manier die we nu herkennen en kunnen ombuigen. Dat is goud waard.","Elena & Marc, Gent"],
        ["Ik had dit als verrassing voor mijn partner besteld. We hebben het samen gelezen en waren allebei stil bij hoe accuraat de beschrijving van onze dynamiek was.","Roos & Tim, Amsterdam"],
        ["Verrassend diepgaand. Niet alleen 'jullie vullen elkaar aan' maar echt concrete patronen en waar de wrijving vandaan komt.","Nathalie D., Brugge"],
      ],
      en:[
        ["My partner and I had struggled to communicate for years. The report explained exactly why — our energy types clash in a very specific way that we can now recognise and redirect. That is worth its weight in gold.","Elena & Marc, Ghent"],
        ["I ordered this as a surprise for my partner. We read it together and were both struck by how accurately it described our dynamic.","Roos & Tim, Amsterdam"],
        ["Surprisingly in-depth. Not just 'you complement each other' but truly concrete patterns and where the friction comes from.","Nathalie D., Bruges"],
      ],
    },
  },
  {
    id:"relatie_business", icon:"◈", tag:"",
    title:{ nl:"Relatierapport — Business", en:"Relationship Report — Business" },
    price:"€85", priceNum:85,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Samenwerking die werkt voor jullie allebei", en:"Collaboration that works for both of you" },
    tagline:{ nl:"Twee designs in zakelijke samenwerking", en:"Two designs in professional partnership" },
    intro:{ nl:"Een analyse van twee Human Design charts vanuit zakelijk perspectief. Wie leidt, wie beslist, waar liggen de complementariteiten — en hoe bouwen jullie een samenwerking die werkt voor beiden?", en:"An analysis of two Human Design charts from a professional perspective. Who leads, who decides, where are the complementarities — and how do you build a collaboration that works for both?" },
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
        ["Het rapport liet zien dat mijn partner een Manifestor is en ik een Generator. Dat verklaarde zoveel van onze samenwerking — nu gaan we er bewust mee om.","Lars M., Utrecht"],
        ["Als twee oprichters van een startup is het rapport ons leidraad geworden voor taakverdeling. Concreet, praktisch en verrassend nauwkeurig.","Sara & Joris, Gent"],
      ],
      en:[
        ["I did this with my business partner. The analysis of how we make decisions was remarkably accurate. We now consciously work together differently.","Pieter K., Rotterdam"],
        ["The report showed that my partner is a Manifestor and I am a Generator. That explained so much about our collaboration — now we work with it consciously.","Lars M., Utrecht"],
        ["As two founders of a startup, the report has become our guide for task division. Concrete, practical and surprisingly accurate.","Sara & Joris, Ghent"],
      ],
    },
  },
  {
    id:"relatie_familie", icon:"◇", tag:"",
    title:{ nl:"Relatierapport — Familie", en:"Relationship Report — Family" },
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
    title:{ nl:"Jaarrapport 2026", en:"Annual Report 2026" },
    price:"€55", priceNum:55,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Weet wat er dit jaar van je gevraagd wordt", en:"Know what is asked of you this year" },
    tagline:{ nl:"De energetische thema's van je jaar", en:"The energetic themes of your year" },
    intro:{ nl:"Gebaseerd op je Solar Return — de posities van de planeten op je verjaardag dit jaar. Wat zijn de dominante thema's en kansen?", en:"Based on your Solar Return — the planetary positions on your birthday this year. What are the dominant themes and opportunities?" },
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
    title:{ nl:"Kinderrapport", en:"Child Report" },
    price:"€45", priceNum:45,
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
    title:{ nl:"Loopbaan & Geld Rapport", en:"Career & Money Report" },
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
        ["Het stuk over 'hoe ik geld aantrek' klonk in eerste instantie zweverig maar de uitleg was verrassend praktisch — het gaat over hoe je je werk aanbiedt en op welk moment je ja of nee zegt.","Kevin T., Antwerpen"],
        ["Ik gebruik het rapport nog steeds als naslagwerk bij carrièrebeslissingen. Het geeft me een referentiepunt.","Isabel R., Utrecht"],
      ],
      en:[
        ["After twelve years in employment I was wondering whether to start for myself. The report was very clear: my type and profile suit independent work better, and it also explained why I always feel a little trapped in a team setting. Two months later I had my first client.","Laura M., Amsterdam"],
        ["The section about 'how I attract money' initially sounded vague but the explanation was surprisingly practical — it's about how you present your work and when you say yes or no.","Kevin T., Antwerp"],
        ["I still use the report as a reference for career decisions. It gives me a point of reference.","Isabel R., Utrecht"],
      ],
    },
  },
  {
    id:"numerologie", icon:"∞", tag:"",
    title:{ nl:"Numerologie Rapport", en:"Numerology Report" },
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
        ["Ik was benieuwd of numerologie iets zou toevoegen naast mijn Human Design rapport. Het bleek een andere invalshoek die elkaar goed aanvult — het ene gaat over energie, het andere over levenslessen en patronen.","Frank O., Den Bosch"],
        ["De sectie over mijn persoonlijk jaar was opvallend accuraat voor wat er dit jaar speelt.","Mirjam H., Groningen"],
      ],
      en:[
        ["I have a life path number 11 and always felt different. For the first time I read an explanation that didn't pathologise that but treated it as a gift. That touched something in me.","Vera N., Nijmegen"],
        ["I was curious whether numerology would add something alongside my Human Design report. It turned out to be a different perspective that complements it well — one is about energy, the other about life lessons and patterns.","Frank O., Den Bosch"],
        ["The section about my personal year was strikingly accurate for what is happening this year.","Mirjam H., Groningen"],
      ],
    },
  },
  {
    id:"horoscoop", icon:"☽", tag:"",
    title:{ nl:"Geboortehoroscoop", en:"Birth Horoscope" },
    price:"€75", priceNum:75,
    sub:{ nl:"Eenmalig · Bezorgd binnen 1 werkdag", en:"One-time · Delivered within 1 business day" },
    outcome:{ nl:"Je planeetstanden als persoonlijk kompas", en:"Your planetary positions as a personal compass" },
    tagline:{ nl:"Je complete astrologische chart", en:"Your complete astrological chart" },
    intro:{ nl:"Een volledige geboortehoroscoop op basis van de exacte posities van alle planeten op het moment van je geboorte.", en:"A complete birth horoscope based on the exact positions of all planets at the moment of your birth." },
    includes:["Zonneteken","Ascendant","Maan — je emotionele wereld","Alle 10 planeten in teken & huis","12 huizen geanalyseerd","Belangrijkste aspecten","Midhemel — je roeping","Dominant element & modaliteit"],
    for:{ nl:"Voor wie wil begrijpen hoe de sterren stonden op hun geboortemoment.", en:"For those who want to understand how the stars were positioned at their birth moment." },
    sections:12, pages:"32+",
    prompt_extra:{
      nl:"### 1. Je Astrologische Blauwdruk\n### 2. Zonneteken\n### 3. Ascendant\n### 4. De Maan\n### 5. Mercurius Venus Mars\n### 6. Jupiter Saturnus\n### 7. Buitenste Planeten\n### 8. De Huizen\n### 9. Aspecten\n### 10. Midhemel\n### 11. Guidance 2026-2028\n### 12. Slotanalyse",
      en:"### 1. Your Astrological Blueprint\n### 2. Sun Sign\n### 3. Ascendant\n### 4. The Moon\n### 5. Mercury, Venus & Mars\n### 6. Jupiter & Saturn\n### 7. Outer Planets\n### 8. The Houses\n### 9. Aspects\n### 10. Midheaven\n### 11. Guidance 2026-2028\n### 12. Closing Analysis",
    },
    reviews:{
      nl:[
        ["Ik heb veel horoscopen gelezen maar dit was de eerste die écht inging op de spanning tussen mijn Maan en Ascendant. Dat is precies waar ik mijn leven lang mee worstel. Het voelde alsof iemand mij eindelijk begreep.","Charlotte B., Leiden"],
        ["Diepgaander dan ik had verwacht. Niet alleen de zonnetekens maar alle huizen, aspecten, de Midhemel — een volledig portret. Ik heb het met mijn therapeut gedeeld als extra context.","Bart V., Gent"],
        ["Goed geschreven en toegankelijk, ook als je niet veel weet van astrologie. De kern kwam meteen over.","Yasmine K., Rotterdam"],
      ],
      en:[
        ["I have read many horoscopes but this was the first that truly addressed the tension between my Moon and Ascendant. That is precisely what I have struggled with my whole life. It felt as though someone finally understood me.","Charlotte B., Leiden"],
        ["More in-depth than I expected. Not just sun signs but all the houses, aspects, the Midheaven — a complete portrait. I shared it with my therapist as additional context.","Bart V., Ghent"],
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
        ["Wat ik fijn vind is dat het niet overlaadt met informatie. Eén duidelijke intentie voor de maand, een paar aandachtspunten — dat is genoeg om bewust mee te leven.","Tom S., Breda"],
        ["Vorige maand beschreef het rapport een thema van 'terugkeer naar jezelf'. Ik had net een zware periode achter de rug en het voelde alsof het precies op het juiste moment kwam.","Lisa V., Utrecht"],
      ],
      en:[
        ["I have been a subscriber for eight months now. Every month I read the report in the first week and use the intention as an anchor. It's modest in size but exactly enough.","Noor A., Amsterdam"],
        ["What I appreciate is that it doesn't overwhelm with information. One clear intention for the month, a few points of attention — that's enough to live consciously with.","Tom S., Breda"],
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
      ["Hoe opzegbaar is het abonnement?","Maandelijks opzegbaar, zonder opzegtermijn of verborgen kosten. Je kunt op elk moment stoppen."],
      ["Is elk maandrapport anders?","Ja. Elk rapport is gebaseerd op de planetaire invloeden van die specifieke maand in relatie tot jouw persoonlijke chart. Thema's, kansen en aandachtspunten wisselen elke maand."],
      ["Heb ik ook een Volledig Rapport nodig?","Het maandabonnement is op zichzelf staand. Als je ook een Volledig Rapport hebt, is de maandelijkse guidance nog rijker — omdat je de context van je eigen chart al kent."],
      ["Hoeveel pagina's is een maandrapport?","Gemiddeld 12 pagina's — compact en gericht op de thema's van die maand."],
    ],
    en:[
      ["When do I receive my first monthly report?","Within 1 business day after your first payment. After that you receive a new report every month — aligned with the energetic themes of that specific month and your chart."],
      ["How easy is it to cancel the subscription?","Cancel monthly, without notice period or hidden costs. You can stop at any time."],
      ["Is each monthly report different?","Yes. Each report is based on the planetary influences of that specific month in relation to your personal chart. Themes, opportunities and points of attention change every month."],
      ["Do I also need a Complete Report?","The monthly subscription stands on its own. If you also have a Complete Report, the monthly guidance is even richer — because you already know the context of your own chart."],
      ["How many pages is a monthly report?","On average 12 pages — compact and focused on the themes of that month."],
    ],
  },
};

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

    const orderRes = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: rptId,
        reportTitle: tl(rpt?.title) || rptId,
        language: LANG,
        price: rpt?.priceNum || 75,
        customerName: formData.name,
        customerEmail: formData.email,
        birthData: {
          name: formData.name,
          day: formData.day, month: formData.month, year: formData.year,
          hour: formData.hour, minute: formData.minute,
          place: formData.place,
          lat: formData.lat || null,
          lon: formData.lon || null,
          timezone: formData.timezone || null,
          tz: formData.tz ? parseFloat(formData.tz) : null,
          // Embed calculated chart so Inngest can use it for AI generation
          chart: chartData,
        },
        partnerBirthData: formData.pname ? {
          name: formData.pname,
          day: formData.pday, month: formData.pmonth, year: formData.pyear,
          hour: formData.phour, minute: formData.pminute,
          place: formData.pplace || "",
          lat: formData.plat || null,
          lon: formData.plon || null,
          timezone: formData.ptimezone || null,
          tz: formData.ptz ? parseFloat(formData.ptz) : null,
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

  if(rpt.id==="numerologie"){
    const num=calcNumerology(form.name,parseInt(form.day),parseInt(form.month),parseInt(form.year));
    return["NUMEROLOGIE voor "+form.name,"Naam: "+form.name,"Datum: "+form.day+"-"+form.month+"-"+form.year,"","Levenspad: "+num.lp+" - "+num.lpName,"Uitdrukking: "+num.exp+" - "+num.expName,"Ziel: "+num.soul,"Persoonlijkheid: "+num.pers,"Verjaardag: "+num.bday,"Pers. Jaar 2026: "+num.py,"Rijping: "+num.mat,"Mastergetallen: "+(num.masters.length>0?num.masters.join(", "):"geen"),"",promptExtra].join("\n");
  }
  if(rpt.id==="horoscoop"){
    const h=calcHoroscoop(parseInt(form.year),parseInt(form.month),parseInt(form.day),parseInt(form.hour),parseInt(form.minute||"0"));
    const pStr=Object.entries(h.planets).map(([p,d])=>p+": "+d.degree+"° "+d.sign+" H"+d.house).join(", ");
    return["HOROSCOOP voor "+form.name,"Datum: "+form.day+"-"+form.month+"-"+form.year+" "+form.hour+":"+(form.minute||"00"),"Plaats: "+form.place,"","Ascendant: "+h.ascendant.degree+"° "+h.ascendant.sign,"MC: "+h.mc.degree+"° "+h.mc.sign,"Zon: "+h.sun_sign,"Dom. element: "+h.dom_element,"Planeten: "+pStr,"",promptExtra].join("\n");
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
      "PERSOON 1: "+form.name,
      "Geboortedatum: "+form.day+"-"+form.month+"-"+form.year+(form.hour?" "+form.hour+":"+(form.minute||"00"):""),
      "Geboorteplaats: "+form.place,
      chartLine(c1,form.name),
      "",
      lbl.toUpperCase()+": "+(form.pname||lbl),
      "Geboortedatum: "+form.pday+"-"+form.pmonth+"-"+form.pyear+(form.phour?" "+form.phour+":"+(form.pminute||"00"):""),
      "Geboorteplaats: "+(form.pplace||""),
      chartLine(c2,form.pname||lbl),
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
  return["HD CHART voor "+form.name,"Datum: "+form.day+"-"+form.month+"-"+form.year+(form.hour?" "+form.hour+":"+(form.minute||"00"):""),"Plaats: "+form.place,"","Type: "+chart.type,"Strategie: "+chart.strat,"Autoriteit: "+chart.auth,"Profiel: "+chart.profile,"Inkarnatie-Kruis: Poort "+chart.cross,"Gedefinieerd: "+(chart.definedCenters.join(", ")||"geen"),"Open: "+chart.openCenters.join(", "),"Kanalen: "+(chart.channels.map(c=>c.g1+"-"+c.g2).join(", ")||"geen"),"Poorten: "+chart.allGates.join(", "),"Bewust: "+pStr,"Onbewust: "+dStr,"",promptExtra].join("\n");
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
  const B="#1C2E4A",BL="#2d5080",G="#C9A85C";

  return(
    <svg viewBox="0 0 640 620" style={{width:"100%",maxWidth:440,display:"block",margin:"0 auto",borderRadius:10}}>
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
          <stop offset="0%" stopColor={B} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={B} stopOpacity="0"/>
        </radialGradient>
        <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor={B} floodOpacity="0.18"/>
        </filter>
      </defs>

      {/* Background — transparent so the .cd-bp gradient shows through */}
      <rect width="640" height="620" fill="url(#bg)" rx="10"/>
      <line x1="0" y1="580" x2="640" y2="580" stroke="rgba(10,26,47,.07)" strokeWidth="1"/>

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
            <rect x={tx} y={ty} width={tw} height={26} rx="5" fill={d?B:"#555"} opacity="0.93"/>
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
          <InsightCard label={t("form.typeLabel")} value={chart.type} desc={typeDesc} icon="◈" accentColor="#1C2E4A"/>
          <InsightCard label={t("form.authorityLabel")} value={xlateAuth(chart.auth)} desc={authDesc} icon="◎" accentColor="#C9A85C"/>
          <InsightCard label={t("form.strategyLabel")} value={xlateStrat(chart.strat)} desc={t("form.signaturePrefix")+xlateSig(chart.sig)} icon="◇" accentColor="#9A8050"/>
          <InsightCard label={t("form.profileLabel")} value={chart.profile} desc={t("form.profileDesc")} icon="✦" accentColor="#3D2C5E"/>
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

      {/* Footer */}
      <div className="cd-foot">
        <div className="cd-foot-tag">{t("form.chartFooter")}</div>
      </div>
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
    ["blog",   t("nav.insights")],
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
              <span key={id} className={"nav-link"+(page===id||page.startsWith("rapport-")&&id==="rapporten"?" active":"")} onClick={()=>go(id)}>{label}</span>
            ))}
          </div>
          <div className="nav-cta-wrap">
            {/* Language switcher */}
            <div style={{display:"flex",gap:4,marginRight:4}}>
              {[["nl","🇳🇱"],["en","🇬🇧"]].map(([lng,flag])=>(
                <button key={lng} onClick={()=>switchLang(lng)} style={{
                  background:LANG===lng?"var(--brand)":"transparent",
                  color:LANG===lng?"white":"var(--text-muted)",
                  border:LANG===lng?"1px solid var(--brand)":"1px solid var(--border)",
                  borderRadius:"var(--radius-sm)",
                  padding:"4px 9px",fontSize:".85rem",fontWeight:600,letterSpacing:".08em",
                  cursor:LANG===lng?"default":"pointer",
                  transition:"all 150ms",
                }}>{flag}</button>
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
            {[["nl","🇳🇱"],["en","🇬🇧"]].map(([lng,flag])=>(
              <button key={lng} onClick={()=>switchLang(lng)} style={{
                background:LANG===lng?"var(--brand)":"transparent",
                color:LANG===lng?"white":"var(--text-muted)",
                border:LANG===lng?"1px solid var(--brand)":"1px solid var(--border)",
                borderRadius:"var(--radius-sm)",padding:"6px 14px",
                fontSize:"1rem",fontWeight:600,letterSpacing:".08em",
                cursor:LANG===lng?"default":"pointer",
              }}>{flag}</button>
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
            {REPORTS.slice(0,4).map(r=><span key={r.id} className="footer-link" onClick={()=>go("rapport-"+r.id)}>{tl(r.title)}</span>)}
          </div>
          <div>
            <div className="footer-col-title">{t("footer.infoCol")}</div>
            {[["wat",t("footer.wat")],["over",t("footer.about")],["blog",t("footer.insights")],["contact",t("footer.contact")]].map(([id,l])=>(
              <span key={id} className="footer-link" onClick={()=>go(id)}>{l}</span>
            ))}
          </div>
          <div>
            <div className="footer-col-title">{t("footer.trustCol")}</div>
            <span className="footer-link">{t("footer.safePayment")}</span>
            <span className="footer-link">{t("footer.personalPdf")}</span>
            <span className="footer-link">{t("footer.directDelivery")}</span>
            <span className="footer-link">{t("footer.email")}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">{t("footer.copy")}</div>
          <div className="footer-trust">
            <span className="footer-trust-item" style={{cursor:"pointer"}} onClick={()=>go("voorwaarden")}>{t("footer.terms")}</span>
            <div className="footer-trust-item">{t("footer.ssl")}</div>
            <div className="footer-trust-item">{t("footer.ideal")}</div>
            <div style={{display:"flex",gap:4,marginLeft:8}}>
              {[["nl","🇳🇱"],["en","🇬🇧"]].map(([lng,flag])=>(
                <button key={lng} onClick={()=>switchLang(lng)} style={{
                  background:LANG===lng?"rgba(255,255,255,.15)":"transparent",
                  color:LANG===lng?"white":"rgba(255,255,255,.4)",
                  border:LANG===lng?"1px solid rgba(255,255,255,.25)":"1px solid transparent",
                  borderRadius:"var(--radius-sm)",padding:"2px 7px",fontSize:".9rem",
                  cursor:LANG===lng?"default":"pointer",transition:"all 150ms",
                }}>{flag}</button>
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

// ─── REPORT FORM ──────────────────────────────────────────────────────────────
function ReportForm({rpt,onDone,postPayment}){
  const[form,setForm]=useState({name:"",email:"",day:"",month:"",year:"",hour:"",minute:"",place:"",lat:"",lon:"",timezone:"",tz:"",pname:"",pday:"",pmonth:"",pyear:"",phour:"",pminute:"",pplace:"",plat:"",plon:"",ptimezone:"",ptz:"",cname:"",cday:"",cmonth:"",cyear:"",chour:"",cminute:"",cplace:"",clat:"",clon:"",ctimezone:"",ctz:""});
  const[chart,setChart]=useState(null);
  const[ls,setLs]=useState(0);
  const[pr,setPr]=useState(0);
  const[loading,setLoading]=useState(false);const[autoTrigger,setAutoTrigger]=useState(false);useEffect(()=>{if(!postPayment)return;setChart(postPayment.chart);setForm(f=>({...f,...postPayment.form}));setAutoTrigger(true);},[postPayment]);useEffect(()=>{if(autoTrigger&&chart){setAutoTrigger(false);doReport();}},[autoTrigger,chart]);
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
  const partnerOk=!isRelatie||(form.pname&&form.pday&&form.pmonth&&form.pyear);
  const ok=form.name&&form.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)&&form.day&&form.month&&form.year&&form.place&&(!needsTime||form.hour)&&partnerOk;
  const promptExtraStr=(typeof rpt.prompt_extra==="object"&&rpt.prompt_extra!==null)?(rpt.prompt_extra[LANG]??rpt.prompt_extra.nl??""):(rpt.prompt_extra||"");
  const sections=promptExtraStr.split("\n").filter(l=>l.startsWith("###")).map(l=>l.replace(/^###\s*/,"").trim());

  const doChart=()=>{
    const y=parseInt(form.year),m=parseInt(form.month),d=parseInt(form.day);
    if(!form.name||!d||!m||!y){alert(LANG==="en"?"Please fill in all required fields.":"Vul alle verplichte velden in.");return;}
    if(isNum){const num=calcNumerology(form.name,d,m,y);setChart({...num,isNumerology:true});}
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
    let allText="";
    try{
      for(let i=0;i<sections.length;i++){
        const sec=sections[i];
        setLs(Math.min(i,LSTEPS.length-1));setPr(Math.round((i/sections.length)*95));
        const prompt=LANG==="en"
          ?chartContext+"\n\nWrite section \""+sec+"\" for "+form.name+".\n\nUse exactly the prescribed format:\n1. Start with \"In your chart:\" followed by 3–5 concrete bullets with specific chart data.\n2. Write the core explanation (3–5 sub-paragraphs with subheadings, max ~800 words, each paragraph anchored in chart data).\n3. End with: \"Pitfalls:\", \"Practice:\", \"This week:\", \"Reflection questions:\" — each with exactly 3 items.\n\nNo section title in the text. Close the core explanation with a complete sentence."
          :chartContext+"\n\nSchrijf sectie \""+sec+"\" voor "+form.name+".\n\nGebruik exact het voorgeschreven format:\n1. Begin met \"In jouw chart:\" gevolgd door 3–5 concrete bullets met specifieke chartdata.\n2. Schrijf de kernuitleg (3–5 subparagrafen met subkopjes, max ~800 woorden, elke paragraaf verankerd in chartdata).\n3. Eindig met: \"Valkuilen:\", \"Praktijk:\", \"Deze week:\", \"Reflectievragen:\" — elk met exact 3 items.\n\nGeen sectietitel in de tekst. Sluit de kernuitleg af met een volledige zin.";
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
              <div className="form-group full"><label className="form-label">{LANG==="en"?"Full name":"Volledige naam"}</label><input className="form-input" name="name" value={form.name} onChange={ch} placeholder={LANG==="en"?"First and last name":"Voor- en achternaam"}/></div>
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
                <div className="form-group full"><label className="form-label">{LANG==="en"?"Name":"Naam"} {tl(rpt.partnerLabel)||(LANG==="en"?"partner":"partner")}</label><input className="form-input" name="pname" value={form.pname} onChange={ch} placeholder={(LANG==="en"?"Name ":"Naam ")+(tl(rpt.partnerLabel)||(LANG==="en"?"partner":"partner"))}/></div>
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
                <div className="form-group full"><label className="form-label">{LANG==="en"?"Child's name":"Naam kind"}</label><input className="form-input" name="cname" value={form.cname} onChange={ch} placeholder={LANG==="en"?"Child's name":"Naam kind"}/></div>
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
                    ?<CompositeBodygraph chart1={chart} chart2={c2} name1={form.name} name2={form.pname||lbl}/>
                    :<div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:32,textAlign:"center",marginBottom:20}}>
                      <p className="body-sm" style={{color:"var(--text-light)"}}>{LANG==="en"?`Enter the ${lbl.toLowerCase()}'s details to see the combined chart`:`Vul de gegevens van de ${lbl.toLowerCase()} in om de gecombineerde chart te zien`}</p>
                    </div>}
                  <div className="grid-2" style={{gap:20,marginTop:20,marginBottom:16}}>
                    <HDRow c={chart} name={form.name}/>
                    {c2?<HDRow c={c2} name={form.pname||lbl}/>:
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
                    ?<CompositeBodygraph chart1={chart} chart2={childChart} name1={form.name} name2={form.cname||childLabel}/>
                    :<div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:32,textAlign:"center",marginBottom:20}}>
                      <p className="body-sm" style={{color:"var(--text-light)"}}>{LANG==="en"?"Enter the child's details to see the combined chart":"Vul de gegevens van het kind in om de gecombineerde chart te zien"}</p>
                    </div>}
                  <div className="grid-2" style={{gap:20,marginTop:20,marginBottom:16}}>
                    <HDRow c={chart} name={form.name}/>
                    {childChart?<HDRow c={childChart} name={form.cname||childLabel}/>:
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
                name={form.name}
                onOrder={()=>document.getElementById("bestel")?.scrollIntoView({behavior:"smooth"})}
              />
            )}
            {/* ── Numerologie / Horoscoop: compact table + symbol card ── */}
            {!rpt.id.startsWith("relatie_")&&(chart.isNumerology||chart.isHoroscoop)&&(
            <div className="grid-2" style={{gap:28}}>
              <div>
                <div className="chart-result">
                  <div style={{fontSize:".6rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--text-light)",marginBottom:4}}>{chart.isNumerology?(LANG==="en"?"Numerology":"Numerologie"):(LANG==="en"?"Horoscope":"Horoscoop")}</div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",marginBottom:16}}>{form.name}</div>
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
            <div className="order-block" style={{marginTop:24}}>
              <div className="order-block-title">{LANG==="en"?"Step 3 — Receive your personalised digital blueprint":"Stap 3 — Ontvang je gepersonaliseerde digitale blauwdruk"}</div>
              <div className="order-block-sub">{LANG==="en"?`Chart calculated. Your blueprint contains ${rpt.pages} pages of in-depth personal analysis — custom-assembled and delivered by email within 1 business day.`:`Chart berekend. Je blauwdruk bevat ${rpt.pages} pagina's diepgaande persoonlijke analyse — op maat samengesteld en bezorgd per e-mail binnen 1 werkdag.`}</div>
              <button className="btn btn-white btn-full" onClick={()=>{track("checkout_started",{report:rpt.id,price:rpt.priceNum});goToStripe(rpt.id,chart,form);}}>{t("report.orderBtn",{price:rpt.price})}</button>
              <div style={{marginTop:10}}><TrustStrip light/></div>
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
    title:lang==="en"?"Human Design Report — Personal & In-Depth":"Human Design Rapport — Persoonlijk & Diepgaand",
    description:lang==="en"?"Receive an in-depth, personal Human Design report based on your exact birth data. 40+ pages, Swiss Ephemeris precision, delivered as PDF. Founded on Ibiza in 2014. From €45.":"Ontvang een diepgaand, persoonlijk Human Design rapport op basis van je exacte geboortedata. 40+ pagina's, Swiss Ephemeris precisie, direct als PDF. Opgericht op Ibiza in 2014. Vanaf €45.",
    canonical:SITE+"/",
    jsonLd:{
      "@context":"https://schema.org","@type":"ItemList",
      "name":lang==="en"?"Human Design Reports — Faculty of Human Design":"Human Design Rapporten — Faculty of Human Design",
      "description":lang==="en"?"In-depth personal reports based on Human Design, Numerology and Astrology.":"Diepgaande persoonlijke rapporten op basis van Human Design, Numerologie en Astrologie.",
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
          <img src={IMGS.hero} alt="Sterrenhemel boven Ibiza — Faculty of Human Design persoonlijke blauwdrukken" loading="eager" fetchPriority="high"/>
          {/* Second atmospheric layer: Melkweg gloed voor extra diepte */}
          <img src={IMGS.milkyway} alt="" aria-hidden="true" loading="eager" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 40%",opacity:.28,mixBlendMode:"screen"}}/>
        </div>
        <div className="hero-stars"/>
        <div className="hero-glow"/>
        {/* Subtle gold vignette bottom */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"35%",background:"linear-gradient(to top, rgba(12,10,23,.65) 0%, transparent 100%)",pointerEvents:"none",zIndex:1}}/>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">{lang==="en"?"Faculty of Human Design — Ibiza, Spain":"Faculty of Human Design — Ibiza, Spanje"}</div>
            <h1 className="h1-hero">{lang==="en"?<>Your blueprint.<br/><em>Your truth.</em></>:<>Jouw blauwdruk.<br/><em>Jouw waarheid.</em></>}</h1>
            <p className="hero-subtitle">{lang==="en"?"Uncover who you truly are. An intimate, in-depth portrait delivered as PDF within 1 business day.":"Ontdek wie jij werkelijk bent. Een intiem, diepgaand portret bezorgd als PDF binnen 1 werkdag."}</p>
            <div className="hero-actions" style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:40}}>
              <button className="btn btn-white btn-lg" onClick={()=>{track("hero_cta_click",{location:"hero"});go("rapport-volledig");}}>
                {t("home.heroCta")}
              </button>
            </div>
            <div className="hero-trust">
              {[
                "Swiss Ephemeris — "+( LANG==="en"?"planet positions to the degree":"planeetposities tot op de graad"),
                (LANG==="en"?"Founded 2014 · Ibiza":"Opgericht 2014 · Ibiza"),
              ].map(item=>(
                <div key={item} className="hero-trust-item">{item}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="hero-scroll-line"/>
          <div className="hero-scroll-label">Scroll</div>
        </div>
      </section>

      {/* ── STAT ROW ─────────────────────────────────────────────────────── */}
      <div className="stat-row">
        <div className="stat-row-inner">
          {(LANG==="en"
            ?[["2,400+","Reports delivered"],["4.9 / 5","Average rating"],["2014","Founded in Ibiza"]]
            :[["2.400+","Rapporten uitgebracht"],["4.9 / 5","Gemiddelde beoordeling"],["2014","Opgericht op Ibiza"]]
          ).map(([n,l])=>(
            <div key={l} className="stat-row-item">
              <div className="stat-row-n">{n}</div>
              <div className="stat-row-l">{l}</div>
            </div>
          ))}
          <div className="stat-row-item" style={{position:"relative"}}>
            <div className="stat-row-n" style={{fontSize:"1.2rem",letterSpacing:".04em"}}>Swiss Ephemeris</div>
            <div className="stat-row-l">{LANG==="en"?"Professional standard":"Professionele standaard"}</div>
            <div className="stat-row-ephemeris-desc" style={{fontSize:".6rem",fontWeight:300,color:"var(--text-light)",marginTop:3,maxWidth:172,lineHeight:1.55}}>{LANG==="en"?"Planetary positions accurate to the degree":"Planeetposities tot op de graad nauwkeurig"}</div>
          </div>
        </div>
      </div>

      {/* ── WAAROM ANDERS — 3 visual pillars ─────────────────────────────── */}
      <section className="section-md bg-white">
        <div className="container">
          <div style={{marginBottom:52,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:20}}>
            <div>
              <div className="label" style={{marginBottom:14}}>{t("home.waaromLabel")}</div>
              <h2 className="h2" style={{marginBottom:0,maxWidth:520}}>{t("home.waaromTitle")}</h2>
            </div>
            <div style={{width:48,height:1,background:"var(--gold)",opacity:.5,flexShrink:0,marginBottom:8}}/>
          </div>
          <div className="grid-3">
            {(LANG==="en"?[
              [IMGS.w_precision,"Astronomical precision","Swiss Ephemeris","Every calculation uses Swiss Ephemeris — the professional standard for exact planetary positions to the degree. No rounded tables, no averages."],
              [IMGS.w_depth,    "In-depth analysis",     "40+ pages",      "No bullet points, no generic texts. Extensive paragraphs tailored to your unique combination of Type, Authority and Profile."],
              [IMGS.w_ibiza,    "Ibiza as origin",       "Est. 2014",      "Founded on the island where Ra Uru Hu received the Human Design system in 1987. Every report carries the clarity of that origin."],
            ]:[
              [IMGS.w_precision,"Astronomische precisie","Swiss Ephemeris","Elke berekening gebruikt Swiss Ephemeris — de professionele standaard voor exacte planeetposities tot op de graad. Geen afgeronde tabellen, geen gemiddelden."],
              [IMGS.w_depth,    "Diepgaande analyse",    "40+ pagina's",   "Geen bulletpoints, geen generieke teksten. Uitgebreide alinea's afgestemd op jouw unieke combinatie van Type, Autoriteit en Profiel."],
              [IMGS.w_ibiza,    "Ibiza als oorsprong",   "Est. 2014",      "Opgericht op het eiland waar Ra Uru Hu in 1987 het Human Design systeem ontving. Elk rapport draagt de helderheid van die oorsprong."],
            ]).map(([img,title,badge,desc])=>(
              <div className="waarom-card" key={title}>
                <div className="waarom-card-img">
                  <img src={img} alt={`Faculty of Human Design — ${title}`} loading="lazy"/>
                  <div className="ov-grad-t"/>
                  <div className="waarom-card-badge">{badge}</div>
                </div>
                <div className="waarom-card-body">
                  <h4 className="waarom-card-title">{title}</h4>
                  <p className="body-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEEST GEKOZEN — feature split ───────────────────────────────── */}
      <div className="feature-split">
        <div className="feature-content">
          <div className="label" style={{marginBottom:14}}>{t("home.featuredBadge")}</div>
          <h2 className="h2" style={{marginBottom:18}}>{tl(REPORTS[0].title)}</h2>
          <p className="body-lg" style={{marginBottom:24}}>{tl(REPORTS[0].tagline)}</p>
          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
            {REPORTS[0].includes.slice(0,6).map((item,i)=>(
              <li key={i} style={{display:"flex",gap:12,alignItems:"flex-start",fontSize:".9rem",fontWeight:300,color:"var(--text-muted)"}}>
                <span style={{color:"var(--gold)",flexShrink:0,marginTop:1}}>✦</span>{item}
              </li>
            ))}
          </ul>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
            <button className="btn btn-primary btn-lg" onClick={()=>{track("report_card_click",{report:"volledig",price:75,location:"featured"});go("rapport-volledig");}}>
              {t("report.orderBtn",{price:"€75"})}
            </button>
            <span style={{fontSize:".8rem",color:"var(--text-light)"}}>{LANG==="en"?"40+ pages · Delivered within 1 business day":"40+ pagina's · Bezorgd binnen 1 werkdag"}</span>
          </div>
        </div>
        <div className="feature-image-wrap ph">
          <img src={IMGS.ibiza} alt="Ibiza golden hour" loading="lazy"/>
          <div className="ov" style={{background:"linear-gradient(to bottom,rgba(12,10,23,.1) 0%,rgba(36,22,73,.2) 50%,rgba(12,10,23,.55) 100%)"}}/>
          <div className="feature-price-card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"2.4rem",fontWeight:300,color:"white",lineHeight:1}}>€75</div>
                <div style={{fontSize:".62rem",color:"rgba(255,255,255,.4)",marginTop:4,textTransform:"uppercase",letterSpacing:".08em"}}>{LANG==="en"?"One-time · Within 1 business day":"Eenmalig · Binnen 1 werkdag"}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:".6rem",fontWeight:600,color:"rgba(201,168,92,.8)",textTransform:"uppercase",letterSpacing:".1em"}}>{LANG==="en"?"40+ pages":"40+ pagina's"}</div>
                <div style={{fontSize:".6rem",color:"rgba(255,255,255,.35)",marginTop:2}}>{((typeof REPORTS[0].prompt_extra==="object"?REPORTS[0].prompt_extra[LANG]??REPORTS[0].prompt_extra.nl:REPORTS[0].prompt_extra)||"").split("\n").filter(l=>l.startsWith("###")).length} {t("report.sections")}</div>
              </div>
            </div>
            {(LANG==="en"?[["Exact birth data","Date, time and place"],["Swiss Ephemeris","Astronomical precision"],["I Ching & Kabbalah","64 gates · 9 centers"]]:[["Exacte geboortedata","Datum, tijd en plaats"],["Swiss Ephemeris","Astronomische precisie"],["I Ching & Kabbalah","64 poorten · 9 centra"]]).map(([t,d])=>(
              <div key={t} style={{borderTop:"1px solid rgba(255,255,255,.08)",padding:"10px 0",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:".82rem",fontWeight:300,color:"rgba(255,255,255,.82)"}}>{t}</span>
                <span style={{fontSize:".72rem",color:"rgba(255,255,255,.38)"}}>{d}</span>
              </div>
            ))}
            <button className="btn btn-white btn-full" style={{marginTop:16}} onClick={()=>{track("report_card_click",{report:"volledig",price:75,location:"feature_card"});go("rapport-volledig");}}>
              {t("home.ctaBtn")}
            </button>
          </div>
        </div>
      </div>

      {/* ── ALLE RAPPORTEN ───────────────────────────────────────────────── */}
      <section className="section bg-white" style={{position:"relative",overflow:"hidden"}}>
        {/* Subtiele cosmos achtergrond voor diepte */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
          <img src={IMGS.cosmos_rich} alt="" loading="lazy" aria-hidden="true" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.04,filter:"saturate(.4) hue-rotate(20deg)"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(247,245,240,0) 0%,rgba(247,245,240,.6) 60%,rgba(247,245,240,1) 100%)"}}/>
        </div>
        <div className="container" style={{position:"relative",zIndex:1}}>
          <div style={{marginBottom:56,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:24}}>
            <div>
              <div className="label" style={{marginBottom:14}}>{t("rapporten.eyebrow")}</div>
              <h2 className="h2" style={{marginBottom:0,maxWidth:480}}>{t("rapporten.title")}</h2>
            </div>
            <p className="body-md" style={{maxWidth:320,marginBottom:4,textAlign:"right"}}>{t("rapporten.sub")}</p>
          </div>
          <div className="grid-3">
            {REPORTS.filter(r=>["relatie_liefde","jaar","loopbaan"].includes(r.id)).map(r=>(
              <ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>
            ))}
          </div>
          <div style={{display:"flex",gap:28,justifyContent:"center",alignItems:"center",marginTop:40,flexWrap:"wrap"}}>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>{t("home.viewAll")}</button>
            <span style={{fontSize:".78rem",color:"var(--text-light)"}}>{LANG==="en"?"Numerology · Astrology · Relationship · and more":"Numerologie · Astrologie · Relatierapport · en meer"}</span>
          </div>
        </div>
      </section>

      {/* ── ORIGINE — Ibiza origin section ───────────────────────────────── */}
      <div className="origin-section">
        <div className="origin-section-bg">
          <img src="/ibiza-es-vedra.jpg" alt="Es Vedrà bij schemering — Ibiza, de geboorteplaats van Human Design" loading="lazy"/>
        </div>
        <div className="origin-content" style={{gridTemplateColumns:"1fr",textAlign:"center"}}>
          <div style={{maxWidth:620,margin:"0 auto"}}>
            <div className="label-light" style={{marginBottom:16}}>{LANG==="en"?"The institute":"Het instituut"}</div>
            <h2 className="h2" style={{color:"white",marginBottom:20,lineHeight:1.08}}>{LANG==="en"?"Founded on the island":"Opgericht op het eiland"}<br/><em style={{fontStyle:"italic",color:"rgba(255,255,255,.45)"}}>{LANG==="en"?"where it began":"waar het begon"}</em></h2>
            <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.55)",lineHeight:1.82,marginBottom:28}}>{LANG==="en"?"The Faculty of Human Design was founded in 2014 on Ibiza — the island where Ra Uru Hu received the Human Design system in 1987. Exact astronomical calculation. Personal, in-depth analysis.":"De Faculty of Human Design is in 2014 opgericht op Ibiza — het eiland waar Ra Uru Hu in 1987 het Human Design systeem ontving. Exacte astronomische berekening. Persoonlijke, diepgaande analyse."}</p>
            <button className="btn btn-ghost" onClick={()=>go("over")}>{LANG==="en"?"About our institute":"Over ons instituut"}</button>
            <div className="origin-stat">
              {(LANG==="en"?[["2014","Founded"],["2,400+","Reports"],["4.9","Rating"]]:[["2014","Opgericht"],["2.400+","Rapporten"],["4.9","Beoordeling"]]).map(([n,l])=>(
                <div key={l}>
                  <div className="origin-stat-n">{n}</div>
                  <div className="origin-stat-l">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HOE HET WERKT ────────────────────────────────────────────────── */}
      <section className="section-md bg-muted" style={{position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
          <img src={IMGS.ibiza_white} alt="" loading="lazy" aria-hidden="true" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 55%",opacity:.07,filter:"saturate(.6) brightness(.9)"}}/>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 40%, rgba(61,44,94,.04) 0%, transparent 65%)"}}/>
        </div>
        <div className="container-md" style={{position:"relative",zIndex:1}}>
          <div className="text-center" style={{marginBottom:56}}>
            <div className="label" style={{marginBottom:14}}>{t("home.howLabel")}</div>
            <h2 className="h2">{t("home.howSub")}</h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:28,maxWidth:620,margin:"0 auto"}}>
            <StepCard num="1" title={t("home.step1")} desc={t("home.step1desc")}/>
            <StepCard num="2" title={t("home.step2")} desc={t("home.step2desc")}/>
            <StepCard num="3" title={t("home.step3")} desc={t("home.step3desc")}/>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="section bg-white" style={{position:"relative"}}>
        <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          <img src={IMGS.milkyway} alt="" loading="lazy" aria-hidden="true" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%",opacity:.07,filter:"grayscale(40%) saturate(1.4)"}}/>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%, rgba(247,245,240,0) 30%, rgba(247,245,240,.85) 100%)"}}/>
        </div>
        <div className="container" style={{position:"relative",zIndex:1}}>
          <div className="text-center" style={{marginBottom:56}}>
            <div className="label" style={{marginBottom:14}}>{t("home.testimonialsLabel")}</div>
            <h2 className="h2">{t("home.testimonialsTitle")}</h2>
          </div>
          <div className="grid-3">
            {(lang==="en"?[
              ["I felt emotionally recognised for the first time — not analysed. Something in me landed in the right place.","S. Muller, Utrecht","Full Report","Something in me settled"],
              ["We had struggled to understand each other for years. The report named exactly the patterns we couldn't see ourselves. One evening of reading changed how we speak to each other.","T. and E. Dubois, Antwerp","Relationship Report","More understanding in one evening"],
              ["Three months later I still read it. Every chapter reveals something I had long felt but never been able to name.","M. van den Berg, Amsterdam","Full Report","Read in a single breath"],
            ]:[
              ["Ik voelde me eindelijk emotioneel erkend in plaats van geanalyseerd. Iets in mij raakte op zijn plek.","S. Muller, Utrecht","Volledig Rapport","Iets in mij raakte op zijn plek"],
              ["Wij hadden al jaren moeite om elkaar te begrijpen. Het rapport noemde precies de patronen die wij zelf niet konden zien. Eén avond lezen veranderde hoe wij met elkaar praten.","T. en E. Dubois, Antwerpen","Relatierapport","Meer begrip in één avond"],
              ["Drie maanden later lees ik het nog steeds. Elk hoofdstuk legt iets bloot dat ik al lang voelde maar nooit had kunnen benoemen.","M. van den Berg, Amsterdam","Volledig Rapport","Gelezen in één adem"],
            ]).map(([q,n,r,result])=>(
              <div className="tcard" key={n}>
                <div className="stars" style={{marginBottom:20}}>★★★★★</div>
                <div className="tcard-quote">{q}</div>
                <div style={{display:"flex",gap:10,alignItems:"center",marginTop:20}}>
                  <div style={{width:20,height:1,background:"var(--gold)",opacity:.6,flexShrink:0}}/>
                  <div>
                    <div className="tcard-author">{n}</div>
                    <div className="tcard-report">{r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBSCRIPTION BANNER ──────────────────────────────────────────── */}
      <section className="section-md bg-muted">
        <div className="container-md">
          <div className="sub-card">
            <div className="sub-card-moon">
              <img src={IMGS.sub_moon} alt="" loading="lazy"/>
            </div>
            <div className="sub-card-body">
              <div style={{maxWidth:520}}>
                <div className="label-light" style={{marginBottom:14}}>{LANG==="en"?"Monthly subscription":"Maandabonnement"}</div>
                <h2 className="h2" style={{color:"white",marginBottom:14}}>{t("report.monthlyOffer")}</h2>
                <p style={{fontSize:".95rem",fontWeight:300,color:"rgba(255,255,255,.52)",lineHeight:1.78}}>{LANG==="en"?"Every month a personal report on the energetic themes of that month, tailored to your Human Design chart. Cancel anytime.":"Elke maand een persoonlijk rapport over de energetische thema's van die maand, afgestemd op je Human Design chart. Maandelijks opzegbaar."}</p>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div className="sub-price">€19</div>
                <div className="sub-price-period">{LANG==="en"?"per month":"per maand"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:6,margin:"14px 0 18px",textAlign:"left"}}>
                  <div style={{fontSize:".72rem",color:"rgba(255,255,255,.65)",display:"flex",alignItems:"flex-start",gap:7}}>
                    <span style={{color:"var(--gold-warm)",flexShrink:0,marginTop:1}}>✦</span>
                    <span>{LANG==="en"?"Within 1 business day after payment you receive your monthly report as PDF":"Binnen 1 werkdag na betaling ontvang je je maandrapport als PDF"}</span>
                  </div>
                  <div style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",display:"flex",alignItems:"center",gap:7}}><span style={{color:"var(--gold-warm)",flexShrink:0}}>✦</span>{LANG==="en"?"Average 11 months active":"Gemiddeld 11 maanden actief"}</div>
                </div>
                <button className="btn btn-gold btn-lg" onClick={()=>go("rapport-maandelijks")}>{LANG==="en"?"Start subscription":"Start abonnement"}</button>
                <div style={{fontSize:".66rem",color:"rgba(255,255,255,.32)",marginTop:10,lineHeight:1.5}}>{LANG==="en"?"Cancel anytime · no obligation":"Elk moment opzegbaar · geen verplichting"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO CTA ────────────────────────────────────────────────────── */}
      <div className="photo-cta-section">
        <div className="photo-cta-bg">
          <img src={IMGS.cta} alt="Kosmische sterrenhemel" loading="lazy"/>
        </div>
        <div className="photo-cta-content">
          <div className="divider divider-center" style={{marginBottom:32}}/>
          <h2 className="h2" style={{color:"white",marginBottom:18,maxWidth:600,margin:"0 auto 18px"}}>{t("home.ctaTitle")}</h2>
          <p className="body-lg" style={{color:"rgba(255,255,255,.48)",maxWidth:460,margin:"0 auto 36px"}}>{t("home.ctaSub")}</p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:36}}>
            <button className="btn btn-white btn-lg" onClick={()=>{track("hero_cta_click",{location:"bottom"});go("rapport-volledig");}}>
              {t("home.ctaBtn")}
            </button>
            <button className="btn btn-ghost btn-lg" onClick={()=>go("rapporten")}>{t("home.ctaBtnSecondary")}</button>
          </div>
          <TrustStrip light/>
        </div>
      </div>

      <div className="sticky-cta">
        <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:".78rem",fontWeight:500,color:"var(--text)"}}>{LANG==="en"?"Begin your personal reading":"Begin je persoonlijke lezing"}</div>
            <div style={{fontSize:".68rem",color:"var(--text-muted)"}}>{LANG==="en"?"From €45 · Delivered within 1 business day":"Vanaf €45 · Bezorgd binnen 1 werkdag"}</div>
          </div>
          <button className="btn btn-primary" style={{flexShrink:0,whiteSpace:"nowrap"}} onClick={()=>{track("sticky_cta_click",{});go("rapporten");}}>{LANG==="en"?"Start now →":"Start nu →"}</button>
        </div>
      </div>
    </div>
  );
}

function WatPage({go}){
  const[faq,setFaq]=useState(null);
  const[tab,setTab]=useState("hd");

  const TYPES=LANG==="en"?[
    ["Generator","37%","Wait to respond","Satisfaction","Frustration","The primary energy source of the world. Generators are designed to respond to external impulses — not to initiate. When a Generator acts from a genuine sacral response (an instinctive 'yes' or 'no' from the body), energy flows effortlessly. Acting from others' expectations or from the mind leads to frustration and energy drain."],
    ["Manifesting Generator","33%","Inform, then respond","Satisfaction & Peace","Frustration & Anger","Fast, versatile and multi-dimensional. Manifesting Generators can do multiple things at once and jump non-linearly from step to step. That is not a lack of focus — it is their design. They inform others before acting, then respond to the sacral response, and move at lightning speed. Guilt about 'not finishing' does not fit this type."],
    ["Projector","20%","Wait for the invitation","Success","Bitterness","Born to lead, guide and optimise systems — but only when invited. Projectors have a sharp ability to see through others and situations. Without an invitation their insight meets resistance; with an invitation they can make transformative impact. Their challenge: learning to wait and knowing themselves well before the invitation arrives."],
    ["Manifestor","9%","Inform before acting","Peace","Anger","The only type that can naturally take initiative without first responding or waiting. Manifestors have a closed, compact aura that keeps others at a distance — which can cause resistance. By informing others about what they are about to do (not to ask permission, but to reduce resistance) their energy flows most powerfully."],
    ["Reflector","1%","Wait a lunar cycle","Surprise","Disappointment","The rarest and most unique type. Reflectors have no fixed definition — they are a mirror for the people and environments around them. They experience the world by absorbing and reflecting back the energies of others. Major decisions require a full lunar cycle of 28 days to feel all perspectives."],
  ]:[
    ["Generator","37%","Wacht om te reageren","Bevrediging","Frustratie","De primaire energiebron van de wereld. Generators zijn ontworpen om te reageren op impulsen van buitenaf — niet om te initiëren. Wanneer een Generator handelt vanuit een echte sacrale respons (een instinctief 'ja' of 'nee' vanuit het lichaam), stroomt energie moeiteloos. Handelt hij vanuit de verwachting van anderen of vanuit het hoofd, dan volgt frustratie en energieverlies."],
    ["Manifesting Generator","33%","Informeer, reageer dan","Bevrediging & Vrede","Frustratie & Woede","Snel, veelzijdig en multidimensionaal. Manifesting Generators kunnen meerdere dingen tegelijk en springen niet-lineair van stap naar stap. Dat is geen gebrek aan focus — het is hun design. Ze informeren andere mensen voor ze handelen, reageren dan op de sacrale respons, en bewegen razendsnel. Schuldgevoel over 'niet afmaken' past niet bij dit type."],
    ["Projector","20%","Wacht op de uitnodiging","Succes","Bitterheid","Geboren om te leiden, te begeleiden en systemen te optimaliseren — maar alleen wanneer uitgenodigd. Projectors hebben een scherp vermogen om anderen en situaties te doorgronden. Zonder uitnodiging leidt hun inzicht tot weerstand; met uitnodiging kunnen ze transformatieve impact maken. Hun uitdaging: leren wachten en zichzelf goed kennen voor de uitnodiging komt."],
    ["Manifestor","9%","Informeer voor je handelt","Vrede","Woede","Het enige type dat van nature initiatief kan nemen zonder eerst te reageren of te wachten. Manifestors hebben een gesloten, compacte aura die anderen op afstand houdt — wat kan leiden tot weerstand. Door anderen te informeren over wat ze gaan doen (niet om toestemming te vragen, maar om weerstand te verminderen) stroomt hun energie het krachtigst."],
    ["Reflector","1%","Wacht een maancyclus","Verrassing","Teleurstelling","De zeldzaamste en meest bijzondere type. Reflectors hebben geen vaste definitie — ze zijn een spiegel voor de mensen en omgevingen om hen heen. Ze ervaren de wereld door de energieën van anderen te absorberen en terug te reflecteren. Grote beslissingen vergen een volledige maancyclus van 28 dagen om alle perspectieven te doorvoelen."],
  ];

  const AUTHORITIES=LANG==="en"?[
    ["Emotional","Solar Plexus defined","Never make decisions in the moment. Wait for emotional clarity — that can take hours, sometimes days. 'Sleep on it' is literally the best advice for this type."],
    ["Sacral","Sacral center defined, Solar Plexus open","Speaks through the body: an instinctive 'uh-huh' or 'unh-unh'. Test decisions through direct yes/no questions and listen to the bodily response, not the mind."],
    ["Splenic","Spleen defined, above open","The quietest authority. Speaks once, in the moment. A soft whisper of instinct — trust that first signal, even if you cannot easily explain it."],
    ["Ego / Heart","Heart center defined","Speaks through will and desire. The central question: 'Do I really want this?' Not what others expect, but what you choose from your deepest will."],
    ["G / Self","G-center defined","Finds clarity by speaking aloud with someone you trust — not for advice, but to hear your own voice and feel what is right."],
    ["Mental","Ajna defined, all motor centers open","Exclusive to certain Projectors. Calibrates through conversation and external reflection. Needs trusted people as sounding boards."],
    ["Lunar","Reflectors","Needs a full lunar cycle of 28 days to feel the energy of a decision through all conditions."],
  ]:[
    ["Emotioneel","Solar Plexus gedefinieerd","Neem nooit beslissingen in het moment. Wacht op emotionele helderheid — dat kan uren, soms dagen duren. 'Slaap er eens een nacht over' is voor dit type letterlijk het beste advies."],
    ["Sacraal","Sacraalcentrum gedefinieerd, Solar Plexus open","Spreekt via het lichaam: een instinctief 'uh-huh' of 'unh-unh'. Test beslissingen via directe ja/nee-vragen en luister naar de lichamelijke respons, niet naar het hoofd."],
    ["Splenisch","Milt gedefinieerd, bovenstaande open","De stilste autoriteit. Spreekt eenmalig, in het moment. Een zachte fluistering van instinct — vertrouw dat eerste signaal, ook al kun je het moeilijk verklaren."],
    ["Ego / Hart","Hartcentrum gedefinieerd","Spreekt via wil en verlangen. De centrale vraag: 'Wil ik dit echt?' Niet wat anderen verwachten, maar wat jij vanuit je diepste wil kiest."],
    ["G / Zelf","G-centrum gedefinieerd","Vindt helderheid door hardop te spreken met iemand die je vertrouwt — niet voor advies, maar om je eigen stem te horen en te voelen wat klopt."],
    ["Mentaal","Ajna gedefinieerd, alle motorcentra open","Exclusief voor bepaalde Projectors. Kalibreert via gesprek en externe reflectie. Heeft vertrouwde mensen nodig als klankbord."],
    ["Lunair","Reflectors","Heeft een volledige maancyclus van 28 dagen nodig om de energie van een beslissing door alle condities heen te voelen."],
  ];

  const NUM_KERNGETALLEN=LANG==="en"?[
    ["Life Path Number","Calculated from date of birth","The thread running through your life — your central life lessons and the direction in which you naturally grow. The most fundamental number in your numerological profile."],
    ["Expression Number","Calculated from full name","How you express your talents and gifts in the world. Describes your best contribution to others and to your work."],
    ["Soul Number","Vowels in your name","What your deepest self desires — the inner motivation that is not always visible to the outside world but that strongly influences your choices."],
    ["Personality Number","Consonants in your name","How others see and experience you. The impression you make, the facade you carry."],
    ["Personal Year","Date of birth + current year","Each year has a different energetic quality. The personal year helps you understand which themes are central and when action or rest is appropriate."],
    ["Maturity Number","Life Path + Expression","The number that increasingly influences the second half of your life — the destination toward which you are growing."],
  ]:[
    ["Levenspadgetal","Berekend uit geboortedatum","De rode draad van je leven — je centrale levenslessen en de richting waarin je van nature groeit. Het meest fundamentele getal in je numerologisch profiel."],
    ["Uitdrukkingsgetal","Berekend uit volledige naam","Hoe jij je talenten en gaven uitdrukt in de wereld. Beschrijft je beste bijdrage aan anderen en aan je werk."],
    ["Zielsgetal","Klinkers in je naam","Wat je diepste zelf verlangt — de innerlijke motivatie die niet altijd zichtbaar is voor de buitenwereld maar die je keuzes sterk beïnvloedt."],
    ["Persoonlijkheidsgetal","Medeklinkers in je naam","Hoe anderen jou zien en ervaren. De indruk die je maakt, de façade die je draagt."],
    ["Persoonlijk jaar","Geboortedatum + huidig jaar","Elk jaar heeft een andere energetische kwaliteit. Het persoonlijk jaar helpt je begrijpen welke thema's centraal staan en wanneer actie of rust past."],
    ["Rijpingsgetal","Levenspad + Uitdrukking","Het getal dat je tweede helft van het leven steeds meer beïnvloedt — de bestemming waar je naartoe groeit."],
  ];

  const ASTRO_LAGEN=LANG==="en"?[
    ["Sun — your conscious core","Your sun sign describes the core of your conscious self: how you experience and express your identity. It is the most well-known layer, but only one of ten."],
    ["Ascendant — your first impression","The sign rising on the eastern horizon at your birth hour. Describes how you approach the world and how others first experience you."],
    ["Moon — your emotional world","The planet of your inner life, your habitual patterns and your need for security. The Moon tells you what you need to feel emotionally at home."],
    ["Mercury — thinking and communicating","How you think, process information and communicate. Essential for understanding your learning and communication style."],
    ["Venus — love and values","What attracts you and what you find attractive in relationships, art and material things. Gives insight into how you give and receive love."],
    ["Midheaven — your calling","The highest point of your chart describes your professional destination, your public role and what you want to contribute to the world."],
  ]:[
    ["Zon — je bewuste kern","Je zonneteken beschrijft de kern van je bewuste zelf: hoe je je identiteit beleeft en uitdrukt. Het is de meest bekende laag, maar slechts één van de tien."],
    ["Ascendant — je eerste indruk","Het teken dat op je geboorteuur opkwam aan de oostelijke horizon. Beschrijft hoe je de wereld benadert en hoe anderen je als eerste ervaren."],
    ["Maan — je emotionele wereld","De planeet van je binnenste leven, je gewoontepatronen en je behoefte aan veiligheid. De Maan vertelt wat je nodig hebt om je emotioneel thuis te voelen."],
    ["Mercurius — denken en communiceren","Hoe je denkt, informatie verwerkt en communiceert. Essentieel voor het begrijpen van je leer- en communicatiestijl."],
    ["Venus — liefde en waarden","Wat je aantrekt en aantrekkelijk vindt in relaties, kunst en materiële dingen. Geeft inzicht in hoe je liefde geeft en ontvangt."],
    ["Midhemel — je roeping","Het hoogste punt van je chart beschrijft je professionele bestemming, je publieke rol en wat je wil bijdragen aan de wereld."],
  ];

  const COMBO=LANG==="en"?[
    ["Human Design","Energetic blueprint","Who you are at the level of energy and mechanisms. How you make decisions, how you live with others, what conditioning is and what is authentic.","✦"],
    ["Numerology","Life lessons and patterns","Which themes run through your life, which talents you carry from your name and birth date, and which beliefs you need to overcome.","∞"],
    ["Astrology","Timing and context","How planetary cycles colour the atmosphere of your life — from the character traits in your birth horoscope to the themes of a specific year.","☽"],
  ]:[
    ["Human Design","Energetische blauwdruk","Wie je bent op het niveau van energie en mechanismen. Hoe je beslissingen neemt, hoe je leeft met anderen, wat conditionering is en wat authentiek.","✦"],
    ["Numerologie","Levenslessen en patronen","Welke thema's door je leven heen lopen, welke talenten je meedraagt vanuit je naam en geboortedatum, en welke overtuigingen je te overwinnen hebt.","∞"],
    ["Astrologie","Timing en context","Hoe planetaire cycli de sfeer van je leven kleuren — van de karaktereigenschappen in je geboortehoroscoop tot de thema's van een specifiek jaar.","☽"],
  ];

  const faqs=LANG==="en"?[
    ["What is the basis for calculating a Human Design chart?","All HD charts are calculated using the Meeus ephemeris — the same astronomical algorithms as professional astronomical software. The calculation requires your exact date of birth, time of birth and place of birth."],
    ["Is Human Design the same as a horoscope?","No. A horoscope works primarily with your sun sign and planetary positions at the time of your birth. Human Design uses that same astronomical data but combines it with the I Ching, the Kabbalistic Tree of Life and quantum physics principles into a fundamentally different system."],
    ["What if I don't know my birth time?","The birth time affects some centers and your profile. Check your birth certificate for the most accurate calculation. Without an exact time, Type and Authority are usually still correct."],
    ["Does a Numerology report differ from a Human Design report?","Yes, fundamentally. Numerology works with the numerical values of your name and birth date and describes life lessons, patterns and talents. Human Design works with planetary positions and describes your energetic mechanisms. Both are completely different disciplines that complement each other."],
    ["What does a birth horoscope add to Human Design?","A birth horoscope goes deeper into planetary qualities, aspects and houses that are less central in Human Design. Where HD describes your energetic mechanism, the horoscope describes the qualities of your planetary placements — your Mercury, your Venus, your Moon — as additional layers."],
    ["How quickly will I receive my blueprint?","Your personalised digital blueprint is fully assembled within 3 to 4 minutes based on your chart — and immediately available as a PDF."],
    ["Is it a personal document or a template?","Every blueprint is fully customised based on your specific chart. No two blueprints are identical."],
  ]:[
    ["Op basis waarvan wordt de Human Design chart berekend?","Alle HD charts worden berekend met de Meeus ephemeris — dezelfde astronomische algoritmen als professionele astronomische software. De berekening vereist je exacte geboortedatum, geboortetijd en geboorteplaats."],
    ["Is Human Design hetzelfde als een horoscoop?","Nee. Een horoscoop werkt primair met je zonneteken en planeetposities op je geboortemoment. Human Design gebruikt diezelfde astronomische data maar combineert deze met de I Ching, de Kabbalistische levensboom en kwantumfysische principes tot een fundamenteel ander systeem."],
    ["Wat als ik mijn geboortetijd niet weet?","De geboortetijd beïnvloedt sommige centra en je profiel. Controleer je geboorteakte voor de meest nauwkeurige berekening. Zonder exacte tijd zijn Type en Autoriteit in de meeste gevallen nog steeds correct."],
    ["Verschilt een Numerologie rapport van een Human Design rapport?","Ja, fundamenteel. Numerologie werkt met de numerieke waarden van je naam en geboortedatum en beschrijft levenslessen, patronen en talenten. Human Design werkt met planetaire posities en beschrijft je energetische mechanismen. Beide zijn volledig verschillende disciplines die elkaar aanvullen."],
    ["Wat voegt een geboortehoroscoop toe aan Human Design?","Een geboortehoroscoop gaat dieper in op planetaire kwaliteiten, aspecten en huizen die in Human Design minder centraal staan. Waar HD je energetisch mechanisme beschrijft, beschrijft de horoscoop de kwaliteiten van je planetaire bezetting — je Mercurius, je Venus, je Maan — als aanvullende lagen."],
    ["Hoe snel ontvang ik mijn blauwdruk?","Je gepersonaliseerde digitale blauwdruk is binnen 3 tot 4 minuten volledig samengesteld op basis van jouw chart — en direct beschikbaar als PDF."],
    ["Is het een persoonlijk document of een template?","Elke blauwdruk wordt volledig op maat samengesteld op basis van jouw specifieke chart. Geen twee blauwdrukken zijn identiek."],
  ];

  const TabBtn=({id,label})=>(
    <button onClick={()=>setTab(id)} style={{
      padding:"11px 22px",border:"none",cursor:"pointer",fontFamily:"var(--font-sans)",
      fontSize:".78rem",fontWeight:tab===id?500:300,letterSpacing:".06em",textTransform:"uppercase",
      whiteSpace:"nowrap",flexShrink:0,
      color:tab===id?"var(--brand)":"var(--text-muted)",
      background:tab===id?"white":"transparent",
      borderBottom:tab===id?"2px solid var(--brand)":"2px solid transparent",
      transition:"all 200ms",
    }}>{label}</button>
  );

  useSEO({
    title:LANG==="en"?"What is Human Design? — Types, Authority & Numerology Explained":"Wat is Human Design? — Uitleg Typen, Autoriteit & Numerologie",
    description:LANG==="en"?"Everything about Human Design, Numerology and Astrology. Learn the five types, inner authority, the nine centres and how the three disciplines connect. With in-depth background information.":"Alles over Human Design, Numerologie en Astrologie. Leer de vijf typen, innerlijke autoriteit, de negen centra en hoe de drie disciplines samenhangen. Met diepgaande achtergrondinformatie.",
    canonical:SITE+"/#wat",
    jsonLd: faqLD(faqs)
  });

  return(
    <div className="pg">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="origin-section" style={{minHeight:400}}>
        <div className="origin-section-bg">
          <img src={IMGS.hero} alt="Sterrenhemel" loading="eager"/>
        </div>
        <div className="page-hero-pad">
          <div className="label-light" style={{marginBottom:14}}>{t("wat.eyebrow")}</div>
          <h1 className="h1" style={{color:"white",marginBottom:18,maxWidth:620}}>Human Design,<br/>{LANG==="en"?"Numerology & Astrology":"Numerologie & Astrologie"}</h1>
          <p style={{fontSize:"1.05rem",fontWeight:300,color:"rgba(255,255,255,.5)",maxWidth:540,lineHeight:1.82,marginBottom:32}}>{t("wat.sub")}</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setTab("hd")}>Human Design</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setTab("num")}>{t("wat.tabNum")}</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setTab("astro")}>{t("wat.tabAstro")}</button>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ───────────────────────────────────────────────── */}
      <div style={{background:"white",borderBottom:"1px solid var(--border)",position:"sticky",top:72,zIndex:100}}>
        <div className="tab-scroll">
          <div style={{maxWidth:1240,margin:"0 auto",display:"flex",gap:0,minWidth:"max-content"}}>
            <TabBtn id="hd" label="Human Design"/>
            <TabBtn id="num" label={t("wat.tabNum")}/>
            <TabBtn id="astro" label={t("wat.tabAstro")}/>
            <TabBtn id="combo" label={t("wat.tabCombo")}/>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB: HUMAN DESIGN                                                 */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {tab==="hd"&&<>

        {/* Intro */}
        <section className="section bg-white">
          <div className="container-sm">
            <div className="label" style={{marginBottom:14}}>{t("wat.hdIntroLabel")}</div>
            <h2 className="h2" style={{marginBottom:22}}>{t("wat.hdIntroTitle")}</h2>
            <p className="body-lg" style={{marginBottom:18}}>{t("wat.hdIntroBody1")}</p>
            <p className="body-md" style={{marginBottom:32}}>{t("wat.hdIntroBody2")}</p>
            <div className="grid-2" style={{gap:20}}>
              {(LANG==="en"?[
                ["I Ching","The 64 hexagrams of the Chinese I Ching form the backbone. Each hexagram corresponds to one of the 64 gates in your chart and describes a specific quality of consciousness or energy."],
                ["Kabbalah","The Sefirot of the Jewish Kabbalah — the Tree of Life — provides the structure of the nine energy centers and their interconnections via 36 channels."],
                ["Astrology","The positions of the planets on your birth day and your Design date activate specific gates in your chart. Without astronomical precision there is no accurate calculation."],
                ["Quantum physics","The centers correspond to endocrine glands and neutrino streams. Ra Uru Hu used the discovery of the neutrino as the scientific foundation for information transfer."],
              ]:[
                ["I Ching","De 64 hexagrammen van de Chinese I Ching vormen de ruggengraat. Elk hexagram correspondeert met een van de 64 poorten in je chart en beschrijft een specifieke kwaliteit van bewustzijn of energie."],
                ["Kabbalah","De Sefirot van de Joodse Kabbala — de levensboom — levert de structuur van de negen energiecentra en hun onderlinge verbindingen via 36 kanalen."],
                ["Astrologie","De posities van de planeten op je geboortedag en je Design datum activeren specifieke poorten in je chart. Zonder astronomische precisie geen nauwkeurige berekening."],
                ["Kwantumfysica","De centra corresponderen met hormoonklieren en neutrino-stromen. Ra Uru Hu gebruikte de ontdekking van het neutrino als wetenschappelijk fundament voor informatieoverdracht."],
              ]).map(([t,d])=>(
                <div key={t} style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"24px 28px",borderLeft:"3px solid var(--brand)"}}>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",fontWeight:400,color:"var(--text)",marginBottom:8}}>{t}</div>
                  <p className="body-sm">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Types */}
        <section className="section bg-muted">
          <div className="container-sm">
            <div className="label" style={{marginBottom:14}}>{t("wat.hdTypesLabel")}</div>
            <h2 className="h2" style={{marginBottom:8}}>{t("wat.hdTypesTitle")}</h2>
            <p className="body-md" style={{marginBottom:36}}>{t("wat.hdTypesSub")}</p>
            {TYPES.map(([typeName,pct,strat,sig,notSelf,desc])=>(
              <div key={typeName} style={{borderBottom:"1px solid var(--border)",padding:"28px 0"}}>
                <div className="split-row-lg">
                  <div>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.15rem",fontWeight:400,color:"var(--text)",marginBottom:5}}>{typeName}</div>
                    <div style={{fontSize:".62rem",fontWeight:600,color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>{t("wat.hdTypesPopulation",{pct})}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <div style={{fontSize:".72rem",fontWeight:300,color:"var(--text-muted)"}}><span style={{fontWeight:500,color:"var(--brand)"}}>{t("wat.hdTypesStrategy")}</span>{strat}</div>
                      <div style={{fontSize:".72rem",fontWeight:300,color:"var(--text-muted)"}}><span style={{fontWeight:500,color:"var(--brand)"}}>{t("wat.hdTypesSignature")}</span>{sig}</div>
                      <div style={{fontSize:".72rem",fontWeight:300,color:"var(--text-muted)"}}><span style={{fontWeight:500,color:"#C05252"}}>{t("wat.hdTypesNotSelf")}</span>{notSelf}</div>
                    </div>
                  </div>
                  <p className="body-sm" style={{lineHeight:1.82}}>{desc}</p>
                </div>
              </div>
            ))}
            <div style={{marginTop:36,display:"flex",gap:14,flexWrap:"wrap"}}>
              <button className="btn btn-primary" onClick={()=>go("rapport-volledig")}>{t("wat.hdTypesCta")}</button>
              <button className="btn btn-secondary" onClick={()=>go("rapporten")}>{t("wat.hdTypesAllReports")}</button>
            </div>
          </div>
        </section>

        {/* Autoriteit */}
        <section className="section bg-white">
          <div className="container-sm">
            <div className="label" style={{marginBottom:14}}>{t("wat.hdAuthLabel")}</div>
            <h2 className="h2" style={{marginBottom:12}}>{t("wat.hdAuthTitle")}</h2>
            <p className="body-lg" style={{marginBottom:36}}>{t("wat.hdAuthBody")}</p>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {AUTHORITIES.map(([name,condition,desc],i)=>(
                <div key={name} className="split-row">
                  <div>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:400,color:"var(--text)",marginBottom:4}}>{name}</div>
                    <div style={{fontSize:".6rem",fontWeight:500,color:"var(--gold)",letterSpacing:".08em",textTransform:"uppercase",lineHeight:1.5}}>{condition}</div>
                  </div>
                  <p className="body-sm" style={{lineHeight:1.82}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Centra kort */}
        <section className="section bg-muted">
          <div className="container-sm">
            <div className="label" style={{marginBottom:14}}>{t("wat.hdCentersLabel")}</div>
            <h2 className="h2" style={{marginBottom:12}}>{t("wat.hdCentersTitle")}</h2>
            <p className="body-lg" style={{marginBottom:28}}>{t("wat.hdCentersBody")}</p>
            <div className="grid-4" style={{gap:16}}>
              {(LANG==="en"?[["Head","Inspiration and mental pressure"],["Ajna","Conceptualisation and certainty"],["Throat","Communication and manifestation"],["G/Self","Identity, love and direction"],["Heart/Ego","Will, ego and material success"],["Sacral","Life energy and reproduction"],["Solar Plexus","Emotions and the spiritual wave"],["Spleen","Instinct, health and wellbeing"],["Root","Adrenaline rush and pressure"]]:[["Hoofd","Inspiratie en mentale druk"],["Ajna","Conceptualisering en zekerheid"],["Keel","Communicatie en manifestatie"],["G/Zelf","Identiteit, liefde en richting"],["Hart/Ego","Wil, ego en materieel succes"],["Sacraal","Levensenergie en voortplanting"],["Solar Plexus","Emoties en spirituele golf"],["Milt","Instinct, gezondheid en welzijn"],["Wortel","Adrenalinerush en druk"]]).map(([c,d])=>(
                <div key={c} style={{background:"white",border:"1px solid var(--border)",borderRadius:"var(--radius-md)",padding:"18px 20px"}}>
                  <div style={{fontSize:".58rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--brand)",marginBottom:4}}>{c}</div>
                  <div style={{fontSize:".85rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.6}}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </>}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB: NUMEROLOGIE                                                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {tab==="num"&&<>

        <section className="section bg-white">
          <div className="container">
            <div className="two-col-lg">
              <div>
                <div className="label" style={{marginBottom:14}}>{t("wat.numIntroLabel")}</div>
                <h2 className="h2" style={{marginBottom:22}}>{t("wat.numIntroTitle")}</h2>
                <p className="body-lg" style={{marginBottom:18}}>{LANG==="en"?"Numerology is an ancient system based on the idea that numbers carry not only quantities but also qualities. Every letter of the alphabet has a numerical value. Every day has a number. And those numbers reveal — when correctly calculated — patterns that run through your life.":"Numerologie is een eeuwenoud systeem dat ervan uitgaat dat getallen niet alleen hoeveelheden zijn maar ook kwaliteiten dragen. Elke letter van het alfabet heeft een numerieke waarde. Elke dag heeft een getal. En die getallen onthullen — wanneer je ze juist berekent — patronen die door je leven heen lopen."}</p>
                <p className="body-md" style={{marginBottom:18}}>{LANG==="en"?"The most widely used system is Pythagorean numerology, named after Pythagoras of Samos (c. 570–495 BC), who considered number to be the fundamental reality of the universe. The system works with the nine base digits 1–9 and three special Master Numbers: 11, 22 and 33.":"Het meest gebruikte systeem is de Pythagoreïsche numerologie, vernoemd naar Pythagoras van Samos (ca. 570–495 v.Chr.), die het getal beschouwde als de fundamentele realiteit van het universum. Het systeem werkt met de negen basiscijfers 1–9 en drie bijzondere Mastergetallen: 11, 22 en 33."}</p>
                <p className="body-md" style={{marginBottom:28}}>{LANG==="en"?"Numerology is not about predicting. It is about recognising — seeing patterns in your past, understanding what is asked of you in the present, and gaining clarity about the direction of your future.":"Numerologie gaat niet over voorspellen. Het gaat over herkennen — patronen zien in je verleden, begrijpen wat er van je wordt gevraagd in het heden, en helderheid krijgen over de richting van je toekomst."}</p>
                <button className="btn btn-primary" onClick={()=>go("rapport-numerologie")}>{LANG==="en"?"View Numerology report":"Bekijk Numerologie rapport"}</button>
              </div>
              <div>
                <div style={{borderRadius:"var(--radius-xl)",overflow:"hidden",boxShadow:"var(--shadow-lg)",aspectRatio:"4/3",position:"relative",marginBottom:24}}>
                  <img src={IMGS.r_numerologie} alt="Numerologie" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(12,10,23,.7) 100%)"}}/>
                  <div style={{position:"absolute",bottom:22,left:24,right:24}}>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontStyle:"italic",color:"rgba(255,255,255,.8)",lineHeight:1.6}}>{LANG==="en"?'"Numbers are the essence of all things."':'"Getallen zijn het wezen van alle dingen."'}</div>
                    <div style={{fontSize:".62rem",letterSpacing:".1em",color:"rgba(255,255,255,.4)",textTransform:"uppercase",marginTop:6}}>Pythagoras, {LANG==="en"?"c. 500 BC":"ca. 500 v.Chr."}</div>
                  </div>
                </div>
                <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"22px 24px"}}>
                  <div className="label" style={{marginBottom:12}}>{t("wat.numMasterLabel")} — {t("wat.numMasterTitle")}</div>
                  {(LANG==="en"?[["11","The Master Intuitive — high sensitivity, spiritual antenna, intensity"],["22","The Master Builder — great potential for concrete impact on the world"],["33","The Master Teacher — compassion, responsibility, serving leadership"]]:[["11","De Meester Intuïtief — hoge gevoeligheid, spirituele antenne, intensiteit"],["22","De Meester Bouwer — groot potentieel voor concrete impact op de wereld"],["33","De Meester Leraar — compassie, verantwoordelijkheid, dienend leiderschap"]]).map(([n,d])=>(
                    <div key={n} style={{display:"flex",gap:14,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                      <div style={{fontFamily:"var(--font-serif)",fontSize:"1.4rem",fontWeight:300,color:"var(--brand)",width:28,flexShrink:0,lineHeight:1}}>{n}</div>
                      <div style={{fontSize:".85rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.65}}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-muted">
          <div className="container-sm">
            <div className="label" style={{marginBottom:14}}>{t("wat.numCoreLabel")}</div>
            <h2 className="h2" style={{marginBottom:12}}>{t("wat.numCoreTitle")}</h2>
            <p className="body-md" style={{marginBottom:36}}>{t("wat.numCoreSub")}</p>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {NUM_KERNGETALLEN.map(([naam,bron,desc])=>(
                <div key={naam} className="split-row">
                  <div>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:400,color:"var(--text)",marginBottom:4}}>{naam}</div>
                    <div style={{fontSize:".6rem",fontWeight:500,color:"var(--gold)",letterSpacing:".08em",textTransform:"uppercase",lineHeight:1.5}}>{bron}</div>
                  </div>
                  <p className="body-sm" style={{lineHeight:1.82}}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{marginTop:36}}>
              <button className="btn btn-primary" onClick={()=>go("rapport-numerologie")}>{LANG==="en"?"Order Numerology Report — €65":"Bestel Numerologie Rapport — €65"}</button>
            </div>
          </div>
        </section>

      </>}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB: ASTROLOGIE                                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {tab==="astro"&&<>

        <section className="section bg-white">
          <div className="container">
            <div className="two-col-lg">
              <div>
                <div className="label" style={{marginBottom:14}}>{t("wat.astroIntroLabel")}</div>
                <h2 className="h2" style={{marginBottom:22}}>{t("wat.astroIntroTitle")}</h2>
                <p className="body-lg" style={{marginBottom:18}}>{LANG==="en"?"Western astrology is the study of the positions of the planets at the moment of your birth and their relationship to each other, to the signs of the zodiac and to the twelve houses of your horoscope chart. The premise: the position of the sky at the moment you entered the world reflects the character with which you meet that world.":"Westerse astrologie is het studie van de posities van de planeten op het moment van je geboorte en hun relatie tot elkaar, tot de tekens van de dierenriem en tot de twaalf huizen van je horoscoopkaart. Het uitgangspunt: de stand van de hemel op het moment dat je de wereld binnentrad, weerspiegelt het karakter waarmee je die wereld tegemoet treedt."}</p>
                <p className="body-md" style={{marginBottom:18}}>{LANG==="en"?"Astrology is not a predictive art but a system of symbolic correspondence. Jupiter in Capricorn describes something different from Jupiter in Pisces. A strongly occupied seventh house tells something different from an empty one. No two birth horoscopes are identical — not even those of twins, because the house division shifts with every passing hour.":"Astrologie is geen voorspellingskunst maar een systeem van symbolische correspondentie. Jupiter in Steenbok beschrijft iets anders dan Jupiter in Vissen. Een sterk bezette zevende huis vertelt iets anders dan een lege. Geen twee geboortehoroscopen zijn identiek — zelfs niet die van een tweeling, omdat de huisverdeling verschuift met elk voorbijgaand uur."}</p>
                <p className="body-md" style={{marginBottom:28}}>{LANG==="en"?"Our birth horoscope analyses all ten planets, the twelve houses, the Ascendant, the Midheaven and the most important aspects — the angles that planets make with each other. This gives a complete, layered portrait.":"Onze geboortehoroscoop analyseert alle tien planeten, de twaalf huizen, de Ascendant, het Midhemel en de belangrijkste aspecten — de hoeken die planeten met elkaar maken. Dat geeft een compleet, gelaagd portret."}</p>
                <button className="btn btn-primary" onClick={()=>go("rapport-horoscoop")}>{LANG==="en"?"View Birth Horoscope report":"Bekijk Geboortehoroscoop rapport"}</button>
              </div>
              <div>
                <div style={{borderRadius:"var(--radius-xl)",overflow:"hidden",boxShadow:"var(--shadow-lg)",aspectRatio:"4/3",position:"relative",marginBottom:24}}>
                  <img src={IMGS.r_horoscoop} alt="Astrologie nachtelijke hemel" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 45%,rgba(12,10,23,.75) 100%)"}}/>
                  <div style={{position:"absolute",bottom:22,left:24,right:24}}>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontStyle:"italic",color:"rgba(255,255,255,.8)",lineHeight:1.6}}>"Als boven, zo beneden — als binnen, zo buiten."</div>
                    <div style={{fontSize:".62rem",letterSpacing:".1em",color:"rgba(255,255,255,.4)",textTransform:"uppercase",marginTop:6}}>Hermetisch principe, ca. 3e eeuw</div>
                  </div>
                </div>
                <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"22px 24px"}}>
                  <div className="label" style={{marginBottom:12}}>{LANG==="en"?"The three key elements":"De drie sleutelelementen"}</div>
                  {(LANG==="en"?[["Signs","The 12 signs of the zodiac give quality to the planets within them — Aries is active and initiating, Taurus is patient and sensory, and so on."],["Houses","The 12 houses divide the horoscope chart into areas of life: house 1 is identity and body, house 7 is partnerships, house 10 is career and public role."],["Aspects","The angles between planets — conjunction, opposition, trine, square — describe tension or harmony between the energies they represent."]]:[["Tekens","De 12 tekens van de dierenriem geven kwaliteit aan de planeten die er in staan — Ram is actief en initiërend, Stier is geduldig en sensorisch, enzovoort."],["Huizen","De 12 huizen verdelen de horoscoopkaart in levensterreinen: huis 1 is identiteit en lichaam, huis 7 is partnerschappen, huis 10 is carrière en publieke rol."],["Aspecten","De hoeken tussen planeten — conjunctie, oppositie, trine, vierkant — beschrijven spanning of harmonie tussen de energieën die zij vertegenwoordigen."]]).map(([n,d])=>(
                    <div key={n} style={{padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                      <div style={{fontSize:".82rem",fontWeight:500,color:"var(--text)",marginBottom:4}}>{n}</div>
                      <div style={{fontSize:".82rem",fontWeight:300,color:"var(--text-muted)",lineHeight:1.65}}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-muted">
          <div className="container-sm">
            <div className="label" style={{marginBottom:14}}>{t("wat.astroLayersLabel")}</div>
            <h2 className="h2" style={{marginBottom:12}}>{t("wat.astroLayersTitle")}</h2>
            <p className="body-md" style={{marginBottom:36}}>{t("wat.astroLayersSub")}</p>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {ASTRO_LAGEN.map(([naam,desc])=>(
                <div key={naam} className="split-row">
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:400,color:"var(--text)",lineHeight:1.3}}>{naam}</div>
                  <p className="body-sm" style={{lineHeight:1.82}}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{marginTop:36}}>
              <button className="btn btn-primary" onClick={()=>go("rapport-horoscoop")}>{LANG==="en"?"Order Birth Horoscope — €75":"Bestel Geboortehoroscoop — €75"}</button>
            </div>
          </div>
        </section>

      </>}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB: HOE ZE SAMENHANGEN                                           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {tab==="combo"&&<>

        <section className="section bg-white">
          <div className="container-sm">
            <div className="label" style={{marginBottom:14}}>{t("wat.comboDisciplinesLabel")}</div>
            <h2 className="h2" style={{marginBottom:22}}>{t("wat.comboDisciplinesTitle")}</h2>
            <p className="body-lg" style={{marginBottom:18}}>{LANG==="en"?"Human Design, Numerology and Astrology are three completely independent disciplines each with their own methodology, calculation and vocabulary. They do not speak the same language — and that is precisely their strength when you place them side by side.":"Human Design, Numerologie en Astrologie zijn drie volledig zelfstandige disciplines met elk hun eigen methodologie, berekening en vocabulaire. Ze spreken niet dezelfde taal — en dat is precies hun kracht als je ze naast elkaar legt."}</p>
            <p className="body-md" style={{marginBottom:36}}>{LANG==="en"?"Each discipline illuminates a different layer of the same person. Where Human Design describes your energetic mechanism, Numerology describes your life lessons and Astrology the qualities of your planetary placements. Someone who studies all three gets a portrait with a depth that no single system can offer alone.":"Elke discipline verlicht een andere laag van dezelfde persoon. Waar Human Design je energetisch mechanisme beschrijft, beschrijft Numerologie je levenslessen en Astrologie de kwaliteiten van je planetaire bezetting. Iemand die alle drie bestudeert, krijgt een portret met een diepte die geen enkel systeem afzonderlijk kan bieden."}</p>
            <div style={{display:"flex",flexDirection:"column",gap:20,marginBottom:40}}>
              {COMBO.map(([naam,ondertitel,desc,ico])=>(
                <div key={naam} style={{display:"flex",gap:24,padding:"24px",background:"var(--muted)",borderRadius:"var(--radius-lg)",alignItems:"flex-start"}}>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"2rem",color:"var(--brand)",opacity:.6,flexShrink:0,width:36,textAlign:"center",lineHeight:1}}>{ico}</div>
                  <div>
                    <div style={{display:"flex",gap:12,alignItems:"baseline",marginBottom:6,flexWrap:"wrap"}}>
                      <div style={{fontFamily:"var(--font-serif)",fontSize:"1.15rem",fontWeight:400,color:"var(--text)"}}>{naam}</div>
                      <div style={{fontSize:".6rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--gold)"}}>{ondertitel}</div>
                    </div>
                    <p className="body-sm" style={{lineHeight:1.82}}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"var(--brand)",borderRadius:"var(--radius-xl)",padding:"36px",color:"white"}}>
              <div className="label-light" style={{marginBottom:12}}>{LANG==="en"?"Practical example":"Praktisch voorbeeld"}</div>
              <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.75)",lineHeight:1.85,marginBottom:20}}>{LANG==="en"?"Consider: you are a Generator (HD) with a Life Path Number 7 (Numerology) and a strongly occupied eighth house (Astrology). Human Design says you wait for sacral responses. Numerology says you need deep research and withdrawal to thrive. Astrology says that transformation, hidden knowledge and profound experiences are central themes. Together they sketch a profile of someone who does not need to be visibly active to make impact — who draws their strength from depth and response, not from initiative and visibility.":"Stel: je bent een Generator (HD) met een Levenspadgetal 7 (Numerologie) en een sterk bezette achtste huis (Astrologie). Human Design zegt dat je wacht op sacrale responsen. Numerologie zegt dat je diep onderzoek en teruggetrokkenheid nodig hebt om te gedijen. Astrologie zegt dat transformatie, verborgen kennis en diepgaande ervaringen centrale thema's zijn. Samen tekenen ze een profiel van iemand die niet zichtbaar actief hoeft te zijn om impact te maken — die zijn kracht haalt uit verdieping en respons, niet uit initiatief en zichtbaarheid."}</p>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <button className="btn btn-white" onClick={()=>go("rapport-volledig")}>{LANG==="en"?"Full HD Report":"Volledig HD Rapport"}</button>
                <button className="btn btn-ghost" onClick={()=>go("rapporten")}>{LANG==="en"?"All reports":"Alle rapporten"}</button>
              </div>
            </div>
          </div>
        </section>

      </>}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-sm">
          <div className="label" style={{marginBottom:14}}>{t("wat.faqLabel")}</div>
          <h2 className="h2" style={{marginBottom:36}}>{t("wat.faqTitle")}</h2>
          {faqs.map(([q,a],i)=>(
            <div className="faq-item" key={i}>
              <div className="faq-q" onClick={()=>setFaq(faq===i?null:i)}>{q}<span className={"faq-toggle"+(faq===i?" open":"")}>+</span></div>
              {faq===i&&<div className="faq-a">{a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="section bg-muted">
        <div className="container-md text-center">
          <div className="label" style={{marginBottom:14}}>{t("wat.faqCtaLabel")}</div>
          <h2 className="h2" style={{marginBottom:18}}>{t("wat.faqCtaTitle")}</h2>
          <p className="body-lg" style={{maxWidth:460,margin:"0 auto 32px"}}>{t("wat.faqCtaBody")}</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-primary btn-lg" onClick={()=>go("rapport-volledig")}>{t("wat.faqCtaBtn")}</button>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>{t("wat.faqCtaAll")}</button>
          </div>
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
    title:LANG==="en"?"Human Design Reports — Choose your personal analysis":"Human Design Rapporten — Kies je persoonlijke analyse",
    description:LANG==="en"?"Choose from 10 in-depth reports: Full Human Design, Relationship Report, Career, Year, Child, Numerology and Birth Horoscope. Personal and delivered within 1 business day. From €45.":"Kies uit 10 diepgaande rapporten: Volledig Human Design, Relatierapport, Loopbaan, Jaar, Kind, Numerologie en Geboortehoroscoop. Persoonlijk en bezorgd binnen 1 werkdag. Vanaf €45.",
    canonical:SITE+"/#rapporten",
    jsonLd:{
      "@context":"https://schema.org","@type":"ItemList",
      "name":LANG==="en"?"Human Design Reports":"Human Design Rapporten",
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
      <div className="origin-section" style={{minHeight:360}}>
        <div className="origin-section-bg">
          <img src={IMGS.cosmos} alt="Kosmos" loading="eager"/>
        </div>
        <div className="page-hero-pad" style={{paddingTop:100,paddingBottom:72}}>
          <div className="label-light" style={{marginBottom:14}}>{t("rapporten.eyebrow")}</div>
          <h1 className="h1" style={{color:"white",marginBottom:16,maxWidth:580}}>{t("rapporten.title")}</h1>
          <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.5)",maxWidth:480,lineHeight:1.78}}>{t("rapporten.sub")}</p>
        </div>
      </div>
      <section className="section bg-muted">
        <div className="container">

          {/* Human Design */}
          <div className="label" style={{marginBottom:12}}>{t("rapporten.hdTitle")}</div>
          <h2 className="h2" style={{marginBottom:36}}>{t("rapporten.hdTitle")}</h2>
          <div className="grid-3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>{hdPure.map(r=><ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>)}</div>

          <div style={{height:1,background:"var(--border)",margin:"56px 0"}}/>

          {/* Relatierapport trio */}
          <div className="label" style={{marginBottom:12}}>{t("rapporten.relatieTitle")}</div>
          <h2 className="h2" style={{marginBottom:8}}>{t("rapporten.relatieTitle")}</h2>
          <p className="body-md" style={{maxWidth:560,marginBottom:36,color:"var(--text-muted)"}}>{LANG==="en"?"Choose the perspective that suits your relationship. Each report analyses two complete Human Design charts side by side.":"Kies het perspectief dat past bij jullie relatie. Elk rapport analyseert twee volledige Human Design charts naast elkaar."}</p>
          <div className="grid-3">
            {relatie.map(r=>(
              <ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>
            ))}
          </div>

          <div style={{height:1,background:"var(--border)",margin:"56px 0"}}/>

          {/* Aanvullende disciplines */}
          <div className="label" style={{marginBottom:12}}>{t("rapporten.andereTitle")}</div>
          <h2 className="h2" style={{marginBottom:36}}>{t("rapporten.andereTitle")}</h2>
          <div className="grid-2" style={{maxWidth:780}}>{other.map(r=><ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>)}</div>

          {sub&&<>
            <div style={{height:1,background:"var(--border)",margin:"56px 0"}}/>
            <div style={{maxWidth:760}}>
              <div className="label" style={{marginBottom:12}}>{t("rapporten.subTitle")}</div>
              <div className="sub-card" style={{cursor:"pointer"}} onClick={()=>go("rapport-maandelijks")}>
                <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:28}}>
                  <div>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.5rem",color:"white",marginBottom:10}}>{tl(sub.tagline)}</div>
                    <p style={{fontSize:".92rem",color:"rgba(255,255,255,.5)",maxWidth:420,lineHeight:1.78}}>{tl(sub.intro)}</p>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div className="sub-price">€19</div>
                    <div className="sub-price-period">{LANG==="en"?"per month":"per maand"}</div>
                    <div style={{height:14}}/>
                    <div className="btn btn-gold btn-sm">{t("report.monthlyViewBtn")}</div>
                  </div>
                </div>
              </div>
            </div>
          </>}
        </div>
      </section>
    </div>
  );
}

function ReportDetailPage({rpt,go,onDone,postPayment}){
  const[faq,setFaq]=useState(null);
  const genericFaqs = LANG==="en" ? [
    ["Do I need my exact birth time?","We use professional-grade astronomical algorithms. The more accurate the time, the more personal the result."],
    ["Is the report truly personal?","Every report is uniquely compiled based on your specific chart. No two reports are identical."],
    ["What format will I receive my report in?","As a PDF by email — save it to your archive or print it out. Delivered within 1 business day after payment."],
    ["What if I don't know my birth time?","Use the most accurate time you have. Type and Authority are usually correct even with an approximate time."],
  ] : [
    ["Hoe nauwkeurig is de berekening?","Wij gebruiken dezelfde astronomische algoritmen als professionele software. De blauwdruk is gebaseerd op je exacte geboortedata."],
    ["Is de blauwdruk echt persoonlijk?","Elk rapport wordt volledig op maat samengesteld op basis van jouw specifieke chart. Geen twee rapporten zijn identiek."],
    ["In welk format ontvang ik mijn blauwdruk?","Als PDF per e-mail — bewaar hem in je archief of print hem uit. Bezorgd binnen 1 werkdag na betaling."],
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
    canonical:SITE+"/#rapport-"+rpt.id,
    jsonLd:{
      "@graph":[
        productLD(rpt),
        faqLD(faqs),
        breadcrumbLD([["Home","/"],[ LANG==="en"?"Reports":"Rapporten","/#rapporten"],[rptTitle,"/#rapport-"+rpt.id]])
      ]
    }
  });
  return(
    <div className="pg">
      <div className="detail-hero" role="banner" aria-label={rptTitle}>
        <div className="detail-hero-bg">
          <img src={IMGS["r_"+rpt.id]||IMGS.hero} alt={rptTitle+" — Faculty of Human Design "+t("report.personalBadge")} loading="eager"/>
        </div>
        <div className="detail-hero-inner">
          <div>
            <div className="detail-hero-badge">{rpt.icon} Faculty of Human Design — Est. 2014, Ibiza</div>
            <h1 className="detail-hero-title">{rptTitle}</h1>
            <div className="detail-hero-tagline">{rptOutcome||rptTagline}</div>
            <div className="detail-hero-meta">
              <span className="detail-hero-m">{rpt.pages} {t("report.pages")}</span>
              <span className="detail-hero-m">{sectionCount} {t("report.sections")}</span>
              <span className="detail-hero-m">{t("report.personalBadge")}</span>
              <span className="detail-hero-m">{rptSub}</span>
            </div>
          </div>
          <div className="price-box">
            {rptOutcome&&<div style={{fontSize:".68rem",fontWeight:500,color:"rgba(201,168,92,.85)",letterSpacing:".06em",marginBottom:14,lineHeight:1.5,borderBottom:"1px solid rgba(255,255,255,.08)",paddingBottom:14}}>→ {rptOutcome}</div>}
            <div className="price-box-amount">{rpt.price}</div>
            <div className="price-box-period">{rptSub}</div>
            <div style={{display:"flex",flexDirection:"column",gap:7,margin:"14px 0 20px",textAlign:"left"}}>
              {(LANG==="en"
                ?[["Chart calculated for free","Pay only after seeing your chart"],["Delivered by email","Within 1 business day"],["Personal","No generic profiles"]]
                :[["Chart gratis berekend","Betaal pas na het zien van je chart"],["Bezorgd per e-mail","Binnen 1 werkdag"],["Persoonlijk","Geen generieke profielen"]]
              ).map(([label,desc])=>(
                <div key={label} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{color:"rgba(201,168,92,.7)",fontSize:".55rem",flexShrink:0,marginTop:3}}>✦</span>
                  <div>
                    <span style={{fontSize:".72rem",fontWeight:500,color:"rgba(255,255,255,.8)"}}>{label}</span>
                    <span style={{fontSize:".72rem",fontWeight:300,color:"rgba(255,255,255,.38)"}}> — {desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-white btn-full" onClick={()=>{track("checkout_started",{report:rpt.id,price:rpt.priceNum,location:"detail_hero"});document.getElementById("bestel")?.scrollIntoView({behavior:"smooth"});}}>
              {t("report.orderBtn",{price:rpt.price})}
            </button>
            <div style={{marginTop:12}}><TrustStrip light/></div>
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF BAR ─ immediately below hero, above the fold on mobile ── */}
      <div className="stat-row" role="region" aria-label={t("trust.delivery")}>
        <div className="stat-row-inner">
          {(LANG==="en"
            ?[["2,400+","Blueprints delivered"],["4.9 / 5","Average rating"],["1 business day","Delivered by email"],["2014","Founded in Ibiza"]]
            :[["2.400+","Blauwdrukken uitgebracht"],["4.9 / 5","Gemiddelde beoordeling"],["1 werkdag","Bezorgd per e-mail"],["2014","Opgericht op Ibiza"]]
          ).map(([n,l])=>(
            <div key={l} className="stat-row-item">
              <div className="stat-row-n" style={{fontSize:"1.5rem"}}>{n}</div>
              <div className="stat-row-l">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="section bg-muted">
        <div className="container">
          <div className="grid-2" style={{gap:56,alignItems:"start"}}>
            <div>
              <div className="label" style={{marginBottom:12}}>{LANG==="en"?"About this blueprint":"Over deze blauwdruk"}</div>
              <h2 className="h2" style={{marginBottom:16}}>{rptTitle}</h2>
              <p className="body-lg" style={{marginBottom:20}}>{rptIntro}</p>
              <div style={{background:"rgba(61,44,94,.06)",borderLeft:"3px solid var(--brand)",padding:"16px 20px",borderRadius:"0 var(--radius-sm) var(--radius-sm) 0",marginBottom:24}}>
                <div className="label" style={{marginBottom:6}}>{t("report.suitableFor")}</div>
                <p className="body-sm">{rptFor}</p>
              </div>
              <div style={{background:"white",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"24px"}}>
                <div className="label" style={{marginBottom:14}}>{t("report.personalBadge")}</div>
                <div className="grid-2" style={{gap:12}}>
                  {(LANG==="en"
                    ?[["Size",rpt.pages+" pages"],["Delivery","Within 1 business day"],["Format","Digital Blueprint · PDF"],["Language","English"]]
                    :[["Omvang",rpt.pages+" pagina's"],["Levering","Binnen 1 werkdag"],["Formaat","Digitale Blauwdruk · PDF"],["Taal","Nederlands"]]
                  ).map(([l,v])=>(
                    <div key={l}><div style={{fontSize:".6rem",fontWeight:600,textTransform:"uppercase",color:"var(--text-light)",marginBottom:2}}>{l}</div><div style={{fontSize:".82rem",fontWeight:300}}>{v}</div></div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="label" style={{marginBottom:12}}>{LANG==="en"?"Table of contents":"Inhoudsopgave"}</div>
              <h2 className="h2" style={{marginBottom:20}}>{t("report.whatsIncluded")}</h2>
              <ul className="includes-list">
                {promptExtraStr.split("\n").filter(l=>l.startsWith("###")).map(l=>l.replace(/^###\s*\d+\.\s*/,"").trim()).map((item,i)=>(
                  <li key={i} className="includes-item">
                    <div className="includes-num">{i+1}</div>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container-sm">
          <div className="label" style={{marginBottom:12}}>{t("home.testimonialsLabel")}</div>
          <h2 className="h2" style={{marginBottom:32}}>{t("report.reviews")}</h2>
          <div className="grid-3">
            {(Array.isArray(rpt.reviews)?rpt.reviews:(rpt.reviews?.[LANG]||rpt.reviews?.nl||[])).map(([q,n])=>(
              <div className="tcard" key={n}><div className="stars">★★★★★</div><div className="tcard-quote">"{q}"</div><div className="tcard-author">{n}</div></div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-muted">
        <div className="container-sm">
          <div className="label" style={{marginBottom:12}}>{t("report.faq")}</div>
          <h2 className="h2" style={{marginBottom:32}}>{LANG==="en"?"Questions about this report":"Vragen over dit rapport"}</h2>
          {faqs.map(([q,a],i)=>(
            <div className="faq-item" key={i}>
              <div className="faq-q" onClick={()=>setFaq(faq===i?null:i)}>{q}<span className={"faq-toggle"+(faq===i?" open":"")}>+</span></div>
              {faq===i&&<div className="faq-a">{a}</div>}
            </div>
          ))}
        </div>
      </section>
      <ReportForm rpt={rpt} onDone={onDone} postPayment={postPayment}/>
      <div className="sticky-cta">
        <button className="btn btn-primary btn-full" onClick={()=>{track("hero_cta_click",{location:"sticky",report:rpt.id});document.getElementById("bestel")?.scrollIntoView({behavior:"smooth"});}}>
          {t("report.orderBtn",{price:rpt.price})}
        </button>
      </div>
    </div>
  );
}

function BlogPage({go}){
  const[activePost,setActivePost]=useState(null);
  const[articles,setArticles]=useState([]);
  const[loading,setLoading]=useState(true);
  const STATIC=[
    {
      id:"s1",tag:"Human Design Basics",title:"Het verschil tussen Type en Strategie",date:"12 april 2026",readtime:"6 min",
      excerpt:"Type en Strategie zijn twee van de meest gebruikte begrippen in Human Design, maar beschrijven fundamenteel verschillende aspecten van je design.",
      images:[
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&q=75",
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&q=75",
      ],
      body:"Type en Strategie worden in Human Design-kringen regelmatig door elkaar gebruikt. Dat is begrijpelijk — ze hangen samen en worden vaak in één adem genoemd. Maar ze beschrijven fundamenteel verschillende dingen, en het onderscheid begrijpen maakt het systeem een stuk bruikbaarder in het dagelijks leven.\n\nJe Type is je energetische aard. Het beschrijft hoe je energiesysteem is geconfigureerd — niet wat je doet, maar hoe je van nature functioneert. Er zijn vijf Types in Human Design: de Generator, de Manifesting Generator, de Projector, de Manifestor en de Reflector. Ongeveer 70 procent van de wereldbevolking bestaat uit Generators en Manifesting Generators. Projectors maken zo'n 20 procent uit. Manifestors zijn zeldzamer, rond de 9 procent, en Reflectors zijn de kleinste groep met ongeveer 1 procent.\n\nJe Type verandert nooit. Het staat vast op het moment van je geboorte, bepaald door de posities van de planeten en hun relatie tot de negen energiecentra in je chart. Het is geen persoonlijkheidstest die varieert afhankelijk van je stemming of levensfase — het is een constante, zoals je bloedgroep.\n\nDe Strategie is iets anders. Het is de optimale manier van handelen die bij je Type hoort. Waar het Type beschrijft wie je energetisch bent, beschrijft de Strategie hoe je het meest in lijn met jezelf kunt bewegen. Generators en Manifesting Generators zijn ontworpen om te reageren — niet om te initiëren. Ze wachten op iets in de buitenwereld dat een sacrale respons oproept, een instinctief 'ja' of 'nee' vanuit het lichaam, en handelen vanuit die respons.\n\nProjectors hebben een andere Strategie: wachten op de uitnodiging. Niet passief afwachten in de zin van niets doen, maar beschikbaar zijn en wachten tot anderen hun unieke capaciteit voor begeleiding en inzicht herkennen en expliciet uitnodigen. Wanneer een Projector geïnviteerd wordt, kan zijn energie volledig tot zijn recht komen. Zonder uitnodiging leidt dezelfde energie vaak tot weerstand of bitterheid.\n\nManifestors — de enige Types die van nature kunnen initiëren — hebben als Strategie om te informeren. Niet om toestemming te vragen, maar om mensen die door hun acties geraakt worden vooraf te laten weten wat er komen gaat. Dit simpele gebaar vermindert weerstand en maakt de weg vrij voor hun impactvolle energie. Reflectors ten slotte wachten een volledige maancyclus van 28 dagen voor ze grote beslissingen nemen, zodat ze de juiste context en helderheid kunnen ervaren.\n\nEen veel voorkomende misvatting is dat de Strategie iets is wat je moet presteren of aanleren. Dat is niet zo. Het is eerder een uitnodiging om het tegenovergestelde te doen van wat de conditionering je heeft geleerd. Veel Generators leren van jongs af aan om te initiëren, actief te zijn, doelen te stellen en ernaar toe te werken. Dat werkt voor sommige Types prima, maar voor een Generator leidt het initiëren zonder sacrale respons vaak tot frustratie en energieverlies.\n\nHet interessante van de Strategie is dat het niet gaat om grote, dramatische veranderingen in je leven. Het gaat om kleine verschuivingen in hoe je beslissingen neemt. Wacht je op een echte respons voor je ja zegt? Informeer je de mensen om je heen voor je handelt? Wacht je op een uitnodiging of pers je je inzichten op? Die kleine aanpassingen, consequent toegepast, kunnen over tijd een opvallend verschil maken in hoeveel energie je hebt en hoe soepel dingen verlopen.\n\nType en Strategie vormen samen het vertrekpunt van elk Human Design rapport van de Faculty of Human Design. Ze geven geen antwoord op alle vragen, maar bieden een solide basis vanwaaruit de rest van de chart — autoriteit, profiel, centra, kanalen — betekenis krijgt. Wie zijn Type en Strategie werkelijk begrijpt en toepast, begint te merken dat het leven minder wrijving kent en meer van nature stroomt.",
    },
    {
      id:"s2",tag:"Autoriteit",title:"Innerlijke autoriteit: hoe je je beste beslissingen neemt",date:"28 maart 2026",readtime:"7 min",
      excerpt:"Je innerlijke autoriteit in Human Design is het meest consistente instrument voor besluitvorming dat je bezit.",
      images:[
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&q=75",
        "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&q=75",
      ],
      body:"We nemen elke dag tientallen beslissingen. De meeste zijn klein — wat eten, welke route rijden, wanneer antwoorden. Maar de grotere beslissingen, over werk, relaties, woonplaats, gezondheid, zijn degenen waarbij we het vaakst twijfelen, aarzelen, of achteraf spijt hebben. Human Design biedt hiervoor een verrassend concreet instrument: de innerlijke autoriteit.\n\nDe innerlijke autoriteit is het centrum of het mechanisme in je chart van waaruit je het betrouwbaarst beslissingen neemt. Het is geen filosofie of levenshouding — het is gebaseerd op de configuratie van je energiesysteem. Afhankelijk van welke centra in je chart gedefinieerd zijn, heeft iedereen een andere autoriteit. Er zijn zeven vormen, en elke vraagt een andere aanpak.\n\nDe meest voorkomende autoriteit is de Emotionele autoriteit, ook wel de Solarplexus-autoriteit genoemd. Mensen met deze autoriteit hebben een gedefinieerd emotioneel centrum, wat betekent dat ze een continue golf van emotionele energie ervaren — van hoog naar laag en terug. Voor hen geldt: neem nooit een belangrijke beslissing in het moment zelf. Wacht op emotionele helderheid. Dat kan uren duren, of dagen. 'Slaap er eens een nacht over' is voor hen geen cliché maar een letterlijk advies dat hen behoedt voor beslissingen die vanuit een emotionele piek of dal zijn genomen.\n\nDe Sacrale autoriteit is exclusief voor Generators en Manifesting Generators met een gedefinieerd Sacraalcentrum en een ongedefinieerd emotioneel centrum. Deze autoriteit spreekt via het lichaam — een instinctieve, fysieke respons die voelt als een 'uh-huh' of een 'unh-unh'. Het is geen mentale stem maar een lichamelijke reactie die er al is voor de geest heeft kunnen nadenken. Mensen met Sacrale autoriteit doen er goed aan om hun beslissingen te testen via ja/nee-vragen en te luisteren naar wat het lichaam antwoordt, niet wat het hoofd redeneert.\n\nDe Splenische autoriteit is de stilst van alle autoriteiten. De Milt spreekt eenmalig, in het moment, en daarna is hij stil. Het is een zachte fluistering van instinct en intuïtie — niet de luidruchtige zekerheid van emotie of het kloppende ja van het Sacraalcentrum, maar een subtiel 'dit klopt' of 'dit klopt niet'. Mensen met Splenische autoriteit moeten leren om dat eerste, stille signaal te vertrouwen, ook al kunnen ze het moeilijk rationeel verklaren.\n\nDe Ego- of Hartautoriteit spreekt via wil en verlangens. 'Wil ik dit echt?' is de centrale vraag. Niet wat je zou moeten willen, niet wat anderen van je verwachten, maar wat jij vanuit je diepste wil kiest. Dit klinkt eenvoudig, maar voor mensen die gewend zijn hun eigen verlangens te onderdrukken ten gunste van anderen, kan dit een ingrijpende oefening zijn.\n\nVervolgens zijn er de Zelf-geprojecteerde autoriteit, de Mentale of Projectie-autoriteit, en de Lunaire autoriteit van de Reflector. De Zelf-geprojecteerde autoriteit werkt via het G-centrum — mensen met deze autoriteit vinden helderheid door hardop te spreken met iemand die ze vertrouwen, niet voor advies, maar om hun eigen stem te horen. De Mentale autoriteit is uniek voor bepaalde Projectors: zij kalibreren via gesprek en externe reflectie. En Reflectors, met hun bijzondere gevoeligheid voor de omgeving, nemen de tijd van een volledige maancyclus om te voelen hoe een beslissing aanvoelt doorheen verschillende energetische contexten.\n\nWat al deze autoriteiten gemeen hebben is dat ze het hoofd — de mentale analyse — uitdrukkelijk niet als beslisser aanwijzen. De geest is in Human Design een uitstekende tool om informatie te verzamelen en te verwerken, maar hij is niet ontworpen als de uiteindelijke beslisser. Dat is voor de meeste mensen een radicale verschuiving, want we zijn opgegroeid met de overtuiging dat denken en redeneren de meest betrouwbare weg naar goede beslissingen is.\n\nDe praktische toepassing vraagt oefening en geduld. Het herkennen van je autoriteit is één ding; erop leren vertrouwen is een langzamer proces, zeker als je jarenlang anders hebt besloten. Maar wie consequent leert te luisteren naar zijn innerlijke autoriteit, merkt doorgaans dat de uitkomsten beter passen, minder energie kosten, en dat de spijt van beslissingen afneemt. Niet omdat alles perfect gaat, maar omdat de beslissing écht van jou was.",
    },
    {
      id:"s3",tag:"Geschiedenis",title:"De oorsprong van Human Design op Ibiza",date:"14 februari 2026",readtime:"8 min",
      excerpt:"In januari 1987 ontving Ra Uru Hu het Human Design systeem gedurende acht dagen op Ibiza.",
      images:[
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&q=75",
        "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&auto=format&q=75",
      ],
      body:"Er zijn weinig plekken in de westerse wereld die zo doordrenkt zijn van een bepaalde sfeer als het eiland Ibiza in de winter. Buiten het hoogseizoen, als de clubs gesloten zijn en het eiland terugkeert naar zijn mediterrane stilte, ademt het iets ouds. Het is op dit eiland, in de januarinacht van 1987, dat het verhaal van Human Design begint.\n\nRa Uru Hu — geboren als Alan Robert Krakower in Canada — woonde op dat moment op Ibiza. Hij had een bewogen leven achter de rug: journalist, muzikant, reclameman, vader. In 1983 had hij alles achter zich gelaten en was hij naar Europa getrokken. Op Ibiza vond hij een teruggetrokken bestaan, alleen, in een huis aan de rand van een klein dorp op het eiland.\n\nIn de nacht van 3 januari 1987 was hij alleen thuis toen hij een ervaring begon die hij later zou omschrijven als het horen van een Stem. Geen metaforische stem, geen interne gedachte — maar wat hij ervoer als een externe, intelligente aanwezigheid die hem rechtstreeks aansprak. Hij schreef later dat hij aanvankelijk dacht gek te worden. Maar de Stem bleef, en gedurende acht aaneengesloten dagen dicteerde zij hem een compleet systeem.\n\nWat hij ontving was een synthese van vier grote kennissystemen die op het eerste gezicht weinig met elkaar gemeen hebben. De 64 hexagrammen van de Chinese I Ching vormden de ruggengraat — elk hexagram correspondeert met een van de 64 poorten in het Human Design chart. De Sefirot van de Joodse Kabbala leverde de structuur van de levensboom, die zichtbaar is in de verbindingen tussen de negen energiecentra. De westerse astrologie bood het raamwerk van planetaire posities en hun invloed op het moment van geboorte. En de kwantumfysica — met name de ontdekking van het neutrino in de jaren daarvoor — gaf een wetenschappelijk substraat voor de overdracht van informatie via materie.\n\nDe combinatie lijkt op het eerste gezicht eclectisch, zo niet willekeurig. Maar wie het systeem bestudeert, merkt dat de vier bronnen op een coherente manier zijn samengebracht — niet als een oppervlakkige mix, maar als een structurele synthese waarbij elk systeem een specifieke laag toevoegt aan het geheel. De I Ching geeft de kwaliteiten van de poorten, de Kabbala geeft de centra en hun verbindingen, de astrologie geeft de timing en planetaire invloeden, en de kwantumfysica biedt een verklaring voor hoe de sterrenposities op het moment van geboorte de configuratie van een individueel chart bepalen.\n\nNa de acht dagen was Ra Uru Hu uitgeput maar helder. Hij begon het systeem te bestuderen, te testen en te verfijnen. In de jaren die volgden gaf hij de eerste readings en trainingen, aanvankelijk vooral op Ibiza en in Europa. Het systeem groeide langzaam, aangedreven door mond-tot-mondreclame. Ra was geen marketingmens — hij was een leraar die zijn lessen op tape en later digitaal verspreidde, en die een kleine maar toegewijde gemeenschap om zich heen verzamelde.\n\nRa Uru Hu overleed in 2011, op 63-jarige leeftijd, op Ibiza — het eiland waar het allemaal was begonnen. Hij had altijd gezegd dat hij niet de auteur van het systeem was maar de boodschapper. Of men dat letterlijk neemt of als metafoor, het systeem dat hij heeft doorgegeven heeft sindsdien miljoenen mensen bereikt.\n\nDe Faculty of Human Design is opgericht op datzelfde eiland, vanuit een diepe verbondenheid met de plek waar het systeem is ontvangen. Ibiza is voor ons niet alleen een locatie maar een context — een eiland dat altijd ruimte heeft geboden aan zoekers, denkers en mensen die buiten de gebaande paden willen leven. Het is die geest die we meenemen in elk rapport dat wij maken: nauwkeurig, persoonlijk, en respectvol voor de diepgang van het systeem dat Ra Uru Hu ons heeft nagelaten.",
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
        setArticles(data&&data.length>0?data:STATIC);
      }catch{setArticles(STATIC);}
      setLoading(false);
    };
    load();
  },[]);

  const activeArticle = activePost ? articles.find(a=>String(a.id)===String(activePost)) : null;

  // Pick the right language field: en version if LANG=en and it exists, else nl fallback
  const al=(a,f)=>(LANG==="en"&&a[f+"_en"])?a[f+"_en"]:a[f];

  // SEO for list view or single article
  useSEO(activeArticle ? {
    title: al(activeArticle,"title"),
    description: al(activeArticle,"excerpt") || al(activeArticle,"title") + (LANG==="en"?" — Read the full article at Faculty of Human Design.":" — Lees het volledige artikel op Faculty of Human Design."),
    canonical: SITE + "/#blog",
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
    title: LANG==="en"?"Insights on Human Design, Numerology & Astrology":"Inzichten over Human Design, Numerologie & Astrologie",
    description: LANG==="en"?"Articles on Human Design, Numerology and Astrology. Learn about Type, Strategy, Authority and the origin of Human Design on Ibiza.":"Artikelen over Human Design, Numerologie en Astrologie. Leer meer over Type, Strategie, Autoriteit, Numerologie en de oorsprong van Human Design op Ibiza.",
    canonical: SITE + "/#blog",
    jsonLd: {
      "@context":"https://schema.org","@type":"Blog",
      "name":LANG==="en"?"Faculty of Human Design — Insights":"Faculty of Human Design — Inzichten",
      "description":LANG==="en"?"Articles on Human Design, Numerology and Astrology.":"Artikelen over Human Design, Numerologie en Astrologie.",
      "publisher":{"@type":"Organization","name":"Faculty of Human Design"}
    }
  });

  if(activePost){
    const post=articles.find(a=>String(a.id)===String(activePost));
    if(!post)return null;
    return(
      <div className="pg">
        <div className="origin-section" style={{minHeight:320}}>
          <div className="origin-section-bg">
            <img src={IMGS.cosmos} alt="Kosmische sfeer — Faculty of Human Design inzichten" loading="eager"/>
          </div>
          <div className="page-hero-pad" style={{paddingTop:108,paddingBottom:56}}>
            <div style={{marginBottom:16,cursor:"pointer",fontSize:".65rem",letterSpacing:".1em",color:"rgba(255,255,255,.35)",textTransform:"uppercase"}} onClick={()=>setActivePost(null)}>{t("blog.backToList")}</div>
            <div className="label-light" style={{marginBottom:8}}>{post.tag}</div>
            <h1 className="h1" style={{color:"white",marginBottom:12,fontSize:"clamp(1.8rem,4vw,2.6rem)"}}>{al(post,"title")}</h1>
            <div style={{fontSize:".65rem",letterSpacing:".08em",color:"rgba(255,255,255,.3)",textTransform:"uppercase"}}>{post.date} · {post.readtime} {t("blog.readTime")}</div>
          </div>
        </div>
        <section className="section bg-white">
          <div className="container-sm">
            {(()=>{
              const paras=(al(post,"body")||"").trim().split("\n\n");
              const imgs=post.images||[];
              const mid=Math.floor(paras.length/2);
              return paras.map((p,i)=>(
                <div key={i}>
                  <p className="body-lg" style={{marginBottom:22,fontSize:"1rem",lineHeight:2}}>{p.trim()}</p>
                  {i===2&&imgs[0]&&<img src={imgs[0]} alt="" style={{width:"100%",borderRadius:"var(--radius-md)",margin:"8px 0 32px",display:"block",objectFit:"cover",maxHeight:400}} loading="lazy"/>}
                  {i===mid&&imgs[1]&&<img src={imgs[1]} alt="" style={{width:"100%",borderRadius:"var(--radius-md)",margin:"8px 0 32px",display:"block",objectFit:"cover",maxHeight:400}} loading="lazy"/>}
                </div>
              ));
            })()}
            <div style={{marginTop:40,paddingTop:28,borderTop:"1px solid var(--border)"}}>
              <div className="label" style={{marginBottom:16}}>{LANG==="en"?"More reading":"Meer lezen"}</div>
              <div className="grid-2">
                {articles.filter(a=>String(a.id)!==String(activePost)).slice(0,2).map(a=>(
                  <div key={a.id} className="blog-card" onClick={()=>{setActivePost(String(a.id));window.scrollTo(0,0);}}>
                    <div className="blog-tag">{a.tag}</div>
                    <div className="blog-title" style={{fontSize:"1rem"}}>{al(a,"title")}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{marginTop:32}}><button className="btn btn-primary" onClick={()=>go("rapporten")}>{t("blog.orderCta")}</button></div>
          </div>
        </section>
      </div>
    );
  }

  return(
    <div className="pg">
      <div className="origin-section" style={{minHeight:340}}>
        <div className="origin-section-bg">
          <img src={IMGS.cosmos} alt="Kosmische sfeer" loading="eager"/>
        </div>
        <div className="page-hero-pad" style={{paddingTop:100,paddingBottom:72}}>
          <div className="label-light" style={{marginBottom:14}}>{t("blog.eyebrow")}</div>
          <h1 className="h1" style={{color:"white",marginBottom:14}}>{t("blog.title")}</h1>
          <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.5)",maxWidth:480,lineHeight:1.78}}>{t("blog.sub")}</p>
        </div>
      </div>
      <section className="section bg-white">
        <div className="container-sm">
          {loading?(
            <div style={{textAlign:"center",padding:"60px 0",color:"var(--text-light)",fontSize:".8rem",letterSpacing:".08em",textTransform:"uppercase"}}>{t("blog.loading")}</div>
          ):articles.map((p,i)=>(
            <div className="blog-card" key={i} onClick={()=>{setActivePost(String(p.id));window.scrollTo(0,0);}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:16}}>
                <div>
                  <div className="blog-tag">{p.tag}</div>
                  <div className="blog-title">{al(p,"title")}</div>
                  <div className="blog-excerpt">{al(p,"excerpt")}</div>
                  <div className="blog-more">{t("blog.readMore")}</div>
                </div>
                <div style={{fontSize:".65rem",letterSpacing:".06em",color:"var(--text-light)",textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0}}>{p.date}<br/>{p.readtime} {t("blog.readTime")}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OverPage({go}){
  useSEO({
    title:LANG==="en"?"About us — Faculty of Human Design, Ibiza":"Over ons — Faculty of Human Design, Ibiza",
    description:LANG==="en"?"Faculty of Human Design was founded on Ibiza in 2014. Specialised in in-depth personal analyses based on Human Design, Numerology and Astrology. 2,400+ blueprints. 4.9/5 rating.":"Faculty of Human Design is opgericht op Ibiza in 2014. Gespecialiseerd in diepgaande persoonlijke analyses op basis van Human Design, Numerologie en Astrologie. 2.400+ blauwdrukken. 4.9/5 beoordeling.",
    canonical:SITE+"/#over",
    jsonLd:{
      "@context":"https://schema.org","@type":"AboutPage",
      "name":LANG==="en"?"About Faculty of Human Design":"Over Faculty of Human Design",
      "description":LANG==="en"?"Founded on Ibiza in 2014. Specialised in personal reports based on Human Design, Numerology and Astrology.":"Opgericht op Ibiza in 2014. Gespecialiseerd in persoonlijke rapporten op basis van Human Design, Numerologie en Astrologie.",
      "url":SITE+"/#over",
      "author":{"@type":"Organization","name":"Faculty of Human Design","foundingDate":"2014","foundingLocation":LANG==="en"?"Ibiza, Spain":"Ibiza, Spanje"}
    }
  });
  return(
    <div className="pg">

      {/* ── HERO ── */}
      <div className="origin-section" style={{minHeight:480}}>
        <div className="origin-section-bg">
          <img src={IMGS.ibiza} alt="Ibiza zonsondergang" loading="eager"/>
        </div>
        <div className="page-hero-pad" style={{paddingTop:120,paddingBottom:96}}>
          <div className="label-light" style={{marginBottom:14}}>{t("over.heroEyebrow")}</div>
          <h1 className="h1" style={{color:"white",marginBottom:20,maxWidth:620,lineHeight:1.06}}>{t("over.heroTitle")}<br/><em style={{fontStyle:"italic",color:"rgba(255,255,255,.38)"}}>{t("over.heroTitleItalic")}</em></h1>
          <p style={{fontSize:"1.05rem",fontWeight:300,color:"rgba(255,255,255,.5)",maxWidth:520,lineHeight:1.84}}>{t("over.heroSub")}</p>
        </div>
      </div>

      {/* ── DE EERSTE STAP ── */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid-2" style={{gap:72,alignItems:"center"}}>
            <div>
              <div className="label" style={{marginBottom:14}}>{t("over.firstStepLabel")}</div>
              <h2 className="h2" style={{marginBottom:22}}>{t("over.firstStepTitle")}<br/><em style={{fontStyle:"italic",color:"var(--text-muted)"}}>{t("over.firstStepTitleItalic")}</em></h2>
              <p className="body-lg" style={{marginBottom:18}}>{LANG==="en"?"Most people live for years from learned behaviour, the expectations of others and assumptions about who they are. A personalised blueprint breaks that pattern — not with advice from outside, but by showing how you naturally work.":"De meeste mensen leven jarenlang vanuit aangeleerd gedrag, verwachtingen van anderen en aannames over wie ze zijn. Een gepersonaliseerde blauwdruk doorbreekt dat patroon — niet met adviezen van buitenaf, maar door te laten zien hoe jij van nature werkt."}</p>
              <p className="body-md" style={{marginBottom:18}}>{LANG==="en"?"That is why we focus exclusively on the written analysis. The blueprint is not an end point — it is the beginning. A document you return to when you need to make a decision, want to understand a relationship, or simply lose sight of yourself.":"Dat is de reden waarom wij ons uitsluitend richten op de geschreven analyse. De blauwdruk is geen eindpunt — het is het begin. Een document dat je terugpakt als je een beslissing moet nemen, een relatie begrijpen wilt, of simpelweg jezelf in het oog verliest."}</p>
              <p className="body-md" style={{marginBottom:32}}>{LANG==="en"?"For many of our clients, the blueprint is the first time they truly recognise themselves — not in what they do, but in who they are.":"Voor veel van onze klanten is de blauwdruk de eerste keer dat ze zichzelf echt herkend voelen — niet in wat ze doen, maar in wie ze zijn."}</p>
              <div style={{borderLeft:"3px solid var(--gold)",paddingLeft:20,marginBottom:32}}>
                <p style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontStyle:"italic",color:"var(--text)",lineHeight:1.78}}>{LANG==="en"?'"You do not receive a profile. You receive a mirror — accurately calculated at the moment you entered the world."':'"Je ontvangt geen profiel. Je ontvangt een spiegel — nauwkeurig berekend op het moment dat jij ter wereld kwam."'}</p>
              </div>
              <div style={{display:"flex",gap:40,flexWrap:"wrap"}}>
                {[["2014",LANG==="en"?"Founded on Ibiza":"Opgericht op Ibiza"],["2.400+",LANG==="en"?"Blueprints assembled":"Blauwdrukken samengesteld"],["4.9 / 5",LANG==="en"?"Average rating":"Gemiddelde beoordeling"]].map(([n,l])=>(
                  <div key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
                ))}
              </div>
            </div>
            <div>
              <div className="portrait-img">
                <img src={IMGS.origin} alt="Ibiza landschap" loading="lazy"/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 45%,rgba(12,10,23,.72) 100%)"}}/>
                <div style={{position:"absolute",bottom:24,left:24,right:24}}>
                  <div style={{fontSize:".58rem",fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(201,168,92,.8)",marginBottom:8}}>Ibiza — 1987</div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontStyle:"italic",color:"rgba(255,255,255,.8)",lineHeight:1.65}}>{LANG==="en"?"On this island Ra Uru Hu received the Human Design system. Here it all began.":"Op dit eiland ontving Ra Uru Hu het Human Design systeem. Hier begon alles."}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ONZE SPECIALISATIE ── */}
      <section className="section bg-muted" style={{position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
          <img src={IMGS.cosmos} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.04,filter:"grayscale(60%)"}}/>
        </div>
        <div className="container" style={{position:"relative",zIndex:1}}>
          <div className="text-center" style={{marginBottom:56}}>
            <div className="label" style={{marginBottom:14}}>{t("over.specLabel")}</div>
            <h2 className="h2" style={{marginBottom:16}}>{t("over.specTitle")}</h2>
            <p className="body-md" style={{maxWidth:520,margin:"0 auto"}}>{t("over.specSub")}</p>
          </div>
          <div className="grid-3">
            {(LANG==="en"?[
              ["✦","Astronomical precision","Swiss Ephemeris calculation","Every blueprint is based on the exact positions of the planets at your birth moment — accurate to the degree. The same standard as professional astronomical software. No rounded tables, no generic approximations."],
              ["◎","Three disciplines, one portrait","Human Design · Numerology · Astrology","We analyse from three completely independent methodologies: Human Design (energetic mechanism), Numerology (life patterns and lessons) and Birth Astrology (planetary qualities). Each system illuminates a different layer of the same person."],
              ["∞","In-depth written analysis","No templates. No generic.","Every blueprint is fully custom-assembled based on your unique combination of Type, Authority, Profile and active gates. No two blueprints are identical. The analysis is personal, concrete and directly applicable."],
            ]:[
              ["✦","Astronomische precisie","Swiss Ephemeris berekening","Elke blauwdruk is gebaseerd op de exacte posities van de planeten op jouw geboortemoment — tot op de graad nauwkeurig. Dezelfde standaard als professionele astronomische software. Geen afgeronde tabellen, geen generieke benaderingen."],
              ["◎","Drie disciplines, één portret","Human Design · Numerologie · Astrologie","We analyseren vanuit drie volledig zelfstandige methodologieën: Human Design (energetisch mechanisme), Numerologie (levenspatronen en -lessen) en Geboorteastrologie (planetaire kwaliteiten). Elk systeem verlicht een andere laag van dezelfde persoon."],
              ["∞","Diepgaande geschreven analyse","Geen templates. Geen generiek.","Elke blauwdruk wordt volledig op maat samengesteld op basis van jouw unieke combinatie van Type, Autoriteit, Profiel en actieve poorten. Geen twee blauwdrukken zijn identiek. De analyse is persoonlijk, concreet en direct toepasbaar."],
            ]).map(([ico,title,sub,desc])=>(
              <div key={title} style={{background:"white",borderRadius:"var(--radius-xl)",border:"1px solid var(--border)",padding:"36px 32px",display:"flex",flexDirection:"column",gap:0}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.5rem",color:"var(--brand)",opacity:.5,marginBottom:16,lineHeight:1}}>{ico}</div>
                <div style={{fontSize:".58rem",fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:"var(--gold)",marginBottom:8}}>{sub}</div>
                <h3 style={{fontFamily:"var(--font-serif)",fontSize:"1.15rem",fontWeight:400,color:"var(--text)",marginBottom:14,lineHeight:1.22}}>{title}</h3>
                <p className="body-sm" style={{lineHeight:1.78}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DE METHODE ── */}
      <section className="section bg-white">
        <div className="container-md">
          <div className="text-center" style={{marginBottom:56}}>
            <div className="label" style={{marginBottom:14}}>{t("over.methodLabel")}</div>
            <h2 className="h2" style={{marginBottom:16}}>{t("over.methodTitle")}<br/><em style={{fontStyle:"italic",color:"var(--text-muted)"}}>{t("over.methodTitleItalic")}</em></h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {(LANG==="en"?[
              ["01","Astronomical calculation","Based on your exact date, time and place of birth, we calculate the positions of all relevant planets and celestial bodies. This forms the astronomical basis of your blueprint — objective, accurate and unique to you."],
              ["02","Chart composition","The calculation produces your personal chart: your Human Design type, authority, profile, defined centers, active channels and gates — or, for Numerology and Astrology, your core and planet numbers. This is the raw data on which the analysis is based."],
              ["03","In-depth analysis","Each section of the blueprint is custom-assembled based on your specific combination. The analysis goes beyond definitions: it describes how your design works in daily life, where conditioning lies, and where your authentic strength resides."],
              ["04","Your personalised blueprint","The result is a document of 24 to 40+ pages that gives back what was always present in you — now clearly described, recognisable and directly applicable. The first step in a process that can last a lifetime."],
            ]:[
              ["01","Astronomische berekening","Op basis van je exacte geboortedatum, -tijd en -plaats berekenen wij de posities van alle relevante planeten en hemellichamen. Dit vormt de astronomische basis van je blauwdruk — objectief, nauwkeurig en uniek voor jou."],
              ["02","Chart samenstelling","De berekening levert je persoonlijke chart: je Human Design type, autoriteit, profiel, gedefinieerde centra, actieve kanalen en poorten — of, bij Numerologie en Astrologie, je kern- en planeetgetallen. Dit is de ruwe data waarop de analyse is gebaseerd."],
              ["03","Diepgaande analyse","Elke sectie van de blauwdruk wordt op maat samengesteld op basis van jouw specifieke combinatie. De analyse gaat verder dan definities: het beschrijft hoe jouw design in het dagelijks leven werkt, waar conditionering zit, en waar jouw authentieke kracht ligt."],
              ["04","Je gepersonaliseerde blauwdruk","Het resultaat is een document van 24 tot 40+ pagina's dat je teruggeeft wat altijd al in jou aanwezig was — nu helder beschreven, herkenbaar en direct toepasbaar. De eerste stap in een proces dat een leven lang kan duren."],
            ]).map(([num,title,desc],i,arr)=>(
              <div key={num} className="method-step" style={{borderBottom:i<arr.length-1?"1px solid var(--border)":"none"}}>
                <div className="method-step-num">{num}</div>
                <div style={{flex:1}}>
                  <h3 style={{fontFamily:"var(--font-serif)",fontSize:"1.2rem",fontWeight:400,color:"var(--text)",marginBottom:10,lineHeight:1.2}}>{title}</h3>
                  <p className="body-md" style={{lineHeight:1.82}}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IBIZA ORIGINE ── */}
      <div className="origin-section" style={{minHeight:360}}>
        <div className="origin-section-bg">
          <img src={IMGS.cta} alt="Sterrenhemel Ibiza" loading="lazy"/>
        </div>
        <div className="origin-content">
          <div>
            <div className="label-light" style={{marginBottom:16}}>{t("over.originLabel")}</div>
            <h2 className="h2" style={{color:"white",marginBottom:20,lineHeight:1.08}}>{t("over.originTitle")}<br/><em style={{fontStyle:"italic",color:"rgba(255,255,255,.38)"}}>{t("over.originTitleItalic")}</em></h2>
            <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.52)",lineHeight:1.84,maxWidth:440}}>{LANG==="en"?"The Faculty of Human Design was founded in 2014 on Ibiza — the island where Ra Uru Hu received the Human Design system in 1987. That origin determines our focus: no superficial profiles, but in-depth analysis that does justice to the richness of the system.":"De Faculty of Human Design is in 2014 opgericht op Ibiza — het eiland waar Ra Uru Hu in 1987 het Human Design systeem ontving. Die oorsprong bepaalt onze focus: geen oppervlakkige profielen, maar diepgaande analyse die recht doet aan de rijkheid van het systeem."}</p>
          </div>
          <div className="stats-2x2">
            {[["2014",LANG==="en"?"Year founded":"Jaar van oprichting"],["Ibiza",LANG==="en"?"Home base":"Thuisbasis"],["2.400+",LANG==="en"?"Blueprints":"Blauwdrukken"],["3",LANG==="en"?"Disciplines":"Disciplines"]].map(([n,l])=>(
              <div key={l} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:"var(--radius-lg)",padding:"24px 20px"}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.7rem",fontWeight:300,color:"white",lineHeight:1,marginBottom:5}}>{n}</div>
                <div style={{fontSize:".58rem",fontWeight:500,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(255,255,255,.3)"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="section-md bg-muted">
        <div className="container-sm text-center">
          <div className="label" style={{marginBottom:14}}>{t("over.ctaLabel")}</div>
          <h2 className="h2" style={{marginBottom:18}}>{t("over.ctaTitle")}<br/><em style={{fontStyle:"italic",color:"var(--text-muted)"}}>{t("over.ctaTitleItalic")}</em></h2>
          <p className="body-lg" style={{maxWidth:460,margin:"0 auto 32px"}}>{t("over.ctaSub")}</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
            <button className="btn btn-primary btn-lg" onClick={()=>go("rapport-volledig")}>{t("over.ctaBtn")}</button>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>{t("over.ctaBtnSecondary")}</button>
          </div>
          <TrustStrip/>
        </div>
      </section>

    </div>
  );
}

function ContactPage(){
  const[form,setForm]=useState({name:"",email:"",subject:"",msg:""});
  const[status,setStatus]=useState(null); // null | "sending" | "ok" | "error"
  const[errMsg,setErrMsg]=useState("");
  const ch=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  const send=async()=>{
    if(!form.name.trim()||!form.email.trim()||!form.msg.trim())return;
    setStatus("sending");
    try{
      const res=await fetch("/api/review-approve",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,contact:1})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Onbekende fout");
      setStatus("ok");
      setForm({name:"",email:"",subject:"",msg:""});
    }catch(e){
      setErrMsg(e.message);
      setStatus("error");
    }
  };
  useSEO({
    title:"Contact — Faculty of Human Design",
    description:LANG==="en"?"Contact Faculty of Human Design. Questions about reports, orders or Human Design? We respond within 1 business day. Email: info@facultyhd.com":"Neem contact op met Faculty of Human Design. Vragen over rapporten, bestellingen of Human Design? Wij reageren binnen 1 werkdag. E-mail: info@facultyhd.com",
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
      <div className="origin-section" style={{minHeight:360}}>
        <div className="origin-section-bg">
          <img src="/ibiza-es-vedra.jpg" alt="Es Vedrà bij schemering — Ibiza" loading="eager"/>
        </div>
        <div className="page-hero-pad" style={{paddingTop:120,paddingBottom:80}}>
          <div className="label-light" style={{marginBottom:14}}>{t("contact.eyebrow")}</div>
          <h1 className="h1" style={{color:"white",marginBottom:16,maxWidth:560}}>{t("contact.title")}</h1>
          <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.5)",maxWidth:420,lineHeight:1.78}}>{t("contact.sub")}</p>
        </div>
      </div>
      <section className="section bg-white">
        <div className="container-sm">
          <div className="grid-2" style={{gap:56,alignItems:"start"}}>
            <div>
              <div className="label" style={{marginBottom:12}}>{t("contact.infoTitle")}</div>
              <h2 className="h2" style={{marginBottom:28}}>{t("contact.infoName")}</h2>
              {[[t("contact.emailLabel"),"info@facultyhd.com"],[t("contact.responseLabel"),t("contact.responseVal")],[t("contact.deliveryLabel"),t("contact.deliveryVal")]].map(([l,v])=>(
                <div key={l} style={{marginBottom:20}}><div className="label" style={{marginBottom:5}}>{l}</div><div className="body-md">{v}</div></div>
              ))}
            </div>
            <div className="form-wrap">
              <div style={{fontFamily:"var(--font-serif)",fontSize:"1.2rem",marginBottom:20}}>{t("contact.formTitle")}</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div className="form-group"><label className="form-label">{t("contact.nameLabel")}</label><input className="form-input" name="name" value={form.name} onChange={ch} placeholder={t("contact.namePlaceholder")}/></div>
                <div className="form-group"><label className="form-label">{t("contact.emailField")}</label><input className="form-input" type="email" name="email" value={form.email} onChange={ch} placeholder={t("contact.emailPlaceholder")}/></div>
                <div className="form-group"><label className="form-label">{t("contact.subjectLabel")}</label><input className="form-input" name="subject" value={form.subject} onChange={ch} placeholder={t("contact.subjectPlaceholder")}/></div>
                <div className="form-group"><label className="form-label">{t("contact.msgLabel")}</label><textarea className="form-input" name="msg" value={form.msg} onChange={ch} placeholder={t("contact.msgPlaceholder")} style={{resize:"vertical",minHeight:110}}/></div>
                {status==="ok"
                  ? <div style={{background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:"var(--radius-md)",padding:"16px 20px",fontSize:".9rem",color:"#166534",lineHeight:1.6}}>
                      ✓ &nbsp;{LANG==="en"?"Your message has been sent. We'll respond within 1 business day.":"Je bericht is verstuurd. We reageren binnen 1 werkdag."}
                    </div>
                  : <>
                      <button className="btn btn-primary" onClick={send} disabled={status==="sending"||!form.name.trim()||!form.email.trim()||!form.msg.trim()}>
                        {status==="sending"?(LANG==="en"?"Sending...":"Versturen..."):(t("contact.sendBtn"))}
                      </button>
                      {status==="error"&&<div style={{fontSize:".82rem",color:"#C62828",marginTop:6}}>{errMsg}</div>}
                    </>
                }
              </div>
            </div>
          </div>
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
    win.document.write("<!DOCTYPE html><html><head><meta charset=UTF-8><title>"+tl(rpt.title)+" - "+form.name+"</title><link href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap' rel=stylesheet><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Jost,sans-serif;font-weight:300;background:#fff;color:#1C1917}.cover{min-height:100vh;background:#1C1917;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:72px;page-break-after:always}.ci{font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(154,128,80,.6);margin-bottom:24px}.ct{font-family:Cormorant Garamond,serif;font-size:48px;font-weight:300;color:#fff;line-height:1.05;margin-bottom:12px}.cn{font-family:Cormorant Garamond,serif;font-size:26px;font-style:italic;color:rgba(255,255,255,.5);margin-bottom:32px}.cm{font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;line-height:2.2}.content{max-width:720px;margin:0 auto;padding:56px}.mb{border-left:2px solid rgba(154,128,80,.35);padding:18px 22px;margin:0 0 40px;background:#f9f8f6}table{width:100%;border-collapse:collapse}td{padding:6px 12px 6px 0;font-size:12px;color:#444;border-bottom:1px solid #f0ede8}td:first-child{font-weight:600;color:#3D2C5E;width:160px}h2{font-family:Cormorant Garamond,serif;font-size:20px;font-weight:400;color:#1C1917;margin:44px 0 12px;padding-bottom:8px;border-bottom:1px solid #e8e5e0;page-break-after:avoid}p{font-size:13px;line-height:2;color:#3a3a32;margin-bottom:12px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class=cover><div class=ci>Faculty of Human Design - Ibiza</div><div class=ct>"+tl(rpt.title)+"</div><div class=cn>"+form.name+"</div><div class=cm>"+(LANG==="en"?"Born ":"Geboren ")+form.day+"-"+form.month+"-"+form.year+"</div></div><div class=content><div class=mb><table>"+meta+"</table></div>"+bh+"</div><script>window.onload=function(){window.print();}<\/script></body></html>");
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
  useSEO({title:LANG==="en"?"Order confirmed":"Bestelling bevestigd",description:LANG==="en"?"Your order has been received. Your report will be delivered by email within 1 business day.":"Je bestelling is ontvangen. Je rapport wordt binnen 1 werkdag per e-mail bezorgd.",canonical:SITE+"/"});
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

// ─── ROUTING HELPERS ─────────────────────────────────────────────────────────
const ROUTABLE = new Set(["home","wat","rapporten","blog","over","contact","voorwaarden"]);

function pathToPage(pathname) {
  // Strip language prefix first (/en/... → /...)
  const p = stripLangPrefix(pathname);
  if (!p || p === "/") return "home";
  const rapportMatch = p.match(/^\/rapport\/(.+)$/);
  if (rapportMatch) return "rapport-" + rapportMatch[1];
  const seg = p.replace(/^\//, "").replace(/\/$/, "");
  if (ROUTABLE.has(seg)) return seg;
  return "home";
}

function pageToPath(page) {
  const prefix = LANG === "en" ? "/en" : "";
  if (page === "home") return prefix + "/";
  if (page.startsWith("rapport-")) return prefix + "/rapport/" + page.slice("rapport-".length);
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
                <Li><strong>{isEn?"Payment data":"Betalingsgegevens"}</strong> {isEn?"are processed by Stripe and are never stored by us":"worden verwerkt door Stripe en worden nooit door ons opgeslagen"}</Li>
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
                {isEn?"Third parties":"Derde partijen"}
              </div>
              <ul style={{paddingLeft:20,margin:0}}>
                <Li><strong>Supabase</strong> — {isEn?"secure order storage (EU servers)":"veilige opslag van bestellingen (servers in de EU)"}</Li>
                <Li><strong>Stripe</strong> — {isEn?"payment processing (own data processing agreement applies)":"betalingsverwerking (eigen verwerkersovereenkomst van toepassing)"}</Li>
                <Li><strong>Resend</strong> — {isEn?"transactional email delivery":"verzending van transactionele e-mail"}</Li>
                <Li><strong>Anthropic (Claude API)</strong> — {isEn?"AI analysis for report generation; birth data is used solely for this purpose and not retained by Anthropic":"AI-analyse voor het samenstellen van rapporten; geboortegegevens worden uitsluitend voor dit doel gebruikt en niet bewaard door Anthropic"}</Li>
                <Li><strong>Vercel</strong> — {isEn?"website and report hosting (EU/US servers)":"hosting van de website en rapporten (servers in de EU/VS)"}</Li>
              </ul>
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
              {isEn?"View our reports":"Bekijk onze rapporten"}
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
    window.scrollTo(0,0);
    // Push URL for all navigable pages; skip transient states
    if(p!=="result"&&p!=="bedankt"){
      window.history.pushState({page:p},"",pageToPath(p));
    }
  };

  const onDone=(chart,form,report,rpt)=>{setResult({chart,form,report,rpt});setPage("result");window.scrollTo(0,0);};
  const currentRpt=page.startsWith("rapport-")?REPORTS.find(r=>r.id===page.replace("rapport-","")):null;

  // Tag the initial history entry + listen for back/forward
  useEffect(()=>{
    window.history.replaceState({page:pathToPage(window.location.pathname)},"",window.location.href);
    const onPop=e=>{
      const p=e.state?.page||pathToPage(window.location.pathname);
      setPage(p);
      window.scrollTo(0,0);
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
      window.scrollTo(0,0);
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
            method:"POST",headers:{"Content-Type":"application/json"},
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
            {page==="blog"&&<BlogPage go={go}/>}
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