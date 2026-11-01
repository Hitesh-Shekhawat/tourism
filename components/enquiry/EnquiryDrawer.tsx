"use client";

import { useEffect, useRef, useState } from "react";
import { business } from "@/content/business";
import { Fact } from "@/components/ui/bits";
import { useDialog } from "@/lib/useDialog";
import { EnquiryForm } from "./EnquiryForm";
import { useEnquiry } from "./EnquiryProvider";

/** Right-side sheet on desktop, full screen on mobile. Stays mounted after first open so values persist. */
export default function EnquiryDrawer() {
  const { isOpen, close, prefill, page } = useEnquiry();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useDialog(isOpen, close, panel, closeBtn);
  // On the very first open the drawer mounts already open; defer one frame so it still slides in.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(isOpen)));
    return () => cancelAnimationFrame(r);
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-[80] ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen} inert={!isOpen}>
      <div className={`absolute inset-0 bg-ink/45 transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`} onClick={close} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-title"
        className={`grain absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto overscroll-contain sm:max-w-[560px] sm:border-l sm:hairline transition-transform duration-[600ms] ease-[var(--ease-out)] ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
        data-lenis-prevent
      >
        <div className="flex items-start justify-between gap-6 px-6 pt-6 sm:px-10 sm:pt-9">
          <div>
            <p className="t-label text-ink-muted">Plan your trip</p>
            <h2 id="enquiry-title" className="t-h2 mt-2">
              Tell us about your journey
            </h2>
          </div>
          <button ref={closeBtn} type="button" onClick={close} className="grid size-12 shrink-0 place-items-center rounded-[2px] border border-dune hover:border-ink" aria-label="Close enquiry form">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
        <p className="measure px-6 pt-3 text-ink-muted sm:px-10">
          We reply within <Fact v={business.responseTime} /> with a draft itinerary.
        </p>
        <div className="px-6 pt-8 pb-12 sm:px-10">
          <EnquiryForm prefill={prefill} context={page} onSent={close} idPrefix="drawer" />
        </div>
      </div>
    </div>
  );
}
