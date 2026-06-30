"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { KartSprite } from "@/components/transition/KartSprite";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { buttonClasses } from "@/components/ui/Button";
import { useUi } from "@/state/ui";
import { HeroTitle } from "./HeroTitle";
import { ScrollCue } from "./ScrollCue";

const DOTS = [
  { c: "bg-mario-red", x: "8%", y: "18%", d: 0 },
  { c: "bg-mario-blue", x: "82%", y: "22%", d: 0.4 },
  { c: "bg-mario-yellow", x: "11%", y: "70%", d: 0.8 },
  { c: "bg-mario-green", x: "88%", y: "66%", d: 1.2 },
  { c: "bg-mario-yellow", x: "70%", y: "7%", d: 0.6 },
  { c: "bg-mario-blue", x: "40%", y: "83%", d: 0.6 },
  { c: "bg-mario-green", x: "17%", y: "41%", d: 0.6 },
  { c: "bg-mario-red", x: "43%", y: "16%", d: 0.6 },
  { c: "bg-mario-red", x: "70%", y: "91%", d: 0.6 },
];

export function HeroSection() {
  const setPastHero = useUi((s) => s.setPastHero);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setPastHero]);

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 text-center">
      {/* floating confetti dots */}
      {DOTS.map((dot, i) => (
        <motion.span
          key={i}
          className={`absolute h-3 w-3 rounded-full ${dot.c}`}
          style={{ left: dot.x, top: dot.y }}
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: dot.d }}
          aria-hidden
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
          className="w-36 animate-bob sm:w-48"
        >
          <KartSprite alt="Mario driving a kart while holding a beer" />
        </motion.div>

        <HeroTitle text="BEERIO KART WORLD CUP" />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="font-head text-base font-semibold tracking-[0.25em] text-paper/80 uppercase sm:text-lg"
        >
          2026 Annual Tournament · July 25
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.5 }}
        >
          <TransitionLink href="/rsvp" className={buttonClasses("yellow", "lg")}>
            RSVP NOW 🏁
          </TransitionLink>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <ScrollCue />
      </div>

      {/* sentinel at the hero's bottom edge — toggles the top nav */}
      <div ref={sentinelRef} className="absolute bottom-0 h-px w-full" aria-hidden />
    </section>
  );
}
