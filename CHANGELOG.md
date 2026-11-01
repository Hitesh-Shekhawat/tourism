# Changelog

## 0.4.1 · 2026-11-01: the atlas goes flat

- The atlas map is now 2D (SVG, `components/explorer/AtlasMap2D.tsx`): open states in orange, every other state in grey, white borders. Rajasthan carries a pulsing "Rajasthan" marker on the India map; the opened state is drawn alone in orange with its pins. Hovering a pin shows its name and summary in the tooltip.
- three.js is no longer loaded on the home page. The 3D scenes in `components/explorer/gl/` and `lib/geo/relief.ts` are unused and can be deleted (kept for now in case the 3D view comes back). The zoom and reset tools went with them; "India map" (back) and the breadcrumbs remain.
- Places can put their label under the pin (`labelBelow`), used for Mount Abu beside Udaipur.

## 0.4.0 · 2026-11-01: v5, the atlas home page

### What changed
- **Home page flow:** header → trending places (with the `<h1>`) → "What are you looking for?" → the interactive 3D atlas → featured journeys, services, packages, stories, gallery, closing enquiry → footer. The v4 `Hero` and `Discover` sections are no longer placed (their files remain).
- **The atlas** (`components/explorer/`): a 3D map of India's states from real boundaries (DataMeet, CC BY 4.0; `scripts/build-geo.mjs` → `public/geo/`). Hover lifts a state and shows its name; choosing one highlights it, flies the camera in, fades India out and raises that state as its own object (GSAP). Rajasthan is open, with seven pins at their real coordinates (Jaipur, Udaipur, Jaisalmer, Jodhpur, Pushkar, Mount Abu, Bikaner), hover previews and a place card. Every other state opens as a map with a "coming soon" note. Orbit, zoom, pan and reset on state maps.
- **URLs and history:** `/?state=rajasthan&place=jaipur` (pushState), so links can be shared and the browser's back button walks back out through the map without a reload.
- **Itineraries:** `/destinations/jaipur/itinerary` and `/destinations/udaipur/itinerary` from `content/itineraries.ts` (day by day, sights, culture, gallery, practical notes, enquiry, TouristTrip JSON-LD, in the sitemap). Other places show their card and "itinerary coming soon"; their itinerary URLs 404 instead of showing an empty plan.
- **Data apart from rendering:** geometry in `public/geo`, projection and relief in `lib/geo/`, places and open states in `content/explorer.ts`. Opening another state means adding it to `openStates` and giving it places.
- **Performance and fallbacks:** three.js and the scenes are one lazy chunk, fetched as the atlas nears the viewport and not rendering while it is off screen; state geometry is fetched only when that state opens. Without WebGL (or if the context is lost) the same atlas renders as SVG. All navigation also works through DOM controls (breadcrumbs, state list, place list, card), by keyboard and screen reader.
- Photos: five unused photos from `assets/` now on the trending cards and place cards; Mount Abu (public domain) and Bikaner (CC BY 4.0) from Wikimedia Commons, credited in `content/credits.ts`.
- Nav: "Atlas" links to `/#explore`. Header is transparent over the itinerary heroes.

### Honest limits
The relief on state maps is stylised (an Aravalli ridge and dune ripples, `lib/geo/relief.ts`), not survey elevation data, and is credited as such. Lakshadweep's islands are too small for the India view at this simplification and do not appear there.

## 0.3.0 · 2026-10-31: v4, editorial home page; the story moves to /story

### What changed
- **`/` is a new home page** built from the same tokens, type, `Photo`, enquiry pipeline and motion runtime as the story: hero with an integrated quick enquiry (posts to `/api/enquiry`), featured journeys (pinned horizontal scroll on desktop, swipe carousel below 1024px), destinations & experiences (editorial layout, clip-path reveals, an expanding lead image, a sticky experience preview), why travel with us, packages by category, traveller stories (hidden until real), an asymmetric gallery with depth parallax, and a closing CTA with the full enquiry form.
- **Hero quick enquiry, redesigned:** a soft frosted panel in two short steps (trip, then contact) with a progress bar, chosen mostly by tapping (destination chips, a travellers stepper, a duration segmented control, travel-type tiles with icons), a live trip summary with Edit, filled inputs with floating labels and valid-state ticks, and a gradient pill submit with a sending shimmer. All choices stay native radios/inputs (keyboard and screen-reader friendly); same validation, API and thank-you flow.
- **The scroll story is unchanged at `/story`** ("One Day" in the nav). The HUD, splash-held 3D and all chapters work as before.
- Sheets (journeys, destinations) now keep the scroll of whichever page they open over, not only the story's.
- Lenis: `anchors` (in-page links glide, clear of the header) and `allowNestedScroll` (native swipes on horizontal carousels).
- Footer: tour categories and quick links columns; "WhatsApp enquiry".
- Accessibility: header logo link's name now starts with the visible wordmark (WCAG 2.5.3).
- 17 new photo slots (hero, services, six packages, eight gallery frames, closing band) in `content/assets.ts` → ASSET_BRIEF.md. Optional hero footage slot in `content/homepage.ts` → `heroVideo`.

### Nothing invented
Services render with a visible `{{OWNER TO CONFIRM}}` chip until each is set `offered: true` (or `false` to hide it). Package categories show only real journeys from `content/tours` (currently three sample drafts, each with its "Owner to supply" notice); a category with no fitting journey shows a placeholder instead of a made-up package. Prices appear only where `priceFromINR` is set. Video testimonials and reviews stay hidden until real entries exist. All of these are listed in BUSINESS_INFO_REQUIRED.md and fail the production build until resolved.

### Measured results (not claimed)
Lighthouse 12.8, production build served locally by `next start`, placeholders in place of photos.

| Page | Preset | Perf | A11y | Best pr. | SEO | LCP | CLS |
|---|---|---|---|---|---|---|---|
| `/` | desktop ×4 | 90–99 | 100 | 100 | 100 | 0.8–0.9 s | 0.007 |
| `/` | mobile ×7 | 49–82 | 100 | 100 | 100 | 4.2–5.2 s | 0.02 |

Mobile performance is **below the 90 target**. In the quiet runs (TBT ≤ 90 ms) it scored 81–82 with LCP 4.2 s; the lower runs coincided with 240–1,580 ms TBT while the machine was under other load. LCP equals first paint: the hero copy paints in the first frame, which on a 4× throttled CPU waits on site-wide style and layout (≈1 s) after the 18 KB stylesheet. The splash is not the cause (measured with it switched off: the same 81). The previous home measured 80 / LCP 4.1 s on the same setup. Candidates for a follow-up: trimming the global stylesheet and DOM, and `content-visibility` on below-the-fold sections once ScrollTrigger positions are made resilient to it. With a real hero photo the LCP element becomes that (priority-loaded) image.

### Verified in a browser
Chrome via Playwright at 1440×900, 820×1180 and 390×844: no console errors, no horizontal overflow; the tours pin and run sideways on desktop and fall back to a swipe carousel below 1024px. Hero form: empty submit flags name, phone and consent and focuses the first; a valid submit passes the server's zod schema and, with Resend unconfigured, shows the honest failure with WhatsApp/phone fallbacks. Opening and closing a journey sheet over `/` keeps the scroll position. `/story` still mounts its 3D (`data-gl="ready"`) and HUD.

## 0.2.0 · 2026-10-29: v3, "One Day in Rajasthan" (single-page scroll story)

### What changed
The home page is now one continuous scroll story from 05:30 at Jaipur to 21:30 under the stars, driven by `content/day.json`. The paper, ink and sky colours change with the hour, and a brass sundial in the top-right shows the time and place. Ten chapters:

1. **Ch00 Threshold:** 3D carved jharokha with a jaali, light shaft and dust, and the aerial frames playing through the arch; 2D arch fallback; first-visit preloader; plan-trip bar.
2. **Ch01 Intro:** editorial spread with arch-masked plates.
3. **Ch02 Hours:** sundial carousel. A CSS 3D ring turned by scroll, with snap, ←/→ keys and a gnomon shadow.
4. **Ch03 Golden Trail:** 3D paper-relief Rajasthan (Natural Earth outline, procedural Aravalli ridge). A brass route draws itself, the camera flies stop to stop, and synced cards show each stop. 2D SVG version without WebGL.
5. **Ch04 Into the Thar:** 150-frame dunes sequence. A 1.2 s time-lapse when the chapter enters, then a scroll scrub from 16:30 to night, with scroll-reactive sand and three sky plates.
6. **Ch05 Ganjifa deck:** deck → fan → each card drawn and flipped → close, ending on "Design your own journey".
7. **Ch06 Journey tickets:** perforated tickets stack, each stamped as it lands.
8. **Ch07 Plan:** four steps along a Golden Trail line drawn by scroll, plus "why us".
9. **Ch08 Guest stories:** ember glow, real reviews only.
10. **Ch09 Starlight:** star field over the night dunes, FAQ and the full enquiry form.

Journeys and destinations open as **sheets over the story** (intercepting routes). Direct visits get full pages. `/tours` was renamed `/journeys`, with 301s.

Compact (< 1024 px) and reduced-motion paths are complete layouts: swipe rows, a 2D map, posters and grids. The "Motion: full / calm" toggle in the sundial overrides the OS setting for the session.

### Measured results (not claimed)
Lighthouse 12, production build served locally by `next start`, placeholders in place of photos. Two runs each where noted; both gave the same result.

| Page | Preset | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile ×2 | 80 / 80 | 100 | 100 | 100 | 4.1 s | 0 | 130–160 ms |
| `/` | desktop ×2 | 98 / 98 | 100 | 100 | 100 | 0.8 s | 0.012 | 20 ms |
| `/journeys/the-golden-trail` | mobile | 86 | 100 | 100 | 100 | 3.6 s | 0.016 | 40 ms |
| `/destinations/jaipur` | mobile | 85 | 100 | 100 | 100 | 3.6 s | 0.025 | 70 ms |

- **Home first-load JS: 151 kB gz** (budget ≤ 200 kB). three, R3F and drei are a separate chunk that loads only on capable desktops, on the first interaction.
- **Frames before Ch04 on mobile:** the hero-aerial placeholder set is 3.0 MB and the dunes mobile set 1.5 MB, so at most 4.5 MB (budget ≤ 8 MB). Real footage will be heavier than the placeholders; re-measure it.
- **The gap: mobile LCP is 4.1 s against a 2.5 s target** (Performance 80, which meets its ≥ 80 target). Observed LCP in the same trace is 0.3 s. The simulated slow-4G figure is dominated by the web fonts (Fraunces roman with opsz + SOFT is 118 kB, plus Tiro and Instrument Sans) on the critical request graph, and the v2 fonts were lighter. To close it: subset Fraunces to the glyphs used, or drop the SOFT axis (it costs the "ink settling" headline effect).
- An earlier run gave desktop TBT 970 ms. three.js now mounts on the first interaction, which brought it to 20 ms. A visitor who never moves the pointer sees the 2D arch rather than the 3D one.
- Field INP can't be measured locally.

### Other checks run
- Headless Chrome screenshots of every chapter at 1440×900 (WebGL), 390×844 (compact) and with reduced motion. WebGL runs only on desktop, never on compact or reduced.
- Sheets: a ticket's "View Itinerary" opens the journey sheet with focus inside it. Esc closes it and the story's scroll position is kept. Destination sheets open from the carousel, and browser back closes them. Direct loads of `/journeys/[slug]`, `/destinations/[slug]` and `/journeys` render full pages, `/tours/[slug]` 301s, and there were no console errors.
- `npm run check:contrast`: all 10 palettes pass 4.5:1.
- **Not done here:** real VoiceOver/TalkBack sessions, a manual 200% zoom pass, and testing on a real phone and a real low-end GPU. Do these before launch.

### Deviations from the brief (and why)
- **Kit files were not supplied**, so they were generated: `day.json`, the dunes frames, the arch SVGs and the scripts. They are Node (`.mjs`) instead of Python, because Python isn't installed here. `video-to-frames.sh` is bash + ffmpeg as specified.
- **Terracotta stays `#A14D2A`** (the brief's `#B5562F` fails AA; see AUDIT.md).
- **10 palettes rather than 8.** The trail stops (Udaipur cooler, Jodhpur indigo, Jaisalmer golden) get their own palettes.
- **The h1 is pre-split on the server**, not by SplitText. It is the LCP text, so it must never wait for JS. Other headings use SplitText with the SOFT axis settling.
- **The sundial clock follows the chapter times**, so Ch04 reads 16:30 → 18:10, while the dunes frames run 16:30 → 21:00 as §6.5 specifies. Following the frames would make the clock run backwards at Ch05 (18:10).
- **Pin lengths are scroll durations** (220vh of scroll for Ch00, and so on).
- **Low-end desktops** (4 cores or fewer, or no WebGL2) keep the desktop choreography but use the 2D scenes, rather than switching to the whole compact layout.
- **Compact has no sand at any width** (the brief allows sand on 768–1023 px). Compact never loads WebGL, to keep tablets light.
- **Devanagari labels in 3D are drawn to canvas textures** with the page's own Tiro font, not drei `Text`. That avoids a fifth font file and the troika worker.
- **Heightmap is option (b)**, a stylised procedural ridge (`HEIGHTMAP_SOURCE = "procedural"` in `components/story/gl/trail/geo.ts`).
- **No ambient sound track.** The brief allows an optional one; there was no audio to use.
- **Experiences stay standalone pages** (no sheet). Only journeys and destinations were specified as sheets.

### What still needs owner input
Everything is in **BUSINESS_INFO_REQUIRED.md** (`npm run placeholders`) and **ASSET_BRIEF.md** (`npm run assets:brief`). It is the same list as v2, plus:
- the **hero drone clip** (brief in `day.json`, converted with `scripts/video-to-frames.sh`, then status set to `"ready"`)
- the Thar camp and night-sky details
- confirmation that "every journey is private" is true

## 0.1.0 · 2026-10-29: first build ("Quiet Luxury, Warm Light")

### What changed
The `tour/` folder was empty, so this is a new site built to the brief (see AUDIT.md). Everything in PLAN.md phases 1–5 is in place: design system, homepage, all templates, enquiry pipeline, and the SEO/performance/accessibility pass.

### Measured results (not claimed)
Lighthouse 13.6, mobile preset (simulated Moto G Power, slow 4G), production build served locally by `next start`, placeholders in place of photos:

| Page | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1.1 s | 0.018 | 50 ms |
| `/tours/the-golden-trail` | 100 | 100 | 100 | 100 | 0.9 s | 0.013 | 40 ms |
| `/destinations/jaipur` | 99–100* | 100 | 100 | 100 | 1.0 s | 0.029 | 70–90 ms |
| `/tours` | 100 | 100 | 100 | 100 | 0.8 s | 0 | 60 ms |
| `/contact` | 99 | 100 | 100 | 100 | 0.8 s | 0 | 130 ms |
| `/experiences/a-night-in-the-thar` | 100 | 100 | 100 | 100 | 0.8 s | 0.033 | 70 ms |

\* One run of `/destinations/jaipur` gave 95 (TBT 240 ms). Two re-runs gave 100 and 99, so it was run-to-run noise.

- **Homepage first-load JS: 133 kB** gzipped (Next build report). Budget is ≤ 180 kB. GSAP + ScrollTrigger load only with the Golden Trail on desktop; Lenis loads on desktop only; the enquiry form code (react-hook-form + Zod) loads on first intent or as the inline form nears the viewport.
- **Caveat:** these numbers are with dune-coloured placeholders, not photos. Re-measure once real images are in. The hero poster must stay ≤ 200 KB as served, and the LCP is then the poster image.
- Field INP can't be measured locally. TBT is the lab proxy, and it is low.
- No horizontal overflow at 320 px on any route; layouts are capped at 1440 px for wide screens.

### Other checks run
- Enquiry API on the production build: valid submission → 200 + business email + guest auto-reply (against a local mock of the Resend API). Duplicate idempotency key → same reference, no second email. Missing Turnstile token → refused. 6th request in 10 min from one IP → 429. No email env vars → 503 with "We couldn't send this right now. Please WhatsApp or call us."
- In the browser: tour CTA → drawer pre-filled with the tour → two steps → `/enquiry/thank-you?ref=ENQ-…`. Plan-trip bar values carry into the drawer. Inline validation on blur with announced errors. Esc closes and returns focus to the trigger; values survive closing.
- Reduced motion: no pinning (the Golden Trail renders as a vertical timeline), no parallax, no Ken Burns, no video, instant transitions.
- **Not done here:** real VoiceOver/TalkBack sessions and a manual 200% browser-zoom pass. Keyboard and focus behaviour was checked by script, not by a person. Do both before launch.

### Deviations from the brief (and why)
- **Terracotta `#A14D2A`** instead of `#B5562F` (which fails AA at 4.31:1); **`brass-text #78603B`** for small brass numerals; **hero gradient 72–78%** maroon instead of 55%. Contrast figures are in AUDIT.md.
- **Site-wide reveals and parallax use IntersectionObserver + CSS, not GSAP**, so GSAP ships only with the Golden Trail (§11). The trail uses `gsap.matchMedia()` and reverts on unmount, as §9 asks.
- **Journal articles are typed TS objects in `content/journal.ts`, not MDX.** With no articles yet, this avoids an MDX toolchain; swap in MDX when the owner starts writing.
- **Rate limiting and idempotency are in-memory.** That's fine on a single Node server. On serverless or multi-instance hosting, move both maps in `lib/enquiry/server.ts` to a shared store (e.g. Upstash Redis).
- **The three tours are sample drafts** (`draft: true`), so the templates show real structure. Each displays an "Owner to supply" notice that blocks the production build until it is confirmed or deleted.
- **Claims implied by the brief's own copy** ("Private journeys", tailor-made itineraries, on-trip support, "Every journey is private… can be changed") need the owner to confirm they are true.

### What still needs owner input
Everything is listed in **BUSINESS_INFO_REQUIRED.md** (regenerate with `npm run placeholders`) and **ASSET_BRIEF.md** (`npm run assets:brief`). In short: 17 business facts, real tour data and prices, 6 FAQ answers, the facts behind 5 "why us" claims, 6 experience inclusions, 14 local details, 3 legal texts, the founder/team story, 39 photos + the hero video, and the env vars in `.env.example`.

### How to edit content
- **Business facts:** `content/business.ts`. Replace each `"{{…}}"` string.
- **Tours:** one file per tour in `content/tours/` (copy an existing one), listed in `content/tours/index.ts`. Fields: route, `itinerary` days, `inclusions`/`exclusions`, optional `hotelCategory`, and `priceFromINR` + `priceBasis` (omit both to show "Price on request"). Set `featured: true` for the homepage (first three) and `draft: false` once real.
- **FAQs:** `content/home.ts` → `faqs` (the homepage, and tour pages without their own `faqs`). For a tour-specific list, add `faqs: [{ q, a }]` to the tour file.
- **Destinations / experiences:** `content/destinations.ts`, `content/experiences.ts`.
- **Reviews:** `content/home.ts` → `reviews`. Real ones only, with permission; the "coming soon" block disappears automatically.
- **Photos:** follow ASSET_BRIEF.md. Add `{ src, width, height }` as the last argument of the entry in `content/assets.ts`.
- **Legal pages:** `content/legal.ts`.
- Then run `npm run build`. It fails, listing every page that still has a placeholder, until nothing is left.
