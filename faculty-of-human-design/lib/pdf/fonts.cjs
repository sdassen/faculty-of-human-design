// ─── PDF FONTS ────────────────────────────────────────────────────────────────
// CJS build — loaded via createRequire from lib/pdf/index.js (native ESM).
"use strict";

const fs   = require("fs");
const path = require("path");

const FONT = {
  display:        "Times-Italic",
  displayRegular: "Times-Roman",
  body:           "Helvetica",
  bodyMedium:     "Helvetica-Bold",
};

function getFontsDir() {
  return path.join(process.cwd(), "lib", "pdf", "fonts");
}

function registerFonts(doc) {
  try {
    const FONTS_DIR = getFontsDir();
    if (!fs.existsSync(FONTS_DIR)) return;

    const tryRegister = function(name, file) {
      try {
        const p = path.join(FONTS_DIR, file);
        if (fs.existsSync(p)) {
          doc.registerFont(name, p);
          return true;
        }
      } catch (e) {
        console.warn("[fonts] register " + file + " failed: " + e.message);
      }
      return false;
    };

    if (tryRegister("Display-Italic",  "CormorantGaramond-Italic.ttf"))  FONT.display        = "Display-Italic";
    if (tryRegister("Display-Regular", "CormorantGaramond-Regular.ttf")) FONT.displayRegular = "Display-Regular";
    if (tryRegister("Body-Regular",    "Inter-Regular.ttf"))             FONT.body           = "Body-Regular";
    if (tryRegister("Body-Medium",     "Inter-Medium.ttf"))              FONT.bodyMedium     = "Body-Medium";
  } catch (e) {
    console.warn("[fonts] registration skipped: " + e.message);
  }
}

module.exports = { FONT, registerFonts };
