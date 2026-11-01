"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { Deva, SectionHead } from "@/components/ui/bits";
import { getPlace, interests, isOpenState, openStates, placesIn } from "@/content/explorer";
import { INDIA_GEO, loadGeo } from "@/lib/geo/projection";
import { getLenis } from "@/lib/smooth";
import { DestinationCard } from "./DestinationCard";
import { MapFallback2D } from "./MapFallback2D";
import { cameraControls, goTo, readUrl, scrollToAtlas, syncFromUrl, useExplorer } from "./store";

// three.js, R3F and the scenes: one chunk, fetched only as the atlas comes near the viewport
const ExplorerCanvas = dynamic(() => import("./gl/ExplorerCanvas"), { ssr: false });

class GlBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useExplorer.getState().set({ renderer: "2d" });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const hasWebGl = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

/**
 * Home · the atlas (§ flow: India map → Explore → state → place → itinerary). A 3D map of India's
 * states; choosing one replaces India with that state's own map, its places pinned where they are.
 * All navigation is DOM as well as 3D: breadcrumbs, a state list, a place list and the place card,
 * so it works by keyboard, by screen reader and (as SVG) without WebGL.
 */
export function IndiaExplorer() {
  const stage = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(false);
  const [stateNames, setStateNames] = useState<{ id: string; name: string }[]>([]);
  const { started, stateId, placeId, hover, hoverPlace, busy, renderer, interest } = useExplorer(
    useShallow((s) => ({ started: s.started, stateId: s.stateId, placeId: s.placeId, hover: s.hover, hoverPlace: s.hoverPlace, busy: s.busy, renderer: s.renderer, interest: s.interest })),
  );

  // Where the visitor is comes from the URL: on load (a shared link) and on back / forward
  useEffect(() => {
    if (!hasWebGl()) useExplorer.getState().set({ renderer: "2d" });
    syncFromUrl();
    if (readUrl().state) {
      setNear(true);
      // a shared link: open on the map (after Lenis has started, so it does not pull the page back)
      setTimeout(() => scrollToAtlas(true), 120);
    }
    window.addEventListener("popstate", syncFromUrl);
    void loadGeo(INDIA_GEO)
      .then((g) => setStateNames(g.features.map((f) => ({ id: f.properties.id, name: f.properties.name })).sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {});
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // Load the 3D chunk ahead of the section; render frames only while it is on screen
  useEffect(() => {
    const el = stage.current!;
    const ahead = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "900px 0px" });
    const seen = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "80px 0px" });
    ahead.observe(el);
    seen.observe(el);
    return () => {
      ahead.disconnect();
      seen.disconnect();
    };
  }, []);

  // The state tooltip follows the pointer
  useEffect(() => {
    const el = stage.current!;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (tip.current) tip.current.style.transform = `translate(${e.clientX - r.left + 16}px, ${e.clientY - r.top + 16}px)`;
    };
    el.addEventListener("pointermove", move, { passive: true });
    return () => el.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !stateId || busy) return;
      const inStage = stage.current?.contains(document.activeElement);
      if (!inStage) return;
      goTo(placeId ? stateId : null, null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stateId, placeId, busy]);

  const home = () => {
    goTo(null, null);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const open = stateId ? openStates.find((s) => s.id === stateId) : null;
  const stateName = stateId ? (open?.name ?? stateNames.find((s) => s.id === stateId)?.name ?? stateId) : null;
  const place = placeId ? getPlace(placeId) : undefined;
  const list = stateId ? placesIn(stateId) : [];
  const hoverName = hover ? (stateNames.find((s) => s.id === hover)?.name ?? hover) : null;

  return (
    <section id="explore" aria-labelledby="explore-title" className="atlas">
      <div className="wrap atlas-head">
        <SectionHead n="03" label="The atlas" />
        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="explore-title" className="t-h1 max-w-[16ch] lg:col-span-7" data-reveal>
            Where in India would you like to go?
          </h2>
          <p className="measure text-ink-muted lg:col-span-4 lg:col-start-9" data-reveal>
            Turn the map, choose a state and step inside it. We're starting with Rajasthan, where every place on the map is one we plan journeys to.
          </p>
        </div>
      </div>

      <div ref={stage} className="atlas-stage" data-view={stateId ? "state" : "india"} data-started={started ? "" : undefined} data-pointer={hover || hoverPlace ? "" : undefined}>
        <div className="atlas-canvas" aria-hidden="true">
          {renderer !== "2d" && near && (
            <GlBoundary>
              <ExplorerCanvas active={active} />
            </GlBoundary>
          )}
          {renderer === "2d" && <MapFallback2D />}
        </div>
        {renderer === "pending" && (
          <p className="atlas-loading" role="status">
            Drawing the map…
          </p>
        )}

        {/* Where you are, and the way back */}
        <nav aria-label="Atlas" className="atlas-crumbs">
          <ol>
            <li>
              <button type="button" onClick={home}>
                Home
              </button>
            </li>
            <li>
              <button type="button" onClick={() => goTo(null)} aria-current={!stateId ? "location" : undefined} disabled={busy}>
                India
              </button>
            </li>
            {stateName && (
              <li>
                <button type="button" onClick={() => goTo(stateId, null)} aria-current={!placeId ? "location" : undefined} disabled={busy}>
                  {stateName}
                </button>
              </li>
            )}
            {place && (
              <li>
                <span aria-current="location">{place.name}</span>
              </li>
            )}
          </ol>
        </nav>

        {started && (
          <div className="atlas-tools" role="group" aria-label="Map view">
            {stateId && (
              <button type="button" className="atlas-back" onClick={() => goTo(null)} disabled={busy}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                India map
              </button>
            )}
            {stateId && renderer === "3d" && (
              <>
                <button type="button" className="atlas-tool" onClick={() => cameraControls.zoom(1)} aria-label="Zoom in">
                  +
                </button>
                <button type="button" className="atlas-tool" onClick={() => cameraControls.zoom(-1)} aria-label="Zoom out">
                  −
                </button>
              </>
            )}
            {renderer === "3d" && (
              <button type="button" className="atlas-tool" onClick={() => cameraControls.reset()} aria-label="Reset the view">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Before exploring: one clear invitation */}
        {!started && !stateId && (
          <div className="atlas-cta">
            <button type="button" className="btn btn-primary" onClick={() => useExplorer.getState().set({ started: true })}>
              Explore the map
            </button>
            <p className="mt-3 text-sm text-ink-muted">Then choose a state. Rajasthan is open now.</p>
          </div>
        )}

        {/* India: the state list (also the keyboard route) */}
        {started && !stateId && (
          <div className="atlas-panel atlas-panel-india">
            <p className="t-label text-ink-muted">Choose a state</p>
            <ul className="mt-3 space-y-1.5">
              {openStates.map((s) => (
                <li key={s.id}>
                  <button type="button" className="atlas-state-btn" onClick={() => goTo(s.id)} disabled={busy}>
                    <span className="atlas-pulse" aria-hidden="true" />
                    <span className="font-display text-[1.375rem] leading-none">{s.name}</span>
                    <Deva className="text-accent">{s.devanagari}</Deva>
                  </button>
                  <p className="mt-1 pl-5 text-sm text-ink-muted">{s.tagline}</p>
                </li>
              ))}
            </ul>
            {stateNames.length > 0 && (
              <label className="mt-5 block text-sm">
                <span className="text-ink-muted">Or any state</span>
                <select className="atlas-select" value="" onChange={(e) => e.target.value && goTo(e.target.value)} disabled={busy}>
                  <option value="">Select a state…</option>
                  {stateNames.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {isOpenState(s.id) ? "" : " (coming soon)"}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        {/* A state: its places, or a "coming soon" */}
        {stateId && (
          <div className="atlas-panel atlas-panel-state" hidden={!!place}>
            <p className="t-label text-ink-muted">{open ? "Places on the map" : "Coming soon"}</p>
            <h3 className="mt-2 flex flex-wrap items-baseline gap-x-3 font-display text-[2rem] leading-none">
              {stateName} {open && <Deva className="text-xl text-accent">{open.devanagari}</Deva>}
            </h3>
            {open ? (
              <>
                <p className="mt-2 text-sm text-ink-muted">{open.tagline}</p>
                <div className="atlas-filter" role="group" aria-label="Show places for">
                  <button type="button" aria-pressed={!interest} onClick={() => useExplorer.getState().set({ interest: null })}>
                    All
                  </button>
                  {interests
                    .filter((i) => list.some((p) => p.interests.includes(i.id)))
                    .map((i) => (
                      <button key={i.id} type="button" aria-pressed={interest === i.id} onClick={() => useExplorer.getState().set({ interest: interest === i.id ? null : i.id })}>
                        {i.label}
                      </button>
                    ))}
                </div>
                <ul className="atlas-places">
                  {list.map((p) => {
                    const dim = !!interest && !p.interests.includes(interest);
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          className={`atlas-place-btn ${hoverPlace === p.id ? "is-on" : ""} ${dim ? "is-dim" : ""}`}
                          onClick={() => goTo(stateId, p.id)}
                          onPointerEnter={() => useExplorer.getState().set({ hoverPlace: p.id })}
                          onPointerLeave={() => useExplorer.getState().hoverPlace === p.id && useExplorer.getState().set({ hoverPlace: null })}
                          onFocus={() => useExplorer.getState().set({ hoverPlace: p.id })}
                          onBlur={() => useExplorer.getState().set({ hoverPlace: null })}
                          disabled={busy}
                        >
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-sm text-ink-muted">{p.summary}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <>
                <p className="mt-3 text-[0.95rem]">We're mapping {stateName}'s places now. For the moment the atlas opens on Rajasthan, where we already plan every journey.</p>
                <button type="button" className="btn btn-primary mt-5" onClick={() => goTo("rajasthan")} disabled={busy}>
                  Explore Rajasthan
                </button>
              </>
            )}
          </div>
        )}

        {place && !busy && <DestinationCard key={place.id} place={place} />}

        {/* Hover tooltip (India) */}
        <div ref={tip} className="atlas-tip" hidden={!hoverName || !!stateId} aria-hidden="true">
          <span className="font-display text-lg leading-none">{hoverName}</span>
          <span className="atlas-tip-note">{hover && isOpenState(hover) ? "Explore →" : "Coming soon"}</span>
        </div>

        <p className="sr-only" aria-live="polite">
          {busy ? "" : place ? `${place.name} details open.` : stateName ? `${stateName} map.` : started ? "India map." : ""}
        </p>
      </div>
    </section>
  );
}
