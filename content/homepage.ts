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

export type ServiceIcon = "plan" | "hotel" | "car" | "plane" | "guide" | "dune" | "group" | "phone" | "route" | "lamp";

/**
 * Why travel with us (§08 of the enhancement brief): at most six points, each a claim the business must
 * confirm. `offered: null` = not yet confirmed: it renders with a labelled placeholder in development and
 * is left out of production builds. Set true once it is true for this business, or false to drop it.
 * No rankings, no "best", no numbers that can't be sourced.
 */
export const services: { id: string; title: string; text: string; icon: ServiceIcon; offered: boolean | null }[] = [
  { id: "curated", title: "Curated itineraries", text: "Routes drawn up for the season and the distances involved, with time left in each place rather than a city a day.", icon: "route", offered: null },
  { id: "local", title: "Local Rajasthan expertise", text: "Planned by people who know the state's roads, opening hours and quiet corners first-hand.", icon: "guide", offered: null },
  { id: "personal", title: "Personalised journeys", text: "Your dates, your pace and your interests set the plan, and we refine it with you until it fits.", icon: "plan", offered: null },
  { id: "comfort", title: "Comfortable arrangements", text: "Stays, a private car and driver, and transfers arranged and confirmed before you arrive.", icon: "hotel", offered: null },
  { id: "culture", title: "Authentic cultural experiences", text: "Craft workshops, village visits, music and food, arranged with the people who keep them alive.", icon: "lamp", offered: null },
  { id: "assist", title: "Dedicated assistance", text: "One named person to call or message while you are on the road.", icon: "phone", offered: null },
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
export const sectionNo = { gallery: n(8), closing: n(9) };

/**
 * 05 · Memories we create. Real project photos only, each with a caption and a location label.
 * `guest: true` only for photos the business holds of its own guests, with written permission.
 * Items with `ready: false` are stand-ins: labelled in development, left out of production builds,
 * and listed in docs/content-gaps.md. Never generate or fake guest imagery.
 */
export type Memory = {
  id: string;
  theme: string;
  caption: string;
  location: string;
  shape: "portrait" | "landscape" | "wide" | "small";
  /** A real photo (content/assets.ts key). */
  image?: AssetKey;
  /** Footage: muted mp4 + poster; never autoplays with sound, plays only on request. */
  video?: { src: string; poster: AssetKey };
  guest?: boolean;
  ready: boolean;
  /** What is needed, for stand-ins. */
  need?: string;
};

export const memoriesCopy = {
  label: "Memories we create",
  title: "Not Just Places. Memories.",
  note: "Every journey leaves something behind. A sunset, a conversation, a quiet morning, a moment worth remembering.",
};

export const memories: Memory[] = [
  { id: "film", theme: "Desert nights", caption: "An evening in the Thar, from the last light to the first stars", location: "Thar Desert", shape: "wide", ready: false, need: "a 20–40 s muted memory film (H.264 MP4 ≤ 3 MB) with a 16:9 poster frame" },
  { id: "dunes", theme: "Desert sunsets", caption: "A camel train crossing the dunes as the sun goes down", location: "Thar Desert, near Jaisalmer", shape: "portrait", image: "galCamel", ready: true },
  { id: "camp", theme: "Campfires & desert nights", caption: "Lanterns lit at camp as the desert cools", location: "Thar Desert", shape: "landscape", image: "expThar", ready: true },
  { id: "gate", theme: "Forts & palaces", caption: "A painted gateway in a palace courtyard", location: "City Palace, Jaipur", shape: "small", image: "galFortGate", ready: true },
  { id: "boat", theme: "Lakesides", caption: "A wooden boat on Lake Pichola in the early light", location: "Udaipur", shape: "landscape", image: "expPichola", ready: true },
  { id: "aarti", theme: "Sacred evenings", caption: "Lamps set on the water at the evening aarti", location: "Pushkar", shape: "portrait", image: "expAarti", ready: true },
  { id: "print", theme: "Local craft", caption: "A carved block pressed onto cotton by hand", location: "Rajasthan", shape: "small", image: "expBagru", ready: true },
  { id: "mehrangarh", theme: "Forts & palaces", caption: "Mehrangarh on its ridge above the blue city", location: "Jodhpur", shape: "landscape", image: "trailJodhpur", ready: true },
  { id: "music", theme: "Cultural performances", caption: "Folk musicians after dark", location: "Location to confirm", shape: "small", ready: false, need: "a real photo of a folk music or dance performance (performers' consent on file), portrait 4:5, ≥ 1600×2000" },
  { id: "food", theme: "Rajasthani food", caption: "A Rajasthani thali", location: "Location to confirm", shape: "small", ready: false, need: "a real photo of a Rajasthani meal served on one of your journeys, 4:5 or 3:2, ≥ 1600 px on the short side" },
];

export const storiesCopy = {
  label: "Stories from the road",
  title: "Stories From The Road.",
  note: "Don't just take our word for it. Hear it from the people who travelled with us.",
};

export const gallery = {
  label: "Gallery",
  title: "Rajasthan, frame by frame.",
  items: ["galAerial", "galFortGate", "galPalace", "galCamp", "galCamel", "galStreet", "galLakeHotel", "galCulture"] satisfies AssetKey[] as AssetKey[],
};

export const closing = {
  title: "Your Rajasthan Story Starts Here.",
  text: "Tell us what kind of journey you're dreaming of. We'll help you plan the rest.",
};
