// ─── PDF FONTS ────────────────────────────────────────────────────────────────
// Optional custom font registration. Falls back silently to PDFKit's built-in
// Helvetica + Times-Roman if anything goes wrong (file missing, fs error, etc).
//
// To activate premium typography, place TTF files in lib/pdf/fonts/:
//   - CormorantGaramond-Regular.ttf
//   - CormorantGaramond-Italic.ttf
//   - Inter-Regular.ttf
//   - Inter-Medium.ttf
//
// Download from: fonts.google.com

import fs from "fs";
import path from "path";

// Logical font names used throughout the PDF renderer.
// Always default to PDFKit built-ins; registerFonts() may override.
export const FONT = {
  display:        "Times-Italic",
  displayRegular: "Times-Roman",
  body:           "Helvetica",
  bodyMedium:     "Helvetica-Bold",
};

// Resolve fonts directory using process.cwd() as a stable serverless anchor.
// Vercel serverless functions run with cwd at the project root.
function getFontsDir() {
  return path.join(process.cwd(), "lib", "pdf", "fonts");
}

/**
 * Try to register custom fonts on the document. Safe to call multiple times.
 * Entirely defensive: NEVER throws — silently falls back to built-ins if
 * anything goes wrong.
 */
export function registerFonts(doc) {
  try {
    const FONTS_DIR = getFontsDir();
    if (!fs.existsSync(FONTS_DIR)) return;

    const tryRegister = (name, file) => {
      try {
        const p = path.join(FONTS_DIR, file);
        if (fs.existsSync(p)) {
          doc.registerFont(name, p);
          return true;
        }
      } catch (e) {
        console.warn(`[fonts] register ${file} failed: ${e.message}`);
      }
      return false;
    };

    if (tryRegister("Display-Italic",  "CormorantGaramond-Italic.ttf"))  FONT.display        = "Display-Italic";
    if (tryRegister("Display-Regular", "CormorantGaramond-Regular.ttf")) FONT.displayRegular = "Display-Regular";
    if (tryRegister("Body-Regular",    "Inter-Regular.ttf"))             FONT.body           = "Body-Regular";
    if (tryRegister("Body-Medium",     "Inter-Medium.ttf"))              FONT.bodyMedium     = "Body-Medium";
  } catch (e) {
    console.warn(`[fonts] registration skipped: ${e.message}`);
  }
}
