"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";
import { useUi } from "@/state/ui";

const STAGGER = 0.05;
const DELAY_CHILDREN = 0.15;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER, delayChildren: DELAY_CHILDREN } },
};

const letterV: Variants = {
  hidden: { opacity: 0, y: -70, rotate: -10 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", stiffness: 520, damping: 22 },
  },
};

/**
 * The hero title. Each letter drops in (staggered) and then cycles through the
 * four Mario colours via a CSS keyframe. Signals the UI store when the opening
 * animation is finished so the top nav can reveal.
 */
export function HeroTitle({ text, className }: { text: string; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const setIntroComplete = useUi((s) => s.setIntroComplete);

  const words = text.split(" ");
  const letterCount = text.replace(/\s/g, "").length;

  useEffect(() => {
    if (reduced) {
      setIntroComplete(true);
      return;
    }
    const totalMs = (DELAY_CHILDREN + letterCount * STAGGER) * 1000 + 500;
    const t = setTimeout(() => setIntroComplete(true), totalMs);
    return () => clearTimeout(t);
  }, [reduced, letterCount, setIntroComplete]);

  let idx = 0;
  return (
    <motion.h1
      variants={container}
      initial={reduced ? "show" : "hidden"}
      animate="show"
      aria-label={text}
      className={cn(
        "flex flex-wrap justify-center gap-x-[0.35em] text-center",
        "text-5xl leading-none sm:text-7xl",
        className,
      )}
    >
      {words.map((word, w) => (
        <span key={w} className="inline-flex" aria-hidden>
          {word.split("").map((ch) => {
            const i = idx++;
            return (
              <motion.span
                key={i}
                variants={letterV}
                className="title-letter"
                style={{
                  color: "var(--color-mario-red)",
                  animation: reduced
                    ? undefined
                    : `letterCycle 5s ${(-i * 0.12).toFixed(2)}s infinite`,
                }}
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}
    </motion.h1>
  );
}
