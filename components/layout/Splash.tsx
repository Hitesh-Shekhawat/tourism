"use client";

import { useEffect } from "react";
import { business, isPlaceholder } from "@/content/business";
import { canRunGl, computeMode, readPref, useStory } from "@/lib/story/store";

const MIN_MS = 900; // long enough for the arch to draw while the story's 3D builds
const MIN_PLAIN_MS = 1050; // pages without 3D: CSS (html.splash-quick) has lifted it by now; this only tidies the classes up
const MAX_MS = 6000; // never hold the page longer than this

/**
 * Full-screen splash with the centred logo. html.splash is set pre-paint (lib/story/boot.ts); this lifts it
 * once the story's 3D has built, or as soon as the page has hydrated everywhere else (and where WebGL won't run).
 * A CSS fallback hides it after 9s even if this never runs.
 */
export function Splash() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("splash")) return;
    const gl = location.pathname === "/story" && canRunGl(computeMode(readPref()));
    let done = false;
    let out = 0;
    const hide = () => {
      if (done) return;
      done = true;
      // measured from navigation start, so the minimum includes the time the page took to arrive
      out = window.setTimeout(
        () => {
          html.classList.add("splash-out");
          out = window.setTimeout(() => html.classList.remove("splash", "splash-out", "splash-quick"), 600);
        },
        Math.max(0, (gl ? MIN_MS : MIN_PLAIN_MS) - performance.now()),
      );
    };
    const cap = window.setTimeout(hide, MAX_MS);
    let unsub = () => {};
    if (gl) {
      // the opening scene is all the first screen needs; the later scenes keep building behind it
      if (useStory.getState().glOpen) hide();
      else unsub = useStory.subscribe((s) => s.glOpen && hide());
    } else hide(); // this effect runs once the page has hydrated
    return () => {
      clearTimeout(cap);
      unsub();
      if (!done) return;
      // remounted mid-fade (dev strict mode): finish lifting it
      clearTimeout(out);
      html.classList.remove("splash", "splash-out", "splash-quick");
    };
  }, []);

  const name = business.brandName;
  return (
    <div className="splash-screen" aria-hidden="true">
      <div className="splash-mark">
        <svg viewBox="0 0 20 26" className="splash-arch text-brass">
          <path pathLength={1} d="M1 25V10.5C1 5.5 5.5 2.6 10 1c4.5 1.6 9 4.5 9 9.5V25" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <path pathLength={1} d="M5 25v-11c0-2.4 2.2-4 5-5.2 2.8 1.2 5 2.8 5 5.2v11" fill="none" stroke="currentColor" strokeWidth="0.6" />
        </svg>
        {!isPlaceholder(name) && <span className="splash-name font-display text-[1.75rem] leading-none font-semibold tracking-[-0.01em]">{name}</span>}
      </div>
    </div>
  );
}
