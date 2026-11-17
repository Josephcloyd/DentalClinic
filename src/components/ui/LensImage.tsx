"use client";

import Image from "next/image";
import { useRef } from "react";
import { useLensParallax } from "@/hooks/useLensParallax";
import type { SiteImage } from "@/data/clinic";

type Props = {
  image: SiteImage;
  sizes: string;
  className?: string;
  strength?: number;
  mode?: "hover" | "window";
  priority?: boolean;
  /** Set on the frame so useFrostReveal can target it. */
  frost?: boolean;
};

/** A circular "mirror" frame whose reflection drifts opposite the cursor or tilt. */
export function LensImage({ image, sizes, className = "", strength, mode, priority = false, frost = false }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useLensParallax(frameRef, innerRef, { strength, mode });

  return (
    <div
      ref={frameRef}
      data-cursor="lens"
      data-frost={frost ? "" : undefined}
      className={`relative aspect-square overflow-hidden rounded-full bg-mint shadow-[0_30px_60px_-30px_rgb(14_27_44/0.35),inset_0_0_0_1px_rgb(255_255_255/0.6)] ${className}`}
    >
      <div ref={innerRef} className="absolute -inset-[9%]">
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
      {/* Soft specular highlight, like light on a mirror's rim */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(120%_80%_at_30%_10%,rgb(255_255_255/0.35),transparent_45%)]"
      />
    </div>
  );
}
