"use client";

import { useEffect, useState } from "react";
import { Arrow } from "@/components/ui/bits";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { destinations } from "@/content/destinations";
import { tours } from "@/content/tours";
import { FLEXIBLE, monthOptions } from "@/lib/enquiry/options";

/** Slim three-field bar under the hero. "Continue" opens the drawer with these values carried over. */
export function PlanTripBar() {
  const { open } = useEnquiry();
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [who, setWho] = useState("2");
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => setMonths(monthOptions()), []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const [kind, val] = where.split(":");
    open({
      ...(kind === "d" ? { destinations: [val] } : {}),
      ...(kind === "t" ? { tour: val } : { tour: "" }),
      ...(when ? { month: when } : {}),
      adults: Number(who),
    });
  };

  const cell = "field filled min-w-0 flex-1";
  return (
    <div className="grain relative z-10 border-b border-brass/45">
      <form onSubmit={submit} aria-label="Plan your trip" className="wrap flex flex-col gap-2 py-5 md:flex-row md:items-end md:gap-8 md:py-6">
        <p className="t-label shrink-0 pb-1 text-ink-muted md:w-36 md:pb-4">Plan your trip</p>
        <div className={cell}>
          <select id="ptb-where" value={where} onChange={(e) => setWhere(e.target.value)}>
            <option value="">Anywhere: help me choose</option>
            <optgroup label="Destinations">
              {destinations.map((d) => (
                <option key={d.slug} value={`d:${d.slug}`}>
                  {d.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Journeys">
              {tours.map((t) => (
                <option key={t.slug} value={`t:${t.title}`}>
                  {t.title}
                </option>
              ))}
            </optgroup>
          </select>
          <label htmlFor="ptb-where">Where to</label>
        </div>
        <div className={cell}>
          <select id="ptb-when" value={when} onChange={(e) => setWhen(e.target.value)}>
            <option value="">Choose a month</option>
            <option value={FLEXIBLE}>Not sure yet</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <label htmlFor="ptb-when">When</label>
        </div>
        <div className={`${cell} md:max-w-44`}>
          <select id="ptb-who" value={who} onChange={(e) => setWho(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "traveller" : "travellers"}
              </option>
            ))}
          </select>
          <label htmlFor="ptb-who">Travellers</label>
        </div>
        <button type="submit" aria-haspopup="dialog" className="btn btn-primary mt-4 md:mt-0">
          Continue <Arrow />
        </button>
      </form>
    </div>
  );
}
