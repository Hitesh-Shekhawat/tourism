"use client";

import { useEffect, useRef } from "react";
import type { Mode } from "./store";

type GsapMod = typeof import("gsap");
export type MotionKit = {
  gsap: GsapMod["gsap"];
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  SplitText: typeof import("gsap/SplitText").SplitText;
};
export type MotionCtx = MotionKit & { mode: Mode; gl: boolean };
/** A chapter's choreography. Runs inside one gsap.context(); return an optional extra cleanup. */
export type Setup = (m: MotionCtx) => void | (() => void);

type Entry = { order: number; fn: { current: Setup } };
const entries = new Map<string, Entry>();
let onChange: (() => void) | null = null;

let kit: Promise<MotionKit> | null = null;
/** GSAP + ScrollTrigger + SplitText, loaded once after first paint (never in the initial bundle). */
export function loadGsap() {
  return (kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]).then(([{ gsap }, { ScrollTrigger }, { SplitText }]) => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    ScrollTrigger.config({ ignoreMobileResize: true });
    return { gsap, ScrollTrigger, SplitText };
  }));
}

/**
 * Register a chapter's choreography. Setups run in `order` (top to bottom), so pin spacing is
 * computed correctly, and are rebuilt together whenever the motion mode or WebGL state changes.
 */
export function useChapterMotion(key: string, order: number, setup: Setup) {
  const fn = useRef(setup);
  fn.current = setup;
  useEffect(() => {
    entries.set(key, { order, fn });
    onChange?.();
    return () => {
      entries.delete(key);
      onChange?.();
    };
  }, [key, order]);
}

export const sortedSetups = () => [...entries.values()].sort((a, b) => a.order - b.order).map((e) => e.fn.current);
export const onSetupsChange = (f: (() => void) | null) => void (onChange = f);
