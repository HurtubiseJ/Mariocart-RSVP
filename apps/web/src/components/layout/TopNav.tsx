"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { useNavVisibility } from "@/hooks/useNavVisibility";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/rsvp", label: "RSVP" },
  { href: "/standings", label: "Standings" },
  { href: "/rules", label: "Rules" },
  { href: "/history", label: "History" },
  { href: "/info1", label: "Event Info" },
];

export function TopNav() {
  const visible = useNavVisibility();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : "-110%" }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav className="mx-auto mt-3 flex w-[min(100%-1.5rem,42rem)] items-center justify-between rounded-pop border-[3px] border-ink bg-paper/95 px-4 py-2.5 shadow-[0_5px_0_0_var(--color-ink)] backdrop-blur">
        <TransitionLink
          href="/"
          className="font-display text-xl tracking-wide text-ink"
          onClick={() => setOpen(false)}
        >
          BEERIO<span className="text-mario-red"> KART</span>
        </TransitionLink>

        {/* desktop links */}
        <ul className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <TransitionLink
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-head text-sm font-semibold transition-colors",
                  pathname === l.href
                    ? "bg-ink text-paper"
                    : "text-ink hover:bg-mario-yellow",
                )}
              >
                {l.label}
              </TransitionLink>
            </li>
          ))}
        </ul>

        {/* mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-ink sm:hidden"
        >
          <span
            className={cn(
              "h-0.5 w-5 bg-ink transition-transform",
              open && "translate-y-2 rotate-45",
            )}
          />
          <span className={cn("h-0.5 w-5 bg-ink transition-opacity", open && "opacity-0")} />
          <span
            className={cn(
              "h-0.5 w-5 bg-ink transition-transform",
              open && "-translate-y-2 -rotate-45",
            )}
          />
        </button>
      </nav>

      {/* mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 flex w-[min(100%-1.5rem,42rem)] flex-col gap-1 rounded-pop border-[3px] border-ink bg-paper p-2 shadow-[0_5px_0_0_var(--color-ink)] sm:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <TransitionLink
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-4 py-3 font-head font-semibold",
                    pathname === l.href
                      ? "bg-ink text-paper"
                      : "text-ink hover:bg-mario-yellow",
                  )}
                >
                  {l.label}
                </TransitionLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
