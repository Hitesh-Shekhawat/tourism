import type { Metadata } from "next";
import { InlineEnquiry } from "@/components/enquiry/InlineEnquiry";
import { ContactLinks } from "@/components/home/FaqFinal";
import { MapFacade } from "@/components/page/MapFacade";
import { PageHead } from "@/components/page/PageParts";
import { Fact, SectionHead } from "@/components/ui/bits";
import { JsonLd } from "@/components/ui/JsonLd";
import { business } from "@/content/business";
import { breadcrumbLd, pageMeta, travelAgencyLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contact us",
  description: "Plan a private journey through Rajasthan. Send an enquiry, WhatsApp or call; we reply with a draft itinerary.",
  path: "/contact",
});

export default function ContactPage() {
  const a = business.address;
  return (
    <>
      <JsonLd data={travelAgencyLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Contact", path: "/contact" }])} />
      <PageHead title="Your Rajasthan story starts here." label="Contact" crumbs={[{ name: "Contact" }]}>
        <p className="measure mt-6 text-ink-muted">
          We'll reply within <Fact v={business.responseTime} /> with a draft itinerary. No payment needed to enquire.
        </p>
      </PageHead>

      <section className="grain section-y pt-16!">
        <div className="wrap grid gap-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHead n="01" label="Send an enquiry" />
            <div className="mt-10">
              <InlineEnquiry />
            </div>
          </div>
          <div className="space-y-12 lg:col-span-4 lg:col-start-9">
            <div>
              <SectionHead n="02" label="Talk to us" />
              <div className="mt-8">
                <ContactLinks />
              </div>
            </div>
            <div className="border-t border-brass/50 pt-8">
              <h2 className="t-label text-ink-muted">Office hours</h2>
              <p className="mt-3">
                <Fact v={business.officeHours} />
              </p>
            </div>
            <div className="border-t border-brass/50 pt-8">
              <h2 className="t-label text-ink-muted">Office</h2>
              <address className="mt-3 not-italic">
                <Fact v={a.street} />
                <br />
                <Fact v={a.city} />, {a.region} <Fact v={a.postalCode} />
              </address>
              <div className="mt-6">
                <MapFacade />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
