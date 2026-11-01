import type { ReactNode } from "react";
import { isPlaceholder } from "@/content/business";

/** Small Devanagari accent beside an English place name. Decorative: hidden from screen readers. */
export function Deva({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span lang="hi" aria-hidden="true" className={`font-deva ${className}`}>
      {children}
    </span>
  );
}

/** Museum-catalogue section number: "01 — Destinations" with a brass rule. */
export function SectionHead({ n, label, dark = false, className = "" }: { n: string; label: string; dark?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span aria-hidden="true" className={`serif-italic text-[1.375rem] leading-none tabular ${dark ? "text-dune" : "text-brass-text"}`}>
        {n}
      </span>
      <span aria-hidden="true" className="h-px w-10 bg-brass/70" />
      <span className={`t-label ${dark ? "text-ivory/85" : "text-ink-muted"}`}>{label}</span>
    </div>
  );
}

export const Arrow = ({ className = "" }: { className?: string }) => (
  <svg className={`arrow shrink-0 ${className}`} width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

export const Check = ({ className = "" }: { className?: string }) => (
  <svg className={`shrink-0 ${className}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 7.5l3 3 7-7" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/** The Golden Trail motif as a small divider: a hand-drawn route with three stops. */
export function TrailDivider({ className = "" }: { className?: string }) {
  return (
    <svg className={`text-brass ${className}`} width="132" height="18" viewBox="0 0 132 18" fill="none" aria-hidden="true">
      <path d="M4 12c14-9 26 4 40-2s22-8 36-2 30 7 48-3" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" strokeLinecap="round" />
      <circle cx="4" cy="12" r="2.5" fill="currentColor" />
      <circle cx="66" cy="8.4" r="2.5" fill="currentColor" />
      <circle cx="128" cy="5" r="2.5" fill="currentColor" />
    </svg>
  );
}

/**
 * A business fact. While it is still a {{placeholder}}, it renders as a visible dashed chip
 * (and the production build refuses to ship it).
 */
export function Fact({ v, className = "" }: { v: string; className?: string }) {
  return isPlaceholder(v) ? <span className={`ph-inline ${className}`}>{v}</span> : <span className={className}>{v}</span>;
}

/** Turns "{{…}}" fragments inside editorial copy into visible placeholder chips. */
export function Copy({ text }: { text: string }) {
  const parts = text.split(/(\{\{[^}]*\}\})/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("{{") ? (
          <span key={i} className="ph-inline">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** Block placeholder: "Owner to supply: …" (§4). */
export function OwnerBlock({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`ph ${className}`}>
      <span className="t-label mb-1 block">Owner to supply</span>
      {children}
    </div>
  );
}
