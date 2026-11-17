import { contact, navLinks, site } from "@/data/clinic";
import { CurrentYear } from "./CurrentYear";

function SocialIcon({ name }: { name: "facebook" | "instagram" }) {
  return name === "facebook" ? (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.6V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.2v3h2.5V21h2.8Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" className="fill-current stroke-none" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="on-dark bg-ink px-[var(--gutter)] pb-10 pt-20 text-pearl/80">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-10">
          <p className="font-serif text-5xl leading-none text-pearl md:text-6xl">
            Ngiti <em className="text-aqua">Dental Studio</em>
          </p>
          <address className="grid gap-8 not-italic sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h2 className="eyebrow text-aqua">Visit</h2>
              <p>
                {contact.street}
                <br />
                {contact.locality}, {contact.city}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="eyebrow text-aqua">Hours</h2>
              <p>{contact.hours}</p>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="eyebrow text-aqua">Call</h2>
              <p>
                Phone: <a href={contact.phone.href} className="text-pearl hover:text-aqua">{contact.phone.display}</a>
                <br />
                Mobile: <a href={contact.mobile.href} className="text-pearl hover:text-aqua">{contact.mobile.display}</a>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="eyebrow text-aqua">Payment</h2>
              <p>{contact.payment}</p>
            </div>
          </address>
          <div className="flex items-center gap-3">
            {(["facebook", "instagram"] as const).map((n) => (
              <a
                key={n}
                href={contact[n]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${site.name} on ${n === "facebook" ? "Facebook" : "Instagram"}`}
                className="grid h-11 w-11 place-items-center rounded-full border border-pearl/20 text-pearl transition-colors hover:border-aqua hover:text-aqua"
              >
                <SocialIcon name={n} />
              </a>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-pearl/10">
          <iframe
            title={`Map to ${site.name}, Emerald Avenue, Ortigas Center`}
            src={contact.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full grayscale-[0.4] lg:h-full lg:min-h-[26rem]"
          />
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-4 border-t border-pearl/10 pt-8 text-sm text-pearl/70 md:flex-row md:items-center md:justify-between">
        <p>© <CurrentYear fallback={new Date().getFullYear()} /> {site.name}. All rights reserved.</p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-pearl">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
