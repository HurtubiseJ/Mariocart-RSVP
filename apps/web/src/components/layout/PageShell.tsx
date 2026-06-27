import { Section } from "@/components/ui/Section";

/** Standard top-padded page wrapper with a title + checkered divider. */
export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] pt-24 pb-16">
      <Section>
        <header className="mb-8 text-center">
          <h1 className="font-display text-4xl text-paper tracking-wide sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-2 text-paper/70">{subtitle}</p>}
          <div className="mx-auto mt-4 h-2 w-42 bg-checker bg-white/20" aria-hidden />
        </header>
        {children}
      </Section>
    </main>
  );
}
