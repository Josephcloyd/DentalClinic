"use client";

import Image from "next/image";
import { useRef } from "react";
import type { RefObject } from "react";
import type { Service } from "@/data/clinic";
import { formatPeso } from "@/lib/format";
import { clamp } from "@/lib/motion";

import { PRICE_TAB_EVENT } from "@/lib/events";

const CARD_MAX_WIDTH = 352;

type Props = {
  service: Service;
  open: boolean;
  gridRef: RefObject<HTMLUListElement | null>;
  onOpen: () => void;
  onClose: () => void;
};

/**
 * Places the (still closed) card around its lens, clamped inside the grid,
 * and sets the clip-path origin to the lens so it opens out of the mirror.
 */
function positionCard(card: HTMLElement, item: HTMLElement, lens: HTMLElement, grid: HTMLElement): void {
  const g = grid.getBoundingClientRect();
  const it = item.getBoundingClientRect();
  const l = lens.getBoundingClientRect();
  const width = Math.min(CARD_MAX_WIDTH, g.width);
  const lensCx = l.left + l.width / 2;
  const left = clamp(lensCx - width / 2, g.left, g.right - width);
  const top = l.top - 16;
  card.style.width = `${width}px`;
  card.style.left = `${left - it.left}px`;
  card.style.top = `${top - it.top}px`;
  card.style.setProperty("--cx", `${lensCx - left}px`);
  card.style.setProperty("--cy", `${l.top + l.height / 2 - top}px`);
  card.style.setProperty("--r0", `${l.width / 2}px`);
  void card.offsetWidth; // commit the closed state before opening so the transition starts at the lens
}

export function ServiceLens({ service, open, gridRef, onOpen, onClose }: Props) {
  const itemRef = useRef<HTMLLIElement>(null);
  const lensRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef<string>("");
  const cardId = `service-card-${service.id}`;

  const openCard = () => {
    const [card, item, lens, grid] = [cardRef.current, itemRef.current, lensRef.current, gridRef.current];
    if (!card || !item || !lens || !grid) return;
    positionCard(card, item, lens, grid);
    onOpen();
  };

  const close = (returnFocus: boolean) => {
    onClose();
    if (returnFocus) lensRef.current?.focus();
  };

  return (
    <li
      ref={itemRef}
      data-open={open ? "" : undefined}
      className={`lens-item relative flex justify-center ${open ? "z-20" : "z-0"}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && openCard()}
      onPointerLeave={(e) => e.pointerType === "mouse" && close(false)}
      onKeyDown={(e) => e.key === "Escape" && open && close(true)}
      onBlur={(e) => {
        if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) close(false);
      }}
    >
      <button
        ref={lensRef}
        type="button"
        aria-expanded={open}
        aria-controls={cardId}
        className="lens-face group flex w-full max-w-[15rem] flex-col items-center gap-5 text-center"
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onClick={() => {
          // Mouse users already opened it on hover; taps and keyboard toggle.
          if (lastPointer.current === "mouse" && open) return;
          lastPointer.current = "";
          if (open) close(false);
          else openCard();
        }}
      >
        <span
          data-cursor="lens"
          className="lens-orb relative block aspect-square w-full overflow-hidden rounded-full bg-mint shadow-[0_30px_60px_-30px_rgb(14_27_44/0.4),inset_0_0_0_1px_rgb(255_255_255/0.7)]"
        >
          <Image
            src={service.image.src}
            alt=""
            fill
            sizes="(min-width: 768px) 240px, 45vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-105"
          />
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(120%_80%_at_30%_10%,rgb(255_255_255/0.4),transparent_45%)]" />
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-serif text-2xl leading-tight text-ink md:text-3xl">{service.name}</span>
          <span className="text-sm text-ink/70">{service.tagline}</span>
        </span>
      </button>

      <div
        ref={cardRef}
        id={cardId}
        role="region"
        aria-label={`${service.name} details`}
        data-open={open ? "" : undefined}
        className="service-card glass absolute left-0 top-0 overflow-hidden rounded-[2rem] text-left"
      >
        <div className="relative h-40 w-full">
          <Image src={service.image.src} alt={service.image.alt} fill sizes="352px" className="object-cover" />
        </div>
        <div className="flex flex-col gap-3 p-6">
          <h3 className="font-serif text-3xl leading-none text-ink">{service.name}</h3>
          <p className="text-[0.95rem] leading-relaxed text-ink/80">{service.description}</p>
          <p className="mt-1 text-sm text-ink/70">
            <span className="font-serif text-2xl text-ink">from {formatPeso(service.startingPrice)}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <a
              href="#prices"
              className="rounded-full border border-ink/20 px-4 py-2 text-ink transition-colors hover:border-ink"
              onClick={() => window.dispatchEvent(new CustomEvent(PRICE_TAB_EVENT, { detail: service.id }))}
            >
              See prices
            </a>
            <a href="#book" data-cursor="book" className="rounded-full bg-ink px-4 py-2 text-pearl transition-colors hover:bg-teal">
              Book
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}
