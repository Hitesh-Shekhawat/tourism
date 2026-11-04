"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { Placeholder } from "@/components/ui/Placeholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoPoster } from "@/components/ui/VideoPoster";
import type { LightboxItem } from "@/components/ui/Lightbox";
import { memories, memoriesCopy, type Memory } from "@/content/homepage";
import { canShow } from "@/lib/content-flags";

// The lightbox (and the full-size images in it) load only when a photo is opened
const Lightbox = dynamic(() => import("@/components/ui/Lightbox"), { ssr: false });

const SIZES: Record<Memory["shape"], string> = {
  wide: "(min-width: 1024px) 66vw, 100vw",
  landscape: "(min-width: 1024px) 50vw, 100vw",
  portrait: "(min-width: 1024px) 33vw, 50vw",
  small: "(min-width: 1024px) 25vw, 50vw",
};

/**
 * 05 · Memories we create (feel). An asymmetric masonry composition of real project photos (one
 * featured film slot, portraits, landscapes and a few small overlapping frames), each captioned with
 * its place. Items rise in one by one (fade + 16px, 60ms apart). Photos open in an accessible lightbox.
 * Stand-ins (no real asset yet) are labelled in development and absent from production.
 */
export function Memories({ n }: { n: string }) {
  const items = memories.filter((m) => canShow(m.ready));
  const photos = items.filter((m) => m.ready && m.image) as (Memory & { image: NonNullable<Memory["image"]> })[];
  const lightboxItems: LightboxItem[] = photos.map((m) => ({ image: m.image, caption: m.caption, location: m.location }));
  const [open, setOpen] = useState<number | null>(null);
  if (!items.length) return null;

  // A small frame rides with the photo before it (overlapping its corner), so a masonry column break
  // can never separate the pair or push a small frame to the top of a column on its own
  const groups: { host: Memory; companion?: Memory }[] = [];
  for (const m of items) {
    const last = groups[groups.length - 1];
    if (m.shape === "small" && last && last.host.shape !== "small" && last.host.shape !== "wide" && !last.companion) last.companion = m;
    else groups.push({ host: m });
  }

  const item = (m: Memory) => {
    const photoIndex = photos.findIndex((p) => p.id === m.id);
    return (
      <figure>
        <div className="mem-frame">
          {m.ready && m.video ? (
            <VideoPoster src={m.video.src} poster={m.video.poster} label={m.caption} sizes={SIZES[m.shape]} />
          ) : m.ready && m.image ? (
            <button type="button" className="mem-open group" onClick={() => setOpen(photoIndex)} aria-label={`Open photo: ${m.caption}, ${m.location}`} aria-haspopup="dialog">
              <Photo k={m.image} fill sizes={SIZES[m.shape]} decorative compact imgClassName="mem-img" />
            </button>
          ) : (
            <Placeholder what={m.need ?? "a real photo"} className="absolute inset-0">
              {m.theme}
            </Placeholder>
          )}
        </div>
        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="t-small text-ink">{m.caption}</span>
          <span className="t-label text-ink-muted">
            {m.location}
            {m.guest && " · Guest photo"}
          </span>
        </figcaption>
      </figure>
    );
  };

  return (
    <section id="memories" aria-labelledby="mem-title" className="sec overflow-hidden bg-ivory">
      <div className="wrap">
        <SectionHeading n={n} label={memoriesCopy.label} id="mem-title" title={memoriesCopy.title} note={memoriesCopy.note} />

        <ul className="mem-grid mt-10 lg:mt-14">
          {groups.map((g, i) => (
            <li key={g.host.id} className={`mem mem-${g.host.shape} ${g.companion ? "has-companion" : ""}`} data-reveal style={{ ["--d" as string]: `${(i % 6) * 60}ms` }}>
              {item(g.host)}
              {g.companion && (
                <div className="mem-companion">
                  {item(g.companion)}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {open !== null && <Lightbox items={lightboxItems} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
