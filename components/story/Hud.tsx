"use client";

import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/layout/Wordmark";
import { chapterHeadingId, chapters, fmtMinutes } from "@/lib/day";
import { getLenis } from "@/lib/smooth";
import { onClock } from "@/lib/story/bus";
import { useStory, writePref, type MotionPref } from "@/lib/story/store";

const START = 330; // 05:30
const END = 1290; // 21:30

/**
 * The story HUD (§4): wordmark top-left, the brass sundial top-right (hour + place in both scripts;
 * it opens the chapter list and the Motion: full / calm toggle) and a brass progress hairline down
 * the left edge.
 */
export function Hud() {
  const chapter = useStory((s) => s.chapter);
  const mode = useStory((s) => s.mode);
  const pref = useStory((s) => s.pref);
  const [open, setOpen] = useState(false);
  const timeRef = useRef<HTMLSpanElement>(null);
  const gnomon = useRef<SVGGElement>(null);
  const dial = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const c = chapters[chapter];

  // Clock and gnomon: written straight to the DOM on every scroll frame
  useEffect(
    () =>
      onClock((m) => {
        if (timeRef.current) timeRef.current.textContent = fmtMinutes(m);
        const t = Math.min(1, Math.max(0, (m - START) / (END - START)));
        // the sun crosses the sky east → west; the shadow points away from it
        gnomon.current?.setAttribute("transform", `rotate(${(-80 + t * 160).toFixed(1)} 22 22)`);
        if (dial.current) dial.current.toggleAttribute("data-night", m >= 20 * 60 + 30);
      }),
    [],
  );

  // Progress hairline
  useEffect(() => {
    let raf = 0;
    const up = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.current?.style.setProperty("--p", String(max > 0 ? window.scrollY / max : 0));
    };
    const on = () => (raf ||= requestAnimationFrame(up));
    up();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Menu: Esc and outside click close it; focus moves in and back
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("a,button")?.focus());
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const click = (e: MouseEvent) => {
      if (!dial.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", click);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", click);
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setOpen(false);
    const l = getLenis();
    if (l) l.scrollTo(el, { offset: -96, duration: 1.2 });
    else el.scrollIntoView({ behavior: mode === "reduced" ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  const setPref = (p: MotionPref) => {
    writePref(p);
    useStory.getState().set({ pref: p });
  };
  const calm = mode === "reduced";

  return (
    <>
      <div ref={bar} className="hud-progress hidden md:block" aria-hidden="true">
        <span />
      </div>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
          <a href="#main" onClick={go(chapterHeadingId("threshold"))} className="pointer-events-auto rounded-[2px] bg-paper/90 px-3 py-2 text-fg shadow-[0_0_0_1px_rgb(176_141_87/.45)]" aria-label="Back to the start of the day">
            <Wordmark />
          </a>

          <div ref={dial} className="sundial pointer-events-auto relative">
            <button
              ref={btn}
              type="button"
              aria-expanded={open}
              aria-controls="sundial-menu"
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-3 rounded-[2px] bg-paper/90 py-1.5 pr-4 pl-1.5 text-fg shadow-[0_0_0_1px_rgb(176_141_87/.45)]"
            >
              <svg className="sundial-ring shrink-0" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="20" fill="none" stroke="#b08d57" strokeWidth="1.4" />
                <circle cx="22" cy="22" r="16.5" fill="none" stroke="#b08d57" strokeWidth="0.6" />
                {Array.from({ length: 12 }, (_, k) => (
                  <line key={k} x1="22" y1="3.5" x2="22" y2={k % 3 === 0 ? 7 : 5.5} stroke="#b08d57" strokeWidth="0.8" transform={`rotate(${k * 30} 22 22)`} />
                ))}
                <g ref={gnomon} transform="rotate(-80 22 22)">
                  <path d="M22 22 L20.6 8 L22 6.5 L23.4 8 Z" fill="currentColor" opacity=".38" />
                </g>
                <path d="M22 22 L22 13" stroke="#b08d57" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="22" cy="22" r="1.8" fill="#b08d57" />
              </svg>
              <span className="text-left leading-tight">
                <span ref={timeRef} className="numerals block text-[1.0625rem]" aria-hidden="true">
                  {c.time}
                </span>
                <span className="t-label block text-[0.625rem]! text-fg-muted">
                  {c.place} · <span lang="hi">{c.placeDeva}</span>
                </span>
              </span>
              <span className="sr-only">
                Chapter {c.n}, {c.title}, {c.time}. Open the chapter list
              </span>
            </button>

            {open && (
              <div ref={panel} id="sundial-menu" className="grain absolute top-[calc(100%+10px)] right-0 w-[min(92vw,360px)] border border-brass/60 p-5 text-fg shadow-[0_18px_50px_-20px_rgb(30_26_22/.5)]" data-lenis-prevent>
                <p className="t-label text-fg-muted">The day</p>
                <nav aria-label="Chapters">
                  <ol className="mt-3 max-h-[52svh] overflow-y-auto border-t border-brass/40">
                    {chapters.map((ch, i) => (
                      <li key={ch.id} className="border-b border-brass/40">
                        <a href={`#${chapterHeadingId(ch.id)}`} onClick={go(chapterHeadingId(ch.id))} aria-current={i === chapter ? "step" : undefined} className={`grid grid-cols-[2.25rem_3.25rem_1fr] items-baseline gap-2 py-2.5 ${i === chapter ? "text-accent" : ""}`}>
                          <span className="serif-italic numerals text-[0.9375rem]">{ch.n}</span>
                          <span className="numerals text-[0.9375rem]">{ch.time}</span>
                          <span className="text-[0.9375rem]">
                            {ch.title} <span lang="hi" aria-hidden="true" className="ml-1 text-fg-muted">{ch.placeDeva}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem]">
                  <Link href="/journeys" className="link py-1">All journeys</Link>
                  <Link href="/destinations" className="link py-1">Destinations</Link>
                  <Link href="/contact" className="link py-1">Contact</Link>
                </div>
                <fieldset className="mt-5 flex items-center gap-3 border-t border-brass/40 pt-4">
                  <legend className="t-label float-left mr-2 text-fg-muted">Motion</legend>
                  {(["full", "calm"] as const).map((p) => {
                    const on = p === "calm" ? calm : !calm;
                    return (
                      <label key={p} className={`cursor-pointer rounded-[2px] border px-3 py-1.5 text-[0.875rem] capitalize ${on ? "border-accent text-accent" : "border-brass/50"}`}>
                        <input type="radio" name="motion" className="sr-only" checked={on} onChange={() => setPref(p)} />
                        {p}
                      </label>
                    );
                  })}
                  {pref && (
                    <button type="button" className="link ml-auto py-1 text-[0.8125rem] text-fg-muted" onClick={() => setPref(null)}>
                      Use system setting
                    </button>
                  )}
                </fieldset>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
