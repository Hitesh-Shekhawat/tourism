import { legPath, MAP_H, MAP_W, outlinePath, PLACES, project } from "@/lib/rajasthan";

/** Small static map of Rajasthan with an optional route and highlighted places. */
export function RouteMap({ route = [], highlight, title, className = "" }: { route?: string[]; highlight?: string; title: string; className?: string }) {
  const pts = route.filter((p) => PLACES[p]);
  const marks = highlight && !pts.includes(highlight) ? [...pts, highlight] : pts;
  return (
    <svg viewBox={`-40 -40 ${MAP_W + 80} ${MAP_H + 80}`} className={`h-auto w-full ${className}`} role="img" aria-label={title}>
      <path d={outlinePath} fill="var(--color-sandstone)" stroke="var(--color-brass)" strokeWidth="1.6" strokeLinejoin="round" />
      {pts.slice(1).map((p, i) => (
        <path key={p + i} d={legPath(PLACES[pts[i]], PLACES[p], i % 2 ? -0.14 : 0.14)} fill="none" stroke="var(--color-terracotta)" strokeWidth="2.6" strokeLinecap="round" />
      ))}
      {marks.map((p, i) => {
        const [x, y] = project(PLACES[p]);
        const hi = p === highlight || pts.length > 0;
        return (
          <g key={p + i}>
            <circle cx={x} cy={y} r={p === highlight ? 10 : 7} fill={hi ? "var(--color-terracotta)" : "var(--color-ink-muted)"} stroke="var(--color-ivory)" strokeWidth="3" />
            <text x={x + 14} y={y + 7} fontSize="24" fontWeight="600" fill="var(--color-ink)" className="font-display">
              {p}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
