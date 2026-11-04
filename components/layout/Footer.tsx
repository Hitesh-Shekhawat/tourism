import { Link } from "next-view-transitions";
import { atlasHref } from "@/lib/atlas-href";
import { Wordmark } from "@/components/layout/Wordmark";
import { Deva, Fact, TrailDivider } from "@/components/ui/bits";
import { business, isPlaceholder } from "@/content/business";
import { destinations } from "@/content/destinations";
import { interests } from "@/content/explorer";
import { journal } from "@/content/journal";
import { legalLinks } from "@/content/site";
import { tours } from "@/content/tours";
import { hasWhatsApp, mailHref, telHref, whatsappHref } from "@/lib/contact";
import { canShow, showPlaceholders } from "@/lib/content-flags";
import { FooterColumn } from "./FooterColumn";

const li = "link py-1 text-ivory/90 hover:text-ivory";
/** A business fact's row renders when the fact is real (or, in development, as a visible placeholder). */
const has = (v: string) => !isPlaceholder(v) || showPlaceholders;

/**
 * 10 · Footer: burgundy fading to dark. Brand, destinations, journeys, experiences, quick links,
 * contact and WhatsApp, policies, and GSTIN only when configured. Every link resolves; a missing
 * business fact hides its row in production (and shows as a placeholder chip in development).
 */
export function Footer() {
  const tel = telHref();
  const mail = mailHref();
  const a = business.address;
  const socials = Object.entries(business.social).filter(([, url]) => url && !isPlaceholder(url));
  const journeys = tours.filter((t) => canShow(!t.draft));
  const addressKnown = !isPlaceholder(a.street) && !isPlaceholder(a.city) && !isPlaceholder(a.postalCode);

  return (
    <footer className="on-dark border-t border-[var(--line-dark)] bg-[linear-gradient(to_bottom,#5e1a1a,#2a1414_55%,#12141f)] text-ivory">
      <div className="wrap pt-24 pb-10 md:pt-32">
        <div className="grid gap-12 border-b border-[var(--line-dark)] pb-16 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Wordmark />
            {has(business.brandStatement) && (
              <p className="mt-6 max-w-[34ch] font-display text-[1.625rem] leading-snug">
                <Fact v={business.brandStatement} />
              </p>
            )}
            <TrailDivider className="mt-8" />
          </div>

          <nav aria-label="Footer" className="grid lg:col-span-6 lg:grid-cols-2 lg:gap-10 xl:grid-cols-4">
            <FooterColumn title="Destinations">
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
            </FooterColumn>
            <FooterColumn title="Journeys">
              <ul className="space-y-1.5">
                {journeys.map((t) => (
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
            </FooterColumn>
            <FooterColumn title="Tour categories">
              <ul className="space-y-1.5">
                {interests.map((i) => (
                  <li key={i.id}>
                    <a className={li} href={atlasHref("rajasthan", undefined, i.id)}>
                      {i.label}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
            <FooterColumn title="Quick links">
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
            </FooterColumn>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="t-label mb-5 text-ivory/70">Contact</h2>
            <address className="space-y-3 text-ivory/90 not-italic">
              {(addressKnown || showPlaceholders) && (
                <p>
                  <Fact v={a.street} />, <Fact v={a.city} />, {a.region} <Fact v={a.postalCode} />
                </p>
              )}
              {(tel || showPlaceholders) && <p>{tel ? <a className={li} href={tel}>{business.phone}</a> : <Fact v={business.phone} />}</p>}
              {hasWhatsApp() && (
                <p>
                  <a className={li} href={whatsappHref()} target="_blank" rel="noopener">
                    WhatsApp enquiry
                  </a>
                </p>
              )}
              {(mail || showPlaceholders) && <p>{mail ? <a className={li} href={mail}>{business.email}</a> : <Fact v={business.email} />}</p>}
              {has(business.officeHours) && (
                <p className="t-small text-ivory/75">
                  <Fact v={business.officeHours} />
                </p>
              )}
              <p>
                <Link className={li} href="/contact">
                  All the ways to reach us
                </Link>
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
            {/* GSTIN only when configured; set gstin to "" if not applicable */}
            {business.gstin !== "" && has(business.gstin) && (
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
