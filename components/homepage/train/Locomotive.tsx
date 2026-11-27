import { Medallion, TrainBanner } from "./TrainBanner";
import { BogieFrame, TrainWheels } from "./TrainWheels";

/** Body outline: sloped nose on the left (direction of travel), cab, long hood. Rail contact is y = 280. */
const BODY = "M22 226 C14 226 10 220 10 212 L10 152 C10 130 18 112 32 98 L62 68 C68 62 76 58 88 58 L582 58 C592 58 598 64 598 74 L598 226 Z";

export const LOCO_WHEELS = { front: [96, 144, 192], rear: [420, 468, 516], cy: 261 };

/**
 * Electric locomotive, side profile, x 0–598 of the train's 1400 × 280 drawing. Cream upper body,
 * royal maroon lower body, sandstone-gold lining; cab with windscreen, side window and door; louvred
 * long hood; pantograph and roof gear; twin headlights; pilot; Co-Co bogies; Rajasthan branding.
 */
export function Locomotive({ p }: { p: string }) {
  return (
    <g className="t2d-loco">
      {/* roof line and roof equipment */}
      <path d="M80 60 C84 52 92 50 102 50 L584 50 C592 50 596 54 596 60 Z" fill="#665b53" />
      <rect x={104} y={43} width={20} height={7} rx={3} fill="#8b8178" />
      <rect x={140} y={42} width={84} height={9} rx={3} fill="#776b61" />
      <rect x={470} y={40} width={96} height={11} rx={3} fill="#776b61" />
      <g stroke="#5c524b" strokeWidth={1}>
        {[486, 500, 514, 528, 542].map((x) => (
          <line key={x} x1={x} y1={42} x2={x} y2={49} />
        ))}
      </g>
      {/* pantograph */}
      <rect x={378} y={38} width={70} height={4} rx={1} fill="#3a3532" />
      <rect x={384} y={41} width={7} height={10} rx={2} fill="#cfc6ba" />
      <rect x={436} y={41} width={7} height={10} rx={2} fill="#cfc6ba" />
      <path d="M392 38 L414 19 L392 6 M440 38 L414 19" fill="none" stroke="#2f2a27" strokeWidth={2.4} strokeLinejoin="round" />
      <rect x={372} y={3} width={42} height={3} rx={1.5} fill="#2f2a27" />
      <path d="M372 4.5 q-6 0 -7 4 M414 4.5 q6 0 7 4" fill="none" stroke="#2f2a27" strokeWidth={1.6} />

      {/* body with livery */}
      <clipPath id={`${p}-loco`}>
        <path d={BODY} />
      </clipPath>
      <g clipPath={`url(#${p}-loco)`}>
        <rect x={0} y={50} width={610} height={180} fill={`url(#${p}-cream)`} />
        <rect x={0} y={146} width={610} height={84} fill={`url(#${p}-maroon)`} />
        <rect x={0} y={139} width={610} height={7} fill={`url(#${p}-gold)`} />
        <rect x={0} y={150} width={610} height={1.4} fill="#d8b56a" opacity={0.8} />
        <rect x={0} y={214} width={610} height={12} fill="#3f1018" />
        <rect x={0} y={212} width={610} height={1.4} fill="#c9a24a" />
        {/* nose shading gives the cab its curve */}
        <path d="M10 150 C10 130 18 112 32 98 L62 68 L72 68 L44 102 C30 118 24 134 24 152 L24 226 L10 226 Z" fill="#000" opacity={0.09} />
        <rect x={0} y={50} width={610} height={10} fill="#fff" opacity={0.18} />
      </g>
      <path d={BODY} fill="none" stroke="#3a2a22" strokeOpacity={0.5} strokeWidth={1.4} />

      {/* windscreen, wiper, cab side window */}
      <path d="M36 114 L38 102 L66 74 C69 71 72 70 76 70 L122 70 L122 114 Z" fill={`url(#${p}-glass)`} stroke="#4a3d33" strokeWidth={1.5} />
      <path d="M50 104 L72 82" stroke="#fff" strokeOpacity={0.28} strokeWidth={3} strokeLinecap="round" />
      <path d="M64 112 L86 92" stroke="#1e1b1a" strokeWidth={1.6} strokeLinecap="round" />
      <rect x={136} y={74} width={50} height={40} rx={5} fill={`url(#${p}-glass)`} stroke="#8f7c62" strokeWidth={1.4} />
      <path d="M142 106 L156 80" stroke="#fff" strokeOpacity={0.22} strokeWidth={2.5} strokeLinecap="round" />

      {/* cab door with grab rails and steps */}
      <rect x={198} y={68} width={40} height={146} rx={3} fill="none" stroke="#9f8a6b" strokeWidth={1.4} />
      <rect x={205} y={78} width={26} height={30} rx={3} fill={`url(#${p}-glass)`} stroke="#8f7c62" />
      <rect x={231} y={140} width={2.6} height={22} rx={1} fill="#8a7a64" />
      <g stroke="#9c8a70" strokeWidth={2.4} strokeLinecap="round">
        <line x1={193} y1={104} x2={193} y2={206} />
        <line x1={243} y1={104} x2={243} y2={206} />
      </g>
      <rect x={202} y={228} width={32} height={3.5} fill="#2b2624" />
      <rect x={202} y={236} width={32} height={3.5} fill="#2b2624" />
      <line x1={252} y1={62} x2={252} y2={224} stroke="#b9a88c" strokeOpacity={0.7} />

      {/* long hood: louvred grilles and rivet line */}
      {[268, 346, 424, 502].map((x) => (
        <rect key={x} x={x} y={72} width={70} height={58} rx={3} fill={`url(#${p}-louver)`} stroke="#b19c78" strokeWidth={1.2} />
      ))}
      <line x1={262} y1={135} x2={590} y2={135} stroke="#b5a17f" strokeDasharray="1.5 6" strokeLinecap="round" />

      {/* branding: medallion on the cab, compact banner on the hood */}
      <Medallion cx={166} cy={182} r={19} />
      <TrainBanner variant="compact" idPrefix={`${p}-lb`} x={266} y={157} width={312} height={50} />

      {/* headlights, marker lamp, top light */}
      <circle cx={13} cy={166} r={15} fill={`url(#${p}-glow)`} />
      <circle cx={13} cy={190} r={15} fill={`url(#${p}-glow)`} />
      <rect x={7} y={160} width={9} height={12} rx={2} fill="#2b2624" />
      <circle cx={12} cy={166} r={3.6} fill="#fff4cc" />
      <rect x={7} y={184} width={9} height={12} rx={2} fill="#2b2624" />
      <circle cx={12} cy={190} r={3.6} fill="#fff4cc" />
      <circle cx={13} cy={206} r={2.6} fill="#b8342a" />
      <rect x={74} y={51} width={16} height={7} rx={2} fill="#fff1c4" stroke="#6b5f55" />

      {/* underframe, pilot and front coupler */}
      <rect x={30} y={226} width={568} height={12} fill="#2b2624" />
      <path d="M10 226 L2 246 L52 246 L52 226 Z" fill="#2b2624" />
      <path d="M5 241 L52 241" stroke="#c9a24a" strokeWidth={2} />
      <rect x={0} y={222} width={9} height={8} rx={1} fill="#3a3431" />

      {/* fuel tank / equipment between the bogies */}
      <rect x={232} y={238} width={150} height={19} rx={3} fill="#2f2a28" />
      <rect x={240} y={240} width={134} height={14} rx={7} fill="#47403c" />
      <g fill="#6a615b">
        {[252, 282, 312, 342].map((x) => (
          <circle key={x} cx={x} cy={247} r={1.3} />
        ))}
      </g>

      {/* Co-Co bogies */}
      <TrainWheels xs={LOCO_WHEELS.front} cy={LOCO_WHEELS.cy} />
      <TrainWheels xs={LOCO_WHEELS.rear} cy={LOCO_WHEELS.cy} />
      <BogieFrame xs={LOCO_WHEELS.front} cy={LOCO_WHEELS.cy} />
      <BogieFrame xs={LOCO_WHEELS.rear} cy={LOCO_WHEELS.cy} />
    </g>
  );
}
