"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { gsap } from "@/lib/motion";

type Mode = "default" | "lens" | "book";

const SIZE: Record<Mode, number> = { default: 18, lens: 84, book: 72 };

/** Small glass circle that becomes a lens over images and reads "Book" over CTAs. */
export function Cursor() {
  const { prefs } = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("default");
  const enabled = prefs.ready && !prefs.reduced && !prefs.touch;

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    document.documentElement.classList.add("has-cursor");
    const toX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      toX(e.clientX);
      toY(e.clientY);
      el.style.opacity = "1";
    };
    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      const value = target?.dataset.cursor;
      setMode(value === "lens" || value === "book" ? value : "default");
    };
    const onLeaveWindow = () => {
      el.style.opacity = "0";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
    };
  }, [enabled]);

  if (!enabled) return null;
  const size = SIZE[mode];
  const skin =
    mode === "book"
      ? "bg-aqua/90 border-aqua text-ink"
      : mode === "lens"
        ? "bg-white/10 border-white/80"
        : "bg-white/35 border-ink/25";

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] opacity-0">
      <div
        className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[0.7rem] font-medium uppercase tracking-[0.18em] shadow-[0_8px_30px_-10px_rgb(14_27_44/0.4)] transition-[width,height,background-color,border-color] duration-500 ease-[var(--ease-expo)] ${skin}`}
        style={{ width: size, height: size }}
      >
        {mode === "book" ? "Book" : null}
      </div>
    </div>
  );
}
