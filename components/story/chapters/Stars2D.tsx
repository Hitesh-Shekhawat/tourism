"use client";

import { useEffect, useRef } from "react";

/** The non-WebGL star field: stars drawn once to a canvas that turns slowly (CSS) about a pole top-left. */
export function Stars2D() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const S = 1400;
    c.width = c.height = S;
    const g = c.getContext("2d")!;
    let a = 7;
    const r = () => ((a = (a * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 900; i++) {
      const m = Math.pow(r(), 3); // few bright, many faint
      g.globalAlpha = 0.25 + m * 0.75;
      g.fillStyle = "#fff8e8";
      g.beginPath();
      g.arc(r() * S, r() * S, 0.5 + m * 1.6, 0, Math.PI * 2);
      g.fill();
    }
  }, []);
  // only the sky: fade out towards the dunes
  return (
    <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_35%,transparent_62%)]">
      <canvas ref={ref} className="stars-2d" />
    </div>
  );
}
