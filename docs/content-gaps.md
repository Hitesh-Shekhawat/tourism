# Content gaps

Everything the enhanced homepage needs but the project does not hold. Nothing here was invented: until an item is supplied, its block shows a "Placeholder: replace with …" label in development and is **absent from production builds**. Business facts (`{{…}}`) are also listed in `BUSINESS_INFO_REQUIRED.md` (`npm run placeholders`) and block the production build until filled.

| Section | Item | Subject / content needed | Orientation | Min. resolution | Notes |
|---|---|---|---|---|---|
| 01 Hero | Hero photograph, higher resolution | Hawa Mahal façade, morning light, clean sky top-left for the headline | Landscape 16:9 (art-direct a 4:5 mobile crop) | 2560×1440 | Current file is 1376×768: soft on large/2× screens. **Confirm provenance**: its signage looks AI-generated |
| 01 Hero | Optional hero loop | 10–20 s muted Hawa Mahal or old-city loop + poster | 16:9 + 9:16 mobile cut | 1920×1080 | ≤ 3 MB; `content/homepage.ts → heroVideo` |
| All | Photo provenance and licences | Source and licence for every hashed file in `assets/` | — | — | Add to `content/credits.ts`; replace any AI-generated image with real photography before launch |
| 02 Trending | Larger city photos | Jaipur, Udaipur, Jaisalmer, Jodhpur, Pushkar, Mount Abu | Portrait 4:5 (Jaipur also 16:9 for the wide card) | 1600×2000 | Current files are 1376×768 landscape, cropped to portrait |
| 02 Trending | Mount Abu destination page | Destination guide (`content/destinations.ts`) | — | — | Until then its card opens the atlas view |
| 03 Experience | Hills tile photo | Aravalli hills / Mount Abu, sharp | Landscape 3:2 | 2400×1600 | Commons file 1285×886 is visibly soft |
| 04 Atlas | District boundaries | Licensed Rajasthan district GeoJSON (Survey of India–compliant) | — | — | Needed for "highlight its district" on marker hover; not implemented without it |
| 05 Memories | Memory film | 20–40 s muted film (desert evening → stars) + 16:9 poster | Landscape 16:9 | 1920×1080 | H.264 MP4 ≤ 3 MB; set `video` + `ready: true` on the `film` item |
| 05 Memories | Cultural performance | Folk music or dance on one of your journeys, performers' consent on file | Portrait 4:5 | 1600×2000 | `music` item |
| 05 Memories | Rajasthani food | A meal served on one of your journeys | 4:5 or 3:2 | 1600 px short side | `food` item |
| 05 Memories | Guest photos (optional) | Real guests, written permission | Any | 1600 px short side | Mark `guest: true`; never use stock or generated people |
| 05 Memories | Exact locations | Confirm the location label of each photo (e.g. the peacock gate is captioned "City Palace, Jaipur", the craft photo just "Rajasthan") | — | — | Captions use what the project's asset registry already states |
| 06 Journeys | Confirmed journeys | Real route, days, inclusions, travel style; set `draft: false` | — | — | All 3 tours in `content/tours/` are sample drafts → section hidden in production |
| 06 Journeys | Prices | `priceFromINR` + `priceBasis` per journey, only if published | — | — | Omitted entirely when absent |
| 07 Stories | Guest stories | Name, destination, quote, photo/video, written permission | Portrait 4:5 or 16:9 video | 1600×2000 / 1080p | `travellerStories`, `reviews`. Section hidden in production until one exists |
| 07 Stories | Verified ratings | Link to a review platform (e.g. Google reviews URL) | — | — | `business.googleReviewsUrl`; no rating shown without it |
| 08 Why us | Confirmation of each claim | Set `offered: true/false` for: curated itineraries, local expertise, personalised journeys, comfortable arrangements, cultural experiences, dedicated assistance | — | — | `content/homepage.ts → services`. Section hidden in production until one is confirmed |
| 09 CTA | WhatsApp number | Business WhatsApp, digits only | — | — | `business.whatsappNumber`; button hidden until set |
| 09 CTA | Enquiry delivery | `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL`, Turnstile keys | — | — | Without them the form fails honestly |
| 10 Footer | Brand name, statement | `brandName`, `brandStatement` | — | — | Brand name blocks the production build |
| 10 Footer | Contact rows | Phone, email, street, city, PIN, office hours | — | — | Each row hidden in production until real |
| 10 Footer | GSTIN | Real GSTIN or `""` if not applicable | — | — | Row hidden until set |
| SEO | Live domain | `NEXT_PUBLIC_SITE_URL` | — | — | Canonicals, sitemap, OG; blocks the production build |
