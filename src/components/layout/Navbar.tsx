"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { navLinks, site } from "@/data/clinic";

const HIDE_AFTER = 140;

/** Frosted bar that hides on scroll down and returns on scroll up; Book Now always stays. */
export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { lockScroll } = useMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last;
        if (Math.abs(delta) > 4) setHidden(delta > 0 && y > HIDE_AFTER);
        setScrolled(y > 24);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const toggle = toggleRef.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      toggle?.focus({ preventScroll: true });
    };
  }, [open, lockScroll]);

  const barHidden = hidden && !open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-6xl items-center justify-between rounded-full px-5 py-2.5 pr-36 transition-[transform,opacity,background-color] duration-700 ease-[var(--ease-expo)] md:pr-40 ${
          scrolled || open ? "glass-live" : "bg-transparent"
        } ${barHidden ? "-translate-y-[140%] opacity-0" : ""}`}
      >
        <a href="#top" className="font-serif text-xl tracking-tight text-ink md:text-2xl" aria-label={`${site.name}, back to top`}>
          Ngiti<span className="text-teal">.</span>
        </a>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm text-ink/80">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          ref={toggleRef}
          type="button"
          className="relative z-50 text-sm font-medium text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Persistent CTA — never hides with the bar */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 mx-auto flex w-[calc(100%-1.5rem)] max-w-6xl justify-end">
      <a
        href="#book"
        data-cursor="book"
        className="gleam pointer-events-auto rounded-full bg-ink px-5 py-3 text-sm font-medium text-pearl shadow-[0_10px_30px_-12px_rgb(14_27_44/0.6)] transition-colors hover:bg-teal md:px-6"
      >
        Book Now
      </a>
      </div>

      <div
        ref={menuRef}
        id="mobile-menu"
        className={`glass-live fixed inset-0 z-40 flex flex-col justify-center px-8 transition-[clip-path,visibility] duration-700 ease-[var(--ease-expo)] md:hidden ${
          open ? "visible [clip-path:circle(150%_at_90%_2rem)]" : "invisible [clip-path:circle(0%_at_90%_2rem)]"
        }`}
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="font-serif text-5xl text-ink" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#book" className="font-serif text-5xl italic text-teal" onClick={() => setOpen(false)}>
                Book a visit
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
