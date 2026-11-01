import type { Tour } from "./types";

export const desertAndDunes: Tour = {
  slug: "desert-and-dunes",
  title: "Desert & Dunes",
  summary: "Into the Thar: Jodhpur's fort, Jaisalmer's golden walls and Bikaner's painted rooms.",
  durationNights: 5,
  durationDays: 6,
  route: ["Jodhpur", "Jaisalmer", "Bikaner"],
  bestSeason: "November to February",
  idealFor: ["Second visits", "Photographers", "Couples"],
  regions: ["Marwar & the Thar"],
  styles: ["Desert & outdoors", "Slow travel"],
  heroImage: "tourDesert",
  gallery: ["tourDesertG1", "tourDesertG2"],
  itinerary: [
    { day: 1, title: "Jodhpur: arrival", description: "Met on arrival. Evening walk to the clock tower.", overnight: "Jodhpur" },
    { day: 2, title: "Jodhpur to Jaisalmer", description: "Mehrangarh in the morning, then west into the desert.", overnight: "Jaisalmer" },
    { day: 3, title: "Jaisalmer: the living fort", description: "The fort's lanes and temples, then the havelis below.", overnight: "Jaisalmer" },
    { day: 4, title: "The dunes", description: "Out to the dunes for sunset and a night in the desert.", overnight: "Desert camp" },
    { day: 5, title: "Jaisalmer to Bikaner", description: "North-east through the Thar to Bikaner. The old city in the evening.", overnight: "Bikaner" },
    { day: 6, title: "Bikaner: Junagarh and departure", description: "Junagarh's painted rooms in the morning, then your onward journey." },
  ],
  inclusions: ["Private air-conditioned car and driver throughout", "Five nights' accommodation with breakfast, including one night in a desert camp", "On-trip support by phone and WhatsApp"],
  exclusions: ["Flights and trains", "Monument entry fees", "Meals not stated", "Tips and personal expenses"],
  featured: true,
  draft: true,
  seo: { title: "Desert & Dunes: 6 days in the Thar", description: "Jodhpur, Jaisalmer and Bikaner, with a night in the dunes. A private journey into the Thar." },
};
