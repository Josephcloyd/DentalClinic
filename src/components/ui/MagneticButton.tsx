"use client";

import { useRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { playGleam } from "@/lib/motion";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { strength?: number };

/** Button that leans toward the cursor and catches a gleam on hover. */
export function MagneticButton({ strength = 0.3, className = "", children, onPointerEnter, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  useMagnetic(ref, strength);
  return (
    <button
      ref={ref}
      data-cursor="book"
      className={`gleam ${className}`}
      onPointerEnter={(e) => {
        playGleam(e.currentTarget);
        onPointerEnter?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
