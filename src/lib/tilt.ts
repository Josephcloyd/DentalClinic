/**
 * One shared deviceorientation listener that broadcasts a normalised tilt
 * (-1..1 on each axis) to subscribers. Used as the touch equivalent of
 * cursor-driven lens parallax.
 */
export interface Tilt {
  readonly x: number;
  readonly y: number;
}

type Listener = (tilt: Tilt) => void;

const listeners = new Set<Listener>();
let attached = false;
let baseline: { beta: number; gamma: number } | null = null;

const MAX_DEG = 25;
const norm = (deg: number) => Math.max(-1, Math.min(1, deg / MAX_DEG));

function onOrientation(e: DeviceOrientationEvent): void {
  if (e.beta == null || e.gamma == null) return;
  baseline ??= { beta: e.beta, gamma: e.gamma };
  const tilt: Tilt = { x: norm(e.gamma - baseline.gamma), y: norm(e.beta - baseline.beta) };
  listeners.forEach((fn) => fn(tilt));
}

function attach(): void {
  if (attached || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
  attached = true;
  window.addEventListener("deviceorientation", onOrientation, { passive: true });
}

interface PermissionCapable {
  requestPermission?: () => Promise<"granted" | "denied">;
}

/** iOS requires a user gesture before orientation events are delivered. */
export async function requestTiltPermission(): Promise<boolean> {
  const ctor = (typeof window !== "undefined" ? window.DeviceOrientationEvent : undefined) as
    | PermissionCapable
    | undefined;
  if (!ctor?.requestPermission) return true;
  try {
    return (await ctor.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

export function subscribeTilt(fn: Listener): () => void {
  attach();
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
