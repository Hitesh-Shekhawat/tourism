"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useSectionMotion, MQ } from "@/components/homepage/HomeMotion";
import { atlasHref } from "@/lib/atlas-href";
import { goTo, scrollToAtlas, useExplorer } from "@/components/explorer/store";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow } from "@/components/ui/bits";
import { interests, places, type Interest } from "@/content/explorer";

const FortWindowScene = dynamic(
  () => import("@/components/homepage/FortWindowScene").then((module) => module.FortWindowScene),
  { ssr: false },
);

const TITLES: Record<Interest, string> = {
  heritage: "Heritage & Forts",
  lakes: "Lakes & Romantic Escapes",
  desert: "Desert Adventures",
  spiritual: "Culture & Traditions",
  hills: "Hills & Nature",
  wildlife: "Wildlife & Nature",
};

/** A pinned jharokha on desktop; a natural sequence of window views on smaller screens. */
export function LookingFor({ n }: { n: string }) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<Interest | null>(null);
  const [wide, setWide] = useState(false);
  const [lowPower, setLowPower] = useState(true);
  const current = interests[active];

  useEffect(() => {
    const wideQuery = window.matchMedia("(min-width: 1024px)");
    const powerQuery = window.matchMedia("(max-width: 1279px), (prefers-reduced-motion: reduce)");
    const update = () => {
      setWide(wideQuery.matches);
      setLowPower(powerQuery.matches);
    };
    update();
    wideQuery.addEventListener("change", update);
    powerQuery.addEventListener("change", update);
    return () => {
      wideQuery.removeEventListener("change", update);
      powerQuery.removeEventListener("change", update);
    };
  }, []);

  useSectionMotion(root, ({ gsap, ScrollTrigger }, section) => {
    const media = gsap.matchMedia();
    media.add(MQ.wide, () => {
      const endDistance = () => Math.max(1, (interests.length - 1) * window.innerHeight * 0.72);
      let last = -1;
      const trigger = ScrollTrigger.create({
        trigger: section,
        pin: frame.current,
        start: "top top",
        end: () => `+=${endDistance()}`,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(interests.length - 1, Math.floor(self.progress * interests.length));
          if (next !== last) {
            last = next;
            setActive(next);
          }
        },
        onLeaveBack: () => {
          last = 0;
          setActive(0);
        },
      });
      return () => trigger.kill();
    });
    return () => media.revert();
  });

  const open = (e: MouseEvent<HTMLAnchorElement>, id: Interest) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !document.getElementById("explore")) return;
    const touch = window.matchMedia("(hover: none)").matches;
    if (touch && preview !== id) {
      e.preventDefault();
      setPreview(id);
      return;
    }
    e.preventDefault();
    useExplorer.getState().set({ interest: id });
    goTo("rajasthan");
    scrollToAtlas();
  };

  const link = (id: Interest, className: string, children: ReactNode, onBlur?: () => void) => (
    <a
      href={atlasHref("rajasthan", undefined, id)}
      className={className}
      onClick={(e) => open(e, id)}
      onBlur={onBlur}
    >
      {children}
    </a>
  );

  return (
    <section ref={root} id="experiences" aria-label="What are you looking for?" className="sec fort-section">
      <div className="fort-desktop" ref={frame}>
        <div className="wrap fort-desktop-inner">
          <div className="fort-heading">
            <SectionHeading n={n} label="A window into Rajasthan" id="look-title" title="What are you looking for?" note="Choose a feeling. Let the landscape reveal itself." dark />
          </div>
          <div className="fort-view">
            <div className="fort-window">
              <div key={current.id} className="fort-photo" aria-hidden="true">
                <div className="fort-image-aperture">
                  <Photo k={current.image} fill sizes="(min-width: 1024px) 25vw, 90vw" decorative />
                </div>
              </div>
              {wide && (
                <div className="fort-canvas">
                  <FortWindowScene lowPower={lowPower} />
                </div>
              )}
              <div key={current.id} className="fort-caption" aria-live="polite">
                <p className="t-label text-dune">{String(active + 1).padStart(2, "0")} <span className="text-ivory/50">/ {String(interests.length).padStart(2, "0")}</span> · {current.label}</p>
                <h3 className="mt-3 font-display text-[clamp(2rem,4vw,4rem)] leading-[0.98]">{TITLES[current.id]}</h3>
                <p className="mt-4 max-w-[34ch] text-[0.9375rem] leading-relaxed text-ivory/90">{current.text}</p>
                {link(current.id, "link mt-5 inline-flex items-center gap-2 text-ivory", <>Explore this feeling <Arrow /></>)}
              </div>
            </div>
            <div className="fort-progress" aria-label={`Category ${active + 1} of ${interests.length}`}>
              {interests.map((interest, i) => (
                <span key={interest.id} className={i === active ? "is-current" : ""} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fort-mobile wrap">
        <SectionHeading n={n} label="A window into Rajasthan" title="What are you looking for?" id="look-title-mobile" note="Choose a feeling. Let the landscape reveal itself." dark />
        <ol className="fort-mobile-list">
          {interests.map((interest, i) => {
            const count = places.filter((place) => place.interests.includes(interest.id)).length;
            return (
              <li key={interest.id} className="fort-mobile-item" data-preview={preview === interest.id ? "" : undefined}>
                {link(interest.id, "fort-mobile-link", <>
                  <span className="fort-mobile-image">
                    <Photo k={interest.image} fill sizes="(min-width: 640px) 80vw, 100vw" decorative />
                  </span>
                  <span className="fort-mobile-copy">
                    <span className="t-label text-dune">{String(i + 1).padStart(2, "0")} · {count} {count === 1 ? "place" : "places"}</span>
                    <span className="mt-2 block font-display text-[2rem] leading-none">{TITLES[interest.id]}</span>
                    <span className="mt-3 block max-w-[36ch] text-sm leading-relaxed text-ivory/85">{interest.text}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm">Explore this feeling <Arrow /></span>
                  </span>
                </>, () => preview === interest.id && setPreview(null))}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
