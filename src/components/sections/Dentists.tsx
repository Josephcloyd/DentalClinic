"use client";

import { useRef } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { ApertureSection } from "@/components/ui/ApertureSection";
import { LensImage } from "@/components/ui/LensImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { dentists } from "@/data/clinic";
import { CLEAR, EASE, frostedState, gsap, useGSAP } from "@/lib/motion";

const STEP = 0.28;

/** Circular portraits polish into focus one at a time; names fade in beneath each. */
export function Dentists() {
  const { prefs } = useMotion();
  const list = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      if (!prefs.ready || !list.current) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: list.current, start: "top 75%", once: true } });
      const items = gsap.utils.toArray<HTMLElement>(".dentist", list.current);

      items.forEach((item, i) => {
        const lens = item.querySelector("[data-frost]");
        const caption = item.querySelectorAll(".dentist-caption > *");
        if (prefs.reduced) {
          tl.from([lens, ...caption], { opacity: 0, duration: 0.5 }, i * 0.1);
          return;
        }
        const from = frostedState(prefs.blur, true);
        tl.fromTo(
          lens,
          from,
          { ...("filter" in from ? CLEAR : {}), opacity: 1, scale: 1, duration: 1.2, ease: EASE.out, clearProps: "filter" },
          i * STEP,
        ).from(caption, { opacity: 0, y: 14, duration: 0.8, stagger: 0.08, ease: EASE.soft }, i * STEP + 0.45);
      });
    },
    { scope: list, dependencies: [prefs.ready, prefs.reduced, prefs.blur] },
  );

  return (
    <ApertureSection id="dentists" labelledBy="dentists-title" className="bg-sand/40 px-[var(--gutter)] py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="dentists-title"
          eyebrow="Meet the dentists"
          title={
            <>
              Five specialists, <em>one gentle standard.</em>
            </>
          }
          intro="A small team that knows you by name — each focused on the care they do best."
        />
        <ul ref={list} className="mt-20 flex flex-wrap justify-center gap-x-6 gap-y-14 md:gap-x-10">
          {dentists.map((d) => (
            <li key={d.id} className="dentist flex w-[calc(50%-0.75rem)] flex-col items-center text-center md:w-[calc(33.333%-1.75rem)] lg:w-[calc(20%-2rem)]">
              <LensImage image={d.image} sizes="(min-width: 1024px) 200px, (min-width: 768px) 30vw, 45vw" className="w-full max-w-[13rem]" frost strength={12} />
              <div className="dentist-caption mt-6 flex flex-col gap-1.5">
                <h3 className="font-serif text-2xl leading-tight text-ink">{d.name}</h3>
                <p className="text-sm leading-snug text-ink/70">{d.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ApertureSection>
  );
}
