# Ngiti Dental Studio

A cinematic single-page site for a dental studio in Ortigas Center, Pasig. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, GSAP + ScrollTrigger and Lenis.

The motion system, **"The Mirror"**, works in place, section by section, and is built from circles, reflections and light. It has five effects: aperture transitions, frosted-to-clear reveals, a one-time gleam, lens parallax, and focus racking.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm test           # unit tests (node:test)
npm run typecheck
```

Set `NEXT_PUBLIC_SITE_URL` to the production URL. It is used for canonical, Open Graph and schema URLs.

## Editing content

Everything editable lives in **`src/data/clinic.ts`**:

| What | Export |
| --- | --- |
| Services, descriptions, starting prices, full price list | `services` |
| Price-list footnote | `priceNote` |
| Dentists | `dentists` |
| Testimonials, first-visit steps | `testimonials`, `visitSteps` |
| Hero trust figures (patients, specialists, rating) | `stats` |
| Before/after cases | `galleryCases` |
| Address, hours, phones, payment, socials, map | `contact` |
| Hero label, poster, video | `hero` |
| Bookable time slots | `timeSlots` |

Prices are plain numbers. `₱` and the comma separators are added by `src/lib/format.ts`. Set `from: true` to show "Starting at". A service's `startingPrice` must match one of its listed prices, and a unit test enforces this.

## Before launch

- **Hero video.** `hero.videoSources` is empty. Add a slow-motion clip of someone laughing, e.g. put `/public/media/hero-laugh.mp4` there and list `"/media/hero-laugh.mp4"`. Until then, the laughing portrait shows inside the lens.
- **Photography.** All images are Unsplash placeholders. Replace the gallery with real, consented before/after photos. The "before" view is currently the same photo run through a CSS dulling filter (`.before-filter`).
- **Booking delivery.** `POST /api/booking` validates requests, rate-limits them and returns a reference, but **does not send or store them anywhere yet**. See the `TODO` in `src/app/api/booking/route.ts`. The rate limiter is in-memory per instance, so use a shared store (e.g. Upstash Redis) when the site runs on more than one instance.
- **Links.** Replace the Messenger, Viber, Facebook and Instagram URLs in `contact` with the real ones.

## Structure

```
src/
  app/                 layout (fonts, metadata, Dentist JSON-LD), page, api/booking
  components/
    motion/            MotionProvider: Lenis, device tiers, intro signal, anchor scrolling
    layout/            Preloader, Cursor, Navbar, Footer
    sections/          one component per section (Hero … Booking)
    ui/                ApertureSection, LensImage, SectionHeading, MagneticButton
  hooks/               useAperture, useFrostReveal, useGleam, useLensParallax, useMagnetic
  lib/                 motion primitives, tilt, booking validation, formatting, image loader
  data/clinic.ts       all content
tests/                 unit tests for formatting, booking validation and data integrity
```

## Performance and accessibility notes

- **Blur budget.** Devices fall into one of three tiers (`src/lib/motion.ts`). Desktop gets blur everywhere. Capable touch devices blur key elements only. Low-power devices (≤4 cores, ≤4 GB memory or Save-Data) get opacity fades only.
- **Reduced motion.** `prefers-reduced-motion` turns off the preloader, Lenis, pinning, scrubbing, apertures and the gleam, leaving simple fades.
- **Touch.** Lens parallax follows device tilt instead of the cursor. iOS asks for motion permission on the first tap.
- **Keyboard.** The before/after lens is a keyboard slider (arrow keys, Home and End). Price categories are ARIA tabs with arrow-key navigation. Service lenses open with Enter and close with Escape.
