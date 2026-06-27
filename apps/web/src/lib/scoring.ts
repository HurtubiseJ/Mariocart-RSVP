import type { FlappyScore, ReactionScore } from "./api.types";

/**
 * Tunable scoring constants. PLAN.md describes the reaction score as "number of
 * accurate hits + cumulative missed distance"; since missing should *lower* a
 * score, we treat it as `hits * HIT_VALUE - missedDistance * MISS_PENALTY`
 * (clamped at 0). The raw {hits, missedDistance} are still sent to the backend
 * so the server can recompute under the authoritative formula if these change.
 *
 * All values are placeholders — retune after a playtest.
 */
export const SCORING = {
  /** Points per accurate reaction hit. */
  HIT_VALUE: 800,
  /** Penalty per degree of cumulative missed distance. */
  MISS_PENALTY: 4,
  /** Points per Flappy gate cleared. */
  GATE_VALUE: 120,
  /** Scoring weight between the two flappy games */
  HIGHEST_SCORE_WEIGHT: 1.0,
  LOWEST_SCORE_WEIGHT: 0.5,
  /** Weight of the reaction game in the cumulative score. */
  W_REACTION: 0.5,
  /** Weight of the Flappy game in the cumulative score. */
  W_FLAPPY: 0.5,
} as const;

const clampToZero = (n: number) => (n < 0 ? 0 : n);

/** Derive the reaction game's point score from its raw results. */
export function reactionScore(hits: number, missedDistance: number): number {
  return Math.round(
    clampToZero(hits * SCORING.HIT_VALUE - missedDistance * SCORING.MISS_PENALTY),
  );
}

/** Build a full ReactionScore from raw hits + missed distance. */
export function buildReactionScore(hits: number, missedDistance: number): ReactionScore {
  return { hits, missedDistance, score: reactionScore(hits, missedDistance) };
}

/** Build a FlappyScore from the gate counts of both runs (best counts). */
export function buildFlappyScore(runs: number[]): FlappyScore {
  const bestGatesPassed = runs.length ? Math.max(...runs) : 0;
  const lowestGatesPassed = runs.length ? Math.min(...runs) : 0;
  return {
    bestGatesPassed,
    runs,
    score: Math.round((bestGatesPassed * SCORING.GATE_VALUE * SCORING.HIGHEST_SCORE_WEIGHT) + (lowestGatesPassed * SCORING.GATE_VALUE * SCORING.LOWEST_SCORE_WEIGHT)),
  };
}

/**
 * Weighted contribution each game makes to the cumulative score. These are the
 * values persisted per-game on the backend; the DB sums them into the standings
 * total, so the cumulative below is defined as their sum (no backend weights).
 */
export function weightedReactionScore(rawScore: number): number {
  return Math.round(rawScore * SCORING.W_REACTION);
}

export function weightedFlappyScore(rawScore: number): number {
  return Math.round(rawScore * SCORING.W_FLAPPY);
}

/** Combine both games into a single cumulative score (sum of weighted parts). */
export function cumulativeScore(reaction: ReactionScore, flappy: FlappyScore): number {
  return weightedReactionScore(reaction.score) + weightedFlappyScore(flappy.score);
}
