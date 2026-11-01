import { Suspense } from "react";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { PageHead } from "@/components/page/PageParts";
import { TourList, TourListFallback } from "@/components/tours/TourList";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

/** The journeys index: the standalone /journeys page and the "View all journeys" sheet. */
export function JourneysIndex() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Journeys", path: "/journeys" }])} />
      <PageHead title="Journeys to begin from." label="Journeys" crumbs={[{ name: "Journeys" }]}>
        <p className="measure mt-6 text-ink-muted">Every journey is private and can be changed: the pace, the route, the stays. Use these as a starting point.</p>
      </PageHead>
      <section className="grain section-y pt-14!">
        <div className="wrap">
          <Suspense fallback={<TourListFallback />}>
            <TourList />
          </Suspense>
          <div className="mt-24 flex flex-col items-start gap-6 border-t border-brass/50 pt-12 md:flex-row md:items-center md:justify-between">
            <h2 className="t-h2 max-w-[20ch]">Prefer a journey built from scratch?</h2>
            <EnquiryButton>Design your own journey</EnquiryButton>
          </div>
        </div>
      </section>
    </>
  );
}
