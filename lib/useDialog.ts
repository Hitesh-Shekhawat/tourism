"use client";

import { useEffect, useRef, type RefObject } from "react";
import { lockScroll } from "./smooth";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Modal dialog behaviour (§12): focus trap, Esc to close, scroll lock, focus returns to the trigger. */
export function useDialog(open: boolean, onClose: () => void, panel: RefObject<HTMLElement | null>, initialFocus?: RefObject<HTMLElement | null>) {
  const returnTo = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    lockScroll(true);
    const el = panel.current;
    const first = initialFocus?.current ?? el?.querySelector<HTMLElement>(FOCUSABLE);
    requestAnimationFrame(() => (first ?? el)?.focus({ preventScroll: true }));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null || n === document.activeElement);
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === a || !el.contains(document.activeElement))) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      const t = returnTo.current;
      if (t && document.contains(t)) t.focus({ preventScroll: true });
    };
  }, [open, panel, initialFocus]);
}
