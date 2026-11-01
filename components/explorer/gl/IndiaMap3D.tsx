"use client";

import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { isOpenState, openStates } from "@/content/explorer";
import { centroidOf, type GeoCollection, type Projection } from "@/lib/geo/projection";
import { noiseTextures } from "@/components/story/gl/textures";
import { goTo, useExplorer } from "../store";
import { extrudeFeature, outlineGeometry } from "./geometry";

export const INDIA_DEPTH = 0.16;

// Sandstone tones for the states, terracotta for those open to explore, and the hover / selected warmth
const TONES = ["#e8d6b6", "#dfc9a4", "#ead9bd", "#d9c19a", "#e3cfab"];
const OPEN = "#d49a6a";
const HOVER = new THREE.Color("#c4733f");
const SELECTED = new THREE.Color("#a14d2a");

type StateMesh = { id: string; name: string; open: boolean; geo: THREE.ExtrudeGeometry; line: THREE.BufferGeometry; top: THREE.MeshStandardMaterial; side: THREE.MeshStandardMaterial; base: THREE.Color; lift: number };

const canPick = () => {
  const s = useExplorer.getState();
  return s.started && !s.busy && !s.stateId;
};

/**
 * The India map: every state an extruded slab of its real boundary, with its border drawn on top.
 * Hover lifts and warms a state; the selected one rises further while the camera moves in.
 */
export const IndiaMap3D = forwardRef<THREE.Group, { data: GeoCollection; proj: Projection; selected: string | null }>(function IndiaMap3D({ data, proj, selected }, ref) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const textures = useMemo(() => noiseTextures(256, 5, 1.6), []);

  const states = useMemo<StateMesh[]>(() => {
    const normal = textures.normal.clone();
    normal.repeat.set(0.6, 0.6);
    normal.needsUpdate = true;
    return data.features.map((f, i) => {
      const open = isOpenState(f.properties.id);
      const base = new THREE.Color(open ? OPEN : TONES[i % TONES.length]);
      return {
        id: f.properties.id,
        name: f.properties.name,
        open,
        geo: extrudeFeature(f, proj, INDIA_DEPTH),
        line: outlineGeometry(f, proj, INDIA_DEPTH + 0.003),
        top: new THREE.MeshStandardMaterial({ color: base.clone(), roughness: 0.86, metalness: 0, normalMap: normal, normalScale: new THREE.Vector2(0.35, 0.35) }),
        side: new THREE.MeshStandardMaterial({ color: base.clone().multiplyScalar(0.7), roughness: 0.95 }),
        base,
        lift: 0,
      };
    });
  }, [data, proj, textures]);

  const lineMat = useMemo(() => {
    const m = new THREE.LineBasicMaterial({ color: "#7a4a2c", transparent: true, opacity: 0.55 });
    m.userData.baseOpacity = 0.55;
    return m;
  }, []);

  useEffect(
    () => () => {
      states.forEach((s) => {
        s.geo.dispose();
        s.line.dispose();
        s.top.dispose();
        s.side.dispose();
      });
    },
    [states],
  );
  useEffect(
    () => () => {
      textures.normal.dispose();
      textures.rough.dispose();
      lineMat.dispose();
    },
    [textures, lineMat],
  );

  const labels = useMemo(
    () =>
      openStates
        .map((o) => {
          const f = data.features.find((x) => x.properties.id === o.id);
          if (!f) return null;
          const [x, z] = proj(centroidOf(f));
          return { ...o, pos: [x, INDIA_DEPTH + 0.35, z] as [number, number, number] };
        })
        .filter((l) => !!l),
    [data, proj],
  );

  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const hover = useExplorer.getState().hover;
    const k = Math.min(1, dt * 9);
    states.forEach((s, i) => {
      const target = s.id === selected ? 0.24 : s.id === hover ? 0.1 : 0;
      s.lift += (target - s.lift) * k;
      const g = groups.current[i];
      if (g) g.position.y = s.lift;
      tmp.copy(s.base);
      if (s.id === selected) tmp.lerp(SELECTED, 0.85);
      else if (s.id === hover) tmp.lerp(HOVER, s.open ? 0.7 : 0.4);
      s.top.color.lerp(tmp, k);
      s.side.color.copy(s.top.color).multiplyScalar(0.7);
    });
  });

  const over = (id: string) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (canPick()) useExplorer.getState().set({ hover: id });
  };
  const out = (id: string) => () => {
    if (useExplorer.getState().hover === id) useExplorer.getState().set({ hover: null });
  };
  const click = (id: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (canPick()) goTo(id);
  };

  return (
    <group ref={ref}>
      {states.map((s, i) => (
        <group key={s.id} ref={(g) => void (groups.current[i] = g)}>
          <mesh geometry={s.geo} material={[s.top, s.side]} castShadow receiveShadow onPointerOver={over(s.id)} onPointerOut={out(s.id)} onClick={click(s.id)} />
          <lineSegments geometry={s.line} material={lineMat} />
        </group>
      ))}
      {labels.map((l) => (
        <Html key={l.id} position={l.pos} center zIndexRange={[3, 0]} className="atlas-html">
          <button type="button" className="atlas-open-chip" onClick={() => canPick() && goTo(l.id)} tabIndex={-1} aria-hidden="true">
            <span className="atlas-pulse" />
            {l.name}
            <span className="atlas-open-chip-note">Open now</span>
          </button>
        </Html>
      ))}
    </group>
  );
});
