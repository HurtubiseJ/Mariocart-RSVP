/**
 * A fake field of players so the seed reveal and standings work fully offline.
 * Replace/extend freely — this is placeholder data.
 */

export interface MockPlayer {
  rsvpId: number;
  name: string;
  cumulativeScore: number;
}

export const BASE_PLAYERS: MockPlayer[] = [
];

/** Highest base id, so the mock client can mint ids above the seeded field. */
export const BASE_MAX_ID = BASE_PLAYERS.reduce((m, p) => Math.max(m, p.rsvpId), 0);
