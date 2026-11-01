"use client";

import { Link } from "next-view-transitions";
import { useRef, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { Arrow, Deva, SectionHead } from "@/components/ui/bits";
import type { Ratio } from "@/content/assets";
import { destinations } from "@/content/destinations";
import { experiences } from "@/content/experiences";
import { discover } from "@/content/homepage";
import { MQ, useSectionMotion } from "./HomeMotion";

/** Editorial placement of the five tiles after the lead (12-column grid at ≥1024px): never a uniform grid. */
const TILES: { cls: string; ratio: Ratio }[] = [
  { cls: "lg:col-span-5", ratio: "4:5" },
  { cls: "lg:col-span-6 lg:col-start-7 lg:mt-48", ratio: "3:2" },
  { cls: "lg:col-span-5 lg:col-start-2", ratio: "3:2" },
  { cls: "lg:col-span-4 lg:col-start-8 lg:mt-12", ratio: "4:5" },
  { cls: "lg:col-span-7 lg:col-start-3", ratio: "21:9" },
];

/**
 * 03 · Destinations & experiences. The lead photo opens from an inset frame to full width as it scrolls in;
 * the other cities reveal through a clip-path (the site's data-reveal-mask) while their photos settle from a
 * slight zoom. Experiences follow as an editorial list; on desktop a sticky preview follows hover and focus.
 */
export function Discover() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [lead, ...rest] = destinations;

  useSectionMotion(root, ({ gsap }, el) => {
    const mm = gsap.matchMedia();
    mm.add("all", () => {
      const frame = el.querySelector(".home-lead-frame");
      gsap.fromTo(frame, { clipPath: "inset(9% 12% 9% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: frame, start: "top 85%", end: "center 55%", scrub: 1 } });
      gsap.utils.toArray<HTMLElement>(".home-dest-img", el).forEach((img) => {
        gsap.fromTo(img, { scale: 1.22 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom 40%", scrub: true } });
      });
    });
    mm.add(MQ.wide, () => {
      gsap.from(".home-exp-row", { y: 32, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".home-exp-list", start: "top 80%", once: true } });
    });
    return () => mm.revert();
  });

  return (
    <section ref={root} id="destinations" aria-labelledby="disc-title" className="section-y bg-sandstone">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHead n="03" label={discover.label} />
            <h2 id="disc-title" className="t-h1 mt-8 max-w-[14ch]" data-reveal>
              {discover.title}
            </h2>
          </div>
          <p className="measure text-ink-muted lg:col-span-4 lg:col-start-9" data-reveal>
            {discover.note}
          </p>
        </div>

        {/* Lead city: opens to full width */}
        <Link href={`/destinations/${lead.slug}`} scroll={false} className="group mt-14 block lg:mt-20">
          <div className="home-lead-frame relative overflow-hidden bg-dune">
            <div className="home-dest-img">
              <Photo k={lead.heroImage} sizes="100vw" decorative />
            </div>
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <div className="on-dark absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 text-ivory sm:p-8 lg:p-12">
              <p className="flex items-baseline gap-4">
                <span className="t-h1">{lead.name}</span>
                <Deva className="text-2xl text-dune">{lead.devanagari}</Deva>
              </p>
              <span className="t-label hidden items-center gap-2 sm:inline-flex">
                Discover <Arrow />
              </span>
            </div>
          </div>
          <p className="measure mt-4 text-ink-muted">{lead.descriptor}</p>
        </Link>

        {/* The other cities, placed editorially */}
        <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:grid-cols-12 lg:gap-y-20">
          {rest.map((d, i) => {
            const t = TILES[i % TILES.length];
            return (
              <li key={d.slug} className={t.cls}>
                <Link href={`/destinations/${d.slug}`} scroll={false} className="hover-zoom group block">
                  <div data-reveal-mask>
                    <div className="relative overflow-hidden bg-dune">
                      <div className="home-dest-img">
                        <Photo k={d.indexImage} ratio={t.ratio} sizes="(min-width: 1024px) 45vw, (min-width: 640px) 45vw, 92vw" decorative compact />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <p className="flex items-baseline gap-3">
                      <span className="font-display text-[1.875rem] leading-none">{d.name}</span>
                      <Deva className="text-lg text-accent">{d.devanagari}</Deva>
                    </p>
                    <Arrow className="text-accent" />
                  </div>
                  <span aria-hidden="true" className="caption-line mt-3 block h-px bg-brass" />
                  <p className="t-small mt-3 max-w-[40ch] text-ink-muted">{d.descriptor}</p>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Experiences */}
        <div className="mt-24 grid gap-10 border-t border-brass/50 pt-14 lg:mt-36 lg:grid-cols-12 lg:pt-20">
          <div className="hidden lg:col-span-5 lg:block">
            <div className="home-exp-preview sticky top-[calc(var(--header-h)+32px)]" aria-hidden="true">
              {experiences.map((e, i) => (
                <div key={e.slug} className={`absolute inset-0 transition-[opacity,clip-path] duration-700 ease-[var(--ease-out)] ${i === active ? "opacity-100 [clip-path:inset(0)]" : "opacity-0 [clip-path:inset(0_0_100%_0)]"}`}>
                  <Photo k={e.image} fill sizes="38vw" decorative compact />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <h3 className="t-label text-ink-muted">{discover.experiencesTitle}</h3>
            <ol className="home-exp-list mt-6">
              {experiences.map((e, i) => (
                <li key={e.slug} className="home-exp-row border-b border-brass/40">
                  <Link
                    href={`/experiences/${e.slug}`}
                    className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-2 py-7 sm:grid-cols-[3rem_1fr_7.5rem]"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                  >
                    <span className="serif-italic numerals text-[1.25rem] text-brass-text">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="t-label block text-ink-muted">{e.label}</span>
                      <span className="mt-2 block font-display text-[1.75rem] leading-tight transition-colors group-hover:text-accent sm:text-[2.125rem]">{e.title}</span>
                      <span className="t-small mt-2 block max-w-[46ch] text-ink-muted">{e.summary}</span>
                    </span>
                    <span className="col-start-2 mt-3 block overflow-hidden sm:col-start-3 sm:row-start-1 sm:mt-0 lg:hidden">
                      <Photo k={e.image} ratio="3:2" sizes="(min-width: 640px) 120px, 60vw" decorative compact />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
