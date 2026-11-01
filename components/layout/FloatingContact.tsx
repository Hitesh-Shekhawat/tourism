"use client";

import { useEffect, useState } from "react";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { business } from "@/content/business";
import { whatsappHref } from "@/lib/contact";
import { WhatsAppIcon } from "./icons";

/**
 * Desktop/tablet: "Plan my trip" + a 48px WhatsApp button, bottom right, after 600px of scroll.
 * Mobile: a slim bottom bar, "Plan My Trip" + WhatsApp.
 * Both hide while the drawer is open, while a form ([data-no-float]) is on screen,
 * and while the cookie banner is showing.
 */
export function FloatingContact() {
  const { isOpen, open, page } = useEnquiry();
  const [past, setPast] = useState(false);
  const [nearForm, setNearForm] = useState(false);
  const [banner, setBanner] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
      setNearForm(seen.size > 0);
    });
    const observe = () => document.querySelectorAll("[data-no-float]").forEach((n) => io.observe(n));
    observe();
    const mo = new MutationObserver(() => {
      observe();
      setBanner(!!document.querySelector("[data-consent-banner]"));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setBanner(!!document.querySelector("[data-consent-banner]"));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  const visible = past && !isOpen && !nearForm && !banner;
  const missing = business.whatsappNumber.startsWith("{{") ? business.whatsappNumber : undefined;

  return (
    <>
      <div
        aria-hidden={!visible}
        inert={!visible}
        className={`fixed right-5 bottom-5 z-40 hidden items-center gap-3 transition-[opacity,transform] duration-500 md:flex ${visible ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      >
        <button type="button" aria-haspopup="dialog" className="btn btn-primary min-h-12! px-5! shadow-[0_6px_24px_-8px_rgb(30_26_22/.5)]" onClick={() => open(page.tour ? { tour: page.tour } : undefined)}>
          {page.tour ? "Enquire about this journey" : "Plan my trip"}
        </button>
        <a
          href={whatsappHref(page)}
          target="_blank"
          rel="noopener"
          aria-label="Chat with us on WhatsApp"
          data-missing={missing}
          className="grid size-12 place-items-center rounded-full bg-maroon text-ivory ring-1 ring-ivory/60 shadow-[0_6px_24px_-8px_rgb(30_26_22/.5)] hover:bg-terracotta-deep"
        >
          <WhatsAppIcon size={22} />
        </a>
      </div>

      <div
        aria-hidden={!visible}
        inert={!visible}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-brass/45 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-transform duration-500 md:hidden ${visible ? "" : "translate-y-full"}`}
      >
        <div className="flex items-center gap-2 px-4 py-2">
          <button type="button" className="btn btn-primary min-h-12! flex-1" onClick={() => open(page.tour ? { tour: page.tour } : undefined)}>
            {page.tour ? "Enquire about this journey" : "Plan My Trip"}
          </button>
          <a href={whatsappHref(page)} target="_blank" rel="noopener" aria-label="WhatsApp us" data-missing={missing} className="grid size-12 place-items-center rounded-[2px] border border-ink/70">
            <WhatsAppIcon size={22} />
          </a>
        </div>
      </div>
    </>
  );
}
