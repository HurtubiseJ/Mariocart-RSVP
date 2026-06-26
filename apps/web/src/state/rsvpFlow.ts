import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { FlappyScore, ReactionScore, Rsvp } from "@/lib/api.types";
import { cumulativeScore } from "@/lib/scoring";

/**
 * Drives the RSVP → reaction → flappy → seed flow. Games stay dumb and call the
 * matching action on completion; this store owns the sequencing.
 *
 * Persisted to sessionStorage so a refresh mid-flow doesn't wipe progress.
 */

export type FlowStep = "form" | "reaction" | "flappy" | "seed";

export interface SeedOutcome {
  cumulativeScore: number;
  seed: number;
  rank: number;
  totalPlayers: number;
}

interface RsvpFlowState {
  step: FlowStep;
  status: "idle" | "submitting" | "error";
  error: string | null;

  rsvp: Rsvp | null;
  reaction: ReactionScore | null;
  flappy: FlappyScore | null;
  outcome: SeedOutcome | null;

  setRsvp: (rsvp: Rsvp) => void;
  completeReaction: (result: ReactionScore) => void;
  completeFlappy: (result: FlappyScore) => void;
  submitAndSeed: () => Promise<void>;
  reset: () => void;
}

const initial = {
  step: "form" as FlowStep,
  status: "idle" as const,
  error: null,
  rsvp: null,
  reaction: null,
  flappy: null,
  outcome: null,
};

export const useRsvpFlow = create<RsvpFlowState>()(
  persist(
    (set, get) => ({
      ...initial,

      setRsvp: (rsvp) => set({ rsvp, step: "reaction", status: "idle", error: null }),

      completeReaction: (result) => set({ reaction: result, step: "flappy" }),

      // FlappyGame already runs both attempts and reports the best-of-two score.
      completeFlappy: (result) => {
        set({ flappy: result });
        void get().submitAndSeed();
      },

      submitAndSeed: async () => {
        const { rsvp, reaction, flappy } = get();
        if (!rsvp || !reaction || !flappy) return;
        set({ status: "submitting", error: null });
        const total = cumulativeScore(reaction, flappy);
        try {
          const res = await api.submitScore({
            rsvpId: rsvp.id,
            reaction,
            flappy,
            cumulativeScore: total,
          });
          set({
            status: "idle",
            step: "seed",
            outcome: {
              cumulativeScore: res.cumulativeScore,
              seed: res.seed,
              rank: res.rank,
              totalPlayers: res.totalPlayers,
            },
          });
        } catch (e) {
          set({
            status: "error",
            error: e instanceof Error ? e.message : "Could not save your score",
          });
        }
      },

      reset: () => set({ ...initial }),
    }),
    {
      name: "bkwc.rsvpFlow",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.sessionStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
    },
  ),
);
