import { PageHead } from "@/components/page/PageParts";
import { OwnerBlock } from "@/components/ui/bits";
import { legal } from "@/content/legal";

export function LegalPage({ doc }: { doc: keyof typeof legal }) {
  const d = legal[doc];
  return (
    <>
      <PageHead title={d.title} crumbs={[{ name: d.title }]}>{d.updated && <p className="t-small mt-6 text-ink-muted">Last updated {d.updated}</p>}</PageHead>
      <section className="grain section-y pt-16!">
        <div className="wrap">
          <div className="max-w-[68ch] space-y-10">
            {d.sections ? (
              d.sections.map((s) => (
                <div key={s.heading}>
                  <h2 className="t-h3">{s.heading}</h2>
                  <div className="mt-4 space-y-4 text-ink-muted">
                    {s.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <OwnerBlock>
                The full text of the {d.title.toLowerCase()} in <code className="font-mono text-[0.85em]">content/legal.ts</code>, ideally reviewed by a lawyer.
                {doc === "privacy" && " It must cover the enquiry form (what is collected, why, retention, the email and CRM processors used), analytics cookies, and visitors' rights under India's DPDP Act 2023 and, for EU visitors, the GDPR."}
              </OwnerBlock>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
