import type { ReactNode } from "react";
import { Deva } from "@/components/ui/bits";
import { chapter, chapterDomId, chapterHeadingId, chapters, type ChapterId } from "@/lib/day";

/**
 * One chapter of the day (§6): a <section aria-labelledby> whose heading id comes from day.json.
 * Pinned chapters start with a "Skip this chapter" link (visible on focus) that jumps to the next
 * chapter's heading (§10).
 */
export function Chapter({ id, children, className = "", pinned = false, dark = false }: { id: ChapterId; children: ReactNode; className?: string; pinned?: boolean; dark?: boolean }) {
  const i = chapters.findIndex((c) => c.id === id);
  const next = chapters[i + 1];
  return (
    <section id={chapterDomId(id)} aria-labelledby={chapterHeadingId(id)} data-chapter={id} className={`chapter relative ${dark ? "on-dark" : ""} ${className}`}>
      {pinned && next && (
        <a href={`#${chapterHeadingId(next.id)}`} className="skip-chapter">
          Skip this chapter
        </a>
      )}
      {children}
    </section>
  );
}

/** "03 — The Golden Trail" catalogue line with the chapter's hour and place in both scripts. */
export function ChapterHead({ id, label, className = "" }: { id: ChapterId; label?: string; className?: string }) {
  const c = chapter(id);
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      <span aria-hidden="true" className="serif-italic numerals text-[1.375rem] leading-none text-accent">
        {c.n}
      </span>
      <span aria-hidden="true" className="h-px w-10 bg-brass/70" />
      <span className="t-label text-fg-muted">{label ?? c.title}</span>
      <span aria-hidden="true" className="t-label flex items-center gap-2 text-fg-muted">
        <span className="numerals text-[0.8125rem] tracking-normal normal-case">{c.time}</span>
        <span>·</span>
        <Deva className="text-[0.9375rem] leading-none">{c.placeDeva}</Deva>
      </span>
    </div>
  );
}

export const headingId = chapterHeadingId;
