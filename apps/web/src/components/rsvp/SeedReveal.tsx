"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useRsvpFlow } from "@/state/rsvpFlow";

const MARIO_COLORS = ["#e52521", "#049cd8", "#fbd000", "#43b047"];

export function SeedReveal() {
  const outcome = useRsvpFlow((s) => s.outcome);
  const reaction = useRsvpFlow((s) => s.reaction);
  const flappy = useRsvpFlow((s) => s.flappy);
  const rsvp = useRsvpFlow((s) => s.rsvp);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !outcome) return;
    const fire = () =>
      confetti({
        particleCount: 130,
        spread: 85,
        startVelocity: 42,
        origin: { y: 0.35 },
        colors: MARIO_COLORS,
      });
    fire();
    const t = setTimeout(fire, 350);
    return () => clearTimeout(t);
  }, [outcome, reduced]);

  if (!outcome) return null;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-1">
        <p className="font-head text-sm font-bold tracking-[0.3em] text-mario-green uppercase">
          You&apos;re in — thanks for playing!
        </p>
        <p className="font-display text-2xl text-paper sm:text-3xl">
          {rsvp?.name ? `Nice driving, ${rsvp.name.split(",")[0].trim()}!` : "Nice driving!"}
        </p>
      </div>

      <motion.div
        initial={{ scale: 0.4, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 14 }}
        className="flex flex-col items-center"
      >
        <span className="font-head text-lg font-bold tracking-widest text-ink/60 uppercase">
          Your game rank
        </span>
        <span className="font-display text-8xl leading-none text-mario-red sm:text-9xl">
          #{outcome.rank}
        </span>
        <span className="font-head font-semibold text-ink/60">
          of {outcome.totalPlayers} players
        </span>
      </motion.div>

      <Card className="w-full max-w-sm p-5">
        <div className="grid grid-cols-3 divide-x-2 divide-silver">
          <Stat label="Skill Check" value={reaction?.score ?? 0} />
          <Stat label="Best Flappy" value={`${flappy?.bestGatesPassed ?? 0} 🍺`} />
          <Stat label="Total" value={outcome.cumulativeScore} accent />
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <TransitionLink href="/standings" className={buttonClasses("blue", "lg")}>
          Continue to standings 🏆
        </TransitionLink>
        <TransitionLink href="/info1" className={buttonClasses("outline", "lg")}>
          Event details
        </TransitionLink>
      </div>

      <p className="max-w-sm text-xs text-ink/45">
        Tournament seeds come from past tournaments — this combo score breaks
        ties and gives new players a fair shot. Bring your A-game (and a
        designated driver) to race day.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="px-2">
      <div className="font-head text-[10px] font-bold tracking-wider text-ink/50 uppercase">
        {label}
      </div>
      <div
        className={`font-display text-2xl leading-tight ${accent ? "text-mario-green" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}
