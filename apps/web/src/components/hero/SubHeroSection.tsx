"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { KartSprite } from "@/components/transition/KartSprite";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { buttonClasses } from "@/components/ui/Button";
import { useUi } from "@/state/ui";
import { HeroTitle } from "./HeroTitle";
import { ScrollCue } from "./ScrollCue";

export function SubHeroSection() {
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
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-asphalt px-5 text-center">
      {/* faint title-art backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "url(/assets/title.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden 
      />

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
          2026 Annual Tournament
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
