"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { hero, stats } from "@/data/clinic";
import { useLensParallax } from "@/hooks/useLensParallax";
import { groupThousands } from "@/lib/format";
import { canBlur, gsap, useGSAP } from "@/lib/motion";

const TRUST = stats.filter((s) => s.label !== "years of practice");

/** Plays an optional hero clip inside the mirror, only while visible and only when motion is welcome. */
function useHeroVideo(sectionRef: RefObject<HTMLElement | null>) {
  const { prefs, introDone } = useMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const showVideo = hero.videoSources.length > 0 && introDone && prefs.ready && !prefs.reduced && !prefs.lowPower;

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!showVideo || !video || !section) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => setPlaying(false));
      else video.pause();
    });
    io.observe(section);
    return () => io.disconnect();
  }, [showVideo, sectionRef]);

  return { videoRef, showVideo, playing, setPlaying };
}

/** Translation + scale that grows the mirror from its resting place until it covers the viewport. */
function fillViewport(section: HTMLElement, cell: HTMLElement, mirror: HTMLElement) {
  const s = section.getBoundingClientRect();
  const c = cell.getBoundingClientRect();
  return {
    x: innerWidth / 2 - (c.left - s.left + c.width / 2),
    y: innerHeight / 2 - (c.top - s.top + c.height / 2),
    scale: Math.hypot(innerWidth, innerHeight) / mirror.offsetWidth + 0.04,
  };
}

export function Hero() {
  const { prefs, introDone } = useMotion();
  const section = useRef<HTMLElement>(null);
  const cell = useRef<HTMLDivElement>(null);
  const mirror = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const { videoRef, showVideo, playing, setPlaying } = useHeroVideo(section);
  useLensParallax(lens, media, { mode: "window", strength: 18 });

  // Scroll: the mirror widens to fill the screen while the copy racks out of focus.
  useGSAP(
    () => {
      if (!prefs.ready || prefs.reduced || !section.current || !cell.current || !mirror.current) return;
      const [sec, c, m] = [section.current, cell.current, mirror.current];
      // Keep one raster while the mirror scales up to the viewport instead of re-rasterising per frame.
      gsap.set(m, { willChange: "transform" });
      gsap
        .timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: sec, start: "top top", end: "+=140%", scrub: true, pin: true, invalidateOnRefresh: true },
        })
        .to(".hero-ornament", { opacity: 0, scale: 0.9, duration: 0.2 }, 0)
        .to(".hero-copy", { opacity: 0, y: -50, duration: 0.4, ease: "power1.in" }, 0)
        .fromTo(
          m,
          { x: 0, y: 0, scale: 1 },
          {
            x: () => fillViewport(sec, c, m).x,
            y: () => fillViewport(sec, c, m).y,
            scale: () => fillViewport(sec, c, m).scale,
            duration: 1,
          },
          0.05,
        )
        .to(".hero-shade", { opacity: 1, duration: 0.3 }, 0.7)
        .fromTo(".hero-caption", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.78);
    },
    { scope: section, dependencies: [prefs.ready, prefs.reduced] },
  );

  // Intro: once the preloader clears, the mirror polishes from fogged to clear and the headline sharpens.
  useGSAP(
    () => {
      if (!introDone) return;
      if (prefs.reduced) {
        gsap.from(".hero-line, .hero-meta, .hero-mirror", { opacity: 0, duration: 0.8, stagger: 0.08 });
        return;
      }
      const blur = canBlur(prefs.blur, true);
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero-mirror", { scale: 0.86, opacity: 0, duration: 1.6 }, 0)
        .from(".hero-media", { ...(blur ? { filter: "blur(16px) saturate(0.5)" } : {}), scale: 1.2, duration: 2, clearProps: "filter" }, 0)
        .from(".hero-line", { ...(blur ? { filter: "blur(16px)" } : {}), opacity: 0, y: 40, duration: 1.5, stagger: 0.1, clearProps: "filter" }, 0.1)
        .from(".hero-meta", { opacity: 0, y: 16, duration: 1.1, stagger: 0.08 }, 0.45)
        .from(".hero-ornament", { opacity: 0, scale: 0.8, duration: 1.2, stagger: 0.12 }, 0.6);
    },
    { scope: section, dependencies: [introDone] },
  );

  return (
    <section ref={section} id="top" tabIndex={-1} aria-labelledby="hero-title" className="relative h-svh min-h-[40rem] overflow-hidden bg-pearl outline-none">
      {/* Atmosphere: soft mint and sand light pooling behind the mirror */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(45%_55%_at_76%_48%,rgb(207_230_223/0.9),transparent_70%),radial-gradient(35%_40%_at_8%_95%,rgb(228_217_200/0.7),transparent_70%)]"
      />

      <div className="relative mx-auto grid h-full max-w-7xl grid-rows-[auto_1fr] gap-6 px-[var(--gutter)] pb-8 pt-24 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:pb-12 lg:pt-28">
        <div className="hero-copy relative z-10 flex flex-col gap-5 lg:col-span-6 lg:gap-7">
          <p className="hero-meta eyebrow text-teal">{hero.label}</p>
          <h1 id="hero-title" className="display text-ink [font-size:min(var(--display),13svh)]">
            <span className="hero-line block">A smile,</span>
            <span className="hero-line block">perfectly</span>
            <span className="hero-line block italic text-teal">in focus.</span>
          </h1>
          <p className="hero-meta max-w-md text-base leading-relaxed text-ink/75 max-sm:hidden md:text-lg">{hero.intro}</p>
          <div className="hero-meta flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="#book"
              data-cursor="book"
              className="gleam rounded-full bg-ink px-7 py-4 text-sm font-medium text-pearl shadow-[0_14px_30px_-14px_rgb(14_27_44/0.7)] transition-colors hover:bg-teal"
            >
              Book a visit
            </a>
            <a href="#prices" className="group flex items-center gap-2 text-sm font-medium text-ink">
              <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-ink">View prices</span>
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
          <ul className="hero-meta mt-2 hidden max-w-lg gap-8 border-t border-ink/10 pt-6 sm:flex [@media(max-height:780px)]:!hidden">
            {TRUST.map((s) => (
              <li key={s.label} className="flex flex-col gap-1">
                <span className="font-serif text-3xl leading-none text-ink">
                  {groupThousands(s.value, s.decimals ?? 0)}
                  {s.suffix}
                </span>
                <span className="text-xs text-ink/70">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div ref={cell} className="relative grid place-items-center lg:col-span-6">
          <div ref={mirror} className="hero-mirror relative aspect-square w-[min(72vw,36svh)] lg:w-[min(38vw,66svh)]">
            {/* Mirror rim */}
            <span aria-hidden className="hero-ornament pointer-events-none absolute -inset-4 rounded-full border border-ink/10 md:-inset-6" />
            <div
              ref={lens}
              data-cursor="lens"
              className="absolute inset-0 overflow-hidden rounded-full bg-mint shadow-[0_50px_100px_-40px_rgb(14_27_44/0.45),inset_0_0_0_1px_rgb(255_255_255/0.6)]"
            >
              <div ref={media} className="hero-media absolute -inset-[6%]">
                <Image src={hero.poster.src} alt={hero.poster.alt} fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
                {showVideo && (
                  <video
                    ref={videoRef}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${playing ? "opacity-100" : "opacity-0"}`}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="none"
                    aria-hidden
                    onPlaying={() => setPlaying(true)}
                  >
                    {hero.videoSources.map((src) => (
                      <source key={src} src={src} type="video/mp4" />
                    ))}
                  </video>
                )}
              </div>
              {/* Specular highlight on the glass */}
              <span aria-hidden className="absolute inset-0 bg-[radial-gradient(110%_70%_at_28%_8%,rgb(255_255_255/0.35),transparent_45%)]" />
              <div aria-hidden className="hero-shade absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent opacity-0" />
            </div>

            {/* Secondary lens: a glimpse of the studio */}
            <div className="hero-ornament absolute -bottom-2 -left-4 aspect-square w-[32%] overflow-hidden rounded-full border-[5px] border-pearl shadow-[0_20px_40px_-20px_rgb(14_27_44/0.5)] md:-left-8">
              <Image src={hero.detail.src} alt={hero.detail.alt} fill sizes="160px" className="object-cover" />
            </div>

            {/* Glass status chip */}
            <p className="hero-ornament glass absolute -right-2 top-[12%] flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-medium text-ink md:-right-6 md:text-sm">
              <span aria-hidden className="soft-pulse block h-2 w-2 rounded-full bg-aqua" />
              {hero.status}
            </p>
          </div>
        </div>
      </div>

      <div className="hero-caption on-dark invisible absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-6 px-[var(--gutter)] pb-14 opacity-0 md:flex-row md:items-end md:justify-between">
        <p className="max-w-xl font-serif text-4xl leading-tight text-pearl md:text-6xl">{hero.caption}</p>
        <a href="#book" data-cursor="book" className="gleam rounded-full bg-aqua px-7 py-4 text-sm font-medium text-ink transition-colors hover:bg-pearl">
          Book a visit
        </a>
      </div>

      <div aria-hidden className="hero-ornament absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink/60 lg:flex">
        <span className="soft-pulse block h-2 w-2 rounded-full bg-aqua" />
        <span className="eyebrow text-[0.6rem]">Scroll</span>
      </div>
    </section>
  );
}
