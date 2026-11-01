"use client";

import { useRef } from "react";
import { Copy, Deva } from "@/components/ui/bits";
import { thar } from "@/content/home";
import { chapter, chapterHeadingId } from "@/lib/day";
import { bus } from "@/lib/story/bus";
import { useChapterMotion } from "@/lib/story/engine";
import { riseHeading, vhPx } from "@/lib/story/fx";
import { useStory } from "@/lib/story/store";
import { Chapter, ChapterHead } from "../Chapter";
import { FrameCanvas, type FrameApi } from "../FrameCanvas";

const C = chapter("thar");
const F = C.frames!;

/**
 * Ch04 · 16:30 · जैसलमेर, "Into the Thar" (§6.5). The thar sequence (a push into the camel-caravan
 * photo) fills the viewport. When the chapter enters, frames introFrom → from play as a 1.2s intro; then the pin (≈380vh) scrubs from → to,
 * 16:30 to night. Three plates sit in the sky, timed to the frames. With WebGL, scroll-reactive sand
 * blows across on top. Compact: a non-pinned scrub over 200vh. Reduced: the golden-hour poster.
 */
export function Thar() {
  const api = useRef<FrameApi>(null);

  useChapterMotion("thar", 40, (m) => {
    const { gsap, mode } = m;
    const el = document.getElementById("ch-thar")!;
    const stage = el.querySelector<HTMLElement>(".thar-stage")!;
    riseHeading(m, el.querySelector("[data-rise]"));
    bus.tharIntro = 1;
    if (mode === "reduced") return;

    const draw = (f: number) => {
      if (!useStory.getState().gl) api.current?.set(f, true);
    };
    let introDone = false;
    let p = 0;
    const scrubFrame = () => F.from + p * (F.to - F.from);
    const intro = () => {
      if (introDone) return;
      introDone = true;
      api.current?.frameSet()?.request();
      const o = { t: 0 };
      bus.tharIntro = 0;
      gsap.to(o, {
        t: 1,
        duration: F.introSeconds,
        ease: "power1.inOut",
        onUpdate: () => {
          bus.tharIntro = o.t;
          draw(o.t < 1 ? F.introFrom + o.t * (F.from - F.introFrom) : scrubFrame());
        },
        onComplete: () => {
          bus.tharIntro = 1;
          draw(scrubFrame());
        },
      });
    };
    draw(F.introFrom);
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top 65%", once: true, onEnter: intro } });

    const panels = gsap.utils.toArray<HTMLElement>(".thar-panel", el);
    const state = panels.map(() => false);
    const toggle = (i: number, on: boolean) => {
      if (state[i] === on) return;
      state[i] = on;
      const lines = panels[i].querySelectorAll("[data-line]");
      if (on) {
        gsap.set(panels[i], { autoAlpha: 1, y: 0 });
        gsap.fromTo(lines, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, overwrite: true });
      } else gsap.to(panels[i], { autoAlpha: 0, y: -24, duration: 0.5, ease: "power2.inOut", overwrite: true });
    };

    const onUpdate = (prog: number) => {
      p = prog;
      bus.progress.thar = prog;
      if (introDone && bus.tharIntro >= 1) draw(scrubFrame());
      if (mode === "desktop") C.panels!.forEach((pn, i) => toggle(i, prog >= pn.from && prog <= pn.to));
    };

    if (mode === "desktop") {
      gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${vhPx(C.pin!)()}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => onUpdate(s.progress),
          onToggle: (s) => stage.style.setProperty("will-change", s.isActive ? "transform" : "auto"),
        },
      });
    } else {
      // 100svh stage scrubbed from entering to leaving: 200vh of scroll, no pin
      gsap.timeline({ scrollTrigger: { trigger: el.querySelector(".thar-view"), start: "top bottom", end: "bottom top", scrub: 1, onUpdate: (s) => onUpdate(s.progress) } });
    }
    return () => {
      bus.tharIntro = 1;
      gsap.set(panels, { clearProps: "all" });
    };
  });

  return (
    <Chapter id="thar" pinned className="gl-chapter ch-dark-b" dark>
      <div className="thar-stage">
        <div className="thar-view">
        <div className="gl-fallback absolute inset-0">
          <FrameCanvas name={F.sequence} chapterIndex={4} from={F.introFrom} to={F.to} focusY={0.55} api={api} alt="A camel caravan crossing the Thar dunes near Jaisalmer at sunset" />
        </div>
        <div id="gl-thar" className="gl-view absolute inset-0" aria-hidden="true" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(to_top,rgb(30_20_14/.82),rgb(30_20_14/.45)_45%,transparent)]" />
        <div className="wrap absolute inset-x-0 bottom-0 pb-[clamp(36px,7vh,80px)] text-ivory">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ivory/90 [&_.text-accent]:text-dune [&_.text-fg-muted]:text-ivory/85">
            <ChapterHead id="thar" />
          </div>
          <h2 id={chapterHeadingId("thar")} className="t-h1 mt-5 max-w-[14ch]" data-rise>
            {thar.title}
          </h2>
          <p className="measure mt-4 max-w-[46ch] text-ivory/90">{thar.intro}</p>
        </div>
        </div>
      <div className="thar-panels">
        {thar.panels.map((pn) => (
          <article key={pn.id} className="thar-panel plate-rule bg-ivory text-ink">
            <p data-line className="t-label text-[#5c5248]">
              <span className="numerals text-[0.8125rem] tracking-normal normal-case">{pn.time}</span> · <Deva className="text-[0.9375rem]">{pn.deva}</Deva>
            </p>
            <h3 data-line className="t-h3 mt-3">
              {pn.title}
            </h3>
            <p data-line className="t-small mt-3 text-[#5c5248]">
              <Copy text={pn.text} />
            </p>
          </article>
        ))}
      </div>
      </div>
    </Chapter>
  );
}
