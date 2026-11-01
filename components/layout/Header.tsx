"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Wordmark } from "@/components/layout/Wordmark";
import { nav } from "@/content/site";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { Hud } from "@/components/story/Hud";
import { useStory } from "@/lib/story/store";
import { MobileMenu } from "./MobileMenu";

/** Routes that open with a full-bleed dark hero: the header starts transparent with ivory text. */
const overHero = (p: string) => p === "/" || /^\/(destinations|experiences|journeys)\/[^/]+(\/itinerary)?$/.test(p);

/** On the story (also while a sheet is open over it) the HUD replaces the header. */
export function Header() {
  const story = useStory((s) => s.story);
  const pathname = usePathname();
  return story || pathname === "/story" ? <Hud /> : <PageHeader />;
}

function PageHeader() {
  const pathname = usePathname();
  const hero = overHero(pathname);
  const [solid, setSolid] = useState(!hero);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const { isOpen: drawer } = useEnquiry();
  const last = useRef(0);

  useEffect(() => {
    setMenu(false);
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(!hero || y > 80);
      // Hide on scroll down, show on scroll up (desktop only)
      if (desktop.matches && y > 240) setHidden(y > last.current + 2 ? true : y < last.current - 2 ? false : (h) => h);
      else setHidden(false);
      last.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hero, pathname]);

  const light = !solid; // ivory text over the hero
  const current = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,color] duration-500 ease-[var(--ease-out)] ${
          solid ? "border-b border-brass/45 bg-ivory text-ink" : "border-b border-transparent text-ivory"
        } ${hidden && !menu && !drawer ? "-translate-y-full" : ""}`}
      >
        {light && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-ink/45 to-transparent" />}
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
          {/* Accessible name starts with the visible wordmark (WCAG 2.5.3), then says where it goes */}
          <Link href="/" className={`shrink-0 ${light ? "on-dark" : ""}`}>
            <Wordmark />
            <span className="sr-only">, home</span>
          </Link>
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8 xl:gap-10">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className={`link py-2 text-[0.9375rem] font-medium ${current(n.href) ? "link-underlined" : ""}`} aria-current={current(n.href) ? "page" : undefined}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <div className={`hidden sm:block ${light ? "on-dark" : ""}`}>
              <EnquiryButton variant={light ? "secondary" : "primary"} arrow={false} className="min-h-12! px-5!">
                Plan Your Trip
              </EnquiryButton>
            </div>
            <button
              type="button"
              className="grid size-12 place-items-center lg:hidden"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              <svg width="26" height="14" viewBox="0 0 26 14" aria-hidden="true">
                <path d="M0 1h26M8 13h18" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}
