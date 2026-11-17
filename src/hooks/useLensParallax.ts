"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { gsap } from "@/lib/motion";
import { subscribeTilt } from "@/lib/tilt";

interface LensOptions {
  /** Max shift in px. */
  readonly strength?: number;
  /** "hover": follows the cursor over the frame. "window": follows the cursor anywhere. */
  readonly mode?: "hover" | "window";
}

/**
 * Mirror-reflection parallax: the image inside a circular frame drifts
 * opposite to the cursor (desktop) or device tilt (touch), only while in view.
 */
export function useLensParallax(
  frameRef: RefObject<HTMLElement | null>,
  innerRef: RefObject<HTMLElement | null>,
  { strength = 16, mode = "hover" }: LensOptions = {},
): void {
  const { prefs } = useMotion();

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!prefs.ready || prefs.reduced || !frame || !inner) return;

    const toX = gsap.quickTo(inner, "x", { duration: 0.9, ease: "power3.out" });
    const toY = gsap.quickTo(inner, "y", { duration: 0.9, ease: "power3.out" });
    const shift = (nx: number, ny: number) => {
      toX(-nx * strength);
      toY(-ny * strength);
    };
    let visible = false;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(frame);

    if (prefs.touch) {
      const unsubscribe = subscribeTilt((t) => visible && shift(t.x, t.y));
      return () => {
        io.disconnect();
        unsubscribe();
      };
    }

    const target: HTMLElement | Window = mode === "window" ? window : frame;
    const onMove = (e: Event) => {
      if (!visible) return;
      const { clientX, clientY } = e as PointerEvent;
      const r = mode === "window" ? { left: 0, top: 0, width: innerWidth, height: innerHeight } : frame.getBoundingClientRect();
      shift(((clientX - r.left) / r.width) * 2 - 1, ((clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => shift(0, 0);
    target.addEventListener("pointermove", onMove, { passive: true });
    if (mode === "hover") frame.addEventListener("pointerleave", onLeave);
    return () => {
      io.disconnect();
      target.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
      gsap.set(inner, { x: 0, y: 0 });
    };
  }, [frameRef, innerRef, prefs.ready, prefs.reduced, prefs.touch, strength, mode]);
}
