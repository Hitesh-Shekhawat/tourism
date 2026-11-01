"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { boundsOf, centroidOf, fitProjection, INDIA_GEO, loadGeo, stateGeo, type GeoCollection } from "@/lib/geo/projection";
import { LITE } from "@/components/story/gl/quality";
import { cameraControls, goTo, reducedMotion, useExplorer } from "../store";
import { fitDistance, setOpacity } from "./geometry";
import { IndiaMap3D } from "./IndiaMap3D";
import { StateMap3D, stateProjection, type StateHandle } from "./StateMap3D";

const FOV = 30;
const INDIA_SIZE = 10;
const INDIA_ELEV = THREE.MathUtils.degToRad(58);
const STATE_ELEV = THREE.MathUtils.degToRad(50);

/**
 * The atlas canvas (lazy-loaded with three.js). Owns the camera and every scene change:
 * India → state: the state is highlighted and lifted, the camera flies toward it, India fades,
 * and the state's own map rises in its place. State → India runs the same in reverse.
 */
export default function ExplorerCanvas({ active }: { active: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      shadows="soft"
      flat
      dpr={[1, LITE ? 1.5 : 1.75]}
      camera={{ fov: FOV, near: 0.1, far: 200, position: [0, 30, 20] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          useExplorer.getState().set({ renderer: "2d" });
        });
      }}
    >
      <Lights />
      <Scene />
    </Canvas>
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#fff3df", "#8a6a48", 1.15]} />
      <directionalLight
        castShadow
        position={[-7, 14, 8]}
        intensity={2.4}
        color="#ffe3bd"
        shadow-mapSize={LITE ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[8, 6, -6]} intensity={0.45} color="#c9d4f0" />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial opacity={0.17} />
      </mesh>
    </>
  );
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Scene() {
  const [india, setIndia] = useState<GeoCollection | null>(null);
  useEffect(() => {
    loadGeo(INDIA_GEO)
      .then(setIndia)
      .catch(() => useExplorer.getState().set({ renderer: "2d" }));
  }, []);
  return india ? <Director india={india} /> : null;
}

type Pose = { pos: THREE.Vector3; target: THREE.Vector3 };
const pose = (target: THREE.Vector3, dist: number, elev: number, azim = 0): Pose => ({
  target: target.clone(),
  pos: new THREE.Vector3(target.x + Math.sin(azim) * Math.cos(elev) * dist, target.y + Math.sin(elev) * dist, target.z + Math.cos(azim) * Math.cos(elev) * dist),
});

function Director({ india }: { india: GeoCollection }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const controls = useRef<OrbitControlsImpl>(null);
  const indiaRef = useRef<THREE.Group>(null);
  const stateRef = useRef<StateHandle>(null);
  const shownRef = useRef<string | null>(null);
  const entered = useRef<() => void>(() => {});
  const [shown, setShown] = useState<{ id: string; data: GeoCollection } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const stateId = useExplorer((s) => s.stateId);
  const placeId = useExplorer((s) => s.placeId);
  const started = useExplorer((s) => s.started);

  const proj = useMemo(() => fitProjection(boundsOf(india.features), INDIA_SIZE), [india]);
  const aspect = size.width / Math.max(1, size.height);
  // On narrow screens the map is seen a little more from above, so tall India still fits
  const indiaPose = useCallback(() => pose(new THREE.Vector3(0, 0, 0.2), fitDistance(proj.width, proj.depth, FOV, aspect, INDIA_ELEV, aspect < 1 ? 1.02 : 1.08), INDIA_ELEV), [proj, aspect]);
  const statePose = useCallback(
    (data: GeoCollection) => {
      const sp = stateProjection(data);
      return pose(new THREE.Vector3(0, 0.3, 0.15), fitDistance(sp.width, sp.depth, FOV, aspect, STATE_ELEV, aspect < 1 ? 1.0 : 1.18), STATE_ELEV);
    },
    [aspect],
  );

  const fly = useCallback(
    (p: Pose, duration: number, ease = "power3.inOut") =>
      new Promise<void>((resolve) => {
        const c = controls.current;
        const d = reducedMotion() ? 0.01 : duration;
        gsap.killTweensOf(camera.position);
        if (c) gsap.killTweensOf(c.target);
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(camera.position, { x: p.pos.x, y: p.pos.y, z: p.pos.z, duration: d, ease, onUpdate: () => (c ? c.update() : camera.lookAt(p.target)) }, 0);
        if (c) tl.to(c.target, { x: p.target.x, y: p.target.y, z: p.target.z, duration: d, ease }, 0);
      }),
    [camera],
  );
  const jump = useCallback(
    (p: Pose) => {
      camera.position.copy(p.pos);
      controls.current?.target.copy(p.target);
      controls.current?.update();
    },
    [camera],
  );
  const fadeIndia = useCallback((to: number, duration: number, delay = 0) => {
    const g = indiaRef.current;
    if (!g) return Promise.resolve();
    const o = { v: (g.userData.opacity as number | undefined) ?? (g.visible ? 1 : 0) };
    return new Promise<void>((resolve) =>
      gsap.to(o, {
        v: to,
        duration: reducedMotion() ? 0.01 : duration,
        delay: reducedMotion() ? 0 : delay,
        ease: "power2.inOut",
        onUpdate: () => {
          g.userData.opacity = o.v;
          setOpacity(g, o.v);
        },
        onComplete: resolve,
      }),
    );
  }, []);

  // First paint: India fades in as the camera settles (or, deep-linked, straight to the state)
  useEffect(() => {
    const g = indiaRef.current!;
    g.userData.opacity = 0;
    setOpacity(g, 0);
    if (!useExplorer.getState().stateId) {
      const p = indiaPose();
      jump(pose(p.target, p.pos.distanceTo(p.target) * 1.25, INDIA_ELEV + 0.15));
      void fly(p, 1.6, "power2.out");
      void fadeIndia(1, 1.1);
    }
    useExplorer.getState().set({ renderer: "3d" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scene changes follow the URL's state
  useEffect(() => {
    let alive = true;
    const store = useExplorer.getState();
    const run = async () => {
      store.set({ busy: true });
      if (controls.current) controls.current.enabled = false;

      // Leave the state on screen, if it is not the one wanted
      if (shownRef.current && shownRef.current !== stateId) {
        await stateRef.current?.leave();
        if (!alive) return;
        shownRef.current = null;
        setShown(null);
      }

      if (stateId && shownRef.current !== stateId) {
        const dataP = loadGeo(stateGeo(stateId));
        const f = india.features.find((x) => x.properties.id === stateId);
        const g = indiaRef.current;
        if (f && g && ((g.userData.opacity as number) ?? 0) > 0.05) {
          // highlight, fly toward it, and let India go
          setSelected(stateId);
          await wait(reducedMotion() ? 0 : 280);
          if (!alive) return;
          const [cx, cz] = proj(centroidOf(f));
          const near = pose(new THREE.Vector3(cx, 0.2, cz), indiaPose().pos.length() * 0.36, THREE.MathUtils.degToRad(64));
          await Promise.all([fly(near, 1.25), fadeIndia(0, 0.6, 0.6)]);
        } else {
          void fadeIndia(0, 0.01);
        }
        let data: GeoCollection;
        try {
          data = await dataP;
        } catch {
          if (alive) goTo(null, null, true);
          return;
        }
        if (!alive) return;
        // the state's own map rises where India was, the camera easing in from a little further out
        const p = statePose(data);
        jump(pose(p.target, p.pos.distanceTo(p.target) * 1.3, STATE_ELEV + 0.12));
        const done = new Promise<void>((r) => (entered.current = r));
        shownRef.current = stateId;
        setShown({ id: stateId, data });
        await Promise.all([fly(p, 1.5, "power2.out"), done]);
        if (!alive) return;
        const c = controls.current;
        if (c) {
          const d = p.pos.distanceTo(p.target);
          c.minDistance = d * 0.35;
          c.maxDistance = d * 1.5;
          c.enabled = true;
        }
      } else if (!stateId) {
        // back to India: rise out, and the country fades back in around the camera
        setSelected(null);
        const p = indiaPose();
        void fadeIndia(1, 0.9, 0.15);
        await fly(p, 1.3);
      } else if (controls.current) {
        controls.current.enabled = true;
      }
      if (alive) store.set({ busy: false });
    };
    void run();
    return () => {
      alive = false;
      useExplorer.getState().set({ busy: false });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId]);

  // A place opens: the camera turns toward its pin (the card is DOM, beside the map)
  useEffect(() => {
    if (!placeId || !shown || useExplorer.getState().busy) return;
    const m = stateRef.current?.markerPosition(placeId);
    const c = controls.current;
    if (!m || !c) return;
    const dist = Math.min(camera.position.distanceTo(c.target), statePose(shown.data).pos.distanceTo(new THREE.Vector3(0, 0.3, 0.15)) * 0.62);
    // keep the visitor's current viewing direction, aimed at the pin (the view offset clears the card)
    const dir = camera.position.clone().sub(c.target).normalize();
    const target = m.clone().setY(m.y * 0.5);
    void fly({ target, pos: target.clone().add(dir.multiplyScalar(dist)) }, 1.1);
  }, [placeId, shown, camera, fly, statePose]);

  // Keep the India framing right when the canvas resizes
  useEffect(() => {
    const s = useExplorer.getState();
    if (!s.stateId && !s.busy) jump(indiaPose());
  }, [indiaPose, jump]);

  // Frame the map in the space the DOM panels leave free: the state list on the left, the place
  // card on the right (desktop), or the sheets along the bottom (mobile). Shifts the projection,
  // not the camera, so orbiting still turns about the map's centre.
  const offset = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const wide = size.width >= 1024;
    const x = !wide ? 0 : placeId ? 210 : stateId ? -175 : started ? -80 : 0;
    const y = wide ? 0 : placeId ? size.height * 0.3 : stateId ? size.height * 0.2 : started ? size.height * 0.08 : 0;
    const apply = () => camera.setViewOffset(size.width, size.height, offset.current.x, offset.current.y, size.width, size.height);
    apply();
    const t = gsap.to(offset.current, { x, y, duration: reducedMotion() ? 0.01 : 0.9, ease: "power3.inOut", onUpdate: apply });
    return () => void t.kill();
  }, [camera, size.width, size.height, stateId, placeId, started]);

  // On-screen controls
  useEffect(() => {
    cameraControls.reset = () => {
      const s = useExplorer.getState();
      if (s.busy) return;
      void fly(shown ? statePose(shown.data) : indiaPose(), 1);
    };
    cameraControls.zoom = (dir) => {
      const c = controls.current;
      if (!c || !shown || useExplorer.getState().busy) return;
      const off = camera.position.clone().sub(c.target);
      const d = THREE.MathUtils.clamp(off.length() * (dir > 0 ? 0.78 : 1.28), c.minDistance, c.maxDistance);
      void fly({ target: c.target.clone(), pos: c.target.clone().add(off.setLength(d)) }, 0.6, "power2.out");
    };
  }, [shown, camera, fly, indiaPose, statePose]);

  // Before Explore: a slow drift, so the map reads as an object
  useFrame((st) => {
    const g = indiaRef.current;
    if (!g) return;
    const drift = !started && !stateId ? Math.sin(st.clock.elapsedTime * 0.25) * 0.05 : 0;
    g.rotation.y += (drift - g.rotation.y) * 0.05;
  });

  return (
    <>
      <OrbitControls
        ref={controls}
        makeDefault
        enabled={false}
        enableDamping
        dampingFactor={0.08}
        enablePan
        screenSpacePanning={false}
        minPolarAngle={0.15}
        maxPolarAngle={THREE.MathUtils.degToRad(72)}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
      />
      <IndiaMap3D ref={indiaRef} data={india} proj={proj} selected={selected} />
      {shown && <StateMap3D key={shown.id} ref={stateRef} id={shown.id} data={shown.data} onEntered={() => entered.current()} />}
    </>
  );
}

