"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { ApertureSection } from "@/components/ui/ApertureSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { priceNote, services } from "@/data/clinic";
import type { ServiceId } from "@/data/clinic";
import { PRICE_TAB_EVENT } from "@/lib/events";
import { formatPeso } from "@/lib/format";
import { canBlur, gsap, playGleam, ScrollTrigger, useGSAP } from "@/lib/motion";

const isServiceId = (v: unknown): v is ServiceId => services.some((s) => s.id === v);

/** Rows fade from blurred to sharp in sequence, then the gleam passes once. */
function revealRows(panel: HTMLElement, blurTier: Parameters<typeof canBlur>[0], delay = 0): gsap.core.Tween {
  const blur = canBlur(blurTier);
  return gsap.fromTo(
    panel.querySelectorAll(".price-card"),
    { ...(blur ? { filter: "blur(6px)" } : {}), opacity: 0, y: 10 },
    {
      ...(blur ? { filter: "blur(0px)" } : {}),
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.06,
      delay,
      clearProps: "filter",
      onComplete: () => playGleam(panel),
    },
  );
}

export function PriceList() {
  const { prefs } = useMotion();
  const [tab, setTab] = useState<ServiceId>(services[0].id);
  const scope = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<ServiceId, HTMLButtonElement | null>>>({});
  const shownTab = useRef<ServiceId>(services[0].id);
  const current = services.find((s) => s.id === tab) ?? services[0];

  // Let service cards jump straight to their category.
  useEffect(() => {
    const onPick = (e: Event) => {
      const id = (e as CustomEvent<unknown>).detail;
      if (isServiceId(id)) setTab(id);
    };
    window.addEventListener(PRICE_TAB_EVENT, onPick);
    return () => window.removeEventListener(PRICE_TAB_EVENT, onPick);
  }, []);

  // First reveal when the panel scrolls into view.
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!prefs.ready || prefs.reduced || !panel) return;
      ScrollTrigger.create({ trigger: panel, start: "top 75%", once: true, onEnter: () => revealRows(panel, prefs.blur) });
      gsap.set(panel.querySelectorAll(".price-card"), { opacity: 0 });
    },
    { scope, dependencies: [prefs.ready, prefs.reduced] },
  );

  // Tab switch: a quick circular wipe opening from the selected tab.
  useGSAP(
    () => {
      if (shownTab.current === tab) return;
      shownTab.current = tab;
      const panel = panelRef.current;
      const btn = tabRefs.current[tab];
      if (!panel || !btn || !prefs.ready) return;
      if (prefs.reduced) {
        gsap.from(panel, { opacity: 0, duration: 0.3 });
        return;
      }
      const p = panel.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const at = `at ${b.left + b.width / 2 - p.left}px ${b.top + b.height / 2 - p.top}px`;
      gsap.fromTo(
        panel,
        { clipPath: `circle(0% ${at})` },
        { clipPath: `circle(150% ${at})`, duration: 0.75, ease: "expo.out", clearProps: "clipPath" },
      );
      revealRows(panel, prefs.blur, 0.1);
    },
    { scope, dependencies: [tab] },
  );

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = services.findIndex((s) => s.id === tab);
    const next =
      e.key === "ArrowRight" ? (i + 1) % services.length
      : e.key === "ArrowLeft" ? (i - 1 + services.length) % services.length
      : e.key === "Home" ? 0
      : e.key === "End" ? services.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    const id = services[next].id;
    setTab(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <ApertureSection
      id="prices"
      labelledBy="prices-title"
      className="overflow-hidden bg-pearl px-[var(--gutter)] py-28 md:py-40"
    >
      {/* Soft gradient field the glass sits on */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_15%_30%,var(--color-mint),transparent_70%),radial-gradient(45%_55%_at_85%_70%,var(--color-sand),transparent_70%),radial-gradient(30%_30%_at_70%_15%,rgb(63_184_175/0.25),transparent_70%)]"
      />
      <div ref={scope} className="relative mx-auto max-w-5xl">
        <SectionHeading
          id="prices-title"
          eyebrow="Price list"
          title={
            <>
              Clear fees, <em>no surprises.</em>
            </>
          }
          intro="Transparent starting prices for every treatment. Your dentist confirms the final plan with you before anything begins."
        />

        <div role="tablist" aria-label="Treatment categories" className="no-scrollbar -mx-4 mt-14 flex gap-2 overflow-x-auto px-4 pb-2">
          {services.map((s) => {
            const selected = s.id === tab;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabRefs.current[s.id] = el;
                }}
                id={`tab-${s.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls="price-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(s.id)}
                onKeyDown={onTabKey}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm transition-colors duration-300 ${
                  selected ? "bg-ink text-pearl" : "glass text-ink/80 hover:text-ink"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        <div
          ref={panelRef}
          id="price-panel"
          role="tabpanel"
          aria-labelledby={`tab-${current.id}`}
          tabIndex={0}
          className="glass gleam mt-6 rounded-[2rem] p-4 sm:p-6 md:p-10"
        >
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-serif text-3xl text-ink md:text-4xl">{current.name}</h3>
            <p className="text-sm text-ink/70">
              {current.prices.length} treatments · {current.tagline}
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {current.prices.map((p, i) => (
              <li
                key={p.name}
                className="price-card group flex min-h-40 flex-col justify-between gap-6 rounded-[1.5rem] border border-white/80 bg-white/70 p-5 shadow-[0_1px_0_rgb(255_255_255/0.9)_inset,0_18px_40px_-28px_rgb(14_27_44/0.35)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-expo)] hover:-translate-y-1 hover:shadow-[0_1px_0_rgb(255_255_255/0.9)_inset,0_28px_50px_-26px_rgb(14_27_44/0.4)] md:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[0.95rem] leading-snug text-ink md:text-base">{p.name}</p>
                  <span aria-hidden className="font-serif text-sm italic text-teal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="flex flex-col">
                  <span className="eyebrow text-[0.65rem] text-ink/60">{p.from ? "Starting at" : "Fixed fee"}</span>
                  <span className="sr-only">: </span>
                  <span className="font-serif text-3xl leading-none text-ink md:text-4xl">{formatPeso(p.price)}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink/75">{priceNote}</p>
      </div>
    </ApertureSection>
  );
}
