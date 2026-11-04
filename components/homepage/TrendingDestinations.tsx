import { Link } from "next-view-transitions";
import type { ReactNode } from "react";
import { AtlasAnchor } from "@/components/explorer/AtlasAnchor";
import { HorizontalTrack } from "@/components/ui/HorizontalTrack";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow } from "@/components/ui/bits";
import { placeLinks, trending, type Place } from "@/content/explorer";

/** A card's destination: the itinerary, else the destination guide, else the place in the atlas. */
function CardLink({ p, className, children }: { p: Place; className: string; children: ReactNode }) {
  const { itinerary, destination } = placeLinks(p);
  const href = itinerary ?? destination;
  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <AtlasAnchor state={p.state} place={p.id} className={className}>
      {children}
    </AtlasAnchor>
  );
}

/**
 * 02 · Trending destinations (discover). A horizontal editorial track: one wide feature card, then
 * portrait cards. Drag with momentum and arrow buttons on desktop, native scroll-snap on touch. The
 * image scales inside its clip on hover and drifts ≤ 8% against its frame as the track scrolls.
 */
export function TrendingDestinations({ n }: { n: string }) {
  return (
    <section id="trending" aria-labelledby="trending-title" className="sec bg-ivory">
      <HorizontalTrack
        label="Trending destinations"
        head={<SectionHeading n={n} label="Trending destinations" id="trending-title" title="Six places to begin." note="The cities most journeys start from, each with its own colour, history and pace." />}
      >
        {trending.map((p, i) => (
          <li key={p.id} className={`dest-card ${i === 0 ? "dest-card-wide" : ""}`}>
            <CardLink p={p} className="dest-link group">
              <span className="dest-frame">
                <span className="dest-img">
                  <Photo k={p.image} fill sizes={i === 0 ? "(min-width: 1024px) 52vw, 86vw" : "(min-width: 1024px) 26vw, 70vw"} decorative compact />
                </span>
              </span>
              <span className="mt-4 block">
                {/* always two fixed lines (epithet, then region) so every name sits on the same baseline */}
                <span className="t-label block truncate text-ink-muted">{p.epithet}</span>
                <span className="t-label mt-1 block truncate text-ink-muted/80">{p.region.split(",")[0]}</span>
                <span className="dest-name mt-2 block font-display text-[clamp(1.5rem,1.9vw,1.875rem)] leading-none">{p.name}</span>
                <span className="t-small mt-3 block max-w-[38ch] text-ink-muted">{p.summary}</span>
                <span className="dest-explore mt-4 inline-flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.12em] text-accent uppercase">
                  Explore <Arrow />
                </span>
              </span>
            </CardLink>
          </li>
        ))}
      </HorizontalTrack>
    </section>
  );
}
