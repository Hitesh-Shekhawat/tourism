import { journal } from "./journal";

/** Journal appears in the nav only once there is at least one article (§5.I). */
export const nav = [
  { href: "/destinations", label: "Destinations" },
  { href: "/experiences", label: "Experiences" },
  { href: "/journeys", label: "Journeys" },
  { href: "/story", label: "One Day" },
  { href: "/our-story", label: "Our Story" },
  ...(journal.length ? [{ href: "/journal", label: "Journal" }] : []),
];

export const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/cancellation-policy", label: "Cancellation & Refund Policy" },
];

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://site-url-not-set.invalid").replace(/\/$/, "");
