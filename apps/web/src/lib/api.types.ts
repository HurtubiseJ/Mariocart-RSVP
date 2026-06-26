/**
 * Front-end DTOs for the Beerio Kart API. The C++ backend will be re-synced to
 * match this contract later; until then the mock client implements it 1:1 so
 * the whole UI is demoable. Field names are camelCase here; the real client is
 * responsible for mapping to/from the server's snake_case payloads.
 */

// --- RSVP -----------------------------------------------------------------

export interface RsvpCreateRequest {
  name: string;
  phone: string;
  /** Optional — collected but not required (phone is the player identity). */
  email?: string;
}

export interface Rsvp {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
}

// --- Scores ---------------------------------------------------------------

/** Raw + derived results of the reaction (Dead-by-Daylight-style) minigame. */
export interface ReactionScore {
  /** Number of taps that landed inside a target zone (max 4 across 3 rounds). */
  hits: number;
  /** Cumulative angular distance (degrees) of every tap to its nearest zone. */
  missedDistance: number;
  /** Derived points (see lib/scoring.ts). */
  score: number;
}

/** Results of the Flappy minigame (best of two runs). */
export interface FlappyScore {
  bestGatesPassed: number;
  /** Gates passed in each of the two runs, in order. */
  runs: number[];
  /** Derived points (see lib/scoring.ts). */
  score: number;
}

export interface ScoreSubmitRequest {
  rsvpId: number;
  reaction: ReactionScore;
  flappy: FlappyScore;
  cumulativeScore: number;
}

export interface ScoreSubmitResponse {
  rsvpId: number;
  cumulativeScore: number;
  /** 1-indexed tournament seed (== rank). */
  seed: number;
  rank: number;
  totalPlayers: number;
}

// --- Standings ------------------------------------------------------------

export interface StandingEntry {
  rsvpId: number;
  name: string;
  cumulativeScore: number;
  seed: number;
  rank: number;
}

export type StandingsResponse = StandingEntry[];

// --- Client ---------------------------------------------------------------

export interface ApiClient {
  health(): Promise<boolean>;
  createRsvp(body: RsvpCreateRequest): Promise<Rsvp>;
  submitScore(body: ScoreSubmitRequest): Promise<ScoreSubmitResponse>;
  getStandings(): Promise<StandingsResponse>;
}
