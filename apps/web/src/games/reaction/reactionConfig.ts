/** Per-round configuration for the reaction (skill-check) minigame. */
export interface RoundCfg {
  /** Number of target zones (and required taps) this round. */
  zones: number;
  /** Half-width of each zone, in radians. Smaller = harder. */
  halfWidth: number;
  /** Indicator sweep speed, in radians per second. */
  speed: number;
}

// Each round is a single 360° sweep starting from the top. The player gets that
// one pass to tap each zone; when the needle completes the revolution the round
// ends and the next begins. Rounds with two zones need two well-timed taps.
export const ROUNDS: RoundCfg[] = [
  { zones: 1, halfWidth: 0.36, speed: 3.5 },
  { zones: 1, halfWidth: 0.3, speed: 4.2 },
  { zones: 2, halfWidth: 0.35, speed: 3.7 },
  { zones: 1, halfWidth: 0.26, speed: 4.5 },
  { zones: 2, halfWidth: 0.27, speed: 4.2 },
];

export const TOTAL_ROUNDS = ROUNDS.length;

/** Brief hold (ms) after a sweep completes so the player registers the result. */
export const COOLDOWN_MS = 600;

/** Penalty (degrees) added for each zone left un-tapped when the sweep ends. */
export const UNTAPPED_MISS_DEG = 180;
