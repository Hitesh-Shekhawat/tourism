import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { HomeMotion } from "@/components/homepage/HomeMotion";
import { CityRail } from "@/components/state/CityRail";
import { CitySection } from "@/components/state/CitySection";
import { StateHero } from "@/components/state/StateHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { hasPhoto } from "@/components/ui/Photo";
import { Arrow, SectionHead } from "@/components/ui/bits";
import type { AssetKey } from "@/content/assets";
import { openStates, placesIn } from "@/content/explorer";
import { sightsFor } from "@/content/sights";
import { canShow } from "@/lib/content-flags";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

/** The hero photograph for each open state. */
const heroImage: Record<string, AssetKey> = { rajasthan: "destJaipur" };

export const dynamicParams = false;
export const generateStaticParams = () => openStates.map((s) => ({ state: s.id }));

/** A state's cities, each with the sights that may render here (in production: only those with a real photo). */
function load(id: string) {
  const state = openStates.find((s) => s.id === id);
  if (!state) return null;
  const cities = placesIn(id)
    .map((place) => ({ place, sights: sightsFor(place.id).filter((s) => canShow(hasPhoto(s.image))) }))
    .filter((c) => c.sights.length > 0);
  return { state, cities };
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const data = load((await params).state);
  if (!data) return {};
  const names = data.cities.map((c) => c.place.name);
  return pageMeta({
    title: `${data.state.name}: cities and places to see`,
    description: `${data.state.tagline}. What to see in ${names.slice(0, -1).join(", ")} and ${names.at(-1)}, city by city.`,
    path: `/explore/${data.state.id}`,
  });
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const data = load((await params).state);
  if (!data) notFound();
  const { state, cities } = data;
  const sightCount = cities.reduce((n, c) => n + c.sights.length, 0);

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Explore", path: "/#explore" }, { name: state.name, path: `/explore/${state.id}` }])} />
      <HomeMotion />
      <StateHero
        name={state.name}
        devanagari={state.devanagari}
        tagline={state.tagline}
        image={heroImage[state.id] ?? "destJaipur"}
        sightCount={sightCount}
        cities={cities.map(({ place }) => ({ id: place.id, name: place.name, epithet: place.epithet }))}
      />

      {cities.map(({ place, sights }, i) => (
        <CitySection key={place.id} place={place} sights={sights} n={String(i + 1).padStart(2, "0")} tone={i % 2 ? "sandstone" : "ivory"} />
      ))}

      <section id="state-end" aria-labelledby="state-end-title" className="on-dark sec bg-maroon text-ivory">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHead n={String(cities.length + 1).padStart(2, "0")} label="One journey" dark />
            <h2 id="state-end-title" className="t-h1 mt-5 max-w-[16ch]">
              <span className="mask-line" data-reveal-mask>
                <span>Join the cities into one route.</span>
              </span>
            </h2>
            <p className="measure mt-6 text-ivory/85" data-reveal>
              Tell us which places caught your eye. We&rsquo;ll plan the order, the drives and the stays around your dates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 lg:col-span-5 lg:justify-end">
            <EnquiryButton>Plan Your Trip</EnquiryButton>
            <Link href="/journeys" className="btn btn-secondary">
              Our journeys <Arrow />
            </Link>
            <a href="/#explore" className="link inline-flex items-center gap-2 py-2 text-sm font-semibold text-ivory/90">
              Back to the map <Arrow />
            </a>
          </div>
        </div>
      </section>

      <CityRail cities={cities.map(({ place }) => ({ id: place.id, name: place.name }))} />
    </>
  );
}
