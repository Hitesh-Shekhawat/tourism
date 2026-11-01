import type { AssetKey } from "./assets";
import { business } from "./business";

export const hero = {
  label: "Private journeys across Rajasthan",
  headline: ["Rajasthan,", "Slowly."],
  support: "Unhurried journeys through Rajasthan's forts, lakes and desert, planned around you.",
};

export const intro = {
  number: "01",
  label: "Introduction",
  title: "A Land of Stories, Written in Sand and Stone.",
  paragraphs: [
    "Rajasthan rewards the traveller who stays a little longer. The forts are best at opening time, the lakes before the boats, the bazaars after the heat has gone. Between them lie long drives through mustard fields and scrub, past villages where the day still runs to its own clock.",
    "We plan journeys at that pace: fewer places, more time in each, and someone who knows the place to point things out. {{local detail: one sentence on who plans the trips and how long they have known Rajasthan}}",
  ],
};

export type TrailStop = {
  id: string;
  name: string;
  devanagari: string;
  lines: [string, string];
  days: string;
  image: AssetKey;
  coords: [number, number];
  accent?: "indigo";
};

/** The Golden Trail: Jaipur → Amber → Udaipur → Jodhpur → Jaisalmer. */
export const trail = {
  number: "03",
  label: "The Golden Trail",
  title: "One route, five chapters.",
  intro: "The classic western arc through Rajasthan, from the pink city to the edge of the Thar.",
  stops: [
    { id: "jaipur", name: "Jaipur", devanagari: "जयपुर", lines: ["A walled grid of pink sandstone bazaars.", "Start slowly: chai, the City Palace, Jai Singh's observatory."], days: "2–3 days", image: "trailJaipur", coords: [75.79, 26.92] },
    { id: "amber", name: "Amber", devanagari: "आमेर", lines: ["The hilltop palace eleven kilometres north of Jaipur.", "Arrive at opening, before the courtyards fill."], days: "A morning, from Jaipur", image: "trailAmber", coords: [75.85, 26.99] },
    { id: "udaipur", name: "Udaipur", devanagari: "उदयपुर", lines: ["White palaces on Lake Pichola.", "Take an early boat, then spend the afternoon in the palace courtyards."], days: "2–3 days", image: "trailUdaipur", coords: [73.71, 24.58] },
    { id: "jodhpur", name: "Jodhpur", devanagari: "जोधपुर", lines: ["Mehrangarh on its cliff above the blue city.", "Walk the old lanes down to the clock tower market."], days: "2 days", image: "trailJodhpur", coords: [73.02, 26.24], accent: "indigo" },
    { id: "jaisalmer", name: "Jaisalmer", devanagari: "जैसलमेर", lines: ["A living fort of golden stone.", "Beyond it, the dunes and a very large sky."], days: "2–3 days", image: "trailJaisalmer", coords: [70.91, 26.91] },
  ] satisfies TrailStop[] as TrailStop[],
};

export const planSteps = [
  { title: "Tell us your idea", text: "Dates, who's travelling, what you'd love to see. Rough is fine." },
  { title: "Receive a tailored itinerary", text: `A draft itinerary within ${business.responseTime}: the route, the pace and where you'd stay.` },
  { title: "Refine together", text: "Change the pace, the hotels or the route until it feels right." },
  { title: "Travel with on-trip support", text: "{{on-trip support details: who the guest calls, and when}}" },
];

/**
 * Why travel with us: every reason must be backed by a fact the owner can stand behind.
 * `proof` stays null until supplied, and the site then shows an "Owner to supply" block.
 */
export const reasons: { title: string; proof: string | null; hint: string }[] = [
  { title: "Planned by people who live here", proof: null, hint: "where the team is based and how long they have planned trips in Rajasthan" },
  { title: "Private, never grouped", proof: null, hint: "confirm every trip is private (own car, own guide), or rewrite this" },
  { title: "Hotels we have stayed in", proof: null, hint: "how hotels are chosen and inspected" },
  { title: "Drivers who stay with you", proof: null, hint: "how drivers are employed, trained and assigned" },
  { title: "A person, not a call centre", proof: null, hint: "who answers during the trip, and their hours" },
];

/** Guest reviews: real ones only, with permission. Leave empty until there are some. */
export const reviews: { quote: string; name: string; origin: string; trip: string; date: string; sourceUrl?: string }[] = [];

/** Seven FAQs. `a: null` renders an "Owner to supply" block. */
export const faqs: { q: string; a: string | null }[] = [
  { q: "When is the best time to visit Rajasthan?", a: "October to March is the most comfortable season, with warm days and cool nights; desert nights in December and January can be cold. April to June is very hot. The monsoon (July to September) is quieter and greener, especially around Udaipur." },
  { q: "Can you change an itinerary or build one from scratch?", a: null },
  { q: "What kind of hotels do you use?", a: null },
  { q: "Is it comfortable for families, solo travellers and women travelling alone?", a: null },
  { q: "How do payments and deposits work?", a: null },
  { q: "What happens if I need to cancel?", a: null },
  { q: "Do you arrange flights, trains and visas?", a: null },
];

export const finalCta = {
  title: "Your Rajasthan Story Starts Here.",
};

/** Ch04 · Into the Thar. Panels appear in the sky as the dunes sequence runs from 16:30 to night. */
export const thar = {
  title: "Into the Thar",
  intro: "West of Jaisalmer the land opens into dunes. Keep scrolling and the afternoon turns to night.",
  panels: [
    { id: "camp", time: "17:00", deva: "डेरा", title: "Camp under the dunes", text: "{{local detail: the camp you use, how far it is from Jaisalmer, and what the evening involves}}" },
    { id: "ridge", time: "18:00", deva: "सूर्यास्त", title: "Sunset on the ridge", text: "Walk up a dune ridge an hour before sunset, then watch the light drain from the sand, gold to grey." },
    { id: "stars", time: "20:00", deva: "तारे", title: "Stars without a city", text: "{{local detail: what guests see on a clear night at your camp, and who points out the sky}}" },
  ],
};

/** Ch05 · Ganjifa: the round, hand-painted playing cards of the Mughal and Rajput courts. */
export const ganjifa = {
  title: "The moments people remember.",
  note: "Ganjifa were the round, hand-painted playing cards of the Mughal and Rajput courts. Draw one.",
  ownCard: { label: "Your own", title: "Design your own journey", text: "Tell us what draws you to Rajasthan, and we'll build the route around it.", cta: "Begin" },
};

/** Ch06 · Featured journeys (tickets) */
export const journeysCopy = {
  title: "Journeys to begin from.",
  note: "Every journey is private, and every one can be changed: the pace, the route, the stays.",
};
