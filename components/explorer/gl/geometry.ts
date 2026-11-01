import * as THREE from "three";
import { polygonsOf, type GeoFeature, type LL, type Projection } from "@/lib/geo/projection";
import type { Relief } from "@/lib/geo/relief";

/*
 * GeoJSON → three.js. Shapes are built in the XY plane with y = -z (north up), extruded along +Z
 * and then rotated -90° about X, so the map lies on the XZ plane with its thickness pointing up.
 */

const ringPoints = (ring: LL[], proj: Projection) => {
  const pts = ring.map((ll) => {
    const [x, z] = proj(ll);
    return new THREE.Vector2(x, -z);
  });
  if (pts.length > 1 && pts[0].equals(pts[pts.length - 1])) pts.pop();
  return pts;
};

export function featureShapes(f: GeoFeature, proj: Projection) {
  return polygonsOf(f)
    .filter((poly) => poly[0].length > 3)
    .map((poly) => {
      const shape = new THREE.Shape(ringPoints(poly[0], proj));
      for (const hole of poly.slice(1)) if (hole.length > 3) shape.holes.push(new THREE.Path(ringPoints(hole, proj)));
      return shape;
    });
}

/** The state as a solid slab, `depth` thick, bottom at y = 0. Groups: 0 = top and bottom, 1 = sides. */
export function extrudeFeature(f: GeoFeature, proj: Projection, depth: number) {
  const g = new THREE.ExtrudeGeometry(featureShapes(f, proj), { depth, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(-Math.PI / 2);
  g.computeBoundingSphere();
  return g;
}

/** Every ring of the feature as line segments at height y (the border drawn on top of the slab). */
export function outlineGeometry(f: GeoFeature, proj: Projection, y: number) {
  const pos: number[] = [];
  for (const poly of polygonsOf(f))
    for (const ring of poly)
      for (let i = 0; i < ring.length - 1; i++) {
        const [x0, z0] = proj(ring[i]);
        const [x1, z1] = proj(ring[i + 1]);
        pos.push(x0, y, z0, x1, y, z1);
      }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

/**
 * The state's footprint rasterised over its projected bounds: a sharp canvas (the terrain's alpha map,
 * so the relief is cut exactly to the border) and a blurred copy sampled to ease the relief down to
 * zero at the edges, so the surface meets the slab instead of overhanging it.
 */
export function footprint(f: GeoFeature, proj: Projection, px = 1024) {
  const W = proj.width;
  const D = proj.depth;
  const cw = Math.round(W >= D ? px : (px * W) / D);
  const ch = Math.round(W >= D ? (px * D) / W : px);
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, cw, ch);
  g.fillStyle = "#fff";
  g.beginPath();
  for (const poly of polygonsOf(f))
    for (const ring of poly)
      ring.forEach((ll, i) => {
        const [x, z] = proj(ll);
        const u = ((x + W / 2) / W) * cw;
        const v = ((z + D / 2) / D) * ch;
        if (i) g.lineTo(u, v);
        else g.moveTo(u, v);
      });
  g.fill("evenodd");

  // Low-res blurred coverage for the edge falloff (separable box blur, twice)
  const S = 160;
  const sw = Math.round(W >= D ? S : (S * W) / D);
  const sh = Math.round(W >= D ? (S * D) / W : S);
  const small = document.createElement("canvas");
  small.width = sw;
  small.height = sh;
  const sg = small.getContext("2d", { willReadFrequently: true })!;
  sg.drawImage(canvas, 0, 0, sw, sh);
  const src = sg.getImageData(0, 0, sw, sh).data;
  let a = new Float32Array(sw * sh);
  for (let i = 0; i < a.length; i++) a[i] = src[i * 4] / 255;
  const R = 3;
  const blur = (inp: Float32Array, horiz: boolean) => {
    const out = new Float32Array(inp.length);
    for (let y = 0; y < sh; y++)
      for (let x = 0; x < sw; x++) {
        let s = 0;
        let n = 0;
        for (let k = -R; k <= R; k++) {
          const xx = horiz ? x + k : x;
          const yy = horiz ? y : y + k;
          if (xx < 0 || yy < 0 || xx >= sw || yy >= sh) {
            n++;
            continue;
          }
          s += inp[yy * sw + xx];
          n++;
        }
        out[y * sw + x] = s / n;
      }
    return out;
  };
  for (let i = 0; i < 2; i++) a = blur(blur(a, true), false);

  const sample = (x: number, z: number) => {
    const u = Math.max(0, Math.min(sw - 1, ((x + W / 2) / W) * sw));
    const v = Math.max(0, Math.min(sh - 1, ((z + D / 2) / D) * sh));
    return a[Math.floor(v) * sw + Math.floor(u)];
  };
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return { tex, sample, width: W, depth: D };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const LOW = new THREE.Color("#e2c9a0");
const MID = new THREE.Color("#c99c66");
const HIGH = new THREE.Color("#8f7046");
const GREEN = new THREE.Color("#7f8653");

/**
 * The relief surface: a grid over the footprint, lifted by the relief (eased to zero at the border),
 * tinted by height, sand on the plains to ochre and olive on the ridges. Returns the geometry and a
 * height lookup (world x, z → y above the slab top) for placing pins on the ground.
 */
export function terrain(proj: Projection, relief: Relief, fp: ReturnType<typeof footprint>, height: number, segments: number) {
  const g = new THREE.PlaneGeometry(fp.width, fp.depth, segments, Math.max(2, Math.round((segments * fp.depth) / fp.width)));
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const heightAt = (x: number, z: number) => relief(proj.invert(x, z)) * height * smooth(0.45, 0.95, fp.sample(x, z));
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = heightAt(x, z);
    pos.setY(i, h);
    const t = h / height;
    c.copy(LOW).lerp(MID, smooth(0.04, 0.35, t)).lerp(HIGH, smooth(0.35, 0.8, t));
    if (t > 0.25) c.lerp(GREEN, 0.18 * smooth(0.25, 0.6, t));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return { geometry: g, heightAt };
}

/** Sets opacity on every material under `root` (transparent only while fading, so sorting stays cheap). */
export function setOpacity(root: THREE.Object3D, o: number) {
  root.traverse((obj) => {
    const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (!m) return;
    for (const mat of Array.isArray(m) ? m : [m]) {
      const base = (mat.userData.baseOpacity as number | undefined) ?? 1;
      mat.opacity = o * base;
      const fading = o < 0.999 || base < 1;
      if (mat.transparent !== fading) {
        mat.transparent = fading;
        mat.needsUpdate = true;
      }
      mat.depthWrite = o > 0.5;
    }
  });
  root.visible = o > 0.001;
}

/** Camera distance that fits a w × d footprint seen from `elevation` radians above the horizon. */
export function fitDistance(w: number, d: number, fovDeg: number, aspect: number, elevation: number, margin = 1.12) {
  const v = Math.tan(((fovDeg / 2) * Math.PI) / 180);
  const h = v * aspect;
  // the footprint's apparent depth shrinks with the viewing angle
  const apparentD = d * Math.sin(elevation) + 0.15 * d * Math.cos(elevation);
  return Math.max(w / 2 / h, apparentD / 2 / v) * margin;
}

export function disposeTree(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose();
    const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (m) for (const mat of Array.isArray(m) ? m : [m]) mat.dispose();
  });
}
