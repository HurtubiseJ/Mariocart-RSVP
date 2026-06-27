"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

/** Static per-letter colours — used as the base, and as the look when motion
 *  is reduced (so the letters still alternate even without the animation). */
const COLORS = [
  "var(--color-mario-red)",
  "var(--color-mario-blue)",
  "var(--color-mario-yellow)",
  "var(--color-mario-green)",
];

/**
 * Renders text with the hero title's per-letter Mario colour treatment: each
 * character takes one of the four brand colours and cycles through them via the
 * `letterCycle` keyframe (see globals.css), staggered so neighbours never match.
 * Words wrap as units; spaces are preserved via the inter-word gap. Honours
 * reduced-motion (falls back to the static alternating colours).
 */
export function CycleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");
  let i = 0;

  return (
    <span
      aria-label={text}
      className={cn("inline-flex flex-wrap gap-x-[0.3em]", className)}
    >
      {words.map((word, w) => (
        <span key={w} className="inline-flex" aria-hidden>
          {word.split("").map((ch) => {
            const k = i++;
            return (
              <span
                key={k}
                className="title-letter"
                style={{
                  color: COLORS[k % COLORS.length],
                  animation: reduced
                    ? undefined
                    : `letterCycle 5s ${(-k * 0.12).toFixed(2)}s infinite`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
