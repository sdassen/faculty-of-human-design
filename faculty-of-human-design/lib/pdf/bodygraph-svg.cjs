// ─── BODYGRAPH SVG GENERATOR ──────────────────────────────────────────────────
// Converts the bodygraph chart data into a pure SVG string.
// Mirrors the geometry of bodygraph.cjs but outputs SVG instead of PDFKit calls.
// Embed the returned string directly into HTML for Puppeteer rendering.
"use strict";

const CENTER_COLORS = {
  Head:           "#5A7FA8",
  Ajna:           "#4A8A68",
  Throat:         "#A06840",
  G:              "#C49830",
  "Heart/Ego":    "#B03838",
  Spleen:         "#6A9A50",
  Sacral:         "#B84838",
  "Solar Plexus": "#7050A0",
  Root:           "#705038",
};

const CENTER_LABEL = {
  Head: "Hoofd", Ajna: "Ajna", Throat: "Keel", G: "G",
  "Heart/Ego": "Hart", Spleen: "Milt", Sacral: "Sacraal",
  "Solar Plexus": "Zon", Root: "Wortel",
};

const CENTERS = {
  Head:          { centroid: [180,  38], shape: "triangleDown", bounds: { cx: 180, cy:  38, w: 96, h: 56 }, labelOff: [0,  6] },
  Ajna:          { centroid: [180, 110], shape: "triangleUp",   bounds: { cx: 180, cy: 110, w: 96, h: 56 }, labelOff: [0, -4] },
  Throat:        { centroid: [180, 188], shape: "rect",         bounds: { cx: 180, cy: 188, w: 90, h: 56 }, labelOff: [0,  0] },
  G:             { centroid: [180, 268], shape: "diamond",      bounds: { cx: 180, cy: 268, w: 70, h: 70 }, labelOff: [0,  0] },
  "Heart/Ego":   { centroid: [232, 252], shape: "triangleLeft", bounds: { cx: 232, cy: 252, w: 44, h: 44 }, labelOff: [6,  0] },
  Spleen:        { centroid: [110, 320], shape: "triangleRight",bounds: { cx: 110, cy: 320, w: 60, h: 80 }, labelOff: [-6, 0] },
  Sacral:        { centroid: [180, 348], shape: "rect",         bounds: { cx: 180, cy: 348, w: 90, h: 50 }, labelOff: [0,  0] },
  "Solar Plexus":{ centroid: [250, 320], shape: "triangleLeft", bounds: { cx: 250, cy: 320, w: 60, h: 80 }, labelOff: [8,  0] },
  Root:          { centroid: [180, 430], shape: "rect",         bounds: { cx: 180, cy: 430, w: 90, h: 50 }, labelOff: [0,  0] },
};

const GATE_TO_CENTER = {
  64:"Head",61:"Head",63:"Head",
  47:"Ajna",24:"Ajna",4:"Ajna",17:"Ajna",43:"Ajna",11:"Ajna",
  62:"Throat",23:"Throat",56:"Throat",16:"Throat",20:"Throat",
  31:"Throat",8:"Throat",33:"Throat",35:"Throat",12:"Throat",45:"Throat",
  1:"G",2:"G",7:"G",13:"G",10:"G",15:"G",25:"G",46:"G",
  21:"Heart/Ego",40:"Heart/Ego",26:"Heart/Ego",51:"Heart/Ego",
  48:"Spleen",57:"Spleen",44:"Spleen",50:"Spleen",32:"Spleen",28:"Spleen",18:"Spleen",
  34:"Sacral",5:"Sacral",14:"Sacral",29:"Sacral",9:"Sacral",3:"Sacral",42:"Sacral",27:"Sacral",59:"Sacral",
  6:"Solar Plexus",37:"Solar Plexus",22:"Solar Plexus",36:"Solar Plexus",30:"Solar Plexus",55:"Solar Plexus",49:"Solar Plexus",
  58:"Root",38:"Root",54:"Root",53:"Root",60:"Root",52:"Root",19:"Root",39:"Root",41:"Root",
};

const GATE_POS = {
  64:[148,14],61:[180,8],63:[212,14],
  47:[148,88],24:[165,84],4:[180,82],17:[195,84],43:[148,94],11:[212,88],
  62:[142,168],23:[157,162],56:[172,162],16:[187,162],20:[202,162],
  31:[218,168],8:[142,213],33:[157,220],35:[172,220],12:[187,220],45:[218,213],
  7:[180,238],1:[165,248],13:[195,248],
  10:[180,298],25:[165,288],46:[195,288],
  2:[148,268],15:[212,268],
  21:[222,236],51:[222,268],40:[248,252],26:[232,240],
  48:[85,286],57:[85,306],44:[85,326],50:[85,346],
  32:[136,296],28:[136,316],18:[136,336],
  34:[148,332],5:[165,326],14:[180,326],29:[195,326],9:[212,332],
  3:[148,368],42:[180,372],27:[212,368],59:[195,372],
  6:[225,286],37:[225,306],22:[225,326],36:[225,346],
  30:[275,296],55:[275,316],49:[275,336],
  58:[142,412],38:[157,408],54:[172,408],53:[187,408],60:[202,408],
  52:[218,412],19:[157,452],39:[180,452],41:[218,452],
};

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

// ─── SHAPE HELPERS ────────────────────────────────────────────────────────────
function shapeEl(center, fill, stroke, sw) {
  const { shape, bounds } = center;
  const { cx, cy, w, h } = bounds;
  const f = `fill="${fill}" stroke="${stroke}" stroke-width="${sw}"`;

  switch (shape) {
    case "rect":
      return `<rect x="${cx - w/2}" y="${cy - h/2}" width="${w}" height="${h}" ${f}/>`;
    case "diamond":
      return `<polygon points="${cx},${cy-h/2} ${cx+w/2},${cy} ${cx},${cy+h/2} ${cx-w/2},${cy}" ${f}/>`;
    case "triangleDown":
      return `<polygon points="${cx-w/2},${cy-h/2} ${cx+w/2},${cy-h/2} ${cx},${cy+h/2}" ${f}/>`;
    case "triangleUp":
      return `<polygon points="${cx},${cy-h/2} ${cx+w/2},${cy+h/2} ${cx-w/2},${cy+h/2}" ${f}/>`;
    case "triangleLeft":
      return `<polygon points="${cx-w/2},${cy} ${cx+w/2},${cy-h/2} ${cx+w/2},${cy+h/2}" ${f}/>`;
    case "triangleRight":
      return `<polygon points="${cx+w/2},${cy} ${cx-w/2},${cy-h/2} ${cx-w/2},${cy+h/2}" ${f}/>`;
    default:
      return `<rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" ${f}/>`;
  }
}

// ─── PUBLIC: bodygraphSVG(chart) → SVG string ─────────────────────────────────
function bodygraphSVG(chart) {
  const defined     = new Set(chart.definedCenters || []);
  const activeGates = new Set((chart.allGates || []).map(Number));
  const activeChans = chart.channels || [];

  const definedChanSet = new Set(
    ALL_CHANNELS
      .filter(function(p) { return activeGates.has(p[0]) && activeGates.has(p[1]); })
      .map(function(p) { return p.slice().sort(function(a,b){return a-b;}).join("-"); })
  );

  const parts = [];

  // Background
  parts.push('<rect width="360" height="500" fill="#FFFFFF"/>');

  // Pass 1: inactive channel lines
  parts.push('<g stroke="#E8E2DA" stroke-width="1.5" stroke-linecap="round">');
  for (const pair of ALL_CHANNELS) {
    const key = pair.slice().sort(function(a,b){return a-b;}).join("-");
    if (definedChanSet.has(key)) continue;
    const p1 = GATE_POS[pair[0]];
    const p2 = GATE_POS[pair[1]];
    if (!p1 || !p2) continue;
    parts.push(`<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}"/>`);
  }
  parts.push("</g>");

  // Pass 2: defined channel lines
  const drawnChannels = new Set();
  parts.push('<g stroke="#2A2620" stroke-width="3" stroke-linecap="round">');
  for (const pair of ALL_CHANNELS) {
    if (activeGates.has(pair[0]) && activeGates.has(pair[1])) {
      const p1 = GATE_POS[pair[0]];
      const p2 = GATE_POS[pair[1]];
      if (!p1 || !p2) continue;
      parts.push(`<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}"/>`);
      const ca = GATE_TO_CENTER[pair[0]];
      const cb = GATE_TO_CENTER[pair[1]];
      if (ca && cb) drawnChannels.add([ca, cb].sort().join("-"));
    }
  }
  // Centroid fallback for chart channels not matched above
  for (const ch of activeChans) {
    if (!ch.c1 || !ch.c2) continue;
    const key = [ch.c1, ch.c2].sort().join("-");
    if (drawnChannels.has(key)) continue;
    const c1 = CENTERS[ch.c1];
    const c2 = CENTERS[ch.c2];
    if (!c1 || !c2) continue;
    parts.push(`<line x1="${c1.centroid[0]}" y1="${c1.centroid[1]}" x2="${c2.centroid[0]}" y2="${c2.centroid[1]}"/>`);
  }
  parts.push("</g>");

  // Pass 3: center shapes
  for (const [name, center] of Object.entries(CENTERS)) {
    const isDefined = defined.has(name);
    const fill   = isDefined ? CENTER_COLORS[name] : "#FFFFFF";
    const stroke = isDefined ? "#2A2620" : "#C8C0B8";
    const sw     = isDefined ? 1.4 : 0.8;
    parts.push(shapeEl(center, fill, stroke, sw));
  }

  // Pass 4: center labels
  for (const [name, center] of Object.entries(CENTERS)) {
    const isDefined = defined.has(name);
    const { bounds, labelOff } = center;
    const tx = bounds.cx + (labelOff[0] || 0);
    const ty = bounds.cy + (labelOff[1] || 0);
    const fg = isDefined ? "#FFFFFF" : "#B0A8A0";
    const lbl = CENTER_LABEL[name] || name;
    parts.push(`<text x="${tx}" y="${ty + 2.5}" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Helvetica,sans-serif" font-size="7" font-weight="300" fill="${fg}">${lbl}</text>`);
  }

  // Pass 5: gate dots
  const gateR = 5.5;
  for (const [gNum, pos] of Object.entries(GATE_POS)) {
    const num      = parseInt(gNum);
    const isActive = activeGates.has(num);
    const gx = pos[0];
    const gy = pos[1];
    const circleFill   = isActive ? "#1A1715" : "#F4F0EB";
    const circleStroke = isActive ? "#2A2620" : "#C8C0B8";
    const textFill     = isActive ? "#FFFFFF" : "#9A948E";
    parts.push(`<circle cx="${gx}" cy="${gy}" r="${gateR}" fill="${circleFill}" stroke="${circleStroke}" stroke-width="0.6"/>`);
    parts.push(`<text x="${gx}" y="${gy + 1.8}" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Helvetica,sans-serif" font-size="5.5" fill="${textFill}">${gNum}</text>`);
  }

  return `<svg viewBox="0 0 360 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">\n${parts.join("\n")}\n</svg>`;
}

module.exports = { bodygraphSVG };
