"use client";

import type Lenis from "lenis";

/** Lenis singleton (desktop and touch, syncTouch on). Null in reduced mode. */
let lenis: Lenis | null = null;
let rafId = 0;
let lockCount = 0;
const subs = new Set<(l: Lenis | null) => void>();

/** Notified whenever the Lenis instance changes (the story engine re-drives it with GSAP's ticker). */
export function onLenis(f: (l: Lenis | null) => void) {
  subs.add(f);
  f(lenis);
  return () => void subs.delete(f);
}

export function setLenis(l: Lenis | null) {
  lenis = l;
  cancelAnimationFrame(rafId);
  if (l) {
    const loop = (t: number) => {
      l.raf(t);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  }
  // after the plain loop starts, so a subscriber can take the clock over (driveWithGsap)
  subs.forEach((f) => f(l));
}

export const getLenis = () => lenis;

/** Hand Lenis' clock to GSAP's ticker once GSAP is loaded (§4). */
export function driveWithGsap(gsap: typeof import("gsap").gsap, ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger) {
  const l = lenis;
  if (!l) return () => {};
  cancelAnimationFrame(rafId);
  const tick = (time: number) => l.raf(time * 1000);
  const onScroll = () => ScrollTrigger.update();
  l.on("scroll", onScroll);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    l.off("scroll", onScroll);
    gsap.ticker.remove(tick);
    // hand the clock back to a plain rAF loop
    if (lenis === l) {
      const loop = (t: number) => {
        l.raf(t);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }
  };
}

/** Scroll lock for dialogs; nests safely. */
export function lockScroll(on: boolean) {
  lockCount = Math.max(0, lockCount + (on ? 1 : -1));
  const locked = lockCount > 0;
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (locked) lenis?.stop();
  else lenis?.start();
}
