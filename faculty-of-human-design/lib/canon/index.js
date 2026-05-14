// ─── CANON INDEX ──────────────────────────────────────────────────────────────
// Surgical injection of canonical HD reference data into AI prompts,
// based on the chart and the section being generated.
//
// The goal: prevent hallucination by giving Claude verified ground-truth
// for the specific gates/channels/centers/etc. relevant to THIS chart and
// THIS section, while keeping token usage tight.

import { CENTERS, describeCenter } from "./centers.js";
import { CHANNELS, describeChannel } from "./channels.js";
import { describeProfile } from "./profiles.js";
import { describeGate, describeGates } from "./gates.js";
import { describeType, describeAuthority } from "./types.js";

// ─── SECTION → CANON ROUTING ──────────────────────────────────────────────────
/**
 * Returns a ground-truth canon snippet for the given section + chart.
 * Returns null if no canon is applicable for this section.
 *
 * Section matching is fuzzy (lowercase substring match) so that minor
 * title variations across report templates still hit the right canon.
 */
export function getCanonContext(sectionTitle, chart) {
  const t = (sectionTitle || "").toLowerCase();

  // ── Type & Strategy ─────────────────────────────────────────────────────
  if (t.includes("type") && (t.includes("strateg") || t.includes("levens"))) {
    return describeType(chart.type);
  }
  if (t.includes("energetische blauwdruk") || t.includes("essentie")) {
    return [
      describeType(chart.type),
      "",
      `Profiel ${chart.profile}: ${describeProfile(chart.profile) || ""}`,
    ].filter(Boolean).join("\n");
  }

  // ── Authority ───────────────────────────────────────────────────────────
  if (t.includes("autoriteit") || t.includes("beslissingen")) {
    return describeAuthority(chart.auth);
  }

  // ── Profile ─────────────────────────────────────────────────────────────
  if (t.includes("profiel") && !t.includes("partner")) {
    return describeProfile(chart.profile);
  }

  // ── Defined centers ─────────────────────────────────────────────────────
  if (
    t.includes("gedefinieerd") && t.includes("centra")
    || (t.includes("sterke centra") || t.includes("sterke centras"))
  ) {
    const list = (chart.definedCenters || []).slice(0, 9);
    return list.map((c) => describeCenter(c, "defined")).filter(Boolean).join("\n\n");
  }

  // ── Open centers ────────────────────────────────────────────────────────
  if (t.includes("open centra") || t.includes("conditioner") || t.includes("sensitiv")) {
    const list = (chart.openCenters || []).slice(0, 9);
    return list.map((c) => describeCenter(c, "open")).filter(Boolean).join("\n\n");
  }

  // ── Channels ────────────────────────────────────────────────────────────
  if (t.includes("kanaal") || t.includes("kanalen") || t.includes("energiestromen")) {
    const channels = chart.channels || [];
    if (!channels.length) {
      return "Deze chart heeft geen gedefinieerde kanalen. Beschrijf in plaats daarvan de energetische stromingen via de actieve poorten en hoe die werken in een lichaam zonder vaste kanaaldefinitie (typisch voor de Reflector).";
    }
    return channels.map((c) => describeChannel(c.g1, c.g2)).filter(Boolean).join("\n\n");
  }

  // ── Gates ───────────────────────────────────────────────────────────────
  if (t.includes("poort") || t.includes("poorten")) {
    const allGates = chart.allGates || [];
    if (!allGates.length) return null;
    // Limit to ~15 most relevant — pick a balanced selection
    const selected = allGates.slice(0, 15);
    return describeGates(selected);
  }

  // ── Incarnation cross ───────────────────────────────────────────────────
  if (t.includes("inkarnatie") || t.includes("kruis") || t.includes("levensdoel")) {
    if (!chart.cross) return null;
    // Cross is formatted like "1 / 7 / 2 / 13"
    const crossGates = String(chart.cross).split("/").map((s) => parseInt(s.trim())).filter(Boolean);
    if (crossGates.length === 4) {
      const [p1, p2, p3, p4] = crossGates;
      return [
        `Het Inkarnatie-Kruis van deze chart wordt gevormd door vier poorten:`,
        `- Bewuste Zon (Persoonlijkheid): ${describeGate(p1)}`,
        `- Bewuste Aarde (Persoonlijkheid): ${describeGate(p2)}`,
        `- Onbewuste Zon (Design): ${describeGate(p3)}`,
        `- Onbewuste Aarde (Design): ${describeGate(p4)}`,
        ``,
        `Gebruik DEZE namen exact zoals hierboven. Verzin geen alternatieve titels voor het kruis.`,
      ].join("\n");
    }
    return null;
  }

  // ── Relationships ───────────────────────────────────────────────────────
  if (t.includes("relatie") || t.includes("verbinding")) {
    return [
      `Voor relaties in Human Design tellen vier dynamieken:`,
      `1. Elektromagnetische kanalen — één persoon heeft één poort, de ander de andere poort van een kanaal. Sterke aantrekking, leerproces.`,
      `2. Compromiskanalen — beide personen hebben hetzelfde kanaal volledig gedefinieerd. Versterking, soms verzadiging.`,
      `3. Dominantiekanalen — één persoon heeft het kanaal, de ander heeft geen van beide poorten. De gedefinieerde persoon 'kleurt' de ervaring.`,
      `4. Vriendschapsherkenning — beide hebben dezelfde poort. Direct begrip.`,
      ``,
      `Bespreek deze vier alleen voor zover relevant voor DEZE chart.`,
    ].join("\n");
  }

  return null;
}

// ─── CHART SUMMARY (for QA + context) ─────────────────────────────────────────
/**
 * Returns a compact one-paragraph summary of the chart's key facts,
 * used as ground-truth for the quality scoring step and for
 * section interdependence summaries.
 */
export function chartSummary(chart) {
  const parts = [];
  if (chart.type)    parts.push(`Type: ${chart.type}`);
  if (chart.strat)   parts.push(`Strategie: ${chart.strat}`);
  if (chart.auth)    parts.push(`Autoriteit: ${chart.auth}`);
  if (chart.profile) parts.push(`Profiel: ${chart.profile}`);
  if (chart.definedCenters?.length) parts.push(`Gedefinieerd: ${chart.definedCenters.join(", ")}`);
  if (chart.openCenters?.length)    parts.push(`Open: ${chart.openCenters.join(", ")}`);
  if (chart.channels?.length)       parts.push(`Kanalen: ${chart.channels.map((c) => `${c.g1}-${c.g2}`).join(", ")}`);
  if (chart.cross) parts.push(`Kruis: ${chart.cross}`);
  return parts.join(" · ");
}

export { CENTERS, CHANNELS };
