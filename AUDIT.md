# Audit (v3 step 1)

Date: 2026-10-29 · Folder: `tour/` in `websites-templates` · Brief: `PROMPT-rajasthan-v3-scroll.md`

## What existed before v3

The v2 build of this site (see CHANGELOG 0.1.0). It was never deployed, so there are no live ranking URLs, no analytics history and no real-user Core Web Vitals.

| Brief asks for | Finding |
|---|---|
| Stack and routes | Next.js 15.5 (App Router) · React 19 · TypeScript 5.9 · Tailwind v4 · npm. Routes: `/`, `/destinations` (+`[slug]`), `/experiences` (+`[slug]`), `/tours` (+`[slug]`), `/our-story`, `/contact`, `/journal` (hidden until articles exist), `/enquiry/thank-you`, `/privacy`, `/terms`, `/cancellation-policy`, `/credits`, 404. Kept on the brief's stack (§1: "keep the existing one if it's Next.js"). |
| Forms and where submissions go | One enquiry form (drawer + inline). Zod schema shared by client and server (`lib/enquiry/schema.ts`), `POST /api/enquiry` with a honeypot, Cloudflare Turnstile, a per-IP rate limit, an idempotency key and Resend delivery (business email + guest auto-reply), plus an optional webhook. It fails honestly without configuration. **Kept unchanged.** |
| Analytics and pixels | GA4 with Consent Mode v2, loaded only after consent (`components/analytics/Analytics.tsx`); events `form_start`, `generate_lead`, `whatsapp_click`, `phone_click`, `email_click`, `view_itinerary`. No Meta Pixel installed. **Kept**, and `chapter_view` and `sheet_open` were added. |
| SEO-ranking URLs | None live. The only URL change is **`/tours` → `/journeys`** (the v3 brief's name). Both `/tours` and `/tours/:slug` 301 to `/journeys…` (`next.config.ts`). ⚠ If the deployment domain previously hosted another site, list its ranking URLs there before launch. |
| Existing assets | **No photos or video** (every slot was a sized placeholder). The v3 kit files the brief refers to (`content/day.json`, `public/frames/dunes`, the jharokha SVGs, `scripts/*.py`) **were not supplied**. They were generated in this repo instead (see below). Python is not installed on this machine, so the kit's `.py` scripts became Node scripts. |
| Mobile Lighthouse / CWV baseline | v2 production build, Lighthouse 13.6 mobile: `/` 100 / 100 / 100 / 100, LCP 1.1 s, CLS 0.018, TBT 50 ms; first-load JS 133 kB. With placeholders, not photos. |

## Kit files generated here (the brief assumed they existed)

| File | How it was made |
|---|---|
| `content/day.json` | Written from §2 and §6: 10 chapters (time, place, Devanagari, palette, pin length), 10 palettes, and the frame-sequence manifest. Validated by Zod at build (`content/validate.ts`). |
| `public/frames/dunes/{desktop,mobile}` | 150 + 150 procedurally rendered frames (`scripts/render-dunes.mjs`, Node + sharp; replaces `render-dunes.py`). 2.6 MB desktop, 1.5 MB mobile. |
| `public/frames/hero-aerial/…` | Labelled PLACEHOLDER frames (`scripts/placeholder-frames.mjs`). Manifest status `owner-to-supply`, so the production build fails until replaced. |
| `public/svg/jharokha-arch-*.svg` | `scripts/make-jharokha.mjs`, from the same geometry as `lib/arch.ts` (CSS clip and three.js wall use it too). |
| `scripts/video-to-frames.sh` | ffmpeg: footage → graded WebP frames in both sizes. |
| Rajasthan outline | Natural Earth admin-1 (public domain), simplified from 2,000 to 300 points (`lib/geo/rajasthan-outline.json`). Credited on /credits. |

## Facts checked against the brief

- **Terracotta `#B5562F` is 4.31:1 on ivory** (fails AA for body text and the 13px button labels). The site keeps v2's `#A14D2A` (5.17:1). Measured, not assumed.
- **Brass `#B08D57` is 2.75:1 on ivory**: rules and ornaments only, as the brief says.
- All 10 palettes pass 4.5:1 for ink, muted and accent text (`npm run check:contrast`, which runs before every build). The single dip is the instant of the sunset → dusk polarity flip (3.7:1 for roughly 60 px of scroll), reported by the same script.
