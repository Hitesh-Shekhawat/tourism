import { memo, useId, type Ref } from "react";
import { Locomotive } from "./Locomotive";
import { COACH_CENTER, COACH_PITCH, PassengerCoach } from "./PassengerCoach";
import type { BannerDestination } from "./TrainBanner";

/** The drawing's fixed geometry. Width grows with the coach count; the wheels' rail contact is y = 280. */
export const TRAIN_VIEW = {
  height: 280,
  wheelRadius: 19,
  /** Centre of the locomotive body (x 10–598). */
  locoCenter: 304,
  /** Body centre of coach i. */
  coachCenter: (i: number) => COACH_CENTER + i * COACH_PITCH,
  /** Total drawing width for n coaches (one coach = 1400, the original drawing). */
  width: (n: number) => (n > 0 ? 1400 + (n - 1) * COACH_PITCH : 604),
};

/** Centre coupler with air hoses. dx = 0 joins the engine to coach 0; dx = k × pitch joins coach k−1 to coach k. */
function Coupler({ dx = 0 }: { dx?: number }) {
  return (
    <g className="t2d-coupler" transform={dx ? `translate(${dx} 0)` : undefined}>
      <rect x={594} y={213} width={50} height={9} rx={2} fill="#2b2624" />
      <rect x={603} y={205} width={13} height={25} rx={2} fill="#3a3431" />
      <rect x={624} y={205} width={13} height={25} rx={2} fill="#3a3431" />
      <rect x={613} y={211} width={14} height={13} rx={2} fill="#5a524c" />
      <path d="M600 226 C604 241 612 243 619 236 C626 243 635 241 640 226" fill="none" stroke="#1d1a19" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

type Props = { coaches: BannerDestination[]; trainRef?: Ref<HTMLDivElement>; className?: string };

/**
 * The complete Rajasthan tourism train as ONE vector drawing: the locomotive (left, leading), then one
 * coach per destination, in order, each joined to the one before by a coupler. Everything sits in a
 * single <svg> and a single group, so it can only move as one vehicle. The coach count comes from the
 * `coaches` data; nothing here assumes how many there are. Memoised: stop changes toggle classes on
 * the coaches (see TrendingDestinations) without re-rendering this drawing.
 */
export const Train = memo(function Train({ coaches, trainRef, className = "" }: Props) {
  const p = `t${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const width = TRAIN_VIEW.width(coaches.length);
  const names = coaches.map((c) => c.name).join(", ");
  return (
    <div ref={trainRef} className={`t2d-train ${className}`} style={{ aspectRatio: `${width} / ${TRAIN_VIEW.height}` }} data-units={width}>
      <svg
        viewBox={`0 0 ${width} ${TRAIN_VIEW.height}`}
        className="t2d-train-svg"
        role="img"
        aria-label={`A Rajasthan tourism train: an electric locomotive pulling ${coaches.length} passenger coaches, one for each destination (${names}), in cream, maroon and gold`}
      >
        <defs>
          <linearGradient id={`${p}-cream`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f8efdf" />
            <stop offset="0.6" stopColor="#efe2c8" />
            <stop offset="1" stopColor="#e3d1b0" />
          </linearGradient>
          <linearGradient id={`${p}-maroon`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7d2534" />
            <stop offset="1" stopColor="#551622" />
          </linearGradient>
          <linearGradient id={`${p}-gold`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ecd08e" />
            <stop offset="0.5" stopColor="#c9a24a" />
            <stop offset="1" stopColor="#a8823a" />
          </linearGradient>
          <linearGradient id={`${p}-glass`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3f5866" />
            <stop offset="0.55" stopColor="#24343d" />
            <stop offset="1" stopColor="#1a252c" />
          </linearGradient>
          <radialGradient id={`${p}-glow`}>
            <stop offset="0" stopColor="#fff4cc" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff4cc" stopOpacity="0" />
          </radialGradient>
          <pattern id={`${p}-louver`} width={8} height={6} patternUnits="userSpaceOnUse">
            <rect width={8} height={6} fill="#eadcc2" />
            <rect y={4} width={8} height={1.3} fill="#ab9673" />
          </pattern>
        </defs>
        <g className="t2d-train-body">
          <Locomotive p={p} />
          {coaches.map((c, i) => (
            <g key={c.id}>
              <Coupler dx={i * COACH_PITCH} />
              <PassengerCoach p={p} index={i} destination={c} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
});
