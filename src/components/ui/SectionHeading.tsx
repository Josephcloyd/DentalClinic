type Props = {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
};

/** Eyebrow + oversized serif headline. Headline frosts in and catches the gleam. */
export function SectionHeading({ id, eyebrow, title, intro, align = "left", tone = "light" }: Props) {
  const center = align === "center" ? "mx-auto text-center items-center" : "";
  const muted = tone === "dark" ? "text-pearl/75" : "text-ink/70";
  const accent = tone === "dark" ? "text-aqua" : "text-teal";
  return (
    <header className={`flex max-w-4xl flex-col gap-5 ${center}`}>
      <p className={`eyebrow ${accent}`} data-frost>
        {eyebrow}
      </p>
      <h2 id={id} className="display-sm gleam text-balance" data-frost>
        {title}
      </h2>
      {intro && (
        <p className={`max-w-xl text-base leading-relaxed md:text-lg ${muted}`} data-frost>
          {intro}
        </p>
      )}
    </header>
  );
}
