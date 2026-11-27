import type { ReactNode, Ref } from "react";
import type { Place } from "@/content/explorer";
import { Palace } from "./TrainBanner";
import { Train } from "./Train";
import type { BannerDestination } from "./TrainBanner";
import { TrainTrack } from "./TrainTrack";

/** A khejri tree, the Thar's thorny shade tree, in a 60 × 70 box (base at y = 70). */
function Khejri({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y - 70 * s}) scale(${s})`} fill="#6f5f3e">
      <path d="M29 70 L28 44 L18 30 M28 44 L36 26 M28 52 L40 40" stroke="#5a4a30" strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={18} cy={26} rx={16} ry={9} />
      <ellipse cx={38} cy={20} rx={18} ry={10} />
      <ellipse cx={44} cy={36} rx={12} ry={7} />
      <ellipse cx={28} cy={14} rx={12} ry={8} />
    </g>
  );
}

/** A chhatri (domed cenotaph pavilion) in a 40 × 46 box. */
function Chhatri({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y - 46})`} fill="#b8774b">
      <rect x={2} y={40} width={36} height={6} />
      <rect x={5} y={20} width={4} height={20} />
      <rect x={31} y={20} width={4} height={20} />
      <rect x={18} y={20} width={4} height={20} />
      <rect x={0} y={16} width={40} height={5} />
      <path d="M4 16 Q20 -6 36 16 Z" />
      <rect x={19.2} y={-2} width={1.6} height={6} />
    </g>
  );
}

type Props = {
  stops: Place[];
  /** One coach per destination, in journey order. */
  coaches: BannerDestination[];
  active: number;
  trainRef: Ref<HTMLDivElement>;
  farRef: Ref<HTMLDivElement>;
  midRef: Ref<HTMLDivElement>;
  /** The stop panel (rendered by the section, which owns the links). */
  children?: ReactNode;
};

/**
 * The 2D railway scene: sky and sun, a far ridge with a hill fort and a near band of dunes (both
 * parallax layers, moved by the section's ScrollTrigger), a station board naming the current stop,
 * the track and the train. The train and track share one --rail line, so the wheels always sit on
 * the rail. Everything is HTML/CSS/SVG; nothing animates on its own.
 */
export function TrainScene({ stops, coaches, active, trainRef, farRef, midRef, children }: Props) {
  const stop = active >= 0 ? stops[active] : null;
  return (
    <div className="t2d-stage">
      <div className="t2d-sky" aria-hidden="true" />
      <div className="t2d-sun" aria-hidden="true" />

      <div ref={farRef} className="t2d-layer t2d-far" aria-hidden="true">
        <svg viewBox="0 0 1600 260" preserveAspectRatio="xMidYMax slice">
          <path d="M0 260 L0 170 C140 150 240 130 360 140 C480 150 560 118 680 116 C800 114 880 150 1010 140 C1130 130 1230 104 1360 112 C1460 118 1540 140 1600 134 L1600 260 Z" fill="#e2bb8c" />
          <path d="M0 260 L0 190 C120 168 220 150 330 158 C450 166 520 120 640 112 C770 104 840 150 980 146 C1100 142 1180 118 1320 126 C1440 134 1520 160 1600 156 L1600 260 Z" fill="#d6a676" />
          {/* hill fort along the ridge: walls following the crest, bastions, palace */}
          <path d="M520 132 L560 118 L600 112 L640 112 L700 116 L760 126 L760 134 L700 124 L640 120 L600 120 L560 126 L520 140 Z" fill="#c08655" />
          {[540, 580, 620, 660, 700, 740].map((x) => (
            <rect key={x} x={x} y={x < 640 ? 108 - (x - 540) * 0.06 : 108 + (x - 640) * 0.1} width={10} height={14} fill="#c08655" />
          ))}
          <g transform="translate(580 62) scale(0.8)">
            <Palace fill="#c08655" windows="rgb(90 40 20 / 0.35)" />
          </g>
        </svg>
      </div>

      <div ref={midRef} className="t2d-layer t2d-mid" aria-hidden="true">
        <svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMax slice">
          <path d="M0 200 L0 120 C200 88 380 96 560 116 C720 134 900 92 1080 100 C1260 108 1400 128 1600 112 L1600 200 Z" fill="#e8bd83" />
          <Khejri x={250} y={118} s={1.1} />
          <Chhatri x={880} y={112} />
          <Khejri x={1240} y={112} s={0.9} />
          <path d="M0 200 L0 150 C180 132 360 138 540 150 C720 162 920 136 1120 142 C1300 148 1460 160 1600 150 L1600 200 Z" fill="#dcab6f" />
        </svg>
      </div>

      {/* Station board, Indian Railways style: Hindi above, English below */}
      <div className="t2d-station" aria-hidden="true">
        <div key={stop?.id ?? "start"} className="t2d-board">
          <span lang="hi" className="t2d-board-hi">{stop ? stop.devanagari : "राजस्थान"}</span>
          <span className="t2d-board-en">{stop ? stop.name : "Rajasthan"}</span>
        </div>
        <div className="t2d-posts" />
      </div>

      <div className="t2d-track-wrap" aria-hidden="true">
        <TrainTrack />
      </div>
      <Train coaches={coaches} trainRef={trainRef} />
      {children}
    </div>
  );
}
