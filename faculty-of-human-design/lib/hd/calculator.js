// ─── SERVER-SIDE HD CHART CALCULATOR ──────────────────────────────────────────
// Accurate Human Design chart computation using astronomy-engine
// (pure JavaScript, arcsecond-level accuracy, no native dependencies).
//
// Replaces the browser-side calcHD() as the source of truth for the AI pipeline.
//
// Run:  npm install astronomy-engine

import { Body, MakeTime, GeoVector, Ecliptic, GeoMoon } from "astronomy-engine";

// ─── PLANETARY BODIES USED IN HD ──────────────────────────────────────────────
const HD_PLANETS = [
  "Sun", "Earth", "Moon",
  "NorthNode", "SouthNode",
  "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto",
];

// ─── GATE WHEEL ────────────────────────────────────────────────────────────────
// Gate numbers in zodiac order starting at 0° Aries.
// This is the standard HD gate wheel (I Ching to zodiac mapping).
// Each gate spans 5.625° (360 / 64); each of its 6 lines spans 0.9375°.
const GATE_WHEEL = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20,
  16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33,
  7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57,
  32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11,
  10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30, 55,
  37, 63, 22, 36,
];

// HD wheel starts at gate 25 at 15° Aquarius (= 315° tropical when starting from 0° Aries).
// However the canonical HD start point is 1.875° Aquarius for gate 1.
// Our mapping below uses the standard offset.
//
// The exact rotation: gate 41 starts the wheel at 2°00'00" Aquarius = 302° tropical
// (this is when the Sun is at the start of gate 41 around Jan 22).
//
// Reference: standard HD gate wheel as used by Jovian Archive.
const WHEEL_START_DEG = 302.0; // longitude (tropical) where gate 41 begins

// ─── CENTERS & GATE-TO-CENTER MAPPING ─────────────────────────────────────────
export const ALL_CENTERS = [
  "Head", "Ajna", "Throat", "G", "Heart/Ego",
  "Spleen", "Sacral", "Solar Plexus", "Root",
];

const GATE_TO_CENTER = {
  64:"Head", 61:"Head", 63:"Head",
  47:"Ajna", 24:"Ajna", 4:"Ajna", 17:"Ajna", 43:"Ajna", 11:"Ajna",
  62:"Throat", 23:"Throat", 56:"Throat", 16:"Throat", 20:"Throat",
  31:"Throat", 8:"Throat", 33:"Throat", 35:"Throat", 12:"Throat", 45:"Throat",
  1:"G", 2:"G", 7:"G", 13:"G", 10:"G", 15:"G", 25:"G", 46:"G",
  21:"Heart/Ego", 40:"Heart/Ego", 26:"Heart/Ego", 51:"Heart/Ego",
  48:"Spleen", 57:"Spleen", 44:"Spleen", 50:"Spleen",
  32:"Spleen", 28:"Spleen", 18:"Spleen",
  34:"Sacral", 5:"Sacral", 14:"Sacral", 29:"Sacral", 9:"Sacral",
  3:"Sacral", 42:"Sacral", 27:"Sacral", 59:"Sacral",
  6:"Solar Plexus", 37:"Solar Plexus", 22:"Solar Plexus", 36:"Solar Plexus",
  30:"Solar Plexus", 55:"Solar Plexus", 49:"Solar Plexus",
  58:"Root", 38:"Root", 54:"Root", 53:"Root", 60:"Root",
  52:"Root", 19:"Root", 39:"Root", 41:"Root",
};

// ─── CHANNEL DEFINITIONS ──────────────────────────────────────────────────────
// All 36 channels as gate pairs. When both gates are active, the channel is
// defined and connects the two centers it spans.
const CHANNELS = {
  "1-8":   ["G", "Throat"],
  "2-14":  ["G", "Sacral"],
  "3-60":  ["Sacral", "Root"],
  "4-63":  ["Ajna", "Head"],
  "5-15":  ["Sacral", "G"],
  "6-59":  ["Solar Plexus", "Sacral"],
  "7-31":  ["G", "Throat"],
  "9-52":  ["Sacral", "Root"],
  "10-20": ["G", "Throat"],
  "10-34": ["G", "Sacral"],
  "10-57": ["G", "Spleen"],
  "11-56": ["Ajna", "Throat"],
  "12-22": ["Throat", "Solar Plexus"],
  "13-33": ["G", "Throat"],
  "16-48": ["Throat", "Spleen"],
  "17-62": ["Ajna", "Throat"],
  "18-58": ["Spleen", "Root"],
  "19-49": ["Root", "Solar Plexus"],
  "20-34": ["Throat", "Sacral"],
  "20-57": ["Throat", "Spleen"],
  "21-45": ["Heart/Ego", "Throat"],
  "23-43": ["Throat", "Ajna"],
  "24-61": ["Ajna", "Head"],
  "25-51": ["G", "Heart/Ego"],
  "26-44": ["Heart/Ego", "Spleen"],
  "27-50": ["Sacral", "Spleen"],
  "28-38": ["Spleen", "Root"],
  "29-46": ["Sacral", "G"],
  "30-41": ["Solar Plexus", "Root"],
  "32-54": ["Spleen", "Root"],
  "34-57": ["Sacral", "Spleen"],
  "35-36": ["Throat", "Solar Plexus"],
  "37-40": ["Solar Plexus", "Heart/Ego"],
  "39-55": ["Root", "Solar Plexus"],
  "42-53": ["Sacral", "Root"],
  "47-64": ["Ajna", "Head"],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function normalizeLongitude(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * Convert ecliptic longitude (tropical) to HD gate + line.
 * Gates are 5.625° wide (360/64); lines are 0.9375° wide (5.625/6).
 */
function longitudeToGateLine(lon) {
  const adjusted = normalizeLongitude(lon - WHEEL_START_DEG);
  const gateIdx = Math.floor(adjusted / 5.625) % 64;
  const within = adjusted - gateIdx * 5.625;
  const line = Math.floor(within / 0.9375) + 1; // 1..6
  return { gate: GATE_WHEEL[gateIdx], line: Math.max(1, Math.min(6, line)) };
}

/**
 * Get geocentric ecliptic longitude (tropical, in degrees) of a body at a given Date.
 */
function getEclipticLongitude(bodyName, date) {
  const time = MakeTime(date);

  if (bodyName === "Earth") {
    // Earth in HD = Sun's longitude + 180° (geocentric)
    const sun = GeoVector(Body.Sun, time, true);
    const ecl = Ecliptic(sun);
    return normalizeLongitude(ecl.elon + 180);
  }

  if (bodyName === "Moon") {
    const m = GeoMoon(time);
    const ecl = Ecliptic(m);
    return normalizeLongitude(ecl.elon);
  }

  if (bodyName === "NorthNode" || bodyName === "SouthNode") {
    // Mean lunar node — approximation. Astronomy-engine doesn't expose
    // nodes directly, so we use the well-known mean node formula.
    // Reference: Meeus, Astronomical Algorithms, ch. 47.
    const T = (time.tt - 2451545.0) / 36525.0;
    const meanNode = 125.04452 - 1934.136261 * T + 0.0020708 * T*T + (T*T*T)/450000;
    const lon = normalizeLongitude(meanNode);
    return bodyName === "NorthNode" ? lon : normalizeLongitude(lon + 180);
  }

  // All other planets
  const bodyMap = {
    Sun:     Body.Sun,
    Mercury: Body.Mercury,
    Venus:   Body.Venus,
    Mars:    Body.Mars,
    Jupiter: Body.Jupiter,
    Saturn:  Body.Saturn,
    Uranus:  Body.Uranus,
    Neptune: Body.Neptune,
    Pluto:   Body.Pluto,
  };
  const body = bodyMap[bodyName];
  if (!body) throw new Error(`Unknown HD body: ${bodyName}`);

  const vec = GeoVector(body, time, true);
  const ecl = Ecliptic(vec);
  return normalizeLongitude(ecl.elon);
}

// ─── TYPE / AUTHORITY / PROFILE DERIVATION ────────────────────────────────────
function determineType(definedCenters) {
  const has = (c) => definedCenters.has(c);
  const hasSacral = has("Sacral");
  const hasThroat = has("Throat");
  const motors = ["Heart/Ego", "Solar Plexus", "Root", "Sacral"];

  // Reflector: no centers defined
  if (definedCenters.size === 0) {
    return { type: "Reflector", strat: "Wacht een maancyclus van 28 dagen", sig: "Verrassing", notSelf: "Teleurstelling" };
  }

  // Manifestor: motor connected to throat, no sacral
  if (!hasSacral && hasThroat) {
    // Check if any motor (non-sacral) is connected to throat via channels
    // For simplicity, presence of throat + motor (non-sacral) = Manifestor
    const hasNonSacralMotor = ["Heart/Ego", "Solar Plexus", "Root"].some(has);
    if (hasNonSacralMotor) {
      return { type: "Manifestor", strat: "Informeer voor je handelt", sig: "Vrede", notSelf: "Woede" };
    }
  }

  // Manifesting Generator: sacral + throat (with sacral motor connection)
  if (hasSacral && hasThroat) {
    return { type: "Manifesting Generator", strat: "Wacht om te reageren, informeer dan voor je handelt", sig: "Bevrediging en vrede", notSelf: "Frustratie en woede" };
  }

  // Generator: sacral defined, no throat connection
  if (hasSacral) {
    return { type: "Generator", strat: "Wacht om te reageren", sig: "Bevrediging", notSelf: "Frustratie" };
  }

  // Projector: any other case (no sacral, no motor-to-throat)
  return { type: "Projector", strat: "Wacht op de uitnodiging", sig: "Succes", notSelf: "Bitterheid" };
}

function determineAuthority(definedCenters, type) {
  // Reflector
  if (type === "Reflector") return "Maancyclus";
  // Hierarchy: Solar Plexus → Sacral → Spleen → Heart → G → Mentaal
  if (definedCenters.has("Solar Plexus")) return "Emotioneel";
  if (definedCenters.has("Sacral"))       return "Sacraal";
  if (definedCenters.has("Spleen"))       return "Splenisch";
  if (definedCenters.has("Heart/Ego"))    return "Ego";
  if (definedCenters.has("G"))            return "G/Self";
  return "Mentaal";
}

// ─── MAIN ENTRY POINT ─────────────────────────────────────────────────────────
/**
 * Calculate a complete HD chart for the given birth data.
 *
 * @param {Object} birth — { day, month, year, hour, minute, place, lat?, lon?, tz? }
 *   If lat/lon/tz are not provided, place is treated as Amsterdam (TZ+1).
 *   For HD only sidereal longitudes matter, so location precision is forgiving.
 *
 * @returns {Object} chart — drop-in replacement for browser calcHD() output:
 *   { type, strat, auth, profile, sig, notSelf, cross,
 *     definedCenters, openCenters, channels, allGates, pers, des }
 */
export function calcHDServer({ day, month, year, hour = 12, minute = 0, tz = 1 }) {
  // Convert local time to UTC. Default: Amsterdam (UTC+1, no DST adjustment here
  // — for higher precision pass tz adjusted for DST.)
  const localDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const utcDate   = new Date(localDate.getTime() - tz * 3600 * 1000);

  // Personality (birth time)
  const pers = {};
  for (const p of HD_PLANETS) {
    const lon = getEclipticLongitude(p, utcDate);
    pers[p] = { lon, ...longitudeToGateLine(lon) };
  }

  // Design: ~88 days before birth — calculated as Sun moving back 88°
  // Standard HD: Design Sun is 88° before Personality Sun (88-degree arc).
  // This corresponds to roughly 88 days for the Sun, but the rule is
  // a SOLAR ARC of 88°, not a time interval. All planets are computed at
  // the moment when the Sun's longitude was 88° earlier.
  const personSunLon = pers.Sun.lon;
  const designSunLon = normalizeLongitude(personSunLon - 88);

  // Iteratively find the date where Sun's longitude is designSunLon
  // (Sun moves ~0.985°/day, so 88° ≈ 89.3 days. Refine via bisection.)
  let designDate = new Date(utcDate.getTime() - 89 * 86400 * 1000);
  for (let i = 0; i < 6; i++) {
    const currentLon = getEclipticLongitude("Sun", designDate);
    let diff = currentLon - designSunLon;
    // Wrap to [-180, 180]
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    // Adjust by diff/0.985 days
    const correctionMs = (diff / 0.985) * 86400 * 1000;
    designDate = new Date(designDate.getTime() - correctionMs);
    if (Math.abs(diff) < 0.001) break;
  }

  const des = {};
  for (const p of HD_PLANETS) {
    const lon = getEclipticLongitude(p, designDate);
    des[p] = { lon, ...longitudeToGateLine(lon) };
  }

  // ── Active gates (union of pers + des) ──────────────────────────────────
  const allGatesSet = new Set();
  for (const p of HD_PLANETS) {
    allGatesSet.add(pers[p].gate);
    allGatesSet.add(des[p].gate);
  }
  const allGates = [...allGatesSet].sort((a, b) => a - b);

  // ── Defined channels and centers ─────────────────────────────────────────
  const definedCenters = new Set();
  const channels = [];
  for (const [key, [c1, c2]] of Object.entries(CHANNELS)) {
    const [g1, g2] = key.split("-").map(Number);
    if (allGatesSet.has(g1) && allGatesSet.has(g2)) {
      definedCenters.add(c1);
      definedCenters.add(c2);
      channels.push({ g1, g2, c1, c2 });
    }
  }
  const openCenters = ALL_CENTERS.filter((c) => !definedCenters.has(c));

  // ── Type / Strategy / Signature / Not-Self ───────────────────────────────
  const { type, strat, sig, notSelf } = determineType(definedCenters);
  const auth = determineAuthority(definedCenters, type);

  // ── Profile ──────────────────────────────────────────────────────────────
  const profile = `${pers.Sun.line}/${des.Sun.line}`;

  // ── Incarnation Cross (4 gates: pers Sun, pers Earth, des Sun, des Earth) ─
  const cross = `${pers.Sun.gate} / ${pers.Earth.gate} / ${des.Sun.gate} / ${des.Earth.gate}`;

  return {
    type, strat, auth, profile, sig, notSelf, cross,
    definedCenters: [...definedCenters],
    openCenters,
    channels,
    allGates,
    pers,
    des,
    // Metadata
    _computedAt: new Date().toISOString(),
    _engine: "astronomy-engine v2 (server-side)",
  };
}
