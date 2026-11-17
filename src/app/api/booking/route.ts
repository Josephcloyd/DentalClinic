import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { dentists, NO_DENTIST_PREFERENCE, services, timeSlots } from "@/data/clinic";
import { manilaToday, validateBooking } from "@/lib/booking";
import type { BookingErrors } from "@/lib/booking";

const MAX_BODY_BYTES = 8 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

// Best-effort, per-instance limiter. Use a shared store (e.g. Redis/Upstash) when deployed across instances.
const hits = new Map<string, number[]>();

interface Envelope {
  success: boolean;
  data: { reference: string } | null;
  error: string | null;
  fields?: BookingErrors;
}

const MAX_TRACKED_CLIENTS = 5000;

const reply = (body: Envelope, status: number) => NextResponse.json(body, { status });

/** Client IP as seen by the platform proxy: x-real-ip, else the last (proxy-appended) x-forwarded-for hop. */
function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const hops = request.headers.get("x-forwarded-for")?.split(",").map((h) => h.trim()).filter(Boolean) ?? [];
  return hops.at(-1) ?? "unknown";
}

function prune(now: number): void {
  for (const [key, times] of hits) {
    if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  }
}

function rateLimited(ip: string, now = Date.now()): boolean {
  if (hits.size > MAX_TRACKED_CLIENTS) prune(now);
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.set(ip, [...recent, now]);
  return recent.length >= MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return reply({ success: false, data: null, error: "Too many requests. Please try again in a few minutes, or message us on Viber." }, 429);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return reply({ success: false, data: null, error: "Unsupported request." }, 415);
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return reply({ success: false, data: null, error: "Request too large." }, 413);
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return reply({ success: false, data: null, error: "Request too large." }, 413);
  }

  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return reply({ success: false, data: null, error: "Invalid request." }, 400);
  }

  const result = validateBooking(input, {
    services: services.map((s) => s.name),
    dentists: [NO_DENTIST_PREFERENCE, ...dentists.map((d) => d.name)],
    timeSlots: [...timeSlots],
    today: manilaToday(),
  });
  if (!result.ok) {
    return reply({ success: false, data: null, error: "Please check the highlighted fields.", fields: result.errors }, 422);
  }

  // TODO: deliver `result.data` to the clinic (email, CRM or booking system) before launch.
  // Until then requests are validated and acknowledged but not stored anywhere.
  const reference = `NG-${randomUUID().slice(0, 6).toUpperCase()}`;
  return reply({ success: true, data: { reference }, error: null }, 201);
}
