"use client";

import { useEffect, useRef } from "react";
import { archPath } from "@/lib/arch";
import { bus } from "@/lib/story/bus";
import { useChapterMotion } from "@/lib/story/engine";
import { vhPx } from "@/lib/story/fx";
import { chapter, sequences } from "@/lib/day";
import { useStory } from "@/lib/story/store";
import { FrameCanvas, type FrameApi } from "../FrameCanvas";

const PIN = chapter("threshold").pin!;

/**
 * The 2D path of Ch00 (compact, and desktops without WebGL): the hero-aerial frames inside the
 * jharokha arch. Desktop: pinned ≈220vh, the arch widens as if stepping through it while the frames
 * scrub 1 → 150. Compact: a non-pinned scrub over 100vh. Reduced: the poster only.
 * Also drives bus.progress.threshold for the 3D scene.
 */
export function ThresholdVisual() {
  const api = useRef<FrameApi>(null);
  const arch = useRef<HTMLDivElement>(null);
  const line = useRef<SVGSVGElement>(null);

  // The preloader is skippable on any input, and gone after 1.2s regardless
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("preload")) return;
    const skip = () => html.classList.add("preload-skip");
    const evs = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, skip, { once: true, passive: true }));
    const t = setTimeout(() => html.classList.remove("preload"), 1300);
    return () => {
      clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, skip));
    };
  }, []);

  useChapterMotion("threshold", 0, ({ gsap, mode }) => {
    const stage = document.querySelector<HTMLElement>("#ch-threshold .th-stage");
    if (!stage || mode === "reduced") {
      api.current?.set(1);
      return;
    }
    const count = api.current?.frameSet()?.count ?? sequences["hero-aerial"].count;
    const onUpdate = (p: number) => {
      bus.progress.threshold = p;
      const t = Math.min(1, p / 0.7);
      if (!useStory.getState().glOpen) api.current?.set(1 + t * (count - 1), true);
      if (mode === "desktop" && arch.current && line.current) {
        // stepping through the arch: it widens past the viewport by p = .7
        const k = 1 + t * t * 3.2;
        arch.current.style.transform = `scale(${k})`;
        line.current.style.transform = `scale(${k})`;
        line.current.style.opacity = String(1 - t);
      }
    };
    if (mode === "desktop") {
      gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${vhPx(PIN)()}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => onUpdate(s.progress),
          onToggle: (s) => stage.style.setProperty("will-change", s.isActive ? "transform" : "auto"),
        },
      });
    } else {
      gsap.timeline({ scrollTrigger: { trigger: stage, start: "top top", end: "+=100%", scrub: 1, onUpdate: (s) => onUpdate(s.progress) } });
    }
    onUpdate(0);
    return () => {
      if (arch.current) arch.current.style.transform = "";
      if (line.current) line.current.style.cssText = "";
    };
  });

  return (
    <div className="th-visual gl-fallback" aria-hidden="true">
      <div ref={arch} className="th-arch">
        <FrameCanvas name="hero-aerial" chapterIndex={0} api={api} alt="" priority />
      </div>
      <svg ref={line} className="th-arch-line" viewBox="0 0 1 1" preserveAspectRatio="none">
        <path d={archPath} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
