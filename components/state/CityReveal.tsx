"use client";

import { useRef, type ReactNode } from "react";
import { useSectionMotion } from "@/components/homepage/HomeMotion";

/**
 * A city's arrival: as its section comes up, the cards rise in one after another and each photo opens
 * from the bottom like a curtain. The horizontal pin itself lives in HorizontalTrack.
 */
export function CityReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useSectionMotion(root, ({ gsap }, el) => {
    const cards = gsap.utils.toArray<HTMLElement>(".htrack-list > li", el);
    const frames = gsap.utils.toArray<HTMLElement>(".dest-frame", el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 72%", once: true } });
    tl.from(cards, { y: 56, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0);
    tl.from(frames, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut", stagger: 0.08, clearProps: "clipPath" }, 0);
    tl.from(".city-num", { yPercent: 40, autoAlpha: 0, duration: 1.2, ease: "expo.out" }, 0);
  });

  return <div ref={root}>{children}</div>;
}
