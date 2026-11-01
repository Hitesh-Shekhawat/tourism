import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { PageHead } from "@/components/page/PageParts";
import { Photo } from "@/components/ui/Photo";
import { Arrow, Deva } from "@/components/ui/bits";
import { JsonLd } from "@/components/ui/JsonLd";
import { destinations } from "@/content/destinations";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Destinations in Rajasthan",
  description: "Jaipur, Udaipur, Jaisalmer, Jodhpur, Pushkar and Bikaner: what each city is like, when to go, and how to spend your days there.",
  path: "/destinations",
});

export default function DestinationsPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Destinations", path: "/destinations" }])} />
      <PageHead title="Six cities, each at its own pace." label="Destinations" crumbs={[{ name: "Destinations" }]}>
        <p className="measure mt-6 text-ink-muted">From the pink city's bazaars to the edge of the Thar. Choose one to stay in for a while, or let us join several into a route.</p>
      </PageHead>
      <section className="grain section-y pt-16!">
        <ol className="wrap space-y-20 lg:space-y-28">
          {destinations.map((d, i) => (
            <li key={d.slug} className="grid items-center gap-8 lg:grid-cols-12">
              <Link href={`/destinations/${d.slug}`} tabIndex={-1} aria-hidden="true" className={`hover-zoom block lg:col-span-7 ${i % 2 ? "lg:order-2 lg:col-start-6" : ""}`}>
                <div className="overflow-hidden" data-reveal-mask>
                  <Photo k={d.heroImage} ratio="3:2" sizes="(min-width: 1024px) 56vw, 92vw" decorative />
                </div>
              </Link>
              <div className={`lg:col-span-4 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
                <p className="serif-italic text-xl text-brass-text" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 flex items-baseline gap-4">
                  <Link href={`/destinations/${d.slug}`} className="link t-h1">
                    {d.name}
                  </Link>
                  <Deva className="text-xl text-terracotta">{d.devanagari}</Deva>
                </h2>
                <p className="mt-4 text-ink-muted">{d.descriptor}.</p>
                <Link href={`/destinations/${d.slug}`} className="link mt-6 inline-flex items-center gap-2 py-2 font-semibold">
                  Discover {d.name} <Arrow />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
