"use client";

import { create } from "zustand";
import { interests, type Interest } from "@/content/explorer";
import { getLenis } from "@/lib/smooth";

/**
 * Atlas state, shared by the DOM UI, the 3D scene and the 2D fallback. The URL is the source of truth
 * for where the visitor is (?state=rajasthan&place=jaipur), so the browser's back button walks back
 * out through the map without reloading the page.
 */
type ExplorerState = {
  /** The visitor pressed Explore: the map takes pointer input. */
  started: boolean;
  stateId: string | null;
  placeId: string | null;
  /** State under the pointer on the India map, and place under the pointer on a state map. */
  hover: string | null;
  hoverPlace: string | null;
  /** The pointer is on a pin itself (not the place list), so the photo preview may show. */
  pinHover: boolean;
  interest: Interest | null;
  /** A scene transition is running. */
  busy: boolean;
  /** "3d" once the WebGL scene has drawn, "2d" without WebGL (or when it fails). */
  renderer: "pending" | "3d" | "2d";
  set: (p: Partial<Omit<ExplorerState, "set">>) => void;
};

export const useExplorer = create<ExplorerState>((set) => ({
  started: false,
  stateId: null,
  placeId: null,
  hover: null,
  hoverPlace: null,
  pinHover: false,
  interest: null,
  busy: false,
  renderer: "pending",
  set: (p) => set(p),
}));

/** Camera commands for the on-screen controls; the active renderer fills these in. */
export const cameraControls = { reset: () => {}, zoom: (_dir: 1 | -1) => {} };

export function readUrl() {
  const q = new URLSearchParams(window.location.search);
  return { state: q.get("state"), place: q.get("place"), interest: q.get("interest") };
}

/** Moves the atlas (state, place) and records it in the history; `replace` for in-place updates. */
export function goTo(state: string | null, place: string | null = null, replace = false) {
  const url = new URL(window.location.href);
  if (state) url.searchParams.set("state", state);
  else url.searchParams.delete("state");
  if (state && place) url.searchParams.set("place", place);
  else url.searchParams.delete("place");
  url.hash = "explore";
  if (url.href !== window.location.href) window.history[replace ? "replaceState" : "pushState"](null, "", url);
  useExplorer.getState().set({ started: true, stateId: state, placeId: state ? place : null, hover: null, hoverPlace: null });
}

/** Re-reads the URL (browser back / forward). */
export function syncFromUrl() {
  const { state, place, interest } = readUrl();
  const s = useExplorer.getState();
  if (interest && interests.some((i) => i.id === interest) && interest !== s.interest) s.set({ interest: interest as Interest });
  if (state !== s.stateId || place !== s.placeId) s.set({ stateId: state, placeId: state ? place : null, started: s.started || !!state, hover: null, hoverPlace: null });
}

/** Brings the map itself into view, under the header (through Lenis when it is running, which owns the scroll). */
export function scrollToAtlas(immediate = false) {
  const el = document.querySelector<HTMLElement>(".atlas-stage");
  if (!el) return;
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76;
  const lenis = getLenis();
  const off = () => Math.abs(el.getBoundingClientRect().top - header) > 4;
  if (lenis) {
    lenis.scrollTo(el, { offset: -header, immediate, duration: 1.2, force: true });
    // a ScrollTrigger refresh (images loading below) can cut Lenis' animation short: finish the move
    setTimeout(() => off() && lenis.scrollTo(el, { offset: -header, duration: 0.5, force: true }), immediate ? 200 : 1400);
  } else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header, behavior: immediate || reducedMotion() ? "auto" : "smooth" });
}

export const reducedMotion = () => typeof document !== "undefined" && document.documentElement.dataset.motion === "reduced";
