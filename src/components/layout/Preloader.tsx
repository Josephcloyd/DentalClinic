"use client";

import { useRef, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { gsap, useGSAP } from "@/lib/motion";

/**
 * 1.5s intro: a fogged white screen clears from the centre outward to reveal
 * the wordmark, then lifts away to reveal the hero. Hidden entirely with
 * reduced motion (CSS) and self-dismisses via CSS if scripts never run.
 */
export function Preloader() {
  const { prefs, completeIntro } = useMotion();
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!prefs.ready) return;
      if (prefs.reduced) {
        setGone(true);
        return;
      }
      gsap
        .timeline({ defaults: { ease: "power2.inOut" }, onComplete: () => setGone(true) })
        .to(".preloader-fog", { "--hole": "75%", duration: 0.9 }, 0.1)
        .fromTo(
          ".preloader-mark",
          { filter: "blur(14px)", opacity: 0.2, scale: 0.97 },
          { filter: "blur(0px)", opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" },
          0.25,
        )
        .add(completeIntro, 1.05)
        .to(root.current, { clipPath: "circle(0% at 50% 50%)", duration: 0.5, ease: "power2.in" }, 1.0)
        .to(".preloader-mark", { scale: 1.06, opacity: 0, duration: 0.4 }, 1.0);
    },
    { scope: root, dependencies: [prefs.ready, prefs.reduced] },
  );

  if (gone) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="preloader fixed inset-0 z-[100] grid place-items-center bg-pearl [clip-path:circle(150%_at_50%_50%)]"
    >
      <p className="preloader-mark font-serif text-5xl tracking-tight text-ink md:text-7xl">
        Ngiti <span className="italic text-teal">Dental Studio</span>
      </p>
      <div className="preloader-fog absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ffffff,#f1f0ec)]" />
    </div>
  );
}
