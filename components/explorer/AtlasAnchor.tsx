"use client";

import type { ReactNode } from "react";
import type { Interest } from "@/content/explorer";
import { atlasHref } from "@/lib/atlas-href";
import { goTo, scrollToAtlas, useExplorer } from "./store";


/**
 * A real link into the atlas (Tab, Enter, open in a new tab, share). On the home page a plain click
 * moves the atlas in place and glides to it instead of reloading the page.
 */
export function AtlasAnchor({ state, place, interest, className = "", children, label }: { state: string | null; place?: string; interest?: Interest | null; className?: string; children: ReactNode; label?: string }) {
  return (
    <a
      href={atlasHref(state, place, interest)}
      className={className}
      aria-label={label}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !document.getElementById("explore")) return;
        e.preventDefault();
        if (interest !== undefined) useExplorer.getState().set({ interest });
        if (state) goTo(state, place ?? null);
        else useExplorer.getState().set({ started: true });
        scrollToAtlas();
      }}
    >
      {children}
    </a>
  );
}
