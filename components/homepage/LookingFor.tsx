import { Link } from "next-view-transitions";
import { Photo } from "@/components/ui/Photo";
import { ArchOutline } from "@/components/ui/Ornaments";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow } from "@/components/ui/bits";
import { discovery } from "@/content/homepage";

/**
 * 02 · Quick trip discovery: four interests as jharokha-arched photo cards, each a link to the page
 * that covers it best. Server-rendered, no script: hover/focus lifts the card, zooms the photo and
 * traces the arch outline; touch screens get a swipeable row. Replaces the pinned 3D window
 * (FortWindowScene), so this section no longer loads WebGL.
 */
export function LookingFor({ n }: { n: string }) {
  return (
    <section id="discover" aria-labelledby="discover-title" className="sec discover-v5 relative isolate bg-ivory">
      <div className="wrap">
        <SectionHeading n={n} label={discovery.label} id="discover-title" title={discovery.title} note={discovery.note} />
      </div>
      <ul className="discover-row wrap" aria-label="Rajasthan experiences">
        {discovery.cards.map((c, i) => (
          <li key={c.id} className="discover-item" data-fx="card">
            <Link href={c.href} className="discover-card group">
              <span className="discover-arch">
                <span className="discover-photo">
                  <Photo k={c.image} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 78vw" imgClassName="discover-img" />
                </span>
                <ArchOutline className="discover-outline text-sand" double={false} />
                <span className="discover-num serif-italic" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <span className="discover-copy">
                <span className="t-label text-ink-muted">{c.where}</span>
                <h3 className="discover-title">{c.title}</h3>
                <span className="discover-text">{c.text}</span>
                <span className="discover-cta">
                  {c.cta} <Arrow />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
