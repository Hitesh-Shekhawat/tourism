"use client";

import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Place } from "@/content/explorer";
import { goTo, useExplorer } from "../store";

export const STEM = 0.42;
export type MarkerSpot = { place: Place; pos: THREE.Vector3 };

const shared = {
  stem: new THREE.CylinderGeometry(0.012, 0.012, STEM, 6),
  head: new THREE.SphereGeometry(0.062, 20, 14),
  ring: new THREE.RingGeometry(0.07, 0.095, 40),
  hit: new THREE.CylinderGeometry(0.2, 0.2, STEM * 1.5, 8),
};
const PIN = new THREE.Color("#a14d2a");
const PIN_ON = new THREE.Color("#e3893e");

const canPick = () => !useExplorer.getState().busy;

function Marker({ spot, show, index }: { spot: MarkerSpot; show: boolean; index: number }) {
  const { place, pos } = spot;
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const hover = useExplorer((s) => s.hoverPlace === place.id);
  const selected = useExplorer((s) => s.placeId === place.id);
  const interest = useExplorer((s) => s.interest);
  const match = !interest || place.interests.includes(interest);

  const mats = useMemo(() => {
    const hit = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
    hit.userData.baseOpacity = 0;
    const ringMat = new THREE.MeshBasicMaterial({ color: "#a14d2a", transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
    ringMat.userData.baseOpacity = 0.5;
    return { stem: new THREE.MeshStandardMaterial({ color: "#5e1a1a", roughness: 0.6 }), head: new THREE.MeshStandardMaterial({ color: PIN.clone(), roughness: 0.35, metalness: 0.1, emissive: new THREE.Color("#5e1a1a"), emissiveIntensity: 0.15 }), ring: ringMat, hit };
  }, []);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  useFrame((state, dt) => {
    const k = Math.min(1, dt * 10);
    const on = hover || selected;
    if (head.current) {
      const s = head.current.scale.x + ((on ? 1.5 : 1) - head.current.scale.x) * k;
      head.current.scale.setScalar(s);
      mats.head.color.lerp(on ? PIN_ON : PIN, k);
    }
    if (group.current) {
      const s = group.current.scale.x + ((match ? 1 : 0.62) - group.current.scale.x) * k;
      group.current.scale.set(s, group.current.scale.y, s);
    }
    if (ring.current) {
      const t = (state.clock.elapsedTime * 0.55 + index * 0.17) % 1;
      ring.current.scale.setScalar(1 + t * (on ? 3 : 2.2));
      mats.ring.opacity = (1 - t) * (match ? 0.55 : 0.18) * (group.current?.visible ? 1 : 0);
    }
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (canPick()) useExplorer.getState().set({ hoverPlace: place.id });
  };
  const out = () => {
    if (useExplorer.getState().hoverPlace === place.id) useExplorer.getState().set({ hoverPlace: null });
  };
  const pick = (e?: ThreeEvent<MouseEvent> | React.MouseEvent) => {
    e?.stopPropagation();
    if (canPick()) goTo(place.state, place.id);
  };

  return (
    <group ref={group} position={pos} name={`marker-${place.id}`}>
      <mesh geometry={shared.stem} material={mats.stem} position-y={STEM / 2} castShadow />
      <mesh ref={head} geometry={shared.head} material={mats.head} position-y={STEM} castShadow />
      <mesh ref={ring} geometry={shared.ring} material={mats.ring} rotation-x={-Math.PI / 2} position-y={0.012} />
      <mesh geometry={shared.hit} material={mats.hit} position-y={STEM * 0.7} onPointerOver={over} onPointerOut={out} onClick={pick} />
      {show && (
        <Html position={[0, STEM + 0.14, 0]} center zIndexRange={[3, 0]} className="atlas-html">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={`atlas-pin ${hover || selected ? "is-on" : ""} ${match ? "" : "is-dim"}`}
            onClick={pick}
            onPointerEnter={() => canPick() && useExplorer.getState().set({ hoverPlace: place.id })}
            onPointerLeave={out}
          >
            <span className="atlas-pin-name">{place.name}</span>
            {hover && !selected && (
              <span className="atlas-pin-preview">
                {place.summary}
                <span className="atlas-pin-cta">View details</span>
              </span>
            )}
          </button>
        </Html>
      )}
    </group>
  );
}

/** Pins for a state's places: stem, head and a pulsing ring on the ground, with a label that opens a preview on hover. */
export function MapMarkers({ spots, show }: { spots: MarkerSpot[]; show: boolean }) {
  return (
    <>
      {spots.map((s, i) => (
        <Marker key={s.place.id} spot={s} show={show} index={i} />
      ))}
    </>
  );
}
