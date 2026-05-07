import { useState, useEffect } from "react";

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
  w_ibiza:       "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=1200&auto=format&fit=crop&q=80",

  // ── Subscription moon backdrop ──────────────────────────────────────
  sub_moon:      "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1200&auto=format&fit=crop&q=80",

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
html { scroll-behavior:smooth; }
body { font-family:var(--font-sans); background:var(--bg); color:var(--text);
  font-size:16px; line-height:1.6; -webkit-font-smoothing:antialiased; overflow-x:hidden; }
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
.h1-hero { font-family:var(--font-serif); font-size:clamp(2.8rem,6.5vw,5rem); font-weight:300; line-height:1.02; color:white; letter-spacing:-.01em; }
.h2 { font-family:var(--font-serif); font-size:clamp(1.9rem,3.8vw,2.95rem); font-weight:300; line-height:1.12; }
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
.section.bg-white { background:var(--white); }
.section.bg-muted { background:var(--muted); }
.section.bg-dark { background:var(--dark); }
.section.bg-cosmos { background:var(--cosmos); }
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
.sub-card-moon img { width:100%; height:100%; object-fit:cover; object-position:center 30%; opacity:.14; filter:saturate(.3) brightness(.7); }

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
.hero-content { position:relative; z-index:2; max-width:1240px; margin:0 auto; padding:0 32px; width:100%; }
.hero-text { max-width:660px; }
.hero-eyebrow { font-size:.58rem; font-weight:500; letter-spacing:.22em; text-transform:uppercase; color:rgba(201,168,92,.8); margin-bottom:26px; display:flex; align-items:center; gap:14px; }
.hero-eyebrow::before { content:""; display:block; width:28px; height:1px; background:rgba(201,168,92,.45); flex-shrink:0; }
.hero-title em { color:rgba(255,255,255,.42); font-style:italic; }
.hero-subtitle { font-size:1.05rem; font-weight:300; color:rgba(255,255,255,.5); line-height:1.84; margin:20px 0 36px; max-width:520px; }
.hero-actions { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:40px; }
.hero-trust { display:flex; gap:24px; flex-wrap:wrap; }
.hero-trust-item { font-size:.7rem; font-weight:300; color:rgba(255,255,255,.36); display:flex; align-items:center; gap:6px; }
.hero-trust-item::before { content:"✦"; font-size:.48rem; color:rgba(201,168,92,.45); }
.hero-scroll { position:absolute; bottom:36px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; opacity:.4; }
.hero-scroll-line { width:1px; height:36px; background:linear-gradient(to bottom, transparent, white); animation:scrollline 2.2s ease-in-out infinite; }
@keyframes scrollline { 0%,100%{opacity:0;transform:scaleY(0);transform-origin:top} 40%,60%{opacity:1;transform:scaleY(1);transform-origin:top} 80%{transform:scaleY(1);transform-origin:bottom;opacity:0} }
.hero-scroll-label { font-size:.5rem; letter-spacing:.18em; text-transform:uppercase; color:white; }

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
.faq-item { border-bottom:1px solid var(--border); padding:18px 0; }
.faq-q { font-family:var(--font-serif); font-size:1rem; font-weight:400; color:var(--text); cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:16px; }
.faq-q:hover { color:var(--brand); }
.faq-toggle { font-size:1.2rem; color:var(--brand); flex-shrink:0; transition:transform .25s; }
.faq-toggle.open { transform:rotate(45deg); }
.faq-a { font-size:.875rem; font-weight:300; color:var(--text-muted); line-height:1.85; margin-top:12px; }

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

/* SUB CARD */
.sub-card { background:linear-gradient(135deg,var(--brand) 0%,var(--brand-deep) 100%); border-radius:var(--radius-xl); padding:48px; color:white; position:relative; overflow:hidden; }
.sub-card::before { content:""; position:absolute; top:-40%; right:-8%; width:65%; height:170%; background:radial-gradient(ellipse, rgba(201,168,92,.05) 0%, transparent 60%); pointer-events:none; }
.sub-price { font-family:var(--font-serif); font-size:3rem; font-weight:300; color:white; line-height:1; }
.sub-price-period { font-size:.78rem; color:rgba(255,255,255,.45); margin-top:5px; }

/* DETAIL HERO */
.detail-hero { background:var(--dark); padding:96px 32px 68px; position:relative; overflow:hidden; }
.detail-hero-bg { position:absolute; inset:0; overflow:hidden; }
.detail-hero-bg>img { width:100%; height:100%; object-fit:cover; opacity:.32; }
.detail-hero-bg::after { content:""; position:absolute; inset:0; background:linear-gradient(to bottom, rgba(12,10,23,.45) 0%, rgba(12,10,23,.78) 100%); }
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
  .footer-bottom { flex-direction:column; align-items:flex-start; }
  .stat-row-inner { flex-wrap:wrap; }
  .stat-row-item { flex:none; width:50%; border-bottom:1px solid var(--border); }
  .hero-content { padding:0 20px; }
  .photo-cta-content { padding:80px 20px; }
}
@media (max-width:480px) {
  .hero-actions { flex-direction:column; }
  .hero-actions .btn { width:100%; }
  .report-summary-grid { grid-template-columns:1fr; }
  .stat-row-item { width:100%; }
  .waarom-card-img { height:180px; }
}
`;


// ─── ANALYTICS ────────────────────────────────────────────────────────────────
const track = (event, props = {}) => {
  if (typeof window !== "undefined" && window.gtag) window.gtag("event", event, props);
  console.log("[Analytics]", event, props);
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────
const REPORTS = [
  {
    id:"volledig", icon:"✦", tag:"Meest gekozen",
    title:"Volledig Human Design Rapport",
    price:"€75", priceNum:75, sub:"Eenmalig · Direct als PDF",
    outcome:"Begrijp eindelijk wie je werkelijk bent",
    tagline:"Je complete persoonlijke blauwdruk",
    intro:"Het meest uitgebreide rapport dat wij aanbieden. Een volledige analyse van je Human Design chart — van Type en Autoriteit tot Inkarnatie-Kruis en praktische levensguidance.",
    includes:["Type, Strategie & Signature","Autoriteit — hoe je beslissingen neemt","Profiel — het verhaal van je leven","Alle 9 centra geanalyseerd","Actieve kanalen & krachten","Poorten — je natuurlijke kwaliteiten","Inkarnatie-Kruis — je levensdoel","Relaties & werk vanuit je design","Praktische guidance 2026–2028"],
    for:"Voor iedereen die een diepgaand en volledig inzicht wil in hun Human Design.",
    sections:12, pages:"40+",
    prompt_extra:"### 1. Je Energetische Blauwdruk\n### 2. Type & Levensstrategie\n### 3. Autoriteit\n### 4. Profiel\n### 5. Gedefinieerde Centra\n### 6. Open Centra & Conditionering\n### 7. Actieve Kanalen\n### 8. Je Poorten\n### 9. Inkarnatie-Kruis\n### 10. Relaties & Verbinding\n### 11. Praktische Guidance 2026-2028\n### 12. Slotanalyse",
    reviews:[
      ["Ik had al eerder iets gelezen over Human Design maar dit rapport bracht het echt tot leven. De sectie over mijn open centra was confronterend en bevrijdend tegelijk — ik herkende zo veel conditionering die ik als 'mezelf' had aangenomen. Drie maanden later lees ik het nog steeds.","Marieke V., Amsterdam"],
      ["Precies wat ik zocht. Geen vage spirituele teksten maar concrete analyse van wie ik ben en hoe ik het beste functioneer.","Thomas D., Antwerpen"],
      ["Het stuk over mijn Inkarnatie-Kruis heeft me echt geraakt. Ik begrijp nu waarom bepaalde dingen in mijn leven steeds terugkomen. De schrijfstijl is ook prettig — persoonlijk, niet droog of technisch.","Sofie M., Utrecht"],
    ],
  },
  {
    id:"relatie_liefde", icon:"◎", tag:"",
    title:"Relatierapport — Liefde",
    price:"€95", priceNum:95, sub:"Eenmalig · Direct als PDF",
    outcome:"Meer rust en begrip in je romantische verbinding",
    tagline:"Twee designs in romantische verbinding",
    intro:"Een diepgaande analyse van jouw en je partners Human Design charts. Hoe functioneren jullie energetisch als koppel — waar versterken jullie elkaar, waar is de wrijving, en hoe groeien jullie samen?",
    includes:["Beide charts volledig geanalyseerd","Elektromagnetische verbindingen","Compatibiliteit van Types","Communicatie & intimiteitsstijl","Seksuele energie & aantrekking","Beslissingen nemen als stel","Conflictpatronen & doorbraken","Gezamenlijk groeipad","Praktisch advies voor harmonie"],
    for:"Voor koppels die hun romantische verbinding dieper willen begrijpen en versterken.",
    sections:9, pages:"28+", needsPartner:true, partnerLabel:"Partner",
    prompt_extra:"### 1. De Energie van Jullie Verbinding\n### 2. Chart Analyse — Jouw Design\n### 3. Chart Analyse — Partners Design\n### 4. Elektromagnetische Verbindingen\n### 5. Compatibiliteit & Aantrekking\n### 6. Communicatie & Intimiteit\n### 7. Spanningsvelden & Doorbraken\n### 8. Gezamenlijk Groeipad\n### 9. Praktisch Advies voor Harmonie",
    reviews:[
      ["Mijn partner en ik hadden al jaren moeite met communiceren. Het rapport legde precies uit waarom — onze energietypen botsen op een heel specifieke manier die we nu herkennen en kunnen ombuigen. Dat is goud waard.","Elena & Marc, Gent"],
      ["Ik had dit als verrassing voor mijn partner besteld. We hebben het samen gelezen en waren allebei stil bij hoe accuraat de beschrijving van onze dynamiek was.","Roos & Tim, Amsterdam"],
      ["Verrassend diepgaand. Niet alleen 'jullie vullen elkaar aan' maar echt concrete patronen en waar de wrijving vandaan komt.","Nathalie D., Brugge"],
    ],
  },
  {
    id:"relatie_business", icon:"◈", tag:"",
    title:"Relatierapport — Business",
    price:"€85", priceNum:85, sub:"Eenmalig · Direct als PDF",
    outcome:"Samenwerking die werkt voor jullie allebei",
    tagline:"Twee designs in zakelijke samenwerking",
    intro:"Een analyse van twee Human Design charts vanuit zakelijk perspectief. Wie leidt, wie beslist, waar liggen de complementariteiten — en hoe bouwen jullie een samenwerking die werkt voor beiden?",
    includes:["Beide charts volledig geanalyseerd","Besluitvormingsdynamieken","Complementariteit van Types","Leiderschapsstijl per chart","Werkenergieën & ritmes","Communicatiepatronen op de werkvloer","Conflictpatronen & oplossingen","Rolverdeling & verantwoordelijkheden","Praktisch advies voor optimale samenwerking"],
    for:"Voor zakenpartners, compagnons of collega's die hun samenwerking bewust willen verbeteren.",
    sections:9, pages:"24+", needsPartner:true, partnerLabel:"Zakenpartner",
    prompt_extra:"### 1. De Energie van Jullie Samenwerking\n### 2. Chart Analyse — Jouw Design\n### 3. Chart Analyse — Zakenpartner Design\n### 4. Besluitvormingsdynamieken\n### 5. Complementariteit & Sterktes\n### 6. Leiderschapsstijl & Rolverdeling\n### 7. Communicatie & Conflictpatronen\n### 8. Gezamenlijke Visie & Richting\n### 9. Praktisch Advies voor Samenwerking",
    reviews:[
      ["Ik had dit met mijn compagnon gedaan. De analyse van hoe wij beslissingen nemen was verbazend accuraat. We werken nu bewust anders samen.","Pieter K., Rotterdam"],
      ["Het rapport liet zien dat mijn partner een Manifestor is en ik een Generator. Dat verklaarde zoveel van onze samenwerking — nu gaan we er bewust mee om.","Lars M., Utrecht"],
      ["Als twee oprichters van een startup is het rapport ons leidraad geworden voor taakverdeling. Concreet, praktisch en verrassend nauwkeurig.","Sara & Joris, Gent"],
    ],
  },
  {
    id:"relatie_familie", icon:"◇", tag:"",
    title:"Relatierapport — Familie",
    price:"€75", priceNum:75, sub:"Eenmalig · Direct als PDF",
    outcome:"Meer begrip en verbinding in het gezin",
    tagline:"Twee designs in familieverband",
    intro:"Een analyse van twee familieleden — ouder en kind, broer en zus, of een andere gezinsrelatie. Hoe opereren jullie designs samen en hoe creëer je meer begrip, verbinding en ruimte?",
    includes:["Beider charts geanalyseerd","Energetische dynamieken in het gezin","Communicatiestijlen per type","Groeimogelijkheden voor beiden","Patronen van conflict en verbinding","Rolverdeling binnen de familie","Opvoedings- en begeleidingstips","Praktische guidance voor meer begrip","Slotanalyse"],
    for:"Voor ouders met kinderen, broers en zussen of andere gezinsleden die meer inzicht willen in hun dynamiek.",
    sections:9, pages:"24+", needsPartner:true, partnerLabel:"Familielid",
    prompt_extra:"### 1. De Energie van Jullie Familiebinding\n### 2. Chart Analyse — Jouw Design\n### 3. Chart Analyse — Familielid\n### 4. Familiedynamieken & Patronen\n### 5. Communicatiestijlen & Begrip\n### 6. Groeimogelijkheden voor Beiden\n### 7. Spanningsvelden & Oplossingen\n### 8. Guidance voor Meer Verbinding\n### 9. Slotanalyse",
    reviews:[
      ["Mijn dochter en ik hebben het rapport samen besproken. Voor het eerst begreep ik écht waarom zij reageert zoals ze reageert — dat heeft onze verhouding veranderd.","Karin V., Den Haag"],
      ["Het inzicht in hoe mijn moeder en ik anders communiceren was een openbaring. Niet alleen voor mijn begrip van haar, maar ook voor hoe ik mezelf in die relatie gedraag.","Thomas B., Antwerpen"],
      ["Voor broer en zus is dit ook bijzonder waardevol. Veel patronen die we altijd 'gewoon zo' noemden kregen eindelijk een verklaring.","Femke O., Leiden"],
    ],
  },
  {
    id:"jaar", icon:"◈", tag:"",
    title:"Jaarrapport 2026",
    price:"€55", priceNum:55, sub:"Eenmalig · Direct als PDF",
    outcome:"Weet wat er dit jaar van je gevraagd wordt",
    tagline:"De energetische thema's van je jaar",
    intro:"Gebaseerd op je Solar Return — de posities van de planeten op je verjaardag dit jaar. Wat zijn de dominante thema's en kansen?",
    includes:["Solar Return analyse","Dominante thema's voor 2026","Kwartaal-voor-kwartaal overzicht","Planetaire invloeden op je chart","Kansen en aandachtspunten","Intentie voor het jaar"],
    for:"Voor wie het jaar bewust en gericht wil ingaan.",
    sections:9, pages:"22+",
    prompt_extra:"### 1. Energie van Je Nieuw Levensjaar\n### 2. Solar Return Analyse\n### 3. Dominante Themas\n### 4. Kwartaal 1\n### 5. Kwartaal 2\n### 6. Kwartaal 3\n### 7. Kwartaal 4\n### 8. Kansen & Uitdagingen\n### 9. Intentie voor het Jaar",
    reviews:[
      ["Ik bestel dit elk jaar rond mijn verjaardag. Het kwartaaloverzicht gebruik ik echt als leidraad — niet als agenda maar als bewustzijn van wat er op me afkomt. Dit jaar klopte het weer opvallend goed.","Roos B., Utrecht"],
      ["Het rapport beschreef een thema van 'loslaten en vertrouwen' voor het derde kwartaal. Ik was sceptisch, maar er gebeurde inderdaad iets in die periode wat ik niet had zien aankomen. Achteraf paste het precies in dat verhaal.","Joost V., Den Haag"],
      ["Fijn dat het niet alleen over 'kansen' gaat maar ook eerlijk is over uitdagingen. Dat maakt het geloofwaardiger.","Anke S., Leiden"],
    ],
  },
  {
    id:"kind", icon:"◇", tag:"",
    title:"Kinderrapport",
    price:"€45", priceNum:45, sub:"Eenmalig · Direct als PDF",
    outcome:"Begeleid je kind vanuit wie het werkelijk is",
    tagline:"Je kind begrijpen vanuit zijn of haar design",
    intro:"Een rapport voor ouders. Hoe gebruik je kind energie en hoe leert het het beste?",
    includes:["Type & energiegebruik","Hoe je kind beslissingen neemt","Leerstijl & communicatie","Behoeften & grenzen","Opvoedtips op maat","Gaven & talenten"],
    for:"Voor ouders die hun kind willen begeleiden op basis van wie het werkelijk is.",
    sections:10, pages:"24+", needsChild:true,
    prompt_extra:"### 1. Het Unieke Design van Je Kind\n### 2. Type & Energie\n### 3. Beslissingen Nemen\n### 4. Hoe Je Kind Leert\n### 5. Behoeften & Grenzen\n### 6. Centra Analyse\n### 7. Opvoedtips Op Maat\n### 8. Gaven & Talenten\n### 9. Relatie Ouder-Kind\n### 10. Slotanalyse",
    reviews:[
      ["Mijn dochter van 9 werd altijd gezien als 'druk' of 'moeilijk'. Het rapport legde uit dat zij een Manifestor is en dat haar behoefte om dingen zelf te initiëren volkomen logisch is. Sindsdien botsen we veel minder.","Sandra P., Haarlem"],
      ["Ik was aanvankelijk sceptisch — mijn kind is nog maar 6. Maar de beschrijving van zijn leerstijl klopte zo precies dat mijn man en ik allebei stil werden.","Femke J., Eindhoven"],
      ["De opvoedtips zijn niet vaag maar heel concreet: hoe reageer je wanneer je kind iets weigert, hoe geef je grenzen aan op een manier die bij zijn type past. Dat is echt bruikbaar.","David C., Maastricht"],
    ],
  },
  {
    id:"loopbaan", icon:"◆", tag:"",
    title:"Loopbaan & Geld Rapport",
    price:"€65", priceNum:65, sub:"Eenmalig · Direct als PDF",
    outcome:"Verdien geld op een manier die bij je past",
    tagline:"Werk en financiën vanuit je design",
    intro:"Hoe maakt je geld op een manier die bij jou past? Welke werkomgeving geeft je energie?",
    includes:["Ideale werkomgeving","Hoe je geld aantrekt","Je professionele kracht","Samenwerking & leiderschap","Valkuilen op de werkvloer","Ondernemen vs. loondienst","Financiële strategie op maat"],
    for:"Voor iedereen die wil werken en verdienen in lijn met wie zij zijn.",
    sections:9, pages:"24+",
    prompt_extra:"### 1. Professionele Blauwdruk\n### 2. Ideale Werkomgeving\n### 3. Hoe Je Geld Aantrekt\n### 4. Je Professionele Kracht\n### 5. Samenwerking & Leiderschap\n### 6. Valkuilen\n### 7. Ondernemen vs. Loondienst\n### 8. Financiele Strategie\n### 9. Volgende Stap",
    reviews:[
      ["Na twaalf jaar in loondienst twijfelde ik of ik voor mezelf moest beginnen. Het rapport was heel helder: mijn type en profiel passen beter bij zelfstandig werken, en het legde ook uit waarom ik me in teamverband altijd een beetje gevangen voel. Twee maanden later had ik mijn eerste eigen klant.","Laura M., Amsterdam"],
      ["Het stuk over 'hoe ik geld aantrek' klonk in eerste instantie zweverig maar de uitleg was verrassend praktisch — het gaat over hoe je je werk aanbiedt en op welk moment je ja of nee zegt.","Kevin T., Antwerpen"],
      ["Ik gebruik het rapport nog steeds als naslagwerk bij carrièrebeslissingen. Het geeft me een referentiepunt.","Isabel R., Utrecht"],
    ],
  },
  {
    id:"numerologie", icon:"∞", tag:"",
    title:"Numerologie Rapport",
    price:"€65", priceNum:65, sub:"Eenmalig · Direct als PDF",
    outcome:"Begrijp de patronen achter je levensverhaal",
    tagline:"De getallen achter je naam en geboortedag",
    intro:"Op basis van je volledige naam en geboortedatum berekenen wij 8 kerngetallen die samen een diepgaand beeld geven van je aard en levensdoel.",
    includes:["Levenspadgetal","Uitdrukkingsgetal","Zielsgetal","Persoonlijkheidsgetal","Verjaardagsgetal","Persoonlijk jaar 2026","Rijpingsgetal","Mastergetallen indien aanwezig"],
    for:"Voor iedereen die de diepere betekenis van naam en geboortedag wil begrijpen.",
    sections:12, pages:"30+",
    prompt_extra:"### 1. Je Numerologische Blauwdruk\n### 2. Levenspadgetal\n### 3. Uitdrukkingsgetal\n### 4. Zielsgetal\n### 5. Persoonlijkheidsgetal\n### 6. Verjaardagsgetal\n### 7. Persoonlijk Jaar 2026\n### 8. Rijpingsgetal\n### 9. Mastergetallen\n### 10. Hoe Je Getallen Samenwerken\n### 11. Guidance 2026-2028\n### 12. Slotanalyse",
    reviews:[
      ["Ik heb een levenspadgetal 11 en had altijd het gevoel anders te zijn. Voor het eerst las ik een uitleg die dat niet pathologiseerde maar als een gave behandelde. Dat deed iets met me.","Vera N., Nijmegen"],
      ["Ik was benieuwd of numerologie iets zou toevoegen naast mijn Human Design rapport. Het bleek een andere invalshoek die elkaar goed aanvult — het ene gaat over energie, het andere over levenslessen en patronen.","Frank O., Den Bosch"],
      ["De sectie over mijn persoonlijk jaar was opvallend accuraat voor wat er dit jaar speelt.","Mirjam H., Groningen"],
    ],
  },
  {
    id:"horoscoop", icon:"☽", tag:"",
    title:"Geboortehoroscoop",
    price:"€75", priceNum:75, sub:"Eenmalig · Direct als PDF",
    outcome:"Je planeetstanden als persoonlijk kompas",
    tagline:"Je complete astrologische chart",
    intro:"Een volledige geboortehoroscoop op basis van de exacte posities van alle planeten op het moment van je geboorte.",
    includes:["Zonneteken","Ascendant","Maan — je emotionele wereld","Alle 10 planeten in teken & huis","12 huizen geanalyseerd","Belangrijkste aspecten","Midhemel — je roeping","Dominant element & modaliteit"],
    for:"Voor wie wil begrijpen hoe de sterren stonden op hun geboortemoment.",
    sections:12, pages:"32+",
    prompt_extra:"### 1. Je Astrologische Blauwdruk\n### 2. Zonneteken\n### 3. Ascendant\n### 4. De Maan\n### 5. Mercurius Venus Mars\n### 6. Jupiter Saturnus\n### 7. Buitenste Planeten\n### 8. De Huizen\n### 9. Aspecten\n### 10. Midhemel\n### 11. Guidance 2026-2028\n### 12. Slotanalyse",
    reviews:[
      ["Ik heb veel horoscopen gelezen maar dit was de eerste die écht inging op de spanning tussen mijn Maan en Ascendant. Dat is precies waar ik mijn leven lang mee worstel. Het voelde alsof iemand mij eindelijk begreep.","Charlotte B., Leiden"],
      ["Diepgaander dan ik had verwacht. Niet alleen de zonnetekens maar alle huizen, aspecten, de Midhemel — een volledig portret. Ik heb het met mijn therapeut gedeeld als extra context.","Bart V., Gent"],
      ["Goed geschreven en toegankelijk, ook als je niet veel weet van astrologie. De kern kwam meteen over.","Yasmine K., Rotterdam"],
    ],
  },
  {
    id:"maandelijks", icon:"◯", tag:"Abonnement",
    title:"Maandelijkse Guidance",
    price:"€19/mnd", priceNum:19, sub:"Maandelijks opzegbaar",
    outcome:"Elke maand bewust leven vanuit je design",
    tagline:"Elke maand je persoonlijke energiegids",
    intro:"Elke maand een persoonlijk rapport over de energetische thema's van die maand, afgestemd op je Human Design chart.",
    includes:["Energie & thema's van de maand","Planetaire invloeden","Kansen & aandachtspunten","Praktisch advies","Intentie voor de maand"],
    for:"Voor wie maandelijks bewust wil leven in lijn met hun design.",
    sections:6, pages:"12+",
    prompt_extra:"### 1. Energie van Deze Maand\n### 2. Planetaire Invloeden\n### 3. Wat Er van jou Gevraagd Wordt\n### 4. Kansen\n### 5. Aandachtspunten\n### 6. Intentie voor de Maand",
    reviews:[
      ["Ik ben nu acht maanden abonnee. Elke maand lees ik het rapport in de eerste week en gebruik ik de intentie als anker. Het is bescheiden in omvang maar precies genoeg.","Noor A., Amsterdam"],
      ["Wat ik fijn vind is dat het niet overlaadt met informatie. Eén duidelijke intentie voor de maand, een paar aandachtspunten — dat is genoeg om bewust mee te leven.","Tom S., Breda"],
      ["Vorige maand beschreef het rapport een thema van 'terugkeer naar jezelf'. Ik had net een zware periode achter de rug en het voelde alsof het precies op het juiste moment kwam.","Lisa V., Utrecht"],
    ],
  },
];


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
  sessionStorage.setItem("fhd_chart", JSON.stringify(chartData));
  sessionStorage.setItem("fhd_form", JSON.stringify(formData));
  sessionStorage.setItem("fhd_rpt_id", rptId);
  const rpt = REPORTS.find(r => r.id === rptId);
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rptId,
        title: rpt?.title || rptId,
        price: rpt?.priceNum || 75,
        isSubscription: rptId === "maandelijks",
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Betaling kon niet worden gestart: " + (data.error || "onbekende fout"));
    }
  } catch (e) {
    alert("Betaling kon niet worden gestart. Probeer opnieuw.");
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
const PROFS={"1-2":"1/2 Onderzoeker/Kluizenaar","1-3":"1/3 Onderzoeker/Martelaar","2-4":"2/4 Kluizenaar/Opportunist","2-5":"2/5 Kluizenaar/Ketter","3-5":"3/5 Martelaar/Ketter","3-6":"3/6 Martelaar/Rolmodel","4-6":"4/6 Opportunist/Rolmodel","4-1":"4/1 Opportunist/Onderzoeker","5-1":"5/1 Ketter/Onderzoeker","5-2":"5/2 Ketter/Kluizenaar","6-2":"6/2 Rolmodel/Kluizenaar","6-3":"6/3 Rolmodel/Martelaar"};

function lonToGL(lon){lon=((lon%360)+360)%360;const gs=360/64,idx=Math.floor(lon/gs),gate=GS[idx%64],line=Math.min(Math.floor(((lon%gs)/gs)*6)+1,6);return[gate,line];}

function calcHD(y,m,d,h,min){
  const jdP=jday(y,m,d,h+min/60),jdD=jdP-(88/360)*365.25;
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
const NUM_NAMES={1:"De Leider",2:"De Diplomaat",3:"De Creatieveling",4:"De Bouwer",5:"De Avonturier",6:"De Verzorger",7:"De Zoeker",8:"De Zakenman",9:"De Mensheid",11:"De Meester Intuïtief",22:"De Meester Bouwer",33:"De Meester Leraar"};
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
const EL_MAP_A={"Ram":"Vuur","Stier":"Aarde","Tweelingen":"Lucht","Kreeft":"Water","Leeuw":"Vuur","Maagd":"Aarde","Weegschaal":"Lucht","Schorpioen":"Water","Boogschutter":"Vuur","Steenbok":"Aarde","Waterman":"Lucht","Vissen":"Water"};
function lonToSign_A(lon){lon=((lon%360)+360)%360;const idx=Math.floor(lon/30)%12;return{sign:SIGNS_NL[idx],degree:Math.round((lon%30)*10)/10};}
function calcHoroscoop(y,m,d,h,min){
  const jdP=jday(y,m,d,h+min/60);
  const pDefs={Zon:"Sun",Maan:"Moon",Mercurius:"Mercury",Venus:"Venus",Mars:"Mars",Jupiter:"Jupiter",Saturnus:"Saturn",Uranus:"Uranus",Neptunus:"Neptune",Pluto:"Pluto"};
  const planets={};
  for(const[nl,en]of Object.entries(pDefs)){const lon=getPL(jdP,en);const pos=lonToSign_A(lon);planets[nl]={...pos,house:Math.floor((lon%360)/30)%12+1,longitude:Math.round(lon*100)/100};}
  const lst=((280.46061837+360.98564736629*(jdP-2451545))%360+360)%360;
  const asc=lonToSign_A((lst+90)%360);
  const mc=lonToSign_A(lst%360);
  const elements={};
  for(const[,d]of Object.entries(planets)){const el=EL_MAP_A[d.sign]||"";elements[el]=(elements[el]||0)+1;}
  const domEl=Object.entries(elements).sort((a,b)=>b[1]-a[1])[0]?.[0]||"";
  return{ascendant:asc,mc,sun_sign:planets["Zon"]?.sign||"",planets,dom_element:domEl,isHoroscoop:true};
}

// ─── PROMPT BUILDER ───────────────────────────────────────────────────────────
const MONTHS=["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
const LSTEPS=["Inleiding schrijven","Type & Strategie","Autoriteit analyseren","Profiel uitwerken","Centra beschrijven","Conditionering","Poorten in detail","Inkarnatie-Kruis","Relaties","Werk & Financien","Guidance 2026-2028","Slotanalyse"];

function buildPrompt(chart,form,rpt){
  if(rpt.id==="numerologie"){
    const num=calcNumerology(form.name,parseInt(form.day),parseInt(form.month),parseInt(form.year));
    return["NUMEROLOGIE voor "+form.name,"Naam: "+form.name,"Datum: "+form.day+"-"+form.month+"-"+form.year,"","Levenspad: "+num.lp+" - "+num.lpName,"Uitdrukking: "+num.exp+" - "+num.expName,"Ziel: "+num.soul,"Persoonlijkheid: "+num.pers,"Verjaardag: "+num.bday,"Pers. Jaar 2026: "+num.py,"Rijping: "+num.mat,"Mastergetallen: "+(num.masters.length>0?num.masters.join(", "):"geen"),"",rpt.prompt_extra].join("\n");
  }
  if(rpt.id==="horoscoop"){
    const h=calcHoroscoop(parseInt(form.year),parseInt(form.month),parseInt(form.day),parseInt(form.hour),parseInt(form.minute||"0"));
    const pStr=Object.entries(h.planets).map(([p,d])=>p+": "+d.degree+"° "+d.sign+" H"+d.house).join(", ");
    return["HOROSCOOP voor "+form.name,"Datum: "+form.day+"-"+form.month+"-"+form.year+" "+form.hour+":"+(form.minute||"00"),"Plaats: "+form.place,"","Ascendant: "+h.ascendant.degree+"° "+h.ascendant.sign,"MC: "+h.mc.degree+"° "+h.mc.sign,"Zon: "+h.sun_sign,"Dom. element: "+h.dom_element,"Planeten: "+pStr,"",rpt.prompt_extra].join("\n");
  }
  // Relatie rapporten — twee volledige HD charts berekenen en naast elkaar zetten
  if(rpt.id.startsWith("relatie_")){
    const lbl=rpt.partnerLabel||"Partner";
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
      "RELATIERAPPORT — "+rpt.title,
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
      rpt.prompt_extra,
    ].join("\n");
  }
  // Standaard HD chart
  const pStr=Object.entries(chart.pers).map(e=>e[0]+": Poort "+e[1].gate+"."+e[1].line).join(", ");
  const dStr=Object.entries(chart.des).map(e=>e[0]+": Poort "+e[1].gate+"."+e[1].line).join(", ");
  return["HD CHART voor "+form.name,"Datum: "+form.day+"-"+form.month+"-"+form.year+(form.hour?" "+form.hour+":"+(form.minute||"00"):""),"Plaats: "+form.place,"","Type: "+chart.type,"Strategie: "+chart.strat,"Autoriteit: "+chart.auth,"Profiel: "+chart.profile,"Inkarnatie-Kruis: Poort "+chart.cross,"Gedefinieerd: "+(chart.definedCenters.join(", ")||"geen"),"Open: "+chart.openCenters.join(", "),"Kanalen: "+(chart.channels.map(c=>c.g1+"-"+c.g2).join(", ")||"geen"),"Poorten: "+chart.allGates.join(", "),"Bewust: "+pStr,"Onbewust: "+dStr,"",rpt.prompt_extra].join("\n");
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
  const B="#3D2C5E",BL="#5a4288",G="#9A8050";

  return(
    <svg viewBox="0 0 640 620" style={{width:"100%",maxWidth:440,display:"block",margin:"0 auto",borderRadius:12}}>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6F3EE"/>
          <stop offset="100%" stopColor="#EDE8E0"/>
        </linearGradient>
        <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BL}/>
          <stop offset="100%" stopColor={B}/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={B} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={B} stopOpacity="0"/>
        </radialGradient>
        <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={B} floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* Background */}
      <rect width="640" height="620" fill="url(#bg)" rx="12"/>
      <line x1="0" y1="580" x2="640" y2="580" stroke="#DDD8CF" strokeWidth="1"/>

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
        const label=CENTER_NL[hov]+(d?" — gedefinieerd":" — open");
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
      {chart?.type&&<text x="320" y="614" textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="8" letterSpacing="1.8" fill="#B0A89E">{chart.type.toUpperCase()}</text>}
    </svg>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function TrustStrip({light}){
  const col=light?"rgba(255,255,255,.5)":"var(--text-muted)";
  return(
    <div className="trust-strip">
      {[["Veilige betaling"],["Persoonlijke PDF"],["Direct beschikbaar"],["Geen generieke profielen"],["Nederlandstalig"]].map(([txt])=>(
        <div key={txt} className="trust-item" style={{color:col}}><span style={{color:light?"rgba(201,168,92,.55)":"var(--gold)",fontSize:".55rem"}}>✦</span><span>{txt}</span></div>
      ))}
    </div>
  );
}

function ReportCard({rpt,onClick}){
  const imgKey="r_"+rpt.id;
  const imgSrc=IMGS[imgKey]||IMGS.hero;
  return(
    <div className="rcard" onClick={()=>{track("report_card_click",{report:rpt.id,price:rpt.priceNum});onClick();}}>
      <div className="rcard-img">
        <img src={imgSrc} alt={rpt.title} loading="lazy"/>
        <div className="rcard-img-ov"/>
        {rpt.tag&&<div className="rcard-img-badge">{rpt.tag}</div>}
        <div className="rcard-img-price">{rpt.price}</div>
      </div>
      <div className="rcard-body">
        <div className="rcard-icon">{rpt.icon}</div>
        <div className="rcard-title">{rpt.title}</div>
        {rpt.outcome&&<div className="rcard-outcome">{rpt.outcome}</div>}
        <div className="rcard-tagline">{rpt.tagline}</div>
        <div className="rcard-footer">
          <div className="rcard-meta">{rpt.pages} pag. · {rpt.sections} secties</div>
          <div className="rcard-cta">Start met dit rapport</div>
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
  const links=[["home","Home"],["wat","Wat is Human Design"],["rapporten","Rapporten"],["blog","Inzichten"],["over","Over ons"],["contact","Contact"]];
  return(
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo" onClick={()=>go("home")}>
            <div className="nav-logo-main">Faculty of Human Design</div>
            <div className="nav-logo-sub">Ibiza — Est. 2014</div>
          </div>
          <div className="nav-links">
            {links.map(([id,label])=>(
              <span key={id} className={"nav-link"+(page===id||page.startsWith("rapport-")&&id==="rapporten"?" active":"")} onClick={()=>go(id)}>{label}</span>
            ))}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}} className="nav-cta-wrap">
            <button className="btn btn-primary btn-sm" onClick={()=>{track("hero_cta_click",{location:"nav"});go("rapporten");}}>Rapporten</button>
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
          <div style={{marginTop:16}}>
            <button className="btn btn-primary btn-full" onClick={()=>{go("rapporten");setMenuOpen(false);}}>Rapporten bekijken</button>
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
            <div className="footer-logo-sub">Ibiza, Spanje — Est. 2014</div>
            <p className="footer-desc">Persoonlijke rapporten op basis van Human Design, Numerologie en Astrologie. Berekend op exacte astronomische data.</p>
          </div>
          <div>
            <div className="footer-col-title">Rapporten</div>
            {REPORTS.slice(0,4).map(r=><span key={r.id} className="footer-link" onClick={()=>go("rapport-"+r.id)}>{r.title}</span>)}
          </div>
          <div>
            <div className="footer-col-title">Informatie</div>
            {[["wat","Wat is Human Design"],["over","Over ons"],["blog","Inzichten"],["contact","Contact"]].map(([id,l])=>(
              <span key={id} className="footer-link" onClick={()=>go(id)}>{l}</span>
            ))}
          </div>
          <div>
            <div className="footer-col-title">Vertrouwen</div>
            <span className="footer-link">🔒 Veilige betaling</span>
            <span className="footer-link">📄 Persoonlijke PDF</span>
            <span className="footer-link">⚡ Direct beschikbaar</span>
            <span className="footer-link">✉ info@facultyofhumandesign.com</span>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 Faculty of Human Design. Alle rechten voorbehouden.</div>
          <div className="footer-trust">
            <div className="footer-trust-item">🔒 SSL beveiligd</div>
            <div className="footer-trust-item">🇳🇱 iDEAL beschikbaar</div>
          </div>
        </div>
      </div>
    </footer>
  );
}


// ─── REPORT FORM ──────────────────────────────────────────────────────────────
function ReportForm({rpt,onDone,postPayment}){
  const[form,setForm]=useState({name:"",day:"",month:"",year:"",hour:"",minute:"",place:"",pname:"",pday:"",pmonth:"",pyear:"",phour:"",pminute:"",cname:"",cday:"",cmonth:"",cyear:"",chour:"",cminute:""});
  const[chart,setChart]=useState(null);
  const[ls,setLs]=useState(0);
  const[pr,setPr]=useState(0);
  const[loading,setLoading]=useState(false);const[autoTrigger,setAutoTrigger]=useState(false);useEffect(()=>{if(!postPayment)return;setChart(postPayment.chart);setForm(f=>({...f,...postPayment.form}));setAutoTrigger(true);},[postPayment]);useEffect(()=>{if(autoTrigger&&chart){setAutoTrigger(false);doReport();}},[autoTrigger,chart]);
  const ch=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  const isNum=rpt.id==="numerologie";
  const isHoro=rpt.id==="horoscoop";
  const needsTime=!isNum;
  const isRelatie=rpt.id.startsWith("relatie_");
  const partnerOk=!isRelatie||(form.pname&&form.pday&&form.pmonth&&form.pyear);
  const ok=form.name&&form.day&&form.month&&form.year&&form.place&&(!needsTime||form.hour)&&partnerOk;
  const sections=rpt.prompt_extra.split("\n").filter(l=>l.startsWith("###")).map(l=>l.replace(/^###\s*/,"").trim());

  const doChart=()=>{
    const y=parseInt(form.year),m=parseInt(form.month),d=parseInt(form.day);
    if(!form.name||!d||!m||!y){alert("Vul alle verplichte velden in.");return;}
    if(isNum){const num=calcNumerology(form.name,d,m,y);setChart({...num,isNumerology:true});}
    else{const h=parseInt(form.hour||"12"),min=parseInt(form.minute||"0");
      setChart(isHoro?{...calcHoroscoop(y,m,d,h,min),isHoroscoop:true}:calcHD(y,m,d,h,min));}
    setTimeout(()=>document.getElementById("chart-res")?.scrollIntoView({behavior:"smooth"}),80);
  };

  const doReport=async()=>{
    setLoading(true);setPr(0);setLs(0);
    track("checkout_started",{report:rpt.id,price:rpt.priceNum});
    const hdChart=(!isNum&&!isHoro)?chart:null;
    const chartContext=buildPrompt(hdChart,form,rpt).split("\n\n")[0];
    const SYSTEM="Je bent een senior analist van de Faculty of Human Design op Ibiza. Schrijf nauwkeurige, diepgaande rapporten in het Nederlands. Schrijf vanuit het instituut. Geen bulletpoints, geen headers in de tekst — alleen alineas. Minimaal 900 woorden per sectie.";
    let allText="";
    try{
      for(let i=0;i<sections.length;i++){
        const sec=sections[i];
        setLs(Math.min(i,LSTEPS.length-1));setPr(Math.round((i/sections.length)*95));
        const prompt=chartContext+"\n\nSchrijf uitsluitend sectie '"+sec+"' van het rapport voor "+form.name+". Minimaal 900 woorden, in alineas, persoonlijk en concreet.";
        const res=await fetch("/api/generate-report",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:SYSTEM,
            messages:[{role:"user",content:prompt}]})
        });
        const data=await res.json();
        const txt=data.content?.find(b=>b.type==="text")?.text||"";
        allText+="### "+sec+"\n\n"+txt+"\n\n";
      }
      setPr(100);
      track("checkout_completed",{report:rpt.id,price:rpt.priceNum});
      setTimeout(()=>{setLoading(false);onDone(chart,form,allText.trim(),rpt);},400);
    }catch(e){setLoading(false);onDone(chart,form,"Er is iets misgegaan: "+e.message,rpt);}
  };

  if(loading)return(
    <div className="loading-overlay">
      <div className="loading-icon">✦</div>
      <div className="loading-title">Je blauwdruk wordt samengesteld</div>
      <div className="loading-counter">Analyse {Math.min(ls+1,sections.length)} van {sections.length}</div>
      <div className="loading-steps">
        {sections.map((step,i)=>(
          <div key={i} className="loading-step" style={{opacity:i<ls?.35:i===ls?1:.18}}>
            <div className="loading-step-dot" style={{background:i<ls?"#9A8050":i===ls?"#fff":"#444"}}/>
            <div className="loading-step-text" style={{color:i===ls?"#fff":"rgba(255,255,255,.4)"}}>{step}</div>
            {i===ls&&<div className="loading-step-badge">bezig...</div>}
            {i<ls&&<div className="loading-step-badge">✓</div>}
          </div>
        ))}
      </div>
      <div className="loading-bar-wrap"><div className="loading-bar-fill" style={{width:pr+"%"}}/></div>
      <p style={{marginTop:18,fontSize:".72rem",color:"rgba(255,255,255,.15)",letterSpacing:".1em"}}>Dit duurt 3-4 minuten</p>
    </div>
  );

  return(
    <div>
      <div className="section bg-muted" id="bestel">
        <div className="container-sm">
          <div className="label" style={{marginBottom:8}}>Stap 1 — Gegevens invoeren</div>
          <h2 className="h2" style={{marginBottom:8}}>Vul je geboortegegevens in</h2>
          <p className="body-md" style={{marginBottom:32}}>Je chart wordt direct gratis berekend. Je betaalt pas na het bekijken van je chart.</p>
          <div className="form-wrap">
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:"1.2rem",marginBottom:4}}>{rpt.title}</div>
              <div style={{fontSize:".82rem",color:"var(--text-light)"}}>{isNum?"Geen geboortetijd nodig.":"Vul alle velden zo nauwkeurig mogelijk in."}</div>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label className="form-label">Volledige naam</label><input className="form-input" name="name" value={form.name} onChange={ch} placeholder="Voor- en achternaam"/></div>
              <div className="form-group"><label className="form-label">Dag</label><input className="form-input" type="number" name="day" min="1" max="31" value={form.day} onChange={ch} placeholder="15"/></div>
              <div className="form-group"><label className="form-label">Maand</label><select className="form-select" name="month" value={form.month} onChange={ch}><option value="">maand</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Jaar</label><input className="form-input" type="number" name="year" value={form.year} onChange={ch} placeholder="1990"/></div>
              {needsTime&&<div className="form-group"><label className="form-label">Geboortetijd</label><div className="form-row"><input className="form-input" type="number" name="hour" min="0" max="23" value={form.hour} onChange={ch} placeholder="uur"/><input className="form-input" type="number" name="minute" min="0" max="59" value={form.minute} onChange={ch} placeholder="min"/></div></div>}
              <div className="form-group full"><label className="form-label">Geboorteplaats</label><input className="form-input" name="place" value={form.place} onChange={ch} placeholder="Amsterdam, Nederland"/></div>
            </div>
            {rpt.needsPartner&&<>
              <div className="form-divider"/>
              <div style={{fontSize:".85rem",color:"var(--text-muted)",marginBottom:14}}>Gegevens {rpt.partnerLabel||"partner"}</div>
              <div className="form-grid">
                <div className="form-group full"><label className="form-label">Naam {rpt.partnerLabel||"partner"}</label><input className="form-input" name="pname" value={form.pname} onChange={ch} placeholder={"Naam "+(rpt.partnerLabel||"partner")}/></div>
                <div className="form-group"><label className="form-label">Dag</label><input className="form-input" type="number" name="pday" min="1" max="31" value={form.pday} onChange={ch}/></div>
                <div className="form-group"><label className="form-label">Maand</label><select className="form-select" name="pmonth" value={form.pmonth} onChange={ch}><option value="">maand</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Jaar</label><input className="form-input" type="number" name="pyear" value={form.pyear} onChange={ch}/></div>
                <div className="form-group"><label className="form-label">Tijd</label><div className="form-row"><input className="form-input" type="number" name="phour" min="0" max="23" value={form.phour} onChange={ch} placeholder="uur"/><input className="form-input" type="number" name="pminute" min="0" max="59" value={form.pminute} onChange={ch} placeholder="min"/></div></div>
                <div className="form-group full"><label className="form-label">Geboorteplaats {rpt.partnerLabel||"partner"}</label><input className="form-input" name="pplace" value={form.pplace||""} onChange={ch} placeholder="Stad, land"/></div>
              </div>
            </>}
            {rpt.needsChild&&<>
              <div className="form-divider"/>
              <div style={{fontSize:".85rem",color:"var(--text-muted)",marginBottom:14}}>Gegevens kind</div>
              <div className="form-grid">
                <div className="form-group full"><label className="form-label">Naam kind</label><input className="form-input" name="cname" value={form.cname} onChange={ch} placeholder="Naam kind"/></div>
                <div className="form-group"><label className="form-label">Dag</label><input className="form-input" type="number" name="cday" min="1" max="31" value={form.cday} onChange={ch}/></div>
                <div className="form-group"><label className="form-label">Maand</label><select className="form-select" name="cmonth" value={form.cmonth} onChange={ch}><option value="">maand</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Jaar</label><input className="form-input" type="number" name="cyear" value={form.cyear} onChange={ch}/></div>
                <div className="form-group"><label className="form-label">Tijd</label><div className="form-row"><input className="form-input" type="number" name="chour" min="0" max="23" value={form.chour} onChange={ch} placeholder="uur"/><input className="form-input" type="number" name="cminute" min="0" max="59" value={form.cminute} onChange={ch} placeholder="min"/></div></div>
                <div className="form-group full"><label className="form-label">Geboorteplaats kind</label><input className="form-input" name="cplace" value={form.cplace||""} onChange={ch} placeholder="Stad, land"/></div>
              </div>
            </>}
            <button className="btn btn-primary btn-full" style={{marginTop:20}} onClick={doChart} disabled={!ok}>Bereken mijn chart gratis</button>
            <p className="form-note">Gratis berekening — geen betaling vereist om je chart te zien.<br/>🔒 Je gegevens worden vertrouwelijk behandeld.</p>
          </div>
        </div>
      </div>

      {chart&&(
        <div className="section bg-white" id="chart-res">
          <div className="container-sm">
            <div className="label" style={{marginBottom:8}}>Stap 2 — Je chart</div>
            <h2 className="h2" style={{marginBottom:32}}>{chart.isNumerology?"Je kerngetallen":chart.isHoroscoop?"Je planeetstanden":rpt.id.startsWith("relatie_")?"Twee Human Design charts":"Je Human Design chart"}</h2>
            {/* ── Relatie: twee charts naast elkaar ── */}
            {rpt.id.startsWith("relatie_")&&(()=>{
              const lbl=rpt.partnerLabel||"Partner";
              const c2=(form.pday&&form.pmonth&&form.pyear)?calcHD(parseInt(form.pyear),parseInt(form.pmonth),parseInt(form.pday),parseInt(form.phour||"12"),parseInt(form.pminute||"0")):null;
              const gedeeld=c2?chart.allGates.filter(g=>c2.allGates.includes(g)):[];
              const HDRow=({c,name})=>(
                <div className="chart-result">
                  <div style={{fontSize:".6rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--text-light)",marginBottom:4}}>Human Design</div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",marginBottom:16}}>{name}</div>
                  <table className="chart-table"><tbody>
                    <tr><td>Type</td><td><strong>{c.type}</strong></td></tr>
                    <tr><td>Strategie</td><td>{c.strat}</td></tr>
                    <tr><td>Autoriteit</td><td>{c.auth}</td></tr>
                    <tr><td>Profiel</td><td>{c.profile}</td></tr>
                    <tr><td>Gedefinieerd</td><td><div className="tags">{c.definedCenters?.length>0?c.definedCenters.map(c2=><span key={c2} className="tag-def">{c2}</span>):<span style={{fontSize:".8rem",color:"var(--text-light)"}}>geen</span>}</div></td></tr>
                    <tr><td>Poorten</td><td><div className="tags">{c.allGates?.slice(0,10).map(g=><span key={g} className="tag-gate">{g}</span>)}{c.allGates?.length>10&&<span className="tag-gate">+{c.allGates.length-10}</span>}</div></td></tr>
                  </tbody></table>
                </div>
              );
              return(
                <>
                  <div className="grid-2" style={{gap:20,marginBottom:16}}>
                    <HDRow c={chart} name={form.name}/>
                    {c2?<HDRow c={c2} name={form.pname||lbl}/>:
                      <div className="chart-result" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:160}}>
                        <p className="body-sm" style={{textAlign:"center",color:"var(--text-light)"}}>Vul de gegevens van de {lbl.toLowerCase()} in</p>
                      </div>}
                  </div>
                  {c2&&gedeeld.length>0&&(
                    <div style={{background:"rgba(61,44,94,.06)",borderLeft:"3px solid var(--brand)",padding:"14px 18px",borderRadius:"0 var(--radius-sm) var(--radius-sm) 0",marginBottom:16}}>
                      <div style={{fontSize:".62rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--brand)",marginBottom:6}}>Gedeelde poorten — elektromagnetische verbindingen</div>
                      <div className="tags">{gedeeld.map(g=><span key={g} className="tag-def">{g}</span>)}</div>
                    </div>
                  )}
                </>
              );
            })()}
            {/* ── Standaard: 1 chart + bodygraph ── */}
            {!rpt.id.startsWith("relatie_")&&(
            <div className="grid-2" style={{gap:28}}>
              <div>
                <div className="chart-result">
                  <div style={{fontSize:".6rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--text-light)",marginBottom:4}}>{chart.isNumerology?"Numerologie":chart.isHoroscoop?"Horoscoop":"Human Design"}</div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",marginBottom:16}}>{form.name}</div>
                  {chart.isNumerology?(
                    <table className="chart-table"><tbody>
                      {[["Levenspad",chart.lp+" — "+chart.lpName],["Uitdrukking",chart.exp+" — "+chart.expName],["Ziel",chart.soul],["Persoonlijkheid",chart.pers],["Verjaardag",chart.bday],["Pers. Jaar 2026",chart.py],["Rijping",chart.mat]].map(([l,v])=>(
                        <tr key={l}><td>{l}</td><td>{v}{(v===11||v===22||v===33)&&<span style={{fontSize:".6rem",color:"var(--gold)",marginLeft:6,textTransform:"uppercase"}}>MASTER</span>}</td></tr>
                      ))}
                    </tbody></table>
                  ):chart.isHoroscoop?(
                    <table className="chart-table"><tbody>
                      <tr><td>Zonneteken</td><td>{chart.sun_sign}</td></tr>
                      <tr><td>Ascendant</td><td>{chart.ascendant?.degree}deg {chart.ascendant?.sign}</td></tr>
                      <tr><td>Midhemel</td><td>{chart.mc?.degree}deg {chart.mc?.sign}</td></tr>
                      <tr><td>Dom. element</td><td>{chart.dom_element}</td></tr>
                    </tbody></table>
                  ):(
                    <table className="chart-table"><tbody>
                      <tr><td>Type</td><td><strong>{chart.type}</strong></td></tr>
                      <tr><td>Strategie</td><td>{chart.strat}</td></tr>
                      <tr><td>Autoriteit</td><td>{chart.auth}</td></tr>
                      <tr><td>Profiel</td><td>{chart.profile}</td></tr>
                      <tr><td>Inkarnatie-Kruis</td><td>Poort {chart.cross}</td></tr>
                      <tr><td>Gedefinieerd</td><td><div className="tags">{chart.definedCenters?.length>0?chart.definedCenters.map(c=><span key={c} className="tag-def">{c}</span>):<span style={{fontSize:".8rem",color:"var(--text-light)"}}>geen</span>}</div></td></tr>
                      <tr><td>Open</td><td><div className="tags">{chart.openCenters?.map(c=><span key={c} className="tag-open">{c}</span>)}</div></td></tr>
                      <tr><td>Poorten</td><td><div className="tags">{chart.allGates?.map(g=><span key={g} className="tag-gate">{g}</span>)}</div></td></tr>
                    </tbody></table>
                  )}
                </div>
              </div>
              <div>
                {!chart.isNumerology&&!chart.isHoroscoop?(
                  <div style={{background:"var(--muted)",borderRadius:"var(--radius-md)",border:"1px solid var(--border)",padding:12}}>
                    <Bodygraph chart={chart} name={form.name}/>
                  </div>
                ):(
                  <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",border:"1px solid var(--border)",padding:32,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,minHeight:200}}>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"3rem",color:"rgba(61,44,94,.15)"}}>{chart.isNumerology?"∞":"☽"}</div>
                    <div className="label">{chart.isNumerology?"Numerologische berekening":"Astrologische berekening"}</div>
                    <p className="body-sm">Berekend op basis van je exacte geboortedata.</p>
                  </div>
                )}
              </div>
            </div>
            )}
            <div className="order-block" style={{marginTop:24}}>
              <div className="order-block-title">Stap 3 — Ontvang je gepersonaliseerde digitale blauwdruk</div>
              <div className="order-block-sub">Chart berekend. Je blauwdruk bevat {rpt.pages} pagina's diepgaande persoonlijke analyse — op maat samengesteld en direct beschikbaar als PDF.</div>
              <button className="btn btn-white btn-full" onClick={()=>{track("checkout_started",{report:rpt.id,price:rpt.priceNum});goToStripe(rpt.id,chart,form);}}>Blauwdruk bestellen — {rpt.price}</button>
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
  return(
    <div className="pg">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <img src={IMGS.hero} alt="Sterrenhemel boven Ibiza" loading="eager"/>
        </div>
        <div className="hero-stars"/>
        <div className="hero-glow"/>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">Faculty of Human Design — Ibiza, Spanje</div>
            <h1 className="h1-hero">Je persoonlijke<br/>blauwdruk, <em>berekend<br/>op de sterren</em></h1>
            <p className="hero-subtitle">Spiritueel in inzicht. Wetenschappelijk in berekening. Persoonlijk op basis van je exacte geboortedata.</p>
            <div className="hero-actions">
              <button className="btn btn-white btn-lg" onClick={()=>{track("hero_cta_click",{location:"hero"});go("rapport-volledig");}}>
                Ontvang mijn persoonlijke rapport
              </button>
              <button className="btn btn-ghost btn-lg" onClick={()=>go("rapporten")}>Alle rapporten</button>
            </div>
            <div className="hero-trust">
              {["Veilige betaling","Persoonlijke PDF","Direct beschikbaar","Swiss Ephemeris berekend"].map(t=>(
                <div key={t} className="hero-trust-item">{t}</div>
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
          {[["2.400+","Rapporten uitgebracht"],["4.9 / 5","Gemiddelde beoordeling"],["2014","Opgericht op Ibiza"]].map(([n,l])=>(
            <div key={l} className="stat-row-item">
              <div className="stat-row-n">{n}</div>
              <div className="stat-row-l">{l}</div>
            </div>
          ))}
          <div className="stat-row-item" style={{position:"relative"}}>
            <div className="stat-row-n" style={{fontSize:"1.2rem",letterSpacing:".04em"}}>Swiss Ephemeris</div>
            <div className="stat-row-l">Astronomische precisie</div>
            <div style={{fontSize:".6rem",fontWeight:300,color:"var(--text-light)",marginTop:3,maxWidth:160,lineHeight:1.5}}>Exacte planeetposities tot op de graad — dezelfde standaard als professionele astronomische software</div>
          </div>
        </div>
      </div>

      {/* ── WAAROM ANDERS — 3 visual pillars ─────────────────────────────── */}
      <section className="section-md bg-white">
        <div className="container">
          <div className="text-center" style={{marginBottom:52}}>
            <div className="label" style={{marginBottom:14}}>Waarom Faculty of Human Design</div>
            <h2 className="h2" style={{marginBottom:0}}>Niet generiek. Niet vaag.<br/><em style={{fontStyle:"italic",color:"var(--text-muted)"}}>Precies jouw chart.</em></h2>
          </div>
          <div className="grid-3">
            {[
              [IMGS.w_precision,"Astronomische precisie","Swiss Ephemeris","Elke berekening gebruikt Swiss Ephemeris — exacte planeetposities tot op de graad. Geen afgeronde tabellen, geen gemiddelden."],
              [IMGS.w_depth,    "Diepgaande analyse",    "40+ pagina's",   "Geen bulletpoints, geen generieke teksten. Uitgebreide alinea's afgestemd op jouw unieke combinatie van Type, Autoriteit en Profiel."],
              [IMGS.w_ibiza,    "Ibiza als oorsprong",   "Est. 2014",      "Opgericht op het eiland waar Ra Uru Hu in 1987 het systeem ontving. Elk rapport draagt de rust en helderheid van die oorsprong."],
            ].map(([img,title,badge,desc])=>(
              <div className="waarom-card" key={title}>
                <div className="waarom-card-img">
                  <img src={img} alt={title} loading="lazy"/>
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
          <div className="label" style={{marginBottom:14}}>Meest gekozen rapport</div>
          <h2 className="h2" style={{marginBottom:18}}>Volledig Human Design Rapport</h2>
          <p className="body-lg" style={{marginBottom:24}}>Je complete persoonlijke blauwdruk — van Type en Autoriteit tot Inkarnatie-Kruis en praktische levensguidance voor 2026–2028.</p>
          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
            {REPORTS[0].includes.slice(0,6).map((item,i)=>(
              <li key={i} style={{display:"flex",gap:12,alignItems:"flex-start",fontSize:".9rem",fontWeight:300,color:"var(--text-muted)"}}>
                <span style={{color:"var(--gold)",flexShrink:0,marginTop:1}}>✦</span>{item}
              </li>
            ))}
          </ul>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
            <button className="btn btn-primary btn-lg" onClick={()=>{track("report_card_click",{report:"volledig",price:75,location:"featured"});go("rapport-volledig");}}>
              Blauwdruk bestellen — €75
            </button>
            <span style={{fontSize:".8rem",color:"var(--text-light)"}}>40+ paginas · Direct als PDF</span>
          </div>
        </div>
        <div className="feature-image-wrap ph">
          <img src={IMGS.ibiza} alt="Ibiza golden hour" loading="lazy"/>
          <div className="ov" style={{background:"linear-gradient(to bottom,rgba(12,10,23,.1) 0%,rgba(36,22,73,.2) 50%,rgba(12,10,23,.55) 100%)"}}/>
          <div className="feature-price-card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"2.4rem",fontWeight:300,color:"white",lineHeight:1}}>€75</div>
                <div style={{fontSize:".62rem",color:"rgba(255,255,255,.4)",marginTop:4,textTransform:"uppercase",letterSpacing:".08em"}}>Eenmalig · Direct als PDF</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:".6rem",fontWeight:600,color:"rgba(201,168,92,.8)",textTransform:"uppercase",letterSpacing:".1em"}}>40+ paginas</div>
                <div style={{fontSize:".6rem",color:"rgba(255,255,255,.35)",marginTop:2}}>12 secties</div>
              </div>
            </div>
            {[["Exacte geboortedata","Datum, tijd en plaats"],["Swiss Ephemeris","Astronomische precisie"],["I Ching & Kabbalah","64 poorten · 9 centra"]].map(([t,d])=>(
              <div key={t} style={{borderTop:"1px solid rgba(255,255,255,.08)",padding:"10px 0",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:".82rem",fontWeight:300,color:"rgba(255,255,255,.82)"}}>{t}</span>
                <span style={{fontSize:".72rem",color:"rgba(255,255,255,.38)"}}>{d}</span>
              </div>
            ))}
            <button className="btn btn-white btn-full" style={{marginTop:16}} onClick={()=>go("rapport-volledig")}>
              Bekijk dit rapport
            </button>
          </div>
        </div>
      </div>

      {/* ── ALLE RAPPORTEN ───────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center" style={{marginBottom:56}}>
            <div className="label" style={{marginBottom:14}}>Alle rapporten</div>
            <h2 className="h2" style={{marginBottom:16}}>Kies je persoonlijke rapport</h2>
            <p className="body-md" style={{maxWidth:480,margin:"0 auto"}}>Elk rapport berekend op exacte astronomische data. Geen generieke profielen.</p>
          </div>
          <div className="grid-3">
            {REPORTS.filter(r=>["relatie_liefde","jaar","loopbaan"].includes(r.id)).map(r=>(
              <ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>
            ))}
          </div>
          <div style={{display:"flex",gap:28,justifyContent:"center",alignItems:"center",marginTop:40,flexWrap:"wrap"}}>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>Bekijk alle 8 rapporten</button>
            <span style={{fontSize:".78rem",color:"var(--text-light)"}}>Numerologie, Astrologie, Relatierapport en meer</span>
          </div>
        </div>
      </section>

      {/* ── ORIGINE — Ibiza origin section ───────────────────────────────── */}
      <div className="origin-section">
        <div className="origin-section-bg">
          <img src={IMGS.origin} alt="Ibiza landschap" loading="lazy"/>
        </div>
        <div className="origin-content">
          <div>
            <div className="label-light" style={{marginBottom:16}}>Het instituut</div>
            <h2 className="h2" style={{color:"white",marginBottom:20,lineHeight:1.08}}>Opgericht op het eiland<br/><em style={{fontStyle:"italic",color:"rgba(255,255,255,.45)"}}>waar het begon</em></h2>
            <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.55)",lineHeight:1.82,maxWidth:460,marginBottom:28}}>De Faculty of Human Design is in 2014 opgericht op Ibiza — het eiland waar Ra Uru Hu in 1987 het Human Design systeem ontving. Exacte astronomische berekening. Persoonlijke, diepgaande analyse.</p>
            <button className="btn btn-ghost" onClick={()=>go("over")}>Over ons instituut</button>
            <div className="origin-stat">
              {[["2014","Opgericht"],["2.400+","Rapporten"],["4.9","Beoordeling"]].map(([n,l])=>(
                <div key={l}>
                  <div className="origin-stat-n">{n}</div>
                  <div className="origin-stat-l">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div/>
        </div>
      </div>

      {/* ── HOE HET WERKT ────────────────────────────────────────────────── */}
      <section className="section-md bg-muted" style={{position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
          <img src={IMGS.ibiza} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.04,filter:"saturate(.5)"}}/>
        </div>
        <div className="container-md" style={{position:"relative",zIndex:1}}>
          <div className="text-center" style={{marginBottom:56}}>
            <div className="label" style={{marginBottom:14}}>Hoe het werkt</div>
            <h2 className="h2">In drie stappen je rapport</h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:28,maxWidth:620,margin:"0 auto"}}>
            <StepCard num="1" title="Voer je geboortegegevens in" desc="Naam, geboortedatum, -tijd en -plaats. Je chart wordt direct gratis berekend en zichtbaar als bodygraph."/>
            <StepCard num="2" title="Bekijk je chart gratis" desc="Zie direct je Type, Autoriteit, Profiel en gedefinieerde centra. Volledig gratis, zonder betaling."/>
            <StepCard num="3" title="Ontvang je gepersonaliseerde digitale blauwdruk" desc="Na betaling ontvang je een gepersonaliseerde digitale blauwdruk van 40+ pagina's — diepgaand, persoonlijk en direct beschikbaar als PDF."/>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="section bg-white" style={{position:"relative"}}>
        <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          <img src={IMGS.cosmos} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.05,filter:"grayscale(80%)"}}/>
        </div>
        <div className="container" style={{position:"relative",zIndex:1}}>
          <div className="text-center" style={{marginBottom:56}}>
            <div className="label" style={{marginBottom:14}}>Ervaringen</div>
            <h2 className="h2">Wat onze klanten zeggen</h2>
          </div>
          <div className="grid-3">
            {[
              ["De sectie over mijn open centra was confronterend en bevrijdend tegelijk. Drie maanden later lees ik het nog steeds.","M. van den Berg, Amsterdam","Volledig Rapport","Meer zelfinzicht in 48 uur"],
              ["Eindelijk begrijpen wij de dynamieken tussen ons. Niet alleen 'jullie vullen elkaar aan' maar concrete patronen — inclusief waar de wrijving vandaan komt.","T. en E. Dubois, Antwerpen","Relatierapport","Communicatie direct verbeterd"],
              ["De combinatie van HD en Numerologie gaf een compleet beeld dat ik nergens anders vond. Twee disciplines die elkaar perfect aanvullen.","S. Muller, Utrecht","Volledig & Numerologie","Bevestiging van een levenskeuze"],
            ].map(([q,n,r,result])=>(
              <div className="tcard" key={n}>
                <div className="stars">★★★★★</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(61,44,94,.06)",border:"1px solid rgba(61,44,94,.1)",borderRadius:100,padding:"3px 10px",marginBottom:14}}>
                  <span style={{color:"var(--gold)",fontSize:".5rem"}}>✦</span>
                  <span style={{fontSize:".6rem",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"var(--brand)"}}>{result}</span>
                </div>
                <div className="tcard-quote">{q}</div>
                <div className="tcard-author">{n}</div>
                <div className="tcard-report">{r}</div>
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
            <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:36}}>
              <div style={{maxWidth:520}}>
                <div className="label-light" style={{marginBottom:14}}>Maandabonnement</div>
                <h2 className="h2" style={{color:"white",marginBottom:14}}>Maandelijkse Guidance</h2>
                <p style={{fontSize:".95rem",fontWeight:300,color:"rgba(255,255,255,.52)",lineHeight:1.78}}>Elke maand een persoonlijk rapport over de energetische thema's van die maand, afgestemd op je Human Design chart. Maandelijks opzegbaar.</p>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div className="sub-price">€19</div>
                <div className="sub-price-period">per maand · opzegbaar</div>
                <div style={{display:"flex",flexDirection:"column",gap:6,margin:"14px 0 18px",textAlign:"left"}}>
                  <div style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",display:"flex",alignItems:"center",gap:7}}><span style={{color:"var(--gold-warm)",flexShrink:0}}>✦</span>Gemiddeld 11 maanden actief</div>
                  <div style={{fontSize:".72rem",color:"rgba(255,255,255,.5)",display:"flex",alignItems:"center",gap:7}}><span style={{color:"var(--gold-warm)",flexShrink:0}}>✦</span>Elk moment opzegbaar — geen verplichting</div>
                </div>
                <button className="btn btn-gold btn-lg" onClick={()=>go("rapport-maandelijks")}>Start abonnement</button>
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
          <h2 className="h2" style={{color:"white",marginBottom:18,maxWidth:600,margin:"0 auto 18px"}}>Klaar om je design te ontdekken?</h2>
          <p className="body-lg" style={{color:"rgba(255,255,255,.48)",maxWidth:460,margin:"0 auto 36px"}}>Je chart wordt direct gratis berekend. Je betaalt pas na het bekijken van je chart.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:36}}>
            <button className="btn btn-white btn-lg" onClick={()=>{track("hero_cta_click",{location:"bottom"});go("rapport-volledig");}}>
              Ontvang mijn persoonlijke rapport
            </button>
            <button className="btn btn-ghost" onClick={()=>go("rapporten")}>Bekijk alle rapporten</button>
          </div>
          <TrustStrip light/>
        </div>
      </div>

      <div className="sticky-cta">
        <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:".78rem",fontWeight:500,color:"var(--text)"}}>Ontdek je Human Design</div>
            <div style={{fontSize:".68rem",color:"var(--text-muted)"}}>Vanaf €45 · Direct als PDF</div>
          </div>
          <button className="btn btn-primary" style={{flexShrink:0,whiteSpace:"nowrap"}} onClick={()=>{track("sticky_cta_click",{});go("rapporten");}}>Start nu →</button>
        </div>
      </div>
    </div>
  );
}

function WatPage({go}){
  const[faq,setFaq]=useState(null);
  const[tab,setTab]=useState("hd");

  const TYPES=[
    ["Generator","37%","Wacht om te reageren","Bevrediging","Frustratie","De primaire energiebron van de wereld. Generators zijn ontworpen om te reageren op impulsen van buitenaf — niet om te initiëren. Wanneer een Generator handelt vanuit een echte sacrale respons (een instinctief 'ja' of 'nee' vanuit het lichaam), stroomt energie moeiteloos. Handelt hij vanuit de verwachting van anderen of vanuit het hoofd, dan volgt frustratie en energieverlies."],
    ["Manifesting Generator","33%","Informeer, reageer dan","Bevrediging & Vrede","Frustratie & Woede","Snel, veelzijdig en multidimensionaal. Manifesting Generators kunnen meerdere dingen tegelijk en springen niet-lineair van stap naar stap. Dat is geen gebrek aan focus — het is hun design. Ze informeren andere mensen voor ze handelen, reageren dan op de sacrale respons, en bewegen razendsnel. Schuldgevoel over 'niet afmaken' past niet bij dit type."],
    ["Projector","20%","Wacht op de uitnodiging","Succes","Bitterheid","Geboren om te leiden, te begeleiden en systemen te optimaliseren — maar alleen wanneer uitgenodigd. Projectors hebben een scherp vermogen om anderen en situaties te doorgronden. Zonder uitnodiging leidt hun inzicht tot weerstand; met uitnodiging kunnen ze transformatieve impact maken. Hun uitdaging: leren wachten en zichzelf goed kennen voor de uitnodiging komt."],
    ["Manifestor","9%","Informeer voor je handelt","Vrede","Woede","Het enige type dat van nature initiatief kan nemen zonder eerst te reageren of te wachten. Manifestors hebben een gesloten, compacte aura die anderen op afstand houdt — wat kan leiden tot weerstand. Door anderen te informeren over wat ze gaan doen (niet om toestemming te vragen, maar om weerstand te verminderen) stroomt hun energie het krachtigst."],
    ["Reflector","1%","Wacht een maancyclus","Verrassing","Teleurstelling","De zeldzaamste en meest bijzondere type. Reflectors hebben geen vaste definitie — ze zijn een spiegel voor de mensen en omgevingen om hen heen. Ze ervaren de wereld door de energieën van anderen te absorberen en terug te reflecteren. Grote beslissingen vergen een volledige maancyclus van 28 dagen om alle perspectieven te doorvoelen."],
  ];

  const AUTHORITIES=[
    ["Emotioneel","Solar Plexus gedefinieerd","Neem nooit beslissingen in het moment. Wacht op emotionele helderheid — dat kan uren, soms dagen duren. 'Slaap er eens een nacht over' is voor dit type letterlijk het beste advies."],
    ["Sacraal","Sacraalcentrum gedefinieerd, Solar Plexus open","Spreekt via het lichaam: een instinctief 'uh-huh' of 'unh-unh'. Test beslissingen via directe ja/nee-vragen en luister naar de lichamelijke respons, niet naar het hoofd."],
    ["Splenisch","Milt gedefinieerd, bovenstaande open","De stilste autoriteit. Spreekt eenmalig, in het moment. Een zachte fluistering van instinct — vertrouw dat eerste signaal, ook al kun je het moeilijk verklaren."],
    ["Ego / Hart","Hartcentrum gedefinieerd","Spreekt via wil en verlangen. De centrale vraag: 'Wil ik dit echt?' Niet wat anderen verwachten, maar wat jij vanuit je diepste wil kiest."],
    ["G / Zelf","G-centrum gedefinieerd","Vindt helderheid door hardop te spreken met iemand die je vertrouwt — niet voor advies, maar om je eigen stem te horen en te voelen wat klopt."],
    ["Mentaal","Ajna gedefinieerd, alle motorcentra open","Exclusief voor bepaalde Projectors. Kalibreert via gesprek en externe reflectie. Heeft vertrouwde mensen nodig als klankbord."],
    ["Lunair","Reflectors","Heeft een volledige maancyclus van 28 dagen nodig om de energie van een beslissing door alle condities heen te voelen."],
  ];

  const NUM_KERNGETALLEN=[
    ["Levenspadgetal","Berekend uit geboortedatum","De rode draad van je leven — je centrale levenslessen en de richting waarin je van nature groeit. Het meest fundamentele getal in je numerologisch profiel."],
    ["Uitdrukkingsgetal","Berekend uit volledige naam","Hoe jij je talenten en gaven uitdrukt in de wereld. Beschrijft je beste bijdrage aan anderen en aan je werk."],
    ["Zielsgetal","Klinkers in je naam","Wat je diepste zelf verlangt — de innerlijke motivatie die niet altijd zichtbaar is voor de buitenwereld maar die je keuzes sterk beïnvloedt."],
    ["Persoonlijkheidsgetal","Medeklinkers in je naam","Hoe anderen jou zien en ervaren. De indruk die je maakt, de façade die je draagt."],
    ["Persoonlijk jaar","Geboortedatum + huidig jaar","Elk jaar heeft een andere energetische kwaliteit. Het persoonlijk jaar helpt je begrijpen welke thema's centraal staan en wanneer actie of rust past."],
    ["Rijpingsgetal","Levenspad + Uitdrukking","Het getal dat je tweede helft van het leven steeds meer beïnvloedt — de bestemming waar je naartoe groeit."],
  ];

  const ASTRO_LAGEN=[
    ["Zon — je bewuste kern","Je zonneteken beschrijft de kern van je bewuste zelf: hoe je je identiteit beleeft en uitdrukt. Het is de meest bekende laag, maar slechts één van de tien."],
    ["Ascendant — je eerste indruk","Het teken dat op je geboorteuur opkwam aan de oostelijke horizon. Beschrijft hoe je de wereld benadert en hoe anderen je als eerste ervaren."],
    ["Maan — je emotionele wereld","De planeet van je binnenste leven, je gewoontepatronen en je behoefte aan veiligheid. De Maan vertelt wat je nodig hebt om je emotioneel thuis te voelen."],
    ["Mercurius — denken en communiceren","Hoe je denkt, informatie verwerkt en communiceert. Essentieel voor het begrijpen van je leer- en communicatiestijl."],
    ["Venus — liefde en waarden","Wat je aantrekt en aantrekkelijk vindt in relaties, kunst en materiële dingen. Geeft inzicht in hoe je liefde geeft en ontvangt."],
    ["Midhemel — je roeping","Het hoogste punt van je chart beschrijft je professionele bestemming, je publieke rol en wat je wil bijdragen aan de wereld."],
  ];

  const COMBO=[
    ["Human Design","Energetische blauwdruk","Wie je bent op het niveau van energie en mechanismen. Hoe je beslissingen neemt, hoe je leeft met anderen, wat conditionering is en wat authentiek.","✦"],
    ["Numerologie","Levenslessen en patronen","Welke thema's door je leven heen lopen, welke talenten je meedraagt vanuit je naam en geboortedatum, en welke overtuigingen je te overwinnen hebt.","∞"],
    ["Astrologie","Timing en context","Hoe planetaire cycli de sfeer van je leven kleuren — van de karaktereigenschappen in je geboortehoroscoop tot de thema's van een specifiek jaar.","☽"],
  ];

  const faqs=[
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
      padding:"11px 26px",border:"none",cursor:"pointer",fontFamily:"var(--font-sans)",
      fontSize:".78rem",fontWeight:tab===id?500:300,letterSpacing:".06em",textTransform:"uppercase",
      color:tab===id?"var(--brand)":"var(--text-muted)",
      background:tab===id?"white":"transparent",
      borderBottom:tab===id?"2px solid var(--brand)":"2px solid transparent",
      transition:"all 200ms",
    }}>{label}</button>
  );

  return(
    <div className="pg">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="origin-section" style={{minHeight:400}}>
        <div className="origin-section-bg">
          <img src={IMGS.hero} alt="Sterrenhemel" loading="eager"/>
        </div>
        <div style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"108px 32px 80px",width:"100%"}}>
          <div className="label-light" style={{marginBottom:14}}>Het kennissysteem</div>
          <h1 className="h1" style={{color:"white",marginBottom:18,maxWidth:620}}>Human Design,<br/>Numerologie & Astrologie</h1>
          <p style={{fontSize:"1.05rem",fontWeight:300,color:"rgba(255,255,255,.5)",maxWidth:540,lineHeight:1.82,marginBottom:32}}>Drie disciplines. Elk met een eigen methodologie, eigen oorsprong en eigen inzichten. Samen vormen ze een compleet portret van wie je bent.</p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button className="btn btn-ghost" onClick={()=>setTab("hd")}>Human Design</button>
            <button className="btn btn-ghost" onClick={()=>setTab("num")}>Numerologie</button>
            <button className="btn btn-ghost" onClick={()=>setTab("astro")}>Astrologie</button>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ───────────────────────────────────────────────── */}
      <div style={{background:"white",borderBottom:"1px solid var(--border)",position:"sticky",top:72,zIndex:100}}>
        <div style={{maxWidth:1240,margin:"0 auto",padding:"0 32px",display:"flex",gap:0}}>
          <TabBtn id="hd" label="Human Design"/>
          <TabBtn id="num" label="Numerologie"/>
          <TabBtn id="astro" label="Astrologie"/>
          <TabBtn id="combo" label="Hoe ze samenhangen"/>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB: HUMAN DESIGN                                                 */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {tab==="hd"&&<>

        {/* Intro */}
        <section className="section bg-white">
          <div className="container-sm">
            <div className="label" style={{marginBottom:14}}>Wat is Human Design?</div>
            <h2 className="h2" style={{marginBottom:22}}>Een blauwdruk op basis van je geboortemoment</h2>
            <p className="body-lg" style={{marginBottom:18}}>Human Design is een synthese van vier kennissystemen — de I Ching, de Kabbalistische levensboom, de westerse astrologie en de kwantumfysica — die samen een nauwkeurige kaart vormen van je energetische aard. Het systeem werd in 1987 ontvangen door Ra Uru Hu op Ibiza en is sindsdien wereldwijd verspreid.</p>
            <p className="body-md" style={{marginBottom:32}}>Centraal in Human Design staan negen energiecentra, 64 poorten en 36 kanalen. De posities van de planeten op je geboortemoment — én op het moment 88 graden van de zon eerder (je zogenoemde Design datum) — bepalen welke centra gedefinieerd zijn en welke open. Die configuratie is uniek voor jou en verandert nooit.</p>
            <div className="grid-2" style={{gap:20}}>
              {[
                ["I Ching","De 64 hexagrammen van de Chinese I Ching vormen de ruggengraat. Elk hexagram correspondeert met een van de 64 poorten in je chart en beschrijft een specifieke kwaliteit van bewustzijn of energie."],
                ["Kabbalah","De Sefirot van de Joodse Kabbala — de levensboom — levert de structuur van de negen energiecentra en hun onderlinge verbindingen via 36 kanalen."],
                ["Astrologie","De posities van de planeten op je geboortedag en je Design datum activeren specifieke poorten in je chart. Zonder astronomische precisie geen nauwkeurige berekening."],
                ["Kwantumfysica","De centra corresponderen met hormoonklieren en neutrino-stromen. Ra Uru Hu gebruikte de ontdekking van het neutrino als wetenschappelijk fundament voor informatieoverdracht."],
              ].map(([t,d])=>(
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
            <div className="label" style={{marginBottom:14}}>De vijf types</div>
            <h2 className="h2" style={{marginBottom:8}}>Welk type ben je?</h2>
            <p className="body-md" style={{marginBottom:36}}>Je Type is je energetische aard — niet wat je doet, maar hoe je systeem van nature functioneert. Het staat vast vanaf je geboorte.</p>
            {TYPES.map(([t,pct,strat,sig,notSelf,desc])=>(
              <div key={t} style={{borderBottom:"1px solid var(--border)",padding:"28px 0"}}>
                <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:28,alignItems:"start"}}>
                  <div>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.15rem",fontWeight:400,color:"var(--text)",marginBottom:5}}>{t}</div>
                    <div style={{fontSize:".62rem",fontWeight:600,color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>{pct} van de bevolking</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <div style={{fontSize:".72rem",fontWeight:300,color:"var(--text-muted)"}}><span style={{fontWeight:500,color:"var(--brand)"}}>Strategie: </span>{strat}</div>
                      <div style={{fontSize:".72rem",fontWeight:300,color:"var(--text-muted)"}}><span style={{fontWeight:500,color:"var(--brand)"}}>Signatuur: </span>{sig}</div>
                      <div style={{fontSize:".72rem",fontWeight:300,color:"var(--text-muted)"}}><span style={{fontWeight:500,color:"#C05252"}}>Not-self: </span>{notSelf}</div>
                    </div>
                  </div>
                  <p className="body-sm" style={{lineHeight:1.82}}>{desc}</p>
                </div>
              </div>
            ))}
            <div style={{marginTop:36,display:"flex",gap:14,flexWrap:"wrap"}}>
              <button className="btn btn-primary" onClick={()=>go("rapport-volledig")}>Ontdek je type via een rapport</button>
              <button className="btn btn-secondary" onClick={()=>go("rapporten")}>Alle rapporten</button>
            </div>
          </div>
        </section>

        {/* Autoriteit */}
        <section className="section bg-white">
          <div className="container-sm">
            <div className="label" style={{marginBottom:14}}>Innerlijke autoriteit</div>
            <h2 className="h2" style={{marginBottom:12}}>Hoe neem je je beste beslissingen?</h2>
            <p className="body-lg" style={{marginBottom:36}}>Je innerlijke autoriteit is het centrum of mechanisme van waaruit jij het betrouwbaarst beslissingen neemt. Het hoofd is in Human Design geen beslisser — het is een uitstekend instrument om informatie te verzamelen, maar niet om de keuze te maken.</p>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {AUTHORITIES.map(([name,condition,desc],i)=>(
                <div key={name} style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:24,padding:"22px 0",borderBottom:"1px solid var(--border)",alignItems:"start"}}>
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
            <div className="label" style={{marginBottom:14}}>De negen centra</div>
            <h2 className="h2" style={{marginBottom:12}}>Gedefinieerd of open?</h2>
            <p className="body-lg" style={{marginBottom:28}}>Je chart heeft negen energiecentra. Gedefinieerde centra (gekleurd) produceren een consistente, betrouwbare energie. Open centra (wit) absorberen de energie van anderen — ze zijn niet zwak, maar ze zijn gevoelig voor conditionering.</p>
            <div className="grid-3" style={{gap:16}}>
              {[["Hoofd","Inspiratie en mentale druk"],["Ajna","Conceptualisering en zekerheid"],["Keel","Communicatie en manifestatie"],["G/Zelf","Identiteit, liefde en richting"],["Hart/Ego","Wil, ego en materieel succes"],["Sacraal","Levensenergie en voortplanting"],["Solar Plexus","Emoties en spirituele golf"],["Milt","Instinct, gezondheid en welzijn"],["Wortel","Adrenalinerush en druk"]].map(([c,d])=>(
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
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,alignItems:"start"}}>
              <div>
                <div className="label" style={{marginBottom:14}}>Wat is Numerologie?</div>
                <h2 className="h2" style={{marginBottom:22}}>De taal van getallen achter je naam en geboortedatum</h2>
                <p className="body-lg" style={{marginBottom:18}}>Numerologie is een eeuwenoud systeem dat ervan uitgaat dat getallen niet alleen hoeveelheden zijn maar ook kwaliteiten dragen. Elke letter van het alfabet heeft een numerieke waarde. Elke dag heeft een getal. En die getallen onthullen — wanneer je ze juist berekent — patronen die door je leven heen lopen.</p>
                <p className="body-md" style={{marginBottom:18}}>Het meest gebruikte systeem is de Pythagoreïsche numerologie, vernoemd naar Pythagoras van Samos (ca. 570–495 v.Chr.), die het getal beschouwde als de fundamentele realiteit van het universum. Het systeem werkt met de negen basiscijfers 1–9 en drie bijzondere Mastergetallen: 11, 22 en 33.</p>
                <p className="body-md" style={{marginBottom:28}}>Numerologie gaat niet over voorspellen. Het gaat over herkennen — patronen zien in je verleden, begrijpen wat er van je wordt gevraagd in het heden, en helderheid krijgen over de richting van je toekomst.</p>
                <button className="btn btn-primary" onClick={()=>go("rapport-numerologie")}>Bekijk Numerologie rapport</button>
              </div>
              <div>
                <div style={{borderRadius:"var(--radius-xl)",overflow:"hidden",boxShadow:"var(--shadow-lg)",aspectRatio:"4/3",position:"relative",marginBottom:24}}>
                  <img src={IMGS.r_numerologie} alt="Numerologie" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(12,10,23,.7) 100%)"}}/>
                  <div style={{position:"absolute",bottom:22,left:24,right:24}}>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontStyle:"italic",color:"rgba(255,255,255,.8)",lineHeight:1.6}}>"Getallen zijn het wezen van alle dingen."</div>
                    <div style={{fontSize:".62rem",letterSpacing:".1em",color:"rgba(255,255,255,.4)",textTransform:"uppercase",marginTop:6}}>Pythagoras, ca. 500 v.Chr.</div>
                  </div>
                </div>
                <div style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"22px 24px"}}>
                  <div className="label" style={{marginBottom:12}}>De Mastergetallen</div>
                  {[["11","De Meester Intuïtief — hoge gevoeligheid, spirituele antenne, intensiteit"],["22","De Meester Bouwer — groot potentieel voor concrete impact op de wereld"],["33","De Meester Leraar — compassie, verantwoordelijkheid, dienend leiderschap"]].map(([n,d])=>(
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
            <div className="label" style={{marginBottom:14}}>De kerngetallen</div>
            <h2 className="h2" style={{marginBottom:12}}>Acht getallen die samen je portret vormen</h2>
            <p className="body-md" style={{marginBottom:36}}>Een volledig numerologisch rapport berekent niet één getal maar acht. Elk beschrijft een andere laag van je persoonlijkheid, je leven en je timing.</p>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {NUM_KERNGETALLEN.map(([naam,bron,desc])=>(
                <div key={naam} style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:24,padding:"22px 0",borderBottom:"1px solid var(--border)",alignItems:"start"}}>
                  <div>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:400,color:"var(--text)",marginBottom:4}}>{naam}</div>
                    <div style={{fontSize:".6rem",fontWeight:500,color:"var(--gold)",letterSpacing:".08em",textTransform:"uppercase",lineHeight:1.5}}>{bron}</div>
                  </div>
                  <p className="body-sm" style={{lineHeight:1.82}}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{marginTop:36}}>
              <button className="btn btn-primary" onClick={()=>go("rapport-numerologie")}>Bestel Numerologie Rapport — €65</button>
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
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,alignItems:"start"}}>
              <div>
                <div className="label" style={{marginBottom:14}}>Wat is Astrologie?</div>
                <h2 className="h2" style={{marginBottom:22}}>De planeten als spiegel van je karakter</h2>
                <p className="body-lg" style={{marginBottom:18}}>Westerse astrologie is het studie van de posities van de planeten op het moment van je geboorte en hun relatie tot elkaar, tot de tekens van de dierenriem en tot de twaalf huizen van je horoscoopkaart. Het uitgangspunt: de stand van de hemel op het moment dat je de wereld binnentrad, weerspiegelt het karakter waarmee je die wereld tegemoet treedt.</p>
                <p className="body-md" style={{marginBottom:18}}>Astrologie is geen voorspellingskunst maar een systeem van symbolische correspondentie. Jupiter in Steenbok beschrijft iets anders dan Jupiter in Vissen. Een sterk bezette zevende huis vertelt iets anders dan een lege. Geen twee geboortehoroscopen zijn identiek — zelfs niet die van een tweeling, omdat de huisverdeling verschuift met elk voorbijgaand uur.</p>
                <p className="body-md" style={{marginBottom:28}}>Onze geboortehoroscoop analyseert alle tien planeten, de twaalf huizen, de Ascendant, het Midhemel en de belangrijkste aspecten — de hoeken die planeten met elkaar maken. Dat geeft een compleet, gelaagd portret.</p>
                <button className="btn btn-primary" onClick={()=>go("rapport-horoscoop")}>Bekijk Geboortehoroscoop rapport</button>
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
                  <div className="label" style={{marginBottom:12}}>De drie sleutelelementen</div>
                  {[["Tekens","De 12 tekens van de dierenriem geven kwaliteit aan de planeten die er in staan — Ram is actief en initiërend, Stier is geduldig en sensorisch, enzovoort."],["Huizen","De 12 huizen verdelen de horoscoopkaart in levensterreinen: huis 1 is identiteit en lichaam, huis 7 is partnerschappen, huis 10 is carrière en publieke rol."],["Aspecten","De hoeken tussen planeten — conjunctie, oppositie, trine, vierkant — beschrijven spanning of harmonie tussen de energieën die zij vertegenwoordigen."]].map(([n,d])=>(
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
            <div className="label" style={{marginBottom:14}}>De lagen van je horoscoop</div>
            <h2 className="h2" style={{marginBottom:12}}>Meer dan je zonneteken</h2>
            <p className="body-md" style={{marginBottom:36}}>De meeste mensen kennen hun zonneteken. Maar een geboortehoroscoop heeft tien planeten, elk in een teken en een huis. Elk van die planeten beschrijft een ander aspect van wie je bent.</p>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {ASTRO_LAGEN.map(([naam,desc])=>(
                <div key={naam} style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:24,padding:"22px 0",borderBottom:"1px solid var(--border)",alignItems:"start"}}>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontWeight:400,color:"var(--text)",lineHeight:1.3}}>{naam}</div>
                  <p className="body-sm" style={{lineHeight:1.82}}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{marginTop:36}}>
              <button className="btn btn-primary" onClick={()=>go("rapport-horoscoop")}>Bestel Geboortehoroscoop — €75</button>
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
            <div className="label" style={{marginBottom:14}}>Drie disciplines, één portret</div>
            <h2 className="h2" style={{marginBottom:22}}>Waarom ze elkaar aanvullen</h2>
            <p className="body-lg" style={{marginBottom:18}}>Human Design, Numerologie en Astrologie zijn drie volledig zelfstandige disciplines met elk hun eigen methodologie, berekening en vocabulaire. Ze spreken niet dezelfde taal — en dat is precies hun kracht als je ze naast elkaar legt.</p>
            <p className="body-md" style={{marginBottom:36}}>Elke discipline verlicht een andere laag van dezelfde persoon. Waar Human Design je energetisch mechanisme beschrijft, beschrijft Numerologie je levenslessen en Astrologie de kwaliteiten van je planetaire bezetting. Iemand die alle drie bestudeert, krijgt een portret met een diepte die geen enkel systeem afzonderlijk kan bieden.</p>
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
              <div className="label-light" style={{marginBottom:12}}>Praktisch voorbeeld</div>
              <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.75)",lineHeight:1.85,marginBottom:20}}>Stel: je bent een Generator (HD) met een Levenspadgetal 7 (Numerologie) en een sterk bezette achtste huis (Astrologie). Human Design zegt dat je wacht op sacrale responsen. Numerologie zegt dat je diep onderzoek en teruggetrokkenheid nodig hebt om te gedijen. Astrologie zegt dat transformatie, verborgen kennis en diepgaande ervaringen centrale thema's zijn. Samen tekenen ze een profiel van iemand die niet zichtbaar actief hoeft te zijn om impact te maken — die zijn kracht haalt uit verdieping en respons, niet uit initiatief en zichtbaarheid.</p>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <button className="btn btn-white" onClick={()=>go("rapport-volledig")}>Volledig HD Rapport</button>
                <button className="btn btn-ghost" onClick={()=>go("rapporten")}>Alle rapporten</button>
              </div>
            </div>
          </div>
        </section>

      </>}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-sm">
          <div className="label" style={{marginBottom:14}}>Veelgestelde vragen</div>
          <h2 className="h2" style={{marginBottom:36}}>Vragen over de drie disciplines</h2>
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
          <div className="label" style={{marginBottom:14}}>Klaar om te beginnen?</div>
          <h2 className="h2" style={{marginBottom:18}}>Ontdek je persoonlijke blauwdruk</h2>
          <p className="body-lg" style={{maxWidth:460,margin:"0 auto 32px"}}>Je chart wordt direct gratis berekend. Pas na het bekijken van je chart beslis je of je het volledige rapport wilt.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-primary btn-lg" onClick={()=>go("rapport-volledig")}>Start met Human Design</button>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>Bekijk alle rapporten</button>
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
  return(
    <div className="pg">
      <div className="origin-section" style={{minHeight:360}}>
        <div className="origin-section-bg">
          <img src={IMGS.cosmos} alt="Kosmos" loading="eager"/>
        </div>
        <div style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"100px 32px 72px",width:"100%"}}>
          <div className="label-light" style={{marginBottom:14}}>Alle rapporten</div>
          <h1 className="h1" style={{color:"white",marginBottom:16,maxWidth:580}}>Kies je persoonlijke rapport</h1>
          <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.5)",maxWidth:480,lineHeight:1.78}}>Elk rapport berekend op exacte astronomische data. Geen generieke profielen.</p>
        </div>
      </div>
      <section className="section bg-muted">
        <div className="container">

          {/* Human Design */}
          <div className="label" style={{marginBottom:12}}>Human Design</div>
          <h2 className="h2" style={{marginBottom:36}}>Human Design rapporten</h2>
          <div className="grid-3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>{hdPure.map(r=><ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>)}</div>

          <div style={{height:1,background:"var(--border)",margin:"56px 0"}}/>

          {/* Relatierapport trio */}
          <div className="label" style={{marginBottom:12}}>Relatierapport</div>
          <h2 className="h2" style={{marginBottom:8}}>Twee designs. Drie perspectieven.</h2>
          <p className="body-md" style={{maxWidth:560,marginBottom:36,color:"var(--text-muted)"}}>Kies het perspectief dat past bij jullie relatie. Elk rapport analyseert twee volledige Human Design charts naast elkaar.</p>
          <div className="grid-3">
            {relatie.map(r=>(
              <ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>
            ))}
          </div>

          <div style={{height:1,background:"var(--border)",margin:"56px 0"}}/>

          {/* Aanvullende disciplines */}
          <div className="label" style={{marginBottom:12}}>Numerologie en Astrologie</div>
          <h2 className="h2" style={{marginBottom:36}}>Aanvullende disciplines</h2>
          <div className="grid-2" style={{maxWidth:780}}>{other.map(r=><ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>)}</div>

          {sub&&<>
            <div style={{height:1,background:"var(--border)",margin:"56px 0"}}/>
            <div style={{maxWidth:760}}>
              <div className="label" style={{marginBottom:12}}>Abonnement</div>
              <div className="sub-card" style={{cursor:"pointer"}} onClick={()=>go("rapport-maandelijks")}>
                <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:28}}>
                  <div>
                    <div style={{fontFamily:"var(--font-serif)",fontSize:"1.5rem",color:"white",marginBottom:10}}>{sub.tagline}</div>
                    <p style={{fontSize:".92rem",color:"rgba(255,255,255,.5)",maxWidth:420,lineHeight:1.78}}>{sub.intro}</p>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div className="sub-price">€19</div>
                    <div className="sub-price-period">per maand</div>
                    <div style={{height:14}}/>
                    <div className="btn btn-gold btn-sm">Bekijken</div>
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
  const faqs=[["Hoe nauwkeurig is de berekening?","Wij gebruiken de Meeus ephemeris — dezelfde algoritmen als professionele astronomische software. De blauwdruk is gebaseerd op je exacte geboortedata."],["Is de blauwdruk echt persoonlijk?","Je gepersonaliseerde digitale blauwdruk wordt volledig op maat samengesteld op basis van jouw specifieke chart. Geen twee blauwdrukken zijn identiek."],["In welk format ontvang ik mijn blauwdruk?","Direct als PDF via de browser — druk op of sla op voor je archief. De digitale blauwdruk is meteen beschikbaar."],["Kan ik de blauwdruk meerdere keren lezen?","Ja — en wij raden dat aan. Human Design verdiept zich naarmate je er meer mee leeft."],["Wat als ik mijn geboortetijd niet weet?","Gebruik de meest nauwkeurige tijd die je heeft. Type en Autoriteit zijn meestal al correct."]];
  return(
    <div className="pg">
      <div className="detail-hero">
        <div className="detail-hero-bg">
          <img src={IMGS["r_"+rpt.id]||IMGS.hero} alt={rpt.title} loading="eager"/>
        </div>
        <div className="detail-hero-inner">
          <div>
            <div className="detail-hero-badge">{rpt.icon} Faculty of Human Design</div>
            <h1 className="detail-hero-title">{rpt.title}</h1>
            <div className="detail-hero-tagline">{rpt.tagline}</div>
            <div className="detail-hero-meta">
              <span className="detail-hero-m">{rpt.pages} paginas</span>
              <span className="detail-hero-m">{rpt.sections} secties</span>
              <span className="detail-hero-m">Gepersonaliseerde Digitale Blauwdruk</span>
              <span className="detail-hero-m">{rpt.sub}</span>
            </div>
          </div>
          <div className="price-box">
            <div className="price-box-amount">{rpt.price}</div>
            <div className="price-box-period">{rpt.sub}</div>
            <button className="btn btn-white btn-full" onClick={()=>{track("checkout_started",{report:rpt.id,price:rpt.priceNum,location:"detail_hero"});document.getElementById("bestel")?.scrollIntoView({behavior:"smooth"});}}>Blauwdruk bestellen</button>
            <div style={{marginTop:12}}><TrustStrip light/></div>
          </div>
        </div>
      </div>
      <section className="section bg-muted">
        <div className="container">
          <div className="grid-2" style={{gap:56,alignItems:"start"}}>
            <div>
              <div className="label" style={{marginBottom:12}}>Over deze blauwdruk</div>
              <h2 className="h2" style={{marginBottom:16}}>{rpt.title}</h2>
              <p className="body-lg" style={{marginBottom:20}}>{rpt.intro}</p>
              <div style={{background:"rgba(61,44,94,.06)",borderLeft:"3px solid var(--brand)",padding:"16px 20px",borderRadius:"0 var(--radius-sm) var(--radius-sm) 0",marginBottom:24}}>
                <div className="label" style={{marginBottom:6}}>Voor wie</div>
                <p className="body-sm">{rpt.for}</p>
              </div>
              <div style={{background:"white",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"24px"}}>
                <div className="label" style={{marginBottom:14}}>Je gepersonaliseerde blauwdruk</div>
                <div className="grid-2" style={{gap:12}}>
                  {[["Omvang",rpt.pages+" pagina's"],["Gereed in","3-4 minuten"],["Formaat","Digitale Blauwdruk · PDF"],["Taal","Nederlands"]].map(([l,v])=>(
                    <div key={l}><div style={{fontSize:".6rem",fontWeight:600,textTransform:"uppercase",color:"var(--text-light)",marginBottom:2}}>{l}</div><div style={{fontSize:".82rem",fontWeight:300}}>{v}</div></div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="label" style={{marginBottom:12}}>Inhoudsopgave</div>
              <h2 className="h2" style={{marginBottom:20}}>Dit staat erin</h2>
              <ul className="includes-list">
                {rpt.includes.map((item,i)=>(
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
          <div className="label" style={{marginBottom:12}}>Ervaringen</div>
          <h2 className="h2" style={{marginBottom:32}}>Wat klanten zeggen</h2>
          <div className="grid-3">
            {(rpt.reviews||[]).map(([q,n])=>(
              <div className="tcard" key={n}><div className="stars">★★★★★</div><div className="tcard-quote">"{q}"</div><div className="tcard-author">{n}</div></div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-muted">
        <div className="container-sm">
          <div className="label" style={{marginBottom:12}}>Veelgestelde vragen</div>
          <h2 className="h2" style={{marginBottom:32}}>Vragen over dit rapport</h2>
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
          {rpt.title} bestellen — {rpt.price}
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

  if(activePost){
    const post=articles.find(a=>String(a.id)===String(activePost));
    if(!post)return null;
    return(
      <div className="pg">
        <section style={{background:"var(--dark)",padding:"100px 24px 56px"}}>
          <div className="container-sm">
            <div style={{marginBottom:16,cursor:"pointer",fontSize:".65rem",letterSpacing:".1em",color:"rgba(255,255,255,.35)",textTransform:"uppercase"}} onClick={()=>setActivePost(null)}>Terug naar inzichten</div>
            <div className="label" style={{color:"rgba(154,128,80,.8)",marginBottom:8}}>{post.tag}</div>
            <h1 className="h1" style={{color:"white",marginBottom:12,fontSize:"clamp(1.8rem,4vw,2.6rem)"}}>{post.title}</h1>
            <div style={{fontSize:".65rem",letterSpacing:".08em",color:"rgba(255,255,255,.3)",textTransform:"uppercase"}}>{post.date} - {post.readtime} leestijd</div>
          </div>
        </section>
        <section className="section bg-white">
          <div className="container-sm">
            {(()=>{
              const paras=(post.body||"").trim().split("\n\n");
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
              <div className="label" style={{marginBottom:16}}>Meer lezen</div>
              <div className="grid-2">
                {articles.filter(a=>String(a.id)!==String(activePost)).slice(0,2).map(a=>(
                  <div key={a.id} className="blog-card" onClick={()=>{setActivePost(String(a.id));window.scrollTo(0,0);}}>
                    <div className="blog-tag">{a.tag}</div>
                    <div className="blog-title" style={{fontSize:"1rem"}}>{a.title}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{marginTop:32}}><button className="btn btn-primary" onClick={()=>go("rapporten")}>Bestel een rapport</button></div>
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
        <div style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"100px 32px 72px",width:"100%"}}>
          <div className="label-light" style={{marginBottom:14}}>Kennis</div>
          <h1 className="h1" style={{color:"white",marginBottom:14}}>Inzichten en Achtergronden</h1>
          <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.5)",maxWidth:480,lineHeight:1.78}}>Artikelen over Human Design, Numerologie en Astrologie. Elke twee weken een nieuw artikel.</p>
        </div>
      </div>
      <section className="section bg-white">
        <div className="container-sm">
          {loading?(
            <div style={{textAlign:"center",padding:"60px 0",color:"var(--text-light)",fontSize:".8rem",letterSpacing:".08em",textTransform:"uppercase"}}>Artikelen laden...</div>
          ):articles.map((p,i)=>(
            <div className="blog-card" key={i} onClick={()=>{setActivePost(String(p.id));window.scrollTo(0,0);}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:16}}>
                <div>
                  <div className="blog-tag">{p.tag}</div>
                  <div className="blog-title">{p.title}</div>
                  <div className="blog-excerpt">{p.excerpt}</div>
                  <div className="blog-more">Lees artikel</div>
                </div>
                <div style={{fontSize:".65rem",letterSpacing:".06em",color:"var(--text-light)",textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0}}>{p.date}<br/>{p.readtime}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OverPage({go}){
  return(
    <div className="pg">

      {/* ── HERO ── */}
      <div className="origin-section" style={{minHeight:480}}>
        <div className="origin-section-bg">
          <img src={IMGS.ibiza} alt="Ibiza zonsondergang" loading="eager"/>
        </div>
        <div style={{position:"relative",zIndex:2,maxWidth:1240,margin:"0 auto",padding:"120px 32px 96px",width:"100%"}}>
          <div className="label-light" style={{marginBottom:14}}>Over ons — Est. 2014, Ibiza</div>
          <h1 className="h1" style={{color:"white",marginBottom:20,maxWidth:620,lineHeight:1.06}}>De geschreven analyse<br/><em style={{fontStyle:"italic",color:"rgba(255,255,255,.38)"}}>als eerste stap naar jezelf</em></h1>
          <p style={{fontSize:"1.05rem",fontWeight:300,color:"rgba(255,255,255,.5)",maxWidth:520,lineHeight:1.84}}>Wij zijn gespecialiseerd in één ding: diepgaande, persoonlijke analyse van jouw chart. Geen cursussen, geen coaching — uitsluitend de geschreven blauwdruk die het begin vormt van bewuster leven.</p>
        </div>
      </div>

      {/* ── DE EERSTE STAP ── */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid-2" style={{gap:72,alignItems:"center"}}>
            <div>
              <div className="label" style={{marginBottom:14}}>Waarom een blauwdruk</div>
              <h2 className="h2" style={{marginBottom:22}}>Je kunt jezelf niet veranderen<br/><em style={{fontStyle:"italic",color:"var(--text-muted)"}}>zonder jezelf te kennen</em></h2>
              <p className="body-lg" style={{marginBottom:18}}>De meeste mensen leven jarenlang vanuit aangeleerd gedrag, verwachtingen van anderen en aannames over wie ze zijn. Een gepersonaliseerde blauwdruk doorbreekt dat patroon — niet met adviezen van buitenaf, maar door te laten zien hoe jij van nature werkt.</p>
              <p className="body-md" style={{marginBottom:18}}>Dat is de reden waarom wij ons uitsluitend richten op de geschreven analyse. De blauwdruk is geen eindpunt — het is het begin. Een document dat je terugpakt als je een beslissing moet nemen, een relatie begrijpen wilt, of simpelweg jezelf in het oog verliest.</p>
              <p className="body-md" style={{marginBottom:32}}>Voor veel van onze klanten is de blauwdruk de eerste keer dat ze zichzelf echt herkend voelen — niet in wat ze doen, maar in wie ze zijn.</p>
              <div style={{borderLeft:"3px solid var(--gold)",paddingLeft:20,marginBottom:32}}>
                <p style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",fontStyle:"italic",color:"var(--text)",lineHeight:1.78}}>"Je ontvangt geen profiel. Je ontvangt een spiegel — nauwkeurig berekend op het moment dat jij ter wereld kwam."</p>
              </div>
              <div style={{display:"flex",gap:40,flexWrap:"wrap"}}>
                {[["2014","Opgericht op Ibiza"],["2.400+","Blauwdrukken samengesteld"],["4.9 / 5","Gemiddelde beoordeling"]].map(([n,l])=>(
                  <div key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
                ))}
              </div>
            </div>
            <div>
              <div style={{borderRadius:"var(--radius-xl)",overflow:"hidden",boxShadow:"var(--shadow-xl)",aspectRatio:"3/4",position:"relative",marginBottom:24}}>
                <img src={IMGS.origin} alt="Ibiza landschap" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 45%,rgba(12,10,23,.72) 100%)"}}/>
                <div style={{position:"absolute",bottom:24,left:24,right:24}}>
                  <div style={{fontSize:".58rem",fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(201,168,92,.8)",marginBottom:8}}>Ibiza — 1987</div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1rem",fontStyle:"italic",color:"rgba(255,255,255,.8)",lineHeight:1.65}}>Op dit eiland ontving Ra Uru Hu het Human Design systeem. Hier begon alles.</div>
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
            <div className="label" style={{marginBottom:14}}>Onze specialisatie</div>
            <h2 className="h2" style={{marginBottom:16}}>Eén focus. Uitgediept.</h2>
            <p className="body-md" style={{maxWidth:520,margin:"0 auto"}}>Wij doen uitsluitend geschreven analyse. Dat maakt het mogelijk om elke discipline volledig te beheersen en elke blauwdruk op het hoogste niveau samen te stellen.</p>
          </div>
          <div className="grid-3">
            {[
              ["✦","Astronomische precisie","Swiss Ephemeris berekening","Elke blauwdruk is gebaseerd op de exacte posities van de planeten op jouw geboortemoment — tot op de graad nauwkeurig. Dezelfde standaard als professionele astronomische software. Geen afgeronde tabellen, geen generieke benaderingen."],
              ["◎","Drie disciplines, één portret","Human Design · Numerologie · Astrologie","We analyseren vanuit drie volledig zelfstandige methodologieën: Human Design (energetisch mechanisme), Numerologie (levenspatronen en -lessen) en Geboorteastrologie (planetaire kwaliteiten). Elk systeem verlicht een andere laag van dezelfde persoon."],
              ["∞","Diepgaande geschreven analyse","Geen templates. Geen generiek.","Elke blauwdruk wordt volledig op maat samengesteld op basis van jouw unieke combinatie van Type, Autoriteit, Profiel en actieve poorten. Geen twee blauwdrukken zijn identiek. De analyse is persoonlijk, concreet en direct toepasbaar."],
            ].map(([ico,title,sub,desc])=>(
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
            <div className="label" style={{marginBottom:14}}>De methode</div>
            <h2 className="h2" style={{marginBottom:16}}>Van geboortemoment<br/><em style={{fontStyle:"italic",color:"var(--text-muted)"}}>naar persoonlijke blauwdruk</em></h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {[
              ["01","Astronomische berekening","Op basis van je exacte geboortedatum, -tijd en -plaats berekenen wij de posities van alle relevante planeten en hemellichamen. Dit vormt de astronomische basis van je blauwdruk — objectief, nauwkeurig en uniek voor jou."],
              ["02","Chart samenstelling","De berekening levert je persoonlijke chart: je Human Design type, autoriteit, profiel, gedefinieerde centra, actieve kanalen en poorten — of, bij Numerologie en Astrologie, je kern- en planeetgetallen. Dit is de ruwe data waarop de analyse is gebaseerd."],
              ["03","Diepgaande analyse","Elke sectie van de blauwdruk wordt op maat samengesteld op basis van jouw specifieke combinatie. De analyse gaat verder dan definities: het beschrijft hoe jouw design in het dagelijks leven werkt, waar conditionering zit, en waar jouw authentieke kracht ligt."],
              ["04","Je gepersonaliseerde blauwdruk","Het resultaat is een document van 24 tot 40+ pagina's dat je teruggeeft wat altijd al in jou aanwezig was — nu helder beschreven, herkenbaar en direct toepasbaar. De eerste stap in een proces dat een leven lang kan duren."],
            ].map(([num,title,desc],i,arr)=>(
              <div key={num} style={{display:"flex",gap:32,padding:"36px 0",borderBottom:i<arr.length-1?"1px solid var(--border)":"none",alignItems:"flex-start"}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"2.2rem",fontWeight:300,color:"var(--brand)",opacity:.2,lineHeight:1,flexShrink:0,width:52,textAlign:"right",paddingTop:2}}>{num}</div>
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
            <div className="label-light" style={{marginBottom:16}}>Het instituut</div>
            <h2 className="h2" style={{color:"white",marginBottom:20,lineHeight:1.08}}>Opgericht op het eiland<br/><em style={{fontStyle:"italic",color:"rgba(255,255,255,.38)"}}>waar het begon</em></h2>
            <p style={{fontSize:"1rem",fontWeight:300,color:"rgba(255,255,255,.52)",lineHeight:1.84,maxWidth:440}}>De Faculty of Human Design is in 2014 opgericht op Ibiza — het eiland waar Ra Uru Hu in 1987 het Human Design systeem ontving. Die oorsprong bepaalt onze focus: geen oppervlakkige profielen, maar diepgaande analyse die recht doet aan de rijkheid van het systeem.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            {[["2014","Jaar van oprichting"],["Ibiza","Thuisbasis"],["2.400+","Blauwdrukken"],["3","Disciplines"]].map(([n,l])=>(
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
          <div className="label" style={{marginBottom:14}}>Begin hier</div>
          <h2 className="h2" style={{marginBottom:18}}>De eerste stap begint<br/><em style={{fontStyle:"italic",color:"var(--text-muted)"}}>met jouw chart</em></h2>
          <p className="body-lg" style={{maxWidth:460,margin:"0 auto 32px"}}>Je chart wordt direct gratis berekend. Je blauwdruk is daarna binnen enkele minuten beschikbaar — persoonlijk, diepgaand en direct als PDF.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:28}}>
            <button className="btn btn-primary btn-lg" onClick={()=>go("rapport-volledig")}>Start met mijn blauwdruk</button>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>Bekijk alle rapporten</button>
          </div>
          <TrustStrip/>
        </div>
      </section>

    </div>
  );
}

function ContactPage(){
  const[form,setForm]=useState({name:"",email:"",subject:"",msg:""});
  const ch=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  return(
    <div className="pg">
      <section style={{background:"var(--dark)",padding:"100px 24px 72px"}}>
        <div className="container"><div className="label" style={{color:"rgba(154,128,80,.8)",marginBottom:12}}>Contact</div><h1 className="h1" style={{color:"white"}}>Neem contact op</h1></div>
      </section>
      <section className="section bg-white">
        <div className="container-sm">
          <div className="grid-2" style={{gap:56,alignItems:"start"}}>
            <div>
              <div className="label" style={{marginBottom:12}}>Contactgegevens</div>
              <h2 className="h2" style={{marginBottom:28}}>Faculty of Human Design</h2>
              {[["Locatie","Ibiza, Spanje"],["E-mail","info@facultyofhumandesign.com"],["Reactietijd","Binnen 1 werkdag"],["Rapporten","Direct beschikbaar na bestelling"]].map(([l,v])=>(
                <div key={l} style={{marginBottom:20}}><div className="label" style={{marginBottom:5}}>{l}</div><div className="body-md">{v}</div></div>
              ))}
            </div>
            <div className="form-wrap">
              <div style={{fontFamily:"var(--font-serif)",fontSize:"1.2rem",marginBottom:20}}>Stuur een bericht</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div className="form-group"><label className="form-label">Naam</label><input className="form-input" name="name" value={form.name} onChange={ch} placeholder="Je naam"/></div>
                <div className="form-group"><label className="form-label">E-mailadres</label><input className="form-input" type="email" name="email" value={form.email} onChange={ch} placeholder="uw@email.nl"/></div>
                <div className="form-group"><label className="form-label">Onderwerp</label><input className="form-input" name="subject" value={form.subject} onChange={ch} placeholder="Onderwerp"/></div>
                <div className="form-group"><label className="form-label">Bericht</label><textarea className="form-input" name="msg" value={form.msg} onChange={ch} placeholder="Je vraag of opmerking" style={{resize:"vertical",minHeight:110}}/></div>
                <button className="btn btn-primary" onClick={()=>alert("Bedankt voor je bericht. Wij reageren binnen 1 werkdag.")}>Verstuur bericht</button>
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
    if(btn){btn.textContent="PDF wordt voorbereid...";btn.disabled=true;}
    const win=window.open("","_blank");
    const bh=secs.map(s=>"<h2>"+s.t+"</h2>"+s.b.split("\n").map(x=>x?"<p>"+x+"</p>":"").join("")).join("");
    const metaObj=chart?.isNumerology?{Levenspad:chart.lp,Uitdrukking:chart.exp}:chart?.isHoroscoop?{Zonneteken:chart.sun_sign,Ascendant:chart.ascendant?.sign}:{Type:chart?.type,Strategie:chart?.strat,Autoriteit:chart?.auth,Profiel:chart?.profile};
    const meta=Object.entries(metaObj||{}).map(([k,v])=>"<tr><td>"+k+"</td><td>"+v+"</td></tr>").join("");
    win.document.write("<!DOCTYPE html><html><head><meta charset=UTF-8><title>"+rpt.title+" - "+form.name+"</title><link href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap' rel=stylesheet><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Jost,sans-serif;font-weight:300;background:#fff;color:#1C1917}.cover{min-height:100vh;background:#1C1917;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:72px;page-break-after:always}.ci{font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(154,128,80,.6);margin-bottom:24px}.ct{font-family:Cormorant Garamond,serif;font-size:48px;font-weight:300;color:#fff;line-height:1.05;margin-bottom:12px}.cn{font-family:Cormorant Garamond,serif;font-size:26px;font-style:italic;color:rgba(255,255,255,.5);margin-bottom:32px}.cm{font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;line-height:2.2}.content{max-width:720px;margin:0 auto;padding:56px}.mb{border-left:2px solid rgba(154,128,80,.35);padding:18px 22px;margin:0 0 40px;background:#f9f8f6}table{width:100%;border-collapse:collapse}td{padding:6px 12px 6px 0;font-size:12px;color:#444;border-bottom:1px solid #f0ede8}td:first-child{font-weight:600;color:#3D2C5E;width:160px}h2{font-family:Cormorant Garamond,serif;font-size:20px;font-weight:400;color:#1C1917;margin:44px 0 12px;padding-bottom:8px;border-bottom:1px solid #e8e5e0;page-break-after:avoid}p{font-size:13px;line-height:2;color:#3a3a32;margin-bottom:12px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class=cover><div class=ci>Faculty of Human Design - Ibiza</div><div class=ct>"+rpt.title+"</div><div class=cn>"+form.name+"</div><div class=cm>Geboren "+form.day+"-"+form.month+"-"+form.year+"</div></div><div class=content><div class=mb><table>"+meta+"</table></div>"+bh+"</div><script>window.onload=function(){window.print();}<\/script></body></html>");
    win.document.close();
    if(btn){btn.textContent="Download PDF";btn.disabled=false;}
  };

  const barData=chart?.isNumerology?[["Levenspad",chart.lp],["Uitdrukking",chart.exp],["Ziel",chart.soul],["Pers. Jaar",chart.py],["Rijping",chart.mat],["Masters",chart.masters?.length>0?chart.masters.join(", "):"geen"]]:chart?.isHoroscoop?[["Zonneteken",chart.sun_sign],["Ascendant",chart.ascendant?.degree+"deg "+chart.ascendant?.sign],["Dom. element",chart.dom_element],["Midhemel",chart.mc?.sign],["Planeten","10 berekend"],["Aspecten","gevonden"]]:[["Type",chart?.type],["Strategie",chart?.strat],["Autoriteit",chart?.auth],["Profiel",chart?.profile],["Inkarnatie-Kruis","Poort "+(chart?.cross||"")],["Gedefinieerd",(chart?.definedCenters||[]).slice(0,2).join(", ")]];

  return(
    <div>
      <div className="thankyou-hero">
        <div className="thankyou-icon">✓</div>
        <div className="thankyou-title">Je rapport is klaar</div>
        <div className="thankyou-sub">Je persoonlijke analyse staat hieronder. Download het als PDF voor je archief.</div>
      </div>
      <div className="report-pg" style={{paddingTop:32}}>
        <div className="report-header">
          <div className="report-inst-label">Faculty of Human Design — Ibiza</div>
          <div className="report-title">{rpt.title}</div>
          <div className="report-meta">{form.name} — {form.day}-{form.month}-{form.year}{form.place?" — "+form.place:""}</div>
          <button id="dlb" className="btn btn-primary" onClick={dlPDF}>Download als PDF</button>
          <p style={{fontSize:".75rem",color:"var(--text-light)",marginTop:8}}>Opent printvenster — kies Opslaan als PDF</p>
        </div>
        {chart&&<div className="report-summary"><div className="report-summary-grid">{barData.map(([l,v])=><div key={l}><div className="rsg-label">{l}</div><div className="rsg-value">{v}</div></div>)}</div></div>}
        <div className="report-body">
          {secs.map((s,i)=><div key={i}><div className="report-section-title">{s.t}</div><div className="report-section-body">{s.b}</div></div>)}
        </div>
        <div style={{maxWidth:760,margin:"28px auto 0"}}>
          <div className="upsell-card">
            <div className="upsell-label">Aanbevolen voor jou</div>
            <div className="upsell-title">Verdiep je inzicht met {nextRpt.title}</div>
            <div className="upsell-sub">Klanten die {rpt.title} bestellen kiezen daarna vaak voor dit rapport.</div>
            <div className="upsell-grid">
              {nextRpt.includes.slice(0,4).map((item,i)=>(
                <div key={i} className="upsell-item"><span style={{color:"rgba(154,128,80,.8)",flexShrink:0}}>✓</span>{item}</div>
              ))}
            </div>
            <button className="btn btn-gold" onClick={()=>{track("upsell_accepted",{from:rpt.id,to:nextRpt.id,price:nextRpt.priceNum});go("rapport-"+nextRpt.id);}}>
              {nextRpt.title} bestellen — {nextRpt.price}
            </button>
          </div>
          <div style={{marginTop:16,background:"white",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20}}>
            <div><div className="label" style={{marginBottom:4}}>Maandelijkse Guidance</div><p className="body-sm">Elke maand een persoonlijk rapport — opzegbaar wanneer je wilt.</p></div>
            <div style={{display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
              <div style={{fontFamily:"var(--font-serif)",fontSize:"1.4rem"}}>19 euro per maand</div>
              <button className="btn btn-secondary btn-sm" onClick={()=>{track("subscription_offer_viewed",{source:"thankyou"});go("rapport-maandelijks");}}>Bekijken</button>
            </div>
          </div>
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>Bekijk alle rapporten</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
export default function App(){
  const[page,setPage]=useState("home");
  const[result,setResult]=useState(null);
  const[menuOpen,setMenuOpen]=useState(false);
  const[generating,setGenerating]=useState(false);
  const go=p=>{setPage(p);setMenuOpen(false);window.scrollTo(0,0);};
  const onDone=(chart,form,report,rpt)=>{setResult({chart,form,report,rpt});setPage("result");window.scrollTo(0,0);};
  const currentRpt=page.startsWith("rapport-")?REPORTS.find(r=>r.id===page.replace("rapport-","")):null;

  // Handle return from Stripe payment
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const success=params.get("success");
    const cancelled=params.get("cancelled");
    if(cancelled){
      // Remove query string and stay on page
      window.history.replaceState({},"",window.location.pathname);
      return;
    }
    if(success){
      window.history.replaceState({},"",window.location.pathname);
      const savedChart=sessionStorage.getItem("fhd_chart");
      const savedForm=sessionStorage.getItem("fhd_form");
      const savedRptId=sessionStorage.getItem("fhd_rpt_id");
      if(savedChart&&savedForm&&savedRptId){
        const chart=JSON.parse(savedChart);
        const form=JSON.parse(savedForm);
        const rpt=REPORTS.find(r=>r.id===savedRptId);
        if(rpt){
          sessionStorage.removeItem("fhd_chart");
          sessionStorage.removeItem("fhd_form");
          sessionStorage.removeItem("fhd_rpt_id");
          setGenerating(true);
          generateReport(chart,form,rpt).then(report=>{
            setGenerating(false);
            onDone(chart,form,report,rpt);
          });
        }
      }
    }
  },[]);

  async function generateReport(chart,form,rpt){
    const isNum=rpt.id==="numerologie";
    const isHoro=rpt.id==="horoscoop";
    const hdChart=(!isNum&&!isHoro)?chart:null;
    const fullPrompt=buildPrompt(hdChart,form,rpt);
    const sections=rpt.prompt_extra.split("\n").filter(l=>l.startsWith("###")).map(l=>l.replace(/^###\s*/,"").trim());
    const SYSTEM="Je bent een senior analist van de Faculty of Human Design op Ibiza. Schrijf nauwkeurige, diepgaande rapporten in het Nederlands. Schrijf vanuit het instituut. Geen bulletpoints — alleen alineas. Minimaal 800 woorden per sectie.";
    let allText="";
    for(let i=0;i<sections.length;i++){
      const sec=sections[i];
      const prompt=fullPrompt+"\n\nSchrijf nu uitsluitend sectie '"+sec+"'. Minimaal 800 woorden, in alineas, persoonlijk en concreet. Geen sectietitel in de tekst.";
      let retries=2;
      while(retries>=0){
        try{
          const res=await fetch("/api/generate-report",{
            method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:SYSTEM,
              messages:[{role:"user",content:prompt}]})
          });
          if(!res.ok){const err=await res.text();console.error("API error:",res.status,err);retries--;continue;}
          const data=await res.json();
          const txt=data.content?.find(b=>b.type==="text")?.text||"";
          if(txt.length>50){allText+="### "+sec+"\n\n"+txt+"\n\n";break;}
          retries--;
        }catch(e){console.error("Fetch error:",e);retries--;}
      }
      if(!allText.includes("### "+sec)){allText+="### "+sec+"\n\n[Deze sectie kon niet worden gegenereerd. Neem contact op via info@facultyofhumandesign.com]\n\n";}
    }
    return allText.trim()||"Het rapport kon niet worden gegenereerd. Neem contact op via info@facultyofhumandesign.com";
  }
  return(
    <div>
      <style>{FONTS}{CSS}</style>
      {generating&&(
        <div className="loading-overlay">
          <div className="loading-icon">✦</div>
          <div className="loading-title">Betaling ontvangen — rapport wordt opgemaakt</div>
          <div className="loading-counter">Dit duurt 3-4 minuten</div>
          <div className="loading-bar-wrap"><div className="loading-bar-fill" style={{width:"60%"}}/></div>
        </div>
      )}
      {page!=="result"&&<Nav page={page} go={go} menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>}
      {page==="home"&&<HomePage go={go}/>}
      {page==="wat"&&<WatPage go={go}/>}
      {page==="rapporten"&&<RapportenPage go={go}/>}
      {page.startsWith("rapport-")&&currentRpt&&<ReportDetailPage rpt={currentRpt} go={go} onDone={onDone}/>}
      {page==="blog"&&<BlogPage go={go}/>}
      {page==="over"&&<OverPage go={go}/>}
      {page==="contact"&&<ContactPage/>}
      {page==="result"&&result&&<ThankYouPage result={result} go={go}/>}
      {page!=="result"&&<Footer go={go}/>}
    </div>
  );
}