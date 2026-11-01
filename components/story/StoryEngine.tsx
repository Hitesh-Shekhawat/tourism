"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { chapterDomId, chapters, toMinutes } from "@/lib/day";
import { driveWithGsap, onLenis } from "@/lib/smooth";
import { bus, setMinutes } from "@/lib/story/bus";
import { loadGsap, onSetupsChange, sortedSetups, type MotionKit } from "@/lib/story/engine";
import { applyPalette, paletteAt, resetPalette, type Keyframe } from "@/lib/story/palette";
import { canRunGl, useStory } from "@/lib/story/store";

// three / R3F / drei: one dynamic chunk, after first paint and idle, capable desktops only (§13)
const GLRoot = dynamic(() => import("./gl/GLRoot"), { ssr: false });

type Clock = { pos: number; min: number };

/**
 * The home page's scroll engine (§4). Runs every chapter's choreography in page order inside one
 * gsap.context (rebuilt when the motion mode changes), and drives the time-of-day palette, the
 * sundial clock, the current chapter and chapter_view events from one ScrollTrigger.
 */
export function StoryEngine({ children }: { children: ReactNode }) {
  const mode = useStory((s) => s.mode);
  const [glWanted, setGlWanted] = useState(false);

  useEffect(() => {
    useStory.getState().set({ story: true });
    return () => {
      useStory.getState().set({ story: false, gl: false, glOpen: false });
      resetPalette();
      delete document.documentElement.dataset.gl;
      delete document.documentElement.dataset.glOpen;
    };
  }, []);

  // WebGL: only on capable desktops in the full film, mounted on first interaction
  useEffect(() => {
    if (!canRunGl(mode)) {
      setGlWanted(false);
      useStory.getState().set({ gl: false, glOpen: false });
      delete document.documentElement.dataset.gl;
      delete document.documentElement.dataset.glOpen;
      return;
    }
    let cancelled = false;
    // The splash screen covers the page while the 3D loads, so start at once: fetch the chunk now
    // and mount on the next idle moment (the 2D arch stays the first paint underneath)
    void import("./gl/GLRoot");
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 50));
    // re-check at fire time: the mode may have changed (first render assumes desktop until Motion measures)
    const id = idle(() => !cancelled && canRunGl(useStory.getState().mode) && setGlWanted(true), { timeout: 300 });
    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(id as number);
    };
  }, [mode]);

  useEffect(() => {
    let cancelled = false;
    let kit: MotionKit | null = null;
    let ctx: gsap.Context | null = null;
    let cleanups: (() => void)[] = [];
    let undoLenis: (() => void) | null = null;
    let offLenis: (() => void) | null = null;
    let palFrames: Keyframe[] = [];
    let clock: Clock[] = [];
    let tops: number[] = [];
    const seen = new Set<string>();
    let raf = 0;
    let refresh = () => {};

    const measure = () => {
      const vh = window.innerHeight;
      const els = chapters.map((c) => document.getElementById(chapterDomId(c.id)));
      tops = els.map((el) => (el ? el.getBoundingClientRect().top + window.scrollY : 0));
      const bottoms = els.map((el, i) => (el ? tops[i] + el.offsetHeight : 0));
      palFrames = [];
      clock = [];
      chapters.forEach((c, i) => {
        const a = tops[i] + vh * 0.35;
        const b = Math.max(a + 1, bottoms[i] - vh * 0.35);
        const stops = c.stops ?? [];
        if (stops.length) {
          stops.forEach((st, k) => {
            const pos = a + ((b - a) * (k + 0.5)) / stops.length;
            palFrames.push({ pos, palette: st.palette });
            clock.push({ pos, min: toMinutes(st.time) });
          });
          palFrames.unshift({ pos: a, palette: stops[0].palette });
          palFrames.push({ pos: b, palette: stops[stops.length - 1].palette });
        } else {
          palFrames.push({ pos: a, palette: c.palette }, { pos: b, palette: c.palette });
        }
        if (!stops.length) clock.push({ pos: a, min: toMinutes(c.time) });
      });
      palFrames.sort((x, y) => x.pos - y.pos);
      clock.sort((x, y) => x.pos - y.pos);
    };

    const update = () => {
      raf = 0;
      if (!tops.length) measure();
      const vh = window.innerHeight;
      const y = window.scrollY + vh * 0.5;
      const reduced = useStory.getState().mode === "reduced";
      applyPalette(paletteAt(palFrames, y, reduced));

      // clock: piecewise linear between chapter times
      let min = clock[0]?.min ?? 330;
      for (let i = 0; i < clock.length; i++) {
        if (y >= clock[i].pos) {
          const n = clock[i + 1];
          min = n ? clock[i].min + (n.min - clock[i].min) * Math.min(1, (y - clock[i].pos) / Math.max(1, n.pos - clock[i].pos)) : clock[i].min;
        }
      }
      setMinutes(reduced ? (clock.filter((c) => y >= c.pos).pop()?.min ?? min) : min);

      let idx = 0;
      for (let i = 0; i < tops.length; i++) if (y >= tops[i]) idx = i;
      const st = useStory.getState();
      if (st.chapter !== idx) st.set({ chapter: idx });
      const id = chapters[idx].id;
      if (!seen.has(id)) {
        seen.add(id);
        track("chapter_view", { id });
      }
    };
    const schedule = () => (raf ||= requestAnimationFrame(update));

    const build = () => {
      if (!kit || cancelled) return;
      const { gsap, ScrollTrigger } = kit;
      const st = useStory.getState();
      const m = { ...kit, mode: st.mode, gl: st.gl };
      ctx = gsap.context(() => {
        for (const fn of sortedSetups()) {
          try {
            const c = fn(m);
            if (c) cleanups.push(c);
          } catch (e) {
            console.error("[story] chapter setup failed", e);
          }
        }
        // Created last: its range includes every pin's spacing
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            bus.velocity = self.getVelocity();
            schedule();
          },
          onRefresh: () => {
            measure();
            schedule();
          },
        });
      });
      ScrollTrigger.refresh();
    };

    const teardown = () => {
      cleanups.forEach((c) => c());
      cleanups = [];
      ctx?.revert();
      ctx = null;
    };

    let pending = 0;
    const rebuild = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        teardown();
        build();
      });
    };

    const onScroll = () => schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    update();

    loadGsap().then((k) => {
      if (cancelled) return;
      kit = k;
      offLenis = onLenis((l) => {
        undoLenis?.();
        undoLenis = l ? driveWithGsap(k.gsap, k.ScrollTrigger) : null;
      });
      build();
      onSetupsChange(rebuild);
      refresh = () => k.ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("frames:batch", refresh);
      if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
    });

    // Rebuild everything when the motion mode changes (breakpoint, OS setting, Motion: full / calm),
    // …and when WebGL takes over from the 2D fallbacks (Ch03's layout changes with it)
    let lastMode = useStory.getState().mode;
    let lastGl = useStory.getState().gl;
    const unsub = useStory.subscribe((s) => {
      if (s.mode === lastMode && s.gl === lastGl) return;
      lastMode = s.mode;
      lastGl = s.gl;
      rebuild();
    });

    return () => {
      cancelled = true;
      unsub();
      onSetupsChange(null);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("frames:batch", refresh);
      window.removeEventListener("load", refresh);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(pending);
      offLenis?.();
      undoLenis?.();
      teardown();
    };
  }, []);

  return (
    <>
      {children}
      {glWanted && <GLRoot />}
    </>
  );
}
