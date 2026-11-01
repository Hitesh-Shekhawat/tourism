"use client";

import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Photo } from "@/components/ui/Photo";
import { Check, Copy } from "@/components/ui/bits";
import { nightsDays, routeLine } from "@/components/tours/TourBits";
import { destinations } from "@/content/destinations";
import { journeysCopy } from "@/content/home";
import { featuredTours } from "@/content/tours";
import { chapter, chapterHeadingId } from "@/lib/day";
import { useChapterMotion } from "@/lib/story/engine";
import { riseHeading, vhPx } from "@/lib/story/fx";
import { Chapter, ChapterHead } from "../Chapter";

const PIN = chapter("journeys").pin!;
const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEVA: Record<string, string> = {
  Amber: "आमेर",
  Ranakpur: "रणकपुर",
  ...Object.fromEntries(destinations.map((d) => [d.name, d.devanagari])),
};

/** Names only the clicked ticket's image for the View Transition into the sheet hero (the sheet clears it again). */
const nameForTransition = (e: React.MouseEvent) => {
  const img = (e.currentTarget as HTMLElement).closest("[data-ticket]")?.querySelector<HTMLElement>("[data-vt]");
  if (img) img.style.viewTransitionName = img.dataset.vt!;
};

/** A brass rubber stamp with the journey's first city in Devanagari. */
function Stamp({ city, id }: { city: string; id: string }) {
  return (
    <svg className="ticket-stamp" viewBox="0 0 120 120" aria-hidden="true" data-stamp>
      <g fill="none" stroke="#9c7a45" strokeOpacity=".85">
        <circle cx="60" cy="60" r="56" strokeWidth="2.4" />
        <circle cx="60" cy="60" r="49" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx="60" cy="60" r="31" strokeWidth="1" />
      </g>
      <text x="60" y="68" textAnchor="middle" fontSize="22" fill="#9c7a45" fillOpacity=".9" fontFamily="var(--font-tiro)">
        {DEVA[city] ?? city}
      </text>
      <path id={`stamp-${id}`} d="M 18 60 A 42 42 0 0 1 102 60" fill="none" />
      <text fontSize="8" letterSpacing="2.4" fill="#9c7a45" fillOpacity=".85" fontFamily="var(--font-sans)" fontWeight="600">
        <textPath href={`#stamp-${id}`} startOffset="50%" textAnchor="middle">
          RAJASTHAN · {city.toUpperCase()}
        </textPath>
      </text>
    </svg>
  );
}

/**
 * Ch06 · 19:00 (dusk), "Featured Journeys" (§6.7): letterpress journey tickets. Desktop (pinned ≈240vh):
 * tickets arrive from below and stack, the ones underneath tilting back and darkening; as each settles
 * a brass stamp thunks onto it, the page's one deliberate impact. Compact: a stack, stamp on enter.
 */
export function Tickets() {
  const list = featuredTours();

  useChapterMotion("journeys", 60, (m) => {
    const { gsap, ScrollTrigger, mode } = m;
    const el = document.getElementById("ch-journeys")!;
    riseHeading(m, el.querySelector("[data-rise]"));
    if (mode === "reduced") return;
    const items = gsap.utils.toArray<HTMLElement>("[data-ticket]", el);
    const stamps = items.map((t) => t.querySelector<SVGElement>("[data-stamp]")!);
    const done = items.map(() => false);
    const thunk = (k: number) => {
      if (done[k]) return;
      done[k] = true;
      gsap
        .timeline()
        .fromTo(
          stamps[k],
          {
            scale: 1.4,
            rotation: -8,
            autoAlpha: 0,
            transformOrigin: "50% 50%",
          },
          { scale: 1, autoAlpha: 1, duration: 0.16, ease: "power4.in" },
        )
        .to(items[k], {
          x: 3,
          duration: 1 / 60,
          repeat: 1,
          yoyo: true,
          ease: "none",
        })
        .set(items[k], { x: 0 });
    };
    gsap.set(stamps, { autoAlpha: 0 });

    // Below 1024px a ticket is taller than the screen, so phones keep the stack with the stamp on enter
    if (mode !== "desktop" || !window.matchMedia("(min-width: 1024px)").matches) {
      items.forEach((t, k) =>
        gsap.timeline({
          scrollTrigger: {
            trigger: t,
            start: "top 70%",
            once: true,
            onEnter: () => thunk(k),
          },
        }),
      );
      return;
    }

    const stage = el.querySelector<HTMLElement>(".tickets-stage")!;
    const top = (k: number) => window.innerHeight * 0.14 + k * 22;
    gsap.set(items, {
      y: () => window.innerHeight,
      transformPerspective: 1400,
      transformOrigin: "50% 0%",
    });
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    items.forEach((t, k) => {
      tl.to(t, { y: () => top(k), duration: 1, onComplete: () => thunk(k) }, k);
      // everything beneath tilts back, shrinks and darkens a step
      for (let j = 0; j < k; j++)
        tl.to(
          items[j],
          {
            rotationX: 6,
            scale: 1 - (k - j) * 0.05,
            filter: `brightness(${1 - (k - j) * 0.14})`,
            duration: 1,
          },
          k,
        );
    });
    tl.to({}, { duration: 0.4 });
    ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: () => `+=${vhPx(PIN)()}`,
      pin: true,
      anticipatePin: 1,
      scrub: 1.2,
      animation: tl,
      invalidateOnRefresh: true,
      onToggle: (s) => stage.style.setProperty("will-change", s.isActive ? "transform" : "auto"),
      onUpdate: (s) => items.forEach((_, k) => s.progress * tl.duration() >= k + 1 && thunk(k)),
    });
    return () => gsap.set([...items, ...stamps], { clearProps: "all" });
  });

  return (
    <Chapter id="journeys" pinned className="bg-paper">
      <div className="wrap pt-[var(--section-y)] pb-12 lg:pb-4">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <ChapterHead id="journeys" label="Featured journeys" />
            <h2 id={chapterHeadingId("journeys")} className="t-h1 mt-8 max-w-[16ch]" data-rise>
              {journeysCopy.title}
            </h2>
          </div>
          <div className="max-w-[40ch]">
            <p className="measure text-fg-muted">{journeysCopy.note}</p>
            <Link href="/journeys" scroll={false} className="link mt-4 inline-block py-2 font-semibold">
              View all journeys →
            </Link>
          </div>
        </div>
      </div>

      <div className="tickets-stage pb-[var(--section-y)] lg:pb-0">
        <ol className="tickets-list wrap space-y-10 lg:space-y-0">
          {list.map((t, i) => (
            <li key={t.slug} data-ticket>
              <article className="ticket mx-auto grid max-w-[1080px] overflow-hidden lg:grid-cols-[38%_1fr]" aria-labelledby={`ticket-${t.slug}`}>
                <div className="relative min-h-[220px] lg:min-h-[58svh]" data-vt={`journey-${t.slug}`}>
                  <Photo k={t.heroImage} fill sizes="(min-width: 1024px) 400px, 92vw" decorative compact />
                </div>
                <div className="relative px-7 py-8 sm:px-10 lg:px-12 lg:py-10">
                  <Stamp city={t.route[0]} id={t.slug} />
                  <p className="t-label numerals text-fg-muted">
                    Journey {String(i + 1).padStart(2, "0")} · {nightsDays(t)}
                  </p>
                  <h3 id={`ticket-${t.slug}`} className="t-h2 mt-3 max-w-[14ch]">
                    {t.title}
                  </h3>
                  <p className="mt-3 max-w-[30ch] font-display text-[1.375rem] leading-snug text-accent">{routeLine(t)}</p>
                  <ul className="mt-6 space-y-2 border-t border-dashed border-brass/60 pt-5">
                    {t.inclusions.slice(0, 4).map((inc) => (
                      <li key={inc} className="t-small flex gap-3">
                        <Check className="mt-1 text-accent" />
                        <Copy text={inc} />
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6">
                    {t.priceFromINR ? (
                      <>
                        <span className="t-small text-fg-muted">From </span>
                        <span className="numerals font-display text-[1.75rem] leading-none">₹{inr.format(t.priceFromINR)}</span>
                        <span className="t-small text-fg-muted"> {t.priceBasis ?? "pp (twin sharing)"}</span>
                      </>
                    ) : (
                      <span className="font-display text-[1.375rem]">Price on request</span>
                    )}
                  </p>
                  {t.draft && (
                    <p className="ph mt-4">
                      <span className="t-label mb-1 block">Owner to supply</span>
                      Sample journey: confirm or replace it in content/tours/
                      {t.slug}.ts.
                    </p>
                  )}
                  <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Link href={`/journeys/${t.slug}`} className="btn btn-secondary" scroll={false} onClick={nameForTransition}>
                      View Itinerary
                    </Link>
                    <EnquiryButton prefill={{ tour: t.title }}>Enquire About This Journey</EnquiryButton>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}
