import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { SetEnquiryContext } from "@/components/enquiry/EnquiryProvider";
import { FaqList } from "@/components/home/FaqFinal";
import { PageHero } from "@/components/page/PageParts";
import { RouteMap } from "@/components/page/RouteMap";
import { DraftNotice, nightsDays, Price, routeLine } from "@/components/tours/TourBits";
import { TourRow } from "@/components/tours/TourRow";
import { ViewItinerary } from "@/components/tours/ViewItinerary";
import { Arch } from "@/components/ui/Arch";
import { Photo } from "@/components/ui/Photo";
import { Check, Fact, SectionHead } from "@/components/ui/bits";
import { JsonLd } from "@/components/ui/JsonLd";
import { business } from "@/content/business";
import { faqs as generalFaqs } from "@/content/home";
import { tours } from "@/content/tours";
import { WhatsAppIcon } from "@/components/layout/icons";
import { whatsappHref } from "@/lib/contact";
import { breadcrumbLd, faqLd, touristTripLd } from "@/lib/seo";

import type { Tour } from "@/content/tours";

/** Shared by the standalone page and the sheet over the story (§7). */
export function JourneyDetail({ t }: { t: Tour }) {
  const related = tours.filter((x) => x.slug !== t.slug && x.route.some((p) => t.route.includes(p))).slice(0, 2);
  const faqs = t.faqs?.length ? t.faqs : generalFaqs.slice(0, 4);

  const overview = [
    { k: "Duration", v: nightsDays(t) },
    { k: "Route", v: routeLine(t) },
    { k: "Best season", v: t.bestSeason },
    { k: "Ideal for", v: t.idealFor.join(", ") },
  ];

  return (
    <>
      <JsonLd data={touristTripLd(t)} />
      <JsonLd data={breadcrumbLd([{ name: "Journeys", path: "/journeys" }, { name: t.title, path: `/journeys/${t.slug}` }])} />
      <JsonLd data={faqLd(faqs)} />
      <SetEnquiryContext tour={t.title} />
      <ViewItinerary tour={t.title} />

      <PageHero image={t.heroImage} title={t.title} label={nightsDays(t)} crumbs={[{ name: "Journeys", href: "/journeys" }, { name: t.title }]} imageStyle={{ viewTransitionName: `journey-${t.slug}` }}>
        <p className="mt-5 font-display text-[1.5rem] text-ivory/95">{routeLine(t)}</p>
      </PageHero>

      {/* Overview strip */}
      <section className="grain border-b border-brass/45">
        <dl className="wrap grid grid-cols-2 gap-x-8 gap-y-6 py-10 lg:grid-cols-4">
          {overview.map((o) => (
            <div key={o.k} className="border-l border-brass/50 pl-5">
              <dt className="t-label text-ink-muted">{o.k}</dt>
              <dd className="tabular mt-2 font-display text-[1.25rem] leading-snug">{o.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grain">
        <div className="wrap grid grid-cols-1 gap-16 py-[var(--section-y)] lg:grid-cols-12 lg:gap-8">
          {/* Main column */}
          <div className="lg:col-span-7">
            <SectionHead n="01" label="Overview" />
            <p className="measure dropcap mt-10 text-[1.125rem]">{t.summary}</p>
            <DraftNotice t={t} className="mt-8" />

            <div className="mt-14 grid grid-cols-2 gap-4">
              {t.gallery.slice(0, 2).map((g, i) => (
                <div key={g} className={i === 1 ? "mt-16" : ""}>
                  {i === 0 ? (
                    <Arch>
                      <Photo k={g} sizes="(min-width: 1024px) 28vw, 45vw" compact />
                    </Arch>
                  ) : (
                    <div className="overflow-hidden" data-reveal-mask>
                      <Photo k={g} sizes="(min-width: 1024px) 28vw, 45vw" compact />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Day by day */}
            <div className="mt-24">
              <SectionHead n="02" label="Day by day" />
              <h2 className="t-h2 mt-8">The itinerary</h2>
              <div className="mt-10 border-t border-brass/50">
                {t.itinerary.map((d) => (
                  <details key={d.day} className="acc border-b border-brass/50" open={d.day === 1}>
                    <summary className="grid min-h-14 grid-cols-[4.5rem_1fr_auto] items-baseline gap-4 py-5">
                      <span className="t-label tabular text-terracotta">Day {d.day}</span>
                      <span className="font-display text-[1.375rem] leading-snug">{d.title}</span>
                      <svg className="acc-icon self-center" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    </summary>
                    <div className="grid grid-cols-[4.5rem_1fr] gap-4 pb-6">
                      <span />
                      <div>
                        <p className="measure text-ink-muted">{d.description}</p>
                        {d.overnight && <p className="t-small mt-3 text-ink-muted">Overnight: <span className="text-ink">{d.overnight}</span></p>}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Inclusions / exclusions */}
            <div className="mt-24">
              <SectionHead n="03" label="What's included" />
              <div className="mt-10 grid gap-10 sm:grid-cols-2">
                <div>
                  <h3 className="t-h3">Included</h3>
                  <ul className="mt-5 space-y-3 border-t border-brass/50 pt-5">
                    {t.inclusions.map((x) => (
                      <li key={x} className="flex gap-3">
                        <Check className="mt-1.5 text-terracotta" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="t-h3">Not included</h3>
                  <ul className="mt-5 space-y-3 border-t border-brass/50 pt-5">
                    {t.exclusions.map((x) => (
                      <li key={x} className="flex gap-3 text-ink-muted">
                        <span aria-hidden="true" className="mt-[0.7rem] h-px w-3.5 shrink-0 bg-ink-muted" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {t.hotelCategory && (
                <p className="mt-10 border-t border-brass/50 pt-6">
                  <span className="t-label text-ink-muted">Hotels</span>
                  <span className="mt-2 block font-display text-[1.375rem]">{t.hotelCategory}</span>
                </p>
              )}
            </div>

            {/* Route map */}
            <div className="mt-24">
              <SectionHead n="04" label="The route" />
              <div className="mt-10 max-w-[480px]">
                <RouteMap route={t.route} title={`Map of the route: ${routeLine(t)}`} />
              </div>
            </div>

            {/* FAQs */}
            <div className="mt-24">
              <SectionHead n="05" label="Questions" />
              <div className="mt-10">
                <FaqList items={faqs} />
              </div>
            </div>
          </div>

          {/* Sticky enquiry card (desktop). On mobile the bottom bar opens the drawer pre-filled with this tour. */}
          <aside className="lg:col-span-4 lg:col-start-9" aria-label="Enquire about this journey">
            <div className="border border-brass/60 bg-ivory p-7 lg:sticky lg:top-[calc(var(--header-h)+28px)] lg:p-9">
              <p className="t-label tabular text-ink-muted">{nightsDays(t)}</p>
              <p className="t-h3 mt-2">{t.title}</p>
              <div className="mt-6 border-t border-brass/50 pt-6">
                <Price t={t} />
                <p className="t-small mt-3 text-ink-muted">Private journey. Dates, hotels and pace can all be changed.</p>
              </div>
              <EnquiryButton prefill={{ tour: t.title }} className="mt-7 w-full">
                Enquire About This Journey
              </EnquiryButton>
              <a href={whatsappHref({ tour: t.title })} target="_blank" rel="noopener" className="btn btn-secondary mt-3 w-full" data-missing={business.whatsappNumber.startsWith("{{") ? business.whatsappNumber : undefined}>
                <WhatsAppIcon /> Ask on WhatsApp
              </a>
              <p className="t-small mt-5 text-ink-muted">
                Reply within <Fact v={business.responseTime} />. No payment needed to enquire.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section-y bg-sandstone">
          <div className="wrap">
            <SectionHead n="06" label="Related journeys" />
            <div className="mt-12 space-y-16">
              {related.map((r) => (
                <TourRow key={r.slug} t={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
