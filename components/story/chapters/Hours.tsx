import { Link } from "next-view-transitions";
import { Photo } from "@/components/ui/Photo";
import { Arrow, Deva } from "@/components/ui/bits";
import { destinations } from "@/content/destinations";
import { chapterHeadingId } from "@/lib/day";
import { Chapter, ChapterHead } from "../Chapter";
import { HoursFx } from "./HoursFx";

/**
 * Ch02 · 08:00, "Hours of Rajasthan" (§6.3): six destination cards on an arc like hour marks on a
 * sundial. Desktop: scroll rotates the ring (pinned ≈300vh, snapping to each city, ←/→ when focused)
 * and a gnomon shadow sweeps across. Compact: a scroll-snap row. Reduced / no JS: a 2×3 grid.
 */
export function Hours() {
  return (
    <Chapter id="hours" pinned className="bg-paper">
      <div className="hours-stage">
        <div className="wrap flex flex-col gap-6 pt-[calc(var(--header-h)+5svh)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <ChapterHead id="hours" label="Destinations" />
            <h2 id={chapterHeadingId("hours")} className="t-h2 mt-6 max-w-[18ch]" data-rise>
              Six cities, each at its own hour.
            </h2>
          </div>
          <Link href="/destinations" className="link w-fit py-2 font-semibold">
            All destinations
          </Link>
        </div>

        <div className="hours-ring-wrap" tabIndex={0} aria-roledescription="carousel" aria-label="Destinations. Use the left and right arrow keys to turn the dial." data-hours-wrap>
          <ul className="hours-row" data-hours-ring>
            {destinations.map((d, i) => (
              <li key={d.slug} className="hours-card" style={{ ["--d" as string]: i }} data-hours-card>
                <Link href={`/destinations/${d.slug}`} scroll={false} className="group block" aria-label={`${d.name}: ${d.descriptor}. View destination`}>
                  <div className="hours-plate">
                    <Photo k={d.indexImage} fill sizes="(min-width: 1024px) 22vw, 72vw" decorative compact />
                    <div className="gnomon" aria-hidden="true" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-[1.875rem] leading-none">{d.name}</span>
                      <Deva className="text-lg text-accent">{d.devanagari}</Deva>
                    </span>
                    <span className="t-label inline-flex items-center gap-2 text-fg-muted transition-colors group-hover:text-accent">
                      View <Arrow />
                    </span>
                  </div>
                  <p className="t-small mt-2 text-fg-muted">{d.descriptor}</p>
                  <span aria-hidden="true" className="mt-3 block h-px bg-brass/60" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <HoursFx />
    </Chapter>
  );
}
