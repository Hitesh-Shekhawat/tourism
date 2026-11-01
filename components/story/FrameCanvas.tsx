"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { frameUrl, sequences, type SequenceName } from "@/lib/day";
import { drawFrame, fitCanvas, getFrameSet, pickSize, type FrameSet } from "@/lib/frames/player";
import { useStory } from "@/lib/story/store";

export type FrameApi = {
  /** Show frame f (1-based, fractional). `crossfade` blends ⌊f⌋→⌊f⌋+1 by the remainder. */
  set: (f: number, crossfade?: boolean) => void;
  frameSet: () => FrameSet | null;
};

type Props = {
  name: SequenceName;
  /** Index of this chapter in day.json: loading starts one chapter ahead (§5). */
  chapterIndex: number;
  /** First and last frame this placement uses. */
  from?: number;
  to?: number;
  poster?: number;
  /** Alt text for the static poster (reduced motion / no JS). */
  alt: string;
  api?: Ref<FrameApi>;
  className?: string;
  canvasClassName?: string;
  /** Vertical focus of the cover crop (0 top, 1 bottom). */
  focusY?: number;
  priority?: boolean;
  /** Do not render the DOM canvas (a WebGL scene draws the frames instead). */
  hidden?: boolean;
};

/**
 * <FrameSequence>: a 2D canvas drawing one frame of a manifest sequence, with the poster as an
 * <img> underneath (visible until the first frame draws, and the only thing shown in reduced mode
 * or without JS). Redraws only when the frame key changes.
 */
export function FrameCanvas({ name, chapterIndex, from = 1, to, poster, alt, api, className = "", canvasClassName = "", focusY = 0.5, priority, hidden }: Props) {
  const seq = sequences[name];
  const last = to ?? seq.count;
  const posterFrame = poster ?? seq.poster;
  const canvas = useRef<HTMLCanvasElement>(null);
  const setRef = useRef<FrameSet | null>(null);
  const want = useRef<{ f: number; x: boolean }>({ f: from, x: false });
  const key = useRef("");
  const drew = useRef(false);
  const mode = useStory((s) => s.mode);
  const chapter = useStory((s) => s.chapter);
  const active = mode !== "reduced" && !hidden;

  const draw = () => {
    const c = canvas.current;
    const set = setRef.current;
    if (!c || !set) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    key.current = drawFrame(ctx, set, want.current.f, want.current.x, undefined, focusY, key.current);
    if (key.current && !drew.current) {
      drew.current = true;
      c.dataset.ready = "";
    }
  };

  useImperativeHandle(api, () => ({
    set(f, x = false) {
      const clamped = Math.max(from, Math.min(last, f));
      want.current = { f: clamped, x };
      draw();
    },
    frameSet: () => setRef.current,
  }));

  // Attach the frame set; size the canvas; redraw as frames arrive
  useEffect(() => {
    if (!active) return;
    const size = pickSize();
    const set = getFrameSet(name, size);
    setRef.current = set;
    key.current = "";
    const c = canvas.current!;
    fitCanvas(c);
    // A newly decoded frame may be nearer to the wanted one; drawFrame skips the paint if not
    const off = set.on((ev) => ev === "frame" && draw());
    const ro = new ResizeObserver(() => fitCanvas(c) && draw());
    ro.observe(c);
    draw();
    return () => {
      off();
      ro.disconnect();
    };
  }, [active, name]);

  // Load one chapter ahead; on mobile, free the bitmaps when more than 2 viewports away
  useEffect(() => {
    if (!active) return;
    const set = setRef.current;
    if (!set) return;
    if (chapter >= chapterIndex - 1) set.request(1, seq.count);
  }, [active, chapter, chapterIndex, seq.count]);

  useEffect(() => {
    if (!active) return;
    const c = canvas.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        const set = setRef.current;
        if (!set || set.size !== "mobile") return;
        if (!e.isIntersecting) set.release();
        else if (useStory.getState().chapter >= chapterIndex - 1) set.request(1, seq.count);
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(c);
    return () => io.disconnect();
  }, [active, chapterIndex, seq.count]);

  const desktopPoster = frameUrl(seq, "desktop", posterFrame);
  const mobilePoster = frameUrl(seq, "mobile", posterFrame);

  return (
    <div className={`frame-seq ${className}`}>
      <picture>
        <source media="(orientation: portrait)" srcSet={mobilePoster} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={desktopPoster} alt={alt} className="frame-poster" style={{ objectPosition: `50% ${focusY * 100}%` }} fetchPriority={priority ? "high" : undefined} loading={priority ? "eager" : "lazy"} decoding="async" />
      </picture>
      {active && <canvas ref={canvas} aria-hidden="true" className={`frame-canvas ${canvasClassName}`} />}
    </div>
  );
}
