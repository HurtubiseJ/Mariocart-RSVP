"use client";

import { motion } from "framer-motion";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Button, buttonClasses } from "@/components/ui/Button";
import { MIN_VIBES, useRsvpFlow } from "@/state/rsvpFlow";

/** Shown when a spectator rates their vibes below the threshold. Flow resets. */
export function VibesRejected() {
  const reset = useRsvpFlow((s) => s.reset);

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <motion.div
        initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="text-7xl sm:text-8xl"
        aria-hidden
      >
        😬
      </motion.div>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-paper sm:text-4xl">
          Uh oh… vibes too low
        </h1>
        <p className="max-w-sm text-paper/80">
          We need a minimum of {MIN_VIBES}/10 vibes to let you in. Come back when
          you&apos;re feeling it — no bad energy at the Cup.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="yellow" size="lg" onClick={() => reset()}>
          Start over
        </Button>
        <TransitionLink href="/" className={buttonClasses("outline", "lg")}>
          Back home
        </TransitionLink>
      </div>
    </div>
  );
}
