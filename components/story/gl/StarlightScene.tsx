"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { frameUrl, sequences } from "@/lib/day";
import { bus } from "@/lib/story/bus";
import { rng } from "./textures";
import { screenMaterial } from "./screen";

/*
 * Ch09 "Starlight" (§6.10): the last dunes frame (night) as the background and 2,500 stars with
 * magnitude-based size, turning slowly about a pole off-screen top-left, with at most one meteor
 * every 12 s. The cursor gently parallaxes the stars.
 */
const N = 2500;
const dunes = sequences.dunes;
const NIGHT = frameUrl(dunes, "desktop", dunes.count);
/** Fraction of the frame height (from the top) above which the sky is clear of dune crests. */
const HORIZON = 0.585;

const starVert = /* glsl */ `
uniform float uPx; uniform float uTime; uniform float uHorizon;
attribute float aMag; attribute float aSeed;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 c = projectionMatrix * mv;
  gl_Position = c;
  float bright = pow(1.0 - aMag, 2.2);
  gl_PointSize = uPx * (0.9 + bright * 3.2);
  float tw = 0.75 + 0.25 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 60.0);
  // fade out below the dune line (screen space)
  float sy = c.y / c.w * 0.5 + 0.5;
  vA = (0.25 + bright * 0.75) * tw * smoothstep(uHorizon - 0.02, uHorizon + 0.1, sy);
}`;
const starFrag = /* glsl */ `
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d) * vA;
  gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * a, a);
}`;

export function StarlightScene() {
  const tex = useLoader(THREE.TextureLoader, NIGHT);
  const group = useRef<THREE.Group>(null);
  const meteor = useRef<THREE.Mesh>(null);
  const next = useRef(6);
  const spin = useRef(0);

  const { bg, stars } = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), screenMaterial(tex, dunes.desktop.w / dunes.desktop.h, 0.55));
    bg.frustumCulled = false;
    bg.renderOrder = -1;
    const r = rng(2130);
    const pos = new Float32Array(N * 3);
    const mag = new Float32Array(N);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      // uniform on a sphere of radius 40
      const u = r() * 2 - 1;
      const t = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      pos.set([s * Math.cos(t) * 40, u * 40, s * Math.sin(t) * 40], i * 3);
      mag[i] = Math.pow(r(), 0.35); // many faint, few bright
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aMag", new THREE.BufferAttribute(mag, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({ vertexShader: starVert, fragmentShader: starFrag, uniforms: { uPx: { value: 1.5 }, uTime: { value: 0 }, uHorizon: { value: 1 - HORIZON } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(g, m);
    stars.frustumCulled = false;
    return { bg, stars };
  }, [tex]);

  useEffect(
    () => () => {
      bg.geometry.dispose();
      (bg.material as THREE.Material).dispose();
      stars.geometry.dispose();
      (stars.material as THREE.Material).dispose();
    },
    [bg, stars],
  );

  // the pole sits off-screen, top-left
  const axis = useMemo(() => new THREE.Vector3(-0.55, 0.75, 0.35).normalize(), []);

  useFrame((state, dt) => {
    if (!bus.visible.starlight) return;
    const { width, height } = state.size;
    (bg.material as THREE.ShaderMaterial).uniforms.uAspect.value = width / height;
    const m = stars.material as THREE.ShaderMaterial;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uPx.value = 1.6 * state.gl.getPixelRatio();
    spin.current += dt * 0.012;
    const g = group.current!;
    g.quaternion.setFromAxisAngle(axis, spin.current);
    g.rotation.x += bus.pointer.y * 0.02;
    g.rotation.y += bus.pointer.x * 0.03;

    // one meteor at most every 12 s
    const mt = meteor.current!;
    const now = state.clock.elapsedTime;
    if (now > next.current) {
      next.current = now + 12 + Math.random() * 10;
      mt.userData.t0 = now;
      mt.position.set(-2 + Math.random() * 3, 1.2 + Math.random() * 0.8, -6);
      mt.rotation.z = -0.5 - Math.random() * 0.4;
    }
    const age = now - (mt.userData.t0 ?? -10);
    mt.visible = age < 0.7;
    if (mt.visible) {
      mt.position.x += dt * 4.5 * Math.cos(mt.rotation.z);
      mt.position.y += dt * 4.5 * Math.sin(mt.rotation.z);
      (mt.material as THREE.MeshBasicMaterial).opacity = Math.sin((age / 0.7) * Math.PI) * 0.8;
    }
  });

  return (
    <>
      <color attach="background" args={["#0b0d17"]} />
      <PerspectiveCamera makeDefault fov={55} position={[0, 0, 0]} near={0.1} far={100} />
      <primitive object={bg} />
      <group ref={group}>
        <primitive object={stars} />
      </group>
      <mesh ref={meteor} visible={false}>
        <planeGeometry args={[0.9, 0.012]} />
        <meshBasicMaterial color="#fff6e0" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
}
