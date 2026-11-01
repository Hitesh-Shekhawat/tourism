"use client";

import { useEffect, type RefObject } from "react";
import { driveWithGsap, onLenis } from "@/lib/smooth";
import { loadGsap, type MotionKit } from "@/lib/story/engine";
import { useStory } from "@/lib/story/store";

let refreshQueued = 0;
/** One ScrollTrigger.refresh per frame, however many sections finish setting up in it. */
function queueRefresh(kit: MotionKit) {
  cancelAnimationFrame(refreshQueued);
  refreshQueued = requestAnimationFrame(() => kit.ScrollTrigger.refresh());
}

/**
 * The home page's scroll runtime: hands Lenis' clock to GSAP's ticker so ScrollTrigger and smooth
 * scrolling read one scroll position (as the story engine does), and refreshes once fonts and images settle.
 */
export function HomeMotion() {
  useEffect(() => {
    let cancelled = false;
    let undoLenis: (() => void) | null = null;
    let offLenis: (() => void) | null = null;
    let refresh = () => {};
    loadGsap().then((kit) => {
      if (cancelled) return;
      offLenis = onLenis((l) => {
        undoLenis?.();
        undoLenis = l ? driveWithGsap(kit.gsap, kit.ScrollTrigger) : null;
      });
      refresh = () => queueRefresh(kit);
      document.fonts?.ready.then(refresh);
      if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
    });
    return () => {
      cancelled = true;
      offLenis?.();
      undoLenis?.();
      window.removeEventListener("load", refresh);
    };
  }, []);
  return null;
}

/**
 * Runs a section's GSAP choreography inside its own gsap.context (scoped to the section), after GSAP
 * has loaded and never in reduced mode, where the server-rendered layout is the final state. Rebuilt
 * when the motion mode changes; everything it created is reverted on unmount.
 */
export function useSectionMotion<T extends HTMLElement>(scope: RefObject<T | null>, setup: (kit: MotionKit, el: T) => void | (() => void)) {
  const mode = useStory((s) => s.mode);
  useEffect(() => {
    const el = scope.current;
    if (!el || mode === "reduced") return;
    let cancelled = false;
    let ctx: gsap.Context | null = null;
    let undo: void | (() => void);
    loadGsap().then((kit) => {
      if (cancelled) return;
      ctx = kit.gsap.context(() => {
        undo = setup(kit, el);
      }, el);
      queueRefresh(kit);
    });
    return () => {
      cancelled = true;
      if (typeof undo === "function") undo();
      ctx?.revert();
    };
    // setup is defined inline by each section and only reads refs, so the mode is the only real dependency
  }, [mode]);
}

/** gsap.matchMedia breakpoints shared by the home sections (content-based: the tour cards need ~1024px to run sideways). */
export const MQ = { wide: "(min-width: 1024px)", narrow: "(max-width: 1023px)" } as const;
