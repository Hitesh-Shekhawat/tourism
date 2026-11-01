"use client";

import type { MotionCtx } from "./engine";

/**
 * Shared reveals (§10): a SplitText line rise (power3.out, 80ms stagger) plus Fraunces' SOFT axis
 * settling 0 → 100, like ink spreading on paper. No-ops in reduced mode (text is simply visible).
 */
export function riseHeading(m: MotionCtx, el: HTMLElement | null, opts: { start?: string; delay?: number } = {}) {
  if (!el || m.mode === "reduced") return;
  const { gsap, SplitText } = m;
  const trigger = { trigger: el, start: opts.start ?? "top 85%", once: true };
  SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit: (self) => gsap.from(self.lines, { yPercent: 108, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: opts.delay ?? 0, scrollTrigger: trigger }),
  });
  gsap.fromTo(el, { "--soft": 0 }, { "--soft": 100, duration: 1.6, ease: "power2.out", delay: (opts.delay ?? 0) + 0.15, scrollTrigger: trigger });
}

/** A simple line-rise for small blocks (copy, labels). */
export function riseBlock(m: MotionCtx, els: Element | Element[] | null, opts: { start?: string; stagger?: number } = {}) {
  if (!els || m.mode === "reduced") return;
  const list = Array.isArray(els) ? els : [els];
  if (!list.length) return;
  m.gsap.from(list, { y: 24, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: opts.stagger ?? 0.08, scrollTrigger: { trigger: list[0], start: opts.start ?? "top 88%", once: true } });
}

/** Debounced resize-safe pin length in px from viewport heights. */
export const vhPx = (n: number) => () => Math.round(window.innerHeight * n);
