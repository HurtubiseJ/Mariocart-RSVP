"use client";

import { useEffect, useState } from "react";
import { FlappyGame } from "@/components/games/FlappyGame";
import { ReactionGame } from "@/components/games/ReactionGame";
import { RsvpForm } from "@/components/rsvp/RsvpForm";
import { SeedReveal } from "@/components/rsvp/SeedReveal";
import { StepShell } from "@/components/rsvp/StepShell";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Spinner } from "@/components/ui/Spinner";
import { useRsvpFlow } from "@/state/rsvpFlow";

export default function RsvpPage() {
  const step = useRsvpFlow((s) => s.step);
  const status = useRsvpFlow((s) => s.status);
  const error = useRsvpFlow((s) => s.error);
  const completeReaction = useRsvpFlow((s) => s.completeReaction);
  const completeFlappy = useRsvpFlow((s) => s.completeFlappy);
  const submitAndSeed = useRsvpFlow((s) => s.submitAndSeed);

  // Gate render until the persisted store has rehydrated (avoids SSR mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="min-h-[100dvh] pt-24 pb-16">
      <Section>
        {!mounted ? (
          <div className="flex justify-center py-24">
            <Spinner className="h-10 w-10" />
          </div>
        ) : step === "form" ? (
          <StepShell
            step={step}
            title="Join the Cup"
            subtitle="Sign up now for the chance to achieve glory. (Don't mind the extra steps...)"
          >
            <RsvpForm />
          </StepShell>
        ) : step === "reaction" ? (
          <StepShell
            step={step}
            title="Skill Check"
            subtitle="Seeding game 1 of 2 — three rounds."
          >
            <ReactionGame onComplete={completeReaction} />
          </StepShell>
        ) : step === "flappy" ? (
          <StepShell
            step={step}
            title="Beerio Flappy"
            subtitle="Seeding game 2 of 2 — best of two runs."
          >
            {status === "submitting" ? (
              <div className="flex flex-col items-center gap-4 py-20">
                <Spinner className="h-10 w-10" />
                <p className="font-head font-semibold text-ink/60">
                  Crunching your seed…
                </p>
              </div>
            ) : status === "error" ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <p className="font-semibold text-mario-red">
                  {error ?? "Could not save your score."}
                </p>
                <Button variant="red" onClick={() => void submitAndSeed()}>
                  Retry
                </Button>
              </div>
            ) : (
              <FlappyGame onComplete={completeFlappy} />
            )}
          </StepShell>
        ) : (
          <SeedReveal />
        )}
      </Section>
    </main>
  );
}
