import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { SetEnquiryContext } from "@/components/enquiry/EnquiryProvider";
import { PageHero } from "@/components/page/PageParts";
import { RouteMap } from "@/components/page/RouteMap";
import { TourRow } from "@/components/tours/TourRow";
import { Arch } from "@/components/ui/Arch";
import { Photo } from "@/components/ui/Photo";
import { Arrow, Copy, Deva, SectionHead, TrailDivider } from "@/components/ui/bits";
import { JsonLd } from "@/components/ui/JsonLd";
import { getExperience } from "@/content/experiences";
import { toursThrough } from "@/content/tours";
import { breadcrumbLd, touristDestinationLd } from "@/lib/seo";

import type { Destination } from "@/content/destinations";

/** Shared by the standalone page and the sheet over the story (§7). */
export function DestinationDetail({ d }: { d: Destination }) {
  const exps = d.experienceSlugs.map(getExperience).filter((e) => !!e);
  const journeys = toursThrough(d.name);

  return (
    <>
      <JsonLd data={touristDestinationLd(d)} />
      <JsonLd data={breadcrumbLd([{ name: "Destinations", path: "/destinations" }, { name: d.name, path: `/destinations/${d.slug}` }])} />
      <SetEnquiryContext destination={d.name} />

      <PageHero image={d.heroImage} title={d.name} deva={d.devanagari} label="Destination" crumbs={[{ name: "Destinations", href: "/destinations" }, { name: d.name }]}>
        <p className="measure mt-6 max-w-[48ch] text-[1.125rem] text-ivory/90">{d.descriptor}.</p>
      </PageHero>

      <section className="grain section-y">
        <div className="wrap grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHead n="01" label={`About ${d.name}`} />
            <div className="mt-10 space-y-5 text-ink-muted">
              {d.intro.map((p, i) => (
                <p key={i} className={`measure ${i === 0 ? "dropcap text-ink" : ""}`}>
                  <Copy text={p} />
                </p>
              ))}
            </div>
            <div className="mt-12 border-t border-brass/50 pt-8">
              <p className="t-label text-ink-muted">Best time to visit</p>
              <p className="measure mt-3 font-display text-[1.375rem] leading-snug">{d.bestTime}</p>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Arch className="mx-auto max-w-[420px]">
              <Photo k={d.indexImage} sizes="(min-width: 1024px) 30vw, 90vw" />
            </Arch>
          </div>
        </div>
      </section>

      <section className="section-y bg-sandstone">
        <div className="wrap grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <SectionHead n="02" label="Top experiences" />
            <h2 className="t-h2 mt-8 max-w-[14ch]">How we'd spend the days.</h2>
            <div className="mt-12 max-w-[360px]">
              <RouteMap highlight={d.name} title={`Map of Rajasthan showing ${d.name}`} />
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <dl className="border-t border-brass/50">
              {d.highlights.map((h) => (
                <div key={h.title} className="grid gap-2 border-b border-brass/50 py-7 sm:grid-cols-[14rem_1fr] sm:gap-8">
                  <dt className="font-display text-[1.375rem] leading-snug font-semibold">{h.title}</dt>
                  <dd className="text-ink-muted">
                    <Copy text={h.text} />
                  </dd>
                </div>
              ))}
            </dl>
            {exps.length > 0 && (
              <ul className="mt-12 space-y-3">
                {exps.map((e) => (
                  <li key={e.slug}>
                    <Link href={`/experiences/${e.slug}`} className="link inline-flex items-center gap-3 py-1.5 font-semibold">
                      {e.title} <Arrow />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {journeys.length > 0 && (
        <section className="grain section-y">
          <div className="wrap">
            <SectionHead n="03" label="Suggested journeys" />
            <h2 className="t-h2 mt-8">Journeys through {d.name}</h2>
            <div className="mt-14 space-y-16">
              {journeys.map((t) => (
                <TourRow key={t.slug} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="on-dark bg-maroon text-ivory">
        <div className="wrap section-y text-center">
          <TrailDivider className="mx-auto" />
          <h2 className="t-h1 mx-auto mt-8 max-w-[16ch]">
            Plan your days in {d.name} <Deva className="text-[0.5em] text-ivory/80">{d.devanagari}</Deva>
          </h2>
          <div className="mt-10 flex justify-center">
            <EnquiryButton prefill={{ destinations: [d.slug], tour: "" }} className="bg-ivory! text-maroon! hover:bg-sandstone!">
              Plan My Trip
            </EnquiryButton>
          </div>
        </div>
      </section>
    </>
  );
}
