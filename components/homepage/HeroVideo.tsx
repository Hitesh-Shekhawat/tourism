"use client";

import { useEffect, useRef, useState } from "react";
import { heroVideo } from "@/content/homepage";
import { useStory } from "@/lib/story/store";

/**
 * Hero footage over the homeHero photo (which stays as the poster and the LCP image). Mounts after
 * first paint, never under reduced motion or Save-Data, with a lighter portrait cut on narrow screens,
 * and pauses while the hero is off screen.
 */
export function HeroVideo() {
  const mode = useStory((s) => s.mode);
  const [src, setSrc] = useState<{ mp4: string; webm?: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!heroVideo.src || mode === "reduced") return setSrc(null);
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    setSrc(narrow && heroVideo.srcMobile ? { mp4: heroVideo.srcMobile } : { mp4: heroVideo.src, webm: heroVideo.srcWebm });
  }, [mode]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
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
    >
      {src.webm && <source src={src.webm} type="video/webm" />}
      <source src={src.mp4} type="video/mp4" />
    </video>
  );
}
