import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import type { Prefill } from "@/components/enquiry/EnquiryProvider";
import { Photo } from "@/components/ui/Photo";
import { Rosette } from "@/components/ui/Ornaments";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow, Check } from "@/components/ui/bits";
import type { AssetKey } from "@/content/assets";
import { packagesV5 } from "@/content/homepage";
import { itineraries } from "@/content/itineraries";
import { tours, type TravelStyle } from "@/content/tours";
import { canShow } from "@/lib/content-flags";

/** Journeys the homepage may show: confirmed ones everywhere, sample drafts in development only. */
export const visibleJourneys = () => tours.filter((tour) => tour.featured && canShow(!tour.draft));

/** Editorial category names for the tour styles in content/tours. */
const CATEGORY: Record<TravelStyle, string> = {
  "First visit": "First-time Rajasthan",
  "Heritage & architecture": "Heritage Tour",
  "Desert & outdoors": "Desert Circuit",
  "Slow travel": "Slow Journey",
  Family: "Family Holiday",
};

type Pkg = {
  key: string;
  image: AssetKey;
  title: string;
  duration: string;
  cities: string[];
  text: string;
  highlights: string[];
  tags: string[];
  href: string;
  price: string | null;
  enquire: Prefill;
  draft: boolean;
};

/** Real itineraries first (they are published content), then confirmed journeys. Nothing invented. */
function packages(): Pkg[] {
  const fromItineraries: Pkg[] = itineraries.map((it) => ({
    key: `it-${it.slug}`,
    image: it.heroImage,
    title: it.title,
    duration: it.duration.label,
    cities: [it.name],
    text: it.lede,
    highlights: it.days.map((d, i) => `Day ${i + 1}: ${d.title}`),
    tags: ["City Break", "Heritage Tour"],
    href: `/destinations/${it.slug}/itinerary`,
    price: null,
    enquire: { destinations: [it.slug] },
    draft: false,
  }));
  const fromTours: Pkg[] = visibleJourneys().map((t) => ({
    key: `tour-${t.slug}`,
    image: t.heroImage,
    title: t.title,
    duration: `${t.durationDays} days · ${t.durationNights} nights`,
    cities: t.route,
    text: t.summary,
    highlights: t.itinerary.slice(1, 4).map((d) => d.title),
    tags: t.styles.map((s) => CATEGORY[s]).slice(0, 2),
    href: `/journeys/${t.slug}`,
    price: t.priceFromINR ? `From ₹${new Intl.NumberFormat("en-IN").format(t.priceFromINR)}${t.priceBasis ? ` ${t.priceBasis}` : ""}` : null,
    enquire: { tour: t.title },
    draft: t.draft,
  }));
  return [...fromTours, ...fromItineraries];
}

/**
 * 04 · Rajasthan tour packages. Cards are built only from published data: destination itineraries and
 * confirmed journeys (sample drafts appear in development, labelled, and never in production). No
 * price is shown unless the owner has set one; otherwise the card asks for a custom quote. Every card
 * has View Itinerary (its real page) and Custom Enquiry (the existing drawer, pre-filled).
 */
export function FeaturedTours({ n }: { n: string }) {
  const list = packages();
  return (
    <section id="packages" aria-labelledby="pkg-title" className="sec packages-v5 relative isolate bg-ivory">
      <div className="wrap">
        <SectionHeading n={n} label={packagesV5.label} id="pkg-title" title={packagesV5.title} note={packagesV5.note} titleClass="max-w-[15ch]" />

        <ul className="pkg-grid" aria-label="Rajasthan tour packages">
          {list.map((p, i) => (
            <li key={p.key} data-fx="card">
              <article className="pkg-card group" aria-labelledby={`${p.key}-t`}>
                <Link href={p.href} className="pkg-photo" tabIndex={-1} aria-hidden="true">
                  <Photo k={p.image} fill sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw" decorative imgClassName="pkg-img" />
                  <span className="pkg-tags">
                    {p.draft && <span className="pkg-tag pkg-tag-draft">Sample draft · dev only</span>}
                    {p.tags.map((t) => (
                      <span key={t} className="pkg-tag">{t}</span>
                    ))}
                  </span>
                </Link>
                <div className="pkg-body">
                  <p className="t-label pkg-meta">
                    {p.duration} <span aria-hidden="true">·</span> {p.cities.join(" — ")}
                  </p>
                  <h3 id={`${p.key}-t`} className="pkg-title">
                    <Link href={p.href}>{p.title}</Link>
                  </h3>
                  <p className="pkg-text">{p.text}</p>
                  <ul className="pkg-highlights" aria-label={`Highlights of ${p.title}`}>
                    {p.highlights.slice(0, 3).map((h) => (
                      <li key={h}>
                        <Check className="text-terracotta" /> <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pkg-price">{p.price ?? "Request a Custom Quote"}</p>
                  <div className="pkg-actions">
                    <Link href={p.href} className="btn btn-secondary pkg-btn">
                      View Itinerary
                    </Link>
                    <EnquiryButton prefill={p.enquire} className="pkg-btn">
                      Custom Enquiry
                    </EnquiryButton>
                  </div>
                </div>
              </article>
            </li>
          ))}
          <li data-fx="card">
            <div className="pkg-card pkg-custom">
              <Rosette className="pkg-custom-rosette text-sand" />
              <p className="t-label text-sand">Tailor-made</p>
              <h3 className="pkg-title mt-3">{packagesV5.custom.title}</h3>
              <p className="pkg-text text-ivory/85">{packagesV5.custom.text}</p>
              <div className="on-dark mt-auto pt-8">
                <EnquiryButton variant="secondary">{packagesV5.custom.cta}</EnquiryButton>
              </div>
            </div>
          </li>
        </ul>

        <div className="pkg-end">
          <p>Every route can be reshaped around you: the pace, the stays and the days in between.</p>
          <Link href="/journeys" className="link inline-flex items-center gap-2">
            View all journeys <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
