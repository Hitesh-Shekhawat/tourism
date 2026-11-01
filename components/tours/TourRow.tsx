import { Link } from "next-view-transitions";
import { Photo } from "@/components/ui/Photo";
import { Arrow } from "@/components/ui/bits";
import type { Tour } from "@/content/tours";
import { nightsDays, Price, routeLine } from "./TourBits";

/** Compact journey row used on tour lists, destination and experience pages. */
export function TourRow({ t, level = 3 }: { t: Tour; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <article className="hover-zoom grid items-center gap-6 border-t border-brass/50 pt-8 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-10">
      <Link href={`/journeys/${t.slug}`} tabIndex={-1} aria-hidden="true" className="block overflow-hidden" style={{ viewTransitionName: `journey-${t.slug}` }}>
        <Photo k={t.heroImage} sizes="(min-width: 640px) 36vw, 92vw" decorative compact />
      </Link>
      <div>
        <p className="t-label tabular text-ink-muted">{nightsDays(t)}</p>
        <H className="t-h2 mt-2">
          <Link href={`/journeys/${t.slug}`} className="link">
            {t.title}
          </Link>
        </H>
        <p className="mt-2 font-display text-[1.25rem] text-terracotta-deep">{routeLine(t)}</p>
        <p className="measure mt-3 text-ink-muted">{t.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Price t={t} />
          <Link href={`/journeys/${t.slug}`} className="link inline-flex items-center gap-2 py-2 font-semibold">
            View Itinerary <Arrow />
          </Link>
        </div>
      </div>
    </article>
  );
}
