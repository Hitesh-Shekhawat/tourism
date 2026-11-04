"use client";

import { useRef, useState } from "react";
import { Photo } from "./Photo";
import type { AssetKey } from "@/content/assets";

/**
 * Poster + play button (§3 · 05, §7): nothing is fetched until the visitor presses play
 * (preload="none"), it never autoplays with sound, and native controls take over once it starts.
 */
export function VideoPoster({ src, poster, label, sizes }: { src: string; poster: AssetKey; label: string; sizes: string }) {
  const [on, setOn] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      {on ? (
        <video ref={video} src={src} controls playsInline preload="none" autoPlay className="absolute inset-0 h-full w-full object-cover" aria-label={label} />
      ) : (
        <button type="button" className="group absolute inset-0 block" onClick={() => setOn(true)} aria-label={`Play: ${label}`}>
          <Photo k={poster} fill sizes={sizes} decorative compact imgClassName="transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.03]" />
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full border border-ivory/80 bg-ink/35 text-ivory backdrop-blur-[2px]">
              <svg width="14" height="16" viewBox="0 0 16 18" aria-hidden="true">
                <path d="M1 1l14 8-14 8z" fill="currentColor" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
