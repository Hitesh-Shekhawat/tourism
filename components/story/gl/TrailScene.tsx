"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { trail } from "@/content/home";
import { bus } from "@/lib/story/bus";
import { trailState } from "@/lib/story/trail";
import { LITE } from "./quality";
import { noiseTextures } from "./textures";
import { BD, BOUNDS, BW, buildHeightfield, deckledOutline, HEIGHTMAP_SOURCE, PAPER_T, toWorld, type V2 } from "./trail/geo";
import { deskTexture, drawTag, paperTexture, SHADOW_MARGIN, shadowTexture } from "./trail/paint";
import { RADIAL, routePolyline, SampledCurve, SEG_PER_LEG } from "./trail/route";

/*
 * Ch03 "The Golden Trail" (§6.4): a paper-relief model of Rajasthan on an ivory desk. The state
 * outline is a thick sheet of deckle-edged sandstone paper, embossed with the Aravalli range
 * (HEIGHTMAP_SOURCE = "procedural": a stylised fbm ridge along a spline, see trail/geo.ts). A brass
 * tube draws the route Jaipur → Amber → Udaipur → Jodhpur → Jaisalmer while the camera flies stop
 * to stop, all from trailState(p) so the DOM cards (right ~40%) stay in sync. Each stop is framed
 * left of centre. Matte and warm: no bloom, no postprocessing; the desk shadow is baked.
 */
void HEIGHTMAP_SOURCE;

const FOV = 34;
const ROUTE_LIFT = 0.022;
const TUBE_R = 0.011;
const TAG_W = 0.42;
const TAG_H = 0.13;
const TAG_TILT = 0.5; // radians the tag face leans towards the viewer

/** Camera stations: overview (index 0) then one per stop. dist = distance to target, tilt = elevation (rad), az = yaw, frac = how far left of centre the stop sits (NDC). */
type Station = { x: number; z: number; dist: number; tilt: number; az: number; frac: number };
const DEG = Math.PI / 180;
const STOP_VIEW: Omit<Station, "x" | "z">[] = [
  { dist: 3.3, tilt: 50 * DEG, az: -4 * DEG, frac: 0.4 }, // Jaipur
  { dist: 2.6, tilt: 54 * DEG, az: 2 * DEG, frac: 0.4 }, // Amber: close, so the 11 km leg reads
  { dist: 4.1, tilt: 46 * DEG, az: 5 * DEG, frac: 0.4 }, // Udaipur
  { dist: 3.9, tilt: 47 * DEG, az: -4 * DEG, frac: 0.4 }, // Jodhpur
  { dist: 4.3, tilt: 45 * DEG, az: 4 * DEG, frac: 0.4 }, // Jaisalmer
];

/** Tag offset from its city (world units, x east / z south): beside the pin, Jaipur and Amber split south/north. */
const TAG_OFF: Record<string, V2> = {
  jaipur: [0.045 + TAG_W / 2, 0.05],
  amber: [0.045 + TAG_W / 2, -0.035],
};

/** Light moods: overview, then per stop (Udaipur cooler, Jodhpur indigo shadows, Jaisalmer golden). */
const MOODS = [
  { sun: "#fff1dc", sky: "#fbf3e6", ground: "#cdb08a" },
  { sun: "#ffeedd", sky: "#fdf0e6", ground: "#cfa696" }, // Jaipur, a blush of pink
  { sun: "#ffecd6", sky: "#fbefe2", ground: "#cba78c" }, // Amber
  { sun: "#fff5ea", sky: "#dde7f4", ground: "#a9b6c6" }, // Udaipur, cooler fill
  { sun: "#fff0de", sky: "#d4d5f0", ground: "#8486c2" }, // Jodhpur, indigo in the shadows
  { sun: "#ffd9a2", sky: "#fde9c6", ground: "#d6ab72" }, // Jaisalmer, golden
].map((m) => ({ sun: new THREE.Color(m.sun), sky: new THREE.Color(m.sky), ground: new THREE.Color(m.ground) }));

const smooth01 = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

function build(gl: THREE.WebGLRenderer) {
  const outline = deckledOutline();
  const hf = buildHeightfield(outline, LITE ? 140 : 200);
  const stops = trail.stops.map((s) => toWorld(s.coords as [number, number]));
  const route2d = routePolyline(stops);
  const cx = (BOUNDS.minX + BOUNDS.maxX) / 2;
  const cz = (BOUNDS.minZ + BOUNDS.maxZ) / 2;

  // --- the sheet: extruded deckled outline (edge + flat cap) ...
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  const sheet = new THREE.ExtrudeGeometry(shape, { depth: PAPER_T, bevelEnabled: false, curveSegments: 1 });
  sheet.rotateX(-Math.PI / 2);

  // ... and the embossed top: a 200×N grid displaced on the CPU, cut to the outline by the paper texture's alpha
  const top = new THREE.PlaneGeometry(BW, BD, hf.GX, hf.GZ);
  top.rotateX(-Math.PI / 2);
  top.translate(cx, 0, cz);
  const pos = top.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, PAPER_T + 0.003 + hf.data[i]);
  top.computeVertexNormals();

  // --- the route: a brass tube a little above the relief, SEG_PER_LEG rings per leg
  const pts = route2d.map(([x, z]) => new THREE.Vector3(x, PAPER_T + hf.sample(x, z), z));
  // smooth the heights so the tube glides over the emboss rather than following every crag
  const ys = pts.map((p) => p.y);
  pts.forEach((p, i) => {
    let s = 0;
    let w = 0;
    for (let k = -6; k <= 6; k++) {
      const j = i + k;
      if (j < 0 || j >= ys.length) continue;
      s += Math.max(ys[j], ys[i]);
      w++;
    }
    p.y = s / w + ROUTE_LIFT;
  });
  const curve = new SampledCurve(pts);
  const N = pts.length - 1;
  const tube = new THREE.TubeGeometry(curve, N, TUBE_R, RADIAL, false);

  // --- materials
  const pmrem = new THREE.PMREMGenerator(gl);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();

  const grain = noiseTextures(256, 41, 1.4);
  grain.rough.dispose();
  grain.normal.repeat.set(9, 9);
  const paperMap = paperTexture(outline, route2d);
  const paper = new THREE.MeshStandardMaterial({ map: paperMap, alphaTest: 0.5, roughness: 0.96, metalness: 0, normalMap: grain.normal, normalScale: new THREE.Vector2(0.22, 0.22) });
  const edge = new THREE.MeshStandardMaterial({ color: "#E9D9BC", roughness: 1, metalness: 0 });
  const brass = new THREE.MeshStandardMaterial({ color: "#B08D57", metalness: 0.85, roughness: 0.42, envMap: env, envMapIntensity: 0.85 });
  const deskMap = deskTexture();
  const desk = new THREE.MeshStandardMaterial({ map: deskMap, roughness: 1, metalness: 0 });
  const shadowMap = shadowTexture(outline);
  const shadow = new THREE.MeshBasicMaterial({ color: "#5a4128", alphaMap: shadowMap, transparent: true, opacity: 0.42, depthWrite: false });

  // --- pins: a brass disc on the city and a pill-shaped brass tag with the engraved name
  const disc = new THREE.CylinderGeometry(0.028, 0.03, 0.012, 40);
  const pill = new THREE.Shape();
  {
    const w = TAG_W / 2 - TAG_H / 2;
    const r = TAG_H / 2;
    pill.moveTo(-w, -r);
    pill.lineTo(w, -r);
    pill.absarc(w, 0, r, -Math.PI / 2, Math.PI / 2, false);
    pill.lineTo(-w, r);
    pill.absarc(-w, 0, r, Math.PI / 2, (Math.PI * 3) / 2, false);
  }
  const tagGeo = new THREE.ExtrudeGeometry(pill, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2, curveSegments: 18 });
  const family = typeof document !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--font-tiro").trim() : "";
  const pins = trail.stops.map((s, i) => {
    const [x, z] = stops[i];
    const h = PAPER_T + hf.sample(x, z);
    const c = document.createElement("canvas");
    drawTag(c, s.devanagari, family);
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    map.repeat.set(1 / TAG_W, 1 / TAG_H);
    map.offset.set(0.5, 0.5);
    const face = new THREE.MeshStandardMaterial({ map, metalness: 0.7, roughness: 0.48, envMap: env, envMapIntensity: 0.8, emissive: new THREE.Color("#ffc77a"), emissiveIntensity: 0 });
    const discMat = brass.clone();
    discMat.emissive = new THREE.Color("#ffc77a");
    const [ox, oz] = TAG_OFF[s.id] ?? [0.045 + TAG_W / 2, 0.0];
    const tx = x + ox;
    const tz = z + oz;
    const th = PAPER_T + Math.max(hf.sample(tx - TAG_W / 2, tz), hf.sample(tx + TAG_W / 2, tz), hf.sample(tx, tz)) + 0.012;
    return { id: s.id, text: s.devanagari, canvas: c, map, face, discMat, disc: [x, h + 0.006, z] as const, tag: [tx, th + (TAG_H / 2) * Math.sin(TAG_TILT) * 0.6, tz] as const, glow: 0, dim: 0.5 };
  });

  // --- camera stations
  const stations: Station[] = [{ x: 0.05, z: 0.35, dist: 12.6, tilt: 60 * DEG, az: 0, frac: 0.1 }, ...STOP_VIEW.map((v, i) => ({ ...v, x: stops[i][0] + 0.08, z: stops[i][1] + 0.02 }))];

  return {
    outline,
    hf,
    stops,
    sheet,
    top,
    tube,
    curve,
    N,
    env,
    paper,
    edge,
    brass,
    desk,
    deskMap,
    shadow,
    shadowMap,
    paperMap,
    grain: grain.normal,
    disc,
    tagGeo,
    pins,
    stations,
    shadowPos: [cx, 0.002, cz] as const,
    shadowSize: [BW + SHADOW_MARGIN * 2, BD + SHADOW_MARGIN * 2] as const,
  };
}

export function TrailScene() {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const fog = useRef<THREE.Fog>(null);
  const tubeMesh = useRef<THREE.Mesh>(null);
  const tip = useRef<THREE.Mesh>(null);
  const look = useMemo(() => ({ v: new THREE.Vector3(), px: 0, py: 0 }), []);

  const b = useMemo(() => build(gl), [gl]);

  // Redraw the tags once Tiro Devanagari Hindi has loaded (the page already has it via next/font)
  useEffect(() => {
    let live = true;
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-tiro").trim();
    if (!family || !document.fonts) return;
    document.fonts
      .load("64px " + family, "जयपुर")
      .then(() => {
        if (!live) return;
        b.pins.forEach((p) => {
          drawTag(p.canvas, p.text, family);
          p.map.needsUpdate = true;
        });
        invalidate();
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [b, invalidate]);

  useEffect(
    () => () => {
      [b.sheet, b.top, b.tube, b.disc, b.tagGeo].forEach((g) => g.dispose());
      [b.paper, b.edge, b.brass, b.desk, b.shadow].forEach((m) => m.dispose());
      [b.env, b.deskMap, b.shadowMap, b.paperMap, b.grain].forEach((t) => t.dispose());
      b.pins.forEach((p) => {
        p.map.dispose();
        p.face.dispose();
        p.discMat.dispose();
      });
    },
    [b],
  );

  useFrame((_, dt) => {
    if (!bus.visible.trail) return;
    const p = bus.progress.trail;
    const s = trailState(p);
    const n = b.pins.length;

    // route draws itself: whole tube segments (each RADIAL*6 indices)
    const segs = Math.round(s.route * b.N);
    tubeMesh.current?.geometry.setDrawRange(0, segs * RADIAL * 6);
    if (tip.current) {
      tip.current.visible = s.route > 0.001;
      b.curve.getPoint(segs / b.N, tip.current.position);
    }

    // camera: interpolate stations with trailState's eased t, rising mid-leg like a higher arc
    const A = b.stations[s.from + 1];
    const B = b.stations[s.to + 1];
    const t = s.t;
    const x = A.x + (B.x - A.x) * t;
    const z = A.z + (B.z - A.z) * t;
    let dist = Math.exp(Math.log(A.dist) + (Math.log(B.dist) - Math.log(A.dist)) * t);
    if (s.from >= 0 && s.from !== s.to) dist += Math.hypot(B.x - A.x, B.z - A.z) * 0.55 * Math.sin(Math.PI * t);
    dist *= 1 + 0.22 * smooth01((p - 0.9) / 0.1); // tail: ease back a little
    const k = 1 - Math.exp(-dt * 3);
    look.px += (bus.pointer.x - look.px) * k;
    look.py += (bus.pointer.y - look.py) * k;
    const tilt = A.tilt + (B.tilt - A.tilt) * t - look.py * 0.012;
    const az = A.az + (B.az - A.az) * t + look.px * 0.025;
    const c = cam.current!;
    // narrow / portrait views (cards stack rather than sit on the right): centre the stop and back off so the sheet still fits
    const narrow = c.aspect < 1.1;
    const frac = narrow ? 0 : A.frac + (B.frac - A.frac) * t;
    if (c.aspect < 1.45) dist *= 1 + (Math.pow(1.45 / c.aspect, 0.8) - 1) * (s.from < 0 ? 0.35 + 0.65 * (1 - t) : 0.35);
    if (fog.current) {
      fog.current.near = dist * 1.05;
      fog.current.far = dist * 2.5 + 4;
    }
    const shift = frac * dist * Math.tan((FOV / 2) * DEG) * c.aspect;
    const bx = x + Math.cos(az) * shift;
    const bz = z - Math.sin(az) * shift;
    const by = PAPER_T + 0.03;
    c.position.set(bx + dist * Math.cos(tilt) * Math.sin(az), by + dist * Math.sin(tilt), bz + dist * Math.cos(tilt) * Math.cos(az));
    look.v.set(bx, by, bz);
    c.lookAt(look.v);

    // light mood by stop
    const ma = MOODS[s.from + 1];
    const mb = MOODS[s.to + 1];
    if (sun.current) sun.current.color.lerpColors(ma.sun, mb.sun, t);
    if (hemi.current) {
      hemi.current.color.lerpColors(ma.sky, mb.sky, t);
      hemi.current.groundColor.lerpColors(ma.ground, mb.ground, t);
    }

    // pins: dim until reached, a faint glow on the stop being held
    const reached = Math.max(s.stop, Math.floor(s.route * (n - 1) + 1e-4));
    const kk = 1 - Math.exp(-dt * 6);
    for (let i = 0; i < n; i++) {
      const pin = b.pins[i];
      const dimT = i <= reached && s.stop >= 0 ? 1 : 0.72;
      const glowT = i === s.stop && s.holding ? 1 : 0;
      pin.dim += (dimT - pin.dim) * kk;
      pin.glow += (glowT - pin.glow) * kk;
      pin.face.color.setScalar(pin.dim);
      pin.face.emissiveIntensity = pin.glow * 0.07;
      pin.discMat.color.setRGB(0.69 * pin.dim, 0.553 * pin.dim, 0.341 * pin.dim).convertSRGBToLinear();
      pin.discMat.emissiveIntensity = pin.glow * 0.25;
    }
  });

  return (
    <>
      <color attach="background" args={["#EAE0CD"]} />
      <fog ref={fog} attach="fog" args={["#EAE0CD", 13, 30]} />
      <PerspectiveCamera ref={cam} makeDefault fov={FOV} near={0.05} far={60} position={[0, 9, 6]} />

      {/* Noon sun from the upper left (north-west), a soft sky/ground fill */}
      <directionalLight
        ref={sun}
        position={[-7, 6.5, -3.5]}
        intensity={2.4}
        castShadow
        shadow-mapSize={LITE ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.01}
        shadow-camera-left={-4.6}
        shadow-camera-right={4.6}
        shadow-camera-top={4.6}
        shadow-camera-bottom={-4.6}
        shadow-camera-near={2}
        shadow-camera-far={22}
      />
      <directionalLight position={[3, 3.5, 7]} intensity={0.45} color="#ffe6c8" />
      <hemisphereLight ref={hemi}args={["#fbf3e6", "#cdb08a", 0.85]} />

      {/* desk, baked sheet shadow, the sheet and its embossed top */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={b.desk}>
        <planeGeometry args={[34, 34]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={b.shadowPos} material={b.shadow} renderOrder={1}>
        <planeGeometry args={b.shadowSize} />
      </mesh>
      <mesh geometry={b.sheet} material={b.edge} />
      <mesh geometry={b.top} material={b.paper} receiveShadow />

      {/* the brass route and its pen-nib bead */}
      <mesh ref={tubeMesh} geometry={b.tube} material={b.brass} castShadow />
      <mesh ref={tip} material={b.brass} castShadow>
        <sphereGeometry args={[TUBE_R * 1.9, 20, 14]} />
      </mesh>

      {b.pins.map((p) => (
        <group key={p.id}>
          <mesh geometry={b.disc} material={p.discMat} position={p.disc as unknown as [number, number, number]} castShadow />
          <mesh geometry={b.tagGeo} material={[p.face, p.discMat]} position={p.tag as unknown as [number, number, number]} rotation={[-Math.PI / 2 + TAG_TILT, 0, 0]} castShadow />
        </group>
      ))}
    </>
  );
}
