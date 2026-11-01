import { Link } from "next-view-transitions";
import { Photo } from "@/components/ui/Photo";
import { Arrow, TrailDivider } from "@/components/ui/bits";
import { hero } from "@/content/home";
import { HeroEnquiry } from "./HeroEnquiry";
import { HeroVideo } from "./HeroVideo";

/**
 * 01 · Hero + lead form. Full-bleed photo (the LCP image, and the poster for optional footage) under a
 * maroon-ink gradient; the headline rises with the same CSS line-rise as the story's opening, so it
 * paints before any script. Desktop: the enquiry floats at the right. Mobile: it follows as its own block.
 */
export function Hero() {
  return (
    <section aria-labelledby="home-title" className="home-hero relative isolate">
      <div className="home-hero-media absolute inset-x-0 top-0 -z-10 overflow-hidden bg-ink">
        <Photo k="homeHero" fill priority sizes="100vw" phPos="below-header" imgClassName="kenburns" />
        <HeroVideo />
        <div aria-hidden="true" className="home-hero-shade absolute inset-0" />
      </div>

      <div className="wrap grid gap-10 lg:min-h-[100svh] lg:grid-cols-12 lg:items-end lg:gap-8 lg:pt-[calc(var(--header-h)+48px)] lg:pb-14">
        <div className="on-dark home-hero-copy flex flex-col justify-end text-ivory lg:col-span-7 lg:min-h-0 lg:pb-4">
          <p className="t-label text-ivory/85">{hero.label}</p>
          <h1 id="home-title" className="hero-title t-display mt-6">
            {hero.headline.map((line, i) => (
              <span key={line} className="rise-line">
                <span style={{ ["--i" as string]: i }}>{line}</span>
              </span>
            ))}
          </h1>
          <p className="mt-7 max-w-[40ch] text-[1.125rem] text-ivory/90">{hero.support}</p>
          <div className="home-fade mt-9 flex flex-wrap items-center gap-x-4 gap-y-3" style={{ animationDelay: "520ms" }}>
            <Link href="/destinations" className="btn bg-ivory text-ink hover:bg-sandstone">
              Explore Destinations <Arrow />
            </Link>
            <a href="#plan" className="btn btn-secondary">
              Plan Your Journey
            </a>
          </div>
          <TrailDivider className="home-fade mt-10 hidden lg:block" />
        </div>

        <div id="plan" className="home-hero-form relative z-10 lg:col-span-5 lg:col-start-8">
          <HeroEnquiry />
        </div>
      </div>
    </section>
  );
}
