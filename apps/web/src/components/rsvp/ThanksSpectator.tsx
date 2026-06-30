"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EVENT } from "@/lib/event";
import { useRsvpFlow } from "@/state/rsvpFlow";

const MARIO_COLORS = ["#e52521", "#049cd8", "#fbd000", "#43b047"];

/** Spectator end screen: they skip the games, so there's no seed — just thanks. */
export function ThanksSpectator() {
  const rsvp = useRsvpFlow((s) => s.rsvp);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    confetti({
      particleCount: 110,
      spread: 80,
      startVelocity: 40,
      origin: { y: 0.4 },
      colors: MARIO_COLORS,
    });
  }, [reduced]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="text-7xl sm:text-8xl"
        aria-hidden
      >
        🎉
      </motion.div>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl text-paper sm:text-4xl">
          {rsvp?.name ? `You're in, ${rsvp.name.split(",")[0]}!` : "You're in!"}
        </h1>
        <p className="max-w-sm text-paper/80">
          Thanks for RSVPing as a spectator. Spectators skip the seeding games —
          you just bring the energy. See you {EVENT.dateShort} at {EVENT.place}.
        </p>
      </div>

      <Card className="w-full max-w-sm p-5 text-left">
        <Detail label="When" value={EVENT.date} />
        <Detail label="Time" value={EVENT.time} />
        <Detail label="Where" value={EVENT.place} />
        <Detail label="Parking" value={EVENT.parking} />
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <TransitionLink href="/standings" className={buttonClasses("blue", "lg")}>
          See the standings 🏆
        </TransitionLink>
        <TransitionLink href="/info1" className={buttonClasses("outline", "lg")}>
          Event details
        </TransitionLink>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b-2 border-silver/60 py-2 last:border-0">
      <span className="font-head text-xs font-bold tracking-wider text-ink/50 uppercase">
        {label}
      </span>
      <span className="font-head text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}
