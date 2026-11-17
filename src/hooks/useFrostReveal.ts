"use client";

import type { RefObject } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { CLEAR, EASE, frostedState, gsap, useGSAP } from "@/lib/motion";

interface FrostOptions {
  /** Children of the scope to reveal. Default: `[data-frost]`. */
  readonly selector?: string;
  readonly stagger?: number;
  readonly start?: string;
  /** Key elements keep their blur on capable touch devices. */
  readonly key?: boolean;
  readonly duration?: number;
}

/**
 * "Frosted to clear": targets start fogged (blur + low contrast + desaturated)
 * and polish into focus once as the scope enters the viewport.
 */
export function useFrostReveal(scope: RefObject<HTMLElement | null>, opts: FrostOptions = {}): void {
  const { prefs } = useMotion();
  const { selector = "[data-frost]", stagger = 0.12, start = "top 80%", key = false, duration = 1.4 } = opts;

  useGSAP(
    () => {
      const root = scope.current;
      if (!prefs.ready || !root) return;
      const targets = gsap.utils.toArray<HTMLElement>(selector, root);
      if (targets.length === 0) return;
      const trigger = { trigger: root, start, once: true };

      if (prefs.reduced) {
        gsap.from(targets, { opacity: 0, duration: 0.6, stagger: 0.05, scrollTrigger: trigger });
        return;
      }

      const from = frostedState(prefs.blur, key);
      const blurring = "filter" in from;
      gsap.fromTo(
        targets,
        { ...from, willChange: blurring ? "filter, opacity, transform" : "opacity, transform" },
        {
          ...(blurring ? CLEAR : {}),
          opacity: 1,
          scale: 1,
          duration,
          ease: EASE.out,
          stagger,
          clearProps: "filter,willChange",
          scrollTrigger: trigger,
        },
      );
    },
    { scope, dependencies: [prefs.ready, prefs.reduced, prefs.blur] },
  );
}
