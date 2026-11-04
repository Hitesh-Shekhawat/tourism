"use client";

import { useState } from "react";
import { atlasHref } from "@/lib/atlas-href";
import { goTo, scrollToAtlas, useExplorer } from "@/components/explorer/store";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow } from "@/components/ui/bits";
import { interests, places, type Interest } from "@/content/explorer";

/** Sizes per tile, matching the grid in sections.css (.exp-1 tall feature … .exp-5 landscape). */
const SIZES = ["(min-width: 1024px) 40vw, 100vw", "(min-width: 1024px) 56vw, 50vw", "(min-width: 1024px) 56vw, 50vw", "(min-width: 1024px) 56vw, 50vw", "(min-width: 1024px) 40vw, 100vw"];

/**
 * 03 · Explore by experience. An asymmetric editorial grid (one tall feature, two stacked, two
 * landscapes). Hover or focus reveals the image through a clip-path, scales it to 1.03 and lifts the
 * caption 8px; on touch the first tap previews and the second follows the link. Each tile is a real
 * link to the atlas filtered by that interest (the existing filtered listing).
 */
export function LookingFor({ n }: { n: string }) {
  const [preview, setPreview] = useState<Interest | null>(null);

  const open = (e: React.MouseEvent<HTMLAnchorElement>, id: Interest) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !document.getElementById("explore")) return;
    // touch: first tap previews, second tap follows
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

  return (
    <section id="experiences" aria-labelledby="look-title" className="sec bg-sandstone">
      <div className="wrap">
        <SectionHeading n={n} label="Explore by experience" id="look-title" title="What are you looking for?" note="Begin with a feeling rather than a place. Each one opens the atlas with the places that match." />

        <ul className="exp-grid mt-10 lg:mt-12">
          {interests.map((i, idx) => {
            const count = places.filter((p) => p.interests.includes(i.id)).length;
            return (
              <li key={i.id} className={`exp-tile exp-${idx + 1}`} data-preview={preview === i.id ? "" : undefined}>
                <a href={atlasHref("rajasthan", undefined, i.id)} className="exp-link" onClick={(e) => open(e, i.id)} onBlur={() => preview === i.id && setPreview(null)}>
                  <span className="exp-media">
                    <Photo k={i.image} fill sizes={SIZES[idx]} decorative compact />
                    <span className="exp-shade" aria-hidden="true" />
                  </span>
                  <span className="exp-caption on-dark">
                    <span className="t-label block text-ivory/80">
                      {count} {count === 1 ? "place" : "places"}
                    </span>
                    <span className="mt-2 block font-display text-[clamp(1.375rem,1.8vw,1.75rem)] leading-none">{i.label}</span>
                    <span className="exp-text t-small mt-2 block max-w-[34ch] text-ivory/90">{i.text}</span>
                    <span className="mt-3 inline-flex items-center gap-2 text-[0.75rem] font-semibold tracking-[0.12em] uppercase">
                      See on the map <Arrow />
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
