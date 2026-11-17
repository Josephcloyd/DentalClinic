"use client";

import { useEffect, useRef, useState } from "react";
import { ApertureSection } from "@/components/ui/ApertureSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/data/clinic";
import type { ServiceId } from "@/data/clinic";
import { useFrostReveal } from "@/hooks/useFrostReveal";
import { ServiceLens } from "./ServiceLens";


/** Six circular lenses; each expands into a rounded card while the rest dim and blur. */
export function Services() {
  const [active, setActive] = useState<ServiceId | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  useFrostReveal(gridRef, { selector: ".lens-orb", stagger: 0.12, key: true, start: "top 75%" });

  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest(".lens-item[data-open]")) setActive(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [active]);

  return (
    <ApertureSection
      id="services"
      labelledBy="services-title"
      className="bg-[radial-gradient(120%_70%_at_50%_0%,#ffffff,#e6f1ed_55%,var(--color-mint))] px-[var(--gutter)] py-28 md:py-40"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="services-title"
          eyebrow="Services"
          title={
            <>
              Every kind of care, <em>one calm studio.</em>
            </>
          }
          intro="Hover or tap a lens to look closer — each treatment begins with a conversation, never a sales pitch."
        />
        <ul
          ref={gridRef}
          data-active={active ? "" : undefined}
          className="services-grid relative mt-20 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-10 md:gap-y-20"
        >
          {services.map((s) => (
            <ServiceLens
              key={s.id}
              service={s}
              open={active === s.id}
              gridRef={gridRef}
              onOpen={() => setActive(s.id)}
              onClose={() => setActive((cur) => (cur === s.id ? null : cur))}
            />
          ))}
        </ul>
      </div>
    </ApertureSection>
  );
}
