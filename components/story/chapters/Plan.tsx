import { Copy, OwnerBlock } from "@/components/ui/bits";
import { business } from "@/content/business";
import { planSteps, reasons } from "@/content/home";
import { chapterHeadingId } from "@/lib/day";
import { Chapter, ChapterHead } from "../Chapter";
import { PlanFx } from "./PlanFx";

/** Ch07 · 19:45, "How we plan + why us" (§6.8): four steps along the Golden Trail line, drawn as you scroll. Quiet: no pin. */
export function Plan() {
  return (
    <Chapter id="plan" className="grain section-y">
      <PlanFx />
      <div className="wrap">
        <ChapterHead id="plan" />
        <h2 id={chapterHeadingId("plan")} className="t-h1 mt-8 max-w-[18ch]" data-rise>
          From a rough idea to a road you trust.
        </h2>

        <div className="relative mt-20">
          {/* The Golden Trail line: horizontal on desktop, vertical on small screens */}
          <svg className="plan-line absolute top-[3px] left-0 hidden h-[18px] w-full overflow-visible text-brass lg:block" viewBox="0 0 1000 18" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 9c70-9 130 7 200 2s130-9 210-3 140 8 220 1 140-8 220-2 110 6 150 3" pathLength={1} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg className="plan-line absolute top-0 bottom-0 left-[10px] h-full w-[6px] overflow-visible text-brass lg:hidden" viewBox="0 0 6 1000" preserveAspectRatio="none" aria-hidden="true">
            <path d="M3 0c3 120-3 250 0 380s3 260 0 380-2 160 0 240" pathLength={1} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className="relative grid gap-12 lg:grid-cols-4 lg:gap-8">
            {planSteps.map((st, i) => (
              <li key={st.title} className="relative pl-12 lg:pt-12 lg:pl-0" data-step>
                <span aria-hidden="true" className="absolute top-0 left-0 grid size-[23px] place-items-center rounded-full border border-brass bg-paper">
                  <span className="size-[7px] rounded-full bg-terracotta" />
                </span>
                <p className="serif-italic numerals text-[1.375rem] leading-none text-accent" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="t-h3 mt-3">{st.title}</h3>
                <p className="t-small mt-3 max-w-[30ch] text-fg-muted">
                  <Copy text={st.text} />
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-28 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <p className="t-label text-fg-muted">Why travel with us</p>
            <h3 className="t-h2 mt-4 max-w-[14ch]">What you can hold us to.</h3>
          </div>
          <dl className="grid gap-x-12 sm:grid-cols-2 lg:col-span-8">
            {reasons.map((r) => (
              <div key={r.title} className="border-t border-brass/50 py-7">
                <dt className="font-display text-[1.375rem] leading-snug font-medium">{r.title}</dt>
                <dd className="mt-2 text-fg-muted">{r.proof ?? <OwnerBlock className="mt-3">The fact behind this claim: {r.hint}.</OwnerBlock>}</dd>
              </div>
            ))}
          </dl>
        </div>

        {business.approvals.length > 0 && (
          <ul className="mt-20 flex flex-wrap items-center gap-10 border-t border-brass/50 pt-10" aria-label="Approvals and memberships">
            {business.approvals.map((a) =>
              a.logo ? (
                <li key={a.number}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.logo} alt={`${a.name} (${a.number})`} className="h-12 w-auto opacity-60 grayscale" />
                </li>
              ) : (
                <li key={a.number} className="t-small text-fg-muted">
                  {a.name} · {a.number}
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </Chapter>
  );
}
