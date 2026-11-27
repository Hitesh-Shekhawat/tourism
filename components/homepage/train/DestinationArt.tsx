import type { ReactNode } from "react";
import { Camel, Palace } from "./TrainBanner";

/*
 * Vector heritage illustrations for the coach banners, one per destination id (presentation only:
 * destination data is not touched). Each scene draws into a w × h box whose bottom edge is the
 * ground. An id without its own scene returns null, and the banner falls back to its generic
 * Rajasthan scene, so a new destination always gets a coach.
 */

type Art = { w: number; h: number; p: string };

function Sky({ w, h, p, id, top, bottom, sun }: Art & { id: string; top: string; bottom: string; sun?: [number, number] }) {
  return (
    <>
      <defs>
        <linearGradient id={`${p}-${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${p}-${id}-sky)`} />
      {sun && (
        <>
          <circle cx={sun[0]} cy={sun[1]} r={11} fill="#fff4d6" opacity={0.35} />
          <circle cx={sun[0]} cy={sun[1]} r={6.5} fill="#fff1cc" />
        </>
      )}
    </>
  );
}

function Water({ w, y, h, light = "#8fb0c0", deep = "#5e889e" }: { w: number; y: number; h: number; light?: string; deep?: string }) {
  return (
    <>
      <rect y={y} width={w} height={h - y} fill={deep} />
      <rect y={y} width={w} height={(h - y) * 0.45} fill={light} opacity={0.8} />
      <g stroke="#fff" strokeOpacity={0.35} strokeWidth={0.8}>
        {[0.12, 0.3, 0.55, 0.78].map((t) => (
          <line key={t} x1={w * t} y1={y + 6 + (t * 10) % 7} x2={w * t + 22} y2={y + 6 + (t * 10) % 7} />
        ))}
      </g>
    </>
  );
}

/** A temple spire (shikhara) with a pennant, base centre at (x, y). */
function Shikhara({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <rect x={-9} y={-8} width={18} height={8} />
      <path d="M-8 -8 C-8 -20 -3 -28 0 -32 C3 -28 8 -20 8 -8 Z" />
      <rect x={-0.6} y={-38} width={1.2} height={7} />
      <path d="M0.6 -38 l6 2 -6 2 Z" fill="#c8553f" />
    </g>
  );
}

function Tiger({ fill = "#cf7f2e" }: { fill?: string }) {
  return (
    <g>
      <path fill={fill} d="M4 12 C4 8 8 6 12 7 C14 5 16 5 17 7 L18 9 C24 8 38 8 46 10 C52 11 55 14 55 18 C58 16 62 14 66 9 L67.5 10 C63 16 60 20 56 22 L55 30 L52 30 L51 23 C46 24 40 24 36 24 L35 30 L32 30 L31 24 L24 24 L23 30 L20 30 L19 22 C16 21 13 22 11 30 L8 30 L8 21 C6 19 4 16 4 12 Z" />
      <g fill="none" stroke="#3b2414" strokeWidth={1.4} strokeLinecap="round">
        {[22, 28, 34, 40, 46].map((x) => (
          <path key={x} d={`M${x} 9.5 q2 4 0 8`} />
        ))}
        <path d="M8 10 l2 2 M11 9 l1 2.5" />
      </g>
      <circle cx={8} cy={10} r={0.9} fill="#1d120a" />
    </g>
  );
}

const scenes: Record<string, (a: Art) => ReactNode> = {
  // Hawa Mahal: tiers of latticed windows in pink sandstone
  jaipur: (a) => {
    const { w, h } = a;
    const cx = w * 0.5;
    return (
      <>
        <Sky {...a} id="jaipur" top="#ee9f7a" bottom="#f9dcc2" sun={[w * 0.85, 16]} />
        <rect y={h - 4} width={w} height={4} fill="#d9a27a" />
        <rect x={cx - 98} y={h - 9} width={196} height={6} fill="#c3705a" />
        {[0, 1, 2, 3, 4].map((i) => {
          const tw = 180 - i * 32;
          const y = h - 9 - (i + 1) * 9.4;
          const n = Math.floor(tw / 8.5);
          return (
            <g key={i}>
              <rect x={cx - tw / 2} y={y} width={tw} height={9.4} fill={i % 2 ? "#e6a18a" : "#dc917a"} />
              {Array.from({ length: n }, (_, k) => (
                <path key={k} d={`M${cx - tw / 2 + 3 + k * 8.5} ${y + 8} v-4 q2 -2.6 4 0 v4 Z`} fill="#9c4a39" />
              ))}
            </g>
          );
        })}
        {[-12, 0, 12].map((d) => (
          <path key={d} d={`M${cx + d - 5} ${h - 9 - 47} q5 -8 10 0 Z`} fill="#dc917a" />
        ))}
        <path d={`M${w * 0.14} 18 q3 -2.4 6 0 q3 -2.4 6 0 M${w * 0.2} 12 q2.4 -2 4.8 0 q2.4 -2 4.8 0`} fill="none" stroke="#7a3a24" strokeWidth={0.9} />
      </>
    );
  },
  // Lake Palace on Pichola, with its reflection and the Aravallis behind
  udaipur: (a) => {
    const { w, h } = a;
    const shore = h * 0.62;
    return (
      <>
        <Sky {...a} id="udaipur" top="#e49f86" bottom="#f6d8bd" sun={[w * 0.2, 14]} />
        <path d={`M0 ${shore} L0 ${shore - 12} C${w * 0.2} ${shore - 22} ${w * 0.4} ${shore - 14} ${w * 0.6} ${shore - 20} C${w * 0.8} ${shore - 26} ${w * 0.9} ${shore - 14} ${w} ${shore - 16} L${w} ${shore} Z`} fill="#b98a6c" />
        <Water w={w} y={shore} h={h} />
        <g transform={`translate(${w * 0.36} ${shore - 33}) scale(0.55)`}>
          <Palace fill="#f5ede0" windows="rgb(150 110 80 / 0.5)" />
        </g>
        <g transform={`translate(${w * 0.36} ${shore + 33}) scale(0.55 -0.55)`} opacity={0.3}>
          <Palace fill="#f5ede0" windows="rgb(150 110 80 / 0.5)" />
        </g>
        <path d={`M${w * 0.12} ${h - 7} h22 l-4 4 h-14 Z M${w * 0.12 + 11} ${h - 7} v-8 l6 6`} fill="#6b3a26" stroke="#6b3a26" strokeWidth={0.8} />
      </>
    );
  },
  // The golden fort above the dunes, with a caravan
  jaisalmer: (a) => {
    const { w, h } = a;
    return (
      <>
        <Sky {...a} id="jaisalmer" top="#efb46e" bottom="#f8e6c6" sun={[w * 0.86, 15]} />
        <path d={`M${w * 0.3} ${h - 10} C${w * 0.38} ${h - 26} ${w * 0.8} ${h - 28} ${w * 0.92} ${h - 10} Z`} fill="#cf9a52" />
        <g transform={`translate(${w * 0.42} ${h - 22 - 60 * 0.75}) scale(0.75)`}>
          <Palace fill="#c88d3c" windows="rgb(90 50 20 / 0.45)" />
        </g>
        <path d={`M0 ${h - 9} C${w * 0.25} ${h - 18} ${w * 0.5} ${h - 12} ${w} ${h - 8} V${h} H0 Z`} fill="#e2ae6c" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${12 + i * 28} ${h - 30 + i * 1.5}) scale(0.46)`}>
            <Camel fill="#5c2e1d" rider={i === 0} />
          </g>
        ))}
        <path d={`M0 ${h - 3} C${w * 0.3} ${h - 8} ${w * 0.6} ${h - 5} ${w} ${h - 4} V${h} H0 Z`} fill="#cf9256" />
      </>
    );
  },
  // Mehrangarh on its cliff above the blue city
  jodhpur: (a) => {
    const { w, h } = a;
    const houses = Array.from({ length: Math.ceil((w * 0.62) / 15) }, (_, i) => i);
    const blues = ["#5f86bd", "#7097c9", "#4f78b0"];
    return (
      <>
        <Sky {...a} id="jodhpur" top="#f0b083" bottom="#f8e2c8" sun={[w * 0.12, 14]} />
        <path d={`M${w * 0.3} ${h} L${w * 0.36} ${h * 0.55} L${w * 0.5} ${h * 0.46} L${w * 0.86} ${h * 0.44} L${w} ${h * 0.6} L${w} ${h} Z`} fill="#8d5f3f" />
        <g transform={`translate(${w * 0.44} ${h * 0.47 - 60 * 0.62}) scale(0.62)`}>
          <Palace fill="#a06d47" windows="rgb(60 30 15 / 0.45)" />
        </g>
        {houses.map((i) => {
          const tall = 10 + (i % 3) * 5;
          return (
            <g key={i}>
              <rect x={i * 15 - 2} y={h - tall} width={14} height={tall} fill={blues[i % 3]} />
              <rect x={i * 15 + 2} y={h - tall + 3} width={3} height={3} fill="#2f4d78" />
              <rect x={i * 15 + 7} y={h - tall + 3} width={3} height={3} fill="#2f4d78" />
            </g>
          );
        })}
      </>
    );
  },
  // Ghats stepping into the holy lake, white temples and Brahma's red spire
  pushkar: (a) => {
    const { w, h } = a;
    const ghat = h * 0.66;
    return (
      <>
        <Sky {...a} id="pushkar" top="#f1b48a" bottom="#fae5cd" sun={[w * 0.82, 15]} />
        <path d={`M0 ${ghat - 18} C${w * 0.3} ${ghat - 24} ${w * 0.6} ${ghat - 20} ${w} ${ghat - 24} V${ghat} H0 Z`} fill="#d9b38a" opacity={0.7} />
        <Shikhara x={w * 0.16} y={ghat - 6} fill="#f6f0e5" />
        <Shikhara x={w * 0.32} y={ghat - 6} s={1.15} fill="#c8553f" />
        <Shikhara x={w * 0.48} y={ghat - 6} s={0.9} fill="#f6f0e5" />
        <path d={`M${w * 0.6} ${ghat - 6} h30 v-10 q-15 -12 -30 0 Z`} fill="#f6f0e5" />
        <rect y={ghat - 6} width={w * 0.78} height={6} fill="#efe6d6" />
        <g stroke="#cdbfa6" strokeWidth={0.7}>
          <line x1={0} y1={ghat - 4} x2={w * 0.78} y2={ghat - 4} />
          <line x1={0} y1={ghat - 2} x2={w * 0.78} y2={ghat - 2} />
        </g>
        <Water w={w} y={ghat} h={h} />
        <g fill="#ffb347">
          {[0.08, 0.2, 0.33, 0.45, 0.58, 0.7].map((t) => (
            <circle key={t} cx={w * t} cy={ghat + 3} r={1.3} />
          ))}
        </g>
      </>
    );
  },
  // Green Aravalli hills, Nakki Lake and the marble Dilwara temples
  "mount-abu": (a) => {
    const { w, h } = a;
    const lake = h * 0.72;
    return (
      <>
        <Sky {...a} id="abu" top="#e6c39a" bottom="#f4e6cf" sun={[w * 0.15, 13]} />
        <path d={`M0 ${lake} L0 ${h * 0.4} C${w * 0.2} ${h * 0.2} ${w * 0.35} ${h * 0.3} ${w * 0.5} ${h * 0.22} C${w * 0.7} ${h * 0.12} ${w * 0.85} ${h * 0.3} ${w} ${h * 0.26} V${lake} Z`} fill="#93a36d" />
        <path d={`M0 ${lake} L0 ${h * 0.56} C${w * 0.25} ${h * 0.42} ${w * 0.45} ${h * 0.55} ${w * 0.62} ${h * 0.46} C${w * 0.8} ${h * 0.38} ${w * 0.9} ${h * 0.52} ${w} ${h * 0.5} V${lake} Z`} fill="#6f844c" />
        <g fill="#f4efe6">
          <rect x={w * 0.58} y={lake - 10} width={44} height={10} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${w * 0.58 + 2 + i * 14} ${lake - 10} q5 -9 10 0 Z`} />
          ))}
        </g>
        <Shikhara x={w * 0.58 + 22} y={lake - 10} s={0.55} fill="#f4efe6" />
        <Water w={w} y={lake} h={h} light="#9cbcc2" deep="#6f98a4" />
        <g fill="#4f6238">
          {[0.08, 0.16, 0.86, 0.94].map((t) => (
            <circle key={t} cx={w * t} cy={lake - 3} r={5} />
          ))}
        </g>
      </>
    );
  },
  // Forest, the old fort on its hill and a tiger on the move
  ranthambore: (a) => {
    const { w, h } = a;
    return (
      <>
        <Sky {...a} id="ranth" top="#e9b47c" bottom="#f5dfbf" sun={[w * 0.9, 13]} />
        <path d={`M${w * 0.45} ${h - 12} C${w * 0.55} ${h - 40} ${w * 0.8} ${h - 44} ${w * 0.98} ${h - 14} Z`} fill="#a57a52" />
        <g transform={`translate(${w * 0.58} ${h - 34 - 60 * 0.4}) scale(0.4)`}>
          <Palace fill="#8f6140" windows="rgb(50 25 10 / 0.45)" />
        </g>
        <g fill="#5f6d3c">
          {[0.04, 0.12, 0.22, 0.33, 0.42, 0.95].map((t, i) => (
            <circle key={t} cx={w * t} cy={h - 16 - (i % 2) * 4} r={9 + (i % 3) * 2} />
          ))}
        </g>
        <g fill="#4c5a2f">
          {[0.08, 0.18, 0.28, 0.38].map((t) => (
            <circle key={t} cx={w * t} cy={h - 10} r={7} />
          ))}
        </g>
        <rect y={h - 6} width={w} height={6} fill="#b59a5a" />
        <g transform={`translate(${w * 0.46} ${h - 34}) scale(0.95)`}>
          <Tiger />
        </g>
      </>
    );
  },
  // Junagarh's red sandstone and camel country
  bikaner: (a) => {
    const { w, h } = a;
    return (
      <>
        <Sky {...a} id="bikaner" top="#eca878" bottom="#f8e0c2" sun={[w * 0.15, 14]} />
        <g transform={`translate(${w * 0.4} ${h - 10 - 60 * 0.75}) scale(0.75)`}>
          <Palace fill="#b0533a" windows="rgb(70 20 12 / 0.45)" />
        </g>
        <path d={`M0 ${h - 8} C${w * 0.3} ${h - 14} ${w * 0.6} ${h - 10} ${w} ${h - 7} V${h} H0 Z`} fill="#dcab6f" />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${14 + i * 28} ${h - 27}) scale(0.44)`}>
            <Camel fill="#5c2e1d" rider={i === 0} />
          </g>
        ))}
      </>
    );
  },
};

/** The destination's illustration, or null when there is none (the banner then uses its generic scene). */
export function DestinationArt({ id, w, h, p }: { id: string } & Art) {
  const scene = scenes[id];
  return scene ? <g>{scene({ w, h, p })}</g> : null;
}

export const hasDestinationArt = (id: string) => id in scenes;
