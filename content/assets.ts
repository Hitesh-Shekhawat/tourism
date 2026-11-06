/**
 * Asset registry: the single source of truth for every photo and video slot on the site.
 * Until a key is mapped in content/imageSources.ts or has a valid public src, <Photo> renders a
 * dune-coloured placeholder at the final ratio, showing the filename and brief below. To add a
 * local photo, import it from assets/ in content/imageSources.ts and map it to the key. Keep public
 * src values only for files already served from public/images/.
 * `npm run assets:brief` regenerates ASSET_BRIEF.md from this file.
 */
export type Ratio = "4:5" | "3:2" | "21:9" | "16:9";

export type Asset = {
  file: string;
  ratio: Ratio;
  section: string;
  subject: string;
  time: string;
  minRes: string;
  mood: string;
  alt: string;
  src?: string;
  width?: number;
  height?: number;
};

const R: Record<Ratio, string> = { "4:5": "1600×2000", "3:2": "2400×1600", "21:9": "2520×1080", "16:9": "1920×1080" };

const a = (
  file: string,
  ratio: Ratio,
  section: string,
  subject: string,
  time: string,
  mood: string,
  alt: string,
  supplied?: { src: string; width: number; height: number },
): Asset => ({
  file,
  ratio,
  section,
  subject,
  time,
  minRes: R[ratio],
  mood,
  alt,
  ...supplied,
});

/** A sight photo for the state page: 4:5 portrait, the sight's own subject and alt. */
const s = (file: string, subject: string, time: string, alt: string) => a(`sight-${file}`, "4:5", "State page · a city's sights (horizontal track)", subject, time, "Clear, characterful, no identifiable faces", alt);

export const assets = {

  /* Home: introduction */
  introArch: a("intro-amber-fort-corridor-morning.jpg", "4:5", "Ch01 Intro · 06:15 · Amer (morning light; arch-cropped)", "Arched corridor or jharokha inside Amber Fort, carved sandstone, a sliver of light", "Early morning, side light", "Quiet, architectural, no people", "Light falling through a carved sandstone arch at Amber Fort"),
  introDetail: a("intro-hand-detail-block-print.jpg", "4:5", "Ch01 Intro · 06:15 · Amer (morning light; arch-cropped)", "Close detail: a wooden printing block pressed on cotton, hands only", "Daylight, open shade", "Tactile, intimate, shallow depth", "Hands pressing a carved wooden block onto cotton"),

  /* Home: destinations index (one distinct photo per city) */
  idxJaipur: a("dest-index-jaipur-hawa-mahal-facade.jpg", "4:5", "Ch02 Hours of Rajasthan · 08:00 (sundial cards, arch-cropped 4:5)", "Hawa Mahal façade, tight vertical crop of the windows", "Early morning (east-facing façade lit)", "Graphic, pink sandstone, clean", "The honeycomb windows of Hawa Mahal, Jaipur", { src: "/images/dest-index-jaipur-hawa-mahal-facade.jpg", width: 1376, height: 768 }),
  idxUdaipur: a("dest-index-udaipur-city-palace-pichola.jpg", "4:5", "Ch02 Hours of Rajasthan · 08:00 (sundial cards, arch-cropped 4:5)", "City Palace rising from Lake Pichola", "Late afternoon, warm", "Reflective, calm water", "City Palace reflected in Lake Pichola, Udaipur"),
  idxJaisalmer: a("dest-index-jaisalmer-fort-walls.jpg", "4:5", "Ch02 Hours of Rajasthan · 08:00 (sundial cards, arch-cropped 4:5)", "Golden walls and bastions of Jaisalmer Fort", "Sunset, raking light", "Monolithic, honey-gold", "The sandstone bastions of Jaisalmer Fort at sunset", { src: "/images/dest-index-jaisalmer-fort-walls.jpg", width: 1376, height: 768 }),
  idxJodhpur: a("dest-index-jodhpur-blue-lane.jpg", "4:5", "Ch02 Hours of Rajasthan · 08:00 (sundial cards, arch-cropped 4:5)", "Narrow lane of blue houses in the old city below Mehrangarh", "Morning shade", "Indigo and lime-wash, quiet", "A blue-washed lane in Jodhpur's old city", { src: "/images/dest-index-jodhpur-blue-lane.jpg", width: 1376, height: 768 }),
  idxPushkar: a("dest-index-pushkar-ghats.jpg", "4:5", "Ch02 Hours of Rajasthan · 08:00 (sundial cards, arch-cropped 4:5)", "White ghats stepping into Pushkar Lake", "Dawn", "Soft, devotional, mist", "The ghats of Pushkar Lake at dawn", { src: "/images/dest-index-pushkar-ghats.jpg", width: 1376, height: 768 }),
  idxBikaner: a("dest-index-bikaner-junagarh-detail.jpg", "4:5", "Ch02 Hours of Rajasthan · 08:00 (sundial cards, arch-cropped 4:5)", "Red sandstone and painted detail at Junagarh Fort", "Midday open shade (interior)", "Rich, ornamental", "Painted detail inside Junagarh Fort, Bikaner"),

  /* Home: the Golden Trail chapters */
  trailJaipur: a("trail-01-jaipur-city-palace-gate.jpg", "4:5", "Ch03 The Golden Trail · 11:00–16:00 (stop cards, arch-cropped)", "A painted gateway in Jaipur's City Palace courtyard", "Morning", "Colour, symmetry", "A painted gateway in the City Palace, Jaipur"),
  trailAmber: a("trail-02-amber-fort-ramparts-dawn.jpg", "4:5", "Ch03 The Golden Trail · 11:00–16:00 (stop cards, arch-cropped)", "Amber Fort and its ramparts over Maota Lake", "Dawn", "Mist, scale", "Amber Fort above Maota Lake at dawn"),
  trailUdaipur: a("trail-03-udaipur-palaces-pichola.jpg", "4:5", "Ch03 The Golden Trail · 11:00–16:00 (stop cards, arch-cropped)", "Udaipur's palaces reflected on Lake Pichola", "First light", "Still water, pastel", "Palaces reflected on Lake Pichola at first light, Udaipur"),
  trailJodhpur: a("trail-04-jodhpur-mehrangarh-above-blue-city.jpg", "4:5", "Ch03 The Golden Trail · 11:00–16:00 (stop cards, arch-cropped)", "Mehrangarh on its ridge above the blue city", "Late afternoon", "Monumental, indigo rooftops", "Mehrangarh fort above Jodhpur's blue rooftops"),
  trailJaisalmer: a("trail-05-jaisalmer-camel-train-sunset.jpg", "4:5", "Ch03 The Golden Trail · 11:00–16:00 (stop cards, arch-cropped)", "A camel train crossing the Thar dunes near Jaisalmer", "Sunset", "Vast, warm, cinematic", "A camel train crossing the dunes near Jaisalmer at sunset"),

  /* Home: signature experiences mosaic */
  expPichola: a("exp-dawn-lake-pichola-wide.jpg", "21:9", "Ch05 Ganjifa deck · 18:10 (circular crop: keep the subject centred)", "Lake Pichola from the water, palaces along the shore", "Dawn", "Cinematic, hushed", "Lake Pichola from a boat at dawn"),
  expThar: a("exp-night-thar-camp.jpg", "4:5", "Ch05 Ganjifa deck · 18:10 (circular crop: keep the subject centred)", "Lantern-lit desert camp under a deep blue sky", "Blue hour", "Intimate, lantern warmth", "A lantern-lit camp in the Thar at blue hour"),
  expBagru: a("exp-bagru-block-printing.jpg", "4:5", "Ch05 Ganjifa deck · 18:10 (circular crop: keep the subject centred)", "An artisan pressing a carved block onto cotton cloth", "Daylight", "Tactile, natural dyes", "An artisan hand-block-printing cotton cloth in Rajasthan"),
  expBlueCity: a("exp-walking-blue-city-steps.jpg", "3:2", "Ch05 Ganjifa deck · 18:10 (circular crop: keep the subject centred)", "Steps and doorways in Jodhpur's old city", "Morning", "Texture, everyday life (no identifiable faces)", "Blue steps and doorways in Jodhpur's old city"),
  expAarti: a("exp-pushkar-evening-aarti.jpg", "3:2", "Ch05 Ganjifa deck · 18:10 (circular crop: keep the subject centred)", "Lamps on the ghats of Pushkar during evening aarti", "Dusk", "Flame, reflection, reverent", "Lamps on the ghats of Pushkar at evening aarti"),
  expStepwell: a("exp-chand-baori-stepwell.jpg", "3:2", "Ch05 Ganjifa deck · 18:10 (circular crop: keep the subject centred)", "The geometric steps of Chand Baori, Abhaneri", "Midday, overhead light", "Geometric, shadow pattern", "The geometric steps of Chand Baori stepwell, Abhaneri"),

  /* Tours: hero / card image (shared element between card and tour hero) + gallery */
  tourGoldenTrail: a("tour-golden-trail-hero.jpg", "3:2", "Ch06 tickets + journey sheet · The Golden Trail", "Jaisalmer Fort glowing over the town at dusk", "Dusk", "Warm, epic but calm", "Jaisalmer Fort above the town at dusk"),
  tourGoldenTrailG1: a("tour-golden-trail-gallery-1.jpg", "4:5", "Ch06 tickets + journey sheet · The Golden Trail gallery", "A carved sandstone corridor inside Amer Fort", "Morning", "Warm, architectural", "A carved sandstone corridor inside Amer Fort"),
  tourGoldenTrailG2: a("tour-golden-trail-gallery-2.jpg", "4:5", "Ch06 tickets + journey sheet · The Golden Trail gallery", "A historic courtyard at a Jaipur palace", "Morning", "Red sandstone, symmetry", "A historic courtyard at a Jaipur palace"),
  tourLakesForts: a("tour-lakes-and-forts-hero.jpg", "3:2", "Ch06 tickets + journey sheet · Lakes & Forts", "Carved marble balconies overlooking Lake Pichola", "Golden hour", "Soft, reflective", "Carved marble balconies overlooking Lake Pichola, Udaipur"),
  tourLakesFortsG1: a("tour-lakes-and-forts-gallery-1.jpg", "4:5", "Ch06 tickets + journey sheet · Lakes & Forts gallery", "Hand-printed fabric and natural dyes", "Daylight", "Colour, abundance (no faces)", "Fabric being hand-printed with natural dyes in Rajasthan"),
  tourLakesFortsG2: a("tour-lakes-and-forts-gallery-2.jpg", "4:5", "Ch06 tickets + journey sheet · Lakes & Forts gallery", "Historic palace courtyard in Rajasthan", "Morning", "Quiet, architectural", "A historic courtyard at a Jaipur palace"),
  tourDesert: a("tour-desert-and-dunes-hero.jpg", "3:2", "Ch06 tickets + journey sheet · Desert & Dunes", "A camel train crossing the Thar dunes", "Sunset", "Vast, warm, adventurous", "A camel train crossing the dunes near Jaisalmer"),
  tourDesertG1: a("tour-desert-and-dunes-gallery-1.jpg", "4:5", "Ch06 tickets + journey sheet · Desert & Dunes gallery", "Jaisalmer Fort walls in warm light", "Sunset", "Golden sandstone", "The sandstone walls of Jaisalmer Fort"),
  tourDesertG2: a("tour-desert-and-dunes-gallery-2.jpg", "4:5", "Ch06 tickets + journey sheet · Desert & Dunes gallery", "Lantern-lit tents at a desert camp", "Blue hour", "Warm lanterns, cool sky", "A lantern-lit desert camp under a starry sky"),

  /* Destination pages: heroes (distinct from the index photos) */
  destJaipur: a("dest-jaipur-hero-amber-rampart-walk.jpg", "21:9", "Destination · Jaipur hero", "The ridge walls running from Amber towards Jaigarh", "Golden hour", "Panoramic", "The ramparts above Amber running along the Aravalli ridge, Jaipur"),
  destUdaipur: a("dest-udaipur-hero-lake-palaces.jpg", "21:9", "Destination · Udaipur hero", "Udaipur's palaces reflected on Lake Pichola", "Dusk", "Serene, reflective", "Udaipur's palaces reflected on Lake Pichola at dusk"),
  destJaisalmer: a("dest-jaisalmer-hero-camel-dunes.jpg", "21:9", "Destination · Jaisalmer hero", "A camel train crossing dunes beyond Jaisalmer", "Sunset", "Vast, warm", "Camels crossing the dunes near Jaisalmer at sunset"),
  destJodhpur: a("dest-jodhpur-hero-mehrangarh.jpg", "21:9", "Destination · Jodhpur hero", "Mehrangarh Fort above Jodhpur's blue rooftops", "Late afternoon", "Monumental, indigo rooftops", "Mehrangarh Fort above Jodhpur's blue rooftops"),
  destPushkar: a("dest-pushkar-hero-evening-aarti.jpg", "21:9", "Destination · Pushkar hero", "Evening aarti on the ghats of Pushkar Lake", "Dusk", "Flame, reflection, reverent", "Evening aarti on the ghats of Pushkar Lake"),
  destBikaner: a("dest-bikaner-hero-old-city-haveli.jpg", "21:9", "Destination · Bikaner hero", "Red sandstone havelis of Bikaner's old city", "Morning", "Rich red, quiet street", "Red sandstone havelis in Bikaner's old city"),

  /* Home (v4): hero, services, packages, gallery, final band. Footage for the hero goes in content/homepage.ts → heroVideo. */
  homeHero: a("home-hero-dawn-lake-pichola.jpg", "16:9", "Home · Hero (full-bleed, text sits bottom-left; keep the subject right of centre)", "Dawn across Lake Pichola, with Udaipur's palaces along the shore; also the poster frame for the hero video", "Dawn", "Cinematic, still water, warm", "Udaipur's palaces reflected on Lake Pichola at dawn"),
  homeServices: a("home-services-driver-heritage-gate.jpg", "4:5", "Home · Why travel with us", "A private car waiting at a heritage hotel gate, driver beside it (real staff, signed release)", "Morning", "Calm, attentive, unposed", "A private car and driver waiting at a heritage hotel gate"),
  pkgWeekend: a("pkg-weekend-amber-ramparts.jpg", "3:2", "Home · Packages (hover zooms the photo; keep edges simple)", "Amber Fort and the ridge at sunrise", "Sunrise", "Short escape, golden", "Amber Fort at sunrise above Maota Lake, Jaipur"),
  pkgFamily: a("pkg-family-city-palace-courtyard.jpg", "3:2", "Home · Packages (hover zooms the photo; keep edges simple)", "Open palace courtyard with space to wander (no identifiable faces)", "Morning", "Easy, spacious, bright", "An open palace courtyard in Rajasthan in the morning"),
  pkgCouple: a("pkg-couple-lake-pichola-dusk.jpg", "3:2", "Home · Packages (hover zooms the photo; keep edges simple)", "Palaces reflected in Lake Pichola", "Dusk", "Romantic, quiet", "Palaces reflected on Lake Pichola, Udaipur"),
  pkgLuxury: a("pkg-luxury-heritage-suite.jpg", "3:2", "Home · Packages (hover zooms the photo; keep edges simple)", "A heritage palace hotel suite or terrace (only a property you actually book)", "Golden hour", "Quiet luxury", "A heritage palace hotel terrace in golden light"),
  pkgHeritage: a("pkg-heritage-amer-fort-corridor.jpg", "3:2", "Home · Packages (hover zooms the photo; keep edges simple)", "A carved sandstone corridor inside Amer Fort", "Morning", "Warm, architectural", "A carved sandstone corridor inside Amer Fort"),
  pkgDesert: a("pkg-desert-camel-ridge-sunset.jpg", "3:2", "Home · Packages (hover zooms the photo; keep edges simple)", "Camels on a dune ridge near Jaisalmer", "Sunset", "Vast, warm, adventurous", "Camels crossing a dune ridge near Jaisalmer at sunset"),
  galAerial: a("gallery-aerial-jaipur-old-city.jpg", "16:9", "Home · Gallery (asymmetric; each slot is cropped with object-fit: cover)", "Drone view over Jaipur's walled city and Hawa Mahal", "Early morning", "Graphic, pink grid", "Aerial view over Jaipur's walled city"),
  galFortGate: a("gallery-fort-gate-suraj-pol.jpg", "4:5", "Home · Gallery (asymmetric; each slot is cropped with object-fit: cover)", "A painted peacock gate in a palace courtyard", "Morning", "Colour, symmetry", "A peacock gate in a historic palace courtyard"),
  galPalace: a("gallery-palace-interior-sheesh-mahal.jpg", "4:5", "Home · Gallery (asymmetric; each slot is cropped with object-fit: cover)", "A historic courtyard at a Jaipur palace", "Morning", "Quiet, architectural", "A historic courtyard at a Jaipur palace"),
  galCamp: a("gallery-desert-camp-night.jpg", "3:2", "Home · Gallery (asymmetric; each slot is cropped with object-fit: cover)", "Desert camp tents lit at blue hour", "Blue hour", "Warm lanterns, cool sky", "Desert camp tents lit at blue hour near Jaisalmer"),
  galCamel: a("gallery-camel-ride-sunset.jpg", "21:9", "Home · Gallery (asymmetric; each slot is cropped with object-fit: cover)", "A camel train crossing the dunes at sunset", "Sunset", "Wide, cinematic", "A camel train crossing the dunes near Jaisalmer"),
  galStreet: a("gallery-jodhpur-street-doorway.jpg", "4:5", "Home · Gallery (asymmetric; each slot is cropped with object-fit: cover)", "Painted doorway on a Rajasthani street", "Daylight", "Colour, texture (no identifiable faces)", "A painted doorway on a street in Rajasthan"),
  galLakeHotel: a("gallery-lake-heritage-hotel.jpg", "3:2", "Home · Gallery (asymmetric; each slot is cropped with object-fit: cover)", "Udaipur City Palace beside Lake Pichola", "Late afternoon", "Reflective, serene", "Udaipur City Palace beside Lake Pichola"),
  galCulture: a("gallery-folk-music-detail.jpg", "4:5", "Home · Gallery (asymmetric; each slot is cropped with object-fit: cover)", "Folk musician's hands on a kamaicha or dholak (hands only)", "Evening", "Intimate, rhythmic", "Hands playing a folk instrument in Rajasthan"),
  homeFinal: a("home-final-mehrangarh-jodhpur.jpg", "21:9", "Home · Final call to action (dark overlay; keep the top third calm)", "Mehrangarh Fort above Jodhpur's blue rooftops", "Late afternoon", "Cinematic, an ending", "Mehrangarh Fort above Jodhpur's blue rooftops"),

  /* Home: FAQ + final CTA band */

  /* Our story */
  storyFounder: a("our-story-founder-portrait.jpg", "4:5", "Our story", "The founder (real person, signed release)", "Open shade", "Natural, unposed", "{{FOUNDER_NAME}}, founder of {{BRAND_NAME}}"),
  storyTeam: a("our-story-team-on-trip.jpg", "3:2", "Our story", "The real team or a real guide on a real trip (releases signed)", "Daylight", "Candid", "The {{BRAND_NAME}} team on the road in Rajasthan"),

  /* Home: trending places + the atlas (destination cards and the map's information card) */
  placeJaipur: a("place-jaipur-hawa-mahal.jpg", "4:5", "Home · Trending places and the atlas card", "Hawa Mahal's façade of latticed windows", "Morning", "Pink sandstone, graphic", "The latticed façade of Hawa Mahal, Jaipur"),
  placeUdaipur: a("place-udaipur-pichola-dawn.jpg", "4:5", "Home · Trending places and the atlas card", "Lake Pichola at dawn, palaces on the shore", "Dawn", "Still water, soft light", "Lake Pichola at dawn, Udaipur"),
  placeJaisalmer: a("place-jaisalmer-fort-walls.jpg", "4:5", "Home · Trending places and the atlas card", "Jaisalmer Fort's bastions rising from the town", "Late afternoon", "Honey-gold stone", "The bastions of Jaisalmer Fort"),
  placeJodhpur: a("place-jodhpur-old-city-lane.jpg", "4:5", "Home · Trending places and the atlas card", "A lane in Jodhpur's old city", "Morning", "Indigo walls, quiet", "A lane in Jodhpur's old city"),
  placePushkar: a("place-pushkar-lake-ghats.jpg", "4:5", "Home · Trending places and the atlas card", "Temples and ghats around Pushkar Lake", "Dawn", "Devotional, calm", "Temples and ghats around Pushkar Lake"),
  placeMountAbu: a("place-mount-abu-nakki-lake.jpg", "4:5", "Home · Trending places and the atlas card", "Nakki Lake among the Aravalli hills at Mount Abu", "Morning", "Green hills, cool air", "Nakki Lake in the hills at Mount Abu"),
  placeBikaner: a("place-bikaner-junagarh.jpg", "4:5", "Home · the atlas card", "Junagarh Fort's red sandstone façade", "Morning", "Rich red stone", "The red sandstone façade of Junagarh Fort, Bikaner"),

  /* Itineraries: Jaipur and Udaipur (hero + gallery reuse the photos above) */
  itinJaipurHero: a("itinerary-jaipur-amer-sunrise.jpg", "21:9", "Itinerary · Jaipur hero", "Amer Fort above Maota Lake at sunrise", "Sunrise", "Warm, wide", "Amer Fort above Maota Lake at sunrise"),
  itinUdaipurHero: a("itinerary-udaipur-palaces-pichola.jpg", "21:9", "Itinerary · Udaipur hero", "Udaipur's palaces reflected on Lake Pichola", "Golden hour", "Serene, reflective", "Udaipur's palaces reflected on Lake Pichola"),

  /* State page (/explore/rajasthan): the sights in each city's horizontal track (content/sights.ts) */
  sightJalMahal: s("jaipur-jal-mahal.jpg", "Jal Mahal on Man Sagar Lake", "Late afternoon", "Aerial view of Jal Mahal on Man Sagar Lake, Jaipur"),
  sightJantarMantar: s("jaipur-jantar-mantar.jpg", "The giant stone instruments of Jantar Mantar", "Morning, raking light", "The stone instruments of Jantar Mantar, Jaipur"),
  sightNahargarh: s("jaipur-nahargarh-dusk.jpg", "Nahargarh's walls with Jaipur below", "Dusk, city lights", "Jaipur seen from the walls of Nahargarh Fort at dusk"),
  sightLakePalace: s("udaipur-lake-palace.jpg", "The Lake Palace (Jag Niwas) on its island", "Golden hour", "The white Lake Palace on its island in Lake Pichola"),
  sightJagMandir: s("udaipur-jag-mandir.jpg", "Jag Mandir's pavilions and stone elephants", "Sunset", "Jag Mandir island palace on Lake Pichola"),
  sightBagore: s("udaipur-bagore-ki-haveli.jpg", "Bagore ki Haveli courtyard or façade on Gangaur Ghat", "Evening", "Bagore ki Haveli on Gangaur Ghat, Udaipur"),
  sightSaheliyon: s("udaipur-saheliyon-ki-bari.jpg", "Fountains and lotus pool, Saheliyon ki Bari", "Morning", "Fountains in the Saheliyon ki Bari garden, Udaipur"),
  sightSajjangarh: s("udaipur-sajjangarh.jpg", "Sajjangarh Monsoon Palace on its hilltop", "Sunset", "The Monsoon Palace on its hill above Udaipur"),
  sightPatwon: s("jaisalmer-patwon-ki-haveli.jpg", "Carved balconies of Patwon ki Haveli", "Morning", "The carved sandstone balconies of Patwon ki Haveli, Jaisalmer"),
  sightGadisar: s("jaisalmer-gadisar-lake.jpg", "Gadisar Lake with its shrines and gateway", "Dawn", "Shrines and ghats around Gadisar Lake, Jaisalmer"),
  sightKuldhara: s("jaisalmer-kuldhara.jpg", "Roofless stone houses at Kuldhara", "Late afternoon", "The abandoned stone village of Kuldhara near Jaisalmer"),
  sightBadaBagh: s("jaisalmer-bada-bagh.jpg", "Rows of chhatris at Bada Bagh", "Sunset", "The royal cenotaphs of Bada Bagh at sunset"),
  sightJaswantThada: s("jodhpur-jaswant-thada.jpg", "Jaswant Thada's white marble cenotaph", "Morning", "The white marble cenotaph of Jaswant Thada, Jodhpur"),
  sightUmaidBhawan: s("jodhpur-umaid-bhawan.jpg", "Umaid Bhawan Palace's dome and façade", "Late afternoon", "Umaid Bhawan Palace on Chittar Hill, Jodhpur"),
  sightClockTower: s("jodhpur-clock-tower-market.jpg", "The Ghanta Ghar above Sardar Market (no identifiable faces)", "Morning bustle", "The clock tower above Sardar Market, Jodhpur"),
  sightMandore: s("jodhpur-mandore-gardens.jpg", "Temple-like cenotaphs at Mandore Gardens", "Morning", "The red sandstone cenotaphs at Mandore, Jodhpur"),
  sightBrahmaTemple: s("pushkar-brahma-temple.jpg", "The red spire of the Brahma Temple", "Morning", "The Brahma Temple, Pushkar"),
  sightSavitri: s("pushkar-savitri-temple-view.jpg", "View from Savitri Temple over Pushkar", "Sunrise", "Pushkar and its lake seen from the Savitri Temple"),
  sightPushkarFair: s("pushkar-camel-fair.jpg", "Camels on the fair grounds at Pushkar", "Golden hour", "Camels gathered for the Pushkar fair"),
  sightDilwara: s("mount-abu-dilwara-temples.jpg", "Carved marble at the Dilwara Temples (where photography is allowed)", "Daylight", "Carved white marble at the Dilwara Temples, Mount Abu"),
  sightGuruShikhar: s("mount-abu-guru-shikhar.jpg", "The summit of Guru Shikhar and its temple", "Morning", "The temple on the summit of Guru Shikhar, Mount Abu"),
  sightSunsetPoint: s("mount-abu-sunset-point.jpg", "Hills falling to the plains from Sunset Point", "Sunset", "The view from Sunset Point, Mount Abu"),
  sightAchalgarh: s("mount-abu-achalgarh.jpg", "Achalgarh fort walls and temple", "Morning", "The hill fort at Achalgarh near Mount Abu"),
  sightKarniMata: s("bikaner-karni-mata-temple.jpg", "The silver doors of Karni Mata Temple", "Daylight", "The carved silver doors of Karni Mata Temple, Deshnoke"),
  sightRampuria: s("bikaner-rampuria-havelis.jpg", "Red sandstone façades of the Rampuria Havelis", "Morning", "The carved façades of the Rampuria Havelis, Bikaner"),
  sightLalgarh: s("bikaner-lalgarh-palace.jpg", "Lalgarh Palace's red sandstone façade", "Late afternoon", "Lalgarh Palace, Bikaner"),
  sightCamelFarm: s("bikaner-camel-research-farm.jpg", "Camels and calves at the national camel centre", "Morning", "Camels at the national research centre near Bikaner"),

  /* 404 */
  notFound: a("404-dune-horizon.jpg", "21:9", "404 page", "A lone set of footprints over a dune", "Late afternoon", "Minimal, wry", "Footprints leading over a dune"),
} satisfies Record<string, Asset>;

export type AssetKey = keyof typeof assets;
