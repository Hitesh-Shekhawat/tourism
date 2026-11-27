import { Link } from "next-view-transitions";
import type { ReactNode } from "react";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Photo } from "@/components/ui/Photo";
import { Creeper, Motif } from "@/components/ui/Ornaments";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow } from "@/components/ui/bits";
import { showcase, type ShowcaseItem } from "@/content/homepage";

/**
 * 05 · Unique Rajasthan experiences: an editorial mosaic on deep green. Items with a real photograph
 * are photo cards; items without one are drawn as fresco-style ornament panels (motif + Devanagari),
 * so no stand-in photography is ever shown. Hover/focus zooms the photo, lifts the caption and
 * reveals the description (always visible on touch). Each item links to its page, or opens the
 * existing enquiry drawer when there is no page for it yet.
 */
export function ExperienceShowcase({ n }: { n: string }) {
  return (
    <section id="experiences" aria-labelledby="exp-title" className="sec showcase-v5 on-dark relative isolate overflow-hidden bg-forest text-ivory">
      <div className="showcase-jaali" aria-hidden="true" />
      <div className="wrap relative">
        <SectionHeading n={n} label={showcase.label} id="exp-title" title={showcase.title} note={showcase.note} dark titleClass="max-w-[16ch]" />
        <Creeper className="mt-10 h-6 w-full max-w-xl text-sand/60" width={560} />
        <ul className="showcase-grid" aria-label="Rajasthan experiences">
          {showcase.items.map((it, i) => (
            <li key={it.id} className={`showcase-cell showcase-${it.id}`} data-fx="card">
              <ShowcaseCard item={it} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  const inner = (cta: ReactNode) => (
    <>
      {item.image ? (
        <span className="showcase-photo">
          <Photo k={item.image} fill sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw" imgClassName="showcase-img" />
          <span className="showcase-shade" aria-hidden="true" />
        </span>
      ) : (
        <span className="showcase-panel" aria-hidden="true">
          {item.motif && <Motif name={item.motif} className="showcase-motif" />}
          {item.deva && <span className="showcase-deva" lang="hi">{item.deva}</span>}
        </span>
      )}
      <span className="showcase-copy">
        <h3 className="showcase-title">{item.title}</h3>
        <span className="showcase-text">
          <span>{item.text}</span>
        </span>
        {cta}
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={`showcase-card group ${item.image ? "" : "is-panel"}`}>
        {inner(
          <span className="showcase-cta">
            {item.cta} <Arrow />
          </span>,
        )}
      </Link>
    );
  }
  return (
    <div className={`showcase-card group ${item.image ? "" : "is-panel"}`}>
      {inner(
        <EnquiryButton variant="text" prefill={item.enquire?.destinations ? { destinations: item.enquire.destinations } : undefined} className="showcase-cta showcase-cta-btn">
          {item.cta}
        </EnquiryButton>,
      )}
    </div>
  );
}
