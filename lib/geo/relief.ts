import type { LL } from "./projection";

/**
 * Surface relief for the state maps, 0 → 1 at [lon, lat]. Stylised, not survey elevation (no DEM):
 * a ridge follows the line of a range, low dunes ripple where there is desert, and a faint fbm
 * everywhere else, so the surface reads as land rather than a flat cut-out. Vertical scale is
 * exaggerated many times; at true scale the Aravallis would be invisible.
 */
export type Relief = (ll: LL) => number;

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
function noise(x: number, y: number) {
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
export function fbm(x: number, y: number, oct = 4) {
  let v = 0;
  let amp = 0.5;
  let tot = 0;
  for (let o = 0; o < oct; o++) {
    v += noise(x, y) * amp;
    tot += amp;
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 9.7;
    amp *= 0.5;
  }
  return v / tot;
}

/** Distance in degrees (x scaled by cos lat) from p to a polyline, and the position along it (0 → 1). */
function toLine(p: LL, line: LL[]) {
  const k = Math.cos((p[1] * Math.PI) / 180);
  let best = Infinity;
  let at = 0;
  let run = 0;
  const lens = line.slice(1).map((b, i) => Math.hypot((b[0] - line[i][0]) * k, b[1] - line[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, ay] = line[i];
    const [bx, by] = line[i + 1];
    const dx = (bx - ax) * k;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, (((p[0] - ax) * k) * dx + (p[1] - ay) * dy) / (dx * dx + dy * dy)));
    const d = Math.hypot((p[0] - ax) * k - t * dx, p[1] - ay - t * dy);
    if (d < best) {
      best = d;
      at = (run + t * lens[i]) / total;
    }
    run += lens[i];
  }
  return { d: best, at };
}

/** The Aravalli range, south-west to north-east: Mount Abu, the Udaipur hills, Ajmer, Jaipur's ridge, Alwar. */
const ARAVALLI: LL[] = [
  [72.6, 24.45],
  [73.15, 24.75],
  [73.65, 25.1],
  [74.1, 25.75],
  [74.65, 26.45],
  [75.4, 26.85],
  [75.9, 27.15],
  [76.5, 27.6],
  [77.0, 28.2],
];

const rajasthan: Relief = ([lon, lat]) => {
  const { d, at } = toLine([lon, lat], ARAVALLI);
  // highest in the south-west (Guru Shikhar, 1,722 m), falling away to low hills in the north-east
  const peak = 1 - at * 0.65;
  const ridge = Math.exp(-((d / 0.42) ** 2)) * peak * (0.6 + 0.55 * fbm(lon * 3.1, lat * 3.1));
  // the Thar: low dunes west of the range, stronger towards Jaisalmer
  const west = Math.max(0, Math.min(1, (73.2 - lon) / 2.2));
  const dunes = west * 0.12 * Math.pow(1 - Math.abs(Math.sin(lon * 9 + lat * 4 + fbm(lon * 2, lat * 2) * 4)), 2);
  return Math.min(1, ridge + dunes + 0.05 * fbm(lon * 1.5, lat * 1.5));
};

const generic: Relief = ([lon, lat]) => 0.18 * fbm(lon * 1.2, lat * 1.2) + 0.06 * fbm(lon * 5, lat * 5);

const reliefs: Record<string, Relief> = { rajasthan };
export const reliefFor = (stateId: string): Relief => reliefs[stateId] ?? generic;
