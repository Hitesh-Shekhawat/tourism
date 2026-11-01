"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { chapter } from "@/lib/day";
import { drawFrame, getFrameSet } from "@/lib/frames/player";
import { bus } from "@/lib/story/bus";
import { screenMaterial } from "./screen";

/*
 * Ch04 "Into the Thar" (§6.5): the chapter's frame sequence (day.json) as the scene's background, with 3,000
 * instanced quads of fine sand blown left to right on top. Their speed couples to scroll velocity,
 * so a fast scroll kicks up a gust; warm at sunset, near-invisible at night.
 */
const N = 3000;
const cfg = chapter("thar").frames!;

const vert = /* glsl */ `
uniform float uWind; uniform float uStretch; uniform vec2 uPx;
attribute vec3 aOffset; attribute float aSeed;
varying float vA; varying vec2 vQ;
void main() {
  vec3 p = aOffset;
  // left to right, wrapping across a 12-unit band
  p.x = mod(p.x + uWind * (0.6 + aSeed * 0.8) + 6.0, 12.0) - 6.0;
  p.y += sin(uWind * 0.35 + aSeed * 40.0) * 0.05;
  vec4 c = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  float size = (0.7 + aSeed * 1.3);
  vec2 q = position.xy;
  q.x *= 1.0 + uStretch * (0.5 + aSeed);
  c.xy += q * size * uPx * c.w;
  gl_Position = c;
  vA = 0.25 + 0.75 * fract(aSeed * 13.7);
  vQ = position.xy;
}`;
const frag = /* glsl */ `
uniform vec3 uColor; uniform float uAlpha;
varying float vA; varying vec2 vQ;
void main() {
  float d = length(vQ * vec2(1.0, 1.0));
  float a = smoothstep(1.0, 0.2, d) * vA * uAlpha;
  gl_FragColor = vec4(uColor * a, a);
}`;

export function TharScene() {
  const key = useRef("");
  const wind = useRef(0);
  const gust = useRef(0);
  const { bg, sand, frames } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), screenMaterial(tex, 16 / 9, 0.55));
    bg.frustumCulled = false;
    bg.renderOrder = -1;

    const quad = new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = quad.index;
    g.setAttribute("position", quad.getAttribute("position"));
    const off = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      off[i * 3] = Math.random() * 12 - 6;
      off[i * 3 + 1] = -1.6 + Math.pow(Math.random(), 1.8) * 2.2; // denser near the sand
      off[i * 3 + 2] = -1 - Math.random() * 7;
      seed[i] = Math.random();
    }
    g.setAttribute("aOffset", new THREE.InstancedBufferAttribute(off, 3));
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 1));
    g.instanceCount = N;
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: { uWind: { value: 0 }, uStretch: { value: 0 }, uPx: { value: new THREE.Vector2(0.002, 0.002) }, uColor: { value: new THREE.Color("#ffd9a0") }, uAlpha: { value: 0.6 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sand = new THREE.Mesh(g, m);
    sand.frustumCulled = false;
    const set = getFrameSet(cfg.sequence, "desktop");
    return { bg, sand, frames: { canvas, ctx: canvas.getContext("2d")!, tex, set } };
  }, []);

  useEffect(
    () => () => {
      bg.geometry.dispose();
      (bg.material as THREE.Material).dispose();
      sand.geometry.dispose();
      (sand.material as THREE.Material).dispose();
      frames.tex.dispose();
    },
    [bg, sand, frames],
  );

  const warm = useMemo(() => new THREE.Color("#ffd29a"), []);
  const dusk = useMemo(() => new THREE.Color("#e7a07a"), []);
  const night = useMemo(() => new THREE.Color("#9aa6c8"), []);

  useFrame((state, dt) => {
    if (!bus.visible.thar) return;
    frames.set.request();
    const { width, height } = state.size;
    // keep the backing canvas at the view's aspect; drawFrame cover-fits into it
    const cw = 1600;
    const ch = Math.max(1, Math.round((cw * height) / width));
    if (frames.canvas.height !== ch) {
      frames.canvas.height = ch;
      key.current = "";
      frames.tex.dispose();
    }
    (bg.material as THREE.ShaderMaterial).uniforms.uAspect.value = cw / ch;
    (bg.material as THREE.ShaderMaterial).uniforms.uImage.value = cw / ch;

    const intro = bus.tharIntro;
    const f = intro < 1 ? cfg.introFrom + intro * (cfg.from - cfg.introFrom) : cfg.from + bus.progress.thar * (cfg.to - cfg.from);
    const k = drawFrame(frames.ctx, frames.set, f, true, "cover", 0.55, key.current);
    if (k !== key.current) {
      key.current = k;
      frames.tex.needsUpdate = true;
    }

    // wind: a base drift plus gusts from scroll velocity (px/s), eased
    const v = Math.min(1, Math.abs(bus.velocity) / 2500);
    gust.current += (v - gust.current) * Math.min(1, dt * 3);
    wind.current += dt * (0.35 + gust.current * 4.5);
    const m = sand.material as THREE.ShaderMaterial;
    m.uniforms.uWind.value = wind.current;
    m.uniforms.uStretch.value = gust.current * 6;
    m.uniforms.uPx.value.set(2.4 / width, 2.4 / height).multiplyScalar(state.gl.getPixelRatio() > 1.4 ? 1.2 : 1);

    // tint by the hour: warm until sunset (≈ frame 113), dusky after, near-invisible at night
    const s = (f - 95) / 55;
    if (s < 0.33) m.uniforms.uColor.value.copy(warm);
    else if (s < 0.55) m.uniforms.uColor.value.copy(warm).lerp(dusk, (s - 0.33) / 0.22);
    else m.uniforms.uColor.value.copy(dusk).lerp(night, Math.min(1, (s - 0.55) / 0.25));
    m.uniforms.uAlpha.value = (s < 0.55 ? 0.3 : Math.max(0.04, 0.3 - (s - 0.55) * 0.9)) * (0.6 + gust.current * 0.9);
  });

  return (
    <>
      <color attach="background" args={["#2a1d14"]} />
      <PerspectiveCamera makeDefault fov={45} position={[0, 0, 2]} near={0.1} far={40} />
      <primitive object={bg} />
      <primitive object={sand} />
    </>
  );
}
