// ─── BODYGRAPH RENDERER ────────────────────────────────────────────────────────
// Pure PDFKit drawing of the Human Design bodygraph chart.
// No SVG, no external dependencies — uses PDFKit's native path API.
//
// Layout follows the canonical HD bodygraph conventions:
//
//             [Head] (triangle ▽)
//                │
//             [Ajna] (triangle △)
//                │
//            [Throat] (square)
//             ╱   ╲
//          [G]   [Heart]
//          ╱│╲    │
//   [Spleen]│[Sacral][Solar Plexus]
//          ╲│╱
//            │
//           [Root]
//
// Standard HD colors per center.

// ─── COLORS ──────────────────────────────────────────────────────────────────
const COLORS = {
  Head:           "#F2D55C",  // yellow
  Ajna:           "#7DB46C",  // green
  Throat:         "#876B4A",  // brown
  G:              "#E6B547",  // gold (diamond)
  "Heart/Ego":    "#C7392F",  // red
  Spleen:         "#876B4A",  // brown
  Sacral:         "#C7392F",  // red
  "Solar Plexus": "#876B4A",  // brown
  Root:           "#876B4A",  // brown
  stroke:         "#2A2620",
  inactive:       "#FFFFFF",
  gateActive:     "#1A1715",
  gateInactive:   "#A8A29E",
  channelDefined: "#1A1715",
  channelInactive:"#E0DBD3",
};

// ─── CENTER GEOMETRY ─────────────────────────────────────────────────────────
// All coordinates relative to a 360×500 canvas. Caller scales/translates.
// Each center has a `shape` function that returns the path points and a `centroid`
// for channel line endpoints.

const CENTERS = {
  Head: {
    centroid: [180, 38],
    shape: "triangleDown",          // △ pointing down
    bounds: { cx: 180, cy: 38, w: 96, h: 56 },
  },
  Ajna: {
    centroid: [180, 110],
    shape: "triangleUp",            // ▽ pointing up
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
  // Head
  64:"Head", 61:"Head", 63:"Head",
  // Ajna
  47:"Ajna", 24:"Ajna", 4:"Ajna", 17:"Ajna", 43:"Ajna", 11:"Ajna",
  // Throat
  62:"Throat", 23:"Throat", 56:"Throat", 16:"Throat", 20:"Throat",
  31:"Throat", 8:"Throat", 33:"Throat", 35:"Throat", 12:"Throat", 45:"Throat",
  // G
  1:"G", 2:"G", 7:"G", 13:"G", 10:"G", 15:"G", 25:"G", 46:"G",
  // Heart
  21:"Heart/Ego", 40:"Heart/Ego", 26:"Heart/Ego", 51:"Heart/Ego",
  // Spleen
  48:"Spleen", 57:"Spleen", 44:"Spleen", 50:"Spleen",
  32:"Spleen", 28:"Spleen", 18:"Spleen",
  // Sacral
  34:"Sacral", 5:"Sacral", 14:"Sacral", 29:"Sacral", 9:"Sacral",
  3:"Sacral", 42:"Sacral", 27:"Sacral", 59:"Sacral",
  // Solar Plexus
  6:"Solar Plexus", 37:"Solar Plexus", 22:"Solar Plexus", 36:"Solar Plexus",
  30:"Solar Plexus", 55:"Solar Plexus", 49:"Solar Plexus",
  // Root
  58:"Root", 38:"Root", 54:"Root", 53:"Root", 60:"Root",
  52:"Root", 19:"Root", 39:"Root", 41:"Root",
};

// ─── GATE POSITIONS ───────────────────────────────────────────────────────────
// Position of each gate dot on/around its parent center, in canvas coordinates.
// Positions are arranged around the perimeter of each center for legibility.
const GATE_POS = {
  // Head (triangle ▽, base at top)
  64: [148, 14], 61: [180, 8],  63: [212, 14],
  // Ajna (triangle △, base at bottom)
  47: [148, 138], 24: [165, 138], 4: [180, 138], 17: [195, 138], 43: [148, 84], 11: [212, 138],
  // Throat (rectangle)
  62: [142, 168], 23: [157, 162], 56: [172, 162], 16: [187, 162], 20: [202, 162],
  31: [218, 168], 8: [142, 213], 33: [157, 220], 35: [172, 220], 12: [187, 220], 45: [218, 213],
  // G (diamond)
  7:  [180, 238],  1:  [165, 248], 13: [195, 248],
  10: [180, 298],  25: [165, 288], 46: [195, 288],
  2:  [148, 268],  15: [212, 268],
  // Heart/Ego (small triangle)
  21: [222, 236], 51: [222, 268], 40: [248, 252], 26: [232, 240],
  // Spleen (triangle pointing right)
  48: [85,  286], 57: [85,  306], 44: [85,  326], 50: [85,  346],
  32: [136, 296], 28: [136, 316], 18: [136, 336],
  // Sacral (rectangle)
  34: [148, 332], 5: [165, 326],  14: [180, 326], 29: [195, 326], 9: [212, 332],
  3:  [148, 368], 42: [180, 372], 27: [212, 368], 59: [195, 372],
  // Solar Plexus (triangle pointing left)
  6:  [225, 286], 37: [225, 306], 22: [225, 326], 36: [225, 346],
  30: [275, 296], 55: [275, 316], 49: [275, 336],
  // Root (rectangle)
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
      // ▽ apex at bottom
      doc.moveTo(cx - w / 2, cy - h / 2)
         .lineTo(cx + w / 2, cy - h / 2)
         .lineTo(cx, cy + h / 2)
         .closePath()
         .fillAndStroke(fill, stroke);
      break;
    }
    case "triangleUp": {
      // △ apex at top
      doc.moveTo(cx, cy - h / 2)
         .lineTo(cx + w / 2, cy + h / 2)
         .lineTo(cx - w / 2, cy + h / 2)
         .closePath()
         .fillAndStroke(fill, stroke);
      break;
    }
    case "triangleLeft": {
      // ◁ apex pointing left
      doc.moveTo(cx - w / 2, cy)
         .lineTo(cx + w / 2, cy - h / 2)
         .lineTo(cx + w / 2, cy + h / 2)
         .closePath()
         .fillAndStroke(fill, stroke);
      break;
    }
    case "triangleRight": {
      // ▷ apex pointing right
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
/**
 * Draw a Human Design bodygraph at (x,y) with a scaling factor.
 *
 * @param {PDFDocument} doc       — PDFKit document instance
 * @param {Object}      chart     — chart data: definedCenters, openCenters, channels, allGates
 * @param {Object}      opts      — { x, y, scale }
 *   x, y    — top-left of the bodygraph (in PDF points)
 *   scale   — 0.5 = half size, 1.0 = full 360×500 px canvas. Default 1.0.
 */
export function drawBodygraph(doc, chart, { x = 0, y = 0, scale = 1.0 } = {}) {
  const defined = new Set(chart.definedCenters || []);
  const activeGates = new Set(chart.allGates || []);
  const activeChannels = chart.channels || [];

  doc.save();

  // ── Background ──────────────────────────────────────────────────────────
  const cw = 360 * scale;
  const ch = 500 * scale;
  doc.rect(x, y, cw, ch).fillOpacity(0).fillAndStroke("#FFFFFF", "#FFFFFF");
  doc.fillOpacity(1);

  // ── Channels (drawn behind centers) ────────────────────────────────────
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

  // ── Centers ─────────────────────────────────────────────────────────────
  for (const [name, center] of Object.entries(CENTERS)) {
    drawShape(doc, center, x, y, scale, COLORS[name], defined.has(name));
  }

  // ── Gates (numbered dots) ───────────────────────────────────────────────
  const gateR = 5.5 * scale;
  for (const [gateNum, pos] of Object.entries(GATE_POS)) {
    const isActive = activeGates.has(parseInt(gateNum));
    const gx = pos[0] * scale + x;
    const gy = pos[1] * scale + y;

    doc.circle(gx, gy, gateR)
       .fillAndStroke(isActive ? COLORS.gateActive : COLORS.inactive, COLORS.stroke);

    // Gate number label (white on active, dark on inactive)
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

/**
 * Get the canvas dimensions for a given scale.
 */
export function bodygraphSize(scale = 1.0) {
  return { width: 360 * scale, height: 500 * scale };
}
