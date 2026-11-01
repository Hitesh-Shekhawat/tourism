import outline from "./geo/rajasthan-outline.json";

/**
 * Rajasthan's state boundary as [lon, lat]: Natural Earth admin-1 (public domain), simplified to
 * 300 points (Douglas-Peucker; see content/credits.ts). Projected equirectangularly, x scaled by cos 26.5°.
 */
type LL = [number, number];

export const OUTLINE: LL[] = outline as LL[];

const LON0 = 69.2;
const LAT0 = 30.45;
const K = 100; // px per degree of latitude
const COS = Math.cos((26.5 * Math.PI) / 180);

export const project = ([lon, lat]: LL): [number, number] => [+((lon - LON0) * K * COS).toFixed(1), +((LAT0 - lat) * K).toFixed(1)];

export const MAP_W = Math.ceil((78.5 - LON0) * K * COS);
export const MAP_H = Math.ceil((LAT0 - 22.85) * K);

export const outlinePath = "M" + OUTLINE.map((p) => project(p).join(" ")).join(" L") + " Z";

/** Places used on route maps, as [lon, lat]. */
export const PLACES: Record<string, LL> = {
  Jaipur: [75.79, 26.92],
  Amber: [75.85, 26.99],
  Udaipur: [73.71, 24.58],
  Jodhpur: [73.02, 26.24],
  Jaisalmer: [70.91, 26.91],
  Pushkar: [74.55, 26.49],
  Bikaner: [73.31, 28.02],
  Ranakpur: [73.47, 25.12],
  Abhaneri: [76.6, 27.0],
  Bagru: [75.54, 26.81],
};

/** A gently bowed leg between two stops, like a pen line rather than a ruler. */
export function legPath(a: LL, b: LL, bow = 0.12) {
  const [x1, y1] = project(a);
  const [x2, y2] = project(b);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = mx - (y2 - y1) * bow;
  const cy = my + (x2 - x1) * bow;
  return `M${x1} ${y1} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
}
