import { desertAndDunes } from "./desert-and-dunes";
import { lakesAndForts } from "./lakes-and-forts";
import { theGoldenTrail } from "./the-golden-trail";
import type { Region, Tour, TravelStyle } from "./types";

export type { Region, Tour, TravelStyle };

/** Add a tour: create a file next to these, then list it here. Order = display order. */
export const tours: Tour[] = [theGoldenTrail, lakesAndForts, desertAndDunes];

export const getTour = (slug: string) => tours.find((t) => t.slug === slug);
export const featuredTours = () => tours.filter((t) => t.featured).slice(0, 3);
export const toursThrough = (place: string) => tours.filter((t) => t.route.includes(place));

export const durationBands = [
  { id: "short", label: "Up to 6 days", test: (t: Tour) => t.durationDays <= 6 },
  { id: "week", label: "7–9 days", test: (t: Tour) => t.durationDays >= 7 && t.durationDays <= 9 },
  { id: "long", label: "10 days or more", test: (t: Tour) => t.durationDays >= 10 },
] as const;

export const regions: Region[] = ["Eastern Rajasthan", "Mewar & the lakes", "Marwar & the Thar"];
export const travelStyles: TravelStyle[] = ["First visit", "Heritage & architecture", "Desert & outdoors", "Slow travel", "Family"];
