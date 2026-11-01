import { Link } from "next-view-transitions";
import { Wordmark } from "@/components/layout/Wordmark";
import { Deva, Fact, TrailDivider } from "@/components/ui/bits";
import { business, isPlaceholder } from "@/content/business";
import { destinations } from "@/content/destinations";
import { packageCategories } from "@/content/homepage";
import { legalLinks } from "@/content/site";
import { tours } from "@/content/tours";
import { journal } from "@/content/journal";
import { mailHref, telHref, whatsappHref } from "@/lib/contact";

const col = "t-label mb-5 text-ivory/70";
const li = "link py-1 text-ivory/90 hover:text-ivory";

export function Footer() {
  const tel = telHref();
  const mail = mailHref();
  const a = business.address;
  const socials = Object.entries(business.social).filter(([, url]) => url && !isPlaceholder(url));

  return (
    <footer className="on-dark border-t border-brass/40 bg-[linear-gradient(to_bottom,#5e1a1a,#12141f)] text-ivory">
      <div className="wrap pt-24 pb-10 md:pt-32">
        <div className="grid gap-12 border-b border-brass/45 pb-16 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Wordmark />
            <p className="mt-6 max-w-[34ch] font-display text-[1.625rem] leading-snug">
              <Fact v={business.brandStatement} />
            </p>
            <TrailDivider className="mt-8" />
          </div>

          <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-2 lg:col-span-6 xl:grid-cols-4">
            <div>
              <h2 className={col}>Destinations</h2>
              <ul className="space-y-1.5">
                {destinations.map((d) => (
                  <li key={d.slug}>
                    <Link className={li} href={`/destinations/${d.slug}`}>
                      {d.name}
                    </Link>{" "}
                    <Deva className="text-sm text-ivory/70">{d.devanagari}</Deva>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={col}>Journeys</h2>
              <ul className="space-y-1.5">
                {tours.map((t) => (
                  <li key={t.slug}>
                    <Link className={li} href={`/journeys/${t.slug}`}>
                      {t.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link className={li} href="/journeys">
                    All journeys
                  </Link>
                </li>
                <li>
                  <Link className={li} href="/experiences">
                    Experiences
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className={col}>Tour categories</h2>
              <ul className="space-y-1.5">
                {packageCategories.map((c) => (
                  <li key={c.id}>
                    <Link className={li} href={`/#pkg-${c.id}`}>
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={col}>Quick links</h2>
              <ul className="space-y-1.5">
                <li>
                  <Link className={li} href="/">
                    Home
                  </Link>
                </li>
                <li>
                  <Link className={li} href="/story">
                    One Day in Rajasthan
                  </Link>
                </li>
                <li>
                  <Link className={li} href="/our-story">
                    Our Story
                  </Link>
                </li>
                {journal.length > 0 && (
                  <li>
                    <Link className={li} href="/journal">
                      Journal
                    </Link>
                  </li>
                )}
                <li>
                  <Link className={li} href="/contact">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link className={li} href="/credits">
                    Photo credits
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={col}>Contact</h2>
            <address className="space-y-3 text-ivory/90 not-italic">
              <p>
                <Fact v={a.street} />, <Fact v={a.city} />, {a.region} <Fact v={a.postalCode} />
              </p>
              <p>{tel ? <a className={li} href={tel}>{business.phone}</a> : <Fact v={business.phone} />}</p>
              <p>
                <a className={li} href={whatsappHref()} target="_blank" rel="noopener" data-missing={isPlaceholder(business.whatsappNumber) ? business.whatsappNumber : undefined}>
                  WhatsApp enquiry
                </a>
              </p>
              <p>{mail ? <a className={li} href={mail}>{business.email}</a> : <Fact v={business.email} />}</p>
              <p className="t-small text-ivory/75">
                <Fact v={business.officeHours} />
              </p>
            </address>
            {socials.length > 0 && (
              <ul className="mt-6 flex gap-5">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a className={`${li} capitalize`} href={url} target="_blank" rel="noopener me">
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="t-small flex flex-col gap-6 pt-8 text-ivory/75 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link className={li} href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {/* Set gstin to "" if not applicable */}
            {business.gstin !== "" && (
              <span>
                GSTIN <Fact v={business.gstin} />
              </span>
            )}
            {business.approvals.map((ap) => (
              <span key={ap.number}>
                {ap.name} · {ap.number}
              </span>
            ))}
            <span>
              © {new Date().getFullYear()} <Fact v={business.brandName} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
