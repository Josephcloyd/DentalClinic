"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { promises, visitSteps } from "@/data/clinic";
import { canBlur, gsap, useGSAP } from "@/lib/motion";

/** Pre-blurred by the image CDN so no CSS filter runs on a full-screen layer. */
const BACKDROP = `${visitSteps[0].image.src}?blur=200`;
const HOLD = 0.6;

/**
 * Focus-pull storytelling: three statements share one spot. Only one is sharp;
 * scrolling racks focus from one to the next while the others sit blurred.
 *
 * Performance: each line is rendered twice — sharp, and with a *static* blur —
 * and the two are cross-faded. Opacity and transform stay on the compositor,
 * so nothing re-renders a blur filter on every scroll frame.
 */
export function OurPromise() {
  const { prefs } = useMotion();
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!prefs.ready || prefs.reduced) return;
      const items = gsap.utils.toArray<HTMLElement>(".promise-line");
      const sharp = (el: HTMLElement) => el.querySelector(".focus-sharp");
      const soft = (el: HTMLElement) => el.querySelector(".focus-soft");

      gsap.set(items, { opacity: 0.14, scale: 0.94, yPercent: 8 });
      gsap.set(items.map(sharp), { opacity: 0 });
      gsap.set(items[0], { opacity: 1, scale: 1, yPercent: 0 });
      gsap.set([sharp(items[0])], { opacity: 1 });
      gsap.set([soft(items[0])], { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut", duration: 1 },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: `+=${items.length * 90}%`,
          scrub: true,
          pin: true,
          onUpdate: (self) => setActive(Math.min(items.length - 1, Math.round(self.progress * (items.length - 1)))),
        },
      });

      items.slice(0, -1).forEach((item, i) => {
        const at = i * (1 + HOLD) + HOLD;
        const next = items[i + 1];
        tl.to(item, { opacity: 0.1, scale: 1.08, yPercent: -10 }, at)
          .to(sharp(item), { opacity: 0, duration: 0.5 }, at)
          .to(soft(item), { opacity: 1, duration: 0.5 }, at)
          .to(next, { opacity: 1, scale: 1, yPercent: 0 }, at)
          .to(soft(next), { opacity: 0, duration: 0.6 }, at + 0.3)
          .to(sharp(next), { opacity: 1, duration: 0.6 }, at + 0.3);
      });
      tl.to({}, { duration: HOLD });
    },
    { scope: section, dependencies: [prefs.ready, prefs.reduced] },
  );

  const stacked = prefs.ready && !prefs.reduced;
  const twin = stacked && canBlur(prefs.blur, true);

  return (
    <section
      ref={section}
      id="promise"
      aria-labelledby="promise-title"
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-mist"
    >
      {/* Depth of field: a soft, out-of-focus scene behind the sharp words */}
      <div aria-hidden className="absolute inset-0 opacity-40">
        <Image src={BACKDROP} alt="" fill sizes="20vw" quality={40} className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-mist via-mist/60 to-mist" />
      </div>

      <h2 id="promise-title" className="eyebrow absolute top-28 text-teal">
        Our promise
      </h2>

      <div className={stacked ? "relative grid w-full place-items-center px-4" : "relative flex flex-col items-center gap-10 py-40"}>
        {promises.map((line, i) => (
          <p
            key={line}
            lang={i === 2 ? "fil" : undefined}
            className={`promise-line display relative px-4 text-center text-ink max-sm:text-[13vw] ${stacked ? "[grid-area:1/1]" : ""} ${i === 2 ? "italic text-teal" : ""}`}
          >
            <span className="focus-sharp block">{line}</span>
            {twin && (
              <span aria-hidden className="focus-soft absolute inset-0 block [filter:blur(14px)]">
                {line}
              </span>
            )}
          </p>
        ))}
      </div>

      {stacked && (
        <ol aria-hidden className="absolute bottom-12 flex gap-3">
          {promises.map((line, i) => (
            <li
              key={line}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-10 bg-teal" : "w-3 bg-ink/20"}`}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
