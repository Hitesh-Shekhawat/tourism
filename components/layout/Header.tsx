"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Wordmark } from "@/components/layout/Wordmark";
import { mainNav, type NavItem } from "@/content/site";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { Hud } from "@/components/story/Hud";
import { useStory } from "@/lib/story/store";
import { MobileMenu } from "./MobileMenu";

/** Routes that open with a full-bleed dark hero: the header starts transparent with ivory text. */
const overHero = (p: string) => p === "/" || /^\/(destinations|experiences|journeys|explore)\/[^/]+(\/itinerary)?$/.test(p);

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
  const [dropdown, setDropdown] = useState<string | null>(null);
  const { isOpen: drawer } = useEnquiry();
  const last = useRef(0);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenu(false);
    setDropdown(null);
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

  // Close an open dropdown on Escape (focus back to its toggle) or on a press outside the nav
  useEffect(() => {
    if (!dropdown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      navRef.current?.querySelector<HTMLButtonElement>(`[data-dd-toggle="${dropdown}"]`)?.focus();
      setDropdown(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setDropdown(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [dropdown]);

  // An open dropdown keeps the bar solid and in view
  const isSolid = solid || dropdown !== null;
  const light = !isSolid; // ivory text over the hero
  const current = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <>
      <header
        className={`site-header fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,color] duration-500 ease-[var(--ease-out)] ${
          isSolid ? "border-b border-brass/40 bg-ivory/95 text-ink backdrop-blur-md" : "border-b border-transparent text-ivory"
        } ${hidden && !menu && !drawer && !dropdown ? "-translate-y-full" : ""}`}
      >
        {light && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-ink/50 to-transparent" />}
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
          {/* Accessible name starts with the visible wordmark (WCAG 2.5.3), then says where it goes */}
          <Link href="/" className={`shrink-0 ${light ? "on-dark" : ""}`}>
            <Wordmark />
            <span className="sr-only">, home</span>
          </Link>
          <nav ref={navRef} aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-7 2xl:gap-9">
              {mainNav.map((n) => (
                <NavEntry key={n.href + n.label} item={n} current={current(n.href)} open={dropdown === n.label} setOpen={(v) => setDropdown(v ? n.label : null)} />
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
              className="grid size-12 place-items-center xl:hidden"
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

/**
 * A top-level link; with children it also gets a disclosure button (aria-expanded) that opens a panel
 * of links. Pointer hover opens it too, on devices that can hover. The top-level link always navigates.
 */
function NavEntry({ item, current, open, setOpen }: { item: NavItem; current: boolean; open: boolean; setOpen: (v: boolean) => void }) {
  const id = `dd-${item.label.toLowerCase().replace(/\W+/g, "-")}`;
  const hoverable = () => window.matchMedia("(hover: hover)").matches;
  const linkCls = `link py-2 text-[0.9375rem] font-medium ${current ? "link-underlined" : ""}`;
  if (!item.children) {
    return (
      <li>
        <Link href={item.href} className={linkCls} aria-current={current ? "page" : undefined}>
          {item.label}
        </Link>
      </li>
    );
  }
  return (
    <li
      className="relative"
      onMouseEnter={() => hoverable() && setOpen(true)}
      onMouseLeave={() => hoverable() && setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <span className="flex items-center gap-1">
        <Link href={item.href} className={linkCls} aria-current={current ? "page" : undefined}>
          {item.label}
        </Link>
        <button
          type="button"
          data-dd-toggle={item.label}
          className="grid size-7 place-items-center"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${item.label} menu`}
          onClick={() => setOpen(!open)}
        >
          <svg className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" />
          </svg>
        </button>
      </span>
      <div id={id} className={`nav-dd ${open ? "is-open" : ""}`} hidden={!open}>
        <ul className="nav-dd-list">
          {item.children.map((c, i) => {
            const last = i === item.children!.length - 1;
            return (
              <li key={c.href + c.label} className={last ? "nav-dd-all" : ""}>
                <Link href={c.href} className="nav-dd-link" onClick={() => setOpen(false)}>
                  <span className="nav-dd-label">{c.label}</span>
                  {c.note && <span className="nav-dd-note">{c.note}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}
