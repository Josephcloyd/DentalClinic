"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { dentists, NO_DENTIST_PREFERENCE, services, timeSlots } from "@/data/clinic";
import { LIMITS, manilaToday, validateBooking } from "@/lib/booking";
import type { BookingErrors, BookingField, BookingRequest } from "@/lib/booking";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; reference: string } | { kind: "failed"; message: string };

interface ApiEnvelope {
  success: boolean;
  data: { reference: string } | null;
  error: string | null;
  fields?: BookingErrors;
}

const EMPTY: BookingRequest = {
  fullName: "",
  mobile: "",
  email: "",
  service: "",
  dentist: NO_DENTIST_PREFERENCE,
  date: "",
  time: "",
  firstTime: false,
  notes: "",
};

const OPTIONS = {
  services: services.map((s) => s.name),
  dentists: [NO_DENTIST_PREFERENCE, ...dentists.map((d) => d.name)],
  timeSlots: [...timeSlots],
};

const inputClass =
  "w-full rounded-2xl border border-ink/15 bg-white/80 px-4 py-3 text-base text-ink placeholder:text-ink/45 transition-colors focus:border-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 aria-[invalid=true]:border-[#9a3b2e]";

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {hint && <span className="ml-2 font-normal text-ink/60">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-[#8a3326]">
          {error}
        </p>
      )}
    </div>
  );
}

export function BookingForm() {
  const uid = useId();
  const [form, setForm] = useState<BookingRequest>(EMPTY);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Computed after mount: the page is prerendered, so a render-time date would freeze at build time.
  const [today, setToday] = useState("");
  const confirmRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => setToday(manilaToday()), []);
  useEffect(() => {
    if (status.kind === "sent") confirmRef.current?.focus();
  }, [status.kind]);

  const id = (f: BookingField) => `${uid}-${f}`;
  const a11y = (f: BookingField) => ({
    id: id(f),
    name: f,
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": errors[f] ? `${id(f)}-error` : undefined,
  });

  const update = (field: BookingField) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validateBooking(form, { ...OPTIONS, today: today || manilaToday() });
    if (!result.ok) {
      setErrors(result.errors);
      const first = Object.keys(result.errors)[0] as BookingField | undefined;
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const body = (await res.json()) as ApiEnvelope;
      if (!res.ok || !body.success || !body.data) {
        if (body.fields) setErrors(body.fields);
        setStatus({ kind: "failed", message: body.error ?? "Something went wrong. Please try again." });
        return;
      }
      setStatus({ kind: "sent", reference: body.data.reference });
      setForm(EMPTY);
    } catch {
      setStatus({ kind: "failed", message: "We couldn't reach the studio. Check your connection, or message us on Messenger or Viber." });
    }
  };

  if (status.kind === "sent") {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="eyebrow text-teal">Request received</p>
        <p ref={confirmRef} tabIndex={-1} className="font-serif text-4xl text-ink outline-none md:text-5xl">Salamat! We&rsquo;ll text you shortly.</p>
        <p className="max-w-md text-ink/75">
          Our front desk will confirm your schedule by SMS. Reference <strong className="font-medium text-ink">{status.reference}</strong>.
        </p>
        <button type="button" className="mt-4 text-sm text-teal underline underline-offset-4" onClick={() => setStatus({ kind: "idle" })}>
          Book another visit
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2" aria-describedby={`${uid}-status`}>
      <Field id={id("fullName")} label="Full name" error={errors.fullName}>
        <input {...a11y("fullName")} className={inputClass} autoComplete="name" maxLength={LIMITS.name} value={form.fullName} onChange={update("fullName")} required />
      </Field>
      <Field id={id("mobile")} label="Mobile number" error={errors.mobile}>
        <input {...a11y("mobile")} className={inputClass} type="tel" inputMode="tel" autoComplete="tel" placeholder="0917 555 0147" value={form.mobile} onChange={update("mobile")} required />
      </Field>
      <Field id={id("email")} label="Email" error={errors.email}>
        <input {...a11y("email")} className={inputClass} type="email" autoComplete="email" maxLength={LIMITS.email} value={form.email} onChange={update("email")} required />
      </Field>
      <Field id={id("service")} label="Service needed" error={errors.service}>
        <select {...a11y("service")} className={inputClass} value={form.service} onChange={update("service")} required>
          <option value="">Choose a service</option>
          {OPTIONS.services.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field id={id("dentist")} label="Preferred dentist" error={errors.dentist}>
        <select {...a11y("dentist")} className={inputClass} value={form.dentist} onChange={update("dentist")}>
          {OPTIONS.dentists.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id={id("date")} label="Preferred date" error={errors.date}>
          <input {...a11y("date")} className={inputClass} type="date" min={today || undefined} value={form.date} onChange={update("date")} required />
        </Field>
        <Field id={id("time")} label="Time" error={errors.time}>
          <select {...a11y("time")} className={inputClass} value={form.time} onChange={update("time")} required>
            <option value="">Select</option>
            {OPTIONS.timeSlots.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 md:col-span-2">
        <span id={`${uid}-first-label`} className="text-sm font-medium text-ink">
          First-time patient?
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={form.firstTime}
          aria-labelledby={`${uid}-first-label`}
          onClick={() => setForm((prev) => ({ ...prev, firstTime: !prev.firstTime }))}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 ${form.firstTime ? "bg-teal" : "bg-ink/20"}`}
        >
          <span
            aria-hidden
            className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-expo)] ${form.firstTime ? "translate-x-6" : ""}`}
          />
        </button>
      </div>

      <div className="md:col-span-2">
        <Field id={id("notes")} label="Notes" hint="optional" error={errors.notes}>
          <textarea
            {...a11y("notes")}
            className={`${inputClass} min-h-28 resize-y`}
            maxLength={LIMITS.notes}
            placeholder="Anything we should know — sensitivities, HMO, nervousness…"
            value={form.notes}
            onChange={update("notes")}
          />
        </Field>
      </div>

      <div className="flex flex-col items-center gap-3 md:col-span-2">
        <MagneticButton
          type="submit"
          disabled={status.kind === "sending"}
          className="rounded-full bg-ink px-10 py-4 text-base font-medium text-pearl transition-colors hover:bg-teal disabled:opacity-60"
        >
          {status.kind === "sending" ? "Sending…" : "Request my visit"}
        </MagneticButton>
        <p id={`${uid}-status`} role="alert" className="min-h-5 text-sm text-[#8a3326]">
          {status.kind === "failed" ? status.message : ""}
        </p>
      </div>
    </form>
  );
}
