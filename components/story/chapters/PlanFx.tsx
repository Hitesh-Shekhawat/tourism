"use client";

import { useChapterMotion } from "@/lib/story/engine";
import { riseBlock, riseHeading } from "@/lib/story/fx";

/** The trail line draws with scroll (scrub: true); the steps rise as the line reaches them. */
export function PlanFx() {
  useChapterMotion("plan", 70, (m) => {
    const { gsap, mode } = m;
    const el = document.getElementById("ch-plan")!;
    riseHeading(m, el.querySelector("[data-rise]"));
    if (mode === "reduced") return;
    const lines = gsap.utils.toArray<SVGPathElement>(".plan-line path", el);
    gsap.fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: el.querySelector("ol"), start: "top 80%", end: "bottom 55%", scrub: true } });
    riseBlock(m, gsap.utils.toArray("[data-step]", el), { stagger: 0.12 });
  });
  return null;
}
