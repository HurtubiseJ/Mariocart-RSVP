"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Full-page background for the home page.
 *
 * It is `fixed`, so it stays put while the page scrolls instead of "running
 * out" after the first viewport and revealing the white <body> underneath —
 * the background is continuous from top to bottom.
 *
 * A solid asphalt base sits *behind* the title art, so even when the art is at
 * low opacity the page stays dark — it never flips to white.
 *
 * The art's opacity is driven by scroll progress. Tune STOPS / OPACITY to hide
 * or reveal more of the art at each point in the scroll:
 *   - STOPS:   scroll progress (0 = top of page, 1 = bottom)
 *   - OPACITY: art opacity at each matching stop (0 = hidden → asphalt only,
 *              1 = art fully visible)
 * Both arrays must be the same length. To fade the art *out* as you scroll
 * instead, just reverse the OPACITY values.
 */
const STOPS = [0, 0.35, 0.5, 0.75, 1];
const OPACITY = [0.03, 0.40, 0.35, 0.30, 0.10];

export function ScrollBackground({
    stops=STOPS,
    opacity=OPACITY,
} : {stops?: number[]; opacity?: number[]}) {
  const { scrollYProgress } = useScroll();
  const artOpacity = useTransform(scrollYProgress, stops, opacity);
  const pathName = usePathname();

  const isRoot = pathName == "/";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-asphalt" 
    >
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: isRoot ? artOpacity : 0.05, // Default
          backgroundImage: "url(/assets/title.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}
