"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { BAD_AT_DRINKING, useRsvpFlow } from "@/state/rsvpFlow";
import { RatingScale } from "./RatingScale";

const BREATH_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "1 breath" },
  { value: 2, label: "2 breaths" },
  { value: 3, label: "3 breaths" },
  { value: BAD_AT_DRINKING, label: "Bad at drinking" },
];

const RIDE_HOME_OPTIONS: { value: string; label: string }[] = [
  { value: "have_driver", label: "I have a driver" },
  { value: "staying_lukes", label: "Staying at Luke's" },
  { value: "unsure", label: "Unsure right now" },
];

/** Player step: rate Mario Kart Wii skill + breaths to chug a beer. */
export function SkillBreathsStep() {
  const setSkillBreaths = useRsvpFlow((s) => s.setSkillBreaths);
  // Prefill from the store so backwards navigation doesn't lose the answers.
  const [skill, setSkill] = useState<number | null>(
    () => useRsvpFlow.getState().rsvp?.rated_skill ?? null,
  );
  const [breaths, setBreaths] = useState<number | null>(
    () => useRsvpFlow.getState().rsvp?.num_breaths ?? null,
  );
  const [rideHome, setRideHome] = useState<string | null>(
    () => useRsvpFlow.getState().rsvp?.ride_home ?? null,
  );

  const ready = skill !== null && breaths !== null && rideHome !== null;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <h2 className="font-head text-base font-bold text-paper">
          Rate your Mario Kart Wii skill
        </h2>
        <RatingScale
          name="skill"
          value={skill}
          onChange={setSkill}
          lowLabel="Never played"
          highLabel="Wii legend"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-head text-base font-bold text-paper">
          How many breaths to chug a beer?
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BREATH_OPTIONS.map((opt) => {
            const selected = breaths === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setBreaths(opt.value)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-xl border-[3px] border-ink px-2 text-center font-head text-sm font-bold transition-transform active:translate-y-0.5",
                  selected
                    ? "bg-mario-green text-paper shadow-[0_4px_0_0_var(--color-ink)]"
                    : "bg-paper text-ink/70 hover:bg-cream",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="font-head text-xs font-semibold text-mario-yellow">
          🍺 Beers provided.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-head text-base font-bold text-paper">
          How are you getting home?
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {RIDE_HOME_OPTIONS.map((opt) => {
            const selected = rideHome === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setRideHome(opt.value)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-xl border-[3px] border-ink px-2 text-center font-head text-sm font-bold transition-transform active:translate-y-0.5",
                  selected
                    ? "bg-mario-green text-paper shadow-[0_4px_0_0_var(--color-ink)]"
                    : "bg-paper text-ink/70 hover:bg-cream",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        variant="green"
        size="lg"
        disabled={!ready}
        onClick={() =>
          ready &&
          setSkillBreaths({
            rated_skill: skill,
            num_breaths: breaths,
            ride_home: rideHome,
          })
        }
      >
        Continue →
      </Button>
    </div>
  );
}
