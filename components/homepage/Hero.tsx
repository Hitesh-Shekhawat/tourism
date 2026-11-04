import { Link } from "next-view-transitions";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/bits";
import { hero } from "@/content/home";
import { itineraries } from "@/content/itineraries";
import { visibleJourneys } from "./FeaturedTours";
import { RajasthanWordmark } from "./RajasthanWordmark";

/** The hero's featured card: one real itinerary from content/itineraries.ts, or nothing at all. */
const featured = itineraries.find((i) => i.slug === "jaipur") ?? itineraries[0];

/**
 * 01 · Cinematic hero (arrive). Full-viewport Hawa Mahal photograph (the LCP image, preloaded) with a
 * slow Ken Burns move and a bottom gradient that keeps ivory copy above 4.5:1. The heading and CTAs are
 * server-rendered and paint without script; nothing else in the hero animates.
 */
export function Hero() {
  // the journeys section only renders with real journeys; otherwise the CTA goes to the journeys page
  const journeysHref = visibleJourneys().length ? "#journeys" : "/journeys";
  return (
    <section aria-labelledby="home-title" className="hero on-dark relative isolate overflow-hidden bg-ink text-ivory">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <Photo k="placeJaipur" fill priority sizes="100vw" decorative imgClassName="kenburns hero-img" />
        <div className="hero-shade absolute inset-0" />
      </div>

      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="t-label text-ivory/85">{hero.label}</p>
          <h1 id="home-title" className="t-display mt-5">
            {/* "Rajasthan," as the SVG Devanagari wordmark; the h1 still reads "Rajasthan, Slowly." */}
            <RajasthanWordmark className="hero-wordmark" />
            {hero.headline.slice(1).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-[38ch] text-[1.0625rem] text-ivory/90">{hero.support}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            <a href={journeysHref} className="btn btn-primary">
              Explore Journeys <Arrow />
            </a>
            <a href="#explore" className="btn btn-secondary">
              Discover Rajasthan
            </a>
          </div>
        </div>

        {featured && (
          <Link href={`/destinations/${featured.slug}/itinerary`} className="hero-card group" aria-label={`Featured itinerary: ${featured.title}, ${featured.duration.label}`}>
            <span className="hero-card-img">
              <Photo k={featured.heroImage} fill sizes="(min-width: 768px) 180px, 96px" decorative compact imgClassName="transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-105" />
            </span>
            <span className="min-w-0 p-4 sm:p-5">
              <span className="t-label block text-ivory/75">Featured itinerary</span>
              <span className="mt-2 block font-display text-[1.1875rem] leading-tight">{featured.title}</span>
              <span className="t-small mt-1 block text-ivory/80">{featured.duration.label}</span>
              <span className="mt-3 inline-flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.12em] uppercase">
                View itinerary <Arrow />
              </span>
            </span>
          </Link>
        )}
      </div>

      <a href="#trending" className="hero-cue" aria-label="Scroll to trending destinations">
        <span className="t-label">Scroll</span>
        <span aria-hidden="true" className="hero-cue-line" />
      </a>
    </section>
  );
}
