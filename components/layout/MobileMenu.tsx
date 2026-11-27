"use client";

import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";
import { Deva, Fact } from "@/components/ui/bits";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { Wordmark } from "@/components/layout/Wordmark";
import { business } from "@/content/business";
import { mainNav } from "@/content/site";
import { hasWhatsApp, mailHref, telHref, whatsappHref } from "@/lib/contact";
import { useDialog } from "@/lib/useDialog";
import { WhatsAppIcon } from "./icons";

/** Full-screen ivory sheet with large serif links, contact options and the WhatsApp CTA. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const { open: openEnquiry, page } = useEnquiry();
  useDialog(open, onClose, panel);
  const [shown, setShown] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
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
      className={`grain fixed inset-0 z-[70] flex flex-col overflow-y-auto text-ink transition-[opacity,visibility] duration-500 xl:hidden ${shown ? "visible opacity-100" : "invisible opacity-0"}`}
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
          {mainNav.map((n, i) => (
            <li key={n.href + n.label} className="border-b border-brass/45">
              <div className="flex items-center justify-between gap-3">
                <Link href={n.href} onClick={onClose} className="flex flex-1 items-baseline gap-4 py-3.5 font-display text-[2rem] leading-tight">
                  <span aria-hidden="true" className="serif-italic w-7 text-base text-brass-text">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {n.label}
                </Link>
                {n.children && (
                  <button type="button" className="grid size-12 place-items-center" aria-expanded={group === n.label} aria-controls={`mm-${i}`} aria-label={`${n.label}: show links`} onClick={() => setGroup(group === n.label ? null : n.label)}>
                    <svg className={`transition-transform duration-200 ${group === n.label ? "rotate-45" : ""}`} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  </button>
                )}
              </div>
              {n.children && (
                <ul id={`mm-${i}`} hidden={group !== n.label} className="grid gap-x-6 pb-5 pl-11 sm:grid-cols-2">
                  {n.children.map((c) => (
                    <li key={c.href + c.label}>
                      <Link href={c.href} onClick={onClose} className="flex min-h-11 flex-col justify-center py-1">
                        <span className="text-[1rem] font-medium">{c.label}</span>
                        {c.note && <span className="t-small text-ink-muted">{c.note}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
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
        {hasWhatsApp() && (
          <a className="btn btn-secondary w-full" href={whatsappHref(page)} target="_blank" rel="noopener">
            <WhatsAppIcon /> WhatsApp us
          </a>
        )}
        <div className="t-small flex flex-col gap-1 text-ink-muted">
          {tel ? <a href={tel} className="link w-fit py-1">{business.phone}</a> : <Fact v={business.phone} />}
          {mail ? <a href={mail} className="link w-fit py-1">{business.email}</a> : <Fact v={business.email} />}
          <Fact v={business.officeHours} />
        </div>
      </div>
    </div>
  );
}
