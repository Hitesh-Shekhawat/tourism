import { Link } from "next-view-transitions";
import type { ReactNode } from "react";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow } from "@/components/ui/bits";
import { getPlace, placeLinks, type Place } from "@/content/explorer";
import { royalCities } from "@/content/homepage";
import { MAP_H, MAP_W, outlinePath, project } from "@/lib/rajasthan";

type City = { place: Place; epithet: string; experience: string; href: string | null };

const cities: City[] = royalCities.cities.map((c) => {
  const place = getPlace(c.id)!;
  const { itinerary, destination } = placeLinks(place);
  return { place, epithet: c.epithet, experience: c.experience, href: destination ?? itinerary };
});

/** Marker ↔ card highlight without script: one :has() rule per city. */
const linkCss = cities
  .map(({ place: { id } }) => {
    const on = `.royal-v5:has([data-mk="${id}"]:is(:hover,:focus-visible)) [data-card="${id}"]`;
    return `${on}{--lift:1}${on} .royal-exp{grid-template-rows:1fr;opacity:1}`;
  })
  .join("");

/**
 * 03 · Destination discovery. An asymmetric editorial grid of eight cities (photo, identity line,
 * summary, one experience, CTA) beside a small SVG locator map of Rajasthan whose markers jump to and
 * light up their card. Cities with a destination page link to it; the others (Ranthambore, Mount Abu)
 * open the enquiry drawer pre-filled, so no card leads nowhere. Server-rendered; no WebGL.
 */
export function RoyalCities({ n }: { n: string }) {
  return (
    <section id="destinations" aria-labelledby="royal-title" className="sec royal-v5 relative isolate bg-sandstone">
      <style>{linkCss}</style>
      <div className="wrap">
        <div className="royal-head">
          <SectionHeading n={n} label={royalCities.label} id="royal-title" title={royalCities.title} note={royalCities.note} className="flex-1" titleClass="max-w-[15ch]" />
          <LocatorMap />
        </div>

        <ul className="royal-grid" aria-label="Destinations in Rajasthan">
          {cities.map((c, i) => (
            <li key={c.place.id} id={`dest-${c.place.id}`} data-card={c.place.id} className={`royal-cell royal-cell-${i + 1}`} data-fx="card">
              <CityCard city={c} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CityCard({ city: { place, epithet, experience, href }, index }: { city: City; index: number }) {
  const big = index < 2;
  const body = (cta: ReactNode) => (
    <>
      <span className="royal-photo">
        <Photo k={place.image} fill sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"} imgClassName="royal-img" />
        <span className="royal-shade" aria-hidden="true" />
      </span>
      <span className="royal-copy">
        <span className="royal-epithet t-label">{epithet}</span>
        <h3 className="royal-name">
          {place.name} <span lang="hi" aria-hidden="true" className="royal-deva">{place.devanagari}</span>
        </h3>
        <span className="royal-summary">{place.summary}</span>
        <span className="royal-exp">
          <span>
            <span className="t-label">Experience</span> {experience}
          </span>
        </span>
        {cta}
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="royal-card group">
        {body(
          <span className="royal-cta">
            Explore destination <Arrow />
          </span>,
        )}
      </Link>
    );
  }
  return (
    <div className="royal-card group">
      {body(
        <EnquiryButton variant="text" prefill={{ destinations: [place.id] }} className="royal-cta royal-cta-btn">
          Plan a visit to {place.name}
        </EnquiryButton>,
      )}
    </div>
  );
}

/** Rajasthan's outline with one marker per city; each marker is a link to its card below. */
function LocatorMap() {
  return (
    <figure className="royal-map" aria-label="Map of Rajasthan with the eight destinations">
      <svg viewBox={`-20 -20 ${MAP_W + 40} ${MAP_H + 40}`} className="royal-map-svg">
        <defs>
          <pattern id="royal-jaali" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M9 0 L18 9 L9 18 L0 9 Z" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
          </pattern>
        </defs>
        <path d={outlinePath} className="royal-map-land" />
        <path d={outlinePath} fill="url(#royal-jaali)" className="text-sand" />
        <path d={outlinePath} className="royal-map-edge" pathLength={1} />
        {cities.map(({ place }) => {
          const [x, y] = project(place.coords);
          const left = ["jaisalmer", "mount-abu", "jodhpur", "ranthambore"].includes(place.id);
          return (
            <a key={place.id} href={`#dest-${place.id}`} data-mk={place.id} className="royal-mk" aria-label={`${place.name}: jump to its card`}>
              <circle cx={x} cy={y} r="22" className="royal-mk-hit" />
              <circle cx={x} cy={y} r="9" className="royal-mk-ring" />
              <circle cx={x} cy={y} r="4.5" className="royal-mk-dot" />
              <text x={left ? x - 14 : x + 14} y={y + 6} textAnchor={left ? "end" : "start"} className="royal-mk-label">
                {place.name}
              </text>
            </a>
          );
        })}
      </svg>
      <figcaption className="t-small text-ink-muted">Tap a marker to jump to the city.</figcaption>
    </figure>
  );
}
