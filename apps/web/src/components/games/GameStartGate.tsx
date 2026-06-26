"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

/**
 * "Tap to start" overlay. Required so the first user gesture warms up the loop
 * (and any audio) before the game runs — important on mobile.
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
      <Button variant="yellow" size="lg" onClick={onStart}>
        Tap to start
      </Button>
    </motion.div>
  );
}
