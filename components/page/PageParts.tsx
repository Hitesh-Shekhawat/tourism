import { Link } from "next-view-transitions";
import type { CSSProperties, ReactNode } from "react";
import type { AssetKey } from "@/content/assets";
import { Photo } from "@/components/ui/Photo";
import { Deva } from "@/components/ui/bits";

export function Breadcrumbs({ items, dark = false }: { items: { name: string; href?: string }[]; dark?: boolean }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`t-small flex flex-wrap items-center gap-x-2 ${dark ? "text-ivory/85" : "text-ink-muted"}`}>
        <li>
          <Link href="/" className="link">
            Home
          </Link>
        </li>
        {items.map((it) => (
          <li key={it.name} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {it.href ? (
              <Link href={it.href} className="link">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Full-bleed dark hero for destination / experience / tour pages (header sits transparent over it). */
export function PageHero({
  image,
  title,
  deva,
  label,
  crumbs,
  children,
  imageStyle,
}: {
  image: AssetKey;
  title: string;
  deva?: string;
  label?: string;
  crumbs: { name: string; href?: string }[];
  children?: ReactNode;
  imageStyle?: CSSProperties;
}) {
  return (
    <section className="on-dark relative isolate flex min-h-[78svh] items-end overflow-hidden bg-maroon text-ivory">
      <div className="absolute inset-0 -z-10" style={imageStyle}>
        <Photo k={image} fill priority sizes="100vw" phPos="below-header" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-[5] bg-[linear-gradient(to_top,rgb(94_26_26/.8)_0%,rgb(94_26_26/.72)_34%,rgb(94_26_26/.25)_62%,transparent_80%)]" />
      <div className="wrap pt-40 pb-[clamp(40px,8vh,88px)]">
        <Breadcrumbs items={crumbs} dark />
        {label && <p className="t-label mt-8 text-ivory/90">{label}</p>}
        <h1 className="t-display mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="rise-line">
            <span>{title}</span>
          </span>
          {deva && <Deva className="text-[clamp(1.5rem,3vw,2.5rem)] text-ivory/85">{deva}</Deva>}
        </h1>
        {children}
      </div>
    </section>
  );
}

/** Title block for pages without a photo hero (header is solid). */
export function PageHead({ title, label, crumbs, children }: { title: string; label?: string; crumbs: { name: string; href?: string }[]; children?: ReactNode }) {
  return (
    <section className="grain border-b border-brass/45">
      <div className="wrap pt-[calc(var(--header-h)+56px)] pb-16 md:pb-24">
        <Breadcrumbs items={crumbs} />
        {label && <p className="t-label mt-10 text-ink-muted">{label}</p>}
        <h1 className="t-h1 mt-4 max-w-[18ch]">{title}</h1>
        {children}
      </div>
    </section>
  );
}
