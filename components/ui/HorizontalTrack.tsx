"use client";

import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSectionMotion } from "@/components/homepage/HomeMotion";
import { getLenis } from "@/lib/smooth";
import { MQ_MOTION } from "@/lib/motion";

/**
 * An editorial horizontal track.
 * - Desktop (≥ 1024px, motion allowed): GSAP pins the track for exactly the distance its cards need, and
 *   vertical scrolling (smoothed by Lenis) carries them sideways; the last card always stops fully in view
 *   with the gutter after it. Cards are sized to the viewport height so the heading and every card fit on
 *   screen. Arrow buttons step the scroll; a hairline shows progress.
 * - Below 1024px or with reduced motion: a native overflow-x list with scroll-snap (touch, trackpad, Tab),
 *   plus drag-with-momentum on mouse.
 * The floating contact button stays hidden while a track is on screen (data-no-float), so it never covers a card.
 */
export function HorizontalTrack({ label, children, head, className = "", dark = false }: { label: string; children: ReactNode; head?: ReactNode; className?: string; dark?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  // Desktop: pinned, scroll-driven horizontal movement
  useSectionMotion(root, ({ gsap }, el) => {
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION.wide, () => {
      const track = list.current!;
      el.classList.add("is-pinned");
      track.scrollLeft = 0;
      const pad = () => parseFloat(getComputedStyle(track).paddingRight) || 0;
      // exact travel: the last card's right edge plus the gutter, minus the visible width
      const distance = () => {
        const last = track.lastElementChild as HTMLElement | null;
        return last ? Math.max(0, last.offsetLeft + last.offsetWidth + pad() - track.clientWidth) : 0;
      };
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
            setEdge((e) => {
              const n = { start: s.progress < 0.01, end: s.progress > 0.99 };
              return n.start === e.start && n.end === e.end ? e : n;
            });
          },
        },
      });
      trigger.current = tween.scrollTrigger ?? null;
      // each photo drifts a little inside its frame as the track moves (≤ 8%)
      gsap.utils.toArray<HTMLElement>(".dest-img", el).forEach((img) => {
        gsap.fromTo(img, { xPercent: -4 }, { xPercent: 4, ease: "none", scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
      // keyboard: tabbing to a card that is off to the side scrolls the page until it is in view
      const onFocus = (e: FocusEvent) => {
        const st = tween.scrollTrigger;
        const card = (e.target as HTMLElement).closest<HTMLElement>(".htrack-list > li");
        if (!st || !card) return;
        const d = distance();
        const x = Math.min(d, Math.max(0, card.offsetLeft - pad()));
        const y = st.start + (d ? x / d : 0) * (st.end - st.start);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
      };
      track.addEventListener("focusin", onFocus);
      return () => {
        track.removeEventListener("focusin", onFocus);
        el.classList.remove("is-pinned");
        trigger.current = null;
        gsap.set(track, { clearProps: "transform" });
      };
    });
    return () => mm.revert();
  });

  // Native mode: edge state + mouse drag with momentum
  useEffect(() => {
    const el = list.current!;
    const pinned = () => root.current?.classList.contains("is-pinned");
    const update = () => !pinned() && setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    let down = false;
    let moved = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;
    let raf = 0;
    const still = () => document.documentElement.dataset.motion === "reduced";
    const glide = () => {
      v *= 0.94;
      el.scrollLeft -= v;
      if (Math.abs(v) > 0.4) raf = requestAnimationFrame(glide);
      else el.classList.remove("is-dragging");
    };
    const onDown = (e: PointerEvent) => {
      if (pinned() || e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(raf);
      down = true;
      moved = 0;
      v = 0;
      lastX = e.clientX;
      lastT = e.timeStamp;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - lastX;
      moved += Math.abs(dx);
      if (moved > 6 && !el.classList.contains("is-dragging")) {
        el.classList.add("is-dragging");
        el.setPointerCapture(e.pointerId);
      }
      if (!el.classList.contains("is-dragging")) return;
      el.scrollLeft -= dx;
      v = (dx / Math.max(1, e.timeStamp - lastT)) * 16;
      lastX = e.clientX;
      lastT = e.timeStamp;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!el.classList.contains("is-dragging")) return;
      if (still()) el.classList.remove("is-dragging");
      else raf = requestAnimationFrame(glide);
    };
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("scroll", update);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const st = trigger.current;
    if (st) {
      // pinned: move the page so the track advances by about one viewport of cards
      const span = st.end - st.start;
      const share = span > 0 ? Math.min(1, (window.innerWidth * 0.7) / span) : 1;
      const p = Math.max(0, Math.min(1, st.progress + dir * share));
      const y = st.start + p * span;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { duration: 1.1 });
      else window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }
    const el = list.current!;
    const reduced = document.documentElement.dataset.motion === "reduced";
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div ref={root} className={`htrack ${dark ? "htrack-dark" : ""} ${className}`} data-no-float="">
      <div className="wrap htrack-head">
        <div className="min-w-0 flex-1">{head}</div>
        <div className="htrack-ctls" role="group" aria-label={`${label}: scroll`}>
          <button type="button" className="htrack-btn" onClick={() => step(-1)} disabled={edge.start} aria-label="Previous">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
          <button type="button" className="htrack-btn" onClick={() => step(1)} disabled={edge.end} aria-label="Next">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>
      </div>
      <ul ref={list} className="htrack-list" aria-label={label}>
        {children}
      </ul>
      <div className="wrap htrack-bar" aria-hidden="true">
        <span ref={bar} />
      </div>
    </div>
  );
}
