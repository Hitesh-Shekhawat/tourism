"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Suspense } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Place } from "@/content/explorer";

export const COACH_CENTERS = [-8, -4.85, -1.7, 1.45, 4.6, 7.75, 10.9];
const ENGINE_CENTER = -11.4;
const COACH_STEP = 1 / 9;
const WIDE_DISTANCE = 32;

export type TrainProgress = { value: number };

type Props = {
  progress: TrainProgress;
  active: number;
  stops: Place[];
  photos: (string | null)[];
  onSelectStop: (index: number) => void;
  lowPower: boolean;
  staticScene: boolean;
  fallback: ReactNode;
};

type GeometrySet = {
  coach: THREE.BufferGeometry;
  roof: THREE.BufferGeometry;
  window: THREE.BufferGeometry;
  door: THREE.BufferGeometry;
  chassis: THREE.BufferGeometry;
  bogie: THREE.BufferGeometry;
  wheel: THREE.BufferGeometry;
  vent: THREE.BufferGeometry;
  rail: THREE.BufferGeometry;
  sleeper: THREE.BufferGeometry;
  ballast: THREE.BufferGeometry;
  engine: THREE.BufferGeometry;
  headlight: THREE.BufferGeometry;
  buffer: THREE.BufferGeometry;
  grille: THREE.BufferGeometry;
  coupler: THREE.BufferGeometry;
  goldLine: THREE.BufferGeometry;
};

type MaterialSet = {
  coach: THREE.MeshStandardMaterial;
  engine: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  brass: THREE.MeshStandardMaterial;
  brightBrass: THREE.MeshStandardMaterial;
  chassis: THREE.MeshStandardMaterial;
  wheel: THREE.MeshStandardMaterial;
  vent: THREE.MeshStandardMaterial;
  ballast: THREE.MeshStandardMaterial;
  sleeper: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  lamp: THREE.MeshStandardMaterial;
  ivory: THREE.MeshStandardMaterial;
};

/** A perspective, physically ordered train; scroll progress moves the camera, never the coaches. */
export function LuxuryTrainScene({ progress, active, stops, photos, onSelectStop, lowPower, staticScene, fallback }: Props) {
  return (
    <Canvas
      frameloop={staticScene ? "demand" : "always"}
      shadows={lowPower ? false : "soft"}
      dpr={lowPower ? 1 : [1, 1.5]}
      camera={{ fov: 38, near: 0.1, far: 120, position: [-0.5, 10, WIDE_DISTANCE] }}
      gl={{ antialias: !lowPower, alpha: false, powerPreference: "high-performance" }}
      fallback={fallback}
    >
      <color attach="background" args={["#342128"]} />
      <fog attach="fog" args={["#342128", 42, 78]} />
      <Reflections />
      <Lighting lowPower={lowPower} />
      <Suspense fallback={null}>
        <TrainWorld
          stops={stops}
          photos={photos}
          active={active}
          onSelectStop={onSelectStop}
          lowPower={lowPower}
          staticScene={staticScene}
        />
      </Suspense>
      <CameraJourney progress={progress} />
    </Canvas>
  );
}

function TrainWorld({
  stops,
  photos,
  active,
  onSelectStop,
  lowPower,
  staticScene,
}: {
  stops: Place[];
  photos: (string | null)[];
  active: number;
  onSelectStop: (index: number) => void;
  lowPower: boolean;
  staticScene: boolean;
}) {
  const photoUrls = useMemo(() => photos.filter((photo): photo is string => !!photo), [photos]);
  const loadedPhotos = useLoader(THREE.TextureLoader, photoUrls);
  const photoTextures = useMemo(
    () => photos.map((photo) => photo ? loadedPhotos[photoUrls.indexOf(photo)] : null),
    [photos, photoUrls, loadedPhotos],
  );
  photoTextures.forEach((texture) => {
    if (texture) texture.colorSpace = THREE.SRGBColorSpace;
  });
  const parts = useTrainParts();
  return (
    <>
      <Railway geometries={parts.geometries} materials={parts.materials} />
      <Train
        stops={stops}
        photos={photoTextures}
        photoSources={photos}
        active={active}
        onSelectStop={onSelectStop}
        lowPower={lowPower}
        staticScene={staticScene}
        geometries={parts.geometries}
        materials={parts.materials}
      />
    </>
  );
}

function Reflections() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04).texture;
    scene.environment = environment;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = null;
      environment.dispose();
    };
  }, [gl, scene]);

  return null;
}

function Lighting({ lowPower }: { lowPower: boolean }) {
  return (
    <>
      <hemisphereLight args={["#fff0d9", "#584044", 1.7]} />
      <directionalLight
        castShadow={!lowPower}
        position={[-10, 15, 11]}
        intensity={2.2}
        color="#ffe1b3"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={14}
        shadow-camera-bottom={-5}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[4, 8, -8]} intensity={0.85} color="#c5c9e2" />
      <directionalLight position={[0, 4, 12]} intensity={0.4} color="#f0bd85" />
    </>
  );
}

function useTrainParts() {
  const geometries = useMemo<GeometrySet>(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.2, 0.58);
    shape.lineTo(-2.2, 1.06);
    shape.lineTo(-1.86, 1.38);
    shape.lineTo(-1.18, 1.58);
    shape.lineTo(-0.88, 2.24);
    shape.lineTo(0.7, 2.24);
    shape.lineTo(1.05, 2.45);
    shape.lineTo(1.7, 2.45);
    shape.lineTo(2.05, 1.52);
    shape.lineTo(2.05, 0.58);
    shape.closePath();
    const engine = new THREE.ExtrudeGeometry(shape, {
      depth: 1.9,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.055,
      bevelThickness: 0.055,
    });
    engine.translate(0, 0, -0.95);
    engine.computeVertexNormals();

    return {
      coach: new RoundedBoxGeometry(2.9, 1.55, 1.86, 3, 0.16),
      roof: new RoundedBoxGeometry(2.78, 0.18, 1.72, 3, 0.08),
      window: new RoundedBoxGeometry(0.36, 0.5, 0.055, 2, 0.035),
      door: new RoundedBoxGeometry(0.43, 1.22, 0.06, 2, 0.035),
      chassis: new RoundedBoxGeometry(2.55, 0.24, 1.45, 2, 0.05),
      bogie: new RoundedBoxGeometry(1.02, 0.2, 1.65, 2, 0.045),
      wheel: new THREE.CylinderGeometry(0.35, 0.35, 0.16, 24),
      vent: new RoundedBoxGeometry(0.42, 0.16, 0.32, 2, 0.035),
      rail: new THREE.BoxGeometry(70, 0.13, 0.14),
      sleeper: new THREE.BoxGeometry(0.22, 0.14, 3.7),
      ballast: new THREE.BoxGeometry(70, 0.16, 4.2),
      engine,
      headlight: new THREE.CylinderGeometry(0.16, 0.16, 0.16, 24),
      buffer: new THREE.CylinderGeometry(0.12, 0.12, 0.32, 20),
      grille: new THREE.BoxGeometry(0.045, 0.34, 0.06),
      coupler: new RoundedBoxGeometry(0.42, 0.12, 0.16, 2, 0.035),
      goldLine: new THREE.BoxGeometry(2.35, 0.055, 0.025),
    };
  }, []);

  const materials = useMemo<MaterialSet>(() => ({
    coach: new THREE.MeshStandardMaterial({ color: "#542832", metalness: 0.62, roughness: 0.32 }),
    engine: new THREE.MeshStandardMaterial({ color: "#4b222c", metalness: 0.72, roughness: 0.28 }),
    roof: new THREE.MeshStandardMaterial({ color: "#3d2429", metalness: 0.58, roughness: 0.38 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#253440", metalness: 0.54, roughness: 0.16, clearcoat: 0.9, clearcoatRoughness: 0.12 }),
    brass: new THREE.MeshStandardMaterial({ color: "#a7814e", metalness: 0.83, roughness: 0.31 }),
    brightBrass: new THREE.MeshStandardMaterial({ color: "#d0ad70", metalness: 0.76, roughness: 0.25 }),
    chassis: new THREE.MeshStandardMaterial({ color: "#292428", metalness: 0.65, roughness: 0.52 }),
    wheel: new THREE.MeshStandardMaterial({ color: "#343236", metalness: 0.72, roughness: 0.4 }),
    vent: new THREE.MeshStandardMaterial({ color: "#866342", metalness: 0.62, roughness: 0.42 }),
    ballast: new THREE.MeshStandardMaterial({ color: "#55463d", roughness: 0.94 }),
    sleeper: new THREE.MeshStandardMaterial({ color: "#4b3830", roughness: 0.92 }),
    steel: new THREE.MeshStandardMaterial({ color: "#778083", metalness: 0.86, roughness: 0.31 }),
    lamp: new THREE.MeshStandardMaterial({ color: "#ffe0a6", emissive: "#ef9f47", emissiveIntensity: 1.1, metalness: 0.15, roughness: 0.25 }),
    ivory: new THREE.MeshStandardMaterial({ color: "#e9d8b8", metalness: 0.35, roughness: 0.45 }),
  }), []);

  useEffect(() => () => {
    Object.values(geometries).forEach((geometry) => geometry.dispose());
    Object.values(materials).forEach((material) => material.dispose());
  }, [geometries, materials]);

  return { geometries, materials };
}

function Railway({ geometries, materials }: { geometries: GeometrySet; materials: MaterialSet }) {
  const ties = useRef<THREE.InstancedMesh>(null);
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const count = 81;
    const values: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      dummy.position.set(-30 + i * 0.75, -0.08, 0);
      dummy.updateMatrix();
      values.push(dummy.matrix.clone());
    }
    return values;
  }, []);

  useLayoutEffect(() => {
    const mesh = ties.current;
    if (!mesh) return;
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <group>
      <mesh geometry={geometries.ballast} material={materials.ballast} position={[0, -0.12, 0]} receiveShadow />
      <instancedMesh ref={ties} args={[geometries.sleeper, materials.sleeper, matrices.length]} />
      {[-1.02, 1.02].map((z) => (
        <mesh key={z} geometry={geometries.rail} material={materials.steel} position={[0, 0.055, z]} castShadow receiveShadow />
      ))}
    </group>
  );
}

function Train({
  stops,
  photos,
  photoSources,
  active,
  onSelectStop,
  lowPower,
  staticScene,
  geometries,
  materials,
}: {
  stops: Place[];
  photos: (THREE.Texture | null)[];
  photoSources: (string | null)[];
  active: number;
  onSelectStop: (index: number) => void;
  lowPower: boolean;
  staticScene: boolean;
  geometries: GeometrySet;
  materials: MaterialSet;
}) {
  return (
    <group>
      <Locomotive geometries={geometries} materials={materials} onSelect={() => onSelectStop(-1)} lowPower={lowPower} />
      {stops.map((place, index) => (
        <Coach
          key={place.id}
          place={place}
          photo={photos[index]}
          photoSource={photoSources[index]}
          index={index}
          x={COACH_CENTERS[index]}
          active={active === index}
          onSelect={() => onSelectStop(index)}
          geometries={geometries}
          materials={materials}
          lowPower={lowPower}
          staticScene={staticScene}
        />
      ))}
      <Couplers geometries={geometries} materials={materials} />
    </group>
  );
}

function Locomotive({
  geometries,
  materials,
  onSelect,
  lowPower,
}: {
  geometries: GeometrySet;
  materials: MaterialSet;
  onSelect: () => void;
  lowPower: boolean;
}) {
  return (
    <group position={[ENGINE_CENTER, 0, 0]} onClick={(event) => { event.stopPropagation(); onSelect(); }}>
      <mesh geometry={geometries.engine} material={materials.engine} castShadow receiveShadow />
      <mesh geometry={geometries.chassis} material={materials.chassis} position={[0, 0.56, 0]} castShadow />
      <mesh geometry={geometries.roof} material={materials.roof} position={[0.2, 2.47, 0]} />
      {[-0.58, 0.58].map((z) => (
        <group key={z}>
          <mesh geometry={geometries.window} material={materials.glass} position={[-0.78, 1.78, z * 1.62]} rotation-z={-0.37} />
          <mesh geometry={geometries.window} material={materials.glass} position={[0.33, 1.89, z * 1.62]} />
        </group>
      ))}
      <mesh geometry={geometries.window} material={materials.glass} position={[-2.08, 1.12, 0]} rotation-y={-Math.PI / 2} scale={[1.3, 1.1, 1]} />
      {[-0.62, 0.62].map((z) => (
        <group key={z}>
          <mesh geometry={geometries.headlight} material={materials.brightBrass} position={[-2.1, 1.05, z]} rotation-z={Math.PI / 2} />
          <mesh geometry={geometries.headlight} material={materials.lamp} position={[-2.2, 1.05, z]} rotation-z={Math.PI / 2} />
          <mesh geometry={geometries.buffer} material={materials.steel} position={[-2.2, 0.55, z * 1.28]} rotation-z={Math.PI / 2} />
        </group>
      ))}
      {!lowPower && Array.from({ length: 7 }, (_, index) => (
        <mesh
          key={index}
          geometry={geometries.grille}
          material={materials.brightBrass}
          position={[-2.12, 0.81, -0.35 + index * 0.12]}
        />
      ))}
      <mesh geometry={geometries.goldLine} material={materials.brightBrass} position={[0, 0.99, 0.958]} />
      {[-0.1, 0.85].map((x) => (
        <mesh key={x} geometry={geometries.vent} material={materials.vent} position={[x, 2.61, 0]} />
      ))}
      <Bogie x={-1.2} geometries={geometries} materials={materials} animate={!lowPower} />
      <Bogie x={0.85} geometries={geometries} materials={materials} animate={!lowPower} />
      <mesh geometry={geometries.coupler} material={materials.steel} position={[2.22, 0.63, 0]} />
    </group>
  );
}

function Coach({
  place,
  photo,
  photoSource,
  index,
  x,
  active,
  onSelect,
  geometries,
  materials,
  lowPower,
  staticScene,
}: {
  place: Place;
  photo: THREE.Texture | null;
  photoSource: string | null;
  index: number;
  x: number;
  active: boolean;
  onSelect: () => void;
  geometries: GeometrySet;
  materials: MaterialSet;
  lowPower: boolean;
  staticScene: boolean;
}) {
  const coach = useRef<THREE.Group>(null);
  const sign = useMemo(() => makeSign(place.name, index), [place.name, index]);
  useEffect(() => () => sign.dispose(), [sign]);
  useFrame((_, delta) => {
    if (coach.current) coach.current.scale.setScalar(THREE.MathUtils.damp(coach.current.scale.x, active ? 1.14 : 1, 6, delta));
  });
  return (
    <group
      ref={coach}
      position={[x, 0, 0]}
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerOver={(event) => event.stopPropagation()}
    >
      {active && !staticScene && (
        <Html position={[0, 1.55, 1.08]} center distanceFactor={14} zIndexRange={[8, 0]}>
          <article className="train-bogie-detail" aria-live="polite" aria-label={`${place.name} coach details`}>
            {photoSource && <img className="train-bogie-detail-photo" src={photoSource} alt="" draggable={false} />}
            <div className="train-bogie-detail-copy">
              <p className="train-bogie-detail-meta">Destination {String(index + 1).padStart(2, "0")} · Coach {String(index + 1).padStart(2, "0")}</p>
              <h3 className="font-display">{place.name}</h3>
              <p className="train-bogie-detail-summary">{place.summary}</p>
            </div>
          </article>
        </Html>
      )}
      <mesh geometry={geometries.chassis} material={materials.chassis} position={[0, 0.63, 0]} castShadow />
      <mesh
        geometry={geometries.coach}
        position={[0, 1.55, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={active ? "#6d3740" : "#542832"}
          metalness={0.62}
          roughness={0.32}
          emissive={active ? "#4b211c" : "#000000"}
          emissiveIntensity={active ? 0.2 : 0}
        />
      </mesh>
      <mesh geometry={geometries.roof} material={materials.roof} position={[0, 2.4, 0]} castShadow />
      {[-1, 1].map((side) => (
        <group key={side} position={[0, 0, side * 0.945]}>
          <mesh geometry={geometries.goldLine} material={materials.brightBrass} position={[0, 1.02, side * 0.025]} scale={[1.18, 1, 1]} />
          <mesh geometry={geometries.goldLine} material={materials.brightBrass} position={[0, 1.17, side * 0.025]} scale={[1.18, 0.7, 1]} />
          {[-1.12, -0.56, 0, 0.56, 1.12].map((windowX) => {
            const photoWindow = windowX === 0;
            const scale: [number, number, number] = photoWindow ? [1.8, 1.45, 1] : [1, 1, 1];
            return (
              <group key={windowX}>
                <mesh
                  geometry={geometries.window}
                  material={materials.brass}
                  position={[windowX, 1.78, 0]}
                  scale={scale}
                />
                <mesh
                  geometry={geometries.window}
                  position={[windowX, 1.78, side * 0.035]}
                  scale={scale}
                >
                  {photoWindow && photo ? (
                    <meshBasicMaterial map={photo} side={THREE.DoubleSide} toneMapped={false} />
                  ) : (
                    <meshPhysicalMaterial
                      color="#253440"
                      metalness={0.54}
                      roughness={0.16}
                      clearcoat={0.9}
                      clearcoatRoughness={0.12}
                    />
                  )}
                </mesh>
              </group>
            );
          })}
          <mesh geometry={geometries.door} material={materials.brass} position={[1.28, 1.54, 0]} />
          <mesh geometry={geometries.door} material={materials.engine} position={[1.28, 1.54, side * 0.04]} />
          <mesh geometry={geometries.window} material={materials.glass} position={[1.28, 1.81, side * 0.08]} scale={[0.72, 0.65, 1]} />
          <mesh position={[-0.02, 1.37, side * 0.045]}>
            <planeGeometry args={[0.95, 0.26]} />
            <meshBasicMaterial map={sign} color="#fff4dd" side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {!lowPower && [-0.85, 0, 0.85].map((ventX) => (
        <mesh key={ventX} geometry={geometries.vent} material={materials.vent} position={[ventX, 2.52, 0]} />
      ))}
      <Bogie x={-0.92} geometries={geometries} materials={materials} animate={!lowPower} />
      <Bogie x={0.92} geometries={geometries} materials={materials} animate={!lowPower} />
      <mesh geometry={geometries.coupler} material={materials.steel} position={[-1.58, 0.63, 0]} scale={[0.8, 1, 1]} />
      <mesh geometry={geometries.coupler} material={materials.steel} position={[1.58, 0.63, 0]} scale={[0.8, 1, 1]} />
    </group>
  );
}

function Bogie({ x, geometries, materials, animate }: { x: number; geometries: GeometrySet; materials: MaterialSet; animate: boolean }) {
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, delta) => {
    if (!animate) return;
    wheels.current.forEach((wheel) => {
      if (wheel) wheel.rotation.y += delta * 0.9;
    });
  });
  return (
    <group position={[x, 0, 0]}>
      <mesh geometry={geometries.bogie} material={materials.chassis} position={[0, 0.48, 0]} />
      {[-1, 1].map((side, index) => (
        <mesh
          key={side}
          ref={(wheel) => { wheels.current[index] = wheel; }}
          geometry={geometries.wheel}
          material={materials.wheel}
          position={[0, 0.39, side * 0.88]}
          rotation-x={Math.PI / 2}
          castShadow
        />
      ))}
    </group>
  );
}

function Couplers({ geometries, materials }: { geometries: GeometrySet; materials: MaterialSet }) {
  return (
    <group>
      {COACH_CENTERS.slice(0, -1).map((center, index) => {
        const x = center + 1.575;
        return (
          <group key={index} position={[x, 0, 0]}>
            <mesh geometry={geometries.coupler} material={materials.steel} position={[0, 0.64, 0]} scale={[0.78, 0.85, 0.75]} />
            <mesh geometry={geometries.coupler} material={materials.brightBrass} position={[0, 0.66, 0]} scale={[0.42, 0.4, 0.45]} />
          </group>
        );
      })}
    </group>
  );
}

function makeSign(name: string, index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 144;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#3e222a";
    context.fillRect(0, 0, 512, 144);
    context.strokeStyle = "#c5a26c";
    context.lineWidth = 6;
    context.strokeRect(8, 8, 496, 128);
    context.fillStyle = "#f3e7d0";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "600 38px Georgia, serif";
    context.fillText(name.toUpperCase(), 256, 72, 460);
    context.fillStyle = "#d4b578";
    context.font = "20px Arial, sans-serif";
    context.fillText(`COACH ${String(index + 1).padStart(2, "0")}`, 256, 116);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function CameraJourney({ progress }: { progress: TrainProgress }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const position = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const smoothPosition = useMemo(() => new THREE.Vector3(-0.5, 10, WIDE_DISTANCE), []);
  const smoothTarget = useMemo(() => new THREE.Vector3(-0.5, 1.45, 0), []);

  useFrame((_, delta) => {
    const pose = cameraPose(progress.value, camera.aspect);
    position.set(pose.x, pose.y, pose.z);
    target.set(pose.targetX, pose.targetY, 0);
    const damping = 1 - Math.exp(-delta * 5);
    smoothPosition.lerp(position, damping);
    smoothTarget.lerp(target, damping);
    camera.position.copy(smoothPosition);
    camera.lookAt(smoothTarget);
  });

  return null;
}

type Pose = { at: number; x: number; y: number; z: number; targetX: number; targetY: number };
const poses: Pose[] = [
  { at: 0, x: -0.5, y: 10, z: WIDE_DISTANCE, targetX: -0.5, targetY: 1.45 },
  { at: COACH_STEP, x: -15.7, y: 6.8, z: 19, targetX: -10.7, targetY: 1.45 },
  ...COACH_CENTERS.map((x, index) => ({
    at: (index + 2) * COACH_STEP,
    x: x - 4.6,
    y: 5.8,
    z: 15.8,
    targetX: x,
    targetY: 1.55,
  })),
  { at: 1, x: -0.5, y: 10, z: 34, targetX: -0.5, targetY: 1.45 },
];

function cameraPose(progress: number, aspect: number) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const nextIndex = poses.findIndex((pose) => pose.at >= p);
  const next = poses[Math.max(1, nextIndex)];
  const previous = poses[Math.max(0, nextIndex - 1)];
  const span = Math.max(0.0001, next.at - previous.at);
  const t = THREE.MathUtils.clamp((p - previous.at) / span, 0, 1);
  const eased = t * t * (3 - 2 * t);
  const horizontalHalfFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(38 / 2)) * aspect);
  const wideZ = Math.max(24, 27 / (2 * Math.tan(horizontalHalfFov)));
  return {
    x: THREE.MathUtils.lerp(previous.x, next.x, eased),
    y: THREE.MathUtils.lerp(previous.y, next.y, eased),
    z: THREE.MathUtils.lerp(
      previous.at === 0 || previous.at === 1 ? wideZ : previous.z,
      next.at === 0 || next.at === 1 ? wideZ : next.z,
      eased,
    ),
    targetX: THREE.MathUtils.lerp(previous.targetX, next.targetX, eased),
    targetY: THREE.MathUtils.lerp(previous.targetY, next.targetY, eased),
  };
}
