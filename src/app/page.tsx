import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Preloader } from "@/components/layout/Preloader";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Booking } from "@/components/sections/Booking";
import { Dentists } from "@/components/sections/Dentists";
import { FirstVisit } from "@/components/sections/FirstVisit";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { OurPromise } from "@/components/sections/OurPromise";
import { PriceList } from "@/components/sections/PriceList";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <MotionProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-pearl"
      >
        Skip to content
      </a>
      <Preloader />
      <Cursor />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <OurPromise />
        <Services />
        <PriceList />
        <Dentists />
        <Gallery />
        <FirstVisit />
        <Testimonials />
        <Booking />
      </main>
      <Footer />
    </MotionProvider>
  );
}
