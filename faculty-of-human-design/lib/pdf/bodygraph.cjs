// ─── BODYGRAPH RENDERER ────────────────────────────────────────────────────────
// CJS build — loaded via createRequire from lib/pdf/index.js (native ESM).
// Converting to .cjs avoids the ESM static-link phase for this file, which
// eliminates any chance of a SyntaxError during module linking.
"use strict";

// ─── COLORS ──────────────────────────────────────────────────────────────────
const COLORS = {
  Head:           "#F2D55C",
  Ajna:           "#7DB46C",
  Throat:         "#876B4A",
  G:              "#E6B547",
  "Heart/Ego":    "#C7392F",
  Spleen:         "#876B4A",
  Sacral:         "#C7392F",
  "Solar Plexus": "#876B4A",
  Root:           "#876B4A",
  stroke:         "#2A2620",
  inactive:       "#FFFFFF",
  gateActive:     "#1A1715",
  gateInactive:   "#A8A29E",
  channelDefined: "#1A1715",
  channelInactive:"#E0DBD3",
};

// ─── CENTER GEOMETRY ─────────────────────────────────────────────────────────
const CENTERS = {
  Head: {
    centroid: [180, 38],
    shape: "triangleDown",
    bounds: { cx: 180, cy: 38, w: 96, h: 56 },
  },
  Ajna: {
    centroid: [180, 110],
    shape: "triangleUp",
    bounds: { cx: 180, cy: 110, w: 96, h: 56 },
  },
  Throat: {
    centroid: [180, 188],
    shape: "rect",
    bounds: { cx: 180, cy: 188, w: 90, h: 56 },
  },
  G: {
    centroid: [180, 268],
    shape: "diamond",
    bounds: { cx: 180, cy: 268, w: 70, h: 70 },
  },
  "Heart/Ego": {
    centroid: [232, 252],
    shape: "triangleLeft",
    bounds: { cx: 232, cy: 252, w: 44, h: 44 },
  },
  Spleen: {
    centroid: [110, 320],
    shape: "triangleRight",
    bounds: { cx: 110, cy: 320, w: 60, h: 80 },
  },
  Sacral: {
    centroid: [180, 348],
    shape: "rect",
    bounds: { cx: 180, cy: 348, w: 90, h: 50 },
  },
  "Solar Plexus": {
    centroid: [250, 320],
    shape: "triangleLeft",
    bounds: { cx: 250, cy: 320, w: 60, h: 80 },
  },
  Root: {
    centroid: [180, 430],
    shape: "rect",
    bounds: { cx: 180, cy: 430, w: 90, h: 50 },
  },
};

// ─── GATE → CENTER LOOKUP ────────────────────────────────────────────────────
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
  47: [148, 138], 24: [165, 138], 4: [180, 138], 17: [195, 138], 43: [148, 84], 11: [212, 138],
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

// ─── SHAPE DRAWERS ────────────────────────────────────────────────────────────
function drawShape(doc, center, x, y, scale, fillColor, isDefined) {
  const { shape, bounds } = center;
  const w = bounds.w * scale;
  const h = bounds.h * scale;
  const cx = bounds.cx * scale + x;
  const cy = bounds.cy * scale + y;

  doc.lineWidth(1.2);
  const fill = isDefined ? fillColor : COLORS.inactive;
  const stroke = COLORS.stroke;

  switch (shape) {
    case "rect": {
      const rx = cx - w / 2;
      const ry = cy - h / 2;
      doc.rect(rx, ry, w, h).fillAndStroke(fill, stroke);
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
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
function drawBodygraph(doc, chart, opts) {
  const { x = 0, y = 0, scale = 1.0 } = opts || {};
  const defined = new Set(chart.definedCenters || []);
  const activeGates = new Set(chart.allGates || []);
  const activeChannels = chart.channels || [];

  doc.save();

  const cw = 360 * scale;
  const ch = 500 * scale;
  doc.rect(x, y, cw, ch).fillOpacity(0).fillAndStroke("#FFFFFF", "#FFFFFF");
  doc.fillOpacity(1);

  doc.lineWidth(2.5);
  for (const ch_ of activeChannels) {
    const c1 = CENTERS[ch_.c1];
    const c2 = CENTERS[ch_.c2];
    if (!c1 || !c2) continue;
    const x1 = c1.centroid[0] * scale + x;
    const y1 = c1.centroid[1] * scale + y;
    const x2 = c2.centroid[0] * scale + x;
    const y2 = c2.centroid[1] * scale + y;
    doc.moveTo(x1, y1).lineTo(x2, y2).stroke(COLORS.channelDefined);
  }
  doc.lineWidth(1);

  for (const [name, center] of Object.entries(CENTERS)) {
    drawShape(doc, center, x, y, scale, COLORS[name], defined.has(name));
  }

  const gateR = 5.5 * scale;
  for (const [gateNum, pos] of Object.entries(GATE_POS)) {
    const isActive = activeGates.has(parseInt(gateNum));
    const gx = pos[0] * scale + x;
    const gy = pos[1] * scale + y;

    doc.circle(gx, gy, gateR)
       .fillAndStroke(isActive ? COLORS.gateActive : COLORS.inactive, COLORS.stroke);

    doc.fontSize(5.5 * scale)
       .fillColor(isActive ? "#FFFFFF" : COLORS.gateActive)
       .font("Helvetica")
       .text(String(gateNum), gx - 5 * scale, gy - 2.4 * scale, {
         width: 10 * scale,
         align: "center",
         lineBreak: false,
       });
  }

  doc.restore();
}

function bodygraphSize(scale) {
  if (scale === undefined) scale = 1.0;
  return { width: 360 * scale, height: 500 * scale };
}

module.exports = { drawBodygraph, bodygraphSize };
