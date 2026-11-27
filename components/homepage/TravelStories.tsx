import { Link } from "next-view-transitions";
import { Photo } from "@/components/ui/Photo";
import { Creeper } from "@/components/ui/Ornaments";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Arrow } from "@/components/ui/bits";
import { getPlace } from "@/content/explorer";
import { storiesV5 } from "@/content/homepage";
import { journal } from "@/content/journal";
import { canShow } from "@/lib/content-flags";
import { StoryFilms } from "./StoryFilms";

/**
 * 07 · Travel stories: an editorial grid of real published content (the One Day story, itineraries,
 * destination and experience pages, journal articles once there are any), city travel guides and the
 * owner's short films. Topics with nothing written yet (Shekhawati, cuisine) render only in
 * development, labelled, and are left out of production. No testimonials, no invented stories.
 */
export function TravelStories({ n }: { n: string }) {
  const f = storiesV5.feature;
  const links = storiesV5.links.filter((l) => canShow(l.ready));
  const articles = [...journal].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return (
    <section id="stories" aria-labelledby="stories-title" className="sec stories-v5 relative isolate bg-sandstone">
      <div className="wrap">
        <SectionHeading n={n} label={storiesV5.label} id="stories-title" title={storiesV5.title} note={storiesV5.note} titleClass="max-w-[15ch]" />

        <div className="stories-grid">
          <Link href={f.href} className="story-feature group" data-fx="card">
            <span className="story-feature-photo">
              <Photo k={f.image} fill sizes="(min-width: 1024px) 55vw, 100vw" imgClassName="story-img" />
              <span className="story-feature-shade" aria-hidden="true" />
            </span>
            <span className="story-feature-copy on-dark">
              <span className="t-label text-sand">{f.kicker}</span>
              <h3 className="story-feature-title">{f.title}</h3>
              <span className="story-feature-text">{f.text}</span>
              <span className="story-cta">
                Read the story <Arrow />
              </span>
            </span>
          </Link>

          <ul className="story-list" aria-label="Stories and guides">
            {articles.map((a) => (
              <li key={a.slug} data-fx="card">
                <Link href={`/journal/${a.slug}`} className="story-item story-item-text group">
                  <span className="story-item-copy">
                    <span className="t-label text-terracotta">Journal</span>
                    <h3 className="story-item-title">{a.title}</h3>
                    <span className="story-item-text">{a.excerpt}</span>
                  </span>
                </Link>
              </li>
            ))}
            {links.map((l, i) => (
              <li key={l.id} data-fx="card">
                <Link href={l.href} className={`story-item group ${l.ready ? "" : "is-unconfirmed"}`}>
                  <span className="story-item-photo">
                    <Photo k={l.image} fill sizes="(min-width: 1024px) 12vw, 30vw" decorative imgClassName="story-img" />
                  </span>
                  <span className="story-item-copy">
                    <span className="t-label text-terracotta">{l.kicker}</span>
                    <h3 className="story-item-title">{l.title}</h3>
                    <span className="story-item-text">{l.ready ? l.text : `Owner to write (hidden in production): ${l.need}`}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="stories-foot">
          <div className="stories-guides" data-fx="card">
            <h3 className="t-label text-ink-muted">City travel guides</h3>
            <Creeper className="my-4 h-5 w-48 text-brass" width={240} />
            <ul className="guides-row">
              {storiesV5.guides.map((slug) => {
                const p = getPlace(slug)!;
                return (
                  <li key={slug}>
                    <Link href={`/destinations/${slug}`} className="guide-link group">
                      <span className="guide-thumb">
                        <Photo k={p.image} fill sizes="64px" decorative imgClassName="story-img" />
                      </span>
                      <span>
                        <span className="block font-display text-[1.125rem] leading-tight">{p.name}</span>
                        <span className="t-small flex items-center gap-2 text-ink-muted">
                          Travel guide <Arrow />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="stories-films" data-fx="card">
            <h3 className="t-label text-ink-muted">Films from the road</h3>
            <StoryFilms />
          </div>
        </div>
      </div>
    </section>
  );
}
