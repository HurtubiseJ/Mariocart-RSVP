"use client";

import { motion } from "framer-motion";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/cn";

type Accent = "red" | "blue" | "green" | "yellow";

const ACCENT_BG: Record<Accent, string> = {
  red: "bg-mario-red",
  blue: "bg-mario-blue",
  green: "bg-mario-green",
  yellow: "bg-mario-yellow",
};
const ACCENT_TEXT: Record<Accent, string> = {
  red: "text-paper",
  blue: "text-paper",
  green: "text-paper",
  yellow: "text-ink",
};

export interface InfoSectionProps {
  index: number;
  icon: string;
  title: string;
  blurb: string;
  href: string;
  cta: string;
  accent: Accent;
}

/** A scroll-revealed card that links to a sub-page. */
export function InfoSection({
  index,
  icon,
  title,
  blurb,
  href,
  cta,
  accent,
}: InfoSectionProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  const fromLeft = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: fromLeft ? -40 : 40, y: 20 }}
      animate={visible ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <TransitionLink href={href} className="group block">
        <div className="overflow-hidden rounded-pop border-[3px] border-ink bg-paper shadow-[0_8px_0_0_var(--color-ink)] transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-0.5">
          <div
            className={cn(
              "flex items-center gap-3 px-5 py-3",
              ACCENT_BG[accent],
              ACCENT_TEXT[accent],
            )}
          >
            <span className="text-3xl" aria-hidden>
              {icon}
            </span>
            <h3 className="font-display text-2xl tracking-wide">{title}</h3>
          </div>
          <div className="flex items-end justify-between gap-4 px-5 py-5">
            <p className="text-ink/75">{blurb}</p>
            <span className="shrink-0 self-center rounded-full border-2 border-ink bg-paper px-4 py-2 font-head text-sm font-bold whitespace-nowrap transition-colors group-hover:bg-ink group-hover:text-paper">
              {cta} →
            </span>
          </div>
        </div>
      </TransitionLink>
    </motion.div>
  );
}
