"use client";

import { create } from "zustand";
import { PREF_KEY } from "./boot";

/**
 * desktop = the full film; compact = lighter choreography, no long pins; reduced = no pins, posters, instant colour.
 * The sundial menu's "Motion: full / calm" overrides the OS setting for the session (§10).
 */
export type Mode = "desktop" | "compact" | "reduced";
export type MotionPref = "full" | "calm" | null;

type StoryState = {
  /** The home story is mounted (true even while a sheet is open over it). */
  story: boolean;
  mode: Mode;
  /** WebGL scenes are running (desktop, WebGL2, more than 4 cores). */
  gl: boolean;
  /** The opening 3D scene has drawn its first frame (it takes over Ch00 before the other scenes finish building). */
  glOpen: boolean;
  pref: MotionPref;
  /** Index of the chapter at the centre of the viewport, and the clock it implies. */
  chapter: number;
  minutes: number;
  menu: boolean;
  sheet: boolean;
  set: (p: Partial<Omit<StoryState, "set">>) => void;
};

export const useStory = create<StoryState>((set) => ({
  story: false,
  mode: "desktop",
  gl: false,
  glOpen: false,
  pref: null,
  chapter: 0,
  minutes: 330,
  menu: false,
  sheet: false,
  set: (p) => set(p),
}));

export function readPref(): MotionPref {
  try {
    const v = sessionStorage.getItem(PREF_KEY);
    return v === "full" || v === "calm" ? v : null;
  } catch {
    return null;
  }
}

export function writePref(v: MotionPref) {
  try {
    if (v) sessionStorage.setItem(PREF_KEY, v);
    else sessionStorage.removeItem(PREF_KEY);
  } catch {}
}

export function computeMode(pref: MotionPref): Mode {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (pref === "calm" || (reduce && pref !== "full")) return "reduced";
  // the full film on every viewport; story.css sizes the pinned stages for phones
  return "desktop";
}

/** One WebGL context on desktop and mobile alike; off in reduced mode and on very weak devices (§13 GPU rule). */
export function canRunGl(mode: Mode) {
  if (mode === "reduced") return false;
  if ((navigator.hardwareConcurrency || 8) <= 2) return false;
  if (new URLSearchParams(location.search).has("nogl")) return false;
  try {
    const c = document.createElement("canvas");
    const ok = !!c.getContext("webgl2");
    return ok;
  } catch {
    return false;
  }
}
