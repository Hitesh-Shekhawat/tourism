"use client";

import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";
import { Deva, Fact } from "@/components/ui/bits";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { Wordmark } from "@/components/layout/Wordmark";
import { business } from "@/content/business";
import { nav } from "@/content/site";
import { mailHref, telHref, whatsappHref } from "@/lib/contact";
import { useDialog } from "@/lib/useDialog";
import { WhatsAppIcon } from "./icons";

/** Full-screen ivory sheet with large serif links, contact options and the WhatsApp CTA. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const { open: openEnquiry, page } = useEnquiry();
  useDialog(open, onClose, panel);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(open));
    return () => cancelAnimationFrame(r);
  }, [open]);
  const tel = telHref();
  const mail = mailHref();

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className={`grain fixed inset-0 z-[70] flex flex-col overflow-y-auto text-ink transition-[opacity,visibility] duration-500 lg:hidden ${shown ? "visible opacity-100" : "invisible opacity-0"}`}
      data-lenis-prevent
    >
      <div className="wrap flex h-[var(--header-h)] shrink-0 items-center justify-between">
        <Wordmark />
        <button type="button" onClick={onClose} className="grid size-12 place-items-center" aria-label="Close menu">
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
      </div>
      <nav aria-label="Mobile" className="wrap flex-1 pt-6">
        <ul className="border-t border-brass/45">
          {[{ href: "/", label: "Home" }, ...nav, { href: "/contact", label: "Contact" }].map((n, i) => (
            <li key={n.href} className="border-b border-brass/45">
              <Link href={n.href} onClick={onClose} className="flex items-baseline justify-between py-4 font-display text-[2.25rem] leading-tight">
                {n.label}
                <span aria-hidden="true" className="serif-italic text-base text-brass-text">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Deva className="mt-6 block text-xl text-ink-muted">राजस्थान</Deva>
      </nav>
      <div className="wrap shrink-0 space-y-5 pt-8 pb-10">
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={() => {
            onClose();
            openEnquiry();
          }}
        >
          Plan My Trip
        </button>
        <a className="btn btn-secondary w-full" href={whatsappHref(page)} target="_blank" rel="noopener" data-missing={business.whatsappNumber.startsWith("{{") ? business.whatsappNumber : undefined}>
          <WhatsAppIcon /> WhatsApp us
        </a>
        <div className="t-small flex flex-col gap-1 text-ink-muted">
          {tel ? <a href={tel} className="link w-fit py-1">{business.phone}</a> : <Fact v={business.phone} />}
          {mail ? <a href={mail} className="link w-fit py-1">{business.email}</a> : <Fact v={business.email} />}
          <Fact v={business.officeHours} />
        </div>
      </div>
    </div>
  );
}
