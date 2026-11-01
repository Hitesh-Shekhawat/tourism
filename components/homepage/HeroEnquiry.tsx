"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ErrorText } from "@/components/enquiry/FormParts";
import { Turnstile } from "@/components/enquiry/Turnstile";
import { destinations } from "@/content/destinations";
import { track } from "@/lib/analytics";
import { telHref, whatsappHref } from "@/lib/contact";
import { countryCodes, FLEXIBLE } from "@/lib/enquiry/options";
import type { EnquiryResponse, EnquiryValues } from "@/lib/enquiry/schema";

const DURATIONS = ["2–4 days", "5–7 days", "8–10 days", "11–14 days", "15+ days"];
const TYPES = ["Family", "Couple", "Friends", "Group"] as const;
const PHONE = /^[\d\s()-]{6,20}$/;

/** Line icons for the travel-type tiles (24×24, stroke only, in the brand's thin hand). */
const TYPE_ICON: Record<(typeof TYPES)[number], string> = {
  Family: "M7 7a2 2 0 1 0 0-.01M17 7a2 2 0 1 0 0-.01M12 12a1.6 1.6 0 1 0 0-.01M3 20c.4-3.6 1.9-6 4-6s3.6 2.4 4 6M13 20c.4-3.6 1.9-6 4-6s3.6 2.4 4 6M9.5 20c.3-2.2 1.2-3.6 2.5-3.6s2.2 1.4 2.5 3.6",
  Couple: "M12 20s-7-4.3-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.7 12 20 12 20z",
  Friends: "M8 8a2.5 2.5 0 1 0 0-.01M16 8a2.5 2.5 0 1 0 0-.01M3 20c.5-4 2.5-6 5-6s4.5 2 5 6M11 20c.5-4 2.5-6 5-6s4.5 2 5 6",
  Group: "M12 5.5a2 2 0 1 0 0-.01M5.5 8a1.8 1.8 0 1 0 0-.01M18.5 8a1.8 1.8 0 1 0 0-.01M8 20c.3-3.6 1.8-6 4-6s3.7 2.4 4 6M2 19c.3-2.8 1.5-4.6 3.5-4.6M22 19c-.3-2.8-1.5-4.6-3.5-4.6",
};

const newKey = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9-]/g, "");
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const niceDate = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", opts);

type Values = { destination: string; date: string; travellers: number; duration: string; type: string; name: string; phoneCode: string; phone: string; consent: boolean; company: string };
type Errors = Partial<Record<keyof Values, string>>;
const initial: Values = { destination: "", date: "", travellers: 2, duration: "", type: "", name: "", phoneCode: "+91", phone: "", consent: false, company: "" };
const STEP1: (keyof Values)[] = ["destination", "date", "travellers", "duration", "type"];

function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.date && v.date < today()) e.date = "Choose a date from today onwards";
  if (!Number.isInteger(v.travellers) || v.travellers < 1 || v.travellers > 40) e.travellers = "Between 1 and 40 travellers";
  if (v.name.trim().length < 2) e.name = "Please tell us your name";
  else if (v.name.trim().length > 100) e.name = "That's a little long";
  if (!PHONE.test(v.phone.trim())) e.phone = "Enter a valid phone number, digits only";
  if (!v.consent) e.consent = "Please agree so we can contact you";
  return e;
}

/** The same envelope the full enquiry form posts; the extra fields travel in the message. */
function toEnquiry(v: Values): EnquiryValues {
  const dest = destinations.find((d) => d.slug === v.destination);
  const when = v.date ? niceDate(v.date, { day: "numeric", month: "long", year: "numeric" }) : "Flexible";
  return {
    destinations: dest ? [dest.slug] : [],
    tour: "",
    month: v.date ? v.date.slice(0, 7) : FLEXIBLE,
    adults: v.travellers,
    children: 0,
    budget: "",
    name: v.name.trim(),
    phoneCode: v.phoneCode,
    phone: v.phone.trim(),
    email: "",
    message: [
      `Travel date: ${when}`,
      `Duration: ${v.duration || "Not sure yet"}`,
      `Travel type: ${v.type || "Not specified"}`,
      `Travellers: ${v.travellers} in total (adults and children not split)`,
      "Sent from the home page quick enquiry.",
    ].join("\n"),
    consent: v.consent,
    company: v.company,
  };
}

/**
 * The hero's quick enquiry: a soft, frosted panel in two short steps (the trip, then how to reach you),
 * chosen mostly by tapping (chips, a stepper, pills, tiles) with a live summary. Floating on desktop,
 * a full block on mobile. Posts to the existing /api/enquiry pipeline and lands on the same thank-you page.
 */
export function HeroEnquiry() {
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const router = useRouter();
  const [v, setV] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");
  const [started, setStarted] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const keyRef = useRef(newKey());
  const formRef = useRef<HTMLFormElement>(null);
  const stepRef = useRef<HTMLParagraphElement>(null);
  const onToken = useCallback((t: string | undefined) => setToken(t), []);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    setV((s) => ({ ...s, [k]: val }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onFocus = () => {
    if (started) return;
    setStarted(true);
    track("form_start", { form: "home-hero" });
  };

  const focusField = (k: keyof Values) => requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${k}"]`)?.focus());
  const goTo = (s: 1 | 2) => {
    setStep(s);
    requestAnimationFrame(() => stepRef.current?.focus({ preventScroll: true }));
  };

  const next = () => {
    const found = validate(v);
    const first = STEP1.find((k) => found[k]);
    setErrors(Object.fromEntries(STEP1.map((k) => [k, found[k]])));
    if (first) return focusField(first);
    goTo(2);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) return next();
    if (status === "sending") return;
    const found = validate(v);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Values)[])[0];
    if (first) {
      if (STEP1.includes(first)) goTo(1);
      return focusField(first);
    }
    setStatus("sending");
    setServerMsg("");
    const values = toEnquiry(v);
    try {
      const r = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, idempotencyKey: keyRef.current, turnstileToken: token, page: window.location.pathname }),
      });
      const data = (await r.json().catch(() => null)) as EnquiryResponse | null;
      if (data?.ok) {
        track("generate_lead", { tour: "tailor-made", destination: values.destinations.join(",") || undefined, travellers: values.adults });
        keyRef.current = newKey();
        setV(initial);
        setStatus("idle");
        router.push(`/enquiry/thank-you?ref=${encodeURIComponent(data.ref)}`);
        return;
      }
      setServerMsg(data && !data.ok ? data.message : "We couldn't send this right now. Please WhatsApp or call us.");
    } catch {
      setServerMsg("We couldn't send this right now. Please WhatsApp or call us.");
    }
    setStatus("error");
  };

  const tel = telHref();
  const err = (k: keyof Values) => ({ "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? id(`${k}-err`) : undefined });
  const dest = destinations.find((d) => d.slug === v.destination);
  const summary = [dest?.name ?? "Anywhere in Rajasthan", v.date ? niceDate(v.date, { day: "numeric", month: "short", year: "numeric" }) : "Dates flexible", `${v.travellers} ${v.travellers === 1 ? "traveller" : "travellers"}`, v.duration, v.type].filter(Boolean);

  return (
    <form ref={formRef} noValidate onSubmit={submit} onFocus={onFocus} aria-labelledby={id("title")} className="hq relative text-ink">
      <div aria-hidden="true" className="hq-glow" />

      {/* Header + progress */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="t-label text-terracotta-deep">Plan your journey</p>
          <h2 id={id("title")} className="mt-2 font-display text-[1.75rem] leading-[1.1]">
            {step === 1 ? "Where shall we take you?" : "How do we reach you?"}
          </h2>
        </div>
        <span className="hq-badge hidden xs:inline-block" aria-hidden="true">
          Free · no payment
        </span>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <p ref={stepRef} tabIndex={-1} className="t-small shrink-0 text-ink-muted outline-none">
          Step {step} of 2 <span className="sr-only">: {step === 1 ? "your trip" : "your details"}</span>
          <span className="xs:hidden" aria-hidden="true"> · Free</span>
        </p>
        <span className="hq-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${step / 2})` }} />
        </span>
      </div>

      {/* Step 1: the trip */}
      <div hidden={step !== 1} className="hq-step mt-5 space-y-5">
        <fieldset>
          <legend className="hq-legend">Destination</legend>
          <div className="flex flex-wrap gap-2">
            {[{ slug: "", name: "Not sure yet" }, ...destinations].map((d) => (
              <Choice key={d.slug || "any"} name="destination" value={d.slug} checked={v.destination === d.slug} onChange={() => set("destination", d.slug)} className="hq-chip">
                {d.name}
              </Choice>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={id("date")} className="hq-legend">
              Travel date <span className="font-normal">(optional)</span>
            </label>
            <div className="hq-input" data-invalid={!!errors.date || undefined}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-brass-text">
                <path d="M4 7h16v13H4zM4 11h16M8 4v4M16 4v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input id={id("date")} name="date" type="date" min={today()} value={v.date} onChange={(e) => set("date", e.target.value)} {...err("date")} />
            </div>
            <ErrorText id={id("date-err")} msg={errors.date} />
          </div>
          <div>
            <span id={id("travellers-l")} className="hq-legend">
              Travellers
            </span>
            <div className="hq-stepper" role="group" aria-labelledby={id("travellers-l")}>
              <button type="button" aria-label="Fewer travellers" disabled={v.travellers <= 1} onClick={() => set("travellers", Math.max(1, v.travellers - 1))}>
                −
              </button>
              <output key={v.travellers} name="travellers" aria-live="polite" className="hq-count numerals">
                {v.travellers}
              </output>
              <button type="button" aria-label="More travellers" disabled={v.travellers >= 40} onClick={() => set("travellers", Math.min(40, v.travellers + 1))}>
                +
              </button>
            </div>
          </div>
        </div>

        <fieldset>
          <legend className="hq-legend">Duration</legend>
          <div className="hq-segment">
            {DURATIONS.map((d) => (
              <Choice key={d} name="duration" value={d} checked={v.duration === d} onChange={() => set("duration", v.duration === d ? "" : d)}>
                {d}
              </Choice>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="hq-legend">Travelling as</legend>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map((t) => (
              <Choice key={t} name="type" value={t} checked={v.type === t} onChange={() => set("type", t)} className="hq-tile">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d={TYPE_ICON[t]} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{t}</span>
              </Choice>
            ))}
          </div>
        </fieldset>

        <button type="button" onClick={next} className="hq-submit">
          Continue
          <span className="hq-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      {/* Step 2: contact */}
      <div hidden={step !== 2} className="hq-step mt-6 space-y-5">
        <div className="hq-summary">
          <ul className="flex flex-wrap gap-1.5" aria-label="Your trip so far">
            {summary.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <button type="button" onClick={() => goTo(1)} className="t-small shrink-0 font-semibold text-terracotta-deep underline-offset-4 hover:underline">
            Edit
          </button>
        </div>

        <div>
          <div className="hq-input hq-float" data-invalid={!!errors.name || undefined}>
            <input id={id("name")} name="name" type="text" autoComplete="name" placeholder=" " value={v.name} onChange={(e) => set("name", e.target.value)} {...err("name")} />
            <label htmlFor={id("name")}>Your name</label>
            {v.name.trim().length >= 2 && <Tick />}
          </div>
          <ErrorText id={id("name-err")} msg={errors.name} />
        </div>

        <div>
          <div className="grid grid-cols-[6.25rem_1fr] gap-2">
            <div className="hq-input hq-float">
              <select id={id("code")} name="phoneCode" autoComplete="tel-country-code" value={v.phoneCode} onChange={(e) => set("phoneCode", e.target.value)}>
                {countryCodes.map((c) => (
                  <option key={c.code + c.label} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              <label htmlFor={id("code")}>Code</label>
            </div>
            <div className="hq-input hq-float" data-invalid={!!errors.phone || undefined}>
              <input id={id("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder=" " value={v.phone} onChange={(e) => set("phone", e.target.value)} {...err("phone")} />
              <label htmlFor={id("phone")}>Phone / WhatsApp</label>
              {PHONE.test(v.phone.trim()) && <Tick />}
            </div>
          </div>
          <ErrorText id={id("phone-err")} msg={errors.phone} />
        </div>

        {/* Honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={id("company")}>Company</label>
          <input id={id("company")} name="company" type="text" tabIndex={-1} autoComplete="off" value={v.company} onChange={(e) => set("company", e.target.value)} />
        </div>

        <div>
          <label className="hq-consent">
            <input type="checkbox" name="consent" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} {...err("consent")} />
            <span className="hq-box" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 7.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>
              I agree to be contacted about this enquiry and to the{" "}
              <a href="/privacy" className="underline underline-offset-2" target="_blank">
                privacy policy
              </a>
              .
            </span>
          </label>
          <ErrorText id={id("consent-err")} msg={errors.consent} />
        </div>

        <Turnstile onToken={onToken} active={started} />

        {status === "error" && (
          <div role="alert" className="hq-alert">
            <p className="font-semibold">{serverMsg}</p>
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              <a className="underline underline-offset-2" href={whatsappHref()} target="_blank" rel="noopener">
                WhatsApp us
              </a>
              {tel && (
                <a className="underline underline-offset-2" href={tel}>
                  Call us
                </a>
              )}
            </p>
          </div>
        )}

        <button type="submit" className="hq-submit" disabled={status === "sending"} aria-busy={status === "sending"} data-sending={status === "sending" || undefined}>
          {status === "sending" ? (
            <>
              <span className="home-spinner" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              Submit enquiry
              <span className="hq-arrow" aria-hidden="true">
                →
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/** A visually custom radio (chip, pill or tile) that stays a native input for keyboard and screen readers. */
function Choice({ name, value, checked, onChange, className = "", children }: { name: string; value: string; checked: boolean; onChange: () => void; className?: string; children: ReactNode }) {
  return (
    <label className={`hq-choice ${className}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} onClick={() => checked && onChange()} className="sr-only" />
      {children}
    </label>
  );
}

function Tick() {
  return (
    <svg className="hq-tick" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.3" fill="currentColor" />
      <path d="M4.8 8.3l2.1 2.1 4.3-4.6" stroke="#f7f1e6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
