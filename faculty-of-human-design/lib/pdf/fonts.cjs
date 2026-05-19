// ─── PDF FONTS ────────────────────────────────────────────────────────────────
// CJS build — loaded via createRequire from lib/pdf/index.js (native ESM).
"use strict";

const fs   = require("fs");
const path = require("path");

// Fallback values — overridden by registerFonts() when TTF files are present.
// Custom fonts:
//   Display  → Cormorant Garamond  (headings, labels, elegant type)
//   Body     → Inter               (body text, captions, UI-style copy)
const FONT = {
  // Cormorant Garamond
  displayLight:   "Times-Roman",       // Light  300 — subtle labels, captions
  displayRegular: "Times-Roman",       // Regular 400 — section labels
  display:        "Times-Italic",      // Italic  400 — pull quotes, highlights
  displaySemiBold:"Times-Roman",       // SemiBold 600 — section titles
  // Inter
  bodyLight:      "Helvetica",         // Light  300 — small print, footnotes
  body:           "Helvetica",         // Regular 400 — body copy
  bodyMedium:     "Helvetica-Bold",    // Medium  500 — emphasis, labels
};

function getFontsDir() {
  return path.join(process.cwd(), "lib", "pdf", "fonts");
}

function registerFonts(doc) {
  try {
    const FONTS_DIR = getFontsDir();
    if (!fs.existsSync(FONTS_DIR)) {
      console.warn("[fonts] fonts/ directory not found — using system fallbacks");
      return;
    }

    let loaded = 0;
    const tryRegister = function(name, file) {
      try {
        const p = path.join(FONTS_DIR, file);
        if (fs.existsSync(p)) {
          doc.registerFont(name, p);
          loaded++;
          return true;
        } else {
          console.warn("[fonts] missing: " + file);
        }
      } catch (e) {
        console.warn("[fonts] register " + file + " failed: " + e.message);
      }
      return false;
    };

    // Cormorant Garamond — display / headline typeface
    if (tryRegister("Display-Light",    "CormorantGaramond-Light.ttf"))    FONT.displayLight    = "Display-Light";
    if (tryRegister("Display-Regular",  "CormorantGaramond-Regular.ttf"))  FONT.displayRegular  = "Display-Regular";
    if (tryRegister("Display-Italic",   "CormorantGaramond-Italic.ttf"))   FONT.display         = "Display-Italic";
    if (tryRegister("Display-SemiBold", "CormorantGaramond-SemiBold.ttf")) FONT.displaySemiBold = "Display-SemiBold";

    // Inter — body / UI typeface
    if (tryRegister("Body-Light",   "Inter-Light.ttf"))   FONT.bodyLight  = "Body-Light";
    if (tryRegister("Body-Regular", "Inter-Regular.ttf")) FONT.body       = "Body-Regular";
    if (tryRegister("Body-Medium",  "Inter-Medium.ttf"))  FONT.bodyMedium = "Body-Medium";

    console.log("[fonts] loaded " + loaded + "/7 custom fonts");
  } catch (e) {
    console.warn("[fonts] registration skipped: " + e.message);
  }
}

module.exports = { FONT, registerFonts };
