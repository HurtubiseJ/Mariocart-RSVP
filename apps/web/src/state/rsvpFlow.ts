import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { FlappyScore, GameSubmitRequest, ReactionScore, Rsvp } from "@/lib/api.types";
import {
  cumulativeScore,
  weightedFlappyScore,
  weightedReactionScore,
} from "@/lib/scoring";

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
//   submittedRsvp: boolean;
  reaction: ReactionScore | null;
  flappy: FlappyScore | null;
  outcome: SeedOutcome | null;

  setRsvp: (rsvp: Rsvp) => void;
  completeReaction: (result: ReactionScore) => Promise<void>;
  completeFlappy: (result: FlappyScore) => Promise<void>;
  submitAndSeed: () => Promise<void>;
  /** Re-attempt the current step's pending submission after a failure. */
  retry: () => Promise<void>;
  reset: () => void;
}

const initial = {
  step: "form" as FlowStep,
  status: "idle" as const,
  error: null,
  rsvp: null,
//   submittedRsvp: false,
  reaction: null,
  flappy: null,
  outcome: null,
};

export const useRsvpFlow = create<RsvpFlowState>()(
  persist(
    (set, get) => {
      // Persist the reaction score, then advance to flappy. The stored `score`
      // is the weighted contribution the DB sums; raw data rides along in details.
      const submitReaction = async () => {
        const { rsvp, reaction } = get();
        if (!rsvp?.id || !reaction) return;
        set({ status: "submitting", error: null });
        try {
          const payload: GameSubmitRequest = {
            rsvp_id: rsvp.id,
            game: "reaction",
            score: weightedReactionScore(reaction.score),
            trial: 1,
            details: {
              rawScore: reaction.score,
              hits: reaction.hits,
              missedDistance: reaction.missedDistance,
            },
          };
          const success = await api.submitGame(payload);
          if (!success) throw new Error("Failed to save game. Backend error.");
          set({ status: "idle", step: "flappy", error: null });
        } catch (e) {
          set({
            status: "error",
            error: e instanceof Error ? e.message : "Could not save your reaction score",
          });
        }
      };

      // Persist the flappy score (best-of-two), then compute the seed.
      const submitFlappyAndSeed = async () => {
        const { rsvp, flappy } = get();
        if (!rsvp?.id || !flappy) return;
        set({ status: "submitting", error: null });
        try {
          const payload: GameSubmitRequest = {
            rsvp_id: rsvp.id,
            game: "flappy",
            score: weightedFlappyScore(flappy.score),
            trial: 2,
            details: {
              rawScore: flappy.score,
              runs: flappy.runs,
              bestGatesPassed: flappy.bestGatesPassed,
            },
          };
          const success = await api.submitGame(payload);
          if (!success) throw new Error("Failed to save game. Backend error.");
          await get().submitAndSeed();
        } catch (e) {
          set({
            status: "error",
            error: e instanceof Error ? e.message : "Could not save your flappy score",
          });
        }
      };

      return {
        ...initial,

        setRsvp: (rsvp) => set({ rsvp, step: "reaction", status: "idle", error: null }),

        completeReaction: async (result) => {
          set({ reaction: result });
          await submitReaction();
        },

        // FlappyGame already runs both attempts and reports the best-of-two score.
        completeFlappy: async (result) => {
          set({ flappy: result });
          await submitFlappyAndSeed();
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

        retry: async () => {
          if (get().step === "reaction") return submitReaction();
          return submitFlappyAndSeed();
        },

        reset: () => set({ ...initial }),
      };
    },
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
