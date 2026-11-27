import type { AssetKey } from "./assets";
import { reviews } from "./home";
import type { Tour } from "./tours/types";

/*
 * Copy and data for the home page (v4). Editorial copy only: every business fact (services offered,
 * prices, guest stories) is gated, so nothing renders as true until the owner confirms it.
 */

/**
 * Home hero footage. The supplied clip is self-hosted; add srcMobile or srcWebm when alternate
 * encodes are available. It is muted, loops, and is omitted for reduced motion or Save-Data.
 */
export const heroVideo: { src?: string; srcWebm?: string; srcMobile?: string } = {
  src: "/Create_side_move_drone_shot_50b52d83.mp4",
};

/** Set to a YouTube URL or 11-character video ID to enable the persistent floating player. */
export const floatingYoutubeUrl = "https://youtube.com/shorts/-g8yluOWAVo?si=IjveMPum2ZHHtptd";

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

/** Common trip-planning services; exact availability varies by operator and itinerary. */
export const services: { id: string; title: string; text: string; icon: ServiceIcon; image: AssetKey }[] = [
  { id: "custom-tours", title: "Custom tour planning", text: "Shape a route around your dates, interests, and preferred pace.", icon: "plan", image: "trailJaipur" },
  { id: "hotel-booking", title: "Hotel booking", text: "Explore stays suited to your route and budget; confirm options before booking.", icon: "hotel", image: "galPalace" },
  { id: "transport", title: "Transport & transfers", text: "Plan road transport and arrival or departure transfers around your itinerary.", icon: "car", image: "expPichola" },
  { id: "local-guides", title: "Local guides", text: "Add local guides for selected cities, sights, and experiences.", icon: "guide", image: "expBagru" },
  { id: "sightseeing", title: "Sightseeing planning", text: "Plan time for forts, palaces, markets, and cultural stops along the way.", icon: "route", image: "trailJodhpur" },
  { id: "trip-support", title: "On-trip support", text: "Ask your tour operator about assistance options while you are travelling.", icon: "phone", image: "expThar" },
];

export const facilitiesIntro = {
  label: "Tour facilities",
  title: "The arrangements that make a journey easier.",
  note: "Services and availability vary by operator and itinerary. Confirm inclusions before booking.",
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
 * Guest stories: real guests only, with written permission to show their name, face and words.
 * Owner-provided video features are kept separately in `storyVideos`.
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

/** Owner-provided video links for the Stories section; these are video features, not guest reviews. */
export const storyVideos = [
  { id: "road-short-1", youtubeId: "zIxXRjm35E0" },
  { id: "road-short-2", youtubeId: "aNwvVFmAzkE" },
] as const;

/** The stories section (and its number in the sequence) only exists once there is content to show. */
export const hasStories = travellerStories.length > 0 || storyVideos.length > 0 || reviews.length > 0;
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
  /** Poster artwork for a forthcoming video; does not imply a video is available. */
  poster?: AssetKey;
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
  { id: "film", theme: "Desert nights", caption: "An evening in the Thar, from the last light to the first stars", location: "Thar Desert", shape: "wide", poster: "homeMemoryFilmPoster", ready: false, need: "a 20–40 s muted memory film (H.264 MP4 ≤ 3 MB) with a 16:9 poster frame" },
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
  note: "Short films and stories from Rajasthan, shared from the road.",
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

/* ───────────────────────────────────────────────────────────────────────────────────────────────
 * Homepage v5 (premium editorial redesign). Editorial copy only. Every link points to a page that
 * exists; anything that would need a business fact or content we don't have yet is `ready: false`
 * (shown labelled in development, left out of production builds).
 * ─────────────────────────────────────────────────────────────────────────────────────────────── */

export const heroV5 = {
  eyebrow: "Discover Rajasthan",
  title: "Discover Rajasthan Through Journeys Crafted Around You",
  text: "From the royal palaces of Jaipur and Udaipur to the golden dunes of Jaisalmer, discover Rajasthan through its magnificent forts, painted havelis, timeless traditions and extraordinary landscapes. Explore customised Rajasthan tour packages designed around the experiences you want to remember.",
  primary: "Explore Rajasthan Tours",
  secondary: "Plan Your Trip",
  /** The arch window on the hero: one real itinerary, by slug (content/itineraries.ts). */
  windowItinerary: "udaipur",
};

export type DiscoveryCard = { id: string; title: string; text: string; where: string; image: AssetKey; href: string; cta: string };

/** 02 · Find your Rajasthan experience. Each card leads to an existing page that covers it best. */
export const discovery = {
  label: "Find your experience",
  title: "Find Your Rajasthan Experience",
  note: "Discover Rajasthan through experiences that match your interests.",
  cards: [
    { id: "heritage", title: "Royal Heritage", text: "Palaces, forts, royal architecture and heritage stays.", where: "Jaipur · Jodhpur · Bikaner", image: "introArch", href: "/destinations/jaipur/itinerary", cta: "Explore royal Jaipur" },
    { id: "desert", title: "Desert Adventures", text: "Desert safaris, camel rides, sand dunes and desert camps.", where: "Jaisalmer · Bikaner · the Thar", image: "galCamel", href: "/experiences/a-night-in-the-thar", cta: "A night in the Thar" },
    { id: "romance", title: "Romantic Escapes", text: "Lakeside palaces, boutique stays and private experiences.", where: "Udaipur · Mount Abu", image: "tourLakesForts", href: "/destinations/udaipur/itinerary", cta: "Three days in Udaipur" },
    { id: "culture", title: "Cultural Experiences", text: "Folk music, festivals, local crafts, traditional food and art.", where: "Pushkar · Bagru · Jodhpur", image: "expBagru", href: "/experiences", cta: "Browse experiences" },
  ] satisfies DiscoveryCard[] as DiscoveryCard[],
};

/**
 * 03 · The royal cities, in grid order. Place data (photo, summary, coordinates) comes from
 * content/explorer.ts; this adds the card's identity line and one travel experience per city.
 */
export const royalCities = {
  label: "Explore Rajasthan",
  title: "Explore the Royal Cities of Rajasthan",
  note: "Eight places, each with its own colour, history and pace. Start with one, or let us link them into a single route.",
  cities: [
    { id: "jaipur", epithet: "The Pink City", experience: "Amber Fort at opening time, then the bazaars of the walled city" },
    { id: "udaipur", epithet: "The City of Lakes", experience: "A boat on Lake Pichola at first light" },
    { id: "jaisalmer", epithet: "The Golden City", experience: "Sunset from a dune ridge and a night in the Thar" },
    { id: "jodhpur", epithet: "The Blue City", experience: "An early walk through the blue lanes below Mehrangarh" },
    { id: "pushkar", epithet: "The Sacred City", experience: "Evening aarti on the ghats of the holy lake" },
    { id: "ranthambore", epithet: "Wildlife & Tiger Safari", experience: "Safaris into Bengal tiger habitat around a historic fort" },
    { id: "bikaner", epithet: "Desert Heritage", experience: "Junagarh's painted rooms and the camel country around it" },
    { id: "mount-abu", epithet: "Rajasthan's Hill Station", experience: "The marble Dilwara temples and evenings by Nakki Lake" },
  ],
};

/** 04 · Curated journeys: real itineraries and confirmed tours only (drafts render in development). */
export const packagesV5 = {
  label: "Curated journeys",
  title: "Handcrafted Rajasthan Tour Packages",
  note: "Explore thoughtfully planned Rajasthan travel itineraries covering royal cities, historic landmarks, desert landscapes and authentic local experiences.",
  custom: {
    title: "A journey built around you",
    text: "Tell us your dates, interests and pace. We'll shape a Rajasthan itinerary around them, from a long weekend to two weeks or more.",
    cta: "Request a custom itinerary",
  },
};

export type ShowcaseItem = {
  id: string;
  title: string;
  text: string;
  /** A real photo; without one the card is drawn as a Rajasthani ornament panel (no stand-in photography). */
  image?: AssetKey;
  /** Devanagari word on ornament panels. */
  deva?: string;
  motif?: "peacock" | "elephant" | "rosette" | "rail";
  /** A page that covers it, or an enquiry pre-filled with these place ids. */
  href?: string;
  enquire?: { destinations?: string[] };
  cta: string;
};

/** 05 · Beyond the ordinary. Copy describes Rajasthan, not services we have not confirmed. */
export const showcase = {
  label: "Beyond the ordinary",
  title: "Experience Rajasthan Beyond the Ordinary",
  note: "The moments people remember are rarely on the monument list. These are the ones worth building a day around.",
  items: [
    { id: "desert", title: "Desert Safari & Camel Experiences", text: "Dunes at sunset beyond Jaisalmer, supper by lantern and a sky full of stars.", image: "expThar", href: "/experiences/a-night-in-the-thar", cta: "A night in the Thar" },
    { id: "music", title: "Rajasthani Folk Music & Dance", text: "Songs of the desert and the court, from the kamaicha and the khartal to the swirl of a ghoomar.", deva: "संगीत", motif: "peacock", href: "/destinations/jaipur/itinerary", cta: "An evening in Jaipur" },
    { id: "crafts", title: "Traditional Arts & Crafts", text: "Carved teak blocks and natural dyes in Bagru, a short drive from Jaipur.", image: "expBagru", href: "/experiences/block-printing-in-bagru", cta: "Block printing in Bagru" },
    { id: "cuisine", title: "Traditional Rajasthani Cuisine", text: "Pyaaz kachori for breakfast, dal baati churma for lunch, a glass of lassi in the old city.", deva: "स्वाद", motif: "rosette", href: "/destinations/jaipur/itinerary", cta: "Food in Jaipur" },
    { id: "stays", title: "Royal Palace & Heritage Stays", text: "Palaces, forts and havelis across Rajasthan now take guests. Tell us if you'd like one on your route.", image: "galPalace", enquire: {}, cta: "Ask about heritage stays" },
    { id: "wildlife", title: "Wildlife & Tiger Safaris", text: "Forest, lakes and a ruined fort at Ranthambore, one of the best places in India to see a Bengal tiger.", image: "placeRanthambore", enquire: { destinations: ["ranthambore"] }, cta: "Plan a safari" },
    { id: "festivals", title: "Fairs & Festivals", text: "The Pushkar Camel Fair under the Kartik full moon, and lamps on the ghats every evening.", image: "idxPushkar", href: "/destinations/pushkar", cta: "Pushkar and its fair" },
    { id: "rail", title: "Palace on Wheels & Heritage Journeys", text: "Rajasthan's heritage trains, including the state's Palace on Wheels, link its royal cities. Ask whether one suits your dates.", deva: "रेल", motif: "rail", enquire: {}, cta: "Ask about rail journeys" },
  ] satisfies ShowcaseItem[] as ShowcaseItem[],
};

export type TrustCard = { id: string; icon: "compass" | "route" | "hands" | "chat"; title: string; text: string; ready: boolean; need?: string };

/**
 * 06 · Why travel with us. `ready: true` only for what the site itself demonstrates (custom planning
 * through the enquiry form, local advice in the published guides, contact while planning). A claim
 * that needs a business fact stays `ready: false` until the owner confirms it.
 */
export const trust = {
  label: "Why travel with us",
  title: "Travel with People Who Know Rajasthan",
  note: "No fixed departures and no crowded coaches: a plan made for you, around how you want your days to feel.",
  cards: [
    { id: "local", icon: "compass", title: "Local Expertise", text: "Advice on timing, routes and seasons, like Amber at opening time and Pichola before the boats, built into every plan.", ready: true },
    { id: "custom", icon: "route", title: "Custom Itineraries", text: "Travel plans designed around your interests, your dates and the pace you want to travel at.", ready: true },
    { id: "partners", icon: "hands", title: "Trusted Travel Partners", text: "Thoughtful arrangements and relevant local connections.", ready: false, need: "which hotels, drivers and guides you work with, and how they are chosen" },
    { id: "assist", icon: "chat", title: "Travel Assistance", text: "Clear answers by form, WhatsApp or phone while you plan, before anything is booked.", ready: true },
  ] satisfies TrustCard[] as TrustCard[],
};

export type StoryLink = { id: string; kicker: string; title: string; text: string; href: string; image: AssetKey; ready: boolean; need?: string };

/** 07 · Stories: links to real published content. Topics with nothing written yet stay dev-only. */
export const storiesV5 = {
  label: "Travel stories",
  title: "Discover Rajasthan Through Stories",
  note: "Guides, itineraries and stories from the road, for the trip before the trip.",
  feature: { kicker: "A story in one day", title: "One Day in Rajasthan", text: "From 05:30 at Jaipur to 21:30 in the Thar: forts at first light, lakes at noon and the desert after dark, told as you scroll.", href: "/story", image: "trailAmber" as AssetKey },
  links: [
    { id: "heritage", kicker: "Royal heritage & architecture", title: "Three days in royal Jaipur", text: "Amber at opening, the City Palace's painted gates and Jai Singh's stone observatory.", href: "/destinations/jaipur/itinerary", image: "introArch", ready: true },
    { id: "painted", kicker: "Painted walls", title: "Junagarh's painted rooms", text: "Gilded, mirrored and lacquered palace rooms in Bikaner, added to over generations.", href: "/destinations/bikaner", image: "placeBikaner", ready: true },
    { id: "desert", kicker: "Desert life", title: "A night in the Thar", text: "Dunes at sunset, supper by lantern and a sky without a city in it.", href: "/experiences/a-night-in-the-thar", image: "expThar", ready: true },
    { id: "fairs", kicker: "Fairs & festivals", title: "Pushkar and its camel fair", text: "Ghats, evening aarti and the fair under the Kartik full moon.", href: "/destinations/pushkar", image: "idxPushkar", ready: true },
    { id: "shekhawati", kicker: "Shekhawati", title: "The painted havelis of Shekhawati", text: "Journal article to write.", href: "/journal", image: "galStreet", ready: false, need: "a journal article on Shekhawati's painted havelis (content/journal.ts)" },
    { id: "cuisine", kicker: "Rajasthani cuisine", title: "What to eat in Rajasthan", text: "Journal article to write.", href: "/journal", image: "galStreet", ready: false, need: "a journal article on Rajasthani food (content/journal.ts)" },
  ] satisfies StoryLink[] as StoryLink[],
  guides: ["jaipur", "jodhpur", "udaipur", "jaisalmer"],
};

export const closingV5 = {
  eyebrow: "Start your journey",
  title: "Your Rajasthan Story Starts Here.",
  text: "Tell us what you want to experience. Our team will help you plan a memorable Rajasthan journey.",
  cta: "Plan Your Rajasthan Trip",
};
