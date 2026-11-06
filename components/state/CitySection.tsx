import { Link } from "next-view-transitions";
import { AtlasAnchor } from "@/components/explorer/AtlasAnchor";
import { HorizontalTrack } from "@/components/ui/HorizontalTrack";
import { Photo } from "@/components/ui/Photo";
import { Arrow, Deva, SectionHead } from "@/components/ui/bits";
import { placeLinks, type Place } from "@/content/explorer";
import type { Sight } from "@/content/sights";
import { CityReveal } from "./CityReveal";

/**
 * One city on the state page: its name and story, then its sights in a GSAP horizontal track
 * (pinned and scroll-driven at every width with motion allowed; a native swipe / scroll-snap row with
 * reduced motion). The track ends on a card that leads on to the city's guide or itinerary.
 */
export function CitySection({ place: p, sights, n, tone }: { place: Place; sights: Sight[]; n: string; tone: "ivory" | "sandstone" }) {
  const { itinerary, destination } = placeLinks(p);
  const titleId = `city-${p.id}-title`;

  return (
    <section id={`city-${p.id}`} data-city={p.id} aria-labelledby={titleId} className={`sec city-sec ${tone === "ivory" ? "bg-ivory" : "bg-sandstone"}`}>
      <CityReveal>
        <HorizontalTrack
          label={`Places to see in ${p.name}`}
          head={
            <div className="relative grid gap-4 lg:grid-cols-12 lg:items-end">
              <span aria-hidden="true" className="city-num">
                {n}
              </span>
              <div className="relative lg:col-span-7">
                <SectionHead n={n} label={`${p.epithet} · ${p.region.split(",")[0]}`} />
                <h2 id={titleId} className="t-h1 mt-4 flex flex-wrap items-baseline gap-x-4">
                  <span className="mask-line" data-reveal-mask>
                    <span>{p.name}</span>
                  </span>
                  <Deva className="text-[clamp(1.125rem,2vw,1.625rem)] text-accent">{p.devanagari}</Deva>
                </h2>
                <p className="t-small mt-3 max-w-[46ch] text-ink-muted lg:hidden">{p.summary}</p>
              </div>
              <p className="measure relative hidden text-ink-muted lg:col-span-4 lg:col-start-9 lg:block" data-reveal>
                {p.description}
              </p>
            </div>
          }
        >
          {sights.map((s, i) => (
            <li key={s.name} className={`dest-card sight-card ${i === 0 ? "dest-card-wide" : ""}`}>
              <article className="dest-link" aria-labelledby={`${p.id}-sight-${i}`}>
                <span className="dest-frame">
                  <span className="dest-img">
                    <Photo k={s.image} fill sizes={i === 0 ? "(min-width: 1024px) 40vw, 84vw" : "(min-width: 1024px) 24vw, 72vw"} compact phPos="top" />
                  </span>
                  <span className="sight-no" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                <div className="mt-4">
                  <span className="t-label block truncate text-ink-muted">{s.kind}</span>
                  <h3 id={`${p.id}-sight-${i}`} className="dest-name mt-2 font-display text-[clamp(1.375rem,1.7vw,1.75rem)] leading-tight">
                    {s.name}
                  </h3>
                  <span className="t-small mt-2 block max-w-[40ch] text-ink-muted">{s.text}</span>
                </div>
              </article>
            </li>
          ))}
          <li className="jr-end sight-end">
            <p className="t-label text-ink-muted">
              {sights.length} {sights.length === 1 ? "place" : "places"} in and around {p.name}
            </p>
            <p className="mt-4 font-display text-[1.75rem] leading-tight">Stay a few days, at your own pace.</p>
            <div className="mt-6 flex flex-col items-start gap-3">
              {(itinerary ?? destination) && (
                <Link href={(itinerary ?? destination)!} className="btn btn-secondary">
                  {itinerary ? `${p.name} itinerary` : `${p.name} guide`} <Arrow />
                </Link>
              )}
              <AtlasAnchor state={p.state} place={p.id} className="link inline-flex items-center gap-2 py-1 text-sm font-semibold">
                See {p.name} on the map <Arrow />
              </AtlasAnchor>
            </div>
          </li>
        </HorizontalTrack>
      </CityReveal>
    </section>
  );
}
