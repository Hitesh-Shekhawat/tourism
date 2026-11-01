/**
 * Per-frame values shared between the DOM choreography (GSAP) and the WebGL scenes.
 * A plain mutable object, deliberately outside React and zustand: it changes on every scroll frame.
 */
export type SceneId = "threshold" | "trail" | "thar" | "starlight";

export const bus = {
  /** 0..1 progress of each chapter's pin (or scroll range on compact). */
  progress: { threshold: 0, trail: 0, thar: 0, starlight: 0 } as Record<SceneId, number>,
  /** Scenes on screen (render only those). */
  visible: { threshold: false, trail: false, thar: false, starlight: false } as Record<SceneId, boolean>,
  /** Smoothed scroll velocity in px/s (signed). */
  velocity: 0,
  /** 0..1 dune time-lapse intro (Ch04), then hands over to scroll. */
  tharIntro: 1,
  /** Pointer in -1..1 (desktop parallax). */
  pointer: { x: 0, y: 0 },
  /** HUD clock, in minutes since midnight. */
  minutes: 330,
  /** Trail stop index currently held (Ch03), -1 before the first. */
  trailStop: 0,
};

type Fn = () => void;
let invalidate: Fn | null = null;
const clockSubs = new Set<(m: number) => void>();

/** The R3F canvas registers its invalidate() (frameloop="demand"). */
export const setInvalidate = (fn: Fn | null) => void (invalidate = fn);
/** Ask the canvas for a frame. */
export const kick = () => invalidate?.();

export const anyVisible = () => Object.values(bus.visible).some(Boolean);

export function setMinutes(m: number) {
  if (Math.abs(m - bus.minutes) < 0.01) return;
  bus.minutes = m;
  clockSubs.forEach((f) => f(m));
}
export function onClock(f: (m: number) => void) {
  clockSubs.add(f);
  f(bus.minutes);
  return () => void clockSubs.delete(f);
}
