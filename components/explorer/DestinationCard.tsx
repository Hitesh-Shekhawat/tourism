"use client";

import { Link } from "next-view-transitions";
import { useEffect, useRef } from "react";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Photo } from "@/components/ui/Photo";
import { Arrow, Deva } from "@/components/ui/bits";
import { Placeholder } from "@/components/ui/Placeholder";
import { placeLinks, type Place } from "@/content/explorer";
import { toursThrough } from "@/content/tours";
import { canShow } from "@/lib/content-flags";
import { goTo } from "./store";

const fmt = ([lon, lat]: [number, number]) => `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`;

/**
 * The place card: photo, where it is, what to see, and where to go next. A full itinerary when one
 * exists, the destination guide when there is one, and an honest "coming soon" otherwise.
 */
export function DestinationCard({ place }: { place: Place }) {
  const links = placeLinks(place);
  // journeys from real data only: sample drafts appear in development, never in production
  const journeys = toursThrough(place.name).filter((t) => canShow(!t.draft));
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => close.current?.focus({ preventScroll: true }), [place.id]);

  return (
    <article className="atlas-card" aria-labelledby={`atlas-card-${place.id}`} onKeyDown={(e) => e.key === "Escape" && goTo(place.state, null)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-dune">
        <Photo k={place.image} fill sizes="(min-width: 1024px) 400px, 100vw" compact decorative />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        <button ref={close} type="button" onClick={() => goTo(place.state, null)} className="atlas-card-close" aria-label={`Close ${place.name}`}>
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        <p className="t-label absolute bottom-3 left-4 text-ivory/95">{links.itinerary ? "Itinerary ready" : links.destination ? "Destination guide" : "Itinerary coming soon"}</p>
      </div>
      <div className="p-5 sm:p-6">
        <h3 id={`atlas-card-${place.id}`} className="flex flex-wrap items-baseline gap-x-3 font-display text-[1.875rem] leading-none">
          {place.name} <Deva className="text-lg text-accent">{place.devanagari}</Deva>
        </h3>
        <p className="mt-2 text-sm text-ink-muted">
          {place.region} · <span className="tabular-nums">{fmt(place.coords)}</span>
        </p>
        <p className="mt-4 text-[0.95rem] leading-relaxed">{place.description}</p>

        <h4 className="t-label mt-6 text-ink-muted">Famous for</h4>
        <ul className="mt-3 divide-y divide-brass/35 border-y border-brass/35">
          {place.attractions.map((a) => (
            <li key={a.name} className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="font-semibold">{a.name}</span>
              <span className="text-right text-sm text-ink-muted">{a.note}</span>
            </li>
          ))}
        </ul>

        {journeys.length > 0 && (
          <>
            <h4 className="t-label mt-6 text-ink-muted">Journeys through {place.name}</h4>
            <ul className="mt-3 space-y-1.5">
              {journeys.map((t) => (
                <li key={t.slug}>
                  <Link href={`/journeys/${t.slug}`} scroll={false} className="link inline-flex items-baseline gap-2 py-1 font-semibold">
                    {t.title} <span className="t-small font-normal text-ink-muted">{t.durationDays} days</span>
                  </Link>
                  {t.draft && <Placeholder what={`a confirmed journey (content/tours/${t.slug}.ts is a sample draft)`} className="mt-1" />}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          {links.itinerary ? (
            <Link href={links.itinerary} className="btn btn-primary">
              Explore {place.name} <Arrow />
            </Link>
          ) : (
            <EnquiryButton prefill={{ destinations: place.destinationSlug ? [place.destinationSlug] : [], tour: "" }}>
              Ask us about {place.name}
            </EnquiryButton>
          )}
          {links.destination && (
            <Link href={links.destination} className="link inline-flex items-center gap-2 py-2 text-sm font-semibold">
              {links.itinerary ? "Destination guide" : `About ${place.name}`} <Arrow />
            </Link>
          )}
        </div>
        {!links.itinerary && <p className="mt-4 text-sm text-ink-muted">A day-by-day {place.name} itinerary is coming soon. We already plan journeys here, so ask and we'll build one around your dates.</p>}
      </div>
    </article>
  );
}
