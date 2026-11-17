"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { useAperture } from "@/hooks/useAperture";
import { useFrostReveal } from "@/hooks/useFrostReveal";
import { useGleam } from "@/hooks/useGleam";

type Props = {
  id: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
};

/**
 * A page section that opens through the aperture transition. Headings marked
 * `data-frost` polish into focus and `.gleam` elements catch the light once.
 */
export function ApertureSection({ id, labelledBy, className = "", children }: Props) {
  const ref = useRef<HTMLElement>(null);
  useAperture(ref);
  useFrostReveal(ref, { selector: "header [data-frost]", stagger: 0.1, key: true, start: "top 60%" });
  useGleam(ref, "header .gleam");
  return (
    <section ref={ref} id={id} tabIndex={-1} aria-labelledby={labelledBy} className={`relative outline-none ${className}`}>
      {children}
    </section>
  );
}
