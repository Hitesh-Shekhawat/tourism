"use client";

import type { ReactNode } from "react";
import type { Interest } from "@/content/explorer";
import { goTo, scrollToAtlas, useExplorer } from "./store";

/**
 * Opens the atlas at a state (and place), then brings the map into view. Used by sections above it.
 * A button, not a #hash link: Lenis takes over hash links site-wide and would race this scroll.
 */
export function ExploreLink({ state, place, interest, className = "", children, label }: { state: string | null; place?: string; interest?: Interest | null; className?: string; children: ReactNode; label?: string }) {
  return (
    <button
      type="button"
      className={`text-left ${className.includes("block") ? "w-full" : ""} ${className}`}
      aria-label={label}
      onClick={() => {
        if (interest !== undefined) useExplorer.getState().set({ interest });
        if (state) goTo(state, place ?? null);
        else useExplorer.getState().set({ started: true });
        scrollToAtlas();
      }}
    >
      {children}
    </button>
  );
}
