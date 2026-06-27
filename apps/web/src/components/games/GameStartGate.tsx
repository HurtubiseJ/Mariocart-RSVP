"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Pre-game overlay. Auto-starts after a 2s "get ready" beat, which also warms up
 * the render loop (and any audio) before the game runs — important on mobile.
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
  const started = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      onStart();
    }, 2000);
    return () => clearTimeout(t);
  }, [onStart]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-ink/85 px-6 text-center backdrop-blur-sm"
    >
      <h3 className="font-display text-3xl tracking-wide text-paper">{title}</h3>
      <p className="max-w-xs text-paper/80">{hint}</p>
      <h4 className="font-display text-2xl tracking-wide text-mario-red mt-2">GET READY... {}</h4>
      {/* <Button variant="yellow" size="lg" onClick={onStart}>
        Tap to start
      </Button> */}
    </motion.div>
  );
}
