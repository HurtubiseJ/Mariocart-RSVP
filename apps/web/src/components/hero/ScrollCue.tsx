"use client";

import { motion } from "framer-motion";

export function ScrollCue() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.9, duration: 0.6 }}
      className="flex flex-col items-center gap-1 text-paper/70"
    >
      <span className="font-head text-xs font-semibold tracking-[0.3em] uppercase">
        Scroll
      </span>
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 1.3, repeat: Infinity }}
        aria-hidden
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
}
