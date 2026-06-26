/**
 * Client-side tournament seeding. Higher cumulative score = better seed.
 * Used for an optimistic local reveal; when the real backend is up its
 * authoritative seed/rank overrides this.
 */

export interface SeedResult {
  /** 1-indexed seed (== rank). */
  seed: number;
  rank: number;
  totalPlayers: number;
  /** 0..1, share of the field at or below this player. */
  percentile: number;
}

/**
 * Compute where `cumulativeScore` lands among an existing field of players.
 * The player is inserted into the field, so `totalPlayers` includes them.
 */
export function computeSeed(
  cumulativeScore: number,
  field: { cumulativeScore: number }[],
): SeedResult {
  const totalPlayers = field.length + 1;
  // Rank = 1 + (number of existing players who scored strictly higher).
  const ahead = field.filter((p) => p.cumulativeScore > cumulativeScore).length;
  const rank = ahead + 1;
  const percentile = totalPlayers <= 1 ? 1 : 1 - (rank - 1) / totalPlayers;

  return { seed: rank, rank, totalPlayers, percentile };
}
