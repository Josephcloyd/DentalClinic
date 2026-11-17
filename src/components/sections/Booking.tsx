"use client";

import { useRef } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { contact } from "@/data/clinic";
import { gsap, useGSAP } from "@/lib/motion";
import { BookingForm } from "./BookingForm";

/** Finale: the page dims to navy and a bright circle opens on the form — the mirror turns to you. */
export function Booking() {
  const { prefs } = useMotion();
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!prefs.ready || prefs.reduced) return;
      gsap.fromTo(
        section.current,
        { backgroundColor: "#f8f7f4" },
        { backgroundColor: "#0e1b2c", ease: "none", scrollTrigger: { trigger: section.current, start: "top 90%", end: "top 30%", scrub: true } },
      );
      gsap
        .timeline({ scrollTrigger: { trigger: section.current, start: "top 55%", end: "top top", scrub: true } })
        .fromTo(".booking-halo", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, ease: "power2.out", duration: 1 }, 0)
        .fromTo(".booking-mirror", { clipPath: "circle(0% at 50% 30%)" }, { clipPath: "circle(120% at 50% 30%)", ease: "power2.inOut", duration: 1 }, 0.1)
        .from(".booking-aside", { opacity: 0, y: 20, duration: 0.4 }, 0.7);
    },
    { scope: section, dependencies: [prefs.ready, prefs.reduced] },
  );

  return (
    <section
      ref={section}
      id="book"
      tabIndex={-1}
      aria-labelledby="book-title"
      className="on-dark relative overflow-hidden bg-ink px-[var(--gutter)] pb-28 pt-32 outline-none md:pb-40 md:pt-40"
    >
      <div
        aria-hidden
        className="booking-halo pointer-events-none absolute left-1/2 top-[38%] h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(207_230_223/0.55),rgb(63_184_175/0.18)_45%,transparent_70%)]"
      />
      <div className="relative mx-auto max-w-3xl">
        <div className="booking-mirror rounded-[2.5rem] bg-pearl px-6 py-12 shadow-[0_0_0_1px_rgb(255_255_255/0.6),0_60px_120px_-40px_rgb(63_184_175/0.45)] md:rounded-[3rem] md:px-14 md:py-16">
          <header className="mb-10 flex flex-col items-center gap-4 text-center">
            <p className="eyebrow text-teal">Book a visit</p>
            <h2 id="book-title" className="display-sm text-ink">
              Your turn <em>in the mirror.</em>
            </h2>
            <p className="max-w-md text-ink/75">Send a request and we&rsquo;ll confirm your schedule by text — usually within the hour during clinic hours.</p>
          </header>
          <BookingForm />
        </div>

        <div className="booking-aside mt-10 flex flex-col items-center gap-4 text-center text-pearl/80">
          <p className="text-sm">Prefer to chat?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={contact.messenger} target="_blank" rel="noopener noreferrer" className="glass-dark rounded-full px-6 py-3 text-sm text-pearl transition-colors hover:bg-pearl hover:text-ink">
              Message us on Messenger
            </a>
            <a href={contact.viber} className="glass-dark rounded-full px-6 py-3 text-sm text-pearl transition-colors hover:bg-pearl hover:text-ink">
              Chat on Viber
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
