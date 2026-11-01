import { Fact, OwnerBlock } from "@/components/ui/bits";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/layout/icons";
import { business, isPlaceholder } from "@/content/business";
import { mailHref, telHref, whatsappHref } from "@/lib/contact";

export function FaqList({ items, dark = false }: { items: { q: string; a: string | null }[]; dark?: boolean }) {
  return (
    <div className={`border-t ${dark ? "border-brass/50" : "border-brass/50"}`}>
      {items.map((f) => (
        <details key={f.q} className="acc border-b border-brass/50">
          <summary className="flex min-h-14 items-center justify-between gap-6 py-5 font-display text-[1.375rem] leading-snug">
            {f.q}
            <svg className="acc-icon shrink-0" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </summary>
          <div className={`measure pb-6 ${dark ? "text-ivory/85" : "text-ink-muted"}`}>{f.a ?? <OwnerBlock>The answer to this question.</OwnerBlock>}</div>
        </details>
      ))}
    </div>
  );
}

export function ContactLinks({ dark = false }: { dark?: boolean }) {
  const tel = telHref();
  const mail = mailHref();
  const cls = `link inline-flex items-center gap-3 py-1.5 ${dark ? "text-ivory" : ""}`;
  return (
    <ul className="space-y-1">
      <li>
        <a className={cls} href={whatsappHref()} target="_blank" rel="noopener" data-missing={isPlaceholder(business.whatsappNumber) ? business.whatsappNumber : undefined}>
          <WhatsAppIcon /> WhatsApp us
        </a>
      </li>
      <li className="inline-flex items-center gap-3 py-1.5">
        <PhoneIcon />
        {tel ? <a className={cls} href={tel}>{business.phone}</a> : <Fact v={business.phone} />}
      </li>
      <li className="flex items-center gap-3 py-1.5">
        <MailIcon />
        {mail ? <a className={cls} href={mail}>{business.email}</a> : <Fact v={business.email} />}
      </li>
    </ul>
  );
}
