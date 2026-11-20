"use client";

import { useRef, type ReactNode } from "react";
import { useSectionMotion } from "@/components/homepage/HomeMotion";

export function JourneyReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLOListElement>(null);

  useSectionMotion(root, ({ gsap }, section) => {
    gsap.utils.toArray<HTMLElement>("[data-journey-card]", section).forEach((card) => {
      gsap.from(card, {
        y: 34,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 84%", once: true },
      });
    });
  });

  return <ol ref={root} className="journey-list">{children}</ol>;
}
