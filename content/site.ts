import { canShow } from "@/lib/content-flags";
import { experiences } from "./experiences";
import { places, placeLinks } from "./explorer";
import { itineraries } from "./itineraries";
import { royalCities } from "./homepage";
import { journal } from "./journal";
import { tours } from "./tours";

export type NavLink = { href: string; label: string; note?: string };
export type NavItem = NavLink & { children?: NavLink[] };

/** Where a place leads from navigation: its destination page, else its card on the home page. */
export const placeHref = (id: string) => {
  const p = places.find((x) => x.id === id);
  return (p && placeLinks(p).destination) ?? `/#dest-${id}`;
};

/** "Travel Guide" is the journal once it has articles; until then, the One Day in Rajasthan story. */
const guideHref = journal.length ? "/journal" : "/story";

/**
 * Main navigation (brief §6). Dropdowns list real pages only: draft journeys appear in development
 * and are left out of production builds, exactly as on the journeys pages.
 */
export const mainNav: NavItem[] = [
  { href: "/", label: "Home" },
  {
    href: "/destinations",
    label: "Destinations",
    children: [
      ...royalCities.cities.map((c) => ({ href: placeHref(c.id), label: places.find((x) => x.id === c.id)!.name, note: c.epithet })),
      { href: "/destinations", label: "All destinations" },
    ],
  },
  {
    href: "/journeys",
    label: "Tour Packages",
    children: [
      ...itineraries.map((i) => ({ href: `/destinations/${i.slug}/itinerary`, label: i.title, note: i.duration.label })),
      ...tours.filter((t) => canShow(!t.draft)).map((t) => ({ href: `/journeys/${t.slug}`, label: t.title, note: `${t.durationDays} days · ${t.route.join(", ")}` })),
      { href: "/journeys", label: "All journeys" },
    ],
  },
  {
    href: "/experiences",
    label: "Experiences",
    children: [...experiences.map((e) => ({ href: `/experiences/${e.slug}`, label: e.title, note: e.where })), { href: "/experiences", label: "All experiences" }],
  },
  { href: "/our-story", label: "About Us" },
  { href: guideHref, label: "Travel Guide" },
  { href: "/contact", label: "Contact" },
];

/** Flat list (kept for any caller that wants top-level links only). */
export const nav = mainNav.filter((n) => n.href !== "/").map(({ href, label }) => ({ href, label }));

export const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/cancellation-policy", label: "Cancellation & Refund Policy" },
];

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://site-url-not-set.invalid").replace(/\/$/, "");
