"use client";

import type { RefObject } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { clamp, gsap, lerp, ScrollTrigger, useGSAP } from "@/lib/motion";

const easeIn = gsap.parseEase("power2.in");

/**
 * Aperture transition: as a section scrolls in, it is revealed through a
 * circle centred on the viewport that widens until it fills the screen —
 * like looking through a dental mirror that opens into a new scene.
 *
 * Geometry comes from the trigger's own numbers, so no layout is forced per frame.
 */
export function useAperture(ref: RefObject<HTMLElement | null>, startRadius = 0.09): void {
  const { prefs } = useMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!prefs.ready || prefs.reduced || !el) return;

      const apply = (self: ScrollTrigger) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // start = "top bottom" ⇒ the section's top sits at vh when scroll == self.start.
        const top = self.start + vh - self.scroll();
        const r0 = Math.min(vw, vh) * startRadius;
        const r1 = Math.hypot(vw, vh) / 2 + 8;
        // The lens rides just inside the section's top edge until it reaches mid-screen, then opens.
        const cy = Math.max(vh / 2 - top, r0 + 24);
        const open = easeIn(clamp((self.progress - 0.4) / 0.6, 0, 1));
        el.style.clipPath = `circle(${lerp(r0, r1, open).toFixed(1)}px at 50% ${cy.toFixed(1)}px)`;
      };
      const clear = () => {
        el.style.clipPath = "none";
      };

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "top 15%", // fully open by the time the section settles under the navbar
        onUpdate: apply,
        onLeave: clear,
        onEnterBack: apply,
        onRefresh: (self) => (self.progress >= 1 ? clear() : apply(self)),
      });

      return () => {
        st.kill();
        el.style.clipPath = "";
      };
    },
    { dependencies: [prefs.ready, prefs.reduced, startRadius] },
  );
}
