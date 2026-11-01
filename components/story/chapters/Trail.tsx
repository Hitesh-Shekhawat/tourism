"use client";

import { Photo } from "@/components/ui/Photo";
import { Deva } from "@/components/ui/bits";
import { destinations } from "@/content/destinations";
import { trail } from "@/content/home";
import { archPath } from "@/lib/arch";
import { chapter, chapterHeadingId } from "@/lib/day";
import { legPath, MAP_H, MAP_W, outlinePath, project } from "@/lib/rajasthan";
import { bus } from "@/lib/story/bus";
import { useChapterMotion } from "@/lib/story/engine";
import { riseHeading, vhPx } from "@/lib/story/fx";
import { trailState } from "@/lib/story/trail";
import { Chapter, ChapterHead } from "../Chapter";
import s from "./Trail.module.css";

const stops = trail.stops;
const PIN = chapter("trail").pin!;
const legs = stops.slice(1).map((st, i) => legPath(stops[i].coords, st.coords, i === 0 ? 0.9 : i % 2 ? -0.12 : 0.12));
const growT = (k: number) => `translate(0.5 1) scale(${k}) translate(-0.5 -1)`;

/** Label offsets so Jaipur and Amber (11 km apart) don't collide */
const labelAt: Record<string, [number, number, "start" | "middle" | "end"]> = {
  jaipur: [14, 22, "start"],
  amber: [12, -12, "start"],
  udaipur: [14, 6, "start"],
  jodhpur: [14, 6, "start"],
  jaisalmer: [0, -18, "middle"],
};

/**
 * Ch03 · 11:00 · स्वर्ण पथ, "The Golden Trail" (§6.4).
 * WebGL (capable desktops): a paper-relief map of Rajasthan with the route drawing itself, the
 * camera flying stop to stop and an arch-framed card per stop (pinned ≈420vh).
 * Without WebGL (desktop): the 2D SVG map with the route drawn by stroke-dashoffset, pinned.
 * Compact: the SVG map drawn as it scrolls past, then five stacked chapters. Reduced: static map + chapters.
 */
export function Trail() {
  useChapterMotion("trail", 30, (m) => {
    const { gsap, ScrollTrigger, mode, gl } = m;
    const el = document.getElementById("ch-trail")!;
    riseHeading(m, el.querySelector("[data-rise]"));
    if (mode === "reduced") return;

    if (gl) {
      const stage = el.querySelector<HTMLElement>(".trail-gl-stage")!;
      const cards = gsap.utils.toArray<HTMLElement>(".trail-card", el);
      let shown = 0;
      const show = (k: number) => {
        if (k === shown) return;
        const prev = cards[shown];
        if (prev)
          gsap.to(prev, {
            autoAlpha: 0,
            x: -24,
            duration: 0.35,
            ease: "power2.inOut",
            overwrite: true,
          });
        shown = k;
        const next = cards[k];
        if (!next) return;
        gsap.fromTo(
          next,
          { autoAlpha: 0, x: 60 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            overwrite: true,
          },
        );
        const plate = next.querySelector<HTMLElement>("[data-plate]");
        if (plate)
          gsap.fromTo(
            plate,
            { clipPath: "inset(100% 0 0 0)" },
            {
              clipPath: "inset(0% 0 0 0)",
              duration: 1.1,
              ease: "power3.out",
              delay: 0.1,
            },
          );
      };
      gsap.set(cards, { autoAlpha: 0 });
      gsap.set(cards[0], { autoAlpha: 1 });
      gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${vhPx(PIN)()}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            bus.progress.trail = self.progress;
            const st = trailState(self.progress);
            bus.trailStop = st.stop;
            show(Math.max(0, st.stop));
          },
        },
      });
      return;
    }

    const legEls = gsap.utils.toArray<SVGPathElement>(`.${s.leg}`, el);
    const dots = gsap.utils.toArray<SVGCircleElement>(`.${s.stop}`, el);
    legEls.forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });

    if (mode === "compact") {
      // Route draws as the map scrolls through the viewport (no pin)
      const map = el.querySelector(`.${s.mapCol}`);
      gsap.set(dots.slice(1), {
        scale: 0,
        transformOrigin: "50% 50%",
        transformBox: "fill-box",
      });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: map,
          start: "top 75%",
          end: "bottom 35%",
          scrub: 1,
        },
      });
      legEls.forEach((p, i) => {
        tl.to(p, { strokeDashoffset: 0, duration: 1 }, i);
        tl.to(dots[i + 1], { scale: 1, duration: 0.2 }, i + 0.85);
      });
      return;
    }

    // Desktop without WebGL: the 2D pinned choreography
    el.classList.add(s.pinned);
    const stage = el.querySelector<HTMLElement>(`.${s.stage}`)!;
    const figs = gsap.utils.toArray<HTMLElement>(`.${s.figure}`, el);
    const cards = gsap.utils.toArray<HTMLElement>(`.${s.card}`, el);
    const clips = gsap.utils.toArray<SVGPathElement>("[data-trail-clip]", el);
    gsap.set(dots, {
      scale: 0,
      transformOrigin: "50% 50%",
      transformBox: "fill-box",
    });
    gsap.set(dots[0], { scale: 1 });
    clips.forEach((c, i) => c.setAttribute("transform", growT(i === 0 ? 0.62 : 0.001)));
    gsap.set(figs.slice(1), { opacity: 0 });
    gsap.set(cards.slice(1), { autoAlpha: 0, y: 24 });

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    const grow = (i: number, from: number, at: number, dur: number) => {
      const o = { k: from };
      tl.to(
        o,
        {
          k: 1.75,
          duration: dur,
          ease: "power2.inOut",
          onUpdate: () => clips[i].setAttribute("transform", growT(o.k)),
        },
        at,
      );
    };
    grow(0, 0.62, 0.15, 0.6);
    for (let i = 1; i < stops.length; i++) {
      const T = i;
      tl.to(legEls[i - 1], { strokeDashoffset: 0, duration: 0.5 }, T - 0.55);
      tl.to(dots[i], { scale: 1, duration: 0.12, ease: "power2.out" }, T - 0.06);
      tl.to(cards[i - 1], { autoAlpha: 0, y: -16, duration: 0.18 }, T - 0.2);
      tl.set(figs[i], { opacity: 1 }, T - 0.05);
      tl.add(() => clips[i].setAttribute("transform", growT(0.001)), T - 0.06);
      const o = { k: 0.001 };
      tl.to(
        o,
        {
          k: 0.62,
          duration: 0.25,
          ease: "power2.out",
          onUpdate: () => clips[i].setAttribute("transform", growT(o.k)),
        },
        T - 0.05,
      );
      grow(i, 0.62, T + 0.22, 0.5);
      tl.to(cards[i], { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, T);
    }
    tl.to({}, { duration: 0.35 });
    ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: () => `+=${vhPx(PIN)()}`,
      pin: true,
      anticipatePin: 1,
      scrub: 1,
      animation: tl,
      invalidateOnRefresh: true,
      onUpdate: (self) => (bus.progress.trail = self.progress),
    });
    return () => {
      el.classList.remove(s.pinned);
      clips.forEach((c) => c.setAttribute("transform", growT(1)));
    };
  });

  const others = destinations.filter((d) => !stops.some((st) => st.id === d.slug));

  return (
    <Chapter id="trail" pinned className="grain gl-chapter">
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <defs>
          {stops.map((st, i) => (
            <clipPath key={st.id} id={`trail-arch-${i}`} clipPathUnits="objectBoundingBox">
              <path data-trail-clip d={archPath} transform={growT(1)} />
            </clipPath>
          ))}
        </defs>
      </svg>

      <div className="wrap pt-[var(--section-y)] pb-16 lg:pb-20">
        <ChapterHead id="trail" />
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <h2 id={chapterHeadingId("trail")} className="t-h1 max-w-[14ch] lg:col-span-6" data-rise>
            {trail.title}
          </h2>
          <p className="measure text-fg-muted lg:col-span-5 lg:col-start-8 lg:self-end">{trail.intro}</p>
        </div>
      </div>

      {/* WebGL path: the relief map renders behind this stage; one card per stop on the right */}
      <div className="trail-gl" aria-hidden="true">
        <div className="trail-gl-stage">
          <div id="gl-trail" className="gl-view absolute inset-0" />
          <div className="trail-cards">
            {stops.map((st, i) => (
              <div key={st.id} className="trail-card">
                <div className="plate-rule bg-paper/95 grid grid-cols-[7.5rem_1fr] gap-6">
                  <div data-plate className="relative aspect-[4/5]" style={{ clipPath: "url(#arch)" }}>
                    <Photo k={st.image} fill sizes="120px" compact decorative />
                  </div>
                  <div>
                    <p className={`serif-italic numerals text-[1.5rem] leading-none ${st.accent === "indigo" ? "text-indigo" : "text-accent"}`}>{String(i + 1).padStart(2, "0")}</p>
                    <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
                      <span className="t-h3">{st.name}</span>
                      <Deva className="text-xl text-accent">{st.devanagari}</Deva>
                    </p>
                    <p className="t-small mt-3 text-fg-muted">
                      {st.lines[0]} {st.lines[1]}
                    </p>
                    <p className="t-label mt-4 text-fg-muted">
                      Typically here: <span className="numerals text-fg">{st.days}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2D path (and the accessible content for every mode) */}
      <div className={`trail-2d ${s.stage} pb-[var(--section-y)] lg:pb-0`}>
        <div className={s.mapCol}>
          <svg viewBox={`-30 -30 ${MAP_W + 60} ${MAP_H + 60}`} className="h-auto w-full" role="img" aria-labelledby="trail-map-title">
            <title id="trail-map-title">Map of Rajasthan showing the route Jaipur, Amber, Udaipur, Jodhpur, Jaisalmer</title>
            <path d={outlinePath} fill="var(--color-sandstone)" stroke="var(--color-brass)" strokeWidth="1.6" strokeLinejoin="round" />
            <path d={outlinePath} fill="none" stroke="var(--color-brass)" strokeWidth="0.8" strokeOpacity=".5" transform="translate(5 6)" />
            <text x={MAP_W * 0.36} y={MAP_H * 0.42} lang="hi" aria-hidden="true" className="font-deva" fontSize="44" fill="var(--color-dune)">
              राजस्थान
            </text>
            {others.map((d) => {
              const [x, y] = project(d.coords);
              return (
                <g key={d.slug} aria-hidden="true">
                  <circle cx={x} cy={y} r="4" fill="#5c5248" opacity=".55" />
                  <text x={x + 10} y={y + 6} fontSize="22" fill="#5c5248" className="font-sans">
                    {d.name}
                  </text>
                </g>
              );
            })}
            {legs.map((d, i) => (
              <path key={i} d={d} className={s.leg} />
            ))}
            {stops.map((st) => {
              const [x, y] = project(st.coords);
              const [dx, dy, anchor] = labelAt[st.id];
              return (
                <g key={st.id}>
                  <circle cx={x} cy={y} r="7" className={s.stop} />
                  <text x={x + dx} y={y + dy} textAnchor={anchor} fontSize="30" fill="#1e1a16" className="font-display" fontWeight="600">
                    {st.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <ol className={s.chapters}>
          {stops.map((st, i) => (
            <li key={st.id} className={s.chapter}>
              <figure className={s.figure} style={{ ["--clip" as string]: `url(#trail-arch-${i})` }}>
                <Photo k={st.image} fill sizes="(min-width: 1024px) 58vw, (min-width: 640px) 45vw, 90vw" />
              </figure>
              <div className={s.card}>
                <p className={`serif-italic numerals text-[1.75rem] leading-none ${st.accent === "indigo" ? "text-indigo" : "text-accent"}`} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="t-h1">{st.name}</span>
                  <Deva className={`text-2xl ${st.accent === "indigo" ? "text-indigo" : "text-accent"}`}>{st.devanagari}</Deva>
                </h3>
                <p className={`mt-5 h-px w-16 ${st.accent === "indigo" ? "bg-indigo" : "bg-brass/70"}`} aria-hidden="true" />
                <p className="measure mt-5 max-w-[38ch] text-fg-muted">
                  {st.lines[0]} {st.lines[1]}
                </p>
                <p className="t-label mt-6 text-fg-muted">
                  <span className="sr-only">
                    Stop {i + 1} of {stops.length}.{" "}
                  </span>
                  Typically here: <span className="numerals text-fg">{st.days}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}
