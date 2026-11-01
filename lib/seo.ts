import type { Metadata } from "next";
import { business, isPlaceholder } from "@/content/business";
import type { Destination } from "@/content/destinations";
import type { Itinerary } from "@/content/itineraries";
import { siteUrl } from "@/content/site";
import type { Tour } from "@/content/tours";

export const abs = (path: string) => `${siteUrl}${path}`;

/** Per-route metadata: unique title (≤ 60) and description (≤ 155), canonical, OG + Twitter. */
export function pageMeta({ title, description, path, ogImage }: { title: string; description: string; path: string; ogImage?: string }): Metadata {
  const images = ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", siteName: business.brandName, locale: "en_IN", ...(images && { images }) },
    twitter: { card: "summary_large_image", title, description, ...(images && { images: images.map((i) => i.url) }) },
  };
}

export function travelAgencyLd() {
  const a = business.address;
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": abs("/#agency"),
    name: business.brandName,
    url: abs("/"),
    telephone: business.phone,
    email: business.email,
    address: { "@type": "PostalAddress", streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postalCode, addressCountry: a.country },
    ...(business.openingHoursSchema.length && { openingHours: business.openingHoursSchema }),
    ...(!isPlaceholder(business.googleMapsUrl) && { hasMap: business.googleMapsUrl }),
    areaServed: { "@type": "State", name: "Rajasthan" },
    sameAs: Object.values(business.social).filter(Boolean),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function touristTripLd(t: Tour) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: t.title,
    description: t.summary,
    url: abs(`/journeys/${t.slug}`),
    touristType: t.idealFor,
    provider: { "@id": abs("/#agency") },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: t.itinerary.length,
      itemListElement: t.itinerary.map((d) => ({ "@type": "ListItem", position: d.day, item: { "@type": "TouristAttraction", name: `Day ${d.day}: ${d.title}`, description: d.description } })),
    },
    ...(t.priceFromINR && {
      offers: { "@type": "Offer", price: t.priceFromINR, priceCurrency: "INR", description: t.priceBasis ?? "per person", url: abs(`/journeys/${t.slug}`) },
    }),
  };
}

export function itineraryLd(it: Itinerary) {
  const url = abs(`/destinations/${it.slug}/itinerary`);
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: `${it.title}: a ${it.name} itinerary`,
    description: it.lede,
    url,
    provider: { "@id": abs("/#agency") },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: it.days.length,
      itemListElement: it.days.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristAttraction", name: `Day ${i + 1}: ${d.title}`, description: d.summary } })),
    },
  };
}

export function touristDestinationLd(d: Destination) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: d.name,
    description: d.descriptor,
    url: abs(`/destinations/${d.slug}`),
    geo: { "@type": "GeoCoordinates", latitude: d.coords[1], longitude: d.coords[0] },
    containedInPlace: { "@type": "State", name: "Rajasthan" },
  };
}

export function faqLd(faqs: { q: string; a: string | null }[]) {
  const answered = faqs.filter((f) => f.a);
  if (!answered.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: answered.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
