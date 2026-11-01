"use client";

import { useSearchParams } from "next/navigation";

export function Reference() {
  const ref = useSearchParams().get("ref");
  if (!ref || !/^ENQ-\d{6}-[A-Z0-9]{5}$/.test(ref)) return null;
  return (
    <p className="mt-8 inline-flex flex-wrap items-baseline gap-3 border border-brass/60 px-5 py-3">
      <span className="t-label text-ink-muted">Your reference</span>
      <span className="tabular font-display text-[1.5rem] tracking-wide">{ref}</span>
    </p>
  );
}
