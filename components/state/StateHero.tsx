"use client";

import { useRef } from "react";
import { useSectionMotion } from "@/components/homepage/HomeMotion";
import { Breadcrumbs } from "@/components/page/PageParts";
import { Photo } from "@/components/ui/Photo";
import { Deva } from "@/components/ui/bits";
import type { AssetKey } from "@/content/assets";

type City = { id: string; name: string; epithet: string };

/**
 * The state page's opening: a full-bleed photograph that settles in (CSS, so it plays before GSAP
 * loads), the state's name rising letter by letter, and an index of its cities. As the page scrolls
 * away, GSAP drifts the photo slower than the page and lifts the copy out.
 */
export function StateHero({ name, devanagari, tagline, image, cities, sightCount }: { name: string; devanagari: string; tagline: string; image: AssetKey; cities: City[]; sightCount: number }) {
  const root = useRef<HTMLElement>(null);

  useSectionMotion(root, ({ gsap }, el) => {
    const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
    gsap.to(".sh-media", { yPercent: 18, ease: "none", scrollTrigger: st });
    gsap.to(".sh-copy", { yPercent: -14, autoAlpha: 0, ease: "none", scrollTrigger: { ...st, end: "bottom 25%" } });
  });

  return (
    <section ref={root} id="state-top" className="sh-hero on-dark relative isolate flex min-h-[100svh] items-end overflow-hidden bg-maroon text-ivory">
      <div className="sh-media absolute inset-0 -z-10" aria-hidden="true">
        <div className="sh-zoom absolute inset-0">
          <Photo k={image} fill priority sizes="100vw" decorative phPos="below-header" />
        </div>
      </div>
      <div aria-hidden="true" className="sh-shade absolute inset-0 -z-[5]" />

      <div className="sh-copy wrap w-full pt-40 pb-[clamp(32px,7vh,72px)]">
        <Breadcrumbs items={[{ name: "Explore", href: "/#explore" }, { name }]} dark />
        <p className="sh-fade t-label mt-8 text-ivory/90" style={{ ["--d" as string]: "200ms" }}>
          {cities.length} cities · {sightCount} places to see
        </p>
        <h1 className="sh-title mt-3 flex flex-wrap items-end gap-x-6 gap-y-1">
          <span className="sr-only">{name}</span>
          <span aria-hidden="true" className="sh-word">
            {[...name].map((c, i) => (
              <span key={i} className="sh-char">
                <span style={{ ["--i" as string]: i }}>{c}</span>
              </span>
            ))}
          </span>
          <Deva className="sh-fade pb-[0.3em] text-[clamp(1.5rem,3.4vw,3rem)] text-ivory/85">{devanagari}</Deva>
        </h1>
        <p className="sh-fade measure mt-4 text-lg text-ivory/90" style={{ ["--d" as string]: "500ms" }}>
          {tagline}. Choose a city, then scroll sideways through the places we would take you.
        </p>

        <nav aria-label={`Cities in ${name}`} className="sh-index mt-10">
          <ol>
            {cities.map((c, i) => (
              <li key={c.id} className="sh-fade" style={{ ["--d" as string]: `${650 + i * 60}ms` }}>
                <a href={`#city-${c.id}`} className="sh-index-link">
                  <span className="serif-italic tabular text-dune">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[1.25rem] leading-none">{c.name}</span>
                  <span className="sh-index-epithet">{c.epithet}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="sh-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
