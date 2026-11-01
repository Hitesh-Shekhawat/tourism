/**
 * The Golden Trail schedule (§6.4), shared by the DOM chapter cards and the 3D camera so they
 * always agree. Pin progress p (0..1) → which stop is held, and how far along the route we are.
 *
 *   lead-in (overview → stop 0) | per segment: hold 15% · travel 70% · hold 15% | tail (hold last stop)
 */
export const TRAIL_STOPS = 5;
const LEAD = 0.07;
const TAIL = 0.1;
const HOLD = 0.15;

export type TrailState = {
  /** Stop travelled from (-1 = the overview before the first stop) and towards. */
  from: number;
  to: number;
  /** Eased 0..1 between from and to (0 while holding at `from`, 1 while holding at `to`). */
  t: number;
  /** The stop whose card is showing (nearest stop; -1 during the lead-in's first half). */
  stop: number;
  /** True while the camera holds at `stop`. */
  holding: boolean;
  /** Drawn fraction of the route, 0..1. */
  route: number;
};

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.min(1, Math.max(0, x));

export function trailState(p: number, n = TRAIL_STOPS): TrailState {
  p = clamp(p);
  if (p < LEAD) {
    const t = ease(p / LEAD);
    return { from: -1, to: 0, t, stop: t > 0.5 ? 0 : -1, holding: false, route: 0 };
  }
  if (p > 1 - TAIL) return { from: n - 1, to: n - 1, t: 0, stop: n - 1, holding: true, route: 1 };
  const u = ((p - LEAD) / (1 - LEAD - TAIL)) * (n - 1); // 0 .. n-1
  const seg = Math.min(n - 2, Math.floor(u));
  const local = u - seg;
  if (local < HOLD) return { from: seg, to: seg + 1, t: 0, stop: seg, holding: true, route: seg / (n - 1) };
  if (local > 1 - HOLD) return { from: seg, to: seg + 1, t: 1, stop: seg + 1, holding: true, route: (seg + 1) / (n - 1) };
  const k = (local - HOLD) / (1 - 2 * HOLD);
  const t = ease(k);
  return { from: seg, to: seg + 1, t, stop: t < 0.5 ? seg : seg + 1, holding: false, route: (seg + k) / (n - 1) };
}

/** Pin progress at which stop k is first held (for keyboard / chapter navigation). */
export function stopProgress(k: number, n = TRAIL_STOPS) {
  if (k <= 0) return LEAD;
  // stop k is reached when segment k-1 enters its closing hold: u = k - HOLD
  return LEAD + ((k - HOLD) / (n - 1)) * (1 - LEAD - TAIL) + 0.002;
}
