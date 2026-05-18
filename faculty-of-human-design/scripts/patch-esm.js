/**
 * patch-esm.js — run during `npm run build` (before ncc compiles serverless functions)
 *
 * Problem: ncc (Vercel's webpack bundler) uses mainFields: ['module', 'main'] for
 * Node.js targets. Several packages in the pdfkit → fontkit dependency chain have a
 * "module" field pointing to an ESM build (.mjs). ncc picks those up, compiles them
 * to CJS, but the bundle contains require() calls that reference remaining .mjs files
 * at runtime → "(node:X) Warning: To load an ES module" → FUNCTION_INVOCATION_FAILED.
 *
 * Fix: remove the "module" field from the affected packages so ncc falls back to
 * "main" (always CJS). The "exports" field is left intact so Node.js native ESM
 * (when/if used) still resolves correctly via the "require" condition.
 *
 * Affected packages:
 *   node_modules/pdfkit                          "module": "js/pdfkit.es.js"
 *   node_modules/pdfkit/node_modules/fontkit     "module": "dist/module.mjs"
 *   node_modules/pdfkit/node_modules/@swc/helpers "module": "src/index.js"
 *   node_modules/unicode-properties              "module": "./dist/module.mjs"
 */

const fs = require("fs");
const path = require("path");

// Clear webpack/ncc build cache so stale module-resolution results
// (which pre-date our "module" field patches) are not reused.
const cacheDir = path.resolve("node_modules/.cache");
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log("[patch-esm] Cleared node_modules/.cache (stale ncc/webpack cache)");
} else {
  console.log("[patch-esm] node_modules/.cache not present — nothing to clear");
}

const targets = [
  // pdfkit / fontkit ESM chain
  "node_modules/pdfkit/package.json",
  "node_modules/pdfkit/node_modules/fontkit/package.json",
  "node_modules/pdfkit/node_modules/@swc/helpers/package.json",
  "node_modules/unicode-properties/package.json",
  // @supabase packages — auth-js / realtime-js / functions-js have no "exports"
  // map so ncc falls through to the "module" field (ESM build).
  "node_modules/@supabase/supabase-js/package.json",
  "node_modules/@supabase/auth-js/package.json",
  "node_modules/@supabase/realtime-js/package.json",
  "node_modules/@supabase/functions-js/package.json",
  "node_modules/@supabase/postgrest-js/package.json",
  "node_modules/@supabase/storage-js/package.json",
];

let patched = 0;
for (const rel of targets) {
  const abs = path.resolve(rel);
  if (!fs.existsSync(abs)) {
    console.log(`[patch-esm] SKIP  ${rel} (not found)`);
    continue;
  }
  const pkg = JSON.parse(fs.readFileSync(abs, "utf8"));
  if (!pkg.module) {
    console.log(`[patch-esm] SKIP  ${rel} (no "module" field)`);
    continue;
  }
  const removed = pkg.module;
  delete pkg.module;
  fs.writeFileSync(abs, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`[patch-esm] PATCH ${rel}: removed "module": "${removed}"`);
  patched++;
}

console.log(`[patch-esm] Done — ${patched} package(s) patched.`);
