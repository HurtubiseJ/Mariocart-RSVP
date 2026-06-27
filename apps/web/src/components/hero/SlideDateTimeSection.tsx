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
  "/assets/MarioLuigi.webp",
  "/assets/ShyGuyTransBg.webp",
  "/assets/GroupRace.webp",
  "/assets/MarioStance.webp",
  "/assets/Bowser.webp",
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
    // The observed wrapper stays in its layout position (no transform), so the
    // IntersectionObserver fires reliably. The inner motion.div does the
    // sliding — if the ref lived on the transformed element, its off-screen
    // bounding box (x: ±400) would never meet the visibility threshold on
    // narrow viewports and the card would never reveal.
    //
    // overflow-x-clip contains the ±400px slide to this card's lane so the
    // transform never expands the document width. Without it, the off-screen
    // cards widen the page past the viewport; mobile then zooms out to fit
    // (page renders at ~60% width), which (a) drags below-the-fold cards into
    // view so they reveal at load and (b) snaps the zoom — and the scroll
    // height — back as each card settles to x:0. `clip` (not `hidden`) keeps
    // overflow-y visible, so the card's drop shadow still shows.
    <div ref={ref} className="overflow-x-clip px-4 py-6 sm:px-6">
      <motion.div
        initial={{ opacity: 0, x: fromLeft ? 400 : -400, y: 40 }}
        animate={visible ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <TransitionLink href={href} className="group block">
          {/* svh (not vh): height stays fixed when the mobile URL bar hides on
              scroll, so the document height doesn't jump mid-scroll. */}
          <div className="relative h-[46svh] min-h-[300px] overflow-hidden rounded-pop border-[3px] border-ink shadow-[0_8px_0_0_var(--color-ink)] transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-0.5 sm:h-[60svh] sm:min-h-[360px]">
            {/* accent gradient: see-through left → solid accent right */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: fromLeft ? leftAccentGradient : rightAccentGradient }}
            />

            {/* large asset, far right — wider on mobile to give the art more room */}
            <motion.div
              aria-hidden
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
              className={`absolute inset-y-0 w-3/5 duration-200 group-hover:opacity-90 sm:w-1/2 ${fromLeft ? "right-0" : "left-0"}`}
            >
              <Image
                src={asset}
                alt=""
                fill
                sizes="(max-width: 600px) 60vw, 40vw"
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

            {/* title + info column — smaller text & tighter padding on mobile,
                allowed to overlay the art (wider max-width) when space is tight */}
            <div className={`absolute ${fromLeft ? "left-0" : "right-0 items-end text-end"} z-10 flex h-full max-w-[66%] flex-col justify-center gap-2 p-5 sm:max-w-[58%] sm:gap-3 sm:p-12`}>
              <h3 className="font-display text-2xl tracking-wide sm:text-5xl">
                <CycleText text={title} />
              </h3>
              <p className="max-w-md font-semibold text-paper/80 text-sm sm:text-lg bg-ink/50 rounded-lg p-2 sm:bg-transparent">{blurb}</p>

              {/* hover hint */}
              <span className="mt-2 inline-flex -translate-x-2 items-center gap-2 font-head text-sm font-bold tracking-wide text-paper uppercase opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                  Go to page
              </span>
            </div>
          </div>
        </TransitionLink>
      </motion.div>
    </div>
  );
}
