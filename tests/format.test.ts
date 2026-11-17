import { test } from "node:test";
import assert from "node:assert/strict";
import { formatPeso, formatPrice, groupThousands } from "../src/lib/format.ts";

test("groups thousands with commas", () => {
  assert.equal(groupThousands(0), "0");
  assert.equal(groupThousands(500), "500");
  assert.equal(groupThousands(18000), "18,000");
  assert.equal(groupThousands(1234567), "1,234,567");
});

test("keeps requested decimals", () => {
  assert.equal(groupThousands(4.9, 1), "4.9");
  assert.equal(groupThousands(12500.5, 1), "12,500.5");
});

test("rejects negative and non-finite values", () => {
  assert.throws(() => groupThousands(-1), RangeError);
  assert.throws(() => groupThousands(Number.NaN), RangeError);
});

test("formats pesos with the ₱ symbol", () => {
  assert.equal(formatPeso(14000), "₱14,000");
  assert.equal(formatPeso(120000), "₱120,000");
});

test("prefixes starting prices with 'from'", () => {
  assert.equal(formatPrice({ price: 1200, from: true }), "from ₱1,200");
  assert.equal(formatPrice({ price: 500 }), "₱500");
});
