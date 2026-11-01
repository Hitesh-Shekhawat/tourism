"use client";

import { View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { anyVisible, bus, kick, setInvalidate, type SceneId } from "@/lib/story/bus";
import { useStory } from "@/lib/story/store";
import { LITE } from "./quality";
import { StarlightScene } from "./StarlightScene";
import { TharScene } from "./TharScene";
import { ThresholdScene } from "./ThresholdScene";
import { TrailScene } from "./TrailScene";

/** DOM placeholders each scene renders into (drei <View track>). */
export const GL_IDS: Record<SceneId, string> = { threshold: "gl-threshold", trail: "gl-trail", thar: "gl-thar", starlight: "gl-starlight" };

/** Built one per frame, in page order, so no single task builds every scene at once. */
const SCENES: { id: SceneId; index: number; Scene: ComponentType }[] = [
  { id: "threshold", index: 2, Scene: ThresholdScene },
  { id: "trail", index: 3, Scene: TrailScene },
  { id: "thar", index: 4, Scene: TharScene },
  { id: "starlight", index: 5, Scene: StarlightScene },
];

/**
 * The one WebGL context (§4): a fixed, full-viewport canvas behind the DOM. Every scene renders
 * through a drei <View> into its chapter's placeholder. frameloop="demand": frames are requested
 * on scroll and, while a visible scene animates, every frame; nothing renders when no scene is on screen.
 */
export default function GLRoot() {
  const tracks = useMemo(() => Object.fromEntries(Object.entries(GL_IDS).map(([k, id]) => [k, { current: document.getElementById(id) }])) as Record<SceneId, { current: HTMLElement | null }>, []);

  // Which scenes are on screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.scene as SceneId;
          bus.visible[id] = e.isIntersecting;
        }
        kick();
      },
      { rootMargin: "10% 0px" },
    );
    Object.entries(tracks).forEach(([k, r]) => {
      if (!r.current) return;
      r.current.dataset.scene = k;
      io.observe(r.current);
    });
    const onScroll = () => anyVisible() && kick();
    const onPointer = (e: PointerEvent) => {
      bus.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      bus.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
      Object.keys(bus.visible).forEach((k) => (bus.visible[k as SceneId] = false));
    };
  }, [tracks]);

  // How many scenes are built; each one's commit schedules the next after a painted frame
  const [built, setBuilt] = useState(0);
  const next = useMemo(() => {
    let raf = 0;
    return (id: SceneId) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTimeout(() => setBuilt((n) => Math.max(n, SCENES.findIndex((s) => s.id === id) + 1)), 0));
    };
  }, []);

  return (
    <div className="gl-root" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, LITE ? 1.25 : 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows="percentage"
        style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          const lost = (e: Event) => {
            e.preventDefault();
            fallBack();
          };
          gl.domElement.addEventListener("webglcontextlost", lost);
        }}
      >
        <Driver built={built >= SCENES.length} />
        {SCENES.slice(0, built + 1).map(({ id, index, Scene }) => (
          <SceneView key={id} id={id} track={tracks[id]} index={index} onBuilt={next}>
            <Scene />
          </SceneView>
        ))}
      </Canvas>
    </div>
  );
}

function fallBack() {
  useStory.getState().set({ gl: false, glOpen: false });
  delete document.documentElement.dataset.gl;
  delete document.documentElement.dataset.glOpen;
}

/** A View that only renders while its placeholder is on screen. Its own Suspense, so a scene loading a texture never holds up the others. */
function SceneView({ id, track, index, onBuilt, children }: { id: SceneId; track: { current: HTMLElement | null }; index: number; onBuilt: (id: SceneId) => void; children: ReactNode }) {
  useEffect(() => onBuilt(id), [id, onBuilt]);
  if (!track.current) return null;
  return (
    <View track={track as React.RefObject<HTMLElement>} index={index} visible={true}>
      <Suspense fallback={null}>
        <Gate id={id}>{children}</Gate>
      </Suspense>
    </View>
  );
}

/** Keeps a scene's children mounted but skips work while off screen (scenes read bus.visible in useFrame). */
function Gate({ id, children }: { id: SceneId; children: ReactNode }) {
  const g = useRef<import("three").Group>(null);
  useFrame(() => {
    if (g.current) g.current.visible = bus.visible[id];
  });
  return <group ref={g}>{children}</group>;
}

/** Registers invalidate(), clears the whole canvas each frame (Views scissor without clearing) and keeps animating while a scene is visible. */
function Driver({ built }: { built: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const first = useRef(true);
  useEffect(() => {
    setInvalidate(invalidate);
    invalidate();
    return () => setInvalidate(null);
  }, [invalidate, built]);
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
    if (first.current && built) {
      first.current = false;
      // Hand over from the 2D fallbacks once every scene is built and a frame has rendered
      requestAnimationFrame(() => {
        document.documentElement.dataset.gl = "ready";
        useStory.getState().set({ gl: true });
      });
    }
    if (anyVisible()) invalidate();
  }, 1);
  return null;
}
