/** Booking request validation — shared by the form (client) and the API route (server). */

export interface BookingRequest {
  readonly fullName: string;
  readonly mobile: string;
  readonly email: string;
  readonly service: string;
  readonly dentist: string;
  readonly date: string;
  readonly time: string;
  readonly firstTime: boolean;
  readonly notes: string;
}

export type BookingField = keyof BookingRequest;
export type BookingErrors = Partial<Record<BookingField, string>>;

export interface BookingOptions {
  readonly services: readonly string[];
  readonly dentists: readonly string[];
  readonly timeSlots: readonly string[];
  /** Earliest allowed date, YYYY-MM-DD (clinic local time). */
  readonly today: string;
}

export type BookingResult =
  | { readonly ok: true; readonly data: BookingRequest }
  | { readonly ok: false; readonly errors: BookingErrors };

export const LIMITS = { name: 80, email: 120, notes: 500 } as const;
const MAX_DAYS_AHEAD = 180;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Accepts 0917 555 0147, 09175550147, +63 917-555-0147, 639175550147 → "+639175550147". */
export function normalizeMobile(raw: string): string | null {
  const digits = raw.replace(/[\s\-().]/g, "");
  const match = /^(?:\+?63|0)(9\d{9})$/.exec(digits);
  return match ? `+63${match[1]}` : null;
}

/** Today's date in Manila as YYYY-MM-DD. */
export function manilaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function str(source: Record<string, unknown>, key: string): string {
  const v = source[key];
  return typeof v === "string" ? v.trim() : "";
}

function isRealDate(iso: string): boolean {
  if (!DATE_RE.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

/** Validates untrusted input. Never throws. */
export function validateBooking(input: unknown, opts: BookingOptions): BookingResult {
  const src = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const errors: BookingErrors = {};

  const fullName = str(src, "fullName");
  if (fullName.length < 2) errors.fullName = "Please enter your full name.";
  else if (fullName.length > LIMITS.name) errors.fullName = `Please keep your name under ${LIMITS.name} characters.`;

  const mobile = normalizeMobile(str(src, "mobile"));
  if (!mobile) errors.mobile = "Enter a PH mobile number, e.g. 0917 555 0147.";

  const email = str(src, "email").toLowerCase();
  if (!email) errors.email = "Please enter your email.";
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = "That email doesn't look right.";

  const service = str(src, "service");
  if (!opts.services.includes(service)) errors.service = "Please choose a service.";

  const dentist = str(src, "dentist");
  if (!opts.dentists.includes(dentist)) errors.dentist = "Please choose a dentist or “No preference”.";

  const date = str(src, "date");
  if (!isRealDate(date)) errors.date = "Please pick a date.";
  else if (date < opts.today) errors.date = "Please pick today or a later date.";
  else if (date > addDays(opts.today, MAX_DAYS_AHEAD)) errors.date = "We book up to six months ahead.";

  const time = str(src, "time");
  if (!opts.timeSlots.includes(time)) errors.time = "Please choose a time.";

  const notes = str(src, "notes");
  if (notes.length > LIMITS.notes) errors.notes = `Please keep notes under ${LIMITS.notes} characters.`;

  if (Object.keys(errors).length > 0 || !mobile) return { ok: false, errors };

  return {
    ok: true,
    data: { fullName, mobile, email, service, dentist, date, time, firstTime: src.firstTime === true, notes },
  };
}
