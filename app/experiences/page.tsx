import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { PageHead } from "@/components/page/PageParts";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/bits";
import { JsonLd } from "@/components/ui/JsonLd";
import { experiences } from "@/content/experiences";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Signature experiences in Rajasthan",
  description: "Dawn on Lake Pichola, a night in the Thar, block printing in Bagru, Jodhpur's blue city on foot and more, woven into private journeys.",
  path: "/experiences",
});

export default function ExperiencesPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Experiences", path: "/experiences" }])} />
      <PageHead title="The moments people remember." label="Experiences" crumbs={[{ name: "Experiences" }]}>
        <p className="measure mt-6 text-ink-muted">Each of these can be woven into any journey. Most are best early in the day, before the heat and the crowds.</p>
      </PageHead>
      <section className="grain section-y pt-16!">
        <ul className="wrap grid gap-x-8 gap-y-16 md:grid-cols-2">
          {experiences.map((e, i) => (
            <li key={e.slug} className={i % 2 ? "md:mt-24" : ""}>
              <Link href={`/experiences/${e.slug}`} className="hover-zoom group block">
                <div className="overflow-hidden" data-reveal-mask>
                  <Photo k={e.image} ratio={i % 3 === 0 ? "4:5" : "3:2"} sizes="(min-width: 768px) 45vw, 92vw" />
                </div>
                <p className="t-label mt-5 text-ink-muted">{e.label}</p>
                <h2 className="t-h2 mt-2">{e.title}</h2>
                <p className="mt-2 text-ink-muted">{e.summary}</p>
                <span className="t-small mt-4 inline-flex items-center gap-2 font-semibold text-terracotta">
                  Discover <Arrow />
                </span>
                <span aria-hidden="true" className="caption-line mt-4 block h-px bg-brass/70" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="wrap mt-24 flex flex-col items-start gap-6 border-t border-brass/50 pt-12 md:flex-row md:items-center md:justify-between">
          <h2 className="t-h2">Something else in mind?</h2>
          <EnquiryButton>Design your own journey</EnquiryButton>
        </div>
      </section>
    </>
  );
}
