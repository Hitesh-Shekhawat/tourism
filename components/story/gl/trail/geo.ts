import { OUTLINE, project } from "@/lib/rajasthan";
import { rng } from "../textures";

/*
 * World layout for the Golden Trail relief (§6.4). lib/rajasthan's projection is ~100 units per
 * degree of latitude; the scene uses S = 0.01, so one degree ≈ one world unit and the state is
 * about 7.7 × 7.6 units, centred on the origin. World x = east, world z = south (projected y), y = up.
 */
export const S = 0.01;
/** Paper sheet thickness (the extruded edge). */
export const PAPER_T = 0.1;
/** Peak relief of the Aravalli emboss above the sheet. */
export const RELIEF_H = 0.17;
/** Relief source: "procedural" = a stylised fbm ridge along a spline (brief §6.4 option b), no DEM data. */
export const HEIGHTMAP_SOURCE = "procedural" as const;

export type V2 = [number, number];
type LL = [number, number];

const projected = OUTLINE.map((p) => project(p));
const minPX = Math.min(...projected.map((p) => p[0]));
const maxPX = Math.max(...projected.map((p) => p[0]));
const minPY = Math.min(...projected.map((p) => p[1]));
const maxPY = Math.max(...projected.map((p) => p[1]));
const CX = (minPX + maxPX) / 2;
const CY = (minPY + maxPY) / 2;

/** [lon, lat] → world [x, z]. */
export const toWorld = (ll: LL): V2 => {
  const [px, py] = project(ll);
  return [(px - CX) * S, (py - CY) * S];
};

/** Bounding box of the sheet in world units, with a small margin for the deckle. */
const M = 0.06;
export const BOUNDS = { minX: (minPX - CX) * S - M, maxX: (maxPX - CX) * S + M, minZ: (minPY - CY) * S - M, maxZ: (maxPY - CY) * S + M };
export const BW = BOUNDS.maxX - BOUNDS.minX;
export const BD = BOUNDS.maxZ - BOUNDS.minZ;

/* ---------- small noise kit (value noise, deterministic) ---------- */
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
export function fbm2(x: number, y: number, oct = 4) {
  let v = 0;
  let amp = 0.5;
  let tot = 0;
  for (let o = 0; o < oct; o++) {
    v += vnoise(x, y) * amp;
    tot += amp;
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 9.7;
    amp *= 0.5;
  }
  return v / tot;
}
function ridged(x: number, y: number, oct = 4) {
  let v = 0;
  let amp = 0.5;
  let tot = 0;
  for (let o = 0; o < oct; o++) {
    const n = 1 - Math.abs(vnoise(x, y) * 2 - 1);
    v += n * n * amp;
    tot += amp;
    x = x * 2.1 + 5.3;
    y = y * 2.1 + 1.9;
    amp *= 0.5;
  }
  return v / tot;
}

/* ---------- the deckled outline ---------- */

/** The state outline resampled every ~1.2 km of paper and pushed in and out by layered noise: a torn, handmade edge. */
export function deckledOutline(spacing = 0.012, seed = 11): V2[] {
  const pts = OUTLINE.map(toWorld);
  const n0 = pts.length;
  const cum = [0];
  for (let i = 0; i < n0; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n0];
    cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const L = cum[n0];
  const n = Math.round(L / spacing);
  const res: V2[] = [];
  let seg = 0;
  for (let i = 0; i < n; i++) {
    const d = (i / n) * L;
    while (cum[seg + 1] < d) seg++;
    const a = pts[seg];
    const b = pts[(seg + 1) % n0];
    const k = (d - cum[seg]) / (cum[seg + 1] - cum[seg] || 1);
    res.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
  }
  // periodic smooth noise at two scales plus fine grain
  const r = rng(seed);
  const band = (step: number) => {
    const m = Math.ceil(n / step);
    const v = Array.from({ length: m }, () => r() * 2 - 1);
    return (i: number) => {
      const f = i / step;
      const j = Math.floor(f);
      const t = f - j;
      const s = t * t * (3 - 2 * t);
      return v[j % m] + (v[(j + 1) % m] - v[j % m]) * s;
    };
  };
  const low = band(14);
  const mid = band(4);
  const out: V2[] = [];
  for (let i = 0; i < n; i++) {
    const p = res[(i - 1 + n) % n];
    const q = res[(i + 1) % n];
    let nx = q[1] - p[1];
    let nz = -(q[0] - p[0]);
    const len = Math.hypot(nx, nz) || 1;
    nx /= len;
    nz /= len;
    const off = 0.011 * low(i) + 0.0055 * mid(i) + 0.0022 * (r() * 2 - 1);
    out.push([res[i][0] + nx * off, res[i][1] + nz * off]);
  }
  return out;
}

/* ---------- the Aravalli ridge ---------- */

/** Spine of the range, Mount Abu (SW) → past Jaipur (NE). */
const RIDGE_LL: LL[] = [
  [72.71, 24.59],
  [73.05, 24.88],
  [73.45, 25.2],
  [73.85, 25.62],
  [74.22, 26.02],
  [74.62, 26.42],
  [75.02, 26.72],
  [75.45, 26.93],
  [75.85, 27.12],
  [76.25, 27.48],
  [76.62, 27.88],
];

function catmull(pts: V2[], per: number): V2[] {
  const out: V2[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export const RIDGE: V2[] = catmull(RIDGE_LL.map(toWorld), 16);

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Distance from (x,z) to the ridge spine and the 0..1 position along it. */
function ridgeDist(x: number, z: number): [number, number] {
  let best = Infinity;
  let bs = 0;
  const n = RIDGE.length - 1;
  for (let i = 0; i < n; i++) {
    const a = RIDGE[i];
    const b = RIDGE[i + 1];
    const ex = b[0] - a[0];
    const ez = b[1] - a[1];
    const l2 = ex * ex + ez * ez;
    let t = ((x - a[0]) * ex + (z - a[1]) * ez) / l2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = a[0] + ex * t - x;
    const dz = a[1] + ez * t - z;
    const d = dx * dx + dz * dz;
    if (d < best) {
      best = d;
      bs = (i + t) / n;
    }
  }
  return [Math.sqrt(best), bs];
}

const THAR_X = toWorld([72.4, 27])[0];

/** Unmasked relief at a point: the ridge, a little noise everywhere, faint dune ripples in the west. */
function reliefAt(x: number, z: number) {
  const [d, s] = ridgeDist(x, z);
  // Guru Shikhar bump at Mount Abu, highest in the south, lower towards Jaipur, fading out past it
  let A = 0.55 + 0.45 * Math.exp(-(((s - 0.03) / 0.06) ** 2));
  A *= 1 - 0.5 * smooth(0.45, 0.95, s);
  A *= 1 - smooth(0.9, 1.0, s);
  const w = 0.2 + 0.14 * Math.sin(Math.PI * s);
  let h = 0;
  if (d < w * 3) {
    const body = Math.exp(-((d / w) ** 2)) * (0.55 + 0.45 * fbm2(x * 3.1 + 4, z * 3.1));
    const crags = 0.4 * ridged(x * 7.5, z * 7.5) * Math.exp(-((d / (1.7 * w)) ** 2));
    h = RELIEF_H * A * (body + crags);
  }
  h += 0.007 * fbm2(x * 1.3 + 30, z * 1.3);
  // dune ripples in the Thar
  const west = 1 - smooth(THAR_X - 0.6, THAR_X + 0.4, x);
  if (west > 0) h += west * 0.0035 * (0.5 + 0.5 * Math.sin((x * 0.75 + z * 0.66) * 38 + 5 * fbm2(x * 2, z * 2)));
  return h;
}

/** Draws the closed outline on a 2D canvas mapped to BOUNDS (+ margin). */
export function tracePath(g: CanvasRenderingContext2D, pts: V2[], W: number, H: number, margin = 0, dx = 0, dz = 0) {
  const sx = W / (BW + margin * 2);
  const sz = H / (BD + margin * 2);
  g.beginPath();
  pts.forEach(([x, z], i) => {
    const X = (x + dx - BOUNDS.minX + margin) * sx;
    const Y = (z + dz - BOUNDS.minZ + margin) * sz;
    if (i) g.lineTo(X, Y);
    else g.moveTo(X, Y);
  });
  g.closePath();
}

export type Heightfield = { GX: number; GZ: number; data: Float32Array; sample: (x: number, z: number) => number };

/**
 * The relief, masked so it eases to zero towards the deckled edge (the edge then meets the extruded
 * sheet's flat top). Sampled on a (GX+1)×(GZ+1) grid matching the top-surface plane.
 */
export function buildHeightfield(outline: V2[], GX = 200): Heightfield {
  const GZ = Math.round((GX * BD) / BW);
  // soft interior mask: the filled outline blurred, then remapped so the edge itself is 0
  const MS = 512;
  const a = document.createElement("canvas");
  a.width = a.height = MS;
  const ga = a.getContext("2d")!;
  ga.fillStyle = "#000";
  ga.fillRect(0, 0, MS, MS);
  ga.fillStyle = "#fff";
  tracePath(ga, outline, MS, MS);
  ga.fill();
  const b = document.createElement("canvas");
  b.width = b.height = MS;
  const gb = b.getContext("2d")!;
  gb.filter = "blur(9px)";
  gb.drawImage(a, 0, 0);
  const img = gb.getImageData(0, 0, MS, MS).data;
  const maskAt = (x: number, z: number) => {
    const u = ((x - BOUNDS.minX) / BW) * (MS - 1);
    const v = ((z - BOUNDS.minZ) / BD) * (MS - 1);
    const i = Math.min(MS - 1, Math.max(0, Math.round(u)));
    const j = Math.min(MS - 1, Math.max(0, Math.round(v)));
    return smooth(0.5, 0.97, img[(j * MS + i) * 4] / 255);
  };

  const data = new Float32Array((GX + 1) * (GZ + 1));
  for (let j = 0; j <= GZ; j++) {
    const z = BOUNDS.minZ + (j / GZ) * BD;
    for (let i = 0; i <= GX; i++) {
      const x = BOUNDS.minX + (i / GX) * BW;
      const m = maskAt(x, z);
      data[j * (GX + 1) + i] = m > 0 ? reliefAt(x, z) * m : 0;
    }
  }
  const sample = (x: number, z: number) => {
    const fx = Math.min(GX - 1e-4, Math.max(0, ((x - BOUNDS.minX) / BW) * GX));
    const fz = Math.min(GZ - 1e-4, Math.max(0, ((z - BOUNDS.minZ) / BD) * GZ));
    const i = Math.floor(fx);
    const j = Math.floor(fz);
    const tx = fx - i;
    const tz = fz - j;
    const r0 = j * (GX + 1) + i;
    const r1 = r0 + GX + 1;
    return (data[r0] * (1 - tx) + data[r0 + 1] * tx) * (1 - tz) + (data[r1] * (1 - tx) + data[r1 + 1] * tx) * tz;
  };
  return { GX, GZ, data, sample };
}

/** A gently bowed leg between two stops (quadratic Bézier control point), like a pen line. */
export function legControl(a: V2, b: V2, bow: number): V2 {
  const mx = (a[0] + b[0]) / 2;
  const mz = (a[1] + b[1]) / 2;
  return [mx - (b[1] - a[1]) * bow, mz + (b[0] - a[0]) * bow];
}
