"use client";

import { useRef, useState } from "react";
import { HorizontalTrack } from "@/components/ui/HorizontalTrack";
import { Placeholder } from "@/components/ui/Placeholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { showPlaceholders } from "@/lib/content-flags";
import { Photo } from "@/components/ui/Photo";
import { assets } from "@/content/assets";
import { imageSources } from "@/content/imageSources";
import { reviews } from "@/content/home";
import { hasStories, storiesCopy, storyVideos, travellerStories, type TravellerStory } from "@/content/homepage";
import { useDialog } from "@/lib/useDialog";

/**
 * 07 · Stories from the road. Guest stories and reviews require permission; owner-provided video features
 * are labelled separately. Video stories use the shared horizontal track; ratings appear only when
 * verified (with the source named). Hidden in production until content is configured.
 */
export function TravellerStories({ n }: { n: string }) {
  const [playing, setPlaying] = useState<TravellerStory | null>(null);
  const [playingYoutube, setPlayingYoutube] = useState<string | null>(null);
  const heading = <SectionHeading n={n} label={storiesCopy.label} id="stories-title" title={storiesCopy.title} note={storiesCopy.note} />;
  const galleryHeading = <p className="t-label text-ink-muted">Travel films &amp; stories from the road</p>;

  // No real testimonials: nothing in production; a labelled stand-in in development
  if (!hasStories) {
    if (!showPlaceholders) return null;
    return (
      <section id="stories" aria-labelledby="stories-title" className="sec relative isolate bg-sandstone">
        <div className="wrap">
          {heading}
          <Placeholder what="real guest stories (content/homepage.ts → travellerStories, content/home.ts → reviews), with written permission for each name, photo and quote" className="mt-12 min-h-[240px]">
            This section is hidden in production until at least one real story exists. Ratings appear only when verified on a linked review platform, with the source named.
          </Placeholder>
        </div>
      </section>
    );
  }

  const lead = travellerStories.find((story) => !story.video);
  const videoStories = travellerStories.filter((story) => story.video);
  const otherStories = travellerStories.filter((story) => story !== lead && !story.video);
  const carouselStories = [...videoStories, ...otherStories];
  return (
    <section id="stories" aria-labelledby="stories-title" className="sec relative isolate overflow-hidden bg-sandstone">
      {lead && (
        <div className="wrap">
          {heading}
          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <StoryMedia s={lead} onPlay={setPlaying} sizes="(min-width: 1024px) 58vw, 100vw" />
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <Caption s={lead} large />
            </div>
          </div>
        </div>
      )}
      {(storyVideos.length > 0 || carouselStories.length > 0 || reviews.length > 0) && (
        <HorizontalTrack
          label="Stories from the road"
          className={`stories-track ${lead ? "mt-14" : ""}`}
          head={lead ? galleryHeading : heading}
        >
          {storyVideos.map((video, index) => (
            <li key={video.id} className="story-card story-video-card">
              <button
                type="button"
                className="story-video-button group relative block w-full text-left"
                onClick={() => setPlayingYoutube(video.youtubeId)}
                aria-label={`Play travel video ${index + 1}`}
              >
                <span className="story-video-thumb relative block aspect-[4/5] overflow-hidden bg-ink">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.03]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                    <span className="grid size-16 place-items-center rounded-full border border-ivory/80 bg-ink/35 text-ivory backdrop-blur-[2px]">
                      <svg width="14" height="16" viewBox="0 0 16 18" aria-hidden="true">
                        <path d="M1 1l14 8-14 8z" fill="currentColor" />
                      </svg>
                    </span>
                  </span>
                </span>
              </button>
              <div className="mt-5">
                <p className="t-label text-ink-muted">Travel film</p>
                <p className="mt-2 font-display text-[1.375rem] leading-snug">A moment from the road</p>
                <a
                  href={`https://youtube.com/shorts/${video.youtubeId}`}
                  className="link t-small mt-3 inline-block text-accent"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube
                </a>
              </div>
            </li>
          ))}
          {carouselStories.map((s) => (
            <li key={s.name + s.destination} className="story-card">
              <StoryMedia s={s} onPlay={setPlaying} sizes="(min-width: 1024px) 30vw, 80vw" />
              <Caption s={s} />
            </li>
          ))}
          {reviews.map((r) => (
            <li key={r.name + r.date} className="story-card story-review-card">
              <figure className="story-review">
                <blockquote className="story-review__quote">
                  <span className="story-review__mark" aria-hidden="true">&ldquo;</span>
                  <p>{r.quote}&rdquo;</p>
                </blockquote>
                <figcaption className="story-review__byline t-small">
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
        </HorizontalTrack>
      )}
      {playing?.video && <Player story={playing} onClose={() => setPlaying(null)} />}
      {playingYoutube && <YoutubePlayer videoId={playingYoutube} onClose={() => setPlayingYoutube(null)} />}
    </section>
  );
}

function StoryMedia({ s, onPlay, sizes }: { s: TravellerStory; onPlay: (s: TravellerStory) => void; sizes: string }) {
  if (s.video)
    return (
      <button type="button" className="story-media-button group relative block w-full text-left" onClick={() => onPlay(s)} aria-label={`Play ${s.name}'s story about ${s.destination}`}>
        <Photo k={s.video.poster} className="story-media-thumb" ratio={s.video.orientation === "portrait" ? "4:5" : "16:9"} sizes={sizes} decorative compact imgClassName="transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.03]" />
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <span className="grid size-16 place-items-center rounded-full border border-ivory/80 bg-ink/35 text-ivory backdrop-blur-[2px]">
            <svg width="14" height="16" viewBox="0 0 16 18" aria-hidden="true">
              <path d="M1 1l14 8-14 8z" fill="currentColor" />
            </svg>
          </span>
        </span>
      </button>
    );
  return s.photo ? <Photo k={s.photo} ratio="4:5" sizes={sizes} decorative compact /> : null;
}

function Caption({ s, large = false }: { s: TravellerStory; large?: boolean }) {
  return (
    <div className="mt-5">
      <p className="t-label text-ink-muted">{s.destination}</p>
      <p className={`mt-2 font-display leading-snug ${large ? "text-[clamp(1.75rem,2.6vw,2.5rem)]" : "text-[1.375rem]"}`}>&ldquo;{s.excerpt}&rdquo;</p>
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

function YoutubePlayer({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useDialog(true, onClose, panel, closeBtn);
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/85 p-4 sm:p-8" onClick={onClose}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label="Travel video" className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <button ref={closeBtn} type="button" onClick={onClose} className="absolute -top-14 right-0 grid size-12 place-items-center border border-ivory/60 text-ivory hover:bg-ivory hover:text-ink" aria-label="Close video">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <div className="mx-auto h-[min(80svh,800px)] aspect-[9/16] max-w-[90vw] bg-ink">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
            title="Travel film"
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
