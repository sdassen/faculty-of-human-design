import { useState, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');`;

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #F8F6F1; --card: #FFFFFF; --dark: #1C1917; --muted: #F1EEE8;
  --text: #1C1917; --text-muted: #78716C; --text-light: #A8A29E;
  --brand: #3D2C5E; --gold: #9A8050; --border: #E7E3DC;
  --white: #FFFFFF; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,.07);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.09);
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Jost', system-ui, sans-serif;
}
html { scroll-behavior: smooth; }
body { font-family: var(--font-sans); background: var(--bg); color: var(--text);
  font-size: 16px; line-height: 1.6; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
img { display: block; max-width: 100%; }
button { cursor: pointer; font-family: var(--font-sans); }

/* TYPOGRAPHY */
.h1 { font-family: var(--font-serif); font-size: clamp(2.2rem,5vw,3.8rem); font-weight: 300; line-height: 1.1; }
.h1-hero { font-family: var(--font-serif); font-size: clamp(2.5rem,6vw,4.2rem); font-weight: 300; line-height: 1.05; color: white; }
.h2 { font-family: var(--font-serif); font-size: clamp(1.8rem,3.5vw,2.8rem); font-weight: 300; line-height: 1.15; }
.h3 { font-family: var(--font-serif); font-size: clamp(1.3rem,2.5vw,1.8rem); font-weight: 400; line-height: 1.2; }
.label { font-size:.65rem; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); }
.body-lg { font-size:1.1rem; font-weight:300; line-height:1.8; color:var(--text-muted); }
.body-md { font-size:1rem; font-weight:300; line-height:1.75; color:var(--text-muted); }
.body-sm { font-size:.875rem; font-weight:300; line-height:1.7; color:var(--text-muted); }

/* LAYOUT */
.pg { padding-top:72px; min-height:100vh; }
.section { padding:96px 24px; }
.section-sm { padding:64px 24px; }
.section.bg-white { background:var(--white); }
.section.bg-muted { background:var(--muted); }
.section.bg-dark { background:var(--dark); }
.container { max-width:1240px; margin:0 auto; width:100%; }
.container-sm { max-width:760px; margin:0 auto; width:100%; }
.container-md { max-width:960px; margin:0 auto; width:100%; }
.grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
.grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
.grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
.text-center { text-align:center; }
.divider { width:40px; height:2px; background:var(--gold); }
.divider-center { margin:0 auto; }

/* BUTTONS */
.btn { display:inline-flex; align-items:center; justify-content:center; gap:8px;
  border:none; border-radius:var(--radius-md); font-family:var(--font-sans);
  font-weight:500; letter-spacing:.04em; transition:all 200ms ease; white-space:nowrap; }
.btn-primary { background:var(--brand); color:white; padding:14px 32px; font-size:.95rem; box-shadow:0 2px 8px rgba(61,44,94,.25); }
.btn-primary:hover { background:#2e2147; transform:translateY(-1px); box-shadow:0 4px 16px rgba(61,44,94,.35); }
.btn-secondary { background:transparent; color:var(--brand); padding:13px 30px; font-size:.95rem; border:1.5px solid var(--brand); }
.btn-secondary:hover { background:var(--brand); color:white; }
.btn-white { background:white; color:var(--brand); padding:14px 32px; font-size:.95rem; box-shadow:var(--shadow-md); }
.btn-white:hover { box-shadow:var(--shadow-lg); transform:translateY(-1px); }
.btn-ghost { background:rgba(255,255,255,.12); color:white; padding:13px 30px; font-size:.95rem; border:1.5px solid rgba(255,255,255,.25); }
.btn-ghost:hover { background:rgba(255,255,255,.2); }
.btn-gold { background:var(--gold); color:white; padding:14px 32px; font-size:.95rem; }
.btn-gold:hover { background:#876e43; transform:translateY(-1px); }
.btn-lg { padding:17px 40px; font-size:1.05rem; }
.btn-sm { padding:10px 22px; font-size:.85rem; }
.btn-full { width:100%; }
.btn:disabled { opacity:.4; cursor:not-allowed; transform:none !important; }

/* CARDS */
.card { background:var(--card); border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden; }
.rcard { background:var(--card); border-radius:var(--radius-lg); border:1px solid var(--border); cursor:pointer; transition:all 200ms; display:flex; flex-direction:column; overflow:hidden; }
.rcard:hover { transform:translateY(-3px); box-shadow:var(--shadow-lg); border-color:var(--brand); }
.rcard-accent { height:4px; background:var(--brand); }
.rcard-body { padding:24px; flex:1; display:flex; flex-direction:column; }
.rcard-tag { display:inline-block; background:rgba(61,44,94,.08); color:var(--brand); font-size:.6rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:4px 10px; border-radius:100px; margin-bottom:12px; }
.rcard-icon { font-size:1.4rem; margin-bottom:8px; }
.rcard-title { font-family:var(--font-serif); font-size:1.2rem; font-weight:400; color:var(--text); margin-bottom:6px; line-height:1.3; }
.rcard-tagline { font-size:.85rem; font-weight:300; color:var(--text-muted); line-height:1.6; flex:1; margin-bottom:20px; }
.rcard-footer { display:flex; justify-content:space-between; align-items:center; padding-top:16px; border-top:1px solid var(--border); margin-top:auto; }
.rcard-price { font-family:var(--font-serif); font-size:1.6rem; font-weight:300; color:var(--text); }
.rcard-cta { font-size:.72rem; font-weight:500; letter-spacing:.06em; text-transform:uppercase; color:var(--brand); }

/* TRUST */
.trust-strip { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:8px 24px; }
.trust-item { display:flex; align-items:center; gap:6px; font-size:.8rem; font-weight:400; color:var(--text-muted); }

/* STEP */
.step-card { display:flex; gap:20px; align-items:flex-start; }
.step-num { width:40px; height:40px; border-radius:50%; background:var(--brand); color:white; font-family:var(--font-serif); font-size:1.1rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
.step-body h4 { font-family:var(--font-serif); font-size:1.1rem; font-weight:400; color:var(--text); margin-bottom:4px; }
.step-body p { font-size:.9rem; font-weight:300; color:var(--text-muted); line-height:1.65; }

/* TESTIMONIAL */
.tcard { background:white; border-radius:var(--radius-lg); border:1px solid var(--border); padding:28px; }
.tcard-quote { font-family:var(--font-serif); font-size:1.05rem; font-style:italic; color:var(--text); line-height:1.75; margin-bottom:16px; }
.tcard-author { font-size:.75rem; font-weight:500; letter-spacing:.06em; text-transform:uppercase; color:var(--text-light); }
.tcard-report { font-size:.7rem; color:var(--gold); margin-top:2px; }
.stars { color:#F59E0B; font-size:.85rem; margin-bottom:10px; }

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
.hero-bg { position:absolute; inset:0; background:linear-gradient(135deg,#1C1917 0%,#2d1f4a 55%,#3D2C5E 100%); }
.hero-pattern { position:absolute; inset:0; opacity:.04; background-image:radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px); background-size:48px 48px; }
.hero-glow { position:absolute; top:-100px; right:-100px; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle, rgba(154,128,80,.15), transparent 65%); }
.hero-content { position:relative; z-index:2; max-width:1240px; margin:0 auto; padding:0 32px; width:100%; display:grid; grid-template-columns:1fr 400px; gap:80px; align-items:center; }
.hero-eyebrow { font-size:.65rem; font-weight:500; letter-spacing:.15em; text-transform:uppercase; color:rgba(154,128,80,.85); margin-bottom:20px; }
.hero-title em { color:rgba(255,255,255,.6); font-style:italic; }
.hero-actions { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:28px; margin-top:28px; }
.hero-micro { display:flex; gap:20px; flex-wrap:wrap; }
.hero-micro-item { font-size:.78rem; font-weight:300; color:rgba(255,255,255,.45); }
.hero-card { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:var(--radius-lg); padding:32px; backdrop-filter:blur(12px); }
.hero-card-label { font-size:.6rem; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:rgba(154,128,80,.7); margin-bottom:16px; }
.hero-stat { margin-bottom:20px; }
.hero-stat-n { font-family:var(--font-serif); font-size:2.2rem; font-weight:300; color:white; line-height:1; }
.hero-stat-l { font-size:.7rem; color:rgba(255,255,255,.4); margin-top:3px; }
.hero-divider { height:1px; background:rgba(255,255,255,.1); margin:20px 0; }

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

/* DETAIL HERO */
.detail-hero { background:var(--dark); padding:80px 24px 56px; }
.detail-hero-inner { max-width:1240px; margin:0 auto; display:grid; grid-template-columns:1fr 280px; gap:60px; align-items:start; }
.detail-hero-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(154,128,80,.15); border:1px solid rgba(154,128,80,.25); padding:5px 12px; border-radius:100px; font-size:.65rem; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:rgba(154,128,80,.9); margin-bottom:20px; }
.detail-hero-title { font-family:var(--font-serif); font-size:clamp(2rem,4vw,3rem); font-weight:300; color:white; margin-bottom:12px; line-height:1.1; }
.detail-hero-tagline { font-size:.95rem; font-weight:300; color:rgba(255,255,255,.5); margin-bottom:24px; line-height:1.7; }
.detail-hero-meta { display:flex; gap:20px; flex-wrap:wrap; }
.detail-hero-m { font-size:.65rem; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.3); }
.price-box { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:var(--radius-lg); padding:28px; text-align:center; }
.price-box-amount { font-family:var(--font-serif); font-size:3rem; font-weight:300; color:white; line-height:1; }
.price-box-period { font-size:.7rem; color:rgba(255,255,255,.4); margin-top:4px; margin-bottom:20px; }

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
.footer { background:var(--dark); padding:56px 32px 32px; }
.footer-inner { max-width:1240px; margin:0 auto; }
.footer-top { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:48px; padding-bottom:40px; border-bottom:1px solid rgba(255,255,255,.07); }
.footer-logo-main { font-family:var(--font-serif); font-size:1.1rem; font-weight:400; color:white; letter-spacing:.08em; text-transform:uppercase; }
.footer-logo-sub { font-size:.6rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,255,255,.3); margin-top:2px; }
.footer-desc { font-size:.82rem; font-weight:300; color:rgba(255,255,255,.4); line-height:1.7; margin-top:12px; max-width:260px; }
.footer-col-title { font-size:.65rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.4); margin-bottom:14px; }
.footer-link { display:block; font-size:.85rem; font-weight:300; color:rgba(255,255,255,.5); margin-bottom:9px; cursor:pointer; transition:color 150ms; }
.footer-link:hover { color:rgba(255,255,255,.85); }
.footer-bottom { padding-top:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
.footer-copy { font-size:.75rem; font-weight:300; color:rgba(255,255,255,.25); }
.footer-trust { display:flex; gap:16px; }
.footer-trust-item { font-size:.7rem; color:rgba(255,255,255,.25); }

/* THANK YOU */
.thankyou-hero { background:linear-gradient(135deg,#1a3a2e 0%,#1C1917 100%); padding:80px 24px; text-align:center; }
.thankyou-icon { font-size:3rem; margin-bottom:20px; }
.thankyou-title { font-family:var(--font-serif); font-size:2.5rem; font-weight:300; color:white; margin-bottom:12px; }
.thankyou-sub { font-size:1rem; font-weight:300; color:rgba(255,255,255,.55); max-width:480px; margin:0 auto; line-height:1.7; }

/* SUB CARD */
.sub-card { background:linear-gradient(135deg,var(--brand) 0%,#2e1f4e 100%); border-radius:var(--radius-lg); padding:40px; color:white; position:relative; overflow:hidden; }
.sub-price { font-family:var(--font-serif); font-size:3rem; font-weight:300; color:white; line-height:1; }
.sub-price-period { font-size:.8rem; color:rgba(255,255,255,.5); margin-top:4px; }

/* RESPONSIVE */
@media (max-width:1024px) {
  .hero-content { grid-template-columns:1fr; gap:48px; }
  .detail-hero-inner { grid-template-columns:1fr; }
  .footer-top { grid-template-columns:1fr 1fr; gap:32px; }
}
@media (max-width:768px) {
  .nav { padding:0 16px; }
  .nav-links, .nav-cta-wrap { display:none; }
  .mobile-nav { display:flex; }
  .section { padding:64px 20px; }
  .section-sm { padding:48px 20px; }
  .grid-2, .grid-3 { grid-template-columns:1fr; }
  .grid-4 { grid-template-columns:1fr 1fr; }
  .form-grid { grid-template-columns:1fr; }
  .form-group.full { grid-column:1; }
  .report-body { padding:28px 20px; }
  .sticky-cta { display:block; }
  .detail-hero { padding:64px 20px 44px; }
  .loading-steps { width:100%; }
  .upsell-grid { grid-template-columns:1fr; }
  .report-summary-grid { grid-template-columns:1fr 1fr; }
  .footer-top { grid-template-columns:1fr; gap:28px; }
  .footer-bottom { flex-direction:column; align-items:flex-start; }
}
@media (max-width:480px) {
  .hero-actions { flex-direction:column; }
  .hero-actions .btn { width:100%; }
  .report-summary-grid { grid-template-columns:1fr; }
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
    tagline:"Uw complete persoonlijke blauwdruk",
    intro:"Het meest uitgebreide rapport dat wij aanbieden. Een volledige analyse van uw Human Design chart — van Type en Autoriteit tot Inkarnatie-Kruis en praktische levensguidance.",
    includes:["Type, Strategie & Signature","Autoriteit — hoe u beslissingen neemt","Profiel — het verhaal van uw leven","Alle 9 centra geanalyseerd","Actieve kanalen & krachten","Poorten — uw natuurlijke kwaliteiten","Inkarnatie-Kruis — uw levensdoel","Relaties & werk vanuit uw design","Praktische guidance 2025–2027"],
    for:"Voor iedereen die een diepgaand en volledig inzicht wil in hun Human Design.",
    sections:12, pages:"40+",
    prompt_extra:"### 1. Uw Energetische Blauwdruk\n### 2. Type & Levensstrategie\n### 3. Autoriteit\n### 4. Profiel\n### 5. Gedefinieerde Centra\n### 6. Open Centra & Conditionering\n### 7. Actieve Kanalen\n### 8. Uw Poorten\n### 9. Inkarnatie-Kruis\n### 10. Relaties & Verbinding\n### 11. Praktische Guidance 2025-2027\n### 12. Slotanalyse",
  },
  {
    id:"relatie", icon:"◎", tag:"",
    title:"Relatierapport",
    price:"€95", priceNum:95, sub:"Eenmalig · Direct als PDF",
    tagline:"Twee designs naast elkaar geanalyseerd",
    intro:"Een analyse van twee volledige Human Design charts. Hoe opereren u en uw partner energetisch samen — waar vullen jullie elkaar aan en waar ontstaat wrijving?",
    includes:["Beide charts volledig geanalyseerd","Elektromagnetische verbindingen","Compatibiliteit van Types","Communicatiepatronen","Conflictpatronen & doorbraken","Gezamenlijk levensdoel","Praktisch advies voor harmonie"],
    for:"Voor koppels of zakenpartners die hun samenwerking dieper willen begrijpen.",
    sections:9, pages:"28+", needsPartner:true,
    prompt_extra:"### 1. De Energie van Jullie Verbinding\n### 2. Chart Analyse Persoon 1\n### 3. Chart Analyse Persoon 2\n### 4. Elektromagnetische Verbindingen\n### 5. Compatibiliteit\n### 6. Communicatie & Conflict\n### 7. Groeigebieden\n### 8. Gezamenlijk Levensdoel\n### 9. Praktisch Advies",
  },
  {
    id:"jaar", icon:"◈", tag:"",
    title:"Jaarrapport 2025",
    price:"€55", priceNum:55, sub:"Eenmalig · Direct als PDF",
    tagline:"De energetische thema's van uw jaar",
    intro:"Gebaseerd op uw Solar Return — de posities van de planeten op uw verjaardag dit jaar. Wat zijn de dominante thema's en kansen?",
    includes:["Solar Return analyse","Dominante thema's voor 2025","Kwartaal-voor-kwartaal overzicht","Planetaire invloeden op uw chart","Kansen en aandachtspunten","Intentie voor het jaar"],
    for:"Voor wie het jaar bewust en gericht wil ingaan.",
    sections:9, pages:"22+",
    prompt_extra:"### 1. Energie van Uw Nieuw Levensjaar\n### 2. Solar Return Analyse\n### 3. Dominante Themas\n### 4. Kwartaal 1\n### 5. Kwartaal 2\n### 6. Kwartaal 3\n### 7. Kwartaal 4\n### 8. Kansen & Uitdagingen\n### 9. Intentie voor het Jaar",
  },
  {
    id:"kind", icon:"◇", tag:"",
    title:"Kinderrapport",
    price:"€45", priceNum:45, sub:"Eenmalig · Direct als PDF",
    tagline:"Uw kind begrijpen vanuit zijn of haar design",
    intro:"Een rapport voor ouders. Hoe gebruikt uw kind energie en hoe leert het het beste?",
    includes:["Type & energiegebruik","Hoe uw kind beslissingen neemt","Leerstijl & communicatie","Behoeften & grenzen","Opvoedtips op maat","Gaven & talenten"],
    for:"Voor ouders die hun kind willen begeleiden op basis van wie het werkelijk is.",
    sections:10, pages:"24+", needsChild:true,
    prompt_extra:"### 1. Het Unieke Design van Uw Kind\n### 2. Type & Energie\n### 3. Beslissingen Nemen\n### 4. Hoe Uw Kind Leert\n### 5. Behoeften & Grenzen\n### 6. Centra Analyse\n### 7. Opvoedtips Op Maat\n### 8. Gaven & Talenten\n### 9. Relatie Ouder-Kind\n### 10. Slotanalyse",
  },
  {
    id:"loopbaan", icon:"◆", tag:"",
    title:"Loopbaan & Geld Rapport",
    price:"€65", priceNum:65, sub:"Eenmalig · Direct als PDF",
    tagline:"Werk en financiën vanuit uw design",
    intro:"Hoe maakt u geld op een manier die bij u past? Welke werkomgeving geeft u energie?",
    includes:["Ideale werkomgeving","Hoe u geld aantrekt","Uw professionele kracht","Samenwerking & leiderschap","Valkuilen op de werkvloer","Ondernemen vs. loondienst","Financiële strategie op maat"],
    for:"Voor iedereen die wil werken en verdienen in lijn met wie zij zijn.",
    sections:9, pages:"24+",
    prompt_extra:"### 1. Professionele Blauwdruk\n### 2. Ideale Werkomgeving\n### 3. Hoe U Geld Aantrekt\n### 4. Uw Professionele Kracht\n### 5. Samenwerking & Leiderschap\n### 6. Valkuilen\n### 7. Ondernemen vs. Loondienst\n### 8. Financiele Strategie\n### 9. Volgende Stap",
  },
  {
    id:"numerologie", icon:"∞", tag:"",
    title:"Numerologie Rapport",
    price:"€65", priceNum:65, sub:"Eenmalig · Direct als PDF",
    tagline:"De getallen achter uw naam en geboortedag",
    intro:"Op basis van uw volledige naam en geboortedatum berekenen wij 8 kerngetallen die samen een diepgaand beeld geven van uw aard en levensdoel.",
    includes:["Levenspadgetal","Uitdrukkingsgetal","Zielsgetal","Persoonlijkheidsgetal","Verjaardagsgetal","Persoonlijk jaar 2025","Rijpingsgetal","Mastergetallen indien aanwezig"],
    for:"Voor iedereen die de diepere betekenis van naam en geboortedag wil begrijpen.",
    sections:12, pages:"30+",
    prompt_extra:"### 1. Uw Numerologische Blauwdruk\n### 2. Levenspadgetal\n### 3. Uitdrukkingsgetal\n### 4. Zielsgetal\n### 5. Persoonlijkheidsgetal\n### 6. Verjaardagsgetal\n### 7. Persoonlijk Jaar 2025\n### 8. Rijpingsgetal\n### 9. Mastergetallen\n### 10. Hoe Uw Getallen Samenwerken\n### 11. Guidance 2025-2027\n### 12. Slotanalyse",
  },
  {
    id:"horoscoop", icon:"☽", tag:"",
    title:"Geboortehoroscoop",
    price:"€75", priceNum:75, sub:"Eenmalig · Direct als PDF",
    tagline:"Uw complete astrologische chart",
    intro:"Een volledige geboortehoroscoop op basis van de exacte posities van alle planeten op het moment van uw geboorte.",
    includes:["Zonneteken","Ascendant","Maan — uw emotionele wereld","Alle 10 planeten in teken & huis","12 huizen geanalyseerd","Belangrijkste aspecten","Midhemel — uw roeping","Dominant element & modaliteit"],
    for:"Voor wie wil begrijpen hoe de sterren stonden op hun geboortemoment.",
    sections:12, pages:"32+",
    prompt_extra:"### 1. Uw Astrologische Blauwdruk\n### 2. Zonneteken\n### 3. Ascendant\n### 4. De Maan\n### 5. Mercurius Venus Mars\n### 6. Jupiter Saturnus\n### 7. Buitenste Planeten\n### 8. De Huizen\n### 9. Aspecten\n### 10. Midhemel\n### 11. Guidance 2025-2027\n### 12. Slotanalyse",
  },
  {
    id:"maandelijks", icon:"◯", tag:"Abonnement",
    title:"Maandelijkse Guidance",
    price:"€19/mnd", priceNum:19, sub:"Maandelijks opzegbaar",
    tagline:"Elke maand uw persoonlijke energiegids",
    intro:"Elke maand een persoonlijk rapport over de energetische thema's van die maand, afgestemd op uw Human Design chart.",
    includes:["Energie & thema's van de maand","Planetaire invloeden","Kansen & aandachtspunten","Praktisch advies","Intentie voor de maand"],
    for:"Voor wie maandelijks bewust wil leven in lijn met hun design.",
    sections:6, pages:"12+",
    prompt_extra:"### 1. Energie van Deze Maand\n### 2. Planetaire Invloeden\n### 3. Wat Er van U Gevraagd Wordt\n### 4. Kansen\n### 5. Aandachtspunten\n### 6. Intentie voor de Maand",
  },
];


// ─── STRIPE PAYMENT LINKS ─────────────────────────────────────────────────────
// Vervang test_ links met live_ links voor productie
// Voeg toe aan elke Stripe Payment Link:
//   success_url: https://faculty-of-human-design.vercel.app/?success=true
//   cancel_url:  https://faculty-of-human-design.vercel.app/?cancelled=true
const STRIPE = {
  volledig:   "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00",
  relatie:    "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  jaar:       "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  kind:       "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  loopbaan:   "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  numerologie:"https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  horoscoop:  "https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: eigen link
  maandelijks:"https://buy.stripe.com/test_14A7sE4Nq6ipaF3cu2eQM00", // TODO: abonnement link
};

function goToStripe(rptId, chartData, formData) {
  // Sla chart data op in sessionStorage zodat we na betaling verder kunnen
  sessionStorage.setItem("fhd_chart", JSON.stringify(chartData));
  sessionStorage.setItem("fhd_form", JSON.stringify(formData));
  sessionStorage.setItem("fhd_rpt_id", rptId);
  // Stuur naar Stripe
  const url = STRIPE[rptId] || STRIPE.volledig;
  window.location.href = url;
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
  else if(hasThr&&hasMotor){type="Manifestor";strat="Informeer voor u handelt";sig="Vrede";notSelf="Woede";}
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
  const py=numReduce(numReduce(day)+numReduce(month)+numReduce(2025));
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
const LSTEPS=["Inleiding schrijven","Type & Strategie","Autoriteit analyseren","Profiel uitwerken","Centra beschrijven","Conditionering","Poorten in detail","Inkarnatie-Kruis","Relaties","Werk & Financien","Guidance 2025-2027","Slotanalyse"];

function buildPrompt(chart,form,rpt){
  if(rpt.id==="numerologie"){
    const num=calcNumerology(form.name,parseInt(form.day),parseInt(form.month),parseInt(form.year));
    return["NUMEROLOGIE voor "+form.name,"Naam: "+form.name,"Datum: "+form.day+"-"+form.month+"-"+form.year,"","Levenspad: "+num.lp+" - "+num.lpName,"Uitdrukking: "+num.exp+" - "+num.expName,"Ziel: "+num.soul,"Persoonlijkheid: "+num.pers,"Verjaardag: "+num.bday,"Pers. Jaar 2025: "+num.py,"Rijping: "+num.mat,"Mastergetallen: "+(num.masters.length>0?num.masters.join(", "):"geen"),"",rpt.prompt_extra].join("\n");
  }
  if(rpt.id==="horoscoop"){
    const h=calcHoroscoop(parseInt(form.year),parseInt(form.month),parseInt(form.day),parseInt(form.hour),parseInt(form.minute||"0"));
    const pStr=Object.entries(h.planets).map(([p,d])=>p+": "+d.degree+"° "+d.sign+" H"+d.house).join(", ");
    return["HOROSCOOP voor "+form.name,"Datum: "+form.day+"-"+form.month+"-"+form.year+" "+form.hour+":"+(form.minute||"00"),"Plaats: "+form.place,"","Ascendant: "+h.ascendant.degree+"° "+h.ascendant.sign,"MC: "+h.mc.degree+"° "+h.mc.sign,"Zon: "+h.sun_sign,"Dom. element: "+h.dom_element,"Planeten: "+pStr,"",rpt.prompt_extra].join("\n");
  }
  const pStr=Object.entries(chart.pers).map(e=>e[0]+": Poort "+e[1].gate+"."+e[1].line).join(", ");
  const dStr=Object.entries(chart.des).map(e=>e[0]+": Poort "+e[1].gate+"."+e[1].line).join(", ");
  return["HD CHART voor "+form.name,"Datum: "+form.day+"-"+form.month+"-"+form.year+(form.hour?" "+form.hour+":"+(form.minute||"00"):""),"Plaats: "+form.place,"","Type: "+chart.type,"Strategie: "+chart.strat,"Autoriteit: "+chart.auth,"Profiel: "+chart.profile,"Inkarnatie-Kruis: Poort "+chart.cross,"Gedefinieerd: "+(chart.definedCenters.join(", ")||"geen"),"Open: "+chart.openCenters.join(", "),"Kanalen: "+(chart.channels.map(c=>c.g1+"-"+c.g2).join(", ")||"geen"),"Poorten: "+chart.allGates.join(", "),"Bewust: "+pStr,"Onbewust: "+dStr,"",rpt.prompt_extra].join("\n");
}


// ─── BODYGRAPH ────────────────────────────────────────────────────────────────
const CP={"Head":{cx:320,cy:58,sh:"td",lb:"HEAD"},"Ajna":{cx:320,cy:148,sh:"td",lb:"AJNA"},"Throat":{cx:320,cy:242,sh:"rc",lb:"THROAT"},"G/Self":{cx:320,cy:348,sh:"di",lb:"G"},"Heart/Ego":{cx:212,cy:302,sh:"tr",lb:"HART"},"Sacral":{cx:320,cy:450,sh:"rc",lb:"SACRAAL"},"Solar Plexus":{cx:455,cy:372,sh:"tl",lb:"SP"},"Spleen":{cx:178,cy:398,sh:"tr",lb:"MILT"},"Root":{cx:320,cy:540,sh:"rc",lb:"ROOT"}};
const CPATHS={"Head-Ajna":"M320,84 L320,122","Ajna-Throat":"M320,178 L320,220","Throat-G/Self":"M320,268 L320,314","Throat-Sacral":"M320,268 L320,424","Throat-Solar Plexus":"M352,248 Q455,248 455,342","Throat-Spleen":"M288,248 Q178,248 178,368","Throat-Heart/Ego":"M288,248 Q212,248 212,274","G/Self-Sacral":"M320,386 L320,424","G/Self-Heart/Ego":"M284,348 L246,316","G/Self-Spleen":"M280,364 Q178,364 178,368","Heart/Ego-Spleen":"M186,312 Q178,370 178,368","Heart/Ego-Solar Plexus":"M238,308 Q348,308 432,358","Sacral-Root":"M320,476 L320,514","Sacral-Solar Plexus":"M352,450 Q455,450 455,400","Sacral-Spleen":"M288,450 Q178,450 178,428","Solar Plexus-Root":"M440,402 Q440,540 352,540","Spleen-Root":"M196,426 Q196,540 288,540"};
function cpth(pos){const{cx:x,cy:y,sh}=pos;if(sh==="rc")return"M"+(x-44)+","+(y-22)+" h88 v44 h-88 Z";if(sh==="di")return"M"+x+","+(y-46)+" L"+(x+46)+","+y+" L"+x+","+(y+46)+" L"+(x-46)+","+y+" Z";if(sh==="td")return"M"+(x-46)+","+(y-26)+" L"+(x+46)+","+(y-26)+" L"+x+","+(y+26)+" Z";if(sh==="tr")return"M"+(x-26)+","+(y-36)+" L"+(x+26)+","+y+" L"+(x-26)+","+(y+36)+" Z";if(sh==="tl")return"M"+(x+26)+","+(y-36)+" L"+(x-26)+","+y+" L"+(x+26)+","+(y+36)+" Z";return"M"+(x-44)+","+(y-22)+" h88 v44 h-88 Z";}
function Bodygraph({chart,name}){
  const def=new Set(chart?chart.definedCenters:[]);
  const ap=new Set();if(chart)for(const c of chart.channels){ap.add(c.c1+"-"+c.c2);ap.add(c.c2+"-"+c.c1);}
  const COL="#3D2C5E";
  return(
    <svg viewBox="0 0 640 608" style={{width:"100%",maxWidth:400,display:"block",margin:"0 auto"}}>
      <rect width="640" height="608" fill="#F9F8F5" rx="8"/>
      {name&&<text x="320" y="596" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="13" fill="#A8A29E" fontStyle="italic">{name}</text>}
      {Object.entries(CPATHS).map(([key,path])=>{const active=ap.has(key)||ap.has(key.split("-").reverse().join("-"));return<path key={key} d={path} fill="none" stroke={active?COL:"#E0DDD6"} strokeWidth={active?2.5:1.5} strokeLinecap="round"/>;  })}
      {Object.entries(CP).map(([cn,pos])=>{const isDef=def.has(cn);return(<g key={cn}><path d={cpth(pos)} fill={isDef?COL:"none"} stroke={isDef?COL:"#D6D0C8"} strokeWidth={1.5}/><text x={pos.cx} y={pos.cy} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="8" letterSpacing="0.8" fill={isDef?"#fff":"#C8C4BE"}>{pos.lb}</text></g>);})}
    </svg>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function TrustStrip({light}){
  const col=light?"rgba(255,255,255,.5)":"var(--text-muted)";
  return(
    <div className="trust-strip">
      {[["🔒","Veilige betaling"],["📄","Persoonlijke PDF"],["⚡","Direct beschikbaar"],["✓","Geen generieke profielen"],["🇳🇱","Nederlandstalig"]].map(([ico,txt])=>(
        <div key={txt} className="trust-item" style={{color:col}}><span>{ico}</span><span>{txt}</span></div>
      ))}
    </div>
  );
}

function ReportCard({rpt,onClick}){
  return(
    <div className="rcard" onClick={()=>{track("report_card_click",{report:rpt.id,price:rpt.priceNum});onClick();}}>
      <div className="rcard-accent"/>
      <div className="rcard-body">
        {rpt.tag&&<span className="rcard-tag">{rpt.tag}</span>}
        <div className="rcard-icon">{rpt.icon}</div>
        <div className="rcard-title">{rpt.title}</div>
        <div className="rcard-tagline">{rpt.tagline}</div>
        <div className="rcard-footer">
          <div className="rcard-price">{rpt.price}</div>
          <div className="rcard-cta">Bekijken →</div>
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
          <div className="footer-copy">© 2025 Faculty of Human Design. Alle rechten voorbehouden.</div>
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
  const ok=form.name&&form.day&&form.month&&form.year&&form.place&&(!needsTime||form.hour);
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
      <div className="loading-title">Rapport wordt opgemaakt</div>
      <div className="loading-counter">Sectie {Math.min(ls+1,sections.length)} van {sections.length}</div>
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
          <h2 className="h2" style={{marginBottom:8}}>Vul uw geboortegegevens in</h2>
          <p className="body-md" style={{marginBottom:32}}>Uw chart wordt direct gratis berekend. U betaalt pas na het bekijken van uw chart.</p>
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
              <div style={{fontSize:".85rem",color:"var(--text-muted)",marginBottom:14}}>Gegevens partner</div>
              <div className="form-grid">
                <div className="form-group full"><label className="form-label">Naam partner</label><input className="form-input" name="pname" value={form.pname} onChange={ch} placeholder="Naam partner"/></div>
                <div className="form-group"><label className="form-label">Dag</label><input className="form-input" type="number" name="pday" min="1" max="31" value={form.pday} onChange={ch}/></div>
                <div className="form-group"><label className="form-label">Maand</label><select className="form-select" name="pmonth" value={form.pmonth} onChange={ch}><option value="">maand</option>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Jaar</label><input className="form-input" type="number" name="pyear" value={form.pyear} onChange={ch}/></div>
                <div className="form-group"><label className="form-label">Tijd</label><div className="form-row"><input className="form-input" type="number" name="phour" min="0" max="23" value={form.phour} onChange={ch} placeholder="uur"/><input className="form-input" type="number" name="pminute" min="0" max="59" value={form.pminute} onChange={ch} placeholder="min"/></div></div>
                <div className="form-group full"><label className="form-label">Geboorteplaats partner</label><input className="form-input" name="pplace" value={form.pplace||""} onChange={ch} placeholder="Stad, land"/></div>
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
            <p className="form-note">Gratis berekening — geen betaling vereist om uw chart te zien.<br/>🔒 Uw gegevens worden vertrouwelijk behandeld.</p>
          </div>
        </div>
      </div>

      {chart&&(
        <div className="section bg-white" id="chart-res">
          <div className="container-sm">
            <div className="label" style={{marginBottom:8}}>Stap 2 — Uw chart</div>
            <h2 className="h2" style={{marginBottom:32}}>{chart.isNumerology?"Uw kerngetallen":chart.isHoroscoop?"Uw planeetstanden":"Uw Human Design chart"}</h2>
            <div className="grid-2" style={{gap:28}}>
              <div>
                <div className="chart-result">
                  <div style={{fontSize:".6rem",fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"var(--text-light)",marginBottom:4}}>{chart.isNumerology?"Numerologie":chart.isHoroscoop?"Horoscoop":"Human Design"}</div>
                  <div style={{fontFamily:"var(--font-serif)",fontSize:"1.1rem",marginBottom:16}}>{form.name}</div>
                  {chart.isNumerology?(
                    <table className="chart-table"><tbody>
                      {[["Levenspad",chart.lp+" — "+chart.lpName],["Uitdrukking",chart.exp+" — "+chart.expName],["Ziel",chart.soul],["Persoonlijkheid",chart.pers],["Verjaardag",chart.bday],["Pers. Jaar 2025",chart.py],["Rijping",chart.mat]].map(([l,v])=>(
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
                    <p className="body-sm">Berekend op basis van uw exacte geboortedata.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="order-block" style={{marginTop:24}}>
              <div className="order-block-title">Stap 3 — Ontvang uw volledige rapport</div>
              <div className="order-block-sub">Chart berekend. Het volledige rapport bevat {rpt.pages} paginas diepgaande persoonlijke analyse — direct als PDF.</div>
              <button className="btn btn-white btn-full" onClick={()=>{track("checkout_started",{report:rpt.id,price:rpt.priceNum});goToStripe(rpt.id,chart,form);}}>Betalen en rapport ontvangen — {rpt.price}</button>
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
      <section className="hero">
        <div className="hero-bg"/>
        <div className="hero-pattern"/>
        <div className="hero-glow"/>
        <div className="hero-content">
          <div>
            <div className="hero-eyebrow">Faculty of Human Design — Ibiza, Spanje</div>
            <h1 className="h1-hero hero-title">Uw persoonlijke<br/>blauwdruk, <em>berekend<br/>op de sterren</em></h1>
            <p className="body-lg" style={{color:"rgba(255,255,255,.58)",maxWidth:500,marginTop:16}}>Spiritueel in inzicht. Wetenschappelijk in berekening. Persoonlijk op basis van uw exacte geboortedata.</p>
            <div className="hero-actions">
              <button className="btn btn-white btn-lg" onClick={()=>{track("hero_cta_click",{location:"hero"});go("rapport-volledig");}}>Ontvang mijn persoonlijke rapport</button>
              <button className="btn btn-ghost" onClick={()=>go("rapporten")}>Bekijk alle rapporten</button>
            </div>
            <div className="hero-micro">
              {["🔒 Veilige betaling","📄 Persoonlijke PDF","⚡ Direct beschikbaar"].map(t=>(
                <div key={t} className="hero-micro-item">{t}</div>
              ))}
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-label">Faculty of Human Design</div>
            {[["2.400+","Rapporten uitgebracht"],["4.9 / 5","Gemiddelde beoordeling"],["2014","Opgericht op Ibiza"]].map(([n,l])=>(
              <div key={l} className="hero-stat"><div className="hero-stat-n">{n}</div><div className="hero-stat-l">{l}</div></div>
            ))}
            <div className="hero-divider"/>
            <p style={{fontSize:".8rem",fontWeight:300,color:"rgba(255,255,255,.4)",lineHeight:1.7}}>Berekend met Swiss Ephemeris algoritmen — geen generieke profielen.</p>
          </div>
        </div>
      </section>
      <div style={{background:"white",padding:"20px 24px",borderBottom:"1px solid var(--border)"}}>
        <div className="container"><TrustStrip/></div>
      </div>
      <section className="section bg-muted">
        <div className="container">
          <div className="grid-2" style={{gap:60,alignItems:"center"}}>
            <div>
              <div className="label" style={{marginBottom:12}}>Meest gekozen</div>
              <h2 className="h2" style={{marginBottom:16}}>Volledig Human Design Rapport</h2>
              <p className="body-lg" style={{marginBottom:20}}>Uw complete persoonlijke blauwdruk — van Type en Autoriteit tot Inkarnatie-Kruis. 40+ paginas, direct als PDF.</p>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                {REPORTS[0].includes.map((item,i)=>(
                  <li key={i} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:".9rem",fontWeight:300,color:"var(--text-muted)"}}>
                    <span style={{color:"var(--brand)",flexShrink:0}}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                <button className="btn btn-primary btn-lg" onClick={()=>{track("report_card_click",{report:"volledig",price:75,location:"featured"});go("rapport-volledig");}}>Rapport bestellen — 75 euro</button>
                <div style={{fontSize:".82rem",color:"var(--text-light)"}}>40+ paginas · Direct als PDF</div>
              </div>
            </div>
            <div style={{background:"white",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",overflow:"hidden",boxShadow:"var(--shadow-lg)"}}>
              <div style={{background:"var(--brand)",padding:"28px 32px"}}>
                {[["Exacte geboortedata","Datum, tijd en plaats"],["Swiss Ephemeris","Astronomische precisie"],["I Ching en Kabbalah","64 poorten en 9 centra"],["Persoonlijke analyse","Geen templates"]].map(([t,d])=>(
                  <div key={t} style={{borderBottom:"1px solid rgba(255,255,255,.1)",padding:"10px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:".88rem",fontWeight:300,color:"white"}}>{t}</div>
                    <div style={{fontSize:".72rem",color:"rgba(255,255,255,.4)"}}>{d}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"24px 32px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div><div style={{fontFamily:"var(--font-serif)",fontSize:"2.2rem",fontWeight:300}}>75 euro</div><div style={{fontSize:".72rem",color:"var(--text-light)"}}>Eenmalig direct als PDF</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:".7rem",fontWeight:600,color:"var(--brand)",textTransform:"uppercase"}}>40+ paginas</div><div style={{fontSize:".7rem",color:"var(--text-light)"}}>12 secties</div></div>
                </div>
                <button className="btn btn-primary btn-full" onClick={()=>go("rapport-volledig")}>Bestel dit rapport</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container">
          <div className="text-center" style={{marginBottom:48}}>
            <div className="label" style={{marginBottom:12}}>Alle rapporten</div>
            <h2 className="h2">Kies uw rapport</h2>
          </div>
          <div className="grid-3">
            {REPORTS.filter(r=>r.id!=="volledig").slice(0,3).map(r=>(
              <ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:32}}>
            <button className="btn btn-secondary" onClick={()=>go("rapporten")}>Bekijk alle 8 rapporten</button>
          </div>
        </div>
      </section>
      <section className="section bg-muted">
        <div className="container-md">
          <div className="text-center" style={{marginBottom:40}}>
            <div className="label" style={{marginBottom:12}}>Hoe het werkt</div>
            <h2 className="h2">In drie stappen uw rapport</h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:24,maxWidth:640,margin:"0 auto"}}>
            <StepCard num="1" title="Voer uw geboortegegevens in" desc="Naam, geboortedatum, -tijd en -plaats. Uw chart wordt direct gratis berekend en zichtbaar als bodygraph."/>
            <StepCard num="2" title="Bekijk uw chart" desc="Zie direct uw Type, Autoriteit, Profiel en gedefinieerde centra. Gratis en direct."/>
            <StepCard num="3" title="Ontvang uw rapport" desc="Na betaling wordt uw rapport gegenereerd — 40+ paginas persoonlijke analyse, direct als PDF."/>
          </div>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container">
          <div className="text-center" style={{marginBottom:40}}>
            <div className="label" style={{marginBottom:12}}>Ervaringen</div>
            <h2 className="h2">Wat onze klanten zeggen</h2>
          </div>
          <div className="grid-3">
            {[["Het rapport heeft mij meer inzicht gegeven dan jaren van zelfonderzoek. De precisie van de analyse is indrukwekkend.","M. van den Berg, Amsterdam","Volledig Rapport"],["Als koppel hebben wij veel baat gehad bij het relatierapport. Eindelijk begrijpen wij de dynamieken tussen ons.","T. en E. Dubois, Antwerpen","Relatierapport"],["De combinatie van Human Design en Numerologie gaf een compleet beeld. Diep geraakt door de nauwkeurigheid.","S. Muller, Utrecht","Volledig Rapport en Numerologie"]].map(([q,n,r])=>(
              <div className="tcard" key={n}>
                <div className="stars">★★★★★</div>
                <div className="tcard-quote">"{q}"</div>
                <div className="tcard-author">{n}</div>
                <div className="tcard-report">{r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-muted">
        <div className="container-md">
          <div className="sub-card">
            <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:32}}>
              <div>
                <div style={{fontSize:".65rem",fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(154,128,80,.8)",marginBottom:12}}>Abonnement</div>
                <h2 className="h2" style={{color:"white",marginBottom:12}}>Maandelijkse Guidance</h2>
                <p style={{fontSize:".95rem",fontWeight:300,color:"rgba(255,255,255,.55)",lineHeight:1.75,maxWidth:480}}>Elke maand een persoonlijk rapport over de energetische themas van die maand, afgestemd op uw Human Design chart.</p>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div className="sub-price">19 euro</div>
                <div className="sub-price-period">per maand opzegbaar</div>
                <div style={{height:12}}/>
                <button className="btn btn-gold" onClick={()=>go("rapport-maandelijks")}>Start abonnement</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section bg-dark">
        <div className="container text-center">
          <div className="divider divider-center" style={{marginBottom:28}}/>
          <h2 className="h2" style={{color:"white",marginBottom:16}}>Klaar om uw design te ontdekken?</h2>
          <p className="body-lg" style={{color:"rgba(255,255,255,.5)",maxWidth:480,margin:"0 auto 28px"}}>Uw chart wordt direct gratis berekend. U betaalt pas na het bekijken van uw chart.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-white btn-lg" onClick={()=>{track("hero_cta_click",{location:"bottom"});go("rapport-volledig");}}>Ontvang mijn persoonlijke rapport</button>
            <button className="btn btn-ghost" onClick={()=>go("rapporten")}>Bekijk alle rapporten</button>
          </div>
          <div style={{height:28}}/>
          <TrustStrip light/>
        </div>
      </section>
      <div className="sticky-cta">
        <button className="btn btn-primary btn-full" onClick={()=>go("rapport-volledig")}>Ontvang mijn persoonlijke rapport — 75 euro</button>
      </div>
    </div>
  );
}

function WatPage({go}){
  const[faq,setFaq]=useState(null);
  const faqs=[["Op basis waarvan wordt de chart berekend?","Alle charts worden berekend met de Meeus ephemeris — dezelfde astronomische algoritmen als professionele Human Design software. De berekening vereist uw exacte geboortedatum, -tijd en -plaats."],["Is dit hetzelfde als een horoscoop?","Nee. Een horoscoop werkt met uw zonneteken. Human Design combineert astronomische data met de I Ching, Kabbalistische centra en kwantumfysische principes tot een individuele blauwdruk."],["Wat als ik mijn geboortetijd niet weet?","De geboortetijd is relevant voor sommige centra. Controleer uw geboorteakte voor de meest nauwkeurige berekening."],["Hoe lang duurt het om een rapport te ontvangen?","Na betaling wordt uw rapport gegenereerd — 40+ paginas binnen 3 tot 4 minuten beschikbaar als PDF."],["Is het rapport persoonlijk of een template?","Elk rapport wordt volledig gegenereerd op basis van uw specifieke chart. Geen twee rapporten zijn identiek."]];
  return(
    <div className="pg">
      <section style={{background:"var(--brand)",padding:"100px 24px 72px"}}>
        <div className="container-sm">
          <div className="label" style={{color:"rgba(154,128,80,.8)",marginBottom:12}}>Het systeem</div>
          <h1 className="h1" style={{color:"white",marginBottom:16}}>Wat is Human Design?</h1>
          <p className="body-lg" style={{color:"rgba(255,255,255,.55)",maxWidth:520}}>Een synthese van vier oude wijsheidssystemen die samen een precieze kaart vormen van wie u bent.</p>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container-sm">
          <div className="label" style={{marginBottom:12}}>De vier pijlers</div>
          <h2 className="h2" style={{marginBottom:32}}>Gebouwd op eeuwenoude wijsheid</h2>
          <div className="grid-2">
            {[["I Ching","De 64 hexagrammen worden de 64 poorten in uw design."],["Kabbalah","De Boom des Levens vormt de basis van de 9 centra."],["Astrologie","Planetaire posities activeren specifieke poorten."],["Kwantumfysica","De centra corresponderen met hormoonklieren."]].map(([t,d])=>(
              <div key={t} style={{background:"var(--muted)",borderRadius:"var(--radius-lg)",padding:"24px"}}>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.15rem",fontWeight:400,color:"var(--text)",marginBottom:8}}>{t}</div>
                <p className="body-sm">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-muted">
        <div className="container-sm">
          <div className="label" style={{marginBottom:12}}>De vijf types</div>
          <h2 className="h2" style={{marginBottom:32}}>Welk type bent u?</h2>
          {[["Generator","37%","Wacht om te reageren","De primaire energiebron. Opereert optimaal wanneer het reageert op externe impulsen."],["Manifesting Generator","33%","Informeer reageer dan","Snel, veelzijdig en multidimensionaal."],["Projector","20%","Wacht op de uitnodiging","Geboren om te leiden en begeleiden wanneer uitgenodigd."],["Manifestor","9%","Informeer voor u handelt","Het enige type dat direct initiatief kan nemen."],["Reflector","1%","Wacht een maancyclus","Spiegel van de gemeenschap."]].map(([t,pct,s,d])=>(
            <div key={t} style={{borderBottom:"1px solid var(--border)",padding:"20px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div>
                <div style={{fontFamily:"var(--font-serif)",fontSize:"1.05rem",color:"var(--text)",marginBottom:3}}>{t}</div>
                <div style={{fontSize:".65rem",fontWeight:600,color:"var(--gold)",letterSpacing:".08em",textTransform:"uppercase"}}>{pct} van de bevolking</div>
              </div>
              <p className="body-sm" style={{alignSelf:"center"}}>{d}</p>
            </div>
          ))}
          <div style={{marginTop:32}}><button className="btn btn-primary" onClick={()=>go("rapporten")}>Ontdek uw type</button></div>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container-sm">
          <div className="label" style={{marginBottom:12}}>Veelgestelde vragen</div>
          <h2 className="h2" style={{marginBottom:32}}>Vragen over het systeem</h2>
          {faqs.map(([q,a],i)=>(
            <div className="faq-item" key={i}>
              <div className="faq-q" onClick={()=>setFaq(faq===i?null:i)}>{q}<span className={"faq-toggle"+(faq===i?" open":"")}>+</span></div>
              {faq===i&&<div className="faq-a">{a}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function RapportenPage({go}){
  const hd=REPORTS.filter(r=>!["numerologie","horoscoop","maandelijks"].includes(r.id));
  const other=REPORTS.filter(r=>["numerologie","horoscoop"].includes(r.id));
  const sub=REPORTS.find(r=>r.id==="maandelijks");
  return(
    <div className="pg">
      <section style={{background:"var(--dark)",padding:"100px 24px 72px"}}>
        <div className="container">
          <div className="label" style={{color:"rgba(154,128,80,.8)",marginBottom:12}}>Alle rapporten</div>
          <h1 className="h1" style={{color:"white",marginBottom:16,maxWidth:600}}>Kies uw persoonlijke rapport</h1>
          <p className="body-lg" style={{color:"rgba(255,255,255,.5)",maxWidth:520}}>Elk rapport is gebaseerd op exacte astronomische berekeningen. Geen generieke profielen.</p>
        </div>
      </section>
      <section className="section bg-muted">
        <div className="container">
          <div className="label" style={{marginBottom:12}}>Human Design</div>
          <h2 className="h2" style={{marginBottom:32}}>Human Design rapporten</h2>
          <div className="grid-3">{hd.map(r=><ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>)}</div>
          <div style={{height:1,background:"var(--border)",margin:"48px 0"}}/>
          <div className="label" style={{marginBottom:12}}>Numerologie en Astrologie</div>
          <h2 className="h2" style={{marginBottom:32}}>Aanvullende disciplines</h2>
          <div className="grid-2" style={{maxWidth:720}}>{other.map(r=><ReportCard key={r.id} rpt={r} onClick={()=>go("rapport-"+r.id)}/>)}</div>
          {sub&&<>
            <div style={{height:1,background:"var(--border)",margin:"48px 0"}}/>
            <div style={{maxWidth:720}}>
              <div className="label" style={{marginBottom:12}}>Abonnement</div>
              <div className="sub-card" style={{cursor:"pointer"}} onClick={()=>go("rapport-maandelijks")}>
                <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:24}}>
                  <div><div style={{fontFamily:"var(--font-serif)",fontSize:"1.4rem",color:"white",marginBottom:8}}>{sub.tagline}</div><p style={{fontSize:".9rem",color:"rgba(255,255,255,.5)",maxWidth:400,lineHeight:1.7}}>{sub.intro}</p></div>
                  <div style={{textAlign:"center"}}><div className="sub-price">19 euro</div><div className="sub-price-period">per maand</div><div style={{height:12}}/><div className="btn btn-gold btn-sm">Bekijken</div></div>
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
  const faqs=[["Hoe nauwkeurig is de berekening?","Wij gebruiken de Meeus ephemeris — dezelfde algoritmen als professionele astronomische software."],["Is het rapport persoonlijk?","Elk rapport wordt volledig op maat gegenereerd op basis van uw specifieke chart. Geen twee rapporten zijn identiek."],["In welk format ontvang ik het rapport?","Direct als PDF via de browser. Sla op via het printvenster."],["Kan ik het rapport meerdere keren lezen?","Ja — en wij raden dat aan. Human Design verdiept zich naarmate u er meer mee leeft."],["Wat als ik mijn geboortetijd niet weet?","Gebruik de meest nauwkeurige tijd die u heeft. Type en Autoriteit zijn meestal al correct."]];
  return(
    <div className="pg">
      <div className="detail-hero">
        <div className="detail-hero-inner">
          <div>
            <div className="detail-hero-badge">{rpt.icon} Faculty of Human Design</div>
            <h1 className="detail-hero-title">{rpt.title}</h1>
            <div className="detail-hero-tagline">{rpt.tagline}</div>
            <div className="detail-hero-meta">
              <span className="detail-hero-m">{rpt.pages} paginas</span>
              <span className="detail-hero-m">{rpt.sections} secties</span>
              <span className="detail-hero-m">Direct als PDF</span>
              <span className="detail-hero-m">{rpt.sub}</span>
            </div>
          </div>
          <div className="price-box">
            <div className="price-box-amount">{rpt.price}</div>
            <div className="price-box-period">{rpt.sub}</div>
            <button className="btn btn-white btn-full" onClick={()=>{track("checkout_started",{report:rpt.id,price:rpt.priceNum,location:"detail_hero"});document.getElementById("bestel")?.scrollIntoView({behavior:"smooth"});}}>Rapport bestellen</button>
            <div style={{marginTop:12}}><TrustStrip light/></div>
          </div>
        </div>
      </div>
      <section className="section bg-muted">
        <div className="container">
          <div className="grid-2" style={{gap:56,alignItems:"start"}}>
            <div>
              <div className="label" style={{marginBottom:12}}>Over dit rapport</div>
              <h2 className="h2" style={{marginBottom:16}}>{rpt.title}</h2>
              <p className="body-lg" style={{marginBottom:20}}>{rpt.intro}</p>
              <div style={{background:"rgba(61,44,94,.06)",borderLeft:"3px solid var(--brand)",padding:"16px 20px",borderRadius:"0 var(--radius-sm) var(--radius-sm) 0",marginBottom:24}}>
                <div className="label" style={{marginBottom:6}}>Voor wie</div>
                <p className="body-sm">{rpt.for}</p>
              </div>
              <div style={{background:"white",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"24px"}}>
                <div className="label" style={{marginBottom:14}}>Wat u ontvangt</div>
                <div className="grid-2" style={{gap:12}}>
                  {[["Omvang",rpt.pages+" paginas"],["Levertijd","3-4 minuten"],["Format","PDF download"],["Taal","Nederlands"]].map(([l,v])=>(
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
            {[["Niks was zo concreet en inzichtelijk. Eindelijk begrijp ik waarom ik zo in elkaar zit.","Marieke V., Amsterdam"],["Een feest van herkenning. Zoveel inzicht in wie ik ben en hoe ik het beste opereer.","Thomas D., Antwerpen"],["Ik lees het telkens opnieuw. Elke keer ontdek ik iets nieuws.","Sofie M., Utrecht"]].map(([q,n])=>(
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
    {id:"s1",tag:"Human Design Basics",title:"Het verschil tussen Type en Strategie",date:"12 april 2025",readtime:"6 min",excerpt:"Type en Strategie zijn twee van de meest gebruikte begrippen in Human Design, maar beschrijven fundamenteel verschillende aspecten van uw design.",body:"Type en Strategie worden vaak als synoniem gebruikt, maar zijn fundamenteel verschillend.\n\nUw Type is uw energetische aard. Het beschrijft hoe uw energiesysteem is geconfigureerd. Er zijn vijf Types: Generator, Manifesting Generator, Projector, Manifestor en Reflector. Dit Type verandert nooit.\n\nUw Strategie is de optimale manier van handelen die bij uw Type hoort. Generators wachten om te reageren. Projectors wachten op de uitnodiging. Manifestors informeren voor zij handelen.\n\nType beschrijft wie u bent; Strategie beschrijft hoe u het beste opereert. De Faculty of Human Design behandelt beide dimensies uitgebreid in elk rapport."},
    {id:"s2",tag:"Autoriteit",title:"Innerlijke autoriteit: hoe u uw beste beslissingen neemt",date:"28 maart 2025",readtime:"7 min",excerpt:"Uw innerlijke autoriteit in Human Design is het meest consistente instrument voor besluitvorming dat u bezit.",body:"Beslissingen nemen is een van de meest fundamentele capaciteiten van een menselijk wezen. Human Design stelt voor: neem beslissingen op basis van uw innerlijke autoriteit.\n\nEr zijn zeven vormen van innerlijke autoriteit, elk gekoppeld aan een gedefinieerd centrum.\n\nEmotionele autoriteit: wacht op emotionele helderheid voor u beslist. Sacraal autoriteit is exclusief voor Generators. Splenische autoriteit spreekt eenmalig in het moment.\n\nElk type autoriteit vraagt een andere aanpak, maar alle leiden tot beslissingen die echt van u zijn."},
    {id:"s3",tag:"Geschiedenis",title:"De oorsprong van Human Design op Ibiza",date:"14 februari 2025",readtime:"5 min",excerpt:"In januari 1987 ontving Ra Uru Hu het Human Design systeem gedurende acht dagen op Ibiza.",body:"Het verhaal begint in januari 1987, op het Spaanse eiland Ibiza. Ra Uru Hu woonde op dat moment op het eiland en leefde een teruggetrokken leven.\n\nIn de nacht van 3 januari 1987 begon een ervaring die hij later zou omschrijven als het ontvangen van een Stem. Gedurende acht dagen ontving hij een continue stroom van informatie.\n\nWat hij ontving was een synthese: de 64 hexagrammen van de Chinese I Ching, de Sefirot van de Kabbala, de astrologie van het Westen, en principes uit de kwantumfysica.\n\nDe Faculty of Human Design is opgericht op ditzelfde eiland, vanuit diep respect voor de oorsprong van het systeem."},
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
            {(post.body||"").trim().split("\n\n").map((p,i)=>(
              <p key={i} className="body-lg" style={{marginBottom:22,fontSize:"1rem",lineHeight:2}}>{p.trim()}</p>
            ))}
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
      <section style={{background:"var(--dark)",padding:"100px 24px 72px"}}>
        <div className="container">
          <div className="label" style={{color:"rgba(154,128,80,.8)",marginBottom:12}}>Kennis</div>
          <h1 className="h1" style={{color:"white",marginBottom:12}}>Inzichten en Achtergronden</h1>
          <p className="body-lg" style={{color:"rgba(255,255,255,.5)",maxWidth:480}}>Artikelen over Human Design, Numerologie en Astrologie. Elke twee weken een nieuw artikel.</p>
        </div>
      </section>
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
      <section style={{background:"var(--dark)",padding:"100px 24px 72px"}}>
        <div className="container">
          <div className="label" style={{color:"rgba(154,128,80,.8)",marginBottom:12}}>Over ons</div>
          <h1 className="h1" style={{color:"white"}}>Faculty of Human Design</h1>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container">
          <div className="grid-2" style={{gap:60,alignItems:"start"}}>
            <div>
              <div className="label" style={{marginBottom:12}}>Het instituut</div>
              <h2 className="h2" style={{marginBottom:20}}>Opgericht op het eiland waar het begon</h2>
              <p className="body-lg" style={{marginBottom:16}}>De Faculty of Human Design is in 2014 opgericht op Ibiza, het eiland waar Ra Uru Hu in 1987 het Human Design systeem ontving.</p>
              <p className="body-md" style={{marginBottom:16}}>Wij zijn gespecialiseerd in persoonlijke rapporten op basis van Human Design, Numerologie en Geboorteastrologie. Alle rapporten worden gegenereerd op basis van exacte astronomische berekeningen.</p>
              <p className="body-md">Onze focus is smal en bewust: uitsluitend diepgaande, nauwkeurige geschreven analyse. Geen cursussen, geen coachingstrajecten.</p>
              <div style={{display:"flex",gap:32,flexWrap:"wrap",marginTop:32}}>
                {[["2014","Opgericht"],["2.400+","Rapporten"],["8","Rapport soorten"],["4.9","Beoordeling"]].map(([n,l])=>(
                  <div key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
                ))}
              </div>
            </div>
            <div>
              <div style={{background:"var(--muted)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"32px"}}>
                <div className="label" style={{marginBottom:16}}>Onze aanpak</div>
                {[["Exacte berekeningen","Meeus ephemeris, dezelfde algoritmen als professionele astronomische software."],["Persoonlijke analyse","Geen templates. Elk rapport gegenereerd op basis van uw specifieke chart."],["Drie disciplines","Human Design, Numerologie en Astrologie, elk vanuit eigen methodologie."],["Directe levering","PDF beschikbaar binnen 3-4 minuten na invoer van uw gegevens."]].map(([t,d])=>(
                  <div key={t} style={{borderBottom:"1px solid var(--border)",padding:"14px 0"}}>
                    <div style={{fontSize:".9rem",fontWeight:500,color:"var(--text)",marginBottom:4}}>{t}</div>
                    <p className="body-sm">{d}</p>
                  </div>
                ))}
              </div>
              <div style={{marginTop:20}}><button className="btn btn-primary btn-full" onClick={()=>go("rapporten")}>Bekijk alle rapporten</button></div>
            </div>
          </div>
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
                <div className="form-group"><label className="form-label">Naam</label><input className="form-input" name="name" value={form.name} onChange={ch} placeholder="Uw naam"/></div>
                <div className="form-group"><label className="form-label">E-mailadres</label><input className="form-input" type="email" name="email" value={form.email} onChange={ch} placeholder="uw@email.nl"/></div>
                <div className="form-group"><label className="form-label">Onderwerp</label><input className="form-input" name="subject" value={form.subject} onChange={ch} placeholder="Onderwerp"/></div>
                <div className="form-group"><label className="form-label">Bericht</label><textarea className="form-input" name="msg" value={form.msg} onChange={ch} placeholder="Uw vraag of opmerking" style={{resize:"vertical",minHeight:110}}/></div>
                <button className="btn btn-primary" onClick={()=>alert("Bedankt voor uw bericht. Wij reageren binnen 1 werkdag.")}>Verstuur bericht</button>
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
        <div className="thankyou-title">Uw rapport is klaar</div>
        <div className="thankyou-sub">Uw persoonlijke analyse staat hieronder. Download het als PDF voor uw archief.</div>
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
            <div className="upsell-label">Aanbevolen voor u</div>
            <div className="upsell-title">Verdiep uw inzicht met {nextRpt.title}</div>
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
            <div><div className="label" style={{marginBottom:4}}>Maandelijkse Guidance</div><p className="body-sm">Elke maand een persoonlijk rapport — opzegbaar wanneer u wilt.</p></div>
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
          const res=await fetch("https://api.anthropic.com/v1/messages",{
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