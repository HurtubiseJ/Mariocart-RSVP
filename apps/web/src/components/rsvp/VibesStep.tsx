"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRsvpFlow } from "@/state/rsvpFlow";
import { RatingScale } from "./RatingScale";

/** Spectator step: rate your vibes 1-10. Below the threshold the flow rejects. */
export function VibesStep() {
  const setVibes = useRsvpFlow((s) => s.setVibes);
  // Prefill from the store so backwards navigation doesn't lose the rating.
  const [value, setValue] = useState<number | null>(
    () => useRsvpFlow.getState().rsvp?.vibes ?? null,
  );

  return (
    <div className="flex flex-col gap-6">
      <RatingScale
        name="vibes"
        value={value}
        onChange={setValue}
        lowLabel="Bad vibes"
        highLabel="Immaculate"
      />
      <Button
        variant="red"
        size="lg"
        disabled={value === null}
        onClick={() => value !== null && setVibes(value)}
      >
        Lock in my vibes →
      </Button>
    </div>
  );
}
