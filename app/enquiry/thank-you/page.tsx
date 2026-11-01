import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Suspense } from "react";
import { PageHead } from "@/components/page/PageParts";
import { Reference } from "@/components/enquiry/Reference";
import { WhatsAppIcon } from "@/components/layout/icons";
import { Arrow, Fact, TrailDivider } from "@/components/ui/bits";
import { business, isPlaceholder } from "@/content/business";
import { featuredTours } from "@/content/tours";
import { whatsappHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your enquiry has reached us.",
  robots: { index: false, follow: false },
};

/** Conversion page (§6): reference ID, next steps, WhatsApp, suggested reading. */
export default function ThankYouPage() {
  return (
    <>
      <PageHead title="Thank you. Your enquiry has reached us." label="Enquiry sent" crumbs={[{ name: "Thank you" }]}>
        <Suspense fallback={null}>
          <Reference />
        </Suspense>
      </PageHead>
      <section className="grain section-y pt-16!">
        <div className="wrap grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <h2 className="t-h2">What happens next</h2>
            <ol className="mt-8 border-t border-brass/50">
              {[
                <>We read your enquiry and reply within <Fact v={business.responseTime} />.</>,
                <>You receive a draft itinerary: the route, the pace and where you'd stay.</>,
                <>We refine it together until it feels right. No payment is needed to enquire.</>,
              ].map((x, i) => (
                <li key={i} className="grid grid-cols-[3rem_1fr] border-b border-brass/50 py-6">
                  <span className="serif-italic text-xl text-brass-text" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-ink-muted">
              In a hurry? Message us on WhatsApp and quote your reference.
            </p>
            <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-primary mt-5" data-missing={isPlaceholder(business.whatsappNumber) ? business.whatsappNumber : undefined}>
              <WhatsAppIcon /> WhatsApp us
            </a>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <TrailDivider />
            <h2 className="t-label mt-6 text-ink-muted">While you wait</h2>
            <ul className="mt-4 border-t border-brass/50">
              {featuredTours().map((t) => (
                <li key={t.slug} className="border-b border-brass/50">
                  <Link href={`/journeys/${t.slug}`} className="flex items-center justify-between gap-4 py-5 font-display text-[1.375rem]">
                    {t.title} <Arrow />
                  </Link>
                </li>
              ))}
              <li className="border-b border-brass/50">
                <Link href="/destinations" className="flex items-center justify-between gap-4 py-5 font-display text-[1.375rem]">
                  The six cities <Arrow />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
