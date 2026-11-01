import type { ReactNode } from "react";
import { archPath } from "@/lib/arch";

/** Rendered once in the root layout: the shared jharokha clipPath. */
export function ArchDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <clipPath id="arch" clipPathUnits="objectBoundingBox">
          <path d={archPath} />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Clips its child into the arch, with an optional brass outline and a scroll reveal (bottom-up mask). */
export function Arch({ children, className = "", outline = true, reveal = true }: { children: ReactNode; className?: string; outline?: boolean; reveal?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <div data-reveal-mask={reveal ? "" : undefined}>
        <div>
          <div style={{ clipPath: "url(#arch)" }}>{children}</div>
        </div>
      </div>
      {outline && (
        <svg className="pointer-events-none absolute -inset-2.5 h-[calc(100%+20px)] w-[calc(100%+20px)] overflow-visible text-brass/70" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
          <path d={archPath} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </div>
  );
}
