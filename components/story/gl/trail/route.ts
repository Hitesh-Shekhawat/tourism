import * as THREE from "three";
import { legControl, type V2 } from "./geo";

/** Tube segments per leg. Each leg gets the same count, so trailState().route maps linearly onto the draw range. */
export const SEG_PER_LEG = 96;
export const RADIAL = 8;

/** Bow per leg (perpendicular offset as a fraction of the leg), chosen so the line reads hand-drawn. */
const BOWS = [0.28, -0.1, 0.12, -0.1];

/** 2D polyline of the route through the stops, SEG_PER_LEG samples per leg (+1). */
export function routePolyline(stops: V2[]): V2[] {
  const out: V2[] = [];
  for (let l = 0; l < stops.length - 1; l++) {
    const a = stops[l];
    const b = stops[l + 1];
    const c = legControl(a, b, BOWS[l % BOWS.length]);
    for (let k = 0; k < SEG_PER_LEG; k++) {
      const t = k / SEG_PER_LEG;
      const u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
  }
  out.push(stops[stops.length - 1]);
  return out;
}

/**
 * A polyline curve parameterised per sample, not by arc length: getPointAt(u) === getPoint(u), so a
 * TubeGeometry with N = points-1 segments puts ring i exactly on sample i.
 */
export class SampledCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private pts: THREE.Vector3[]) {
    super();
  }
  getPoint(u: number, target = new THREE.Vector3()) {
    const n = this.pts.length - 1;
    const f = Math.min(n, Math.max(0, u * n));
    const i = Math.min(n - 1, Math.floor(f));
    return target.lerpVectors(this.pts[i], this.pts[i + 1], f - i);
  }
  getPointAt(u: number, target?: THREE.Vector3) {
    return this.getPoint(u, target);
  }
  getTangent(u: number, target = new THREE.Vector3()) {
    const n = this.pts.length - 1;
    const i = Math.min(n - 1, Math.max(0, Math.floor(u * n)));
    const a = this.pts[Math.max(0, i - 1)];
    const b = this.pts[Math.min(n, i + 2)];
    return target.subVectors(b, a).normalize();
  }
  getTangentAt(u: number, target?: THREE.Vector3) {
    return this.getTangent(u, target);
  }
}
