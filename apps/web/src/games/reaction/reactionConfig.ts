/** Per-round configuration for the reaction (skill-check) minigame. */
export interface RoundCfg {
  /** Number of target zones (and required taps) this round. */
  zones: number;
  /** Half-width of each zone, in radians. Smaller = harder. */
  halfWidth: number;
  /** Indicator sweep speed, in radians per second. */
  speed: number;
}

// Rounds 1-2: a single zone. Round 3: two zones (two taps). Speed ramps up.
export const ROUNDS: RoundCfg[] = [
  { zones: 1, halfWidth: 0.36, speed: 3.5 },
  { zones: 1, halfWidth: 0.3, speed: 4.2 },
  { zones: 2, halfWidth: 0.35, speed: 3.7 },
  { zones: 1, halfWidth: 0.26, speed: 4.5 },
  { zones: 2, halfWidth: 0.27, speed: 4.2 },
];

export const TOTAL_ROUNDS = ROUNDS.length;

/** Pause between rounds (ms) so the player can register the result. */
export const COOLDOWN_MS = 750;
