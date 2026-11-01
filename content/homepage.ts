import type { AssetKey } from "./assets";
import { reviews } from "./home";
import type { Tour } from "./tours/types";

/*
 * Copy and data for the home page (v4). Editorial copy only: every business fact (services offered,
 * prices, guest stories) is gated, so nothing renders as true until the owner confirms it.
 */

/**
 * Hero footage. Leave src empty until the owner supplies a clip (ASSET_BRIEF.md, homeHero): the
 * hero then shows the homeHero photo of Lake Pichola at dawn. Use a 10–20 s loop, H.264 MP4 (and optionally WebM), ≤ 6 MB
 * desktop and ≤ 2.5 MB for the 720p portrait mobile cut; the homeHero photo is its poster.
 */
export const heroVideo: { src?: string; srcWebm?: string; srcMobile?: string } = {};

export const featured = {
  label: "Featured journeys",
  title: "Routes worth taking slowly.",
  note: "Each one is private, and each one can be changed: the pace, the route, the stays.",
};

export const discover = {
  label: "Destinations & experiences",
  title: "Palaces, lakes and a very large sky.",
  note: "Six cities, each with its own colour and hour, and the small moments between them.",
  experiencesTitle: "Moments to build a day around",
};

export type ServiceIcon = "plan" | "hotel" | "car" | "plane" | "guide" | "dune" | "group" | "phone";

/**
 * What the company actually provides. `offered: null` = not yet confirmed by the owner: the card shows
 * a visible placeholder (and the production build fails) until it is set to true, or false to hide it.
 */
export const services: { id: string; title: string; text: string; icon: ServiceIcon; offered: boolean | null }[] = [
  { id: "planning", title: "Customised tour planning", text: "A route, pace and stays built from your dates and interests, then refined with you until it fits.", icon: "plan", offered: null },
  { id: "hotels", title: "Hotel & resort reservations", text: "Heritage havelis, palace hotels and quiet resorts, booked and confirmed before you arrive.", icon: "hotel", offered: null },
  { id: "transport", title: "Private transportation", text: "Your own air-conditioned car and driver for the whole journey, never shared.", icon: "car", offered: null },
  { id: "airport", title: "Airport transfers", text: "Met on arrival and taken to the airport or station at the end, whatever the hour.", icon: "plane", offered: null },
  { id: "guides", title: "Professional tour guides", text: "Licensed local guides at the forts, palaces and old cities, booked for the times that suit you.", icon: "guide", offered: null },
  { id: "desert", title: "Desert safari & activities", text: "Camel rides, dune camps and village visits in the Thar, arranged around sunset.", icon: "dune", offered: null },
  { id: "groups", title: "Group & family packages", text: "Journeys paced for children, grandparents or a group of friends, with rooms and vehicles to match.", icon: "group", offered: null },
  { id: "support", title: "24/7 travel assistance", text: "A real person to call or message at any hour while you are on the road.", icon: "phone", offered: null },
];

export const whyUs = {
  label: "Why travel with us",
  title: "Everything arranged, nothing rushed.",
  note: "One team plans the route, books the stays and stays with you on the road.",
};

/** Package categories. Each shows the published journeys that fit it; with none, an owner placeholder. */
export const packageCategories: { id: string; title: string; blurb: string; image: AssetKey; fits: (t: Tour) => boolean }[] = [
  { id: "weekend", title: "Weekend getaways", blurb: "Two to four days from Jaipur or Udaipur: one city, done properly.", image: "pkgWeekend", fits: (t) => t.durationDays <= 4 },
  { id: "family", title: "Family holidays", blurb: "Shorter drives, flexible days and rooms that work for everyone.", image: "pkgFamily", fits: (t) => t.styles.includes("Family") || t.idealFor.includes("Families") },
  { id: "couples", title: "Couple & honeymoon", blurb: "Lakes, rooftops and slow evenings, with time kept free.", image: "pkgCouple", fits: (t) => t.idealFor.includes("Couples") },
  { id: "luxury", title: "Luxury Rajasthan", blurb: "Palace hotels and private everything, from the first transfer to the last.", image: "pkgLuxury", fits: (t) => /luxury|palace/i.test(t.hotelCategory ?? "") },
  { id: "heritage", title: "Cultural & heritage", blurb: "Forts, havelis, craft villages and the stories behind them.", image: "pkgHeritage", fits: (t) => t.styles.includes("Heritage & architecture") },
  { id: "desert", title: "Adventure & desert", blurb: "The Thar by camel and jeep, and a night under its stars.", image: "pkgDesert", fits: (t) => t.styles.includes("Desert & outdoors") },
];

export const packagesCopy = {
  label: "Tour packages",
  title: "Find the journey that fits.",
  note: "Every package is a starting point. Tell us what to change and we'll rebuild it around you.",
};

/**
 * Guest video stories: real guests only, with written permission to show their name, face and words.
 * Leave empty until there are some; the section stays hidden while this and `reviews` (home.ts) are empty.
 */
export type TravellerStory = {
  name: string;
  origin?: string;
  destination: string;
  excerpt: string;
  video?: { src: string; poster: AssetKey; orientation: "portrait" | "landscape" };
  photo?: AssetKey;
  permission: true;
};
export const travellerStories: TravellerStory[] = [];

/** The stories section (and its number in the sequence) only exists once there is something real to show. */
export const hasStories = travellerStories.length > 0 || reviews.length > 0;
const n = (k: number) => String(hasStories ? k : k - 1).padStart(2, "0");
export const sectionNo = { gallery: n(7), closing: n(8) };

export const storiesCopy = {
  label: "Traveller stories",
  title: "In their own words.",
};

export const gallery = {
  label: "Gallery",
  title: "Rajasthan, frame by frame.",
  items: ["galAerial", "galFortGate", "galPalace", "galCamp", "galCamel", "galStreet", "galLakeHotel", "galCulture"] satisfies AssetKey[] as AssetKey[],
};

export const closing = {
  title: "Your Rajasthan Story Starts Here.",
  text: "Discover royal heritage, unforgettable landscapes, and experiences designed around your journey.",
};
