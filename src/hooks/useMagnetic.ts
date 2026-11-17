"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { gsap } from "@/lib/motion";

/** Pulls an element gently toward the cursor while hovered (fine pointers only). */
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.3): void {
  const { prefs } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!prefs.ready || prefs.reduced || prefs.touch || !el) return;
    const toX = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      toX((e.clientX - (r.left + r.width / 2)) * strength);
      toY((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      toX(0);
      toY(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [ref, prefs.ready, prefs.reduced, prefs.touch, strength]);
}
