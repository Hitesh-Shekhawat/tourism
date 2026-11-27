import { Link } from "next-view-transitions";
import { EnquiryButton } from "@/components/enquiry/EnquiryButton";
import { Wordmark } from "@/components/layout/Wordmark";
import { Creeper } from "@/components/ui/Ornaments";
import { Fact, TrailDivider } from "@/components/ui/bits";
import { business, isPlaceholder } from "@/content/business";
import { experiences } from "@/content/experiences";
import { getPlace } from "@/content/explorer";
import { royalCities } from "@/content/homepage";
import { itineraries } from "@/content/itineraries";
import { journal } from "@/content/journal";
import { legalLinks, placeHref } from "@/content/site";
import { tours } from "@/content/tours";
import { hasWhatsApp, mailHref, telHref, whatsappHref } from "@/lib/contact";
import { canShow, showPlaceholders } from "@/lib/content-flags";
import { FooterColumn } from "./FooterColumn";
import { WhatsAppIcon } from "./icons";

const li = "link py-1 text-ivory/85 hover:text-ivory";
/** A business fact's row renders when the fact is real (or, in development, as a visible placeholder). */
const has = (v: string) => !isPlaceholder(v) || showPlaceholders;

/**
 * 09 · Footer, on deep green: a closing enquiry band, then brand and about, popular destinations,
 * tour packages, experiences, travel guides and contact (with WhatsApp), and the legal row. Every
 * link resolves; a missing business fact hides its row in production (placeholder chip in
 * development); draft journeys appear in development only.
 */
export function Footer() {
  const tel = telHref();
  const mail = mailHref();
  const a = business.address;
  const socials = Object.entries(business.social).filter(([, url]) => url && !isPlaceholder(url));
  const journeys = tours.filter((t) => canShow(!t.draft));
  const addressKnown = !isPlaceholder(a.street) && !isPlaceholder(a.city) && !isPlaceholder(a.postalCode);

  return (
    <footer className="site-footer on-dark text-ivory">
      <div className="wrap">
        <div className="footer-band">
          <div>
            <p className="t-label text-sand">Plan with us</p>
            <p className="footer-band-title">Tell us how you'd like to see Rajasthan.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <EnquiryButton>Plan Your Trip</EnquiryButton>
            {hasWhatsApp() && (
              <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary">
                <WhatsAppIcon /> WhatsApp us
              </a>
            )}
          </div>
        </div>
        <Creeper className="h-6 w-full text-sand/40" width={1200} />
      </div>

      <div className="wrap pt-16 pb-10">
        <div className="grid gap-12 border-b border-[var(--line-dark)] pb-14 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-3">
            <Wordmark />
            {has(business.brandStatement) && (
              <p className="mt-6 max-w-[34ch] font-display text-[1.375rem] leading-snug">
                <Fact v={business.brandStatement} />
              </p>
            )}
            <p className="t-small mt-5 max-w-[36ch] text-ivory/75">Private, tailor-made journeys through Rajasthan&apos;s forts, lakes and desert, planned around your dates and pace.</p>
            <p className="mt-4">
              <Link className={li} href="/our-story">
                About us
              </Link>
            </p>
            <TrailDivider className="mt-8" />
            {socials.length > 0 && (
              <ul className="mt-6 flex gap-5" aria-label="Social media">
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

          <nav aria-label="Footer" className="grid lg:col-span-6 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-10 wide:col-span-7 wide:grid-cols-4 wide:gap-x-6">
            <FooterColumn title="Destinations">
              <ul className="space-y-1">
                {royalCities.cities.map((c) => (
                  <li key={c.id}>
                    <Link className={li} href={placeHref(c.id)}>
                      {getPlace(c.id)!.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterColumn>
            <FooterColumn title="Tour packages">
              <ul className="space-y-1">
                {journeys.map((t) => (
                  <li key={t.slug}>
                    <Link className={li} href={`/journeys/${t.slug}`}>
                      {t.title}
                    </Link>
                  </li>
                ))}
                {itineraries.map((i) => (
                  <li key={i.slug}>
                    <Link className={li} href={`/destinations/${i.slug}/itinerary`}>
                      {i.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link className={li} href="/journeys">
                    All journeys
                  </Link>
                </li>
              </ul>
            </FooterColumn>
            <FooterColumn title="Experiences">
              <ul className="space-y-1">
                {experiences.map((e) => (
                  <li key={e.slug}>
                    <Link className={li} href={`/experiences/${e.slug}`}>
                      {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterColumn>
            <FooterColumn title="Travel guides">
              <ul className="space-y-1">
                <li>
                  <Link className={li} href="/story">
                    One Day in Rajasthan
                  </Link>
                </li>
                {["jaipur", "udaipur", "jodhpur", "jaisalmer"].map((slug) => (
                  <li key={slug}>
                    <Link className={li} href={`/destinations/${slug}`}>
                      {getPlace(slug)!.name} travel guide
                    </Link>
                  </li>
                ))}
                {journal.length > 0 && (
                  <li>
                    <Link className={li} href="/journal">
                      Journal
                    </Link>
                  </li>
                )}
              </ul>
            </FooterColumn>
          </nav>

          <div className="lg:col-span-3 wide:col-span-2">
            <h2 className="t-label mb-5 whitespace-nowrap text-sand">Contact</h2>
            <address className="space-y-2.5 text-ivory/85 not-italic">
              {(addressKnown || showPlaceholders) && (
                <p>
                  <Fact v={a.street} />, <Fact v={a.city} />, {a.region} <Fact v={a.postalCode} />
                </p>
              )}
              {(tel || showPlaceholders) && <p>{tel ? <a className={li} href={tel}>{business.phone}</a> : <Fact v={business.phone} />}</p>}
              {(mail || showPlaceholders) && <p>{mail ? <a className={li} href={mail}>{business.email}</a> : <Fact v={business.email} />}</p>}
              {has(business.officeHours) && (
                <p className="t-small text-ivory/75">
                  <Fact v={business.officeHours} />
                </p>
              )}
              {hasWhatsApp() && (
                <p className="pt-2">
                  <a className="btn btn-secondary min-h-11! px-4!" href={whatsappHref()} target="_blank" rel="noopener">
                    <WhatsAppIcon /> WhatsApp enquiry
                  </a>
                </p>
              )}
              <p>
                <Link className={li} href="/contact">
                  All the ways to reach us
                </Link>
              </p>
            </address>
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
            <li>
              <Link className={li} href="/credits">
                Photo credits
              </Link>
            </li>
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
