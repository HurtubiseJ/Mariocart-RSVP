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
  { rsvpId: 1, name: "Pixel Pete", cumulativeScore: 3420 },
  { rsvpId: 2, name: "Turbo Tina", cumulativeScore: 3180 },
  { rsvpId: 3, name: "Drift King Dom", cumulativeScore: 3025 },
  { rsvpId: 4, name: "Hoppy Hannah", cumulativeScore: 2890 },
  { rsvpId: 5, name: "Lager Larry", cumulativeScore: 2760 },
  { rsvpId: 6, name: "Shell Shock Sam", cumulativeScore: 2610 },
  { rsvpId: 7, name: "Banana Bea", cumulativeScore: 2480 },
  { rsvpId: 8, name: "Nitro Nadia", cumulativeScore: 2350 },
  { rsvpId: 9, name: "Pint-Size Paul", cumulativeScore: 2210 },
  { rsvpId: 10, name: "Coin Carlos", cumulativeScore: 2080 },
  { rsvpId: 11, name: "Wheelie Wanda", cumulativeScore: 1960 },
  { rsvpId: 12, name: "Foamy Fred", cumulativeScore: 1840 },
  { rsvpId: 13, name: "Boost Bobby", cumulativeScore: 1720 },
  { rsvpId: 14, name: "Amber Ale Amy", cumulativeScore: 1600 },
  { rsvpId: 15, name: "Spinout Stan", cumulativeScore: 1485 },
  { rsvpId: 16, name: "Pipsqueak Priya", cumulativeScore: 1360 },
  { rsvpId: 17, name: "Hazy Hank", cumulativeScore: 1240 },
  { rsvpId: 18, name: "Gridlock Gail", cumulativeScore: 1110 },
  { rsvpId: 19, name: "Stout Steve", cumulativeScore: 980 },
  { rsvpId: 20, name: "Rookie Remy", cumulativeScore: 840 },
  { rsvpId: 21, name: "Bumper Bella", cumulativeScore: 700 },
  { rsvpId: 22, name: "Crash Test Cody", cumulativeScore: 560 },
  { rsvpId: 23, name: "Last-Lap Lou", cumulativeScore: 410 },
  { rsvpId: 24, name: "Wobbly Will", cumulativeScore: 250 },
];

/** Highest base id, so the mock client can mint ids above the seeded field. */
export const BASE_MAX_ID = BASE_PLAYERS.reduce((m, p) => Math.max(m, p.rsvpId), 0);
