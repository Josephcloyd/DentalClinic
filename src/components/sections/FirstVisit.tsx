"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { visitSteps } from "@/data/clinic";
import type { VisitStep } from "@/data/clinic";
import { canBlur, EASE, gsap, useGSAP } from "@/lib/motion";

const TONES: Record<VisitStep["tone"], { bg: string; text: string; muted: string; number: string; accent: string }> = {
  pearl: { bg: "bg-pearl", text: "text-ink", muted: "text-ink/75", number: "text-mint", accent: "text-teal" },
  mint: { bg: "bg-mint", text: "text-ink", muted: "text-ink/75", number: "text-white/70", accent: "text-teal" },
  sand: { bg: "bg-sand", text: "text-ink", muted: "text-ink/75", number: "text-white/60", accent: "text-teal" },
  ink: { bg: "bg-ink on-dark", text: "text-pearl", muted: "text-pearl/75", number: "text-white/[0.07]", accent: "text-aqua" },
};

const pad = (n: number) => String(n).padStart(2, "0");

function StepPanel({ step, index, stacked, twin }: { step: VisitStep; index: number; stacked: boolean; twin: boolean }) {
  const tone = TONES[step.tone];
  return (
    <article
      aria-labelledby={`step-${step.id}`}
      className={`visit-panel ${stacked ? "absolute inset-0" : "relative min-h-[80svh]"} flex items-center overflow-hidden ${tone.bg} px-[var(--gutter)] py-24`}
    >
      {/* Giant step number: sharp and pre-blurred twins are cross-faded (no per-frame filter). */}
      <span
        aria-hidden
        className={`visit-number pointer-events-none absolute -right-[4vw] bottom-[-6vw] font-serif text-[clamp(14rem,42vw,36rem)] leading-none ${tone.number}`}
      >
        <span className="focus-sharp block">{pad(index + 1)}</span>
        {twin && (
          <span className="focus-soft absolute inset-0 block [filter:blur(18px)]">
            {pad(index + 1)}
          </span>
        )}
      </span>
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="visit-copy flex flex-col gap-5">
          <p className={`eyebrow ${tone.accent}`}>Step {pad(index + 1)}</p>
          <h3 id={`step-${step.id}`} className={`display ${tone.text}`}>
            {step.title}
          </h3>
          <p className={`max-w-md text-lg leading-relaxed ${tone.muted}`}>{step.body}</p>
        </div>
        <div className="relative mx-auto aspect-square w-[min(70vw,24rem)] overflow-hidden rounded-full max-md:w-[min(52vw,14rem)]">
          <Image src={step.image.src} alt={step.image.alt} fill sizes="(min-width: 768px) 384px, 52vw" className="object-cover" />
        </div>
      </div>
    </article>
  );
}

/** Pinned sequence: Book → Consult → Treatment Plan → Smile, each opening through an aperture. */
export function FirstVisit() {
  const { prefs } = useMotion();
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const stacked = prefs.ready && !prefs.reduced;
  const twin = stacked && canBlur(prefs.blur, true);

  useGSAP(
    () => {
      if (!prefs.ready || prefs.reduced) return;
      const panels = gsap.utils.toArray<HTMLElement>(".visit-panel");
      const number = (p: HTMLElement) => p.querySelector(".visit-number");
      const sharp = (p: HTMLElement) => p.querySelector(".focus-sharp");
      const soft = (p: HTMLElement) => p.querySelector(".focus-soft");

      // Unrevealed panels are hidden outright so the browser never rasterises them.
      gsap.set(panels.slice(1), { clipPath: "circle(0% at 50% 50%)", visibility: "hidden" });
      gsap.set(panels.map(number), { opacity: 0.35, scale: 1.08 });
      gsap.set(panels.map(sharp), { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: EASE.inOut },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: `+=${panels.length * 100}%`,
          scrub: true,
          pin: true,
          onUpdate: (self) => setActive(Math.min(panels.length - 1, Math.floor(self.progress * panels.length))),
        },
      });

      panels.forEach((panel, i) => {
        const at = i * 1.5;
        if (i > 0) {
          tl.set(panel, { visibility: "visible" }, at - 0.6).to(panel, { clipPath: "circle(75% at 50% 50%)", duration: 1 }, at - 0.6);
        }
        tl.to(number(panel), { opacity: 1, scale: 1, duration: 0.6 }, at)
          .to(sharp(panel), { opacity: 1, duration: 0.6 }, at)
          .to(soft(panel), { opacity: 0, duration: 0.6 }, at);
        if (i > 0) tl.from(panel.querySelector(".visit-copy"), { opacity: 0, y: 40, duration: 0.5 }, at - 0.2);
      });
      tl.to({}, { duration: 0.6 });
    },
    { scope: section, dependencies: [prefs.ready, prefs.reduced] },
  );

  return (
    <section ref={section} id="visit" tabIndex={-1} aria-labelledby="visit-title" className="relative outline-none">
      <h2 id="visit-title" className="sr-only">
        Your first visit
      </h2>
      <div className={stacked ? "relative h-svh min-h-[34rem] overflow-hidden" : ""}>
        {visitSteps.map((step, i) => (
          <StepPanel key={step.id} step={step} index={i} stacked={stacked} twin={twin} />
        ))}
        {stacked && (
          <ol className="absolute left-1/2 top-24 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-pearl/90 p-1.5 shadow-sm" aria-label="Your first visit, step progress">
            {visitSteps.map((step, i) => (
              <li
                key={step.id}
                aria-current={i === active ? "step" : undefined}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors duration-500 md:px-4 md:text-sm ${
                  i === active ? "bg-ink text-pearl" : "text-ink/80"
                }`}
              >
                {step.title}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
