import type { AssetKey } from "./assets";
import { destinations } from "./destinations";
import { hasItinerary } from "./itineraries";

/**
 * The atlas on the home page: which states are open, and the places pinned on each state's map.
 * Geometry lives apart, in public/geo (scripts/build-geo.mjs); state ids match its feature ids.
 * To open another state: add it to `openStates` and give it places. Coordinates are [lon, lat].
 */
export type LL = [number, number];

export type Interest = "heritage" | "lakes" | "desert" | "spiritual" | "hills";
export const interests: { id: Interest; label: string; text: string }[] = [
  { id: "heritage", label: "Forts & palaces", text: "Ridge-top forts, royal courtyards and painted halls" },
  { id: "lakes", label: "Lakes", text: "Palaces on the water and boats at first light" },
  { id: "desert", label: "Desert", text: "Dunes, camel trails and nights under the stars" },
  { id: "spiritual", label: "Sacred places", text: "Ghats, temples and evening aarti" },
  { id: "hills", label: "Hills", text: "Cool air and old temples in the Aravallis" },
];

export type OpenState = { id: string; name: string; devanagari: string; tagline: string };
/** States with places on their map. Every other state can still be opened, and says "coming soon". */
export const openStates: OpenState[] = [{ id: "rajasthan", name: "Rajasthan", devanagari: "राजस्थान", tagline: "Forts, lakes and the Thar desert" }];
export const isOpenState = (id: string) => openStates.some((s) => s.id === id);

export type Place = {
  id: string;
  state: string;
  name: string;
  devanagari: string;
  region: string;
  coords: LL;
  summary: string;
  description: string;
  attractions: { name: string; note: string; coords: LL }[];
  image: AssetKey;
  interests: Interest[];
  /** Set when the place has a destination page (content/destinations.ts). */
  destinationSlug?: string;
  /** Put the map label under the pin, where a neighbour's label would collide above it. */
  labelBelow?: boolean;
};

export const places: Place[] = [
  {
    id: "jaipur",
    state: "rajasthan",
    name: "Jaipur",
    devanagari: "जयपुर",
    region: "Dhundhar, eastern Rajasthan",
    coords: [75.7873, 26.9124],
    summary: "The planned pink city of bazaars, palaces and Amber's ridge.",
    description: "Laid out from 1727 by Sawai Jai Singh II on a grid of wide streets, Jaipur is the state capital and the usual first stop: the walled old city, the City Palace and Jantar Mantar, and Amer Fort on the ridge to the north.",
    attractions: [
      { name: "Hawa Mahal", note: "The latticed Palace of Winds, 1799", coords: [75.8267, 26.9239] },
      { name: "Amer Fort", note: "Ridge-top fort-palace above Maota Lake", coords: [75.8513, 26.9855] },
      { name: "City Palace", note: "Royal residence since 1727", coords: [75.8237, 26.9258] },
    ],
    image: "placeJaipur",
    interests: ["heritage"],
    destinationSlug: "jaipur",
  },
  {
    id: "udaipur",
    state: "rajasthan",
    name: "Udaipur",
    devanagari: "उदयपुर",
    region: "Mewar, southern Rajasthan",
    coords: [73.7125, 24.5854],
    summary: "White palaces on Lake Pichola, ringed by the Aravalli hills.",
    description: "Founded in 1559 by Maharana Udai Singh II, Udaipur is the city of lakes: the City Palace along Pichola's shore, the Lake Palace and Jag Mandir on their islands, and the ghats of the old city.",
    attractions: [
      { name: "City Palace", note: "Three centuries of Mewar palaces on the lake", coords: [73.6835, 24.5764] },
      { name: "Lake Pichola", note: "Best on the water at first light", coords: [73.679, 24.572] },
      { name: "Lake Palace", note: "Jag Niwas, an island palace of the 1740s", coords: [73.68, 24.5753] },
    ],
    image: "placeUdaipur",
    interests: ["lakes", "heritage"],
    destinationSlug: "udaipur",
  },
  {
    id: "jaisalmer",
    state: "rajasthan",
    name: "Jaisalmer",
    devanagari: "जैसलमेर",
    region: "The Thar, far western Rajasthan",
    coords: [70.9083, 26.9157],
    summary: "A living fort of golden sandstone at the edge of the dunes.",
    description: "Founded in 1156 by Rawal Jaisal, Jaisalmer's fort is still lived in: lanes, havelis and Jain temples inside walls of yellow sandstone. West of the town the Thar opens into dunes.",
    attractions: [
      { name: "Jaisalmer Fort", note: "Sonar Qila, a living fort of 1156", coords: [70.9126, 26.9124] },
      { name: "Sam Sand Dunes", note: "About 40 km west, at sunset", coords: [70.505, 26.83] },
    ],
    image: "placeJaisalmer",
    interests: ["desert", "heritage"],
    destinationSlug: "jaisalmer",
  },
  {
    id: "jodhpur",
    state: "rajasthan",
    name: "Jodhpur",
    devanagari: "जोधपुर",
    region: "Marwar, western Rajasthan",
    coords: [73.0243, 26.2389],
    summary: "Mehrangarh on its cliff above a city of blue houses.",
    description: "Rao Jodha founded Mehrangarh in 1459 on a rocky ridge, and the city spread below it. The old town's blue-washed houses, the clock-tower market and the art deco Umaid Bhawan Palace all sit in its shadow.",
    attractions: [
      { name: "Mehrangarh Fort", note: "Founded 1459, on a sheer ridge", coords: [73.0185, 26.298] },
      { name: "Umaid Bhawan Palace", note: "Art deco palace, completed 1943", coords: [73.047, 26.281] },
    ],
    image: "placeJodhpur",
    interests: ["heritage"],
    destinationSlug: "jodhpur",
  },
  {
    id: "pushkar",
    state: "rajasthan",
    name: "Pushkar",
    devanagari: "पुष्कर",
    region: "Ajmer district, central Rajasthan",
    coords: [74.5511, 26.4897],
    summary: "A sacred lake ringed by ghats and white temples.",
    description: "One of Hinduism's most sacred towns: some fifty ghats step down into Pushkar Lake, and the town keeps one of the very few temples in India dedicated to Brahma. The evening aarti on the water is the heart of the day.",
    attractions: [
      { name: "Pushkar Lake", note: "Ghats and the evening aarti", coords: [74.553, 26.488] },
      { name: "Brahma Temple", note: "One of the few temples to Brahma", coords: [74.555, 26.4877] },
    ],
    image: "placePushkar",
    interests: ["spiritual"],
    destinationSlug: "pushkar",
  },
  {
    id: "mount-abu",
    state: "rajasthan",
    name: "Mount Abu",
    devanagari: "माउंट आबू",
    region: "Sirohi district, the Aravalli hills",
    coords: [72.7156, 24.5926],
    summary: "Rajasthan's only hill station, cool and green among the Aravallis.",
    description: "On a plateau near the Aravallis' highest point, Mount Abu is cooler and greener than the plains below. It is known for Nakki Lake and for the Dilwara Temples, a group of Jain temples carved in white marble between the 11th and 13th centuries.",
    attractions: [
      { name: "Nakki Lake", note: "A lake among the hills, with boating", coords: [72.706, 24.597] },
      { name: "Dilwara Temples", note: "Jain temples in carved marble, 11th–13th c.", coords: [72.723, 24.61] },
    ],
    image: "placeMountAbu",
    interests: ["hills", "spiritual"],
    labelBelow: true,
  },
  {
    id: "bikaner",
    state: "rajasthan",
    name: "Bikaner",
    devanagari: "बीकानेर",
    region: "Northern Thar, Rajasthan",
    coords: [73.3119, 28.0229],
    summary: "Red sandstone, painted palaces and the desert's old trade towns.",
    description: "Founded by Rao Bika in 1488, Bikaner grew rich on the desert caravan trade. Junagarh Fort, built on the plain rather than a hill, holds some of Rajasthan's finest painted interiors.",
    attractions: [
      { name: "Junagarh Fort", note: "Built 1589–1594 by Raja Rai Singh", coords: [73.3176, 28.0222] },
      { name: "Karni Mata Temple", note: "At Deshnoke, about 30 km south", coords: [73.341, 27.7907] },
    ],
    image: "placeBikaner",
    interests: ["heritage", "desert"],
    destinationSlug: "bikaner",
  },
];

export const placesIn = (state: string) => places.filter((p) => p.state === state);
export const getPlace = (id: string) => places.find((p) => p.id === id);
/** Where a place leads: its itinerary when there is one, else its destination page, else nowhere yet. */
export const placeLinks = (p: Place) => ({
  itinerary: p.destinationSlug && hasItinerary(p.destinationSlug) ? `/destinations/${p.destinationSlug}/itinerary` : null,
  destination: p.destinationSlug && destinations.some((d) => d.slug === p.destinationSlug) ? `/destinations/${p.destinationSlug}` : null,
});

/** The home page's trending row, in order. */
export const trending = ["jaipur", "udaipur", "jaisalmer", "jodhpur", "pushkar", "mount-abu"].map((id) => getPlace(id)!);
