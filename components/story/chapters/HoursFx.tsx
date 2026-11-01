"use client";

import { useEffect } from "react";
import { chapter } from "@/lib/day";
import { getLenis } from "@/lib/smooth";
import { useChapterMotion } from "@/lib/story/engine";
import { riseHeading, vhPx } from "@/lib/story/fx";
import { useStory } from "@/lib/story/store";

const PIN = chapter("hours").pin!;
let trigger: ScrollTrigger | null = null;

const scrollTo = (y: number) => {
  const l = getLenis();
  if (l) l.scrollTo(y, { duration: 0.8 });
  else window.scrollTo({ top: y, behavior: useStory.getState().mode === "reduced" ? "auto" : "smooth" });
};

export function HoursFx() {
  useChapterMotion("hours", 20, (m) => {
    const { gsap, mode } = m;
    const root = document.getElementById("ch-hours")!;
    riseHeading(m, root.querySelector("[data-rise]"));
    const cards = gsap.utils.toArray<HTMLElement>("[data-hours-card]", root);
    const n = cards.length;
    if (mode !== "desktop") return;

    const stage = root.querySelector<HTMLElement>(".hours-stage")!;
    const gnomons = gsap.utils.toArray<HTMLElement>(".gnomon", root);
    const set = (p: number) => {
      // p: 0..n-1 dial position. Card at 12 o'clock is at the front, neighbours recede.
      cards.forEach((c, i) => {
        const d = i - p;
        const a = Math.min(1, Math.abs(d));
        c.style.setProperty("--d", d.toFixed(3));
        c.style.setProperty("--s", (1 - a * 0.22).toFixed(3));
        c.style.setProperty("--b", (1 - a * 0.3).toFixed(3));
        c.style.setProperty("--o", Math.abs(d) > 2.6 ? "0" : "1");
        c.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
      });
      // the gnomon shadow sweeps across in sync, like the hour moving
      const g = `${(110 - (p / (n - 1)) * 120).toFixed(1)}%`;
      gnomons.forEach((el) => el.style.setProperty("--gx", g));
    };
    const st = { p: 0 };
    const tw = gsap.to(st, {
      p: n - 1,
      ease: "none",
      onUpdate: () => set(st.p),
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${vhPx(PIN)()}`,
        pin: true,
        anticipatePin: 1,
        scrub: 1.2,
        snap: { snapTo: 1 / (n - 1), directional: true, duration: { min: 0.5, max: 1 }, delay: 0.2, ease: "power1.inOut" },
        invalidateOnRefresh: true,
        onToggle: (s) => stage.style.setProperty("will-change", s.isActive ? "transform" : "auto"),
      },
    });
    trigger = tw.scrollTrigger ?? null;
    set(0);
    return () => {
      trigger = null;
      cards.forEach((c) => c.removeAttribute("style"));
    };
  });

  // Keyboard (←/→ when focused) and focus-follows (tabbing to a card turns the dial to it)
  useEffect(() => {
    const root = document.getElementById("ch-hours")!;
    const wrap = root.querySelector<HTMLElement>("[data-hours-wrap]")!;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-hours-card]"));
    const n = cards.length;
    const go = (i: number) => {
      const t = trigger;
      if (!t || useStory.getState().mode !== "desktop") return false;
      scrollTo(t.start + ((t.end - t.start) * Math.max(0, Math.min(n - 1, i))) / (n - 1));
      return true;
    };
    const current = () => {
      const t = trigger;
      return t ? Math.round(t.progress * (n - 1)) : 0;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (useStory.getState().mode === "desktop") {
        if (go(current() + (e.key === "ArrowRight" ? 1 : -1))) e.preventDefault();
      } else {
        const row = root.querySelector<HTMLElement>("[data-hours-ring]")!;
        row.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * cards[0].offsetWidth, behavior: "smooth" });
        e.preventDefault();
      }
    };
    const onFocus = (e: FocusEvent) => {
      const i = cards.findIndex((c) => c.contains(e.target as Node));
      if (i >= 0 && i !== current()) go(i);
    };
    wrap.addEventListener("keydown", onKey);
    wrap.addEventListener("focusin", onFocus);

    // Compact: the card nearest the centre of the row scales .9 → 1
    const row = root.querySelector<HTMLElement>("[data-hours-ring]")!;
    let raf = 0;
    const scale = () => {
      raf = 0;
      if (useStory.getState().mode !== "compact") return;
      const mid = row.scrollLeft + row.clientWidth / 2;
      cards.forEach((c) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) / c.offsetWidth;
        c.style.setProperty("--s", (1 - Math.min(1, d) * 0.1).toFixed(3));
      });
    };
    const onRow = () => (raf ||= requestAnimationFrame(scale));
    row.addEventListener("scroll", onRow, { passive: true });
    scale();
    return () => {
      wrap.removeEventListener("keydown", onKey);
      wrap.removeEventListener("focusin", onFocus);
      row.removeEventListener("scroll", onRow);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
