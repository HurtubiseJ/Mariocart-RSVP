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
//
// Rounds 1-2 are deliberately very easy (wide zone, slow sweep) so first-timers
// can learn the timing; difficulty ramps from round 3 onward.
export const ROUNDS: RoundCfg[] = [
  { zones: 1, halfWidth: 0.6, speed: 2.2 }, // very easy — learn the timing
  { zones: 1, halfWidth: 0.5, speed: 2.6 }, // very easy
  { zones: 1, halfWidth: 0.34, speed: 3.5 }, // ramps up
  { zones: 2, halfWidth: 0.3, speed: 3.9 },
  { zones: 2, halfWidth: 0.26, speed: 4.4 }, // hardest
];

export const TOTAL_ROUNDS = ROUNDS.length;

/** Brief hold (ms) after a sweep completes so the player registers the result. */
export const COOLDOWN_MS = 600;

/** Penalty (degrees) added for each zone left un-tapped when the sweep ends. */
export const UNTAPPED_MISS_DEG = 180;
