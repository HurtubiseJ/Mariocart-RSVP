"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CycleText } from "@/components/ui/CycleText";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { InfoSectionProps } from "./InfoSection";

type Accent = "red" | "blue" | "green" | "yellow";

/** Accent → CSS custom property (defined in globals.css @theme). */
const ACCENT_VAR: Record<Accent, string> = {
  red: "var(--color-mario-red)",
  blue: "var(--color-mario-blue)",
  green: "var(--color-mario-green)",
  yellow: "var(--color-mario-yellow)",
};

/** Large character art pinned to the right edge, one per slide (by order). */
const ASSETS = [
  "/assets/MarioLuigi.png",
  "/assets/ShyGuyTransBg.png",
  "/assets/GroupRace.png",
  "/assets/MarioStance.png", 
  "/assets/Bowser.png", 
];

/**
 * A full-width "slide": see-through on the left (the page background shows
 * through), fading into the accent colour toward the right, where a large
 * character asset sits. Title + blurb stack in a column on the left; hovering
 * brightens the left edge and reveals a "Go to page" hint.
 */
export function SlideDateTimeSection({
  index,
  title,
  blurb,
  href,
  accent,
}: InfoSectionProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

    const fromLeft = index % 2;
  const accentColor = ACCENT_VAR[accent];
  const asset = ASSETS[index % ASSETS.length];

  // Left = transparent → right = solid accent.
  const leftAccentGradient = `linear-gradient(to right, transparent 0%, color-mix(in srgb, ${accentColor} 35%, transparent) 45%, ${accentColor} 100%)`;

  const rightAccentGradient = `linear-gradient(to left, transparent 0%, color-mix(in srgb, ${accentColor} 35%, transparent) 45%, ${accentColor} 100%)`;
  // Fade the asset's left edge so it blends into the accent instead of a hard seam.
  const assetMask = "linear-gradient(to right, transparent 0%, black 35%)";
  // Subtle brighten wash that fades in over the left edge on hover.
  const leftBrighten =
    "linear-gradient(to right, color-mix(in srgb, var(--color-ink) 35%, transparent) 0%, transparent 96%)";
  const rightBrighten =
    "linear-gradient(to left, color-mix(in srgb, var(--color-ink) 35%, transparent) 0%, transparent 96%)";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: fromLeft ? 400 : -400, y: 40 }}
      animate={visible ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="px-4 py-6 sm:px-6"
    >
      <TransitionLink href={href} className="group block">
        <div className="relative h-[60vh] min-h-[360px] overflow-hidden rounded-pop border-[3px] border-ink shadow-[0_8px_0_0_var(--color-ink)] transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-0.5">
          {/* accent gradient: see-through left → solid accent right */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: fromLeft ? leftAccentGradient : rightAccentGradient }}
          />

          {/* large asset, far right */}
          <motion.div 
            aria-hidden 
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            className={fromLeft ? 
                "absolute inset-y-0 right-0 w-1/2 duration-200 group-hover:opacity-90" : 
                "absolute inset-y-0 left-0 w-1/2 duration-200 group-hover:opacity-90;"
          }>
            <Image
              src={asset}
              alt=""
              fill
              sizes="(max-width: 600px) 50vw, 40vw"
              className="overflow-visible duration-200 group-hover:opacity-70" 
              style={{ maskImage: assetMask, WebkitMaskImage: assetMask }}
            />
          </motion.div>

          {/* left-edge brighten on hover (sits behind the text) */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 ${fromLeft ? "left-0" : "right-0"} w-2/3 opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
            style={{ background: fromLeft ? leftBrighten : rightBrighten }}
          />

          {/* title + info column, left */}
          <div className={`absolute ${fromLeft ? "left-0" : "right-0 items-end text-end"} z-10 flex h-full max-w-[58%] flex-col justify-center gap-3 p-8 sm:p-12`}>
            <h3 className="font-display text-3xl tracking-wide sm:text-5xl">
              <CycleText text={title} />
            </h3> 
            <p className="max-w-md text-paper/80 font-semibold text-lg">{blurb}</p>

            {/* hover hint */}
            <span className="mt-2 inline-flex -translate-x-2 items-center gap-2 font-head text-sm font-bold tracking-wide text-paper uppercase opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                Go to page
            </span>
          </div>
        </div>
      </TransitionLink>
    </motion.div>
  );
}
