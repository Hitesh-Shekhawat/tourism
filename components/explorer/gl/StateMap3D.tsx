"use client";

import gsap from "gsap";
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { placesIn } from "@/content/explorer";
import { boundsOf, fitProjection, type GeoCollection } from "@/lib/geo/projection";
import { reliefFor } from "@/lib/geo/relief";
import { noiseTextures } from "@/components/story/gl/textures";
import { LITE } from "@/components/story/gl/quality";
import { reducedMotion } from "../store";
import { extrudeFeature, footprint, outlineGeometry, setOpacity, terrain } from "./geometry";
import { MapMarkers, type MarkerSpot } from "./MapMarkers";

export const STATE_SIZE = 8;
export const STATE_DEPTH = 0.36;
const RELIEF_H = 0.62;

/** The projection a state map uses: fitted to the state alone, so every state fills the same space. */
export const stateProjection = (data: GeoCollection) => fitProjection(boundsOf(data.features), STATE_SIZE);

export type StateHandle = { leave: () => Promise<void>; markerPosition: (id: string) => THREE.Vector3 | null };

/** Horizontal sandstone strata for the slab's cut edge. */
function strataTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d")!;
  const bands = ["#b8875a", "#a77a50", "#c39466", "#9a6e47", "#b07f55", "#8f6640"];
  for (let y = 0; y < 128; y += 8) {
    g.fillStyle = bands[(y / 8) % bands.length];
    g.fillRect(0, y, 4, 8 + (y % 3));
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 1 / STATE_DEPTH);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * One state as a standalone object: a thick slab cut to its real boundary, a relief surface clipped to
 * the same outline, a brass border, and pins for its places. It rises into place when mounted, and
 * sinks away when the visitor leaves (leave()).
 */
export const StateMap3D = forwardRef<StateHandle, { id: string; data: GeoCollection; onEntered: () => void }>(function StateMap3D({ id, data, onEntered }, ref) {
  const root = useRef<THREE.Group>(null);
  const [labels, setLabels] = useState(false);

  const built = useMemo(() => {
    const f = data.features[0];
    const proj = stateProjection(data);
    const { normal, rough } = noiseTextures(256, 9, 1.4);
    normal.repeat.set(2.5, 2.5);
    const fp = footprint(f, proj, LITE ? 768 : 1280);
    const land = terrain(proj, reliefFor(id), fp, RELIEF_H, LITE ? 120 : 200);
    const strata = strataTexture();
    const slab = extrudeFeature(f, proj, STATE_DEPTH);
    const line = outlineGeometry(f, proj, STATE_DEPTH + 0.006);
    const mats = {
      top: new THREE.MeshStandardMaterial({ color: "#e2c9a0", roughness: 0.92 }),
      side: new THREE.MeshStandardMaterial({ map: strata, roughness: 0.95 }),
      land: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, alphaMap: fp.tex, alphaTest: 0.5, normalMap: normal, normalScale: new THREE.Vector2(0.45, 0.45) }),
      line: new THREE.LineBasicMaterial({ color: "#8a6a3a", transparent: true, opacity: 0.8 }),
    };
    mats.line.userData.baseOpacity = 0.8;
    const spots: MarkerSpot[] = placesIn(id).map((p) => {
      const [x, z] = proj(p.coords);
      return { place: p, pos: new THREE.Vector3(x, STATE_DEPTH + land.heightAt(x, z), z) };
    });
    const dispose = () => {
      [slab, line, land.geometry].forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      [normal, rough, fp.tex, strata].forEach((t) => t.dispose());
    };
    return { slab, line, land: land.geometry, mats, spots, dispose };
  }, [id, data]);

  useEffect(() => built.dispose, [built]);

  // Enter: rise and settle, then the pins grow out of the ground one by one
  useLayoutEffect(() => {
    const g = root.current!;
    const k = reducedMotion() ? 0.01 : 1;
    const o = { v: 0, s: 0.86 };
    const pins = built.spots.map((s) => g.getObjectByName(`marker-${s.place.id}`)).filter((p): p is THREE.Object3D => !!p);
    pins.forEach((p) => (p.scale.y = 0.001));
    const apply = () => {
      setOpacity(g, o.v);
      g.scale.setScalar(o.s);
      g.position.y = (1 - o.v) * -0.6;
      g.rotation.y = (1 - o.v) * -0.18;
    };
    apply();
    const tl = gsap.timeline({ onComplete: () => (setLabels(true), onEntered()) });
    tl.to(o, { v: 1, s: 1, duration: 1.15 * k, ease: "power3.out", onUpdate: apply });
    tl.to(pins.map((p) => p.scale), { y: 1, duration: 0.55 * k, ease: "back.out(2)", stagger: 0.07 * k }, 0.55 * k);
    return () => void tl.kill();
    // onEntered is stable for the life of this map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built]);

  useImperativeHandle(
    ref,
    () => ({
      leave: () =>
        new Promise<void>((resolve) => {
          const g = root.current;
          if (!g) return resolve();
          setLabels(false);
          const k = reducedMotion() ? 0.01 : 1;
          const o = { v: 1 };
          gsap.to(o, {
            v: 0,
            duration: 0.6 * k,
            ease: "power2.in",
            onUpdate: () => {
              setOpacity(g, o.v);
              g.scale.setScalar(0.92 + 0.08 * o.v);
              g.position.y = (1 - o.v) * -0.4;
            },
            onComplete: resolve,
          });
        }),
      markerPosition: (pid) => built.spots.find((s) => s.place.id === pid)?.pos.clone() ?? null,
    }),
    [built],
  );

  return (
    <group ref={root}>
      <mesh geometry={built.slab} material={[built.mats.top, built.mats.side]} castShadow receiveShadow />
      <mesh geometry={built.land} material={built.mats.land} position-y={STATE_DEPTH + 0.002} castShadow receiveShadow />
      <lineSegments geometry={built.line} material={built.mats.line} />
      <MapMarkers spots={built.spots} show={labels} />
    </group>
  );
});
