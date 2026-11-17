import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { contact, dentists, services, site } from "@/data/clinic";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Dentist in Ortigas Center, Pasig`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "dentist Ortigas",
    "dental clinic Pasig",
    "braces Pasig",
    "teeth whitening Ortigas",
    "dental implants Pasig",
    "pediatric dentist Ortigas",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "/",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: "The bright treatment room at Ngiti Dental Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [site.ogImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F8F7F4",
  width: "device-width",
  initialScale: 1,
};

function clinicSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Dentist", "LocalBusiness"],
    "@id": `${site.url}/#clinic`,
    name: site.name,
    description: site.description,
    url: site.url,
    image: site.ogImage,
    telephone: contact.phone.schema,
    priceRange: "₱₱",
    currenciesAccepted: "PHP",
    paymentAccepted: "Cash, GCash, Maya, Credit Card, HMO",
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.street,
      addressLocality: `${contact.locality}, ${contact.city}`,
      addressRegion: contact.region,
      postalCode: contact.postalCode,
      addressCountry: contact.country,
    },
    geo: { "@type": "GeoCoordinates", ...contact.geo },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    sameAs: [contact.facebook, contact.instagram],
    medicalSpecialty: "Dentistry",
    availableService: services.map((s) => ({ "@type": "MedicalProcedure", name: s.name })),
    employee: dentists.map((d) => ({ "@type": "Person", name: d.name, jobTitle: d.role })),
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PH" className={`${serif.variable} ${sans.variable}`} data-blur="full">
      <body>
        <script
          type="application/ld+json"
          // Static, build-time data — not user input. `<` is escaped defensively.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema()).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
