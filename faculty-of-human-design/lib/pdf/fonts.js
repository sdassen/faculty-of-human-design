// ─── PDF FONTS ────────────────────────────────────────────────────────────────
// Optional custom font registration. Falls back to PDFKit's built-in
// Helvetica + Times-Roman if the custom font files aren't present.
//
// To activate premium typography, place these TTF files in lib/pdf/fonts/:
//   - CormorantGaramond-Regular.ttf
//   - CormorantGaramond-Italic.ttf
//   - Inter-Regular.ttf
//   - Inter-Medium.ttf
//
// Download from: https://fonts.google.com/specimen/Cormorant+Garamond
//                https://fonts.google.com/specimen/Inter
//
// Once present, the PDF renderer automatically picks them up.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const FONTS_DIR  = path.join(__dirname, "fonts");

// Logical names used throughout the PDF renderer
export const FONT = {
  // Display / headings (was Times-Italic)
  display:        "Times-Italic",
  displayRegular: "Times-Roman",
  // Body
  body:           "Helvetica",
  bodyMedium:     "Helvetica-Bold",
};

// ─── REGISTRATION ─────────────────────────────────────────────────────────────
let _registered = false;

/**
 * Try to register custom fonts on the document. Safe to call multiple times.
 * If a font file is missing, that font silently keeps its PDFKit default.
 */
export function registerFonts(doc) {
  if (_registered) {
    // Re-register on new doc (PDFKit fonts are per-document)
    _registered = false;
  }

  const tryRegister = (name, file) => {
    const p = path.join(FONTS_DIR, file);
    if (fs.existsSync(p)) {
      try {
        doc.registerFont(name, p);
        return true;
      } catch (e) {
        console.warn(`[fonts] Failed to register ${file}: ${e.message}`);
      }
    }
    return false;
  };

  // Cormorant Garamond — for display/headings
  if (tryRegister("Display-Italic",  "CormorantGaramond-Italic.ttf")) {
    FONT.display = "Display-Italic";
  }
  if (tryRegister("Display-Regular", "CormorantGaramond-Regular.ttf")) {
    FONT.displayRegular = "Display-Regular";
  }
  // Inter — for body
  if (tryRegister("Body-Regular", "Inter-Regular.ttf")) {
    FONT.body = "Body-Regular";
  }
  if (tryRegister("Body-Medium",  "Inter-Medium.ttf")) {
    FONT.bodyMedium = "Body-Medium";
  }

  _registered = true;
}
