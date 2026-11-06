"use client";

import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Photo } from "@/components/ui/Photo";
import { Deva, SectionHead } from "@/components/ui/bits";
import { getPlace, interests, isOpenState, openStates, placeLinks, placesIn } from "@/content/explorer";
import { INDIA_GEO, loadGeo } from "@/lib/geo/projection";
import { getLenis } from "@/lib/smooth";
import { AtlasMap2D } from "./AtlasMap2D";
import { DestinationCard } from "./DestinationCard";
import { goTo, readUrl, scrollToAtlas, syncFromUrl, useChooseState, useExplorer } from "./store";

/**
 * Home · the atlas (§ flow: India map → Explore → state → place → itinerary). A flat map of India's
 * states, open ones in orange; choosing one replaces India with that state's own map, its places
 * pinned where they are. All navigation is DOM as well as map: breadcrumbs, a state list, a place
 * list and the place card, so it works by keyboard and screen reader.
 */
export function IndiaExplorer({ n = "04" }: { n?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const choose = useChooseState();
  const [stateNames, setStateNames] = useState<{ id: string; name: string }[]>([]);
  const { started, stateId, placeId, hover, hoverPlace, pinHover, busy, interest } = useExplorer(
    useShallow((s) => ({ started: s.started, stateId: s.stateId, placeId: s.placeId, hover: s.hover, hoverPlace: s.hoverPlace, pinHover: s.pinHover, busy: s.busy, interest: s.interest })),
  );

  // Where the visitor is comes from the URL: on load (a shared link) and on back / forward
  useEffect(() => {
    syncFromUrl();
    // a shared link: open on the map (after Lenis has started, so it does not pull the page back)
    if (readUrl().state) setTimeout(() => scrollToAtlas(true), 120);
    window.addEventListener("popstate", syncFromUrl);
    void loadGeo(INDIA_GEO)
      .then((g) => setStateNames(g.features.map((f) => ({ id: f.properties.id, name: f.properties.name })).sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {});
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // The tooltip follows the pointer
  useEffect(() => {
    const el = stage.current!;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const t = tip.current;
      if (!t) return;
      // beside the pointer, flipped to the other side near the stage's right and bottom edges
      let x = e.clientX - r.left + 18;
      let y = e.clientY - r.top + 18;
      if (x + t.offsetWidth > r.width - 8) x = e.clientX - r.left - 18 - t.offsetWidth;
      if (y + t.offsetHeight > r.height - 8) y = Math.max(8, e.clientY - r.top - 18 - t.offsetHeight);
      t.style.transform = `translate(${x}px, ${y}px)`;
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
  const hoverPin = stateId && pinHover && hoverPlace && hoverPlace !== placeId ? getPlace(hoverPlace) : undefined;

  return (
    <section id="explore" aria-labelledby="explore-title" className="atlas">
      <div className="wrap atlas-head">
        <SectionHead n={n} label="Interactive atlas" />
        <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="explore-title" className="t-h1 max-w-[16ch] lg:col-span-7" data-reveal>
            Where in India would you like to go?
          </h2>
          <p className="measure text-ink-muted lg:col-span-4 lg:col-start-9" data-reveal>
            Select Rajasthan to open its cities, and the forts, lakes and dunes we plan journeys around in each one.
          </p>
        </div>
      </div>

      <div ref={stage} className="atlas-stage" data-view={stateId ? "state" : "india"} data-started={started ? "" : undefined} data-place={placeId ? "" : undefined} data-pointer={hover || hoverPlace ? "" : undefined}>
        <div className="atlas-canvas">
          <AtlasMap2D />
        </div>

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

        {stateId && (
          <div className="atlas-tools" role="group" aria-label="Map view">
            <button type="button" className="atlas-back" onClick={() => goTo(null)} disabled={busy}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              India map
            </button>
          </div>
        )}

        {/* Before exploring: one clear invitation */}
        {!started && !stateId && (
          <div className="atlas-cta">
            <button type="button" className="btn btn-primary" onClick={() => choose("rajasthan")} disabled={busy}>
              Select Rajasthan
            </button>
            <p className="mt-3 text-sm text-ink-muted">
              Or{" "}
              <button type="button" className="link font-semibold text-ink" onClick={() => useExplorer.getState().set({ started: true })}>
                browse every state
              </button>
              . Rajasthan is open now.
            </p>
          </div>
        )}

        {/* India: the state list (also the keyboard route) */}
        {started && !stateId && (
          <div className="atlas-panel atlas-panel-india">
            <p className="t-label text-ink-muted">Choose a state</p>
            <ul className="mt-3 space-y-1.5">
              {openStates.map((s) => (
                <li key={s.id}>
                  <button type="button" className="atlas-state-btn" onClick={() => choose(s.id)} disabled={busy}>
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
                <select className="atlas-select" value="" onChange={(e) => e.target.value && choose(e.target.value)} disabled={busy}>
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
                <button type="button" className="btn btn-primary mt-5" onClick={() => choose("rajasthan")} disabled={busy}>
                  Explore Rajasthan
                </button>
              </>
            )}
          </div>
        )}

        {place && !busy && <DestinationCard key={place.id} place={place} />}

        {/* Preview photos for this state's pins, fetched ahead so the hover card opens with its image */}
        {stateId && (
          <div className="atlas-preload" aria-hidden="true">
            {list.map((p) => (
              <div key={p.id} className="relative aspect-[16/9] w-[232px]">
                <Photo k={p.image} fill sizes="232px" compact decorative priority />
              </div>
            ))}
          </div>
        )}

        {/* Hover: a state's name on the India map; a photo card for a pin on a state map */}
        <div ref={tip} className={`atlas-tip ${hoverPin ? "atlas-tip-card" : ""}`} hidden={stateId ? !hoverPin : !hoverName} aria-hidden="true">
          {hoverPin ? (
            <>
              <div className="relative aspect-[16/9] overflow-hidden bg-dune">
                <Photo k={hoverPin.image} fill sizes="232px" compact decorative />
              </div>
              <div className="p-3">
                <p className="flex items-baseline gap-2 text-ivory">
                  <span className="font-display text-[1.125rem] leading-none">{hoverPin.name}</span>
                  <Deva className="text-xs text-dune">{hoverPin.devanagari}</Deva>
                </p>
                <p className="atlas-tip-text mt-1.5">{hoverPin.summary}</p>
                <p className="mt-2 border-t border-ivory/15 pt-2 text-[0.75rem] font-semibold text-ivory/90">{hoverPin.attractions.map((a) => a.name).join(" · ")}</p>
                <p className="atlas-tip-note mt-2">{placeLinks(hoverPin).itinerary ? "Itinerary ready · click for details" : "Click for details"}</p>
              </div>
            </>
          ) : (
            <>
              <span className="font-display text-lg leading-none">{hoverName}</span>
              <span className="atlas-tip-note">{hover && isOpenState(hover) ? "Explore →" : "Coming soon"}</span>
            </>
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {busy ? "" : place ? `${place.name} details open.` : stateName ? `${stateName} map.` : started ? "India map." : ""}
        </p>
      </div>
    </section>
  );
}
