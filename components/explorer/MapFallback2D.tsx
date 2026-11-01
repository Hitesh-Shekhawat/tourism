"use client";

import { useEffect, useMemo, useState } from "react";
import { isOpenState, placesIn } from "@/content/explorer";
import { boundsOf, fitProjection, INDIA_GEO, loadGeo, polygonsOf, stateGeo, type GeoCollection, type GeoFeature, type Projection } from "@/lib/geo/projection";
import { cameraControls, goTo, useExplorer } from "./store";

const SIZE = 1000;

const pathOf = (f: GeoFeature, proj: Projection) =>
  polygonsOf(f)
    .map((poly) => poly.map((ring) => "M" + ring.map((ll) => proj(ll).map((v) => (v + SIZE / 2).toFixed(1)).join(" ")).join("L") + "Z").join(""))
    .join("");

/**
 * The atlas without WebGL: the same data, projection and states as the 3D map, drawn as SVG.
 * India's states are clickable; a state shows its places as pins. Keyboard users have the lists beside it.
 */
export function MapFallback2D() {
  const stateId = useExplorer((s) => s.stateId);
  const placeId = useExplorer((s) => s.placeId);
  const hover = useExplorer((s) => s.hover);
  const interest = useExplorer((s) => s.interest);
  const [india, setIndia] = useState<GeoCollection | null>(null);
  const [state, setState] = useState<{ id: string; data: GeoCollection } | null>(null);

  useEffect(() => {
    void loadGeo(INDIA_GEO).then(setIndia);
    cameraControls.reset = () => {};
    cameraControls.zoom = () => {};
  }, []);
  useEffect(() => {
    if (!stateId) return setState(null);
    let alive = true;
    loadGeo(stateGeo(stateId))
      .then((data) => alive && setState({ id: stateId, data }))
      .catch(() => alive && goTo(null, null, true));
    return () => void (alive = false);
  }, [stateId]);

  const indiaProj = useMemo(() => (india ? fitProjection(boundsOf(india.features), SIZE * 0.94) : null), [india]);
  const stateProj = useMemo(() => (state ? fitProjection(boundsOf(state.data.features), SIZE * 0.86) : null), [state]);

  if (stateId && state && stateProj) {
    const f = state.data.features[0];
    return (
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="atlas-svg" role="img" aria-label={`Map of ${f.properties.name}`}>
        <path d={pathOf(f, stateProj)} className="atlas-svg-state is-open" />
        {placesIn(state.id).map((p) => {
          const [x, y] = stateProj(p.coords).map((v) => v + SIZE / 2);
          const dim = interest && !p.interests.includes(interest);
          return (
            <g key={p.id} transform={`translate(${x} ${y})`} className={`atlas-svg-pin ${p.id === placeId ? "is-on" : ""} ${dim ? "is-dim" : ""}`} onClick={() => goTo(state.id, p.id)}>
              <circle r="11" />
              <text y="-20" textAnchor="middle">
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (!india || !indiaProj) return null;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="atlas-svg" role="img" aria-label="Map of India's states">
      {india.features.map((f) => (
        <path
          key={f.properties.id}
          d={pathOf(f, indiaProj)}
          className={`atlas-svg-state ${isOpenState(f.properties.id) ? "is-open" : ""} ${hover === f.properties.id ? "is-hover" : ""}`}
          onPointerEnter={() => useExplorer.getState().started && useExplorer.getState().set({ hover: f.properties.id })}
          onPointerLeave={() => useExplorer.getState().hover === f.properties.id && useExplorer.getState().set({ hover: null })}
          onClick={() => useExplorer.getState().started && goTo(f.properties.id)}
        />
      ))}
    </svg>
  );
}
