/**
 * Railway wheels on one axle line. Each wheel is drawn around its own origin; the inner disc rotates by
 * the shared CSS variable --wheel (set on the train once per scroll frame), so every wheel on the train
 * turns in sync and in proportion to the distance travelled. Tyre, hub and axle box do not rotate.
 */
export function TrainWheels({ xs, cy, r = 19 }: { xs: number[]; cy: number; r?: number }) {
  const spokes = Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3);
  return (
    <g className="t2d-wheels">
      {xs.map((x) => (
        <g key={x} transform={`translate(${x} ${cy})`}>
          <circle r={r} fill="#2a2523" />
          <circle r={r - 1.6} fill="none" stroke="#9b9189" strokeWidth={1.4} />
          <g className="t2d-wheel">
            <circle r={r - 4.5} fill="#463f3b" />
            {spokes.map((a) => (
              <line key={a} x1={0} y1={0} x2={(r - 5) * Math.cos(a)} y2={(r - 5) * Math.sin(a)} stroke="#6f6660" strokeWidth={2.2} strokeLinecap="round" />
            ))}
            <circle r={r - 11} fill="#3a3431" />
            {/* balance weight: makes the rotation readable */}
            <path d={`M${-(r - 6)} 3 A${r - 6} ${r - 6} 0 0 0 ${r - 6} 3 L${r - 9} 3 A${r - 9} ${r - 9} 0 0 1 ${-(r - 9)} 3 Z`} fill="#2f2a27" />
          </g>
          <circle r={5} fill="#8b8178" />
          <circle r={2} fill="#3a3431" />
        </g>
      ))}
    </g>
  );
}

/** A bogie side frame with coil springs and axle boxes over the given wheel centres. */
export function BogieFrame({ xs, cy }: { xs: number[]; cy: number }) {
  const left = xs[0] - 30;
  const right = xs[xs.length - 1] + 30;
  return (
    <g className="t2d-bogie">
      <rect x={left} y={cy - 24} width={right - left} height={11} rx={4} fill="#3b3532" />
      <rect x={left + 4} y={cy - 22} width={right - left - 8} height={2} fill="#5a524d" />
      {xs.map((x) => (
        <g key={x}>
          {/* coil spring between frame and axle box */}
          <path d={`M${x - 6} ${cy - 13} l12 2.2 -12 2.2 12 2.2 -12 2.2`} fill="none" stroke="#7a706a" strokeWidth={1.6} />
          <rect x={x - 7} y={cy - 4} width={14} height={8} rx={2} fill="#4c4541" />
        </g>
      ))}
      {xs.slice(0, -1).map((x, i) => (
        // damper between axles
        <rect key={x} x={(x + xs[i + 1]) / 2 - 3} y={cy - 14} width={6} height={12} rx={2} fill="#2c2725" />
      ))}
    </g>
  );
}
