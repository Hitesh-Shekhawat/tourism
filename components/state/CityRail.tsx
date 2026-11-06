"use client";

import { useEffect, useState } from "react";

/**
 * Where you are among the cities: a column of ticks at the right edge on wide screens, a small pill
 * with previous / next at the bottom on phones. It appears only while a city section is on screen
 * (the section crossing the middle of the viewport is the current one).
 */
export function CityRail({ cities }: { cities: { id: string; name: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const on = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.city!;
          if (e.isIntersecting) on.add(id);
          else on.delete(id);
        }
        setActive(cities.find((c) => on.has(c.id))?.id ?? null);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll("[data-city]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [cities]);

  const i = cities.findIndex((c) => c.id === active);
  const prev = i > 0 ? cities[i - 1] : null;
  const next = i >= 0 && i < cities.length - 1 ? cities[i + 1] : null;

  return (
    <>
      <nav aria-label="Cities" className="city-rail" data-on={active ? "" : undefined}>
        <ol>
          {cities.map((c, k) => (
            <li key={c.id}>
              <a href={`#city-${c.id}`} aria-current={c.id === active ? "location" : undefined}>
                <span className="city-rail-name">{c.name}</span>
                <span className="city-rail-tick" aria-hidden="true" />
                <span className="sr-only">{String(k + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="city-pill" data-on={active ? "" : undefined} aria-hidden="true">
        <a href={prev ? `#city-${prev.id}` : "#state-top"} tabIndex={-1} className="city-pill-btn">
          <svg viewBox="0 0 16 16">
            <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </a>
        <span className="city-pill-label">
          <span className="serif-italic tabular text-dune">{String(Math.max(0, i) + 1).padStart(2, "0")}</span>
          <span className="font-semibold">{cities[Math.max(0, i)]?.name}</span>
          <span className="text-ivory/60 tabular">/ {String(cities.length).padStart(2, "0")}</span>
        </span>
        <a href={next ? `#city-${next.id}` : "#state-end"} tabIndex={-1} className="city-pill-btn">
          <svg viewBox="0 0 16 16">
            <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </a>
      </div>
    </>
  );
}
