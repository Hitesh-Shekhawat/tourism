"use client";

import { useRef, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { SectionHead } from "@/components/ui/bits";
import { assets } from "@/content/assets";
import { imageSources } from "@/content/imageSources";
import { reviews } from "@/content/home";
import { hasStories, storiesCopy, travellerStories, type TravellerStory } from "@/content/homepage";
import { useDialog } from "@/lib/useDialog";

/**
 * 06 · Traveller stories: real guests only (content/homepage.ts → travellerStories, plus the text
 * reviews in content/home.ts). Hidden until there is at least one. A swipeable row of portrait and
 * landscape video cards and quotes; a video opens in a modal player with native controls.
 */
export function TravellerStories() {
  const [playing, setPlaying] = useState<TravellerStory | null>(null);
  const row = useRef<HTMLUListElement>(null);
  if (!hasStories) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = row.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id="stories" aria-labelledby="stories-title" className="section-y overflow-hidden bg-sandstone">
      <div className="wrap flex flex-wrap items-end justify-between gap-8">
        <div>
          <SectionHead n="06" label={storiesCopy.label} />
          <h2 id="stories-title" className="t-h1 mt-8" data-reveal>
            {storiesCopy.title}
          </h2>
        </div>
        <div className="flex gap-3">
          <button type="button" className="grid size-12 place-items-center border border-ink/50 hover:bg-ink hover:text-ivory" onClick={() => scrollBy(-1)} aria-label="Previous stories">
            ←
          </button>
          <button type="button" className="grid size-12 place-items-center border border-ink/50 hover:bg-ink hover:text-ivory" onClick={() => scrollBy(1)} aria-label="Next stories">
            →
          </button>
        </div>
      </div>

      <ul ref={row} className="home-stories-row mt-12" aria-label="Traveller stories">
        {travellerStories.map((s) => (
          <li key={s.name + s.destination} className={s.video?.orientation === "portrait" ? "home-story home-story-portrait" : "home-story"}>
            {s.video ? (
              <button type="button" className="group relative block w-full text-left" onClick={() => setPlaying(s)} aria-label={`Play ${s.name}'s story about ${s.destination}`}>
                <div className="relative overflow-hidden bg-dune">
                  <Photo k={s.video.poster} ratio={s.video.orientation === "portrait" ? "4:5" : "16:9"} sizes="(min-width: 1024px) 34vw, 80vw" decorative compact imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-out)] group-hover:scale-[1.03]" />
                  <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                    <span className="grid size-16 place-items-center rounded-full border border-ivory/80 bg-ink/35 text-ivory backdrop-blur-[2px] transition-transform duration-500 group-hover:scale-110">
                      <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
                        <path d="M1 1l14 8-14 8z" fill="currentColor" />
                      </svg>
                    </span>
                  </span>
                </div>
                <Caption s={s} />
              </button>
            ) : (
              <figure>
                {s.photo && <Photo k={s.photo} ratio="4:5" sizes="(min-width: 1024px) 34vw, 80vw" decorative compact />}
                <Caption s={s} />
              </figure>
            )}
          </li>
        ))}
        {reviews.map((r) => (
          <li key={r.name + r.date} className="home-story">
            <figure className="flex h-full flex-col justify-between border-t border-brass/60 pt-6">
              <blockquote className="serif-italic text-[1.625rem] leading-snug">
                <p>&ldquo;{r.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="t-small mt-6 text-ink-muted">
                <span className="font-semibold text-ink">{r.name}</span> · {r.origin} · {r.trip} · {r.date}
                {r.sourceUrl && (
                  <a href={r.sourceUrl} className="link ml-3 text-accent" target="_blank" rel="noopener">
                    Source
                  </a>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {playing?.video && <Player story={playing} onClose={() => setPlaying(null)} />}
    </section>
  );
}

function Caption({ s }: { s: TravellerStory }) {
  return (
    <div className="mt-5">
      <p className="t-label text-ink-muted">{s.destination}</p>
      <p className="mt-2 font-display text-[1.375rem] leading-snug">&ldquo;{s.excerpt}&rdquo;</p>
      <p className="t-small mt-3 text-ink-muted">
        <span className="font-semibold text-ink">{s.name}</span>
        {s.origin && ` · ${s.origin}`}
      </p>
    </div>
  );
}

function Player({ story, onClose }: { story: TravellerStory; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useDialog(true, onClose, panel, closeBtn);
  const v = story.video!;
  const posterSource = imageSources[v.poster] ?? assets[v.poster].src;
  const poster = typeof posterSource === "string" ? posterSource : posterSource?.src;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/85 p-4 sm:p-8" onClick={onClose}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label={`${story.name}'s story`} className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <button ref={closeBtn} type="button" onClick={onClose} className="absolute -top-14 right-0 grid size-12 place-items-center border border-ivory/60 text-ivory hover:bg-ivory hover:text-ink" aria-label="Close video">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <video src={v.src} poster={poster} controls autoPlay playsInline className={`mx-auto max-h-[80svh] bg-ink ${v.orientation === "portrait" ? "aspect-[9/16]" : "aspect-video w-full"}`} />
        <p className="t-small mt-4 text-ivory/85">
          {story.name} · {story.destination}
        </p>
      </div>
    </div>
  );
}
