"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Suspense } from "react";
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
      <color attach="background" args={["#b77a5c"]} />
      <fog attach="fog" args={["#d69a6b", 82, 152]} />
      <DesertSky />
      <Reflections />
      <Desert lowPower={lowPower} />
      <Lighting lowPower={lowPower} />
      <Suspense fallback={null}>
        <TrainWorld
          progress={progress}
          stops={stops}
          photos={photos}
          active={active}
          onSelectStop={onSelectStop}
          lowPower={lowPower}
          staticScene={staticScene}
        />
      </Suspense>
      <CameraJourney progress={progress} staticScene={staticScene} />
    </Canvas>
  );
}

function TrainWorld({
  progress,
  stops,
  photos,
  active,
  onSelectStop,
  lowPower,
  staticScene,
}: {
  progress: TrainProgress;
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
        progress={progress}
        stops={stops}
        photos={photoTextures}
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
      <hemisphereLight args={["#ffe9c9", "#71503e", 1.65]} />
      <directionalLight
        castShadow={!lowPower}
        position={[-18, 19, -38]}
        intensity={2.5}
        color="#ffd18d"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={14}
        shadow-camera-bottom={-5}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[4, 8, 8]} intensity={0.55} color="#d6b7a0" />
      <pointLight position={[2, 7, -68]} intensity={85} distance={115} decay={2} color="#ffad5c" />
    </>
  );
}

function DesertSky() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      horizon: { value: new THREE.Color("#e7a36f") },
      zenith: { value: new THREE.Color("#5f414b") },
      sunGlow: { value: new THREE.Color("#ffd18b") },
      sunDirection: { value: new THREE.Vector3(2, 7, -68).normalize() },
    },
    vertexShader: `
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 horizon;
      uniform vec3 zenith;
      uniform vec3 sunGlow;
      uniform vec3 sunDirection;
      varying vec3 vDirection;
      void main() {
        float height = smoothstep(-0.2, 0.72, vDirection.y);
        float glow = pow(max(dot(normalize(vDirection), sunDirection), 0.0), 18.0);
        vec3 sky = mix(horizon, zenith, height);
        sky = mix(sky, sunGlow, glow * 0.8);
        gl_FragColor = vec4(sky, 1.0);
      }
    `,
  }), []);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <>
      <mesh>
        <sphereGeometry args={[110, 32, 24]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[2, 7, -68]}>
        <sphereGeometry args={[3.1, 32, 24]} />
        <meshBasicMaterial color="#ffe0a0" toneMapped={false} />
      </mesh>
    </>
  );
}

function makeDunesGeometry() {
  const geometry = new THREE.PlaneGeometry(184, 72, 128, 48);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const vertices = positions.array as Float32Array;
  const colors: number[] = [];
  const trough = new THREE.Color("#b47a50");
  const crest = new THREE.Color("#e1b979");
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const z = vertices[i + 2] - 42;
    const ridgeFar = -52 + 15 * Math.sin(x * 0.027 + 1.2);
    const ridgeMiddle = -30 + 9 * Math.sin(x * 0.031 + 0.4);
    const ridgeNear = -7 + 4 * Math.sin(x * 0.037 - 0.8);
    const farDune = 4.8 * Math.exp(-(((z - ridgeFar) / 12) ** 2));
    const middleDune = 4.2 * Math.exp(-(((z - ridgeMiddle) / 8) ** 2));
    const nearDune = 3.1 * Math.exp(-(((z - ridgeNear) / 8) ** 2));
    const ripple = 0.045 * Math.sin(x * 0.16 + z * 0.12) * Math.sin(z * 0.1);
    const y = 0.02 + farDune + middleDune + nearDune + ripple;
    vertices[i + 1] = y;
    vertices[i + 2] = z;
    const shade = THREE.MathUtils.clamp((y - 0.02) / 3.5 + 0.18 * Math.sin(x * 0.025 + z * 0.04), 0, 0.78);
    const color = trough.clone().lerp(crest, shade);
    colors.push(color.r, color.g, color.b);
  }
  positions.needsUpdate = true;
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function makeSandTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (context) {
    const image = context.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const grain = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const value = 237 + Math.floor((grain - Math.floor(grain)) * 19);
        image.data[index] = value;
        image.data[index + 1] = value;
        image.data[index + 2] = value;
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(78, 30);
  return texture;
}

function Desert({ lowPower }: { lowPower: boolean }) {
  const dunes = useMemo(makeDunesGeometry, []);
  const texture = useMemo(makeSandTexture, []);
  const sand = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e1b779", roughness: 0.96, vertexColors: true, side: THREE.DoubleSide, map: texture }), [texture]);
  const ground = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a96f49", roughness: 1, map: texture }), [texture]);
  useEffect(() => () => {
    dunes.dispose();
    texture.dispose();
    sand.dispose();
    ground.dispose();
  }, [dunes, texture, sand, ground]);
  return (
    <>
      <mesh geometry={dunes} material={sand} receiveShadow />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.22, -32]} receiveShadow>
        <planeGeometry args={[220, 160]} />
        <primitive object={ground} attach="material" />
      </mesh>
      <SandDrift lowPower={lowPower} />
    </>
  );
}

function SandDrift({ lowPower }: { lowPower: boolean }) {
  const points = useRef<THREE.Points>(null);
  const { geometry, base } = useMemo(() => {
    const count = lowPower ? 160 : 420;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      values[i * 3] = (Math.sin(i * 127.1) * 0.5 + 0.5) * 90 - 45;
      values[i * 3 + 1] = 0.08 + (Math.sin(i * 79.7) * 0.5 + 0.5) * 0.9;
      values[i * 3 + 2] = (Math.sin(i * 31.4) * 0.5 + 0.5) * 20 - 7;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(values.slice(), 3));
    return { geometry, base: values };
  }, [lowPower]);
  const material = useMemo(() => new THREE.PointsMaterial({
    color: "#f6d29a",
    size: 0.045,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    sizeAttenuation: true,
  }), []);
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);
  useFrame((state) => {
    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = attribute.array as Float32Array;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = ((base[i] + time * (0.42 + (i % 7) * 0.018) + 45) % 90) - 45;
      positions[i + 1] = base[i + 1] + Math.sin(time * 1.2 + i) * 0.035;
    }
    attribute.needsUpdate = true;
  });
  return <points ref={points} geometry={geometry} material={material} />;
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
  progress,
  stops,
  photos,
  active,
  onSelectStop,
  lowPower,
  staticScene,
  geometries,
  materials,
}: {
  progress: TrainProgress;
  stops: Place[];
  photos: (THREE.Texture | null)[];
  active: number;
  onSelectStop: (index: number) => void;
  lowPower: boolean;
  staticScene: boolean;
  geometries: GeometrySet;
  materials: MaterialSet;
}) {
  const train = useRef<THREE.Group>(null);
  const wheelMotion = useRef(0);
  useLayoutEffect(() => {
    if (train.current) train.current.position.x = staticScene ? 0 : trainOffset(progress.value);
  }, [staticScene, progress]);
  useFrame((_, delta) => {
    if (!train.current) return;
    const current = train.current.position.x;
    const next = THREE.MathUtils.damp(current, staticScene ? 0 : trainOffset(progress.value), 5, delta);
    wheelMotion.current = delta > 0 ? Math.abs(next - current) / delta : 0;
    train.current.position.x = next;
  });
  return (
    <group ref={train}>
      <Locomotive geometries={geometries} materials={materials} onSelect={() => onSelectStop(-1)} wheelMotion={wheelMotion} />
      {stops.map((place, index) => (
        <Coach
          key={place.id}
          place={place}
          photo={photos[index]}
          index={index}
          x={COACH_CENTERS[index]}
          active={active === index}
          onSelect={() => onSelectStop(index)}
          geometries={geometries}
          materials={materials}
          lowPower={lowPower}
          wheelMotion={wheelMotion}
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
  wheelMotion,
}: {
  geometries: GeometrySet;
  materials: MaterialSet;
  onSelect: () => void;
  wheelMotion: { current: number };
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
      {Array.from({ length: 7 }, (_, index) => (
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
      <Bogie x={-1.2} geometries={geometries} materials={materials} wheelMotion={wheelMotion} />
      <Bogie x={0.85} geometries={geometries} materials={materials} wheelMotion={wheelMotion} />
      <mesh geometry={geometries.coupler} material={materials.steel} position={[2.22, 0.63, 0]} />
    </group>
  );
}

function Coach({
  place,
  photo,
  index,
  x,
  active,
  onSelect,
  geometries,
  materials,
  lowPower,
  wheelMotion,
  staticScene,
}: {
  place: Place;
  photo: THREE.Texture | null;
  index: number;
  x: number;
  active: boolean;
  onSelect: () => void;
  geometries: GeometrySet;
  materials: MaterialSet;
  lowPower: boolean;
  wheelMotion: { current: number };
  staticScene: boolean;
}) {
  const coach = useRef<THREE.Group>(null);
  const sign = useMemo(() => makeSign(place.name, index), [place.name, index]);
  useEffect(() => () => sign.dispose(), [sign]);
  useFrame((_, delta) => {
    if (coach.current) coach.current.scale.setScalar(THREE.MathUtils.damp(coach.current.scale.x, active ? 1.05 : 1, 6, delta));
  });
  return (
    <group
      ref={coach}
      position={[x, 0, 0]}
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerOver={(event) => event.stopPropagation()}
    >
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
          <PlaceBanner place={place} photo={photo} index={index} side={side} staticScene={staticScene} />
        </group>
      ))}
      {!lowPower && [-0.85, 0, 0.85].map((ventX) => (
        <mesh key={ventX} geometry={geometries.vent} material={materials.vent} position={[ventX, 2.52, 0]} />
      ))}
      <Bogie x={-0.92} geometries={geometries} materials={materials} wheelMotion={wheelMotion} />
      <Bogie x={0.92} geometries={geometries} materials={materials} wheelMotion={wheelMotion} />
      <mesh geometry={geometries.coupler} material={materials.steel} position={[-1.58, 0.63, 0]} scale={[0.8, 1, 1]} />
      <mesh geometry={geometries.coupler} material={materials.steel} position={[1.58, 0.63, 0]} scale={[0.8, 1, 1]} />
    </group>
  );
}

function makeBannerTexture(place: Place, photo: THREE.Texture | null, index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#42252c";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (photo?.image) {
      const image = photo.image as HTMLImageElement;
      const imageHeight = 292;
      const scale = Math.max(canvas.width / image.width, imageHeight / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.save();
      context.beginPath();
      context.rect(0, 0, canvas.width, imageHeight);
      context.clip();
      context.drawImage(image, (canvas.width - width) / 2, (imageHeight - height) / 2, width, height);
      context.restore();
      const shade = context.createLinearGradient(0, 180, 0, imageHeight);
      shade.addColorStop(0, "rgba(36, 20, 23, 0)");
      shade.addColorStop(1, "rgba(36, 20, 23, .42)");
      context.fillStyle = shade;
      context.fillRect(0, 0, canvas.width, imageHeight);
    } else {
      context.fillStyle = "#69453c";
      context.fillRect(0, 0, canvas.width, 292);
    }

    context.fillStyle = "#b8965b";
    context.fillRect(30, 310, canvas.width - 60, 2);
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.fillStyle = "#d9bd83";
    context.font = "600 24px Arial, sans-serif";
    context.fillText(place.region.toUpperCase(), 44, 354, 930);
    context.fillStyle = "#fff2d6";
    let titleSize = 62;
    context.font = `600 ${titleSize}px Georgia, serif`;
    while (context.measureText(place.name).width > 930 && titleSize > 42) {
      titleSize -= 2;
      context.font = `600 ${titleSize}px Georgia, serif`;
    }
    context.fillText(place.name, 44, 426, 930);
    context.fillStyle = "rgba(255, 242, 214, .9)";
    context.font = "26px Arial, sans-serif";
    const words = place.summary.split(/\s+/);
    let line = "";
    let lineNumber = 0;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > 930 && line) {
        context.fillText(line, 44, 477 + lineNumber * 34, 930);
        line = word;
        lineNumber++;
        if (lineNumber === 2) break;
      } else {
        line = candidate;
      }
    }
    if (line && lineNumber < 2) context.fillText(line, 44, 477 + lineNumber * 34, 930);
    context.fillStyle = "#d9bd83";
    context.font = "600 18px Arial, sans-serif";
    context.fillText(`RAJASTHAN   ·   COACH ${String(index + 1).padStart(2, "0")}`, 44, 594);

    context.strokeStyle = "rgba(222, 190, 129, .9)";
    context.lineWidth = 8;
    context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    context.strokeStyle = "rgba(255, 242, 214, .16)";
    context.lineWidth = 2;
    context.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);
    context.strokeStyle = "rgba(239, 211, 165, .08)";
    context.lineWidth = 1;
    for (let x = 28; x < canvas.width - 20; x += 8) {
      context.beginPath();
      context.moveTo(x, 306);
      context.lineTo(x + 170, canvas.height - 18);
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8; // stays legible at the camera's angle
  return texture;
}

function PlaceBanner({
  place,
  photo,
  index,
  side,
  staticScene,
}: {
  place: Place;
  photo: THREE.Texture | null;
  index: number;
  side: number;
  staticScene: boolean;
}) {
  const cloth = useRef<THREE.Mesh>(null);
  const { geometry, base } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2.18, 1.3, 18, 12);
    const positions = geometry.attributes.position.array as Float32Array;
    return { geometry, base: positions.slice() };
  }, []);
  const texture = useMemo(() => makeBannerTexture(place, photo, index), [place, photo, index]);
  const fabric = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.88,
    metalness: 0,
    side: THREE.DoubleSide,
  }), [texture]);
  useEffect(() => () => {
    geometry.dispose();
    texture.dispose();
    fabric.dispose();
  }, [geometry, texture, fabric]);
  useFrame((state) => {
    if (staticScene || !cloth.current) return;
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const values = position.array as Float32Array;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < values.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      const drop = THREE.MathUtils.smoothstep(-y, 0, 1.05);
      const phase = time * 1.15 + index * 0.83;
      values[i] = x + Math.sin(phase + y * 2.2 + x * 1.4) * drop * 0.014;
      values[i + 1] = y + Math.sin(phase * 0.72 + x * 1.6) * drop * 0.012;
      values[i + 2] = Math.sin(phase + x * 2.1 + (0.57 - y) * 2.4) * drop * 0.046
        + Math.sin(phase * 0.63 + y * 3.2) * drop * 0.012;
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });
  return (
    <group>
      <mesh position={[0, 1.39, side * 0.075]}>
        <boxGeometry args={[2.26, 0.055, 0.065]} />
        <meshStandardMaterial color="#c5a26c" metalness={0.72} roughness={0.32} />
      </mesh>
      {[-0.92, 0.92].map((x) => (
        <mesh key={x} position={[x, 1.32, side * 0.075]}>
          <boxGeometry args={[0.045, 0.13, 0.05]} />
          <meshStandardMaterial color="#a7814e" metalness={0.64} roughness={0.36} />
        </mesh>
      ))}
      <mesh ref={cloth} geometry={geometry} material={fabric} position={[0, 0.68, side * 0.08]} />
    </group>
  );
}

function Bogie({ x, geometries, materials, wheelMotion }: { x: number; geometries: GeometrySet; materials: MaterialSet; wheelMotion: { current: number } }) {
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, delta) => {
    wheels.current.forEach((wheel) => {
      if (wheel) wheel.rotation.z -= delta * wheelMotion.current / 0.35;
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

function CameraJourney({ progress, staticScene }: { progress: TrainProgress; staticScene: boolean }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const position = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const smoothPosition = useMemo(() => new THREE.Vector3(-0.5, 10, WIDE_DISTANCE), []);
  const smoothTarget = useMemo(() => new THREE.Vector3(-0.5, 1.45, 0), []);

  useFrame((_, delta) => {
    const pose = cameraPose(progress.value, camera.aspect, staticScene);
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
  // wide establishing shot of the whole train (z is fitted to the aspect in cameraPose)
  { at: 0, x: -0.5, y: 5.2, z: WIDE_DISTANCE, targetX: -0.5, targetY: 1.5 },
  // the locomotive, then each coach: a frontal three-quarter view that keeps the neighbours in frame
  { at: COACH_STEP, x: ENGINE_CENTER - 1.6, y: 4.4, z: 10.5, targetX: ENGINE_CENTER + 0.6, targetY: 1.4 },
  ...COACH_CENTERS.map((x, index) => ({
    at: (index + 2) * COACH_STEP,
    x: x - 0.7,
    y: 3.7,
    z: 8.6,
    targetX: x,
    targetY: 1.25,
  })),
  { at: 1, x: -0.5, y: 5.2, z: 34, targetX: -0.5, targetY: 1.5 },
];

/**
 * Where the train is along the track. It rolls in and out over a short distance only, and the camera
 * follows it (cameraPose), so the whole train stays in frame from the first scroll to the last.
 */
function trainOffset(progress: number) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const easeOut = (t: number) => 1 - (1 - t) ** 3;
  if (p <= COACH_STEP * 2) return THREE.MathUtils.lerp(9, 0, easeOut(p / (COACH_STEP * 2)));
  if (p <= 1 - COACH_STEP) return THREE.MathUtils.lerp(0, -3, (p - COACH_STEP * 2) / (1 - COACH_STEP * 3));
  return THREE.MathUtils.lerp(-3, -9, (p - (1 - COACH_STEP)) / COACH_STEP);
}

function cameraPose(progress: number, aspect: number, staticScene: boolean) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const nextIndex = poses.findIndex((pose) => pose.at >= p);
  const next = poses[Math.max(1, nextIndex)];
  const previous = poses[Math.max(0, nextIndex - 1)];
  const span = Math.max(0.0001, next.at - previous.at);
  const t = THREE.MathUtils.clamp((p - previous.at) / span, 0, 1);
  const eased = t * t * (3 - 2 * t);
  const horizontalHalfFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(38 / 2)) * aspect);
  // fit the whole train (≈ 26 units, engine to last coach) across the frame, with a little margin
  const wideZ = Math.max(17, 27.5 / (2 * Math.tan(horizontalHalfFov)));
  const offset = staticScene ? 0 : trainOffset(p);
  return {
    x: THREE.MathUtils.lerp(previous.x, next.x, eased) + offset,
    y: THREE.MathUtils.lerp(previous.y, next.y, eased),
    z: THREE.MathUtils.lerp(
      previous.at === 0 || previous.at === 1 ? wideZ : previous.z,
      next.at === 0 || next.at === 1 ? wideZ : next.z,
      eased,
    ),
    targetX: THREE.MathUtils.lerp(previous.targetX, next.targetX, eased) + offset,
    targetY: THREE.MathUtils.lerp(previous.targetY, next.targetY, eased),
  };
}
