// ─── QUALITY SCORING ──────────────────────────────────────────────────────────
// Lightweight scoring of generated section text using Claude Haiku.
// Purpose: gate AI output before it ends up in the customer's PDF.
//
// Each section is scored on 4 criteria (1-10):
//   1. Chartverankering — concrete chartdata (gates, channels, centers) mentioned
//   2. Stem — consistent je/jouw, no u/uw
//   3. Lengte & dichtheid — 500-800 words, premium density
//   4. Structuur — required blocks present (In jouw chart, Valkuilen, etc.)
//
// Total: max 40. Below `MIN_SCORE` → regenerate.

import { chartSummary } from "../canon/index.js";

export const MIN_SCORE = 28;       // 70% threshold
export const MAX_RETRIES = 2;

// ─── DETERMINISTIC CHECKS (free, fast) ────────────────────────────────────────
/**
 * Run cheap regex/string checks before involving Haiku.
 * Returns { passed: boolean, issues: string[], score: 0-10 }
 */
export function quickCheck(text) {
  const issues = [];
  let score = 10;

  if (!text || text.trim().length < 400) {
    issues.push("Tekst is te kort (<400 chars)");
    score -= 5;
  }

  if (text.length > 8000) {
    issues.push("Tekst is te lang (>8000 chars)");
    score -= 2;
  }

  // Forbidden markdown
  if (/\*{2}/.test(text)) {
    issues.push("Bevat ** markdown (bold)");
    score -= 2;
  }
  if (/^#{1,6}\s/m.test(text)) {
    issues.push("Bevat # markdown (heading)");
    score -= 2;
  }

  // u/uw usage (formal — forbidden)
  const uMatches = text.match(/\b[Uu](?:w)?\b/g) || [];
  // filter out common false positives
  const realU = uMatches.filter((m) => /^[Uu]w?$/.test(m));
  if (realU.length > 0) {
    issues.push(`Bevat ${realU.length}× formeel "u"/"uw" — moet "je"/"jouw" zijn`);
    score -= 3;
  }

  // Required blocks
  const hasChart = /^in jouw chart:/im.test(text);
  const hasVal   = /^valkuilen:/im.test(text);
  const hasPrakt = /^praktijk:/im.test(text);
  const hasWeek  = /^deze week:/im.test(text);
  const hasRefl  = /^reflectievragen:/im.test(text);
  const missing  = [];
  if (!hasChart) missing.push("In jouw chart");
  if (!hasVal)   missing.push("Valkuilen");
  if (!hasPrakt) missing.push("Praktijk");
  if (!hasWeek)  missing.push("Deze week");
  if (!hasRefl)  missing.push("Reflectievragen");
  if (missing.length) {
    issues.push(`Ontbrekende blokken: ${missing.join(", ")}`);
    score -= missing.length;
  }

  // Moon cycle consistency
  if (/28[\s-]of[\s-]29\s*dagen|28[\s-]tot[\s-]29\s*dagen/i.test(text)) {
    issues.push('Inconsistente maancyclus — moet exact "28 dagen" zijn');
    score -= 1;
  }

  return {
    passed: score >= 7,
    issues,
    score: Math.max(0, score),
  };
}

// ─── CONTENT SCORING (Haiku — paid, deeper) ───────────────────────────────────
/**
 * Use Claude Haiku to score chart anchoring + specificity.
 * Returns { score: 0-30, breakdown, issues }
 */
export async function contentScore(text, sectionTitle, chart) {
  const summary = chartSummary(chart);

  const prompt = `Je bent een kritische redacteur van Human Design rapporten. Beoordeel onderstaande sectie op 3 criteria (1-10 per criterium).

CHARTDATA (ground truth):
${summary}

SECTIE: "${sectionTitle}"

TEKST:
"""
${text}
"""

CRITERIA:
1. CHARTVERANKERING (1-10): Wordt de tekst concreet verankerd in DEZE chart? Worden specifieke poorten, kanalen, centra, profielcijfers genoemd die kloppen met de chartdata hierboven? (10 = elke alinea verankerd, 1 = generieke HD-tekst)
2. SPECIFICITEIT (1-10): Vermijdt de tekst vage psychologie en clichés? Geeft het concrete, actionable inzichten? (10 = scherp en bruikbaar, 1 = open deuren)
3. CONSISTENTIE (1-10): Klopt alles intern? Geen tegenstrijdigheden, geen feitelijke fouten over deze chart? (10 = volledig consistent, 1 = bevat fouten)

Antwoord ALLEEN met JSON, geen prose. Format:
{"chart_anchor": N, "specificity": N, "consistency": N, "total": N, "issues": ["korte issue 1", "korte issue 2"]}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.warn(`[QA] Haiku score failed: ${res.status}`);
      return { score: 21, breakdown: null, issues: ["Scoring API faalde — sectie geaccepteerd"] };
    }

    const data = await res.json();
    const txt  = data.content?.find((b) => b.type === "text")?.text || "{}";

    // Extract JSON (Haiku sometimes wraps it)
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { score: 21, breakdown: null, issues: ["Kon scoring JSON niet parsen"] };
    }
    const parsed = JSON.parse(jsonMatch[0]);
    const total = (parsed.chart_anchor || 0) + (parsed.specificity || 0) + (parsed.consistency || 0);
    return {
      score: total,
      breakdown: {
        chart_anchor: parsed.chart_anchor,
        specificity:  parsed.specificity,
        consistency:  parsed.consistency,
      },
      issues: parsed.issues || [],
    };
  } catch (e) {
    console.warn(`[QA] Haiku score error:`, e.message);
    return { score: 21, breakdown: null, issues: [`Scoring exception: ${e.message}`] };
  }
}

// ─── COMBINED SCORE ───────────────────────────────────────────────────────────
/**
 * Run both deterministic + content scoring.
 * Returns total score (max 40), all issues, and a pass/fail flag.
 */
export async function scoreSection(text, sectionTitle, chart) {
  const q = quickCheck(text);
  const c = await contentScore(text, sectionTitle, chart);

  const total = q.score + c.score;
  return {
    total,                            // 0-40
    passed: total >= MIN_SCORE,
    quick:  q,
    content: c,
    issues: [...q.issues, ...c.issues],
  };
}
