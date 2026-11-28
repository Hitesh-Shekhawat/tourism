"use client";

import { Link } from "next-view-transitions";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { AtlasAnchor } from "@/components/explorer/AtlasAnchor";
import { useSectionMotion } from "@/components/homepage/HomeMotion";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow, Check } from "@/components/ui/bits";
import { placeLinks, trending, type Place } from "@/content/explorer";
import { royalCities } from "@/content/homepage";
import { getLenis } from "@/lib/smooth";
import { useStory } from "@/lib/story/store";
import { TRAIN_VIEW } from "./train/Train";
import { TrainScene } from "./train/TrainScene";

const stops = trending;
const STOP_COUNT = stops.length;
const STAGE_COUNT = STOP_COUNT + 2;
/** The same identity lines as the destination cards ("The Sacred City", …). */
const epithet = (p: Place) => royalCities.cities.find((c) => c.id === p.id)?.epithet ?? p.epithet;

/** One coach per destination, in journey order, generated from the destination data (never a fixed count). */
const coaches = stops.map((place, i) => ({ id: place.id, name: place.name, epithet: epithet(place), number: i + 1 }));

/**
 * The point of the train (drawing units) held at the centre of the scene in each scroll stage: the
 * engine rolling in from the right, the engine, then each destination's coach. Stage s is centred at
 * progress (s + 0.5) / STAGE_COUNT, which is exactly when that destination is the active stop.
 */
function focusAt(p: number, visibleUnits: number) {
  const keys = [
    TRAIN_VIEW.locoCenter - visibleUnits * 0.25, // stage 0: the engine enters, on the right
    TRAIN_VIEW.locoCenter + 140, // stage 1: the engine and its coupling
    ...coaches.map((_, i) => TRAIN_VIEW.coachCenter(i)), // stages 2…: coach i for stop i
  ];
  const at = (s: number) => (s + 0.5) / STAGE_COUNT;
  if (p <= at(0)) return keys[0];
  const last = keys.length - 1;
  if (p >= at(last)) return keys[last];
  const s = Math.floor(p * STAGE_COUNT - 0.5);
  const t = (p - at(s)) / (at(s + 1) - at(s));
  const eased = t * t * (3 - 2 * t); // settles on each coach, glides between them
  return keys[s] + (keys[s + 1] - keys[s]) * eased;
}

function PlaceLink({ place, children, className }: { place: Place; children: ReactNode; className: string }) {
  const { itinerary, destination } = placeLinks(place);
  const href = itinerary ?? destination;
  return href ? (
    <Link href={href} className={className}>{children}</Link>
  ) : (
    <AtlasAnchor state={place.state} place={place.id} className={className}>{children}</AtlasAnchor>
  );
}

function highlights(place: Place) {
  const values = place.attractions.slice(0, 3).map((sight) => sight.name);
  if (values.length < 3) values.push(place.epithet);
  return values;
}

function MobileStop({ place, index }: { place: Place; index: number }) {
  return (
    <article className="train-mobile-card">
      <div className="train-mobile-photo">
        <Photo k={place.image} fill sizes="(min-width: 640px) 85vw, 100vw" decorative />
      </div>
      <div className="train-mobile-copy">
        <p className="t-label train-info-label">Journey {String(index + 1).padStart(2, "0")} <span aria-hidden="true">/</span> Destination {String(index + 1).padStart(2, "0")}</p>
        <h3 className="train-info-title font-display">{place.name}</h3>
        <p className="train-info-epithet">{place.epithet}</p>
        <p className="train-info-summary">{place.summary}</p>
        <ul className="train-info-highlights" aria-label={`Highlights in ${place.name}`}>
          {highlights(place).map((sight, index) => (
            <li key={index}><Check /> {sight}</li>
          ))}
        </ul>
        <PlaceLink place={place} className="train-explore">
          Explore {place.name} <Arrow />
        </PlaceLink>
      </div>
    </article>
  );
}

/** The current stop over the scene (≥ 768px): name, epithet, summary and a link to the place. */
function StopPanel({ active }: { active: number }) {
  const place = active >= 0 ? stops[active] : null;
  return (
    <div className="t2d-panel" aria-live="polite">
      {place ? (
        <div key={place.id} className="t2d-panel-in">
          <p className="t-label t2d-panel-label">
            Stop {String(active + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {String(STOP_COUNT).padStart(2, "0")} · {epithet(place)}
          </p>
          <p className="t2d-panel-name font-display">{place.name}</p>
          <p className="t2d-panel-text">{place.summary}</p>
          <PlaceLink place={place} className="t2d-panel-link">
            Explore {place.name} <Arrow />
          </PlaceLink>
        </div>
      ) : (
        <div key="start" className="t2d-panel-in">
          <p className="t-label t2d-panel-label">All aboard</p>
          <p className="t2d-panel-name font-display">{stops[0].name} to {stops[STOP_COUNT - 1].name}</p>
          <p className="t2d-panel-text">Scroll to ride through {STOP_COUNT} places, one stop at a time.</p>
        </div>
      )}
    </div>
  );
}

/**
 * A pinned ride on larger screens: scroll drives one 2D vector train (locomotive + coach, a single
 * element) across the scene, its wheels turning with the distance travelled, while the background
 * shifts slightly and the station board and stop panel follow the stops. Phones get a short unpinned
 * ride plus the natural list of stops; reduced motion shows the train standing still.
 */
export function TrendingDestinations({ n }: { n: string }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef({ value: 0 });
  const trigger = useRef<ScrollTrigger | null>(null);
  const mobileStops = useRef<(HTMLLIElement | null)[]>([]);
  const trainEl = useRef<HTMLDivElement>(null);
  const farEl = useRef<HTMLDivElement>(null);
  const midEl = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const mode = useStory((state) => state.mode);

  /**
   * Places the whole train for ride progress p (0–1): transform-only writes, no React render. The
   * wheels turn by distance ÷ radius, so they roll rather than slide; the parallax layers drift the
   * other way, a little, as if the eye follows the train.
   */
  const paint = (p: number) => {
    const train = trainEl.current;
    const stage = train?.parentElement;
    if (!train || !stage) return;
    const stageW = stage.clientWidth;
    const scale = train.offsetHeight / TRAIN_VIEW.height; // px per drawing unit
    if (!scale) return;
    const visible = stageW / scale;
    const focus = focusAt(p, visible);
    const left = stageW / 2 - focus * scale;
    // the wheels roll: angle = distance travelled ÷ radius (counter-clockwise, the train runs left)
    const travelled = focus - focusAt(0, visible);
    train.style.left = "0px";
    train.style.transform = `translate3d(${left.toFixed(1)}px, 0, 0)`;
    train.style.setProperty("--wheel", `${(-(travelled / TRAIN_VIEW.wheelRadius) * (180 / Math.PI)).toFixed(1)}deg`);
    if (farEl.current) farEl.current.style.transform = `translate3d(${(p * 2).toFixed(2)}%, 0, 0)`;
    if (midEl.current) midEl.current.style.transform = `translate3d(${(p * 5).toFixed(2)}%, 0, 0)`;
  };
  const unpaint = () => {
    for (const el of [trainEl.current, farEl.current, midEl.current]) el?.style.removeProperty("transform");
    trainEl.current?.style.removeProperty("left");
    trainEl.current?.style.removeProperty("--wheel");
  };

  // Focus the active destination's coach: a class toggle once per stop change (the SVG never re-renders)
  useEffect(() => {
    const train = trainEl.current;
    if (!train) return;
    train.classList.toggle("has-active", active >= 0);
    train.querySelectorAll<SVGGElement>(".t2d-coach").forEach((coach) => coach.classList.toggle("is-active", Number(coach.dataset.i) === active));
  }, [active]);

  const setStage = (value: number) => {
    progress.current.value = value;
    const next = value < 1 / STAGE_COUNT
      ? -1
      : Math.min(STOP_COUNT - 1, Math.floor(value * STAGE_COUNT) - 2);
    setActive((current) => current === next ? current : next);
  };

  useSectionMotion(root, ({ gsap, ScrollTrigger }, section) => {
    const media = gsap.matchMedia();
    media.add("(min-width: 768px)", () => {
      const tween = gsap.to(progress.current, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * (window.innerWidth < 1024 ? 4.1 : 4.8))}`,
          pin: section,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setStage(self.progress);
            paint(self.progress);
          },
          onRefresh: (self) => {
            setStage(self.progress);
            paint(self.progress);
          },
          onLeaveBack: () => {
            setStage(0);
            paint(0);
          },
        },
      });
      trigger.current = tween.scrollTrigger ?? null;
      paint(tween.scrollTrigger?.progress ?? 0);
      return () => {
        trigger.current = null;
        progress.current.value = 0;
        setActive(-1);
        unpaint();
      };
    });
    // Phones: no pin; the train rolls through as its frame crosses the viewport
    media.add("(max-width: 767px)", () => {
      const frame = trainEl.current?.parentElement;
      if (!frame) return;
      const mobileProgress = { value: 0 };
      const ride = gsap.to(mobileProgress, {
        value: 1,
        ease: "none",
        onUpdate: () => {
          setStage(mobileProgress.value);
          paint(mobileProgress.value);
        },
        scrollTrigger: {
          trigger: frame,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
          onRefresh: () => {
            setStage(mobileProgress.value);
            paint(mobileProgress.value);
          },
          onLeaveBack: () => {
            mobileProgress.value = 0;
            setStage(0);
            paint(0);
          },
        },
      });
      return () => {
        ride.scrollTrigger?.kill();
        ride.kill();
        mobileProgress.value = 0;
        setStage(0);
        unpaint();
      };
    });
    return () => media.revert();
  });

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const sync = () => {
      observer?.disconnect();
      observer = null;
      if (window.matchMedia("(min-width: 768px)").matches && mode !== "reduced") return;
      progress.current.value = 1;
      const nodes = mobileStops.current.filter((node): node is HTMLLIElement => !!node);
      if (!nodes.length) return;
      observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.stopIndex);
        if (Number.isInteger(index)) setActive(index);
      }, { threshold: [0.35, 0.6, 0.8], rootMargin: "-15% 0px -25% 0px" });
      nodes.forEach((node) => observer?.observe(node));
    };
    sync();
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [mode]);

  const goToStage = (index: number) => {
    const activeTrigger = trigger.current;
    if (activeTrigger && index >= 0) {
      const value = (index + 2.5) / STAGE_COUNT; // the middle of the stop: its coach is centred
      const y = activeTrigger.start + value * (activeTrigger.end - activeTrigger.start);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { duration: 0.9 });
      else window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }
    if (index < 0 && activeTrigger) {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(activeTrigger.start, { duration: 0.9 });
      else window.scrollTo({ top: activeTrigger.start, behavior: "smooth" });
      return;
    }
    if (index >= 0) mobileStops.current[index]?.scrollIntoView({ behavior: mode === "reduced" ? "auto" : "smooth", block: "center" });
  };

  return (
    <section ref={root} id="trending" aria-label="Seven places to begin" className="sec train-section">
      <div className="train-journey">
        <div className="wrap train-heading">
          <SectionHeading
            n={n}
            label="The Rajasthan railway"
            id="trending-title"
            title="Seven places to begin."
            note="A royal passage through the cities, lakes and desert landscapes of Rajasthan."
            dark
          />
        </div>

        <div className="train-main">
          <div className="train-scene-frame">
            <TrainScene stops={stops} coaches={coaches} active={active} trainRef={trainEl} farRef={farEl} midRef={midEl}>
              <StopPanel active={active} />
            </TrainScene>
            <p className="train-scene-kicker" aria-hidden="true">Engine <span>←</span> {stops.map((place) => place.name).join(" · ")}</p>
          </div>

        </div>

        <nav className="train-progress" aria-label="Train journey destinations">
          <span className="train-progress-caption t-label">Journey stops</span>
          {stops.map((place, index) => (
            <button
              key={place.id}
              type="button"
              className={`train-progress-stop ${active === index ? "is-active" : ""}`}
              aria-label={`Go to destination ${String(index + 1).padStart(2, "0")}: ${place.name}`}
              aria-pressed={active === index}
              onClick={() => goToStage(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="train-progress-name">{place.name}</span>
            </button>
          ))}
          <div className="train-progress-line" aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(0, (active + 1) / STOP_COUNT)})` }} /></div>
        </nav>
      </div>

      <ol className="train-mobile-stops" aria-label="Destination details">
        {stops.map((place, index) => (
          <li
            key={place.id}
            ref={(node) => { mobileStops.current[index] = node; }}
            className="train-mobile-stop"
            data-stop-index={index}
          >
            <MobileStop place={place} index={index} />
          </li>
        ))}
      </ol>
    </section>
  );
}
