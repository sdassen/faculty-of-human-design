// ─── BUNDLED FONT CSS ─────────────────────────────────────────────────────────
// Reads Cormorant Garamond + Inter from node_modules/@fontsource/* and returns
// inline @font-face CSS with base64-encoded woff2 data URIs.
// Called once at process start; result is cached for all subsequent renders.
// Returns empty string on any error — template falls back to Google Fonts CDN.

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function fontFile(pkg, filename) {
  return join(__dirname, "..", "..", "node_modules", "@fontsource", pkg, "files", filename);
}

function face(family, weight, style, pkg, filename) {
  const path = fontFile(pkg, filename);
  let data;
  try {
    data = readFileSync(path);
  } catch {
    return null;
  }
  const b64 = data.toString("base64");
  return `@font-face {
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url('data:font/woff2;base64,${b64}') format('woff2');
}`;
}

// Built once, cached forever
let _css = null;

export function buildFontCSS() {
  if (_css !== null) return _css;

  const rules = [
    // Inter — normal (weights 300/400/500)
    face("Inter", 300, "normal", "inter", "inter-latin-300-normal.woff2"),
    face("Inter", 400, "normal", "inter", "inter-latin-400-normal.woff2"),
    face("Inter", 500, "normal", "inter", "inter-latin-500-normal.woff2"),

    // Cormorant Garamond — normal
    face("Cormorant Garamond", 300, "normal", "cormorant-garamond", "cormorant-garamond-latin-300-normal.woff2"),
    face("Cormorant Garamond", 400, "normal", "cormorant-garamond", "cormorant-garamond-latin-400-normal.woff2"),
    face("Cormorant Garamond", 600, "normal", "cormorant-garamond", "cormorant-garamond-latin-600-normal.woff2"),

    // Cormorant Garamond — italic
    face("Cormorant Garamond", 300, "italic", "cormorant-garamond", "cormorant-garamond-latin-300-italic.woff2"),
    face("Cormorant Garamond", 400, "italic", "cormorant-garamond", "cormorant-garamond-latin-400-italic.woff2"),
    face("Cormorant Garamond", 600, "italic", "cormorant-garamond", "cormorant-garamond-latin-600-italic.woff2"),
  ].filter(Boolean);

  _css = rules.join("\n");
  return _css;
}
