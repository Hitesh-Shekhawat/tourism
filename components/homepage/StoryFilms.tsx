"use client";

import { useState } from "react";
import { storyVideos } from "@/content/homepage";
import { YoutubePlayer } from "./TravellerStories";

/** The owner's short films (content/homepage.ts → storyVideos), opened in the existing modal player. */
export function StoryFilms() {
  const [playing, setPlaying] = useState<string | null>(null);
  if (!storyVideos.length) return null;
  return (
    <>
      <ul className="films-row" aria-label="Films from the road">
        {storyVideos.map((v, i) => (
          <li key={v.id}>
            <button type="button" className="film-card group" onClick={() => setPlaying(v.youtubeId)} aria-label={`Play film from the road ${i + 1}`}>
              <span className="film-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail, lazy */}
                <img src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} />
                <span className="film-play" aria-hidden="true">
                  <svg width="12" height="14" viewBox="0 0 16 18">
                    <path d="M1 1l14 8-14 8z" fill="currentColor" />
                  </svg>
                </span>
              </span>
              <span className="film-copy">
                <span className="t-label text-ink-muted">Film {String(i + 1).padStart(2, "0")}</span>
                <span className="mt-1 block font-display text-[1.125rem] leading-snug">A moment from the road</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {playing && <YoutubePlayer videoId={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}
