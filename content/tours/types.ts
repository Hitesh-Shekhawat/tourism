import type { AssetKey } from "../assets";

export type Region = "Eastern Rajasthan" | "Mewar & the lakes" | "Marwar & the Thar";
export type TravelStyle = "First visit" | "Heritage & architecture" | "Desert & outdoors" | "Slow travel" | "Family";

export type Tour = {
  slug: string;
  title: string;
  summary: string;
  durationNights: number;
  durationDays: number;
  route: string[];
  bestSeason: string;
  idealFor: string[];
  regions: Region[];
  styles: TravelStyle[];
  heroImage: AssetKey;
  gallery: AssetKey[];
  itinerary: { day: number; title: string; description: string; overnight?: string }[];
  /** Business facts: what the price covers. */
  inclusions: string[];
  exclusions: string[];
  /** Only if confirmed, e.g. "Heritage hotels and boutique havelis". */
  hotelCategory?: string;
  /** Only if the owner supplies it. Otherwise the site shows "Price on request". */
  priceFromINR?: number;
  priceBasis?: string;
  featured: boolean;
  /**
   * true = sample structure written for the template, not a real product. Renders a visible
   * "Owner to supply" notice, which fails the production build until the owner confirms the tour
   * (set draft: false) or deletes it.
   */
  draft: boolean;
  faqs?: { q: string; a: string }[];
  seo: { title: string; description: string };
};
