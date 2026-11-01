import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { SetEnquiryContext } from "@/components/enquiry/EnquiryProvider";
import { PageHero } from "@/components/page/PageParts";
import { Photo } from "@/components/ui/Photo";
import { Arrow, Deva, SectionHead, TrailDivider } from "@/components/ui/bits";
import { JsonLd } from "@/components/ui/JsonLd";
import type { Itinerary } from "@/content/itineraries";
import { breadcrumbLd, itineraryLd } from "@/lib/seo";

/**
 * A destination itinerary (/destinations/<slug>/itinerary): hero, the plan at a glance, the days hour by
 * hour, the sights, local culture, a gallery, practical notes and the enquiry. Everything comes from
 * content/itineraries.ts, so a new city needs data, not code.
 */
export function ItineraryPage({ it }: { it: Itinerary }) {
  const base = `/destinations/${it.slug}`;
  return (
    <>
      <JsonLd data={itineraryLd(it)} />
      <JsonLd data={breadcrumbLd([{ name: "Destinations", path: "/destinations" }, { name: it.name, path: base }, { name: "Itinerary", path: `${base}/itinerary` }])} />
      <SetEnquiryContext destination={it.name} />

      <PageHero image={it.heroImage} title={it.name} deva={it.devanagari} label={`Itinerary · ${it.duration.label}`} crumbs={[{ name: "Destinations", href: "/destinations" }, { name: it.name, href: base }, { name: "Itinerary" }]}>
        <p className="measure mt-6 max-w-[52ch] text-[1.125rem] text-ivory/90">{it.lede}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <EnquiryButton prefill={{ destinations: [it.slug], tour: "" }} className="bg-ivory! text-maroon! hover:bg-sandstone!">
            Plan this trip
          </EnquiryButton>
          <a href="#day-1" className="link inline-flex items-center gap-2 py-2 font-semibold">
            See day one <Arrow className="rotate-90" />
          </a>
        </div>
      </PageHero>

      {/* At a glance */}
      <section className="grain section-y">
        <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHead n="01" label={it.title} />
            <div className="mt-10 space-y-5 text-ink-muted">
              {it.intro.map((p, i) => (
                <p key={i} className={`measure ${i === 0 ? "dropcap text-ink" : ""}`}>
                  {p}
                </p>
              ))}
            </div>
          </div>
          <aside className="lg:col-span-5 lg:col-start-8" aria-label="At a glance">
            <div className="border border-brass/60 bg-ivory p-6 sm:p-8">
              <p className="t-label text-ink-muted">At a glance</p>
              <p className="mt-4 font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-none">{it.duration.label}</p>
              <dl className="mt-6 divide-y divide-brass/40 border-y border-brass/40">
                {it.facts.map((f) => (
                  <div key={f.label} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                    <dt className="text-sm text-ink-muted">{f.label}</dt>
                    <dd className="font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm text-ink-muted">{it.duration.note}</p>
              <ol className="mt-6 space-y-2">
                {it.days.map((d, i) => (
                  <li key={d.title}>
                    <a href={`#day-${i + 1}`} className="link inline-flex items-baseline gap-3 py-1">
                      <span className="t-label text-brass-text">Day {i + 1}</span>
                      <span className="font-semibold">{d.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      {/* Day by day */}
      <section className="section-y bg-sandstone" aria-labelledby="days-title">
        <div className="wrap">
          <SectionHead n="02" label="Day by day" />
          <h2 id="days-title" className="t-h1 mt-8 max-w-[18ch]">
            How the days run.
          </h2>
          <div className="mt-14 space-y-20 lg:mt-20">
            {it.days.map((d, i) => (
              <article key={d.title} id={`day-${i + 1}`} className="grid scroll-mt-28 gap-8 lg:grid-cols-12 lg:gap-8" aria-labelledby={`day-${i + 1}-title`}>
                <header className="lg:col-span-4">
                  <div className="lg:sticky lg:top-28">
                    <p className="font-display text-[clamp(4rem,9vw,7rem)] leading-[0.85] text-terracotta">{String(i + 1).padStart(2, "0")}</p>
                    <p className="t-label mt-4 text-ink-muted">Day {i + 1}</p>
                    <h3 id={`day-${i + 1}-title`} className="t-h2 mt-2">
                      {d.title}
                    </h3>
                    <p className="measure mt-4 text-ink-muted">{d.summary}</p>
                  </div>
                </header>
                <ol className="relative border-l border-brass/60 lg:col-span-7 lg:col-start-6">
                  {d.stops.map((s) => (
                    <li key={s.title} className="relative pb-10 pl-8 last:pb-0">
                      <span aria-hidden="true" className="absolute top-2 -left-[5px] h-[9px] w-[9px] rounded-full bg-terracotta ring-4 ring-sandstone" />
                      <p className="t-label tabular-nums text-brass-text">{s.time}</p>
                      <h4 className="mt-1 font-display text-[1.5rem] leading-snug">{s.title}</h4>
                      <p className="measure mt-2 text-ink-muted">{s.text}</p>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sights */}
      <section className="grain section-y" aria-labelledby="sights-title">
        <div className="wrap">
          <SectionHead n="03" label="What you'll see" />
          <h2 id="sights-title" className="t-h1 mt-8 max-w-[16ch]">
            The places that make {it.name}.
          </h2>
          <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {it.sights.map((s) => (
              <li key={s.name}>
                {s.image ? (
                  <div className="relative aspect-[4/5] overflow-hidden bg-dune">
                    <Photo k={s.image} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw" decorative compact />
                  </div>
                ) : (
                  <div className="grid aspect-[4/5] place-items-center border border-brass/60 bg-sandstone p-6 text-center">
                    <span className="font-display text-[2rem] leading-tight text-terracotta-deep">{s.name}</span>
                  </div>
                )}
                <h3 className="mt-5 font-display text-[1.5rem] leading-snug">{s.name}</h3>
                <p className="mt-2 text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Culture */}
      <section className="on-dark section-y bg-ink text-ivory" aria-labelledby="culture-title">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <SectionHead n="04" label="Local culture" dark />
            <h2 id="culture-title" className="t-h2 mt-8 max-w-[14ch]">
              Beyond the monuments.
            </h2>
          </div>
          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {it.culture.map((c) => (
              <div key={c.title} className="border-t border-ivory/25 pt-5">
                <dt className="font-display text-[1.375rem]">{c.title}</dt>
                <dd className="mt-2 text-ivory/80">{c.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-y" aria-labelledby="gallery-title">
        <div className="wrap">
          <SectionHead n="05" label="Gallery" />
          <h2 id="gallery-title" className="sr-only">
            {it.name} in pictures
          </h2>
          <ul className="itin-gallery mt-10">
            {it.gallery.map((k) => (
              <li key={k} className="relative overflow-hidden bg-dune">
                <Photo k={k} fill sizes="(min-width: 1024px) 33vw, 50vw" compact imgClassName="transition-transform duration-700 hover:scale-105" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Practical */}
      <section className="section-y bg-sandstone" aria-labelledby="practical-title">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <SectionHead n="06" label="Good to know" />
            <h2 id="practical-title" className="t-h2 mt-8">
              Before you go
            </h2>
          </div>
          <dl className="border-t border-brass/50 lg:col-span-7 lg:col-start-6">
            {it.practical.map((p) => (
              <div key={p.label} className="grid gap-2 border-b border-brass/50 py-6 sm:grid-cols-[11rem_1fr] sm:gap-8">
                <dt className="font-display text-[1.25rem]">{p.label}</dt>
                <dd className="text-ink-muted">{p.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Enquiry */}
      <section className="on-dark bg-maroon text-ivory">
        <div className="wrap section-y text-center">
          <TrailDivider className="mx-auto" />
          <h2 className="t-h1 mx-auto mt-8 max-w-[18ch]">
            Make these days yours <Deva className="text-[0.5em] text-ivory/80">{it.devanagari}</Deva>
          </h2>
          <p className="measure mx-auto mt-6 text-ivory/85">This plan is a starting point. Tell us your dates and pace, and we'll shape the days, the stays and the drives around you.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <EnquiryButton prefill={{ destinations: [it.slug], tour: "" }} className="bg-ivory! text-maroon! hover:bg-sandstone!">
              Plan this trip
            </EnquiryButton>
            <Link href={`/?state=rajasthan&place=${it.slug}#explore`} className="link inline-flex items-center gap-2 py-2 font-semibold">
              Back to the atlas <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
