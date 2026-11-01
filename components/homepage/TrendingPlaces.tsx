"use client";

import { Link } from "next-view-transitions";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExploreLink } from "@/components/explorer/ExploreLink";
import { Photo } from "@/components/ui/Photo";
import { Arrow, Deva } from "@/components/ui/bits";
import { placeLinks, trending, type Place } from "@/content/explorer";
import { hero } from "@/content/home";

const INTERVAL = 6000;

const reduced = () => typeof document !== "undefined" && document.documentElement.dataset.motion === "reduced";

/** Where a trending place leads: its itinerary, or its card in the atlas below. */
function PlaceLink({ p, className = "", children }: { p: Place; className?: string; children: React.ReactNode }) {
  const { itinerary } = placeLinks(p);
  return itinerary ? (
    <Link href={itinerary} className={className}>
      {children}
    </Link>
  ) : (
    <ExploreLink state={p.state} place={p.id} className={className}>
      {children}
    </ExploreLink>
  );
}

/**
 * Home · 01 · the opening. A full-screen photo of one trending place behind the brand line; the rail
 * along the bottom picks the place (hover, click or keyboard) and plays through them on its own,
 * pausing on hover, focus, off screen and on request. Cities with an itinerary link to it; the rest
 * open their card in the atlas below. The headline is server-rendered and paints first.
 */
export function TrendingPlaces() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const [inView, setInView] = useState(true);
  const [rest, setRest] = useState(false);
  const place = trending[active];
  const links = placeLinks(place);
  const playing = !paused && !hold && inView;

  // The first photo is the LCP image; the others load once the page has settled
  useEffect(() => {
    const t = setTimeout(() => setRest(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduced()) setPaused(true);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % trending.length), INTERVAL);
    return () => clearTimeout(t);
  }, [playing, active]);

  // Subtle parallax on the photo, desktop pointers only
  useEffect(() => {
    const el = root.current!;
    if (!window.matchMedia("(pointer: fine)").matches || reduced()) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      el.style.setProperty("--px", cur.x.toFixed(3));
      el.style.setProperty("--py", cur.y.toFixed(3));
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width - 0.5;
      target.y = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", move, { passive: true });
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const pick = useCallback((i: number) => setActive((i + trending.length) % trending.length), []);

  return (
    <section ref={root} aria-labelledby="home-title" className="trend on-dark relative isolate overflow-hidden bg-ink text-ivory" data-playing={playing ? "" : undefined}>
      {/* Background: one photo per place, crossfading */}
      <div className="trend-bg" aria-hidden="true">
        {trending.map((p, i) =>
          i === 0 || rest ? (
            <div key={p.id} className={`trend-slide ${i === active ? "is-active" : ""}`}>
              <Photo k={p.image} fill sizes="100vw" priority={i === 0} compact decorative imgClassName="trend-slide-img" />
            </div>
          ) : null,
        )}
      </div>
      <div aria-hidden="true" className="trend-shade" />

      <div className="wrap trend-inner">
        <div className="trend-copy">
          <div className="max-w-[40rem]">
            <p className="t-label text-ivory/85">{hero.label}</p>
            <h1 id="home-title" className="hero-title t-display mt-5">
              {hero.headline.map((line, i) => (
                <span key={line} className="rise-line">
                  <span style={{ ["--i" as string]: i }}>{line}</span>
                </span>
              ))}
            </h1>
            <p className="home-fade mt-6 max-w-[38ch] text-[1.0625rem] text-ivory/90" style={{ animationDelay: "420ms" }}>
              {hero.support}
            </p>
            <div className="home-fade mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ animationDelay: "560ms" }}>
              <ExploreLink state={null} className="btn bg-ivory text-ink hover:bg-sandstone">
                Open the atlas <Arrow className="rotate-90" />
              </ExploreLink>
            </div>
          </div>

          {/* The place on screen */}
          <div className="trend-now" aria-live="polite">
            <div key={place.id} className="trend-now-in">
              <p className="t-label tabular-nums text-dune">
                {String(active + 1).padStart(2, "0")} <span className="text-ivory/50">/ {String(trending.length).padStart(2, "0")}</span> · {links.itinerary ? "Itinerary ready" : "Coming soon"}
              </p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-[clamp(2rem,3.4vw,2.75rem)] leading-none">{place.name}</span>
                <Deva className="text-lg text-dune">{place.devanagari}</Deva>
              </p>
              <p className="trend-now-sum mt-3 max-w-[34ch] text-ivory/85">{place.summary}</p>
              <PlaceLink p={place} className="link mt-4 inline-flex items-center gap-2 py-1 font-semibold">
                {links.itinerary ? "View the itinerary" : "Preview on the map"} <Arrow />
              </PlaceLink>
            </div>
          </div>
        </div>

        {/* The rail: choose a place */}
        <div className="trend-rail" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="t-label text-dune">Trending this season</h2>
            <div className="flex items-center gap-1.5">
              <button type="button" className="trend-ctl" onClick={() => pick(active - 1)} aria-label="Previous place">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              <button type="button" className="trend-ctl" onClick={() => setPaused((v) => !v)} aria-label={paused ? "Play the slideshow" : "Pause the slideshow"} aria-pressed={paused}>
                {paused ? (
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M5 3l8 5-8 5z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
              <button type="button" className="trend-ctl" onClick={() => pick(active + 1)} aria-label="Next place">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
            </div>
          </div>
          <ul className="trend-thumbs" aria-label="Trending places">
            {trending.map((p, i) => (
              <li key={p.id} className="trend-thumb-li">
                <button type="button" className={`trend-thumb ${i === active ? "is-active" : ""}`} aria-pressed={i === active} aria-label={`Show ${p.name}`} onClick={() => pick(i)} onPointerEnter={(e) => e.pointerType === "mouse" && pick(i)}>
                  <span className="trend-thumb-img">
                    <Photo k={p.image} fill sizes="160px" compact decorative />
                  </span>
                  <span className="trend-thumb-text">
                    <span className="font-display text-[1.125rem] leading-none">{p.name}</span>
                    <span className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ivory/70 uppercase">{placeLinks(p).itinerary ? "Itinerary" : "Coming soon"}</span>
                  </span>
                  {i === active && <span key={`${p.id}-${active}`} className="trend-progress" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
