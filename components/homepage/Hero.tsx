import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Photo } from "@/components/ui/Photo";
import { ArchOutline, Creeper, Rosette } from "@/components/ui/Ornaments";
import { Arrow } from "@/components/ui/bits";
import { heroV5 } from "@/content/homepage";
import { itineraries } from "@/content/itineraries";
import { HeroVideo } from "./HeroVideo";
import { RajasthanWordmark } from "./RajasthanWordmark";

/** The arch window's itinerary: a real one from content/itineraries.ts, or no window at all. */
const windowItinerary = itineraries.find((i) => i.slug === heroV5.windowItinerary);

/**
 * 01 · Cinematic hero. A full-bleed Amer Fort sunrise is the only priority image (the LCP); on wide
 * screens a jharokha window floats over it on a second parallax layer and opens one real itinerary.
 * Parallax uses the site's [data-parallax] runtime (transform only, off under reduced motion). The
 * heading, copy and CTAs are server-rendered; "Plan Your Trip" opens the existing enquiry drawer.
 */
export function Hero() {
  return (
    <section aria-labelledby="home-title" className="hero hero-v5 on-dark relative isolate overflow-hidden bg-forest text-ivory">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0" data-parallax="5">
          <Photo k="itinJaipurHero" fill priority sizes="100vw" imgClassName="kenburns hero-img" />
        </div>
        <HeroVideo />
        <div className="hero-shade absolute inset-0" />
        <div className="hero-jaali absolute inset-y-0 right-0 hidden w-[42%] lg:block" />
      </div>

      <div className="wrap hero-inner">
        <div className="hero-copy">
          <span aria-hidden="true" className="hero-v5-wordmark">
            <RajasthanWordmark className="hero-wordmark" />
          </span>
          <p className="t-label hero-eyebrow">
            <Rosette className="size-5 text-sand" />
            {heroV5.eyebrow}
          </p>
          <h1 id="home-title" className="hero-title">
            Discover Rajasthan Through Journeys <em>Crafted Around You</em>
          </h1>
          <p className="hero-text">{heroV5.text}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
            <a href="#packages" className="btn btn-primary">
              {heroV5.primary} <Arrow />
            </a>
            <EnquiryButton variant="secondary" arrow={false}>
              {heroV5.secondary}
            </EnquiryButton>
          </div>
        </div>

        {windowItinerary && (
          <Link href={`/destinations/${windowItinerary.slug}/itinerary`} className="hero-window group" aria-label={`Featured itinerary: ${windowItinerary.title}, ${windowItinerary.duration.label}`}>
            <span className="hero-window-frame">
              <span className="hero-window-photo">
                <Photo k={windowItinerary.heroImage} fill sizes="(min-width: 1024px) 26vw, 1px" decorative imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-out)] group-hover:scale-[1.04]" />
              </span>
              <ArchOutline className="hero-window-outline text-sand" />
            </span>
            <span className="hero-window-caption">
              <span className="t-label text-sand">Featured itinerary</span>
              <span className="mt-1.5 block font-display text-[1.375rem] leading-tight">{windowItinerary.title}</span>
              <span className="mt-1 flex items-center gap-2 text-[0.875rem] text-ivory/85">
                {windowItinerary.duration.label} <Arrow />
              </span>
            </span>
          </Link>
        )}
      </div>

      <Creeper className="hero-creeper text-sand/70" width={720} />
      <a href="#discover" className="hero-cue" aria-label="Scroll to find your Rajasthan experience">
        <span className="t-label">Scroll</span>
        <span aria-hidden="true" className="hero-cue-line" />
      </a>
    </section>
  );
}
