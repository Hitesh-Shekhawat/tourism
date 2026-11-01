import type { AssetKey } from "./assets";

export type Experience = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  description: string[];
  /** What the guest gets. Business facts, so the owner must supply them. */
  included: string[] | null;
  where: string;
  destinationSlug?: string;
  image: AssetKey;
  seo: { title: string; description: string };
};

export const experiences: Experience[] = [
  {
    slug: "dawn-on-lake-pichola",
    label: "Udaipur · Water",
    title: "Dawn on Lake Pichola",
    summary: "The lake before the city wakes, from a small boat.",
    description: [
      "Pichola is at its quietest early in the morning: the water still, the palaces pale, the ghats just stirring with bathers and washing.",
      "We time the boat for first light and keep the morning unhurried. {{local detail: boat type, route, breakfast arrangements}}",
    ],
    included: null,
    where: "Lake Pichola, Udaipur",
    destinationSlug: "udaipur",
    image: "expPichola",
    seo: { title: "Dawn on Lake Pichola, Udaipur", description: "A small boat on Lake Pichola at first light, before the city wakes." },
  },
  {
    slug: "a-night-in-the-thar",
    label: "Jaisalmer · Desert",
    title: "A night in the Thar",
    summary: "Dunes at sunset, supper by lantern, the stars after.",
    description: [
      "Beyond Jaisalmer the land opens into the Thar. Watch the sun go down from a dune ridge, then settle in for dinner under a very large sky.",
      "{{local detail: which dunes, what kind of camp, whether the guest can choose a quieter site away from the crowds}}",
    ],
    included: null,
    where: "Near Jaisalmer, western Rajasthan",
    destinationSlug: "jaisalmer",
    image: "expThar",
    seo: { title: "A night in the Thar desert near Jaisalmer", description: "Sunset on the dunes, supper by lantern and a night under the desert sky." },
  },
  {
    slug: "block-printing-in-bagru",
    label: "Jaipur · Craft",
    title: "Block printing in Bagru",
    summary: "Carved wood, natural dyes and a morning with the printers.",
    description: [
      "Bagru, a short drive from Jaipur, has a long tradition of hand block printing with natural dyes: indigo, iron rust and pomegranate rind, printed with carved wooden blocks.",
      "Spend a morning with a printing family and try a block yourself. {{local detail: the workshop you work with and what guests take home}}",
    ],
    included: null,
    where: "Bagru, near Jaipur",
    destinationSlug: "jaipur",
    image: "expBagru",
    seo: { title: "Block printing in Bagru, near Jaipur", description: "A morning with Bagru's hand block printers: carved blocks, natural dyes and a print of your own." },
  },
  {
    slug: "walking-the-blue-city",
    label: "Jodhpur · On foot",
    title: "Walking the blue city",
    summary: "The lanes below Mehrangarh, early, with someone who knows them.",
    description: [
      "Below Mehrangarh, Jodhpur's old city is a tangle of blue-washed lanes, small temples and stepwells, and it's best walked before the heat.",
      "{{local detail: who leads the walk, the route and where it ends}}",
    ],
    included: null,
    where: "Old city, Jodhpur",
    destinationSlug: "jodhpur",
    image: "expBlueCity",
    seo: { title: "Walking Jodhpur's blue city", description: "An early walk through the blue-washed lanes below Mehrangarh." },
  },
  {
    slug: "evening-aarti-in-pushkar",
    label: "Pushkar · Ritual",
    title: "Evening aarti in Pushkar",
    summary: "Lamps, bells and the lake at dusk.",
    description: [
      "Each evening at dusk, lamps are lit on Pushkar's ghats and offered to the lake to the sound of bells and chanting.",
      "Watch from a quiet step, with someone who can explain what's happening. {{local detail: the ghat you suggest and etiquette notes}}",
    ],
    included: null,
    where: "The ghats of Pushkar Lake",
    destinationSlug: "pushkar",
    image: "expAarti",
    seo: { title: "Evening aarti on the ghats of Pushkar", description: "Lamps, bells and chanting on Pushkar's ghats at dusk, explained by someone who knows it." },
  },
  {
    slug: "the-stepwell-at-abhaneri",
    label: "Abhaneri · Architecture",
    title: "The stepwell at Abhaneri",
    summary: "Thirteen storeys of steps, folding down to the water.",
    description: [
      "Chand Baori, in the village of Abhaneri, is one of the deepest stepwells in India: thousands of narrow steps descending in a precise geometric pattern on three sides.",
      "It sits on the road east of Jaipur and makes an easy stop on the way to or from the city. {{local detail: timing and what else you pair it with}}",
    ],
    included: null,
    where: "Abhaneri, Dausa district",
    destinationSlug: "jaipur",
    image: "expStepwell",
    seo: { title: "Chand Baori stepwell at Abhaneri", description: "One of India's deepest stepwells, thirteen storeys of geometric steps on the road east of Jaipur." },
  },
];

export const getExperience = (slug: string) => experiences.find((e) => e.slug === slug);
