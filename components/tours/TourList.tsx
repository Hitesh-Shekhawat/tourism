"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { durationBands, regions, tours, travelStyles } from "@/content/tours";
import { TourRow } from "./TourRow";

const groups = [
  { key: "duration", label: "Duration", options: durationBands.map((b) => ({ value: b.id, label: b.label })) },
  { key: "region", label: "Region", options: regions.map((r) => ({ value: r, label: r })) },
  { key: "style", label: "Travel style", options: travelStyles.map((s) => ({ value: s, label: s })) },
] as const;

type Sel = { duration: string; region: string; style: string };
const NONE: Sel = { duration: "", region: "", style: "" };

/** Filters live in the URL (?duration=&region=&style=) so a filtered list can be shared. */
export function TourList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sel = { duration: params.get("duration") ?? "", region: params.get("region") ?? "", style: params.get("style") ?? "" };

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  return <TourListView sel={sel} onSet={set} onClear={() => router.replace(pathname, { scroll: false })} />;
}

/** Same markup before hydration (no filters applied), so the list never shifts. */
export function TourListFallback() {
  return <TourListView sel={NONE} />;
}

function TourListView({ sel, onSet, onClear }: { sel: Sel; onSet?: (k: string, v: string) => void; onClear?: () => void }) {
  const band = durationBands.find((b) => b.id === sel.duration);
  const list = tours.filter(
    (t) => (!band || band.test(t)) && (!sel.region || t.regions.includes(sel.region as never)) && (!sel.style || t.styles.includes(sel.style as never)),
  );
  const any = sel.duration || sel.region || sel.style;

  return (
    <>
      <form className="grid gap-6 border-b border-brass/50 pb-10 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] md:items-end md:gap-8" onSubmit={(e) => e.preventDefault()} aria-label="Filter journeys">
        {groups.map((g) => (
          <div key={g.key} className="field filled">
            <select id={`f-${g.key}`} value={sel[g.key]} onChange={(e) => onSet?.(g.key, e.target.value)}>
              <option value="">Any</option>
              {g.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <label htmlFor={`f-${g.key}`}>{g.label}</label>
          </div>
        ))}
        <button type="button" className="link min-h-11 w-fit font-semibold disabled:opacity-40" disabled={!any} onClick={onClear}>
          Clear filters
        </button>
      </form>
      <p className="t-small mt-6 text-ink-muted" aria-live="polite">
        {list.length} {list.length === 1 ? "journey" : "journeys"}
      </p>
      <div className="mt-10 space-y-16">
        {list.map((t) => (
          <TourRow key={t.slug} t={t} level={2} />
        ))}
        {!list.length && <p className="font-display text-2xl">No journey matches all three. Clear a filter, or ask us to design one.</p>}
      </div>
    </>
  );
}
