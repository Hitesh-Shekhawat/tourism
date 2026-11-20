import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { JourneyReveal } from "@/components/homepage/JourneyReveal";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow, Check } from "@/components/ui/bits";
import { tours } from "@/content/tours";
import { canShow } from "@/lib/content-flags";

/** Journeys the homepage may show: confirmed ones everywhere, sample drafts in development only. */
export const visibleJourneys = () => tours.filter((tour) => tour.featured && canShow(!tour.draft));

/** A considered catalogue of private journeys, using only the published itinerary facts. */
export function FeaturedTours({ n }: { n: string }) {
  const list = visibleJourneys();

  if (!list.length) return null;

  return (
    <section id="journeys" aria-labelledby="ft-title" className="sec journey-section">
      <div className="wrap">
        <SectionHeading
          n={n}
          label="Private journeys"
          id="ft-title"
          title="Not just places. Journeys worth taking slowly."
          note="Thoughtful routes through Rajasthan, with room to linger and a pace that feels like your own."
          dark
        />
        <JourneyReveal>
          {list.map((tour, i) => (
            <li key={tour.slug} data-journey-card>
              <article className={`journey-card ${i % 2 ? "journey-card-reverse" : ""}`}>
                <Link href={`/journeys/${tour.slug}`} scroll={false} className="journey-photo" aria-label={`Explore ${tour.title}`}>
                  <Photo k={tour.heroImage} fill sizes="(min-width: 1024px) 52vw, 100vw" decorative />
                  <span className="journey-photo-shade" aria-hidden="true" />
                  <span className="journey-photo-caption">
                    <span className="t-label">Journey {String(i + 1).padStart(2, "0")}</span>
                    <span className="journey-photo-title font-display">{tour.title}</span>
                  </span>
                </Link>
                <div className="journey-copy">
                  <p className="t-label journey-meta">JOURNEY {String(i + 1).padStart(2, "0")} <span aria-hidden="true">·</span> {tour.durationNights} NIGHTS <span aria-hidden="true">·</span> {tour.durationDays} DAYS</p>
                  <h3 className="journey-title font-display">{tour.title}</h3>
                  <p className="journey-route">{tour.route.join(" — ")}</p>
                  <p className="journey-summary">{tour.summary}</p>
                  <span className="journey-divider" aria-hidden="true" />
                  <ul className="journey-inclusions" aria-label="Included in this journey">
                    {tour.inclusions.slice(0, 3).map((inclusion) => (
                      <li key={inclusion}><Check /> <span>{inclusion}</span></li>
                    ))}
                  </ul>
                  <div className="journey-offer">
                    <span className="font-display text-[1.3rem]">{tour.priceFromINR ? `From ₹${new Intl.NumberFormat("en-IN").format(tour.priceFromINR)}` : "Price on request"}</span>
                    {tour.priceBasis && <span className="journey-price-basis">{tour.priceBasis}</span>}
                  </div>
                  <div className="journey-actions">
                    <Link href={`/journeys/${tour.slug}`} scroll={false} className="journey-link">
                      Explore journey <Arrow />
                    </Link>
                    <EnquiryButton prefill={{ tour: tour.title }} variant="text" className="journey-plan">
                      Plan this journey
                    </EnquiryButton>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </JourneyReveal>
        <div className="journey-end">
          <p>Every route can be reshaped around you.</p>
          <Link href="/journeys" scroll={false} className="link inline-flex items-center gap-2">View all journeys <Arrow /></Link>
        </div>
      </div>
    </section>
  );
}
