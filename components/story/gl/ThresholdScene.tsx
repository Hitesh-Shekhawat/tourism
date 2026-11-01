"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { drawFrame, getFrameSet } from "@/lib/frames/player";
import { frameUrl, sequences } from "@/lib/day";
import { bus, kick } from "@/lib/story/bus";
import { useStory } from "@/lib/story/store";
import { LITE } from "./quality";
import { fbm, noiseTextures } from "./textures";

/*
 * Ch00 "Through the jharokha" (§6.1). The camera stands under the painted vault of a Mughal-Rajput
 * iwan: a pointed, net-ribbed outer vault over walls of blind cusped niches and rows of rounded
 * blocks, a smaller painted arch recess, and at its back a deep pointed window with a stone sill.
 * The camera dollies through the window while the hero-aerial frames (on a plane behind it)
 * scrub 1 → 150 in sync, so the drone push and the dolly read as one move.
 */
const FLOOR = -1.4;
const BAY_L = 8.5; // the outer bay runs z 0 → BAY_L (open behind the camera)
const RECESS = 1.1; // the middle recess runs z 0 → -RECESS
const WIN_D = 0.45; // window wall thickness
const SILL = -0.75;
const CAM_FROM = 6.4;
const CAM_TO = -2.2;

type Arch = { w: number; spring: number; ratio: number };
const OUTER: Arch = { w: 5.2, spring: 0.6, ratio: 0.62 };
const MIDDLE: Arch = { w: 2.9, spring: 0.3, ratio: 0.7 };
const WINDOW: Arch = { w: 1.6, spring: 0.55, ratio: 0.75 };

// Plaster and paint, sampled from the reference photograph
const PLASTER = "#c39466";
const LINE = "#4b2f1d";
const RED = "#8c3a29";
const GREEN = "#4f6a45";

/** A two-centred pointed arch from the left spring point over the apex to the right spring point. */
function archPoints(a: Arch, n = 24) {
  const R = a.w * a.ratio;
  const off = R - a.w / 2;
  const h = Math.sqrt(R * R - off * off);
  const a1 = Math.atan2(h, -off);
  const left: THREE.Vector2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.PI + ((a1 - Math.PI) * i) / n;
    left.push(new THREE.Vector2(off + R * Math.cos(t), a.spring + R * Math.sin(t)));
  }
  const right = left
    .slice(0, -1)
    .reverse()
    .map((p) => new THREE.Vector2(-p.x, p.y));
  return [...left, ...right];
}
const apex = (a: Arch) => {
  const R = a.w * a.ratio;
  const off = R - a.w / 2;
  return a.spring + Math.sqrt(R * R - off * off);
};

function archPath<T extends THREE.Path>(p: T, a: Arch, base: number) {
  p.moveTo(-a.w / 2, base);
  for (const v of archPoints(a)) p.lineTo(v.x, v.y);
  p.lineTo(a.w / 2, base);
  p.closePath();
  return p;
}

/** The inside of a pointed barrel vault from z0 to z1; u runs spring to spring, v runs z0 → z1. */
function vaultGeometry(a: Arch, z0: number, z1: number) {
  const pts = archPoints(a, 32);
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const len = acc[acc.length - 1];
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  pts.forEach((p, i) => {
    pos.push(p.x, p.y, z0, p.x, p.y, z1);
    uv.push(acc[i] / len, 0, acc[i] / len, 1);
    if (i < pts.length - 1) {
      const k = i * 2;
      idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return { geometry: g, arcLength: len };
}

/** A moulded rib following an arch outline, jambs included, standing just proud of a wall at z. */
function ribGeometry(a: Arch, base: number, z: number, r: number) {
  const pts = [new THREE.Vector3(-a.w / 2, base, z), ...archPoints(a, 20).map((p) => new THREE.Vector3(p.x, p.y, z)), new THREE.Vector3(a.w / 2, base, z)];
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "centripetal"), 160, r, 8, false);
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Tileable grime (multiply) and lime-wash patches (over), from the seeded fbm. */
function weatherCanvases(seed: number) {
  const S = 256;
  const h = fbm(S, seed, 5, 4);
  const mk = (fill: (v: number, d: Uint8ClampedArray, i: number) => void) => {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d")!;
    const img = g.createImageData(S, S);
    for (let i = 0; i < S * S; i++) fill(h[i], img.data, i * 4);
    g.putImageData(img, 0, 0);
    return c;
  };
  const grime = mk((v, d, i) => {
    const m = Math.min(1, 0.72 + v * 0.42);
    d[i] = 255 * m;
    d[i + 1] = 255 * m * 0.96;
    d[i + 2] = 255 * m * 0.9;
    d[i + 3] = 255;
  });
  const lime = mk((v, d, i) => {
    d[i] = 226;
    d[i + 1] = 212;
    d[i + 2] = 186;
    d[i + 3] = 120 * smooth(0.62, 0.74, v);
  });
  return { grime, lime };
}

/**
 * A painted plaster canvas, w × h world units at ppu px per unit. draw() works in world units with
 * y up; (x0, y0) is the bottom-left corner. Weathering is applied over the paint.
 */
function paintTexture(w: number, h: number, ppu: number, x0: number, y0: number, seed: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = Math.round(w * ppu);
  c.height = Math.round(h * ppu);
  const g = c.getContext("2d")!;
  g.fillStyle = PLASTER;
  g.fillRect(0, 0, c.width, c.height);
  g.setTransform(ppu, 0, 0, -ppu, -x0 * ppu, (y0 + h) * ppu);
  g.lineJoin = g.lineCap = "round";
  draw(g);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const { grime, lime } = weatherCanvases(seed);
  const tile = (img: HTMLCanvasElement, scale: number, op: GlobalCompositeOperation) => {
    const pat = g.createPattern(img, "repeat")!;
    pat.setTransform(new DOMMatrix().scale(scale));
    g.globalCompositeOperation = op;
    g.fillStyle = pat;
    g.fillRect(0, 0, c.width, c.height);
  };
  tile(grime, (ppu * 2.2) / 256, "multiply");
  tile(lime, (ppu * 3.1) / 256, "source-over");
  tile(grime, (ppu * 0.6) / 256, "multiply");
  g.globalCompositeOperation = "source-over";
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Stroke an arch outline (canvas world units), optionally only from the spring points up. */
function strokeArch(g: CanvasRenderingContext2D, a: Arch, base: number | null, color: string, width: number) {
  g.beginPath();
  const pts = archPoints(a);
  if (base !== null) g.moveTo(-a.w / 2, base);
  else g.moveTo(pts[0].x, pts[0].y);
  for (const p of pts) g.lineTo(p.x, p.y);
  if (base !== null) g.lineTo(a.w / 2, base);
  g.strokeStyle = color;
  g.lineWidth = width;
  g.stroke();
}

/** A blind niche: straight jambs, then a cusped pointed head (three lobes a side, cusps inward). */
function niche(g: CanvasRenderingContext2D, x0: number, x1: number, yb: number, ys: number, yt: number) {
  const xm = (x0 + x1) / 2;
  const head = (t: number, side: number): [number, number] => {
    const sx = side < 0 ? x0 : x1;
    const u = 1 - t;
    return [u * u * sx + 2 * u * t * sx + t * t * xm, u * u * ys + 2 * u * t * (ys + (yt - ys) * 0.75) + t * t * yt];
  };
  const lobe = (side: number) => {
    const L = 3;
    for (let i = 0; i < L; i++) {
      const [ax, ay] = head(side < 0 ? i / L : 1 - i / L, side);
      const [bx, by] = head(side < 0 ? (i + 1) / L : 1 - (i + 1) / L, side);
      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2;
      let nx = by - ay;
      let ny = -(bx - ax);
      if (nx * (xm - mx) + ny * (ys - my) > 0) {
        nx = -nx;
        ny = -ny;
      }
      g.quadraticCurveTo(mx + nx * 0.22, my + ny * 0.22, bx, by);
    }
  };
  g.beginPath();
  g.moveTo(x0, yb);
  g.lineTo(x0, ys);
  lobe(-1);
  // down the right side, apex first
  const [rx, ry] = head(1, 1);
  g.lineTo(rx, ry);
  lobe(1);
  g.lineTo(x1, yb);
  g.closePath();
}
function framedNiche(g: CanvasRenderingContext2D, x0: number, x1: number, yb: number, ys: number, yt: number) {
  niche(g, x0, x1, yb, ys, yt);
  g.fillStyle = "rgba(120, 76, 44, 0.16)";
  g.fill();
  g.strokeStyle = RED;
  g.lineWidth = 0.035;
  g.stroke();
  niche(g, x0 + 0.05, x1 - 0.05, yb + 0.05, ys, yt - 0.06);
  g.strokeStyle = LINE;
  g.lineWidth = 0.012;
  g.stroke();
}

/** A painted rosette: an eight-point red star with a dark outline and green leaves between. */
function rosette(g: CanvasRenderingContext2D, x: number, y: number, r: number, leaves = true) {
  if (leaves)
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + Math.PI / 8;
      g.beginPath();
      g.ellipse(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95, r * 0.34, r * 0.14, a, 0, Math.PI * 2);
      g.fillStyle = GREEN;
      g.fill();
    }
  g.beginPath();
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8;
    const rr = k % 2 ? r * 0.5 : r;
    g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  g.closePath();
  g.fillStyle = RED;
  g.fill();
  g.strokeStyle = LINE;
  g.lineWidth = r * 0.12;
  g.stroke();
  g.beginPath();
  g.arc(x, y, r * 0.22, 0, Math.PI * 2);
  g.fillStyle = "#d8b27a";
  g.fill();
}

/** The net vault: a diamond lattice of double ribs with stars at the crossings, red bands at the springs. */
function vaultTexture(arc: number, len: number, cell: number, seed: number, crown: boolean) {
  return paintTexture(arc, len, 128, 0, 0, seed, (g) => {
    g.save();
    g.beginPath();
    g.rect(0, 0, arc, len);
    g.clip();
    const mid = arc / 2;
    const n = Math.ceil(arc / cell) + 2;
    const m = Math.ceil(len / cell) + 2;
    // lattice lines run at ±45°, centred on the crown so the pattern is symmetrical
    for (const dir of [1, -1])
      for (let i = -n - m; i <= n + m; i++) {
        const x = mid + i * cell;
        for (const [col, w, o] of [
          [LINE, 0.03, -0.035],
          [LINE, 0.016, 0.035],
        ] as const) {
          g.beginPath();
          g.moveTo(x + o, 0);
          g.lineTo(x + o + dir * len, len);
          g.strokeStyle = col;
          g.lineWidth = w;
          g.stroke();
        }
      }
    for (let i = -n; i <= n; i++)
      for (let j = 0; j <= m; j++) {
        const x = mid + i * cell + (j % 2 ? cell / 2 : 0);
        const y = j * (cell / 2);
        if (x < 0.2 || x > arc - 0.2) continue;
        rosette(g, x, y, cell * 0.16, false);
      }
    // crown rib and the painted bands along both springs
    for (const [w, c] of [
      [0.09, RED],
      [0.02, LINE],
    ] as const) {
      g.fillStyle = c;
      g.fillRect(mid - w / 2, 0, w, len);
    }
    for (const x of [0, arc - 0.16]) {
      g.fillStyle = RED;
      g.fillRect(x, 0, 0.16, len);
      g.fillStyle = LINE;
      g.fillRect(x === 0 ? 0.16 : arc - 0.18, 0, 0.02, len);
    }
    if (crown) {
      for (let k = -1; k <= 1; k++) rosette(g, mid + k * 0.32, len * 0.5, k ? 0.1 : 0.16);
      rosette(g, mid, len * 0.5 + 0.3, 0.1);
      rosette(g, mid, len * 0.5 - 0.3, 0.1);
    }
    g.restore();
  });
}

const rayVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const rayFrag = /* glsl */ `
uniform float uTime; uniform float uAlpha; uniform vec3 uColor;
varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
void main() {
  float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
  float along = smoothstep(0.0, 0.25, vUv.y) * (1.0 - vUv.y);
  float streak = 0.55 + 0.45 * n(vec2(vUv.x * 9.0 + uTime * 0.05, vUv.y * 1.5 - uTime * 0.02));
  float a = clamp(pow(max(across, 0.0), 1.6) * along * streak * uAlpha, 0.0, 1.0);
  gl_FragColor = vec4(uColor * a, a);
}`;

const dustVert = /* glsl */ `
uniform float uTime; uniform float uPx;
attribute float aSeed;
varying float vA;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.21 + aSeed * 6.28) * 0.06;
  p.y += mod(uTime * 0.025 + aSeed, 1.0) * 0.5 - 0.25;
  p.z += cos(uTime * 0.17 + aSeed * 3.1) * 0.05;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPx * (0.6 + aSeed) / -mv.z;
  vA = 0.35 + 0.65 * abs(sin(uTime * 0.7 + aSeed * 20.0));
}`;
const dustFrag = /* glsl */ `
uniform float uAlpha;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vA * uAlpha;
  gl_FragColor = vec4(vec3(1.0, 0.86, 0.64) * a, a);
}`;

/** The iwan: walls, vaults, ribs, sill and the rows of rounded blocks, with their materials. */
function buildIwan() {
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  const { rough, normal } = noiseTextures(LITE ? 256 : 512, 7);
  keep(rough);
  keep(normal);
  const tiled = (t: THREE.Texture, r: number) => {
    const c = keep(t.clone());
    c.repeat.set(r, r);
    c.needsUpdate = true;
    return c;
  };
  const stone = keep(new THREE.MeshStandardMaterial({ color: "#c39466", roughness: 0.92, roughnessMap: tiled(rough, 0.6), normalMap: tiled(normal, 0.6), normalScale: new THREE.Vector2(0.8, 0.8) }));
  const floor = keep(new THREE.MeshStandardMaterial({ color: "#a8805a", roughness: 0.95, roughnessMap: tiled(rough, 0.4), normalMap: tiled(normal, 0.4) }));
  const painted = (map: THREE.Texture, nRepeat: number) =>
    keep(new THREE.MeshStandardMaterial({ map: keep(map), roughness: 0.93, normalMap: tiled(normal, nRepeat), normalScale: new THREE.Vector2(0.55, 0.55), side: THREE.DoubleSide }));

  // ── Elevation: the back wall of the bay and the window wall share one world-mapped canvas
  // (their faces never overlap in x/y). ExtrudeGeometry caps take uv = world (x, y).
  const EX0 = -OUTER.w / 2;
  const EW = OUTER.w;
  const EH = apex(OUTER) - FLOOR;
  const elevation = paintTexture(EW, EH, 220, EX0, FLOOR, 11, (g) => {
    // dado
    g.fillStyle = "rgba(92, 58, 34, 0.35)";
    g.fillRect(EX0, FLOOR, EW, 0.22);
    // band just inside the outer vault edge
    strokeArch(g, { ...OUTER, w: OUTER.w - 0.16 }, null, RED, 0.1);
    strokeArch(g, { ...OUTER, w: OUTER.w - 0.34 }, null, LINE, 0.02);
    // rectangular frame round the middle arch, with rosettes in the spandrels
    const fx = MIDDLE.w / 2 + 0.3;
    const fy = apex(MIDDLE) + 0.26;
    for (const [d, c, w] of [
      [0, RED, 0.05],
      [0.09, LINE, 0.015],
    ] as const) {
      g.strokeStyle = c;
      g.lineWidth = w;
      g.strokeRect(-fx - d, FLOOR + 0.22, (fx + d) * 2, fy + d - FLOOR - 0.22);
    }
    rosette(g, -1.27, 2.08, 0.15);
    rosette(g, 1.27, 2.08, 0.15);
    // painted bands round the middle arch
    strokeArch(g, { ...MIDDLE, w: MIDDLE.w + 0.2 }, FLOOR, RED, 0.12);
    strokeArch(g, { ...MIDDLE, w: MIDDLE.w + 0.36 }, FLOOR, LINE, 0.018);
    // blind niches on the flanks, under the rows of blocks
    for (const s of [-1, 1]) {
      const a = s * 1.88;
      const b = s * 2.42;
      framedNiche(g, Math.min(a, b), Math.max(a, b), FLOOR + 0.3, -0.55, -0.22);
    }

    // window wall (inside the middle arch): frame bands, side niches, a panel under the sill
    strokeArch(g, { ...WINDOW, w: WINDOW.w + 0.14 }, SILL - 0.08, RED, 0.07);
    strokeArch(g, { ...WINDOW, w: WINDOW.w + 0.3 }, SILL - 0.08, LINE, 0.016);
    for (const s of [-1, 1]) framedNiche(g, s < 0 ? -1.36 : 1.02, s < 0 ? -1.02 : 1.36, FLOOR + 0.3, 0.12, 0.58);
    g.fillStyle = RED;
    g.fillRect(-0.9, SILL - 0.26, 1.8, 0.035);
    rosette(g, 0, apex(WINDOW) + 0.35, 0.08);
  });
  elevation.repeat.set(1 / EW, 1 / EH);
  elevation.offset.set(-EX0 / EW, -FLOOR / EH);
  const elevationMat = painted(elevation, 0.6);

  // Back wall of the bay: a U-shaped face between the outer vault and the middle arch
  const back = new THREE.Shape();
  back.moveTo(-OUTER.w / 2, FLOOR);
  for (const p of archPoints(OUTER)) back.lineTo(p.x, p.y);
  back.lineTo(OUTER.w / 2, FLOOR);
  back.lineTo(MIDDLE.w / 2, FLOOR);
  for (const p of archPoints(MIDDLE).reverse()) back.lineTo(p.x, p.y);
  back.lineTo(-MIDDLE.w / 2, FLOOR);
  back.closePath();
  const backWall = keep(new THREE.ExtrudeGeometry(back, { depth: 0.1, bevelEnabled: false, curveSegments: 1 }));
  backWall.translate(0, 0, -0.1);

  // The window wall at the back of the recess, with the deep pointed opening
  const win = archPath(new THREE.Shape(), MIDDLE, FLOOR);
  win.holes.push(archPath(new THREE.Path(), WINDOW, SILL));
  const windowWall = keep(new THREE.ExtrudeGeometry(win, { depth: WIN_D, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1, curveSegments: 1 }));
  windowWall.translate(0, 0, -RECESS - WIN_D);

  // Vaults
  const outer = vaultGeometry(OUTER, 0, BAY_L);
  keep(outer.geometry);
  const outerMat = painted(vaultTexture(outer.arcLength, BAY_L, 0.62, 21, false), 2.5);
  const recess = vaultGeometry(MIDDLE, -RECESS, 0);
  keep(recess.geometry);
  const recessMat = painted(vaultTexture(recess.arcLength, RECESS, 0.36, 31, true), 1.2);

  // Side walls: blind niches in a row with a dado; the blocks sit above them
  const sideH = OUTER.spring - FLOOR;
  const bayWallMat = painted(
    paintTexture(BAY_L, sideH, 128, 0, FLOOR, 41, (g) => {
      g.fillStyle = "rgba(92, 58, 34, 0.35)";
      g.fillRect(0, FLOOR, BAY_L, 0.22);
      for (let z = 0.25; z + 1.0 < BAY_L; z += 1.25) framedNiche(g, z, z + 0.95, FLOOR + 0.3, -0.55, -0.2);
      g.fillStyle = RED;
      g.fillRect(0, OUTER.spring - 0.06, BAY_L, 0.06);
    }),
    1.5,
  );
  const recessH = MIDDLE.spring - FLOOR;
  const recessWallMat = painted(
    paintTexture(RECESS, recessH, 220, 0, FLOOR, 51, (g) => {
      g.fillStyle = "rgba(92, 58, 34, 0.35)";
      g.fillRect(0, FLOOR, RECESS, 0.22);
      framedNiche(g, 0.15, RECESS - 0.15, FLOOR + 0.3, -0.75, -0.42);
      g.fillStyle = RED;
      g.fillRect(0, MIDDLE.spring - 0.05, RECESS, 0.05);
    }),
    0.8,
  );

  // Ribs: the arrises of the outer vault, the middle arch and the window frame
  const rib = keep(new THREE.MeshStandardMaterial({ color: "#cf9f6c", roughness: 0.85, normalMap: tiled(normal, 1.5), normalScale: new THREE.Vector2(0.4, 0.4) }));
  const ribs = [ribGeometry({ ...OUTER, w: OUTER.w - 0.04 }, FLOOR, 0.02, 0.07), ribGeometry({ ...MIDDLE, w: MIDDLE.w + 0.06 }, FLOOR, 0.03, 0.06), ribGeometry({ ...WINDOW, w: WINDOW.w + 0.07 }, SILL, -RECESS + 0.03, 0.04)].map(keep);

  // Sill ledge: a thick stone slab projecting into the recess
  const sill = keep(new THREE.BoxGeometry(WINDOW.w + 0.12, 0.14, WIN_D + 0.34));

  // Rows of rounded blocks (the photo's band of stepped, pillow-like stones), three rows in
  // brick bond: along both bay walls, across the flanks of the back wall, along the recess walls.
  const blocks: THREE.Matrix4[] = [];
  const o = new THREE.Object3D();
  const add = (x: number, y: number, z: number, rotY: number) => {
    o.position.set(x, y, z);
    o.rotation.set(0, rotY, 0);
    o.scale.set(0.17, 0.185, 0.12);
    o.updateMatrix();
    blocks.push(o.matrix.clone());
  };
  const STEP = 0.2;
  for (let row = 0; row < 3; row++) {
    const y = OUTER.spring - 0.16 - row * 0.21;
    const shift = row % 2 ? STEP / 2 : 0;
    for (let z = 0.16 + shift; z < BAY_L; z += STEP)
      for (const s of [-1, 1]) add(s * (OUTER.w / 2), y, z, (s * Math.PI) / 2);
    for (let x = 1.86 + shift; x < OUTER.w / 2 - 0.08; x += STEP) for (const s of [-1, 1]) add(s * x, y, 0, 0);
    const ry = MIDDLE.spring - 0.14 - row * 0.21;
    for (let z = -0.12 - shift; z > -RECESS + 0.06; z -= STEP) for (const s of [-1, 1]) add(s * (MIDDLE.w / 2), ry, z, (s * Math.PI) / 2);
  }
  const blockGeo = keep(new RoundedBoxGeometry(1, 1, 1, 4, 0.42));
  const blockMat = keep(new THREE.MeshStandardMaterial({ color: "#c99a69", roughness: 0.9, normalMap: tiled(normal, 3), normalScale: new THREE.Vector2(0.5, 0.5) }));
  const blockMesh = new THREE.InstancedMesh(blockGeo, blockMat, blocks.length);
  blocks.forEach((m, i) => blockMesh.setMatrixAt(i, m));
  blockMesh.castShadow = blockMesh.receiveShadow = true;

  return {
    stone,
    floor,
    elevationMat,
    backWall,
    windowWall,
    outer: outer.geometry,
    outerMat,
    recess: recess.geometry,
    recessMat,
    bayWallMat,
    recessWallMat,
    sideH,
    recessH,
    rib,
    ribs,
    sill,
    blockMesh,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

/** Something real is through the window: take Ch00 over from the 2D arch now, without waiting for the later scenes. */
function markOpen() {
  if (useStory.getState().glOpen) return;
  requestAnimationFrame(() => {
    document.documentElement.dataset.glOpen = "ready";
    useStory.getState().set({ glOpen: true });
  });
}

export function ThresholdScene() {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const key = useRef("");

  const { iwan, rays, dust, frames } = useMemo(() => {
    const iwan = buildIwan();

    const rays = new THREE.ShaderMaterial({
      vertexShader: rayVert,
      fragmentShader: rayFrag,
      uniforms: { uTime: { value: 0 }, uAlpha: { value: 0.34 }, uColor: { value: new THREE.Color("#ffcf96") } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const N = 400;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = Math.random();
      pos[i * 3] = (Math.random() - 0.5) * (0.6 + t * 1.6);
      pos[i * 3 + 1] = SILL + 0.2 + Math.random() * 2.2 - t * 1.0;
      pos[i * 3 + 2] = -RECESS + 0.2 + t * 4.2;
      seed[i] = Math.random();
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dg.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const dm = new THREE.ShaderMaterial({ vertexShader: dustVert, fragmentShader: dustFrag, uniforms: { uTime: { value: 0 }, uPx: { value: 28 }, uAlpha: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const dust = new THREE.Points(dg, dm);

    // The aerial footage: frames drawn to a canvas that is the texture of a plane behind the window
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const ctx = canvas.getContext("2d")!;
    const set = getFrameSet("hero-aerial", "desktop");
    set.request();
    // The poster photo (already fetched by the 2D arch) fills the window at once, so the view behind
    // the jharokha is never dark while the frames are still decoding
    const still = new Image();
    still.src = frameUrl(sequences["hero-aerial"], "desktop", sequences["hero-aerial"].poster);
    still
      .decode()
      .then(() => {
        if (key.current) return;
        const s = Math.max(canvas.width / still.naturalWidth, canvas.height / still.naturalHeight);
        ctx.drawImage(still, (canvas.width - still.naturalWidth * s) / 2, (canvas.height - still.naturalHeight * s) / 2, still.naturalWidth * s, still.naturalHeight * s);
        tex.needsUpdate = true;
        markOpen();
        kick();
      })
      .catch(() => {});
    return { iwan, rays, dust, frames: { canvas, ctx, tex, set } };
  }, []);

  useEffect(
    () => () => {
      iwan.dispose();
      iwan.blockMesh.dispose();
      rays.dispose();
      dust.geometry.dispose();
      (dust.material as THREE.Material).dispose();
      frames.tex.dispose();
      useStory.getState().set({ glOpen: false });
      delete document.documentElement.dataset.glOpen;
    },
    [iwan, rays, dust, frames],
  );

  useFrame((state) => {
    if (!bus.visible.threshold) return;
    const p = bus.progress.threshold;
    const t = Math.min(1, p / 0.7);
    const e = t * t * (3 - 2 * t) * 0.35 + t * 0.65; // gentle ease-in/out on the dolly
    const c = cam.current!;
    // From under the vault (looking up into it) down to eye level with the window, then through it
    c.position.set(bus.pointer.x * 0.06, -0.15 + e * 0.6 - bus.pointer.y * 0.04, CAM_FROM + (CAM_TO - CAM_FROM) * e);
    c.lookAt(bus.pointer.x * 0.1, 2.1 - e * 1.6, -8);

    // Frames 1 → 150 over 0 → .7, crossfading between neighbours (≈10px of scroll per frame)
    const f = 1 + t * (frames.set.count - 1);
    const k = drawFrame(frames.ctx, frames.set, f, true, "cover", 0.5, key.current);
    if (k !== key.current) {
      key.current = k;
      frames.tex.needsUpdate = true;
      if (k) markOpen();
    }

    const time = state.clock.elapsedTime;
    rays.uniforms.uTime.value = time;
    rays.uniforms.uAlpha.value = 0.34 * (1 - Math.min(1, t / 0.8));
    const dm = dust.material as THREE.ShaderMaterial;
    dm.uniforms.uTime.value = time;
    dm.uniforms.uPx.value = 28 * state.gl.getPixelRatio();
    dm.uniforms.uAlpha.value = 1 - Math.min(1, t / 0.75);
    if (screenMat.current) screenMat.current.color.setScalar(0.82 + 0.18 * t);
  });

  const { stone, floor, elevationMat, backWall, windowWall, outer, outerMat, recess, recessMat, bayWallMat, recessWallMat, sideH, recessH, rib, ribs, sill, blockMesh } = iwan;

  return (
    <>
      <color attach="background" args={["#1b1511"]} />
      <PerspectiveCamera ref={cam} makeDefault fov={50} near={0.05} far={60} position={[0, -0.15, CAM_FROM]} />

      {/* Light: a warm dawn key through the window, a soft bounce under the vault */}
      <spotLight
        position={[1.6, 2.8, -7.5]}
        angle={0.42}
        penumbra={0.7}
        intensity={300}
        distance={30}
        decay={2}
        color="#ffc488"
        castShadow
        shadow-mapSize={LITE ? [512, 512] : [1024, 1024]}
        shadow-bias={-0.0004}
        onUpdate={(l) => {
          l.target.position.set(-0.4, FLOOR, 1.2);
          l.target.updateMatrixWorld();
        }}
      />
      <hemisphereLight args={["#f0c49a", "#3a261a", 1.1]} />
      <directionalLight position={[-2, 1.5, 8]} intensity={0.55} color="#e0aa7c" />
      <pointLight position={[0, -0.6, 1.2]} intensity={6} distance={7} decay={2} color="#ffb877" />

      {/* the bay: back wall, side walls, net vault */}
      <mesh geometry={backWall} material={[elevationMat, stone]} castShadow receiveShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * OUTER.w) / 2, FLOOR + sideH / 2, BAY_L / 2]} rotation={[0, (-s * Math.PI) / 2, 0]} material={bayWallMat} receiveShadow>
          <planeGeometry args={[BAY_L, sideH]} />
        </mesh>
      ))}
      <mesh geometry={outer} material={outerMat} receiveShadow />

      {/* the middle recess: its walls, painted vault and the window wall */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * MIDDLE.w) / 2, FLOOR + recessH / 2, -RECESS / 2]} rotation={[0, (-s * Math.PI) / 2, 0]} material={recessWallMat} receiveShadow>
          <planeGeometry args={[RECESS, recessH]} />
        </mesh>
      ))}
      <mesh geometry={recess} material={recessMat} receiveShadow />
      <mesh geometry={windowWall} material={[elevationMat, stone]} castShadow receiveShadow />
      <mesh geometry={sill} material={stone} position={[0, SILL - 0.07, -RECESS - WIN_D / 2 + 0.12]} castShadow receiveShadow />

      {ribs.map((g, i) => (
        <mesh key={i} geometry={g} material={rib} castShadow receiveShadow />
      ))}
      <primitive object={blockMesh} />

      {/* floor catches the window's light */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, BAY_L / 2 - 1]} receiveShadow material={floor}>
        <planeGeometry args={[OUTER.w, BAY_L + 2]} />
      </mesh>
      {/* the light shaft */}
      <mesh position={[-0.25, -0.1, 0.1]} rotation={[0.55, 0.15, 0]} material={rays} renderOrder={2}>
        <planeGeometry args={[1.3, 4.2]} />
      </mesh>
      <mesh position={[-0.25, -0.1, 0.1]} rotation={[0.55, 0.15 + Math.PI / 2, 0]} material={rays} renderOrder={2}>
        <planeGeometry args={[1.0, 4.2]} />
      </mesh>
      <primitive object={dust} renderOrder={3} />

      {/* through the window */}
      <mesh position={[0, 0.75, -7]}>
        <planeGeometry args={[11.6, 6.525]} />
        <meshBasicMaterial ref={screenMat} map={frames.tex} toneMapped={false} />
      </mesh>
    </>
  );
}
