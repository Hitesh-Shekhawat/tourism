"use client";

import { ExploreLink } from "@/components/explorer/ExploreLink";
import { useExplorer } from "@/components/explorer/store";
import { Arrow, SectionHead } from "@/components/ui/bits";
import { interests, places } from "@/content/explorer";

/**
 * Home · 02 · "What are you looking for?": a few honest ways in. Choosing one carries into the atlas,
 * where the places that match stay bright and the rest step back.
 */
export function LookingFor() {
  const interest = useExplorer((s) => s.interest);
  const matches = interest ? places.filter((p) => p.interests.includes(interest)) : [];

  return (
    <section aria-labelledby="look-title" className="section-y bg-sandstone">
      <div className="wrap">
        <SectionHead n="02" label="Begin with a feeling" />
        <h2 id="look-title" className="t-h1 mt-8 max-w-[16ch]" data-reveal>
          What are you looking for?
        </h2>

        <div className="look-grid mt-12" role="group" aria-label="Interests">
          {interests.map((i) => {
            const n = places.filter((p) => p.interests.includes(i.id)).length;
            return (
              <button key={i.id} type="button" className="look-tile" aria-pressed={interest === i.id} onClick={() => useExplorer.getState().set({ interest: interest === i.id ? null : i.id })}>
                <span className="font-display text-[1.5rem] leading-tight">{i.label}</span>
                <span className="mt-2 text-sm text-ink-muted">{i.text}</span>
                <span className="t-label mt-4 text-brass-text">
                  {n} {n === 1 ? "place" : "places"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4" aria-live="polite">
          {interest ? (
            <>
              <p className="text-ink-muted">
                {matches.map((p) => p.name).join(", ")}
                {matches.length ? " on the map." : ""}
              </p>
              <ExploreLink state="rajasthan" interest={interest} className="btn btn-primary">
                See them on the map <Arrow />
              </ExploreLink>
            </>
          ) : (
            <ExploreLink state={null} className="btn btn-primary">
              Explore the map <Arrow />
            </ExploreLink>
          )}
        </div>
      </div>
    </section>
  );
}
