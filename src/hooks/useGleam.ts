"use client";

import type { RefObject } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { gsap, playGleam, ScrollTrigger, useGSAP } from "@/lib/motion";

/**
 * Passes one diagonal light sweep across each `.gleam` target the first time
 * it is fully in view — like light catching a polished surface.
 */
export function useGleam(scope: RefObject<HTMLElement | null>, selector = ".gleam"): void {
  const { prefs } = useMotion();

  useGSAP(
    () => {
      const root = scope.current;
      if (!prefs.ready || prefs.reduced || !root) return;
      gsap.utils.toArray<HTMLElement>(selector, root).forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "bottom 90%",
          once: true,
          onEnter: () => gsap.delayedCall(0.5, () => playGleam(el)),
        });
      });
    },
    { scope, dependencies: [prefs.ready, prefs.reduced] },
  );
}
