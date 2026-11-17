/**
 * Ngiti Dental Studio — single source of truth for site content.
 *
 * Edit services, prices, dentists, testimonials and contact details here.
 * Prices are plain numbers in Philippine pesos; formatting (₱ and commas)
 * is handled by `src/lib/format.ts`.
 *
 * Images are Unsplash placeholders. Replace with the clinic's own photography
 * (and patient-consented before/after photos) before launch.
 */

export interface SiteImage {
  readonly src: string;
  readonly alt: string;
}

export type ServiceId =
  | "general"
  | "cosmetic"
  | "orthodontics"
  | "surgery"
  | "implants"
  | "kids";

export interface PriceItem {
  readonly name: string;
  readonly price: number;
  /** Renders as "from ₱X" when true. */
  readonly from?: boolean;
}

export interface Service {
  readonly id: ServiceId;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  /** Shown on the service lens card as "from ₱X". Must match a price below. */
  readonly startingPrice: number;
  readonly image: SiteImage;
  readonly prices: readonly PriceItem[];
}

export interface Dentist {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly image: SiteImage;
}

export interface Testimonial {
  readonly quote: string;
  readonly author: string;
  readonly location: string;
  readonly lang?: "en" | "fil";
}

export interface Stat {
  readonly value: number;
  readonly decimals?: number;
  readonly suffix?: string;
  readonly label: string;
}

export interface VisitStep {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly image: SiteImage;
  readonly tone: "pearl" | "mint" | "sand" | "ink";
}

export interface GalleryCase {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly image: SiteImage;
}

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const site = {
  name: "Ngiti Dental Studio",
  shortName: "Ngiti",
  tagline: "A smile, perfectly in focus.",
  description:
    "Ngiti Dental Studio is a calm, modern dental clinic in Ortigas Center, Pasig City — general, cosmetic, orthodontic, surgical, implant and kids' dentistry under one roof.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ngitidental.ph",
  locationLabel: "Ortigas, Pasig",
  ogImage: `${unsplash("1629909615184-74f495363b67")}?w=1200&h=630&fit=crop&q=75`,
} as const;

export const contact = {
  street: "Unit 1204, Ngiti Tower, Emerald Avenue",
  locality: "Ortigas Center",
  city: "Pasig City",
  region: "Metro Manila",
  postalCode: "1605",
  country: "PH",
  geo: { latitude: 14.5869, longitude: 121.0614 },
  hours: "Monday–Saturday, 9:00 AM – 7:00 PM · Sunday by appointment",
  phone: { display: "(02) 8555 0147", href: "tel:+63285550147", schema: "+63-2-8555-0147" },
  mobile: { display: "0917 555 0147", href: "tel:+639175550147" },
  payment: "We accept cash, GCash, Maya, major credit cards and selected HMOs.",
  messenger: "https://m.me/ngitidentalstudio",
  viber: "viber://chat?number=%2B639175550147",
  facebook: "https://www.facebook.com/ngitidentalstudio",
  instagram: "https://www.instagram.com/ngitidentalstudio",
  mapEmbed:
    "https://www.google.com/maps?q=Emerald+Avenue,+Ortigas+Center,+Pasig+City&output=embed",
} as const;

export const hero = {
  label: "Ngiti Dental Studio · Ortigas, Pasig",
  poster: {
    src: unsplash("1520813792240-56fc4a3765a7"),
    alt: "A woman with a bright, natural smile in soft, warm light",
  },
  /** Small secondary lens beside the portrait. */
  detail: {
    src: unsplash("1629909615184-74f495363b67"),
    alt: "The bright, airy treatment room at the studio",
  },
  intro:
    "Unhurried, beautifully precise dentistry in Ortigas — from your first check-up to a complete smile makeover.",
  status: "Now welcoming new patients",
  /**
   * Slow-motion clip(s) of a person laughing, played inside the hero lens.
   * Empty until the studio supplies its own footage — the poster shows meanwhile.
   * Example: ["/media/hero-laugh.mp4"] (place the file in /public/media).
   */
  videoSources: [] as readonly string[],
  caption: "Modern dentistry, gently done — in the heart of Ortigas.",
} as const;

export const promises = ["Gentle hands.", "Honest advice.", "Ngiti na panatag."] as const;

export const services: readonly Service[] = [
  {
    id: "general",
    name: "General Dentistry",
    tagline: "Check-ups, cleanings, fillings",
    description:
      "Unhurried check-ups, thorough cleanings and tooth-coloured fillings — the quiet routine that keeps every smile healthy.",
    startingPrice: 500,
    image: { src: unsplash("1629909615184-74f495363b67"), alt: "A bright, airy treatment room with a mint dental chair" },
    prices: [
      { name: "Consultation & Oral Exam", price: 500 },
      { name: "Oral Prophylaxis (Cleaning)", price: 1200, from: true },
      { name: "Deep Scaling (per quadrant)", price: 2500 },
      { name: "Fluoride Treatment", price: 800 },
      { name: "Tooth-colored Filling (per tooth)", price: 1200, from: true },
      { name: "Simple Extraction", price: 1000, from: true },
      { name: "Periapical X-ray", price: 350 },
      { name: "Panoramic X-ray", price: 1200 },
    ],
  },
  {
    id: "cosmetic",
    name: "Cosmetic Dentistry",
    tagline: "Whitening, veneers, makeovers",
    description:
      "Whitening, veneers and full smile makeovers designed around your face — natural, luminous and never overdone.",
    startingPrice: 7500,
    image: { src: unsplash("1494790108377-be9c29b29330"), alt: "A woman with a bright, natural smile" },
    prices: [
      { name: "In-office Teeth Whitening", price: 14000 },
      { name: "Take-home Whitening Kit", price: 7500 },
      { name: "Composite Veneer (per tooth)", price: 6000 },
      { name: "Porcelain Veneer (per tooth)", price: 18000, from: true },
      { name: "Smile Makeover Consultation", price: 1000 },
    ],
  },
  {
    id: "orthodontics",
    name: "Orthodontics",
    tagline: "Braces & clear aligners",
    description:
      "Metal, ceramic and self-ligating braces or nearly invisible aligners, with 0% installment plans to keep it manageable.",
    startingPrice: 45000,
    image: { src: unsplash("1609840114035-3c981b782dfe"), alt: "A smiling patient holding a clear aligner" },
    prices: [
      { name: "Metal Braces", price: 45000, from: true },
      { name: "Ceramic Braces", price: 70000, from: true },
      { name: "Self-ligating Braces", price: 85000, from: true },
      { name: "Clear Aligners", price: 120000, from: true },
      { name: "Monthly Adjustment", price: 1000 },
      { name: "Retainers (per arch)", price: 4000 },
    ],
  },
  {
    id: "surgery",
    name: "Oral Surgery",
    tagline: "Extractions & root canals",
    description:
      "Wisdom teeth, surgical extractions and root canal care performed calmly, with clear aftercare and minimal discomfort.",
    startingPrice: 5000,
    image: { src: unsplash("1606265752439-1f18756aa5fc"), alt: "A dentist holding a small round dental mirror" },
    prices: [
      { name: "Surgical Extraction", price: 5000, from: true },
      { name: "Impacted Wisdom Tooth Removal", price: 9000, from: true },
      { name: "Root Canal Treatment (per canal)", price: 7000, from: true },
    ],
  },
  {
    id: "implants",
    name: "Implants & Restorations",
    tagline: "Implants, crowns, bridges",
    description:
      "Implants, zirconia crowns, bridges and dentures crafted like fine ceramics — restoring comfort, bite and confidence.",
    startingPrice: 9000,
    image: { src: unsplash("1610701596007-11502861dcfa"), alt: "Hand-thrown ceramic cups in soft cream tones" },
    prices: [
      { name: "Dental Implant with Crown", price: 85000, from: true },
      { name: "Porcelain-fused-to-metal Crown", price: 9000 },
      { name: "Zirconia Crown", price: 20000 },
      { name: "Fixed Bridge (per unit)", price: 9000, from: true },
      { name: "Complete Denture (per arch)", price: 15000, from: true },
      { name: "Flexible Partial Denture", price: 12000, from: true },
    ],
  },
  {
    id: "kids",
    name: "Kids' Dentistry",
    tagline: "Gentle first visits",
    description:
      "Playful, patient care for little ones — first visits, sealants and cleanings that make the dentist a happy place.",
    startingPrice: 500,
    image: { src: unsplash("1516627145497-ae6968895b74"), alt: "A young child playing with a toy camera in a bright room" },
    prices: [
      { name: "Child's First Visit", price: 500 },
      { name: "Kids' Cleaning with Fluoride", price: 1200 },
      { name: "Pit & Fissure Sealant (per tooth)", price: 800 },
      { name: "Baby Tooth Extraction", price: 700 },
    ],
  },
];

export const priceNote =
  "Final fees are confirmed after your consultation. 0% installment plans available for braces, aligners and implants.";

export const dentists: readonly Dentist[] = [
  {
    id: "andrea",
    name: "Dr. Andrea Lim-Santos",
    role: "Clinic Director, General & Cosmetic Dentistry",
    image: { src: unsplash("1559839734-2b71ea197ec2"), alt: "Portrait of Dr. Andrea Lim-Santos in a white coat" },
  },
  {
    id: "rafael",
    name: "Dr. Rafael Mendoza",
    role: "Orthodontist",
    image: { src: unsplash("1612349317150-e413f6a5b16d"), alt: "Portrait of Dr. Rafael Mendoza in a white coat" },
  },
  {
    id: "katrina",
    name: "Dr. Katrina Bautista",
    role: "Pediatric Dentist",
    image: { src: unsplash("1594824476967-48c8b964273f"), alt: "Portrait of Dr. Katrina Bautista in teal scrubs" },
  },
  {
    id: "joaquin",
    name: "Dr. Joaquin Tan",
    role: "Oral Surgeon & Implant Dentistry",
    image: { src: unsplash("1622253692010-333f2da6031d"), alt: "Portrait of Dr. Joaquin Tan in blue scrubs" },
  },
  {
    id: "maricel",
    name: "Dr. Maricel Aquino",
    role: "Endodontist (Root Canal Specialist)",
    image: { src: unsplash("1580489944761-15a19d654956"), alt: "Portrait of Dr. Maricel Aquino smiling" },
  },
];

/**
 * Placeholder before/after cases. The "before" view is the same photo with a
 * dulling filter — replace with real, consented patient photography.
 */
export const galleryCases: readonly GalleryCase[] = [
  {
    id: "whitening",
    label: "Whitening",
    summary: "In-office whitening, one 90-minute session.",
    image: { src: unsplash("1494790108377-be9c29b29330"), alt: "Close portrait of a woman's bright smile" },
  },
  {
    id: "veneers",
    label: "Composite veneers",
    summary: "Six composite veneers, shaped over two visits.",
    image: { src: unsplash("1507003211169-0a1dd7228f2d"), alt: "Portrait of a man with an even, confident smile" },
  },
  {
    id: "aligners",
    label: "Clear aligners",
    summary: "Clear aligners over 14 months, then retainers.",
    image: { src: unsplash("1546961329-78bef0414d7c"), alt: "Portrait of a woman with a relaxed, natural smile" },
  },
];

export const visitSteps: readonly VisitStep[] = [
  {
    id: "book",
    title: "Book",
    body: "Choose a time online, on Messenger or Viber. We confirm by text within the hour during clinic hours.",
    image: { src: unsplash("1612196808214-b8e1d6145a8c"), alt: "A pale ceramic vase in a calm, sunlit room" },
    tone: "pearl",
  },
  {
    id: "consult",
    title: "Consult",
    body: "A relaxed, thorough exam with digital X-rays when needed. You see what we see, explained in plain words.",
    image: { src: unsplash("1629909613654-28e377c37b09"), alt: "A minimalist white clinic interior" },
    tone: "mint",
  },
  {
    id: "plan",
    title: "Treatment Plan",
    body: "Clear options, honest timelines and the full fee upfront — including 0% installment plans where available.",
    image: { src: unsplash("1610701596007-11502861dcfa"), alt: "Hand-thrown ceramic cups in soft cream tones" },
    tone: "sand",
  },
  {
    id: "smile",
    title: "Smile",
    body: "Gentle treatment at your pace, followed by aftercare and reminders that keep your results bright.",
    image: { src: unsplash("1548142813-c348350df52b"), alt: "A woman laughing in warm light" },
    tone: "ink",
  },
];

export const stats: readonly Stat[] = [
  { value: 12, label: "years of practice" },
  { value: 18000, suffix: "+", label: "patients cared for" },
  { value: 5, label: "specialists under one roof" },
  { value: 4.9, decimals: 1, suffix: "★", label: "average patient rating" },
];

export const testimonials: readonly Testimonial[] = [
  {
    quote: "First time I wasn't nervous at the dentist. Dr. Andrea explained everything before she started.",
    author: "Patricia G.",
    location: "Pasig",
  },
  {
    quote: "Ang gaan ng kamay ni Dr. Joaquin. Wisdom tooth removal ko, halos walang sakit.",
    author: "Ramon C.",
    location: "Mandaluyong",
    lang: "fil",
  },
  {
    quote: "My daughter actually looks forward to her checkups with Dr. Katrina.",
    author: "Liza F.",
    location: "Quezon City",
  },
  {
    quote: "Braces done in 18 months, and the installment plan made it manageable.",
    author: "Kevin S.",
    location: "Marikina",
  },
];

/** Bookable appointment start times (Mon–Sat, last slot 6:00 PM). */
export const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
] as const;

export const NO_DENTIST_PREFERENCE = "No preference";

export const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#prices", label: "Prices" },
  { href: "#dentists", label: "Dentists" },
  { href: "#gallery", label: "Smiles" },
  { href: "#visit", label: "First visit" },
] as const;
