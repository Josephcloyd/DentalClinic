"use client";

import { useEffect, useState } from "react";

/** The footer is prerendered at build time; this keeps the copyright year current. */
export function CurrentYear({ fallback }: { fallback: number }) {
  const [year, setYear] = useState(fallback);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <>{year}</>;
}
