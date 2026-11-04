"use client";

import Image from "next/image";
import { useRef } from "react";
import { assets, type AssetKey } from "@/content/assets";
import { imagePositions, imageSources } from "@/content/imageSources";
import { useDialog } from "@/lib/useDialog";

export type LightboxItem = { image: AssetKey; caption: string; location: string };

/**
 * Accessible lightbox (§3 · 05): modal dialog with a focus trap, Esc to close, ← / → keys, swipe on touch,
 * and focus returned to the opening tile. The full-size image only loads once the lightbox is open
 * (this module is itself loaded on demand). Fades in with an 8px rise.
 */
export default function Lightbox({ items, index, onIndex, onClose }: { items: LightboxItem[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  useDialog(true, onClose, panel, closeBtn);
  const item = items[index];
  const src = imageSources[item.image] ?? assets[item.image].src;
  const go = (d: 1 | -1) => onIndex((index + d + items.length) % items.length);

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${items.length}: ${item.caption}`}
      className="lightbox on-dark"
      data-lenis-prevent
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={(e) => {
        const s = swipe.current;
        swipe.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1);
      }}
    >
      <button type="button" className="lightbox-scrim" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <figure className="lightbox-figure">
        <div className="lightbox-media">
          {src ? (
            <Image key={item.image} src={src} alt={assets[item.image].alt} fill sizes="(min-width: 1024px) 80vw, 100vw" className="object-contain" style={{ objectPosition: imagePositions[item.image] ?? "center" }} />
          ) : null}
        </div>
        <figcaption className="lightbox-caption" aria-live="polite">
          <span className="t-label text-dune">{item.location}</span>
          <span className="mt-1 block font-display text-[1.25rem] leading-snug">{item.caption}</span>
          <span className="t-small mt-1 block text-ivory/70 tabular-nums">
            {index + 1} / {items.length}
          </span>
        </figcaption>
      </figure>
      <div className="lightbox-ctls">
        <button type="button" className="htrack-btn" onClick={() => go(-1)} aria-label="Previous photo">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
        <button type="button" className="htrack-btn" onClick={() => go(1)} aria-label="Next photo">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
        <button ref={closeBtn} type="button" className="htrack-btn" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
