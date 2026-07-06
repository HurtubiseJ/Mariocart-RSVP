import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

/**
 * Standard top-padded page wrapper with a title + checkered divider.
 *
 * `fill` (default true) makes the shell at least a full viewport tall — right for
 * a page that is a single shell. Pass `fill={false}` when stacking several shells
 * on one page (e.g. Rules) so each sizes to its content instead of every section
 * forcing 100dvh.
 */
export function PageShell({
  title,
  subtitle,
  children,
  className,
  fill = true,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  fill?: boolean;
}) {
  return (
    <main className={cn(fill && "min-h-[100dvh]", "pt-24 pb-16", className)}>
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
