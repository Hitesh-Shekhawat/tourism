# Enhancement plan: premium editorial upgrade

Date: 2026-11-04 · Brief: `ENHANCED-PROMPT.md` · Status: **implemented and verified** (numbers below were measured, not assumed)

## 1 · Audit

### Stack
| | |
|---|---|
| Framework | Next.js 15.5.28, App Router, React 19.3, TypeScript 5.9 |
| Styling | Tailwind CSS v4 (`@theme` in `styles/globals.css`) + plain CSS files (`home.css`, `explorer.css`, `story.css`, now `tokens.css`, `sections.css`) |
| Scripts | `build` = contrast check → `next build` → placeholder gate · `lint` = `tsc --noEmit` (no ESLint is installed) |
| Routes | `/`, `/destinations` (+`[slug]`, `[slug]/itinerary`), `/experiences` (+`[slug]`), `/journeys` (+`[slug]`, sheet overlays via `@sheet`), `/story`, `/our-story`, `/contact`, `/journal`, `/enquiry/thank-you`, `/privacy`, `/terms`, `/cancellation-policy`, `/credits`, `/api/enquiry`, sitemap, robots. **No route or URL was changed.** |

### Dependencies already present (none added)
| Package | Where / how |
|---|---|
| gsap 3.13 (+ ScrollTrigger, SplitText) | `lib/story/engine.ts` (lazy `loadGsap`); `/story` chapters; homepage `HomeMotion` drives Lenis from GSAP's ticker |
| lenis 1.3.8 | One instance, `components/motion/Motion.tsx` (root layout); synced with ScrollTrigger in `lib/smooth.ts → driveWithGsap` exactly as §4 specifies |
| three / R3F / drei | `/story` only (lazy, capable desktops). `components/explorer/gl/*` is an unused 3D atlas, kept by the owner's 0.4.1 decision |
| zustand | motion mode, atlas state |
| react-hook-form + zod | enquiry form (shared schema client/server) |
| next-view-transitions | route transitions |
| Map libraries / carousel libraries | none; the atlas is hand-written SVG over DataMeet GeoJSON |

**Dependencies added: none.** Every new feature (drag track, lightbox, video poster, extrusion) is built from what was there.

### Homepage before
`HomeMotion` → `TrendingPlaces` (full-screen slideshow + h1) → `LookingFor` (five equal text tiles) → `IndiaExplorer` (2D SVG atlas). `FeaturedTours`, `Services`, `Packages`, `TravellerStories`, `Gallery` and `FinalCta` were commented out in `app/page.tsx` (commit 0c30d51).

### Tokens
Colour, families and the 7-step type scale were already in `globals.css` (`t-display`, `t-h1`, `t-h2`, `t-h3`, body, `t-small`, `t-label`, all `clamp()`). Spacing, radii, elevation, hairlines and motion durations were scattered as literals → consolidated in **`styles/tokens.css`** (CSS) and **`lib/motion.ts`** (JS).

### Assets
26 photos in `assets/` and 5 in `public/images/`, all JPEG. 24 of them are **1376×768** (≈108–352 KB); Nakki Lake 1285×886 (Commons); Junagarh 1920×1280 / 904 KB (Commons). All are served through `next/image` (AVIF/WebP, responsive `sizes`), so delivered bytes are far below the source sizes.
- ⚠ **Too small** for a sharp full-bleed hero on ≥1440 px or 2× screens (minimum 2560 px wide wanted). Visible softness on the Mount Abu tile.
- ⚠ **Provenance**: the hashed `assets/*_xxxxxxxx.jpg` files have no recorded source, and the Hawa Mahal image has illegible shop signage typical of AI generation. Confirm the source and licence of each before launch (`docs/content-gaps.md`).
- Two exact duplicates (`… (1).jpg`). No video exists in the project.

### Atlas
`components/explorer/AtlasMap2D.tsx` + `IndiaExplorer.tsx`, state in `store.ts`, URL-synced (`?state=&place=`). Geometry: DataMeet India states (CC BY 4.0, credited on /credits) in `public/geo`, equirectangular projection (`lib/geo/projection.ts`). Known issues found: markers not keyboard-reachable (map wrapped in `aria-hidden`), labels placed by a manual `labelBelow` flag, India → state was a cross-fade with **a different x-scale per view** (the state's shape changed by ~4% between views), Rajasthan drawn in off-palette orange `#e8772e`.

### Enquiry flow
`EnquiryProvider` → drawer (`EnquiryDrawer`/`EnquiryForm`) + `InlineEnquiry`; `POST /api/enquiry` (zod, honeypot, Turnstile, rate limit, Resend + optional webhook). Verified: the endpoint is live and validates (`{}` → `{"ok":false,"reason":"invalid"}`). **Real delivery needs `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL`** (not set here, so a full submission ends in the existing honest-failure state). WhatsApp: `lib/contact.ts → whatsappHref`; the number is a placeholder.

### Placeholders and debt
17 `{{…}}` business facts (brand name, phone, email, address, GSTIN…), 16 `{{local detail}}` strings, 3 sample-draft tours, 8 unconfirmed services. The footer linked to `/#pkg-*` anchors that no longer existed (Packages was removed from the page). JSON-LD emitted placeholder phone/email/address. No `TODO`/`lorem` in output; no console errors; no build warnings.

### Baseline (before), production build, Lighthouse 13.6, local `next start`
| Preset | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| mobile | 99 | 100 | 100 | 100 | 0.9 s | 0 | 130 ms |
| desktop | 98 | 100 | 100 | 100 | 1.0 s | 0 | 0 ms |

Raw reports: `docs/lighthouse/before-*.report.{html,json}`.

## 2 · Section plan and what was done

| # | Section | Stays | Changes | Components |
|---|---|---|---|---|
| 01 | Hero | Hawa Mahal direction, "Rajasthan, Slowly.", gradient-over-photo | Full-viewport Hawa Mahal (preloaded LCP), Ken Burns 1→1.06 over 26 s (off under reduced motion), no other hero animation; Explore Journeys (filled terracotta) + Discover Rajasthan (outline); floating card = the real **Three days in Jaipur** itinerary; static scroll cue | `homepage/Hero.tsx` (rewritten) |
| 02 | Trending | The six cities, their data and links | Editorial horizontal track: one wide card + portraits, identity line (`epithet · region`), drag with momentum + arrows (desktop), scroll-snap (touch), 1.05 hover scale in clip over 900 ms, terracotta underline on hover/focus, scroll-driven drift ≤ 5% (CSS `view()` timeline, no JS). Every card is an `<a>`; Mount Abu (no route yet) links to its atlas view | `TrendingDestinations.tsx` (new), `ui/HorizontalTrack.tsx` (new), `explorer/AtlasAnchor.tsx` (new). `TrendingPlaces.tsx` kept, no longer placed |
| 03 | By experience | The five interests and the "filter the atlas" behaviour | Asymmetric grid (tall feature, two stacked, two landscapes) with real photos; hover/focus clip-path reveal + 1.03 scale + caption lift 8 px; tap-to-preview on touch; tiles are real links (`/?state=rajasthan&interest=…#explore`) | `LookingFor.tsx` (rewritten) |
| 04 | Atlas | Its data, URLs, lists, card, Esc/back | **One consistent projection** (state view reuses India's x-scale), so India → Rajasthan is a true 1 s camera ease (scale + translate) while other states fade; Rajasthan in terracotta with lift + shadow; state rises as a 7-layer extrusion with north-west light; markers are focusable buttons (Enter/Space), lift on hover/focus; collision-free labels; "Select Rajasthan" CTA; info panel lists journeys through the place (real data only); mobile panel is a bottom sheet | `AtlasMap2D.tsx`, `IndiaExplorer.tsx`, `DestinationCard.tsx`, `store.ts` (`?interest=`), `lib/geo/projection.ts` |
| 05 | Memories (new) | — | Column masonry of 7 real photos with captions + location labels; small frames overlap their host photo on an ivory mat; reveal one by one (fade + 16 px, 60 ms stagger); lazy accessible lightbox (focus trap, Esc, ←/→, swipe); film/music/food slots are dev-only placeholders | `Memories.tsx`, `ui/Lightbox.tsx`, `ui/VideoPoster.tsx` (new) |
| 06 | Journeys | `content/tours` data, routes | Draggable track (no pin), route · duration · style, price **only** if `priceFromINR` (“from ₹…”, “Price on request” removed); drafts labelled in dev, **absent in production**; section omitted when no confirmed journey (hero CTA then links to `/journeys`) | `FeaturedTours.tsx` (rewritten) |
| 07 | Stories | Data model, permission flag, video player | New heading/copy; featured story + track; hidden in production while there are no real stories (dev shows a placeholder) | `TravellerStories.tsx` |
| 08 | Why us | Two-column editorial layout | Six claims from the brief's list, each `offered: null` until confirmed → only confirmed claims ship; thin-stroke icon set extended (`route`, `lamp`); real photo instead of the unsupplied driver shot | `Services.tsx`, `content/homepage.ts` |
| 09 | CTA | Existing drawer + inline form (unchanged) | Brief copy; "Plan Your Trip" opens the existing drawer; WhatsApp shown **only when the number is configured**; parallax ≤ 6% (existing) | `FinalCta.tsx`, `lib/contact.ts → hasWhatsApp` |
| 10 | Footer | Burgundy → dark, columns | Mobile accordion (`FooterColumn`), tour categories now link to real filtered atlas URLs (old `/#pkg-*` anchors were dead), missing facts hide their rows in production, GSTIN only if configured, draft journeys hidden in production | `layout/Footer.tsx`, `layout/FooterColumn.tsx` (new) |

Also: `SectionHeading` primitive (catalogue number, clip-mask heading, note); section numbers count only rendered sections; WhatsApp hidden when unconfigured in the mobile menu and floating bar; TravelAgency JSON-LD carries real fields only.

## 3 · Decisions and deviations (with reasons)

- **Pinned horizontal scroll (revised 2026-11-04 at the owner's request).** On desktop (≥ 1024px, motion allowed) `HorizontalTrack` pins Trending and Journeys with GSAP ScrollTrigger and vertical scroll (Lenis-smoothed, `scrub: 0.9`) carries the cards sideways. Travel is exact (last card's right edge + gutter), so the last card always stops fully in view; cards are sized from the viewport height (`--card-h`) so heading + cards + captions fit on screen; Tab to an off-screen card scrolls the page to it; the floating CTA hides while a track is on screen. Measured at 1440×900, 1280×720 and 1920×1080: heading never off-screen, no card cut at the bottom at any step. Below 1024px and with reduced motion: native swipe, no pin. Every trigger lives in a `gsap.context` + `matchMedia` and is reverted on unmount. Memories stays a vertical masonry.
- **Scale pass (2026-11-04):** type scale, section padding (72/96/112px), wordmark, cards, experience grid and atlas height reduced for a calmer rhythm.
- **Atlas stays SVG, no WebGL.** The owner deliberately flattened the atlas in 0.4.1 and three.js is not loaded on `/`. The brief says to enhance a working map, not replace it, so "gentle extrusion and directional lighting" is done in SVG (stacked outlines + gradient face + drop shadow). Zero canvases on the homepage, comfortably inside the WebGL budget. The SVG is also the fallback for every device, so there is no separate fallback path to drift.
- **District highlight not implemented:** the project has no district boundaries. See content gaps (needs a licensed district GeoJSON).
- **Fonts:** three families remain (Fraunces, Instrument Sans, Tiro Devanagari). Tiro carries the Devanagari accents that are part of the brand identity, is subset to Devanagari and is not preloaded. This is over the brief's two-family cap, kept deliberately.
- **Production gate:** the existing gate still fails a real production build while `{{business facts}}` remain (brand name etc.). That's correct: the site cannot ship without a brand name. New in `scripts/check-placeholders.mjs`: hard failures for `TODO`, `lorem`, `Placeholder:`, `example.com`, empty `href` and broken image paths, **not** bypassable with `ALLOW_PLACEHOLDERS`. Verification builds here used `ALLOW_PLACEHOLDERS=true`.
- **Content flags:** `lib/content-flags.ts` (`showPlaceholders = NODE_ENV !== "production"`, `canShow(ready)`). Stand-ins render "Placeholder: replace with …" in dev only.
- **Hero quick-enquiry form** (`HeroEnquiry.tsx`) is no longer placed: the brief puts a featured card in the hero. The enquiry flow itself is untouched (header, CTA section, floating bar, drawer).
- **No custom cursor:** the brief allows one only over the atlas/galleries; it was left out (clarity over spectacle).
- **Other WhatsApp links** (thank-you page, journey detail, form error fallback) still use the number-less `wa.me` fallback; they are outside the homepage scope and still resolve.

## 4 · Verification (Phase 6)

| Check | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | ✅ clean |
| `npm run build` | ✅ passes with `ALLOW_PLACEHOLDERS=true`, 57 pages, no warnings; hard template/broken-image checks pass. ❌ Without the flag it is blocked by the owner `{{…}}` facts, by design |
| Interaction QA (headless Chrome, `puppeteer`) | ✅ 28/28: atlas by keyboard (focus Rajasthan → Enter → 7 markers, 0 label collisions → Enter → panel → Esc → Esc → India), by mouse (click → state, browser back → India), by touch at 390 px (tap → bottom sheet); experience tile → filtered atlas; lightbox open/focus/arrow/trap/Esc/focus return; Plan Your Trip → drawer; track arrows + 300 px drag → 752 px glide without navigating; every trending card is a link; route away and back; reduced motion (no Ken Burns, no Lenis); no overflow at 360/768/1024/1280/1390/1440 |
| Console errors / 404s | ✅ none (1440 and 390, full scroll) |
| ScrollTrigger leftovers | ✅ homepage creates none (by construction) |
| Screenshots | `docs/screenshots/` (each section at 1440 and 390, plus atlas state/panel and lightbox) |

### Lighthouse after (same setup as baseline; two runs each)
| Preset | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| mobile | 99 / 100 | 100 | 100 | 100 | 1.1 s | 0 | 100 / 30 ms |
| desktop | 100 / 100 | 100 | 100 | 100 | 0.3 s | 0 | 0 ms |

Raw reports: `docs/lighthouse/after-*.report.{html,json}`. Homepage first-load JS 152 kB (unchanged ballpark: 133 kB in v2, 151 kB in v3). Field INP can't be measured locally.

### Not done here
Real VoiceOver/TalkBack sessions, a real low-end phone, and a full enquiry submission with Resend configured. Do these before launch.
