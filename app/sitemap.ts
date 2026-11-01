import type { MetadataRoute } from "next";
import { destinations } from "@/content/destinations";
import { experiences } from "@/content/experiences";
import { journal } from "@/content/journal";
import { tours } from "@/content/tours";
import { abs } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/story", "/destinations", "/experiences", "/journeys", "/our-story", "/contact", "/privacy", "/terms", "/cancellation-policy", "/credits"];
  return [
    ...pages.map((p) => ({ url: abs(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.6 })),
    ...tours.map((t) => ({ url: abs(`/journeys/${t.slug}`), changeFrequency: "monthly" as const, priority: 0.9 })),
    ...destinations.map((d) => ({ url: abs(`/destinations/${d.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...experiences.map((e) => ({ url: abs(`/experiences/${e.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...(journal.length ? [{ url: abs("/journal") }, ...journal.map((a) => ({ url: abs(`/journal/${a.slug}`), lastModified: a.date }))] : []),
  ];
}
