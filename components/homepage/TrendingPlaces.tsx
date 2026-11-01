import { Link } from "next-view-transitions";
import { ExploreLink } from "@/components/explorer/ExploreLink";
import { Photo } from "@/components/ui/Photo";
import { Arrow, Deva } from "@/components/ui/bits";
import { placeLinks, trending, type Place } from "@/content/explorer";
import { hero } from "@/content/home";

function Card({ p, i }: { p: Place; i: number }) {
  const { itinerary } = placeLinks(p);
  const inner = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-dune">
        <Photo k={p.image} fill sizes="(min-width: 1280px) 22vw, (min-width: 768px) 32vw, 72vw" priority={i < 2} decorative compact imgClassName="trend-img" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <span className={`trend-badge ${itinerary ? "is-ready" : ""}`}>{itinerary ? "Itinerary" : "Coming soon"}</span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="flex items-baseline gap-3 text-ivory">
            <span className="font-display text-[1.875rem] leading-none">{p.name}</span>
            <Deva className="text-base text-dune">{p.devanagari}</Deva>
          </p>
          <p className="mt-2 text-sm leading-snug text-ivory/85">{p.summary}</p>
        </div>
      </div>
      <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ivory/90">
        {itinerary ? "View itinerary" : "Preview on the map"} <Arrow />
      </span>
    </>
  );
  return (
    <li className="trend-card">
      {itinerary ? (
        <Link href={itinerary} className="group block" aria-label={`${p.name}: view the itinerary`}>
          {inner}
        </Link>
      ) : (
        <ExploreLink state={p.state} place={p.id} className="group block" label={`${p.name}: preview on the map`}>
          {inner}
        </ExploreLink>
      )}
    </li>
  );
}

/**
 * Home · 01 · the opening: the brand line and the places travellers ask about most, as cards.
 * Cities with an itinerary open it; the rest open their card in the atlas below.
 */
export function TrendingPlaces() {
  return (
    <section aria-labelledby="home-title" className="trend on-dark relative isolate overflow-hidden bg-ink text-ivory">
      <div aria-hidden="true" className="trend-glow absolute inset-0 -z-10" />
      <div className="wrap pt-[calc(var(--header-h)+clamp(32px,6vh,72px))]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="t-label text-ivory/85">{hero.label}</p>
            <h1 id="home-title" className="hero-title t-display mt-5">
              {hero.headline.map((line, i) => (
                <span key={line} className="rise-line">
                  <span style={{ ["--i" as string]: i }}>{line}</span>
                </span>
              ))}
            </h1>
          </div>
          <div className="home-fade lg:col-span-4 lg:col-start-9" style={{ animationDelay: "420ms" }}>
            <p className="max-w-[40ch] text-[1.0625rem] text-ivory/90">{hero.support}</p>
            <ExploreLink state={null} className="link mt-5 inline-flex items-center gap-2 py-2 font-semibold">
              Open the atlas <Arrow className="rotate-90" />
            </ExploreLink>
          </div>
        </div>

        <div className="mt-12 flex items-baseline justify-between gap-6 border-t border-ivory/20 pt-6 lg:mt-16">
          <h2 className="t-label text-dune">Trending this season</h2>
          <p className="hidden text-sm text-ivory/70 sm:block">Swipe or scroll for more</p>
        </div>
      </div>
      <ul className="trend-row" aria-label="Trending places">
        {trending.map((p, i) => (
          <Card key={p.id} p={p} i={i} />
        ))}
      </ul>
    </section>
  );
}
