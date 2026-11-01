# Plan (v3, "One Day in Rajasthan")

Six phases from the brief (§1). Status on 2026-10-29: **all implemented**. `tsc` is clean, and a production build passes with `ALLOW_PLACEHOLDERS=true`. Without that flag the build is blocked, by design, until the owner fills the business facts and supplies the hero footage.

## 1 · Tokens and the scroll shell ✅
- Fonts: Fraunces (variable roman with opsz + SOFT, plus italic), Instrument Sans, Tiro Devanagari (Devanagari subset). Four files; only the display roman is preloaded.
- Time-of-day layer: `--paper --ink --muted --accent --sky` on `<html>`, interpolated in OKLCH (`lib/story/color.ts`, `lib/story/palette.ts`) from chapter positions. Tailwind tokens `bg-paper`, `text-fg`, `text-fg-muted` and `text-accent` follow it; every other page keeps the static ivory palette.
- Motion modes `desktop` / `compact` / `reduced` (`lib/story/store.ts`, zustand), set pre-paint by an inline script and overridable per session from the sundial ("Motion: full / calm").
- Lenis on desktop and touch (`syncTouch: false`), driven by GSAP's ticker on the story. GSAP, ScrollTrigger and SplitText load after first paint.
- Story engine (`components/story/StoryEngine.tsx`): chapters register their choreography with `useChapterMotion(id, order, setup)`. Setups run top to bottom in one `gsap.context()` and are rebuilt when the mode or WebGL state changes. One tracker drives the palette, the sundial clock, the current chapter and `chapter_view`.
- HUD (`components/story/Hud.tsx`): brass sundial (hour, place in both scripts, chapter list, motion toggle), progress hairline, and the persistent "Plan my trip" + WhatsApp CTA.

## 2 · Frame engine and three.js layer ✅
- `workers/frames.worker.ts` + `lib/frames/player.ts`: manifest-driven, progressive (every 8th, every 4th, then all), at most 6 in flight, `createImageBitmap` off the main thread. Desktop or mobile set by viewport, DPR and Save-Data. Nearest-loaded fallback and fractional crossfade. Bitmaps are freed on mobile when more than 2 viewports away; loading starts one chapter ahead.
- One fixed R3F `<Canvas frameloop="demand">` behind the DOM, with drei `<View>`s for four scenes (threshold, trail, thar, starlight). It mounts on the first interaction, only on desktops with WebGL2 and more than 4 cores. 2D fallbacks show until its first frame.

## 3 · Chapters 00–04 ✅
Threshold (3D jharokha + aerial frames, preloader, plan bar) · Intro · Hours sundial carousel · Golden Trail (3D paper relief / 2D SVG) · Into the Thar (dunes frames + sand).

## 4 · Chapters 05–09 ✅
Ganjifa deck · ticket stack with the stamp · plan line + why us · guest stories · starlight (stars, FAQ, enquiry form) · footer.

## 5 · Journey overlays and enquiry ✅
`app/@sheet` parallel slot with intercepting routes `(.)journeys`, `(.)journeys/[slug]` and `(.)destinations/[slug]`. Direct loads render the standalone pages from the same components (`components/detail/*`). View Transition from the ticket image to the sheet hero. The enquiry pipeline is unchanged from v2.

## 6 · SEO, performance and accessibility ✅
One `<h1>`, chapters as `<section aria-labelledby>` + `<h2>`, all story text server-rendered. JSON-LD as in v2 (TravelAgency, TouristTrip, TouristDestination, BreadcrumbList, FAQPage; no AggregateRating). Sitemap on `/journeys`. Contrast test across all palettes. The placeholder gate also covers placeholder frames. Measured numbers are in CHANGELOG.md.

## Still needed from the owner (blocks launch)
`BUSINESS_INFO_REQUIRED.md` (business facts, tours, FAQs, legal, local details) and `ASSET_BRIEF.md` (37 photos and the hero drone clip).
