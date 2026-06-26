import { create } from "zustand";

/**
 * State machine for the kart page-transition overlay.
 *
 *   idle ──beginCover──▶ covering ──coverComplete──▶ covered
 *     ▲                                                  │
 *     └──────────────finishReveal◀──reveal──────────────┘
 *
 * The overlay panel + kart live in a single persistent component mounted in
 * the root layout. The *cover* half is triggered by clicking a TransitionLink;
 * the *reveal* half is triggered when the new route's template.tsx remounts.
 */

export type TransitionPhase = "idle" | "covering" | "covered" | "revealing";

/** Accent colors the panel cycles through, one per navigation. */
const ACCENTS = [
  "var(--color-mario-red)",
  "var(--color-mario-blue)",
  "var(--color-mario-green)",
  "var(--color-mario-yellow)",
] as const;

let accentCursor = 0;

interface TransitionState {
  phase: TransitionPhase;
  /** Target route to push once the screen is covered. */
  href: string | null;
  /** Accent color for the current sweep. */
  accent: string;
  beginCover: (href: string) => void;
  coverComplete: () => void;
  reveal: () => void;
  finishReveal: () => void;
}

export const useTransition = create<TransitionState>((set, get) => ({
  phase: "idle",
  href: null,
  accent: ACCENTS[0],

  beginCover: (href) => {
    if (get().phase !== "idle") return;
    const accent = ACCENTS[accentCursor % ACCENTS.length];
    accentCursor += 1;
    set({ phase: "covering", href, accent });
  },

  coverComplete: () => {
    if (get().phase === "covering") set({ phase: "covered" });
  },

  // Called from template.tsx on the new route. Only reveals if we just covered.
  reveal: () => {
    if (get().phase === "covered") set({ phase: "revealing" });
  },

  finishReveal: () => set({ phase: "idle", href: null }),
}));
