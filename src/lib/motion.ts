/**
 * Shared motion primitives for "The Mirror" system.
 * Every animated module imports gsap/ScrollTrigger from here so the plugin is
 * registered exactly once.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

export const EASE = {
  inOut: "power2.inOut",
  out: "expo.out",
  soft: "power3.out",
} as const;

/**
 * How much animated blur the device can afford.
 * - full:    desktop — blur on everything that frosts/racks focus
 * - limited: capable touch devices — blur only on key elements
 * - none:    low-power devices — opacity fades only
 */
export type BlurTier = "full" | "limited" | "none";

export interface MotionPrefs {
  readonly ready: boolean;
  readonly reduced: boolean;
  readonly touch: boolean;
  readonly lowPower: boolean;
  readonly blur: BlurTier;
}

export const SERVER_PREFS: MotionPrefs = {
  ready: false,
  reduced: false,
  touch: false,
  lowPower: false,
  blur: "full",
};

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export function detectMotionPrefs(): MotionPrefs {
  const nav = navigator as NavigatorHints;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const lowPower =
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true;
  const blur: BlurTier = lowPower ? "none" : touch ? "limited" : "full";
  return { ready: true, reduced, touch, lowPower, blur };
}

/** Whether an element of the given importance may animate a blur filter. */
export function canBlur(tier: BlurTier, key = false): boolean {
  return tier === "full" || (tier === "limited" && key);
}

export const CLEAR = { filter: "blur(0px) contrast(1) saturate(1)" } as const;

/** Starting state for the "frosted glass" look. */
export function frostedState(tier: BlurTier, key = false): gsap.TweenVars {
  if (!canBlur(tier, key)) return { opacity: 0, scale: 1.02 };
  const px = tier === "full" ? 16 : 10;
  return { filter: `blur(${px}px) contrast(0.85) saturate(0.5)`, opacity: 0.4, scale: 1.04 };
}

/** Restarts the one-shot light sweep defined by `.gleam` in globals.css. */
export function playGleam(el: Element | null): void {
  if (!el) return;
  el.classList.remove("is-gleaming");
  void (el as HTMLElement).offsetWidth; // restart the CSS animation
  el.classList.add("is-gleaming");
}

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
