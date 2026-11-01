import type { AssetKey } from "./assets";

/**
 * Destination itineraries: day-by-day plans for one city, at /destinations/<slug>/itinerary.
 * Adding one here is all it takes: the page, the sitemap, the atlas card and the destination page's
 * link all follow from this list. Copy rule as content/destinations.ts: general, verifiable facts only.
 */
export type ItineraryStop = { time: string; title: string; text: string };
export type ItineraryDay = { title: string; summary: string; stops: ItineraryStop[] };
export type Sight = { name: string; text: string; image?: AssetKey };

export type Itinerary = {
  /** The destination's slug in content/destinations.ts (also the URL). */
  slug: string;
  name: string;
  devanagari: string;
  title: string;
  lede: string;
  heroImage: AssetKey;
  duration: { days: number; label: string; note: string };
  facts: { label: string; value: string }[];
  intro: string[];
  days: ItineraryDay[];
  sights: Sight[];
  culture: { title: string; text: string }[];
  gallery: AssetKey[];
  practical: { label: string; value: string }[];
  seo: { title: string; description: string };
};

export const itineraries: Itinerary[] = [
  {
    slug: "jaipur",
    name: "Jaipur",
    devanagari: "जयपुर",
    title: "Three days in Jaipur",
    lede: "The walled pink city, Amber on its ridge and a morning with the block printers of Bagru, at a pace that leaves room for tea.",
    heroImage: "itinJaipurHero",
    duration: { days: 3, label: "3 days · 2 nights", note: "Add a fourth day for the stepwell at Abhaneri, 95 km east." },
    facts: [
      { label: "Recommended stay", value: "3 days" },
      { label: "Best season", value: "October to March" },
      { label: "Pace", value: "Unhurried: early starts, slow afternoons" },
      { label: "Good for", value: "First visits, architecture, craft" },
    ],
    intro: [
      "Jaipur was laid out from 1727 by Sawai Jai Singh II, on a grid of wide streets and walled bazaars that still organises the old city today. Its terracotta wash dates from 1876, and gave the city the name it travels under.",
      "This plan keeps the big monuments to the cool of the morning, when the light is good and the crowds are thin, and leaves the afternoons for bazaars, a long lunch or the hotel pool.",
    ],
    days: [
      {
        title: "The walled city",
        summary: "Hawa Mahal in early light, the City Palace and Jai Singh's observatory, then the bazaars.",
        stops: [
          { time: "07:30", title: "Hawa Mahal", text: "Built in 1799 for Maharaja Sawai Pratap Singh, the 'Palace of Winds' is a screen of small latticed windows that let the women of the court watch the street unseen. See the façade from across the road first, while the sun is on it, then climb the narrow ramps inside." },
          { time: "09:30", title: "City Palace", text: "The royal residence since Jai Singh's time. Walk through Mubarak Mahal to Pritam Niwas Chowk, the courtyard of four painted gates, one for each season." },
          { time: "11:30", title: "Jantar Mantar", text: "Jai Singh's stone observatory, completed in 1734 and a UNESCO World Heritage Site. The great sundial, the Samrat Yantra, tells local time to within a couple of seconds." },
          { time: "16:00", title: "Johari and Bapu bazaars", text: "Jewellers, textile shops and spice sellers in the arcaded streets of the old city, as the heat goes out of the day." },
          { time: "19:00", title: "Albert Hall, lit at night", text: "The Indo-Saracenic museum in Ram Niwas Garden is floodlit after dark: a short stop on the way to dinner." },
        ],
      },
      {
        title: "Amber and the ridge",
        summary: "Amer Fort at opening time, a stepwell, the water palace and sunset from Nahargarh.",
        stops: [
          { time: "08:00", title: "Amer Fort", text: "Eleven kilometres north of the city, the fort-palace of the Kachwaha rulers rises above Maota Lake. Arrive at opening and walk up through Suraj Pol to the Ganesh Pol and the mirrored Sheesh Mahal before the courtyards fill. Amer is one of the Hill Forts of Rajasthan, a UNESCO World Heritage Site." },
          { time: "11:00", title: "Panna Meena ka Kund", text: "A 16th-century stepwell just below the fort, its criss-cross stairs a short walk from Amer town." },
          { time: "12:00", title: "Jal Mahal", text: "A pause by Man Sagar Lake on the way back, to see the palace that seems to float in the water." },
          { time: "17:00", title: "Nahargarh Fort at sunset", text: "The fort on the ridge above the city. Watch the light go down over Jaipur's rooftops from the walls." },
        ],
      },
      {
        title: "Craft and a slower day",
        summary: "Block printing in Bagru, an afternoon at Galta Ji and a folk evening.",
        stops: [
          { time: "09:00", title: "Bagru block printers", text: "A village about 30 km southwest of Jaipur where families still print cotton by hand with carved wooden blocks and natural dyes. Watch the printing, then try a block yourself." },
          { time: "13:00", title: "Lunch and a rest", text: "Back in the city for a long lunch and the hottest hours indoors." },
          { time: "16:30", title: "Galta Ji", text: "The temple complex in a gorge in the hills east of the city, with its spring-fed tanks and resident monkeys. Go in the late afternoon, when the light is warm." },
          { time: "19:30", title: "A Rajasthani music evening", text: "Folk musicians and dancers: an easy last evening before you move on." },
        ],
      },
    ],
    sights: [
      { name: "Hawa Mahal", text: "The latticed 'Palace of Winds', built in 1799 so the court could watch the street unseen.", image: "placeJaipur" },
      { name: "Amer Fort", text: "Ridge-top fort-palace of the Kachwaha rulers, part of the Hill Forts of Rajasthan World Heritage Site.", image: "trailAmber" },
      { name: "City Palace", text: "The royal residence since 1727, with the painted seasonal gates of Pritam Niwas Chowk.", image: "trailJaipur" },
      { name: "Jantar Mantar", text: "Jai Singh's 18th-century observatory of stone instruments, still accurate, and on UNESCO's list since 2010." },
    ],
    culture: [
      { title: "Block printing in Bagru", text: "Hand printing with carved teak blocks and natural dyes, a craft the village has kept for generations." },
      { title: "The bazaars", text: "Johari Bazaar for jewellery and gems, Bapu Bazaar for textiles and juttis, Kishanpol for craft workshops." },
      { title: "Folk music", text: "Rajasthani folk music and dance in the evening: songs of the desert and the court." },
      { title: "Food", text: "Pyaaz kachori for breakfast, dal baati churma for lunch and a glass of lassi in the old city." },
    ],
    gallery: ["placeJaipur", "trailAmber", "tourGoldenTrailG1", "trailJaipur", "tourGoldenTrailG2", "introDetail"],
    practical: [
      { label: "Getting there", value: "Jaipur International Airport is about 13 km from the old city. By road, Delhi is around 280 km, five hours or so." },
      { label: "Tickets", value: "A composite ticket covers several state-run monuments, Amer, Hawa Mahal, Jantar Mantar, Albert Hall and Nahargarh among them, over two days. The City Palace is ticketed separately." },
      { label: "Dress", value: "Light layers. Shoulders and knees covered for temples; shoes off where asked." },
      { label: "Weather", value: "October to March is the most comfortable. April to June is very hot; the monsoon arrives around July." },
    ],
    seo: { title: "Jaipur itinerary: three unhurried days", description: "A three-day Jaipur itinerary: Hawa Mahal, the City Palace, Jantar Mantar, Amer Fort at opening time and the block printers of Bagru." },
  },
  {
    slug: "udaipur",
    name: "Udaipur",
    devanagari: "उदयपुर",
    title: "Three days in Udaipur",
    lede: "Palaces on the water, a boat at first light and evenings on the ghats: the lake city at its own pace.",
    heroImage: "itinUdaipurHero",
    duration: { days: 3, label: "3 days · 2 nights", note: "Stay a fourth day for Ranakpur's marble Jain temple, about 90 km north." },
    facts: [
      { label: "Recommended stay", value: "3 days" },
      { label: "Best season", value: "October to March; after the monsoon the lakes are full" },
      { label: "Pace", value: "Slow: mornings on the water, long afternoons" },
      { label: "Good for", value: "Couples, photographers, a rest between forts" },
    ],
    intro: [
      "Maharana Udai Singh II founded Udaipur in 1559 on the eastern shore of Lake Pichola. The City Palace grew along that shore for the next three centuries, and the Lake Palace and Jag Mandir sit on their islands in the water.",
      "Udaipur is the place to slow down after the desert and the forts. This plan puts the palace first, keeps the water for early morning and late afternoon, and leaves the old city's lanes and workshops for wandering.",
    ],
    days: [
      {
        title: "The palace and the lake",
        summary: "The City Palace, a boat to Jag Mandir past the Lake Palace and the Dharohar dance evening.",
        stops: [
          { time: "09:30", title: "City Palace", text: "Begun in 1559 and added to by successive Maharanas, the palace runs along Pichola's shore in courtyards, balconies and mirrored rooms. The upper terraces look straight across the lake." },
          { time: "15:30", title: "Boat on Lake Pichola", text: "From the palace jetty, out past the Lake Palace and on to the island of Jag Mandir. The lake was created in the 14th century and enlarged when the city was founded." },
          { time: "16:15", title: "Jag Mandir", text: "A 17th-century island palace of pavilions and gardens, where Prince Khurram, later the emperor Shah Jahan, sheltered in the 1620s." },
          { time: "19:00", title: "Dharohar at Bagore ki Haveli", text: "A nightly performance of Rajasthani folk dance in the courtyard of an 18th-century haveli at Gangaur Ghat." },
        ],
      },
      {
        title: "Old city and gardens",
        summary: "Jagdish Temple, miniature painters, the Garden of the Maidens and sunset from the Monsoon Palace.",
        stops: [
          { time: "08:30", title: "Jagdish Temple", text: "A large Vishnu temple of 1651, a short walk up from the City Palace gate. The morning prayers are worth arriving for." },
          { time: "10:00", title: "Miniature painters", text: "Udaipur keeps the Mewar school of miniature painting alive. Watch an artist at work with squirrel-hair brushes and mineral colours." },
          { time: "12:00", title: "Saheliyon ki Bari", text: "The 18th-century 'Garden of the Maidens', with fountains, lotus pools and marble kiosks, near Fateh Sagar Lake." },
          { time: "17:30", title: "Sajjangarh at sunset", text: "The Monsoon Palace, built on a hilltop in 1884, looks over the lakes and the Aravalli hills as the sun goes down." },
        ],
      },
      {
        title: "First light and the hills",
        summary: "A dawn boat on a still lake, then a half day at the temples of Eklingji and Nagda.",
        stops: [
          { time: "06:30", title: "Pichola at dawn", text: "The lake is at its stillest before the tour boats start: palaces in soft light, washermen at the ghats and herons on the shore." },
          { time: "10:00", title: "Eklingji and Nagda", text: "About 22 km north: the walled Shiva temple of Eklingji, the Mewar rulers' family deity, and the carved 11th-century Sas-Bahu temples at Nagda by a quiet lake." },
          { time: "17:00", title: "Ambrai Ghat", text: "Back in the city for the classic view across the water to the City Palace as its lights come on." },
        ],
      },
    ],
    sights: [
      { name: "City Palace", text: "Three centuries of Mewar palaces in one long façade along Lake Pichola.", image: "idxUdaipur" },
      { name: "Lake Pichola", text: "The 14th-century lake at the heart of the city, best on the water at dawn.", image: "placeUdaipur" },
      { name: "Lake Palace", text: "Jag Niwas, built in the 1740s on its own island; now a hotel, seen from the water unless you're staying or dining.", image: "trailUdaipur" },
      { name: "Jag Mandir", text: "The island palace of pavilions where the future Shah Jahan took refuge in the 1620s." },
      { name: "Boats on the lake", text: "From the City Palace jetty to Jag Mandir in the afternoon, or out at first light.", image: "expPichola" },
    ],
    culture: [
      { title: "Dharohar folk dance", text: "Nightly performances of Rajasthani dance at Bagore ki Haveli, at Gangaur Ghat." },
      { title: "Mewar miniatures", text: "Painting workshops in the old city, working with fine brushes and mineral colours." },
      { title: "Life on the ghats", text: "Morning bathing and washing at Gangaur and Ambrai ghats; evening light on the water." },
      { title: "Food", text: "Dal baati churma, a thali on a rooftop and kachori in the old city lanes." },
    ],
    gallery: ["placeUdaipur", "expPichola", "idxUdaipur", "tourLakesForts", "trailUdaipur"],
    practical: [
      { label: "Getting there", value: "Maharana Pratap Airport at Dabok is about 22 km from the city. Jodhpur is around 250 km by road, Jaipur around 400 km." },
      { label: "On the lake", value: "Boats leave from the City Palace jetty and from ghats along the eastern shore; the Jag Mandir stop is included on many trips." },
      { label: "Dress", value: "Light layers, and a shawl for the boat at dawn. Shoulders and knees covered for temples." },
      { label: "Weather", value: "October to March is the most comfortable. After a good monsoon (July to September) the lakes are full and the hills are green." },
    ],
    seo: { title: "Udaipur itinerary: three days on the lakes", description: "A three-day Udaipur itinerary: the City Palace, a boat on Lake Pichola past the Lake Palace to Jag Mandir, the old city and a dawn on the water." },
  },
];

export const getItinerary = (slug: string) => itineraries.find((i) => i.slug === slug);
export const hasItinerary = (slug: string) => itineraries.some((i) => i.slug === slug);
