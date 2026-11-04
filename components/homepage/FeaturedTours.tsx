import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { HorizontalTrack } from "@/components/ui/HorizontalTrack";
import { Photo } from "@/components/ui/Photo";
import { Placeholder } from "@/components/ui/Placeholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow } from "@/components/ui/bits";
import { featured } from "@/content/homepage";
import { tours } from "@/content/tours";
import { canShow } from "@/lib/content-flags";

const inr = new Intl.NumberFormat("en-IN");

/** Journeys the homepage may show: confirmed ones everywhere, sample drafts in development only. */
export const visibleJourneys = () => tours.filter((t) => t.featured && canShow(!t.draft));

/**
 * 06 · Featured journeys (choose). A draggable horizontal track (no pin): large photography and minimal
 * metadata (route, duration, travel style), with the price only when it exists in real data, written
 * "from ₹…". Sample drafts are labelled in development and left out of production; with no confirmed
 * journey the section is not rendered at all.
 */
export function FeaturedTours({ n }: { n: string }) {
  const list = visibleJourneys();
  if (!list.length) return null;
  return (
    <section id="journeys" aria-labelledby="ft-title" className="sec bg-ivory">
      <HorizontalTrack
        label="Featured journeys"
        head={
          <SectionHeading
            n={n}
            label={featured.label}
            id="ft-title"
            title={featured.title}
            note={featured.note}
            aside={
              <Link href="/journeys" scroll={false} className="link mt-5 inline-flex items-center gap-2 py-2 font-semibold">
                View all journeys <Arrow />
              </Link>
            }
          />
        }
      >
        {list.map((t) => (
          <li key={t.slug} className="jr-card">
            <Link href={`/journeys/${t.slug}`} scroll={false} className="dest-link group">
              <span className="dest-frame jr-frame">
                <span className="dest-img">
                  <Photo k={t.heroImage} fill sizes="(min-width: 1024px) 44vw, 86vw" decorative compact />
                </span>
              </span>
              <span className="mt-4 block">
                <span className="t-label block text-ink-muted">{t.route.join(" · ")}</span>
                <span className="dest-name mt-2 block t-h2">{t.title}</span>
                <span className="t-small mt-3 flex flex-wrap gap-x-3 text-ink-muted">
                  <span>
                    {t.durationNights} nights · {t.durationDays} days
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{t.styles.join(", ")}</span>
                  {t.priceFromINR ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-ink">from ₹{inr.format(t.priceFromINR)}</span>
                    </>
                  ) : null}
                </span>
                <span className="t-small mt-3 block max-w-[46ch] text-ink-muted">{t.summary}</span>
                <span className="dest-explore mt-4 inline-flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.12em] text-accent uppercase">
                  Explore journey <Arrow />
                </span>
              </span>
            </Link>
            {t.draft && <Placeholder what={`a confirmed journey: content/tours/${t.slug}.ts is a sample draft`} className="mt-4" />}
          </li>
        ))}
        <li className="jr-card jr-end">
          <p className="t-label text-ink-muted">Not quite it?</p>
          <p className="mt-4 font-display text-[2rem] leading-tight">We&rsquo;ll build a journey around your dates and pace.</p>
          <EnquiryButton variant="secondary" className="mt-8">
            Plan Your Trip
          </EnquiryButton>
        </li>
      </HorizontalTrack>
    </section>
  );
}
