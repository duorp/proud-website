// p5.js — solid editable polygon with edge-insert + non-intersecting drag
let preset=null
let verts = [];
let draggingIndex = -1;
let dragPrev = null;

const VERT_R = 4;     // vertex hit radius
const EDGE_PICK = 18; // how close click must be to an edge to insert

function setup() {
    const container = document.getElementById("main");
  const r = container.getBoundingClientRect();

  myCanvas = createCanvas(500, 500);
  myCanvas.id("shape-draw");
  myCanvas.parent(container);
  myCanvas.style("display", "block"); // helps with flex

  loadShapeFromDB();
  verts = makeRandomSolidShape(14); // try changing count
  preset = verts.map(v => v.copy()); // save initial as preset
  printVertsAsVanillaArray(verts);
}

const container = document.getElementById("main");
resizeCanvas(container.clientWidth, container.clientHeight);

  
function draw() {
  background(255);
    // instructions


  // polygon fill
  noStroke();
  fill(30, 140, 200, 70);
  beginShape();
  for (const v of verts) vertex(v.x, v.y);
  endShape(CLOSE);
  
    beginShape();
  for (const v of preset) vertex(v.x, v.y);
  endShape(CLOSE);

  // polygon outline
  stroke(20);
  strokeWeight(2);
  noFill();
  beginShape();
  for (const v of verts) vertex(v.x, v.y);
  endShape(CLOSE);

  // vertices
  for (let i = 0; i < verts.length; i++) {
    const v = verts[i];
    const isDrag = i === draggingIndex;
    stroke(20);
    strokeWeight(2);
    fill(isDrag ? 0 : 255);
    circle(v.x, v.y, VERT_R * 2);
  }

  // instructions
  noStroke();
  fill(20);
  textSize(14);
  

  text(polygonMatchesPresetSimple(verts, preset), 12,50);

  
  
  
}

function mousePressed() {
  // 1) try to grab a vertex
  draggingIndex = findVertexNear(mouseX, mouseY, VERT_R + 4);
  if (draggingIndex !== -1) {
    dragPrev = verts[draggingIndex].copy();
    return;
  }

  // 2) otherwise, insert point on closest edge (if close enough)
  const res = closestPointOnPolygonEdges(createVector(mouseX, mouseY));
  if (res && res.dist <= EDGE_PICK) {
    // insert after edge start index: (i -> i+1)
    verts.splice(res.edgeIndex + 1, 0, res.pt);
  }
}

function mouseDragged() {
  if (draggingIndex === -1) return;

  const candidate = createVector(mouseX, mouseY);
  const old = verts[draggingIndex].copy();
  verts[draggingIndex] = candidate;

  // prevent self-intersection while dragging
  if (polygonSelfIntersects(verts)) {
    verts[draggingIndex] = old; // revert
  }
  
}

function mouseReleased() {
  draggingIndex = -1;
  dragPrev = null;

}



/* --------------------------
   Shape generation (solid)
--------------------------- */

// Create random points then take convex hull (guaranteed simple / non-intersecting)
function makeRandomSolidShape(n) {
  const pts = [];
  const pad = 80;
  for (let i = 0; i < n; i++) {
    pts.push(createVector(random(pad, width - pad), random(pad, height - pad)));
  }
  const hull = convexHullMonotonicChain(pts);
  // If hull is small due to randomness, retry quickly
  if (hull.length < 3) return makeRandomSolidShape(n);
  return hull;
}

// Monotonic chain convex hull (CCW)
function convexHullMonotonicChain(points) {
  const pts = points
    .map(p => createVector(p.x, p.y))
    .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  if (pts.length <= 1) return pts;

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper); // CCW hull
}

/* --------------------------
   Edge insertion
--------------------------- */

function closestPointOnPolygonEdges(p) {
  if (verts.length < 2) return null;

  let best = null;

  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const cp = closestPointOnSegment(p, a, b);
    const d = p5.Vector.dist(p, cp);

    if (!best || d < best.dist) {
      best = { edgeIndex: i, pt: cp, dist: d };
    }
  }
  return best;
}

function closestPointOnSegment(p, a, b) {
  const ab = p5.Vector.sub(b, a);
  const ap = p5.Vector.sub(p, a);
  const denom = ab.magSq();
  let t = denom === 0 ? 0 : ap.dot(ab) / denom;
  t = constrain(t, 0, 1);
  return createVector(a.x + ab.x * t, a.y + ab.y * t);
}

/* --------------------------
   Vertex hit testing
--------------------------- */

function findVertexNear(x, y, r) {
  for (let i = 0; i < verts.length; i++) {
    if (dist(x, y, verts[i].x, verts[i].y) <= r) return i;
  }
  return -1;
}

/* --------------------------
   Intersection prevention
--------------------------- */

// Checks if polygon has any non-adjacent edge intersections
function polygonSelfIntersects(poly) {
  const n = poly.length;
  if (n < 4) return false;

  for (let i = 0; i < n; i++) {
    const a1 = poly[i];
    const a2 = poly[(i + 1) % n];

    for (let j = i + 1; j < n; j++) {
      const b1 = poly[j];
      const b2 = poly[(j + 1) % n];

      // Skip adjacent edges and the same edge
      if (i === j) continue;
      if ((i + 1) % n === j) continue;
      if (i === (j + 1) % n) continue;

      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

function segmentsIntersect(p1, p2, p3, p4) {
  // Proper segment intersection with orientation tests
  const o1 = orient(p1, p2, p3);
  const o2 = orient(p1, p2, p4);
  const o3 = orient(p3, p4, p1);
  const o4 = orient(p3, p4, p2);

  // General case
  if (o1 !== o2 && o3 !== o4) return true;

  // Collinear cases
  if (o1 === 0 && onSegment(p1, p3, p2)) return true;
  if (o2 === 0 && onSegment(p1, p4, p2)) return true;
  if (o3 === 0 && onSegment(p3, p1, p4)) return true;
  if (o4 === 0 && onSegment(p3, p2, p4)) return true;

  return false;
}

function orient(a, b, c) {
  const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  if (abs(val) < 1e-9) return 0; // collinear
  return val > 0 ? 1 : 2; // 1:clockwise, 2:counterclockwise
}

function onSegment(a, b, c) {
  return (
    b.x <= max(a.x, c.x) + 1e-9 &&
    b.x >= min(a.x, c.x) - 1e-9 &&
    b.y <= max(a.y, c.y) + 1e-9 &&
    b.y >= min(a.y, c.y) - 1e-9
  );
}



/* --------------------------
   check if same shape
--------------------------- */

function polygonMatchesPresetSimple(poly, preset, tol = 20) {
  if (!poly || !preset) return false;

  // 1) simplify both (remove points that lie on the segment between neighbors)
  const simpA = removePointsOnEdges(poly, tol);
  const simpB = removePointsOnEdges(preset, tol);

  const n = simpA.length;
  if (n !== simpB.length) return false;
  if (n < 3) return false;

  // 2) try every possible starting offset
  for (let shift = 0; shift < n; shift++) {
    let match = true;

    for (let i = 0; i < n; i++) {
      const a = simpA[i];
      const b = simpB[(i + shift) % n];

      if (abs(a.x - b.x) > tol || abs(a.y - b.y) > tol) {
        match = false;
        break;
      }
    }

    if (match) return true;
  }

  return false;
}

/**
 * Removes any vertex p[i] that lies on the segment from p[i-1] to p[i+1]
 * within a distance tolerance. Works for closed polygons.
 */
function removePointsOnEdges(points, tol = 5) {
  if (!points || points.length < 3) return points ? points.slice() : [];

  let pts = points.map(p => ({ x: p.x, y: p.y })); // plain objects to avoid p5 refs

  // Repeat until no more removals (handles runs of collinear points)
  let changed = true;
  while (changed && pts.length >= 3) {
    changed = false;

    for (let i = 0; i < pts.length; i++) {
      const prev = pts[(i - 1 + pts.length) % pts.length];
      const curr = pts[i];
      const next = pts[(i + 1) % pts.length];

      if (pointOnSegment(curr, prev, next, tol)) {
        pts.splice(i, 1);
        changed = true;
        break; // restart scan because indices changed
      }
    }
  }

  return pts;
}

/**
 * Returns true if p is on segment ab within distance tol.
 */
function pointOnSegment(p, a, b, tol = 5) {
  // If a and b are the same point, treat as not removable
  const abx = b.x - a.x, aby = b.y - a.y;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) return false;

  // Project p onto ab, clamp t to [0,1]
  const apx = p.x - a.x, apy = p.y - a.y;
  let t = (apx * abx + apy * aby) / abLenSq;
  t = constrain(t, 0, 1);

  // Closest point on segment
  const cx = a.x + t * abx;
  const cy = a.y + t * aby;

  // Distance from p to segment
  const dx = p.x - cx;
  const dy = p.y - cy;
  return (dx * dx + dy * dy) <= (tol * tol);
}

// Convert p5 vectors -> plain objects
function vertsToPlain(verts) {
  return verts.map(v => ({ x: v.x, y: v.y }));
}
// Print to console as vanilla JS you can paste elsewhere
function printVertsAsVanillaArray(verts, varName = "verts") {
  const plain = vertsToPlain(verts);

  const s =
    `const ${varName} = [\n` +
    plain
      .map(p => `  { x: ${p.x.toFixed(2)}, y: ${p.y.toFixed(2)} },`)
      .join("\n") +
    `\n];`;

  console.log(s);
  return s; // also returns the string if you want to show it on-canvas
}

async function loadShapeFromDB() {
    try {
      const res = await fetch("/api/shapes");
      const data = await res.json();
  
      if (!data.length) return;
  
      // assuming newest shape is first (ORDER BY id DESC)
      preset = data[0].data.verts;
  
    } catch (err) {
      console.error("Failed to load shape:", err);
    }
  }