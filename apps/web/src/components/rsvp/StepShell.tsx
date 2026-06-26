import { cn } from "@/lib/cn";
import type { FlowStep } from "@/state/rsvpFlow";

const STEPS: { key: FlowStep; label: string }[] = [
  { key: "form", label: "Sign Up" },
  { key: "reaction", label: "Skill Check" },
  { key: "flappy", label: "Flappy" },
  { key: "seed", label: "Seed" },
];

/** Progress chrome shared by every step of the RSVP flow. */
export function StepShell({
  step,
  title,
  subtitle,
  children,
}: {
  step: FlowStep;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const activeIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex items-center justify-center">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink font-head text-sm font-bold",
                i < activeIdx && "bg-mario-green text-paper",
                i === activeIdx && "bg-mario-yellow text-ink",
                i > activeIdx && "bg-paper text-ink/40",
              )}
              aria-current={i === activeIdx ? "step" : undefined}
            >
              {i < activeIdx ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-1 w-5 sm:w-8",
                  i < activeIdx ? "bg-mario-green" : "bg-silver",
                )}
              />
            )}
          </li>
        ))}
      </ol>

      <header className="text-center">
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-ink/60">{subtitle}</p>}
      </header>

      {children}
    </div>
  );
}
