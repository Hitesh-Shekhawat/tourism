import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { SetEnquiryContext } from "@/components/enquiry/EnquiryProvider";
import { PageHero } from "@/components/page/PageParts";
import { RouteMap } from "@/components/page/RouteMap";
import { TourRow } from "@/components/tours/TourRow";
import { Check, Copy, OwnerBlock, SectionHead } from "@/components/ui/bits";
import { JsonLd } from "@/components/ui/JsonLd";
import { getDestination } from "@/content/destinations";
import { experiences, getExperience } from "@/content/experiences";
import { toursThrough } from "@/content/tours";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => experiences.map((e) => ({ slug: e.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = getExperience((await params).slug);
  if (!e) return {};
  return pageMeta({ ...e.seo, path: `/experiences/${e.slug}` });
}

export default async function ExperiencePage({ params }: Props) {
  const e = getExperience((await params).slug);
  if (!e) notFound();
  const dest = e.destinationSlug ? getDestination(e.destinationSlug) : undefined;
  const journeys = dest ? toursThrough(dest.name) : [];

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Experiences", path: "/experiences" }, { name: e.title, path: `/experiences/${e.slug}` }])} />
      <SetEnquiryContext destination={dest?.name} />
      <PageHero image={e.image} title={e.title} label={e.label} crumbs={[{ name: "Experiences", href: "/experiences" }, { name: e.title }]}>
        <p className="measure mt-6 text-[1.125rem] text-ivory/90">{e.summary}</p>
      </PageHero>

      <section className="grain section-y">
        <div className="wrap grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHead n="01" label="The experience" />
            <div className="mt-10 space-y-5 text-ink-muted">
              {e.description.map((p, i) => (
                <p key={i} className={`measure ${i === 0 ? "dropcap text-ink" : ""}`}>
                  <Copy text={p} />
                </p>
              ))}
            </div>
            <div className="mt-12 border-t border-brass/50 pt-8">
              <h2 className="t-label text-ink-muted">What's included</h2>
              {e.included ? (
                <ul className="mt-4 space-y-2">
                  {e.included.map((x) => (
                    <li key={x} className="flex gap-3">
                      <Check className="mt-1.5 text-terracotta" />
                      {x}
                    </li>
                  ))}
                </ul>
              ) : (
                <OwnerBlock className="mt-4">What the guest gets: timings, guide, transport, meals.</OwnerBlock>
              )}
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <h2 className="t-label text-ink-muted">Where it happens</h2>
            <p className="mt-3 font-display text-[1.5rem]">{e.where}</p>
            {dest && (
              <>
                <div className="mt-8 max-w-[320px]">
                  <RouteMap highlight={dest.name} title={`Map of Rajasthan showing ${dest.name}`} />
                </div>
                <Link href={`/destinations/${dest.slug}`} className="link mt-6 inline-block py-2 font-semibold">
                  More about {dest.name}
                </Link>
              </>
            )}
            <div className="mt-10">
              <EnquiryButton prefill={{ destinations: dest ? [dest.slug] : [], tour: "" }}>Add this to my trip</EnquiryButton>
            </div>
          </div>
        </div>
      </section>

      {journeys.length > 0 && (
        <section className="section-y bg-sandstone">
          <div className="wrap">
            <SectionHead n="02" label="Related journeys" />
            <div className="mt-12 space-y-16">
              {journeys.map((t) => (
                <TourRow key={t.slug} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
