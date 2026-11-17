/** Price and number formatting. Deterministic (no ICU) so SSR and client match. */

export interface Priced {
  readonly price: number;
  readonly from?: boolean;
}

/** Inserts comma thousands separators: 18000 → "18,000". */
export function groupThousands(value: number, decimals = 0): string {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`Expected a non-negative finite number, got ${value}`);
  }
  const [int, dec] = value.toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${grouped}.${dec}` : grouped;
}

/** 14000 → "₱14,000" */
export function formatPeso(amount: number): string {
  return `₱${groupThousands(Math.round(amount))}`;
}

/** Renders "from ₱1,200" for starting prices, otherwise "₱1,200". */
export function formatPrice(item: Priced): string {
  const peso = formatPeso(item.price);
  return item.from ? `from ${peso}` : peso;
}
