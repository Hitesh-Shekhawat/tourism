import type { Metadata } from "next";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { PageHead } from "@/components/page/PageParts";
import { Arch } from "@/components/ui/Arch";
import { Photo } from "@/components/ui/Photo";
import { Fact, OwnerBlock, SectionHead, TrailDivider } from "@/components/ui/bits";
import { JsonLd } from "@/components/ui/JsonLd";
import { business } from "@/content/business";
import { reasons } from "@/content/home";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Our story",
  description: "Who plans your journey through Rajasthan, how we work, and what you can hold us to.",
  path: "/our-story",
});

export default function OurStoryPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Our Story", path: "/our-story" }])} />
      <PageHead title="The people behind the journeys." label="Our story" crumbs={[{ name: "Our Story" }]} />

      <section className="grain section-y">
        <div className="wrap grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Arch className="max-w-[420px]">
              <Photo k="storyFounder" sizes="(min-width: 1024px) 32vw, 90vw" />
            </Arch>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <SectionHead n="01" label="How it began" />
            <h2 className="t-h2 mt-8">
              <Fact v={business.brandName} />, since <Fact v={business.yearsInOperation} />
            </h2>
            <OwnerBlock className="mt-8">
              The founder's story in 2–4 short paragraphs: who they are, how they came to know Rajasthan, why they started the company. Real names and real photos only (signed release for every person shown).
            </OwnerBlock>
            <TrailDivider className="mt-10" />
          </div>
        </div>
      </section>

      <section className="section-y bg-sandstone">
        <div className="wrap">
          <SectionHead n="02" label="The team" />
          <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <div className="overflow-hidden" data-reveal-mask>
                <Photo k="storyTeam" sizes="(min-width: 1024px) 56vw, 92vw" />
              </div>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <OwnerBlock>Team members (name, role, a line about each), and the guides and drivers guests will meet.</OwnerBlock>
            </div>
          </div>
        </div>
      </section>

      <section className="grain section-y">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <SectionHead n="03" label="What we stand by" />
            <h2 className="t-h2 mt-8 max-w-[12ch]">Values you can check.</h2>
          </div>
          <dl className="grid gap-x-12 sm:grid-cols-2 lg:col-span-8">
            {reasons.map((r) => (
              <div key={r.title} className="border-t border-brass/50 py-7">
                <dt className="font-display text-[1.375rem] font-semibold">{r.title}</dt>
                <dd className="mt-2 text-ink-muted">{r.proof ?? <OwnerBlock className="mt-3">The fact behind this claim: {r.hint}.</OwnerBlock>}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="wrap mt-20">
          <h2 className="t-label text-ink-muted">Approvals & memberships</h2>
          {business.approvals.length ? (
            <ul className="mt-4 space-y-1">
              {business.approvals.map((a) => (
                <li key={a.number}>
                  {a.name}, registration {a.number}
                </li>
              ))}
            </ul>
          ) : (
            <OwnerBlock className="mt-4 max-w-xl">
              Real approvals only, with registration numbers (e.g. Ministry of Tourism, RTDC, IATO). Leave the list empty if there are none, and this block disappears.
            </OwnerBlock>
          )}
        </div>
      </section>

      <section className="on-dark bg-maroon text-ivory">
        <div className="wrap section-y flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <h2 className="t-h1 max-w-[14ch]">Let's plan something unhurried.</h2>
          <EnquiryButton className="bg-ivory! text-maroon! hover:bg-sandstone!">Plan My Trip</EnquiryButton>
        </div>
      </section>
    </>
  );
}
