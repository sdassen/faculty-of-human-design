// ─── JSON → TEXT FLATTENING ───────────────────────────────────────────────────
// Converts a structured JSON section back to the labeled-text format that the
// existing quick/content scorers expect. Works for both NL and EN.
export function sectionToText(section, lang = "nl") {
  const isEN = lang === "en";
  const lines = [];

  // In jouw chart / In your chart
  if (Array.isArray(section.inJouwChart) && section.inJouwChart.length) {
    lines.push(isEN ? "In your chart:" : "In jouw chart:");
    section.inJouwChart.forEach(function(item) { lines.push("• " + item); });
    lines.push("");
  }

  // Kern
  if (Array.isArray(section.kern)) {
    section.kern.forEach(function(block) {
      if (block.subkop) lines.push(block.subkop);
      (block.paragraphs || []).forEach(function(p) { lines.push(p); });
      lines.push("");
    });
  }

  // Micro-inzichten (optional)
  if (Array.isArray(section.microInzichten)) {
    section.microInzichten.forEach(function(m) {
      if (m && m.label && m.tekst) {
        lines.push(m.label + ":");
        lines.push(m.tekst);
        lines.push("");
      }
    });
  }

  // Closing blocks
  const closingMap = isEN
    ? { valkuilen: "Pitfalls", praktijk: "Practice", dezeWeek: "This week", reflectievragen: "Reflection questions" }
    : { valkuilen: "Valkuilen", praktijk: "Praktijk", dezeWeek: "Deze week", reflectievragen: "Reflectievragen" };

  ["valkuilen", "praktijk", "dezeWeek", "reflectievragen"].forEach(function(key) {
    const items = section[key];
    if (Array.isArray(items) && items.length) {
      lines.push(closingMap[key] + ":");
      items.forEach(function(item) { lines.push("• " + item); });
      lines.push("");
    }
  });

  return lines.join("\n");
}

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
 * @param {string} text — generated section content
 * @param {string} [lang] — "nl" (default) or "en"
 * Returns { passed: boolean, issues: string[], score: 0-10 }
 */
export function quickCheck(text, lang = "nl", chart = null) {
  const isEN = lang === "en";
  const issues = [];
  let score = 10;

  if (!text || text.trim().length < 400) {
    issues.push(isEN ? "Text too short (<400 chars)" : "Tekst is te kort (<400 chars)");
    score -= 5;
  }

  // Word count cap — too long hurts PDF layout and dilutes quality
  const wordCount = (text || "").trim().split(/\s+/).length;
  if (wordCount > 700) {
    issues.push(isEN
      ? `Section too long: ${wordCount} words (max 700). Trim to core insights.`
      : `Sectie te lang: ${wordCount} woorden (max 700). Reduceer naar kernpunten.`
    );
    score -= 4;  // heavy penalty → triggers retry
  } else if (wordCount > 600) {
    issues.push(isEN
      ? `Section slightly long: ${wordCount} words — aim for under 600.`
      : `Sectie iets te lang: ${wordCount} woorden — streef naar onder 600.`
    );
    score -= 2;
  }

  // Forbidden markdown
  if (/\*{2}/.test(text)) {
    issues.push(isEN ? "Contains ** markdown (bold)" : "Bevat ** markdown (bold)");
    score -= 2;
  }
  if (/^#{1,6}\s/m.test(text)) {
    issues.push(isEN ? "Contains # markdown (heading)" : "Bevat # markdown (heading)");
    score -= 2;
  }

  // u/uw usage (formal Dutch — forbidden for NL only)
  if (!isEN) {
    const uMatches = text.match(/\b[Uu](?:w)?\b/g) || [];
    const realU = uMatches.filter((m) => /^[Uu]w?$/.test(m));
    if (realU.length > 0) {
      issues.push(`Bevat ${realU.length}× formeel "u"/"uw" — moet "je"/"jouw" zijn`);
      score -= 3;
    }
  }

  // inJouwChart is the only required structural block.
  // Closing blocks (valkuilen, praktijk, dezeWeek, reflectievragen) are intentionally
  // optional — structural asymmetry is a design choice, not a quality failure.
  const hasChart = isEN ? /^in your chart:/im.test(text) : /^in jouw chart:/im.test(text);
  if (!hasChart) {
    const chartLbl = isEN ? "In your chart" : "In jouw chart";
    issues.push(isEN
      ? `Missing required block: ${chartLbl}`
      : `Ontbrekend verplicht blok: ${chartLbl}`
    );
    score -= 3;
  }

  // Moon cycle consistency
  if (isEN) {
    if (/28[\s-]or[\s-]29\s*days|28[\s-]to[\s-]29\s*days/i.test(text)) {
      issues.push('Inconsistent moon cycle — must be exactly "28 days"');
      score -= 1;
    }
  } else {
    if (/28[\s-]of[\s-]29\s*dagen|28[\s-]tot[\s-]29\s*dagen/i.test(text)) {
      issues.push('Inconsistente maancyclus — moet exact "28 dagen" zijn');
      score -= 1;
    }
  }

  // ── TYPE CONTAMINATION (P0 — hardest factual error) ──────────────────────────
  // If the chart is known, verify no wrong-type keywords appear in the text.
  // A Generator section must NOT mention Projector, Manifestor, or Reflector.
  // Penalty = -5 per wrong type → always triggers retry.
  if (chart && chart.type) {
    const ct = chart.type.toLowerCase();
    // Build the set of type labels that should NOT appear in this section
    const wrongTypePatterns = [];
    if (ct.includes("generator")) {
      // Both Generator and Manifesting Generator should never say "Projector"
      wrongTypePatterns.push({ rx: /\bprojector\b/i, label: "Projector" });
      // "Manifestor" is also wrong for a (Manifesting) Generator
      wrongTypePatterns.push({ rx: /\bmanifestor\b|\bmanifesteerder\b/i, label: "Manifestor" });
      // Reflector
      wrongTypePatterns.push({ rx: /\breflector\b/i, label: "Reflector" });
    } else if (ct.includes("projector")) {
      wrongTypePatterns.push({ rx: /\bgenerator\b/i, label: "Generator" });
      wrongTypePatterns.push({ rx: /\bmanifestor\b|\bmanifesteerder\b/i, label: "Manifestor" });
      wrongTypePatterns.push({ rx: /\breflector\b/i, label: "Reflector" });
    } else if (ct.includes("manifestor") || ct.includes("manifesteerder")) {
      wrongTypePatterns.push({ rx: /\bgenerator\b/i, label: "Generator" });
      wrongTypePatterns.push({ rx: /\bprojector\b/i, label: "Projector" });
      wrongTypePatterns.push({ rx: /\breflector\b/i, label: "Reflector" });
    } else if (ct.includes("reflector")) {
      wrongTypePatterns.push({ rx: /\bgenerator\b/i, label: "Generator" });
      wrongTypePatterns.push({ rx: /\bprojector\b/i, label: "Projector" });
      wrongTypePatterns.push({ rx: /\bmanifestor\b|\bmanifesteerder\b/i, label: "Manifestor" });
    }
    for (const { rx, label } of wrongTypePatterns) {
      if (rx.test(text)) {
        issues.push(isEN
          ? `CRITICAL: Wrong type "${label}" mentioned — chart is ${chart.type}. Rewrite immediately.`
          : `KRITIEK: Verkeerd type "${label}" in tekst — chart is ${chart.type}. Herschrijf onmiddellijk.`
        );
        score -= 5;
      }
    }
  }

  // ── LOCALE CONTAMINATION (P1) ─────────────────────────────────────────────────
  // NL sections must not contain English block labels, and vice versa.
  if (!isEN) {
    // NL text should not have English block headings
    if (/^in your chart:/im.test(text)) {
      issues.push("Engelse bloktitel 'In your chart:' in NL sectie — rewrite in Dutch");
      score -= 4;
    }
    if (/^(?:pitfalls|practice|this week|reflection questions):/im.test(text)) {
      issues.push("Engelse bloktitels (Pitfalls/Practice/This week/Reflection questions) in NL sectie");
      score -= 4;
    }
    // "Your " as a possessive strongly suggests the AI wrote in English
    if (/\byour\b/i.test(text)) {
      issues.push("Engels bezittelijk 'your' gevonden in NL sectie — tekst is (deels) in het Engels geschreven");
      score -= 3;
    }
  } else {
    // EN text should not have Dutch block headings
    if (/^in jouw chart:/im.test(text)) {
      issues.push("Dutch block label 'In jouw chart:' in EN section — rewrite in English");
      score -= 4;
    }
    if (/^(?:valkuilen|praktijk|deze week|reflectievragen):/im.test(text)) {
      issues.push("Dutch block labels (Valkuilen/Praktijk/Deze week/Reflectievragen) in EN section");
      score -= 4;
    }
  }

  // ── MARKDOWN TABLES (P1) ─────────────────────────────────────────────────────
  // Pipe-character tables break PDF rendering entirely.
  if (/^\|.+\|/m.test(text)) {
    issues.push(isEN
      ? "Contains markdown table (|...|) — PDF cannot render tables. Remove and rewrite as bullets."
      : "Bevat markdown-tabel (|...|) — PDF kan geen tabellen renderen. Verwijder en herschrijf als bullets."
    );
    score -= 5;
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
   AUTOMATISCH 1 als de tekst een verkeerd TYPE, AUTORITEIT of KANAAL noemt dat NIET in de chartdata staat.
2. SPECIFICITEIT (1-10): Vermijdt de tekst vage psychologie en clichés? Geeft het concrete, actionable inzichten? (10 = scherp en bruikbaar, 1 = open deuren)
3. CONSISTENTIE (1-10): Klopt alles intern? Geen tegenstrijdigheden, geen feitelijke fouten over deze chart? (10 = volledig consistent, 1 = bevat fouten)
   AUTOMATISCH 1 als het type (bijv. "Projector") of de autoriteit niet overeenkomt met de chartdata.

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
        model: "claude-3-5-haiku-20241022",
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
 * Accepts either a plain text string or a JSON section object.
 * Returns total score (max 40), all issues, and a pass/fail flag.
 */
export async function scoreSection(textOrSection, sectionTitle, chart, lang = "nl") {
  const text = (typeof textOrSection === "object" && textOrSection !== null)
    ? sectionToText(textOrSection, lang)
    : textOrSection;
  const q = quickCheck(text, lang, chart);  // pass chart for type/locale contamination checks
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
