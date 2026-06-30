"use client";

import { cn } from "@/lib/cn";
import { useRsvpFlow, type FlowStep } from "@/state/rsvpFlow";

/** The visible progress steps for each participation path. */
const SPECTATOR_STEPS: { key: FlowStep; label: string }[] = [
  { key: "rsvp-type", label: "Participation" },
  { key: "name-num", label: "Sign up" },
  { key: "vibes", label: "Vibes" },
  { key: "acknowledgments", label: "Acknowledge" },
];

const PLAYER_STEPS: { key: FlowStep; label: string }[] = [
  { key: "rsvp-type", label: "Participation" },
  { key: "name-num", label: "Sign up" },
  { key: "rate-skill-breaths", label: "Skills" },
  { key: "acknowledgments", label: "Acknowledge" },
  { key: "reaction", label: "Skill Check" },
  { key: "flappy", label: "Flappy" },
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
  const rsvpType = useRsvpFlow((s) => s.rsvp_type);
  const steps = rsvpType === "spectator" ? SPECTATOR_STEPS : PLAYER_STEPS;
  const activeIdx = Math.max(
    0,
    steps.findIndex((s) => s.key === step),
  );

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex items-center justify-center">
        {steps.map((s, idx) => (
          <li key={s.key} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink font-head text-sm font-bold",
                idx < activeIdx && "bg-mario-green text-paper",
                idx === activeIdx && "bg-mario-yellow text-ink",
                idx > activeIdx && "bg-paper text-ink/50",
              )}
              aria-current={idx === activeIdx ? "step" : undefined}
            >
              {idx < activeIdx ? "✓" : idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <span
                className={cn(
                  "h-1 w-5 sm:w-8",
                  idx < activeIdx ? "bg-mario-green" : "bg-silver",
                )}
              />
            )}
          </li>
        ))}
      </ol>

      <header className="text-center">
        <h1 className="font-display text-3xl text-paper tracking-wide sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-paper/80">{subtitle}</p>}
      </header>

      {children}
    </div>
  );
}
