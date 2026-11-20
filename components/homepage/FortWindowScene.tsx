"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const STONE_BLOCK = new RoundedBoxGeometry(1, 1, 1, 2, 0.045);
const LATTICE_BAR = new THREE.BoxGeometry(1, 0.045, 0.085);
const ROSETTE_RING = new THREE.TorusGeometry(0.12, 0.022, 5, 14);
const ROSETTE_CENTER = new THREE.SphereGeometry(0.035, 8, 6);
const DOME = new THREE.SphereGeometry(0.23, 14, 10);

type Materials = {
  sandstone: THREE.MeshStandardMaterial;
  lightStone: THREE.MeshStandardMaterial;
  darkStone: THREE.MeshStandardMaterial;
  carved: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
};

export function FortWindowScene({ lowPower }: { lowPower: boolean }) {
  return (
    <Canvas
      aria-hidden="true"
      frameloop="demand"
      shadows={lowPower ? false : "percentage"}
      dpr={lowPower ? 1 : [1, 1.5]}
      camera={{ fov: 32, near: 0.1, far: 40, position: [0, 0.05, 13.3] }}
      gl={{ antialias: !lowPower, alpha: true, powerPreference: lowPower ? "low-power" : "high-performance" }}
    >
      <hemisphereLight args={["#fff1d2", "#554033", 1.55]} />
      <directionalLight
        castShadow={!lowPower}
        position={[-5, 7, 7]}
        intensity={2.2}
        color="#ffe1b4"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5.5}
        shadow-camera-right={5.5}
        shadow-camera-top={5.5}
        shadow-camera-bottom={-5.5}
        shadow-camera-far={24}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      <directionalLight position={[4, 3, -5]} intensity={0.8} color="#f0c897" />
      <FortArchitecture />
    </Canvas>
  );
}

function FortArchitecture() {
  const noise = useMemo(makeStoneNoise, []);
  const materials = useMemo<Materials>(() => ({
    sandstone: new THREE.MeshStandardMaterial({ color: "#c5a078", map: noise, roughnessMap: noise, roughness: 0.94 }),
    lightStone: new THREE.MeshStandardMaterial({ color: "#d9be98", map: noise, roughnessMap: noise, roughness: 0.91 }),
    darkStone: new THREE.MeshStandardMaterial({ color: "#806044", map: noise, roughnessMap: noise, roughness: 0.96 }),
    carved: new THREE.MeshStandardMaterial({ color: "#a77a4f", map: noise, roughnessMap: noise, roughness: 0.92 }),
    wood: new THREE.MeshStandardMaterial({ color: "#573923", roughness: 0.9 }),
  }), [noise]);

  useEffect(() => () => {
    noise.dispose();
    Object.values(materials).forEach((material) => material.dispose());
  }, [materials, noise]);

  return <Architecture materials={materials} />;
}

function Architecture({ materials }: { materials: Materials }) {
  return (
    <group>
      <StoneBlock position={[-2.35, 0, 0.26]} size={[0.42, 6.05, 0.72]} material={materials.sandstone} />
      <StoneBlock position={[2.35, 0, 0.26]} size={[0.42, 6.05, 0.72]} material={materials.sandstone} />
      <StoneBlock position={[0, 3.02, 0.25]} size={[4.7, 0.42, 0.7]} material={materials.sandstone} />
      <StoneBlock position={[0, -3.02, 0.25]} size={[4.7, 0.42, 0.7]} material={materials.sandstone} />

      <StoneBlock position={[-1.67, -0.32, 0.38]} size={[0.32, 5.05, 0.88]} material={materials.sandstone} />
      <StoneBlock position={[1.67, -0.32, 0.38]} size={[0.32, 5.05, 0.88]} material={materials.sandstone} />
      <StoneBlock position={[0, 2.2, 0.38]} size={[3.64, 0.32, 0.9]} material={materials.lightStone} />
      <StoneBlock position={[0, -2.84, 0.4]} size={[3.64, 0.34, 0.94]} material={materials.lightStone} />
      <StoneBlock position={[-1.49, -0.32, 0.9]} size={[0.055, 4.62, 0.08]} material={materials.carved} />
      <StoneBlock position={[1.49, -0.32, 0.9]} size={[0.055, 4.62, 0.08]} material={materials.carved} />
      <StoneBlock position={[0, 1.98, 0.9]} size={[3.05, 0.055, 0.08]} material={materials.carved} />
      <StoneBlock position={[0, -2.62, 0.9]} size={[3.05, 0.055, 0.08]} material={materials.carved} />

      {[-2.35, 2.35].flatMap((x) =>
        [-2.2, -1.1, 0, 1.1, 2.2].map((y) => (
          <StoneBlock key={`joint-${x}-${y}`} position={[x, y, 0.65]} size={[0.42, 0.018, 0.035]} material={materials.darkStone} />
        )),
      )}

      <JaliPanel position={[-2.08, 0, 0.45]} width={0.48} height={4.9} vertical materials={materials} />
      <JaliPanel position={[2.08, 0, 0.45]} width={0.48} height={4.9} vertical materials={materials} />
      <JaliPanel position={[0, 2.73, 0.45]} width={4.05} height={0.4} materials={materials} />
      <JaliPanel position={[0, -2.75, 0.45]} width={4.05} height={0.32} materials={materials} />

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 2.35, 0, 0.7]}>
          <StoneBlock position={[0, -2.25, 0]} size={[0.56, 0.22, 0.34]} material={materials.lightStone} />
          <StoneBlock position={[0, 2.25, 0]} size={[0.56, 0.22, 0.34]} material={materials.lightStone} />
          <StoneBlock position={[0, 0, 0.02]} size={[0.09, 4.2, 0.1]} material={materials.carved} />
        </group>
      ))}
      <StoneBlock position={[0, 3.25, 0.42]} size={[5.15, 0.16, 0.84]} material={materials.lightStone} />
      <StoneBlock position={[0, -3.25, 0.42]} size={[5.15, 0.18, 0.88]} material={materials.lightStone} />
      <StoneBlock position={[0, -3.36, 0.58]} size={[5.32, 0.08, 1.02]} material={materials.carved} />

      {[-2.36, 2.36].map((x) => (
        <group key={`cap-${x}`} position={[x, 3.42, 0.44]}>
          <StoneBlock position={[0, 0, 0]} size={[0.54, 0.12, 0.9]} material={materials.carved} />
          <mesh geometry={DOME} material={materials.lightStone} position={[0, 0.12, 0]} scale={[0.88, 0.44, 0.88]} castShadow />
        </group>
      ))}
    </group>
  );
}

function JaliPanel({
  position,
  width,
  height,
  vertical = false,
  materials,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  vertical?: boolean;
  materials: Materials;
}) {
  const lattice = useRef<THREE.InstancedMesh>(null);
  const segments = useMemo(() => makeLatticeSegments(width, height, 0.36), [height, width]);
  const ornaments = useMemo(() => {
    if (vertical) {
      return Array.from({ length: 6 }, (_, index) => [0, -2.05 + index * 0.82, 0.07] as [number, number, number]);
    }
    const count = Math.max(3, Math.floor(width / 0.68));
    return Array.from({ length: count }, (_, index) => [
      -((count - 1) * 0.68) / 2 + index * 0.68,
      0,
      0.07,
    ] as [number, number, number]);
  }, [vertical, width]);

  useLayoutEffect(() => {
    const mesh = lattice.current;
    if (!mesh) return;
    const object = new THREE.Object3D();
    segments.forEach(([x1, y1, x2, y2], index) => {
      object.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
      object.rotation.z = Math.atan2(y2 - y1, x2 - x1);
      object.scale.set(Math.hypot(x2 - x1, y2 - y1), 1, 1);
      object.updateMatrix();
      mesh.setMatrixAt(index, object.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [segments]);

  return (
    <group position={position}>
      <instancedMesh
        ref={lattice}
        args={[LATTICE_BAR, materials.wood, segments.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      />
      {ornaments.map(([x, y, z], index) => (
        <group key={`rosette-${index}`} position={[x, y, z + 0.035]}>
          <mesh geometry={ROSETTE_RING} material={materials.lightStone} castShadow />
          <mesh geometry={ROSETTE_CENTER} material={materials.carved} />
          {Array.from({ length: 4 }, (_, spoke) => (
            <mesh
              key={spoke}
              geometry={LATTICE_BAR}
              material={materials.lightStone}
              position={[0, 0, 0.015]}
              rotation={[0, 0, (spoke * Math.PI) / 4]}
              scale={[0.28, 0.55, 0.6]}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

function StoneBlock({
  position,
  size,
  material,
  rotation,
}: {
  position: [number, number, number];
  size: [number, number, number];
  material: THREE.Material;
  rotation?: [number, number, number];
}) {
  return <mesh geometry={STONE_BLOCK} material={material} position={position} scale={size} rotation={rotation} castShadow receiveShadow />;
}

function makeLatticeSegments(width: number, height: number, spacing: number) {
  const segments: [number, number, number, number][] = [];
  for (const slope of [-1, 1]) {
    for (let intercept = -height / 2 - width / 2; intercept <= height / 2 + width / 2; intercept += spacing) {
      const points: [number, number][] = [];
      for (const x of [-width / 2, width / 2]) {
        const y = slope * x + intercept;
        if (y >= -height / 2 && y <= height / 2) points.push([x, y]);
      }
      for (const y of [-height / 2, height / 2]) {
        const x = (y - intercept) / slope;
        if (x >= -width / 2 && x <= width / 2) points.push([x, y]);
      }
      if (points.length >= 2) {
        const first = points[0];
        const last = points[points.length - 1];
        segments.push([first[0], first[1], last[0], last[1]]);
      }
    }
  }
  return segments;
}

function makeStoneNoise() {
  const size = 96;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const hash = Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;
      const value = 226 + Math.floor(hash * 30);
      const index = (y * size + x) * 4;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
