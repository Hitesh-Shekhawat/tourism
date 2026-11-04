"use client";

import { useEffect, useMemo, useState } from "react";
import { isOpenState, openStates, placesIn, type Place } from "@/content/explorer";
import { boundsOf, centroidOf, fitProjection, INDIA_GEO, loadGeo, polygonsOf, stateGeo, type GeoCollection, type GeoFeature, type Projection } from "@/lib/geo/projection";
import { goTo, useExplorer } from "./store";

const SIZE = 1000;
const at = (proj: Projection, ll: [number, number]) => proj(ll).map((v) => v + SIZE / 2) as [number, number];

const pathOf = (f: GeoFeature, proj: Projection) =>
  polygonsOf(f)
    .map((poly) => poly.map((ring) => "M" + ring.map((ll) => at(proj, ll).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z").join(""))
    .join("");

/** Extrusion depth of the selected state: stacked copies of its outline, 2 units apart. */
const LAYERS = [1, 2, 3, 4, 5, 6, 7];

const activate = (e: React.KeyboardEvent, f: () => void) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    f();
  }
};

type Label = { x: number; y: number; anchor: "middle" | "start" | "end" };
/**
 * Label placement without collisions: each pin tries above, below, right, then left of itself and
 * takes the first spot that overlaps neither an earlier label nor any pin. Text is 24 units high.
 */
function layoutLabels(pins: { p: Place; x: number; y: number }[]): Map<string, Label> {
  const placed: [number, number, number, number][] = [];
  const out = new Map<string, Label>();
  const hit = (b: [number, number, number, number]) =>
    placed.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]) || pins.some((q) => q.x > b[0] - 14 && q.x < b[2] + 14 && q.y > b[1] - 14 && q.y < b[3] + 14);
  for (const { p, x, y } of pins) {
    const w = p.name.length * 13.5;
    const tries: (Label & { box: [number, number, number, number] })[] = [
      { x, y: y - 24, anchor: "middle", box: [x - w / 2, y - 46, x + w / 2, y - 18] },
      { x, y: y + 42, anchor: "middle", box: [x - w / 2, y + 20, x + w / 2, y + 48] },
      { x: x + 22, y: y + 8, anchor: "start", box: [x + 20, y - 14, x + 22 + w, y + 14] },
      { x: x - 22, y: y + 8, anchor: "end", box: [x - 22 - w, y - 14, x - 20, y + 14] },
    ];
    if (p.labelBelow) tries.unshift(tries.splice(1, 1)[0]);
    const pick = tries.find((t) => !hit(t.box)) ?? tries[0];
    placed.push(pick.box);
    out.set(p.id, { x: pick.x, y: pick.y, anchor: pick.anchor });
  }
  return out;
}

/**
 * The atlas map (SVG, one consistent projection). India's states from real boundaries (public/geo,
 * DataMeet CC BY 4.0): open states in terracotta, lifted, the rest muted. Choosing a state eases the
 * "camera" into it (a pure scale + translate of the India map, 1s) while the other states fade; the
 * state then rises as a gently extruded, side-lit shape with its places pinned at their true coordinates.
 * Pins are focusable buttons; the lists beside the map offer the same routes as text.
 */
export function AtlasMap2D() {
  const stateId = useExplorer((s) => s.stateId);
  const placeId = useExplorer((s) => s.placeId);
  const hover = useExplorer((s) => s.hover);
  const hoverPlace = useExplorer((s) => s.hoverPlace);
  const interest = useExplorer((s) => s.interest);
  const busy = useExplorer((s) => s.busy);
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
  const indiaPaths = useMemo(() => (india && indiaProj ? india.features.map((f) => ({ id: f.properties.id, name: f.properties.name, d: pathOf(f, indiaProj) })) : []), [india, indiaProj]);
  // The selected state's own view, fitted from its India outline with India's x-scale (same shape, same projection)
  const focus = useMemo(() => {
    if (!stateId || !india || !indiaProj) return null;
    const f = india.features.find((x) => x.properties.id === stateId);
    if (!f) return null;
    const proj = fitProjection(boundsOf([f]), SIZE * 0.84, indiaProj.k);
    const [cx, cy] = at(indiaProj, proj.center);
    const r = proj.scale / indiaProj.scale;
    return { id: stateId, proj, transform: `translate(${SIZE / 2}px, ${SIZE / 2}px) scale(${r}) translate(${-cx}px, ${-cy}px)` };
  }, [stateId, india, indiaProj]);

  const pins = useMemo(() => {
    if (!focus) return [];
    return placesIn(focus.id).map((p) => {
      const [x, y] = at(focus.proj, p.coords);
      return { p, x, y };
    });
  }, [focus]);
  const labels = useMemo(() => layoutLabels(pins), [pins]);

  if (!india || !indiaProj) return null;

  const canPick = () => !useExplorer.getState().busy;
  const stateReady = !!(focus && state && state.id === focus.id);
  const stateFeature = stateReady ? state!.data.features[0] : null;
  const stateLabels = openStates
    .map((o) => {
      const f = india.features.find((x) => x.properties.id === o.id);
      return f ? { ...o, pos: at(indiaProj, centroidOf(f)) } : null;
    })
    .filter((l) => !!l);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="atlas-svg" data-zoomed={focus ? "" : undefined} role="group" aria-label={focus ? `Map of ${stateFeature?.properties.name ?? "the state"}` : "Map of India's states"}>
      <defs>
        <linearGradient id="atlas-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c8693c" />
          <stop offset="0.55" stopColor="#b25a31" />
          <stop offset="1" stopColor="#9a4826" />
        </linearGradient>
      </defs>

      {/* India: the whole country; zooms into the chosen state */}
      <g className="atlas-layer-india" style={{ transform: focus?.transform ?? "none" }}>
        {indiaPaths.map(({ id, name, d }) => {
          const open = isOpenState(id);
          const pick = () => canPick() && goTo(id);
          return (
            <path
              key={id}
              d={d}
              className={`atlas-svg-state ${open ? "is-active" : ""} ${hover === id ? "is-hover" : ""} ${focus ? (focus.id === id ? "is-focus" : "is-away") : ""}`}
              onPointerEnter={() => !focus && useExplorer.getState().set({ hover: id })}
              onPointerLeave={() => useExplorer.getState().hover === id && useExplorer.getState().set({ hover: null })}
              onClick={() => !focus && pick()}
              {...(open && !focus ? { tabIndex: 0, role: "button", "aria-label": `Select ${name}`, onKeyDown: (e: React.KeyboardEvent) => activate(e, pick), onFocus: () => useExplorer.getState().set({ hover: id }), onBlur: () => useExplorer.getState().set({ hover: null }) } : {})}
            />
          );
        })}
        {!focus &&
          stateLabels.map((l) => (
            <g key={l.id} transform={`translate(${l.pos[0]} ${l.pos[1]})`} className="atlas-svg-label" aria-hidden="true" onClick={() => canPick() && goTo(l.id)}>
              <circle className="atlas-svg-halo" r="16" />
              <circle r="6" />
              <text y="-18" textAnchor="middle">
                {l.name}
              </text>
            </g>
          ))}
      </g>

      {/* The chosen state: extruded, side-lit, with its places */}
      {stateReady && stateFeature && focus && (
        <g key={focus.id} className="atlas-layer-state">
          {(() => {
            const d = pathOf(stateFeature, focus.proj);
            return (
              <g className="atlas-solid">
                {LAYERS.map((i) => (
                  <path key={i} d={d} className="atlas-side" style={{ ["--dy" as string]: `${i * 2}px` }} />
                ))}
                <path d={d} className={`atlas-face ${isOpenState(focus.id) ? "" : "is-muted"}`} />
              </g>
            );
          })()}
          {pins.map(({ p, x, y }, i) => {
            const dim = !!interest && !p.interests.includes(interest);
            const on = p.id === placeId || p.id === hoverPlace;
            const l = labels.get(p.id)!;
            const pick = () => canPick() && goTo(focus.id, p.id);
            return (
              <g
                key={p.id}
                transform={`translate(${x} ${y})`}
                className={`atlas-svg-pin ${on ? "is-on" : ""} ${dim ? "is-dim" : ""}`}
                style={{ animationDelay: `${450 + i * 70}ms` }}
                tabIndex={busy ? -1 : 0}
                role="button"
                aria-label={`${p.name}: ${p.summary} Open details.`}
                aria-pressed={p.id === placeId}
                onClick={pick}
                onKeyDown={(e) => activate(e, pick)}
                onFocus={() => useExplorer.getState().set({ hoverPlace: p.id })}
                onBlur={() => useExplorer.getState().hoverPlace === p.id && useExplorer.getState().set({ hoverPlace: null })}
                onPointerEnter={(e) => e.pointerType === "mouse" && useExplorer.getState().set({ hoverPlace: p.id, pinHover: true })}
                onPointerLeave={() => useExplorer.getState().hoverPlace === p.id && useExplorer.getState().set({ hoverPlace: null, pinHover: false })}
              >
                <g className="atlas-pin-body">
                  <circle className="atlas-svg-halo" r="22" />
                  <circle r="10" />
                </g>
                <text x={l.x - x} y={l.y - y} textAnchor={l.anchor}>
                  {p.name}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
