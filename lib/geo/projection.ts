/**
 * GeoJSON helpers for the atlas: types, bounds, centroids and a fitted projection. No three.js here,
 * so the 2D fallback and the 3D maps share one projection. Equirectangular with x scaled by
 * cos(centre latitude): true enough in shape at state and country scale, and cheap to invert.
 * Projected axes: x = east, z = south (so a three.js scene can lay the map on its XZ plane).
 */
export type LL = [number, number];
export type Ring = LL[];
export type Polygon = Ring[];
export type GeoFeature = {
  type: "Feature";
  properties: { id: string; name: string };
  geometry: { type: "Polygon"; coordinates: Polygon } | { type: "MultiPolygon"; coordinates: Polygon[] };
};
export type GeoCollection = { type: "FeatureCollection"; features: GeoFeature[] };
export type Box = { minLon: number; minLat: number; maxLon: number; maxLat: number };

export const polygonsOf = (f: GeoFeature): Polygon[] => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates);

export function boundsOf(features: GeoFeature[]): Box {
  const b = { minLon: Infinity, minLat: Infinity, maxLon: -Infinity, maxLat: -Infinity };
  for (const f of features)
    for (const poly of polygonsOf(f))
      for (const [lon, lat] of poly[0]) {
        if (lon < b.minLon) b.minLon = lon;
        if (lon > b.maxLon) b.maxLon = lon;
        if (lat < b.minLat) b.minLat = lat;
        if (lat > b.maxLat) b.maxLat = lat;
      }
  return b;
}

const ringArea = (r: Ring) => {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return a / 2;
};

/** Area-weighted centroid of the feature's largest polygon (where a label or camera should aim). */
export function centroidOf(f: GeoFeature): LL {
  const outer = polygonsOf(f)
    .map((p) => p[0])
    .sort((a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a)))[0];
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0, j = outer.length - 1; i < outer.length; j = i++) {
    const [x0, y0] = outer[j];
    const [x1, y1] = outer[i];
    const k = x0 * y1 - x1 * y0;
    a += k;
    cx += (x0 + x1) * k;
    cy += (y0 + y1) * k;
  }
  return a ? [cx / (3 * a), cy / (3 * a)] : outer[0];
}

export type Projection = {
  (ll: LL): [number, number];
  invert: (x: number, z: number) => LL;
  /** World units per degree of latitude. */
  scale: number;
  /** cos(latitude) factor applied to x. */
  k: number;
  center: LL;
  /** Projected size of the fitted box. */
  width: number;
  depth: number;
};

/** A projection centred on `box`, scaled so its larger projected side measures `size` world units. */
export function fitProjection(box: Box, size: number, kOverride?: number): Projection {
  const lon0 = (box.minLon + box.maxLon) / 2;
  const lat0 = (box.minLat + box.maxLat) / 2;
  // kOverride: reuse a parent map's x-scale so a state drawn alone has exactly the shape it has on the
  // India map (one consistent projection; the zoom between them is then a pure scale + translate)
  const k = kOverride ?? Math.cos((lat0 * Math.PI) / 180);
  const w = (box.maxLon - box.minLon) * k;
  const d = box.maxLat - box.minLat;
  const scale = size / Math.max(w, d);
  const p = (([lon, lat]: LL) => [(lon - lon0) * k * scale, (lat0 - lat) * scale]) as Projection;
  p.invert = (x, z) => [lon0 + x / (k * scale), lat0 - z / scale];
  p.scale = scale;
  p.k = k;
  p.center = [lon0, lat0];
  p.width = w * scale;
  p.depth = d * scale;
  return p;
}

/** Point in a feature (even-odd over all rings). */
export function contains(f: GeoFeature, [x, y]: LL) {
  let inside = false;
  for (const poly of polygonsOf(f))
    for (const r of poly)
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const [xi, yi] = r[i];
        const [xj, yj] = r[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
  return inside;
}

const cache = new Map<string, Promise<GeoCollection>>();
/** Fetches a GeoJSON file from public/geo once per session. */
export function loadGeo(path: string) {
  let p = cache.get(path);
  if (!p) {
    p = fetch(path).then((r) => {
      if (!r.ok) throw new Error(`geo ${path}: ${r.status}`);
      return r.json() as Promise<GeoCollection>;
    });
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return p;
}
export const INDIA_GEO = "/geo/india-states.json";
export const stateGeo = (id: string) => `/geo/states/${id}.json`;
