import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type {
  FlappyScore,
  GameBreakdown,
  GameSubmitRequest,
  ReactionScore,
  Rsvp,
  RSVPType,
} from "@/lib/api.types";
import { normalizePhone } from "@/lib/phone";
import {
  cumulativeScore,
  SCORING,
  weightedFlappyScore,
  weightedReactionScore,
} from "@/lib/scoring";

/**
 * Drives the RSVP flow. There are two paths once a participation type is picked:
 *
 *   spectator: type → name/number → vibes → acknowledgments → (upload) → thanks
 *   player:    type → name/number → skill+breaths → acknowledgments → (upload)
 *              → reaction → flappy → seed
 *
 * The RSVP record is only uploaded to the backend once the acknowledgments are
 * accepted. Spectators skip the games (they get no score); players play both
 * minigames, which submit their per-game scores and then reveal a seed.
 *
 * Persisted to sessionStorage so a refresh mid-flow doesn't wipe progress.
 * Steps before the upload allow backwards navigation (goBack); from the
 * seeding games onward the flow is forward-only.
 */

export type FlowStep =
  | "rsvp-type"
  | "name-num"
  | "vibes"
  | "rate-skill-breaths"
  | "rejected"
  | "acknowledgments"
  | "reaction"
  | "flappy"
  | "thanks"
  | "seed";

/** Minimum vibes a spectator must rate to be allowed to join. */
export const MIN_VIBES = 6;

/** Sentinel num_breaths value meaning "bad at drinking" (can't chug). */
export const BAD_AT_DRINKING = 0;

/**
 * The step to return to when navigating backwards, or null when back
 * navigation is not allowed (first step, and everything from the seeding
 * games onward — the RSVP has been uploaded by then).
 */
export function previousStep(
  step: FlowStep,
  type: RSVPType | undefined,
): FlowStep | null {
  switch (step) {
    case "name-num":
      return "rsvp-type";
    case "vibes":
    case "rate-skill-breaths":
      return "name-num";
    case "acknowledgments":
      return type === "spectator" ? "vibes" : "rate-skill-breaths";
    default:
      return null;
  }
}

export interface SeedOutcome {
  cumulativeScore: number;
  seed: number;
  rank: number;
  totalPlayers: number;
}

interface RsvpFlowState {
  step: FlowStep;
  rsvp_type: RSVPType | undefined;
  status: "idle" | "submitting" | "error";
  error: string | null;

  rsvp: Rsvp | null;
  reaction: ReactionScore | null;
  flappy: FlappyScore | null;
  outcome: SeedOutcome | null;

  setRsvpType: (type: RSVPType) => void;
  setNameNumber: (values: { name: string; phone: string }) => void;
  setVibes: (vibes: number) => void;
  setSkillBreaths: (values: {
    rated_skill: number;
    num_breaths: number;
    ride_home: string;
  }) => void;
  /** Upload the assembled RSVP, then advance to games (player) or thanks (spectator). */
  acceptAcknowledgments: () => Promise<void>;
  completeReaction: (result: ReactionScore) => Promise<void>;
  completeFlappy: (result: FlappyScore) => Promise<void>;
  submitAndSeed: () => Promise<void>;
  /** Re-attempt the current step's pending submission after a failure. */
  retry: () => Promise<void>;
  /** Step backwards (only allowed before the seeding games — see previousStep). */
  goBack: () => void;
  reset: () => void;
}

/**
 * Rebuild local game state from a recovered RSVP's stored game results. The
 * raw values ride in `details`; the stored `score` is the weighted
 * contribution, so it's un-weighted as a fallback when details are missing.
 */
function recoveredReaction(g: GameBreakdown): ReactionScore {
  const d = g.details ?? {};
  return {
    hits: typeof d.hits === "number" ? d.hits : 0,
    missedDistance: typeof d.missedDistance === "number" ? d.missedDistance : 0,
    score:
      typeof d.rawScore === "number"
        ? d.rawScore
        : Math.round(g.score / SCORING.W_REACTION),
  };
}

function recoveredFlappy(g: GameBreakdown): FlappyScore {
  const d = g.details ?? {};
  const runs = Array.isArray(d.runs)
    ? d.runs.filter((r): r is number => typeof r === "number")
    : [];
  return {
    bestGatesPassed: typeof d.bestGatesPassed === "number" ? d.bestGatesPassed : 0,
    runs,
    score:
      typeof d.rawScore === "number"
        ? d.rawScore
        : Math.round(g.score / SCORING.W_FLAPPY),
  };
}

const initial = {
  step: "rsvp-type" as FlowStep,
  rsvp_type: undefined,
  status: "idle" as const,
  error: null,
  rsvp: null,
  reaction: null,
  flappy: null,
  outcome: null,
};

export const useRsvpFlow = create<RsvpFlowState>()(
  persist(
    (set, get) => {
      // Upload the assembled RSVP. Spectators skip the games; players go on to
      // the reaction game, which needs the freshly-minted rsvp.id to submit.
      // A phone that already RSVP'd gets the stored record back (plus any game
      // results), so the flow resumes wherever that person left off.
      const uploadRsvp = async () => {
        const { rsvp } = get();
        if (!rsvp) return;
        set({ status: "submitting", error: null });
        try {
          const { games = [], ...created } = await api.createRsvp({
            name: rsvp.name,
            phone: rsvp.phone,
            rsvp_type: rsvp.rsvp_type,
            vibes: rsvp.vibes,
            rated_skill: rsvp.rated_skill,
            num_breaths: rsvp.num_breaths,
            ride_home: rsvp.ride_home ?? undefined,
            email: rsvp.email ?? undefined,
          });

          if (created.rsvp_type !== "player") {
            set({ rsvp: created, status: "idle", error: null, step: "thanks" });
            return;
          }

          const reactionGame = games.find((g) => g.game === "reaction");
          const flappyGame = games.find((g) => g.game === "flappy");
          if (!reactionGame) {
            set({
              rsvp: created,
              reaction: null,
              flappy: null,
              status: "idle",
              error: null,
              step: "reaction",
            });
            return;
          }
          const reaction = recoveredReaction(reactionGame);
          if (!flappyGame) {
            set({
              rsvp: created,
              reaction,
              flappy: null,
              status: "idle",
              error: null,
              step: "flappy",
            });
            return;
          }
          // Both games already submitted: rank and land on the seed screen.
          set({
            rsvp: created,
            reaction,
            flappy: recoveredFlappy(flappyGame),
            status: "idle",
            error: null,
          });
          await get().submitAndSeed();
        } catch (e) {
          set({
            status: "error",
            error: e instanceof Error ? e.message : "Could not save your RSVP",
          });
        }
      };

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

      // Persist the flappy score (best-of-three), then compute the seed.
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

        setRsvpType: (type) =>
          set({ rsvp_type: type, step: "name-num", status: "idle", error: null }),

        setNameNumber: ({ name, phone }) => {
          const type = get().rsvp_type ?? "player";
          const rsvp: Rsvp = {
            id: undefined,
            name: name.trim(),
            // Canonicalise before it's stored/uploaded (strip spaces/()/+/-).
            phone: normalizePhone(phone),
            email: undefined,
            rsvp_type: type,
            rated_skill: null,
            vibes: null,
            num_breaths: null,
            ride_home: null,
            createdAt: undefined,
          };
          set({
            rsvp,
            step: type === "player" ? "rate-skill-breaths" : "vibes",
            status: "idle",
            error: null,
          });
        },

        setVibes: (vibes) => {
          const { rsvp } = get();
          if (!rsvp) return;
          // Non-blocking rating, but below the threshold the spectator can't join.
          if (vibes < MIN_VIBES) {
            set({ rsvp: { ...rsvp, vibes }, step: "rejected" });
            return;
          }
          set({ rsvp: { ...rsvp, vibes }, step: "acknowledgments", error: null });
        },

        setSkillBreaths: ({ rated_skill, num_breaths, ride_home }) => {
          const { rsvp } = get();
          if (!rsvp) return;
          set({
            rsvp: { ...rsvp, rated_skill, num_breaths, ride_home },
            step: "acknowledgments",
            status: "idle",
            error: null,
          });
        },

        acceptAcknowledgments: async () => {
          await uploadRsvp();
        },

        completeReaction: async (result) => {
          set({ reaction: result });
          await submitReaction();
        },

        // FlappyGame already runs every attempt and reports the best score.
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
            if (!rsvp.id) throw new Error("Id is undefined inside of rsvp.")
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

        goBack: () => {
          const { step, rsvp_type, status } = get();
          if (status === "submitting") return;
          const prev = previousStep(step, rsvp_type);
          if (!prev) return;
          set({
            step: prev,
            status: "idle",
            error: null,
            // Returning to the type choice unlocks the other path; stale
            // branch fields on the rsvp are wiped when setNameNumber rebuilds it.
            ...(prev === "rsvp-type" ? { rsvp_type: undefined } : null),
          });
        },

        retry: async () => {
          const step = get().step;
          if (step === "acknowledgments") return uploadRsvp();
          if (step === "reaction") return submitReaction();
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
