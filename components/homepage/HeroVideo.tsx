"use client";

import { useEffect, useRef, useState } from "react";
import { heroVideo } from "@/content/homepage";
import { useStory } from "@/lib/story/store";

/**
 * Hero footage over the hero photo (which stays as the poster and the LCP image). Mounts after
 * first paint, only on large screens (phones and tablets keep the still photograph, so they never
 * download the clip), never under reduced motion or Save-Data, and pauses while the hero is off screen.
 */
export function HeroVideo() {
  const mode = useStory((s) => s.mode);
  const [src, setSrc] = useState<{ mp4: string; webm?: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!heroVideo.src || mode === "reduced") return setSrc(null);
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    setSrc({ mp4: heroVideo.src, webm: heroVideo.srcWebm });
  }, [mode]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) =>
      e.isIntersecting
        ? v.play().catch((error: unknown) => {
            // AbortError = paused again before playback began (the hero scrolled away): expected, not a failure
            if (!(error instanceof DOMException && error.name === "AbortError")) console.error("The hero video failed to play.", error);
          })
        : v.pause(),
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  if (!src) return null;
  return (
    <video
      ref={ref}
      className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${playing ? "opacity-100" : "opacity-0"}`}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      onError={() => console.error("The hero video failed to load.")}
    >
      {src.webm && <source src={src.webm} type="video/webm" />}
      <source src={src.mp4} type="video/mp4" />
    </video>
  );
}
