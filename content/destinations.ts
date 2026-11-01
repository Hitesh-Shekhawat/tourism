import type { AssetKey } from "./assets";

export type Destination = {
  slug: string;
  name: string;
  devanagari: string;
  descriptor: string;
  intro: string[];
  bestTime: string;
  highlights: { title: string; text: string }[];
  experienceSlugs: string[];
  indexImage: AssetKey;
  heroImage: AssetKey;
  /** [longitude, latitude] for the small map */
  coords: [number, number];
  seo: { title: string; description: string };
};

/*
 * Copy rule: only general, verifiable facts. Anything that depends on the owner's own
 * knowledge (favourite shops, guides, hotels) stays a {{local detail}} placeholder.
 */
export const destinations: Destination[] = [
  {
    slug: "jaipur",
    name: "Jaipur",
    devanagari: "जयपुर",
    descriptor: "A gridded city of pink sandstone, bazaars and Amber's ridge-top walls",
    intro: [
      "Jaipur was laid out in 1727 by Sawai Jai Singh II on a grid of wide streets and walled bazaars, one of the earliest planned cities in India. The old city was washed in its familiar terracotta pink in 1876, ahead of a royal visit, and has kept the colour since.",
      "Mornings belong to Amber, eleven kilometres north, before the courtyards fill. Afternoons are for the bazaars of Johari and Bapu, and for Jantar Mantar, Jai Singh's stone observatory, now a UNESCO World Heritage Site.",
    ],
    bestTime: "October to March is the most comfortable season. April to June is hot; the monsoon arrives around July.",
    highlights: [
      { title: "Amber Fort, early", text: "Arrive at opening, walk up through the Suraj Pol and have the mirrored Sheesh Mahal almost to yourself." },
      { title: "The observatory", text: "Jantar Mantar's instruments still tell local time from the sun's shadow, to within a couple of seconds on the large sundial." },
      { title: "A local morning", text: "{{local detail: the chai stall, bazaar lane or workshop you would take a friend to}}" },
    ],
    experienceSlugs: ["block-printing-in-bagru", "the-stepwell-at-abhaneri"],
    indexImage: "idxJaipur",
    heroImage: "destJaipur",
    coords: [75.79, 26.92],
    seo: { title: "Jaipur: private journeys and slow days", description: "Amber at opening time, the bazaars of the walled pink city and Jai Singh's observatory, planned at your pace." },
  },
  {
    slug: "udaipur",
    name: "Udaipur",
    devanagari: "उदयपुर",
    descriptor: "White palaces, lake light and the stillness of Pichola at dawn",
    intro: [
      "Maharana Udai Singh II founded Udaipur in 1559 on the shores of Lake Pichola. The City Palace runs along the eastern bank, and the Lake Palace and Jag Mandir sit on their islands in the water.",
      "This is the city for slowing down: an early boat on the lake, an afternoon in the palace's courtyards, and evening light on the ghats around Gangaur Ghat.",
    ],
    bestTime: "October to March is the most comfortable. After a good monsoon (July to September) the lakes are full and the hills are green.",
    highlights: [
      { title: "The lake at first light", text: "Pichola is at its most still early in the morning, before the tour boats start." },
      { title: "The City Palace", text: "A run of palaces built over several centuries, with views across the lake from the upper courtyards." },
      { title: "A local evening", text: "{{local detail: a rooftop, a music performance or a quiet ghat you recommend}}" },
    ],
    experienceSlugs: ["dawn-on-lake-pichola"],
    indexImage: "idxUdaipur",
    heroImage: "destUdaipur",
    coords: [73.71, 24.58],
    seo: { title: "Udaipur: lakes, palaces and slow mornings", description: "Lake Pichola at first light, the City Palace and evenings on the ghats, on a private journey through Udaipur." },
  },
  {
    slug: "jaisalmer",
    name: "Jaisalmer",
    devanagari: "जैसलमेर",
    descriptor: "A living fort of yellow sandstone at the edge of the Thar",
    intro: [
      "Rawal Jaisal founded Jaisalmer in 1156 on a ridge of yellow sandstone. Its fort is one of very few in the world that people still live in, with homes, temples and shops inside the walls.",
      "Below the fort, the merchant havelis carry some of Rajasthan's finest stone carving. Beyond the town, the dunes of the Thar begin.",
    ],
    bestTime: "November to February. Days are warm and clear; desert nights can be cold, so pack a layer.",
    highlights: [
      { title: "Inside the walls", text: "Walk the lanes of the fort in the morning, while the stone is still cool." },
      { title: "The havelis", text: "Patwon ki Haveli is a cluster of five merchant houses with façades carved like lace." },
      { title: "A night in the dunes", text: "{{local detail: which dunes and which camp you use, and why}}" },
    ],
    experienceSlugs: ["a-night-in-the-thar"],
    indexImage: "idxJaisalmer",
    heroImage: "destJaisalmer",
    coords: [70.91, 26.91],
    seo: { title: "Jaisalmer: the golden fort and the Thar", description: "A living sandstone fort, carved merchant havelis and a night in the dunes, planned privately around you." },
  },
  {
    slug: "jodhpur",
    name: "Jodhpur",
    devanagari: "जोधपुर",
    descriptor: "Mehrangarh on its cliff, above a city washed in blue",
    intro: [
      "Rao Jodha founded Mehrangarh in 1459 on a sheer rock above the plain. The fort's walls rise straight from the cliff, and its museum holds palanquins, textiles and armour.",
      "Below it, the old city's houses are washed in blue, and the lanes lead down to the Ghanta Ghar clock tower and the Sardar Market around it.",
    ],
    bestTime: "October to March. Mornings in the old city are the best time to walk.",
    highlights: [
      { title: "Mehrangarh", text: "Climb up through the gates to the palace rooms, and look down over the blue city from the ramparts." },
      { title: "The old city on foot", text: "The lanes below the fort are best walked slowly, early in the day." },
      { title: "Around the clock tower", text: "{{local detail: the lassi or snack shop near Ghanta Ghar you recommend, and why}}" },
    ],
    experienceSlugs: ["walking-the-blue-city"],
    indexImage: "idxJodhpur",
    heroImage: "destJodhpur",
    coords: [73.02, 26.24],
    seo: { title: "Jodhpur: Mehrangarh and the blue city", description: "Mehrangarh at opening, a slow walk through the blue old city and the markets around the clock tower." },
  },
  {
    slug: "pushkar",
    name: "Pushkar",
    devanagari: "पुष्कर",
    descriptor: "A small holy town of white ghats around a sacred lake",
    intro: [
      "Pushkar wraps around a small lake ringed by ghats, the stone steps where pilgrims come to bathe. Its Brahma temple is one of very few in India dedicated to the creator god.",
      "Each year, in the Hindu month of Kartik (usually October or November), the town hosts the Pushkar Camel Fair. The dates follow the lunar calendar, so they change every year and are confirmed on enquiry.",
    ],
    bestTime: "October to March. Fair dates vary with the lunar calendar; ask us for this year's.",
    highlights: [
      { title: "Evening aarti", text: "At dusk, lamps are lit on the ghats and offered to the lake." },
      { title: "The camel fair", text: "Livestock trading, music and pilgrims, for a few days around the full moon of Kartik." },
      { title: "A quiet corner", text: "{{local detail: a ghat, café or hilltop temple walk you recommend}}" },
    ],
    experienceSlugs: ["evening-aarti-in-pushkar"],
    indexImage: "idxPushkar",
    heroImage: "destPushkar",
    coords: [74.55, 26.49],
    seo: { title: "Pushkar: ghats, aarti and the camel fair", description: "A holy lake ringed by ghats, evening aarti and the camel fair (dates confirmed on enquiry)." },
  },
  {
    slug: "bikaner",
    name: "Bikaner",
    devanagari: "बीकानेर",
    descriptor: "Red sandstone, painted palace rooms and camel country",
    intro: [
      "Rao Bika founded Bikaner in 1488 in the north of the Thar. Junagarh Fort sits on the plain rather than a hill, and its palace rooms are richly painted and gilded.",
      "The old city's red sandstone havelis are worth an unhurried morning. The town is also known for bhujia, its crisp gram-flour snack.",
    ],
    bestTime: "November to February. It's hot from April, and winter nights are cold.",
    highlights: [
      { title: "Junagarh's interiors", text: "Painted, mirrored and lacquered rooms, built and added to over several generations." },
      { title: "The old city", text: "Merchant havelis in red sandstone, best seen on foot." },
      { title: "Camel country", text: "{{local detail: the camel breeding farm, Deshnoke or a village visit you arrange}}" },
    ],
    experienceSlugs: [],
    indexImage: "idxBikaner",
    heroImage: "destBikaner",
    coords: [73.31, 28.02],
    seo: { title: "Bikaner: Junagarh, havelis and camel country", description: "Painted palace rooms at Junagarh, red sandstone havelis and the northern Thar, on a private journey." },
  },
];

export const getDestination = (slug: string) => destinations.find((d) => d.slug === slug);
