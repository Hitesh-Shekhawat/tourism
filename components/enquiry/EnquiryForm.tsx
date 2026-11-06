"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { Arrow } from "@/components/ui/bits";
import { destinations } from "@/content/destinations";
import { tours } from "@/content/tours";
import { track } from "@/lib/analytics";
import { whatsappHref, telHref, type EnquiryContext } from "@/lib/contact";
import { budgetBands, countryCodes, FLEXIBLE, monthOptions } from "@/lib/enquiry/options";
import { enquiryDefaults, enquirySchema, step1Fields, step2Fields, type EnquiryResponse, type EnquiryValues } from "@/lib/enquiry/schema";
import type { Prefill } from "./EnquiryProvider";
import { ErrorText, Field, Stepper } from "./FormParts";
import { Turnstile } from "./Turnstile";

const newKey = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9-]/g, "");

type Props = {
  prefill?: { value: Prefill; n: number };
  dark?: boolean;
  context?: EnquiryContext;
  onSent?: () => void;
  /** Heading id for the progress label. */
  idPrefix?: string;
};

export function EnquiryForm({ prefill, dark = false, context = {}, onSent, idPrefix }: Props) {
  const uid = useId();
  const id = (n: string) => `${idPrefix ?? uid}-${n}`;
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");
  const [token, setToken] = useState<string | undefined>();
  const keyRef = useRef(newKey());
  const started = useRef(false);
  const stepHeading = useRef<HTMLParagraphElement>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: enquiryDefaults,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Month list is computed in the browser so a static build never shows stale months.
  useEffect(() => setMonths(monthOptions()), []);

  // Pre-fill from the CTA that opened the drawer (tour name, plan-trip bar values).
  useEffect(() => {
    if (!prefill?.n) return;
    const p = prefill.value;
    if (p.tour !== undefined) setValue("tour", p.tour);
    if (p.destinations) setValue("destinations", p.destinations);
    if (p.month) setValue("month", p.month);
    if (p.adults) setValue("adults", p.adults);
    setStep(1);
  }, [prefill, setValue]);

  const onFocus = () => {
    if (started.current) return;
    started.current = true;
    track("form_start", { tour: getValues("tour") || undefined });
  };

  const next = async () => {
    if (await trigger(step1Fields as unknown as FieldPath<EnquiryValues>[], { shouldFocus: true })) {
      setStep(2);
      requestAnimationFrame(() => stepHeading.current?.focus());
    }
  };
  const back = () => {
    setStep(1);
    requestAnimationFrame(() => stepHeading.current?.focus());
  };

  const onSubmit = async (values: EnquiryValues) => {
    if (status === "sending") return;
    setStatus("sending");
    setServerMsg("");
    try {
      const r = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, idempotencyKey: keyRef.current, turnstileToken: token, page: window.location.pathname }),
      });
      const data = (await r.json().catch(() => null)) as EnquiryResponse | null;
      if (data?.ok) {
        track("generate_lead", {
          tour: values.tour || "tailor-made",
          destination: values.destinations.join(",") || undefined,
          travellers: values.adults + values.children,
        });
        keyRef.current = newKey();
        reset(enquiryDefaults);
        setStep(1);
        setStatus("idle");
        onSent?.();
        router.push(`/enquiry/thank-you?ref=${encodeURIComponent(data.ref)}`);
        return;
      }
      setServerMsg(data && !data.ok ? data.message : "We couldn't send this right now. Please WhatsApp or call us.");
    } catch {
      setServerMsg("We couldn't send this right now. Please WhatsApp or call us.");
    }
    setStatus("error");
  };

  const err = (name: keyof EnquiryValues) => errors[name]?.message as string | undefined;
  const tel = telHref();
  const tourCtx = context.tour || getValues("tour") || undefined;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, () => setStep((s) => s))} onFocus={onFocus} className={dark ? "on-dark" : ""} aria-describedby={id("progress")}>
      {/* Progress */}
      <div className="mb-8">
        <p ref={stepHeading} tabIndex={-1} id={id("progress")} className={`t-label mb-3 outline-none ${dark ? "text-ivory/85" : "text-ink-muted"}`}>
          Step {step} of 2 · {step === 1 ? "Your trip" : "Your details"}
        </p>
        <div className="grid grid-cols-2 gap-2" aria-hidden="true">
          <span className={`h-0.5 ${dark ? "bg-ivory" : "bg-terracotta"}`} />
          <span className={`h-0.5 transition-colors duration-500 ${step === 2 ? (dark ? "bg-ivory" : "bg-terracotta") : dark ? "bg-ivory/25" : "bg-dune"}`} />
        </div>
      </div>

      {/* Step 1: trip details */}
      <div hidden={step !== 1} className="space-y-7">
        <fieldset>
          <legend className={`mb-3 text-[0.9375rem] ${dark ? "text-ivory/85" : "text-ink-muted"}`}>Where would you like to go? (optional)</legend>
          <Controller
            control={control}
            name="destinations"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {destinations.map((d) => {
                  const on = field.value.includes(d.slug);
                  return (
                    <button
                      key={d.slug}
                      type="button"
                      aria-pressed={on}
                      onClick={() => field.onChange(on ? field.value.filter((s) => s !== d.slug) : [...field.value, d.slug])}
                      className={`min-h-11 rounded-[2px] border px-3.5 text-[0.9375rem] transition-colors ${
                        on ? (dark ? "border-ivory bg-ivory text-maroon" : "border-ink bg-ink text-ivory") : dark ? "border-ivory/40 hover:border-ivory" : "border-dune hover:border-ink"
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </fieldset>

        <Field id={id("tour")} label="A journey you liked (optional)" filled>
          <select id={id("tour")} {...register("tour")}>
            <option value="">Tailor-made / not sure yet</option>
            {tours.map((t) => (
              <option key={t.slug} value={t.title}>
                {t.title} ({t.durationDays} days)
              </option>
            ))}
          </select>
        </Field>

        <Field id={id("month")} label="When would you travel?" error={err("month")} filled>
          <select id={id("month")} aria-invalid={!!errors.month} aria-describedby={errors.month ? id("month-err") : undefined} {...register("month")}>
            <option value="">Choose a month</option>
            <option value={FLEXIBLE}>Flexible / Not sure yet</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-6 xs:grid-cols-2">
          <Controller control={control} name="adults" render={({ field }) => <Stepper id={id("adults")} label="Adults" min={1} max={40} value={field.value} onChange={field.onChange} dark={dark} />} />
          <Controller control={control} name="children" render={({ field }) => <Stepper id={id("children")} label="Children" min={0} max={30} value={field.value} onChange={field.onChange} dark={dark} />} />
        </div>

        <Field id={id("budget")} label="Budget per person (optional)" filled>
          <select id={id("budget")} {...register("budget")}>
            {budgetBands.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>

        <button type="button" className={`btn w-full ${dark ? "bg-ivory text-maroon hover:bg-sandstone" : "btn-primary"}`} onClick={next}>
          Continue <Arrow />
        </button>
      </div>

      {/* Step 2: contact details */}
      <div hidden={step !== 2} className="space-y-7">
        <Field id={id("name")} label="Your name" error={err("name")}>
          <input id={id("name")} type="text" autoComplete="name" placeholder=" " aria-invalid={!!errors.name} aria-describedby={errors.name ? id("name-err") : undefined} {...register("name")} />
        </Field>

        <div className="grid grid-cols-1 gap-6 xs:grid-cols-[minmax(0,8.5rem)_1fr] xs:gap-4">
          <Field id={id("code")} label="Country code" filled>
            <select id={id("code")} autoComplete="tel-country-code" {...register("phoneCode")}>
              {countryCodes.map((c) => (
                <option key={c.code + c.label} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id={id("phone")} label="Phone / WhatsApp" error={err("phone")}>
            <input id={id("phone")} type="tel" inputMode="tel" autoComplete="tel-national" placeholder=" " aria-invalid={!!errors.phone} aria-describedby={errors.phone ? id("phone-err") : undefined} {...register("phone")} />
          </Field>
        </div>

        <Field id={id("email")} label="Email (optional with a phone number)" error={err("email")}>
          <input id={id("email")} type="email" autoComplete="email" placeholder=" " aria-invalid={!!errors.email} aria-describedby={errors.email ? id("email-err") : undefined} {...register("email")} />
        </Field>

        <Field id={id("message")} label="Anything else? (optional)" error={err("message")}>
          <textarea id={id("message")} rows={3} placeholder=" " {...register("message")} />
        </Field>

        {/* Honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={id("company")}>Company</label>
          <input id={id("company")} type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-snug">
            <input type="checkbox" className={`mt-0.5 size-5 shrink-0 ${dark ? "accent-ivory" : "accent-terracotta"}`} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? id("consent-err") : undefined} {...register("consent")} />
            <span>
              I agree to be contacted about this enquiry and to the{" "}
              <a href="/privacy" className="underline underline-offset-2" target="_blank">
                privacy policy
              </a>
              .
            </span>
          </label>
          <ErrorText id={id("consent-err")} msg={err("consent")} />
        </div>

        <Turnstile onToken={setToken} dark={dark} active={step === 2} />

        {status === "error" && (
          <div role="alert" className={`ph ${dark ? "" : ""}`}>
            <p className="font-semibold">{serverMsg}</p>
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              <a className="underline underline-offset-2" href={whatsappHref({ tour: tourCtx, destination: context.destination })} target="_blank" rel="noopener">
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

        <div className="flex items-center gap-4">
          <button type="button" onClick={back} className={`btn ${dark ? "btn-secondary" : "btn-secondary"} px-5`}>
            Back
          </button>
          <button type="submit" className={`btn flex-1 ${dark ? "bg-ivory text-maroon hover:bg-sandstone" : "btn-primary"}`} disabled={status === "sending"} aria-busy={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send enquiry"}
            {status !== "sending" && <Arrow />}
          </button>
        </div>
        <p className={`t-small ${dark ? "text-ivory/80" : "text-ink-muted"}`}>No payment needed to enquire.</p>
      </div>
    </form>
  );
}
