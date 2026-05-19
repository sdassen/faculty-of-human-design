// ─── BODYGRAPH RENDERER ────────────────────────────────────────────────────────
// CJS build — loaded via createRequire from lib/pdf/index.js (native ESM).
"use strict";

const { FONT } = require("./fonts.cjs");

// ─── CENTER COLORS ────────────────────────────────────────────────────────────
// Each center has a distinct defined/active color (traditional HD palette, refined).
const CENTER_COLORS = {
  Head:           "#5A7FA8",  // slate-blue   — pressure / inspiration
  Ajna:           "#4A8A68",  // teal-green   — awareness / certainty
  Throat:         "#A06840",  // amber-brown  — manifestation / expression
  G:              "#C49830",  // deep gold    — identity / love / direction
  "Heart/Ego":    "#B03838",  // deep red     — willpower / ego
  Spleen:         "#6A9A50",  // forest-green — intuition / survival / health
  Sacral:         "#B84838",  // red-orange   — life force / sexuality
  "Solar Plexus": "#7050A0",  // purple       — emotion / spirit
  Root:           "#705038",  // dark sienna  — pressure / adrenaline
};

// Dutch abbreviations for center labels (short enough to fit in shape)
const CENTER_LABEL = {
  Head:           "Hoofd",
  Ajna:           "Ajna",
  Throat:         "Keel",
  G:              "G",
  "Heart/Ego":    "Hart",
  Spleen:         "Milt",
  Sacral:         "Sacraal",
  "Solar Plexus": "Zon",
  Root:           "Wortel",
};

const STROKE_COLOR    = "#2A2620";
const INACTIVE_FILL   = "#FFFFFF";
const INACTIVE_STROKE = "#C8C0B8";
const CHANNEL_DEFINED = "#2A2620";
const CHANNEL_FAINT   = "#E8E2DA";   // inactive / possible channels
const GATE_ACTIVE_BG  = "#1A1715";
const GATE_ACTIVE_FG  = "#FFFFFF";
const GATE_INACTIVE_BG = "#F4F0EB";
const GATE_INACTIVE_FG = "#9A948E";

// ─── CENTER GEOMETRY ─────────────────────────────────────────────────────────
const CENTERS = {
  Head: {
    centroid: [180, 38],
    shape: "triangleDown",
    bounds: { cx: 180, cy: 38, w: 96, h: 56 },
    labelOff: [0, 6],    // offset from centroid for label
  },
  Ajna: {
    centroid: [180, 110],
    shape: "triangleUp",
    bounds: { cx: 180, cy: 110, w: 96, h: 56 },
    labelOff: [0, -4],
  },
  Throat: {
    centroid: [180, 188],
    shape: "rect",
    bounds: { cx: 180, cy: 188, w: 90, h: 56 },
    labelOff: [0, 0],
  },
  G: {
    centroid: [180, 268],
    shape: "diamond",
    bounds: { cx: 180, cy: 268, w: 70, h: 70 },
    labelOff: [0, 0],
  },
  "Heart/Ego": {
    centroid: [232, 252],
    shape: "triangleLeft",
    bounds: { cx: 232, cy: 252, w: 44, h: 44 },
    labelOff: [6, 0],
  },
  Spleen: {
    centroid: [110, 320],
    shape: "triangleRight",
    bounds: { cx: 110, cy: 320, w: 60, h: 80 },
    labelOff: [-6, 0],
  },
  Sacral: {
    centroid: [180, 348],
    shape: "rect",
    bounds: { cx: 180, cy: 348, w: 90, h: 50 },
    labelOff: [0, 0],
  },
  "Solar Plexus": {
    centroid: [250, 320],
    shape: "triangleLeft",
    bounds: { cx: 250, cy: 320, w: 60, h: 80 },
    labelOff: [8, 0],
  },
  Root: {
    centroid: [180, 430],
    shape: "rect",
    bounds: { cx: 180, cy: 430, w: 90, h: 50 },
    labelOff: [0, 0],
  },
};

// ─── GATE → CENTER LOOKUP ─────────────────────────────────────────────────────
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

// ─── GATE POSITIONS ───────────────────────────────────────────────────────────
const GATE_POS = {
  64: [148, 14], 61: [180, 8],  63: [212, 14],
  47: [148, 88], 24: [165, 84], 4: [180, 82],  17: [195, 84], 43: [148, 94], 11: [212, 88],
  62: [142, 168], 23: [157, 162], 56: [172, 162], 16: [187, 162], 20: [202, 162],
  31: [218, 168], 8: [142, 213], 33: [157, 220], 35: [172, 220], 12: [187, 220], 45: [218, 213],
  7:  [180, 238],  1:  [165, 248], 13: [195, 248],
  10: [180, 298],  25: [165, 288], 46: [195, 288],
  2:  [148, 268],  15: [212, 268],
  21: [222, 236], 51: [222, 268], 40: [248, 252], 26: [232, 240],
  48: [85,  286], 57: [85,  306], 44: [85,  326], 50: [85,  346],
  32: [136, 296], 28: [136, 316], 18: [136, 336],
  34: [148, 332], 5: [165, 326],  14: [180, 326], 29: [195, 326], 9: [212, 332],
  3:  [148, 368], 42: [180, 372], 27: [212, 368], 59: [195, 372],
  6:  [225, 286], 37: [225, 306], 22: [225, 326], 36: [225, 346],
  30: [275, 296], 55: [275, 316], 49: [275, 336],
  58: [142, 412], 38: [157, 408], 54: [172, 408], 53: [187, 408], 60: [202, 408],
  52: [218, 412], 19: [157, 452], 39: [180, 452], 41: [218, 452],
};

// ─── ALL 32 CHANNELS (gate pairs) ────────────────────────────────────────────
// Used to draw faint inactive channel background lines.
const ALL_CHANNELS = [
  [64,47],[61,24],[63,4],[17,62],[43,23],[11,56],
  [20,57],[10,20],[34,20],[16,48],[16,35],
  [1,8],[13,33],[7,31],[2,14],[46,29],[15,5],
  [25,51],[26,44],[21,45],[40,37],
  [18,58],[48,16],[57,34],[44,26],[50,27],[32,54],[28,38],
  [34,57],[5,15],[14,2],[29,46],[9,3],[42,53],[27,50],[59,6],
  [6,37],[22,12],[36,35],[30,41],[55,39],[49,19],
  [58,38],[38,28],[54,32],[53,42],[60,3],[52,9],
  [19,49],[39,55],[41,30],
];

// ─── SHAPE DRAWER ─────────────────────────────────────────────────────────────
function drawShape(doc, center, ox, oy, scale, fillColor, isDefined) {
  const { shape, bounds } = center;
  const w  = bounds.w * scale;
  const h  = bounds.h * scale;
  const cx = bounds.cx * scale + ox;
  const cy = bounds.cy * scale + oy;

  const fill   = isDefined ? fillColor : INACTIVE_FILL;
  const stroke = isDefined ? STROKE_COLOR : INACTIVE_STROKE;

  doc.save();
  doc.lineWidth(isDefined ? 1.4 : 0.8);

  switch (shape) {
    case "rect": {
      doc.rect(cx - w / 2, cy - h / 2, w, h).fillAndStroke(fill, stroke);
      break;
    }
    case "diamond": {
      doc.moveTo(cx, cy - h / 2)
         .lineTo(cx + w / 2, cy)
         .lineTo(cx, cy + h / 2)
         .lineTo(cx - w / 2, cy)
         .closePath()
         .fillAndStroke(fill, stroke);
      break;
    }
    case "triangleDown": {
      doc.moveTo(cx - w / 2, cy - h / 2)
         .lineTo(cx + w / 2, cy - h / 2)
         .lineTo(cx, cy + h / 2)
         .closePath()
         .fillAndStroke(fill, stroke);
      break;
    }
    case "triangleUp": {
      doc.moveTo(cx, cy - h / 2)
         .lineTo(cx + w / 2, cy + h / 2)
         .lineTo(cx - w / 2, cy + h / 2)
         .closePath()
         .fillAndStroke(fill, stroke);
      break;
    }
    case "triangleLeft": {
      doc.moveTo(cx - w / 2, cy)
         .lineTo(cx + w / 2, cy - h / 2)
         .lineTo(cx + w / 2, cy + h / 2)
         .closePath()
         .fillAndStroke(fill, stroke);
      break;
    }
    case "triangleRight": {
      doc.moveTo(cx + w / 2, cy)
         .lineTo(cx - w / 2, cy - h / 2)
         .lineTo(cx - w / 2, cy + h / 2)
         .closePath()
         .fillAndStroke(fill, stroke);
      break;
    }
  }
  doc.restore();
}

// ─── CENTER LABEL ─────────────────────────────────────────────────────────────
function drawCenterLabel(doc, name, center, ox, oy, scale, isDefined) {
  const { bounds, labelOff } = center;
  const cx  = bounds.cx  * scale + ox + (labelOff[0] * scale);
  const cy  = bounds.cy  * scale + oy + (labelOff[1] * scale);
  const fs  = Math.max(5, 6.5 * scale);
  const lbl = CENTER_LABEL[name] || name;
  const lw  = fs * lbl.length * 0.55; // approximate text width
  const fg  = isDefined ? "#FFFFFF" : "#B0A8A0";

  doc.save();
  doc.font(FONT.bodyLight).fontSize(fs).fillColor(fg)
    .text(lbl, cx - lw / 2, cy - fs / 2, {
      width: lw + 2,
      align: "center",
      lineBreak: false,
    });
  doc.restore();
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
function drawBodygraph(doc, chart, opts) {
  const { x = 0, y = 0, scale = 1.0 } = opts || {};
  const defined      = new Set(chart.definedCenters || []);
  const activeGates  = new Set((chart.allGates || []).map(Number));
  const activeChans  = chart.channels || [];

  // Build a set of active gate-pairs for the faint-channel pass 1 exclusion.
  // A pair is "defined" if both its gates appear in activeGates.
  const definedChanSet = new Set(
    ALL_CHANNELS
      .filter(function(pair) { return activeGates.has(pair[0]) && activeGates.has(pair[1]); })
      .map(function(pair)    { return pair.slice().sort(function(a,b){return a-b;}).join("-"); })
  );

  doc.save();

  // ── White canvas (transparent)
  const cw = 360 * scale;
  const ch = 500 * scale;
  doc.rect(x, y, cw, ch).fill("#FFFFFF");

  // ── Pass 1: inactive channel lines (faint background grid)
  doc.save();
  doc.lineWidth(1.5 * scale).strokeColor(CHANNEL_FAINT).strokeOpacity(1);
  for (const pair of ALL_CHANNELS) {
    const p1 = GATE_POS[pair[0]];
    const p2 = GATE_POS[pair[1]];
    if (!p1 || !p2) continue;
    const key = [pair[0], pair[1]].slice().sort(function(a,b){return a-b;}).join("-");
    if (definedChanSet.has(key)) continue; // skip — drawn in pass 2
    const x1 = p1[0] * scale + x;
    const y1 = p1[1] * scale + y;
    const x2 = p2[0] * scale + x;
    const y2 = p2[1] * scale + y;
    doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
  }
  doc.restore();

  // ── Pass 2: defined channel lines (dark, prominent)
  // Strategy A: if both gates of a known pair are active → draw between gate positions.
  // Strategy B: fallback using ch.c1/ch.c2 centroids for any channel not matched by A.
  const drawnChannels = new Set();
  doc.save();
  doc.lineWidth(3 * scale).strokeColor(CHANNEL_DEFINED);

  // Strategy A — gate-position based (most accurate visually)
  for (const pair of ALL_CHANNELS) {
    if (activeGates.has(pair[0]) && activeGates.has(pair[1])) {
      const p1 = GATE_POS[pair[0]];
      const p2 = GATE_POS[pair[1]];
      if (!p1 || !p2) continue;
      doc.moveTo(p1[0] * scale + x, p1[1] * scale + y)
         .lineTo(p2[0] * scale + x, p2[1] * scale + y)
         .stroke();
      // Mark both center-pairs as drawn
      const ca = GATE_TO_CENTER[pair[0]];
      const cb = GATE_TO_CENTER[pair[1]];
      if (ca && cb) drawnChannels.add([ca, cb].sort().join("-"));
    }
  }

  // Strategy B — centroid fallback for any channel the API provides but gates didn't match
  for (const ch_ of activeChans) {
    if (!ch_.c1 || !ch_.c2) continue;
    const key = [ch_.c1, ch_.c2].sort().join("-");
    if (drawnChannels.has(key)) continue; // already drawn above
    const c1 = CENTERS[ch_.c1];
    const c2 = CENTERS[ch_.c2];
    if (!c1 || !c2) continue;
    doc.moveTo(c1.centroid[0] * scale + x, c1.centroid[1] * scale + y)
       .lineTo(c2.centroid[0] * scale + x, c2.centroid[1] * scale + y)
       .stroke();
  }

  doc.restore();

  // ── Pass 3: draw all center shapes
  for (const [name, center] of Object.entries(CENTERS)) {
    const isDefined = defined.has(name);
    drawShape(doc, center, x, y, scale, CENTER_COLORS[name] || "#876B4A", isDefined);
  }

  // ── Pass 4: center name labels (drawn on top of shapes)
  for (const [name, center] of Object.entries(CENTERS)) {
    drawCenterLabel(doc, name, center, x, y, scale, defined.has(name));
  }

  // ── Pass 5: gate dots with numbers
  const gateR = 5.5 * scale;
  for (const [gateNum, pos] of Object.entries(GATE_POS)) {
    const num      = parseInt(gateNum);
    const isActive = activeGates.has(num);
    const gx = pos[0] * scale + x;
    const gy = pos[1] * scale + y;

    doc.save();
    doc.circle(gx, gy, gateR)
       .fillAndStroke(
         isActive ? GATE_ACTIVE_BG : GATE_INACTIVE_BG,
         isActive ? STROKE_COLOR   : INACTIVE_STROKE
       );

    const fs = Math.max(4.5, 5.5 * scale);
    doc.font(FONT.body).fontSize(fs)
       .fillColor(isActive ? GATE_ACTIVE_FG : GATE_INACTIVE_FG)
       .text(String(gateNum), gx - gateR, gy - fs / 2, {
         width: gateR * 2,
         align: "center",
         lineBreak: false,
       });
    doc.restore();
  }

  doc.restore();
}

function bodygraphSize(scale) {
  if (scale === undefined) scale = 1.0;
  return { width: 360 * scale, height: 500 * scale };
}

module.exports = { drawBodygraph, bodygraphSize };
