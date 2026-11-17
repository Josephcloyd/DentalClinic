"use client";

import { useRef } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { testimonials } from "@/data/clinic";
import { canBlur, gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

const SWIPE_PX = 50;
const COUNT = testimonials.length;

/** Pose of card `i` when the focus position is `t` (0..COUNT-1). Pure, so SSR matches. */
function cardPose(i: number, t: number) {
  const d = i - t;
  const ad = Math.min(Math.abs(d), 2.2);
  return {
    xPercent: d * 58,
    yPercent: ad * 4,
    scale: 1 - ad * 0.12,
    opacity: Math.max(0, 1 - ad * 0.38),
    zIndex: 100 - Math.round(ad * 10),
    /** 0 = sharp, 1 = fully soft; drives the sharp/soft twin cross-fade. */
    softness: Math.min(ad, 1),
  };
}

const ssrStyle = (i: number): CSSProperties => {
  const p = cardPose(i, 0);
  return {
    transform: `translate(-50%, -50%) translate(${p.xPercent}%, ${p.yPercent}%) scale(${p.scale})`,
    opacity: p.opacity,
    zIndex: p.zIndex,
  };
};

/** Glass cards at different depths; the centred card is sharp. Scroll, swipe or use the buttons. */
export function Testimonials() {
  const { prefs, scrollTo } = useMotion();
  const section = useRef<HTMLElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const focus = useRef(0);
  const swipeStart = useRef<number | null>(null);
  const stacked = !prefs.reduced;
  const twin = prefs.ready && stacked && canBlur(prefs.blur);

  useGSAP(
    () => {
      if (!prefs.ready || prefs.reduced) return;
      const cards = gsap.utils.toArray<HTMLElement>(".quote-card");
      // Depth of field without per-frame filters: each card holds a sharp and a pre-blurred
      // copy of its content, and only their opacities change while scrolling.
      const pose = (t: number) =>
        cards.forEach((card, i) => {
          const { softness, ...p } = cardPose(i, t);
          // -50% centres the card on the stage; the pose offset is added on top.
          gsap.set(card, { ...p, xPercent: p.xPercent - 50, yPercent: p.yPercent - 50 });
          gsap.set(card.querySelector(".focus-sharp"), { opacity: 1 - softness });
          gsap.set(card.querySelector(".focus-soft"), { opacity: softness });
        });
      cards.forEach((c) => (c.style.transform = ""));
      pose(0);
      trigger.current = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: `+=${COUNT * 55}%`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          focus.current = self.progress * (COUNT - 1);
          pose(focus.current);
        },
      });
      return () => {
        trigger.current = null;
      };
    },
    { scope: section, dependencies: [prefs.ready, prefs.reduced, prefs.blur] },
  );

  const goTo = (index: number) => {
    const st = trigger.current;
    if (!st) return;
    const i = Math.max(0, Math.min(COUNT - 1, index));
    scrollTo(st.start + ((st.end - st.start) * i) / (COUNT - 1), 0);
  };
  const step = (dir: 1 | -1) => goTo(Math.round(focus.current) + dir);

  const onDown = (e: PointerEvent) => {
    swipeStart.current = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > SWIPE_PX) step(dx < 0 ? 1 : -1);
  };

  return (
    <section
      ref={section}
      id="testimonials"
      aria-labelledby="testimonials-title"
      className={`relative overflow-hidden bg-[radial-gradient(70%_60%_at_50%_45%,#ffffff,var(--color-mist)_60%,var(--color-mint))] ${stacked ? "h-svh min-h-[36rem]" : "px-[var(--gutter)] py-28"}`}
    >
      <h2 id="testimonials-title" className={`eyebrow text-center text-teal ${stacked ? "absolute inset-x-0 top-28" : "mb-12"}`}>
        Kind words from patients
      </h2>

      <ul
        className={stacked ? "absolute inset-0 touch-pan-y" : "mx-auto grid max-w-5xl gap-6 md:grid-cols-2"}
        onPointerDown={onDown}
        onPointerUp={onUp}
      >
        {testimonials.map((t, i) => (
          <li
            key={t.author}
            className={`quote-card glass rounded-[2rem] p-8 md:p-12 ${stacked ? "absolute left-1/2 top-1/2 w-[min(34rem,82vw)]" : ""}`}
            style={stacked ? ssrStyle(i) : undefined}
          >
            <figure className="focus-sharp flex flex-col gap-8">
              <blockquote lang={t.lang ?? "en"} className="font-serif text-3xl leading-[1.15] text-ink md:text-4xl">
                “{t.quote}”
              </blockquote>
              <figcaption className="text-sm text-ink/75">
                <span className="font-medium text-ink">{t.author}</span> · {t.location}
              </figcaption>
            </figure>
            {twin && (
              <div aria-hidden className="focus-soft pointer-events-none absolute inset-0 flex flex-col gap-8 p-8 opacity-0 [filter:blur(5px)] md:p-12">
                <p className="font-serif text-3xl leading-[1.15] text-ink md:text-4xl">“{t.quote}”</p>
                <p className="text-sm text-ink/75">
                  <span className="font-medium text-ink">{t.author}</span> · {t.location}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>

      {stacked && (
        <div className="absolute inset-x-0 bottom-12 flex justify-center gap-3">
          <button type="button" onClick={() => step(-1)} className="glass rounded-full px-5 py-2.5 text-sm text-ink" aria-label="Previous testimonial">
            ← Prev
          </button>
          <button type="button" onClick={() => step(1)} className="glass rounded-full px-5 py-2.5 text-sm text-ink" aria-label="Next testimonial">
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
