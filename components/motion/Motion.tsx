"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getLenis, setLenis } from "@/lib/smooth";
import { computeMode, readPref, useStory } from "@/lib/story/store";

/**
 * Site-wide motion runtime (§4, §10):
 * - the motion mode (desktop / compact / reduced), honouring the session's "Motion: full / calm" override,
 *   mirrored to html[data-motion] (the pre-paint boot script sets the first value)
 * - Lenis on desktop and touch (lerp .075, syncTouch on, so touch scrolling is eased too), never in reduced mode.
 *   On the home page the story engine hands Lenis' clock to GSAP's ticker.
 * - [data-reveal] / [data-reveal-mask] reveals via IntersectionObserver + CSS transitions
 * - [data-parallax] light parallax (≤ 6%)
 */
export function Motion() {
  const pathname = usePathname();
  const pref = useStory((s) => s.pref);
  const mode = useStory((s) => s.mode);
  const hadSheet = useRef(false);

  // Mode: from the OS, the viewport and the session override
  useEffect(() => {
    const set = useStory.getState().set;
    if (useStory.getState().pref === null) set({ pref: readPref() });
    const update = () => {
      const m = computeMode(useStory.getState().pref);
      document.documentElement.dataset.motion = m;
      if (m !== useStory.getState().mode) set({ mode: m });
    };
    update();
    const mqs = [window.matchMedia("(prefers-reduced-motion: reduce)"), window.matchMedia("(min-width: 1024px)")];
    mqs.forEach((q) => q.addEventListener("change", update));
    return () => mqs.forEach((q) => q.removeEventListener("change", update));
  }, [pref]);

  // Lenis
  useEffect(() => {
    if (mode === "reduced") return;
    let cancelled = false;
    let mine: import("lenis").default | null = null;
    const start = async () => {
      if (getLenis()) return;
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      // Controlled, unhurried scroll: a softer wheel and eased touch, so a flick can't throw the page through a pinned chapter
      // anchors: in-page links glide (clear of the fixed header); allowNestedScroll: swipes on horizontal carousels stay native
      mine = new Lenis({ lerp: 0.075, wheelMultiplier: 0.8, syncTouch: true, syncTouchLerp: 0.06, touchMultiplier: 0.9, anchors: { offset: -88 }, allowNestedScroll: true, autoRaf: false });
      setLenis(mine);
    };
    // after first paint and idle, so it never competes with LCP
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    const id = idle(() => start());
    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(id as number);
      if (mine && getLenis() === mine) {
        mine.destroy();
        setLenis(null);
      }
    };
  }, [mode]);

  // Reveals + parallax (per route)
  useEffect(() => {
    // Opening or closing a sheet changes the pathname but must keep the scroll of the page underneath
    // (the sheet's effect runs before this one, so `sheet` is already set on open and cleared on close)
    const { story, sheet } = useStory.getState();
    if (!story && !sheet && !hadSheet.current) getLenis()?.scrollTo(0, { immediate: true });
    hadSheet.current = sheet;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    document.querySelectorAll("[data-reveal]:not(.is-in), [data-reveal-mask]:not(.is-in)").forEach((n) => io.observe(n));

    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const still = document.documentElement.dataset.motion === "reduced";
      for (const el of items) {
        if (still) {
          el.style.transform = "";
          continue;
        }
        const r = el.parentElement!.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around centre
        const amt = parseFloat(el.dataset.parallax || "6");
        el.style.transform = `translate3d(0, ${(-p * amt).toFixed(2)}%, 0) scale(1.08)`;
      }
    };
    const onScroll = () => (raf ||= requestAnimationFrame(update));
    if (items.length) {
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
