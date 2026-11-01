/**
 * The jharokha arch: a slender cusped Rajput arch in objectBoundingBox units (0..1).
 * Straight sides rise to the spring line; the crown is a soft pointed curve split into
 * scalloped lobes whose cusps point inward.
 */
type P = [number, number];

const SPRING = 0.34; // crown height as a fraction of the box height
const LOBES = 4; // lobes per side
const BULGE = 0.09; // lobe depth relative to its chord

// Quadratic from the spring point (tangent vertical) to the apex (soft point)
const crown = (t: number): P => {
  const p0: P = [0, SPRING];
  const c: P = [0, SPRING * 0.22];
  const p1: P = [0.5, 0];
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
};

const f = (n: number) => +n.toFixed(4);

function lobes(mirror: boolean) {
  const pts: P[] = Array.from({ length: LOBES + 1 }, (_, i) => crown(i / LOBES));
  if (mirror) pts.reverse();
  const m = (p: P): P => (mirror ? [1 - p[0], p[1]] : p);
  let d = "";
  for (let i = 0; i < LOBES; i++) {
    const a = m(pts[i]);
    const b = m(pts[i + 1]);
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    // outward normal (away from the arch's centre at 0.5, 0.6)
    let nx = dy;
    let ny = -dx;
    if (nx * (0.5 - mx) + ny * (0.6 - my) > 0) {
      nx = -nx;
      ny = -ny;
    }
    d += ` Q${f(mx + nx * BULGE)} ${f(my + ny * BULGE)} ${f(b[0])} ${f(b[1])}`;
  }
  return d;
}

export const archPath = `M0 1 L0 ${SPRING}${lobes(false)}${lobes(true)} L1 1 Z`;
