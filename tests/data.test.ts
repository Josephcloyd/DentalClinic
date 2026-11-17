import { test } from "node:test";
import assert from "node:assert/strict";
import { dentists, services, stats, testimonials, visitSteps } from "../src/data/clinic.ts";

test("lists the six services in order", () => {
  assert.deepEqual(
    services.map((s) => s.name),
    ["General Dentistry", "Cosmetic Dentistry", "Orthodontics", "Oral Surgery", "Implants & Restorations", "Kids' Dentistry"],
  );
});

test("every starting price matches a listed price in its category", () => {
  for (const s of services) {
    assert.ok(s.prices.some((p) => p.price === s.startingPrice), `${s.name} starts at ${s.startingPrice}`);
  }
});

test("prices are positive whole pesos", () => {
  for (const p of services.flatMap((s) => s.prices)) {
    assert.ok(Number.isInteger(p.price) && p.price > 0, p.name);
  }
});

test("ids are unique and every image has alt text", () => {
  const ids = [...services, ...dentists, ...visitSteps].map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const img of [...services, ...dentists, ...visitSteps].map((x) => x.image)) {
    assert.ok(img.alt.length > 5 && img.src.startsWith("https://images.unsplash.com/"));
  }
});

test("content counts match the brief", () => {
  assert.equal(dentists.length, 5);
  assert.equal(visitSteps.length, 4);
  assert.equal(stats.length, 4);
  assert.equal(testimonials.length, 4);
  assert.equal(services.flatMap((s) => s.prices).length, 32);
});
