"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { ApertureSection } from "@/components/ui/ApertureSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { galleryCases } from "@/data/clinic";
import { clamp, gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

const KEY_STEP = 5;
const START = { x: 50, y: 50 };

/**
 * Before/after through a round lens: "after" inside the lens, "before" outside.
 * Follows the cursor or finger; arrow keys move it; glides across once on first view.
 */
export function Gallery() {
  const { prefs } = useMotion();
  const [caseIndex, setCaseIndex] = useState(0);
  const [ariaX, setAriaX] = useState(START.x);
  const frame = useRef<HTMLDivElement>(null);
  const pos = useRef({ ...START });
  const demo = useRef<gsap.core.Timeline | null>(null);
  const movers = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  const active = galleryCases[caseIndex];

  const render = useCallback(() => {
    frame.current?.style.setProperty("--x", `${pos.current.x}%`);
    frame.current?.style.setProperty("--y", `${pos.current.y}%`);
  }, []);

  useEffect(() => {
    const p = pos.current;
    movers.current = {
      x: gsap.quickTo(p, "x", { duration: 0.5, ease: "power3.out", onUpdate: render }),
      y: gsap.quickTo(p, "y", { duration: 0.5, ease: "power3.out", onUpdate: render }),
    };
    render();
  }, [render]);

  const moveTo = (x: number, y: number) => {
    demo.current?.kill();
    demo.current = null;
    const nx = clamp(x, 0, 100);
    const ny = clamp(y, 0, 100);
    if (prefs.reduced || !movers.current) {
      pos.current = { x: nx, y: ny };
      render();
    } else {
      movers.current.x(nx);
      movers.current.y(ny);
    }
    setAriaX(Math.round(nx));
  };

  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" && e.buttons === 0 && e.type === "pointermove") return;
    const r = e.currentTarget.getBoundingClientRect();
    moveTo(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const { x, y } = pos.current;
    const moves: Record<string, [number, number]> = {
      ArrowRight: [x + KEY_STEP, y],
      ArrowLeft: [x - KEY_STEP, y],
      ArrowUp: [x, y - KEY_STEP],
      ArrowDown: [x, y + KEY_STEP],
      Home: [0, y],
      End: [100, y],
    };
    const next = moves[e.key];
    if (!next) return;
    e.preventDefault();
    moveTo(next[0], next[1]);
  };

  // On first view the lens glides across once to show how it works.
  useGSAP(
    () => {
      if (!prefs.ready || prefs.reduced || !frame.current) return;
      const p = pos.current;
      ScrollTrigger.create({
        trigger: frame.current,
        start: "top 60%",
        once: true,
        onEnter: () => {
          demo.current = gsap
            .timeline({ onUpdate: render, defaults: { ease: "sine.inOut" } })
            .fromTo(p, { x: 12, y: 58 }, { x: 88, y: 42, duration: 2.4 })
            .to(p, { x: START.x, y: START.y, duration: 1.1, ease: "power3.out" });
        },
      });
    },
    { dependencies: [prefs.ready, prefs.reduced] },
  );

  return (
    <ApertureSection id="gallery" labelledBy="gallery-title" className="bg-mist px-[var(--gutter)] py-28 md:py-40">
      <div className="mx-auto grid max-w-6xl items-end gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-10">
          <SectionHeading
            id="gallery-title"
            eyebrow="Smile gallery"
            title={
              <>
                Look through <em>the lens.</em>
              </>
            }
            intro="Move the lens across each portrait — inside, the result; outside, where we began. Results vary from patient to patient."
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a case">
            {galleryCases.map((c, i) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={i === caseIndex}
                onClick={() => setCaseIndex(i)}
                className={`rounded-full px-5 py-2.5 text-sm transition-colors ${
                  i === caseIndex ? "bg-ink text-pearl" : "border border-ink/20 text-ink/80 hover:border-ink hover:text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink/70" aria-live="polite">
            {active.summary}
          </p>
        </div>

        <div
          ref={frame}
          role="slider"
          tabIndex={0}
          aria-label={`${active.label}: before and after lens. Arrow keys move the lens.`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ariaX}
          aria-valuetext={`Lens ${ariaX}% across — after inside, before outside`}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          onKeyDown={onKey}
          className="relative aspect-[4/5] w-full touch-pan-y select-none overflow-hidden rounded-[2.5rem] bg-sand shadow-[0_40px_80px_-40px_rgb(14_27_44/0.45)] [--lr:clamp(4.5rem,13vw,9.5rem)] [--x:50%] [--y:50%] sm:aspect-[5/4]"
        >
          <Image
            key={`${active.id}-before`}
            src={active.image.src}
            alt={`${active.image.alt}, before treatment (illustrative)`}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="before-filter object-cover"
          />
          <div className="absolute inset-0 [clip-path:circle(var(--lr)_at_var(--x)_var(--y))]">
            <Image
              key={`${active.id}-after`}
              src={active.image.src}
              alt={`${active.image.alt}, after treatment`}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="scale-[1.04] object-cover"
            />
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute left-[var(--x)] top-[var(--y)] h-[calc(var(--lr)*2)] w-[calc(var(--lr)*2)] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 shadow-[0_0_0_1px_rgb(14_27_44/0.15),0_20px_50px_-20px_rgb(14_27_44/0.6)]"
          >
            <span className="eyebrow absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-full bg-pearl/90 px-3 py-1 text-[0.6rem] text-ink">After</span>
          </span>
          <span aria-hidden className="eyebrow absolute left-5 top-5 rounded-full bg-ink/70 px-3 py-1 text-[0.6rem] text-pearl">
            Before
          </span>
        </div>
      </div>
    </ApertureSection>
  );
}
