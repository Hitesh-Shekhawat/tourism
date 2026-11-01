"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { useStory } from "@/lib/story/store";
import { useDialog } from "@/lib/useDialog";

/**
 * A full-screen sheet over the story (§7), rendered by the intercepting routes in app/@sheet.
 * Desktop: 92vh with the story dimmed behind it; mobile: full screen. Lenis pauses and the story's
 * scroll position is kept (useDialog's scroll lock). Esc, the close button, the backdrop or the
 * browser's back button close it; focus returns to the link that opened it.
 */
export function Sheet({ children, label, slug }: { children: ReactNode; label: string; slug: string }) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  const close = () => router.back();
  useDialog(true, close, panel, closeBtn);

  // The story stays mounted underneath: drop the source image's transition name before the new snapshot, so names stay unique
  useLayoutEffect(() => {
    document.querySelectorAll<HTMLElement>("main [data-vt]").forEach((el) => (el.style.viewTransitionName = ""));
  }, []);

  useEffect(() => {
    useStory.getState().set({ sheet: true });
    track("sheet_open", { slug });
    const r = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(r);
      useStory.getState().set({ sheet: false });
    };
  }, [slug]);

  return (
    <div className="sheet fixed inset-0 z-[75]">
      <div className={`absolute inset-0 bg-ink/55 transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`} onClick={close} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`sheet-panel absolute inset-x-0 bottom-0 h-full overflow-y-auto overscroll-contain bg-ivory text-ink transition-transform duration-[650ms] ease-[var(--ease-out)] lg:h-[92vh] lg:border-t lg:border-brass/60 ${shown ? "translate-y-0" : "translate-y-full"}`}
        data-lenis-prevent
      >
        <div className="pointer-events-none sticky top-0 z-20 flex h-0 justify-end">
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            className="pointer-events-auto mt-4 mr-4 grid size-12 place-items-center rounded-[2px] border border-brass/60 bg-ivory/95 text-ink hover:border-ink lg:mt-6 lg:mr-6"
            aria-label={`Close ${label}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
