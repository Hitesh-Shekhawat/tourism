import { useId } from "react";

/**
 * The railway line in side view: polished rail head, sleepers and ballast. Drawn in pixel units with
 * repeating patterns (no viewBox), so nothing stretches at any width. Its top edge (y = 0) is the rail
 * top; the scene places it on the same --rail line as the train's wheels, so they always meet.
 */
export function TrainTrack() {
  const p = `k${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg className="t2d-track" aria-hidden="true" width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <pattern id={`${p}-sleepers`} width={30} height={10} patternUnits="userSpaceOnUse">
          <rect width={20} height={9} rx={1} fill="#5b4636" />
          <rect width={20} height={2} rx={1} fill="#7a6250" />
        </pattern>
        <linearGradient id={`${p}-ballast`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a88564" />
          <stop offset="1" stopColor="#7a5d46" />
        </linearGradient>
        <pattern id={`${p}-stones`} width={14} height={9} patternUnits="userSpaceOnUse">
          <circle cx={3} cy={3} r={1.4} fill="#c2a283" />
          <circle cx={10} cy={6} r={1.2} fill="#6e523e" />
          <circle cx={7} cy={1.5} r={0.9} fill="#8d7059" />
        </pattern>
      </defs>
      <rect y={9} width="100%" height="100%" fill={`url(#${p}-ballast)`} />
      <rect y={9} width="100%" height="100%" fill={`url(#${p}-stones)`} opacity={0.7} />
      <rect y={7} width="100%" height={10} fill={`url(#${p}-sleepers)`} />
      <rect y={0} width="100%" height={4} fill="#b9b0a7" />
      <rect y={4} width="100%" height={4} fill="#625a54" />
      <rect y={0} width="100%" height={1} fill="#f0e9e0" opacity={0.8} />
    </svg>
  );
}
