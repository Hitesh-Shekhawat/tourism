# tour: "One Day in Rajasthan"

A Rajasthan travel company's site: an editorial home page with a lead form (`/`), and the original scroll story from 05:30 at Jaipur to 21:30 in the Thar (`/story`).

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger + SplitText · Lenis · three.js via @react-three/fiber + drei · zustand · React Hook Form + Zod · Resend · Cloudflare Turnstile.

```bash
npm install
cp .env.example .env.local              # fill in what you have
npm run dev                             # http://localhost:3000
npm run build                           # contrast test, build, then the placeholder gate (fails until owner facts and footage exist)
ALLOW_PLACEHOLDERS=true npm run build   # preview build only
npm run check:contrast                  # every palette in content/day.json against 4.5:1
npm run placeholders                    # regenerate BUSINESS_INFO_REQUIRED.md
npm run assets:brief                    # regenerate ASSET_BRIEF.md
npm run lint                            # tsc --noEmit
```

Start here: **CHANGELOG.md** (what was built, measured results, deviations), **BUSINESS_INFO_REQUIRED.md**, **ASSET_BRIEF.md**, **AUDIT.md**, **PLAN.md**.

## How the home page is put together
- `app/page.tsx` composes `components/homepage/*`: Hero (+ `HeroEnquiry`, `HeroVideo`), FeaturedTours, Discover, Services, Packages, TravellerStories, Gallery, FinalCta. The footer is the site-wide one.
- `content/homepage.ts` holds its copy and gated data: `services` (`offered: null` until confirmed), `packageCategories` (each lists the journeys in `content/tours` that fit it), `travellerStories` (section hidden while empty), `gallery`, `heroVideo`.
- Motion: `HomeMotion` hands Lenis' clock to GSAP (as `StoryEngine` does on the story); each section runs its choreography with `useSectionMotion(ref, setup)` in its own `gsap.context`, never in reduced mode. JS-driven layouts sit under state classes in `styles/home.css` (e.g. `.is-scrubbing` for the pinned horizontal tours), so no-JS and reduced motion keep plain layouts.
- `HeroEnquiry` posts to the same `/api/enquiry` as the full form (field parts shared via `components/enquiry/FormParts.tsx`); travel date, duration and type travel in the message.

## How the story is put together
- `content/day.json` is the spine: chapters (hour, place, Devanagari, palette, pin length), palettes and the frame-sequence manifest. Never hard-code frame counts or paths.
- `components/story/chapters/*`: one file per chapter. Each registers its choreography with `useChapterMotion(id, order, setup)`, and `StoryEngine` runs them in page order in one GSAP context for the current mode (`desktop` / `compact` / `reduced`).
- `components/story/gl/*`: the one WebGL canvas and its four scenes, each rendered into a chapter placeholder through a drei `<View>`. Scenes read per-frame values from `lib/story/bus.ts`.
- `lib/frames/*` + `workers/frames.worker.ts`: the frame-sequence engine.
- `app/@sheet/*`: journeys and destinations as sheets over the story (intercepting routes). `app/journeys`, `app/destinations`: the same content as standalone pages.

## Footage and frames
- Owner drone clip → `scripts/video-to-frames.sh <clip> hero-aerial 150`, then set `frameSequences["hero-aerial"].status` to `"ready"` in `content/day.json`. Until then, labelled placeholder frames show and the production build fails.
- `npm run frames:dunes` regenerates the procedural dunes, `npm run frames:placeholder -- <name> <count>` makes stand-in frames, and `npm run arch:svg` regenerates the jharokha SVGs.

Debug: `?nogl` forces the 2D scenes on desktop.

Deviation from the sibling templates: no Woblo `_src/` capture. This site was built from `PROMPT-rajasthan-premium-update.md` (v2) and then `PROMPT-rajasthan-v3-scroll.md`.
