// MINIMAL STUB — diagnostic test only
// If this loads without SyntaxError, the real index.js body has a parsing issue.
// If even this fails, the problem is in Vercel's ESM path resolution or bundling.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export async function generatePDF({ order, sections }) {
  return Buffer.from("%PDF-1.4 test stub");
}
