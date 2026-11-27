import { TrainBanner, type BannerDestination } from "./TrainBanner";
import { BogieFrame, TrainWheels } from "./TrainWheels";

const BODY = "M640 226 L640 72 C640 61 648 54 660 54 L1370 54 C1382 54 1390 61 1390 72 L1390 226 Z";
export const COACH_WHEELS = { front: [716, 784], rear: [1246, 1314], cy: 261 };
/** Distance from one coach to the next: 750 body + 42 coupling gap, the same gap as engine to first coach. */
export const COACH_PITCH = 792;
/** Centre of the first coach's body (x 640–1390). */
export const COACH_CENTER = 1015;
const WINDOWS = Array.from({ length: 10 }, (_, i) => 704 + i * 62);

/**
 * Passenger coach, x 640–1398 of the train drawing, coupled behind the locomotive: cream upper body,
 * maroon lower body with the same gold lining, ten windows, doors at both ends with grab rails and
 * steps, the large Rajasthan banner, underframe equipment, two bogies and the end gangway.
 */
export function PassengerCoach({ p, index = 0, destination }: { p: string; index?: number; destination?: BannerDestination }) {
  const q = `${p}-c${index}`;
  return (
    <g className="t2d-coach" data-i={index} transform={index ? `translate(${index * COACH_PITCH} 0)` : undefined}>
      {/* curved roof and vents */}
      <path d="M644 57 C656 40 700 34 760 34 L1274 34 C1334 34 1376 40 1386 57 Z" fill="#665b53" />
      <path d="M690 39 L1340 39" stroke="#8a7e73" strokeWidth={1.2} />
      {[780, 900, 1020, 1140, 1260].map((x) => (
        <rect key={x} x={x} y={27} width={42} height={8} rx={3.5} fill="#7d7168" />
      ))}

      {/* body with livery */}
      <clipPath id={`${q}-coach`}>
        <path d={BODY} />
      </clipPath>
      <g clipPath={`url(#${q}-coach)`}>
        <rect x={630} y={50} width={780} height={180} fill={`url(#${p}-cream)`} />
        <rect x={630} y={111} width={780} height={120} fill={`url(#${p}-maroon)`} />
        <rect x={630} y={105} width={780} height={6} fill={`url(#${p}-gold)`} />
        <rect x={630} y={214} width={780} height={12} fill="#3f1018" />
        <rect x={630} y={212} width={780} height={1.4} fill="#c9a24a" />
        <rect x={630} y={50} width={780} height={9} fill="#fff" opacity={0.18} />
      </g>
      <path d={BODY} fill="none" stroke="#3a2a22" strokeOpacity={0.5} strokeWidth={1.4} />

      {/* passenger windows */}
      {WINDOWS.map((x) => (
        <g key={x}>
          <rect x={x} y={64} width={46} height={34} rx={4} fill={`url(#${p}-glass)`} stroke="#9a8668" strokeWidth={1.3} />
          <line x1={x + 2} y1={75} x2={x + 44} y2={75} stroke="#d6c8aa" strokeOpacity={0.45} />
          <path d={`M${x + 8} 94 L${x + 20} 68`}stroke="#fff" strokeOpacity={0.2} strokeWidth={2.4} strokeLinecap="round" />
        </g>
      ))}

      {/* doors at both ends: frame, droplight, handle, grab rails, steps */}
      {[650, 1344].map((x) => (
        <g key={x}>
          <rect x={x} y={60} width={36} height={160} rx={3} fill="none" stroke="#9f8a6b" strokeWidth={1.4} />
          <rect x={x + 7} y={68} width={22} height={28} rx={3} fill={`url(#${p}-glass)`} stroke="#8f7c62" />
          <rect x={x + 29} y={140} width={2.4} height={20} rx={1} fill="#8a7a64" />
          <g stroke="#9c8a70" strokeWidth={2.2} strokeLinecap="round">
            <line x1={x - 4} y1={104} x2={x - 4} y2={206} />
            <line x1={x + 40} y1={104} x2={x + 40} y2={206} />
          </g>
          <rect x={x + 3} y={228} width={30} height={3.5} fill="#2b2624" />
          <rect x={x + 3} y={236} width={30} height={3.5} fill="#2b2624" />
        </g>
      ))}

      {/* the large side banner */}
      <TrainBanner variant="full" idPrefix={`${q}-b`} x={700} y={116} width={630} height={92} destination={destination} />
      {/* focus: a gold frame around the banner (toggled by class, see styles/v5.css) */}
      <rect className="t2d-glow" x={696} y={112} width={638} height={100} rx={5} fill="none" stroke="#ffd98a" strokeWidth={3} />

      {/* interior lights in the focused coach; a soft shade over the others */}
      <g className="t2d-lit" fill="#ffd98a">
        {WINDOWS.map((x) => (
          <rect key={x} x={x + 1.5} y={65.5} width={43} height={31} rx={3} />
        ))}
      </g>
      <path className="t2d-dim" d={BODY} fill="#1d0f0b" />

      {/* end gangway, tail lamp */}
      <rect x={1390} y={64} width={8} height={150} rx={2} fill="#3a3431" />
      <g stroke="#57504b" strokeWidth={1}>
        {[80, 100, 120, 140, 160, 180, 200].map((y) => (
          <line key={y} x1={1390} y1={y} x2={1398} y2={y} />
        ))}
      </g>
      <circle cx={1384} cy={200} r={2.6} fill="#b8342a" />

      {/* underframe and equipment */}
      <rect x={646} y={226} width={738} height={12} fill="#2b2624" />
      <rect x={846} y={238} width={232} height={19} rx={9} fill="#47403c" />
      <rect x={846} y={243} width={232} height={2} fill="#5c544f" />
      <rect x={1106} y={238} width={86} height={18} rx={2} fill="#2f2a28" />
      <g stroke="#4c4541">
        {[1116, 1128, 1140, 1152, 1164, 1176].map((x) => (
          <line key={x} x1={x} y1={241} x2={x} y2={253} />
        ))}
      </g>

      {/* bogies */}
      <TrainWheels xs={COACH_WHEELS.front} cy={COACH_WHEELS.cy} />
      <TrainWheels xs={COACH_WHEELS.rear} cy={COACH_WHEELS.cy} />
      <BogieFrame xs={COACH_WHEELS.front} cy={COACH_WHEELS.cy} />
      <BogieFrame xs={COACH_WHEELS.rear} cy={COACH_WHEELS.cy} />
    </g>
  );
}
