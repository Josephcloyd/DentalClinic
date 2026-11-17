import { test } from "node:test";
import assert from "node:assert/strict";
import { manilaToday, normalizeMobile, validateBooking } from "../src/lib/booking.ts";

const opts = {
  services: ["General Dentistry", "Orthodontics"],
  dentists: ["No preference", "Dr. Rafael Mendoza"],
  timeSlots: ["9:00 AM", "6:00 PM"],
  today: "2026-11-17",
};

const valid = {
  fullName: "Juan Dela Cruz",
  mobile: "0917 555 0147",
  email: "Juan@Example.com",
  service: "Orthodontics",
  dentist: "No preference",
  date: "2026-11-20",
  time: "9:00 AM",
  firstTime: true,
  notes: "",
};

test("normalizes Philippine mobile formats", () => {
  assert.equal(normalizeMobile("0917 555 0147"), "+639175550147");
  assert.equal(normalizeMobile("+63 917-555-0147"), "+639175550147");
  assert.equal(normalizeMobile("639175550147"), "+639175550147");
  assert.equal(normalizeMobile("(02) 8555 0147"), null);
  assert.equal(normalizeMobile("0917555014"), null);
});

test("accepts a complete request and normalizes fields", () => {
  const result = validateBooking(valid, opts);
  assert.ok(result.ok);
  assert.equal(result.data.mobile, "+639175550147");
  assert.equal(result.data.email, "juan@example.com");
  assert.equal(result.data.firstTime, true);
});

test("reports each invalid field", () => {
  const result = validateBooking(
    { ...valid, fullName: "J", mobile: "123", email: "nope", service: "Tattoo", date: "2026-11-01", time: "3:00 AM" },
    opts,
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(Object.keys(result.errors).sort(), ["date", "email", "fullName", "mobile", "service", "time"]);
});

test("rejects impossible and far-future dates", () => {
  for (const date of ["2026-02-30", "2027-12-01", "17/11/2026"]) {
    const result = validateBooking({ ...valid, date }, opts);
    assert.equal(result.ok, false, date);
  }
});

test("handles non-object input without throwing", () => {
  for (const input of [null, undefined, "x", 42, []]) {
    assert.equal(validateBooking(input, opts).ok, false);
  }
});

test("only treats literal true as first-time", () => {
  const result = validateBooking({ ...valid, firstTime: "true" }, opts);
  assert.ok(result.ok);
  assert.equal(result.data.firstTime, false);
});

test("rejects notes over the limit", () => {
  const result = validateBooking({ ...valid, notes: "a".repeat(501) }, opts);
  assert.equal(result.ok, false);
});

test("computes today's date in Manila time", () => {
  // 2026-11-17 20:00 UTC is already 2026-11-18 in Manila (UTC+8)
  assert.equal(manilaToday(new Date("2026-11-17T20:00:00Z")), "2026-11-18");
});
