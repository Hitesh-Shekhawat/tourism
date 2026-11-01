import { Link } from "next-view-transitions";
import { Photo } from "@/components/ui/Photo";
import { TrailDivider } from "@/components/ui/bits";

export default function NotFound() {
  return (
    <section className="grain">
      <div className="wrap pt-[calc(var(--header-h)+64px)] pb-[var(--section-y)]">
        <p className="t-label text-ink-muted">404</p>
        <h1 className="t-display mt-5 max-w-[14ch]">This path leads into the dunes.</h1>
        <p className="measure mt-6 text-ink-muted">The page you were looking for isn't here. Let's get you back on the trail.</p>
        <TrailDivider className="mt-8" />
        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-semibold">
          <li>
            <Link href="/" className="link py-2">
              Home
            </Link>
          </li>
          <li>
            <Link href="/journeys" className="link py-2">
              Journeys
            </Link>
          </li>
          <li>
            <Link href="/destinations" className="link py-2">
              Destinations
            </Link>
          </li>
          <li>
            <Link href="/contact" className="link py-2">
              Contact
            </Link>
          </li>
        </ul>
        <div className="mt-16 overflow-hidden" data-reveal-mask>
          <Photo k="notFound" sizes="(min-width: 1440px) 1280px, 92vw" compact />
        </div>
      </div>
    </section>
  );
}
