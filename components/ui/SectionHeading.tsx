import type { ReactNode } from "react";
import { SectionHead } from "./bits";

/**
 * The homepage's section opening: catalogue number + label, the h2 (revealed through a clip mask),
 * and an optional one-line note. Every homepage section uses it, so the rhythm stays identical.
 */
export function SectionHeading({ n, label, title, id, note, dark = false, className = "", titleClass = "max-w-[16ch]", aside }: { n: string; label: string; title: ReactNode; id: string; note?: ReactNode; dark?: boolean; className?: string; titleClass?: string; aside?: ReactNode }) {
  return (
    <div className={`grid gap-6 lg:grid-cols-12 lg:items-end ${className}`}>
      <div className="lg:col-span-7">
        <SectionHead n={n} label={label} dark={dark} />
        <h2 id={id} className={`t-h1 mt-5 ${titleClass}`}>
          <span className="mask-line" data-reveal-mask>
            <span>{title}</span>
          </span>
        </h2>
      </div>
      {(note || aside) && (
        <div className="lg:col-span-4 lg:col-start-9">
          {note && (
            <p className={`measure ${dark ? "text-ivory/85" : "text-ink-muted"}`} data-reveal>
              {note}
            </p>
          )}
          {aside}
        </div>
      )}
    </div>
  );
}
