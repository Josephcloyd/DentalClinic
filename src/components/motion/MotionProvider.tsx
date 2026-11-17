"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";
import { detectMotionPrefs, gsap, ScrollTrigger, SERVER_PREFS } from "@/lib/motion";
import type { MotionPrefs } from "@/lib/motion";
import { requestTiltPermission } from "@/lib/tilt";

interface MotionContextValue {
  readonly prefs: MotionPrefs;
  /** True once the preloader has cleared (or immediately with reduced motion). */
  readonly introDone: boolean;
  readonly completeIntro: () => void;
  readonly scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
  /** Freezes page scroll (e.g. behind the mobile menu). */
  readonly lockScroll: (locked: boolean) => void;
}

const MotionContext = createContext<MotionContextValue | null>(null);

const NAV_OFFSET = -72;

export function useMotion(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotion must be used inside <MotionProvider>");
  return ctx;
}

function useLenis(prefs: MotionPrefs, introDone: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!prefs.ready || prefs.reduced) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefs.ready, prefs.reduced]);

  // Hold the page still while the preloader plays.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (introDone) lenis.start();
    else lenis.stop();
  }, [introDone, prefs.ready]);

  return lenisRef;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<MotionPrefs>(SERVER_PREFS);
  const [introDone, setIntroDone] = useState(false);
  const lenisRef = useLenis(prefs, introDone);

  useEffect(() => {
    const update = () => setPrefs(detectMotionPrefs());
    update();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!prefs.ready) return;
    const root = document.documentElement;
    root.dataset.blur = prefs.blur;
    root.dataset.motion = prefs.reduced ? "reduced" : "full";
    if (prefs.reduced) setIntroDone(true);
  }, [prefs]);

  // Re-measure every trigger once webfonts settle (avoids pin offsets drifting).
  useEffect(() => {
    if (!prefs.ready) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [prefs.ready]);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, offset = NAV_OFFSET) => {
      const lenis = lenisRef.current;
      // A pinned section sits inside a pin-spacer whose position is the true scroll target.
      const resolved =
        target instanceof HTMLElement && target.parentElement?.classList.contains("pin-spacer") ? target.parentElement : target;
      if (lenis) {
        lenis.scrollTo(resolved, { offset, duration: 1.4 });
        return;
      }
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      if (typeof el === "number") window.scrollTo({ top: el });
      else el?.scrollIntoView({ block: "start" });
    },
    [lenisRef],
  );

  // Route same-page anchor links through Lenis so they glide instead of jump.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href");
      if (!link || !hash || hash === "#") return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      e.preventDefault();
      scrollTo(target);
      history.replaceState(null, "", hash);
      target.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  // iOS only delivers device tilt (the touch stand-in for cursor parallax) after a user gesture.
  useEffect(() => {
    if (!prefs.ready || !prefs.touch || prefs.reduced) return;
    const ask = () => void requestTiltPermission();
    window.addEventListener("pointerup", ask, { once: true });
    return () => window.removeEventListener("pointerup", ask);
  }, [prefs.ready, prefs.touch, prefs.reduced]);

  const completeIntro = useCallback(() => setIntroDone(true), []);

  const lockScroll = useCallback(
    (locked: boolean) => {
      const lenis = lenisRef.current;
      if (lenis) {
        if (locked) lenis.stop();
        else lenis.start();
      }
      document.documentElement.style.overflow = locked ? "hidden" : "";
    },
    [lenisRef],
  );

  const value = useMemo(
    () => ({ prefs, introDone, completeIntro, scrollTo, lockScroll }),
    [prefs, introDone, completeIntro, scrollTo, lockScroll],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
