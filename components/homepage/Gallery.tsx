"use client";

import { useRef } from "react";
import { Photo } from "@/components/ui/Photo";
import { SectionHead } from "@/components/ui/bits";
import { assets, type Ratio } from "@/content/assets";
import { gallery, sectionNo } from "@/content/homepage";
import { MQ, useSectionMotion } from "./HomeMotion";

/** Placement per slot (12 columns at ≥1024px) and a parallax depth: deeper frames drift further. */
const LAYOUT: { cls: string; depth: number }[] = [
  { cls: "col-span-2 lg:col-span-8", depth: 6 },
  { cls: "lg:col-span-4 lg:mt-40", depth: 12 },
  { cls: "lg:col-span-4 lg:col-start-2 lg:-mt-20", depth: 10 },
  { cls: "col-span-2 lg:col-span-6 lg:col-start-6 lg:mt-16", depth: 5 },
  { cls: "col-span-2 lg:col-span-12", depth: 4 },
  { cls: "lg:col-span-4", depth: 11 },
  { cls: "col-span-2 lg:col-span-5 lg:mt-36", depth: 6 },
  { cls: "lg:col-span-3 lg:-mt-10", depth: 13 },
];

/**
 * 07 · Gallery. An asymmetric composition: each frame reveals through a clip-path as it enters, and on
 * desktop drifts at its own depth while it crosses the viewport. Hover settles a slight zoom.
 */
export function Gallery() {
  const root = useRef<HTMLElement>(null);

  useSectionMotion(root, ({ gsap }, el) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.wide, () => {
      gsap.utils.toArray<HTMLElement>("[data-depth]", el).forEach((inner) => {
        const d = Number(inner.dataset.depth);
        gsap.fromTo(inner, { yPercent: -d }, { yPercent: d, ease: "none", scrollTrigger: { trigger: inner.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    return () => mm.revert();
  });

  return (
    <section ref={root} id="gallery" aria-labelledby="gal-title" className="section-y overflow-hidden bg-ivory">
      <div className="wrap">
        <SectionHead n={sectionNo.gallery} label={gallery.label} />
        <h2 id="gal-title" className="t-h1 mt-8 max-w-[12ch]" data-reveal>
          {gallery.title}
        </h2>

        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:mt-20 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
          {gallery.items.map((k, i) => {
            const l = LAYOUT[i % LAYOUT.length];
            const ratio: Ratio = assets[k].ratio;
            return (
              <li key={k} className={l.cls}>
                <figure className="hover-zoom">
                  <div data-reveal-mask style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
                    <div className="relative overflow-hidden bg-dune" style={{ aspectRatio: ratio.replace(":", " / ") }}>
                      <div className="absolute -inset-y-[14%] inset-x-0" data-depth={l.depth}>
                        <Photo k={k} fill sizes={l.cls.includes("col-span-12") ? "100vw" : "(min-width: 1024px) 50vw, 50vw"} compact decorative />
                      </div>
                    </div>
                  </div>
                  <figcaption className="t-small mt-3 text-ink-muted">{assets[k].alt}</figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
