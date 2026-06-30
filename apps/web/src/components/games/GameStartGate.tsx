"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

/**
 * Pre-game overlay. The player reads the rules, then taps to start — a 3-2-1
 * countdown (driven by GameCanvas) plays over the live game scene before logic
 * actually begins, so nobody gets caught off guard.
 */
export function GameStartGate({
  title,
  hint,
  onStart,
}: {
  title: string;
  hint: string;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-ink/85 px-6 text-center backdrop-blur-sm"
    >
      <h3 className="font-display text-3xl tracking-wide text-paper">{title}</h3>
      <p className="max-w-xs text-paper/80">{hint}</p>
      <Button variant="yellow" size="lg" className="mt-2" onClick={onStart}>
        Tap to start
      </Button>
    </motion.div>
  );
}
