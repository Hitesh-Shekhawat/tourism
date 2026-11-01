"use client";

import { useState } from "react";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { business, isPlaceholder } from "@/content/business";
import { reviews } from "@/content/home";
import { chapterHeadingId } from "@/lib/day";
import { Chapter, ChapterHead } from "../Chapter";
import { HeadingFx } from "./HeadingFx";

/**
 * Ch08 · 20:30, "Around the fire" (§6.9): the night palette begins. One pull-quote at a time over a
 * small ember glow, previous / next buttons, no auto-advance. Real reviews only.
 */
export function Stories() {
  const [i, setI] = useState(0);
  const has = reviews.length > 0;
  const r = reviews[i];

  return (
    <Chapter id="stories" className="section-y relative overflow-hidden">
      <HeadingFx id="stories" order={80} />
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <ChapterHead id="stories" />
          <h2 id={chapterHeadingId("stories")} className="t-h2 mt-8 max-w-[12ch]" data-rise>
            In their words.
          </h2>
        </div>

        <div className="relative lg:col-span-7 lg:col-start-6">
          <div className="ember" aria-hidden="true" />
          {has ? (
            <figure className="relative" aria-roledescription="carousel" aria-label="Guest reviews">
              <div aria-live="polite">
                <blockquote className="serif-italic text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.2]">
                  <p>“{r.quote}”</p>
                </blockquote>
                <figcaption className="mt-8 border-t border-brass/50 pt-5">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-fg-muted">
                    {" "}
                    · {r.origin} · {r.trip} · {r.date}
                  </span>
                  {r.sourceUrl && (
                    <a href={r.sourceUrl} className="link ml-3 text-sm text-accent" target="_blank" rel="noopener">
                      Source
                    </a>
                  )}
                </figcaption>
              </div>
              {reviews.length > 1 && (
                <div className="mt-8 flex items-center gap-3">
                  <button type="button" className="grid size-12 place-items-center border border-current/60 hover:bg-fg hover:text-paper" onClick={() => setI((i - 1 + reviews.length) % reviews.length)} aria-label="Previous review">
                    ←
                  </button>
                  <button type="button" className="grid size-12 place-items-center border border-current/60 hover:bg-fg hover:text-paper" onClick={() => setI((i + 1) % reviews.length)} aria-label="Next review">
                    →
                  </button>
                  <span className="t-small numerals ml-3 text-fg-muted">
                    {i + 1} / {reviews.length}
                  </span>
                </div>
              )}
            </figure>
          ) : (
            <div className="relative">
              <p className="serif-italic text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.2]">Guest stories are coming soon.</p>
              <p className="measure mt-5 text-fg-muted">Ask us to connect you with a past traveller. We'd rather you hear it from them.</p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <EnquiryButton variant="secondary" arrow={false}>
                  Ask to speak to a past traveller
                </EnquiryButton>
                {!isPlaceholder(business.googleReviewsUrl) && (
                  <a href={business.googleReviewsUrl} className="link py-2 font-semibold" target="_blank" rel="noopener">
                    Our Google reviews
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Chapter>
  );
}
