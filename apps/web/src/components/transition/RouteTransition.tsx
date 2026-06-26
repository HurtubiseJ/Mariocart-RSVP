"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { useTransition } from "@/state/transition";
import { KartSprite } from "./KartSprite";

/**
 * The persistent kart transition overlay. Mounted once in the root layout.
 *
 * A single coloured panel sweeps left→right with the kart riding its leading
 * (right) edge: it covers the screen (cover), the router navigates while masked,
 * then the panel continues off-screen right to reveal the new page (reveal).
 *
 * The cover half is started by TransitionLink (beginCover); the reveal half is
 * started by the new route's template.tsx (reveal). See state/transition.ts.
 */

const SWEEP = { duration: 0.55, ease: [0.7, 0, 0.3, 1] as const };

export function RouteTransition() {
  const router = useRouter();
  const phase = useTransition((s) => s.phase);
  const href = useTransition((s) => s.href);
  const accent = useTransition((s) => s.accent);
  const coverComplete = useTransition((s) => s.coverComplete);
  const reveal = useTransition((s) => s.reveal);
  const finishReveal = useTransition((s) => s.finishReveal);

  // Safety net: never let the overlay trap the screen if a navigation fails to
  // remount the template (e.g. a no-op push). Force the reveal after a beat.
  useEffect(() => {
    if (phase !== "covered") return;
    const t = setTimeout(() => reveal(), 900);
    return () => clearTimeout(t);
  }, [phase, reveal]);

  const targetX =
    phase === "covering" || phase === "covered"
      ? "0%"
      : phase === "revealing"
        ? "100%"
        : "-100%";

  const active = phase !== "idle";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[60] overflow-hidden",
        active && "pointer-events-auto",
      )}
      style={{ visibility: active ? "visible" : "hidden" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: accent }}
        initial={{ x: "-100%" }}
        animate={{ x: targetX }}
        transition={SWEEP}
        onAnimationComplete={() => {
          if (phase === "covering") {
            coverComplete();
            if (href) router.push(href);
          } else if (phase === "revealing") {
            finishReveal();
          }
        }}
      >
        {/* checker strip on the leading edge */}
        <div
          className="absolute top-0 right-0 h-full w-4 bg-checker opacity-80"
          aria-hidden
        />
        {/* kart riding the leading edge, bobbing as it pulls the panel */}
        <motion.div
          className="absolute top-1/2 right-0 w-32 -translate-y-1/2 translate-x-[42%] drop-shadow-2xl sm:w-44"
          animate={{ y: [0, -6, 0], rotate: [-2, 1.5, -2] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <KartSprite />
        </motion.div>
      </motion.div>
    </div>
  );
}
