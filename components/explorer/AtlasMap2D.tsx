"use client";

import { useEffect, useMemo, useState } from "react";
import { isOpenState, openStates, placesIn } from "@/content/explorer";
import { boundsOf, centroidOf, fitProjection, INDIA_GEO, loadGeo, polygonsOf, stateGeo, type GeoCollection, type GeoFeature, type Projection } from "@/lib/geo/projection";
import { goTo, useExplorer } from "./store";

const SIZE = 1000;
const at = (proj: Projection, ll: [number, number]) => proj(ll).map((v) => v + SIZE / 2) as [number, number];

const pathOf = (f: GeoFeature, proj: Projection) =>
  polygonsOf(f)
    .map((poly) => poly.map((ring) => "M" + ring.map((ll) => at(proj, ll).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z").join(""))
    .join("");

const canPick = () => {
  const s = useExplorer.getState();
  return s.started && !s.busy;
};

/**
 * The atlas map, flat: India's states from real boundaries (public/geo), open states in orange and the
 * rest in grey. Choosing a state replaces India with that state alone, its places pinned at their
 * real coordinates. Same store and URL as the rest of the atlas; keyboard users have the lists beside it.
 */
export function AtlasMap2D() {
  const stateId = useExplorer((s) => s.stateId);
  const placeId = useExplorer((s) => s.placeId);
  const hover = useExplorer((s) => s.hover);
  const hoverPlace = useExplorer((s) => s.hoverPlace);
  const interest = useExplorer((s) => s.interest);
  const [india, setIndia] = useState<GeoCollection | null>(null);
  const [state, setState] = useState<{ id: string; data: GeoCollection } | null>(null);

  useEffect(() => {
    loadGeo(INDIA_GEO)
      .then(setIndia)
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!stateId) return setState(null);
    let alive = true;
    useExplorer.getState().set({ busy: true });
    loadGeo(stateGeo(stateId))
      .then((data) => alive && setState({ id: stateId, data }))
      .catch(() => alive && goTo(null, null, true))
      .finally(() => alive && useExplorer.getState().set({ busy: false }));
    return () => {
      alive = false;
      useExplorer.getState().set({ busy: false });
    };
  }, [stateId]);

  const indiaProj = useMemo(() => (india ? fitProjection(boundsOf(india.features), SIZE * 0.94) : null), [india]);
  const stateProj = useMemo(() => (state ? fitProjection(boundsOf(state.data.features), SIZE * 0.84) : null), [state]);

  if (stateId) {
    if (!state || state.id !== stateId || !stateProj) return null;
    const f = state.data.features[0];
    return (
      <svg key={state.id} viewBox={`0 0 ${SIZE} ${SIZE}`} className="atlas-svg atlas-svg-enter" role="img" aria-label={`Map of ${f.properties.name}`}>
        <path d={pathOf(f, stateProj)} className="atlas-svg-state is-active" />
        {placesIn(state.id).map((p, i) => {
          const [x, y] = at(stateProj, p.coords);
          const dim = !!interest && !p.interests.includes(interest);
          const on = p.id === placeId || p.id === hoverPlace;
          return (
            <g
              key={p.id}
              transform={`translate(${x} ${y})`}
              className={`atlas-svg-pin ${on ? "is-on" : ""} ${dim ? "is-dim" : ""}`}
              style={{ animationDelay: `${250 + i * 70}ms` }}
              onClick={() => canPick() && goTo(state.id, p.id)}
              onPointerEnter={(e) => e.pointerType === "mouse" && useExplorer.getState().set({ hoverPlace: p.id, pinHover: true })}
              onPointerLeave={() => useExplorer.getState().hoverPlace === p.id && useExplorer.getState().set({ hoverPlace: null, pinHover: false })}
            >
              <circle className="atlas-svg-halo" r="22" />
              <circle r="10" />
              <text y={p.labelBelow ? 40 : -22} textAnchor="middle">
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (!india || !indiaProj) return null;
  const labels = openStates
    .map((o) => {
      const f = india.features.find((x) => x.properties.id === o.id);
      return f ? { ...o, pos: at(indiaProj, centroidOf(f)) } : null;
    })
    .filter((l) => !!l);
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="atlas-svg atlas-svg-enter" role="img" aria-label="Map of India's states">
      {india.features.map((f) => {
        const id = f.properties.id;
        return (
          <path
            key={id}
            d={pathOf(f, indiaProj)}
            className={`atlas-svg-state ${isOpenState(id) ? "is-active" : ""} ${hover === id ? "is-hover" : ""}`}
            onPointerEnter={() => canPick() && useExplorer.getState().set({ hover: id })}
            onPointerLeave={() => useExplorer.getState().hover === id && useExplorer.getState().set({ hover: null })}
            onClick={() => canPick() && goTo(id)}
          />
        );
      })}
      {labels.map((l) => (
        <g key={l.id} transform={`translate(${l.pos[0]} ${l.pos[1]})`} className="atlas-svg-label" onClick={() => canPick() && goTo(l.id)}>
          <circle className="atlas-svg-halo" r="16" />
          <circle r="6" />
          <text y="-18" textAnchor="middle">
            {l.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
