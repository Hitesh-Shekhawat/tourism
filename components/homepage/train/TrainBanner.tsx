/*
 * Rajasthan tourism banner, drawn entirely in SVG: palace and fort silhouette, camel caravan, dunes,
 * a diamond (jaali) band and gold rules. `full` is the coach's large side banner; `compact` is the
 * locomotive's panel in the same visual language. Rendered as a nested <svg> so its artwork is laid
 * out in its own coordinates and drops into the train at any (x, y).
 */

import { DestinationArt, hasDestinationArt } from "./DestinationArt";

const FONT_DISPLAY = "var(--font-fraunces), Georgia, 'Times New Roman', serif";
const FONT_ITALIC = "var(--font-fraunces-italic), var(--font-fraunces), Georgia, serif";
const GOLD = "#e3c47e";
const IVORY = "#f4e8d2";

/** Palace and fort silhouette in a 160 × 60 box (bottom edge at y = 60). */
export function Palace({ fill, windows = "rgb(0 0 0 / 0.28)" }: { fill: string; windows?: string }) {
  const merlons = (x0: number, x1: number, y: number) =>
    Array.from({ length: Math.floor((x1 - x0) / 8) }, (_, i) => <rect key={`${x0}-${i}`} x={x0 + i * 8} y={y} width={4} height={4} />);
  return (
    <g fill={fill}>
      {/* curtain wall with merlons */}
      <rect x={0} y={38} width={160} height={22} />
      {merlons(0, 160, 34)}
      {/* left bastion */}
      <rect x={4} y={22} width={18} height={38} />
      <path d="M3 22 Q13 9 23 22 Z" />
      <rect x={12.5} y={7} width={1.4} height={6} />
      {/* palace block, central dome and two chhatris */}
      <rect x={40} y={18} width={80} height={42} />
      {merlons(40, 120, 14)}
      <path d="M62 18 C62 2 98 2 98 18 Z" />
      <rect x={79.3} y={-4} width={1.6} height={8} />
      <rect x={44} y={8} width={10} height={8} />
      <path d="M42.5 9 Q49 0 55.5 9 Z" />
      <rect x={106} y={8} width={10} height={8} />
      <path d="M104.5 9 Q111 0 117.5 9 Z" />
      {/* right tower */}
      <rect x={136} y={24} width={18} height={36} />
      <path d="M135 24 Q145 12 155 24 Z" />
      {/* jharokha windows */}
      <g fill={windows}>
        {[48, 60, 72, 84, 96, 108].map((x) => (
          <path key={x} d={`M${x} 46 V36 Q${x + 3} 31.5 ${x + 6} 36 V46 Z`} />
        ))}
        <path d="M10 50 V40 Q13 36 16 40 V50 Z" />
        <path d="M142 50 V40 Q145 36 148 40 V50 Z" />
      </g>
    </g>
  );
}

/** A dromedary in profile, facing left, in a 52 × 46 box (feet at y = 46). */
export function Camel({ fill, rider = false }: { fill: string; rider?: boolean }) {
  return (
    <g fill={fill}>
      <path d="M2 15 C3 11 7 9 11 10 L14 11 C16 14 17 19 21 21 C24 13 30 7 35 8 C41 9 45 15 48 19 C51 21 52 25 51 29 L52 35 L50.5 35 L49.5 31 L48.5 46 L46.5 46 L45.5 32 C40 33.5 33 33.5 28 32.5 L27 46 L25 46 L24 32.5 L22.5 46 L20.5 46 L20.5 30 C17 27 13 21 11 15 L7 16.5 C5 17.5 3 17 2 15 Z" />
      {rider && (
        <>
          <circle cx={33} cy={-1} r={2.6} />
          <path d="M30 2 h6 l1 7 h-8 z" />
        </>
      )}
    </g>
  );
}

/** Lotus medallion. */
export function Medallion({ cx, cy, r, color = GOLD }: { cx: number; cy: number; r: number; color?: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`} fill="none" stroke={color} strokeWidth={Math.max(0.8, r / 14)}>
      <circle r={r} />
      <circle r={r * 0.82} strokeDasharray={`${r * 0.08} ${r * 0.12}`} />
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-r * 0.42} rx={r * 0.14} ry={r * 0.34} transform={`rotate(${i * 45})`} />
      ))}
      <circle r={r * 0.12} fill={color} stroke="none" />
    </g>
  );
}

/** A destination a coach represents: its banner names it and shows its illustration. */
export type BannerDestination = { id: string; name: string; epithet: string; number: number };

type Props = { x: number; y: number; width: number; height: number; idPrefix: string; variant?: "full" | "compact"; destination?: BannerDestination };

export function TrainBanner({ x, y, width, height, idPrefix: p, variant = "full", destination }: Props) {
  return variant === "full" ? (
    <FullBanner x={x} y={y} width={width} height={height} p={p} destination={destination} />
  ) : (
    <CompactBanner x={x} y={y} width={width} height={height} p={p} />
  );
}

/** Text that never overflows its panel: compressed only when its estimated width would. */
const fit = (text: string, size: number, max: number, ratio = 0.64) => (text.length * size * ratio > max ? { textLength: max, lengthAdjust: "spacingAndGlyphs" as const } : {});

/** Diamond (jaali) band pattern and the shared gradients. */
function BannerDefs({ p }: { p: string }) {
  return (
    <defs>
      <pattern id={`${p}-diamonds`} width={12} height={7} patternUnits="userSpaceOnUse">
        <rect width={12} height={7} fill="#4a1420" />
        <path d="M6 0.6 L10 3.5 L6 6.4 L2 3.5 Z" fill={GOLD} opacity={0.85} />
      </pattern>
      <linearGradient id={`${p}-panel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#661d2b" />
        <stop offset="1" stopColor="#3f111b" />
      </linearGradient>
      <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#efb46e" />
        <stop offset="0.55" stopColor="#f6d39c" />
        <stop offset="1" stopColor="#f8e6c6" />
      </linearGradient>
    </defs>
  );
}

function FullBanner({ x, y, width: W, height: H, p, destination: d }: { x: number; y: number; width: number; height: number; p: string; destination?: BannerDestination }) {
  const split = Math.round(W * 0.36); // text panel | illustrated scene
  const sceneX = split + 6;
  const sceneW = W - sceneX - 8;
  const groundY = H - 15;
  return (
    <svg x={x} y={y} width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="hidden">
      <BannerDefs p={p} />
      <clipPath id={`${p}-scene`}>
        <rect x={sceneX} y={15} width={sceneW} height={H - 30} />
      </clipPath>

      {/* frame: maroon ground, gold rule, jaali bands */}
      <rect width={W} height={H} rx={3} fill="#3c0f17" />
      <rect x={3} y={3} width={W - 6} height={H - 6} rx={2} fill="none" stroke={GOLD} strokeWidth={1.4} />
      <rect x={6} y={6} width={W - 12} height={7} fill={`url(#${p}-diamonds)`} />
      <rect x={6} y={H - 13} width={W - 12} height={7} fill={`url(#${p}-diamonds)`} />

      {/* text panel */}
      <rect x={8} y={15} width={split - 8} height={H - 30} fill={`url(#${p}-panel)`} />
      {d ? (
        <>
          <text x={(split + 8) / 2} y={H * 0.3} textAnchor="middle" fill="#d9b877" fontFamily="var(--font-instrument), Arial, sans-serif" fontWeight={600} fontSize={H * 0.082} letterSpacing={1.6}>
            RAJASTHAN · COACH {String(d.number).padStart(2, "0")}
          </text>
          <text x={(split + 8) / 2} y={H * 0.53} textAnchor="middle" fill={GOLD} fontFamily={FONT_DISPLAY} fontWeight={600} fontSize={H * 0.26} {...fit(d.name.toUpperCase(), H * 0.26, split * 0.82)}>
            {d.name.toUpperCase()}
          </text>
          <g stroke={GOLD} strokeWidth={0.8} opacity={0.9}>
            <line x1={split * 0.16} y1={H * 0.6} x2={split * 0.44} y2={H * 0.6} />
            <line x1={split * 0.6} y1={H * 0.6} x2={split * 0.88} y2={H * 0.6} />
          </g>
          <path d={`M${(split + 8) / 2} ${H * 0.565} l4 3.2 -4 3.2 -4 -3.2 Z`} fill={GOLD} />
          <text x={(split + 8) / 2} y={H * 0.725} textAnchor="middle" fill={IVORY} fontFamily={FONT_ITALIC} fontStyle="italic" fontSize={H * 0.13} {...fit(d.epithet, H * 0.13, split * 0.85, 0.5)}>
            {d.epithet}
          </text>
          <text x={(split + 8) / 2} y={H * 0.82} textAnchor="middle" fill="#d9b877" fontFamily="var(--font-instrument), Arial, sans-serif" fontWeight={600} fontSize={H * 0.078} letterSpacing={0.8}>
            Explore. Experience. Remember.
          </text>
        </>
      ) : (
        <>
      <text x={(split + 8) / 2} y={H * 0.46} textAnchor="middle" fill={GOLD} fontFamily={FONT_DISPLAY} fontWeight={600} fontSize={H * 0.33} textLength={split * 0.8} lengthAdjust="spacingAndGlyphs">
        RAJASTHAN
      </text>
      <g stroke={GOLD} strokeWidth={0.8} opacity={0.9}>
        <line x1={split * 0.16} y1={H * 0.545} x2={split * 0.44} y2={H * 0.545} />
        <line x1={split * 0.6} y1={H * 0.545} x2={split * 0.88} y2={H * 0.545} />
      </g>
      <path d={`M${(split + 8) / 2} ${H * 0.51} l4 3.2 -4 3.2 -4 -3.2 Z`} fill={GOLD} />
      <text x={(split + 8) / 2} y={H * 0.68} textAnchor="middle" fill={IVORY} fontFamily={FONT_ITALIC} fontStyle="italic" fontSize={H * 0.14}>
        The Land of Kings
      </text>
      <text x={(split + 8) / 2} y={H * 0.8} textAnchor="middle" fill="#d9b877" fontFamily="var(--font-instrument), Arial, sans-serif" fontWeight={600} fontSize={H * 0.092} letterSpacing={0.8}>
        Explore. Experience. Remember.
      </text>
        </>
      )}

      {/* divider: gold rule with diamonds */}
      <line x1={split + 3} y1={15} x2={split + 3} y2={H - 15} stroke={GOLD} strokeWidth={1.2} />
      {[0.3, 0.5, 0.7].map((t) => (
        <path key={t} d={`M${split + 3} ${H * t - 4} l3.5 4 -3.5 4 -3.5 -4 Z`} fill={GOLD} />
      ))}

      {/* illustrated scene: the destination's own, or the generic sky, sun, palace, dunes and caravan */}
      {d && hasDestinationArt(d.id) ? (
        <g clipPath={`url(#${p}-scene)`}>
          <g transform={`translate(${sceneX} 15)`}>
            <DestinationArt id={d.id} w={sceneW} h={H - 30} p={p} />
          </g>
        </g>
      ) : (
      <g clipPath={`url(#${p}-scene)`}>
        <rect x={sceneX} y={15} width={sceneW} height={H - 30} fill={`url(#${p}-sky)`} />
        <circle cx={sceneX + sceneW * 0.8} cy={H * 0.36} r={H * 0.21} fill="#fff4d6" opacity={0.35} />
        <circle cx={sceneX + sceneW * 0.8} cy={H * 0.36} r={H * 0.12} fill="#fff1cc" />
        <path d={`M${sceneX + sceneW * 0.3} ${H * 0.3} q3 -2.4 6 0 q3 -2.4 6 0 M${sceneX + sceneW * 0.37} ${H * 0.24} q2.4 -2 4.8 0 q2.4 -2 4.8 0`} fill="none" stroke="#7a3a24" strokeWidth={0.9} />
        <g transform={`translate(${sceneX + sceneW * 0.5} ${groundY - 60 * 0.9}) scale(0.9)`}>
          <Palace fill="#9a4a33" windows="rgb(60 16 14 / 0.45)" />
        </g>
        <path
          d={`M${sceneX} ${groundY - 12} C${sceneX + sceneW * 0.18} ${groundY - 26} ${sceneX + sceneW * 0.34} ${groundY - 22} ${sceneX + sceneW * 0.5} ${groundY - 12} C${sceneX + sceneW * 0.66} ${groundY - 2} ${sceneX + sceneW * 0.82} ${groundY - 16} ${sceneX + sceneW} ${groundY - 10} V${groundY + 2} H${sceneX} Z`}
          fill="#e2ae6c"
        />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${sceneX + 18 + i * 28} ${groundY - 34 + i * 1.5}) scale(0.46)`}>
            <Camel fill="#5c2e1d" rider={i === 0} />
          </g>
        ))}
        <path d={`M${sceneX + 29} ${groundY - 24} L${sceneX + 44} ${groundY - 22} M${sceneX + 57} ${groundY - 22.5} L${sceneX + 72} ${groundY - 20.5}`} stroke="#5c2e1d" strokeWidth={0.7} />
        <path
          d={`M${sceneX} ${groundY - 3} C${sceneX + sceneW * 0.25} ${groundY - 11} ${sceneX + sceneW * 0.45} ${groundY - 9} ${sceneX + sceneW * 0.62} ${groundY - 3} C${sceneX + sceneW * 0.78} ${groundY + 1} ${sceneX + sceneW * 0.9} ${groundY - 6} ${sceneX + sceneW} ${groundY - 4} V${groundY + 2} H${sceneX} Z`}
          fill="#cf9256"
        />
      </g>
      )}
      <rect x={sceneX} y={15} width={sceneW} height={H - 30} fill="none" stroke="rgb(227 196 126 / 0.5)" strokeWidth={0.8} />
    </svg>
  );
}

function CompactBanner({ x, y, width: W, height: H, p }: { x: number; y: number; width: number; height: number; p: string }) {
  return (
    <svg x={x} y={y} width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="hidden">
      <BannerDefs p={p} />
      <rect width={W} height={H} rx={3} fill="#3c0f17" />
      <rect x={2.5} y={2.5} width={W - 5} height={H - 5} rx={2} fill="none" stroke={GOLD} strokeWidth={1.1} />
      <rect x={5} y={5} width={W - 10} height={5} fill={`url(#${p}-diamonds)`} />
      <rect x={5} y={H - 10} width={W - 10} height={5} fill={`url(#${p}-diamonds)`} />
      <Medallion cx={H * 0.62} cy={H / 2} r={H * 0.27} />
      <text x={W * 0.47} y={H * 0.56} textAnchor="middle" fill={GOLD} fontFamily={FONT_DISPLAY} fontWeight={600} fontSize={H * 0.36} textLength={W * 0.46} lengthAdjust="spacingAndGlyphs">
        RAJASTHAN
      </text>
      <text x={W * 0.47} y={H * 0.77} textAnchor="middle" fill={IVORY} fontFamily={FONT_ITALIC} fontStyle="italic" fontSize={H * 0.17}>
        The Land of Kings
      </text>
      <g transform={`translate(${W - H * 1.42} ${H * 0.62 - 60 * 0.3}) scale(0.3)`}>
        <Palace fill={GOLD} windows="#3c0f17" />
      </g>
      <path d={`M${W - H * 1.5} ${H * 0.66} C${W - H * 1.1} ${H * 0.58} ${W - H * 0.7} ${H * 0.62} ${W - H * 0.2} ${H * 0.64}`} fill="none" stroke={GOLD} strokeWidth={0.8} />
    </svg>
  );
}
