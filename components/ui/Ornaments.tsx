import { archPath } from "@/lib/arch";

/*
 * Rajasthani ornament set: fine single-stroke line art after Shekhawati fresco borders, jaali screens
 * and miniature painting. Pure SVG (no images, no JS), currentColor, decorative only (aria-hidden).
 * Strokes carrying `orn-draw` trace themselves in when an ancestor [data-reveal] gets .is-in
 * (styles/home.css); without JS or under reduced motion they are simply drawn.
 */

type P = { className?: string };
const f = (n: number) => +n.toFixed(2);

/** Lotus rosette: two rings of petals around a seed circle (the centre of many haveli ceilings). */
export function Rosette({ className = "" }: P) {
  const petals = (n: number, r0: number, r1: number, w: number, rot = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rot;
      const [cx, cy] = [Math.cos(a), Math.sin(a)];
      const [px, py] = [-cy, cx];
      const x0 = 50 + cx * r0, y0 = 50 + cy * r0;
      const x1 = 50 + cx * r1, y1 = 50 + cy * r1;
      const mx = 50 + cx * ((r0 + r1) / 2), my = 50 + cy * ((r0 + r1) / 2);
      return `M${f(x0)} ${f(y0)} Q${f(mx + px * w)} ${f(my + py * w)} ${f(x1)} ${f(y1)} Q${f(mx - px * w)} ${f(my - py * w)} ${f(x0)} ${f(y0)}Z`;
    }).join("");
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <circle className="orn-draw" pathLength={1} cx="50" cy="50" r="46" />
      <circle cx="50" cy="50" r="42" strokeDasharray="1 3" />
      <path className="orn-draw" pathLength={1} d={petals(12, 14, 40, 7)} />
      <path className="orn-draw" pathLength={1} d={petals(8, 6, 22, 5, Math.PI / 8)} />
      <circle cx="50" cy="50" r="5" />
    </svg>
  );
}

/** A creeper border: a running stem with paired leaves and buds, as painted along haveli cornices. */
export function Creeper({ className = "", width = 480 }: P & { width?: number }) {
  const h = 28;
  const mid = h / 2;
  const step = 40;
  let stem = `M0 ${mid}`;
  let leaves = "";
  for (let x = 0; x < width; x += step) {
    stem += ` C${x + step * 0.3} ${mid - 8} ${x + step * 0.7} ${mid + 8} ${x + step} ${mid}`;
    const lx = x + step * 0.5;
    const up = (x / step) % 2 === 0 ? -1 : 1;
    leaves += `M${f(lx)} ${mid} q${f(4)} ${f(up * 9)} ${f(12)} ${f(up * 10)} q${f(-6)} ${f(-up * 2)} ${f(-12)} ${f(-up * 10)}Z`;
    leaves += `M${f(lx)} ${mid} q${f(-4)} ${f(-up * 7)} ${f(-10)} ${f(-up * 8)} q${f(5)} ${f(up * 2)} ${f(10)} ${f(up * 8)}Z`;
  }
  const buds = Array.from({ length: Math.floor(width / step) }, (_, i) => i * step + step).filter((x) => x < width);
  return (
    <svg className={className} viewBox={`0 0 ${width} ${h}`} preserveAspectRatio="xMidYMid meet" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path className="orn-draw" pathLength={1} d={stem} />
      <path d={leaves} />
      {buds.map((x) => (
        <circle key={x} cx={x} cy={mid} r="1.8" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

/** Peacock in profile with its train fanned behind, in the manner of fresco borders. */
export function Peacock({ className = "" }: P) {
  const base: [number, number] = [118, 132];
  const feathers = Array.from({ length: 11 }, (_, i) => {
    const a = Math.PI * (0.72 + (i / 10) * 0.62);
    const len = 70 + Math.sin((i / 10) * Math.PI) * 18;
    const x = base[0] + Math.cos(a) * len;
    const y = base[1] - Math.sin(a) * len;
    return { x, y, a };
  });
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
      {feathers.map(({ x, y, a }, i) => (
        <g key={i}>
          <path d={`M${base[0]} ${base[1]} L${f(x)} ${f(y)}`} strokeWidth="0.6" />
          <ellipse cx={f(x)} cy={f(y)} rx="6" ry="9" transform={`rotate(${f(90 - (a * 180) / Math.PI)} ${f(x)} ${f(y)})`} />
          <ellipse cx={f(x)} cy={f(y)} rx="2.4" ry="3.6" fill="currentColor" transform={`rotate(${f(90 - (a * 180) / Math.PI)} ${f(x)} ${f(y)})`} />
        </g>
      ))}
      {/* body, breast and neck */}
      <path className="orn-draw" pathLength={1} d="M150 150 C132 152 112 146 108 128 C104 110 120 100 132 104 C140 92 140 74 134 62 C130 54 134 46 142 46 C150 46 153 54 149 60 C144 70 148 90 156 104 C166 122 166 146 150 150Z" />
      <circle cx="143" cy="53" r="1.6" fill="currentColor" stroke="none" />
      <path d="M151 52 l8 2 -8 2" />
      {/* crest */}
      <path d="M140 46 l-4 -12 M143 45 l0 -13 M146 46 l4 -12" strokeWidth="0.7" />
      <circle cx="136" cy="33" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="143" cy="31" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="150" cy="33" r="1.6" fill="currentColor" stroke="none" />
      {/* wing scallops, legs and ground line */}
      <path d="M118 124 q8 -6 16 0 q8 -6 16 0 M120 134 q8 -6 16 0 q8 -6 16 0" strokeWidth="0.7" />
      <path d="M136 150 l-3 18 m3 -18 l0 0 M146 150 l3 18 M128 170 h12 M144 170 h12" />
      <path d="M40 176 H180" strokeDasharray="1 4" />
    </svg>
  );
}

/** Caparisoned elephant in profile, with a scalloped saddle-cloth and a howdah canopy. */
export function Elephant({ className = "" }: P) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* body, head and trunk */}
      <path className="orn-draw" pathLength={1} d="M46 150 L46 118 C40 96 52 74 80 70 L120 68 C134 60 156 62 164 80 C170 92 168 104 164 112 C162 124 166 140 174 146 C178 149 178 156 172 156 C162 156 154 146 152 132 L150 124 C148 132 146 140 146 150 L134 150 L132 128 L104 130 L102 150 L90 150 L88 128 C76 128 64 124 58 118 L58 150 Z" />
      {/* ear, eye, tusk, tail */}
      <path d="M140 82 C130 86 128 104 140 112 C150 108 152 92 146 82" strokeWidth="0.8" />
      <circle cx="156" cy="84" r="1.5" fill="currentColor" stroke="none" />
      <path d="M158 108 q10 4 16 -2" strokeWidth="0.8" />
      <path d="M46 112 q-10 10 -6 26" strokeWidth="0.8" />
      {/* saddle-cloth with scallops and dots */}
      <path d="M78 70 L78 108 Q84 116 90 108 Q96 116 102 108 Q108 116 114 108 Q120 116 126 108 L126 68" strokeWidth="0.8" />
      {[86, 98, 110, 120].map((x) => (
        <circle key={x} cx={x} cy={92} r="1.4" fill="currentColor" stroke="none" />
      ))}
      {/* howdah */}
      <path d="M84 68 L84 54 L120 54 L120 68 M80 54 H124 M84 54 C88 36 116 36 120 54 M102 42 V32" strokeWidth="0.8" />
      <circle cx="102" cy="30" r="2" />
      <path d="M30 158 H186" strokeDasharray="1 4" />
    </svg>
  );
}

/** A heritage steam train: engine, tender and an arched-window royal saloon. */
export function HeritageTrain({ className = "" }: P) {
  return (
    <svg className={className} viewBox="0 0 220 120" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* saloon carriage with arched windows */}
      <path className="orn-draw" pathLength={1} d="M10 84 V48 Q10 42 16 42 H96 Q102 42 102 48 V84 Z" />
      <path d="M6 42 Q56 30 106 42" />
      {[18, 38, 58, 78].map((x) => (
        <path key={x} d={`M${x} 70 V56 Q${x + 6} 48 ${x + 12} 56 V70`} strokeWidth="0.8" />
      ))}
      {/* tender and engine */}
      <path className="orn-draw" pathLength={1} d="M108 84 V54 H138 V84 M142 84 V58 H182 Q196 58 198 72 V84 Z M152 58 V40 H168 V58 M186 58 V44 H194 V58" />
      <path d="M188 44 q-2 -10 6 -14 q6 -2 4 -10" strokeWidth="0.7" strokeDasharray="1 3" />
      <path d="M198 84 l10 8" />
      {/* wheels and rail */}
      {[26, 52, 78, 116, 130, 156, 178].map((x) => (
        <circle key={x} cx={x} cy={90} r={x > 150 ? 9 : 6} />
      ))}
      <path d="M150 90 H186" strokeWidth="0.8" />
      <path d="M2 102 H218" />
      <path d="M6 106 H214" strokeDasharray="2 6" />
    </svg>
  );
}

/** A jharokha arch in outline (the same arch as the #arch clipPath), stretched to its box. */
export function ArchOutline({ className = "", double = true }: P & { double?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 1 1" preserveAspectRatio="none" fill="none" stroke="currentColor" aria-hidden="true">
      <path className="orn-draw" d={archPath} strokeWidth="1" vectorEffect="non-scaling-stroke" pathLength={1} />
      {double && <path d={archPath} strokeWidth="1" vectorEffect="non-scaling-stroke" transform="translate(0.03 0.02) scale(0.94 0.98)" strokeDasharray="2 5" />}
    </svg>
  );
}

/** Motif by name, for content-driven panels. */
export function Motif({ name, className = "" }: { name: "peacock" | "elephant" | "rosette" | "rail"; className?: string }) {
  if (name === "peacock") return <Peacock className={className} />;
  if (name === "elephant") return <Elephant className={className} />;
  if (name === "rail") return <HeritageTrain className={className} />;
  return <Rosette className={className} />;
}
